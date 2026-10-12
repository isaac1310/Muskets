// Regression checks for movement, drummer support and delayed casualty rendering.
const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>Object.fromEntries(UT.map(t=>[t,0]));
const addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)])),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync(path.join(__dirname,'../game/battle.js'),'utf8'));
function fixture(){const B=makeBattle({att:{...zeroU(),inf:2},def:{...zeroU(),inf:2},terrain:'plains'});B.player=0;B.orders[0].foot='stand';B.orders[1].foot='stand';return {B,r:B.regs.find(r=>r.side===0&&r.type==='inf')}}
let {B,r}=fixture();r.mor=20;r.reload=0;const y=r.y;assert(drumRally(B,r));assert(!drumRally(B,r));
for(let i=0;i<239;i++){stepBattle(B,1/30);assert.equal(r.y,y);assert(!r.fired)}
stepBattle(B,1/30);stepBattle(B,1/30);assert(Math.abs(r.drumGained-16)<.01);assert(B.insights.some(x=>x.key.startsWith('drumrally-')));assert(!canDrumRally(B,r));
B.t=45;assert(canDrumRally(B,r));r.broken=true;assert(!canDrumRally(B,r));r.broken=false;r.melee=true;assert(!canDrumRally(B,r));r.melee=false;
assert(drumRally(B,r));kill(B,r.drummer);assert(!drumming(B,r));assert(!canDrumRally(B,r));assert(B.insights.some(x=>x.key.startsWith('drum-')));
({B,r}=fixture());const enemy=B.regs.find(x=>x.side===1&&x.type==='inf');enemy.x=r.x;enemy.y=r.y-20;assert(!canDrumRally(B,r));
// Compare identical quiet formations: a living drummer adds precisely 0.8 morale per second.
({B,r}=fixture());const other=B.regs.find(x=>x.side===0&&x!==r&&x.type==='inf');other.x=r.x;other.y=r.y;r.mor=other.mor=50;other.drummer.alive=false;stepBattle(B,1);assert(Math.abs(r.mor-other.mor-.8)<1e-9);
// A typical large practice army must not begin with neighbouring battalions interleaved.
const dense=makeBattle({att:{...zeroU(),inf:10,mil:2},def:{...zeroU(),inf:5,mil:10},terrain:'plains'});
for(const side of [0,1])for(const row of [0,1,2,3]){const line=dense.regs.filter(r=>r.side===side&&r.row===row).sort((a,b)=>a.x-b.x);for(let i=1;i<line.length;i++){const left=line[i-1].men.filter(m=>!m.role),right=line[i].men.filter(m=>!m.role);assert(Math.min(...right.map(m=>m.x))-Math.max(...left.map(m=>m.x))>=9)}}
// Correct casualties carry their source, including an exploding gun's surviving crew.
const gunB=makeBattle({att:{...zeroU(),art:1},def:{...zeroU(),inf:2},terrain:'plains'}),gun=gunB.regs.find(x=>x.type==='art').men.find(m=>!m.role),deaths=[];
gunB.fx={death:(m,s)=>deaths.push([m,s]),crewDeath:(m,s)=>deaths.push([m,s]),spark(){},banner(){}};
for(let i=0;i<6;i++)kill(gunB,gun,1,{kind:'shell',x:gun.x-10,y:gun.y});assert.equal(deaths.length,4);assert(deaths.every(([m,s])=>s.kind==='shell'&&Number.isFinite(s.x)&&Number.isFinite(s.y)));
// Spacing exists in both line and column; a crossing is corrected gradually, not teleported.
({B,r}=fixture());for(const form of ['l','c']){const men=r.men.filter(m=>!m.role);for(let i=0;i<men.length;i++)for(let j=i+1;j<men.length;j++)assert(Math.hypot(men[i][form][0]-men[j][form][0],men[i][form][1]-men[j][form][1])>=9.39)}
const [a,b]=r.men;a.x=b.x=200;a.y=b.y=300;separateRanks(B,1/30);assert(Math.hypot(a.x-b.x,a.y-b.y)>0);assert(Math.hypot(a.x-200,a.y-300)<1);
({B,r}=fixture());r.goal={x:r.x+30,y:r.y-30};let last=r.men.map(m=>({x:m.x,y:m.y}));for(let i=0;i<90;i++){stepBattle(B,1/30);r.men.forEach((m,j)=>{assert(Number.isFinite(m.x)&&Number.isFinite(m.gait));assert(Math.hypot(m.x-last[j].x,m.y-last[j].y)<3);last[j]={x:m.x,y:m.y}})}assert(r.men.some(m=>m.walk>.1));
// Exercise the actual animation functions without a browser or assets.
const src=fs.readFileSync(path.join(__dirname,'../game/script.js'),'utf8');
const ctx={Math,clamp,FW:400,FH:620,isGun:t=>['art','how'].includes(t),isHorse:t=>['cav','hus'].includes(t),isFoot:t=>['inf','mil'].includes(t),NF:()=>({coat:'#123',col:'#234'}),NATIONS:[],CITYNAT:{},UNIT_IMAGES:null};vm.createContext(ctx);
vm.runInContext(src.slice(src.indexOf('function placeFallen('),src.indexOf('function fxOf('))+src.slice(src.indexOf('function figureScale('),src.indexOf('function bodyFlat('))+src.slice(src.indexOf('function tickFx('),src.indexOf('function selOf(')),ctx);
const view=()=>({o:{af:0,df:1},B:{t:0},dead:[],falls:[],dust:[],smoke:[],boom:[],banners:[],flash:[],spark:[],spray:[]});
const v=view(),man=r.men[2];ctx.body(v,man,{kind:'musket'});assert.equal(v.dead.length,0);assert.equal(v.falls.length,1);ctx.tickFx(v,0);assert.equal(v.falls[0].l,0);ctx.tickFx(v,.4);assert.equal(v.dead.length,0);assert(ctx.fallPose(v.falls[0]).p>0);ctx.tickFx(v,.5);assert.equal(v.dead.length,1);assert.equal(v.falls.length,0);ctx.tickFx(v,2);assert.equal(v.dead.length,1);
const blast=view();ctx.body(blast,man,{kind:'shell',x:man.x-10,y:man.y});const f=blast.falls[0];assert(f.dead.x>man.x);ctx.tickFx(blast,.5);assert(ctx.fallPose(f).lift>10);ctx.tickFx(blast,1);assert.equal(blast.dead.length,1);assert.equal(blast.falls.length,0);
// Loaded-sprite paths must render walking cavalry, drummers and falling figures too.
const N={coat:'#123',col:'#234'},im={complete:true,naturalWidth:30,naturalHeight:60};ctx.UNIT_IMAGES=new Proxy({}, {get:()=>im});ctx.NATIONS=[N];ctx.BV={B};ctx.BT={infReload:6.4,howReload:11.5,artReload:9.5};ctx.drawBattleFlag=()=>{};
vm.runInContext(src.slice(src.indexOf('function figurePose('),src.indexOf('function drawFigDetails(')),ctx);
const canvas=new Proxy({}, {get:()=>()=>{}});
for(const type of ['inf','mil','cav','hus','gen','art','how'])for(const role of ['', 'drum','flag','officer'])ctx.drawPaintedFig(canvas,{ox:0,x:200,rank:0,gait:3,walk:1,role},{type,moving:true,hs:'ready',mor:80},N,1,2);
ctx.drawFall(canvas,f,200,200,1);
// Blood is visual-only, bounded and frozen with the battle; landing leaves a persistent stain.
const bloodView=view();ctx.body(bloodView,man,{kind:'shell',x:man.x-10,y:man.y});assert(bloodView.blood.length>0);const frozen=JSON.stringify(bloodView.blood);ctx.tickFx(bloodView,0);assert.equal(JSON.stringify(bloodView.blood),frozen);
const initial=bloodView.blood.length;ctx.tickFx(bloodView,.1);assert(bloodView.blood.length>initial);assert(bloodView.blood.every(b=>Number.isFinite(b.x)&&Number.isFinite(b.z)));
ctx.tickFx(bloodView,1.1);assert(bloodView.dead[0].blood>0);for(let i=0;i<100;i++)ctx.bloodBurst(bloodView,200,300,10);assert(bloodView.blood.length<=320);bloodView.low=true;ctx.bloodBurst(bloodView,200,300,10);assert(bloodView.blood.length<=120);ctx.tickFx(bloodView,2);assert.equal(bloodView.blood.length,0);assert(bloodView.dead[0].blood>0);
ctx.drawBlood(canvas,{x:200,y:300,z:10,l:.3,max:1.15,vx:2,vz:3,size:1},(x,y)=>[x,y,1]);
// Gun wheel textures rotate with travelled distance; the rendering transform is balanced.
for(const type of ['art','how'])for(const hs of ['ready','limber']){const rotations=[];let saves=0;const recorder=new Proxy({}, {get:(_,key)=>key==='save'?()=>saves++:key==='restore'?()=>saves--:key==='rotate'?a=>rotations.push(a):()=>{}});
  const gun={ox:0,x:200,gait:3,walk:1,role:''};ctx.drawPaintedFig(recorder,gun,{type,moving:true,hs,mor:80},N,1,2);assert.equal(saves,0);assert(rotations.filter(a=>Math.abs(a-1.65)<.001).length===2);
  const halted=[];const still=new Proxy({}, {get:(_,key)=>key==='rotate'?a=>halted.push(a):()=>{}});gun.walk=0;ctx.drawPaintedFig(still,gun,{type,moving:false,hs,mor:80},N,1,20);assert(halted.filter(a=>Math.abs(a-1.65)<.001).length===2);
}
console.log('Battle feel: drum recovery/cost/cooldown/loss, safe activation, formation spacing, gradual separation, smooth positions, source propagation, paused falls, blood trails/stains/caps, cannon wheels/crew and blast-to-body transitions pass.');
// Painted charges articulate their legs instead of sliding a single static pose.
const poses=[];const motionCanvas=new Proxy({}, {get:(_,key)=> (...args)=>{if(['drawImage','rotate','translate'].includes(key))poses.push([key,...args])}});
ctx.drawPaintedFig(motionCanvas,{ox:0,x:200,rank:0,gait:1,walk:1,role:''},{type:'inf',moving:true,bayonet:true,mode:'charge'},N,-1,5);
assert(poses.filter(p=>p[0]==='drawImage'&&p.length===10).length===3,'Charge needs articulated upper body and legs');assert(poses.some(p=>p[0]==='rotate'&&Math.abs(p[1])>.02));
poses.length=0;ctx.drawPaintedFig(motionCanvas,{ox:0,x:200,rank:0,gait:0,walk:0,hitT:5,hitDX:1,hitDY:0},{type:'inf',moving:false},N,-1,5.16);assert(poses.some(p=>p[0]==='rotate'&&Math.abs(p[1]-.22)<.001),'Hits must visibly stagger the body');
console.log('Visuals: charging strides/lean and directional hit flinch pass.');
for(const type of ['inf','mil'])for(const prepared of [false,true])ctx.drawPaintedFig(canvas,{ox:0,x:200,rank:0,gait:0,walk:0,role:''},{type,moving:false,bayonetsFixed:prepared,fixStarted:5,fixUntil:prepared?0:8},N,-1,6);
console.log('Bayonet fixing and fixed ready poses render for infantry and militia.');
