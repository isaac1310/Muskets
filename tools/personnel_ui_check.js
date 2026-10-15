// Behaviour checks for campaign help, recovery, service history, and battle explanations.
const fs=require('fs'),assert=require('assert'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..'),handlers={},docHandlers={},elementHandlers={},els={},storage={};
const noop=new Proxy(function(){},{get:(_,k)=>k==='measureText'?()=>({width:40}):noop,apply:()=>noop});
const el=id=>els[id]||(els[id]={id,innerHTML:'',textContent:'',hidden:true,style:{},dataset:{},disabled:false,clientWidth:400,clientHeight:700,value:'gold',classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(n,f){elementHandlers[id+'-'+n]=f},getContext:()=>noop,getBoundingClientRect:()=>({left:0,top:0})});
const ctx={console,Math,Date,Set,Map,Promise,Uint8Array,Blob,URL,atob,setTimeout:()=>0,clearTimeout(){},clearInterval(){},setInterval:()=>0,document:{getElementById:el,createElement:()=>el('generated'+Math.random()),addEventListener:(n,f)=>{(docHandlers[n]||(docHandlers[n]=[])).push(f);handlers[n]=f}},window:{},location:{hash:'',protocol:'file:'},innerWidth:400,innerHeight:800,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},performance:{now:()=>Date.now()},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]}};
let src=fs.readFileSync(path.join(root,'game/script.js'),'utf8').replace('/*__BATTLE__*/',fs.readFileSync(path.join(root,'game/battle.js'),'utf8')).replace('/*__SOUND__*/',fs.readFileSync(path.join(root,'game/sound.part.js'),'utf8'));
src=src.replace('/*__TEST__*/',`globalThis.test={newGame,zeroU,makeBattle,sizeBattle,setBattleExpanded,chooseWallPoint,segPoint,renderBattleUI,personnelPanel,uniformStyle,drawUniformDetails,kill,stepBattle,get S(){return S},get BV(){return BV},set BV(v){BV=v},UI};UI.headless=true;`);
vm.createContext(ctx);vm.runInContext(src,ctx);const t=ctx.test;
const click=async(act,extra={})=>handlers.click({target:{closest:()=>({dataset:{act,...extra}})}});

