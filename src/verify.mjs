import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {parseDataJson,parseDatatable,normalize,diagnosticSplRows,integer,sameRows,assessTrace} from './evidence.mjs';

export const ROOT=path.resolve(import.meta.dirname,'..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function inside(root,name) {
  assert(typeof name==='string'&&!name.includes('\\')&&!path.isAbsolute(name),'Invalid package-relative path');
  const full=path.resolve(root,name);assert(full.startsWith(root+path.sep),'Path escapes package');return full;
}
export function walk(root,dir=root) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>{
    // Git may use a directory or a worktree pointer file. Exclude only this
    // exact root entry; nested .git paths and similarly named files stay checked.
    if(path.resolve(dir)===path.resolve(root)&&item.name==='.git')return [];
    assert(!item.isSymbolicLink(),'Symlinks are not allowed');
    const full=path.join(dir,item.name);
    return item.isDirectory()?walk(root,full):[path.relative(root,full).replaceAll('\\','/')];
  }).sort();
}
export function verifyManifest(root) {
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST.json'),'utf8'));
  const files=manifest.files.map(x=>x.path);
  assert(!files.some(name=>name==='.git'||name.startsWith('.git/')),'Root Git metadata must not be listed in the manifest');
  assert.equal(new Set(files).size,files.length,'Duplicate manifest entry');
  assert.deepEqual(walk(root).filter(x=>x!=='MANIFEST.json'),[...files].sort(),'Unlisted or missing package file');
  for(const f of manifest.files) {
    const bytes=fs.readFileSync(inside(root,f.path));
    assert.equal(bytes.length,f.bytes,'Size mismatch: '+f.path);
    assert.equal(hash(bytes),f.sha256,'SHA-256 mismatch: '+f.path);
  }
  return files.length;
}

