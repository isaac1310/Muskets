// Actual role targeting, casualty consequences and finite commander melee.
const fs=require('fs'),assert=require('assert');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>Object.fromEntries(UT.map(t=>[t,0]));
const addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)])),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync(__dirname+'/../game/battle.js','utf8'));
const fixture=()=>{const B=makeBattle({att:{...zeroU(),inf:2,cav:1,art:1},def:{...zeroU(),inf:2},terrain:'plains',gen:[null,{name:'Test',lvl:1}]});B.player=0;B.orders[0].foot=B.orders[1].foot='stand';return{B,r:B.regs.find(r=>r.side===0&&r.type==='inf'),e:B.regs.find(r=>r.side===1&&r.type==='inf')}};
const roll=(value,fn)=>{const old=Math.random;Math.random=()=>value;try{return fn()}finally{Math.random=old}};
let {B,r,e}=fixture();
assert(r.sergeant?.alive&&e.sergeant?.alive);assert(r.sergeant.l&&r.sergeant.c);
for(const role of ['drum','sergeant','general']){assert(orderPersonnel(B,r,role));assert.equal(personnelTarget(r).role,role);assert.equal(r.target,r.focusMan.reg);assert.equal(pickTarget(B,r),r.target)}
r.forced=e;assert(orderPersonnel(B,r,'drum'));assert.equal(r.focusMan,e.drummer);
const m=e.drummer;m.x=r.x;m.y=r.y-50;
assert.equal(roll(0,()=>attackVictim(B,r,e,130)),m);
m.y=r.y-150;assert.notEqual(roll(0,()=>attackVictim(B,r,e,130)),m,'No focused hit beyond range');
m.y=r.y-50;const blocker=B.regs.find(x=>x.side===0&&x.type==='inf'&&x!==r);blocker.x=r.x;blocker.y=r.y-25;
assert.notEqual(roll(0,()=>attackVictim(B,r,e,130)),m,'Friendly masking still applies');blocker.x=0;
assert.notEqual(roll(0,()=>attackVictim(B,r,e,28,true)),m,'No ranged melee assassination');
kill(B,m);stepBattle(B,1/30);assert(!r.focusMan&&!r.forced);assert(!e.drummer.alive);assert(!canDrumRally(B,e));
// Sergeant casualty causes an extra eight-point morale shock, plus the standard casualty shock.
({B,r,e}=fixture());const baseline=r.mor,shock=120/r.n0*.85;kill(B,r.sergeant);assert(Math.abs(r.mor-(baseline-shock-8))<1e-8);
r.ord='stand';r.target=e;r.reload=10;r.fat=0;const oldReload=r.reload;foot(B,r,e,200,1);assert(Math.abs(oldReload-r.reload-.85)<1e-8);
assert(B.insights.some(i=>i.key.startsWith('sergeant-')));
// Commander loss applies once, and command retinues can fight without NaN rates.
({B,r,e}=fixture());assert(orderPersonnel(B,r,'general'));const general=r.focusMan,gr=general.reg;
general.x=gr.x=r.x;general.y=gr.y=r.y-12;gr.men.forEach(m=>{m.x=gr.x;m.y=gr.y});
B.pairs=new Set();roll(0,()=>melee(B,r,gr,1));assert(!general.alive);assert(B.genDied[1]);assert(B.regs.every(x=>Number.isFinite(x.mor)));const morale=e.mor;kill(B,general);assert.equal(e.mor,morale);
// Focus trades hit probability for priority, rather than making all shots perfect.
({B,r,e}=fixture());e.x=r.x;e.y=r.y-60;e.men.forEach(m=>{m.x=e.x;m.y=e.y});r.forced=e;orderPersonnel(B,r,'drum');
const count=e.n;roll(.99,()=>volley(B,r,e,60,130,.12,2));assert.equal(e.n,count);
B.done=true;assert(!orderPersonnel(B,r,'general'));B.done=false;r.broken=true;assert(!orderPersonnel(B,r,'drum'));r.broken=false;assert(!orderPersonnel(B,r,'invalid'));
// All formation/turn transitions keep the new figure coordinates finite.
({B,r,e}=fixture());orderFormation(r,'column');for(let i=0;i<600;i++)stepBattle(B,1/30);assert(!r.forming);assert(r.men.every(m=>Number.isFinite(m.x)&&Number.isFinite(m.y)));
console.log('Personnel: role selection, preferred formation, range/masking, melee reach, missed shots, casualty cleanup, sergeant penalties, commander death and formation transitions pass.');
