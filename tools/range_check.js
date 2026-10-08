// Weapon boundaries and the approach behaviour must agree for each troop type.
const fs=require('fs'),assert=require('assert');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>Object.fromEntries(UT.map(t=>[t,0])),addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)])),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync('game/battle.js','utf8')+'\nvar rangeOf=firingRange;');
function fixture(type,side,d){const troop={...zeroU(),[type]:1},enemy={...zeroU(),inf:1},B=makeBattle({att:side?enemy:troop,def:side?troop:enemy,terrain:'plains'}),r=B.regs.find(r=>r.side===side&&r.type===type),e=B.regs.find(r=>r.side!==side&&r.type==='inf');B.regs=[r,e];B.player=side;r.x=e.x=200;r.y=side?200:400;e.y=r.y+(side?d:-d);r.target=e;r.ord=type==='inf'||type==='mil'?'ready':'shoot';r.reload=0;for(const m of e.men)m.hp=10000;return{B,r,e}}
for(const [type,range] of [['inf',130],['mil',105],['cav',80],['hus',45]])for(const side of [0,1]){
  for(const delta of [-.1,0,.1]){const {B,r,e}=fixture(type,side,range+delta);assert.equal(rangeOf(r),range);(type==='inf'||type==='mil'?foot:horse)(B,r,e,range+delta,1/30);assert.equal(!!r.fired,delta<=0,`${type} side ${side} boundary ${delta}`)}
  const {B,r,e}=fixture(type,side,range+35);r.ord=type==='inf'||type==='mil'?'advance':'shoot';
  for(let i=0;i<900;i++){r.moving=false;(type==='inf'||type==='mil'?foot:horse)(B,r,e,Math.hypot(e.x-r.x,e.y-r.y),1/30)}
  const distance=Math.hypot(e.x-r.x,e.y-r.y);assert(distance<=range&&distance>range*.75,`${type} must approach into its own effective range`);
}
const regular=fixture('inf',0,120),militia=fixture('mil',0,120);foot(regular.B,regular.r,regular.e,120,1/30);foot(militia.B,militia.r,militia.e,120,1/30);assert(regular.r.fired&&!militia.r.fired,'Line infantry must outrange militia');
assert(!battleAdvice(regular.B,regular.r).some(x=>x.includes('beyond musket range')));assert(battleAdvice(militia.B,militia.r).some(x=>x.includes('beyond musket range')));
for(const [type,range] of [['inf',130],['mil',105]]){const {B,r,e}=fixture(type,0,range+5),near={...e,id:999,x:r.x+35,y:r.y-40};B.regs.push(near);assert.equal(pickTarget(B,r),near,'Fire when ready must choose the available in-range target');}
assert.equal(rangeOf({type:'art'}),200);assert.equal(rangeOf({type:'how'}),240);
console.log('Ranges: infantry 130, militia 105, dragoons 80; both-side boundaries, approach distances, ready targeting, advice and unchanged hussar/artillery ranges pass.');