export function verifyAll(root=ROOT,{manifest=true}={}) {
  root=path.resolve(root);
  const txt=n=>fs.readFileSync(inside(root,n),'utf8');
  const json=n=>JSON.parse(txt(n));
  const data=n=>parseDataJson(txt(n));
  const manifestFiles=manifest?verifyManifest(root):null;
  const provenance=json('results/provenance.json');
  for(const f of provenance.files)assert.equal(hash(fs.readFileSync(inside(root,f.path))),f.packaged_sha256,'Derivative hash mismatch: '+f.path);
  const contract=data('examples/native/contract.json');
  const saved=data('results/native/comparisons.sanitized.json');
  const runs=data('examples/native/frozen-runs.json');
  assert.equal(runs.length,8);
  for(const run of runs) {
    for(const [file,digest] of [['query_path','query_sha256'],['input_path','input_sha256'],['original_path','original_sha256']])
      assert.equal(hash(fs.readFileSync(inside(root,'examples/native/'+run[file]))),run[digest],'Frozen run binding mismatch');
  }
  const judge=json('results/judge/receipts.sanitized.json');
  assert.equal(judge.length,4);
  const comparisons=[];
  for(const pair of ['lsass','dns'])for(const fixture of ['ordinary','witness']) {
    const id=pair+'-'+fixture,base='results/native/'+id+'/';
    const fixtures=data(`examples/native/fixtures/${id}.json`);
    assert.equal(fixtures.length,pair==='dns'?100:fixture==='ordinary'?4:1);
    const native={};
    for(const input of [false,true]) {
      const prefix=input?'input-':'', schema=contract[input?'input_schemas':'output_schemas'][pair];
      const spl=data(base+prefix+'spl-results.json');
      const job=data(base+prefix+'spl-job.sanitized.json');
      assert.equal(job.engine_version,'10.6.0.5');
      assert.equal(spl.preview,false);assert.equal(spl.init_offset,0);assert.deepEqual(spl.messages,[]);
      const j=job.content;
      assert.equal(j.dispatchState,'DONE');assert.equal(j.isDone,true);assert.equal(j.isFailed,false);assert.equal(j.isFinalized,false);assert.equal(j.isPaused,false);
      assert.equal(j.eventIsTruncated,false);assert.equal(integer(j.dropCount),0);assert.equal(integer(j.sampleRatio),1);assert.deepEqual(j.messages,[]);
      assert.equal(integer(j.resultCount),spl.results.length);
      const search=txt(base+prefix+'spl-executed.spl');
      assert.equal(j.search,search,'Captured server search differs from saved executed query');
      const query=txt(`examples/native/${input?'input-queries':'queries'}/${id}.spl`);
      assert.equal(search,query,'Executed SPL differs from frozen query');
      let kqlRows;
      if(!input&&id==='dns-witness') {
        const empty=data(base+'kql-empty.sanitized.json'), dom=txt(base+'kql-grid.sanitized.txt');
        assert.equal(empty.status,'Done');assert.equal(empty.gridCells,0);assert.equal(empty.completeEmptyGridObserved,true);
        assert.equal(empty.columnTypesCaptured,false);assert.deepEqual(empty.rows,[]);
        assert.deepEqual(empty.columnsFromUi.map(x=>x.trim()),schema.map(x=>x.kql));
        assert(dom.includes('No Rows To Show')&&dom.includes('Query finished running. 1 datasets returned.')&&dom.includes('Done ('));
        for(const column of schema)assert(dom.includes('columnheader "'+column.kql+'"'));
        kqlRows=[];
      } else {
        const parsed=parseDatatable(txt(base+(input?'input-kql.datatable.txt':'kql-results.datatable.txt')));
        assert.deepEqual(parsed.columns.map(x=>x.name),schema.filter(x=>x.kql!==null).map(x=>x.kql));
        if(input)assert.deepEqual(parsed.columns.map(x=>x.type),schema.filter(x=>x.kql!==null).map(x=>x.kql_type));
        kqlRows=parsed.rows;
      }
      const splRows=normalize(input?diagnosticSplRows(spl.results):spl.results,schema,'spl');
      const kql=normalize(kqlRows,schema,'kql');
      if(input) {
        assert(sameRows(splRows,fixtures),id+' SPL input differs from frozen fixture');
        const kqlNames=schema.filter(x=>x.kql!==null).map(x=>x.canonical);
        const shared=fixtures.map(x=>Object.fromEntries(kqlNames.map(k=>[k,x[k]])));
        assert(sameRows(kql,shared),id+' KQL input differs from frozen fixture');
        assert.equal(kql.length,fixtures.length);
      }else {native.spl=splRows;native.kql=kql;}
    }
    assert.equal(txt(base+'kql-executed.kql'),txt(`examples/native/queries/${id}.kql`));
    const expected=saved.final_comparisons.find(x=>x.case===id);assert(expected);
    assert(sameRows(native.spl,expected.spl_rows)&&sameRows(native.kql,expected.kql_rows),'Saved aggregate differs from native data');
    const relation=sameRows(native.spl,native.kql)?'equivalent':'not_equivalent';
    assert.equal(relation,expected.native_result_relation);
    const model=judge.find(x=>x.candidate_id===expected.candidate_id);assert(model);
    const prompt=txt(`results/judge/${id}.prompt.txt`),response=txt(`results/judge/${id}.response.txt`).trim();
    assert.equal(model.status,'ok');assert.equal(model.exit_code,0);assert.equal(model.termination_reason,null);
    assert.equal(hash(prompt),model.prompt_sha256);assert.equal(model.prompt_sha256,expected.prompt_sha256);
    assert.equal(hash(txt(`results/judge/${id}.rendered-prompt.txt`)),model.rendered_prompt_sha256);
    const payload=JSON.parse(prompt.slice(prompt.indexOf('\n\n')+2));
    assert.equal(payload.spl_source_query,txt(`examples/native/queries/${id}.spl`));
    assert.equal(payload.kql_target_query,txt(`examples/native/queries/${id}.kql`));
    assert.deepEqual(JSON.parse(response),model.response);assert.equal(model.response.verdict,expected.model_verdict);assert.equal(model.response.reason,expected.model_reason);
    assert.deepEqual(JSON.parse(model.raw_response),model.response);
    const finding=model.response.verdict===relation?'matching_verdict':relation==='equivalent'?'false_rejection':'false_acceptance';
    assert.equal(finding,expected.fixture_level_finding);
    comparisons.push({case:id,input_rows:fixtures.length,spl_output_rows:native.spl.length,kql_output_rows:native.kql.length,native_relation:relation,model_verdict:model.response.verdict,finding});
  }

  const old='final evaluation result (boolean, list of booleans, or filtered data matching the rule criteria)';
  const next='processed data in a format suitable for the next processing step';
  function pairedRequests(before,after) {
    const a=json(before),b=json(after);const content=a.messages[1].content;
    assert.equal(content.split(old).length-1,1);a.messages[1].content=content.replace(old,next);assert.deepEqual(a,b,'Pair differs beyond output-description line');
  }
  function completedReceipt(file) {
    const r=json(file);assert.equal(r.status,'completed');assert.equal(r.exit_code,0);assert.equal(r.termination_reason,null);
    assert.equal(r.wall_limit_seconds,300);assert.equal(r.output_token_limit,2048);assert(r.context_tokens<=8192);assert.equal(r.rss_limit_bytes,6442450944);
    assert.equal(hash(r.raw_stdout),r.raw_stdout_sha256,'Raw model stdout hash mismatch');
    return r;
  }
  const assessment=data('results/cohort/assessment.json');
  const cohort=[];
  for(const id of ['dns','microsoft-security-event-log-cleared','mitre-CAR-2013-05-004']) {
    const rows=data(`examples/cohort/${id}.fixture.json`), oracle=data(`examples/cohort/${id}.oracle.json`);
    const ir=data(`examples/cohort/${id}.ir.json`),irReceipt=completedReceipt(`results/cohort/${id}.ir-receipt.sanitized.json`);
    assert.deepEqual(JSON.parse(irReceipt.response),ir);
    assert.equal(hash(txt(`results/cohort/${id}.ir-rendered-prompt.txt`)),irReceipt.rendered_prompt_sha256);
    const recorded=assessment.cases.find(x=>x.rule_id===id);assert.equal(oracle.eligible,recorded.eligible);
    if(!oracle.eligible) {
      assert.equal(id,'dns');assert.equal(recorded.analysis_stratum,'excluded_nondiscriminating_source_binding');
      assert(!walk(root).some(x=>x.startsWith('results/cohort/dns.baseline')||x.startsWith('results/cohort/dns.patched')));
      cohort.push({case:id,eligible:false,reason:recorded.analysis_stratum});continue;
    }
    pairedRequests(`results/cohort/${id}.baseline.request.json`,`results/cohort/${id}.patched.request.json`);
    const result={case:id,eligible:true,oracle:'own_hand_reviewed_reference_NOT_NATIVE',arms:{}};
    const receipts={};
    for(const arm of ['baseline','patched']) {
      const trace=data(`results/cohort/${id}.${arm}.trace.sanitized.json`);
      const raw=assessTrace(trace,rows,oracle.expected_first_step_indices);
      const recordedArm=recorded.arms[arm];
      for(const call of raw){const previous=recordedArm.raw_calls.find(x=>x.caller===call.caller);assert(previous);assert.equal(call.structural,previous.structural);assert.equal(call.selection,previous.selection);assert.equal(call.representation,previous.representation);assert.deepEqual(call.selected,previous.selected_indices);}
      receipts[arm]=completedReceipt(`results/cohort/${id}.${arm}.receipt.sanitized.json`);
      assert.equal(receipts[arm].response,txt(`results/cohort/${id}.${arm}.response.txt`).trim());
      assert.equal(hash(txt(`results/cohort/${id}.${arm}.rendered-prompt.txt`)),receipts[arm].rendered_prompt_sha256);
      result.arms[arm]={structure:raw[0].structural,selection:raw[0].selection,selected:raw[0].selected,both_raw_calls_agree:raw[0].structural===raw[1].structural&&raw[0].selection===raw[1].selection};
    }
    for(const field of ['model_sha256','temperature','seed','thinking','context_tokens','output_token_limit','wall_limit_seconds','rss_limit_bytes'])assert.deepEqual(receipts.baseline[field],receipts.patched[field]);
    cohort.push(result);
  }
  const final=json('results/cohort/FINAL-STATUS.json'),ledger=json('results/cohort/call-ledger.json');
  assert.equal(final.model_calls,7);assert.equal(ledger.length,7);assert.equal(ledger.filter(x=>x.category==='ir').length,3);assert.equal(ledger.filter(x=>x.category==='first_step').length,4);
  assert.equal(final.native_queries_this_followup,0);assert.equal(final.full_chain_run,false);assert.equal(final.final_equivalence_verdict,null);
  const pre=json('results/cohort/pre-arm-interpretation.json');assert.equal(pre.code_arm_calls_so_far,0);

  const input=data('results/ablation/input.json'),rows=input.rows.map(parseDataJson);
  pairedRequests('results/ablation/baseline.request.json','results/ablation/patched.request.json');
  const ablation={};
  for(const arm of ['baseline','patched']){
    const trace=data(`results/ablation/${arm}.trace.sanitized.json`);
    const checks=assessTrace(trace,rows,null);assert(checks.every(x=>x.structural===(arm==='patched'?'pass':'fail')));
    assert(checks.every(x=>sameRows(x.selected,[0,1,3])));ablation[arm]={structure:checks[0].structural,selected:checks[0].selected};
  }
  const abReceipt=completedReceipt('results/ablation/patched.receipt.sanitized.json');
  assert.equal(hash(txt('results/ablation/patched.rendered-prompt.txt')),abReceipt.rendered_prompt_sha256);
  const outcome=json('results/ablation/outcome.json');assert.equal(outcome.full_chain_run,false);assert.equal(outcome.native_semantic_correctness_claim,false);assert.equal(outcome.final_equivalence_verdict,null);assert.equal(outcome.frozen_ir_error_repaired,false);
  const partial=json('results/partial/PARTIAL-STATUS.json'),timeout=json('results/partial/terminal-timeout-analysis.json');
  assert.equal(partial.source_steps_completed,4);assert.equal(partial.source_steps_expected,4);assert.equal(partial.target_steps_completed,4);assert.equal(partial.target_steps_expected,6);
  assert.equal(partial.witness_run,false);assert.equal(partial.released_comparator_run,false);assert.equal(partial.final_semantic_verdict,null);
  assert.equal(timeout.termination_reason,'wall_limit');assert.equal(timeout.partial_code_executed,false);assert.equal(timeout.exact_engine_generated_token_count,null);
  const irs=json('results/partial/frozen-independent-irs.json');assert.equal(irs.spl.steps.length,4);assert.equal(irs.kql.steps.length,6);
  for(const lang of ['spl','kql']) {
    const trace=json(`results/partial/${lang}.trace.sanitized.json`);
    assert.equal(trace.status,lang==='spl'?'completed':'needs_model');assert.deepEqual(trace.invalid,[]);assert.deepEqual(trace.fallback_events,[]);
    assert.equal(trace.validations.length,4);assert(trace.validations.every(x=>x.value.success===true));
    const returns=trace.raw_events.filter(x=>x.event==='return'&&x.caller==='_execute_single_step_with_all_data');
    assert.deepEqual(returns.map(x=>x.method),['step_1','step_2','step_3','step_4']);
    if(lang==='spl'){assert.deepEqual(returns[0].value,[true,true,false,true]);assert.equal(trace.returned_value.__raw_type__,'tuple');assert.equal(trace.returned_value.items[0].length,4);}
    else {assert.deepEqual(returns[2].value,[true,true,false]);assert.deepEqual(returns[3].value,[true,true]);}
  }
  const failure=json('results/partial/timeout.receipt.sanitized.json');assert.equal(failure.status,'inference_failure');assert.equal(failure.termination_reason,'wall_limit');assert.equal(failure.exit_code,-9);assert.equal(failure.wall_limit_seconds,300);assert.equal(hash(failure.raw_stdout),failure.raw_stdout_sha256);
  const upstream=txt('examples/upstream/SemanticRuleOptimizer.py.txt');
  assert(upstream.includes('execution_context.get("total_steps", step_index + 1)'));
  return {status:'SAVED_EVIDENCE_VERIFIED',mode:'offline_data_only',release_version:json('RELEASE.json').version,manifest_files:manifestFiles,source_files:provenance.files.length,native_comparisons:comparisons,cohort,lsass_first_step:ablation,partial_component:{source:'4/4',target:'4/6',witness_run:false,comparator_run:false},new_native_queries:0,new_model_calls:0,archived_or_generated_code_executed:false,early_repaired_pilot:'NOT VERIFIED: original and corrected artifacts absent',publication:'BLOCKED: see PUBLICATION_BLOCKERS.md'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2);assert(args.length===0||(args.length===2&&args[0]==='--example'&&args[1]==='lsass-witness'),'Usage: node src/verify.mjs [--example lsass-witness]');
    const report=verifyAll();
    if(args.length)console.log(JSON.stringify({mode:report.mode,...report.native_comparisons.find(x=>x.case==='lsass-witness'),explanation:'The saved SPL output is empty. The saved KQL output contains one group for lsass.exe.bak. The model said equivalent: a false acceptance on this fixture. No engine or model was rerun.'},null,2));
    else console.log(JSON.stringify(report,null,2));
  } catch(error) { console.error('VERIFY FAILED: '+error.message);process.exitCode=1; }
}
