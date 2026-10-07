import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {ROOT,walk,verifyManifest,verifyAll} from '../src/verify.mjs';

const evidence='results/native/lsass-witness/spl-results.json';
const sha=body=>crypto.createHash('sha256').update(body).digest('hex');
function copy(t,{gitFile=false}={}) {
  const base=path.resolve(os.tmpdir());
  assert(!base.startsWith(ROOT+path.sep)&&base!==ROOT,'Test temporary directory must be outside the package');
  const temporary=fs.mkdtempSync(path.join(base,'portfolio-manifest-'));
  assert.equal(path.dirname(temporary),base,'Cleanup target must be an immediate temporary child');
  assert(path.basename(temporary).startsWith('portfolio-manifest-'));
  t.after(()=>fs.rmSync(temporary,{recursive:true,force:true}));
  const root=path.join(temporary,'portfolio-project');
  fs.mkdirSync(root);
  // Use the manifest as the copy list, independently of the walker being tested.
  const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'MANIFEST.json'),'utf8'));
  for(const name of ['MANIFEST.json',...manifest.files.map(x=>x.path)]) {
    const target=path.resolve(root,name);
    assert(target.startsWith(root+path.sep));
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.copyFileSync(path.join(ROOT,name),target);
  }
  if(gitFile)fs.writeFileSync(path.join(root,'.git'),'gitdir: ../private-worktree-metadata\n');
  else {
    fs.mkdirSync(path.join(root,'.git','objects'),{recursive:true});
    fs.writeFileSync(path.join(root,'.git','HEAD'),'ref: refs/heads/local-review\n');
    fs.writeFileSync(path.join(root,'.git','objects','test-object'),'arbitrary local Git metadata');
  }
  return root;
}
function mutateSameSize(file) {
  const bytes=fs.readFileSync(file);assert(bytes.length>0);bytes[0]^=1;fs.writeFileSync(file,bytes);
}

test('full evidence verification passes with root .git directory; metadata is absent from walk',t=>{
  const root=copy(t),listed=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST.json'),'utf8')).files.length;
  assert.equal(verifyAll(root).manifest_files,listed);
  assert(!walk(root).some(name=>name==='.git'||name.startsWith('.git/')));
  assert(walk(root).includes('.gitignore'));
});
test('full evidence verification passes with a root worktree .git file',t=>{
  assert.equal(verifyAll(copy(t,{gitFile:true})).status,'SAVED_EVIDENCE_VERIFIED');
});
test('root .git does not hide a same-size evidence change',t=>{
  const root=copy(t);mutateSameSize(path.join(root,evidence));
  assert.throws(()=>verifyAll(root),/SHA-256 mismatch: results\/native\/lsass-witness\/spl-results.json/);
});
test('root .git does not hide deleted evidence',t=>{
  const root=copy(t);fs.unlinkSync(path.join(root,evidence));
  assert.throws(()=>verifyAll(root),/Unlisted or missing package file/);
});
test('root .git does not hide unexpected evidence',t=>{
  const root=copy(t);fs.writeFileSync(path.join(root,'results/native/lsass-witness/unexpected.json'),'{}\n');
  assert.throws(()=>verifyAll(root),/Unlisted or missing package file/);
});
test('unlisted nested .git evidence is rejected',t=>{
  const root=copy(t);fs.mkdirSync(path.join(root,'results','.git'));
  fs.writeFileSync(path.join(root,'results','.git','evidence.json'),'{}\n');
  assert(walk(root).includes('results/.git/evidence.json'));
  assert.throws(()=>verifyManifest(root),/Unlisted or missing package file/);
});
test('listed nested .git evidence remains hashed',t=>{
  const root=copy(t),name='results/.git/evidence.json',file=path.join(root,name);
  fs.mkdirSync(path.dirname(file));fs.writeFileSync(file,'{}\n');
  const manifestPath=path.join(root,'MANIFEST.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const body=fs.readFileSync(file);manifest.files.push({path:name,bytes:body.length,sha256:sha(body)});
  fs.writeFileSync(manifestPath,JSON.stringify(manifest));
  assert.equal(verifyManifest(root),manifest.files.length);
  mutateSameSize(file);assert.throws(()=>verifyManifest(root),/SHA-256 mismatch/);
});
test('.gitignore remains a checked package file',t=>{
  const root=copy(t);mutateSameSize(path.join(root,'.gitignore'));
  assert.throws(()=>verifyManifest(root),/SHA-256 mismatch: .gitignore/);
});
test('similarly named root files and directories are not excluded',t=>{
  const root=copy(t);
  for(const name of ['.git-evidence.json','.github/evidence.json']) {
    const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'{}\n');
    assert.throws(()=>verifyManifest(root),/Unlisted or missing package file/);fs.unlinkSync(file);
  }
});
test('a manifest cannot turn root Git metadata into evidence',t=>{
  const root=copy(t),file=path.join(root,'MANIFEST.json'),manifest=JSON.parse(fs.readFileSync(file,'utf8'));
  const body=fs.readFileSync(path.join(root,'.git','HEAD'));
  manifest.files.push({path:'.git/HEAD',bytes:body.length,sha256:sha(body)});
  fs.writeFileSync(file,JSON.stringify(manifest));
  assert.throws(()=>verifyManifest(root),/Root Git metadata must not be listed/);
});
