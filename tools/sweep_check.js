// Regression checks for the graphics, battle rules and campaign strategy sweep.
const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..'),handlers={},docHandlers={},elementHandlers={},els={},storage={};
const noop=new Proxy(function(){},{get:(_,k)=>k==='measureText'?()=>({width:40}):noop,apply:()=>noop});
const el=id=>els[id]||(els[id]={id,innerHTML:'',textContent:'',hidden:true,style:{},dataset:{},disabled:false,clientWidth:400,clientHeight:700,value:'gold',classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(n,f){elementHandlers[id+'-'+n]=f},getContext:()=>noop,getBoundingClientRect:()=>({left:0,top:0})});
const ctx={console,Math,Date,Set,Map,Promise,Uint8Array,Blob,URL,atob,setTimeout:()=>0,clearTimeout(){},clearInterval(){},setInterval:()=>0,document:{getElementById:el,createElement:()=>el('generated'+Math.random()),addEventListener:(n,f)=>{(docHandlers[n]||(docHandlers[n]=[])).push(f);handlers[n]=f}},window:{},location:{hash:'',protocol:'file:'},innerWidth:400,innerHeight:800,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},performance:{now:()=>Date.now()},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]}};
let src=fs.readFileSync(path.join(root,'game/script.js'),'utf8').replace('/*__BATTLE__*/',fs.readFileSync(path.join(root,'game/battle.js'),'utf8')).replace('/*__SOUND__*/',fs.readFileSync(path.join(root,'game/sound.part.js'),'utf8'));
src=src.replace('/*__TEST__*/',`globalThis.test={get S(){return S},get G(){return G},UI,newGame,desert,unitsOf,preBattleHtml,zeroU,armyAt,moveArmy,canMove,resetMoves,declareWar,makePeace,answer,makeBattle,stepBattle,howitzer,foot,strike,melee,volley,rout,kill,sideStr,fracType,figureMotion,drawPaintedFig,unitStatus,NATIONS,validEnvoy,UNIT,terrainCover,cover,flankMult,faceFormation,inFireArc,masked,topOverlay,syncOverlayFocus,openModal,closeModal,campaignEffect,campaignMarker};UI.headless=true;`);
vm.createContext(ctx);vm.runInContext(src,ctx);const t=ctx.test;
const click=async(act,extra={})=>handlers.click({target:{closest:()=>({dataset:{act,...extra}})}});
const fresh=(opening='balanced')=>{t.newGame('normal',0,opening);return t.S};
function battle(type='how',side=0,distance=240){
  const own={...t.zeroU(),[type]:1},foe={...t.zeroU(),inf:1};
  const B=t.makeBattle({att:side?foe:own,def:side?own:foe,terrain:'plains'});
  const r=B.regs.find(r=>r.side===side&&r.type===type),e=B.regs.find(r=>r.side!==side&&r.type==='inf');
  B.player=side;B.regs=[r,e];r.ord='stand';r.hs='ready';r.x=e.x=200;r.y=side?100:500;e.y=r.y+(side?distance:-distance);
  for(const reg of [r,e])for(const m of reg.men){m.x=reg.x;m.y=reg.y;m.cd=0}
  return {B,r,e};
}
function fixedRandom(value,fn){const old=Math.random;Math.random=()=>value;try{return fn()}finally{Math.random=old}}
(async()=>{
  // Taking and leaving the same terrain changes protection for both sides.
  for(const terrain of ['forest','hills']){
    const B=t.makeBattle({att:{...t.zeroU(),inf:1},def:{...t.zeroU(),inf:1},terrain});
    for(const side of [0,1]){const r=B.regs.find(r=>r.side===side&&r.type==='inf');
      [r.x,r.y]=terrain==='forest'?[52,190]:[200,205];assert.equal(t.terrainCover(B,r),terrain==='forest'?.8:.85);
      r.x=200;r.y=500;assert.equal(t.terrainCover(B,r),1);
    }
  }
  // The full practice range stays in bounds, with distinct selectable anchors.
  for(const kind of ['fort','palisade'])for(const army of [{inf:8,mil:2,cav:2,art:2},{inf:20,mil:20,cav:20,hus:20,art:20,how:20}]){
    const B=t.makeBattle({att:{...t.zeroU(),inf:10},def:{...t.zeroU(),...army},gar:{...t.zeroU(),inf:2,art:2},fortKind:kind});
    const rs=B.regs.filter(r=>r.side===1);
    for(const r of rs){assert(r.men.every(m=>m.x>=0&&m.x<=400&&m.y>=0&&m.y<380),`${kind}: ${r.label} on field`);
      for(const other of rs)if(r!==other)assert(Math.hypot(r.x-other.x,r.y-other.y)>12,'Formation anchors remain distinct');}
    assert(rs.some(r=>r.outwork),'Supporting troops have outside positions');
    assert(rs.some(r=>!r.outwork),'Garrison holds the court');
  }
  // Turning changes the defended front, takes formation time, and gates firing.
  {const {B,r,e}=battle('inf',0,70);const n=r.n;r.x=200;r.y=400;e.x=270;e.y=400;r.reload=0;
    assert.equal(t.flankMult(e,r),1.5);assert(t.faceFormation(r,e.x,e.y));assert.equal(t.flankMult(e,r),1);assert(t.inFireArc(r,e));
    assert(r.forming&&!r.goal&&r.ord==='stand');t.foot(B,r,e,70,1/30);assert(!r.fired,'No volley during the turn');
    r.forming=false;r.formT=9;r.reload=0;t.foot(B,r,e,70,1/30);assert(r.fired,'Settled front can fire');
    e.x=130;assert.equal(t.flankMult(e,r),2);r.fired=false;r.reload=0;t.foot(B,r,e,70,1/30);assert(!r.fired,'No volley through the rear');assert.equal(r.n,n);
    const friend={...r,id:99,x:235,y:400,n:1};B.regs.push(friend);e.x=270;assert(t.masked(B,r,e),'Friendly troops block sideways shots too');
  }
  // Modal priority makes every lower surface inert, then restores the home menu.
  {el('home').hidden=false;el('battle').hidden=true;el('modal').hidden=true;t.syncOverlayFocus();assert(el('app').inert);assert(!el('home').inert);
    t.openModal('<button>Settings</button>');assert(el('home').inert&&el('app').inert);assert.equal(t.topOverlay(),el('modal'));
    t.closeModal();assert(!el('home').inert&&el('app').inert);el('home').hidden=true;t.syncOverlayFocus();assert(!el('app').inert);}

  // Arrival animation is presentation-only, respects reduced motion, and clears on a new game.
  {fresh();const a=t.S.armies.find(a=>a.f===0),from=a.p,to=(from+1)%t.G.n;let now=10;ctx.performance.now=()=>now;
    t.UI.headless=false;t.UI.busy=false;el('home').hidden=el('battle').hidden=el('modal').hidden=true;
    t.campaignEffect(to,'Arrived',a.id,from);a.p=to;assert.deepEqual([...t.campaignMarker(a)],[...t.G.c[from]]);
    now=50;t.openModal('<button>Season report</button>');assert.equal(t.UI.mapFx[0].t,null,'An immediately opened report pauses already-started feedback');t.closeModal();t.UI.mapFx[0].t=10;
    now=660;assert.deepEqual([...t.campaignMarker(a)],[...t.G.c[to]]);
    now=10;ctx.matchMedia=()=>({matches:true});assert.deepEqual([...t.campaignMarker(a)],[...t.G.c[to]]);delete ctx.matchMedia;
    t.UI.busy=true;t.campaignEffect(from,'Completed');t.campaignEffect(to,'Completed');assert.equal(t.UI.mapFx.filter(e=>e.label==='Completed').length,2);assert(t.UI.mapFx.filter(e=>e.label==='Completed').every(e=>e.t==null));
    t.UI.headless=true;t.UI.busy=false;fresh();assert.equal(t.UI.mapFx.length,0);ctx.performance.now=()=>Date.now();
  }
  // A deployed battery, on either side, must obey the advertised 240-pace range.
  for(const side of [0,1])for(const distance of [239.9,240,240.1,400]){
    const {B,r,e}=battle('how',side,distance);
    fixedRandom(.5,()=>t.howitzer(B,r,e,distance,1/30));
    assert.equal(B.shells.length,distance<=240?1:0,`Howitzer side ${side}, distance ${distance}`);
  }
  for(const distance of [225,260]){
    const {B,r,e}=battle('how',0,distance);r.hs='limber';const before=[r.x,r.y];
    t.howitzer(B,r,e,distance,1/30);assert.deepEqual([r.x,r.y],before,'Hold position cannot move a limbered howitzer');
    assert.equal(r.hs,distance<=240?'deploy':'limber');
  }
  // Large formations still use exactly three firing cohorts; every soldier gets a turn.
  for(const type of ['inf','mil']){
    const {B,r,e}=battle(type);const big=t.makeBattle({att:{...t.zeroU(),[type]:30},def:{...t.zeroU(),inf:1}});
    const reg=big.regs.find(r=>r.side===0&&r.type===type);assert(reg.men.filter(m=>!m.role).length>40);
    for(let rank=0;rank<3;rank++)t.volley(big,reg,e,50,130,0,2,rank);
    assert(reg.men.filter(m=>!m.role).every(m=>m.shotT===0),'No fourth cohort may be silently excluded');
  }
  // Passing a flank waypoint must not grant a permanent rear-attack bonus.
  const f=battle('cav',0,15);f.r.flanked=true;
  f.B.fx={death(){},banner(){},spark(){}};
  f.e.men.forEach(m=>m.hp=10000);fixedRandom(0,()=>t.strike(f.B,f.r,f.e,1/30));
  assert(!f.B.insights.some(i=>i.key.startsWith('flank-')),'A frontal attack must remain frontal after a flank manoeuvre');
  // An intact wall blocks melee; the same combat becomes possible at an opened breach.
  for(const kind of ['capital','fort','palisade']){
    const {B,r,e}=battle('inf',0,16);B.fortKind=kind;r.x=e.x=200;
    const wall=kind==='capital'?210:kind==='fort'?217:220;r.y=wall+8;e.y=wall-8;B.pairs=new Set();
    t.melee(B,r,e,1/30);assert(!r.melee&&!e.melee);assert(r.atWall);
    r.ord='ready';r.reload=0;t.foot(B,r,e,16,1/30);assert(r.fired,'Walls block bayonets, not close-range musket fire');
    B.breaches.push({x:200,y:wall});t.melee(B,r,e,1/30);assert(r.melee&&e.melee);
  }
  // Abandoned guns cannot retaliate in melee after losing all crew and staff.
  const abandoned=battle('art',0,15);for(const m of abandoned.r.men){if(m.role)m.alive=false;if(m.crew)m.crew.forEach(c=>c.alive=false)}
  const hp=abandoned.e.men.reduce((n,m)=>n+m.hp,0);fixedRandom(0,()=>t.strike(abandoned.B,abandoned.r,abandoned.e,1));
  assert.equal(abandoned.e.men.reduce((n,m)=>n+m.hp,0),hp);
  // Mounted arrivals cannot carry foot farther than its remaining movement budget.
  for(const river of [false,true]){
    const s=fresh('mounted'),a=s.armies[0],p=t.G.nb[a.p].find(p=>s.prov[p].o===0&&!t.armyAt(p));
    assert(p!=null);s.prov[a.p].road=s.prov[p].road=true;s.prov[p].r=river?1:0;
    const other={id:s.nextId++,f:0,p,u:{...t.zeroU(),inf:1},mv:1,marched:0,gen:null};s.armies.push(other);
    a.mv=1.5;a.marched=.5;assert(await t.moveArmy(a,p));assert.equal(other.mv,0,'One full movement spent before merging must exhaust foot');
  }
  {
    const s=fresh('mounted'),a=s.armies[0],p=t.G.nb[a.p].find(p=>s.prov[p].o===0);
    s.prov[a.p].road=s.prov[p].road=true;s.prov[p].r=1;
    const other={id:s.nextId++,f:0,p,u:{...t.zeroU(),cav:1},mv:2,marched:0,gen:null};s.armies.push(other);
    assert(await t.moveArmy(a,p));assert.equal(other.mv,0,'Merging across a river ends mounted movement too');
  }
  // Diplomatic offers lose authority when the relationship they refer to changes.
  {
    const s=fresh();s.inbox=[{from:1,type:'pact'}];t.declareWar(0,1);assert(!s.inbox.some(m=>m.from===1&&m.type==='pact'));
    s.inbox=[{from:1,type:'pact'}];t.answer(0,true);assert.equal(s.rel['0-1'].st,'war','An obsolete pact must not end a later war');
    s.inbox=[{from:1,type:'peace'}];t.makePeace(0,1);assert.equal(s.inbox.length,0);
    const treaties=s.pTreat;s.inbox=[{from:1,type:'peace'}];t.answer(0,true);assert.equal(s.pTreat,treaties,'Repeated peace offers cannot farm trust');
  }
  // Army splitting must not erase wage desertion through per-detachment rounding.
  for(const split of [false,true]){
    const s=fresh();s.armies=s.armies.filter(a=>a.f!==0);
    for(let i=0;i<(split?8:1);i++)s.armies.push({id:s.nextId++,f:0,p:i,u:{...t.zeroU(),inf:split?6:48},mv:0,gen:null});
    t.desert(0,.08,'unpaid wages');assert.equal(t.unitsOf(0).inf,44);
  }
  {const s=fresh();s.armies[0].u={...t.zeroU(),inf:1};t.desert(0,.08,'unpaid wages');assert.equal(t.unitsOf(0).inf,0,'A tiny force cannot remain permanently immune to unpaid wages')}
  {const s=fresh(),a=s.armies[0],p=t.G.nb[a.p][0];s.prov[p].o=1;s.prov[p].b='fort';t.declareWar(0,1);
    assert(t.preBattleHtml(a,p).includes('no artillery'));a.u.how=1;assert(t.preBattleHtml(a,p).includes('Target wall point…'))}
  const retreat=battle('inf');t.rout(retreat.B,0);assert(retreat.r.routing);assert.equal(t.unitStatus(retreat.B,retreat.r),'Routing');
  assert(!t.UNIT.inf.d.includes('Squares'));
  console.log('Sweep: artillery range/hold, every firing cohort, geometric flanks, intact-wall melee, abandoned guns, road/river merges, stale diplomacy, unpaid-wage splitting, siege advice and retreat status pass.');
})().catch(e=>{console.error(e);process.exitCode=1});
