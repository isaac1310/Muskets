// Simulation-only timing; this does not measure browser rendering or phone performance.
// Run: node tools/battle_perf.js
const fs=require('fs'),path=require('path'),{performance}=require('perf_hooks');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>Object.fromEntries(UT.map(t=>[t,0])),U=u=>({...zeroU(),...u});
const addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)])),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync(path.join(__dirname,'../game/battle.js'),'utf8'));
let seed=1740;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
for(const [name,a,d,fortKind]of [
  ['practice',{inf:10,mil:2,cav:3,hus:1,art:2,how:1},{inf:8,mil:2,cav:2,art:2},''],
  ['large',{inf:20,cav:6,art:4,how:2},{inf:18,cav:8,art:4},''],
  ['fort',{inf:10,how:2},{inf:8,mil:2,cav:2,art:2},'fort']]){
  const B=makeBattle({att:U(a),def:U(d),gar:fortKind?U({inf:2,art:2}):null,terrain:'hills',fortKind});
  const count=B.regs.reduce((n,r)=>n+r.n+r.crews.length,0),times=[];
  for(let i=0;i<2400&&!B.done;i++){const start=performance.now();stepBattle(B,1/30);const ms=performance.now()-start;if(i>=1800)times.push(ms)}
  times.sort((a,b)=>a-b);const pct=p=>+(times[Math.min(times.length-1,Math.floor(times.length*p))]||0).toFixed(3);
  console.log(JSON.stringify({name,initialFiguresAndCrew:count,samples:times.length,simulationSeconds:+B.t.toFixed(1),medianMs:pct(.5),p95Ms:pct(.95),maxMs:pct(1)}));
}
