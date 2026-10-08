// Headless campaigns: node tools/sim.js <mode> [games] [difficulty]
//   mode "check": play games with an AI in Prussia's seat, report errors and outcomes
//   mode "train": self-play to evolve rival brains, writes game/brains.json
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'game/musket-crown.html'),'utf8');
let js=html.split('<script>')[1].split('</script>')[0];
js=js.replace('/*__TEST__*/','globalThis.__t={get S(){return S},set S(v){S=v},get M(){return M},set M(v){M=v},UI,newGame,endTurn,aiTurn,answer,willing,fitness,learnFromGame,pickGenome,owned,land};UI.headless=true;');
const noop=new Proxy(function(){},{get:(t,k)=>k==='measureText'?()=>({width:1}):noop,apply:()=>noop});
const els={};const el=id=>els[id]||(els[id]={id,innerHTML:'',textContent:'',hidden:true,style:{},dataset:{},disabled:false,clientWidth:400,value:'gold',addEventListener(){},getContext:()=>noop,getBoundingClientRect:()=>({left:0,top:0})});
const store={};
global.document={getElementById:el,addEventListener(){},createElement:()=>el('x'+Math.random())};
global.window={};global.location={hash:"",protocol:"file:"};global.innerWidth=400;global.innerHeight=800;global.devicePixelRatio=1;global.addEventListener=()=>{};global.requestAnimationFrame=()=>{};global.performance={now:()=>Date.now()};
global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
global.setTimeout=()=>0;
eval(js);
const t=globalThis.__t;
const [mode='check',N='10',diff='normal']=process.argv.slice(2);
async function play(d,maxTurns=+(process.env.TURNS||120)){
  t.UI.headless=true;t.newGame(d,(Math.random()*6)|0);const S=t.S;
  S.fac[0].strat='militarist';S.fac[0].genome={agg:1,spend:1,fort:1,expand:1,trade:1};S.fac[0].ai=false;
  while(!S.over&&S.turn<maxTurns){
    while(S.inbox.length){const m=S.inbox[0];t.answer(0,m.type==='tribute'?false:m.type==='join'||t.willing(0,m.from,m.type))}
    await t.aiTurn(0);t.S.sel=null;await t.endTurn();
  }
  return S;
}
(async()=>{
  const res={win:0,loss:0,draw:0,err:0,turns:[],ranks:[],shares:[]};
  for(let g=0;g<+N;g++){
    try{
      const S=await play(diff);
      const line=S.fac.map(F=>`${F.name}${F.alive?'':'†'} ${t.owned(F.id)}p`).join(' | ');
      if(mode==='check')console.log(`game ${g}: ${S.fac[0].name} turn ${S.turn} ${S.over?(S.over.win?'PLAYER WINS':'player falls'):'unfinished'} | ${line} | cities ${S.cities.map(c=>S.prov[c.p].o??(c.patron!=null?'p'+c.patron:'free')).join(',')} | gens ${S.armies.filter(a=>a.gen).length}`);
      if(!S.over)t.learnFromGame('abandoned');
      res[S.over?(S.over.win?'win':'loss'):'draw']++;res.turns.push(S.turn);
      const lands=S.fac.map(F=>t.owned(F.id)),mine=lands[0],tot=lands.reduce((a,b)=>a+b,0)||1;res.ranks.push(S.fac[0].alive?1+lands.filter(x=>x>mine).length:6);res.shares.push(mine/tot);
    }catch(e){res.err++;console.log('ERR',e.stack.split('\n').slice(0,5).join(' | '))}
  }
  const M=t.M;
  const avg=a=>a.reduce((x,y)=>x+y,0)/(a.length||1);
  console.log(JSON.stringify({diff,...res,turns:undefined,ranks:undefined,shares:undefined,survive:Math.round((res.win+res.draw)/(+N)*100)+'%',avgRank:+avg(res.ranks).toFixed(2),avgShare:Math.round(avg(res.shares)*100)+'%',avgTurn:Math.round(res.turns.reduce((a,b)=>a+b,0)/(res.turns.length||1)),gen:M.gen,best:M.pop[0]}));
  if(mode==='train')fs.writeFileSync(path.join(root,'game/brains.json'),JSON.stringify(M.pop.slice(0,8).map(p=>({g:p.g,fit:p.fit}))));
})();
