// Verify that the player's default Stand / Wait orders hold every fighting unit.
const fs=require('fs'),path=require('path');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>({mil:0,inf:0,cav:0,hus:0,art:0,how:0});
const cnt=u=>UT.reduce((s,t)=>s+u[t],0),addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync(path.join(__dirname,'../game/battle.js'),'utf8'));
const B=makeBattle({att:{...zeroU(),inf:6,cav:2,art:2,how:1},def:{...zeroU(),inf:6,cav:2,art:2},terrain:'plains'});
B.player=0;B.orders[0]={foot:'stand',horse:'wait',guns:'stand'};
const own=B.regs.filter(r=>r.side===0),before=own.map(r=>[r.x,r.y]);
for(let i=0;i<300;i++)stepBattle(B,1/30);
const moved=own.filter((r,i)=>Math.hypot(r.x-before[i][0],r.y-before[i][1])>.01&&!r.broken);
if(moved.length){console.error('Standing units moved:',moved.map(r=>r.label));process.exitCode=1}
else console.log('Stand / Wait: all unbroken player units held their starting positions for 10 seconds.');

const assert=require('assert');
const C=makeBattle({att:{...zeroU(),inf:1},def:{...zeroU(),inf:1},terrain:'plains'});C.player=0;C.cmdT=999;C.orders[0].foot=C.orders[1].foot='stand';
const line=C.regs.find(r=>r.side===0&&r.type==='inf'),foe=C.regs.find(r=>r.side===1&&r.type==='inf');foe.reload=999;
const anchor=[line.x,line.y],positions=line.men.map(m=>[m.x,m.y]);orderFormation(line,'column');
assert(line.forming);assert(line.men.every((m,i)=>m.x===positions[i][0]&&m.y===positions[i][1]),'Orders must not teleport figures');
stepBattle(C,1/30);assert(line.men.some((m,i)=>Math.hypot(m.x-positions[i][0],m.y-positions[i][1])>0));assert(line.men.every((m,i)=>Math.hypot(m.x-positions[i][0],m.y-positions[i][1])<3));
for(let i=0;i<360;i++)stepBattle(C,1/30);assert.equal(line.form,'column');assert(!line.forming,'Column transition must settle');
// Fire when ready deploys in place and waits for both its ranks and a target in range.
line.ord='ready';orderFormation(line,'line');line.reload=0;const enemyY=foe.y;foe.y=line.y-80;
for(const m of foe.men)m.y+=foe.y-enemyY;
for(let i=0;i<30;i++){stepBattle(C,1/30);assert(!line.fired,'No firing during initial deployment')}
let fired=false;for(let i=0;i<360;i++){stepBattle(C,1/30);fired||=line.fired}assert(!line.forming);assert(fired);assert.deepEqual([line.x,line.y],anchor);
foe.y=20;line.target=foe;line.reload=0;line.fired=false;foot(C,line,foe,Math.hypot(foe.x-line.x,foe.y-line.y),1/30);assert(!line.fired,'No firing beyond range');assert.deepEqual([line.x,line.y],anchor);
line.reload=2;line.fired=false;foot(C,line,foe,80,1/30);assert(!line.fired,'Reloading still gates firing');
const blocker=addReg(C,0,'inf',false,line.x,line.y-40,'Blocker');blocker.n=1;line.reload=0;line.fired=false;foe.y=line.y-80;foot(C,line,foe,80,1/30);assert(!line.fired,'Friendly troops block fire');
// Surviving and fatal hits carry the impact direction into their rendered reaction.
const general=C.general[0];C.t=25;kill(C,general,1,{kind:'musket',x:general.x-20,y:general.y});assert(general.alive);assert.equal(general.hitT,25);assert(general.hitDX>.99);
const victim=line.men.find(m=>m.alive&&!m.role);kill(C,victim,1,{kind:'musket',reg:foe});assert(!victim.alive);assert.equal(victim.hitT,25);assert(Number.isFinite(victim.hitDY));
console.log('Orders: gradual column/line deployment, completion, held position, ready/range/reload/masking gates and directional hit reactions pass.');
