import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {parseDataJson,parseDatatable,normalize,diagnosticSplRows,epoch,integer,sameRows,decodeSelection,assessTrace} from '../src/evidence.mjs';
import {verifyAll,ROOT} from '../src/verify.mjs';

test('JSON evidence preserves the integer-versus-float contract',()=>{
  assert.deepEqual(parseDataJson('{"n":1,"flag":true}'),{n:1,flag:true});
  for(const value of ['1.0','1e0','-0','9007199254740993'])assert.throws(()=>parseDataJson('{"n":'+value+'}'));
});
test('numeric adapters reject booleans and lossy or ambiguous values',()=>{
  assert.equal(integer('100'),100);
  for(const value of [true,false,null,1.2,'01','1.0','+1','-0',' 1'])assert.throws(()=>integer(value));
});
test('whole-second timezone export is losslessly normalized',()=>{
  assert.equal(epoch('2025-01-01T05:01:00.000+05:00','spl'),1735689660);
  assert.equal(epoch('2025-01-01T00:01:00.000Z','kql'),1735689660);
  for(const value of ['2025-01-01T00:01:00','2025-01-01T00:01:00.001Z','2025-02-30T00:00:00Z','2025-01-01T24:00:00Z'])assert.throws(()=>epoch(value,'spl'));
  assert.throws(()=>epoch('2025-01-01T05:01:00+05:00','kql'));
});
test('time diagnostic must agree with displayed timestamp',()=>{
  assert.deepEqual(diagnosticSplRows([{_time:'2025-01-01T05:01:00.000+05:00',diagnostic_time_epoch:'1735689660'}]),[{_time:'2025-01-01T05:01:00.000+05:00'}]);
  assert.throws(()=>diagnosticSplRows([{_time:10,diagnostic_time_epoch:'11'}]));
  assert.throws(()=>diagnosticSplRows([{_time:10}]));
});
test('row order is immaterial, duplicate rows remain significant',()=>{
  assert(sameRows([{x:1},{x:2}],[{x:2},{x:1}]));
  assert(!sameRows([{x:1},{x:1}],[{x:1}]));
  assert(!sameRows([{x:true}],[{x:1}]));
});
test('datatable parser retains Windows paths and declared types',()=>{
  const p=parseDatatable(String.raw`datatable(p:string, n:long, t:datetime) [@'C:\Windows\lsass.exe', 2, datetime(2025-01-01T00:01:00Z),]`);
  assert.equal(p.rows[0].p,String.raw`C:\Windows\lsass.exe`);assert.equal(p.columns[1].type,'long');
});
test('datatable parser accepts structured arrays without executing expressions',()=>{
  assert.deepEqual(parseDatatable('datatable(s:dynamic) [dynamic(["b","a"])]').rows,[{s:['b','a']}]);
  for(const value of ['datatable(n:long) [1+1]','datatable(n:long) [toint("1")]','datatable(n:long) [1] | take 1','datatable(n:long) [1.0]','datatable(n:long) [true]','datatable(n:long,n:long) [1,2]'])assert.throws(()=>parseDatatable(value));
});
test('truncated and malformed exports fail closed',()=>{
  for(const value of ['datatable(a:string,b:long) ["x"]','datatable(a:string) ["x]','datatable(a:long) [1,,2]','datatable(a:string) [1]'])assert.throws(()=>parseDatatable(value));
});
test('schema normalization rejects missing or surplus fields',()=>{
  const schema=[{canonical:'x',spl:'a',kql:'b',type:'integer'}];
  assert.deepEqual(normalize([{a:'2'}],schema,'spl'),[{x:2}]);
  assert.throws(()=>normalize([{}],schema,'spl'));
  assert.throws(()=>normalize([{a:'2',extra:'hidden'}],schema,'spl'));
  assert.throws(()=>normalize([{a:null}],schema,'spl'));
});
test('only declared set fields ignore element order; duplicates are rejected',()=>{
  const schema=[{canonical:'sld_set',spl:'s',kql:'s',type:'string_set'}];
  assert.deepEqual(normalize([{s:['b','a']}],schema,'spl'),[{sld_set:['a','b']}]);
  assert.throws(()=>normalize([{s:['a','a']}],schema,'spl'));
  assert.throws(()=>normalize([{s:'a,b'}],schema,'spl'));
});
test('boolean masks can select correctly while failing record structure',()=>{
  const result=decodeSelection([true,false],[{id:1},{id:2}]);
  assert.equal(result.structural,'fail');assert.deepEqual(result.selected,[0]);
});
test('empty output is structurally inconclusive',()=>{
  assert.equal(decodeSelection([],[{id:1}]).structural,'inconclusive');
});
test('structural endpoint rejects altered records and excess multiplicity',()=>{
  for(const value of [[{id:1,extra:true}],[{id:1},{id:1}],[{id:true}],['yes']])assert.equal(decodeSelection(value,[{id:1}]).structural,'fail');
  assert.equal(decodeSelection([{id:1}],[{id:1}]).structural,'pass');
});
test('both raw execution paths must be present and bound to the same input',()=>{
  const raw=JSON.parse(fs.readFileSync(path.join(ROOT,'results/cohort/microsoft-security-event-log-cleared.baseline.trace.sanitized.json'),'utf8'));
  const rows=JSON.parse(fs.readFileSync(path.join(ROOT,'examples/cohort/microsoft-security-event-log-cleared.fixture.json'),'utf8'));
  assert(assessTrace(raw,rows,[0]).every(x=>x.selection==='correct'&&x.structural==='fail'));
  const missing=structuredClone(raw);missing.raw_events.pop();assert.throws(()=>assessTrace(missing,rows,[0]));
  const changed=structuredClone(raw);changed.raw_events[0].arguments.input_list[0].EventID=0;assert.throws(()=>assessTrace(changed,rows,[0]));
});
test('saved native data, prompts, component traces and incomplete status agree end to end',()=>{
  const report=verifyAll();assert.equal(report.status,'SAVED_EVIDENCE_VERIFIED');
  assert.deepEqual(report.native_comparisons.map(x=>x.finding),['false_rejection','false_acceptance','false_rejection','matching_verdict']);
  assert.equal(report.cohort.find(x=>x.case.startsWith('mitre')).arms.patched.selection,'incorrect');
  assert.equal(report.partial_component.target,'4/6');assert.equal(report.new_model_calls,0);
});
