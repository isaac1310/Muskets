// Headless campaigns: node tools/sim.js <mode> [games] [difficulty]
//   mode "check": play games with an AI in Prussia's seat, report errors and outcomes
//   mode "train": self-play to evolve rival brains, writes game/brains.json
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'game/musket-crown.html'),'utf8');
let js=html.split('<script>')[1].split('</script>')[0];
js=js.replace('/*__TEST__*/','globalThis.__t={get S(){return S},set S(v){S=v},get M(){return M},set M(v){M=v},UI,startBattleArt,get queuedArt(){return battleArtQueue.length},newGame,endTurn,aiTurn,answer,willing,fitness,learnFromGame,pickGenome,owned,land};UI.headless=true;');
const noop=new Proxy(function(){},{get:(t,k)=>k==='measureText'?()=>({width:1}):noop,apply:()=>noop});
const els={};const el=id=>els[id]||(els[id]={id,innerHTML:'',textContent:'',hidden:true,style:{},dataset:{},disabled:false,clientWidth:400,value:'gold',addEventListener(){},getContext:()=>noop,getBoundingClientRect:()=>({left:0,top:0})});
const store={};
global.document={getElementById:el,addEventListener(){},createElement:()=>el('x'+Math.random())};
global.window={};global.location={hash:"",protocol:"file:"};global.innerWidth=400;global.innerHeight=800;global.devicePixelRatio=1;global.addEventListener=()=>{};global.requestAnimationFrame=()=>{};global.performance={now:()=>Date.now()};
global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
global.setTimeout=()=>0;

const assert=require('assert');let loads=0;
global.Image=class{constructor(){this.complete=false;this.naturalWidth=0}set src(v){this.uri=v;loads++}get src(){return this.uri}};
global.innerWidth=3840;global.innerHeight=2160;global.devicePixelRatio=3;
eval(js);
assert.strictEqual(loads,1,'Opening should load only the home painting');
assert(globalThis.__t.queuedArt>100,'Battle art should be deferred');
assert(els.homecv.width*els.homecv.height<=2000000,'Home canvas exceeded memory budget');
globalThis.__t.startBattleArt();assert.strictEqual(loads,5,'Only four battle images should load concurrently');
globalThis.__t.startBattleArt();assert.strictEqual(loads,5,'Repeated start must not duplicate decodes');
console.log('Startup: one painting, deferred battlefield assets, four concurrent loads, and 2MP canvas cap pass.');
