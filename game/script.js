(()=>{
"use strict";
/* ============ rules ============ */
const MW=14,MH=16,NN=6,CITYF=6;
const SEASONS=['Spring','Summer','Autumn','Winter'];
const TER={plains:{n:'Plains',def:1,c:'#b7b07c',gold:1.2},forest:{n:'Forest',def:1.2,c:'#72845a',gold:.8},hills:{n:'Hills',def:1.3,c:'#a98c62',gold:1},water:{n:'Lake',def:1,c:'#6f8ea2',gold:0}};
const SIZEN=['','Small','Middling','Large'];
const BLD={
  farm:{n:'Farm',cost:20,on:['plains'],d:'3 gold + size, +2 by a river, half in winter',gold:(sz,t,w)=>((3+sz)+(t.r?2:0))*(w?.5:1)},
  sawmill:{n:'Sawmill',cost:20,on:['forest'],d:'2 gold + size',gold:sz=>2+sz},
  mine:{n:'Iron mine',cost:30,on:['hills'],d:'3 gold + size',gold:sz=>3+sz},
  market:{n:'Market',cost:45,on:['plains','hills'],d:'3 gold + size, and more from trade roads',gold:sz=>3+sz},
  house:{n:'Houses',cost:20,on:['plains','forest'],d:'Room for 6 people; raise cheap militia for gold and popularity',gold:()=>0},
  church:{n:'Church',cost:50,on:['plains','hills'],d:'+3 popularity a season',gold:()=>0},
  barracks:{n:'Barracks',cost:55,on:['plains','forest','hills'],d:'Train line infantry; level 2 adds dragoons',gold:()=>0},
  foundry:{n:'Cannon foundry',cost:80,on:['plains','hills'],d:'Cast field guns; level 2 adds howitzers',gold:()=>0},
  palisade:{n:'Wooden fort',cost:35,on:['plains','forest','hills'],d:'A timber palisade and 1 gun. Defence ×1.3',gold:()=>0},
  fort:{n:'Stone star fort',cost:90,on:['plains','forest','hills'],d:'Stone bastions, a ditch and 2 guns. Defence ×1.6',gold:()=>0},
};
const UT=['mil','inf','cav','hus','art','how'];
const zeroU=()=>({mil:0,inf:0,cav:0,hus:0,art:0,how:0});
const UNIT={
  mil:{n:'Militia',s:'Militia',cost:3,popularity:2,up:.15,at:['capital','house','town','village','city'],d:'Civilian levy. Costs 2 popularity; fragile under fire'},
  inf:{n:'Line infantry',s:'Infantry',cost:10,up:.3,at:['capital','barracks','town'],d:'Volleys and bayonets. Braced lines resist frontal horse attacks'},
  cav:{n:'Dragoons',s:'Dragoons',cost:20,up:.5,at:['barracks'],d:'Charge or shoot carbines. Ride down guns'},
  hus:{n:'Russian hussars',s:'Hussars',cost:30,up:1,at:[],d:'Mercenary light horse. Fast, deadly to guns'},
  art:{n:'Field guns',s:'Guns',cost:26,up:.5,at:['foundry'],d:'Roundshot and canister beat infantry'},
  how:{n:'Howitzers',s:'Howitzers',cost:32,up:.6,at:['foundry'],d:'Travel on a wagon, deploy to fire. Shells wreck walls'},
};
const BUILD_TIME={farm:1,sawmill:1,mine:2,market:2,house:1,church:2,barracks:2,foundry:3,palisade:1,fort:3};
const TRAINING={mil:1,inf:2,cav:3,art:3,how:4};
const BASE={mil:1.8,inf:3,cav:4,hus:4.5,art:4,how:3.5};
const BEATS={mil:[],inf:['cav','hus','mil'],cav:['art','how','mil'],hus:['art','how','mil'],art:['inf','mil'],how:['mil']};
const BEATEN={mil:['inf','art','cav','hus'],inf:['art'],cav:['inf'],hus:['inf'],art:['cav','hus'],how:['cav','hus']};
const TAXG=[0,.3,.55,.85],TAXP=[4,2,0,-5],TAXN=['None','Low','Fair','Harsh'];
const NATIONS=[
  {name:'Prussia',col:'#2a4a8c',col2:'#152a57',coat:'#223a6e',facing:'#c9a55c',txt:'#fff',court:'Court of Berlin',
   ruler:{n:'Frederick II',t:'King in Prussia',coat:'#223a6e',sash:'#e0892b',trim:'#c9a55c',wig:'queue'},gens:['Schwerin','Zieten','Seydlitz','Keith','Leopold of Dessau']},
  {name:'Britain',col:'#b8372c',col2:'#7a1f18',coat:'#b3261e',facing:'#2b4c9b',txt:'#fff',court:'Court of St James',
   ruler:{n:'George II',t:'King of Great Britain',coat:'#9b2a22',sash:'#2b4c9b',trim:'#d9b45a',wig:'queue'},gens:['Cumberland','Ligonier','Wolfe','Granby','Stair']},
  {name:'France',col:'#7fb2e0',col2:'#3f74a8',coat:'#8fb9e2',facing:'#b3261e',txt:'#10202e',court:'Court of Versailles',
   ruler:{n:'Louis XV',t:'King of France',coat:'#27336b',sash:'#5b8fd6',trim:'#d9b45a',wig:'full'},gens:['Saxe','Belle-Isle','Broglie','Soubise','Chevert']},
  {name:'Austria',col:'#9a9ea6',col2:'#5d6168',coat:'#e2e1db',facing:'#b3261e',txt:'#16181c',court:'Court of Vienna',
   ruler:{n:'Maria Theresa',t:'Queen of Hungary and Bohemia, Archduchess of Austria',gown:'#d9d4c6',sash:'#b3261e',trim:'#d9b45a',female:true},gens:['Daun','Browne','Laudon','Lacy','Khevenhüller']},
  {name:'Russia',col:'#3f7a3a',col2:'#24491f',coat:'#2f5e2c',facing:'#b3261e',txt:'#fff',court:'Court of St Petersburg',
   ruler:{n:'Elizabeth',t:'Empress of All the Russias',gown:'#c9b27a',sash:'#3a7bd5',trim:'#e0c46a',female:true,crown:true},gens:['Saltykov','Apraksin','Fermor','Rumyantsev','Münnich']},
  {name:'Sweden',col:'#e2b53a',col2:'#2a5aa8',coat:'#2a5aa8',facing:'#e2b53a',txt:'#16223a',court:'Court of Stockholm',
   ruler:{n:'Frederick I',t:'King of Sweden',coat:'#2a5aa8',sash:'#7fb2e0',trim:'#e2b53a',wig:'full'},gens:['Lewenhaupt','Buddenbrock','Ehrensvärd','Lantingshausen','Hamilton']},
];
const REALISTIC_ART=/*__REALISTIC_ART__*/null;
const PORTRAIT_IMAGES=REALISTIC_ART?REALISTIC_ART.portraits.map(uri=>{
  const bytes=Uint8Array.from(atob(uri.slice(uri.indexOf(',')+1)),c=>c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));
}):null;
const CITYNAT={name:'Free City',col:'#8a5a32',col2:'#5a3a1e',coat:'#6b4a2e',facing:'#e8e0cc',txt:'#fff'};
const SLOTS=[[7.2,5.6],[1.8,2.4],[2.3,11.6],[9,13.2],[12.4,7],[9.9,1.7]];
const CITY_NAMES=['Danzig','Hamburg','Nuremberg','Lübeck','Bremen','Augsburg'];
const PLACES=['Mollwitz','Chotusitz','Hohenfriedberg','Soor','Kesselsdorf','Lobositz','Kolin','Rossbach','Leuthen','Zorndorf','Hochkirch','Kunersdorf','Minden','Torgau','Liegnitz','Fontenoy','Dettingen','Lauffeld','Krefeld','Bergen','Warburg','Prague','Breslau','Olmütz','Freiberg','Reichenberg','Maxen','Landeshut','Striegau','Burkersdorf','Glatz','Schweidnitz','Neisse','Brieg','Oppeln','Glogau','Crossen','Frankfurt','Küstrin','Stettin','Colberg','Magdeburg','Halle','Leipzig','Dresden','Pirna','Bautzen','Görlitz','Zittau','Kassel','Münster','Wesel','Cleves','Ansbach','Bayreuth','Erfurt','Weimar','Gotha','Fulda','Marburg','Hanau','Mainz','Trier','Worms','Aachen','Bonn','Koblenz','Mannheim','Heidelberg','Speyer','Ulm','Regensburg','Passau','Linz','Brünn','Pressburg','Kaschau','Ofen','Pest','Temesvar','Graz','Laibach','Innsbruck','Salzburg','Eger','Pilsen','Budweis','Königgrätz','Pardubitz','Tabor','Iglau','Troppau','Teschen','Krakau','Posen','Thorn','Elbing','Königsberg','Memel','Tilsit','Riga','Reval','Narva','Pskov','Smolensk','Stralsund','Wismar','Rostock','Schwerin','Lüneburg','Celle','Hanover','Brunswick','Hildesheim','Göttingen','Paderborn','Osnabrück','Emden','Lille','Namur','Liège','Maastricht','Dunkirk','Metz','Nancy','Strasbourg','Colmar','Besançon','Dijon','Reims','Verdun','Sedan','Arras','Ypres','Tournai','Mons','Ostend','Bruges','Ghent','Antwerp','Uppsala','Göteborg','Kalmar','Karlskrona','Malmö','Åbo','Viborg'];
const STRATS={
  militarist:{n:'Militarist',spend:.8,garrison:3,war:1.3,mix:{mil:.05,inf:.4,cav:.3,hus:0,art:.15,how:.1}},
  economist:{n:'Merchant',spend:.4,garrison:3,war:2,mix:{mil:.15,inf:.45,cav:.2,hus:0,art:.15,how:.05}},
  turtle:{n:'Fortifier',spend:.6,garrison:6,war:2.2,mix:{mil:.15,inf:.4,cav:.1,hus:0,art:.25,how:.1}},
  diplomat:{n:'Diplomat',spend:.5,garrison:4,war:2.5,mix:{mil:.1,inf:.45,cav:.25,hus:0,art:.15,how:.05}},
};
const DIFF={
  easy:{n:'Cadet',d:'Rivals arm slowly, avoid war until 1744 and make peace readily. Their brains are raw recruits.',inc:.75,warFrom:16,war:1.5,spend:.7,start:.8,pBonus:60,peace:15,garrison:0,brain:'raw'},
  normal:{n:'Colonel',d:'A fair fight. Rivals attack once they are clearly stronger, using brains that keep evolving.',inc:1,warFrom:6,war:1,spend:1,start:1,pBonus:0,peace:0,garrison:0,brain:'evolve'},
  hard:{n:'Field Marshal',d:'Rivals out-earn you, strike from 1740 and play their best evolved brains.',inc:1.25,warFrom:3,war:.85,spend:1.15,start:1.25,pBonus:0,peace:-15,garrison:2,brain:'elite'},
};
const GENES=['agg','spend','fort','expand','trade'];
const GENEN={agg:'Aggression',spend:'War spending',fort:'Fortifying',expand:'Expansion',trade:'Commerce'};
const GEN_COST=60,TOWN_COST=60,TRUCE_LEN=4;
const OPENINGS={
  balanced:{n:'Combined arms',d:'4 infantry, 1 dragoon, 1 militia · 120 gold. A flexible force; marches one province per season.',gold:120,u:{mil:1,inf:4,cav:1,hus:0,art:0,how:0}},
  mounted:{n:'Cavalry column',d:'3 dragoons · 125 gold. March two provinces while all mounted; no infantry to hold the line and vulnerable to enemy infantry.',gold:125,u:{mil:0,inf:0,cav:3,hus:0,art:0,how:0}},
  battery:{n:'Gun train',d:'4 infantry, 1 militia, 2 field guns · 88 gold. Early bombardment; no cavalry to pursue or reach enemy guns.',gold:88,u:{mil:1,inf:4,cav:0,hus:0,art:2,how:0}}
};
/*__DEFAULT_POP__*/const DEFAULT_POP=[];

/* ============ storage (optional, never required) ============ */
const MKEY='musket-crown-memory-v2',SKEY='musket-crown-save-v4',PKEY='musket-crown-prefs-v1';
function load(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}}
function store(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function freshMemory(){return{games:0,aiWins:0,playerWins:0,gen:0,mix:{mil:.1,inf:.4,cav:.25,hus:0,art:.2,how:.05},firstWar:[],treaties:0,betrayals:0,
  strat:Object.fromEntries(Object.keys(STRATS).map(k=>[k,{n:0,score:0}])),pop:DEFAULT_POP.map(x=>({g:{...x.g},fit:x.fit,n:1}))}}
let M=load(MKEY)||freshMemory();for(const t of UT)if(M.mix[t]==null)M.mix[t]=0;
const PREFS=Object.assign({watch:'all',sound:true,speed:1,musicVol:65,effectsVol:75},load(PKEY)||{});
if(PREFS.battlePaceVersion!==2){PREFS.speed=1;PREFS.battlePaceVersion=2;store(PKEY,PREFS)}

/* ============ helpers ============ */
let S=null,G=null;
const UI={tab:'tile',half:false,confirm:null,busy:false,headless:false,zoom:1,pick:{nat:0,diff:'normal',opening:'balanced'}};
const Dz=()=>DIFF[S.diff]||DIFF.normal;
const NF=f=>f===CITYF?CITYNAT:NATIONS[S.order[f]];
const T=p=>S.prov[p];
const nbrs=p=>G.nb[p];
const hop=(a,b)=>G.hop[a][b];
const armyAt=p=>S.armies.find(a=>a.p===p);
const cnt=u=>u.mil+u.inf+u.cav+u.hus+u.art+u.how;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rk=(a,b)=>a<b?a+'-'+b:b+'-'+a;
const R=(a,b)=>S.rel[rk(a,b)];
const real=f=>f!=null&&f<NN;
const atWar=(a,b)=>a!==b&&real(a)&&real(b)&&R(a,b).st==='war';
const allied=(a,b)=>a!==b&&real(a)&&real(b)&&R(a,b).st==='alliance';
const season=()=>(S.turn-1)%4,year=()=>1740+Math.floor((S.turn-1)/4);
const dateStr=()=>`${SEASONS[season()]} ${year()}`;
const fname=f=>f===CITYF?'the free city':S.fac[f].name;
const cap1=s=>s.charAt(0).toUpperCase()+s.slice(1);
const addU=(a,b)=>{const o=zeroU();for(const t of UT)o[t]=(a[t]||0)+(b[t]||0);return o};
const owned=f=>S.prov.filter(t=>t.o===f).length;
const land=f=>S.prov.reduce((s,t,i)=>s+(t.o===f?G.size[i]:0),0);
const capitalOf=f=>{const p=S.prov.findIndex(t=>t.o===f&&t.b==='capital');return p>=0?p:(S.fac[f].recovery?.refuge??-1)};
const unitsOf=f=>S.armies.filter(a=>a.f===f).reduce((s,a)=>addU(s,a.u),zeroU());
const anyWar=f=>S.fac.some(F=>F.alive&&atWar(f,F.id));
const cityAt=p=>S.cities.find(c=>c.p===p);
const placeName=p=>{const c=cityAt(p);return c?c.name:S.names[p]};
const lvlOf=g=>g?Math.min(5,1+Math.floor(g.xp/2)):0;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function service(){return{battles:0,wins:0,retreats:0,defences:0,places:[]}}
function armyRecord(a){if(!a.name)a.name=`${fname(a.f)} Army ${a.id}`;return a.record||(a.record=service())}
function generalRecord(a){
  if(!a.gen)return null;S.generalHistory=S.generalHistory||{};const key=a.f+':'+a.gen.name;
  return S.generalHistory[key]||(S.generalHistory[key]={...service(),name:a.gen.name,f:a.f,status:'Serving',since:S.turn});
}
function archiveArmy(a,status='Disbanded'){
  armyRecord(a);S.armyArchive=S.armyArchive||[];
  S.armyArchive.push({name:a.name,f:a.f,...a.record,status});if(S.armyArchive.length>40)S.armyArchive.shift();
  const g=generalRecord(a);if(g&&g.status==='Serving')g.status=status;
}
function recordEngagement(a,p,won,defended,died){
  if(!a)return;const records=[armyRecord(a),generalRecord(a)].filter(Boolean);
  for(const r of records){r.battles++;if(won)r.wins++;if(!won&&cnt(a.u)>0&&(r===a.record||!died))r.retreats++;if(won&&defended)r.defences++;
    r.places.unshift(`${won?'Victory':'Defeat'} at ${placeName(p)} · ${dateStr()}`);r.places=r.places.slice(0,5)}
  if(died&&a.gen)generalRecord(a).status=`Fell at ${placeName(p)}`;
}
function serviceText(r){return`${r.battles} battles · ${r.wins} victories · ${r.retreats} retreats survived · ${r.defences} successful defences`}
function recruitHere(f,p,type){const t=T(p);if(!t||!UNIT[type])return false;
  if(type==='cav')return t.b==='barracks'&&(t.level||1)>=2;
  if(type==='how')return t.b==='foundry'&&(t.level||1)>=2;
  return UNIT[type].at.includes(t.b)||(S.fac[f].recovery?.refuge===p&&UNIT[type].at.includes('capital'))}
function buildingGold(t,sz,w){return BLD[t.b]?BLD[t.b].gold(sz,t,w)*((t.level||1)>1?1.5:1):0}
function projectAt(p){return(S.construction||[]).find(q=>q.p===p)}
function upgradeInfo(p){const t=T(p);if(t.b==='village')return{b:'town',level:1,cost:TOWN_COST,time:2,d:'More income, housing, infantry and a garrison'};
  if(t.b==='palisade')return{b:'fort',level:1,cost:65,time:3,d:'Stone bastions, stronger walls and two guns'};
  if(!BLD[t.b]||t.b==='fort'||(t.level||1)>=2)return null;
  return{b:t.b,level:2,cost:Math.ceil(BLD[t.b].cost*.65),time:2,d:t.b==='barracks'?'Unlock dragoons':t.b==='foundry'?'Unlock howitzers':t.b==='house'?'Room for 12 people':t.b==='church'?'+6 popularity each season':'+50% building income'};
}
function recoveryText(f){const r=S.fac[f].recovery;return r?`Retake ${placeName(r.p)} within ${r.left} more season${r.left===1?'':'s'}. The court at ${placeName(r.refuge)} can recruit infantry and militia. This crown has one recovery chance per campaign.`:''}
function rememberRelation(a,b,text){const r=R(a,b);r.reasons=r.reasons||[];r.reasons.unshift(`${dateStr()}: ${text}`);r.reasons=r.reasons.slice(0,3)}
function hexA(h,a){const n=parseInt(h.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash(i,k){let h=(i*374761393+k*668265263)|0;h=(h^h>>>13)*1274126177;return((h^h>>>16)>>>0)/4294967296}

/* ============ auto-resolved combat (rival against rival) ============ */
function strength(u,en){
  const E=cnt(en);let p=0;
  for(const t of UT){if(!u[t])continue;let m=1;
    if(E){for(const b of BEATS[t])m+=.6*en[b]/E;for(const b of BEATEN[t])m-=.3*en[b]/E}
    p+=u[t]*BASE[t]*m}
  return p;
}
const GENERIC={mil:1,inf:1,cav:1,hus:1,art:1,how:1};
function armyStr(a){return strength(a.u,GENERIC)*(1+.06*lvlOf(a.gen))}
function armyPower(f){return S.armies.filter(a=>a.f===f).reduce((s,a)=>s+armyStr(a),0)}
function facPower(f){return armyPower(f)+land(f)*.3}
function garrisonOf(t){
  const z=zeroU();
  if(t.b==='fort')return{...z,art:2};if(t.b==='palisade')return{...z,art:1};
  if(t.b==='capital')return{...z,mil:3,art:1};
  if(t.b==='city')return t.o==null?{...z,inf:3,mil:3,art:1}:{...z,mil:2,art:1};
  if(t.b==='town'&&t.o!=null)return{...z,mil:2};
  return null;
}
function wallsOf(t){return t.b==='fort'?'fort':t.b==='palisade'?'palisade':t.b==='capital'||t.b==='city'?'capital':''}
function defMult(p,attU){
  const t=T(p);let m=TER[t.t].def;
  const wall=t.b==='fort'?1.6:t.b==='palisade'?1.3:(t.b==='capital'||t.b==='city')?1.4:t.b==='town'?1.1:1;
  const cut=attU?Math.min(.6,(attU.how||0)*.15):0;
  m*=1+(wall-1)*(1-cut);if(t.r)m*=1.25;return m;
}
function fight(attU,defU,p,am,dm){
  const a=strength(attU,defU)*am*(.85+Math.random()*.3);
  const d=strength(defU,attU)*dm*defMult(p,attU)*(.85+Math.random()*.3);
  const aw=a>d,w=aw?a:d,l=aw?d:a,r=l/(w||1);
  return{aw,attLoss:aw?.45*r:Math.min(1,.55+.45*(1-r)),defLoss:aw?Math.min(1,.55+.45*(1-r)):.45*r};
}
function applyLoss(u,f){
  const lost=zeroU();
  for(const t of UT){const k=f>=.999?u[t]:Math.min(u[t],Math.round(u[t]*f));lost[t]=k;u[t]-=k}
  if(cnt(lost)===0&&f>.2&&cnt(u)>0){const t=UT.reduce((b,t)=>u[t]>u[b]?t:b,'inf');u[t]--;lost[t]++}
  return lost;
}
const lossStr=l=>cnt(l)?UT.filter(t=>l[t]).map(t=>`${l[t]} ${UNIT[t].s.toLowerCase()}`).join(', '):'no one';

/*__BATTLE__*/

/* ============ map: irregular provinces ============ */
function genSites(r,caps){
  const pts=caps.map(c=>({x:c[0],y:c[1],r:1.6}));
  for(let k=0;k<12000&&pts.length<100;k++){
    const p={x:.35+r()*(MW-.7),y:.35+r()*(MH-.7),r:.95+r()*1.05};
    if(pts.every(q=>Math.hypot(q.x-p.x,q.y-p.y)>=(q.r+p.r)/2*1.04))pts.push(p);
  }
  return pts.map(p=>[+p.x.toFixed(3),+p.y.toFixed(3)]);
}
function nearestSite(sites,x,y){let b=0,bd=1e9;for(let i=0;i<sites.length;i++){const d=(sites[i][0]-x)**2+(sites[i][1]-y)**2;if(d<bd){bd=d;b=i}}return b}
function buildGeo(sites,landOf){
  const n=sites.length,polys=[];
  for(let i=0;i<n;i++){
    let poly=[[0,0],[MW,0],[MW,MH],[0,MH]];const[xi,yi]=sites[i];
    for(let j=0;j<n&&poly.length;j++){if(j===i)continue;const[xj,yj]=sites[j];if(Math.abs(xj-xi)>5||Math.abs(yj-yi)>5)continue;
      const dx=xj-xi,dy=yj-yi,mx=(xi+xj)/2,my=(yi+yj)/2,out=[];
      for(let k=0;k<poly.length;k++){const A=poly[k],B=poly[(k+1)%poly.length],fa=(A[0]-mx)*dx+(A[1]-my)*dy,fb=(B[0]-mx)*dx+(B[1]-my)*dy;
        if(fa<=0)out.push(A);if((fa<0&&fb>0)||(fa>0&&fb<0)){const t=fa/(fa-fb);out.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t])}}
      poly=out.filter((P,k)=>{const Q=out[(k+1)%out.length];return Math.hypot(P[0]-Q[0],P[1]-Q[1])>1e-7})}
    polys.push(poly);
  }
  const onB=(P,i,j)=>{const[xi,yi]=sites[i],[xj,yj]=sites[j],dx=xj-xi,dy=yj-yi;return Math.abs(((P[0]-(xi+xj)/2)*dx+(P[1]-(yi+yj)/2)*dy)/Math.hypot(dx,dy))<1e-6};
  const edgeCache={},nb=[...Array(n)].map(()=>[]),outline=[],edges=[],area=[],c=[];
  for(let i=0;i<n;i++){
    const poly=polys[i],out=[],eds=[];
    for(let k=0;k<poly.length;k++){const A=poly[k],B=poly[(k+1)%poly.length];
      let j=-1;for(let q=0;q<n;q++)if(q!==i&&Math.abs(sites[q][0]-sites[i][0])<5&&Math.abs(sites[q][1]-sites[i][1])<5&&onB(A,i,q)&&onB(B,i,q)){j=q;break}
      let pts;
      if(j<0)pts=[A,B];
      else{
        const key=i<j?i+'-'+j:j+'-'+i,len=Math.hypot(B[0]-A[0],B[1]-A[1]);
        if(len>.06&&!nb[i].includes(j))nb[i].push(j);
        const canon=(A[0]<B[0]-1e-9||(Math.abs(A[0]-B[0])<1e-9&&A[1]<B[1]));
        if(!edgeCache[key]){const P=canon?A:B,Q=canon?B:A,px=-(Q[1]-P[1])/len,py=(Q[0]-P[0])/len,amp=Math.min(.14,len*.12),hk=(Math.min(i,j)*131+Math.max(i,j)*7919)|0,list=[P];
          for(let s=1;s<6;s++){const t=s/6,o=amp*(hash(hk,s)*2-1)*Math.sin(Math.PI*t);list.push([P[0]+(Q[0]-P[0])*t+px*o,P[1]+(Q[1]-P[1])*t+py*o])}
          list.push(Q);edgeCache[key]=list}
        pts=canon?edgeCache[key]:edgeCache[key].slice().reverse();
      }
      eds.push({j,pts});for(let s=0;s<pts.length-1;s++)out.push(pts[s]);
    }
    outline.push(out);edges.push(eds);
    let A2=0,cx=0,cy=0;for(let k=0;k<poly.length;k++){const[x0,y0]=poly[k],[x1,y1]=poly[(k+1)%poly.length],f=x0*y1-x1*y0;A2+=f;cx+=(x0+x1)*f;cy+=(y0+y1)*f}
    area.push(Math.abs(A2/2));c.push(A2?[cx/(3*A2),cy/(3*A2)]:[...sites[i]]);
  }
  for(let i=0;i<n;i++)nb[i]=nb[i].filter(j=>nb[j].includes(i));
  const hopM=[];
  for(let i=0;i<n;i++){const d=new Array(n).fill(99);if(landOf&&!landOf[i]){hopM.push(d);continue}d[i]=0;const q=[i];
    while(q.length){const x=q.shift();for(const y of nb[x]){if(d[y]<99||(landOf&&!landOf[y]))continue;d[y]=d[x]+1;q.push(y)}}hopM.push(d)}
  const landA=area.filter((a,i)=>!landOf||landOf[i]),mean=landA.reduce((s,a)=>s+a,0)/(landA.length||1);
  const size=area.map(a=>a<mean*.78?1:a>mean*1.28?3:2);
  const marks=[];
  for(let i=0;i<n;i++){const r=rng(i*7717+13),m=[],o=outline[i];let x0=9e9,x1=-9e9,y0=9e9,y1=-9e9;for(const[x,y]of o){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
    const want=Math.round(area[i]*5);for(let k=0;k<want*6&&m.length<want;k++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0);if(nearestSite(sites,x,y)===i&&Math.hypot(x-c[i][0],y-c[i][1])>.3)m.push([x,y])}marks.push(m)}
  const touchTop=edges.map(e=>e.some(ed=>ed.j<0&&ed.pts.every(P=>P[1]<1e-6))),touchBot=edges.map(e=>e.some(ed=>ed.j<0&&ed.pts.every(P=>P[1]>MH-1e-6)));
  return{n,sites,outline,edges,nb,hop:hopM,area,c,size,marks,touchTop,touchBot};
}
function genMap(seed){
  const r=rng(seed),slots=SLOTS.map(([x,y])=>[+(x+(r()-.5)*1.2).toFixed(2),+(y+(r()-.5)*1.2).toFixed(2)]);
  for(let i=slots.length-1;i>0;i--){const j=(r()*(i+1))|0;[slots[i],slots[j]]=[slots[j],slots[i]]}
  const sites=genSites(r,slots),G0=buildGeo(sites,null),n=sites.length;
  let t=sites.map(()=>{const v=r();return v<.08?'water':v<.36?'forest':v<.53?'hills':'plains'});
  t=t.map((k,i)=>{if(r()<.55)return k;const c={};G0.nb[i].forEach(j=>c[t[j]]=(c[t[j]]||0)+1);let best=k,bc=0;for(const q in c)if(c[q]>bc){bc=c[q];best=q}return best});
  for(let i=0;i<n;i++)if(t[i]==='water'&&(G0.touchTop[i]||G0.touchBot[i]))t[i]='plains';
  for(let cp=0;cp<NN;cp++){t[cp]='plains';G0.nb[cp].forEach(j=>{if(t[j]==='water')t[j]='plains'});
    const ring=G0.nb[cp];for(const k of['forest','hills'])if(!ring.some(j=>t[j]===k)){const c=ring.filter(j=>t[j]==='plains'&&j>=NN);if(c.length>1)t[c[(r()*c.length)|0]]=k}}
  const G1=buildGeo(sites,t.map(k=>k!=='water'));
  for(let cp=1;cp<NN;cp++)if(G1.hop[0][cp]>=99)return null;
  const rivers=[];
  for(let rv=0;rv<2;rv++){let river=[];
    for(let k=0;k<40&&river.length<7;k++){
      const lo=rv?7.5:2.5,hi=rv?12:6.5,starts=[...Array(n).keys()].filter(i=>G1.touchTop[i]&&t[i]!=='water'&&i>=NN&&G1.c[i][0]>lo&&G1.c[i][0]<hi&&!rivers.flat().includes(i));if(!starts.length)break;
      river=[starts[(r()*starts.length)|0]];
      while(river.length<22&&!G1.touchBot[river[river.length-1]]){const cur=river[river.length-1];
        const opts=G1.nb[cur].filter(j=>!river.includes(j)&&j>=NN&&G1.c[j][1]>G1.c[cur][1]+.2);
        if(!opts.length)break;const w=opts.find(j=>t[j]==='water');if(w!=null){river.push(w);break}
        opts.sort((a,b)=>(G1.c[b][1]-G1.c[a][1])+(r()-.5)*.8);river.push(opts[0])}
    }
    if(river.length>=5)rivers.push(river);
  }
  return{sites,t,rivers,G:G1};
}

/* ============ memory, learning & the evolving brain ============ */
function trust(){const tr=M.treaties+(S?S.pTreat:0),b=M.betrayals+(S?S.pBetray:0);return clamp(1-b*1.5/Math.max(3,tr),0,1)}
function avgFirstWar(){return M.firstWar.length?M.firstWar.reduce((a,b)=>a+b,0)/M.firstWar.length:null}
function earlyAggressor(){const a=avgFirstWar();return a!=null&&a<12}
function playerMix(){const cur=unitsOf(0),made=S.pmix,n=cnt(made)+cnt(cur),prior=4,out={};for(const t of UT)out[t]=((M.mix[t]||0)*prior+made[t]+cur[t])/(prior+n);return out}
function pickStrategy(taken){
  const keys=Object.keys(STRATS),total=keys.reduce((s,k)=>s+M.strat[k].n,0);
  const w=keys.map(k=>{const st=M.strat[k],avg=st.n?st.score/st.n:.5;return Math.max(.05,avg+.35*Math.sqrt(2*Math.log(total+2)/(st.n+1)))*(taken.filter(x=>x===k).length?.5:1)});
  let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<keys.length;i++){r-=w[i];if(r<=0)return keys[i]}return keys[0];
}
const gauss=()=>(Math.random()+Math.random()+Math.random()-1.5)*.8;
function randomGenome(){const g={};for(const k of GENES)g[k]=+(.7+Math.random()*.6).toFixed(3);return g}
function mutate(g,s){const o={};for(const k of GENES)o[k]=+clamp(g[k]*(1+gauss()*s),.4,2).toFixed(3);return o}
function pickGenome(mode){
  const pop=M.pop||[];
  if(mode==='raw'||pop.length<3)return mode==='elite'&&pop.length?{...pop[0].g}:randomGenome();
  if(mode==='elite')return mutate(pop[Math.floor(Math.random()*Math.min(2,pop.length))].g,.04);
  const a=pop[(Math.random()*pop.length)|0],b=pop[(Math.random()*pop.length)|0],c=pop[(Math.random()*pop.length)|0];
  return mutate([a,b,c].sort((x,y)=>y.fit-x.fit)[0].g,.14);
}
function fitness(F){const all=S.prov.filter(t=>t.o!=null).length||1,share=owned(F.id)/all,quick=S.over&&F.alive&&share>.9?Math.max(0,(160-S.turn)/500):0;return+(F.alive?.3+share*.9+quick:share*.3).toFixed(3)}
function learnFromGame(outcome){
  if(S.learned)return;S.learned=true;
  if(outcome==='win')M.playerWins++;else if(outcome==='loss')M.aiWins++;
  if(outcome!=='abandoned'||S.turn>5)M.games++;
  const tot=cnt(S.pmix);if(tot>=3)for(const t of UT)M.mix[t]=(M.mix[t]||0)*.6+.4*S.pmix[t]/tot;
  if(S.firstWar!=null){M.firstWar.push(S.firstWar);M.firstWar=M.firstWar.slice(-6)}
  M.treaties+=S.pTreat;M.betrayals+=S.pBetray;
  S.fac.forEach(F=>{if(!F.ai)return;const fit=fitness(F);M.strat[F.strat].n++;M.strat[F.strat].score+=Math.min(1,fit);M.pop.push({g:F.genome,fit,n:1})});
  M.pop.sort((a,b)=>b.fit-a.fit);M.pop=M.pop.slice(0,12);M.gen++;
  store(MKEY,M);
}

/* ============ setup ============ */
function newGame(diff,nat,opening='balanced',preview=false){
  UI.mapFx=[];
  if(S&&!S.over&&S.started!==false)learnFromGame('abandoned');
  let seed,map=null;
  for(let k=0;k<60&&!map;k++){seed=(Math.random()*1e9)|0;map=genMap(seed)}
  G=map.G;
  const nr=rng(seed^0x5bd1e995),names=PLACES.slice();for(let i=names.length-1;i>0;i--){const j=(nr()*(i+1))|0;[names[i],names[j]]=[names[j],names[i]]}
  const me=clamp(nat|0,0,NN-1),order=[me,...[...Array(NN).keys()].filter(i=>i!==me)];
  S={v:4,diff:DIFF[diff]?diff:'normal',seed,sites:map.sites,order,turn:1,prov:map.t.map(k=>({t:k,o:null,b:null,r:0})),rivers:map.rivers,names:names.slice(0,map.sites.length),
     armies:[],recruitment:[],construction:[],intel:{},spyAttempts:{},fac:[],rel:{},cities:[],log:[],inbox:[],report:[],scars:[],nextId:1,over:null,sel:null,genUsed:[...Array(NN)].map(()=>[]),
     pmix:zeroU(),firstWar:null,pBetray:0,pTreat:0,learned:false,merc:null,started:!preview,opening:OPENINGS[opening]?opening:'balanced',tips:{},generalHistory:{},armyArchive:[]};
  map.rivers.flat().forEach(p=>{if(S.prov[p].t!=='water')S.prov[p].r=1});
  const taken=[];
  for(let i=0;i<NN;i++){
    const strat=i?pickStrategy(taken):null;if(strat)taken.push(strat);
    const m=i?DIFF[S.diff].start:1,b=i?0:DIFF[S.diff].pBonus;
    S.fac.push({id:i,name:NATIONS[order[i]].name,alive:true,ai:i>0,strat,genome:i?pickGenome(DIFF[S.diff].brain):null,gold:Math.round(120*m)+b,pop:8,popCap:12,popl:60,tax:2});
    S.prov[i].o=i;S.prov[i].b='capital';G.nb[i].forEach(j=>{if(S.prov[j].t!=='water'&&S.prov[j].o==null)S.prov[j].o=i});
    S.armies.push({id:S.nextId++,f:i,p:i,u:{...zeroU(),inf:4,cav:1,mil:1},mv:1,gen:null});
  }
  const free=p=>S.prov[p].t!=='water'&&S.prov[p].o==null&&!S.prov[p].b;
  const order2=[...Array(G.n).keys()].sort(()=>Math.random()-.5);
  for(const p of order2){if(S.cities.length>=CITY_NAMES.length)break;
    if(!free(p)||[...Array(NN).keys()].some(c=>hop(p,c)<2)||S.cities.some(c=>hop(c.p,p)<3))continue;
    S.prov[p].b='city';if(S.prov[p].t==='forest')S.prov[p].t='plains';
    S.cities.push({p,name:CITY_NAMES[S.cities.length],rel:Array(NN).fill(0),patron:null,war:Array(NN).fill(false),trade:Array(NN).fill(false),improved:Array(NN).fill(0)})}
  let v=0;for(const p of order2){if(v>=12)break;if(!free(p)||[...Array(NN).keys()].some(c=>hop(p,c)<2)||G.nb[p].some(j=>['village','city'].includes(S.prov[j].b)))continue;S.prov[p].b='village';v++}
  for(let a=0;a<NN;a++)for(let b=a+1;b<NN;b++)S.rel[rk(a,b)]={st:'neutral',score:0,since:1,ask:0,gifts:0,trade:false,until:0};
  S.sel=0;UI.tab='tile';
  const op=OPENINGS[S.opening];S.fac[0].gold=op.gold+DIFF[S.diff].pBonus;S.armies[0].u={...op.u};
  S.armies.forEach(a=>armyRecord(a));resetMoves();
  log(`${dateStr()}. ${NF(0).ruler.n} of ${S.fac[0].name} takes the field. ${S.fac.slice(1).map(F=>F.name).join(', ')} watch, and the free cities of ${S.cities.map(c=>c.name).join(', ')} guard their walls.`);
  save();
}
function log(m,important){S.log.unshift({t:S.turn,m});S.log.length=Math.min(S.log.length,120);if(important)S.report.push(m)}
function save(){if(!UI.headless)store(SKEY,S)}

/* ============ movement & battles ============ */
function cityOpen(f,c){return c.patron!=null?atWar(f,c.patron):c.war[f]}
function canStep(f,p){
  const t=T(p);if(t.t==='water')return false;
  const a=armyAt(p);if(a&&a.f!==f&&!atWar(f,a.f))return false;
  if(t.o!=null&&t.o!==f&&!atWar(f,t.o)&&!allied(f,t.o))return false;
  if(t.o==null&&t.b==='city'&&!cityOpen(f,cityAt(p)))return false;
  return true;
}
function hostileGar(f,p){const t=T(p);if(t.o==null)return t.b==='city'?garrisonOf(t):null;return t.o!==f&&atWar(f,t.o)?garrisonOf(t):null}
function needsFight(f,p){const a=armyAt(p);return(a&&a.f!==f)||!!hostileGar(f,p)}
function removeArmy(a,status){const i=S.armies.indexOf(a);if(i>=0){archiveArmy(a,status);S.armies.splice(i,1)}}
function retreat(a){
  const opts=nbrs(a.p).filter(q=>!armyAt(q)&&T(q).t!=='water'&&!(T(q).b==='city'&&T(q).o==null));
  const pick=opts.find(q=>T(q).o===a.f)??opts.find(q=>T(q).o==null);
  if(pick!=null){a.p=pick;a.mv=0}else{for(const r of[armyRecord(a),generalRecord(a)].filter(Boolean))r.retreats=Math.max(0,r.retreats-1);removeArmy(a,'Lost with no route of retreat')}
}
function watchBattle(af,df){return!UI.headless&&(PREFS.watch==='all'?(af===0||df===0):PREFS.watch==='mine'?af===0:false)}
async function battle(af,attA,df,defA,gar,p){
  const attU=attA.u,defArmyU=defA?defA.u:null;
  if(watchBattle(af,df)){const t=T(p),wk=gar?wallsOf(t):'';
    const gi=a=>a&&a.gen?{name:a.gen.name,lvl:lvlOf(a.gen)}:null;
    return await liveBattle({att:attU,def:defArmyU,gar,terrain:t.t,fortKind:wk,river:!!t.r,af,df,p,gen:[gi(attA),gi(defA)]});
  }
  const tl=T(p),B=makeBattle({att:attU,def:defArmyU,gar,terrain:tl.t,fortKind:gar?wallsOf(tl):'',river:!!tl.r,
    gen:[attA.gen?{name:attA.gen.name,lvl:lvlOf(attA.gen)}:null,defA?.gen?{name:defA.gen.name,lvl:lvlOf(defA.gen)}:null]});
  if(UI.headless)runToEnd(B);else await runToEndAsync(B)
  return{aw:B.loser===1,aL:battleLosses(B,attU,0),dL:defArmyU?battleLosses(B,defArmyU,1):garLoss(B,gar),genDied:B.genDied,explanation:battleExplanation(B)};
}
function mergeGen(a,b){if(!b.gen)return;if(!a.gen||b.gen.xp>a.gen.xp){if(a.gen){generalRecord(a).status='Returned to court';if(a.f===0)log(`General ${a.gen.name} returns to court.`)}a.gen=b.gen}else{generalRecord(b).status='Returned to court';if(b.f===0)log(`General ${b.gen.name} returns to court.`)}}
function spyReport(a){const r=S.intel?.[a.id];return r&&r.f===a.f?r:null}
function canSpy(a){return !!a&&a.f!==0&&real(a.f)&&S.fac[a.f]?.alive&&S.fac[0].gold>=20&&S.spyAttempts?.[a.id]!==S.turn}
function spyArmy(a){if(!canSpy(a))return false;S.fac[0].gold-=20;(S.spyAttempts||(S.spyAttempts={}))[a.id]=S.turn;
  if(Math.random()<.25){addRel(0,a.f,-15);rememberRelation(0,a.f,`Our spy was caught: relations −15.`);log(`A spy sent to ${a.name} was captured. The 20 gold is lost; relations with ${fname(a.f)} fall by 15.`,true);return 'caught'}
  (S.intel||(S.intel={}))[a.id]={f:a.f,p:a.p,turn:S.turn,u:{...a.u},strength:Math.round(armyStr(a))};log(`A spy reports on ${a.name} at ${placeName(a.p)}: strength ${Math.round(armyStr(a))}.`,true);return 'success';
}
function intelligenceHtml(a,button=true){const r=spyReport(a),age=r?S.turn-r.turn:0;
  return `<div class="sec"><div class="lbl">Army intelligence</div>${r?`<p class="note">Spy report · season ${r.turn} · ${esc(placeName(r.p))}${age>=2?' · OUTDATED':''}. Counts are a snapshot; this army may have moved or received reinforcements.</p><div class="kv">${UT.filter(k=>r.u[k]).map(k=>`<span>${UNIT[k].n}</span><span>${r.u[k]}</span>`).join('')}<span>Reported strength</span><span>${r.strength}</span></div>`:'<p>Strength and composition unconfirmed. Send a spy to count these troops before committing your army.</p>'}${button?`<button class="btn sm" data-act="spy" data-a="${a.id}" ${canSpy(a)?'':'disabled'}>${S.spyAttempts?.[a.id]===S.turn?'Spy mission used this season':'Spy on army · 20 gold'}</button><p>75% success. If caught: no report, 20 gold lost and relations −15. One attempt per army each season.</p>`:''}</div>`;
}
function safeRetreats(a,from){if(!a)return[];return nbrs(a.p).filter(p=>p!==from&&T(p).o===a.f&&T(p).t!=='water'&&!armyAt(p))}
function preBattleHtml(a,p,part){const attacking=a.f===0,enemy=attacking?armyAt(p):a,mine=attacking?a:armyAt(p),safe=attacking?[]:safeRetreats(mine,a.p);
 const force=part||a.u,siege=attacking&&hostileGar(a.f,p)&&wallsOf(T(p));
 return `<h2>${attacking?'Before the attack':'Enemy approaching'}</h2><p>${esc(placeName(p))} · ${attacking?cnt(force):cnt(mine.u)} of your units</p>${enemy?`<p>${esc(enemy.name)} of ${fname(enemy.f)}</p>${intelligenceHtml(enemy,false)}`:'<p>A fortified garrison holds this province.</p>'}${siege?`<p class="note">Intact walls block entry and melee. ${force.art+force.how?'Use Target wall point… and click a wall section to concentrate fire there; howitzers are more effective against masonry.':'This force has no artillery to open a breach. Bring field guns or howitzers, or fight from outside the walls.'}</p>`:''}<p>${attacking?'Cancel the attack to stay here without casualties. This ends the army’s movement for the season.':safe.length?`Withdraw safely to ${esc(placeName(safe[0]))} without field-army casualties. You surrender this province and its garrison. Retreat ends this army’s movement for the season.`:'No empty friendly neighbouring province is available for retreat. Your army must stand and fight.'}</p><div class="row"><button class="btn brass" data-act="prebattle" data-choice="fight">${attacking?'Begin attack':'Stand and fight'}</button><button class="btn" data-act="prebattle" data-choice="${attacking?'cancel':'retreat'}" ${!attacking&&!safe.length?'disabled':''}>${attacking?'Cancel attack':'Retreat before battle'}</button></div>`;
}
function preBattleChoice(a,p,part){return new Promise(resolve=>{UI.preBattle={resolve,a,p,part};openModal(preBattleHtml(a,p,part))})}
function moveCost(a,p){return T(a.p).road&&T(p).road&&!needsFight(a.f,p)?0.5:1}
function canMove(a,p){return nbrs(a.p).includes(p)&&canStep(a.f,p)&&a.mv>=moveCost(a,p)}
async function moveArmy(a,p,part){
  if(!canMove(a,p))return false;
  const origin=a.p;let abandoned=false;
  if(!UI.headless&&needsFight(a.f,p)&&(a.f===0||armyAt(p)?.f===0)){
    const choice=await preBattleChoice(a,p,part);
    if(choice==='cancel'){a.mv=0;log(`${a.name} called off its attack on ${placeName(p)}.`,true);return false}
    if(choice==='retreat'){const defender=armyAt(p),safe=safeRetreats(defender,a.p)[0];if(safe!=null){defender.p=safe;defender.mv=0;armyRecord(defender).retreats++;const gr=generalRecord(defender);if(gr)gr.retreats++;log(`${defender.name} withdrew to ${placeName(safe)}, abandoning ${placeName(p)} and its garrison.`,true);abandoned=true}}
  }
  let m=a;
  if(part&&cnt(part)>0&&cnt(part)<cnt(a.u)){armyRecord(a);for(const t of UT)a.u[t]-=part[t];m={id:S.nextId++,f:a.f,p:a.p,u:{...part},mv:a.mv,marched:a.marched||0,gen:null};armyRecord(m);m.name=`${fname(a.f)} Detachment ${m.id}`}
  const tl=T(p),other=armyAt(p);
  const cost=abandoned?1:moveCost(m,p);m.mv-=cost;m.marched=(m.marched||0)+cost;if(abandoned)m.mv=0;
  if(other&&other.f===m.f){armyRecord(other);for(const t of UT)other.u[t]+=m.u[t];other.marched=Math.max(other.marched||0,m.marched);other.mv=tl.r?0:Math.max(0,Math.min(other.mv,m.mv,movementAllowance(other)-other.marched));mergeGen(other,m);m.gen=null;if(m.f===0)campaignEffect(p,'Joined forces');if(m===a)removeArmy(a,`Joined ${other.name}`);return true}
  const gar=abandoned?null:hostileGar(m.f,p);
  if(other||gar){
    const defF=other?other.f:tl.o==null?CITYF:tl.o;
    m.mv=0;const res=await battle(m.f,m,defF,other||null,gar,p);
    recordEngagement(m,p,res.aw,false,res.genDied?.[0]);recordEngagement(other,p,!res.aw,true,res.genDied?.[1]);
    noteBattle(m.f,defF,p,res.aw,res.aL,res.dL,!other);
    if(m.f===0||defF===0){S.battleReports=S.battleReports||[];S.battleReports.unshift({title:`Battle of ${placeName(p)} · ${dateStr()}`,lines:res.explanation||[]});S.battleReports=S.battleReports.slice(0,8)}
    if(res.genDied){if(res.genDied[0]&&m.gen){log(`General ${m.gen.name} of ${fname(m.f)} is killed at ${placeName(p)}.`,m.f===0||defF===0);m.gen=null}
      if(res.genDied[1]&&other&&other.gen){log(`General ${other.gen.name} of ${fname(other.f)} is killed at ${placeName(p)}.`,m.f===0||defF===0);other.gen=null}}
    const winner=res.aw?m:other;if(winner&&winner.gen)winner.gen.xp++;
    if(!res.aw){m.mv=0;if(m!==a){for(const t of UT)a.u[t]+=m.u[t];archiveArmy(m,`Rejoined ${a.name}`)}if(cnt(a.u)===0)removeArmy(a);return true}
    if(other){if(cnt(other.u)>0)retreat(other);else removeArmy(other)}
  }
  if(cnt(m.u)===0){if(m===a)removeArmy(a);return true}
  if(m.f===0)campaignEffect(p,'Arrived',m.id,origin);
  if(m===a)a.p=p;else{m.p=p;S.armies.push(m)}
  if(tl.r)m.mv=0;
  if(tl.o!=null&&tl.o!==m.f&&atWar(m.f,tl.o))capture(m.f,p);
  else if(tl.o==null&&tl.b==='city')takeCity(m.f,p);
  return true;
}
function noteBattle(af,df,p,aw,aL,dL,garrison){
  const where=`Battle of ${placeName(p)}`;
  const dn=df===CITYF?`the garrison of ${placeName(p)}`:garrison?`the ${fname(df)} garrison`:fname(df);
  const m=aw?`${where}: ${fname(af)} defeated ${dn}. ${fname(af)} lost ${lossStr(aL)}; the defenders lost ${lossStr(dL)}.`
            :`${where}: ${fname(af)} was thrown back by ${dn}. ${fname(af)} lost ${lossStr(aL)}; the defenders lost ${lossStr(dL)}.`;
  log(m,af===0||df===0);S.scars.push({p,t:S.turn});
  if(af===0||df===0)S.lastBattle=m;
}
function takeCity(f,p){const c=cityAt(p);T(p).o=f;c.patron=null;c.trade=Array(NN).fill(false);S.fac[f].gold+=40;
  S.fac.forEach(F=>{if(F.id!==f&&F.alive)addRel(f,F.id,-4)});S.cities.forEach(o=>{if(o!==c)o.rel[f]=Math.max(0,o.rel[f]-20)});
  log(`${cap1(fname(f))} storms the free city of ${c.name} and plunders 40 gold. Other courts and cities are alarmed.`,true)}
function capture(f,p){
  const tl=T(p),prev=tl.o;tl.o=f;loseRecruitment(p,prev);loseConstruction(p,prev);
  const recover=S.fac[f].recovery;
  if(recover&&recover.p===p){tl.b='capital';delete tl.fallenCapital;S.fac[f].recovery=null;log(`${fname(f)} retakes ${placeName(p)}. The crown is restored!`,true);return}
  if(tl.b==='capital'){
    tl.b='town';tl.fallenCapital=prev;const loot=Math.floor(S.fac[prev].gold/2);S.fac[prev].gold-=loot;S.fac[f].gold+=loot;
    const refuge=S.prov.map((t,i)=>i).filter(i=>T(i).o===prev&&!(armyAt(i)&&armyAt(i).f!==prev))
      .sort((a,b)=>(['town','village','city'].includes(T(b).b)?1:0)-(['town','village','city'].includes(T(a).b)?1:0)||hop(a,p)-hop(b,p))[0];
    if(!S.fac[prev].recoveryUsed&&refuge!=null){S.fac[prev].recoveryUsed=true;S.fac[prev].recovery={p,refuge,left:3,since:S.turn,by:f};
      log(`${fname(prev)} loses its capital. ${fname(f)} takes ${loot} gold. ${recoveryText(prev)}`,true)}
    else eliminate(prev,f,loot);
  }
  else if(['village','town','city'].includes(tl.b))log(`${fname(f)} takes ${placeName(p)} from ${fname(prev)}.`,prev===0||f===0);
}
function tickRecoveries(){
  for(const F of S.fac){const r=F.recovery;if(!F.alive||!r)continue;
    if(T(r.refuge).o!==F.id){const p=S.prov.findIndex(t=>t.o===F.id);if(p>=0)r.refuge=p}
    if(r.since<S.turn)r.left--;
    if(r.left<=0||!owned(F.id)){const owner=T(r.p).o,by=real(owner)&&owner!==F.id?owner:r.by;
      log(`${F.name}'s recovery has ended. The lost capital was not retaken.`,true);eliminate(F.id,by,0)}
  }
}
function eliminate(p,by,loot){
  const P=S.fac[p];P.alive=false;P.recovery=null;S.recruitment=(S.recruitment||[]).filter(q=>q.f!==p);S.construction=(S.construction||[]).filter(q=>q.f!==p);
  S.prov.forEach(t=>{if(t.o===p)t.o=by});
  S.armies.filter(a=>a.f===p).forEach(a=>archiveArmy(a,'Crown defeated'));
  S.armies=S.armies.filter(a=>a.f!==p);
  S.fac.forEach(F=>{if(F.id!==p)R(F.id,p).trade=false});
  S.cities.forEach(c=>{if(c.patron===p)c.patron=null});
  log(`${P.name} has fallen. Its capital is taken by ${fname(by)}${loot?`, who seize ${loot} gold`:''}, and its provinces submit.`,true);
}

/* ============ trade roads, free cities, generals, towns ============ */
function routePath(a,b){return landRoute(capitalOf(a),capitalOf(b))}
function landRoute(ca,cb){if(ca==null||cb==null||ca<0||cb<0)return null;
  const prev=new Array(G.n).fill(-1),q=[ca];prev[ca]=ca;
  while(q.length){const c=q.shift();if(c===cb)break;for(const j of nbrs(c)){if(prev[j]>=0||T(j).t==='water')continue;prev[j]=c;q.push(j)}}
  if(prev[cb]<0)return null;const path=[cb];let c=cb;while(c!==ca){c=prev[c];path.unshift(c)}return path;
}
let routeCache=null,routeKey='';
function routes(){
  const key=S.turn+'|'+S.armies.map(a=>a.f+':'+a.p).join(',')+'|'+Object.values(S.rel).map(r=>r.trade?1:0).join('')+S.fac.map(F=>F.alive?1:0).join('')+'|'+S.prov.map(t=>t.o+':'+t.b).join(',')+'|'+S.cities.map(c=>[c.patron,...(c.trade||[]),...c.war].join(':')).join(',')+'|'+Object.values(S.rel).map(r=>r.st).join(',');
  if(routeCache&&key===routeKey)return routeCache;
  const out=[];
  for(let a=0;a<NN;a++)for(let b=a+1;b<NN;b++){const r=R(a,b);if(!r.trade||!S.fac[a].alive||!S.fac[b].alive)continue;
    const path=routePath(a,b);if(!path)continue;
    out.push({a,b,path,blocked:path.some(i=>{const ar=armyAt(i);return ar&&(atWar(ar.f,a)||atWar(ar.f,b))})})}
  for(const c of S.cities)if(T(c.p).o==null)for(let f=0;f<NN;f++){
    if(!c.trade?.[f]||!S.fac[f].alive||!cityPeaceful(f,c))continue;const path=landRoute(capitalOf(f),c.p);if(!path)continue;
    out.push({a:f,b:null,city:c.p,path,blocked:path.some(p=>{const ar=armyAt(p);return ar&&(atWar(ar.f,f)||c.war[ar.f]||c.patron!=null&&atWar(ar.f,c.patron))})});
  }
  routeCache=out;routeKey=key;return out;
}
function tradeIncome(f){
  let g=0;const mk=S.prov.filter(t=>t.o===f&&t.b==='market').length;
  for(const r of routes())if(!r.blocked&&(r.a===f||r.b===f))g+=r.city!=null?2+Math.min(2,mk)+Math.min(2,Math.floor(r.path.length/2)):3+Math.min(3,mk)+Math.min(3,Math.floor(r.path.length/2));
  return g;
}
function cityPeaceful(f,c){return !!(c&&T(c.p).o==null&&!c.war[f]&&(c.patron==null||!atWar(f,c.patron)))}
function canCityTrade(f,c){return !!(S.fac[f]?.alive&&cityPeaceful(f,c)&&!c.trade?.[f]&&c.rel[f]>=20&&landRoute(capitalOf(f),c.p))}
function cityTrade(f,c){if(!canCityTrade(f,c))return false;c.trade=c.trade||Array(NN).fill(false);c.trade[f]=true;log(`${fname(f)} opens a trade road to the free city of ${c.name}.`,f===0);return true}
function endCityTrade(f,c){if(!c?.trade?.[f])return false;c.trade[f]=false;c.rel[f]=Math.max(0,c.rel[f]-5);return true}
function canImproveRelations(f,target,city=false){
  if(!S.fac[f]?.alive||S.fac[f].gold<10)return false;
  if(city)return cityPeaceful(f,target)&&target.rel[f]<100&&target.improved?.[f]!==S.turn;
  return real(target)&&f!==target&&S.fac[target].alive&&!atWar(f,target)&&R(f,target).score<100&&R(f,target).improved?.[f]!==S.turn;
}
function improveRelations(f,target,city=false){
  if(!canImproveRelations(f,target,city))return false;S.fac[f].gold-=10;
  if(city){target.improved=target.improved||Array(NN).fill(0);target.improved[f]=S.turn;target.rel[f]=Math.min(100,target.rel[f]+10);log(`An envoy improves ${fname(f)}'s relations with ${target.name}.`,f===0)}
  else{const r=R(f,target);r.improved=r.improved||{};r.improved[f]=S.turn;addRel(f,target,10);rememberRelation(f,target,`${fname(f)} sent an envoy to improve relations.`);log(`${fname(f)} improves relations with ${fname(target)}.`,f===0||target===0)}
  return true;
}
function cityGift(f,c){const F=S.fac[f];if(!cityPeaceful(f,c)||F.gold<25)return false;F.gold-=25;c.rel[f]=Math.min(100,c.rel[f]+15);S.cities.forEach(o=>{if(o!==c)o.rel[f]=Math.min(100,o.rel[f]+3)});return true}
function cityProtect(f,c){if(c.rel[f]<40||c.patron!=null||T(c.p).o!=null||c.war[f])return false;c.patron=f;log(`The free city of ${c.name} places itself under the protection of ${fname(f)}.`,true);return true}
function cityWar(f,c){if(c.war[f]||T(c.p).o!=null||c.patron!=null)return false;c.war[f]=true;c.rel[f]=0;if(c.trade)c.trade[f]=false;S.cities.forEach(o=>{if(o!==c)o.rel[f]=Math.max(0,o.rel[f]-15)});S.fac.forEach(F=>{if(F.id!==f&&F.alive)addRel(f,F.id,-2)});
  log(`${cap1(fname(f))} declares war on the free city of ${c.name}.`,true);return true}
function appointGeneral(f,a){
  const F=S.fac[f];if(a.gen||F.gold<GEN_COST||T(a.p).o!==f)return null;
  const name=NF(f).gens.find(n=>!S.genUsed[f].includes(n));if(!name)return null;
  F.gold-=GEN_COST;S.genUsed[f].push(name);a.gen={name,xp:0};generalRecord(a);log(`${cap1(fname(f))} appoints General ${name}.`,f!==0&&atWar(f,0));return name;
}
function upgradeTown(f,p){return T(p)?.b==='village'&&upgradeBuilding(f,p)}

/* ============ economy: money and people ============ */
function income(f){
  const F=S.fac[f],w=season()===3,r={gold:0,popCap:0,popl:0,vpop:0,villages:0,towns:0,land:0,bld:0,cities:0};
  S.prov.forEach((t,i)=>{if(t.o!==f)return;const sz=G.size[i];
    r.land+=TER[t.t].gold*sz+(t.r?1:0);
    if(BLD[t.b])r.bld+=buildingGold(t,sz,w);
    switch(t.b){case'capital':r.bld+=8;r.popCap+=12;break;case'house':r.popCap+=6*(t.level||1);break;case'church':r.popl+=3*(t.level||1);break;
      case'village':r.bld+=3;r.popCap+=4;r.vpop++;r.villages++;break;case'town':r.bld+=7;r.popCap+=8;r.vpop++;r.towns++;break;
      case'city':r.bld+=8;r.popCap+=8;r.vpop++;break}});
  S.cities.forEach(c=>{if(c.patron===f&&T(c.p).o==null)r.cities++});
  if(F.recovery&&T(F.recovery.refuge).o===f){r.bld+=8;r.popCap+=12}
  r.land=Math.round(r.land);r.bld=Math.round(r.bld);
  const u=unitsOf(f);
  r.tax=Math.round(F.pop*TAXG[F.tax]);r.popl+=TAXP[F.tax];
  r.trade=tradeIncome(f);
  r.wage=Math.ceil(UT.reduce((s,t)=>s+u[t]*UNIT[t].up,0));
  r.gold=r.land+r.bld+r.tax+r.trade+r.cities*3-r.wage;
  return r;
}
function desert(f,frac,why){
  // Round at crown level: splitting into tiny detachments must not cancel unpaid losses.
  const armies=S.armies.filter(a=>a.f===f),total=unitsOf(f),quotas=applyLoss({...total},frac);
  if(!cnt(quotas)&&cnt(total)&&frac>0){const type=UT.reduce((best,t)=>total[t]>total[best]?t:best,'inf');quotas[type]=1}
  const lost=cnt(quotas);
  for(const type of UT)for(let n=0;n<quotas[type];n++){const a=armies.filter(a=>a.u[type]>0).sort((a,b)=>b.u[type]-a.u[type])[0];if(a)a.u[type]--}
  for(const a of armies)if(!cnt(a.u))removeArmy(a);
  if(lost)log(`${lost} ${fname(f)} soldiers deserted over ${why}.`,f===0);
}
function applyEconomy(f){
  const F=S.fac[f],r=income(f);F.popCap=r.popCap;
  let g=r.gold;if(F.ai&&g>0)g=Math.round(g*Dz().inc);
  F.gold+=g;F.popl+=r.popl;
  if(F.gold<0){F.gold=0;F.popl-=6;
    const hus=S.armies.filter(a=>a.f===f&&a.u.hus);
    if(hus.length){const n=hus.reduce((s,a)=>s+a.u.hus,0);hus.forEach(a=>{a.u.hus=0;if(!cnt(a.u))removeArmy(a)});log(`Unpaid, ${n} squadrons of Russian hussars ride away from ${F.name}.`,f===0)}
    else desert(f,.08,'unpaid wages')}
  F.popl=clamp(F.popl,0,100);
  const vb=r.vpop?1:0;
  if(F.pop>F.popCap)F.pop--;
  else if(F.popl>=60)F.pop=Math.min(F.popCap,F.pop+2+vb);
  else if(F.popl>=40)F.pop=Math.min(F.popCap,F.pop+1+vb);
  else if(F.popl>=30&&vb)F.pop=Math.min(F.popCap,F.pop+1);
  else if(F.popl<25&&F.pop>2)F.pop--;
  if(F.popl<15){const cap=capitalOf(f);if(cap<0)return;
    const c=S.prov.map((t,i)=>i).filter(i=>T(i).o===f&&T(i).b!=='capital'&&!armyAt(i));
    if(c.length){c.sort((a,b)=>hop(b,cap)-hop(a,cap));T(c[0]).o=null;log(`Revolt in ${F.name}! ${placeName(c[0])} throws off the crown.`,f===0)}}
}
function beginConstruction(f,p,b,level,cost,time,kind){
  const F=S.fac[f],t=T(p);if(!F?.alive||!t||t.o!==f||projectAt(p)||F.gold<cost||(armyAt(p)&&armyAt(p).f!==f))return false;
  F.gold-=cost;(S.construction||(S.construction=[])).push({id:S.nextId++,f,p,b,level,kind,from:t.b,fromLevel:t.level||1,started:S.turn,ready:S.turn+time});return true;
}
function build(f,p,b){const t=T(p),B=BLD[b];if(!t||!B||t.b||!B.on.includes(t.t))return false;return beginConstruction(f,p,b,1,B.cost,BUILD_TIME[b],'build')}
function upgradeBuilding(f,p){const u=upgradeInfo(p);return !!u&&beginConstruction(f,p,u.b,u.level,u.cost,u.time,'upgrade')}
function buildRoad(f,p){const t=T(p);return !!t&&!t.road&&t.t!=='water'&&beginConstruction(f,p,'road',1,20,1,'road')}
function loseConstruction(p,f){const lost=(S.construction||[]).filter(q=>q.p===p&&q.f===f);if(!lost.length)return;
  S.construction=S.construction.filter(q=>!lost.includes(q));log(`Construction at ${placeName(p)} is lost with the province.`,f===0);
}
function tickConstruction(){const waiting=[];for(const q of S.construction||[]){const t=T(q.p);
  if(!S.fac[q.f]?.alive||t.o!==q.f){if(q.f===0)log(`Construction at ${placeName(q.p)} was lost when the province changed hands.`,true);continue}
  if(q.kind!=='road'&&(t.b!==q.from||(t.level||1)!==q.fromLevel))continue;
  if(q.ready>S.turn||(armyAt(q.p)&&armyAt(q.p).f!==q.f)){waiting.push(q);continue}
  if(q.kind==='road')t.road=true;else{t.b=q.b;t.level=q.level}
  if(q.f===0)campaignEffect(q.p,'Completed');
  log(`${q.b==='road'?'Road':q.b==='town'?'Town':BLD[q.b].n+(q.level>1?' level '+q.level:'')} completed at ${placeName(q.p)}.`,q.f===0);
 }S.construction=waiting;
}
function progressHtml(q,label){const total=Math.max(1,q.ready-q.started),done=clamp(S.turn-q.started,0,total),percent=Math.round(100*done/total),left=Math.max(0,q.ready-S.turn);
 return `<div class="project"><div class="row" style="justify-content:space-between"><b>${esc(label)}</b><span>${left?left+' season'+(left===1?'':'s')+' left':'Ready · site occupied'}</span></div><div class="meter" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-valuetext="${done} of ${total} seasons complete"><i style="width:${percent}%;background:var(--brass)"></i></div><small>${done} / ${total} seasons · ${percent}%</small></div>`;
}
function constructionHtml(p=null){const queue=(S.construction||[]).filter(q=>q.f===0&&(p==null||q.p===p));if(!queue.length)return '';
 return `<div class="sec"><div class="lbl">Construction in progress</div>${queue.map(q=>progressHtml(q,(q.b==='road'?'Road':q.b==='town'?'Town':BLD[q.b].n)+(q.level>1?' · level '+q.level:'')+(p==null?' · '+placeName(q.p):''))).join('')}<p>Paid up front. One project per province; existing buildings work during upgrades. Projects are lost if the province falls.</p></div>`;
}
function dragoonAccessHtml(p=null){
 const F=S.fac[0],local=p!=null&&T(p)?.o===0&&T(p).b==='barracks',localLand=p!=null&&T(p)?.o===0&&!T(p).b&&BLD.barracks.on.includes(T(p).t),ready=sitesFor(0,'cav');
 const barracks=S.prov.map((t,i)=>i).filter(i=>T(i).o===0&&T(i).b==='barracks');
 const pending=(S.construction||[]).find(q=>q.f===0&&q.b==='barracks');
 const land=S.prov.findIndex((t,i)=>t.o===0&&!t.b&&!projectAt(i)&&BLD.barracks.on.includes(t.t));
 const available=barracks.find(i=>!projectAt(i)&&!(armyAt(i)&&armyAt(i).f!==0));
 const target=local||localLand?p:ready[0]??available??pending?.p??barracks[0]??(land>=0?land:null);
 const tile=target==null?null:T(target),project=target==null?null:projectAt(target),occupied=target!=null&&armyAt(target)&&armyAt(target).f!==0;
 let status='Requires level 2 barracks',detail='',action='';
 if(local&&(tile.level||1)>=2){
   const reasons=[];if(occupied)reasons.push('Enemy troops occupy this province.');if(F.gold<UNIT.cav.cost)reasons.push(`Need ${UNIT.cav.cost-F.gold} more gold.`);if(F.pop<=2)reasons.push('Need at least 3 people available.');
   status=reasons.length?'Recruitment unavailable':'Ready to recruit';detail=reasons.join(' ')||'Recruits join the army in this province when training finishes.';
   action=`<button class="btn brass" data-act="recruit" data-u="cav" ${reasons.length?'disabled':''}>Recruit dragoons · ${UNIT.cav.cost} gold + 1 person</button>`;
 }else if(local){
   if(project){status=project.b==='barracks'?'Barracks upgrade in progress':'Another project is in progress';detail=`${Math.max(0,project.ready-S.turn)} seasons left. ${project.b==='barracks'?'Dragoons unlock when the upgrade finishes.':'Finish this project, then upgrade the barracks.'}`}
   else{const upgrade=upgradeInfo(p);detail='Upgrade these barracks to unlock dragoons.';if(F.gold<upgrade.cost)detail+=` Need ${upgrade.cost-F.gold} more gold.`;if(occupied)detail+=' Enemy troops occupy this province.';
     action=`<button class="btn brass" data-act="upgrade" ${F.gold<upgrade.cost||occupied?'disabled':''}>Unlock dragoons · Upgrade barracks · ${upgrade.cost} gold · ${upgrade.time} seasons</button>`}
 }else if(localLand&&!project){
   detail='Build here, then upgrade the barracks to level 2: 36 gold · 2 seasons.';if(F.gold<BLD.barracks.cost)detail+=` Need ${BLD.barracks.cost-F.gold} more gold.`;if(occupied)detail+=' Enemy troops occupy this province.';
   action=`<button class="btn brass" data-act="build" data-b="barracks" ${F.gold<BLD.barracks.cost||occupied?'disabled':''}>Build barracks · 55 gold · 2 seasons</button>`;
 }else if(localLand&&project?.b!=='barracks'){
   status='Another project is in progress';detail='Finish this project before building barracks here.';
 }else if(target!=null){
   if(ready.includes(target)){status='Ready at your level 2 barracks';detail=`Recruit at ${esc(placeName(target))}.`;action='Go to recruit dragoons'}
   else if(project?.b==='barracks'){status=project.level>1?'Barracks upgrade in progress':'Barracks under construction';detail=`${Math.max(0,project.ready-S.turn)} seasons left.${project.level>1?' Dragoons unlock when it finishes.':' Then upgrade to level 2: 36 gold · 2 seasons.'}`;action='View barracks progress'}
   else if(tile.b==='barracks'){detail=occupied?'Enemy troops occupy your barracks. Clear the province to recruit.':'Upgrade your barracks: 36 gold · 2 seasons.';action='Go to barracks'}
   else{detail='Build barracks: 55 gold · 2 seasons. Then upgrade to level 2: 36 gold · 2 seasons.';action='Choose land for barracks'}
   action=`<button class="btn brass" data-act="site" data-p="${target}">${action}</button>`;
 }else detail='Claim empty plains, forest or hills for barracks. Build: 55 gold · 2 seasons; level 2 upgrade: 36 gold · 2 seasons.';
 return `<section class="sec recruitment-unlock" aria-label="Dragoon recruitment"><div class="lbl">Cavalry recruitment</div><h3>Dragoons</h3><p>Mounted troops that charge or fire carbines.</p><p class="recruit-status"><b>${status}</b></p><p>${detail}</p><p>${UNIT.cav.cost} gold + 1 person · ${TRAINING.cav} seasons to train · ${UNIT.cav.up} upkeep</p>${action}</section>`;
}
function artilleryAccessHtml(){const sites=sitesFor(0,'art'),howSites=sitesFor(0,'how'),q=(S.construction||[]).find(q=>q.f===0&&q.b==='foundry'),p=S.prov.findIndex((t,i)=>t.o===0&&!t.b&&!projectAt(i)&&BLD.foundry.on.includes(t.t));
 const target=howSites[0]??sites[0]??q?.p??(p>=0?p:null);
 return `<div class="sec"><div class="lbl">Field guns &amp; howitzers</div><p>${sites.length?'Field guns: 26 gold + 1 person · 3 seasons at any cannon foundry.':q?'Your foundry is under construction. Field guns unlock when it finishes.':'Build a Cannon foundry on empty owned plains or hills: 80 gold · 3 seasons.'}</p><p><b>Howitzers</b><br>${howSites.length?'Your level 2 foundry can train howitzers now.':'Select the foundry province → Upgrade to level 2: 52 gold · 2 seasons.'}<br>Then select Howitzers: 32 gold + 1 person · 4 seasons. You need at least 3 people available to begin recruitment.</p>${target!=null?`<button class="btn sm" data-act="site" data-p="${target}">${howSites.length?'Go to howitzer foundry':sites.length?'Go to cannon foundry':q?'View foundry construction':'Choose land for a foundry'}</button>`:'<p>Claim suitable land, or clear an existing building to make room.</p>'}</div>`;
}
function recruit(f,p,type){
  const F=S.fac[f],t=T(p),unit=UNIT[type];if(!F?.alive||!t||!unit||!TRAINING[type]||t.o!==f||!recruitHere(f,p,type)||F.pop<=2||F.gold<unit.cost||F.popl<(unit.popularity||0))return false;
  const a=armyAt(p);if(a&&a.f!==f)return false;F.gold-=unit.cost;F.pop--;F.popl-=unit.popularity||0;
  S.recruitment=S.recruitment||[];S.recruitment.push({id:S.nextId++,f,p,type,started:S.turn,ready:S.turn+TRAINING[type]});
  if(f===0)S.pmix[type]++;return true;
}
function loseRecruitment(p,f){
  const lost=(S.recruitment||[]).filter(q=>q.p===p&&q.f===f);if(!lost.length)return;
  S.recruitment=S.recruitment.filter(q=>!lost.includes(q));log(`${lost.length} units in training were lost when ${placeName(p)} fell.`,f===0);
}
function tickRecruitment(){
  const waiting=[];for(const q of S.recruitment||[]){
    if(!S.fac[q.f]?.alive||T(q.p).o!==q.f){if(q.f===0)log(`Recruitment at ${placeName(q.p)} was lost when the province changed hands.`,true);continue}
    let a=armyAt(q.p);if(q.ready>S.turn||a&&a.f!==q.f){waiting.push(q);continue}
    if(!a){a={id:S.nextId++,f:q.f,p:q.p,u:zeroU(),mv:0,gen:null};S.armies.push(a)}
    a.u[q.type]++;armyRecord(a);if(!isHorse(q.type))a.mv=Math.min(a.mv,Math.max(0,1-(a.marched||0)));
    log(`${UNIT[q.type].n} finish training at ${placeName(q.p)} and join ${a.name}.`,q.f===0);
  }S.recruitment=waiting;
}
function recruitmentHtml(p=null){
 const queue=(S.recruitment||[]).filter(q=>q.f===0&&(p==null||q.p===p));if(!queue.length)return '';
 return `<div class="sec"><div class="lbl">Troops in training</div>${queue.map(q=>progressHtml(q,UNIT[q.type].n+(p==null?' · '+placeName(q.p):''))).join('')}<p>Training runs in parallel. Gold and people are committed now; upkeep begins on arrival. Recruits are lost if this province falls.</p></div>`;
}
function hireHussars(f,n){
  const F=S.fac[f],cap=capitalOf(f);if(!S.merc||cap<0)return 0;
  let a=armyAt(cap);if(a&&a.f!==f)return 0;
  n=Math.min(n,S.merc.n,Math.floor(F.gold/S.merc.price));if(n<=0)return 0;
  F.gold-=n*S.merc.price;S.merc.n-=n;
  if(!a){a={id:S.nextId++,f,p:cap,u:zeroU(),mv:0,gen:null};S.armies.push(a)}
  a.u.hus+=n;if(f===0)S.pmix.hus+=n;
  log(`${n} squadrons of Russian hussars enter ${F.name}'s pay.`,f!==0&&atWar(f,0));
  if(!S.merc.n)S.merc=null;return n;
}
function mercSeason(){
  if(S.merc&&S.turn>S.merc.until)S.merc=null;
  if(!S.merc&&Math.random()<.18){S.merc={n:3+Math.floor(Math.random()*3),price:30,until:S.turn+4};
    log(`A band of ${S.merc.n} squadrons of Russian hussars offers its sabres at ${S.merc.price} gold each. They wait until ${SEASONS[(S.merc.until-1)%4].toLowerCase()} ${1740+Math.floor((S.merc.until-1)/4)}.`,true)}
}
const sitesFor=(f,type)=>S.prov.map((t,i)=>i).filter(i=>T(i).o===f&&recruitHere(f,i,type)&&!(armyAt(i)&&armyAt(i).f!==f));

/* ============ diplomacy ============ */
function addRel(a,b,d){if(!real(a)||!real(b)||a===b)return;const r=R(a,b);r.score=clamp(Math.round(r.score+d),-100,100)}
function setRel(a,b,st){const r=R(a,b);r.st=st;r.since=S.turn;S.inbox=S.inbox.filter(validEnvoy)}
function declareWar(a,b){
  if(atWar(a,b)||!S.fac[a].alive||!S.fac[b].alive)return;
  const r=R(a,b),betray=['peace','alliance','truce'].includes(r.st)||r.trade;
  setRel(a,b,'war');r.trade=false;addRel(a,b,betray?-50:-25);
  rememberRelation(a,b,betray?`${fname(a)} broke a treaty with ${fname(b)}.`:`${fname(a)} declared war on ${fname(b)}.`);
  if(betray&&a===0){M.grievances=M.grievances||[];M.grievances.unshift(`As ${fname(0)}, you broke a treaty with ${fname(b)} in ${year()}.`);M.grievances=M.grievances.slice(0,5);store(MKEY,M)}
  if(betray){S.fac.forEach(F=>{if(F.alive&&F.id!==a&&F.id!==b)addRel(a,F.id,-10)});if(a===0)S.pBetray++}
  if(a===0&&S.firstWar==null)S.firstWar=S.turn;
  log(betray?`${fname(a)} tears up its treaties and declares war on ${fname(b)}!`:`${fname(a)} declares war on ${fname(b)}.`,a===0||b===0);
  S.fac.forEach(F=>{const c=F.id;if(!F.alive||c===a||c===b||!allied(c,b)||allied(c,a))return;
    if(c===0)S.inbox.push({type:'join',from:b,target:a});
    else if(R(c,b).score>25){log(`${fname(c)} honours its alliance with ${fname(b)}.`,a===0);declareWar(c,a)}
    else{addRel(c,b,-20);setRel(c,b,'peace');log(`${fname(c)} abandons its alliance with ${fname(b)}.`,b===0)}});
}
function makePeace(a,b){setRel(a,b,'peace');addRel(a,b,8);rememberRelation(a,b,'A peace treaty was signed.');if(a===0||b===0)S.pTreat++;log(`${fname(a)} and ${fname(b)} sign a treaty of peace.`,a===0||b===0)}
function makeTruce(a,b){setRel(a,b,'truce');R(a,b).until=S.turn+TRUCE_LEN;addRel(a,b,4);if(a===0||b===0)S.pTreat++;log(`${fname(a)} and ${fname(b)} agree a cease-fire for ${TRUCE_LEN} seasons.`,a===0||b===0)}
function makeAlliance(a,b){setRel(a,b,'alliance');addRel(a,b,10);if(a===0||b===0)S.pTreat++;log(`${fname(a)} and ${fname(b)} form an alliance.`,a===0||b===0)}
function makeTrade(a,b){R(a,b).trade=true;addRel(a,b,6);rememberRelation(a,b,'A trade road was opened.');if(a===0||b===0)S.pTreat++;log(`${fname(a)} and ${fname(b)} sign a trade pact. Caravans open a road between their capitals.`,a===0||b===0)}
function commonEnemy(a,b){return S.fac.some(F=>F.alive&&F.id!==a&&F.id!==b&&atWar(a,F.id)&&atWar(b,F.id))}
function willing(ai,from,type){
  const A=S.fac[ai],r=R(ai,from),pa=facPower(ai)||1,pf=facPower(from)||1,tr=from===0?trust():1,g=A.genome||{agg:1,trade:1};
  let v=r.score;
  if(type==='peace'){v+=Dz().peace+(pf/pa-1)*40+(S.turn-r.since)*2+(A.strat==='militarist'?-15:0)+(A.strat==='diplomat'?15:0)-(1-tr)*25-(g.agg-1)*20;return v>5}
  if(type==='truce'){v+=Dz().peace+(pf/pa-1)*40+(S.turn-r.since)*2+15-(g.agg-1)*15-(1-tr)*15;return v>0}
  if(type==='pact'){v+=10+(A.strat==='diplomat'?20:0)-(A.strat==='militarist'?15:0)+(pf/pa>1.3?15:0)-(1-tr)*40;return v>12}
  if(type==='alliance'){v+=(commonEnemy(ai,from)?30:0)+(A.strat==='diplomat'?15:0)-(1-tr)*50-30;return v>10}
  if(type==='tradepact'){if(atWar(ai,from))return false;v+=12+(A.strat==='economist'?20:0)+(A.strat==='militarist'?-10:0)+(g.trade-1)*25-(1-tr)*30;return v>8}
  return false;
}
function propose(ai,o,type,extra){
  if(o===0){if(!S.inbox.some(m=>m.from===ai&&m.type===type))S.inbox.push({type,from:ai,...extra});return}
  if(type==='tribute')return;
  if(willing(o,ai,type)){if(type==='alliance')makeAlliance(ai,o);else if(type==='tradepact')makeTrade(ai,o);else if(type==='truce')makeTruce(ai,o);else makePeace(ai,o)}
}
function relationDrift(){
  for(let a=0;a<NN;a++)for(let b=a+1;b<NN;b++){
    if(!S.fac[a].alive||!S.fac[b].alive)continue;const r=R(a,b);
    if(r.st==='truce'&&S.turn>=r.until){setRel(a,b,'war');log(`The cease-fire between ${fname(a)} and ${fname(b)} expires. The war resumes.`,a===0||b===0)}
    if(r.st==='war')addRel(a,b,-1);
    else{if(bordering(a,b)&&r.st!=='alliance')addRel(a,b,-1);if(r.st!=='neutral'&&r.score<30)addRel(a,b,1);if(r.trade&&r.score<50)addRel(a,b,1)}
    if(commonEnemy(a,b))addRel(a,b,2);
  }
  S.cities.forEach(c=>{for(let f=0;f<NN;f++){if(c.rel[f]>0)c.rel[f]--;if(c.patron===f&&c.rel[f]<60)c.rel[f]++}});
}
function bordering(a,b){for(let i=0;i<G.n;i++){if(T(i).o!==a)continue;for(const j of nbrs(i))if(T(j).o===b)return true}return false}

/* ============ AI ============ */
function threat(f){
  const cap=capitalOf(f);if(cap<0)return false;
  const g=armyAt(cap),gp=(g&&g.f===f?armyStr(g):0)+strength(garrisonOf({b:'capital'}),GENERIC)*1.4;
  return S.armies.some(a=>atWar(f,a.f)&&hop(a.p,cap)<=2&&armyStr(a)>gp*.7);
}
function enemyMix(f){
  let u=zeroU();const hasPlayer=atWar(f,0)||bordering(f,0);
  S.armies.forEach(a=>{if(a.f!==f&&(atWar(f,a.f)||a.f===0))u=addU(u,a.u)});
  if(hasPlayer){const pm=playerMix();for(const t of UT)u[t]+=pm[t]*6}
  const n=cnt(u)||1,o={};for(const t of UT)o[t]=u[t]/n;return o;
}
function desiredMix(f){
  const em=enemyMix(f),base=STRATS[S.fac[f].strat].mix,counter={mil:0,inf:em.cav+em.hus,cav:em.art+em.how,hus:0,art:em.inf+em.mil,how:0};
  const walls=S.fac.some(F=>F.alive&&atWar(f,F.id)&&S.prov.some(t=>t.o===F.id&&(t.b==='fort'||t.b==='palisade')));
  const out={};for(const t of UT)out[t]=.5*base[t]+.5*counter[t];if(walls)out.how+=.12;if(S.fac[f].gold<60)out.mil+=.15;return out;
}
function aiSite(f,b){
  const cap=capitalOf(f);if(cap<0)return null;
  const rivals=S.fac.filter(F=>F.alive&&F.id!==f).map(F=>capitalOf(F.id)).filter(c=>c>=0);
  const c=S.prov.map((t,i)=>i).filter(i=>T(i).o===f&&!T(i).b&&!projectAt(i)&&BLD[b].on.includes(T(i).t));
  if(!c.length)return null;
  if(b==='fort'||b==='palisade'){const near=c.filter(i=>hop(i,cap)<=1);if(!near.length)return null;const d=i=>Math.min(...rivals.map(r=>hop(i,r)));near.sort((a,b)=>d(a)-d(b));return near[0]}
  if(b==='farm'){const rv=c.filter(i=>T(i).r);if(rv.length)return rv[0]}
  c.sort((a,b)=>(G.size[b]-G.size[a])*.7+hop(a,cap)-hop(b,cap));return c[0];
}
function bestEcon(f){
  const w=season()===3;let best=null,bv=0;
  S.prov.forEach((t,i)=>{if(t.o!==f||t.b||projectAt(i))return;for(const b of['farm','sawmill','mine','market']){const B=BLD[b];if(!B.on.includes(t.t))continue;const v=B.gold(G.size[i],t,false)/B.cost;if(v>bv){bv=v;best={p:i,b}}}});
  return best;
}
function aiBuild(f){
  const F=S.fac[f],st=F.strat,g=F.genome;
  const has=b=>S.prov.some(t=>t.o===f&&t.b===b)||(S.construction||[]).some(q=>q.f===f&&q.b===b),count=b=>S.prov.filter(t=>t.o===f&&t.b===b).length+(S.construction||[]).filter(q=>q.f===f&&q.b===b).length;
  const fearPlayer=earlyAggressor()&&S.turn<16&&(bordering(f,0)||st==='turtle');
  const want=[];
  if(F.pop>=F.popCap-1)want.push('house');
  if(F.popl<45)want.push('church');
  if(!has('barracks')&&(S.turn>=3||st==='militarist'))want.push('barracks');
  const forts=(st==='turtle'?3:1)+(fearPlayer?1:0)+(g.fort>1.25?1:0)-(g.fort<.75?1:0);
  if((st==='turtle'||threat(f)||fearPlayer||g.fort>1.3)&&count('fort')+count('palisade')<forts)want.push(F.gold>140?'fort':'palisade');
  if(!has('foundry')&&(S.turn>=10||(S.turn>=6&&st!=='diplomat')))want.push('foundry');
  let built=0;const maxB=F.gold>150?3:2;
  for(const b of want){if(built>=maxB)break;const s=aiSite(f,b);if(s!=null&&F.gold>=BLD[b].cost){build(f,s,b);built++}}
  for(let p=0;p<G.n&&built<maxB;p++)if(T(p).o===f&&['barracks','foundry'].includes(T(p).b)&&upgradeInfo(p)&&F.gold>100&&upgradeBuilding(f,p))built++;
  const roadSite=S.prov.findIndex((t,p)=>t.o===f&&!t.road&&!projectAt(p)&&nbrs(p).some(q=>T(q).o===f&&(T(q).road||T(p).b==='capital')));if(roadSite>=0&&F.gold>160&&built<maxB&&buildRoad(f,roadSite))built++;
  const vill=S.prov.findIndex(t=>t.o===f&&t.b==='village');
  if(vill>=0&&F.gold>110&&built<maxB&&upgradeTown(f,vill))built++;
  while(built<maxB){const e=bestEcon(f);if(!e||F.gold<BLD[e.b].cost+20)break;build(f,e.p,e.b);built++}
}
function aiTax(f){const F=S.fac[f];if(F.popl>72&&F.tax<3)F.tax++;else if(F.popl<45&&F.tax>0)F.tax--;else if(F.strat==='economist'&&F.popl>60&&F.tax<2)F.tax++}
function aiRecruit(f){
  const F=S.fac[f],st=STRATS[F.strat],hot=anyWar(f)||threat(f),g=F.genome;
  if(S.merc&&hot&&F.gold>110&&income(f).gold>4)hireHussars(f,Math.floor((F.gold-60)/S.merc.price));
  if(F.gold>140){const a=S.armies.filter(a=>a.f===f&&!a.gen&&cnt(a.u)>=6&&T(a.p).o===f).sort((x,y)=>cnt(y.u)-cnt(x.u))[0];if(a)appointGeneral(f,a)}
  let reserve=F.gold-Math.floor(F.gold*Math.min(1,(hot?Math.max(st.spend,.8):st.spend*.6)*Dz().spend*g.spend));
  if(F.gold>180)reserve=Math.min(reserve,60);
  const want=desiredMix(f),have=unitsOf(f);for(const q of S.recruitment||[])if(q.f===f)have[q.type]++;
  for(let i=0;i<(F.gold>180?14:9);i++){
    if(F.pop<=3||income(f).gold<-3)break;
    const tot=cnt(have)+1;let best=null,bd=-9;
    for(const t of UT){if(!sitesFor(f,t).length||F.gold<UNIT[t].cost||F.popl<(UNIT[t].popularity||0)||F.gold-UNIT[t].cost<reserve)continue;const d=want[t]-have[t]/tot;if(d>bd){bd=d;best=t}}
    if(!best)break;
    const cap=capitalOf(f),sites=sitesFor(f,best);
    sites.sort((a,b)=>(T(a).b==='capital'?0:1)-(T(b).b==='capital'?0:1)||hop(a,cap)-hop(b,cap));
    if(!recruit(f,sites[0],best))break;have[best]++;
  }
}
function aiCities(f){
  const F=S.fac[f],g=F.genome;if(S.turn%3!==f%3)return;
  const free=S.cities.filter(c=>T(c.p).o==null&&c.patron==null);
  if(F.gold>110&&(F.strat==='economist'||F.strat==='diplomat'||g.trade>1.2)){const c=free.filter(c=>!c.war[f]).sort((a,b)=>b.rel[f]-a.rel[f])[0];if(c&&cityGift(f,c)&&c.rel[f]>=40)cityProtect(f,c)}
  if(F.gold>60&&(F.strat==='economist'||F.strat==='diplomat')){const c=free.find(c=>cityPeaceful(f,c)&&!c.trade?.[f]);if(c){if(c.rel[f]<20)improveRelations(f,c,true);cityTrade(f,c)}}
  if((F.strat==='militarist'||g.expand>1.15)&&!free.some(c=>c.war[f])){
    const pw=armyPower(f),c=free.filter(c=>!c.war[f]&&S.prov.some((t,i)=>t.o===f&&hop(i,c.p)<=3)).sort((a,b)=>a.rel[f]-b.rel[f])[0];
    if(c&&pw>strength(CITY_GAR_U(),GENERIC)*2.2&&Math.random()<.2)cityWar(f,c);
  }
}
const CITY_GAR_U=()=>({...zeroU(),inf:3,mil:3,art:1});
function bfs(f,src){
  const dist=new Array(G.n).fill(-1),prev=new Array(G.n).fill(-1),q=[src];dist[src]=0;
  while(q.length){const c=q.shift();if(c!==src&&needsFight(f,c))continue;
    for(const n of nbrs(c)){if(dist[n]>=0||!canStep(f,n))continue;dist[n]=dist[c]+1;prev[n]=c;q.push(n)}}
  return{dist,prev,src};
}
function firstStep(g,goal){let c=goal;while(g.prev[c]!==g.src){c=g.prev[c];if(c<0)return null}return c}
function aiTarget(f,a){
  const g=bfs(f,a.p),cap=capitalOf(f),war=anyWar(f),ex=S.fac[f].genome.expand,as=1+.06*lvlOf(a.gen);
  if(cap>=0&&threat(f)&&a.p!==cap&&g.dist[cap]>0&&g.dist[cap]<=4)return firstStep(g,cap);
  let best=null,bs=0;
  for(let i=0;i<G.n;i++){if(g.dist[i]<=0)continue;
    const t=T(i),ha=armyAt(i);let val=0,defU=null;
    if(ha&&ha.f!==f){if(!atWar(f,ha.f))continue;val=2+cnt(ha.u)/3;defU=ha.u}
    if(t.o!=null&&t.o!==f&&atWar(f,t.o)){val=Math.max(val,(t.b==='capital'?14:t.b==='city'?6:t.b==='town'?5:t.b==='village'?4:t.b?3:1.4)+G.size[i]*.3);const gg=garrisonOf(t);if(gg)defU=defU?addU(defU,gg):gg}
    else if(t.o==null&&!ha){
      if(t.b==='city'){val=(6+(S.fac[f].strat==='militarist'?2:0))*ex;defU=garrisonOf(t)}
      else if(!war||t.b==='village')val=((t.b==='village'?4:1)+G.size[i]*.35+(nbrs(i).some(j=>T(j).o===f)?.6:0))*ex;
    }
    if(S.fac[f].recovery?.p===i&&atWar(f,t.o))val+=24;
    if(!val)continue;
    if(defU&&strength(a.u,defU)*as<strength(defU,a.u)*defMult(i,a.u)*1.15)continue;
    const s=val/(g.dist[i]+1);if(s>bs){bs=s;best=i}
  }
  return best==null?null:firstStep(g,best);
}
async function aiMilitary(f){
  const F=S.fac[f],cap=capitalOf(f);if(cap<0)return;
  const fear=earlyAggressor()&&S.turn<15&&bordering(f,0)?2:0;
  const gt=STRATS[F.strat].garrison+Dz().garrison+(threat(f)?3:0)+fear+Math.round((F.genome.fort-1)*3);
  const ca=armyAt(cap);
  if(ca&&ca.f===f&&ca.mv>0&&cnt(ca.u)>gt+1&&!threat(f)){
    const part=zeroU();let left=cnt(ca.u)-gt;
    for(const t of['hus','cav','how','art','inf','mil']){const k=Math.min(left,t==='inf'||t==='mil'?ca.u[t]:Math.ceil(ca.u[t]*.8));part[t]=k;left-=k}
    const step=aiTarget(f,{...ca,u:part});if(step!=null){const moved=await moveArmy(ca,step,part);if(moved&&ca.gen&&S.armies.includes(ca)){const na=S.armies.find(x=>x.f===f&&x.p===step);if(na&&!na.gen&&cnt(na.u)>cnt(ca.u)){na.gen=ca.gen;ca.gen=null}}}
  }
  const field=S.armies.filter(a=>a.f===f&&a.p!==cap);
  for(const a of field){let guard=4;
    while(guard--&&a.mv>0&&S.armies.includes(a)&&S.fac[f].alive&&!S.over){const s=aiTarget(f,a);if(s==null||!(await moveArmy(a,s)))break;checkOver()}}
}
function aiDiplomacy(ai){
  const A=S.fac[ai],st=STRATS[A.strat],g=A.genome;
  S.fac.forEach(O=>{const o=O.id;if(o===ai||!O.alive)return;
    const r=R(ai,o),pa=facPower(ai),po=facPower(o)||1;
    if(r.st==='truce')return;
    if(r.st==='war'){if(pa<po*.75&&S.turn-r.since>=3&&Math.random()<.5/g.agg)propose(ai,o,'peace');else if(pa<po*.95&&S.turn-r.since>=2&&Math.random()<.25)propose(ai,o,'truce');return}
    const busy=S.fac.some(F=>F.alive&&F.id!==ai&&atWar(ai,F.id));
    const aggr=pa>po*st.war*Dz().war/g.agg&&r.score<15&&S.turn>=Dz().warFrom;
    const distrust=o===0&&trust()<.5&&pa>po&&S.turn>=Math.max(4,Dz().warFrom);
    if((aggr||distrust)&&!busy&&!allied(ai,o)&&bordering(ai,o)&&Math.random()<(A.strat==='militarist'?.35:.14)*g.agg){declareWar(ai,o);return}
    if(r.st==='neutral'&&r.score>4&&Math.random()<.3){propose(ai,o,'pact');return}
    if(!r.trade&&r.score>0&&Math.random()<(A.strat==='economist'?.35:.18)*g.trade){propose(ai,o,'tradepact');return}
    if(r.st==='peace'&&r.score>40&&commonEnemy(ai,o)&&Math.random()<.4){propose(ai,o,'alliance');return}
    if(o===0&&A.strat==='militarist'&&pa>po*1.8&&r.score<10&&!allied(ai,o)&&Math.random()<.2)propose(ai,o,'tribute',{amount:30});
  });
}
async function aiTurn(f){const F=S.fac[f];if(!F.alive||S.over)return;aiDiplomacy(f);aiTax(f);aiBuild(f);aiCities(f);aiRecruit(f);await aiMilitary(f)}

/* ============ turn ============ */
const movementAllowance=a=>a.u.mil+a.u.inf+a.u.art+a.u.how===0?2:1;
function resetMoves(){S.armies.forEach(a=>{a.mv=movementAllowance(a);a.marched=0})}
async function endTurn(){
  if(UI.busy)return;
  S.inbox=S.inbox.filter(validEnvoy);
  if(S.over||S.inbox.length){if(S.inbox.length)showReport();return}
  UI.busy=true;if(!UI.headless){$('endbtn').disabled=true;$('hint').textContent='Your rivals are moving…'}
  try{
    S.sel=null;S.report=[];S.lastBattle=null;UI.confirm=null;
    for(let f=1;f<NN;f++){await aiTurn(f);checkOver();if(S.over)break}
    if(!S.over){
      S.fac.forEach(F=>{if(F.alive)applyEconomy(F.id)});
      S.armies.forEach(a=>{const t=T(a.p);if(t.o==null&&t.b!=='city'){t.o=a.f;if(t.b==='village')log(`${cap1(fname(a.f))} claims the village of ${placeName(a.p)}.`,a.f===0)}});
      relationDrift();mercSeason();
      tickRecoveries();
      S.turn++;tickConstruction();tickRecruitment();resetMoves();S.scars=S.scars.filter(s=>S.turn-s.t<6);
      if(season()===3)log('Winter sets in. Farms yield half.',true);
    }
    checkOver();save();
  }finally{UI.busy=false}
  if(!UI.headless){render();showReport()}
}
function checkOver(){
  if(S.over)return;
  for(const F of S.fac){const r=F.recovery;if(!F.alive||!r||T(r.refuge).o===F.id)continue;
    const next=S.prov.findIndex(t=>t.o===F.id);if(next>=0)r.refuge=next;else{const by=T(r.p).o;eliminate(F.id,real(by)?by:r.by,0)}}
  if(!S.fac[0].alive)S.over={win:false,why:'Your capital has fallen.'};
  else if(S.fac.slice(1).every(F=>!F.alive))S.over={win:true,why:`In ${year()} every rival crown has fallen to ${S.fac[0].name}.`};
  if(S.over)learnFromGame(S.over.win?'win':'loss');
}

/* ============ inbox & player diplomacy ============ */
function inboxText(m){
  const n=fname(m.from);
  switch(m.type){
    case'peace':return`${n} sues for peace and offers to end the war.`;
    case'truce':return`${n} proposes a cease-fire of ${TRUCE_LEN} seasons. If no peace is signed by then, the war resumes.`;
    case'pact':return`${n} proposes a treaty of non-aggression.`;
    case'tradepact':return`${n} proposes a trade pact. A caravan road between your capitals would pay gold to both crowns every season.`;
    case'alliance':return`${n} proposes an alliance against your common enemies.`;
    case'tribute':return`${n} demands ${m.amount} gold in tribute. Refusal may mean war.`;
    case'join':return`Your ally ${n} has been attacked by ${fname(m.target)} and calls on you to join the war.`;
  }
}
function validEnvoy(m){
  if(!S.fac[m.from]?.alive)return false;
  const r=R(0,m.from);
  if(m.type==='peace'||m.type==='truce')return r.st==='war';
  if(m.type==='pact')return r.st==='neutral';
  if(m.type==='alliance')return r.st==='peace';
  if(m.type==='tradepact')return r.st!=='war'&&!r.trade;
  if(m.type==='join')return allied(0,m.from)&&S.fac[m.target]?.alive&&atWar(m.from,m.target)&&!atWar(0,m.target);
  if(m.type==='tribute')return r.st!=='war'&&r.st!=='alliance';
  return false;
}
function answer(i,yes){
  const m=S.inbox[i];if(!m)return;S.inbox.splice(i,1);
  const P=S.fac[0],f=m.from;if(!validEnvoy(m)){save();return}
  if(yes){
    if(m.type==='peace'||m.type==='pact')makePeace(0,f);
    else if(m.type==='truce'){if(atWar(0,f))makeTruce(0,f)}
    else if(m.type==='alliance')makeAlliance(0,f);
    else if(m.type==='tradepact'){if(!atWar(0,f))makeTrade(0,f)}
    else if(m.type==='tribute'){if(P.gold>=m.amount){P.gold-=m.amount;S.fac[f].gold+=m.amount;addRel(0,f,10);log(`You pay ${m.amount} gold to ${fname(f)}.`)}else{toast('Not enough gold in the treasury.');S.inbox.splice(i,0,m);return}}
    else if(m.type==='join')declareWar(0,m.target);
  }else{
    if(m.type==='tribute'){addRel(0,f,-20);if(Math.random()<.45)declareWar(f,0);else log(`${fname(f)} is insulted by your refusal.`)}
    else if(m.type==='join'){addRel(0,f,-20);log(`You leave ${fname(f)} to fight alone.`)}
    else addRel(0,f,-3);
  }
  checkOver();save();
}
function diplo(op,f){
  const P=S.fac[0],r=R(0,f),F=S.fac[f];
  const asked=()=>{if(r.ask===S.turn){toast(`Your envoy is still at the ${NF(f).court}. Try next season.`);return true}r.ask=S.turn;return false};
  switch(op){
    case'war':if(UI.confirm!=='war'+f){UI.confirm='war'+f;break}UI.confirm=null;declareWar(0,f);toast(`War is declared on ${F.name}.`);break;
    case'peace':if(asked())break;if(willing(f,0,'peace')){makePeace(0,f);toast(`${F.name} accepts peace.`)}else{addRel(0,f,-2);toast(`${F.name} rejects your terms.`)}break;
    case'truce':if(asked())break;if(willing(f,0,'truce')){makeTruce(0,f);toast(`${F.name} agrees to a cease-fire.`)}else toast(`${F.name} will not lay down arms yet.`);break;
    case'pact':if(asked())break;if(willing(f,0,'pact')){makePeace(0,f);toast(`${F.name} signs the pact.`)}else toast(`${F.name} declines. Relations must improve first.`);break;
    case'tradepact':if(asked())break;if(willing(f,0,'tradepact')){makeTrade(0,f);toast(`${F.name} signs a trade pact. The caravans set out.`)}else toast(`${F.name} will not open its markets to you yet.`);break;
    case'endtrade':r.trade=false;addRel(0,f,-8);log(`You close the trade road to ${F.name}.`);toast(`Trade with ${F.name} ended.`);break;
    case'alliance':if(asked())break;if(willing(f,0,'alliance')){makeAlliance(0,f);toast(`${F.name} joins you in alliance.`)}else toast(`${F.name} will not ally with you yet.`);break;
    case'improve':toast(improveRelations(0,f)?'Relations improved by up to 10. Another envoy can visit next season.':'Cannot send an envoy: need 10 gold, peace, and no visit to this court this season.');break;
    case'gift':if(P.gold<25){toast('A gift costs 25 gold.');break}P.gold-=25;F.gold+=25;addRel(0,f,Math.max(3,12-r.gifts*2));r.gifts++;toast(`${F.name} accepts your gift.`);break;
    case'tribute':{if(asked())break;const ratio=facPower(0)/(facPower(f)||1);
      if(ratio>1.8&&!(F.strat==='militarist'&&ratio<2.5)){const amt=Math.min(50,F.gold);F.gold-=amt;P.gold+=amt;addRel(0,f,-15);toast(`${F.name} pays ${amt} gold, resentfully.`);log(`${F.name} pays ${amt} gold in tribute.`)}
      else{addRel(0,f,-20);if(F.strat==='militarist'&&Math.random()<.5){declareWar(f,0);toast(`${F.name} answers your demand with war!`)}else toast(`${F.name} laughs at your demand.`)}break}
  }
  checkOver();save();render();
}

/*__SOUND__*/

/* ============ live battle view ============ */
let BV=null;
const bcv=$('bcv'),bctx=bcv.getContext('2d');
function sizeBattle(v){
  const field=bcv.parentElement,wide=!!v.expanded&&innerWidth>=1000,aw=Math.min(innerWidth-32,wide?2400:1100,field.clientWidth||1100),ah=Math.max(80,(field.clientHeight||innerHeight-235)-2);
  const s=Math.max(.12,Math.min(aw/FW,ah/FH)),dpr=Math.min(2,devicePixelRatio||1),width=wide?aw:FW*s;
  v.viewW=width/s;
  if(v.ground&&Math.abs(v.s-s)<.001&&bcv.width===Math.round(width*dpr))return;
  v.s=s;bcv.width=Math.round(width*dpr);bcv.height=Math.round(FH*s*dpr);bcv.style.width=Math.round(width)+'px';bcv.style.height=Math.round(FH*s)+'px';
  v.ground=document.createElement('canvas');v.ground.width=Math.round(FW*s*dpr);v.ground.height=bcv.height;
  v.g=v.ground.getContext('2d');v.g.setTransform(s*dpr,0,0,s*dpr,0,0);v.terrainDirty=true;v.projectedGround=null;
}
function setBattleExpanded(v,on){
  v.expanded=!!on;v.ordersOpen=false;$('battle').classList.toggle('expanded',v.expanded);$('battle').classList.remove('orders-open');
  refitBattle(v);
  if(v.expanded){v.savedCamera=v.manual?{...v.manual}:null;const troops=selOf(v),focus=troops.length?troops:v.B.regs.filter(r=>r.n&&!r.broken&&(v.ps<0||r.side===v.ps));v.manual={z:clamp((v.viewW||FW)/FW,1,5),x:FW/2,y:focus.length?focus.reduce((n,r)=>n+P(r.x,r.y)[1],0)/focus.length:FH/2}}
  else{v.manual=v.savedCamera||null;v.savedCamera=null}
  $('bzauto').classList.toggle('brass',!v.manual);$('bzfort').classList.remove('brass');
  renderBattleUI(v);
}
function refitBattle(v){const old=v.ground;sizeBattle(v);if(old&&old!==v.ground)v.g.drawImage(old,0,0,FW,FH)}
if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(BV&&!BV.closed)refitBattle(BV)}).observe(bcv.parentElement);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&BV?.expanded&&!BV.closed){if(BV.ordersOpen){BV.ordersOpen=false;$('battle').classList.remove('orders-open');renderBattleUI(BV)}else setBattleExpanded(BV,false);return}if(e.code==='Space'&&!e.repeat&&BV&&!BV.closed&&!BV.B.done&&BV.B.routing<0&&!/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName)){e.preventDefault();BV.paused=!BV.paused;renderBattleUI(BV)}});
// Keep battlefield decoding out of the opening screen; limit concurrent decodes.
const battleArtQueue=[];let battleArtStarted=false,artRedrawPending=false,battleTerrainPending=0;
function lazyBattleImage(uri,terrain=false){
  const im=new Image();im.decoding='async';battleArtQueue.push({im,uri,terrain});return im;
}
function startBattleArt(){
  if(battleArtStarted||typeof Image==='undefined')return;battleArtStarted=true;
  battleArtQueue.sort((a,b)=>Number(b.terrain)-Number(a.terrain));
  battleTerrainPending=battleArtQueue.filter(job=>job.terrain).length;
  const next=()=>{const job=battleArtQueue.shift();if(!job)return;
    const done=()=>{job.im.onload=job.im.onerror=null;
      if(job.terrain)battleTerrainPending--;
      if(job.terrain&&BV&&!BV.closed&&BV.B.t<1)drawGround(BV);
      if(!artRedrawPending){artRedrawPending=true;requestAnimationFrame(()=>{artRedrawPending=false;if(S&&!UI.headless&&$('home').hidden&&!BV)draw()})}
      setTimeout(next,0);
    };job.im.onload=done;job.im.onerror=done;job.im.src=job.uri;
  };for(let i=0;i<4;i++)next();
}
const BATTLE_PAINTING=typeof Image==='undefined'||!REALISTIC_ART?.ground?null:lazyBattleImage(REALISTIC_ART.ground,true);
const loadUnitImage=uri=>lazyBattleImage(uri);
const UNIT_IMAGES=typeof Image==='undefined'||!REALISTIC_ART?.units?null:Object.fromEntries(
  Object.entries(REALISTIC_ART.units).map(([kind,uris])=>[kind,Array.isArray(uris)?uris.map(loadUnitImage):loadUnitImage(uris)]));
const lazyArtGroup=group=>typeof Image==='undefined'||!group?null:Object.fromEntries(Object.entries(group).map(([name,uri])=>[name,lazyBattleImage(uri,true)]));
const BUILDING_IMAGES=lazyArtGroup(REALISTIC_ART?.buildings);
const TREE_IMAGES=lazyArtGroup(REALISTIC_ART?.trees);
const EFFECT_IMAGES=lazyArtGroup(REALISTIC_ART?.effects);
const WALL_IMAGES=lazyArtGroup(REALISTIC_ART?.walls);
const SMOKE_STAMP=typeof document==='undefined'?null:(()=>{const a=document.createElement('canvas');a.width=a.height=96;const g=a.getContext('2d');
  for(const [x,y,r,k]of[[48,49,43,.85],[31,53,28,.46],[65,39,26,.38]]){const f=g.createRadialGradient(x,y,1,x,y,r);f.addColorStop(0,`rgba(245,243,236,${k})`);f.addColorStop(.48,`rgba(224,223,215,${k*.55})`);f.addColorStop(1,'rgba(182,184,176,0)');g.fillStyle=f;g.fillRect(0,0,96,96)}return a})();
function drawGround(v){
  const g=v.g,o=v.o,r=rng(o.p*977+S.turn);
  v.terrainDirty=true;
  v.trees=[];
  g.fillStyle=o.terrain==='forest'?'#6a7b45':o.terrain==='hills'?'#86814f':'#7c8a4c';g.fillRect(0,0,FW,FH);
  const textured=BATTLE_PAINTING&&BATTLE_PAINTING.complete&&BATTLE_PAINTING.naturalWidth;
  if(textured){g.globalAlpha=o.terrain==='forest'?.84:.91;g.drawImage(BATTLE_PAINTING,0,0,FW,FH);g.globalAlpha=1;
    g.fillStyle=o.terrain==='forest'?'rgba(32,62,26,.28)':o.terrain==='hills'?'rgba(113,91,48,.18)':'rgba(71,91,39,.12)';g.fillRect(0,0,FW,FH)}
  for(let k=0;k<(textured?35:200);k++){g.fillStyle=r()<.5?'rgba(255,245,200,.045)':'rgba(30,40,10,.05)';g.beginPath();g.ellipse(r()*FW,r()*FH,10+r()*40,5+r()*16,r()*3,0,7);g.fill()}
  const road=()=>{g.beginPath();g.moveTo(190,FH);g.bezierCurveTo(230,FH*.68,160,FH*.3,205,0)};
  g.strokeStyle='rgba(54,42,27,.36)';g.lineWidth=14;road();g.stroke();g.strokeStyle='rgba(170,144,95,.31)';g.lineWidth=10;road();g.stroke();
  g.strokeStyle='rgba(80,62,37,.18)';g.lineWidth=1.2;for(const dx of[-3,3]){g.save();g.translate(dx,0);road();g.stroke();g.restore()}
  g.strokeStyle='rgba(41,34,22,.14)';g.lineWidth=.55;for(const dx of[-5.2,5.2]){g.save();g.translate(dx,0);road();g.stroke();g.restore()}
  for(let k=0;k<48;k++){const x=185+(r()-.5)*28,y=r()*FH;g.fillStyle=k%3?'rgba(74,65,43,.15)':'rgba(191,174,124,.24)';g.beginPath();g.ellipse(x,y,1+r()*2,.35+r()*.8,r()*3,0,7);g.fill()}
  if(o.terrain==='hills'){g.save();g.translate(200,205);g.scale(1,.42);const slope=g.createRadialGradient(-35,-38,18,0,0,195);slope.addColorStop(0,'rgba(229,214,153,.19)');slope.addColorStop(.62,'rgba(117,104,62,.08)');slope.addColorStop(1,'rgba(50,44,29,.29)');g.fillStyle=slope;g.beginPath();g.arc(0,0,195,0,7);g.fill();g.restore();for(let k=0;k<4;k++){g.strokeStyle='rgba(70,55,30,.25)';g.lineWidth=1.2;g.beginPath();g.ellipse(200,205,190-k*38,82-k*16,0,0,7);g.stroke()}g.fillStyle='rgba(255,240,190,.08)';g.beginPath();g.ellipse(200,205,150,63,0,0,7);g.fill();for(let k=0;k<48;k++){const x=42+r()*316,y=130+r()*155;g.fillStyle=k%3?'rgba(59,54,39,.21)':'rgba(213,199,158,.27)';g.beginPath();g.ellipse(x,y,1+r()*2,.5+r(),r()*3,0,7);g.fill()}}
  const tree=(x,y,s,kind)=>{v.trees.push({x,y,s,kind});g.fillStyle='rgba(0,0,0,.23)';g.beginPath();g.ellipse(x+2,y+3,s*1.55,s*.65,-.15,0,7);g.fill()};
  // trees in clumps across the field: flanks beside each army and the ground between them,
  // keeping the road, the river, the fort and the battle lines clear
  const clear=(x,y)=>Math.abs(x-(200+Math.sin(y/90)*12))<26||(o.river&&y>270&&y<332)||(o.fortKind&&inside({fortKind:o.fortKind},x,y))||
    (o.fortKind==='fort'&&Math.hypot(x-200,y-120)<132)||(o.fortKind==='palisade'&&Math.hypot(x-200,y-125)<112)||(o.fortKind==='capital'&&x>28&&x<372&&y>18&&y<224)||
    (x>78&&x<322&&((y>140&&y<262)||(y>640&&y<785)));
  const grove=(cx,cy,n,spread)=>{for(let k=0;k<n;k++){const x=cx+(r()-.5)*spread,y=cy+(r()-.5)*spread*.7;if(x<6||x>FW-6||y<24||y>FH-20||clear(x,y))continue;tree(x,y,4+r()*5,r()<(o.terrain==='forest'?.34:.25)?'pine':'oak')}};
  const nt=o.terrain==='forest'?26:10;
  for(let k=0;k<nt;k++){const side=r()<.5;tree(side?7+r()*60:FW-7-r()*60,28+r()*(FH-56),4+r()*5,r()<.3?'pine':'oak')}
  if(o.terrain==='forest'){
    for(const[cx,cy,rx,ry]of v.B.groves||[]){
      g.fillStyle='rgba(24,62,20,.24)';g.strokeStyle='rgba(222,232,155,.38)';g.lineWidth=1;
      g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);g.fill();g.stroke();
      for(let k=0;k<18;k++){const a=r()*Math.PI*2,d=Math.sqrt(r())*.88,x=cx+Math.cos(a)*rx*d,y=cy+Math.sin(a)*ry*d;
        if(!(o.fortKind&&Math.hypot(x-200,y-120)<132))tree(x,y,4+r()*4,r()<.34?'pine':'oak')}
    }
  }else grove(r()<.5?110:290,312,4,40);
  if(o.terrain!=='forest')for(let k=0;k<7;k++){const side=k%2===0,x=side?48+r()*42:FW-48-r()*42,y=105+k*(FH-180)/7+r()*24;tree(x,y,5+r()*3,r()<.25?'pine':'oak')}
  if(o.river){
    g.fillStyle='#4f6b45';g.beginPath();for(let x=0;x<=FW;x+=10)g.lineTo(x,286+Math.sin(x/37)*6);for(let x=FW;x>=0;x-=10)g.lineTo(x,316+Math.sin(x/41)*6);g.fill();
    g.fillStyle='#5d88a6';g.beginPath();for(let x=0;x<=FW;x+=10)g.lineTo(x,290+Math.sin(x/37)*6);for(let x=FW;x>=0;x-=10)g.lineTo(x,312+Math.sin(x/41)*6);g.fill();
    g.strokeStyle='rgba(216,207,163,.53)';g.lineWidth=1.4;for(const yy of[287,317]){g.beginPath();for(let x=0;x<=FW;x+=10){const y=yy+Math.sin(x/(yy===287?37:41))*6;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
    g.fillStyle='rgba(158,137,94,.45)';g.fillRect(185,287,26,28);
    g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=.8;for(let k=0;k<30;k++){const x=r()*FW,y=294+r()*18;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+4,y-1.1,x+8+r()*5,y);g.stroke()}
    for(let k=0;k<38;k++){const x=r()*FW,y=(r()<.5?286:317)+(r()-.5)*6;g.strokeStyle=k%3?'#68784a':'#a4a775';g.lineWidth=.65;g.beginPath();g.moveTo(x,y+3);g.lineTo(x+(r()-.5)*3,y-2-r()*4);g.stroke()}
  }
  v.houses=[];if(o.fortKind)drawSiegeSite(g,o.fortKind,r,v.houses,v.B.regs);
}
function drawSiegeSite(g,kind,r,houses=[],regs=[]){
  const roof=(x,y,w,h,tile)=>{
    if(regs.some(r=>r.side===1&&r.men.some(m=>m.x>x-8&&m.x<x+w+8&&m.y>y-12&&m.y<y+h+8)))return;
    houses.push({x,y,w,h,tile});
    const im=BUILDING_IMAGES?.[tile?'timber-cottage':'stone-townhouse'];
    if(im?.complete&&im.naturalWidth){g.fillStyle='rgba(19,18,14,.27)';g.beginPath();g.ellipse(x+w*.58,y+h*.92,w*.8,h*.42,0,0,7);g.fill();
      return}
    g.fillStyle='rgba(22,20,15,.35)';g.fillRect(x+2,y+4,w,h);
    g.fillStyle='#b9aa8e';g.fillRect(x,y,w,h);g.strokeStyle='#5b5549';g.lineWidth=.7;g.strokeRect(x,y,w,h);
    g.fillStyle=tile?'#824b3d':'#555b5b';g.beginPath();g.moveTo(x-2,y+h*.18);g.lineTo(x+w*.5,y-h*.35);g.lineTo(x+w+2,y+h*.18);g.lineTo(x+w*.5,y+h*.58);g.closePath();g.fill();
    g.strokeStyle='rgba(247,211,171,.34)';g.beginPath();g.moveTo(x+w*.5,y-h*.35);g.lineTo(x+w*.5,y+h*.58);g.stroke();
  };
  const gun=(x,y,a)=>{g.save();g.translate(x,y);g.rotate(a);g.fillStyle='rgba(17,16,13,.3)';g.beginPath();g.ellipse(1,2,7,3,0,0,7);g.fill();
    g.fillStyle='#66472a';g.fillRect(-5,-2,9,4);g.fillStyle='#252521';g.fillRect(-2,-1.3,11,2.6);g.fillStyle='#8e8467';g.fillRect(-1,-1.3,9,.55);
    for(const yy of[-3,3]){g.fillStyle='#34291d';g.beginPath();g.arc(-2,yy,1.55,0,7);g.fill();g.fillStyle='#ad854d';g.beginPath();g.arc(-2,yy,.55,0,7);g.fill()}g.restore()};
  const stores=(x,y)=>{g.fillStyle='rgba(31,25,17,.3)';g.fillRect(x+2,y+3,11,8);g.fillStyle='#755937';g.fillRect(x,y,10,7);g.strokeStyle='#c49b60';g.lineWidth=.8;g.strokeRect(x,y,10,7);g.beginPath();g.moveTo(x,y);g.lineTo(x+10,y+7);g.moveTo(x+10,y);g.lineTo(x,y+7);g.stroke();
    g.fillStyle='#55402a';for(const xx of[x+12,x+15]){g.beginPath();g.arc(xx,y+5,1.5,0,7);g.fill()}};
  if(kind==='fort'){
    const star=(R1,R2)=>{g.beginPath();for(let k=0;k<10;k++){const rr=k%2?R2:R1,a=Math.PI/2+k*Math.PI/5;k?g.lineTo(200+Math.cos(a)*rr,120+Math.sin(a)*rr):g.moveTo(200+Math.cos(a)*rr,120+Math.sin(a)*rr)}g.closePath()};
    g.fillStyle='rgba(25,29,23,.48)';star(128,100);g.fill();
    g.fillStyle='#695c43';star(119,92);g.fill();g.strokeStyle='#3d392e';g.lineWidth=5;g.stroke();
    g.fillStyle='#aea697';star(109,80);g.fill();g.strokeStyle='#e0d5bf';g.lineWidth=2.5;g.stroke();
    g.fillStyle='#615c4d';star(91,65);g.fill();g.fillStyle='#797452';star(84,61);g.fill();
    g.strokeStyle='rgba(54,48,39,.45)';g.lineWidth=.8;for(let k=0;k<10;k++){const a=Math.PI/2+k*Math.PI/5,rr=k%2?80:109,x=200+Math.cos(a)*rr,y=120+Math.sin(a)*rr;g.beginPath();g.moveTo(x-4,y-2);g.lineTo(x+4,y+2);g.stroke()}
    roof(190,35,20,12,true);
    roof(62,237,31,22,true);roof(307,229,29,21,false);
    stores(221,46);gun(129,174,-.7);gun(270,174,Math.PI+.7);gun(137,68,-2.4);gun(262,68,2.4);
    g.fillStyle='#38352d';g.fillRect(191,211,18,9);g.fillStyle='#b5aa91';g.fillRect(190,208,20,4);
    for(const x of [130,166,237,272]){g.fillStyle='#272722';g.fillRect(x,166,5,3);g.fillStyle='#a7a190';g.fillRect(x,165,5,1)}
    // A shaded masonry face and individual stone courses make the rampart read as raised stone.
    g.strokeStyle='rgba(29,27,23,.4)';g.lineWidth=1.1;star(116,88);g.stroke();
    for(let k=0;k<82;k++){const a=r()*Math.PI*2,rr=92+r()*17,x=200+Math.cos(a)*rr,y=120+Math.sin(a)*rr;
      g.fillStyle=k%3?'rgba(51,48,42,.34)':'rgba(239,226,199,.35)';g.fillRect(x,y,2+r()*3,.8+r()*.8)}
    for(let k=0;k<10;k++){const a=Math.PI/2+k*Math.PI/5,x=200+Math.cos(a)*109,y=120+Math.sin(a)*109;
      g.fillStyle='#d8cbb0';g.fillRect(x-3,y-2,6,3);g.fillStyle='#575247';g.fillRect(x-1,y,2,1.5)}
  }else if(kind==='palisade'){
    g.fillStyle='rgba(31,28,18,.4)';g.beginPath();g.ellipse(203,130,105,102,0,0,7);g.fill();
    g.fillStyle='#6e784b';g.beginPath();g.arc(200,125,94,0,7);g.fill();
    g.strokeStyle='#45341e';g.lineWidth=7;g.beginPath();g.arc(200,125,96,0,7);g.stroke();
    for(let a=0;a<Math.PI*2;a+=.037){if(Math.abs(a-Math.PI/2)<.11)continue;const x=200+Math.cos(a)*96,y=125+Math.sin(a)*96;g.fillStyle=((a*100)|0)%2?'#73502d':'#583b23';g.fillRect(x-1.1,y-4,2.5,7);g.fillStyle='#b18b59';g.fillRect(x-1.1,y-4,2.5,1)}
    roof(190,35,20,12,false);
    stores(221,46);gun(147,170,-.65);gun(250,169,Math.PI+.65);
    g.fillStyle='#4a331c';g.fillRect(189,210,22,9);g.fillStyle='#a17d4d';g.fillRect(187,207,26,3);
    g.strokeStyle='rgba(30,24,15,.55)';g.lineWidth=6;g.beginPath();g.arc(200,125,102,0,7);g.stroke();
    g.strokeStyle='rgba(190,153,98,.45)';g.lineWidth=1.4;g.beginPath();g.arc(200,125,94,0,7);g.stroke();
    for(let a=0;a<Math.PI*2;a+=.115){if(Math.abs(a-Math.PI/2)<.13)continue;const x=200+Math.cos(a)*96,y=125+Math.sin(a)*96;
      g.strokeStyle='rgba(24,20,14,.45)';g.lineWidth=.55;g.beginPath();g.moveTo(x,y-4);g.lineTo(x,y+3);g.stroke();
      g.fillStyle='#c9a16a';g.beginPath();g.moveTo(x-1.3,y-4);g.lineTo(x,y-7);g.lineTo(x+1.3,y-4);g.fill()}
  }else if(kind==='capital'){
    g.fillStyle='#796f58';g.fillRect(47,37,306,166);
    for(let row=0;row<5;row++)for(let col=0;col<9;col++){
      const x=59+col*34+(r()-.5)*4,y=48+row*31+(r()-.5)*4;
      if((x>177&&x<224)||r()<.19)continue;
      const w=15+r()*7;roof(x,y,w,8+r()*4,r()<.45)}
    stores(164,176);gun(118,202,-Math.PI/2);gun(282,202,-Math.PI/2);
    g.fillStyle='#b6a78e';g.fillRect(192,62,16,41);g.strokeStyle='#665d4f';g.lineWidth=1;g.strokeRect(192,62,16,41);
    g.fillStyle='#455057';g.beginPath();g.moveTo(189,62);g.lineTo(200,36);g.lineTo(211,62);g.closePath();g.fill();g.fillStyle='#c4bba8';g.fillRect(197,80,6,12);
    g.strokeStyle='rgba(20,20,17,.55)';g.lineWidth=15;g.strokeRect(39,29,322,182);
    g.strokeStyle='#a69b88';g.lineWidth=10;g.strokeRect(40,30,320,180);
    g.strokeStyle='#d9ccae';g.lineWidth=2;g.strokeRect(45,35,310,170);
    for(const[x,y]of[[40,30],[360,30],[40,210],[360,210],[120,210],[280,210]]){g.fillStyle='#555348';g.beginPath();g.arc(x+2,y+3,10,0,7);g.fill();g.fillStyle='#aaa18d';g.beginPath();g.arc(x,y,9,0,7);g.fill();g.strokeStyle='#554d42';g.lineWidth=1;g.stroke()}
    g.fillStyle='#39352b';g.fillRect(187,204,26,13);g.fillStyle='#b8ad96';g.fillRect(185,201,30,4);
    for(let x=64;x<350;x+=19){if(x>179&&x<219)continue;g.fillStyle='#564f42';g.fillRect(x,205,4,3)}
    for(let y of[28,36,204,211])for(let x=51;x<353;x+=13){if(y>200&&x>178&&x<220)continue;
      g.strokeStyle='rgba(69,63,52,.5)';g.lineWidth=.65;g.beginPath();g.moveTo(x,y);g.lineTo(x+8,y);g.stroke();
      if(y===28||y===204){g.fillStyle='#d1c4a9';g.fillRect(x,y-4,6,4)}}
  }
}
function paintCrater(g,x,y,rx,stone=false){
  g.save();g.translate(x,y);g.rotate((Math.random()-.5)*.8);
  const shadow=g.createRadialGradient(0,0,1,0,0,rx*1.4);shadow.addColorStop(0,stone?'rgba(28,27,25,.88)':'rgba(28,20,12,.82)');shadow.addColorStop(.55,stone?'rgba(68,64,55,.7)':'rgba(62,42,23,.7)');shadow.addColorStop(.82,stone?'rgba(167,155,134,.55)':'rgba(150,113,65,.48)');shadow.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=shadow;g.beginPath();g.ellipse(0,0,rx*1.45,rx*.83,0,0,7);g.fill();
  g.strokeStyle=stone?'rgba(224,211,185,.65)':'rgba(198,154,91,.58)';g.lineWidth=Math.max(.55,rx*.12);g.beginPath();g.ellipse(-rx*.1,-rx*.09,rx*.8,rx*.39,0,Math.PI*1.07,Math.PI*1.91);g.stroke();
  for(let k=0;k<Math.round(rx*1.5);k++){const a=Math.random()*7,d=rx*(.8+Math.random()*.9),xx=Math.cos(a)*d,yy=Math.sin(a)*d*.6;
    g.fillStyle=stone?(k%2?'#9d9280':'#625c4e'):(k%2?'#86613c':'#4d3827');g.fillRect(xx,yy,.7+Math.random()*rx*.16,.5+Math.random()*rx*.1)}
  for(let k=0;k<5;k++){const a=k*1.25+Math.random()*.3;g.strokeStyle='rgba(42,31,23,.45)';g.lineWidth=.4;g.beginPath();g.moveTo(Math.cos(a)*rx*.55,Math.sin(a)*rx*.28);g.lineTo(Math.cos(a)*rx*(1.15+Math.random()*.5),Math.sin(a)*rx*.65);g.stroke()}
  g.restore();
}
function paintDestroyedGun(g,x,y,how=false){
  g.save();g.translate(x,y);g.rotate((Math.random()-.5)*.6);paintCrater(g,0,0,how?12:10);
  g.fillStyle='rgba(21,18,14,.42)';g.beginPath();g.ellipse(2,3,14,4,0,0,7);g.fill();
  g.strokeStyle='#342618';g.lineWidth=2.6;g.beginPath();g.moveTo(-9,-3);g.lineTo(4,1);g.moveTo(-4,2);g.lineTo(11,5);g.stroke();
  for(const [wx,wy,rr]of[[-6,3,3.2],[9,-2,2.9]]){g.fillStyle='#281f17';g.beginPath();g.arc(wx+1,wy+1,rr+.8,0,7);g.fill();g.fillStyle='#76552f';g.beginPath();g.arc(wx,wy,rr,0,7);g.fill();g.strokeStyle='#2f2820';g.lineWidth=.9;g.stroke();g.strokeStyle='#aa834a';g.lineWidth=.6;for(let j=0;j<5;j++){const a=j*Math.PI*2/5;g.beginPath();g.moveTo(wx,wy);g.lineTo(wx+Math.cos(a)*rr*.85,wy+Math.sin(a)*rr*.85);g.stroke()}}
  g.save();g.translate(1,-2);g.rotate(-.5);g.fillStyle='#252a2a';g.fillRect(-8,-2,16,4);g.fillStyle='#85847b';g.fillRect(-8,-2,16,.8);g.fillStyle='#171817';g.fillRect(5,-2.3,3,4.6);g.restore();
  for(let i=0;i<9;i++){const xx=(Math.random()-.5)*29,yy=(Math.random()-.5)*12;g.fillStyle=i%2?'#795b37':'#494840';g.fillRect(xx,yy,1+Math.random()*3,.8+Math.random()*2)}
  g.restore();
}
function paintWallBreach(g,x,y,big){
  const rx=big?26:11;paintCrater(g,x,y,rx,true);
  if(big){g.save();g.translate(x,y);g.fillStyle='rgba(24,24,22,.86)';g.beginPath();g.moveTo(-12,-3);g.lineTo(-7,-7);g.lineTo(-2,-5);g.lineTo(3,-8);g.lineTo(11,-4);g.lineTo(13,4);g.lineTo(5,6);g.lineTo(-5,5);g.lineTo(-13,3);g.closePath();g.fill();
    g.strokeStyle='rgba(230,218,190,.68)';g.lineWidth=1.4;g.beginPath();g.moveTo(-12,-3);g.lineTo(-7,-7);g.lineTo(-2,-5);g.moveTo(3,-8);g.lineTo(11,-4);g.stroke();g.restore()}
  for(let k=0;k<(big?22:8);k++){const a=Math.random()*7,d=rx*(.4+Math.random()*1.4),xx=x+Math.cos(a)*d,yy=y+Math.sin(a)*d*.55,w=1+Math.random()*(big?4:2);
    g.fillStyle=k%3?'#a79b84':'#686052';g.fillRect(xx,yy,w,w*.55);g.fillStyle='rgba(238,223,194,.48)';g.fillRect(xx,yy,w,.45)}
}
function paintHouseDamage(g,house){
  const {x,y,w,h,tile}=house;g.save();g.translate(x+w*.5,y+h*.1);g.rotate((Math.random()-.5)*.28);
  g.fillStyle='rgba(31,25,20,.7)';g.beginPath();g.moveTo(-w*.48,-h*.35);g.lineTo(-w*.15,-h*.8);g.lineTo(w*.2,-h*.28);g.lineTo(w*.48,-h*.65);g.lineTo(w*.47,h*.35);g.lineTo(-w*.38,h*.5);g.closePath();g.fill();
  g.strokeStyle='rgba(18,15,12,.85)';g.lineWidth=1.2;g.beginPath();g.moveTo(-w*.35,-h*.5);g.lineTo(w*.23,h*.3);g.moveTo(w*.33,-h*.55);g.lineTo(-w*.2,h*.4);g.stroke();
  for(let k=0;k<11;k++){const xx=(Math.random()-.5)*w*1.8,yy=(Math.random()-.5)*h*2;g.fillStyle=tile?(k%2?'#9a5e3d':'#5f3b2a'):(k%2?'#55575b':'#988b73');g.fillRect(xx,yy,1+Math.random()*3,.7+Math.random()*2)}
  g.restore();house.hit=true;
}
function placeFallen(v,d){
  // Keep casualties near their fall, but avoid identical piled-up silhouettes.
  const nearby=v.dead.slice(-180);let best={x:d.x,y:d.y},score=-1;
  for(let i=0;i<16;i++){const a=i*2.399963+((d.x+d.y)%7),radius=i?3+Math.sqrt(i)*2.6:0;
    const x=clamp(d.x+Math.cos(a)*radius,3,FW-3),y=clamp(d.y+Math.sin(a)*radius*.7,3,FH-3);
    let gap=100;for(const old of nearby)gap=Math.min(gap,Math.hypot((old.x-x)*.8,old.y-y));
    if(gap>score){score=gap;best={x,y}}if(gap>7)break;
  }
  v.dead.push({...d,...best,rot:(d.rot||0)+(Math.random()-.5)*.65});if(v.dead.length>1400)v.dead.shift();
}
// Short-lived material fragments share the battle clock and have a strict particle budget.
function impactFragments(v,x,y,material,count,dx=0,dy=0){
  v.debris=v.debris||[];
  for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,speed=12+Math.random()*32;
    v.debris.push({x,y,z:2,vx:Math.cos(a)*speed+dx*12,vy:Math.sin(a)*speed*.6+dy*12,vz:18+Math.random()*24,
      angle:a,spin:(Math.random()-.5)*15,l:0,max:1.5+Math.random()*.6,material,size:1+Math.random()*1.5})}
  const cap=v.low?90:240;if(v.debris.length>cap)v.debris.splice(0,v.debris.length-cap);
}
function drawFragment(c,d,project=P){
  const q=project(d.x,d.y),wood=d.material==='wood',metal=d.material==='metal';
  c.save();c.globalAlpha*=Math.min(1,(d.max-d.l)*3);c.translate(q[0],q[1]-d.z*q[2]);c.rotate(d.angle);c.scale(q[2],q[2]);
  c.fillStyle=wood?'#684020':metal?'#343b3b':d.material==='stone'?'#80796b':'#6c5032';
  c.strokeStyle=wood?'#e5ba77':metal?'#c7c7bb':d.material==='stone'?'#d7cbb4':'#b99a6b';c.lineWidth=.45;
  c.beginPath();c.moveTo(-d.size,wood?-.4:-d.size*.55);c.lineTo(d.size*(wood?2:1),-.2);c.lineTo(d.size*.55,wood?.65:d.size*.8);c.lineTo(-d.size*.7,d.size*.45);c.closePath();c.fill();c.stroke();c.restore();
}
function fxOf(v){
  const cap=(a,n)=>{if(a.length>n)a.splice(0,a.length-n)};
  return{
    crewDeath(m,source){body(v,m,source)},
    shot(m,side){const dy=side?4:-4;v.flash.push({x:m.x,y:m.y+dy,l:.07,r:1.4});if(!v.low||Math.random()<.35)v.smoke.push({x:m.x+(Math.random()-.5)*2,y:m.y+dy*1.4,r:2.2,g:9+Math.random()*4,a:.5,l:0,max:16+Math.random()*8});cap(v.smoke,v.low?320:1000);SND.musket()},
    volley(r,k){SND.volley(k);for(let i=0;i<Math.min(v.low?2:5,Math.ceil(k/5));i++)v.smoke.push({x:r.x+(Math.random()-.5)*Math.min(90,k*2),y:r.y+(r.side?8:-8),r:4,g:22,a:.28,l:0,max:19})},
    whistle(x=200){SND.shellWhistle(clamp((x-200)/200,-1,1))},
    cannon(gun,side,can,tg){const dy=side?8:-8;v.flash.push({x:gun.x,y:gun.y+dy,l:.14,r:5,dir:side?1:-1});for(let k=0;k<3;k++)v.smoke.push({x:gun.x+(Math.random()-.5)*8,y:gun.y+dy*(1.4+k*.6),r:6,g:22+Math.random()*10,a:.75,l:0,max:22+Math.random()*8});if(gun.reg?.type==='how')SND.howitzer(.55+gun.y/FH*.45,clamp((gun.x-200)/200,-1,1));else SND.cannon(.45+gun.y/FH*.55);
      if(can&&tg)for(let k=0;k<16;k++){const a=Math.atan2(tg.y-gun.y,tg.x-gun.x)+(Math.random()-.5)*.6,sp=180+Math.random()*80;v.spray.push({x:gun.x,y:gun.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:.35})}},
    impact(m,dx,dy){impactFragments(v,m.x,m.y,isGun(m.reg.type)&&!m.role?'wood':'earth',v.low?5:10,dx,dy)},
    dust(x,y,big){if(big)impactFragments(v,x,y,'earth',v.low?7:16);v.dust.push({x,y,r:big?2:1,g:big?20:10,a:.6,l:0,max:big?.9:.5});if(big){v.boom.push({x,y,l:0,max:.22,r:12});paintCrater(v.g,x,y,9);v.terrainDirty=true}},
    shell(x,y){impactFragments(v,x,y,'earth',v.low?18:40);impactFragments(v,x,y,'metal',v.low?4:10);v.boom.push({x,y,l:0,max:1.9,r:34});v.dust.push({x,y,r:5,g:40,a:.8,l:0,max:1.7});v.smoke.push({x,y,r:10,g:32,a:.85,l:0,max:9});
      for(let i=0;i<(v.low?5:10);i++){const a=i*2.399,sp=25+Math.random()*45;v.dust.push({x,y,r:2,g:12,a:.65,l:0,max:.65+Math.random()*.45,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6})}cap(v.dust,180);cap(v.boom,60);SND.howitzerImpact(.9,clamp((x-200)/200,-1,1));
      paintCrater(v.g,x,y,21);v.terrainDirty=true;for(const h of v.houses||[])if(!h.hit&&Math.hypot(x-h.x-h.w*.5,y-h.y-h.h*.3)<Math.max(h.w,h.h)*1.2){paintHouseDamage(v.g,h);impactFragments(v,h.x+h.w*.5,h.y,'wood',v.low?8:18)}},
    spark(x,y){v.spark.push({x:x+(Math.random()-.5)*4,y:y+(Math.random()-.5)*4,l:.12});SND.clash()},
    breachOpen(x,y,kind){const g=v.g,cy=kind==='palisade'?125:120,a=kind==='capital'?(Math.abs(y-210)<5||Math.abs(y-30)<5?0:Math.PI/2):Math.atan2(y-cy,x-200)+Math.PI/2;
      g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#6e6247';g.beginPath();g.ellipse(0,0,17,13,0,0,7);g.fill();
      g.fillStyle='rgba(30,26,20,.55)';g.fillRect(-17,-11,3,22);g.fillRect(14,-11,3,22);
      for(let k=0;k<34;k++){const xx=(Math.random()-.5)*36,yy=(Math.random()-.5)*30,w=1.5+Math.random()*4;g.fillStyle=kind==='palisade'?(k%2?'#5f4026':'#8a6a42'):(k%3?'#a39782':'#6a6252');g.fillRect(xx,yy,w,w*.6);g.fillStyle='rgba(240,228,200,.35)';g.fillRect(xx,yy,w,.4)}
      g.restore();const rubble=EFFECT_IMAGES?.['breach-rubble'];if(rubble?.complete&&rubble.naturalWidth){g.save();g.globalAlpha=.82;g.drawImage(rubble,x-22,y-14,44,28);g.restore()}v.terrainDirty=true;SND.explosion(1)},
    breach(x,y,big){impactFragments(v,x,y,v.B.fortKind==='palisade'?'wood':'stone',v.low?10:24);const g=v.g;paintWallBreach(g,x,y,big||v.B.wallHp<=0);v.terrainDirty=true;
      v.boom.push({x,y,l:0,max:1.3,r:14});v.smoke.push({x,y,r:6,g:18,a:.7,l:0,max:6});SND.boom()},
    dig(r){const g=v.g,back=r.side===0?1:-1;let x0=1e9,x1=-1e9;for(const m of r.men)if(m.alive){x0=Math.min(x0,m.x);x1=Math.max(x1,m.x)}
      const y=r.y-8*back,mid=(x0+x1)/2;g.fillStyle='rgba(28,24,15,.3)';g.beginPath();g.moveTo(x0-5,y+3);g.quadraticCurveTo(mid,y+1,x1+5,y+3);g.lineTo(x1+5,y+8);g.quadraticCurveTo(mid,y+6,x0-5,y+8);g.fill();
      g.strokeStyle='#5f4a2c';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(x0-4,y);g.quadraticCurveTo(mid,y-3,x1+4,y);g.stroke();
      g.strokeStyle='#ad8d5d';g.lineWidth=1.25;g.stroke();for(let x=x0;x<x1;x+=7){const yy=y-2.5+Math.abs(x-mid)/Math.max(1,x1-x0)*3;g.strokeStyle='rgba(41,34,23,.5)';g.lineWidth=.6;g.beginPath();g.moveTo(x,yy+1);g.lineTo(x+.5,yy-2);g.stroke();g.fillStyle='rgba(110,125,66,.62)';g.fillRect(x+1,yy-1,2,.8)}g.lineCap='butt';v.terrainDirty=true;v.banners.push({t:`${r.label} has dug in`,l:0,max:2})},
    death(m,source){body(v,m,source);if(!isGun(m.reg.type))SND.wounded();if(isGun(m.reg.type)&&!m.role){v.boom.push({x:m.x,y:m.y,l:0,max:1.7,r:24});v.smoke.push({x:m.x,y:m.y,r:8,g:22,a:.85,l:0,max:8});SND.explosion(1);
      impactFragments(v,m.x,m.y,'wood',v.low?12:26);impactFragments(v,m.x,m.y,'metal',v.low?4:10);paintDestroyedGun(v.g,m.x,m.y,m.reg.type==='how');v.terrainDirty=true;
      for(let k=0;k<22;k++){const a=Math.random()*7,sp=40+Math.random()*90;v.spray.push({x:m.x,y:m.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:.5,fire:true})}}},
    banner(t){v.banners.push({t,l:0,max:3.4});if(/breached/i.test(t))SND.signal('breach');else if(/breaks|wavering/i.test(t))SND.signal('morale');else if(/deployed and ready/i.test(t))SND.signal('ready')},
    rout(){SND.bugle()}
  };
}
function figureScale(r,m){return isGun(r.type)&&!m.role?2.3:isHorse(r.type)||r.type==='gen'?1.75:1.65}
function body(v,m,source){
  const N=NF(m.reg.side?v.o.df:v.o.af),t=m.reg.type;
  if(isGun(t)&&!m.role)return;
  const idx=t==='mil'||N===CITYNAT?6:Math.max(0,NATIONS.indexOf(N)),blast=source?.kind==='shell'||source?.kind==='roundshot';
  const angle=blast?Math.atan2(m.y-source.y,m.x-source.x):(m.ox+m.rank)%2?-.5:2.6;
  const a=Number.isFinite(angle)?angle:0,travel=blast?16+Math.random()*16:2+Math.random()*2;
  const d={x:m.x+Math.cos(a)*travel,y:m.y+Math.sin(a)*travel*.65,kind:isHorse(t)||t==='gen'?'horse':'foot',scale:m.reg.displayScale||1,idx,hus:t==='hus',flip:Math.cos(a)<0,rot:(Math.random()-.5)*.18,flag:m.role==='flag'?N:null,col:t==='mil'?'#6d5238':N.coat,blood:blast?1.35:1,age:0};
  // Reserve a resting position now, but reveal the body only after the fall.
  placeFallen(v,d);const dead=v.dead.pop();
  bloodBurst(v,m.x,m.y,blast?10:5,Math.cos(a),Math.sin(a),blast?9:4,blast?10:5);
  v.falls.push({x:m.x,y:m.y,l:0,max:blast?1.15:.85,blast,trail:0,dead,N,dir:m.reg.side?1:-1,turn:Math.cos(a)<0?-1:1,
    m:{...m,walk:0,shotT:null},r:{...m.reg,moving:false,melee:false,bayonet:false,broken:false,reload:0,fixUntil:0}});
  if(v.falls.length>100){const old=v.falls.shift();v.dead.push(old.dead)}
}
function bloodBurst(v,x,y,count,dx=0,dy=0,z=0,force=5){
  v.blood=v.blood||[];
  for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=2+Math.random()*force;
    v.blood.push({x,y,z,vx:dx*force+Math.cos(a)*s,vy:dy*force*.55+Math.sin(a)*s*.6,vz:3+Math.random()*7,l:0,max:1.15,size:.65+Math.random()*.75})}
  const cap=v.low?120:320;if(v.blood.length>cap)v.blood.splice(0,v.blood.length-cap);
}
function drawBlood(c,b,project=P){
  const q=project(b.x,b.y),alpha=Math.min(1,(b.max-b.l)*3),h=Math.max(0,b.z)*q[2];c.save();c.globalAlpha*=alpha;c.strokeStyle='#b02d24';c.fillStyle='#871b17';c.lineWidth=b.size*q[2];
  c.beginPath();c.moveTo(q[0]-b.vx*.025*q[2],q[1]-h+b.vz*.025*q[2]);c.lineTo(q[0],q[1]-h);c.stroke();c.beginPath();c.arc(q[0],q[1]-h,b.size*.7*q[2],0,7);c.fill();c.restore();
}
function fallPose(f){const p=clamp(f.l/f.max,0,1),slide=1-Math.pow(1-p,2);return{x:f.x+(f.dead.x-f.x)*slide,y:f.y+(f.dead.y-f.y)*slide,lift:f.blast?Math.sin(Math.PI*p)*(f.dead.kind==='horse'?16:26):0,p}}
function drawFall(c,f,px,py,s){
  const pose=fallPose(f),p=pose.p,blend=clamp((p-.65)/.35,0,1),sc=figureScale(f.r,f.m)*s*(f.r.displayScale||1);
  c.save();c.translate(px,py);c.fillStyle='rgba(20,17,13,.2)';c.beginPath();c.ellipse(0,0,(3+p*5)*s,1.4*s,0,0,7);c.fill();c.restore();
  c.save();c.translate(px,py-pose.lift*s);c.rotate(f.turn*(p*p*1.45));c.scale(sc,sc);c.translate(0,3*p);c.globalAlpha=1-blend;
  if(!drawPaintedFig(c,f.m,f.r,f.N,f.dir,(f.m.hitT||0)+f.l))drawFig(c,f.m,f.r,f.N,f.dir,0);
  c.fillStyle='#8e2420';c.beginPath();c.ellipse(.25,-1.7,.85,1.15,-.35,0,7);c.fill();c.restore();
  if(blend){c.save();c.globalAlpha=blend;drawDead(c,f.dead,px,py,s);c.restore()}
}
function drawDead(c,d,px,py,s){
  const sc=(d.kind==='foot'?1.65:1.75)*s*(d.scale||1);c.save();c.translate(px,py);c.rotate(d.rot);if(d.flip)c.scale(-1,1);
  if(d.blood){const spread=.35+.65*clamp((d.age??1)/1.2,0,1);c.save();c.scale(spread,spread);c.fillStyle='rgba(91,18,15,.72)';c.beginPath();c.ellipse(.7*sc,.1*sc,(3.8+d.blood)*sc,1.65*sc,-.15,0,7);c.fill();for(let i=0;i<5;i++){const a=i*2.4+d.x;c.beginPath();c.ellipse(Math.cos(a)*(4+i*.4)*sc,Math.sin(a)*2*sc,(.35+i*.07)*sc,.26*sc,a,0,7);c.fill()}c.restore()}
  c.fillStyle='rgba(20,17,13,.22)';c.beginPath();c.ellipse(0,0,7*sc,1.3*sc,0,0,7);c.fill();
  if(d.kind==='foot'){const set=UNIT_IMAGES?.['fallen-infantry'],im=Array.isArray(set)?set[d.idx]:set;
    if(im?.complete&&im.naturalWidth){const w=14.5*sc,h=w*im.naturalHeight/im.naturalWidth;c.drawImage(im,-w/2,-h*.8,w,h)}
    else{c.fillStyle=d.col||'#65503b';c.fillRect(-5*sc,-1.5*sc,10*sc,2*sc)}
    if(d.flag){c.strokeStyle='#463624';c.lineWidth=.5*sc;c.beginPath();c.moveTo(-6*sc,1*sc);c.lineTo(7*sc,-1.6*sc);c.stroke();c.fillStyle=d.flag.col;c.beginPath();c.moveTo(3.4*sc,-1.1*sc);c.lineTo(7.4*sc,-2.6*sc);c.lineTo(7.6*sc,.4*sc);c.closePath();c.fill()}}
  else{const im=UNIT_IMAGES?.[d.hus?'fallen-hussar':'fallen-horse'];
    if(im?.complete&&im.naturalWidth){const w=10.5*sc,h=w*im.naturalHeight/im.naturalWidth;c.globalAlpha*=.92;c.drawImage(im,-w/2,-h*.8,w,h)}
    else{const set=UNIT_IMAGES?.[d.hus?'hussar':'cavalry'],old=Array.isArray(set)?set[d.idx]:set;if(old?.complete&&old.naturalWidth){const w=9.5*sc,h=w*old.naturalHeight/old.naturalWidth;c.translate(0,-1.6*sc);c.rotate(-1.42);c.globalAlpha*=.92;c.drawImage(old,-w/2,-h/2,w,h)}else{c.fillStyle='#58402b';c.fillRect(-5*sc,-2*sc,10*sc,3*sc);c.fillStyle=d.col||'#65503b';c.fillRect(-2*sc,-3*sc,4*sc,2*sc)}}}
  if(d.blood){c.fillStyle='rgba(117,24,20,.85)';c.beginPath();c.ellipse(.8*sc,-1.2*sc,1.8*sc,.8*sc,.22,0,7);c.fill()}
  c.restore();
}
function bodyFlat(v,m,N,t,coat){
  const g=v.g;g.save();g.translate(m.x,m.y);g.rotate(Math.random()*Math.PI*2);
  if(m.role==='flag'){g.fillStyle='#5a4128';g.fillRect(-6,-.3,12,.6);g.fillStyle=N.col;g.fillRect(-6,-.3,5,4);g.fillStyle='#f1ead8';g.fillRect(-4.2,-.3,1.4,4)}
  if(isFoot(t)||m.role==='officer'){g.fillStyle=coat;g.fillRect(-1.7,-.9,3.4,1.8);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-1.7,-.9,3.4,1.8);g.fillStyle='#e0d2b6';g.fillRect(1.7,-.6,1,1.2);g.fillStyle='#2a2420';g.fillRect(-3,1.2,4.5,.5)}
  else{g.fillStyle=t==='hus'?'#7a5b3a':'#4a301c';g.fillRect(-3.4,-1.5,6.8,3);g.fillStyle=t==='hus'?'#2f6b3a':coat;g.fillRect(-1,1.5,2.2,1.6)}
  g.restore();
}
let BTF=[1,0,0];
function drawMan(c,m,r,N,dir,T0,px,py,sc){const a=BTF[0];c.setTransform(a*sc,0,0,a*sc,BTF[1]+px*a,BTF[2]+py*a);
  c.fillStyle='rgba(18,18,14,.22)';c.beginPath();c.ellipse(.65,3.1,isHorse(r.type)||r.type==='gen'?3.4:isGun(r.type)?3:1.8,.65,0,0,7);c.fill();
  if(!drawPaintedFig(c,m,r,N,dir,T0)){drawFig(c,m,r,N,dir,T0);drawFigDetails(c,m,r,N,dir,T0);drawUniformDetails(c,m,r,N,-5,8,5.8)}}
function drawBattleFlag(c,N,horse,T0,seed,moving=0){
  const w=horse?5:7.2,h=horse?2.8:4.4,top=horse?-9.7:-12.7,wave=Math.sin(T0*(4+moving*4)+seed*.12)*(.65+moving*1.25);
  c.strokeStyle='#4c3625';c.lineWidth=.42;c.beginPath();c.moveTo(1.9,2);c.lineTo(1.9,top-.7);c.stroke();
  c.fillStyle='#d6bb72';c.beginPath();c.arc(1.9,top-.7,.38,0,7);c.fill();
  c.save();c.translate(2,top);
  const edge=y=>Math.sin(y*1.7+T0*(5+moving*4)+seed*.12)*(.4+moving*.65)+wave*y/h;
  c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(w*.45,-.35,w,edge(0));
  if(horse){c.lineTo(w-1.1,h*.35+edge(h*.35));c.lineTo(w-.65,h*.5+edge(h*.5));c.lineTo(w-1.1,h*.65+edge(h*.65))}
  else{c.lineTo(w-.45+wave*.65,h*.53+edge(h*.53));c.lineTo(w,h+edge(h))}
  c.quadraticCurveTo(w*.52,h-.25,0,h);c.closePath();
  c.fillStyle=N.name==='Prussia'||N.name==='Austria'||N.name==='France'?'#eee9d9':N.name==='Russia'?'#315b38':N.name==='Sweden'?'#26599a':N.name==='Britain'?'#263c76':'#b39261';c.fill();c.clip();
  if(N.name==='Britain'){
    c.strokeStyle='#eee8d7';c.lineWidth=1.45;c.beginPath();c.moveTo(0,0);c.lineTo(w,h);c.moveTo(w,0);c.lineTo(0,h);c.stroke();
    c.fillStyle='#efe9d9';c.fillRect(w*.39,0,w*.22,h);c.fillRect(0,h*.35,w,h*.3);
    c.fillStyle='#ab3934';c.fillRect(w*.44,0,w*.12,h);c.fillRect(0,h*.42,w,h*.16);
  }else if(N.name==='Sweden'){
    c.fillStyle='#e0ba4a';c.fillRect(w*.38,0,w*.2,h);c.fillRect(0,h*.41,w,h*.2);
  }else if(N.name==='France'){
    c.fillStyle='#96a9c1';c.fillRect(w*.43,0,w*.12,h);c.fillRect(0,h*.43,w,h*.14);
    c.fillStyle='#be9e4f';for(const x of[w*.16,w*.75])for(const y of[h*.18,h*.75]){c.beginPath();c.arc(x,y,.2,0,7);c.fill();c.fillRect(x-.06,y-.38,.12,.35)}
  }else if(N.name==='Prussia'||N.name==='Austria'||N.name==='Russia'){
    if(N.name==='Austria'){c.fillStyle='#d7b950';c.fillRect(0,0,w,.3);c.fillRect(0,h-.3,w,.3)}
    c.fillStyle='#25221d';const x=w*.53,y=h*.5;
    c.beginPath();c.moveTo(x,y-.45);c.lineTo(x-1.1,y-.95);c.lineTo(x-1.8,y-.45);c.lineTo(x-.9,y-.1);c.lineTo(x-.45,y+.75);c.lineTo(x,y+.4);c.lineTo(x+.45,y+.75);c.lineTo(x+.9,y-.1);c.lineTo(x+1.8,y-.45);c.lineTo(x+1.1,y-.95);c.closePath();c.fill();
    c.beginPath();c.arc(x,y-.55,.43,0,7);c.fill();
    if(N.name!=='Prussia'){c.beginPath();c.arc(x-.42,y-.9,.25,0,7);c.arc(x+.42,y-.9,.25,0,7);c.fill()}
    c.fillStyle='#c4a34b';c.fillRect(x-.48,y-.98,.96,.18);
  }else{c.fillStyle='#453322';c.beginPath();c.arc(w*.5,h*.5,.7,0,7);c.fill()}
  const fold=c.createLinearGradient(0,0,w,0);fold.addColorStop(0,'rgba(255,255,255,.16)');fold.addColorStop(.28,'rgba(35,30,25,.22)');fold.addColorStop(.55,'rgba(255,255,255,.2)');fold.addColorStop(.78,'rgba(40,32,25,.18)');fold.addColorStop(1,'rgba(255,255,255,.14)');c.fillStyle=fold;c.fillRect(0,0,w,h);
  c.strokeStyle='rgba(40,33,26,.19)';c.lineWidth=.13;for(const x of[w*.28,w*.72]){c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x-.38,h*.5,x+.16,h);c.stroke()}
  c.restore();c.strokeStyle='rgba(45,36,25,.65)';c.lineWidth=.18;c.beginPath();c.moveTo(2,top);c.lineTo(2+w,top+edge(0));c.stroke();
}
// Presentation state uses simulation time, so blends stop exactly when battle is paused.
function figurePose(m,kind,time){
  let p=m.paintPose;if(!p||time<p.changed){p=m.paintPose={kind,from:null,changed:time,duration:.24}}
  if(p.kind!==kind){p.from=p.kind;p.kind=kind;p.changed=time;p.duration=/walk|gallop/.test(kind)&&/walk|gallop/.test(p.from)?.085:/howitzer/.test(kind)?.45:.24}
  const linear=clamp((time-p.changed)/p.duration,0,1),mix=linear*linear*(3-2*linear);if(linear===1)p.from=null;
  return{from:p.from,mix:p.from?mix:1};
}
function figureMotion(m,r,time){const walk=m.walk??(r.moving?1:0),targets={walk,charge:walk>.1&&!r.broken&&!r.routing&&(r.bayonet||r.mode==='charge')?1:0,work:!r.moving&&m.shotT!=null&&time-m.shotT>.4&&(isGun(r.type)?(m.cd||0):r.reload)>0?1:0,drum:r.drumUntil>time?1:r.forming?.5:0};
  let v=m.paintMotion;if(!v||time<v.time)v=m.paintMotion={...targets,time,drumPhase:time*12};
  const dt=clamp(time-v.time,0,.25),blend=1-Math.exp(-dt*10);for(const key of Object.keys(targets))v[key]+=(targets[key]-v[key])*blend;
  v.drumPhase+=dt*(12+v.drum*10);v.time=time;return v;
}
function uniformStyle(N){
  const styles=uniformStyle.styles||(uniformStyle.styles={
    Prussia:{lapel:'#b93b35',vest:'#eee2c5',belt:'#fff2d3',trim:'#e7dac0',plume:'#eee8d5',cross:false,label:'Dark navy · red cuffs · ivory waistcoat'},
    Britain:{lapel:'#203e79',vest:'#e9d6b7',belt:'#fff4dc',trim:'#e9d7b1',plume:'#c93630',cross:true,label:'Scarlet · navy lapels · white crossbelts'},
    France:{lapel:'#b02c38',vest:'#ecf0eb',belt:'#f5eee0',trim:'#f0f0e7',plume:'#f4eee1',cross:false,label:'Sky blue · crimson lapels · silver hat trim'},
    Austria:{lapel:'#b92c32',vest:'#cdb991',belt:'#3a2b24',trim:'#d7af54',plume:'#181b1b',cross:true,label:'Ivory · red lapels · dark crossbelts'},
    Russia:{lapel:'#dc4434',vest:'#b9342b',belt:'#e8d3aa',trim:'#d7ae4d',plume:'#d74930',cross:true,label:'Forest green · red waistcoat · gold trim'},
    Sweden:{lapel:'#f4cf44',vest:'#e8bd36',belt:'#efdcac',trim:'#f6d75b',plume:'#f5d044',cross:false,label:'Royal blue · yellow waistcoat and cuffs'},
    'Free City':{lapel:'#e9d9b9',vest:'#947351',belt:'#d7c9ab',trim:'#bba889',plume:'#f0e6ce',cross:false,label:'Brown · cream cuffs · buff belts'}
  });return styles[N.name]||styles.Prussia;
}
function drawUniformDetails(c,m,r,N,y,h,w){
  if(isGun(r.type)&&!m.role)return;
  const u=uniformStyle(N),horse=isHorse(r.type)||r.type==='gen',mil=r.type==='mil';
  c.save();c.translate(0,y);c.scale(w,h);
  // Small tailored surfaces preserve the painted shading and animated body silhouette.
  const top=horse?.18:.27,bottom=horse?.35:.47,half=horse?.10:.16;
  c.fillStyle=mil?N.col:u.vest;c.globalAlpha*=.86;c.beginPath();c.moveTo(-half*.6,top);c.lineTo(half*.6,top);c.lineTo(half,bottom);c.lineTo(-half,bottom);c.closePath();c.fill();
  c.fillStyle=u.lapel;for(const side of [-1,1]){c.beginPath();c.moveTo(side*half,top);c.lineTo(side*half*.35,top+.05);c.lineTo(side*half*.55,bottom);c.lineTo(side*half*1.25,bottom-.025);c.closePath();c.fill()}
  c.strokeStyle=u.belt;c.lineWidth=horse?.025:.035;c.beginPath();c.moveTo(-half*1.3,top+.005);c.lineTo(half,bottom);if(u.cross){c.moveTo(half*1.3,top+.005);c.lineTo(-half,bottom)}c.stroke();
  if(!horse){c.fillStyle=u.lapel;c.fillRect(-.32,.43,.12,.035);c.fillRect(.22,.51,.12,.035)}
  c.strokeStyle=u.trim;c.lineWidth=.014;c.beginPath();c.moveTo(-half*1.7,horse?.095:.15);c.quadraticCurveTo(0,horse?.06:.11,half*1.7,horse?.095:.15);c.stroke();
  c.fillStyle=u.plume;c.beginPath();c.ellipse(half*.75,horse?.07:.105,.027,N.name==='Sweden'?.065:.025,-.25,0,7);c.fill();
  if(m.role==='sergeant'||m.role==='officer'||m.role==='general'){
    c.strokeStyle=m.role==='sergeant'?'#f1cf70':'#ffdd87';c.lineWidth=m.role==='general'?.055:.035;c.beginPath();c.moveTo(-half,top+.03);c.lineTo(half,bottom-.01);c.stroke();
  }
  if(m.role==='sergeant'){c.strokeStyle='#e4d6b0';c.lineWidth=.018;c.beginPath();c.moveTo(.40,.78);c.lineTo(.40,.06);c.stroke();c.fillStyle='#d4d5c8';c.beginPath();c.moveTo(.40,.01);c.lineTo(.35,.075);c.lineTo(.45,.075);c.closePath();c.fill()}
  c.restore();
}
function drawPaintedFig(c,m,r,N,dir,T0){
  if(!UNIT_IMAGES)return false;
  const t=r.type,gait=m.gait??(T0*7+m.ox),walking=(m.walk??(r.moving?1:0))>.12,phase=Math.sin(gait),fleeing=r.broken||r.routing,charging=walking&&!fleeing&&(r.bayonet||r.mode==='charge');
  const since=m.shotT!=null?T0-m.shotT:99,reloadLen=isGun(t)?(t==='how'?BT.howReload:BT.artReload)*1.25:isHorse(t)?3.2:BT.infReload*1.35;
  let kind=m.role==='drum'&&isFoot(t)?'drummer':m.role==='general'?'general':m.role==='aide'?'aide':m.role==='officer'?(isHorse(t)?'aide':'officer'):m.role==='flag'&&t==='inf'?'infantry':t==='mil'?'militia':t==='hus'?'hussar':isFoot(t)||isGun(t)&&m.role?'infantry':isHorse(t)||t==='gen'?'cavalry':t==='how'&&r.hs!=='ready'?'howitzer-limbered':t==='how'?'howitzer-deployed':'artillery';
  if(t==='inf'&&!m.role){if(fleeing)kind='infantry-flee';else if(r.bayonet||r.melee)kind='infantry-charge';else if(since<.32)kind='infantry-fire';else if(since<reloadLen&&r.reload>0)kind='infantry-reload';else if(r.bayonetsFixed&&!walking)kind='infantry-charge'}
  if(t==='mil'&&!m.role){if(fleeing)kind='militia-flee';else if(r.bayonet||r.melee)kind='militia-charge';else if(since<.32)kind='militia-fire';else if(since<reloadLen&&r.reload>0)kind='militia-reload';else if(r.bayonetsFixed&&!walking)kind='militia-charge'}
  if(isHorse(t)&&!m.role&&r.melee)kind=t==='hus'?'hussar-melee':'cavalry-melee';
  if(walking){const frame=((Math.floor(gait/1.57)%4)+4)%4+1;
    if(kind==='infantry'||kind==='militia')kind+='-walk'+frame;
    else if(kind==='cavalry'||kind==='hussar'){const frame=[0,1,2,1][((Math.floor(gait/1.57)%4)+4)%4];if(frame)kind+='-gallop'+(frame===2?'2':'')}}
  const nation=Math.max(0,NATIONS.indexOf(N));
  const index=N===CITYNAT?6:nation;
  const images=UNIT_IMAGES[kind],image=Array.isArray(images)?images[index]:images;
  if(!image||!image.complete||!image.naturalWidth)return false;
  const travellingGun=isGun(t)&&!m.role&&walking;
  const pose=figurePose(m,kind,T0),motion=figureMotion(m,r,T0);
  c.save();const hitAge=m.hitT==null?99:T0-m.hitT,hit=hitAge>=0&&hitAge<.32?Math.sin(Math.PI*hitAge/.32):0;
  if(hit){c.translate((m.hitDX||0)*hit*1.8,(m.hitDY||0)*hit*.9);c.rotate(((m.hitDX||0)<0?-1:1)*hit*.22)}
  if(motion.charge>.001){c.translate(Math.sin(gait)*.3*motion.charge,-Math.abs(Math.sin(gait))*.8*motion.charge);c.rotate((dir*.15+Math.sin(gait)*.055)*motion.charge)}
  if(isGun(t)&&!m.role){c.translate(0,-Math.abs(Math.sin(gait*1.8))*.16*motion.walk);c.rotate(Math.sin(gait)*.018*motion.walk)}
  const bob=Math.abs(Math.sin(gait))*(isHorse(t)||t==='gen'?.35:.2)*motion.walk+Math.sin(T0*2+m.ox)*.045*(1-motion.walk);
  const baseKind=kind.startsWith('infantry-')?'infantry':kind.startsWith('militia-')?'militia':kind.startsWith('cavalry-')?'cavalry':kind.startsWith('hussar-')?'hussar':kind,baseSet=UNIT_IMAGES[baseKind],baseImage=Array.isArray(baseSet)?baseSet[index]:baseSet;
  const baseWidth=baseKind==='infantry'||baseKind==='militia'||baseKind==='drummer'||baseKind==='officer'?5.8:baseKind==='colour-bearer'?7.5:baseKind==='general'?11.5:baseKind==='aide'?10:baseKind==='cavalry'||baseKind==='hussar'?(t==='gen'?10.5:9.5):baseKind==='howitzer-limbered'||baseKind==='howitzer-deployed'?15:10.3;
  const height=baseWidth*(baseImage?.naturalHeight||image.naturalHeight)/(baseImage?.naturalWidth||image.naturalWidth),width=height*image.naturalWidth/image.naturalHeight;
  const recoil=since<.3?(.3-since)*(isGun(t)&&!m.role?9:2.2):0,crouch=isFoot(t)&&since>.3&&since<reloadLen?.035:0;
  const figY=3.5-height*(1-crouch)-bob+recoil*(dir>0?-1:1)*.4,figH=height*(1-crouch);
  const drawBody=(im,alpha)=>{if(!im?.complete||!im.naturalWidth||alpha<=0)return;const w=figH*im.naturalWidth/im.naturalHeight;c.save();c.globalAlpha*=alpha;
    const articulated=(isFoot(t)&&(m.role||charging||/-(flee|reload|fire)$/.test(kind))||t==='gen'||isHorse(t)&&(m.role||charging))&&motion.walk>.01;
    if(articulated){const cut=.72,legH=figH*(1-cut),legs=isHorse(t)||t==='gen'?4:2,stride=Math.sin(gait)*(charging?2.2:.65)*motion.walk;
      c.drawImage(im,0,0,im.naturalWidth,im.naturalHeight*cut,-w/2,figY,w,figH*cut);
      for(let leg=0;leg<legs;leg++){const sign=leg%2?1:-1,hip=-w/2+(leg+.5)*w/legs,hipY=figY+figH*cut;c.save();c.translate(hip+sign*stride*.3,hipY-Math.max(0,sign*stride)*.4);c.rotate(sign*stride*(charging?.24:.08));c.translate(-hip,-hipY);
        c.drawImage(im,leg*im.naturalWidth/legs,im.naturalHeight*cut,im.naturalWidth/legs,im.naturalHeight*(1-cut),-w/2+leg*w/legs,figY+figH*cut,w/legs,legH);c.restore()}
    }else c.drawImage(im,-w/2,figY,w,figH);c.restore();
  };
  const previousSet=pose.from&&UNIT_IMAGES[pose.from],previousImage=Array.isArray(previousSet)?previousSet[index]:previousSet,blending=previousImage?.complete&&previousImage.naturalWidth;
  if(blending)drawBody(previousImage,1-pose.mix);drawBody(image,blending?pose.mix:1);
  if(!/-(fire|reload|charge|flee|melee)$/.test(kind))drawUniformDetails(c,m,r,N,figY,figH,baseWidth);
  if(isHorse(t)&&!m.role&&!fleeing&&!r.melee&&since>=0&&since<reloadLen){
    // Carbines and pistols use the same shot clock as the volley and recoil.
    const firing=since<.32,loading=!firing&&r.reload>0,reach=firing?1:Math.sin(T0*7+m.ox)*.25;
    if(firing||loading){c.save();c.translate(1,-5.1);c.rotate(firing?(dir>0?1.25:-1.25):-.3+reach);
      c.strokeStyle='#d9b18e';c.lineWidth=.65;c.beginPath();c.moveTo(-.5,1);c.lineTo(.3,-.2-reach*.3);c.stroke();
      c.strokeStyle='#654c31';c.lineWidth=.48;c.beginPath();c.moveTo(0,.8);c.lineTo(0,t==='hus'?-1.4:-3.4);c.stroke();
      c.strokeStyle='#ddd3ba';c.lineWidth=.2;c.beginPath();c.moveTo(.12,0);c.lineTo(.12,t==='hus'?-1.8:-3.8);c.stroke();
      if(firing){c.fillStyle=`rgba(255,225,145,${1-since/.32})`;c.beginPath();c.arc(.12,t==='hus'?-1.9:-3.9,.7,0,7);c.fill()}c.restore();
    }
  }
  if(isFoot(t)&&!m.role&&(r.bayonetsFixed||r.fixUntil>T0)){
    const fixing=r.fixUntil>T0,progress=fixing?clamp((T0-r.fixStarted)/3,0,1):1;
    c.save();c.translate(1.45,-3.2);c.rotate(fixing?-.12+Math.sin(T0*8+m.rank)*.035:dir>0?2.5:-.25);
    c.strokeStyle='#654c31';c.lineWidth=.34;c.beginPath();c.moveTo(0,2);c.lineTo(0,-3.3);c.stroke();
    c.strokeStyle='#eee8d6';c.lineWidth=.2;c.beginPath();c.moveTo(0,-3.3);c.lineTo(.18,-3.3-1.8*progress);c.stroke();
    if(fixing){c.fillStyle='#d9b18e';c.beginPath();c.arc(.1,-1.2-progress*1.8+Math.sin(T0*8)*.18,.34,0,7);c.fill()}c.restore();
  }
  if(hit&&!isGun(t)){c.fillStyle=`rgba(193,71,47,${hit*.7})`;c.beginPath();c.ellipse(.2,-2.1,1.05,1.5,-.3,0,7);c.fill()}
  if(isGun(t)&&!m.role){
    // Rotate each wheel's inner texture inside its fixed rim, preserving the painted art.
    const wheels=kind==='howitzer-limbered'?[[.748,.69,.052,.18],[.924,.64,.058,.19]]:t==='how'?[[.18,.36,.145,.25],[.532,.605,.195,.315]]:[[.135,.697,.096,.215],[.499,.541,.087,.165]];
    for(const [wx,wy,rx,ry]of wheels){c.save();c.translate((wx-.5)*width,figY+wy*figH);c.scale(rx*width,ry*figH);c.beginPath();c.arc(0,0,.88,0,Math.PI*2);c.clip();c.rotate(gait*.55);c.drawImage(image,(wx-rx)*image.naturalWidth,(wy-ry)*image.naturalHeight,rx*2*image.naturalWidth,ry*2*image.naturalHeight,-1,-1,2,2);c.restore()}
  }
  if(isGun(t)&&!m.role){const set=UNIT_IMAGES['gun-crew'],crew=Array.isArray(set)?set[index]:set;if(crew?.complete&&crew.naturalWidth){for(let i=0;i<3;i++){if(m.crew&&!m.crew[i].alive)continue;
    const ph=since/reloadLen,work=Math.max(0,Math.sin((ph*2-i*.45)*Math.PI))*motion.work;
    const x=[-5.1,5.2,.4][i]+(i===0?work*1.15:i===1?-work*.8:0),y=[.8,1.3,-2.1][i]+work*.3,h=4.4,w=h*crew.naturalWidth/crew.naturalHeight;
    c.save();c.translate(x,y);c.rotate(Math.sin(gait+i)*.06*motion.walk+(i===0?.2:-.15)*work*(1-motion.walk));
    if(motion.walk>.01){const split=.65,stride=Math.sin(gait+i*1.7)*.55*motion.walk;c.drawImage(crew,0,0,crew.naturalWidth,crew.naturalHeight*split,-w*.5,-h,w,h*split);
      for(let leg=0;leg<2;leg++){const step=(leg?1:-1)*stride;c.drawImage(crew,leg*crew.naturalWidth/2,crew.naturalHeight*split,crew.naturalWidth/2,crew.naturalHeight*(1-split),-w*.5+leg*w*.5+step*.25,-h*(1-split)-Math.max(0,step)*.35,w*.5,h*(1-split))}}
    else c.drawImage(crew,-w*.5,-h,w,h);c.restore()}}}
  if(isFoot(t)&&!m.role&&!/^(infantry|militia)-(fire|reload|charge|flee)$/.test(kind)){
    if(since<.3){c.fillStyle='#4a3626';c.save();c.translate(1.1,-4.1);c.rotate(dir>0?2.9:-.25);c.fillRect(-.22,-5.8,.44,5.8);c.restore();
      c.fillStyle=`rgba(255,226,140,${1-since/.3})`;c.beginPath();c.arc(dir>0?1.6:1.4,dir>0?.6:-9.2,.9*(1.2-since*2),0,7);c.fill()}
    else if(since<reloadLen){const ph=(since-.3)/(reloadLen-.3),ram=ph>.35&&ph<.8?Math.abs(Math.sin(T0*9+m.ox))*1.6:0;
      c.strokeStyle='#4a3626';c.lineWidth=.42;c.beginPath();c.moveTo(1.4,-1.2);c.lineTo(1.75,-7.6);c.stroke();
      if(ram){c.strokeStyle='#cfc6b4';c.lineWidth=.2;c.beginPath();c.moveTo(1.75,-7.6-ram);c.lineTo(1.65,-5.4-ram);c.stroke()}
      if(ph<.3){c.fillStyle='#e9e1cf';c.fillRect(.2,-5.2,.5,.3)}}}
  if(isGun(t)&&!m.role&&!travellingGun&&since<reloadLen&&since>.4){const sw=Math.sin(T0*5+m.ox)*1.4;c.strokeStyle='#6d5134';c.lineWidth=.42;c.beginPath();c.moveTo(-1.2+sw*.4,-2.8);c.lineTo(.3+sw,dir>0?2.5:-5.6);c.stroke();
    c.fillStyle='#3b3328';c.beginPath();c.arc(.3+sw,dir>0?2.5:-5.6,.5,0,7);c.fill()}
  if(m.role==='flag'){
    drawBattleFlag(c,N,isHorse(t),T0,m.ox||0,motion.walk);
  }else if(m.role==='drum'){
    const beat=Math.sin(motion.drumPhase+m.ox)*(.8+motion.drum*.4),x=1.45;c.fillStyle='#4c3022';c.beginPath();c.moveTo(x-.78,-.95);c.quadraticCurveTo(x,-.72,x+.78,-.95);c.lineTo(x+.78,.55);c.quadraticCurveTo(x,.94,x-.78,.55);c.closePath();c.fill();
    c.fillStyle='#8b5633';c.beginPath();c.moveTo(x-.65,-.75);c.quadraticCurveTo(x,-.58,x+.65,-.75);c.lineTo(x+.65,.48);c.quadraticCurveTo(x,.71,x-.65,.48);c.closePath();c.fill();
    c.fillStyle=N.col;c.fillRect(x-.64,-.38,1.28,.3);c.strokeStyle='#d9c29b';c.lineWidth=.12;c.beginPath();for(let xx=x-.55;xx<x+.66;xx+=.4){c.moveTo(xx,-.67);c.lineTo(xx+.2,.5)}c.stroke();
    c.fillStyle='#e9ddc6';for(const yy of[-.88,.58]){c.beginPath();c.ellipse(x,yy,.79,.23,0,0,7);c.fill()}
    c.strokeStyle='#c6a878';c.lineWidth=.18;c.beginPath();c.moveTo(.95,-2.35+beat);c.lineTo(x,-.88);c.moveTo(1.95,-2.35-beat);c.lineTo(x+.16,-.88);c.stroke();
  }else if((m.role==='officer'||m.role==='general')&&!['officer','general','aide'].includes(kind)){
    c.strokeStyle='#e1b85c';c.lineWidth=.32;c.beginPath();c.moveTo(-1.2,-4);c.lineTo(1.15,-1.2);c.stroke();
  }
  if(t==='gen'&&Math.sin(T0*1.5)>.45){c.strokeStyle='#d8b66c';c.lineWidth=.34;c.beginPath();c.moveTo(.5,-5);c.lineTo(3.6,-7);c.stroke()}
  if(t==='mil'){c.strokeStyle=N.col;c.lineWidth=.48;c.beginPath();c.moveTo(-1.3,-4.3);c.lineTo(1.15,-1.55);c.stroke()}
  c.restore();return true;
}
function drawFigDetails(c,m,r,N,dir,T0){
  const t=r.type,role=m.role,move=r.moving?Math.sin(T0*7+m.ox):0;
  if(isFoot(t)){
    const Y=-Math.abs(move)*.3,coat=t==='mil'?'#6d5238':N.coat;
    c.fillStyle='rgba(12,10,8,.25)';c.beginPath();c.moveTo(-1.2,Y+.8);c.lineTo(-1.55,Y+2.1);c.lineTo(-.25,Y+1.65);c.lineTo(0,Y+.85);c.fill();c.beginPath();c.moveTo(1.2,Y+.8);c.lineTo(1.55,Y+2.1);c.lineTo(.25,Y+1.65);c.lineTo(0,Y+.85);c.fill();
    c.strokeStyle='rgba(15,13,11,.5)';c.lineWidth=.15;c.beginPath();c.moveTo(-1.3,Y-1.8);c.lineTo(-1.3,Y+.95);c.moveTo(1.3,Y-1.8);c.lineTo(1.3,Y+.95);c.stroke();
    c.fillStyle='rgba(255,244,216,.24)';c.fillRect(-1.13,Y-1.85,.22,2.55);
    c.fillStyle=coat;c.beginPath();c.moveTo(-1.2,Y-1.8);c.lineTo(-2,Y-.95);c.lineTo(-1.7,Y+.2);c.lineTo(-1.18,Y+.15);c.closePath();c.fill();
    c.fillStyle='#d4ae89';c.beginPath();c.ellipse(0,Y-2.48,.65,.63,0,0,7);c.fill();
    c.fillStyle='#312a22';c.fillRect(-.8,Y-2.68,.19,.14);c.fillRect(.6,Y-2.68,.19,.14);
    if(t==='mil'){
      c.fillStyle='#403323';c.beginPath();c.ellipse(0,Y-3.15,1.65,.37,0,0,7);c.fill();c.fillStyle='#5b4730';c.beginPath();c.ellipse(0,Y-3.55,.84,.55,0,0,Math.PI*2);c.fill();
    }else{
      c.fillStyle='#171715';c.beginPath();c.moveTo(-1.8,Y-3.15);c.lineTo(-.95,Y-3.83);c.lineTo(0,Y-3.34);c.lineTo(.95,Y-3.83);c.lineTo(1.8,Y-3.15);c.closePath();c.fill();
      c.strokeStyle='#c4aa6c';c.lineWidth=.13;c.beginPath();c.moveTo(-1.55,Y-3.15);c.lineTo(0,Y-3.34);c.lineTo(1.55,Y-3.15);c.stroke();
      c.fillStyle='#e8e4d6';c.fillRect(-.58,Y-2.05,1.16,.34);
    }
    if(role==='flag'){c.fillStyle='rgba(245,232,204,.85)';c.beginPath();c.arc(4.9,Y-8.5,.55,0,7);c.fill();return}
    if(role==='drum'){c.strokeStyle='#ead8b4';c.lineWidth=.18;c.beginPath();c.arc(1.7,Y+.35,1.42,0,7);c.stroke();return}
    if(role==='officer'){c.strokeStyle='#d9b46a';c.lineWidth=.25;c.beginPath();c.moveTo(1.25,Y-1.2);c.lineTo(2.1,Y+1.4);c.stroke();return}
    c.strokeStyle='#3b2c20';c.lineWidth=.48;c.lineCap='round';c.beginPath();c.moveTo(1.46,Y+.2);c.lineTo(1.63,Y-4.7);c.stroke();c.strokeStyle='#a4a29a';c.lineWidth=.2;c.beginPath();c.moveTo(1.63,Y-4.7);c.lineTo(1.66,Y-5.65);c.stroke();c.lineCap='butt';
  }else if(isHorse(t)||t==='gen'){
    const Y=-Math.abs(move)*.4,h=t==='gen'?1.08:1;
    c.fillStyle=t==='hus'?'#94734e':t==='gen'?'#d0c5ae':'#69472d';
    c.beginPath();c.ellipse(0,Y-.12,1.5*h,3.25*h,0,0,7);c.fill();
    c.beginPath();c.moveTo(-.62,Y-dir*2.4);c.quadraticCurveTo(-1.15,Y-dir*4.6,-.43,Y-dir*4.9);c.lineTo(.78,Y-dir*4.7);c.quadraticCurveTo(1.4,Y-dir*3.7,.7,Y-dir*2.4);c.fill();
    c.fillStyle='#3b2c22';c.beginPath();c.ellipse(0,Y-dir*4.65,.9,.72,0,0,7);c.fill();
    c.strokeStyle='#292018';c.lineWidth=.34;c.beginPath();c.moveTo(-1.25,Y+dir*2);c.quadraticCurveTo(-2.4,Y+dir*4.3,-1.65,Y+dir*5.1);c.stroke();
    c.strokeStyle='#d7b77c';c.lineWidth=.17;c.beginPath();c.moveTo(-.8,Y-dir*3.7);c.lineTo(.8,Y-dir*2.1);c.stroke();
    c.fillStyle=t==='hus'?'#2e6241':N.coat;c.beginPath();c.ellipse(0,Y-1.05,1.15,1.18,0,0,7);c.fill();
    c.fillStyle='#d9b18e';c.beginPath();c.arc(0,Y-2.75,.62,0,7);c.fill();
    c.fillStyle='#1b1916';c.beginPath();c.moveTo(-1.3,Y-3.1);c.lineTo(-.65,Y-3.8);c.lineTo(0,Y-3.35);c.lineTo(.7,Y-3.8);c.lineTo(1.35,Y-3.1);c.fill();
    if(role==='officer'||role==='general'){c.strokeStyle='#c9aa69';c.lineWidth=.24;c.beginPath();c.moveTo(-1.05,Y-.5);c.lineTo(1.05,Y+1);c.stroke()}
  }else if(isGun(t)&&!role){
    c.strokeStyle='#251f19';c.lineWidth=.43;
    for(const wx of[-2.4,2.4]){c.beginPath();c.arc(wx,.5,1.12,0,7);c.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(wx,.5);c.lineTo(wx+Math.cos(a)*.92,.5+Math.sin(a)*.92);c.stroke()}}
    c.fillStyle='#9b875d';c.fillRect(-.9,dir>0?-1.6:-3.4,1.8,4.5);
    c.fillStyle='#baa87c';c.beginPath();c.ellipse(0,dir>0?2.9:-3.5,1,.48,0,0,7);c.fill();
  }
}
function drawFig(c,m,r,N,dir,T0){
  const x=0,y=0,t=r.type,role=m.role,coat=t==='mil'?'#6d5238':N.coat;
  if(t==='gen'){
    const gal=r.moving?Math.sin(T0*6+m.ox):0,big=role==='general',k=big?1.35:1,hy=y-Math.abs(gal)*.4;
    c.save();c.scale(k,k);
    c.fillStyle='#2a1c12';for(const[lx,ly,ph]of[[-1.3,-2.6,1],[.7,-2.6,-1],[-1.3,1.6,-1],[.7,1.6,1]])c.fillRect(x+lx,y+ly+gal*.4*ph,.6,1.7);
    c.fillStyle=big?'#dcd6ca':'#6b4a30';c.fillRect(x-1.5,hy-3.2,3,6.4);c.fillStyle=big?'#cfc8ba':'#583c26';c.fillRect(x-.85,dir>0?hy+2.8:hy-4.8,1.7,2);
    c.fillStyle=N.col;c.fillRect(x-1.7,hy-1,3.4,1.8);c.fillStyle='#e7c35a';c.fillRect(x-1.7,hy+.65,3.4,.25);c.fillRect(x-1.7,hy-1,3.4,.2);
    c.fillStyle='#efe8d6';c.fillRect(x-1.3,hy-1.6,.6,1.4);c.fillRect(x+.7,hy-1.6,.6,1.4);
    c.fillStyle=N.coat;c.fillRect(x-1.3,hy-4.2,2.6,3);c.fillStyle='#e7c35a';c.fillRect(x-1.3,hy-4.2,.35,3);c.fillRect(x+.95,hy-4.2,.35,3);c.fillRect(x-1.3,hy-1.5,2.6,.3);
    if(big){c.fillStyle='#e7c35a';c.fillRect(x-1.6,hy-4.3,.5,.5);c.fillRect(x+1.1,hy-4.3,.5,.5);c.strokeStyle='#3a6fc4';c.lineWidth=.4;c.beginPath();c.moveTo(x-1.2,hy-4);c.lineTo(x+1.2,hy-1.8);c.stroke()}
    c.fillStyle='#e6c3a0';c.fillRect(x-.6,hy-5.3,1.2,1.1);
    c.fillStyle='#15120f';c.fillRect(x-1.6,hy-5.8,3.2,.75);c.fillRect(x-.8,hy-6.3,1.6,.55);c.fillStyle='#e7c35a';c.fillRect(x-1.6,hy-5.1,3.2,.18);
    if(big){c.fillStyle='#fff';c.beginPath();c.ellipse(x-.2,hy-6.7,.9,.55,-.4,0,7);c.fill();c.fillStyle='#e7c35a';c.fillRect(x+1.3,hy-3.6,.35,2.2);
      const lv=BV&&BV.B.gen[r.side]?BV.B.gen[r.side].lvl:0;for(let q=0;q<Math.max(1,lv);q++){c.fillStyle='#f3d58a';c.beginPath();const sx=x-(Math.max(1,lv)-1)*.7+q*1.4,sy=hy-8.2;for(let i=0;i<10;i++){const rr=i%2?.28:.65,a=-Math.PI/2+i*Math.PI/5;c.lineTo(sx+Math.cos(a)*rr,sy+Math.sin(a)*rr)}c.fill()}}
    else if(m.ox<0){const w=Math.sin(T0*5)*.5;c.fillStyle='#5a4128';c.fillRect(x+1.3,hy-10,.35,7);c.fillStyle=N.col;c.beginPath();c.moveTo(x+1.65,hy-10);c.lineTo(x+5.5,hy-9+w);c.lineTo(x+1.65,hy-7.8);c.fill();c.fillStyle=N.col2;c.fillRect(x+1.65,hy-9.2,2.2,.5)}
    c.restore();return}
  if(role==='officer'&&!isHorse(t)){
    const st=r.moving?Math.sin(T0*7+m.ox):0,Y=y-(r.moving?Math.abs(st)*.3:0),sash=N.name==='Prussia'?'#c9c9c9':N.name==='Sweden'?'#e2b53a':'#b3261e';
    c.fillStyle='#15120f';c.fillRect(x-1,y+1.2+(st>0?-.35:0),.85,2.5);c.fillRect(x+.15,y+1.2+(st<0?-.35:0),.85,2.5);
    c.fillStyle='#efe8d6';c.fillRect(x-1.05,Y+.7,2.1,.8);
    c.fillStyle=N.coat;c.fillRect(x-1.35,Y-2.1,2.7,3.1);c.fillRect(x-1.6,Y+.4,3.2,.9);
    c.fillStyle=N.facing;c.fillRect(x-.75,Y-2.1,.35,2.2);c.fillRect(x+.4,Y-2.1,.35,2.2);
    c.fillStyle='#e7c35a';c.fillRect(x-1.6,Y+1.15,3.2,.18);c.fillRect(x-1.35,Y-2.1,.18,3);c.fillRect(x+1.17,Y-2.1,.18,3);c.fillRect(x+.9,Y-2.3,.7,.45);
    c.fillStyle=sash;c.fillRect(x-1.35,Y-.25,2.7,.45);c.fillRect(x+.8,Y+.15,.35,.9);
    c.fillStyle='#e7c35a';c.beginPath();c.ellipse(x,Y-2.05,.55,.3,0,0,Math.PI);c.fill();
    c.fillStyle='#e6c3a0';c.fillRect(x-.6,Y-3.1,1.2,1.05);
    c.fillStyle='#15120f';c.fillRect(x-1.55,Y-3.6,3.1,.8);c.fillRect(x-.8,Y-4.05,1.6,.5);c.fillStyle='#e7c35a';c.fillRect(x-1.55,Y-2.86,3.1,.2);c.fillStyle='#f1ede2';c.fillRect(x-1.1,Y-3.5,.45,.45);
    if(r.moving||r.bayonet){c.fillStyle='#e6ebf0';c.save();c.translate(x+1.3,Y-1.5);c.rotate(dir>0?2.6:-.5);c.fillRect(-.15,-4.2,.3,4.2);c.fillStyle='#e7c35a';c.fillRect(-.45,-.1,.9,.25);c.restore()}
    else{c.fillStyle='#5a4128';c.fillRect(x+1.35,Y-6.2,.3,7.4);c.fillStyle='#d6dbe0';c.beginPath();c.moveTo(x+1.5,Y-7.5);c.lineTo(x+1.95,Y-6.2);c.lineTo(x+1.05,Y-6.2);c.fill();c.fillStyle='#e7c35a';c.fillRect(x+1.1,Y-6.3,.8,.2)}
    return}
  if(role==='drum'&&isFoot(t)){
    const st=r.moving?Math.sin(T0*7+m.ox):0,Y=y-(r.moving?Math.abs(st)*.3:0),beat=Math.sin(T0*(r.moving?16:8));
    c.fillStyle='#1c1916';c.fillRect(x-1,y+1.3+(st>0?-.35:0),.8,2.3);c.fillRect(x+.2,y+1.3+(st<0?-.35:0),.8,2.3);
    c.fillStyle='#efe8d6';c.fillRect(x-1.05,Y+.9,2.1,.6);
    c.fillStyle=t==='mil'?'#6d5238':N.facing;c.fillRect(x-1.3,Y-1.95,2.6,3);c.fillRect(x-1.5,Y+.4,3,.75);
    c.fillStyle=t==='mil'?N.col:N.coat;c.fillRect(x-.7,Y-1.95,.3,1.9);c.fillRect(x+.4,Y-1.95,.3,1.9);
    c.fillStyle='#f4f0e6';for(let q=0;q<3;q++){c.fillRect(x-1.45,Y-1.6+q*.55,.4,.18);c.fillRect(x+1.05,Y-1.6+q*.55,.4,.18)}
    c.fillStyle='#e6c3a0';c.fillRect(x-.6,Y-2.9,1.2,1.05);
    c.fillStyle='#15120f';c.fillRect(x-1.45,Y-3.35,2.9,.75);c.fillRect(x-.75,Y-3.8,1.5,.5);c.fillStyle='#f4f0e6';c.fillRect(x-1.45,Y-2.66,2.9,.16);
    const dx=x+1.7,dy=Y+.2;c.fillStyle=N.col;c.fillRect(dx-1.3,dy-.9,2.6,1.8);c.fillStyle='#f1ead8';c.beginPath();c.ellipse(dx,dy-.9,1.3,.45,0,0,7);c.fill();
    c.fillStyle=N.col2;c.fillRect(dx-1.3,dy-.95,2.6,.3);c.fillRect(dx-1.3,dy+.65,2.6,.3);
    c.strokeStyle='#f4f0e6';c.lineWidth=.14;c.beginPath();for(let q=0;q<5;q++){const xx=dx-1.2+q*.6;c.moveTo(xx,dy-.65);c.lineTo(xx+.3,dy+.65)}c.stroke();
    c.strokeStyle='#caa46a';c.lineWidth=.22;c.beginPath();c.moveTo(dx-.7,dy-2.2+beat*.5);c.lineTo(dx-.2,dy-1);c.moveTo(dx+.8,dy-2.2-beat*.5);c.lineTo(dx+.2,dy-1);c.stroke();
    return}
  if(isFoot(t)){
    const mil=t==='mil',st=r.moving?Math.sin(T0*7+m.ox*1.7+m.oy):0,bob=r.moving?Math.abs(st)*.3:0,Y=y-bob;
    // Equipment is drawn before the coat so the pack and cartridge box sit behind the figure.
    if(!mil){c.fillStyle='#65472f';c.fillRect(x-1.65,Y-1.5,.7,2.2);c.fillStyle='#3b3024';c.fillRect(x-1.8,Y+.2,.8,.8);c.fillStyle='#b69a72';c.fillRect(x-1.62,Y-1.45,.16,1.9)}
    c.fillStyle=mil?'#3a2e22':'#1c1916';c.fillRect(x-1,y+1.3+(st>0?-.35:0),.8,2.3);c.fillRect(x+.2,y+1.3+(st<0?-.35:0),.8,2.3);
    c.fillStyle=mil?'#8a7a5c':'#d9d2c0';c.fillRect(x-1,Y+1,2,.55);
    c.fillStyle=coat;c.fillRect(x-1.3,Y-1.95,2.6,3);c.fillRect(x-1.5,Y+.4,3,.75);
    if(mil){c.fillStyle=N.col;c.fillRect(x-1.25,Y-.2,2.5,.45);c.fillStyle='#c9b694';c.fillRect(x-1.2,Y+.53,.45,.18);c.fillRect(x+.75,Y+.53,.45,.18)}
    else{c.fillStyle=N.facing;c.fillRect(x-.7,Y-1.95,.28,1.9);c.fillRect(x+.42,Y-1.95,.28,1.9);c.fillRect(x-1.3,Y+.9,2.6,.25);
      c.fillStyle=N.facing;c.fillRect(x-1.52,Y-.22,.38,.6);c.fillRect(x+1.14,Y-.22,.38,.6);
      c.fillStyle='#e2c16d';for(let q=0;q<3;q++){c.fillRect(x-.3,Y-1.55+q*.7,.2,.2);c.fillRect(x+.12,Y-1.55+q*.7,.2,.2)}
      c.strokeStyle='rgba(240,236,226,.78)';c.lineWidth=.17;c.beginPath();c.moveTo(x-1.1,Y-1.7);c.lineTo(x+1.1,Y+.6);c.moveTo(x+1.1,Y-1.7);c.lineTo(x-1.1,Y+.6);c.stroke();c.fillStyle='#dfd8c7';c.fillRect(x-.96,y+2.15,.16,.2);c.fillRect(x+.75,y+2.15,.16,.2)}
    c.fillStyle='#e6c3a0';c.fillRect(x-.6,Y-2.9,1.2,1.05);
    if(mil){c.fillStyle='#2e241a';c.fillRect(x-1.5,Y-3.05,3,.45);c.fillRect(x-.7,Y-3.6,1.4,.6)}
    else{c.fillStyle='#d5d0c4';c.fillRect(x-.75,Y-3.05,.35,.28);c.fillRect(x+.4,Y-3.05,.35,.28);c.fillStyle='#15120f';c.fillRect(x-1.45,Y-3.35,2.9,.75);c.fillRect(x-.75,Y-3.8,1.5,.5);c.fillStyle='#e9dcae';c.fillRect(x-1.45,Y-2.66,2.9,.16);c.fillStyle=N.col;c.fillRect(x-.16,Y-3.48,.32,.35)}
    if(role==='flag'){const w=Math.sin(T0*5+m.x)*.8;c.fillStyle='#5a4128';c.fillRect(x+1.2,Y-11,.55,12.5);c.fillStyle='#d9b45a';c.fillRect(x+1.05,Y-11.6,.85,.7);
      c.fillStyle=N.col;c.beginPath();c.moveTo(x+1.8,Y-10.8);c.quadraticCurveTo(x+5,Y-11.4+w,x+8.4,Y-10.6+w);c.lineTo(x+8.4,Y-6.2+w);c.quadraticCurveTo(x+5,Y-7+w,x+1.8,Y-6.4);c.fill();
      c.fillStyle=N.col2;c.fillRect(x+4.2,Y-10.5+w*.5,1.1,4);c.fillRect(x+2.2,Y-9+w*.5,5.6,1);return}
    if(role==='drum'){c.fillStyle='#ece4d0';c.beginPath();c.ellipse(x+1.5,Y+.4,1.5,1.05,0,0,7);c.fill();c.fillStyle=N.col;c.fillRect(x+.05,Y-.05,2.9,.45);c.fillStyle='#3a2a1a';c.fillRect(x+1.9,Y-1.2+Math.sin(T0*14)*.5,.25,1.2);return}
    if(r.bayonet){c.fillStyle='#5a4128';c.fillRect(x+.6,dir>0?Y-.3:Y-4,.45,4.2);c.fillStyle='#e6ebf0';c.fillRect(x+.62,dir>0?Y+3.9:Y-5.9,.4,1.9)}
    else if(r.fired||(r.reload>BT.infReload*.8&&!r.moving)){c.fillStyle='#5a4128';c.fillRect(x+.5,dir>0?Y-.6:Y-3.6,.45,3.4);c.fillStyle='#9aa0a6';c.fillRect(x+.52,dir>0?Y+2.6:Y-4.4,.4,.9)}
    else{c.fillStyle='#5a4128';c.fillRect(x+1.2,Y-4,.45,4.4);c.fillStyle='#9aa0a6';c.fillRect(x+1.22,Y-4.8,.4,.9)}
  }else if(t==='art'){
    if(role){c.fillStyle=N.coat;c.fillRect(x-1.1,y-1.4,2.2,2.8);c.fillStyle='#e7c35a';c.fillRect(x-1.1,y-1.4,2.2,.5);c.fillStyle='#1d1a16';c.fillRect(x-1.3,y-2.6,2.6,.9);return}
    c.fillStyle='#5a3f25';c.fillRect(x-2,y-2.5,4,5);c.fillStyle='#9a7545';c.fillRect(x-1.8,y-2.35,.35,4.7);c.fillRect(x+1.45,y-2.35,.35,4.7);c.fillStyle='#2e2b28';c.fillRect(x-.9,dir>0?y:y-7,1.8,7);c.fillStyle='#8c7960';c.fillRect(x-.95,dir>0?y:y-7,1.9,.5);
    c.fillStyle='#3a2a1a';c.fillRect(x-3,y-.8,1.2,2.6);c.fillRect(x+1.8,y-.8,1.2,2.6);
    c.strokeStyle='#ae8954';c.lineWidth=.16;c.beginPath();c.arc(x-2.4,y+.5,.65,0,7);c.moveTo(x+2.4,y+.5);c.arc(x+2.4,y+.5,.65,0,7);c.stroke();
    for(let k=1;k<m.hp;k++){const a=k*1.3,cx=x+Math.cos(a)*4.5,cy=y-dir*3+Math.sin(a)*2;c.fillStyle=N.coat;c.fillRect(cx-.9,cy-1,1.8,2.2);c.fillStyle='#1d1a16';c.fillRect(cx-1,cy-1.9,2,.7)}
  }else if(t==='how'){
    if(role){c.fillStyle=N.coat;c.fillRect(x-1.1,y-1.4,2.2,2.8);c.fillStyle='#e7c35a';c.fillRect(x-1.1,y-1.4,2.2,.5);c.fillStyle='#1d1a16';c.fillRect(x-1.3,y-2.6,2.6,.9);return}
    const lim=r.hs==='limber'||r.hs==='pack';
    if(lim){c.fillStyle='#6b4a2e';c.fillRect(x-2.6,dir>0?y+4:y-10,2,5);c.fillRect(x+.6,dir>0?y+4:y-10,2,5);
      c.fillStyle='#7a5a36';c.fillRect(x-2.4,y-2,4.8,4);c.fillStyle='#3a2a1a';c.fillRect(x-3.2,y-1,.9,2.6);c.fillRect(x+2.3,y-1,.9,2.6);
      c.fillStyle='#2e2b28';c.fillRect(x-.9,dir>0?y-6:y+2,1.8,4)}
    else{c.fillStyle='#7a5a36';c.fillRect(x-2,y-dir*6-1.5,4,3);c.fillStyle='#5a3f25';c.fillRect(x-2.2,y-2,4.4,4);
      c.fillStyle='#2e2b28';c.save();c.rotate(dir>0?.5:-.5);c.fillRect(-1.4,dir>0?0:-4.5,2.8,4.5);c.restore();
      if(r.hs==='deploy'){c.fillStyle='#f3d58a';c.fillRect(x-2,y+3,4*(1-r.ht/5),.6)}}
    for(let k=1;k<m.hp;k++){const a=k*1.3,cx=x+Math.cos(a)*4.5,cy=y-dir*3+Math.sin(a)*2;c.fillStyle=N.coat;c.fillRect(cx-.9,cy-1,1.8,2.2);c.fillStyle='#1d1a16';c.fillRect(cx-1,cy-1.9,2,.7)}
  }else{
    const hus=t==='hus',gal=r.moving?Math.sin(T0*(r.mode==='charge'?14:7)+m.ox):0,y2=y-Math.abs(gal)*.5;
    c.fillStyle='#2a1c12';c.fillRect(x-1.3,y-2.6+gal*.4,.6,1.6);c.fillRect(x+.7,y-2.6-gal*.4,.6,1.6);c.fillRect(x-1.3,y+1.6-gal*.4,.6,1.6);c.fillRect(x+.7,y+1.6+gal*.4,.6,1.6);
    c.fillStyle=hus?'#8a6a45':'#5b3b22';c.fillRect(x-1.4,y2-3,2.8,6);c.fillStyle=hus?'#6d5033':'#43291a';c.fillRect(x-.8,dir>0?y2+2.6:y2-4.4,1.6,1.8);c.fillStyle='#d0ae7a';c.fillRect(x-1.35,y2+2.35,2.7,.18);
    c.fillStyle=N.col;c.fillRect(x-1.45,y2-.8,2.9,1.4);
    c.fillStyle=hus?'#2f6b3a':N.coat;c.fillRect(x-1.2,y2-2.2,2.4,2.4);c.fillStyle='#e6c3a0';c.fillRect(x-.55,y2-3.1,1.1,.9);
    if(role==='officer'){c.fillStyle='#e7c35a';c.fillRect(x-1.2,y-1.6,2.4,.6);c.fillStyle='#fff';c.fillRect(x-.3,y-3.6,.8,1)}
    if(role==='flag'){const w=Math.sin(T0*6+m.x)*.8;c.fillStyle='#5a4128';c.fillRect(x+1,y-10,.5,9);c.fillStyle=N.col;c.fillRect(x+1.5,y-10+w*.3,5,3.4)}
    if(hus){c.fillStyle=N.col;c.fillRect(x-1.2,y+.3,2.4,.6);c.fillStyle='#2a1a10';c.fillRect(x-1,y-3,2,1.4);c.fillStyle='#e2c16d';for(let q=0;q<3;q++)c.fillRect(x-.85+q*.7,y-1.8,.4,.17);c.fillRect(x+1.2,y-3.3,.45,.75)}else{c.fillStyle='#1d1a16';c.fillRect(x-1.2,y-2.4,2.4,.8);c.fillStyle=N.facing;c.fillRect(x-.95,y-1.5,.3,.7);c.fillRect(x+.65,y-1.5,.3,.7)}
    if(r.mode==='charge'){c.fillStyle='#dfe4ea';c.fillRect(x+1.2,dir>0?y:y-3.5,.5,3.5)}
  }
}
// low-angle camera: the field recedes toward the enemy side, figures stand upright and shrink with distance
const PK=.68,PHX=1.2;
const HILL_Y=205,HILL_RY=82;
function hillHeight(x,y){const dx=(x-200)/190,dy=(y-HILL_Y)/HILL_RY,t=Math.max(0,1-dx*dx-dy*dy);return 23*t*t}
function P(x,y){const u=clamp((FH-y)/FH,-.3,1.3),s=1/(1+PK*u),lift=BV?.o.terrain==='hills'?hillHeight(x,y)*s:0;return[FW/2+(x-FW/2)*s*PHX,FH*(1-(1+PK)*u/(1+PK*u))-lift,s]}
function UP(vx,vy){const t=1-vy/FH,u=t/(1+PK-PK*t),s=1/(1+PK*u);let x=FW/2+(vx-FW/2)/(s*PHX),y=FH-u*FH;
  if(BV?.o.terrain==='hills')for(let i=0;i<5;i++){const q=P(x,y),dy=P(x,y+1)[1]-q[1]||1;y=clamp(y+(vy-q[1])/dy,0,FH);const ss=P(x,y)[2];x=FW/2+(vx-FW/2)/(ss*PHX)}return{x,y}}
function projectHillGround(v,k){
  if(!v.projectedGround){v.projectedGround=document.createElement('canvas')}
  const cv=v.projectedGround;if(cv.width!==v.ground.width||cv.height!==v.ground.height){cv.width=v.ground.width;cv.height=v.ground.height}
  const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
  const tri=(a,b,d,sa,sb,sd)=>{const ax=sb[0]-sa[0],ay=sb[1]-sa[1],bx=sd[0]-sa[0],by=sd[1]-sa[1],det=ax*by-ay*bx;
    const A=((b[0]-a[0])*by-(d[0]-a[0])*ay)/det,B=((b[1]-a[1])*by-(d[1]-a[1])*ay)/det;
    const C=((d[0]-a[0])*ax-(b[0]-a[0])*bx)/det,D=((d[1]-a[1])*ax-(b[1]-a[1])*bx)/det;
    const E=a[0]-A*sa[0]-C*sa[1],F=a[1]-B*sa[0]-D*sa[1];
    c.save();c.setTransform(k,0,0,k,0,0);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(d[0],d[1]);c.closePath();c.clip();c.setTransform(k*A,k*B,k*C,k*D,k*E,k*F);c.drawImage(v.ground,0,0,FW,FH);c.restore()};
  for(let y=0;y<300;y+=12)for(let x=0;x<FW;x+=16){const x1=Math.min(FW,x+16),y1=Math.min(300,y+12),a=P(x,y),b=P(x1,y),d=P(x,y1),e=P(x1,y1);
    tri(a,b,d,[x,y],[x1,y],[x,y1]);tri(e,d,b,[x1,y1],[x,y1],[x1,y])}
  c.setTransform(k,0,0,k,0,0);for(let y=300;y<FH;y+=5){const a=P(0,y),b=P(0,y+5),s=(a[2]+b[2])/2,w=FW*s*PHX;c.drawImage(v.ground,0,y*k,FW*k,5*k,FW/2-w/2,a[1],w,b[1]-a[1]+.7)}
  v.terrainDirty=false;
}
function drawHillCrest(c,v){
  if(!v.projectedGround)return;
  c.save();c.beginPath();let first=true;
  for(let x=10;x<=390;x+=10){const q=P(x,HILL_Y);first?(c.moveTo(q[0],q[1]),first=false):c.lineTo(q[0],q[1])}
  for(let x=390;x>=10;x-=10){const dx=(x-200)/190,y=HILL_Y+HILL_RY*Math.sqrt(Math.max(0,1-dx*dx)),q=P(x,y);c.lineTo(q[0],q[1])}
  c.closePath();c.clip();c.drawImage(v.projectedGround,0,0,FW,FH);c.restore();
}
function drawRiverMotion(c,v){
  if(!v.o.river)return;const t=v.B.t;c.save();c.lineWidth=.55;
  for(let i=0;i<(v.low?20:42);i++){const x=(i*47.3+t*(2+i%3*.4))%FW;if(x>182&&x<214)continue;
    const y=295+i%4*3.4+Math.sin(x/41)*3,a=P(x,y),b=P(x+5+Math.sin(t+i)*2,y+.4);
    c.strokeStyle=`rgba(232,240,222,${.13+.12*(.5+.5*Math.sin(t*1.7+i))})`;c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo((a[0]+b[0])*.5,a[1]-.5,b[0],b[1]);c.stroke()}
  for(const r of v.B.regs)if(r.moving&&Math.abs(r.y-300)<20)for(let i=0;i<r.men.length;i+=4){const m=r.men[i];if(!m.alive||Math.abs(m.y-300)>12)continue;
    const q=P(m.x,m.y),w=(2+(t*3+i)%3)*q[2];c.strokeStyle='rgba(229,238,220,.3)';c.beginPath();c.ellipse(q[0],q[1],w,w*.3,0,0,Math.PI);c.stroke()}
  c.restore();
}
function drawBattle(v){
  const c=bctx,B=v.B,k=v.s*Math.min(2,devicePixelRatio||1),o=v.o,NA=NF(o.af),ND=NF(o.df);
  const list=[];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(const r of B.regs){if(!r.n)continue;const N=r.side?ND:NA,dir=r.side?1:-1;
    for(const m of r.men)if(m.alive){const alpha=v.paused||B.done?1:clamp((v.acc||0)*30,0,1),q=P((m.px??m.x)+(m.x-(m.px??m.x))*alpha,(m.py??m.y)+(m.y-(m.py??m.y))*alpha);list.push([q[1],m,r,N,dir,q[0],q[2]*(r.displayScale||1)]);
      if(!r.broken){if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]}}}
  if(x0>x1){x0=0;x1=FW;y0=0;y1=FH}
  const zt=clamp(Math.min((v.viewW||FW)/Math.max(110,x1-x0+30),FH/Math.max(170,y1-y0+50)),1,3.6),cam=v.cam||(v.cam={z:zt,x:(x0+x1)/2,y:(y0+y1)/2});
  if(v.manual){cam.z+=(v.manual.z-cam.z)*.3;cam.x+=(v.manual.x-cam.x)*.3;cam.y+=(v.manual.y-cam.y)*.3}
  else{cam.z+=(zt-cam.z)*.04;cam.x+=((x0+x1)/2-cam.x)*.05;cam.y+=((y0+y1)/2-12-cam.y)*.05}
  const vw=(v.viewW||FW)/cam.z,vh=FH/cam.z,L=vw>=FW?(FW-vw)/2:clamp(cam.x-vw/2,0,FW-vw),Tp=clamp(cam.y-vh/2,v.fortCam?-100:0,FH-vh);v.view={L,Tp,z:cam.z};
  if(v.manual){v.manual.x=vw>=FW?FW/2:clamp(v.manual.x,vw/2,FW-vw/2);v.manual.y=clamp(v.manual.y,vh/2-(v.fortCam?100:0),FH-vh/2)}
  c.setTransform(1,0,0,1,0,0);c.fillStyle=o.terrain==='forest'?'#6a7b45':o.terrain==='hills'?'#86814f':'#7c8a4c';c.fillRect(0,0,bcv.width,bcv.height);
  if(BATTLE_PAINTING&&BATTLE_PAINTING.complete&&BATTLE_PAINTING.naturalWidth){c.globalAlpha=o.terrain==='forest'?.84:.91;c.drawImage(BATTLE_PAINTING,0,0,bcv.width,bcv.height);c.globalAlpha=1;
    c.fillStyle=o.terrain==='forest'?'rgba(32,62,26,.28)':o.terrain==='hills'?'rgba(113,91,48,.18)':'rgba(71,91,39,.12)';c.fillRect(0,0,bcv.width,bcv.height)}
  c.setTransform(k*cam.z,0,0,k*cam.z,-L*k*cam.z,-Tp*k*cam.z);BTF=[k*cam.z,-L*k*cam.z,-Tp*k*cam.z];
  if(o.terrain==='hills'){if(!v.projectedGround||(v.terrainDirty&&performance.now()-(v.groundProjectedAt||0)>250)){projectHillGround(v,k);v.groundProjectedAt=performance.now()}c.drawImage(v.projectedGround,0,0,FW,FH)}
  else for(let y=0;y<FH;y+=5){const a=P(0,y),b=P(0,y+5),s=(a[2]+b[2])/2,w=FW*s*PHX;c.globalAlpha=Tp<0?Math.min(1,(y+2)/18):1;c.drawImage(v.ground,0,y*k,FW*k,5*k,FW/2-w/2,a[1],w,b[1]-a[1]+.7)}c.globalAlpha=1;
  drawRiverMotion(c,v);
  const hzTop=v.fortCam?-100:0,hz=c.createLinearGradient(0,hzTop,0,FH*.28);hz.addColorStop(0,'rgba(190,200,190,.42)');hz.addColorStop(1,'rgba(190,200,190,0)');c.fillStyle=hz;c.fillRect(0,hzTop,FW,FH*.28-hzTop);
  if(B.fortKind&&B.seg){const H=B.fortKind==='palisade'?8:B.fortKind==='capital'?12:10,pts=[];
    if(B.fortKind==='fort'){for(let k=0;k<=40;k++){const a=Math.PI/2+k/40*Math.PI*2,kk=k/4,f=kk-Math.floor(kk),rr=80+29*Math.abs(1-2*f);pts.push([200+Math.cos(a)*rr,120+Math.sin(a)*rr])}}
    else if(B.fortKind==='palisade'){for(let k=0;k<=48;k++){const a=k/48*Math.PI*2;pts.push([200+Math.cos(a)*96,125+Math.sin(a)*96])}}
    else pts.push([40,30],[360,30],[360,210],[40,210],[40,30]);
    const seg=[];for(let k=0;k<pts.length-1;k++){const[a0,b0]=pts[k],[a1,b1]=pts[k+1],n=B.fortKind==='capital'?16:1;
      for(let j=0;j<n;j++){const x0=a0+(a1-a0)*j/n,y0=b0+(b1-b0)*j/n,x1=a0+(a1-a0)*(j+1)/n,y1=b0+(b1-b0)*(j+1)/n;seg.push([x0,y0,x1,y1])}}
    for(const[x0,y0,x1,y1]of seg){const mx=(x0+x1)/2,my=(y0+y1)/2,broken=B.seg[segOf(B,mx,my)]<=0;
      const q0=P(x0,y0),q1=P(x1,y1);list.push([Math.max(q0[1],q1[1])-.5,null,{wall:true,q0,q1,H,broken,front:my>(B.fortKind==='capital'?120:B.fortKind==='palisade'?125:120)}])}}
  for(const t of v.trees||[]){const q=P(t.x,t.y);list.push([q[1],null,{tree:t},null,null,q[0],q[2]])}
  for(const h of v.houses||[]){const q=P(h.x+h.w*.5,h.y+h.h);list.push([q[1],null,{house:h},null,null,q[0],q[2]])}
  for(const d of v.dead){const q=P(d.x,d.y);list.push([q[1]-1.5,null,{dead:d},null,null,q[0],q[2]])}
  for(const f of v.falls){const pose=fallPose(f),q=P(pose.x,pose.y);list.push([q[1],null,{fall:f},null,null,q[0],q[2]])}
  if(o.terrain==='hills')list.push([P(200,HILL_Y)[1],null,{hill:true}]);
  list.sort((a,b)=>a[0]-b[0]);
  c.setTransform(BTF[0],0,0,BTF[0],BTF[1],BTF[2]);
  for(const r of B.regs){if(!r.n||!isGun(r.type))continue;const own=r.side===v.ps,show=v.showRanges||(own&&selOf(v).includes(r));if(!show)continue;
    for(const[R,dash,alpha]of[[r.type==='how'?BT.howRange:BT.artRange,[6,4],.07],[r.type==='how'?0:BT.canRange,[2,3],.1]]){if(!R)continue;
      c.beginPath();for(let k=0;k<=64;k++){const a=k/64*Math.PI*2,q=P(r.x+Math.cos(a)*R,r.y+Math.sin(a)*R);k?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])}
      c.fillStyle=own?`rgba(243,213,138,${alpha})`:`rgba(224,83,63,${alpha})`;c.fill();c.setLineDash(dash);c.lineWidth=1.2/v.view.z;c.strokeStyle=own?'rgba(243,213,138,.75)':'rgba(224,83,63,.75)';c.stroke();c.setLineDash([])}}
  for(const r of selOf(v)){if(!r.forming)continue;c.strokeStyle='rgba(246,217,143,.7)';c.lineWidth=.6;
    for(const m of r.men){if(!m.alive||m.role)continue;const q=P(r.x+m.ox,r.y+m.oy);c.beginPath();c.ellipse(q[0],q[1],2.2*q[2],.9*q[2],0,0,7);c.stroke()}}
  const cull=v.view,cl=cull.L-12,cr=cull.L+FW/cull.z+12,ct=cull.Tp-30,cb=cull.Tp+FH/cull.z+20;
  for(const it of list){const[py,m,r,N,dir,px,s]=it;if(m&&(px<cl||px>cr||py<ct||py>cb))continue;
    if(r?.hill){c.setTransform(BTF[0],0,0,BTF[0],BTF[1],BTF[2]);drawHillCrest(c,v);continue}
    if(r&&(r.tree||r.house||r.dead||r.fall))c.setTransform(BTF[0],0,0,BTF[0],BTF[1],BTF[2]);
    if(r?.fall){drawFall(c,r.fall,px,py,s);continue}
    if(r&&r.dead){if(px>=cl-20&&px<=cr+20&&py>=ct&&py<=cb)drawDead(c,r.dead,px,py,s);continue}
    if(r&&r.tree){if(px<cl-40||px>cr+40||py<ct-80||py>cb+20)continue;const t=r.tree,im=TREE_IMAGES?.[t.kind],h=t.s*(t.kind==='pine'?7.5:6.1)*s;
      c.save();if(selOf(v).some(u=>{const q=P(u.x,u.y);return Math.abs(q[0]-px)<h*.55&&q[1]<py&&q[1]>py-h}))c.globalAlpha=.25;
      if(im?.complete&&im.naturalWidth){const w=h*im.naturalWidth/im.naturalHeight;c.drawImage(im,px-w*.5,py-h,w,h)}
      else{c.fillStyle='#3c5732';c.beginPath();c.arc(px,py-h*.6,h*.36,0,7);c.fill();c.fillStyle='#59442c';c.fillRect(px-.7*s,py-h*.5,1.4*s,h*.5)}c.restore();continue}
    if(r&&r.house){const h=r.house,base=h.tile?'timber-cottage':'stone-townhouse',im=BUILDING_IMAGES?.[h.hit?base+'-destroyed':base];if(im?.complete&&im.naturalWidth){const w=h.w*1.34*s,ht=h.h*2.08*s;c.drawImage(im,px-w*.5,py-ht,w,ht)}continue}
    if(r&&r.wall){c.globalAlpha=1;c.setTransform(BTF[0],0,0,BTF[0],BTF[1],BTF[2]);const{q0,q1,H,broken,front}=r,h0=(broken?H*.25:H)*q0[2],h1=(broken?H*.25:H)*q1[2];
      const kind=B.fortKind,face=kind==='palisade'?(front?'#6b4a2b':'#57391f'):kind==='capital'?(front?'#a69b86':'#8c8371'):(front?'#9f9683':'#857d6c');
      c.fillStyle=broken?'#6f6450':face;c.beginPath();c.moveTo(q0[0],q0[1]);c.lineTo(q1[0],q1[1]);c.lineTo(q1[0],q1[1]-h1);c.lineTo(q0[0],q0[1]-h0);c.closePath();c.fill();
      const tex=WALL_IMAGES?.[kind==='palisade'?'timber':'stone'];
      if(tex?.complete&&tex.naturalWidth){c.save();c.clip();c.globalAlpha=broken?.25:front?.66:.42;
        const left=Math.min(q0[0],q1[0]),top=Math.min(q0[1]-h0,q1[1]-h1),ww=Math.max(1,Math.abs(q1[0]-q0[0])),hh=Math.max(h0,h1)+Math.abs(q1[1]-q0[1]);
        c.drawImage(tex,((left*7)%180+180)%180,0,Math.min(150,ww*10),tex.naturalHeight,left,top,ww,hh);c.restore()}
      if(!broken){c.fillStyle=kind==='palisade'?'#9b7546':'#d8ccb3';c.beginPath();c.moveTo(q0[0],q0[1]-h0);c.lineTo(q1[0],q1[1]-h1);c.lineTo(q1[0],q1[1]-h1+.9*q1[2]);c.lineTo(q0[0],q0[1]-h0+.9*q0[2]);c.closePath();c.fill();
        c.strokeStyle=kind==='palisade'?'rgba(30,20,10,.5)':'rgba(60,54,44,.35)';c.lineWidth=.35;c.beginPath();
        if(kind==='palisade'){for(let k=0;k<=3;k++){const x=q0[0]+(q1[0]-q0[0])*k/3,y=q0[1]+(q1[1]-q0[1])*k/3;c.moveTo(x,y);c.lineTo(x,y-h0)}}
        else{for(let k=1;k<3;k++){c.moveTo(q0[0],q0[1]-h0*k/3);c.lineTo(q1[0],q1[1]-h1*k/3)}}c.stroke();
        c.fillStyle='rgba(15,13,10,.18)';c.beginPath();c.moveTo(q0[0],q0[1]);c.lineTo(q1[0],q1[1]);c.lineTo(q1[0],q1[1]-h1*.35);c.lineTo(q0[0],q0[1]-h0*.35);c.closePath();c.fill();
        const sections=Math.max(2,Math.ceil(Math.hypot(q1[0]-q0[0],q1[1]-q0[1])/5));
        c.lineWidth=.22;c.strokeStyle=kind==='palisade'?'rgba(35,22,12,.48)':'rgba(55,49,40,.43)';c.beginPath();
        if(kind==='palisade'){for(let j=1;j<sections;j++){const t=j/sections,x=q0[0]+(q1[0]-q0[0])*t,y=q0[1]+(q1[1]-q0[1])*t,h=h0+(h1-h0)*t;c.moveTo(x,y-h*.88);c.lineTo(x+.2,y-h*.15);c.moveTo(x+.6,y-h*.68);c.lineTo(x+.4,y-h*.35)}}
        else for(let row=0;row<3;row++)for(let j=1;j<sections;j++){const t=(j+(row%2)*.5)/sections;if(t>=1)continue;const x=q0[0]+(q1[0]-q0[0])*t,y=q0[1]+(q1[1]-q0[1])*t,h=h0+(h1-h0)*t;c.moveTo(x,y-h*row/3);c.lineTo(x,y-h*(row+1)/3)}c.stroke();
        c.strokeStyle='rgba(246,229,194,.18)';c.lineWidth=.25;c.beginPath();c.moveTo(q0[0],q0[1]-h0*.94);c.lineTo(q1[0],q1[1]-h1*.94);c.stroke()}
      continue}
    c.globalAlpha=!operational(m)?.35:r.broken?.7:1;drawMan(c,m,r,N,dir,B.t,px,py,figureScale(r,m)*s)}
  c.globalAlpha=1;c.setTransform(BTF[0],0,0,BTF[0],BTF[1],BTF[2]);
  for(const r of selOf(v).length===1?selOf(v):[]){const q=P(r.x,r.y),w=66,h=19,x=q[0]-w/2,y=q[1]-35;
    c.fillStyle='rgba(17,22,18,.9)';c.fillRect(x,y,w,h);c.fillStyle='#f2e5c8';c.font='6px sans-serif';c.textAlign='center';c.fillText(unitStatus(B,r),q[0],y+7);
    c.fillStyle='#513f34';c.fillRect(x+3,y+11,w-6,4);c.fillStyle=r.mor<30?'#e68b64':'#b8ce8d';c.fillRect(x+3,y+11,(w-6)*clamp(r.mor/100,0,1),4)}
  for(const b of B.balls){const q=P(b.x,b.y);let lift=0;if(b.fly>0&&b.L){const pr=1-b.fly/b.L;lift=Math.sin(Math.PI*pr)*Math.min(40,b.L*.18)*q[2]}
    c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(q[0],q[1],1.6*q[2],.8*q[2],0,0,7);c.fill();
    if(b.fly>0){const tail=P(b.x-b.dx*7,b.y-b.dy*7);c.strokeStyle='rgba(231,216,180,.48)';c.lineWidth=.7*q[2];c.beginPath();c.moveTo(tail[0],tail[1]-lift);c.lineTo(q[0],q[1]-lift);c.stroke()}
    c.fillStyle='#141210';c.beginPath();c.arc(q[0],q[1]-lift,1.7*q[2],0,7);c.fill()}
  for(const sh of B.shells){const q=P(sh.x,sh.y),lift=Math.sin(Math.PI*Math.min(1,sh.pr))*Math.min(90,sh.L*.4)*q[2];
    c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(q[0],q[1],2*q[2],1*q[2],0,0,7);c.fill();
    const tail=P(sh.x-(sh.tx-sh.sx)/Math.max(1,sh.L)*9,sh.y-(sh.ty-sh.sy)/Math.max(1,sh.L)*9);c.strokeStyle='rgba(185,165,135,.55)';c.lineWidth=1.15*q[2];c.beginPath();c.moveTo(tail[0],tail[1]-lift-2*q[2]);c.lineTo(q[0],q[1]-lift);c.stroke();
    c.fillStyle='#1c1814';c.beginPath();c.arc(q[0],q[1]-lift,2.3*q[2],0,7);c.fill();c.fillStyle='#ffb44a';c.fillRect(q[0]+1,q[1]-lift-2,1,1)}
  for(const sp of v.spray){const q=P(sp.x,sp.y);c.fillStyle=sp.fire?`rgba(255,${120+((sp.l*300)|0)},40,${Math.min(1,sp.l*3)})`:'rgba(40,35,30,.8)';c.fillRect(q[0],q[1]-(sp.fire?(.5-sp.l)*30*q[2]:0),1.4*q[2],1.4*q[2])}
  for(const r of B.regs)if(drumming(B,r)){const m=r.drummer,q=P(m.x,m.y),beat=(B.t*2)%1;
    c.strokeStyle=`rgba(246,213,119,${.7*(1-beat)})`;c.lineWidth=1.3*q[2];c.beginPath();c.ellipse(q[0],q[1],(5+beat*15)*q[2],(2+beat*5)*q[2],0,0,Math.PI*2);c.stroke();
    c.fillStyle='#f6df9e';c.font='bold 7px sans-serif';c.textAlign='center';c.fillText('DRUM RALLY',q[0],q[1]-24*q[2])}

  for(const d of v.dust){const q=P(d.x,d.y),kk=d.l/d.max;c.fillStyle=`rgba(120,95,60,${d.a*(1-kk)})`;c.beginPath();c.ellipse(q[0],q[1]-kk*6*q[2],(d.r+d.g*kk)*q[2],(d.r+d.g*kk)*q[2]*.8,0,0,7);c.fill()}
  for(const b of v.boom){const q=P(b.x,b.y),kk=b.l/b.max,im=EFFECT_IMAGES?.['impact-dust'];if(im?.complete&&im.naturalWidth){const w=b.r*(1.5+kk)*q[2],h=w*im.naturalHeight/im.naturalWidth;c.globalAlpha=(1-kk)*.9;c.drawImage(im,q[0]-w*.5,q[1]-h*.85,w,h);c.globalAlpha=1}
    else{c.fillStyle=`rgba(255,${200-kk*120|0},80,${.85*(1-kk)})`;c.beginPath();c.arc(q[0],q[1]-b.r*.4*q[2],b.r*(.4+kk)*q[2],0,7);c.fill()}}
  for(const b of v.boom){const q=P(b.x,b.y),p=b.l/b.max;
    if(p<.65){c.strokeStyle=`rgba(187,165,125,${.32*(1-p/.65)})`;c.lineWidth=(2-p)*q[2];c.beginPath();c.ellipse(q[0],q[1],b.r*(.25+p*1.8)*q[2],b.r*(.1+p*.6)*q[2],0,0,Math.PI*2);c.stroke()}
    for(let j=0;j<(v.low?3:6);j++){const delay=j*.035,t=Math.max(0,p-delay);if(!t)continue;const a=j*2.4+b.x,rr=b.r*(.12+t*.35)*q[2],xx=q[0]+Math.cos(a)*b.r*t*.55*q[2],yy=q[1]-Math.sin(t*Math.PI*.75)*(10+j*2)*q[2];
      const cloud=c.createRadialGradient(xx,yy,0,xx,yy,rr);cloud.addColorStop(0,`rgba(78,67,53,${.52*(1-p)})`);cloud.addColorStop(.5,`rgba(139,118,87,${.38*(1-p)})`);cloud.addColorStop(1,'rgba(153,130,97,0)');c.fillStyle=cloud;c.fillRect(xx-rr,yy-rr,rr*2,rr*2)}
    if(p<.18){const rr=b.r*(.2+p*2)*q[2],glow=c.createRadialGradient(q[0],q[1]-rr*.5,0,q[0],q[1]-rr*.5,rr);glow.addColorStop(0,`rgba(255,243,190,${1-p/.18})`);glow.addColorStop(.4,'rgba(248,146,54,.5)');glow.addColorStop(1,'rgba(220,89,28,0)');c.fillStyle=glow;c.fillRect(q[0]-rr,q[1]-rr*1.5,rr*2,rr*2)}
    c.globalAlpha=Math.min(1,(1-p)*2);for(let i=0;i<(v.low?4:9);i++){const a=i*2.399+b.x*.03,dist=b.r*p*(.45+(i%3)*.25),x=q[0]+Math.cos(a)*dist*q[2],y=q[1]+Math.sin(a)*dist*.4*q[2]-Math.sin(p*Math.PI)*(7+i%4*3)*q[2];
      c.save();c.translate(x,y);c.rotate(a+p*5);c.fillStyle=i%3?'#70604b':'#b4a085';c.fillRect(-.8*q[2],-.5*q[2],(1.3+i%3*.5)*q[2],q[2]);c.restore()}c.globalAlpha=1}
  c.fillStyle='#ffe8a0';for(const f of v.flash){const q=P(f.x,f.y),im=f.r>=5?EFFECT_IMAGES?.['cannon-flash']:null;if(im?.complete&&im.naturalWidth){const w=f.r*5*q[2],h=w*im.naturalHeight/im.naturalWidth;c.save();c.translate(q[0],q[1]-h*.5);c.scale(f.dir||1,1);c.drawImage(im,0,-h*.5,w,h);c.restore()}
    else{c.beginPath();c.arc(q[0],q[1]-6*q[2],f.r*q[2],0,7);c.fill()}}
  c.fillStyle='#f4f6f8';for(const sp of v.spark){const q=P(sp.x,sp.y);c.fillRect(q[0],q[1]-5*q[2],1.3,1.3)}
  for(const sm of v.smoke){const q=P(sm.x,sm.y),kk=sm.l/sm.max,a=sm.a*Math.pow(1-kk,.65)*Math.min(1,sm.l*6),radius=(sm.r+sm.g*Math.sqrt(kk))*q[2],y=q[1]-(4+kk*10)*q[2];
    c.globalAlpha=a;c.drawImage(SMOKE_STAMP,q[0]-radius*1.15,y-radius*.9,radius*2.3,radius*1.8)}c.globalAlpha=1;
  for(const b of v.blood||[])drawBlood(c,b);
  for(const d of v.debris||[])drawFragment(c,d);
  drawCommandOverlay(v,c);
  if(v.dragUnit&&v.dragTo&&v.dragUnit.n){c.setTransform(BTF[0],0,0,BTF[0],BTF[1],BTF[2]);const q=P(v.dragUnit.x,v.dragUnit.y),tx=v.dragTo.x,ty=v.dragTo.y;
    c.setLineDash([5/v.view.z,4/v.view.z]);c.lineWidth=1.6/v.view.z;c.strokeStyle='#f3d58a';c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(tx,ty);c.stroke();c.setLineDash([]);
    c.beginPath();c.ellipse(tx,ty,26*q[2],9*q[2],0,0,7);c.stroke();c.fillStyle='rgba(243,213,138,.18)';c.fill()}
  c.setTransform(k,0,0,k,0,0);
  if(B.wallHp>0&&B.wallHp<B.wallMax){const hp=B.wallHp/B.wallMax;c.fillStyle='rgba(20,18,14,.75)';c.fillRect(7,7,73,9);c.strokeStyle='#c6aa72';c.lineWidth=.8;c.strokeRect(7.5,7.5,72,8);c.fillStyle=hp>.5?'#b9ad92':hp>.25?'#cb9564':'#cf6050';c.fillRect(9,9,69*hp,5);c.fillStyle='#efe5cf';c.font='9px ui-sans-serif,sans-serif';c.textAlign='left';c.textBaseline='top';c.fillText('Walls',83,6)}
  c.textAlign='center';c.textBaseline='middle';
  const bn=v.banners[v.banners.length-1],notice=v.artWait?'Preparing battlefield art…':B.routing>=0?cap1(`${fname(B.routing?o.df:o.af)} breaks and flees!`):bn?.t||'Give orders to your selected troops';
  const noticeEl=$('bnotice');if(noticeEl&&noticeEl.textContent!==notice)noticeEl.textContent=notice;
  if(v.paused&&!B.done){c.fillStyle='rgba(20,18,14,.8)';c.fillRect(0,FH-29,v.viewW||FW,29);c.fillStyle='#f3d58a';c.font='14px ui-sans-serif,sans-serif';c.fillText('Paused · give orders, then Resume',(v.viewW||FW)/2,FH-14)}
}
function drawCommandOverlay(v,c){
  const B=v.B,sel=selOf(v),z=v.view.z,markers=new Set();c.save();c.setTransform(BTF[0],0,0,BTF[0],BTF[1],BTF[2]);
  if(v.wallAimMode&&B.seg){for(let i=0;i<B.seg.length;i++){if(B.seg[i]<=0)continue;const p=segPoint(B,i),q=P(p.x,p.y);c.fillStyle='#171a15';c.strokeStyle='#ffe49d';c.lineWidth=1.5/z;c.beginPath();c.arc(q[0],q[1],9/z,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#ffe49d';c.font=`bold ${10/z}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(String(i+1),q[0],q[1])}}
  for(let i=0;i<sel.length;i++){
    const r=sel[i],q=P(r.x,r.y),points=r.men.filter(m=>m.alive).map(m=>P(m.x,m.y));if(!points.length)continue;
    const x=Math.min(...points.map(p=>p[0]))-5/z,y=Math.min(...points.map(p=>p[1]-17*p[2]))-4/z;
    const w=Math.max(...points.map(p=>p[0]))-x+5/z,h=Math.max(...points.map(p=>p[1]))-y+5/z;
    c.strokeStyle='#171a15';c.lineWidth=5/z;c.strokeRect(x,y,w,h);c.strokeStyle='#ffe49d';c.lineWidth=2/z;c.strokeRect(x,y,w,h);
    c.font=`bold ${10/z}px sans-serif`;const label=sel.length===1?r.label:String(i+1),lw=c.measureText(label).width+8/z;
    c.fillStyle='#ffe49d';c.fillRect(x,y-14/z,lw,14/z);c.fillStyle='#171a15';c.textAlign='left';c.fillText(label,x+4/z,y-4/z);
    if(isFoot(r.type)){const f=frontVector(r),tip=P(r.x+f.x*30,r.y+f.y*30),left=P(r.x+f.x*22-f.y*6,r.y+f.y*22+f.x*6),right=P(r.x+f.x*22+f.y*6,r.y+f.y*22-f.x*6);
      c.strokeStyle='#ffe49d';c.lineWidth=3/z;c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(tip[0],tip[1]);c.moveTo(left[0],left[1]);c.lineTo(tip[0],tip[1]);c.lineTo(right[0],right[1]);c.stroke();}
    const target=r.forced?.n?r.forced:r.target?.n?r.target:null,person=personnelTarget(r),wallAim=r.wallTarget!=null&&ordOf(B,r)==='walls'?segPoint(B,r.wallTarget):null,dest=r.goal||wallAim||r.wallDest||person||target;if(!dest)continue;const d=P(dest.x,dest.y),col=r.goal?'#ffe49d':'#ff9880';
    c.setLineDash([5/z,4/z]);c.lineWidth=2/z;c.strokeStyle=col;c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(d[0],d[1]);c.stroke();c.setLineDash([]);
    const marker=wallAim?`breach:${r.wallTarget}`:r.wallPost!=null?`wall:${r.wallPost}`:r.goal?`move:${dest.x}:${dest.y}`:`target:${target.id}:${person?.role||''}`;if(markers.has(marker))continue;markers.add(marker);
    c.beginPath();c.ellipse(d[0],d[1],12/z,6/z,0,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(d[0],d[1]);c.lineTo(d[0],d[1]-23/z);c.stroke();
    c.fillStyle='#171a15';c.fillRect(d[0]-35/z,d[1]-35/z,70/z,13/z);c.fillStyle=col;c.textAlign='center';c.fillText(wallAim?(B.seg[r.wallTarget]>0?'BREACH HERE':'BREACHED'):r.wallPost!=null?'WALL POST':r.goal?'MOVE':person?PERSONNEL[person.role].toUpperCase():r.forced?'ATTACK':'TARGET',d[0],d[1]-25/z);
  }
  c.restore();
}
function tickFx(v,dt){
  const age=a=>{for(const p of a)p.l+=dt;return a.filter(p=>p.l<p.max)};
  v.smoke=age(v.smoke);if(v.smoke.length>(v.low?300:800))v.smoke.splice(0,v.smoke.length-(v.low?300:800));v.dust=age(v.dust);v.boom=age(v.boom);v.banners=age(v.banners);
  for(const f of v.falls){f.l+=dt;
    if(dt>0&&f.l<f.max*.8){f.trail+=dt;if(f.trail>=.07){f.trail%=.07;const p=fallPose(f);bloodBurst(v,p.x,p.y,v.low?1:2,(f.dead.x-f.x)/f.max*.08,(f.dead.y-f.y)/f.max*.08,p.lift+3,3)}}
    if(f.l>=f.max){bloodBurst(v,f.dead.x,f.dead.y,f.blast?6:3,0,0,1,3);v.dead.push(f.dead);if(v.dead.length>1400)v.dead.shift();v.dust.push({x:f.dead.x,y:f.dead.y,r:1,g:f.blast?9:4,a:.3,l:0,max:.45})}}
  v.falls=v.falls.filter(f=>f.l<f.max);
  if(dt>0)for(const d of v.dead)d.age=Math.min(1.2,(d.age??1.2)+dt);
  for(const d of v.debris||[]){d.l+=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;d.vz-=65*dt;d.angle+=d.spin*dt;
    if(d.z<0){d.z=0;d.vz=Math.abs(d.vz)*.22;d.vx*=Math.exp(-dt*10);d.vy*=Math.exp(-dt*10);d.spin*=Math.exp(-dt*8)}}
  if(v.debris)v.debris=v.debris.filter(d=>d.l<d.max);
  for(const b of v.blood||[]){b.l+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.vz-=34*dt;if(b.z<0){b.z=0;b.vz=0;b.vx*=Math.exp(-dt*14);b.vy*=Math.exp(-dt*14)}}
  v.blood=(v.blood||[]).filter(b=>b.l<b.max);
  if(dt>0)for(const d of v.dust){d.x+=(d.vx||0)*dt;d.y+=(d.vy||0)*dt;if(d.vx!=null){d.vx*=Math.exp(-dt*3);d.vy*=Math.exp(-dt*3)}}
  for(const s of v.smoke){s.x+=(.65+Math.sin(v.B.t*.12)*.25)*dt;s.y-=.18*dt}
  for(const f of v.flash)f.l-=dt;v.flash=v.flash.filter(f=>f.l>0);
  for(const s of v.spark)s.l-=dt;v.spark=v.spark.filter(s=>s.l>0);
  for(const s of v.spray){s.x+=s.vx*dt;s.y+=s.vy*dt;s.l-=dt}v.spray=v.spray.filter(s=>s.l>0);
}
function selOf(v){return(v.sel||[]).filter(r=>r.n&&!r.broken)}
function sideMen(B,s){let n=0;for(const r of B.regs)if(r.side===s&&r.type!=='gen'&&!r.broken)n+=r.n;return n}
function statHtml(v){return[0,1].map(s=>{const f=s?v.o.df:v.o.af;return`<span><i class="sw" style="background:${NF(f).col}"></i>${cap1(fname(f)).replace(/^The /,'')} ${sideMen(v.B,s)}</span>`}).join('')}
function unitStatus(B,r){
  if(r.wallPost!=null&&!r.broken)return r.moving?'Moving to walls':'Garrisoning walls';
  if(r.broken||B.routing===r.side)return 'Routing';
  if(r.wallTarget!=null&&ordOf(B,r)==='walls')return B.seg[r.wallTarget]>0?`Targeting wall section ${r.wallTarget+1}`:'Breach opened · awaiting orders';
  if(fixingBayonets(B,r))return `Fixing bayonets · ${Math.ceil(r.fixUntil-B.t)}s`;
  if(bayonetBraced(B,r))return 'Bayonets braced';
  if(r.forming)return `Forming ${r.form} · ${Math.round((r.formProgress||0)*100)}%`;
  if(r.moving&&(r.bayonet||r.mode==='charge'))return 'Charging';
  if(drumming(B,r))return 'Drum rally';
  if(isGun(r.type)&&!r.men.some(m=>!m.role&&operational(m)))return 'Abandoned';
  if(r.type==='how'&&r.hs!=='ready')return r.hs==='deploy'?'Deploying':'Limbered';
  if(r.moving)return 'Moving';
  if(r.dug)return 'Dug in';
  if(r.mor<30)return 'Wavering';
  return ORDN[ordOf(B,r)]||'Ready';
}
function reloadStatus(r){const guns=r.men.filter(m=>m.crew&&operational(m));const left=isGun(r.type)?Math.max(0,...guns.map(m=>m.cd||0)):Math.max(0,r.reload||0);return left>.1?`Reloading · ${Math.ceil(left)}s nominal`:'Ready to fire'}
function battleSelectionText(v){
  const sel=selOf(v),r=sel[0];if(!r)return 'Select a formation to inspect it and give orders.';
  return sel.length===1?`${r.label} · ${unitStatus(v.B,r)} · ${drumming(v.B,r)?'Fire halted':reloadStatus(r)} · range ${firingRange(r)} paces · morale ${Math.round(r.mor)} · fatigue ${Math.round(r.fat)}`:`${sel.length} formations selected · ${sel.reduce((n,r)=>n+r.n,0)} figures · range ${[...new Set(sel.map(firingRange))].sort((a,b)=>a-b).join('/')} paces · morale ${Math.round(sel.reduce((n,r)=>n+r.mor,0)/sel.length)} · fatigue ${Math.round(sel.reduce((n,r)=>n+r.fat,0)/sel.length)}`;
}
function refreshBattleStatus(v){
  $('bstat').innerHTML=statHtml(v);
  const sel=selOf(v),status=$('bunitstatus'),advice=$('badvice');
  if(status)status.textContent=battleSelectionText(v);
  const personnel=$('bpersonnelstatus');if(personnel){const focused=sel.map(personnelTarget).filter(Boolean);personnel.textContent=focused.length?[...new Set(focused.map(m=>`${PERSONNEL[m.role]} · ${m.reg.label}`))].join(' / '):'Choose a target above. Fallen targets return your troops to normal targeting.'}
  for(const b of ($('bctl').querySelectorAll?.('[data-act="bpersonnel"]')||[])){const role=b.dataset.v,on=sel.length>0&&sel.every(r=>role==='clear'?!personnelTarget(r):personnelTarget(r)?.role===role);b.disabled=v.B.routing>=0||v.B.done||role!=='clear'&&!sel.some(r=>!r.broken&&personnelOptions(v.B,r,role).length);if(role!=='clear'){const n=new Set(sel.flatMap(r=>personnelOptions(v.B,r,role))).size;b.textContent=n?`Target ${PERSONNEL[role].toLowerCase()} · ${n}`:`${PERSONNEL[role]} · none alive`}b.setAttribute('aria-pressed',String(on));b.classList.toggle('brass',on)}
  if(advice){const lines=sel.length===1?battleAdvice(v.B,sel[0]):[...new Set(sel.flatMap(r=>battleAdvice(v.B,r).filter(x=>!/Ready\.|Target is|Attack order/.test(x))))];
    advice.textContent=lines.slice(0,v.more?4:1).join(' ')}
  const pause=$('bpause');if(pause){pause.textContent=v.paused?'Resume battle':'Pause battle';pause.setAttribute('aria-pressed',String(!!v.paused));pause.disabled=v.B.routing>=0}
  const drums=$('bdrum');if(drums){const foot=sel.filter(r=>isFoot(r.type)),active=foot.some(r=>drumming(v.B,r)),ready=foot.some(r=>canDrumRally(v.B,r));drums.disabled=!ready;const wait=Math.min(...foot.filter(r=>r.drummer?.alive).map(r=>Math.max(0,Math.ceil((r.drumReady||0)-v.B.t))));drums.textContent=active?'Drums rallying…':ready?'Drum rally':!foot.some(r=>r.drummer?.alive)?'Drummer lost':wait>0&&Number.isFinite(wait)?`Drum rally · ${wait}s`:'Drum rally · unsafe'}
  const siege=$('bsiegestatus');if(siege){const aimed=sel.filter(r=>r.wallTarget!=null&&ordOf(v.B,r)==='walls');siege.textContent=v.wallAimMode?'Click an intact wall section on the battlefield.':aimed.length?[...new Set(aimed.map(r=>v.B.seg[r.wallTarget]>0?`Section ${r.wallTarget+1}: ${Math.ceil(v.B.seg[r.wallTarget]/v.B.segHp*100)}% wall strength`:`Section ${r.wallTarget+1} breached — guns hold fire`))].join(' · '):'Choose the point where you want to open a breach.'}
  const point=$('bwallpoint');if(point)point.disabled=v.B.done||v.B.routing>=0||!v.B.seg?.some(hp=>hp>0)||!(sel.length?sel:v.B.regs.filter(r=>r.side===v.ps)).some(r=>isGun(r.type)&&r.n&&!r.broken);
  const wall=$('bwall');if(wall){const troops=sel.length?sel:v.B.regs.filter(r=>r.side===v.ps);wall.disabled=!troops.some(r=>wallSlots(v.B,r).length);wall.textContent=troops.some(r=>r.wallPost!=null)?'Reassign wall positions':'Garrison walls'}
  const bay=$('bfix');if(bay){const foot=sel.filter(r=>isFoot(r.type)),busy=foot.some(r=>fixingBayonets(v.B,r)),fixed=foot.length&&foot.every(r=>r.bayonetsFixed);bay.disabled=!foot.some(r=>canFixBayonets(v.B,r));bay.textContent=busy?'Fixing bayonets…':fixed?'Bayonets fixed':'Fix bayonets';bay.setAttribute('aria-pressed',String(!!fixed))}
  const rally=$('brally');if(rally){const wait=Math.max(0,Math.ceil((v.rallyAt||0)-v.B.t));rally.textContent=wait?`Rally · ${wait}s`:'Rally nearby';rally.disabled=v.B.routing>=0||wait>0||!v.B.general[v.ps]?.alive}
}
const ORDER_HELP={stand:'Stay here; fire at targets in range',ready:'Halt, form line, fire when loaded',advance:'Move toward the enemy; line can fire',hold:'Hold the line and face the enemy',dig:'Stay here and build cover',charge:'Close rapidly and fight in melee',flank:'Move around the enemy’s side',wait:'Stay here without attacking',auto:'Choose targets and attack',shoot:'Use carbines from firing range',fire:'Fire at enemy formations',counter:'Prioritise enemy artillery',walls:'Concentrate fire to breach wall sections'};
function personnelPanel(v){
  const sel=selOf(v);if(!sel.length)return '';
  return `<div class="order-section personnel-orders"><div class="lbl">Target key personnel</div><div class="row">${Object.entries(PERSONNEL).map(([role,name])=>`<button class="btn sm" data-act="bpersonnel" data-v="${role}">Target ${name.toLowerCase()}</button>`).join('')}<button class="btn sm" data-act="bpersonnel" data-v="clear">Normal targeting</button></div><p class="order-help" id="bpersonnelstatus"></p><p class="order-help">Targets the chosen enemy formation when possible, otherwise the nearest matching person. Drummer: removes drum recovery. Sergeant: slows reloads. General: removes commander support and shocks the army. Aimed musket fire has 25% fewer hits; range and cover still apply.</p></div>`;
}
function renderBattleUI(v){
  const focused=document.activeElement,focusData=focused?.closest?.('#bctl,#bquick')?{...focused.dataset}:null;
  const B=v.B,dis=B.routing>=0?'disabled':'';
  $('bexpand').textContent=v.expanded?'Restore view':'Expand battlefield';$('bexpand').setAttribute('aria-pressed',String(!!v.expanded));$('borders').textContent=v.ordersOpen?'Hide orders':'Show orders';$('borders').setAttribute('aria-expanded',String(!!v.ordersOpen));
  if(v.ps<0){$('bctl').innerHTML='';$('bquick').innerHTML='';return}
  const sel=selOf(v),groups=sel.length?[...new Set(sel.map(r=>grp(r.type)))]:[],has=g=>B.regs.some(r=>r.side===v.ps&&r.n&&grp(r.type)===g),foot=sel.filter(r=>isFoot(r.type));
  const ob=(g,val,active)=>`<button class="btn sm border-option ${active===val?'brass':''}" data-act="bo" data-g="${g}" data-v="${val}" aria-pressed="${active===val}" ${dis}><b>${ORDN[val]}</b><small>${ORDER_HELP[val]}</small></button>`;
  const orders=(g,selected)=>{const active=selected?sel.filter(r=>grp(r.type)===g):[],opts=g==='foot'&&!v.more?['stand','ready','advance','charge']:ORDS[g];
    return `<div class="order-section"><div class="lbl">${{foot:'Infantry orders',horse:'Cavalry orders',guns:'Artillery orders'}[g]}${selected?'':' · entire army'}</div><div class="order-grid">${opts.map(o=>ob(selected?'sel-'+g:g,o,selected?(active.every(r=>ordOf(B,r)===o)?o:''):B.orders[v.ps][g])).join('')}</div></div>`};
  const training=v.o.guided?`<div class="bsel">${!v.trainedOrder?'Select All foot, then Advance.':!v.trainedResume?'Press Resume to let orders take effect.':!v.trainedFlank?'Select All horse, then Flank.':'Training complete. Pause any time to give orders.'}</div>`:'';
  $('bquick').innerHTML=`<button id="bpause" class="btn brass" data-act="bpause" aria-pressed="${!!v.paused}" ${dis}>${v.paused?'Resume battle':'Pause battle'}</button><button id="brally" class="btn" data-act="brally">Rally nearby</button><button class="btn" data-act="bmore" aria-expanded="${!!v.more}">${v.more?'Fewer orders':'More orders'}</button>`;
  $('bctl').innerHTML=`${training}<div class="order-section"><div class="lbl">1 · Select troops</div><div class="row">${[['foot','All foot'],['horse','All horse'],['guns','All guns']].filter(([g])=>has(g)).map(([g,n])=>`<button class="btn sm" data-act="bselg" data-g="${g}" ${dis}>${n}</button>`).join('')}${sel.length?'<button class="btn sm" data-act="bdesel">Deselect</button>':''}</div></div>
    <div class="bsel" id="bunitstatus"></div>
    ${v.ps===1&&B.seg?`<div class="order-section"><div class="lbl">Fortress defence</div><button id="bwall" class="btn brass" data-act="bwall" ${dis}>Garrison walls</button><p class="order-help">${sel.length?'Selected infantry and militia':'Your infantry and militia'} move to separate intact wall sections, face outward and hold. Other troop types keep their orders. Choose a new order to leave the walls.</p></div>`:''}
    ${v.ps===0&&B.seg?`<div class="order-section"><div class="lbl">Siege target</div><button id="bwallpoint" class="btn brass" data-act="bwallpoint" aria-pressed="${!!v.wallAimMode}" ${dis}>${v.wallAimMode?'Cancel wall target':'Target wall point…'}</button><p class="order-help" id="bsiegestatus"></p><p class="order-help">Selected guns and howitzers concentrate on the section you click, then hold fire once it breaches. With no selection, all your guns are assigned.</p></div>`:''}
    ${personnelPanel(v)}
    ${foot.length?`<div class="order-section"><div class="lbl">2 · Formation</div><div class="row">${[['line','Form line'],['column','March column'],['auto','Automatic']].map(([val,label])=>{const on=foot.every(r=>(r.formOrder||'auto')===val);return `<button class="btn sm ${on?'brass':''}" data-act="bform" data-v="${val}" aria-pressed="${on}" ${dis}>${label}</button>`}).join('')}</div><p class="order-help">Line fires; column cannot. Formation keeps your order and destination. Hold position to form up here.</p></div>`:''}
    ${sel.length||v.armyOrders?`<div class="order-section"><div class="lbl">${foot.length?'3':'2'} · Give an order</div>${v.armyOrders?['foot','horse','guns'].filter(has).map(g=>orders(g,false)).join(''):groups.map(g=>orders(g,true)).join('')}</div>`:'<p class="order-help">Tap your troops on the field, or select a group above. Orders take effect when the battle is running.</p>'}
    ${foot.length?'<div class="order-section"><div class="lbl">Preparation & morale</div><div class="row"><button id="bfix" class="btn sm" data-act="bfix">Fix bayonets</button><button id="bdrum" class="btn sm" data-act="bdrum">Drum rally</button></div><p class="order-help">Bayonets: halt for 3s to prepare for melee. Drums: halt movement and fire for 8s, restoring up to 16 morale.</p></div>':''}
    ${sel.length?`<div class="order-section"><button class="btn sm ${v.moveMode?'brass':''}" data-act="bmove" ${dis}>${v.moveMode?'Cancel destination':'Move to…'}</button>${foot.length?`<button class="btn sm ${v.faceMode?'brass':''}" data-act="bface" ${dis}>${v.faceMode?'Cancel facing':'Face toward…'}</button>`:''}<p class="order-help">${v.faceMode?'Tap a point to face it. Infantry halt and turn their ranks; the gold arrow marks their front.':v.moveMode?'Tap a point on the battlefield to move there. Your chosen formation stays active.':'Move to… sets a destination. Tap an enemy to attack it. Tap empty ground to deselect.'}</p></div>`:''}
    <details class="order-section"><summary>Uniforms &amp; roles</summary>${[v.o.af,v.o.df].map(f=>{const N=NF(f);return `<p class="order-help"><span class="sw" style="background:${N.coat}"></span><b>${esc(N.name)}</b> · ${uniformStyle(N).label}</p>`}).join('')}<p class="order-help">Sergeants carry a polearm and gold sash. Drummers carry a drum. Generals ride with their aides. Target markers name the person your selected troops are pursuing.</p></details>
    <details class="order-section"><summary>Why these troops are acting this way</summary><div class="battle-advice" id="badvice"></div></details>
    ${v.more?`<div class="row"><button class="btn sm" data-act="bselg" data-g="all" ${dis}>Everyone</button><button class="btn sm" data-act="barmy">${v.armyOrders?'Unit orders':'Army orders'}</button>${sel.length?'<button class="btn sm" data-act="bclear">Clear orders</button>':''}<button class="btn sm" data-act="branges">Gun ranges</button><button class="btn sm" data-act="bspeed">Speed ×${v.speed}</button><button class="btn sm red" data-act="bretreat" ${dis}>All retreat</button><button class="btn sm" data-act="bskip" ${dis}>Skip to result</button></div>`:''}`;
  refreshBattleStatus(v);
  if(focusData){const buttons=[...($('battle').querySelectorAll?.('button')||[])];(buttons.find(b=>!b.disabled&&['act','g','v'].every(k=>b.dataset[k]===focusData[k]))||$('bpause'))?.focus?.()}
}
function chooseWallPoint(v,x,y){
  const B=v.B,i=B.seg&&nearWall(B,x,y)?segOf(B,x,y):-1;
  if(!(B.seg?.[i]>0)){B.fx.banner('Choose an intact wall section; empty ground and existing breaches are not targets.');return false}
  const selected=selOf(v),guns=(selected.length?selected:B.regs.filter(r=>r.side===v.ps)).filter(r=>r.side===v.ps&&orderWallTarget(B,r,i));
  if(!guns.length){B.fx.banner('Select attacking field guns or howitzers first.');return false}
  v.sel=guns;v.wallAimMode=false;v.moveMode=false;v.faceMode=false;B.fx.banner(`${guns.length} batteries target wall section ${i+1}`);SND.command();renderBattleUI(v);return true;
}
// zoom and pan: pinch or wheel to zoom, drag to pan, Follow to return to the automatic camera
const PTR=new Map();let pinch0=0,dragged=false;
function camManual(v){if(!v.manual){const c=v.cam||{z:1,x:FW/2,y:FH/2};v.manual={z:c.z,x:c.x,y:c.y}}$('bzauto').classList.remove('brass');return v.manual}
function camZoom(v,f){const m=camManual(v);m.z=clamp(m.z*f,1,5)}
function camFort(v){if(!v.o.fortKind)return;v.fortCam=true;v.manual={z:v.o.fortKind==='capital'?1.28:v.o.fortKind==='palisade'?1.7:1.5,x:FW/2,y:105};$('bzauto').classList.remove('brass');$('bzfort').classList.add('brass')}
function hitUnit(v,cx,cy){const rc=bcv.getBoundingClientRect(),sx=(cx-rc.left)/v.s,sy=(cy-rc.top)/v.s,vx=v.view.L+sx/v.view.z,vy=v.view.Tp+sy/v.view.z;
  let best=null,bd=20/Math.sqrt(v.view.z)+6;for(const r of v.B.regs){if(!r.n||r.type==='gen')continue;const q=P(r.x,r.y),d=Math.hypot(q[0]-vx,q[1]-4*q[2]-vy);if(d<bd){bd=d;best=r}}return{best,vx,vy}}
bcv.addEventListener('pointerdown',e=>{const v=BV;if(v&&!v.resolving&&v.view&&v.ps>=0&&v.B.routing<0&&PTR.size===0){const h=hitUnit(v,e.clientX,e.clientY);v.dragUnit=!v.wallAimMode&&!v.faceMode&&h.best&&h.best.side===v.ps&&!h.best.broken?h.best:null;v.dragTo=null}
  PTR.set(e.pointerId,{x:e.clientX,y:e.clientY});dragged=false;if(PTR.size===2&&v)v.dragUnit=null;if(PTR.size===2){const[a,b]=[...PTR.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y)}});
bcv.addEventListener('pointermove',e=>{const v=BV,p=PTR.get(e.pointerId);if(!v||!p||v.resolving)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(PTR.size===1&&v.dragUnit){if(!dragged&&Math.hypot(dx,dy)<7)return;dragged=true;const h=hitUnit(v,e.clientX,e.clientY);v.dragTo={x:h.vx,y:h.vy};return}
  if(PTR.size===1){if(!dragged&&Math.hypot(dx,dy)<7)return;dragged=true;const m=camManual(v);m.x-=dx/(v.s*m.z);m.y-=dy/(v.s*m.z);PTR.set(e.pointerId,{x:e.clientX,y:e.clientY})}
  else if(PTR.size===2){PTR.set(e.pointerId,{x:e.clientX,y:e.clientY});const[a,b]=[...PTR.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch0){camZoom(v,d/pinch0);dragged=true}pinch0=d}});
const ptrEnd=e=>{const v=BV;
  if(v&&v.dragUnit&&v.dragTo&&dragged&&e.type==='pointerup'){const lead=v.dragUnit,sel0=selOf(v),sel=sel0.includes(lead)?sel0:[lead],g=UP(v.dragTo.x,v.dragTo.y);
    for(const r of sel){leaveWallPost(r);r.wallTarget=null;r.manualFace=false;r.goal={x:clamp(g.x+r.x-lead.x,10,FW-10),y:clamp(g.y+r.y-lead.y,10,FH-10)};r.forced=null;r.focusMan=null;r.dug=false}
    v.sel=sel;v.B.fx.banner(`${sel.length>1?sel.length+' units move':lead.label+' moves'} to the new position`);SND.command();renderBattleUI(v)}
  if(v){v.dragUnit=null;v.dragTo=null}PTR.delete(e.pointerId);if(PTR.size<2)pinch0=0};
bcv.addEventListener('pointerup',ptrEnd);bcv.addEventListener('pointercancel',ptrEnd);
bcv.addEventListener('wheel',e=>{if(!BV)return;e.preventDefault();camZoom(BV,e.deltaY<0?1.12:1/1.12)},{passive:false});
bcv.style.touchAction='none';
bcv.addEventListener('click',e=>{
  if(dragged){dragged=false;return}
  const v=BV;if(!v||v.closed||v.resolving||v.ps<0||!v.view||v.B.routing>=0)return;
  const rc=bcv.getBoundingClientRect(),sx=(e.clientX-rc.left)/v.s,sy=(e.clientY-rc.top)/v.s,vx=v.view.L+sx/v.view.z,vy=v.view.Tp+sy/v.view.z;
  let best=null,bd=20/Math.sqrt(v.view.z)+6;
  for(const r of v.B.regs){if(!r.n||r.type==='gen')continue;const q=P(r.x,r.y),d=Math.hypot(q[0]-vx,q[1]-4*q[2]-vy);if(d<bd){bd=d;best=r}}
  const sel=selOf(v);
  if(v.wallAimMode){const g=UP(vx,vy);chooseWallPoint(v,g.x,g.y);return}
  if(v.faceMode&&sel.length){const g=UP(vx,vy);for(const r of sel)faceFormation(r,g.x,g.y);v.faceMode=false;v.B.fx.banner('Infantry halt and turn to the marked front');SND.command()}
  else if(best&&best.side===v.ps){v.moveMode=false;v.sel=sel.includes(best)?sel.filter(r=>r!==best):[...sel,best]}
  else if(sel.length){
    if(best){for(const r of sel){leaveWallPost(r);r.wallTarget=null;r.manualFace=false;r.forced=best;r.focusMan=null;r.goal=null;if(isFoot(r.type)&&!['charge','ready'].includes(ordOf(v.B,r)))r.ord='advance';if(isHorse(r.type)&&!['shoot','flank'].includes(ordOf(v.B,r)))r.ord='charge'}
      v.B.fx.banner(`${sel.length>1?sel.length+' units':sel[0].label} ordered against ${best.label}`)}
    else if(v.moveMode){const g=UP(vx,vy),cx=sel.reduce((a,r)=>a+r.x,0)/sel.length,cy=sel.reduce((a,r)=>a+r.y,0)/sel.length;
      for(const r of sel){leaveWallPost(r);r.wallTarget=null;r.manualFace=false;r.goal={x:clamp(g.x+r.x-cx,10,FW-10),y:clamp(g.y+r.y-cy,10,FH-10)};r.forced=null;r.focusMan=null;r.dug=false}
      v.B.fx.banner(`${sel.length>1?sel.length+' units move':sel[0].label+' moves'} to the new position`)}
    if(best||v.moveMode)SND.command();else v.sel=[];v.moveMode=false;
  }
  if(v.expanded&&selOf(v).length){v.ordersOpen=true;$('battle').classList.add('orders-open')}
  renderBattleUI(v);
});
document.addEventListener('click',e=>{const v=BV;if(!v||v.closed||!selOf(v).length||e.target===bcv||e.target.closest('#bctl,#bquick,#bzoom,#bres,button,input,select,details'))return;v.sel=[];v.moveMode=false;renderBattleUI(v)});
function liveBattle(o){
  startBattleArt();
  return new Promise(resolve=>{
    const B=makeBattle(o),ps=o.af===0?0:o.df===0?1:-1;B.player=ps;if(ps>=0)B.orders[ps]={foot:'stand',horse:'wait',guns:'stand'};
    const reviewFire=location.hash==='#practice-fire'||location.hash==='#practice-close';
    if(reviewFire&&ps>=0)B.orders[ps]={foot:'advance',horse:'charge',guns:'fire'};
    $('battle').classList.remove('expanded','orders-open');
    const v={B,o,ps,more:!!o.guided,speed:PREFS.speed||1,resolve,smoke:[],flash:[],dust:[],boom:[],spark:[],spray:[],blood:[],falls:[],banners:[],houses:[],dead:[],dragUnit:null,dragTo:null,showRanges:false,acc:0,last:0,finished:false,closed:false,sel:[],low:false,frameAvg:0,frameCount:0};
    v.paused=!!o.guided;BV=v;$('battle').hidden=false;$('bres').hidden=true;syncOverlayFocus();$('bzauto').classList.add('brass');
    if(location.hash==='#practice-close')v.manual={z:4,x:FW/2,y:290};
    if(location.hash==='#review-fort')camFort(v);
    if(location.hash==='#review-forest'||location.hash==='#review-river'||location.hash==='#review-hills')v.manual={z:1.25,x:FW/2,y:FH/2};
    if(!/^#(practice-|review)/.test(location.hash)){v.manual={z:1,x:FW/2,y:FH/2};$('bzauto').classList.remove('brass')}
    const tl=T(o.p),wk=o.fortKind;
    $('btitle').textContent=`Battle of ${placeName(o.p)}`;
    $('bsub').textContent=cap1(`${fname(o.af)} attacks ${o.def&&cnt(o.def)?fname(o.df):o.df===CITYF?'the garrison':'the '+fname(o.df)+' garrison'} · ${TER[o.terrain||tl.t].n.toLowerCase()}${o.river?' across a river':''}${wk==='fort'?' · stone star fort':wk==='palisade'?' · wooden fort':wk==='capital'?' · city walls':''}`);
    $('bzfort').hidden=!wk;$('bzfort').classList.toggle('brass',location.hash==='#review-fort');
    renderBattleUI(v);$('bpause')?.focus?.();sizeBattle(v);drawGround(v);B.fx=fxOf(v);SND.init();SND.syncBattle(v);SND.music(true,true);
    let reviewWarmup=reviewFire?(location.hash==='#practice-close'?150:690):0;
    if(location.hash!=='#review-fort'){if(ps>=0)B.fx.banner('The armies start well apart. Give orders, then advance to engage.');const gn=o.gen||[];if(gn[0]||gn[1])B.fx.banner([gn[0]?`General ${gn[0].name} commands the attack`:'',gn[1]?`General ${gn[1].name} holds the field`:''].filter(Boolean).join(' · '))}
    let uiT=0;
    const frame=now=>{
      if(v.closed)return;
      const dt=v.last?Math.min(.1,(now-v.last)/1000):0;v.last=now;
      v.artWait=battleTerrainPending>0;
      if(!v.artWait&&reviewWarmup){for(let i=0;i<reviewWarmup&&!B.done;i++){stepBattle(B,1/30);tickFx(v,1/30)}reviewWarmup=0}
      if(dt){v.frameAvg=v.frameAvg?v.frameAvg*.96+dt*.04:dt;if(++v.frameCount>120){v.low=v.frameAvg>1/29;v.frameCount=0}}
      let advanced=0;
      if(!v.artWait&&!B.done&&!v.paused&&!v.resolving){v.acc+=dt*v.speed*BATTLE_PACE;let n=0;while(v.acc>=1/30&&n++<16){stepBattle(B,1/30);v.acc-=1/30;advanced+=1/30}}
      if(!v.paused&&!B.done){if(B.regs.some(r=>r.n&&r.moving&&isHorse(r.type))){SND.hooves();SND.neigh()}
        SND.ambience()}
      SND.syncBattle(v);
      tickFx(v,B.done?dt:advanced);drawBattle(v);
      if((uiT+=dt)>.3){uiT=0;$('bstat').innerHTML=statHtml(v);if(!v.resolving)refreshBattleStatus(v)}
      if(B.done&&!v.finished&&!v.resolving){v.finished=true;setTimeout(()=>finishBattle(v),500)}
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
function finishBattle(v){
  const B=v.B,o=v.o;v.sel=[];
  const aL=battleLosses(B,o.att,0),dL=o.def?battleLosses(B,o.def,1):garLoss(B,o.gar);
  v.result={aw:B.loser===1,aL,dL,genDied:B.genDied,explanation:battleExplanation(B)};renderBattleUI(v);
  const mine=v.ps>=0?(v.ps===0)===v.result.aw:null;
  $('bres').innerHTML=`<h2>${mine==null?'':mine?'Victory at ':'Defeat at '}${placeName(o.p)}</h2>
   <p>${cap1(fname(o.af))} lost ${lossStr(aL)}.</p><p>The defenders lost ${lossStr(dL)}.</p>
   <p style="color:var(--muted);font-size:13px">${cap1(v.result.aw?fname(o.af):o.df===CITYF?'the free city':fname(o.df))} holds the field.${B.wallMax&&B.wallHp<B.wallMax?` The walls stand at ${Math.round(B.wallHp/B.wallMax*100)}%.`:''}${B.genDied.some(Boolean)?' A general has fallen.':''} The fallen lie where they fell.</p>
   <h3>Why the battle ended</h3><p>${esc(v.result.explanation[0])}</p>${v.result.explanation[1]?`<p class="note">${esc(v.result.explanation[1])}</p>`:''}${v.result.explanation.length>1?`<details><summary>Recorded turning points</summary><ul>${v.result.explanation.slice(1).map(t=>`<li>${esc(t)}</li>`).join('')}</ul><p>Recorded events from this battle. Times use the battle clock.</p></details>`:''}
   <button class="btn brass" data-act="bdone">Return to the map</button>`;
  $('bres').hidden=false;syncOverlayFocus();$('bres').querySelector?.('button')?.focus?.();
}

/* ============ rendering: map ============ */
const cv=$('map'),ctx=cv.getContext('2d');let ts=34;
function sizeMap(){
  const wide=innerWidth>=860;
  const availW=wide?Math.min(innerWidth-32-410,760):$('app').clientWidth-32;
  const availH=wide?innerHeight-150:innerHeight*.5;
  ts=Math.max(18,Math.floor(Math.min(availW/MW,availH/MH,60)*UI.zoom));
  const dpr=Math.min(2,devicePixelRatio||1);cv.width=MW*ts*dpr;cv.height=MH*ts*dpr;cv.style.width=MW*ts+'px';cv.style.height=MH*ts+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const wrap=$('mapwrap');wrap.style.height=UI.zoom>1?Math.round(Math.min(availH,MH*ts/UI.zoom)+2)+'px':'';
  $('zoom').textContent=UI.zoom>1?'Zoom out':'Zoom in';
}
const INK='#2a2016';
function provPath(p){const o=G.outline[p];ctx.beginPath();ctx.moveTo(o[0][0]*ts,o[0][1]*ts);for(let k=1;k<o.length;k++)ctx.lineTo(o[k][0]*ts,o[k][1]*ts);ctx.closePath()}
function polyline(pts){ctx.beginPath();ctx.moveTo(pts[0][0]*ts,pts[0][1]*ts);for(let k=1;k<pts.length;k++)ctx.lineTo(pts[k][0]*ts,pts[k][1]*ts)}
function drawTerrain(p){
  const t=T(p);ctx.fillStyle=TER[t.t].c;provPath(p);ctx.fill();
  ctx.save();provPath(p);ctx.clip();ctx.strokeStyle='rgba(42,32,22,.45)';ctx.lineWidth=1;
  for(const[mx,my]of G.marks[p]){const px=mx*ts,py=my*ts,s=ts*.09;
    if(t.t==='forest'){ctx.fillStyle='#4e6038';ctx.beginPath();ctx.moveTo(px,py-s*1.5);ctx.lineTo(px+s,py+s*.6);ctx.lineTo(px-s,py+s*.6);ctx.closePath();ctx.fill()}
    else if(t.t==='hills'){ctx.beginPath();ctx.moveTo(px-s*1.3,py+s*.5);ctx.quadraticCurveTo(px,py-s*1.4,px+s*1.3,py+s*.5);ctx.stroke()}
    else if(t.t==='water'){ctx.strokeStyle='rgba(40,70,90,.5)';ctx.beginPath();ctx.moveTo(px-s*1.5,py);ctx.quadraticCurveTo(px-s*.7,py-s*.6,px,py);ctx.quadraticCurveTo(px+s*.7,py+s*.6,px+s*1.5,py);ctx.stroke()}
    else{ctx.fillStyle='rgba(60,70,30,.3)';ctx.fillRect(px,py,1.5,1.5)}}
  ctx.restore();
}
function drawRivers(){
  for(const river of S.rivers||[]){if(river.length<2)continue;
    const pts=river.map(p=>[G.c[p][0]*ts,G.c[p][1]*ts]);
    if(G.touchTop[river[0]])pts.unshift([pts[0][0],0]);
    if(G.touchBot[river[river.length-1]])pts.push([pts[pts.length-1][0],MH*ts]);
    const path=()=>{ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length-1;k++){const mx=(pts[k][0]+pts[k+1][0])/2,my=(pts[k][1]+pts[k+1][1])/2;ctx.quadraticCurveTo(pts[k][0],pts[k][1],mx,my)}ctx.lineTo(pts[pts.length-1][0],pts[pts.length-1][1])};
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#3f5f73';ctx.lineWidth=ts*.24;path();ctx.stroke();ctx.strokeStyle='#6f98b3';ctx.lineWidth=ts*.15;path();ctx.stroke();ctx.lineCap='butt';
  }
}
function star(cx,cy,n,r1,r2){ctx.beginPath();for(let k=0;k<n*2;k++){const r=k%2?r2:r1,a=-Math.PI/2+k*Math.PI/n;const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;k?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()}
function drawBuilding(b,cx,cy,owner){
  const s=ts*.17;ctx.lineWidth=Math.max(1.1,ts/30);ctx.strokeStyle=INK;ctx.fillStyle=INK;
  const house=(hx,hy,w,roof)=>{ctx.fillStyle='#e9dfc6';ctx.fillRect(hx-w/2,hy-w*.2,w,w*.7);ctx.strokeRect(hx-w/2,hy-w*.2,w,w*.7);ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(hx-w*.65,hy-w*.2);ctx.lineTo(hx,hy-w*.8);ctx.lineTo(hx+w*.65,hy-w*.2);ctx.closePath();ctx.fill();ctx.stroke()};
  const tower=(x,y)=>{ctx.fillStyle='#b8ac94';ctx.fillRect(x-s*.22,y-s*.3,s*.44,s*.7);ctx.strokeRect(x-s*.22,y-s*.3,s*.44,s*.7);ctx.fillStyle='#595344';ctx.beginPath();ctx.moveTo(x-s*.3,y-s*.3);ctx.lineTo(x,y-s*.72);ctx.lineTo(x+s*.3,y-s*.3);ctx.closePath();ctx.fill();ctx.stroke()};
  const walled=(capital)=>{ctx.fillStyle='rgba(27,24,18,.22)';ctx.beginPath();ctx.ellipse(cx+s*.13,cy+s*.64,s*1.55,s*.48,0,0,7);ctx.fill();
    ctx.fillStyle='#c5b99e';ctx.fillRect(cx-s*1.25,cy-s*.1,s*2.5,s*.8);ctx.strokeRect(cx-s*1.25,cy-s*.1,s*2.5,s*.8);
    for(const [dx,dy,w]of[[-.67,-.34,.55],[0,-.48,.66],[.66,-.32,.55]])house(cx+dx*s,cy+dy*s,s*w,dx<0?'#884b39':'#595955');
    ctx.fillStyle='#a99d87';ctx.fillRect(cx-s*1.33,cy+s*.3,s*2.66,s*.42);ctx.strokeRect(cx-s*1.33,cy+s*.3,s*2.66,s*.42);
    for(const dx of[-1.25,1.25])tower(cx+dx*s,cy+s*.12);
    ctx.fillStyle='#3c352b';ctx.beginPath();ctx.arc(cx,cy+s*.72,s*.25,Math.PI,0);ctx.fill();
    if(capital){tower(cx,cy-s*.73);ctx.strokeStyle=owner!=null?NF(owner).col:'#8a6536';ctx.lineWidth=Math.max(1,ts/35);ctx.beginPath();ctx.moveTo(cx,cy-s*1.46);ctx.lineTo(cx,cy-s*1.05);ctx.stroke();ctx.fillStyle=owner!=null?NF(owner).col:'#8a6536';ctx.beginPath();ctx.moveTo(cx,cy-s*1.45);ctx.lineTo(cx+s*.48,cy-s*1.31);ctx.lineTo(cx,cy-s*1.19);ctx.fill()}
  };
  switch(b){
    case'capital':walled(true);break;
    case'city':walled(false);break;
    case'fort':ctx.fillStyle='rgba(23,23,19,.28)';star(cx+s*.1,cy+s*.15,5,s*1.35,s*.82);ctx.fill();ctx.fillStyle='#665d4c';star(cx,cy,5,s*1.35,s*.82);ctx.fill();ctx.stroke();ctx.fillStyle='#bfb29a';star(cx,cy,5,s*1.13,s*.69);ctx.fill();ctx.stroke();ctx.fillStyle='#777558';star(cx,cy,5,s*.78,s*.46);ctx.fill();house(cx,cy,s*.54,'#66564a');break;
    case'palisade':ctx.fillStyle='rgba(24,24,17,.25)';ctx.beginPath();ctx.arc(cx+s*.1,cy+s*.13,s*1.1,0,7);ctx.fill();ctx.fillStyle='#777d50';ctx.beginPath();ctx.arc(cx,cy,s*.91,0,7);ctx.fill();ctx.strokeStyle='#674a2e';ctx.lineWidth=Math.max(2,ts/15);ctx.beginPath();ctx.arc(cx,cy,s*.97,.15,Math.PI*1.92);ctx.stroke();ctx.lineWidth=Math.max(1,ts/45);house(cx,cy,s*.67,'#6b5b45');break;
    case'farm':ctx.strokeRect(cx-s,cy-s*.7,s*2,s*1.4);for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(cx-s,cy-s*.7+k*s*.35);ctx.lineTo(cx+s,cy-s*.7+k*s*.35);ctx.stroke()}break;
    case'sawmill':for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(cx+(k-1)*s*.7,cy+(k===1?-s*.5:s*.2),s*.38,0,7);ctx.stroke()}break;
    case'mine':ctx.beginPath();ctx.moveTo(cx-s,cy+s);ctx.lineTo(cx+s*.6,cy-s*.6);ctx.moveTo(cx+s,cy+s);ctx.lineTo(cx-s*.6,cy-s*.6);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy-s*.8,s*.7,Math.PI*1.1,Math.PI*1.9);ctx.stroke();break;
    case'market':ctx.beginPath();ctx.arc(cx,cy,s,0,7);ctx.stroke();ctx.font=`bold ${Math.round(s*1.3)}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('£',cx,cy+1);break;
    case'house':ctx.beginPath();ctx.moveTo(cx-s,cy+s*.8);ctx.lineTo(cx-s,cy-s*.1);ctx.lineTo(cx,cy-s);ctx.lineTo(cx+s,cy-s*.1);ctx.lineTo(cx+s,cy+s*.8);ctx.closePath();ctx.stroke();break;
    case'village':for(const[dx,dy]of[[-.8,.2],[.5,-.2],[.2,.7]])house(cx+dx*s,cy+dy*s,s*.7,'#9b3a2c');break;
    case'town':for(const[dx,dy,w]of[[-1,.3,.7],[0,-.4,.9],[1,.3,.7],[-.4,.9,.6],[.6,.9,.6]])house(cx+dx*s,cy+dy*s,s*w,'#6d5d52');ctx.fillStyle=INK;ctx.fillRect(cx-s*.08,cy-s*1.6,s*.16,s*.9);break;
    case'church':ctx.strokeRect(cx-s*.7,cy-s*.1,s*1.4,s*.9);ctx.beginPath();ctx.moveTo(cx,cy-s*.1);ctx.lineTo(cx,cy-s*1.3);ctx.moveTo(cx-s*.4,cy-s*.9);ctx.lineTo(cx+s*.4,cy-s*.9);ctx.stroke();break;
    case'barracks':ctx.beginPath();ctx.moveTo(cx-s*.6,cy+s);ctx.lineTo(cx-s*.6,cy-s);ctx.stroke();ctx.fillStyle=owner!=null?NF(owner).col:INK;ctx.beginPath();ctx.moveTo(cx-s*.6,cy-s);ctx.lineTo(cx+s,cy-s*.55);ctx.lineTo(cx-s*.6,cy-s*.1);ctx.closePath();ctx.fill();ctx.stroke();break;
    case'foundry':ctx.save();ctx.translate(cx,cy);ctx.rotate(-.35);ctx.fillRect(-s,-s*.22,s*1.8,s*.44);ctx.restore();ctx.beginPath();ctx.arc(cx-s*.3,cy+s*.35,s*.42,0,7);ctx.stroke();break;
  }
}
function moveTargets(){
  const a=S.sel!=null&&armyAt(S.sel);
  if(!a||a.f!==0||a.mv<=0||S.over||UI.busy)return[];
  return nbrs(a.p).filter(q=>canMove(a,q)).map(q=>({p:q,fight:needsFight(0,q)||(T(q).o!=null&&T(q).o!==0&&atWar(0,T(q).o))}));
}
function reducedMotion(){return typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches}
function campaignEffect(p,label,army=null,from=null){
  if(UI.headless)return;
  const now=performance.now();UI.mapFx=(UI.mapFx||[]).filter(e=>(e.t==null||now-e.t<e.duration)&&(!army||e.army!==army));
  UI.mapFx.push({p,label,army,from,t:UI.busy||topOverlay()?null:now,duration:reducedMotion()?1600:1100});UI.mapFx=UI.mapFx.slice(-12);scheduleMapFx();
}
function scheduleMapFx(){if(UI.mapFrame||UI.headless||UI.busy||topOverlay())return;UI.mapFrame=requestAnimationFrame(()=>{UI.mapFrame=null;if(!S)return;draw();if(UI.mapFx?.length)scheduleMapFx()})}
function campaignMarker(a){const e=(UI.mapFx||[]).find(e=>e.army===a.id&&e.p===a.p&&e.from!=null),to=G.c[a.p];if(!e||reducedMotion())return to;
  const t=clamp((performance.now()-(e.t??performance.now()))/650,0,1),q=t*t*(3-2*t),from=G.c[e.from];if(t===1)return to;return[from[0]+(to[0]-from[0])*q,from[1]+(to[1]-from[1])*q]}
function draw(){
  if(!UI.busy&&!topOverlay()){for(const e of UI.mapFx||[])if(e.t==null)e.t=performance.now();if(UI.mapFx?.length)scheduleMapFx()}
  ctx.clearRect(0,0,MW*ts,MH*ts);
  for(let p=0;p<G.n;p++)drawTerrain(p);
  drawRivers();
  for(let p=0;p<G.n;p++){const t=T(p);if(t.o!=null){ctx.fillStyle=hexA(NF(t.o).col,.3);provPath(p);ctx.fill()}}
  ctx.strokeStyle='rgba(42,32,22,.5)';ctx.lineWidth=1;for(let p=0;p<G.n;p++){provPath(p);ctx.stroke()}
  const bw=Math.max(2.5,ts/11);
  for(let p=0;p<G.n;p++){const o=T(p).o;if(o==null)continue;ctx.save();provPath(p);ctx.clip();ctx.strokeStyle=NF(o).col2;ctx.lineWidth=bw;ctx.lineJoin='round';
    for(const e of G.edges[p])if(e.j<0||T(e.j).o!==o){polyline(e.pts);ctx.stroke()}ctx.restore()}
  ctx.strokeStyle='#826444';ctx.lineWidth=Math.max(2,ts/15);ctx.setLineDash([]);
  for(let p=0;p<G.n;p++)if(T(p).road){const x=G.c[p][0]*ts,y=G.c[p][1]*ts;ctx.beginPath();ctx.moveTo(x-ts*.13,y);ctx.lineTo(x+ts*.13,y);ctx.stroke();for(const q of nbrs(p))if(q>p&&T(q).road){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(G.c[q][0]*ts,G.c[q][1]*ts);ctx.stroke()}}
  for(const rt of routes()){ctx.setLineDash([ts*.12,ts*.14]);ctx.lineWidth=Math.max(1.5,ts/18);ctx.strokeStyle=rt.blocked?'#c0392b':'#f3d58a';ctx.beginPath();
    rt.path.forEach((i,k)=>{const px=G.c[i][0]*ts,py=(G.c[i][1]+.45)*ts;k?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke();ctx.setLineDash([])}
  for(let p=0;p<G.n;p++){const t=T(p);if(t.b)drawBuilding(t.b,G.c[p][0]*ts,(G.c[p][1]-.32)*ts,t.o)}
  S.cities.forEach(c=>{if(T(c.p).o!=null)return;const x=G.c[c.p][0]*ts,y=(G.c[c.p][1]-.74)*ts;
    if(c.patron!=null){ctx.fillStyle=NF(c.patron).col;ctx.beginPath();ctx.arc(x,y,ts*.08,0,7);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke()}
    if(c.war[0]){ctx.strokeStyle='#c0392b';ctx.lineWidth=1.6;const k=ts*.08;ctx.beginPath();ctx.moveTo(x-k,y-k);ctx.lineTo(x+k,y+k);ctx.moveTo(x+k,y-k);ctx.lineTo(x-k,y+k);ctx.stroke()}});
  for(const s of S.scars){const x0=(G.c[s.p][0]+.38)*ts,y0=(G.c[s.p][1]-.38)*ts,k=ts*.1;ctx.globalAlpha=Math.max(0,1-(S.turn-s.t)/6);ctx.strokeStyle='#5a1a12';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(x0-k,y0-k);ctx.lineTo(x0+k,y0+k);ctx.moveTo(x0+k,y0-k);ctx.lineTo(x0-k,y0+k);ctx.stroke();ctx.globalAlpha=1}
  if(ts>=30){const fs=Math.max(8,Math.min(12,ts*.2));ctx.font=`italic ${fs}px "Libre Caslon Text",Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
    for(let p=0;p<G.n;p++){if(T(p).t==='water')continue;const x=G.c[p][0]*ts,y=(G.c[p][1]+.62)*ts,nm=placeName(p);ctx.lineWidth=2.6;ctx.strokeStyle='rgba(239,229,207,.75)';ctx.strokeText(nm,x,y);ctx.fillStyle='#2a2016';ctx.fillText(nm,x,y)}}
  for(const m of moveTargets()){ctx.save();provPath(m.p);ctx.clip();ctx.setLineDash([5,4]);ctx.lineWidth=4;ctx.strokeStyle=m.fight?'#c0392b':'#f3d58a';provPath(m.p);ctx.stroke();ctx.restore()}
  for(const a of S.armies){
    const N=NF(a.f),point=campaignMarker(a),bwid=ts*.76,bh=ts*.36,bx=point[0]*ts-bwid/2,by=(point[1]+.08)*ts;
    ctx.fillStyle='rgba(18,16,12,.3)';ctx.beginPath();ctx.ellipse(bx+bwid*.58,by+bh+2,bwid*.65,bh*.25,0,0,7);ctx.fill();
    ctx.fillStyle=N.col2;ctx.beginPath();ctx.moveTo(bx,by+bh*.12);ctx.lineTo(bx+bwid,by+bh*.12);ctx.lineTo(bx+bwid+2,by+bh+2);ctx.lineTo(bx+2,by+bh+2);ctx.closePath();ctx.fill();
    const face=ctx.createLinearGradient(bx,by,bx,by+bh);face.addColorStop(0,N.col2);face.addColorStop(.24,N.col);face.addColorStop(1,N.col2);
    ctx.fillStyle=face;ctx.fillRect(bx,by,bwid,bh);ctx.strokeStyle='rgba(255,244,211,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx+1,by+1);ctx.lineTo(bx+bwid-1,by+1);ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.strokeRect(bx,by,bwid,bh);
    if(UNIT_IMAGES&&ts>=30){const u=a.u,kind=u.hus+u.cav>u.inf+u.mil?'cavalry':u.art+u.how>u.inf+u.mil?'artillery':u.mil>u.inf?'militia':'infantry';
      const set=UNIT_IMAGES[kind],ii=a.f===CITYF?6:Math.max(0,NATIONS.indexOf(N)),im=Array.isArray(set)?set[ii]:set;
      if(im?.complete&&im.naturalWidth){const h=ts*.58,w=Math.min(ts*.46,h*im.naturalWidth/im.naturalHeight),px=bx+bwid*.76;
        ctx.save();ctx.shadowColor='rgba(20,16,10,.58)';ctx.shadowBlur=ts*.045;ctx.shadowOffsetX=ts*.035;ctx.shadowOffsetY=ts*.04;ctx.drawImage(im,px-w/2,by-h+2,w,h);ctx.restore();}}
    const known=a.f===0,n=known?cnt(a.u):null,seg=bwid-4;let sx=bx+2;
    for(const[t,c]of[['mil','#8a6a42'],['inf','#f4efe2'],['cav','#2a2016'],['hus','#2f8a45'],['art','#8a8a8a'],['how','#5a5a5a']]){const w=known?seg*a.u[t]/(n||1):0;ctx.fillStyle=c;ctx.fillRect(sx,by+bh-4,w,2.5);sx+=w}
    ctx.fillStyle=N.txt;ctx.font=`bold ${Math.round(bh*.6)}px ui-sans-serif,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(known?String(n):'?',bx+bwid*.4,by+bh*.45);
    if(a.gen){star(bx,by,5,ts*.1,ts*.045);ctx.fillStyle='#f3d58a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke()}
    if(a.f===0&&a.mv>0&&!S.over){ctx.fillStyle='#f3d58a';ctx.beginPath();ctx.arc(bx+bwid,by,ts*.07,0,7);ctx.fill();ctx.strokeStyle=INK;ctx.stroke()}
  }
  const now=performance.now();UI.mapFx=(UI.mapFx||[]).filter(e=>e.t==null||now-e.t<e.duration);
  for(const e of UI.mapFx){if(e.t==null)continue;const q=clamp((now-e.t)/e.duration,0,1),x=G.c[e.p][0]*ts,y=G.c[e.p][1]*ts;ctx.save();
    ctx.globalAlpha=reducedMotion()?1:Math.min(1,(1-q)*3);ctx.strokeStyle='#fff0ad';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,ts*(reducedMotion()?.45:.25+q*.4),0,Math.PI*2);ctx.stroke();
    ctx.font='bold 12px sans-serif';ctx.textAlign='center';const w=ctx.measureText(e.label).width+12;ctx.fillStyle='#262218';ctx.fillRect(x-w/2,y-ts*.85-14,w,19);ctx.fillStyle='#fff0ad';ctx.fillText(e.label,x,y-ts*.85);ctx.restore();}
  if(S.sel!=null){ctx.save();provPath(S.sel);ctx.clip();ctx.lineWidth=4;ctx.strokeStyle='#fff6d8';provPath(S.sel);ctx.stroke();ctx.restore()}
}
function deselectMapArmy(){
  if(!S||UI.busy||BV&&!BV.closed)return;
  S.sel=null;UI.half=false;UI.confirm=null;UI.tab='tile';save();render();
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&S&&S.sel!=null&&armyAt(S.sel)&&$('home').hidden&&$('modal').hidden&&!(BV&&!BV.closed)){
    e.preventDefault();deselectMapArmy();
  }
});
cv.addEventListener('click',async e=>{
  if(!S||S.over||UI.busy)return;const r=cv.getBoundingClientRect();
  const p=nearestSite(S.sites,(e.clientX-r.left)/ts,(e.clientY-r.top)/ts);
  const a=S.sel!=null&&armyAt(S.sel);
  if(a&&p===S.sel){deselectMapArmy();return}
  if(a&&a.f===0&&a.mv>0&&canMove(a,p)){
    const part=UI.half&&cnt(a.u)>=2?halfOf(a.u):null;S.lastBattle=null;
    UI.busy=true;try{await moveArmy(a,p,part)}finally{UI.busy=false}
    const here=armyAt(p);S.sel=here&&here.f===0?p:a.p;
    if(S.lastBattle&&!watchBattle(0,1))toast(S.lastBattle);
    checkOver();save();render();if(S.over)showReport();return;
  }
  if(a&&a.f===0&&a.mv>0&&nbrs(a.p).includes(p)&&!canStep(0,p)){const t=T(p);
    if(t.o!=null&&t.o!==0&&!atWar(0,t.o))toast(`Use Declare war below to declare war on ${S.fac[t.o].name} before marching in.`);
    else if(t.b==='city'&&t.o==null)toast(`${placeName(p)} is a free city. Use Declare war in this territory’s Orders panel first${cityAt(p).patron!=null?`, or on its protector ${fname(cityAt(p).patron)}`:''}.`)}
  S.sel=p;UI.tab='tile';UI.confirm=null;render();$('panel').scrollTop=0;
});
function halfOf(u){const p=zeroU();for(const t of UT)p[t]=Math.floor(u[t]/2);if(!cnt(p)){const t=UT.reduce((b,t)=>u[t]>u[b]?t:b,'inf');p[t]=1}return p}

/* ============ portraits ============ */
function portrait(f,size,mood,vector=false){
  const Rr=f===CITYF?null:NF(f).ruler;if(!Rr)return'';
  const w=size,h=Math.round(size*1.25),wig='#eeeae2',wigS='#cfc8ba',skin='#ecc9a6',id='pc'+S.order[f]+'x'+size;
  if(!vector&&PORTRAIT_IMAGES&&PORTRAIT_IMAGES[S.order[f]]){
    const tone=mood<-.3?'hostile':mood>.7?'friendly':'neutral';
    return`<span class="portrait portrait-oil ${tone}" role="img" aria-label="Portrait of ${Rr.n}, ${Rr.t}" style="width:${w}px;height:${h}px"><img src="${PORTRAIT_IMAGES[S.order[f]]}" alt="" draggable="false"></span>`;
  }
  const monarch=S.order[f],faceWidth=[8.2,8.7,8.1,8.5,8.8,8.4][monarch];
  const mouth=mood>.3?'M28.6 45 Q32 47.6 35.4 45':mood<-.3?'M28.6 46.4 Q32 43.8 35.4 46.4':'M29 45.4 Q32 46 35 45.4';
  const brows=mood<-.3?'M26 31.5 L30.5 32.6 M38 31.5 L33.5 32.6':'M26 32 Q28.3 31 30.5 32 M33.5 32 Q35.7 31 38 32';
  const face=`<ellipse cx="32" cy="36.5" rx="${faceWidth}" ry="11" fill="url(#${id}skin)"/><path d="M24.7 37.5 Q24.9 44 30 46.5" fill="none" stroke="#b98972" stroke-width=".5" opacity=".52"/><path d="M39.3 37.5 Q39.1 44 34 46.5" fill="none" stroke="#fff0d9" stroke-width=".45" opacity=".6"/>
   <ellipse cx="26.6" cy="40.6" rx="2" ry="1.3" fill="rgba(205,95,85,.23)"/><ellipse cx="37.4" cy="40.6" rx="2" ry="1.3" fill="rgba(205,95,85,.23)"/>
   <path d="${brows}" stroke="#8d8071" stroke-width=".82" fill="none" stroke-linecap="round"/><path d="M26.8 35 Q28.5 34.5 30.3 35 M33.7 35 Q35.5 34.5 37.2 35" stroke="#967f6e" stroke-width=".45" fill="none"/>
   <ellipse cx="28.6" cy="35.5" rx=".82" ry=".67" fill="#443128"/><ellipse cx="35.4" cy="35.5" rx=".82" ry=".67" fill="#443128"/><circle cx="28.85" cy="35.25" r=".2" fill="#fff7e7"/><circle cx="35.65" cy="35.25" r=".2" fill="#fff7e7"/>
   <path d="M31.8 35.8 Q33.2 39.5 32.8 41 L30.9 41.25" stroke="#aa775f" stroke-width=".72" fill="none"/><path d="M31.2 41.7 Q32 42 33.1 41.7" stroke="#d9a289" stroke-width=".45" fill="none"/><path d="${mouth}" stroke="#874a42" stroke-width=".78" fill="none" stroke-linecap="round"/><path d="M29.8 47 Q32 47.6 34.2 47" stroke="#b28770" stroke-width=".35" fill="none"/>
   ${monarch===1||monarch===5?`<path d="M25 36.7 Q26 37.3 27 37.2 M37 37.2 Q38 37.3 39 36.7 M26.8 42 Q27.3 43.1 28.5 43.3 M35.5 43.3 Q36.7 43.1 37.2 42" stroke="#9f715d" stroke-width=".4" opacity=".55" fill="none"/>`:''}
   ${monarch===0?`<path d="M27 46.5 Q32 49.5 37 46.5" stroke="#a37962" stroke-width=".4" opacity=".6" fill="none"/>`:''}`;
  let body;
  if(Rr.female){
    body=`<path d="M1 84 C4 64 17 57.5 32 57.5 C47 57.5 60 64 63 84 Z" fill="${Rr.gown}"/><path d="M2 80 Q13 64 23 61 M62 80 Q51 64 41 61" stroke="#fff5d9" stroke-width=".7" opacity=".55" fill="none"/><path d="M19 58.5 Q32 72 45 58.5 Q40 57 32 57 Q24 57 19 58.5 Z" fill="${skin}"/>
     <path d="M19 58.5 Q32 72 45 58.5" stroke="#f6f3ec" stroke-width="2.2" fill="none"/><path d="M12 64 L50 84 L43 86 L8 68 Z" fill="${Rr.sash}"/>
     <path d="M10 65 L45 84" stroke="#f7ead0" stroke-width=".55" opacity=".8"/><path d="M20 62 Q32 77 44 62" stroke="${Rr.trim}" stroke-width=".6" fill="none"/>
     <path d="M7 74 Q11 67 14 65 M57 74 Q53 67 50 65" stroke="${Rr.trim}" stroke-width=".5" opacity=".6" fill="none"/><circle cx="32" cy="59.7" r="2" fill="${Rr.trim}" stroke="#f9eccc" stroke-width=".5"/><circle cx="32" cy="59.7" r=".85" fill="${monarch===4?'#ab3335':'#963930'}"/>
     <rect x="28.4" y="44" width="7.2" height="12" fill="${skin}"/>${[26,29,32,35,38].map((x,i)=>`<circle cx="${x}" cy="${53.2+Math.abs(i-2)*-.6+1}" r=".9" fill="#f4f1ea"/>`).join('')}
     <circle cx="23.5" cy="39.2" r=".8" fill="#f5f1e8"/><circle cx="40.5" cy="39.2" r=".8" fill="#f5f1e8"/>
     <path d="M21 34 C19 16 45 16 43 34 C44 26 40 21.5 32 21.5 C24 21.5 20 26 21 34 Z" fill="${wig}" stroke="${wigS}" stroke-width=".6"/>
     <ellipse cx="32" cy="19.5" rx="8" ry="6" fill="${wig}" stroke="${wigS}" stroke-width=".6"/>${[[22,31],[42,31],[21.5,36],[42.5,36]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4" fill="${wig}" stroke="${wigS}" stroke-width=".5"/>`).join('')}
     ${Rr.crown?`<path d="M25 15 L27 10 L29.5 13.5 L32 8.5 L34.5 13.5 L37 10 L39 15 Z" fill="${Rr.trim}" stroke="#8a6d2a" stroke-width=".5"/><path d="M25 15 L39 15" stroke="#fff2bb" stroke-width=".7"/><circle cx="32" cy="8.6" r="1" fill="#b3261e"/><circle cx="27" cy="11" r=".45" fill="#eaf2e9"/><circle cx="37" cy="11" r=".45" fill="#eaf2e9"/>`:`${[27,30,33,36].map(x=>`<circle cx="${x+.5}" cy="15.6" r=".8" fill="#f4f1ea"/>`).join('')}`}`;
  }else{
    const curls=Rr.wig==='full'
      ?[[21.5,30],[42.5,30],[20.5,35],[43.5,35],[20,40.5],[44,40.5],[20.5,46],[43.5,46],[21.5,51],[42.5,51]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.4" fill="${wig}" stroke="${wigS}" stroke-width=".6"/>`).join('')
      :[[22.3,33.2],[22,38],[41.7,33.2],[42,38]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="3.1" ry="2.2" fill="${wig}" stroke="${wigS}" stroke-width=".6"/>`).join('');
    body=`${Rr.wig==='queue'?`<path d="M33 40 L34 58" stroke="#141010" stroke-width="2.4"/><path d="M30.5 57 L34 55 L37.5 58 L34 59.5 Z" fill="#141010"/>`:`<path d="M19 32 Q17 50 22 58 L42 58 Q47 50 45 32 Z" fill="${wigS}"/>`}
     <path d="M3 84 C5 63 18 55.5 32 55.5 C46 55.5 59 63 61 84 Z" fill="${Rr.coat}"/><path d="M4 78 Q12 61 23 58 M60 78 Q52 61 41 58" stroke="#fff1d2" stroke-width=".55" opacity=".4" fill="none"/><path d="M25.5 56.5 L29.5 84 M38.5 56.5 L34.5 84" stroke="${Rr.trim}" stroke-width="1.8"/>
     <path d="M25.2 57 L28.2 79 M38.8 57 L35.8 79" stroke="#f4e7c8" stroke-width=".45" opacity=".7"/><circle cx="30.2" cy="67" r=".42" fill="${Rr.trim}"/><circle cx="29.7" cy="73" r=".42" fill="${Rr.trim}"/><circle cx="29.2" cy="79" r=".42" fill="${Rr.trim}"/>
     <path d="M13 61 L51 84 L44 86 L9 65 Z" fill="${Rr.sash}"/><path d="M12 62 L49 83" stroke="#f8e9c3" stroke-width=".5" opacity=".8"/><path d="M20.5 67 l1.3 3 3.2.2-2.5 2 .9 3.1-2.9-1.8-2.9 1.8.9-3.1-2.5-2 3.2-.2z" fill="#ecebe6" stroke="#9a968c" stroke-width=".3"/><circle cx="20.5" cy="71.4" r=".65" fill="#d5b052"/>
     <rect x="28.4" y="43.5" width="7.2" height="10" fill="${skin}"/><path d="M27.5 52.5 Q32 61 36.5 52.5 L35.6 58.5 Q32 64.5 28.4 58.5 Z" fill="#f6f3ec" stroke="#d6d0c4" stroke-width=".4"/>
     ${Rr.wig==='full'?curls:''}${face}
     <path d="M23 33.5 C22 23 42 23 41 33.5 C40.5 28.5 37.5 26.3 32 26.3 C26.5 26.3 23.5 28.5 23 33.5 Z" fill="${wig}" stroke="${wigS}" stroke-width=".6"/><path d="M24.5 28 Q32 24.5 39.5 28" stroke="${wigS}" stroke-width=".5" fill="none"/>
     ${Rr.wig==='queue'?curls:''}`;
  }
  return`<svg class="portrait" viewBox="0 0 64 80" width="${w}" height="${h}" role="img" aria-label="Portrait of ${Rr.n}, ${Rr.t}">
  <defs><clipPath id="${id}"><ellipse cx="32" cy="40" rx="27.5" ry="35.5"/></clipPath><radialGradient id="${id}g" cx=".46" cy=".31" r=".72"><stop offset="0" stop-color="#66513a"/><stop offset=".56" stop-color="#403020"/><stop offset="1" stop-color="#1b1715"/></radialGradient><linearGradient id="${id}skin" x1="0" y1="0" x2="1" y2=".2"><stop offset="0" stop-color="#bb8d72"/><stop offset=".28" stop-color="#eac3a0"/><stop offset=".73" stop-color="#f3d5b2"/><stop offset="1" stop-color="#c39278"/></linearGradient></defs>
  <ellipse cx="32" cy="40" rx="30.5" ry="38.5" fill="#49351b"/><ellipse cx="32" cy="40" rx="29.5" ry="37.5" fill="none" stroke="#d8b766" stroke-width="1.6"/><ellipse cx="32" cy="40" rx="28.3" ry="36.3" fill="none" stroke="#8a682b" stroke-width=".55"/>
  <ellipse cx="32" cy="40" rx="27.5" ry="35.5" fill="url(#${id}g)"/><g clip-path="url(#${id})"><path d="M8 48 Q15 32 8 17 M56 48 Q49 32 56 17" stroke="#b89c6b" stroke-width=".5" opacity=".2" fill="none"/>${body}${Rr.female?face:''}</g></svg>`;
}
function courtHtml(f,size,sub){const r=f?R(0,f).score/50:.6;return`<div class="court">${portrait(f,size,f?r:.6)}<div style="min-width:0"><b>${NF(f).ruler.n}</b><small>${NF(f).ruler.t}${sub?' · '+sub:''}</small></div></div>`}

/* ============ rendering: desk ============ */
function sign(v){return v>0?`<i class="pos">+${v}</i>`:v<0?`<i class="neg">${v}</i>`:`<i>±0</i>`}
function contextualHelp(){
  if(PREFS.contextHelp===false)return '';
  const p=S.sel,t=p==null?null:T(p),a=p==null?null:armyAt(p),tips=S.tips||(S.tips={});let key='',msg='';
  if(UI.tab==='diplo'||S.inbox.length||t&&(t.o!=null&&t.o!==0||t.b==='city'&&t.o==null)){
    key='diplomacy';msg='Diplomacy opens peaceful and military routes. Trade pays each season; a pact protects a border. Declare war before entering another crown’s land. Breaking a treaty damages trust.';
  }else if(UI.tab==='tile'&&a?.f===0&&a.mv>0&&!tips.movement){
    key='movement';msg=`Select your army, then tap a neighbouring province with a dashed border. Red means battle. This army has ${a.mv} move${a.mv===1?'':'s'} left. Unclaimed land joins your realm when you end the season there.`;
  }else if(UI.tab==='tile'&&t?.o===0&&UT.some(k=>recruitHere(0,p,k))){
    key='recruitment';msg='Recruit here to start training: militia take 1 season, line infantry 2, dragoons and field guns 3, and howitzers 4. Pay gold and one person now; upkeep starts when they join the army. Progress is listed here and in Realm.';
  }
  return key&&!tips[key]?`<aside class="context-help"><p>${msg}</p><button class="btn sm" data-act="tipdone" data-tip="${key}">Got it</button></aside>`:'';
}
function historyPanel(){
  const generals=Object.values(S.generalHistory||{}).filter(r=>r.f===0);
  const armies=[...S.armies.filter(a=>a.f===0).map(a=>({...armyRecord(a),name:a.name,status:'In the field'})),...(S.armyArchive||[]).filter(a=>a.f===0)];
  const row=r=>`<div class="note"><b>${esc(r.name)}</b> · ${esc(r.status)}<p>${serviceText(r)}</p>${r.places.length?`<small>${r.places.map(esc).join('<br>')}</small>`:''}</div>`;
  return `<details class="service-history"><summary>Service records</summary><p>Records begin when this version is first played. General experience earned earlier is preserved.</p>${generals.length?generals.map(row).join(''):'<p>Appoint a general to begin their service record.</p>'}${armies.map(row).join('')}</details>`;
}
function render(){
  if(!S||UI.headless)return;const P=S.fac[0],inc=income(0);
  $('date').textContent=`${S.fac[0].name} · ${dateStr()} · season ${S.turn} · ${DIFF[S.diff].n}`;
  $('res').innerHTML=`<span class="chip"><small>Gold</small><b>${P.gold}</b>${sign(inc.gold)}</span><span class="chip"><small>People</small><b>${P.pop}/${P.popCap}</b></span><span class="chip"><small>Popularity</small><b class="${P.popl<30?'neg':P.popl>=60?'pos':''}">${P.popl}</b>${sign(inc.popl)}</span>`;
  const tabs=[['tile','Orders'],['realm','Realm'],['diplo','Diplomacy'],['council','Council'],['log','Chronicle']];
  $('tabs').innerHTML=tabs.map(([k,n])=>`<button role="tab" aria-selected="${UI.tab===k}" data-act="tab" data-t="${k}">${n}${k==='diplo'&&S.inbox.length?' •':''}${k==='realm'&&S.merc?' •':''}</button>`).join('');
  $('panel').innerHTML=contextualHelp()+{tile:tilePanel,realm:realmPanel,diplo:diploPanel,council:councilPanel,log:logPanel}[UI.tab]();
  $('recovery').hidden=!P.recovery;$('recovery').innerHTML=P.recovery?`<strong>The crown can still recover.</strong> ${recoveryText(0)} <button class="btn sm" data-act="recoverymap">Show lost capital</button>`:'';
  const a=S.sel!=null&&armyAt(S.sel);
  $('hint').textContent=S.over?'The campaign is over.':UI.busy?'Your rivals are moving…':a&&a.f===0&&a.mv>0?'Tap a neighbouring province with a dashed edge to march. Red means battle. Tap this army again or use Deselect army to cancel selection.':'Tap your army block to give orders.';
  $('endbtn').disabled=!!S.over||UI.busy;
  draw();
}
function territoryWarHtml(p){
  const t=T(p),c=cityAt(p);if(!t||t.t==='water'||t.o===0)return '';
  const f=t.o??c?.patron;
  if(f!=null){
    if(f===0)return '<p class="note">This free city is under your protection.</p>';
    if(!S.fac[f]?.alive)return '';
    const name=esc(fname(f)),protector=t.o==null&&c?.patron!=null;
    if(atWar(0,f))return `<div class="sec"><div class="lbl">At war with ${name}</div><p>Select your army, then this territory to march or attack.</p></div>`;
    const r=R(0,f),betray=r.st!=='neutral'||r.trade,confirm=UI.confirm==='war'+f;
    return `<div class="sec territory-war"><div class="lbl">${protector?'Protected by':'Relations with'} ${name}</div><p>${protector?'Attacking this free city requires war with its protector.':r.st==='alliance'?'Your crowns are allied.':r.st==='truce'?'A cease-fire is in force.':r.st==='peace'?'A peace treaty is in force.':'You are not at war.'}${betray?' Declaring war breaks your treaties or trade pact and damages trust with other crowns.':''}</p><button class="btn red" data-act="dip" data-op="war" data-f="${f}">${confirm?(betray?'Confirm: break treaties with ':'Confirm war on '):'Declare war on '}${name}</button>${confirm?'<p class="order-help">Tap again to declare war. Your army will stay where it is until you order it to march.</p>':''}</div>`;
  }
  if(!c)return '';
  if(c.war[0])return `<div class="sec"><div class="lbl">At war with ${esc(c.name)}</div><p>Select your army, then this free city to attack.</p></div>`;
  const i=S.cities.indexOf(c),confirm=UI.confirm==='cwar'+i;
  return `<div class="sec territory-war"><div class="lbl">Independent free city</div><p>Declaring war ends trade with this city and lowers goodwill with the other free cities.</p><button class="btn red" data-act="cwar" data-c="${i}">${confirm?'Confirm war on ':'Declare war on '}${esc(c.name)}</button>${confirm?'<p class="order-help">Tap again to declare war. Your army will stay where it is until you order it to march.</p>':''}</div>`;
}
function tilePanel(){
  if(S.sel==null)return`<h3>Your orders</h3><p>Tap a province. Tap one of your army blocks, then a neighbouring province to march. Build inside your borders.</p>${dragoonAccessHtml()}`;
  const p=S.sel,t=T(p),a=armyAt(p),P=S.fac[0],sz=G.size[p],c=cityAt(p);let h='';
  const own=t.o==null?(c?'Free city':'Unclaimed'):t.o===0?S.fac[0].name:S.fac[t.o].name;
  const title=t.b==='capital'?`${placeName(p)}, capital of ${own}`:t.b==='city'?`${c&&t.o==null?'Free City of ':''}${placeName(p)}`:t.b==='village'?`Village of ${placeName(p)}`:t.b==='town'?`Town of ${placeName(p)}`:placeName(p);
  h+=`<div class="sec"><div class="lbl">${t.t==='water'?'Lake':`${SIZEN[sz]} ${TER[t.t].n.toLowerCase()}`}${t.r?' · river':''} · ${own}</div><h3>${title}</h3>`;
  h+=territoryWarHtml(p);
  if(t.t==='water')h+=`<p>Armies cannot cross open water.</p>`;
  else h+=`<p>This land pays ${Math.round(TER[t.t].gold*sz+(t.r?1:0))} gold a season${t.b&&BLD[t.b]&&BLD[t.b].gold(sz,t,false)?`, and its ${BLD[t.b].n.toLowerCase()} ${Math.round(buildingGold(t,sz,season()===3))} more`:''}. ${t.b&&BLD[t.b]?BLD[t.b].d+'. Level '+(t.level||1)+'.':''}</p>`;
  if(t.b==='capital')h+=`<p>Seat of the crown. +8 gold, room for 12 people. City walls, 3 militia and a gun. If it falls, a crown with land remaining has one three-season chance to retake it.</p>`;
  else if(t.b==='village')h+=`<p>+3 gold, room for 4 more people and faster growth. ${t.o==null?'March an army here and end the season to claim it.':''}</p>`;
  else if(t.b==='town')h+=`<p>+7 gold, room for 8 people, raises militia and infantry. Guarded by 2 militia.</p>`;
  else if(t.b==='city'){h+=t.o==null?`<p>A walled free city: 3 battalions, 3 militia and a gun. ${c.patron!=null?`Under the protection of ${fname(c.patron)}; ${c.patron===0?'it pays you 3 gold a season.':'you cannot attack it without war on its protector.'}`:c.war[0]?'You are at war with it.':'Court it with gifts on the Diplomacy tab, or use Declare war here.'}</p>`:`<p>A conquered city. +8 gold and room for 8 people each season.</p>`}
  if(t.road)h+=`<p>Road complete. Moving between connected road provinces costs half a move. Infantry can travel 2 provinces, cavalry 4. Battles and rivers end movement.</p>`;
  if(t.b==='house'&&(t.level||1)>1)h+=`<p>Expanded housing: room for 12 people.</p>`;
  if(t.b==='church'&&(t.level||1)>1)h+=`<p>Expanded church: +6 popularity per season.</p>`;
  if(t.r)h+=`<p>A river runs here. Marching in ends the army's move. Defenders get +25%. Farms here earn +2.</p>`;
  h+=`</div>`;
  if(t.o===0&&(['capital','barracks','town'].includes(t.b)||!t.b&&BLD.barracks.on.includes(t.t)))h+=dragoonAccessHtml(p);
  if(S.fac[0].recovery?.refuge===p)h+=`<p class="note">Temporary court: +8 gold, room for 12 people, and capital recruitment while recovery lasts.</p>`;
  if(t.fallenCapital!=null)h+=`<p class="note">Former capital of ${fname(t.fallenCapital)}. It is now an occupied town.</p>`;
  if(a){const mine=a.f===0;armyRecord(a);
    h+=`<div class="sec"><div class="lbl">${esc(a.name)}${a.gen?` · General ${a.gen.name}, level ${lvlOf(a.gen)}`:''}</div>${mine?`<div class="kv">${UT.filter(k=>a.u[k]||['inf','cav','art'].includes(k)).map(k=>`<span>${UNIT[k].n}</span><span>${a.u[k]}</span>`).join('')}<span>Strength</span><span>${Math.round(armyStr(a))}</span><span>Moves left</span><span>${a.mv}</span></div>`:intelligenceHtml(a)}`;
    if(mine){h+=`<div class="row"><button class="btn sm" data-act="mapdeselect">Deselect army</button><button class="btn sm" data-act="half" aria-pressed="${UI.half}">${UI.half?'Marching: half the army':'Marching: whole army'}</button>`;
      if(!a.gen&&t.o===0){const nm=NF(0).gens.find(n=>!S.genUsed[0].includes(n));if(nm)h+=`<button class="btn sm" data-act="appoint" ${P.gold>=GEN_COST?'':'disabled'}>Appoint General ${nm} · ${GEN_COST} gold</button>`}
      h+=`</div><details><summary>Army service record</summary><p>${serviceText(armyRecord(a))}</p>${a.record.places.map(x=>`<p>${esc(x)}</p>`).join('')}</details>`;if(a.gen)h+=`<p>General ${a.gen.name} steadies and rallies nearby units in battle and makes those around him ${4*lvlOf(a.gen)}% deadlier. Each victory brings experience.</p>`}
    h+=`</div>`}
  if(t.o===0){
    const sites=UT.filter(k=>k!=='cav'&&recruitHere(0,p,k));
    if(sites.length&&!(a&&a.f!==0)){
      h+=`<div class="sec"><div class="lbl">Train troops here · costs 1 person each</div><div class="grid">`+sites.map(k=>{const ok=P.gold>=UNIT[k].cost&&P.pop>2&&P.popl>=(UNIT[k].popularity||0);
        return`<button class="opt" data-act="recruit" data-u="${k}" ${ok?'':'disabled'}><b>${UNIT[k].n}</b><span>${UNIT[k].d}</span><em>${UNIT[k].cost} gold${UNIT[k].popularity?' · −'+UNIT[k].popularity+' popularity':''} · ${TRAINING[k]} season${TRAINING[k]===1?'':'s'} to train · ${UNIT[k].up} upkeep</em></button>`}).join('')+`</div>`;
      if(P.pop<=2)h+=`<p>Too few people to raise troops. Build houses, grow towns and keep popularity above 40.</p>`;
      h+=`</div>`}
    h+=recruitmentHtml(p)+constructionHtml(p);
    if(['capital','barracks','foundry','town'].includes(t.b))h+=artilleryAccessHtml();
    const upgrade=upgradeInfo(p),project=projectAt(p);
    if(upgrade&&!project&&t.b!=='barracks')h+=`<div class="sec"><div class="lbl">Upgrade building</div><p>${upgrade.d}</p><button class="btn brass" data-act="upgrade" ${P.gold>=upgrade.cost?'':'disabled'}>Upgrade to ${upgrade.b==='town'?'town':upgrade.b==='fort'?'stone fort':'level '+upgrade.level} · ${upgrade.cost} gold · ${upgrade.time} seasons</button></div>`;
    if(!t.road&&!project&&t.t!=='water')h+=`<div class="sec"><div class="lbl">Roads</div><p>Connect two neighbouring provinces with roads for twice the travel distance. Roads share land with buildings.</p><button class="btn sm" data-act="road" ${P.gold>=20?'':'disabled'}>Build road · 20 gold · 1 season</button></div>`;

    if(!t.b&&t.t!=='water'&&!project){
      const opts=Object.entries(BLD).filter(([,B])=>B.on.includes(t.t));
      h+=`<div class="sec"><div class="lbl">Build</div><div class="grid">`+opts.map(([k,B])=>`<button class="opt" data-act="build" data-b="${k}" ${P.gold>=B.cost?'':'disabled'}><b>${B.n}</b><span>${B.d}</span><em>${B.cost} gold · ${BUILD_TIME[k]} season${BUILD_TIME[k]===1?'':'s'}${B.gold(sz,t,false)?` · earns ${Math.round(B.gold(sz,t,false))}`:''}</em></button>`).join('')+`</div></div>`;
    }else if(t.b&&BLD[t.b]&&!project)h+=`<div class="row"><button class="btn sm red" data-act="demolish">${UI.confirm==='demo'?'Tap again to demolish':'Demolish '+BLD[t.b].n.toLowerCase()}</button></div>`;
  }
  return h;
}
function realmPanel(){
  const P=S.fac[0],r=income(0),u=unitsOf(0),rt=routes().filter(x=>x.a===0||x.b===0);
  const merc=S.merc?`<div class="sec"><div class="lbl">Mercenaries for hire</div><div class="msg"><p style="color:var(--ink)">${S.merc.n} squadrons of Russian hussars wait at the border until ${SEASONS[(S.merc.until-1)%4].toLowerCase()} ${1740+Math.floor((S.merc.until-1)/4)}. ${S.merc.price} gold each, then 1 gold each per season. They arrive at your capital and need no barracks or people. Unpaid, they ride away.</p>
    <div class="row">${[1,2,S.merc.n].filter((n,i,a)=>n<=S.merc.n&&a.indexOf(n)===i).map(n=>`<button class="btn sm ${n===S.merc.n?'brass':''}" data-act="hire" data-n="${n}" ${P.gold>=n*S.merc.price?'':'disabled'}>Hire ${n} · ${n*S.merc.price} gold</button>`).join('')}</div></div></div>`:'';
  return`<p class="note">Opening doctrine: ${OPENINGS[S.opening||'balanced'].n}. ${OPENINGS[S.opening||'balanced'].d}${S.diff==='easy'?' Cadet adds 60 starting gold.':''}</p>${dragoonAccessHtml()}${merc}${recruitmentHtml()}${constructionHtml()}${artilleryAccessHtml()}<div class="sec"><div class="lbl">Taxes</div><div class="row">${TAXN.map((n,i)=>`<button class="btn sm ${P.tax===i?'brass':''}" data-act="tax" data-v="${i}">${n}</button>`).join('')}</div>
  <p>Higher taxes fill the treasury but cost popularity each season. Below 40 popularity the population stops growing. Below 15 provinces revolt.</p></div>
  <div class="sec"><div class="lbl">Popularity ${P.popl}</div><div class="meter"><i style="width:${P.popl}%;background:${P.popl<30?'var(--danger)':P.popl<50?'var(--warn)':'var(--good)'}"></i></div></div>
  <div class="sec"><div class="lbl">Gold each season</div><div class="kv">
   <span>Land (${owned(0)} provinces, by terrain and size)</span><span>+${r.land}</span><span>Buildings, villages and towns</span><span>+${r.bld}</span>
   <span>Tax from ${P.pop} people</span><span>+${r.tax}</span><span>Trade roads</span><span>+${r.trade}</span>${r.cities?`<span>Protected cities (${r.cities})</span><span>+${r.cities*3}</span>`:''}
   <span>Soldiers' pay</span><span>−${r.wage}</span><span><b style="color:var(--ink)">Net</b></span><span><b>${r.gold>0?'+':''}${r.gold}</b></span></div>
   ${season()===3?'<p>It is winter: farms earn half.</p>':''}</div>
  <div class="sec"><div class="lbl">Trade roads</div>${rt.length?`<div class="kv">${rt.map(x=>`<span>To ${x.city!=null?cityAt(x.city).name:fname(x.a===0?x.b:x.a)} (${x.path.length} provinces)</span><span class="${x.blocked?'neg':''}">${x.blocked?'Raided':'Open'}</span>`).join('')}</div>`:'<p>No trade pacts yet. Propose one on the Diplomacy tab. Each open road pays gold every season, more with markets and longer roads. Enemy armies on the road stop the caravans.</p>'}</div>
  <div class="sec"><div class="lbl">The realm</div><div class="kv"><span>Provinces</span><span>${owned(0)}</span>${UT.map(k=>`<span>${UNIT[k].n}</span><span>${u[k]}</span>`).join('')}<span>Army strength</span><span>${Math.round(armyPower(0))}</span></div></div>`;
}
function relWord(s){return s<-50?'Hostile':s<-15?'Cold':s<15?'Wary':s<45?'Cordial':'Friendly'}
function powerRankingHtml(){
  const ranks=S.fac.filter(F=>F.alive).map(F=>({f:F.id,name:F.name,land:owned(F.id),power:F.id===0?Math.round(armyPower(0)):Math.max(0,Math.round(armyPower(F.id)/10)*10)})).sort((a,b)=>b.power-a.power||a.f-b.f);
  const max=Math.max(1,...ranks.map(r=>r.power));
  return `<details class="power-ranking sec" open><summary>Faction ranking & military power</summary><p>Your strength is exact. Rival strengths are rough estimates, rounded to 10. Send spies for exact army reports. Land shows provinces controlled.</p>${ranks.map((r,i)=>{const rank=ranks.findIndex(x=>x.power===r.power)+1;return `<div class="power-row"><div class="row"><b><span class="sw" style="background:${NF(r.f).col}"></span> ${rank}. ${esc(r.name)}${r.f===0?' · You':''}</b><span>${r.f===0?'':'≈'}${r.power} power · ${r.land} provinces</span></div><div class="meter" role="meter" aria-label="${esc(r.name)} military power${r.f===0?'':' estimate'}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${r.power}" aria-valuetext="${r.f===0?'':'Approximately '}${r.power} military power"><i style="width:${100*r.power/max}%;background:${NF(r.f).col}"></i></div></div>`}).join('')}<p class="note">Power reflects field armies and unit types. Fortifications, terrain, morale and tactics can change a battle’s outcome. Equal estimates share a rank.</p></details>`;
}
function diploPanel(){
  let h=`<div class="sec">${courtHtml(0,52,'your court')}</div>`;
  if(S.inbox.length)h+=`<div class="sec"><div class="lbl">Envoys waiting</div>${S.inbox.map((m,i)=>msgHtml(m,i)).join('')}</div>`;
  h+=powerRankingHtml();
  const stN={war:'At war',peace:'Peace',alliance:'Allied',neutral:'No treaty',truce:'Cease-fire'};
  S.fac.slice(1).forEach(F=>{const f=F.id;
    if(!F.alive){h+=`<div class="rival"><div class="rhead">${courtHtml(f,44,'deposed')}<span class="spacer"></span><span class="pill st-neutral">Fallen</span></div></div>`;return}
    const r=R(0,f),b=[];
    const B=(op,label,cls='')=>`<button class="btn sm ${cls}" data-act="dip" data-op="${op}" data-f="${f}">${label}</button>`;
    if(r.st==='war'){b.push(B('truce','Propose cease-fire'));b.push(B('peace','Offer peace'))}
    if(r.st==='truce')b.push(B('peace','Offer peace'));
    if(r.st==='neutral')b.push(B('pact','Propose non-aggression pact'));
    if(r.st==='peace')b.push(B('alliance','Propose alliance'));
    if(r.st!=='war'&&r.st!=='truce')b.push(r.trade?B('endtrade','End trade pact'):B('tradepact','Propose trade pact'));
    if(r.st!=='war')b.push(`<button class="btn sm" data-act="dip" data-op="improve" data-f="${f}" ${canImproveRelations(0,f)?'':'disabled'}>${r.improved?.[0]===S.turn?'Envoy returns next season':'Improve relations · 10 gold · +10'}</button>`);
    b.push(B('gift','Gift 25 gold'));
    if(r.st!=='war'&&r.st!=='alliance')b.push(B('tribute','Demand tribute'));
    if(r.st!=='war')b.push(B('war',UI.confirm==='war'+f?(r.st==='neutral'&&!r.trade?'Confirm war':'Confirm: break treaties'):'Declare war','red'));
    h+=`<div class="rival"><div class="rhead">${courtHtml(f,56,`<span class="sw" style="background:${NF(f).col};vertical-align:-1px"></span> ${F.name}`)}<span class="spacer"></span>${r.trade?'<span class="pill st-trade">Trade</span>':''}<span class="pill st-${r.st}">${stN[r.st]}${r.st==='truce'?` · ${r.until-S.turn} left`:''}</span></div>
      <div class="relbar"><i style="left:${(r.score+100)/2}%"></i></div>
      <div class="row" style="justify-content:space-between;font-size:12px;color:var(--muted)"><span>${relWord(r.score)} (${r.score>0?'+':''}${r.score})</span><span>Army strength unconfirmed · yours ${Math.round(armyPower(0))} · ${owned(f)} provinces</span></div>
      <div class="row">${S.armies.filter(a=>a.f===f).map(a=>`<button class="btn sm" data-act="site" data-p="${a.p}">Scout ${esc(a.name)}</button>`).join('')}</div>${r.reasons?.length?`<p class="note">${r.reasons.map(esc).join('<br>')}</p>`:''}<div class="row">${b.join('')}</div></div>`;
  });
  h+=`<div class="sec"><div class="lbl">Free cities</div>${S.cities.map((c,i)=>{const t=T(c.p);
    if(t.o!=null)return`<div class="rival"><div class="rhead"><b>${c.name}</b><span class="spacer"></span><span class="pill st-neutral">Held by ${fname(t.o)}</span></div></div>`;
    const warB=c.patron==null&&!c.war[0]?`<button class="btn sm red" data-act="cwar" data-c="${i}">${UI.confirm==='cwar'+i?'Confirm war on '+c.name:'Declare war'}</button>`:'';
    return`<div class="rival"><div class="rhead"><span class="sw" style="background:${CITYNAT.col}"></span><b>${c.name}</b><span class="spacer"></span>${c.war[0]?'<span class="pill st-war">At war with you</span>':c.patron!=null?`<span class="pill st-alliance">Protected by ${fname(c.patron)}</span>`:'<span class="pill st-neutral">Independent</span>'}</div>
      ${c.war[0]?'':`<div class="meter"><i style="width:${c.rel[0]}%;background:var(--brass)"></i></div><div style="font-size:12px;color:var(--muted)">Goodwill toward you ${c.rel[0]} of 100 · trade at 20 · protection at 40</div>`}
      ${c.trade?.[0]?`<p class="note">Trade pact · ${!cityPeaceful(0,c)?'suspended by war':routes().find(r=>r.city===c.p&&r.a===0)?.blocked?'caravans raided':'2–6 gold each season while the road is open'}</p>`:''}
      <div class="row">${cityPeaceful(0,c)?`<button class="btn sm" data-act="cimprove" data-c="${i}" ${canImproveRelations(0,c,true)?'':'disabled'}>${c.improved?.[0]===S.turn?'Envoy returns next season':'Improve relations · 10 gold · +10'}</button>`:''}${c.trade?.[0]?`<button class="btn sm" data-act="ctradeend" data-c="${i}">End trade pact</button>`:cityPeaceful(0,c)?`<button class="btn sm" data-act="ctrade" data-c="${i}" ${canCityTrade(0,c)?'':'disabled'}>Open trade · needs 20 goodwill</button>`:''}${c.war[0]?'':`<button class="btn sm" data-act="cgift" data-c="${i}">Gift 25 gold</button>`}${c.patron==null&&!c.war[0]&&c.rel[0]>=40?`<button class="btn sm brass" data-act="cprot" data-c="${i}">Take under protection</button>`:''}${warB}</div></div>`}).join('')}</div>`;
  return h+`<p>You must be at war to march into another crown's land or a free city. A cease-fire halts a war for ${TRUCE_LEN} seasons; make peace before it runs out or the war resumes. Breaking any treaty angers everyone, and rivals remember it in future campaigns.</p>`;
}
function peaceGoldLimit(f){const F=S.fac[f];return Math.max(0,Math.min(F.gold,Math.floor(F.gold*.35+Math.max(0,facPower(0)-facPower(f))*2)))}
function demandPeaceGold(i,amount){const m=S.inbox[i];if(!m||m.type!=='peace'||!S.fac[m.from]?.alive||!atWar(0,m.from)||!Number.isInteger(amount)||amount<=0)return false;
 const f=m.from;if(amount>peaceGoldLimit(f)){m.reply=`${fname(f)} refuses ${amount} gold. Try a smaller demand, accept peace without payment, or reject the offer.`;save();return false}
 S.fac[f].gold-=amount;S.fac[0].gold+=amount;S.inbox.splice(i,1);makePeace(0,f);log(`${fname(f)} pays you ${amount} gold in reparations for peace.`,true);checkOver();save();return true;
}
function msgHtml(m,i){const sums=m.type==='peace'?[...new Set([Math.min(25,Math.floor(S.fac[m.from].gold)),50,100])].filter(n=>n>0&&n<=S.fac[m.from].gold):[];
 return `<div class="msg">${courtHtml(m.from,40,'')}<p style="color:var(--ink)">${inboxText(m)}</p>${m.reply?`<p role="status">${esc(m.reply)}</p>`:''}<div class="row"><button class="btn sm brass" data-act="inbox" data-i="${i}" data-from="${m.from}" data-type="${m.type}" data-yes="1">${m.type==='peace'?'Accept peace':'Accept'}</button><button class="btn sm" data-act="inbox" data-i="${i}" data-from="${m.from}" data-type="${m.type}" data-yes="0">Reject</button></div>${m.type==='peace'?`<p>Ask for a payment to end the war. A defeated or wealthy rival can afford more; refused terms leave this offer open.</p><div class="row">${sums.map(n=>`<button class="btn sm" data-act="peacegold" data-from="${m.from}" data-amount="${n}">Demand ${n} gold for peace</button>`).join('')||'<span>Their treasury is empty.</span>'}</div>`:''}</div>`;
}
function councilNotes(){
  const n=[],pm=playerMix(),top=UT.reduce((b,t)=>pm[t]>pm[b]?t:b,'inf');
  n.push(`Your armies lean ${Math.round(pm[top]*100)}% ${UNIT[top].n.toLowerCase()}. Rival generals now favour ${UNIT[BEATEN[top][0]].n.toLowerCase()} to counter it.`);
  const fw=avgFirstWar();
  n.push(fw==null?'You have not yet opened a war. Rivals judge you by your treaties for now.':`You usually open hostilities around season ${Math.round(fw)}. ${fw<12?'Neighbours now raise forts and larger garrisons early.':'Rivals expect a slow start from you.'}`);
  const tr=trust();n.push(`Treaty trust: ${Math.round(tr*100)}%. ${tr>.8?'Courts accept your pacts readily.':tr>.5?'Courts hesitate before signing with you.':'Courts expect betrayal and may strike you first.'}`);
  for(const memory of M.grievances||[])n.push(`Remembered campaign: ${memory}`);
  return n;
}
function geneBar(v){const pct=clamp((v-.4)/1.6,0,1)*100;return`<span style="display:inline-block;width:70px;height:6px;background:var(--walnut-2);border:1px solid var(--line);border-radius:3px;vertical-align:middle;position:relative"><i style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:var(--brass)"></i></span> ${v.toFixed(2)}`}
function councilPanel(){
  const rows=Object.entries(STRATS).map(([k,s])=>{const st=M.strat[k];return`<span>${s.n}</span><span>${st.n?`${Math.round(st.score/st.n*100)} pts · ${st.n} campaigns`:'untested'}</span>`}).join('');
  const best=M.pop&&M.pop[0];
  return`<div class="sec"><div class="lbl">What your rivals have learned about you</div>${councilNotes().map(t=>`<div class="note">${t}</div>`).join('')}</div>
  <details><summary>Rival doctrines and learning details</summary><div class="sec"><div class="lbl">Rival brains this campaign · ${DIFF[S.diff].n}</div>${S.fac.slice(1).map(F=>`<div class="kv"><span><b style="color:var(--ink)">${F.name}</b> · ${STRATS[F.strat].n} doctrine</span><span></span>${GENES.map(k=>`<span>${GENEN[k]}</span><span>${geneBar(F.genome[k])}</span>`).join('')}</div>`).join('')}
  <p>Each rival plays with a brain: five instincts that shape when it goes to war, what it spends, how it fortifies, expands and trades. After each campaign the brains that held the most land survive and breed mutated offspring. Cadet rivals get raw brains, Colonel rivals evolving ones, Field Marshals the champions.</p></div>
  <div class="sec"><div class="lbl">Evolution</div><div class="kv"><span>Generation</span><span>${M.gen}</span><span>Brains in the pool</span><span>${(M.pop||[]).length}</span>${best?`<span>Champion fitness</span><span>${Math.round(best.fit*100)}</span>`:''}</div></div>
  <div class="sec"><div class="lbl">Doctrine record</div><div class="kv">${rows}</div></div>
  <div class="sec"><div class="lbl">Campaigns remembered</div><div class="kv"><span>Played</span><span>${M.games}</span><span>Your victories</span><span>${M.playerWins}</span><span>Rival victories</span><span>${M.aiWins}</span></div></div></details>`;
}
function logPanel(){return historyPanel()+(S.battleReports||[]).map(r=>`<details><summary>${esc(r.title)} · battle explanation</summary>${r.lines.map(l=>`<p>${esc(l)}</p>`).join('')}</details>`).join('')+`<div class="log">${S.log.map(l=>`<div><small>${SEASONS[(l.t-1)%4].slice(0,3)} ${1740+Math.floor((l.t-1)/4)}</small>${l.m}</div>`).join('')}</div>`}

/* ============ home screen ============ */
const HOME_PAINTING=typeof Image==='undefined'?null:new Image();
if(HOME_PAINTING&&REALISTIC_ART&&REALISTIC_ART.home){HOME_PAINTING.onload=()=>{if(!$('home').hidden)paintHome()};HOME_PAINTING.src=REALISTIC_ART.home}
function paintHome(){
  const c=$('homecv'),W=Math.max(1,innerWidth),H=Math.max(1,innerHeight),dpr=Math.min(2,devicePixelRatio||1,Math.sqrt(2000000/(W*H)));const pw=Math.max(1,Math.floor(W*dpr)),ph=Math.max(1,Math.floor(H*dpr));if(c.width!==pw)c.width=pw;if(c.height!==ph)c.height=ph;const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  if(HOME_PAINTING&&HOME_PAINTING.complete&&HOME_PAINTING.naturalWidth){
    const iw=HOME_PAINTING.naturalWidth,ih=HOME_PAINTING.naturalHeight,s=Math.max(W/iw,H/ih),sw=W/s,sh=H/s;
    g.drawImage(HOME_PAINTING,(iw-sw)/2,(ih-sh)/2,sw,sh,0,0,W,H);
    const shade=g.createLinearGradient(0,0,0,H);shade.addColorStop(0,'rgba(7,10,13,.28)');shade.addColorStop(.45,'rgba(7,10,13,0)');shade.addColorStop(.72,'rgba(7,10,13,.15)');shade.addColorStop(1,'rgba(7,10,13,.6)');g.fillStyle=shade;g.fillRect(0,0,W,H);return;
  }
  const r=rng(1741),hz=H*.36;
  const puff=(x,y,s,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,s);gr.addColorStop(0,`rgba(236,222,200,${a})`);gr.addColorStop(1,'rgba(236,222,200,0)');g.fillStyle=gr;g.fillRect(x-s,y-s,s*2,s*2)};
  const sky=g.createLinearGradient(0,0,0,hz+H*.06);sky.addColorStop(0,'#23243a');sky.addColorStop(.5,'#7d5a4a');sky.addColorStop(.85,'#d9985a');sky.addColorStop(1,'#f0c07a');g.fillStyle=sky;g.fillRect(0,0,W,H);
  const sun=g.createRadialGradient(W*.7,hz-H*.02,0,W*.7,hz-H*.02,H*.3);sun.addColorStop(0,'rgba(255,232,175,.95)');sun.addColorStop(.12,'rgba(255,210,140,.6)');sun.addColorStop(1,'rgba(255,190,120,0)');g.fillStyle=sun;g.fillRect(0,0,W,H);
  for(let k=0;k<14;k++){g.fillStyle=`rgba(40,30,40,${.08+r()*.08})`;g.beginPath();g.ellipse(r()*W,r()*hz*.6,60+r()*120,6+r()*10,0,0,7);g.fill()}
  const hill=(y,amp,col,seed)=>{const rr=rng(seed);g.fillStyle=col;g.beginPath();g.moveTo(0,H);g.lineTo(0,y);for(let x=0;x<=W;x+=W/24)g.lineTo(x,y-Math.sin(x/W*6+seed)*amp-rr()*amp*.4);g.lineTo(W,H);g.fill()};
  hill(hz,H*.03,'#5a4a45',3);hill(hz+H*.035,H*.025,'#403833',7);
  for(let k=0;k<26;k++)puff(r()*W,hz-H*.05+r()*H*.06,30+r()*60,.12+r()*.12);
  hill(hz+H*.07,H*.02,'#2c2a22',11);
  const man=(x,y,h,col,coat,step)=>{const u=h/10;g.fillStyle=col;
    g.beginPath();g.moveTo(x-1.1*u,y);g.lineTo(x-.5*u+step*u,y-3.2*u);g.lineTo(x+.3*u+step*u,y-3.2*u);g.lineTo(x-.2*u,y);g.fill();
    g.beginPath();g.moveTo(x+.9*u,y);g.lineTo(x+.5*u-step*u,y-3.2*u);g.lineTo(x-.3*u-step*u,y-3.2*u);g.lineTo(x+.2*u,y);g.fill();
    g.beginPath();g.moveTo(x-1.6*u,y-2.8*u);g.lineTo(x-1*u,y-7.2*u);g.lineTo(x+1*u,y-7.2*u);g.lineTo(x+1.6*u,y-2.8*u);g.closePath();g.fill();
    if(coat){g.fillStyle=coat;g.beginPath();g.moveTo(x-1.45*u,y-3.2*u);g.lineTo(x-.95*u,y-6.9*u);g.lineTo(x+.95*u,y-6.9*u);g.lineTo(x+1.45*u,y-3.2*u);g.closePath();g.fill();
      g.strokeStyle='rgba(235,228,210,.55)';g.lineWidth=Math.max(.6,u*.22);g.beginPath();g.moveTo(x-.9*u,y-6.8*u);g.lineTo(x+.8*u,y-3.6*u);g.moveTo(x+.9*u,y-6.8*u);g.lineTo(x-.8*u,y-3.6*u);g.stroke();g.fillStyle=col}
    g.beginPath();g.ellipse(x,y-7.9*u,.75*u,.9*u,0,0,7);g.fill();
    g.beginPath();g.moveTo(x-1.7*u,y-8.5*u);g.quadraticCurveTo(x,y-10.4*u,x+1.7*u,y-8.5*u);g.quadraticCurveTo(x,y-9*u,x-1.7*u,y-8.5*u);g.fill();
    g.fillRect(x+1.1*u,y-11.2*u,.32*u,8*u);g.fillStyle='rgba(200,205,210,.8)';g.fillRect(x+1.12*u,y-12.6*u,.24*u,1.5*u);g.fillStyle=col};
  const line=(y,n,col,sc,coat,flagCol)=>{for(let i=0;i<n;i++){const x=W*.04+i*(W*.92/n)+(r()-.5)*2,h=sc*(.92+r()*.16);man(x,y,h,col,coat,(r()-.5)*.8)}
    if(flagCol){const fx=W*.5;g.fillStyle=col;g.fillRect(fx,y-sc*3.4,sc*.08,sc*3.4);g.fillStyle=flagCol;g.beginPath();g.moveTo(fx+sc*.08,y-sc*3.3);g.quadraticCurveTo(fx+sc*.6,y-sc*3.5,fx+sc*1.2,y-sc*3.2);g.lineTo(fx+sc*1.2,y-sc*2.6);g.quadraticCurveTo(fx+sc*.6,y-sc*2.9,fx+sc*.08,y-sc*2.7);g.fill()}};
  line(hz+H*.085,60,'#1b1814',H*.028,'rgba(120,40,30,.6)','#8a2b22');
  for(let k=0;k<22;k++)puff(W*(.02+r()*.96),hz+H*.055+r()*H*.02,20+r()*45,.14+r()*.14);
  for(let k=0;k<7;k++){const x=W*(.08+r()*.84),y=hz+H*.085;g.fillStyle='rgba(255,205,115,.95)';g.beginPath();g.arc(x,y-H*.012,2.5+r()*3,0,7);g.fill()}
  const earth=g.createLinearGradient(0,hz+H*.1,0,H);earth.addColorStop(0,'#26251e');earth.addColorStop(.35,'#211d18');earth.addColorStop(1,'#0e0c0b');g.fillStyle=earth;g.fillRect(0,hz+H*.1,W,H);
  // Furrows and churned soil lead the eye toward the two lines of battle.
  g.strokeStyle='rgba(170,139,95,.16)';for(let k=0;k<23;k++){const x=W*(k/22),tx=W*.48+(x-W*.48)*.35;g.lineWidth=1+r()*2;g.beginPath();g.moveTo(tx,hz+H*.11);g.quadraticCurveTo(x*.65+tx*.35,hz+H*.25,x,H);g.stroke()}
  for(let k=0;k<80;k++){const x=r()*W,y=hz+H*(.11+r()*.25);g.fillStyle=`rgba(172,148,105,${.025+r()*.08})`;g.beginPath();g.ellipse(x,y,2+r()*11,.4+r()*2,r()*3,0,7);g.fill()}
  line(hz+H*.155,16,'#0b0908',H*.085,'rgba(42,74,140,.75)','#2a4a8c');
  // Two guns and their crews break the regular infantry silhouette.
  for(const gx of [W*.12,W*.84]){const gy=hz+H*.18,s=H*.012;g.fillStyle='#15120f';g.beginPath();g.arc(gx-s,gy,s*.5,0,7);g.arc(gx+s,gy,s*.5,0,7);g.fill();g.fillRect(gx-s*1.4,gy-s*.7,s*2.8,s*.45);g.fillRect(gx-s*.23,gy-s*1.8,s*.46,s*1.3);g.fillStyle='rgba(203,157,80,.4)';g.fillRect(gx-s*.24,gy-s*1.8,s*.48,s*.15)}
  for(let k=0;k<9;k++){const x=W*(.08+r()*.84),y=hz+H*(.19+r()*.05);g.strokeStyle='rgba(158,130,91,.18)';g.lineWidth=1+r()*1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x+6+r()*7,y-5-r()*5);g.stroke()}
  for(let k=0;k<10;k++)puff(W*(.02+r()*.96),hz+H*.1+r()*H*.03,30+r()*50,.08+r()*.08);
  const vg=g.createLinearGradient(0,hz+H*.16,0,H);vg.addColorStop(0,'rgba(10,8,6,0)');vg.addColorStop(.35,'rgba(10,8,6,.42)');vg.addColorStop(1,'rgba(10,8,6,.85)');g.fillStyle=vg;g.fillRect(0,hz+H*.16,W,H);
}
function showHome(){
  $('home').hidden=false;syncOverlayFocus();paintHome();SND.music(true,false);
  const saved=S&&!S.over&&S.started!==false;
  $('hmenu').innerHTML=`${saved?`<button class="btn brass" data-act="hcont">Continue<small>${S.fac[0].name} · ${dateStr()} · ${DIFF[S.diff].n}</small></button>`:''}
   <button class="btn ${saved?'':'brass'}" data-act="new">New campaign<small>Choose your crown and how hard your rivals fight</small></button>
   <button class="btn" data-act="practice">Practice battle<small>A skirmish that leaves the campaign untouched</small></button>
   <button class="btn" data-act="settings">Settings<small>Battles, sound and speed</small></button>
   <button class="btn" data-act="help">How to play</button>`;
  $('home').querySelector?.('button')?.focus?.();
}
function hideHome(){$('home').hidden=true;syncOverlayFocus();$('endbtn')?.focus?.();startBattleArt();SND.music(true,false)}

/* ============ modals ============ */
function topOverlay(){return !$('modal').hidden?$('modal'):!$('battle').hidden?(!$('bres').hidden?$('bres'):$('battle')):!$('home').hidden?$('home'):null}
function syncOverlayFocus(){const top=topOverlay();if(top&&UI.mapFx){const now=performance.now();UI.mapFx=UI.mapFx.filter(e=>e.t==null||now-e.t<e.duration);for(const e of UI.mapFx)e.t=null}for(const id of ['app','home','battle'])$(id).inert=!!top&&$(id)!==top&&!(id==='battle'&&top===$('bres'));for(const id of ['bctl','bquick','bzoom','bcv'])$(id).inert=top===$('bres')}
function openModal(html){
  const wasOpen=!$('modal').hidden,active=document.activeElement,act=wasOpen?active?.dataset?.act:null,value=active?.dataset?.v;
  if(!wasOpen)UI.modalReturn=active;
  $('card').innerHTML=html;$('modal').hidden=false;syncOverlayFocus();
  const buttons=[...($('card').querySelectorAll?.('button,input,select,[tabindex="0"]')||[])];
  (buttons.find(b=>act&&b.dataset.act===act&&b.dataset.v===value)||buttons[0]||$('card')).focus?.();
}
function closeModal(){$('modal').hidden=true;syncOverlayFocus();scheduleMapFx();const back=UI.modalReturn;UI.modalReturn=null;if(back?.isConnected&&!back.closest?.('[inert]'))back.focus?.();else (topOverlay()?.querySelector?.('button')||$('endbtn'))?.focus?.()}
document.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;const top=topOverlay();if(!top)return;
  const nodes=[...(top.querySelectorAll?.('button:not(:disabled),input:not(:disabled),select:not(:disabled),summary,a[href],[tabindex="0"]')||[])].filter(n=>!n.closest('[hidden],[inert]')&&n.getClientRects().length);
  if(!nodes.length){e.preventDefault();return}const i=nodes.indexOf(document.activeElement);
  if(i<0||e.shiftKey&&i===0||!e.shiftKey&&i===nodes.length-1){e.preventDefault();nodes[e.shiftKey?nodes.length-1:0].focus()}
});
function showReport(){
  if(UI.headless)return;
  S.inbox=S.inbox.filter(validEnvoy);
  if(S.over){openModal(`<h2>${S.over.win?'Victory':'Defeat'}</h2><p>${S.over.why}</p><div class="lbl">Your rivals will remember</div><ul>${councilNotes().map(t=>`<li>${t}</li>`).join('')}</ul><button class="btn brass" data-act="new">Begin a new campaign</button><button class="btn" data-act="close">Look at the map</button>`);return}
  if(!S.report.length&&!S.inbox.length){closeModal();return}
  openModal(`<h2>${dateStr()}</h2>${S.report.length?`<ul>${S.report.map(m=>`<li>${m}</li>`).join('')}</ul>`:''}${S.inbox.map((m,i)=>msgHtml(m,i)).join('')}${S.inbox.length?'<p style="color:var(--muted);font-size:13px">Answer every envoy before the season can end.</p>':''}<button class="btn brass" data-act="close">To your orders</button>`);
}
function helpHtml(){return`<h2>How to play</h2><ul>
<li>Pick one of six crowns. Each tap on <b>End season</b> is one turn. There is no time limit; the campaign goes on until one crown stands. Every campaign draws a new map.</li>
<li><b>Money and people.</b> Every province pays gold by its terrain and size. Buildings, villages and towns pay more. People are needed to raise troops; houses, villages and towns give them room to grow.</li>
<li><b>Villages and free cities</b> are neutral. Claim villages by marching in, then grow them into towns. Court the free cities with gifts and protection, or declare war and storm their walls.</li>
<li><b>Armies</b> march one province at a time; horse alone marches two. Connected built roads halve movement cost (two provinces for infantry, four for cavalry). Battles end movement. Before committing, cancel your attack or retreat a defending army to empty friendly neighbouring land; withdrawal surrenders the province and its garrison. Entering a river ends the move. Select foreign territory and use Declare war in Orders before attacking it. Appoint named generals to lead your armies.</li>
<li><b>Battles are live.</b> Tap a unit to command it alone, tap an enemy to attack it, or choose Move to… then tap a destination. Dragging a unit also moves it. Tap empty ground to clear selection. Face toward… halts infantry and turns their ranks; the gold arrow shows the front. Turning takes time and stops firing. A new combat order releases a manually held facing. Forest groves and the raised hill give cover to either side while occupied. Supporting troops outside a small fort receive no wall protection. Form line and March column let troops dress their ranks to the drums. Fix bayonets takes three seconds before you charge or hold a steady line against frontal cavalry. Fire when ready holds position and fires at clear targets in range once the line has formed and reloaded. Hit enemies from the flank for ×1.5 effect or the rear for ×2; positioning determines the bonus. Tired men fight worse; let them rest. When defending fortifications, Garrison walls sends infantry to intact wall sections to face outward and hold. New orders release them. When attacking, select guns, choose Target wall point… and click a numbered intact section to open a breach there. Guns hold fire after that section falls; choose another point or a new order to continue. Field guns break timber sections in 3 direct hits and stone sections in 9; howitzers need 2 and 3 respectively. Howitzers must unlimber before they fire. Use Target key personnel to aim at a drummer, sergeant, or general. Aimed muskets trade 25% hit chance for priority on that person; range and cover still apply. A fallen sergeant costs 8 morale and slows reloads 15%. Lose officers, colours and drummers, and men waver and break.</li>
<li><b>Construction.</b> Buildings take 1–3 seasons and cost gold up front. Upgrade barracks to level 2 for dragoons; a basic foundry casts field guns and level 2 adds howitzers. Economic upgrades improve output. One building, upgrade or road project can run in each province. Progress bars appear in Orders and Realm; capture destroys unfinished projects.</li>
<li><b>Spies.</b> Select a foreign army, or Scout in Diplomacy. Pay 20 gold for a 75% chance of a strength report. Capture loses the payment and 15 relations. Reports are dated snapshots, marked outdated after two seasons. One mission per army each season.</li>
<li><b>Recruitment.</b> Militia are raised from houses and settlements, not barracks, for 3 gold, 1 person and 2 popularity. Militia take 1 season, line infantry 2, dragoons and field guns 3, howitzers 4. Training runs in parallel and is listed in Orders and Realm. Paid troops join at their training province; losing it loses the recruits. Hired hussars arrive immediately.</li>
<li><b>Diplomacy.</b> Improve relations with an envoy: 10 gold for up to +10 once each season per crown or city. Independent cities open trade at 20 goodwill, paying 2–6 gold each season along an open road.  Non-aggression pacts, cease-fires, peace, alliances, trade pacts with caravan roads, gifts and tribute.</li>
<li><b>Russian hussars</b> sometimes offer to fight for gold. Look for them on the Realm tab.</li>
<li><b>Rivals learn and evolve.</b> See the Council tab.</li></ul>
<button class="btn brass" data-act="close">To the field</button>`}
function settingsHtml(){return`<h2>Settings</h2>
<div class="lbl">Battles</div><div class="row">${[['all','Watch every battle'],['mine','Only my attacks'],['off','Resolve instantly']].map(([k,n])=>`<button class="btn sm ${PREFS.watch===k?'brass':''}" data-act="watch" data-v="${k}">${n}</button>`).join('')}</div>
<div class="lbl">Battle speed</div><div class="row">${[.5,1,2,4].map(k=>`<button class="btn sm ${PREFS.speed===k?'brass':''}" data-act="bspeedpref" data-v="${k}">×${k}${k===1?' · measured pace':''}</button>`).join('')}</div>
<div class="lbl">Sound</div><div class="row"><button class="btn sm ${PREFS.sound?'brass':''}" data-act="sound" data-v="1">On</button><button class="btn sm ${PREFS.sound?'':'brass'}" data-act="sound" data-v="0">Off</button><button class="btn sm" data-act="sounddemo" ${PREFS.sound?'':'disabled'}>Hear effects</button></div>
<label class="sound-level" for="musicvol"><span>Music</span><input id="musicvol" type="range" min="0" max="100" step="5" value="${PREFS.musicVol}" data-volume="musicVol"><output id="musicvolout">${PREFS.musicVol}%</output></label>
<label class="sound-level" for="effectsvol"><span>Battle sounds</span><input id="effectsvol" type="range" min="0" max="100" step="5" value="${PREFS.effectsVol}" data-volume="effectsVol"><output id="effectsvolout">${PREFS.effectsVol}%</output></label>
<div class="lbl">Contextual help</div><button class="btn sm" data-act="togglehelp">${PREFS.contextHelp===false?'Turn contextual help on':'Turn contextual help off'}</button>
<div class="lbl">Rival memory</div><div class="row"><button class="btn sm red" data-act="resetmem">${UI.confirm==='mem'?'Tap again to erase everything rivals have learned':'Erase rival memory'}</button></div>
<button class="btn brass" data-act="close">Done</button>`}
function chooser(){
  const pk=UI.pick,live=S&&!S.over&&S.started!==false;
  openModal(`<h2>New campaign</h2>${live?'<p>Starting over abandons the current campaign; rivals still learn from it.</p>':''}
  <div class="lbl">Your crown</div><div class="nations">${NATIONS.map((N,i)=>`<button class="opt" data-act="pnat" data-v="${i}" aria-pressed="${pk.nat===i}"><span class="sw" style="background:${N.col};border-color:${N.col2};width:16px;height:16px"></span><span style="display:flex;flex-direction:column"><b>${N.name}</b><span>${N.ruler.n}</span></span></button>`).join('')}</div>
  <div class="lbl">Opening doctrine</div>${Object.entries(OPENINGS).map(([k,D])=>`<button class="opt" data-act="popening" data-v="${k}" aria-pressed="${(pk.opening||'balanced')===k}"><b>${D.n}</b><span>${D.d.replace(D.gold+' gold',(D.gold+DIFF[pk.diff].pBonus)+' gold')}</span></button>`).join('')}
  <div class="lbl">Difficulty</div>${Object.entries(DIFF).map(([k,D])=>`<button class="opt" data-act="pdiff" data-v="${k}" aria-pressed="${pk.diff===k}"><b>${D.n}</b><span>${D.d}</span></button>`).join('')}
  <button class="btn brass" data-act="start">March as ${NATIONS[pk.nat].name}</button><button class="btn" data-act="close">Cancel</button>`);
}
let toastT=0;
function toast(m){if(UI.headless)return;const t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,m.length>80?5200:2800)}
const PRACTICE_DEFAULT={you:{mil:2,inf:10,cav:3,hus:1,art:2,how:1},foe:{mil:2,inf:8,cav:2,hus:0,art:2,how:0},role:'attack',foeNat:-1,terrain:'plains',river:false,fort:'',genYou:2,genFoe:1};
function practiceCfg(){const c=Object.assign({},PRACTICE_DEFAULT,PREFS.practice||{});c.you=Object.assign({},PRACTICE_DEFAULT.you,c.you);c.foe=Object.assign({},PRACTICE_DEFAULT.foe,c.foe);return c}
function practiceSetup(){
  const c=practiceCfg(),me=S.order[0],foes=NATIONS.map((N,i)=>i).filter(i=>i!==me);
  const row=(side,k)=>`<div class="row" style="justify-content:space-between"><span>${UNIT[k].n}</span><span class="row"><button class="btn sm" data-act="pq" data-s="${side}" data-k="${k}" data-d="-1" aria-label="Fewer">−</button><b style="min-width:26px;text-align:center;font-variant-numeric:tabular-nums">${c[side][k]}</b><button class="btn sm" data-act="pq" data-s="${side}" data-k="${k}" data-d="1" aria-label="More">+</button></span></div>`;
  const pick=(key,val,label)=>`<button class="btn sm ${c[key]===val?'brass':''}" data-act="pset" data-k="${key}" data-v="${val}">${label}</button>`;
  const lvl=(key)=>`<span class="row">${[0,1,2,3,4,5].map(n=>`<button class="btn sm ${c[key]===n?'brass':''}" data-act="pset" data-k="${key}" data-v="${n}" data-n="1">${n?n:'none'}</button>`).join('')}</span>`;
  openModal(`<h2>Practice battle</h2><p>Set up any battle to try out tactics. It leaves your campaign untouched.</p>
  <div class="lbl">Your army · ${S.fac[0].name}</div>${UT.map(k=>row('you',k)).join('')}<div class="row"><span class="lbl">General level</span>${lvl('genYou')}</div>
  <div class="lbl">Enemy</div><div class="row">${pick('foeNat',-1,'Random')}${foes.map(i=>pick('foeNat',i,NATIONS[i].name)).join('')}</div>
  ${UT.map(k=>row('foe',k)).join('')}<div class="row"><span class="lbl">General level</span>${lvl('genFoe')}</div>
  <div class="lbl">Ground</div><div class="row">${pick('terrain','plains','Plains')}${pick('terrain','forest','Forest')}${pick('terrain','hills','Hills')}<button class="btn sm ${c.river?'brass':''}" data-act="ptoggle">River</button></div>
  <div class="lbl">Your role</div><div class="row">${pick('role','attack','Attack')}${pick('role','defend','Defend')}</div><div class="lbl">Defender’s fortification</div><div class="row">${pick('fort','','None, open field')}${pick('fort','palisade','Wooden fort')}${pick('fort','fort','Stone star fort')}${pick('fort','capital','City walls')}</div>
  <button class="btn brass" data-act="pgo">To battle</button><button class="btn" data-act="ptrain">Guided skirmish</button><button class="btn" data-act="close">Cancel</button>`);
}
function practice(cfg){
  closeModal();const fromHome=!$('home').hidden;hideHome();
  const h=location.hash,z=zeroU(),landP=S.prov.map((t,i)=>i).filter(i=>T(i).t!=='water');
  const c=cfg||(()=>{const r=practiceCfg(),kinds=['','','fort','palisade','capital'];
    r.fort=h==='#review-fort'?'fort':h==='#review-forest'||h==='#review-river'||h==='#review-hills'?'':cfg?r.fort:kinds[(Math.random()*kinds.length)|0];
    r.terrain=h==='#review-forest'?'forest':h==='#review-hills'?'hills':['plains','forest','hills'][(Math.random()*3)|0];r.river=h==='#review-river'||(!r.fort&&h!=='#review-forest'&&h!=='#review-hills'&&Math.random()<.35);return r})();
  const foeNat=c.foeNat>=0&&c.foeNat!==S.order[0]?c.foeNat:S.order[1+((Math.random()*(NN-1))|0)],df=S.order.indexOf(foeNat);
  const p=landP.find(i=>T(i).t===c.terrain)??landP[(Math.random()*landP.length)|0],fk=c.fort;
  const gar=fk?{...z,mil:fk==='capital'?3:0,art:fk==='fort'?2:1}:null;
  const defend=c.role==='defend',gens=[c.genYou?{name:NF(0).gens[0],lvl:c.genYou}:null,c.genFoe?{name:NF(df).gens[0],lvl:c.genFoe}:null];
  liveBattle({guided:!!c.guided,att:{...z,...(defend?c.foe:c.you)},def:{...z,...(defend?c.you:c.foe)},gar,terrain:c.terrain,fortKind:fk,river:!!c.river&&!fk,af:defend?df:0,df:defend?0:df,p,
    gen:defend?gens.reverse():gens}).then(()=>{toast('Practice over. The campaign is as you left it.');if(fromHome)showHome()});
}

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]');if(!b||!S)return;const d=b.dataset,act=d.act;
  if(UI.preBattle){if(act==='prebattle'){const pending=UI.preBattle,choice=d.choice;
    if(!['fight','cancel','retreat'].includes(choice))return;
    if(choice==='cancel'&&pending.a.f!==0)return;
    if(choice==='retreat'&&(pending.a.f===0||!safeRetreats(armyAt(pending.p),pending.a.p).length))return;
    UI.preBattle=null;closeModal();pending.resolve(choice)}return}
  if(UI.busy&&!BV)return;
  if(BV&&!BV.closed){
    const v=BV;if(v.resolving)return;
    if(act==='bexpand'){setBattleExpanded(v,!v.expanded);return}
    if(act==='borders'){v.ordersOpen=!v.ordersOpen;$('battle').classList.toggle('orders-open',v.ordersOpen);renderBattleUI(v);return}
    if(act==='branges'){v.showRanges=!v.showRanges;renderBattleUI(v);return}
    if(act==='bz'){if(d.v==='auto'){v.manual=null;v.fortCam=false;$('bzauto').classList.add('brass');$('bzfort').classList.remove('brass')}else if(d.v==='fort')camFort(v);else{camZoom(v,d.v==='in'?1.35:1/1.35);$('bzfort').classList.remove('brass')}return}
    if(act==='bo'){
      v.wallAimMode=false;v.faceMode=false;
      if(d.v==='advance')v.trainedOrder=true;if(d.v==='flank')v.trainedFlank=true;
      const selected=d.g.startsWith('sel-'),group=selected?d.g.slice(4):d.g;
      const units=(selected?selOf(v):v.B.regs.filter(r=>r.side===v.ps&&r.n)).filter(r=>grp(r.type)===group);
      if(!selected)v.B.orders[v.ps][group]=d.v;
      v.moveMode=false;
      for(const r of units){leaveWallPost(r);r.wallTarget=null;r.manualFace=false;r.ord=selected?d.v:null;r.goal=null;r.forced=null;r.focusMan=null;r.flanked=false;r.flankPoint=null;if(d.v!=='dig'){r.dug=false;r.digT=0}if(d.v==='ready'){orderFormation(r,'line');r.target=null;r.retarget=0}if(d.v==='charge'&&isFoot(r.type)&&!r.formOrder)changeFormation(r,'line')}
      if(units.length)v.B.fx.banner(`${units.length} formation${units.length===1?'':'s'}: ${ORDN[d.v]}`);
      SND.command();if(d.v==='charge')SND.bugle();renderBattleUI(v)
    }    else if(act==='brally'){const g=v.B.general[v.ps];if(g?.alive&&v.B.t>=(v.rallyAt||0)){let n=0;for(const r of v.B.regs)if(r.side===v.ps&&r.type!=='gen'&&r.n&&Math.hypot(r.x-g.x,r.y-g.y)<150){r.mor=Math.min(100,r.mor+18);n++}v.rallyAt=v.B.t+60;battleInsight(v.B,`rally-${v.ps}-${Math.floor(v.B.t)}`,`${sideName(v.ps)} used Rally: ${n} nearby formations received up to 18 morale.`,2);v.B.fx.banner(`${n} nearby formations hear the rally`);SND.bugle()}else v.B.fx.banner(g?.alive?`Rally ready in ${Math.ceil(v.rallyAt-v.B.t)} seconds`:'A living commander is needed to rally troops');renderBattleUI(v)}
    else if(act==='bwallpoint'){v.wallAimMode=!v.wallAimMode;v.moveMode=false;v.faceMode=false;renderBattleUI(v)}
    else if(act==='bwall'){const troops=selOf(v),candidates=troops.length?troops:v.B.regs.filter(r=>r.side===v.ps),posted=[];for(const r of candidates)if(garrisonWalls(v.B,r))posted.push(r);if(posted.length){v.sel=posted;v.moveMode=false;v.faceMode=false;SND.command()}v.B.fx.banner(posted.length?`${posted.length} formations ordered to garrison the walls`:'No intact wall positions available for these troops');renderBattleUI(v)}
    else if(act==='bpersonnel'){v.wallAimMode=false;let count=0;for(const r of selOf(v)){if(d.v==='clear'){r.focusMan=null;r.forced=null;r.target=null;r.retarget=0;count++}else if(orderPersonnel(v.B,r,d.v))count++}v.moveMode=false;v.faceMode=false;v.B.fx.banner(d.v==='clear'?'Normal formation targeting':count?`${count} formation${count===1?'':'s'} targeting ${PERSONNEL[d.v].toLowerCase()}`:'No living target available');SND.command();renderBattleUI(v)}
    else if(act==='bfix'){let changed=false;for(const r of selOf(v))changed=fixBayonets(v.B,r)||changed;v.moveMode=false;if(changed)SND.command();renderBattleUI(v)}
    else if(act==='bdrum'){for(const r of selOf(v))drumRally(v.B,r);SND.rallyDrum();renderBattleUI(v)}
    else if(act==='bface'){v.wallAimMode=false;v.faceMode=!v.faceMode;v.moveMode=false;renderBattleUI(v)}
    else if(act==='bmove'){v.wallAimMode=false;v.faceMode=false;v.moveMode=!v.moveMode;renderBattleUI(v)}
    else if(act==='bform'){for(const r of selOf(v))if(isFoot(r.type))orderFormation(r,d.v);v.moveMode=false;v.B.fx.banner(`Formation: ${d.v}. Current orders continue.`);SND.command();renderBattleUI(v)}
    else if(act==='bmore'){v.more=!v.more;if(v.expanded){v.ordersOpen=true;$('battle').classList.add('orders-open')}renderBattleUI(v)}
    else if(act==='barmy'){v.wallAimMode=false;v.armyOrders=!v.armyOrders;v.sel=[];renderBattleUI(v)}
    else if(act==='bclear'){v.wallAimMode=false;for(const r of selOf(v)){leaveWallPost(r);r.wallTarget=null;r.ord=null;r.forced=null;r.focusMan=null;r.goal=null}renderBattleUI(v)}
    else if(act==='bdesel'){v.wallAimMode=false;v.faceMode=false;v.sel=[];v.moveMode=false;renderBattleUI(v)}
    else if(act==='bselg'){v.wallAimMode=false;v.faceMode=false;v.moveMode=false;v.sel=v.B.regs.filter(r=>r.side===v.ps&&r.n&&r.type!=='gen'&&!r.broken&&(d.g==='all'||grp(r.type)===d.g));renderBattleUI(v);$('bctl').scrollTop=0}
    else if(act==='bretreat'){v.paused=false;rout(v.B,v.ps,`${sideName(v.ps)} withdrew on your retreat order.`);renderBattleUI(v)}
    else if(act==='bpause'){v.paused=!v.paused;if(!v.paused)v.trainedResume=true;renderBattleUI(v)}
    else if(act==='bspeed'){const speeds=[.5,1,2,4];v.speed=speeds[(speeds.indexOf(v.speed)+1)%speeds.length];renderBattleUI(v)}
    else if(act==='bskip'){
      const fx=v.B.fx;v.resolving=true;v.B.fx=null;v.paused=true;
      $('bctl').innerHTML='<div class="bsel" role="status">Resolving the battle…</div>';
      try{await runToEndAsync(v.B)}catch(err){console.error(err);v.B.fx=fx;v.B.fx.banner('Could not finish automatically. Resume to continue.')}finally{v.B.fx=fx;v.resolving=false;renderBattleUI(v)}
    }
    else if(act==='bdone'&&v.result){v.closed=true;$('battle').hidden=true;syncOverlayFocus();BV=null;$('endbtn')?.focus?.();SND.music(true,false);v.resolve(v.result)}
    return;
  }
  if(act!=='resetmem'&&act!=='demolish'&&act!=='cwar'&&!(act==='dip'&&d.op==='war'))UI.confirm=null;
  switch(act){
    case'tipdone':(S.tips||(S.tips={}))[d.tip]=true;save();render();break;
    case'togglehelp':PREFS.contextHelp=PREFS.contextHelp===false;S.tips={};store(PKEY,PREFS);save();openModal(settingsHtml());break;
    case'recoverymap':if(S.fac[0].recovery){S.sel=S.fac[0].recovery.p;UI.tab='tile';render();const p=G.c[S.sel],w=$('mapwrap');w.scrollLeft=p[0]*ts-w.clientWidth/2;w.scrollTop=p[1]*ts-w.clientHeight/2}break;
    case'tab':UI.tab=d.t;render();break;
    case'endturn':endTurn();break;
    case'mapdeselect':deselectMapArmy();break;
    case'half':UI.half=!UI.half;render();break;
    case'zoom':UI.zoom=UI.zoom>1?1:1.8;sizeMap();draw();{const a=S.sel!=null?G.c[S.sel]:null;if(a&&UI.zoom>1){const w=$('mapwrap');w.scrollLeft=a[0]*ts-w.clientWidth/2;w.scrollTop=a[1]*ts-w.clientHeight/2}}break;
    case'build':if(build(0,S.sel,d.b)){toast('Construction started. Progress appears in Orders and Realm.');save();render()}break;
    case'upgrade':if(upgradeBuilding(0,S.sel)){toast('Building upgrade started.');save();render()}break;
    case'road':if(buildRoad(0,S.sel)){toast('Road construction started.');save();render()}break;
    case'site':S.sel=+d.p;UI.tab='tile';render();$('panel').scrollTop=0;break;
    case'spy':{const a=S.armies.find(a=>a.id===+d.a),result=spyArmy(a);if(result)toast(result==='caught'?'Spy captured: 20 gold lost, relations −15.':'Spy report received. Counts reflect this season’s mission.');save();render();break}
    case'town':if(upgradeTown(0,S.sel)){toast(`Town construction started at ${placeName(S.sel)}.`);save();render()}break;
    case'appoint':{const a=armyAt(S.sel);const n=a&&appointGeneral(0,a);if(n)toast(`General ${n} takes command.`);save();render();break}
    case'demolish':if(UI.confirm!=='demo'){UI.confirm='demo';render();break}UI.confirm=null;if(T(S.sel)?.o!==0||projectAt(S.sel))break;T(S.sel).b=null;delete T(S.sel).level;save();render();break;
    case'recruit':if(recruit(0,S.sel,d.u)){toast(`${UNIT[d.u].n} begin training: ${TRAINING[d.u]} season${TRAINING[d.u]===1?'':'s'}.`);save();render()}break;
    case'hire':{const n=hireHussars(0,+d.n);if(n)toast(`${n} squadrons of hussars ride to your capital.`);save();render();break}
    case'tax':S.fac[0].tax=+d.v;save();render();break;
    case'dip':diplo(d.op,+d.f);break;
    case'cgift':{const c=S.cities[+d.c];if(cityGift(0,c))toast(`${c.name} thanks you for your generosity.`);else toast('A gift costs 25 gold.');save();render();break}
    case'cprot':{const c=S.cities[+d.c];if(cityProtect(0,c))toast(`${c.name} is now under your protection.`);save();render();break}
    case'cimprove':if(improveRelations(0,S.cities[+d.c],true))toast('City goodwill improved by up to 10.');save();render();break;
    case'ctrade':if(cityTrade(0,S.cities[+d.c]))toast('Trade road opened. See income in Realm.');save();render();break;
    case'ctradeend':endCityTrade(0,S.cities[+d.c]);save();render();break;
    case'cwar':{const c=S.cities[+d.c];if(UI.confirm!=='cwar'+d.c){UI.confirm='cwar'+d.c;render();break}UI.confirm=null;if(cityWar(0,c))toast(`You are at war with ${c.name}.`);save();render();break}
    case'inbox':{const modalOpen=!$('modal').hidden,i=d.from!=null?S.inbox.findIndex(m=>m.from===+d.from&&m.type===d.type):+d.i;answer(i,d.yes==='1');render();if(modalOpen)showReport();break}
    case'peacegold':{const modalOpen=!$('modal').hidden,i=S.inbox.findIndex(m=>m.from===+d.from&&m.type==='peace');if(demandPeaceGold(i,+d.amount))toast(`${d.amount} gold received. Peace signed.`);render();if(modalOpen)showReport();break}
    case'home':UI.confirm=null;save();showHome();break;
    case'hcont':hideHome();sizeMap();render();if(S.inbox.length||S.over)showReport();break;
    case'settings':openModal(settingsHtml());break;
    case'watch':PREFS.watch=d.v;store(PKEY,PREFS);openModal(settingsHtml());break;
    case'bspeedpref':PREFS.speed=+d.v;store(PKEY,PREFS);openModal(settingsHtml());break;
    case'sound':PREFS.sound=d.v==='1';store(PKEY,PREFS);if(PREFS.sound){SND.init();SND.setLevels();SND.music(true,!!BV)}else{SND.music(false);SND.setLevels()}openModal(settingsHtml());break;
    case'sounddemo':SND.preview();break;
    case'resetmem':if(UI.confirm!=='mem'){UI.confirm='mem';openModal(settingsHtml());break}UI.confirm=null;M=freshMemory();store(MKEY,M);toast('Your rivals have forgotten everything.');openModal(settingsHtml());break;
    case'help':openModal(helpHtml());break;
    case'close':closeModal();if($('home').hidden)render();break;
    case'new':chooser();break;
    case'pnat':UI.pick.nat=+d.v;chooser();break;
    case'popening':UI.pick.opening=d.v;chooser();break;
    case'pdiff':UI.pick.diff=d.v;chooser();break;
    case'start':newGame(UI.pick.diff,UI.pick.nat,UI.pick.opening);closeModal();hideHome();UI.zoom=1;sizeMap();render();break;
    case'practice':practiceSetup();break;
    case'ptrain':practice({...practiceCfg(),guided:true,fort:'',terrain:'plains',river:false,you:{...zeroU(),inf:3,cav:1},foe:{...zeroU(),inf:2,mil:2}});break;
    case'pq':{const c=practiceCfg();c[d.s][d.k]=clamp(c[d.s][d.k]+(+d.d),0,20);PREFS.practice=c;store(PKEY,PREFS);practiceSetup();break}
    case'pset':{const c=practiceCfg();c[d.k]=d.n||d.k==='foeNat'?+d.v:d.v;PREFS.practice=c;store(PKEY,PREFS);practiceSetup();break}
    case'ptoggle':{const c=practiceCfg();c.river=!c.river;PREFS.practice=c;store(PKEY,PREFS);practiceSetup();break}
    case'pgo':{const c=practiceCfg();if(!UT.some(k=>c.you[k])){toast('Give yourself at least one unit.');break}if(!UT.some(k=>c.foe[k])&&(!c.fort||c.role==='defend')){toast(c.role==='defend'?'Give the attacking enemy at least one unit.':'Give the enemy at least one unit, or a fortification.');break}practice(c);break}
  }
});
document.addEventListener('input',e=>{const key=e.target.dataset.volume;if(key!=='musicVol'&&key!=='effectsVol')return;
  PREFS[key]=clamp(+e.target.value,0,100);const out=$(key==='musicVol'?'musicvolout':'effectsvolout');if(out)out.textContent=PREFS[key]+'%';
  store(PKEY,PREFS);SND.setLevels();
});
addEventListener('resize',()=>{if(S&&!UI.headless){sizeMap();draw();if(!$('home').hidden)paintHome()}if(BV&&!BV.closed){const old=BV.ground;sizeBattle(BV);if(old&&old.width)BV.g.drawImage(old,0,0,FW,FH);else drawGround(BV)}});

/* ============ asset export (open the game with #export on the local export server) ============ */
async function exportAssets(){
  startBattleArt();
  const post=(name,data,type)=>fetch('/save?name='+encodeURIComponent(name),{method:'POST',headers:{'Content-Type':type||'application/octet-stream'},body:data});
  const png=cvs=>new Promise(res=>cvs.toBlob(res,'image/png'));
  const out=[];const done=async(name,data,type)=>{await post(name,data,type);out.push(name)};
  const slug=t=>t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  // 1. ruler portraits: svg and png, three moods
  for(let n=0;n<NN;n++){const f=S.order.indexOf(n),N=NATIONS[n];
    for(const[mood,label]of[[.6,'neutral'],[1,'friendly'],[-1,'hostile']]){
      const svg=portrait(f,512,mood,true).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
      const base=`portraits/${slug(N.name)}-${slug(N.ruler.n)}-${label}`;
      await done(base+'.svg',svg,'image/svg+xml');
      const img=new Image();await new Promise(r=>{img.onload=r;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
      const c=document.createElement('canvas');c.width=512;c.height=640;c.getContext('2d').drawImage(img,0,0,512,640);await done(base+'.png',await png(c),'image/png')}}
  // 2. unit sprites per nation: every type, role and pose
  if(UNIT_IMAGES)await Promise.race([
    Promise.all(Object.values(UNIT_IMAGES).flat().map(im=>im.decode?im.decode().catch(()=>{}):Promise.resolve())),
    new Promise(resolve=>setTimeout(resolve,5000))
  ]);
  const poses=[
    ['infantry','inf','',{}],['infantry-march-a','inf','',{moving:true,T0:.2}],['infantry-march-b','inf','',{moving:true,T0:.65}],['infantry-firing','inf','',{fired:true}],['infantry-bayonet','inf','',{bayonet:true}],
    ['officer','inf','officer',{}],['colour-bearer','inf','flag',{T0:.3}],['drummer','inf','drum',{}],
    ['militia','mil','',{}],['militia-march','mil','',{moving:true,T0:.2}],
    ['dragoon','cav','',{}],['dragoon-charge','cav','',{moving:true,mode:'charge',T0:.1}],['dragoon-standard','cav','flag',{T0:.3}],
    ['hussar','hus','',{}],['hussar-charge','hus','',{moving:true,mode:'charge',T0:.1}],
    ['field-gun','art','',{}],['howitzer-limbered','how','',{hs:'limber'}],['howitzer-deployed','how','',{hs:'ready'}],['general','gen','general',{}]];
  const SC=16,CW=240,CH=320;
  for(let n=0;n<NN;n++){const N=NATIONS[n],sheet=document.createElement('canvas');sheet.width=CW*poses.length;sheet.height=CH;const sg=sheet.getContext('2d');
    for(let i=0;i<poses.length;i++){const[name,type,role,o]=poses[i];
      const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');
      const r={type,moving:!!o.moving,bayonet:!!o.bayonet,fired:!!o.fired,reload:0,mode:o.mode||'wait',hs:o.hs||'ready',ht:0};
      const m={role,hp:isGun(type)&&!role?6:1,ox:0,oy:0,x:40};
      g.setTransform(SC,0,0,SC,CW/2,CH*(isGun(type)?.58:isHorse(type)||type==='gen'?.55:role==='flag'?.72:.62));if(!drawPaintedFig(g,m,r,N,-1,o.T0||0))drawFig(g,m,r,N,-1,o.T0||0);
      await done(`units/${slug(N.name)}/${name}.png`,await png(c),'image/png');sg.drawImage(c,i*CW,0)}
    await done(`units/${slug(N.name)}-sprite-sheet.png`,await png(sheet),'image/png')}
  {const N=CITYNAT,c=document.createElement('canvas');c.width=CW*2;c.height=CH;const g=c.getContext('2d');
    g.setTransform(SC,0,0,SC,CW/2,CH*.7);if(!drawPaintedFig(g,{role:'',hp:1,ox:0,oy:0,x:0},{type:'mil',reload:0},N,-1,0))drawFig(g,{role:'',hp:1,ox:0,oy:0,x:0},{type:'mil',reload:0},N,-1,0);
    g.setTransform(SC,0,0,SC,CW*1.5,CH*.7);if(!drawPaintedFig(g,{role:'',hp:1,ox:0,oy:0,x:0},{type:'inf',reload:0},N,-1,0))drawFig(g,{role:'',hp:1,ox:0,oy:0,x:0},{type:'inf',reload:0},N,-1,0);
    await done('units/free-city-guard.png',await png(c),'image/png')}
  // 3. the campaign map at high resolution, then the building icons
  const keepTs=ts;ts=90;cv.width=MW*ts;cv.height=MH*ts;ctx.setTransform(1,0,0,1,0,0);const keepSel=S.sel;S.sel=null;draw();
  await done('map/campaign-map.png',await png(cv),'image/png');
  const icons=['capital','city','town','village','farm','sawmill','mine','market','house','church','barracks','foundry','palisade','fort'];
  const isheet=document.createElement('canvas');isheet.width=128*icons.length;isheet.height=128;const ig=isheet.getContext('2d');
  ts=200;cv.width=160;cv.height=160;
  for(let i=0;i<icons.length;i++){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,160,160);drawBuilding(icons[i],80,84,0);
    const c=document.createElement('canvas');c.width=128;c.height=128;c.getContext('2d').drawImage(cv,16,16,128,128,0,0,128,128);
    await done(`map/icons/${icons[i]}.png`,await png(c),'image/png');ig.drawImage(c,i*128,0)}
  await done('map/icons-sheet.png',await png(isheet),'image/png');
  ts=keepTs;S.sel=keepSel;sizeMap();draw();
  // 4. homepage painting
  paintHome();await done('art/homepage.png',await png($('homecv')),'image/png');
  // 5. nation colours
  await done('nations.json',JSON.stringify(NATIONS.map(N=>({name:N.name,mapColour:N.col,borderColour:N.col2,coat:N.coat,facings:N.facing,ruler:N.ruler.n+', '+N.ruler.t,generals:N.gens})).concat([{name:'Free cities',mapColour:CITYNAT.col,borderColour:CITYNAT.col2,coat:CITYNAT.coat}]),null,2),'application/json');
  await done('_done.txt',out.join('\n'),'text/plain');
  document.title='EXPORT DONE';
}

/* ============ boot ============ */
/*__TEST__*/
function start(data){
  const saved=data&&data.S?data.S:load(SKEY);
  if(saved&&saved.v===4&&saved.sites){S=saved;S.report=S.report||[];S.scars=S.scars||[];G=buildGeo(S.sites,S.prov.map(t=>t.t!=='water'));UI.pick.nat=S.order[0];UI.pick.diff=S.diff}
  else newGame('normal',0,'balanced',true),S.turn=1;
  S.recruitment=S.recruitment||[];S.construction=S.construction||[];S.intel=S.intel||{};S.spyAttempts=S.spyAttempts||{};for(const c of S.cities){c.trade=c.trade||Array(NN).fill(false);c.improved=c.improved||Array(NN).fill(0)}
  S.tips=S.tips||{};S.generalHistory=S.generalHistory||{};S.armyArchive=S.armyArchive||[];S.armies.forEach(a=>{armyRecord(a);generalRecord(a)});UI.pick.opening=S.opening||'balanced';
  sizeMap();render();showHome();
  if(location.hash==='#practice'||location.hash==='#practice-fire'||location.hash==='#practice-close'||location.hash==='#review-fort'||location.hash==='#review-forest'||location.hash==='#review-river'||location.hash==='#review-hills')setTimeout(practice,50);
  if(location.hash==='#review-map'){hideHome();UI.zoom=1.8;sizeMap();render()}
  if(location.hash==='#export')setTimeout(exportAssets,50);
}
const hot=window.claude&&window.claude.hot;
if(hot&&typeof hot.snapshot==='function')hot.snapshot(()=>({S}));
hot&&hot.ready?hot.ready(start):start(hot&&hot.data?hot.data:{});
})();
