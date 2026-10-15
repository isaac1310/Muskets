// Behaviour checks for campaign help, recovery, service history, and battle explanations.
const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..'),handlers={},docHandlers={},elementHandlers={},els={},storage={};
const noop=new Proxy(function(){},{get:(_,k)=>k==='measureText'?()=>({width:40}):noop,apply:()=>noop});
const el=id=>els[id]||(els[id]={id,innerHTML:'',textContent:'',hidden:true,style:{},dataset:{},disabled:false,clientWidth:400,clientHeight:700,value:'gold',classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(n,f){elementHandlers[id+'-'+n]=f},getContext:()=>noop,getBoundingClientRect:()=>({left:0,top:0})});
const ctx={console,Math,Date,Set,Map,Promise,Uint8Array,Blob,URL,atob,setTimeout:()=>0,clearTimeout(){},clearInterval(){},setInterval:()=>0,document:{getElementById:el,createElement:()=>el('generated'+Math.random()),addEventListener:(n,f)=>{(docHandlers[n]||(docHandlers[n]=[])).push(f);handlers[n]=f}},window:{},location:{hash:'',protocol:'file:'},innerWidth:400,innerHeight:800,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},performance:{now:()=>Date.now()},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]}};
let src=fs.readFileSync(path.join(root,'game/script.js'),'utf8').replace('/*__BATTLE__*/',fs.readFileSync(path.join(root,'game/battle.js'),'utf8')).replace('/*__SOUND__*/',fs.readFileSync(path.join(root,'game/sound.part.js'),'utf8'));
src=src.replace('/*__TEST__*/',`globalThis.test={get S(){return S},set S(v){S=v},get G(){return G},UI,newGame,start,recruit,tickRecruitment,armyAt,zeroU,capture,eliminate,improveRelations,canImproveRelations,cityTrade,endCityTrade,canCityTrade,cityWar,cityGift,cityProtect,takeCity,landRoute,capitalOf,routes,tradeIncome,declareWar,makePeace,realmPanel,tilePanel,diploPanel,territoryWarHtml,R,canStep,resetMoves,endTurn,aiRecruit};UI.headless=true;`);
vm.createContext(ctx);vm.runInContext(src,ctx);const t=ctx.test;
const click=async(act,extra={})=>handlers.click({target:{closest:()=>({dataset:{act,...extra}})}});
const fresh=(opening='balanced')=>{t.newGame('normal',0,opening);return t.S};
function recoveryFixture(){const s=fresh(),p=s.prov.findIndex(x=>x.o===0&&x.b==='capital');assert(s.prov.some((x,i)=>i!==p&&x.o===0));t.capture(1,p);return{s,p,r:s.fac[0].recovery}}
(async()=>{
  // Province actions use the existing diplomatic rules and never auto-march an army.
  for(const status of ['neutral','peace','alliance','truce']){
    const state=fresh(),p=state.prov.findIndex(t=>t.o===1),r=t.R(0,1);r.st=status;r.trade=status==='peace';state.sel=p;t.UI.tab='tile';t.UI.confirm=null;
    const before=JSON.stringify(state.armies.map(a=>({p:a.p,mv:a.mv,u:a.u}))),betray=state.pBetray;
    let html=t.tilePanel();assert(html.includes('data-op="war" data-f="1"'));assert(html.includes('Declare war on'));
    if(status!=='neutral')assert(html.includes('damages trust'));
    await click('dip',{op:'war',f:'1'});assert.equal(r.st,status);assert(t.tilePanel().includes(status==='neutral'?'Confirm war on':'Confirm: break treaties with'));
    await click('dip',{op:'war',f:'1'});assert.equal(r.st,'war');assert(!r.trade);assert.equal(state.sel,p);assert.equal(t.UI.tab,'tile');assert.equal(JSON.stringify(state.armies.map(a=>({p:a.p,mv:a.mv,u:a.u}))),before);
    assert(!t.tilePanel().includes('data-op="war"'));assert(t.tilePanel().includes('At war with'));assert.equal(state.pBetray,betray+(status==='neutral'?0:1));
  }
  {
    const state=fresh(),city=state.cities.find(c=>state.prov[c.p].o==null);city.patron=null;city.war[0]=false;state.sel=city.p;t.UI.confirm=null;
    const i=state.cities.indexOf(city);assert(t.tilePanel().includes(`data-act="cwar" data-c="${i}"`));
    await click('cwar',{c:String(i)});assert(!city.war[0]);await click('cwar',{c:String(i)});assert(city.war[0]);assert(!t.tilePanel().includes('data-act="cwar"'));
    city.war[0]=false;city.patron=1;t.R(0,1).st='neutral';t.UI.confirm=null;assert(t.tilePanel().includes('Protected by'));assert(t.tilePanel().includes('data-op="war" data-f="1"'));assert(!t.tilePanel().includes('data-act="cwar"'));
    await click('dip',{op:'war',f:'1'});await click('dip',{op:'war',f:'1'});assert.equal(t.R(0,1).st,'war');assert(t.canStep(0,city.p));assert(!city.war[0]);
    city.patron=0;assert(!t.territoryWarHtml(city.p).includes('<button'));assert(t.territoryWarHtml(city.p).includes('your protection'));
    state.sel=0;assert(!t.territoryWarHtml(0));const empty=state.prov.findIndex(x=>x.o==null&&!x.b);assert(empty>=0);assert(!t.territoryWarHtml(empty));
    // Navigating away cancels the armed confirmation, even when another province has the same owner.
    const p=state.prov.findIndex(x=>x.o===2);state.sel=p;t.R(0,2).st='neutral';await click('dip',{op:'war',f:'2'});assert(t.UI.confirm);
    await click('site',{p:String(p)});assert.equal(t.UI.confirm,null);await click('dip',{op:'war',f:'2'});assert.equal(t.R(0,2).st,'neutral');
  }
  let s=fresh();s.fac[0].gold=500;s.fac[0].pop=20;const a=s.armies[0],before={...a.u};
  for(const [type,b] of [['mil','capital'],['inf','capital'],['cav','barracks'],['art','foundry'],['how','foundry']]){s.prov[0].b=b;s.prov[0].level=2;assert(t.recruit(0,0,type))}
  s.prov[0].b='capital';assert.equal(s.recruitment.length,5);assert.equal(s.fac[0].gold,409);assert.equal(s.fac[0].pop,15);assert.deepEqual(a.u,before);
  assert(t.tilePanel().includes('4 seasons left'));assert(t.realmPanel().includes('Troops in training'));
  s.turn++;t.tickRecruitment();assert.equal(a.u.mil,before.mil+1);assert.equal(a.u.inf,before.inf);
  s.turn++;t.tickRecruitment();assert.equal(a.u.inf,before.inf+1);assert.equal(a.u.cav,before.cav);
  const saved=JSON.parse(JSON.stringify(s));t.start({S:saved});s=t.S;assert.equal(s.recruitment.length,3);
  s.turn++;t.tickRecruitment();assert.equal(t.armyAt(0).u.cav,before.cav+1);assert.equal(t.armyAt(0).u.art,before.art+1);
  s.turn++;t.tickRecruitment();assert.equal(t.armyAt(0).u.how,before.how+1);assert.equal(s.recruitment.length,0);t.tickRecruitment();assert.equal(t.armyAt(0).u.how,before.how+1);
  // Recruitment creates an army at its site, never follows the army that left.
  s=fresh();t.recruit(0,0,'mil');const army=s.armies[0];army.p=t.G.nb[0].find(p=>s.prov[p].o===0);s.turn++;t.tickRecruitment();assert(t.armyAt(0));assert.equal(t.armyAt(0).u.mil,1);assert.equal(t.armyAt(0).mv,0);
  // Occupied allied sites wait; capture and defeat destroy training, including before recapture.
  s=fresh();t.recruit(0,0,'inf');s.armies[0].f=1;s.turn+=2;t.tickRecruitment();assert.equal(s.recruitment.length,1);s.armies[0].f=0;t.tickRecruitment();assert.equal(s.recruitment.length,0);
  s=fresh();t.recruit(0,0,'inf');t.capture(1,0);assert.equal(s.recruitment.length,0);t.capture(0,0);s.turn+=2;t.tickRecruitment();assert.equal(s.recruitment.length,0);
  s=fresh();t.recruit(0,0,'inf');t.eliminate(0,1,0);assert.equal(s.recruitment.length,0);
  // Improve relations: exact price/gain, per-target limit, next season and save persistence.
  s=fresh();let gold=s.fac[0].gold,rel=s.rel['0-1'];assert(t.improveRelations(0,1));assert.equal(s.fac[0].gold,gold-10);assert.equal(rel.score,10);assert(!t.improveRelations(0,1));assert(t.improveRelations(0,2));
  t.start({S:JSON.parse(JSON.stringify(s))});s=t.S;assert(!t.improveRelations(0,1));s.turn++;assert(t.improveRelations(0,1));s.rel['0-1'].score=99;s.turn++;assert(t.improveRelations(0,1));assert.equal(s.rel['0-1'].score,100);assert(!t.canImproveRelations(0,1));
  t.declareWar(0,1);assert(!t.improveRelations(0,1));s.fac[0].gold=9;assert(!t.improveRelations(0,2));
  // Independent trade: goodwill, income, blockades, end pact, protector war and conquest.
  s=fresh();const c=s.cities.find(c=>t.landRoute(t.capitalOf(0),c.p));assert(c);assert(!t.cityTrade(0,c));assert(t.improveRelations(0,c,true));assert.equal(c.rel[0],10);assert(!t.improveRelations(0,c,true));assert(t.cityGift(0,c));assert(t.cityTrade(0,c));assert(!t.cityTrade(0,c));
  let route=t.routes().find(r=>r.a===0&&r.city===c.p);assert(route);const openIncome=t.tradeIncome(0);assert(openIncome>=2&&openIncome<=6);assert(t.realmPanel().includes(c.name));assert(t.diploPanel().includes('Trade pact'));
  const raider=s.armies.find(a=>a.f===1);raider.p=c.p;t.declareWar(1,0);assert(t.routes().find(r=>r.a===0&&r.city===c.p).blocked);assert.equal(t.tradeIncome(0),0);
  t.makePeace(0,1);assert.equal(t.tradeIncome(0),openIncome);assert(t.endCityTrade(0,c));assert.equal(t.tradeIncome(0),0);c.rel[0]=40;assert(t.cityTrade(0,c));c.patron=1;t.declareWar(0,1);assert(!t.routes().some(r=>r.a===0&&r.city===c.p));assert(!t.improveRelations(0,c,true));
  t.makePeace(0,1);assert.equal(t.tradeIncome(0),openIncome);c.patron=null;assert(t.cityWar(0,c));assert(!c.trade[0]);assert(!t.cityTrade(0,c));c.war[0]=false;c.rel[0]=40;t.cityTrade(0,c);t.takeCity(0,c.p);assert(!c.trade.some(Boolean));assert(!t.routes().some(r=>r.city===c.p));
  // Old saves migrate safely without resetting current armies.
  s=fresh();delete s.recruitment;for(const c of s.cities){delete c.trade;delete c.improved}const units=s.armies[0].u.inf;t.start({S:JSON.parse(JSON.stringify(s))});assert.equal(t.S.armies[0].u.inf,units);assert.equal(t.S.recruitment.length,0);assert(t.S.cities.every(c=>c.trade.length===6));
  console.log('Campaign options: training durations/costs/arrival/site loss/save migration, envoys/cooldowns/war, city trade/income/blockades/protection/conquest pass.');
})().catch(e=>{console.error(e);process.exitCode=1});
