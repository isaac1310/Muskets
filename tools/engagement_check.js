// Behaviour checks for campaign help, recovery, service history, and battle explanations.
const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..'),handlers={},docHandlers={},elementHandlers={},els={},storage={};
const noop=new Proxy(function(){},{get:(_,k)=>k==='measureText'?()=>({width:40}):noop,apply:()=>noop});
const el=id=>els[id]||(els[id]={id,innerHTML:'',textContent:'',hidden:true,style:{},dataset:{},disabled:false,clientWidth:400,clientHeight:700,value:'gold',classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(n,f){elementHandlers[id+'-'+n]=f},getContext:()=>noop,getBoundingClientRect:()=>({left:0,top:0})});
const ctx={console,Math,Date,Set,Map,Promise,Uint8Array,Blob,URL,atob,setTimeout:()=>0,clearTimeout(){},clearInterval(){},setInterval:()=>0,document:{getElementById:el,createElement:()=>el('generated'+Math.random()),addEventListener:(n,f)=>{(docHandlers[n]||(docHandlers[n]=[])).push(f);handlers[n]=f}},window:{},location:{hash:'',protocol:'file:'},innerWidth:400,innerHeight:800,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},performance:{now:()=>Date.now()},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]}};
let src=fs.readFileSync(path.join(root,'game/script.js'),'utf8').replace('/*__BATTLE__*/',fs.readFileSync(path.join(root,'game/battle.js'),'utf8')).replace('/*__SOUND__*/',fs.readFileSync(path.join(root,'game/sound.part.js'),'utf8'));
src=src.replace('/*__TEST__*/',`globalThis.test={get S(){return S},set S(v){S=v},get M(){return M},set BV(v){BV=v},UI,newGame,showHome,chooser,start,save,capture,tickRecoveries,checkOver,capitalOf,income,recruit,tickRecruitment,resetMoves,moveArmy,canStep,nbrs,declareWar,armyRecord,generalRecord,appointGeneral,recordEngagement,removeArmy,contextualHelp,historyPanel,makeBattle,kill,battleAdvice,battleExplanation,strike,masked,stepBattle,runToEnd,renderBattleUI,finishBattle,zeroU,OPENINGS};UI.headless=true;`);
vm.createContext(ctx);vm.runInContext(src,ctx);const t=ctx.test;
const click=async(act,extra={})=>handlers.click({target:{closest:()=>({dataset:{act,...extra}})}});
const fresh=(opening='balanced')=>{t.newGame('normal',0,opening);return t.S};
function recoveryFixture(){const s=fresh(),p=s.prov.findIndex(x=>x.o===0&&x.b==='capital');assert(s.prov.some((x,i)=>i!==p&&x.o===0));t.capture(1,p);return{s,p,r:s.fac[0].recovery}}
(async()=>{
  // The bootstrap preview must not become a phantom Continue, but season-one play must resume.
  t.newGame('normal',0,'balanced',true);t.showHome();assert(!els.hmenu.innerHTML.includes('data-act="hcont"'));
  let s=fresh();t.recruit(0,0,'inf');t.showHome();assert(els.hmenu.innerHTML.includes('data-act="hcont"'));t.chooser();assert(els.card.innerHTML.includes('abandons the current campaign'));
  t.UI.headless=false;t.save();t.UI.headless=true;const troops=s.armies[0].u.inf;t.start({S:JSON.parse(storage['musket-crown-save-v4'])});assert.equal(t.S.armies[0].u.inf,troops);assert.equal(t.S.turn,1);
  // Context follows the selected object, can be dismissed, and never locks out actions.
  s=fresh();t.UI.tab='tile';s.sel=0;assert(t.contextualHelp().includes('data-tip="movement"'));
  await click('tipdone',{tip:'movement'});assert(t.contextualHelp().includes('data-tip="recruitment"'));
  s.sel=1;assert(t.contextualHelp().includes('data-tip="diplomacy"'));
  await click('tipdone',{tip:'diplomacy'});assert(!t.contextualHelp());
  // Mounted opening actually grants two marches, until infantry joins it.
  s=fresh('mounted');assert.equal(s.armies[0].mv,2);let a=s.armies[0];
  let p=t.nbrs(a.p).find(i=>t.canStep(0,i));assert(p!=null);s.prov[p].r=false;await t.moveArmy(a,p);assert.equal(a.mv,1);
  s.prov[p].b='barracks';t.recruit(0,p,'inf');assert.equal(a.mv,1);s.turn+=2;t.tickRecruitment();assert.equal(a.mv,0);t.resetMoves();assert.equal(a.mv,1);
  // Losing a capital preserves the realm and offers exactly three full subsequent seasons.
  let f=recoveryFixture();assert(f.r);assert(f.s.fac[0].alive);assert.equal(t.capitalOf(0),f.r.refuge);assert(t.income(0).popCap>=12);assert(t.recruit(0,f.r.refuge,'inf'));
  t.tickRecoveries();assert.equal(f.r.left,3);for(let i=0;i<2;i++){f.s.turn++;t.tickRecoveries();assert(f.s.fac[0].alive)}
  assert.equal(f.r.left,1);f.s.turn++;t.tickRecoveries();t.checkOver();assert(!f.s.fac[0].alive);assert.equal(f.s.over.win,false);
  // Retaking the capital restores it; a second loss grants no extra recovery.
  f=recoveryFixture();t.capture(0,f.p);assert(!f.s.fac[0].recovery);assert.equal(t.capitalOf(0),f.p);assert.equal(f.s.prov[f.p].b,'capital');t.capture(1,f.p);assert(!f.s.fac[0].alive);
  // A lost refuge relocates; losing the last province defeats the crown immediately.
  f=recoveryFixture();const old=f.r.refuge;f.s.prov[old].o=1;t.checkOver();if(f.s.prov.some(x=>x.o===0))assert.notEqual(f.r.refuge,old);
  f.s.prov.forEach(x=>{if(x.o===0)x.o=1});t.checkOver();assert(!f.s.fac[0].alive);
  // Recovery survives save/load with its remaining deadline and refuge recruitment intact.
  f=recoveryFixture();f.s.turn++;t.tickRecoveries();t.start({S:JSON.parse(JSON.stringify(f.s))});assert.equal(t.S.fac[0].recovery.left,2);assert(t.recruit(0,t.S.fac[0].recovery.refuge,'inf'));
  // History survives removal and serialization, including a fallen general's last defence.
  s=fresh();a=s.armies[0];t.appointGeneral(0,a);const name=a.gen.name;t.recordEngagement(a,0,true,true,false);t.recordEngagement(a,1,false,false,true);
  assert.equal(t.generalRecord(a).wins,1);assert.equal(t.generalRecord(a).defences,1);assert(t.generalRecord(a).status.includes('Fell'));
  a.gen=null;t.removeArmy(a);s=JSON.parse(JSON.stringify(s));t.S=s;assert.equal(s.armyArchive[0].wins,1);assert(t.historyPanel().includes(name));
  // Evidence remains valid with no effects renderer (instant resolution).
  const z=t.zeroU(),B=t.makeBattle({att:{...z,inf:2},def:{...z,inf:2},terrain:'plains'}),own=B.regs.find(r=>r.side===0&&r.type==='inf'),foe=B.regs.find(r=>r.side===1&&r.type==='inf');
  t.kill(B,foe.officer,2,{reg:own,kind:'musket',flank:2});assert(B.insights.some(i=>i.text.includes('officer')));assert(B.insights.some(i=>i.text.includes('rear')));assert.equal(own.flankHits,1);B.loser=1;assert(t.battleExplanation(B)[1].includes('officer'));delete B.loser;
  own.fat=75;assert(t.battleAdvice(B,own).some(x=>x.includes('−30%')));
  const reserve=B.regs.find(r=>r.side===0&&r.type==='inf'&&r!==own);own.x=200;own.y=350;reserve.x=200;reserve.y=320;foe.x=200;foe.y=250;own.target=foe;own.form='line';assert(t.masked(B,own,foe));assert(t.battleAdvice(B,own).some(x=>x.includes('friendly formation')));
  t.runToEnd(B);assert(t.battleExplanation(B)[0].length>30);assert(t.battleExplanation(B).some(x=>x.includes('officer')));
  // A new order replaces a ground goal/forced target; the fixed Pause remains available.
  s=fresh();const b=t.makeBattle({att:{...z,inf:2,cav:1},def:{...z,inf:1},terrain:'plains'}),r=b.regs.find(r=>r.side===0&&r.type==='inf');b.fx={banner(){},rout(){}};
  const v={B:b,ps:0,o:{af:0,df:1},sel:[r],speed:1,paused:true,closed:false};t.BV=v;r.goal={x:20,y:20};r.forced=b.regs.find(x=>x.side===1);r.flanked=true;
  await click('bo',{g:'sel-foot',v:'stand'});assert.equal(r.goal,null);assert.equal(r.forced,null);assert(!r.flanked);assert.equal(r.ord,'stand');assert(els.bquick.innerHTML.includes('id="bpause"'));
  // Empty-ground and outside clicks deselect; only explicit Move to places a destination.
  v.s=1;v.view={L:0,Tp:0,z:1};v.sel=[r];r.goal=null;
  elementHandlers['bcv-click']({clientX:5,clientY:5});assert.equal(v.sel.length,0);assert.equal(r.goal,null);
  v.sel=[r];await click('bmove');assert(v.moveMode);elementHandlers['bcv-click']({clientX:5,clientY:5});assert(r.goal);assert(!v.moveMode);assert.equal(v.sel.length,1);
  const destination={...r.goal};elementHandlers['bcv-click']({clientX:5,clientY:5});assert.equal(v.sel.length,0);assert.deepEqual(r.goal,destination);
  v.sel=[r];docHandlers.click[0]({target:{closest:()=>null}});assert.equal(v.sel.length,0);
  v.sel=[r];docHandlers.click[0]({target:{closest:()=>({})}});assert.equal(v.sel.length,1,'Controls do not clear selection');
  await click('bform',{v:'column'});assert.equal(r.form,'column');assert(r.forming);assert.deepEqual(r.goal,destination,'Formation keeps the destination');
  await click('bo',{g:'sel-foot',v:'advance'});assert.equal(r.ord,'advance');assert.equal(r.formOrder,'column');
  await click('bform',{v:'line'});assert.equal(r.ord,'advance','Formation must preserve Advance');assert.equal(r.formOrder,'line');
  await click('bo',{g:'sel-foot',v:'stand'});await click('bform',{v:'column'});assert.equal(r.ord,'stand','Formation alone must not advance');
  await click('bo',{g:'sel-foot',v:'ready'});assert.equal(r.form,'line');assert.equal(r.ord,'ready');assert.equal(r.formOrder,'line');
  assert(els.bctl.innerHTML.includes('Fire when ready'));assert(els.bctl.innerHTML.includes('Form line'));
  await click('bfix');assert(r.fixUntil>b.t);assert.equal(r.ord,'stand');assert(els.bctl.innerHTML.includes('id="bfix"'));assert.equal(els.bfix.textContent,'Fixing bayonets…');
  await click('bretreat');assert(b.endReason.includes('your retreat order'));t.BV=null;
  // Legacy v4 saves retain troops and experience without fabricating old service records.
  s=fresh();delete s.tips;delete s.generalHistory;delete s.armyArchive;delete s.started;delete s.opening;s.armies[0].gen={name:'Schwerin',xp:6};
  t.start({S:JSON.parse(JSON.stringify(s))});assert.equal(t.S.armies[0].gen.xp,6);assert.equal(t.generalRecord(t.S.armies[0]).battles,0);assert(els.hmenu.innerHTML.includes('data-act="hcont"'));
  console.log('Engagement: first-season resume, contextual help, doctrine movement, recovery success/expiry/relocation, saved histories, evidence-based battle reports, order replacement, form/fire controls, empty-ground/outside deselection and explicit movement pass.');
})().catch(e=>{console.error(e);process.exitCode=1});
