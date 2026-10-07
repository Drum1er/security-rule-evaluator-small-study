// Data readers only. No query interpreter, eval, generated-code execution or network.
import assert from 'node:assert/strict';

export function parseDataJson(text) {
  return JSON.parse(text, (_key, value, context) => {
    if (typeof value === 'number') {
      assert(context?.source, 'Node.js with JSON reviver source context is required');
      assert(/^(?:0|-?[1-9]\d*)$/.test(context.source), 'Non-integer JSON number token');
      assert(Number.isSafeInteger(value), 'Unsafe JSON integer');
    }
    return value;
  });
}

export function stable(value) {
  if (Array.isArray(value)) return '['+value.map(stable).join(',')+']';
  if (value !== null && typeof value === 'object') return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  assert(value !== undefined, 'Undefined is not captured JSON data');
  if (typeof value === 'number') assert(Number.isSafeInteger(value) && !Object.is(value,-0), 'Noncanonical data number');
  return JSON.stringify(value);
}

export function bag(rows) { return rows.map(stable).sort(); }
export function sameRows(a,b) { return stable(bag(a))===stable(bag(b)); }
export function integer(value) {
  if(typeof value==='string') {
    assert(/^(?:0|-?[1-9]\d*)$/.test(value),'Noncanonical integer string');
    value=Number(value);
  }
  assert(typeof value==='number'&&Number.isSafeInteger(value)&&!Object.is(value,-0),'Expected safe integer');
  return value;
}

export function epoch(value,language) {
  if(typeof value==='number'||typeof value==='string'&&/^(?:0|-?[1-9]\d*)$/.test(value))return integer(value);
  assert(typeof value==='string','Expected explicit whole-second time');
  const match=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(0+))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  assert(match,'Time must have an explicit zone and no nonzero fraction');
  const [,y,mo,d,h,mi,s,,zone]=match;
  assert(+y>=100&&+mo>=1&&+mo<=12&&+d>=1&&+h<24&&+mi<60&&+s<60,'Invalid calendar/time');
  assert(new Date(Date.UTC(+y,+mo-1,+d)).getUTCMonth()===+mo-1,'Invalid calendar day');
  assert(language!=='kql'||zone==='Z','KQL export must be UTC');
  if(zone!=='Z')assert(+zone.slice(1,3)<=23&&+zone.slice(4)<=59,'Invalid offset');
  const ms=Date.parse(value);assert(Number.isFinite(ms)&&ms%1000===0,'Invalid time');
  return integer(ms/1000);
}

// Recognizes only the literal Copy-as-datatable export forms retained here.
export function parseDatatable(text) {
  const match=/^\s*datatable\(([^)]*)\)\s*\[([\s\S]*)\]\s*$/.exec(text);
  assert(match,'Expected a literal datatable export, with no trailing query');
  const columns=match[1].split(',').map(x=>{
    const m=/^\s*([A-Za-z_]\w*)\s*:\s*(string|long|int|datetime|dynamic)\s*$/.exec(x);
    assert(m,'Unsupported export column');return {name:m[1],type:m[2]};
  });
  assert(new Set(columns.map(x=>x.name)).size===columns.length,'Duplicate export column');
  const body=match[2]; let pos=0; const values=[];
  const ws=()=>{while(/\s/.test(body[pos]??'')&&pos<body.length)pos++;};
  function quoted() {
    const verbatim=body[pos]==='@'; if(verbatim)pos++;
    const quote=body[pos++]; assert(quote==='"'||quote==="'",'Expected quoted string');
    let result='';let closed=false;
    while(pos<body.length) {
      let c=body[pos++];
      if(c===quote) {
        if(verbatim&&body[pos]===quote){result+=quote;pos++;continue;}
        closed=true;break;
      }
      if(!verbatim&&c==='\\') {
        const e=body[pos++], escapes={'n':'\n','r':'\r','t':'\t','\\':'\\',"'":"'",'"':'"'};
        assert(Object.hasOwn(escapes,e),'Unsupported export string escape');c=escapes[e];
      }
      result+=c;
    }
    assert(closed,'Unterminated export string');return result;
  }
  while(true) {
    ws();if(pos===body.length)break;
    let value, kind;
    if(body[pos]==='@'||body[pos]==="'"||body[pos]==='"') {value=quoted();kind='string';}
    else if(body.startsWith('datetime(',pos)) {
      pos+=9;const end=body.indexOf(')',pos);assert(end>=0,'Unclosed datetime');
      value=body.slice(pos,end);epoch(value,'kql');pos=end+1;kind='datetime';
    } else if(body.startsWith('dynamic(',pos)) {
      pos+=8;let start=pos,quotedString=false,escape=false,depth=0;
      while(pos<body.length) {
        const c=body[pos];
        if(quotedString){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')quotedString=false;}
        else {if(c==='"')quotedString=true;else if(c==='['||c==='{')depth++;else if(c===']'||c==='}')depth--;else if(c===')'&&depth===0)break;}
        pos++;
      }
      assert(pos<body.length&&!quotedString&&depth===0,'Unclosed dynamic literal');
      value=parseDataJson(body.slice(start,pos));pos++;kind='dynamic';
    } else {
      const n=/^-?(?:0|[1-9]\d*)/.exec(body.slice(pos));assert(n,'Unsupported export value');
      value=integer(n[0]);pos+=n[0].length;kind='integer';
    }
    const expected=columns[values.length%columns.length].type;
    assert(kind===expected||(kind==='integer'&&['long','int'].includes(expected)),'Export value/type mismatch');
    values.push(value);ws();
    if(pos===body.length)break;
    assert(body[pos++ ]===',','Expected literal export separator');
  }
  assert(values.length%columns.length===0,'Incomplete export row');
  const rows=[];
  for(let i=0;i<values.length;i+=columns.length)rows.push(Object.fromEntries(columns.map((c,j)=>[c.name,values[i+j]])));
  return {columns,rows};
}

