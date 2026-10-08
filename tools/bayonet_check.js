const fs=require('fs'),assert=require('assert');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>Object.fromEntries(UT.map(t=>[t,0])),addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)])),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync('game/battle.js','utf8'));
function fixture(){const B=makeBattle({att:{...zeroU(),inf:1},def:{...zeroU(),inf:1,cav:1},terrain:'plains'});B.player=0;B.cmdT=999;B.orders[0].foot=B.orders[1].foot='stand';B.orders[1].horse='wait';const r=B.regs.find(r=>r.side===0&&r.type==='inf'),foe=B.regs.find(r=>r.side===1&&r.type==='inf'),cavalry=B.regs.find(r=>r.side===1&&r.type==='cav');foe.reload=999;return {B,r,foe,cavalry}}
let {B,r,foe,cavalry}=fixture();r.goal={x:30,y:100};assert(fixBayonets(B,r));assert.equal(r.goal,null);assert.equal(r.ord,'stand');assert(!fixBayonets(B,r));assert(!canDrumRally(B,r));const anchor=[r.x,r.y];
for(let i=0;i<89;i++){stepBattle(B,1/30);assert(!r.bayonetsFixed);assert(!r.fired);assert.deepEqual([r.x,r.y],anchor)}
for(let i=0;i<3;i++)stepBattle(B,1/30);assert(r.bayonetsFixed);assert.equal(r.fixUntil,0);assert(!canFixBayonets(B,r));assert(bayonetBraced(B,r));
cavalry.x=r.x;cavalry.y=r.y-40;assert.equal(bayonetMeleeFactor(B,cavalry,r),.6);assert.equal(bayonetMeleeFactor(B,r,cavalry),1.25);
cavalry.x=r.x+40;cavalry.y=r.y;assert.equal(bayonetMeleeFactor(B,cavalry,r),1);cavalry.x=r.x;cavalry.y=r.y+40;assert.equal(bayonetMeleeFactor(B,cavalry,r),1);
cavalry.y=r.y-40;for(const mutation of [()=>r.moving=true,()=>r.goal={x:10,y:10},()=>r.form='column',()=>r.forming=true,()=>r.mor=29,()=>r.broken=true,()=>r.ord='charge']){r.moving=false;r.goal=null;r.form='line';r.forming=false;r.mor=100;r.broken=false;r.ord='stand';mutation();assert.equal(bayonetMeleeFactor(B,cavalry,r),1)}
r.broken=false;r.mor=100;r.ord='charge';assert(r.bayonetsFixed);assert.equal(bayonetMeleeFactor(B,r,foe),1.25);
({B,r,foe}=fixture());assert(fixBayonets(B,r));foe.x=r.x;foe.y=r.y-25;stepBattle(B,1/30);assert.equal(r.fixUntil,0);assert(!r.bayonetsFixed);assert(!canFixBayonets(B,r));
({B,r}=fixture());assert(fixBayonets(B,r));B.routing=0;stepBattle(B,1/30);assert.equal(r.fixUntil,0);assert(!r.bayonetsFixed);
({B,r,cavalry}=fixture());assert(!canFixBayonets(B,cavalry));B.done=true;assert(!canFixBayonets(B,r));
({B,r}=fixture());assert(fixBayonets(B,r));r.ord='charge';const p=[r.x,r.y];stepBattle(B,1);assert.deepEqual([r.x,r.y],p);stepBattle(B,2.1);assert(r.bayonetsFixed);assert(r.moving,'Queued charge starts after preparation');
console.log('Bayonets: preparation cost, duplicate/unsafe gating, interruption, queued charge, persistent melee bonus, and frontal-only settled-line cavalry defence pass.');