(async()=>{
 t.newGame('normal',0);const B=t.makeBattle({att:{...t.zeroU(),inf:2,cav:1,art:1},def:{...t.zeroU(),inf:2},terrain:'plains'});B.player=0;
 const banners=[],v={B,o:{af:0,df:1},ps:0,sel:[],paused:true,speed:1};B.fx={banner:s=>banners.push(s)};t.BV=v;
 await click('bselg',{g:'foot'});assert.equal(v.sel.length,2);assert.equal(els.bctl.scrollTop,0);assert(els.bctl.innerHTML.includes('Target key personnel'));
 for(const role of ['drum','sergeant','general']){await click('bpersonnel',{v:role});assert(v.sel.every(r=>r.focusMan?.role===role));assert(els.bpersonnelstatus.textContent.includes(role==='drum'?'Drummer':role==='sergeant'?'Sergeant':'General'));assert(banners.at(-1).includes(role==='drum'?'drum':role))}
 await click('bo',{g:'sel-foot',v:'stand'});assert(v.sel.every(r=>!r.focusMan&&!r.forced));
 await click('bpersonnel',{v:'drum'});await click('bpersonnel',{v:'clear'});assert(v.sel.every(r=>!r.focusMan&&!r.forced));
 await click('bselg',{g:'guns'});await click('bpersonnel',{v:'general'});assert(v.sel.every(r=>r.ord==='fire'&&r.focusMan.role==='general'));
 await click('bselg',{g:'horse'});await click('bpersonnel',{v:'sergeant'});assert(v.sel.every(r=>r.ord==='shoot'&&r.focusMan.role==='sergeant'));
 const names=['Prussia','Britain','France','Austria','Russia','Sweden','Free City'],palettes=names.map(name=>t.uniformStyle({name}));assert.equal(new Set(palettes.map(p=>JSON.stringify(p))).size,7);
 assert.equal(t.uniformStyle({name:'Sweden'}),palettes[5],'Reuse the palette instead of allocating per figure');
 for(const name of names)for(const role of ['','sergeant','drum','general']){let saves=0,painted=0;const c=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:k==='save'?()=>saves++:k==='restore'?()=>saves--:()=>painted++});t.drawUniformDetails(c,{role},{type:role==='general'?'gen':'inf'},{name,col:'#123'},-9,12,6);assert.equal(saves,0);assert(painted>20)}
 const W=t.makeBattle({att:{...t.zeroU(),inf:2},def:{...t.zeroU(),inf:2,mil:1,cav:1},fortKind:'fort',terrain:'plains'});W.player=1;W.fx={banner:s=>banners.push(s)};
 const w={B:W,o:{af:1,df:0},ps:1,sel:[],paused:true,speed:1};t.BV=w;t.renderBattleUI(w);assert(els.bctl.innerHTML.includes('Garrison walls'));assert(!els.bwall.disabled);
 await click('bwall');assert.equal(w.sel.length,3);assert.equal(new Set(w.sel.map(r=>r.wallPost)).size,3);assert(w.sel.every(r=>r.ord==='garrison'));assert(els.bwall.textContent.includes('Reassign'));
 await click('bo',{g:'sel-foot',v:'stand'});assert(w.sel.every(r=>r.wallPost==null));
 await click('bwall');await click('bclear');assert(w.sel.every(r=>r.wallPost==null));
 await click('bwall');await click('bpersonnel',{v:'drum'});assert(w.sel.every(r=>r.wallPost==null&&r.focusMan));
 await click('bselg',{g:'horse'});assert(els.bwall.disabled);await click('bwall');assert(W.regs.filter(r=>r.type==='cav').every(r=>r.wallPost==null));
 w.ps=0;w.sel=[];t.renderBattleUI(w);assert(!els.bctl.innerHTML.includes('id="bwall"'));
 t.BV=v;t.renderBattleUI(v);assert(!els.bctl.innerHTML.includes('id="bwall"'));
 const A=t.makeBattle({att:{...t.zeroU(),inf:2,art:2,how:1},def:{...t.zeroU(),inf:2},fortKind:'capital',terrain:'plains'});A.player=0;A.fx={banner:s=>banners.push(s)};
 const a={B:A,o:{af:0,df:1},ps:0,sel:[],paused:true,speed:1};t.BV=a;t.renderBattleUI(a);assert(els.bctl.innerHTML.includes('Target wall point…'));
 await click('bwallpoint');assert(a.wallAimMode);assert(!t.chooseWallPoint(a,200,450));assert(a.wallAimMode,'Miss keeps the target picker active');
 const point=t.segPoint(A,4);assert(t.chooseWallPoint(a,point.x,point.y));assert(!a.wallAimMode);assert(a.sel.length);assert(a.sel.every(r=>['art','how'].includes(r.type)&&r.wallTarget===4));assert(els.bsiegestatus.textContent.includes('Section 5'));
 A.seg[4]=0;t.renderBattleUI(a);assert(els.bsiegestatus.textContent.includes('breached'));await click('bo',{g:'sel-guns',v:'fire'});assert(a.sel.every(r=>r.wallTarget==null));
 await click('bwallpoint');await click('bmove');assert(!a.wallAimMode&&a.moveMode);
 await click('bselg',{g:'foot'});assert(els.bwallpoint.disabled);assert(!t.chooseWallPoint(a,point.x-40,point.y));
 a.ps=1;a.sel=[];t.renderBattleUI(a);assert(!els.bctl.innerHTML.includes('id="bwallpoint"'));
 ctx.innerWidth=1440;ctx.innerHeight=900;els.bcv.parentElement={clientWidth:1400,clientHeight:650};t.BV=a;a.manual={z:2,x:200,y:300};const originalCamera=JSON.stringify(a.manual);t.sizeBattle(a);const narrow=els.bcv.width;
 await click('bexpand');assert(a.expanded);assert(els.bcv.width>narrow*3);assert.equal(a.ground.width,narrow,'Expanded viewport keeps terrain texture dimensions separate');assert.equal(els.bexpand.textContent,'Restore view');
 await click('borders');assert(a.ordersOpen);await click('borders');assert(!a.ordersOpen);
 ctx.innerWidth=500;t.sizeBattle(a);assert.equal(Math.round(a.viewW),400,'Mobile retains fitted battlefield');ctx.innerWidth=1440;t.sizeBattle(a);assert(a.viewW>400);
 await click('bexpand');assert(!a.expanded);assert.equal(els.bcv.width,narrow);assert.equal(JSON.stringify(a.manual),originalCamera,'Restoring view restores the camera');
 console.log('Expanded view: wider desktop canvas, independent terrain, order drawer, mobile fallback and restored camera pass.');
 console.log('Siege targeting UI: all guns, selected eligibility, missed clicks, chosen section, breach status and replacement orders pass.');
 console.log('Wall UI: defender-only command, all/selected infantry, cavalry exclusion, and combat/clear/personnel cancellation pass.');
 console.log('Personnel UI: real group/role/normal/order clicks, infantry/cavalry/artillery commands, panel visibility and seven distinct cached uniform styles pass.');
})().catch(e=>{console.error(e);process.exitCode=1});
