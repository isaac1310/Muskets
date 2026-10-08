// A non-fighting battle must still finish after the 600-second deadline.
const fs=require('fs'),assert=require('assert');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>Object.fromEntries(UT.map(t=>[t,0]));
const addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync(require('path').join(__dirname,'../game/battle.js'),'utf8'));
const B=makeBattle({att:{...zeroU(),inf:1},def:{...zeroU(),inf:1},terrain:'plains'});
B.t=599;B.lastChk=599;B.player=0;B.orders[0].foot='stand';B.regs.forEach(r=>r.ord='stand');
runToEnd(B);assert(B.done&&[0,1].includes(B.loser)&&B.t>600);
const C=makeBattle({att:{...zeroU(),art:1},def:{...zeroU(),inf:1},terrain:'plains'});
const r=C.regs.find(r=>r.type==='art'),g=r.men.find(m=>m.crew);g.crew.forEach(c=>kill(C,c));
assert(!operational(g));assert(fracType(C,0,'art')<.2);
console.log('Deadline completion and abandoned-gun campaign losses pass.');
(async()=>{
  const A=makeBattle({att:{...zeroU(),inf:1},def:{...zeroU(),inf:1},terrain:'plains'});
  A.player=0;A.orders[0].foot='stand';A.regs.forEach(r=>r.ord='stand');
  let yields=0,heartbeat=false;const timer=setTimeout(()=>{heartbeat=true},0);
  await runToEndAsync(A,()=>new Promise(resolve=>{yields++;setTimeout(resolve,0)}));
  clearTimeout(timer);assert(A.done&&A.t>600&&yields>0&&heartbeat);
  console.log(`Long battle resolved without blocking the event loop (${yields} yields).`);
})().catch(e=>{console.error(e);process.exitCode=1});