export function normalize(rows,schema,language) {
  const fields=schema.filter(x=>x[language]!==null);
  return rows.map(row=>{
    assert(row&&typeof row==='object'&&!Array.isArray(row),'Expected result record');
    assert.deepEqual(Object.keys(row).sort(),fields.map(x=>x[language]).sort(),'Unexpected/missing result fields');
    return Object.fromEntries(fields.map(f=>{
      let v=row[f[language]];
      if(f.type==='integer')v=integer(v);
      else if(f.type==='epoch_seconds')v=epoch(v,language);
      else if(f.type==='string_set') {
        assert(Array.isArray(v)&&v.every(x=>typeof x==='string'),'Expected string set');
        assert(new Set(v).size===v.length,'Duplicate set element');v=[...v].sort();
      } else assert(f.type==='string'&&typeof v==='string','Expected string field');
      return [f.canonical,v];
    }));
  });
}

export function diagnosticSplRows(rows) {
  return rows.map(row=>{
    assert(Object.hasOwn(row,'diagnostic_time_epoch'),'Missing declared time diagnostic');
    assert.equal(integer(row.diagnostic_time_epoch),epoch(row._time,'spl'),'Diagnostic time disagrees with exported time');
    const {diagnostic_time_epoch,...input}=row;return input;
  });
}

export function decodeSelection(value,rows) {
  if(!Array.isArray(value))return {selected:null,representation:'unsupported_nonlist',structural:'fail'};
  if(value.length===rows.length&&value.every(x=>typeof x==='boolean'))return {selected:value.flatMap((x,i)=>x?[i]:[]),representation:'ordered_boolean_mask',structural:'fail'};
  if(value.length===0)return {selected:[],representation:'empty_list',structural:'inconclusive'};
  if(!value.every(x=>x!==null&&typeof x==='object'&&!Array.isArray(x)))return {selected:null,representation:'unsupported_mixed_or_nonrecord_list',structural:'fail'};
  const available=new Map();
  rows.forEach((r,i)=>{const k=stable(r);if(!available.has(k))available.set(k,[]);available.get(k).push(i);});
  const selected=[];
  for(const row of value) {
    const matches=available.get(stable(row));
    if(!matches?.length)return {selected:null,representation:'modified_or_unknown_record_or_excess_multiplicity',structural:'fail'};
    selected.push(matches.shift());
  }
  return {selected,representation:'unchanged_records',structural:'pass'};
}

export function assessTrace(trace,rows,expected) {
  assert.equal(trace.status,'completed');assert.deepEqual(trace.invalid,[]);
  assert.equal(trace.execution.exit_code,0);assert.equal(trace.execution.stop_reason,null);
  const callers=['_validate_code_block','_execute_single_step_with_all_data'];
  assert.equal(trace.raw_events.length,4,'Unexpected raw-call coverage');
  return callers.map(caller=>{
    const events=trace.raw_events.filter(x=>x.caller===caller);
    assert.equal(events.length,2);assert(events.every(x=>x.method==='step_1'&&x.raw_function_event===true));
    const call=events.find(x=>x.event==='call'), ret=events.find(x=>x.event==='return');assert(call&&ret);
    const arg=Object.values(call.arguments);assert.equal(arg.length,1);assert.deepEqual(arg[0],rows,'Trace inputs differ from fixture');
    const decoded=decodeSelection(ret.value,rows);
    return {caller,...decoded,selection:expected===null?'not_scored':decoded.selected===null?'uninterpretable':sameRows(decoded.selected,expected)?'correct':'incorrect'};
  });
}
