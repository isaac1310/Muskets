/* ============ live battle: simulation (no DOM) ============ */
const FW=400,FH=620;
const BATTLE_PACE=.75;
const BT={infRange:130,milRange:105,infReload:6.4,infHit:.12,infSpeed:3.2,cavSpeed:12,carbine:80,pistol:45,artRange:200,artReload:9.5,ballSpeed:260,bounce:90,canRange:85,canHit:.30,howRange:240,howReload:11.5,shellSpeed:150,shellR:17,melee:.28,limit:600};
const MELEE={mil:{mil:.8,inf:.7,cav:.9,hus:.9,art:1.2,how:1.2},inf:{mil:1.2,inf:1,cav:1.4,hus:1.4,art:1.5,how:1.5},cav:{mil:1.2,inf:.8,cav:1,hus:1.1,art:3,how:3},hus:{mil:1.3,inf:.75,cav:.95,hus:1,art:3.2,how:3.2},art:{mil:.35,inf:.3,cav:.3,hus:.3,art:.4,how:.4},how:{mil:.3,inf:.25,cav:.25,hus:.25,art:.4,how:.4}};
const PREF={mil:{mil:1,inf:1,cav:.8,hus:.8,art:1.1,how:1.1},inf:{mil:.9,inf:1,cav:.7,hus:.7,art:1.1,how:1},cav:{mil:1,inf:1.3,cav:.9,hus:.9,art:.35,how:.3},hus:{mil:.9,inf:1.4,cav:.9,hus:.9,art:.3,how:.28},art:{mil:.7,inf:.6,cav:1.4,hus:1.4,art:.9,how:.9},how:{mil:.7,inf:.6,cav:1.5,hus:1.5,art:.8,how:.8}};
const MEN={mil:12,inf:24,cav:10,hus:9},GUNHP=6,HPW={mil:.5,inf:1,cav:2,hus:2,art:.75,how:.75};
const isHorse=t=>t==='cav'||t==='hus',isGun=t=>t==='art'||t==='how',isFoot=t=>t==='inf'||t==='mil';
const firingRange=r=>r.type==='inf'?BT.infRange:r.type==='mil'?BT.milRange:r.type==='cav'?BT.carbine:r.type==='hus'?BT.pistol:r.type==='art'?BT.artRange:r.type==='how'?BT.howRange:0;
const grp=t=>isFoot(t)?'foot':isHorse(t)?'horse':isGun(t)?'guns':'gen';
const WALLS={fort:{cover:.6,hp:100},palisade:{cover:.8,hp:60},capital:{cover:.85,hp:100}};
const ORDN={stand:'Stand',ready:'Fire when ready',advance:'Advance',hold:'Hold the line',dig:'Dig in',charge:'Charge!',flank:'Flank',shoot:'Shoot',wait:'Wait',auto:'At will',fire:'Bombard',counter:'Counter-battery',walls:'Target the walls'};
const ORDS={foot:['stand','ready','advance','hold','dig','charge','flank'],horse:['wait','charge','shoot','flank'],guns:['stand','fire','counter','walls']};
const menOfU=u=>u.mil*MEN.mil+u.inf*MEN.inf+u.cav*MEN.cav+u.hus*MEN.hus+(u.art+u.how)*6;
const ORDINAL=n=>n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th');

function makeBattle(o){
  const Wd=WALLS[o.fortKind]||null;
  const B={t:0,regs:[],balls:[],shells:[],done:false,routing:-1,routT:0,lastChk:0,terrain:o.terrain,fortKind:o.fortKind||'',
    cover:Wd?(o.fort||Wd.cover):0,wallHp:Wd?Wd.hp:0,wallMax:Wd?Wd.hp:0,river:o.river?300:0,player:-1,
    orders:[{foot:'advance',horse:'auto',guns:'fire'},{foot:'hold',horse:'auto',guns:'fire'}],start:[0,0],fx:null,nid:1,
    general:[null,null],gen:o.gen||[null,null],genDied:[false,false],breaches:[],events:[],insights:[],insightKeys:new Set(),endReason:''};
  if(Wd){const n=o.fortKind==='capital'?24:12;B.segHp=o.fortKind==='palisade'?18:30;B.seg=Array(n).fill(B.segHp)}
  const g=o.gar||zeroU(),a=o.att,d=o.def||zeroU();
  B.k=Math.min(1,1200/Math.max(1,menOfU(a),menOfU(addU(d,g))));
  deploy(B,0,a,null);deploy(B,1,d,g);
  B.start=[sideStr(B,0),sideStr(B,1)];
  return B;
}
function menOf(B,t,c){return c?Math.max(c,Math.round(c*MEN[t]*B.k)):0}
function addReg(B,side,type,gar,x,y,label){const r={id:B.nid++,side,type,gar,men:[],crews:[],n:0,n0:0,hp0:0,x,y,target:null,retarget:0,reload:.5+Math.random()*1.5,mode:'wait',mor:100,broken:false,fat:0,ord:null,forced:null,goal:null,dug:false,digT:0,hs:'ready',ht:0,label};B.regs.push(r);return r}
function addMan(B,r,ox,oy,rank,hp,role){const m={reg:r,ox,oy,x:r.x+ox,y:r.y+oy,px:r.x+ox,py:r.y+oy,gait:rank*.7+ox*.13,walk:0,hp,alive:true,rank,cd:Math.random()*2.5,role:role||''};r.men.push(m);r.n++;r.n0++;r.hp0+=hp;
  if(role==='officer')r.officer=m;else if(role==='flag')r.flagman=m;else if(role==='drum')r.drummer=m;return m}
function addGun(B,r,ox,oy){const gun=addMan(B,r,ox,oy,0,GUNHP);gun.crew=[];for(let i=0;i<3;i++){const c={reg:r,gun,role:'crew',alive:true,hp:1,ox:[-5.1,5.2,.4][i],oy:[.8,1.3,-2.1][i],x:gun.x+[-5.1,5.2,.4][i],y:gun.y+[.8,1.3,-2.1][i]};gun.crew.push(c);r.crews.push(c)}return gun}
function targets(r){return r.crews.length?r.men.concat(r.crews.filter(c=>c.alive&&c.gun.alive)):r.men}
function staff(B,r,back,w,depth,drum){addMan(B,r,0,-12*back,9,1,'officer');addMan(B,r,0,(depth+7)*back,9,1,'flag');if(drum)addMan(B,r,w/2+8,2*back,9,1,'drum')}
function deploy(B,side,u,gar){
  const back=side===0?1:-1,wk=B.fortKind,front=side===0?(wk?400:385):(wk==='palisade'?150:wk?135:215);
  const bats=[];
  if(u.inf){const nb=Math.min(8,u.inf),n=menOf(B,'inf',u.inf);for(let i=0;i<nb;i++)bats.push({t:'inf',n:Math.round(n*(i+1)/nb)-Math.round(n*i/nb),gar:false})}
  if(u.mil){const nb=Math.min(3,u.mil),n=menOf(B,'mil',u.mil);for(let i=0;i<nb;i++)bats.push({t:'mil',n:Math.round(n*(i+1)/nb)-Math.round(n*i/nb),gar:false})}
  if(gar&&gar.inf)bats.push({t:'inf',n:menOf(B,'inf',gar.inf),gar:true});
  if(gar&&gar.mil)bats.push({t:'mil',n:menOf(B,'mil',gar.mil),gar:true});
  const walledIn=side===1&&(wk==='fort'||wk==='palisade');
  const perRow=walledIn?Math.min(3,bats.length):Math.min(bats.length>12?4:3,bats.length),sp=walledIn?Math.min(48,140/Math.max(1,perRow)):Math.min(110,300/Math.max(1,perRow));
  const layout=b=>{const firingCols=Math.ceil(b.n/(b.n>40?4:3)),cols=walledIn?firingCols:Math.min(firingCols,Math.max(3,Math.ceil(b.n/6),Math.floor((sp-12)/9.4)));return{cols,firingCols,depth:(Math.ceil(b.n/cols)-1)*12}};
  const rowOffsets=[];let totalDepth=0;
  for(let start=0;start<bats.length;start+=perRow){rowOffsets.push(totalDepth);totalDepth+=Math.max(56,...bats.slice(start,start+perRow).map(b=>layout(b).depth+30))}
  // Keep ordinary deeper formations inside the field without moving either front past midfield.
  const lineFront=walledIn?front:side===0?Math.min(front,Math.max(340,FH-12-totalDepth)):Math.max(front,Math.min(280,12+totalDepth));
  let ni=0,nm=0;
  bats.forEach((b,i)=>{
    const row=Math.floor(i/perRow),inRow=Math.min(perRow,bats.length-row*perRow),col=i-row*perRow;
    const label=b.gar?(b.t==='mil'?'Town militia':'Garrison'):b.t==='mil'?`${ORDINAL(++nm)} Militia`:(ni++,`${ORDINAL(Math.ceil(ni/2))} Regiment, ${ni%2?'I':'II'} Bn`);
    const r=addReg(B,side,b.t,b.gar,200+(col-(inRow-1)/2)*sp,walledIn?(wk==='palisade'?168:160)-row*30:lineFront+rowOffsets[row]*back,label);r.row=row;
    const {cols,firingCols}=layout(b),sx=Math.max(9.4,Math.min(10.4,(sp-12)/Math.max(1,cols))),F=Math.min(cols,b.n>24?6:5);
    for(let k=0;k<b.n;k++){const c=k%cols,rk=Math.floor(k/cols),m=addMan(B,r,(c-(cols-1)/2)*sx,rk*12*back,Math.floor(k/firingCols),1);m.l=[m.ox,m.oy];m.c=[((k%F)-(F-1)/2)*9.4,(Math.floor(k/F)+1)*12*back]}
    staff(B,r,back,cols*sx,Math.ceil(b.n/cols)*12,true);
    for(const m of r.men)if(m.role){m.l=[m.ox,m.oy];m.c=m.role==='officer'?[0,-10*back]:m.role==='flag'?[F*4.7+6,2*12*back]:[-(F*4.7+6),1*12*back]}
    r.form='line';r.formT=9;r.formSw=0;
  });
  const sq=(t,count,x,y,label)=>{const n=menOf(B,t,count),r=addReg(B,side,t,false,x,y,label),cols=Math.min(8,Math.ceil(n/2));for(let k=0;k<n;k++){const c=k%cols,rk=Math.floor(k/cols);addMan(B,r,(c-(cols-1)/2)*15,rk*18*back,rk,1)}staff(B,r,back,cols*15,Math.ceil(n/cols)*18,false)};
  if(u.cav){const nb=Math.min(2,u.cav);for(let i=0;i<nb;i++)sq('cav',Math.round(u.cav*(i+1)/nb)-Math.round(u.cav*i/nb),walledIn?(i?235:165):(i?330:70),walledIn?62:front+62*back,`${ORDINAL(i+1)} Dragoons`)}
  if(u.hus)sq('hus',u.hus,walledIn?200:u.cav?200:70,walledIn?72:front+(u.cav?110:62)*back,'Hussars');
  if(u.art){const r=addReg(B,side,'art',false,200,walledIn?185:front+55*back,'Battery');for(let i=0;i<u.art;i++)addGun(B,r,(i-(u.art-1)/2)*Math.min(26,250/u.art),0);addMan(B,r,0,12*back,9,1,'officer')}
  if(u.how){const r=addReg(B,side,'how',false,200,front+80*back,'Howitzers');r.hs=side===0?'limber':'ready';for(let i=0;i<u.how;i++)addGun(B,r,(i-(u.how-1)/2)*Math.min(30,250/u.how),0);addMan(B,r,0,14*back,9,1,'officer')}
  if(gar&&gar.art){const y=wk==='palisade'?212:196,r=addReg(B,side,'art',true,200,y,'Wall guns');for(let i=0;i<gar.art;i++)addGun(B,r,(i-(gar.art-1)/2)*44,0)}
  if(B.regs.some(r=>r.side===side)){const gi=B.gen[side],gr=addReg(B,side,'gen',false,200,front+(side?-1:1)*95,gi?`General ${gi.name}`:'Colonel');B.general[side]=addMan(B,gr,0,0,9,gi?3:2,'general');addMan(B,gr,-9,4*(side?-1:1),9,1,'aide');addMan(B,gr,9,4*(side?-1:1),9,1,'aide')}
}
function operational(m){return m.alive&&(!m.crew||m.crew.some(c=>c.alive))}
function battleEvent(B,text){B.events.push(text);if(B.fx)B.fx.banner(text)}
const sideName=s=>s?'Defenders':'Attackers';
const formationName=r=>`${sideName(r.side)} · ${r.label}`;
function battleInsight(B,key,text,weight=1){
  if(B.insightKeys.has(key))return;B.insightKeys.add(key);B.insights.push({key,text,weight,t:B.t});
  if(weight>=3)battleEvent(B,text);
}
function recordHit(B,m,source){
  if(!source)return;const r=m.reg,a=source.reg;
  if(a){a.hits=(a.hits||0)+1;if(source.flank>1){a.flankHits=(a.flankHits||0)+1;
    battleInsight(B,`flank-${a.id}-${r.id}`,`${formationName(a)} hit ${r.label} ${source.flank>2?'with a flanking charge':'from the '+(source.flank>=2?'rear':'flank')}: ×${source.flank} attack effect and morale shock from casualties.`,4)}}
  r.hitBy=r.hitBy||{};r.hitBy[source.kind]=(r.hitBy[source.kind]||0)+1;
}
function battleExplanation(B){
  const lines=[B.endReason||'The battle is still in progress.'];
  const relevance=x=>x.weight+(B.loser!=null&&x.text.startsWith(sideName(B.loser)+' ·')&&/^(general|break|officer|flag|fatigue|crew)-/.test(x.key)?3:0);
  const categories=new Set(),key=B.insights.slice().sort((a,b)=>relevance(b)-relevance(a)||a.t-b.t).filter(x=>{const k=x.key.split('-')[0];if(categories.has(k))return false;categories.add(k);return true}).slice(0,4);
  for(const x of key)lines.push(`${Math.floor(x.t/60)}:${String(Math.floor(x.t%60)).padStart(2,'0')} · ${x.text}`);
  for(const side of[0,1]){
    const rs=B.regs.filter(r=>r.side===side),blocked=rs.slice().sort((a,b)=>(b.maskedSeconds||0)-(a.maskedSeconds||0))[0];
    const flank=rs.reduce((n,r)=>n+(r.flankHits||0),0);
    if(flank)lines.push(`${sideName(side)} landed ${flank} damaging flank/rear hits.`);
    if(blocked?.maskedSeconds>=5)lines.push(`${formationName(blocked)} spent ${Math.round(blocked.maskedSeconds)} seconds unable to fire because friendly troops were ahead. Move reserves sideways to open a firing line.`);
  }
  return lines;
}
function battleAdvice(B,r){
  const out=[],tg=r.target,d=tg?Math.hypot(tg.x-r.x,tg.y-r.y):Infinity;
  if(r.broken)return ['Routing: morale fell below 8. A nearby commander helps recovery; the formation rallies above 45.'];
  if(drumming(B,r))out.push(`Drum rally · ${Math.ceil(r.drumUntil-B.t)}s: halted, no firing; +2 morale/sec in addition to steady drum support.`);

  if(fixingBayonets(B,r))out.push(`Fixing bayonets · ${Math.ceil(r.fixUntil-B.t)}s: halted, no firing.`);
  else if(r.bayonetsFixed)out.push(bayonetBraced(B,r)?'Bayonets fixed: +25% melee effect; braced line takes 40% fewer frontal cavalry melee hits. Flanks remain exposed.':'Bayonets fixed: +25% melee effect. Hold a steady line with morale 30+ to brace against frontal cavalry.');
  if(r.forming)out.push(`Forming ${r.form}: ${Math.round((r.formProgress||0)*100)}% in place. Muskets wait until the ranks are ready.`);
  if(ordOf(B,r)==='ready')out.push('Fire when ready: hold position, form a line, and fire on a clear target in range after reloading.');
  if(r.atWall)out.push('Blocked by intact walls: open a breach with guns, then move through it.');
  if(r.melee)out.push('In melee: troops cannot rest until they disengage.');
  else if(isFoot(r.type)&&tg&&d<=firingRange(r)&&masked(B,r,tg))out.push('Cannot fire: a friendly formation is ahead. Move the reserve sideways for a clear shot.');
  if(isFoot(r.type)&&r.form==='column')out.push('Marching in column: muskets cannot fire until the formation deploys into line.');
  if(r.fat>=40)out.push(`Fatigue ${Math.round(r.fat)}: fighting efficiency −${Math.round(r.fat*.4)}%, speed −${Math.round(r.fat*.3)}%. Rest out of melee to recover.`);
  if(r.mor<30)out.push('Wavering: fighting efficiency is reduced by 40%. Rally nearby or withdraw toward the commander.');
  if(r.dug)out.push('Dug in: incoming hit probability ×0.65. Moving or melee removes this cover.');
  if(r.officer&&!r.officer.alive)out.push('Officer lost: this formation fights about 22% less effectively.');
  if(r.flagman&&!r.flagman.alive)out.push('Colours lost: −15 morale at the loss and no flag recovery.');
  if(riverSlow(B,r)<1)out.push('Crossing the river: movement speed ×0.45.');
  if(r.type==='how'&&r.hs!=='ready')out.push(r.hs==='deploy'?`Unlimbering: ${Math.ceil(r.ht)} simulation seconds until ready.`:'Howitzers must unlimber before firing.');
  if(isGun(r.type)&&!r.men.some(m=>m.crew&&operational(m)))out.push('No active gun crews remain. This battery cannot fire.');
  if(isGun(r.type)&&r.men.some(m=>m.crew&&operational(m)&&m.crew.filter(c=>c.alive).length<3))out.push('Gun crew losses slow reloading.');
  if(tg&&isFoot(r.type)&&d>firingRange(r)&&!r.melee)out.push('Target is beyond musket range. Advance or wait for the enemy to approach.');
  if(tg&&r.forced)out.push(`Attack order: ${tg.label}.`);
  if(r.goal)out.push('Moving to the marked destination; the formation will hold when it arrives.');
  if(r.drummer&&!drumming(B,r))out.push(r.drummer.alive?`Drummer: +0.8 morale/sec. Drum rally ${B.t<(r.drumReady||0)?'ready in '+Math.ceil(r.drumReady-B.t)+'s':'ready outside melee'}; 45s cooldown.`:'Drummer lost: drum recovery and Drum rally unavailable.');
  return out.length?out:['Ready. Select a target or position; pause whenever you need time to plan.'];
}
// Fixing is a preparation action; the attached bayonets persist through later orders.
function fixingBayonets(B,r){return !!(r.fixUntil>B.t&&!r.broken&&B.routing!==r.side)}
function canFixBayonets(B,r){return !!(isFoot(r.type)&&r.n&&!r.bayonetsFixed&&!r.fixUntil&&!r.broken&&!r.melee&&!drumming(B,r)&&!B.done&&B.routing<0&&!B.regs.some(e=>e.side!==r.side&&e.n&&Math.hypot(e.x-r.x,e.y-r.y)<28))}
function fixBayonets(B,r,hold=true){
  if(!canFixBayonets(B,r))return false;
  orderFormation(r,'line');r.fixUntil=B.t+3;r.fixStarted=B.t;r.forced=null;if(hold)r.ord='stand';
  battleEvent(B,`${r.label}: fix bayonets — halt and cease fire for 3 seconds.`);return true;
}
function bayonetBraced(B,r){return !!(isFoot(r.type)&&r.bayonetsFixed&&!r.broken&&B.routing!==r.side&&r.mor>=30&&r.form==='line'&&!r.forming&&r.formT>=2.6&&!r.goal&&!r.moving&&['stand','hold','ready','dig'].includes(ordOf(B,r)))}
function bayonetMeleeFactor(B,a,b){return (isFoot(a.type)&&a.bayonetsFixed?1.25:1)*(isHorse(a.type)&&bayonetBraced(B,b)&&flankMult(a,b)===1?.6:1)}
// Drum rally is local support, separate from the commander's instant rally.
function drumming(B,r){return !!(r.drummer?.alive&&!r.broken&&B.routing!==r.side&&r.drumUntil>B.t)}
function canDrumRally(B,r){return !!(isFoot(r.type)&&r.n&&r.drummer?.alive&&!r.broken&&!r.melee&&!r.fixUntil&&!B.done&&B.routing<0&&B.t>=(r.drumReady||0)&&!B.regs.some(e=>e.side!==r.side&&e.n&&Math.hypot(e.x-r.x,e.y-r.y)<28))}
function drumRally(B,r){
  if(!canDrumRally(B,r))return false;
  r.drumUntil=B.t+8;r.drumReady=B.t+45;r.drumGained=0;
  battleEvent(B,`${r.label}: drums rally the ranks — halt and cease fire for 8 seconds.`);return true;
}
function finishDrumRally(B,r){
  if(!r.drumUntil||r.drumUntil>B.t)return;
  battleInsight(B,`drumrally-${r.id}-${Math.floor(B.t)}`,`${formationName(r)} recovered ${Math.round(r.drumGained||0)} extra morale from Drum rally while halted.`,2);r.drumUntil=0;
}
function sideStr(B,s){let v=0;for(const r of B.regs)if(r.side===s&&r.type!=='gen'&&!r.broken)for(const m of r.men)if(operational(m))v+=m.hp*HPW[r.type];return v}
function rndAlive(r){if(!r||!r.n)return null;const pool=targets(r);for(let k=0;k<6;k++){const m=pool[(Math.random()*pool.length)|0];if(m.alive)return m}return pool.find(m=>m.alive)||null}
function genInfo(B,side){const g=B.general[side],gi=B.gen[side];return{m:g,lvl:gi?gi.lvl:0,rad:gi?150+10*gi.lvl:100,rec:gi?1+.2*gi.lvl:.6}}
function inAura(B,r){const G=genInfo(B,r.side);return G.m&&G.m.alive&&Math.hypot(G.m.x-r.x,G.m.y-r.y)<G.rad?G:null}
function eff(B,r){const G=inAura(B,r);return(r.officer?(r.officer.alive?1.1:.86):1)*(r.mor<30?.6:1)*(1-r.fat*.004)*(G&&G.lvl?1+.04*G.lvl:1)}
function kill(B,m,shock,source){if(!m.alive)return;m.hitT=B.t;const sx=source?.x??source?.reg?.x??m.x,sy=source?.y??source?.reg?.y??(m.y+(m.reg.side?-10:10)),hd=Math.hypot(m.x-sx,m.y-sy)||1;m.hitDX=(m.x-sx)/hd;m.hitDY=(m.y-sy)/hd;recordHit(B,m,source);if(m.role==='crew'){m.alive=false;if(!m.gun.crew.some(c=>c.alive))battleInsight(B,`crew-${m.reg.id}`,`${formationName(m.reg)} lost a gun's last crew member: that gun can no longer fire.`,3);if(B.fx?.crewDeath)B.fx.crewDeath(m,source);return}m.hp--;if(m.hp>0){if(B.fx&&isGun(m.reg.type))B.fx.spark(m.x,m.y);return}m.alive=false;const r=m.reg;r.n--;if(B.fx){B.fx.death(m,source)}if(m.crew)for(const c of m.crew)if(c.alive)kill(B,c,shock,{...source,kind:'shell',x:m.x,y:m.y});
  if(r.type==='gen'&&m.role!=='general')return;
  if(r.type==='gen'){const gi=B.gen[r.side];for(const o of B.regs)if(o.side===r.side)o.mor-=gi?25:12;if(gi)B.genDied[r.side]=true;battleInsight(B,`general-${r.side}`,`${formationName(r)} fell: every friendly formation lost ${gi?25:12} morale and its commander support.`,5);return}
  r.mor-=120/Math.max(1,r.n0)*(r.flagman&&r.flagman.alive?.85:1)*(r.gar?.6:1)*(r.type==='mil'?1.5:1)*(r.dug?.8:1)*(shock||1);
  if(m.role==='flag'){r.mor-=15;battleInsight(B,`flag-${r.id}`,`${formationName(r)} lost its colours: −15 morale and flag recovery stopped.`,3)}
  else if(m.role==='officer'){r.mor-=12;battleInsight(B,`officer-${r.id}`,`${formationName(r)} lost its officer: −12 morale and about 22% less effective fighting.`,3)}
  else if(m.role==='drum'){r.mor-=5;r.drumUntil=0;battleInsight(B,`drum-${r.id}`,`${formationName(r)} lost its drummer: −5 morale, drum recovery and Drum rally stopped.`,3)}}
function cover(B,r,shell){
  let c=r.side===1?(B.terrain==='forest'?.8:B.terrain==='hills'?.85:1)*1:1;
  if(r.side!==1&&isHorse(r.type)&&r.mode==='charge')c*=.8;
  if(isHorse(r.type)&&ordOf(B,r)==='flank')c*=r.flanked?.7:.55;
  if(r.dug)c*=.65;
  if(r.type==='mil'&&(r.dug||r.side===1&&(B.terrain==='forest'||!!B.fortKind)))c*=.8;
  if(!shell&&B.cover&&r.side===1&&inside(B,r.x,r.y))c*=B.cover+(1-B.cover)*(1-B.wallHp/(B.wallMax||1));
  return c;
}
// attacks that land on a unit's side or rear hit harder and shake morale more
function flankMult(a,t){
  const fy=t.side===0?-1:1,dx=a.x-t.x,dy=a.y-t.y,L=Math.hypot(dx,dy)||1,c=dy/L*fy;
  return c>.5?1:c>-.3?1.5:2;
}
function changeFormation(r,form){
  if(!isFoot(r.type)||!['line','column'].includes(form))return;
  if(r.form!==form||r.men.some(m=>m.alive&&Math.hypot(m.x-r.x-m[form==='line'?'l':'c'][0],m.y-r.y-m[form==='line'?'l':'c'][1])>4)){
    r.form=form;r.formT=0;r.formSw=0;r.forming=true;r.formProgress=0;
  }
  for(const m of r.men){const q=form==='line'?m.l:m.c;m.ox=q[0];m.oy=q[1]}
}
function orderFormation(r,form){r.formOrder=form;r.goal=null;r.bayonet=false;changeFormation(r,form)}
function ordOf(B,r){return r.ord||B.orders[r.side][grp(r.type)]}
function pickTarget(B,r){
  if(r.forced&&r.forced.n)return r.forced;
  if(isFoot(r.type)&&ordOf(B,r)==='ready'){
    const inRange=B.regs.filter(e=>e.side!==r.side&&e.n&&e.type!=='gen'&&Math.hypot(e.x-r.x,e.y-r.y)<=firingRange(r)&&!masked(B,r,e));
    if(inRange.length)return inRange.sort((a,b)=>Math.hypot(a.x-r.x,a.y-r.y)-Math.hypot(b.x-r.x,b.y-r.y))[0];
  }
  if(isHorse(r.type)&&ordOf(B,r)==='flank'){if(!r.flanked&&r.target&&r.target.n&&isFoot(r.target.type))return r.target;
    let best=null,dist=1e9;for(const e of B.regs)if(e.side!==r.side&&e.n&&isFoot(e.type)){const d=Math.hypot(e.x-r.x,e.y-r.y);if(d<dist){best=e;dist=d}}if(best)return best}
  const counter=isGun(r.type)&&ordOf(B,r)==='counter',linear=isFoot(r.type)&&['stand','advance','hold','dig'].includes(ordOf(B,r))&&!r.goal;
  if(linear){let best=null,bs=1e9;for(const e of B.regs){if(e.side===r.side||!e.n||e.type==='gen'||!isFoot(e.type))continue;const sc=Math.abs(e.x-r.x)*2+Math.abs(e.y-r.y)*(e.broken?2.5:1);if(sc<bs){bs=sc;best=e}}
    if(best&&Math.abs(best.y-r.y)<firingRange(r)*2.2)return best}
  let best=null,bs=1e9;
  for(const e of B.regs){if(e.side===r.side||!e.n||e.type==='gen')continue;
    const s=Math.hypot(e.x-r.x,e.y-r.y)*(counter&&isGun(e.type)?.25:PREF[r.type][e.type])*(e.broken?2.5:1);if(s<bs){bs=s;best=e}}
  return best;
}
function riverSlow(B,r){return B.river&&r.y>B.river-18&&r.y<B.river+18?.45:1}
function moveToward(B,r,tx,ty,sp,dt,stop){
  const walled=B.fortKind&&r.type!=='gen'&&!r.gar;
  if(walled&&inside(B,r.x,r.y)!==inside(B,tx,ty)){const br=nearestBreach(B,r.x,r.y);if(br&&Math.hypot(br.x-r.x,br.y-r.y)>5){tx=br.x;ty=br.y;stop=0}}
  const dx=tx-r.x,dy=ty-r.y,d=Math.hypot(dx,dy);if(d<=stop)return true;
  const s=Math.min(sp*riverSlow(B,r)*(1-r.fat*.003)*(isFoot(r.type)?(r.form==='column'?1.15:.85):1)*dt,d-stop),nx=r.x+dx/d*s,ny=r.y+dy/d*s;
  if(walled&&inside(B,nx,ny)!==inside(B,r.x,r.y)&&!nearBreach(B,nx,ny,16)){r.atWall=true;return false}
  r.x=nx;r.y=ny;r.moving=true;return false}
function strike(B,a,b,dt){
  const fm=a.flanked&&isHorse(a.type)?Math.max(2.4,flankMult(a,b)):flankMult(a,b),rate=eff(B,a)*BT.melee*dt*MELEE[a.type][b.type]*fm*Math.sqrt(cover(B,b))*bayonetMeleeFactor(B,a,b);
  if(isHorse(a.type)&&bayonetBraced(B,b)&&flankMult(a,b)===1)battleInsight(B,`bayonet-brace-${b.id}`,`${formationName(b)} met cavalry frontally with fixed bayonets: 40% fewer cavalry melee hits while the line held.`,3);
  for(const m of a.men)if(m.alive&&Math.random()<rate){const v=rndAlive(b);if(v){kill(B,v,fm,{reg:a,kind:'melee',flank:fm});if(B.fx&&Math.random()<.3)B.fx.spark(v.x,v.y)}}
}
function melee(B,r,tg,dt){const key=r.id<tg.id?r.id+'-'+tg.id:tg.id+'-'+r.id;if(B.pairs.has(key))return;B.pairs.add(key);r.melee=tg.melee=true;
  if(isFoot(r.type))r.bayonet=true;if(isFoot(tg.type))tg.bayonet=true;r.dug=tg.dug=false;strike(B,r,tg,dt);strike(B,tg,r,dt)}
function volley(B,r,tg,d,range,base,ranks,only){
  const fm=flankMult(r,tg),p=eff(B,r)*base*(1.6-d/range)*cover(B,tg)*fm*(isHorse(tg.type)&&isFoot(r.type)?1.6:1)*(isGun(tg.type)?.3:1)*(r.type==='mil'?.38:1);
  let k=0;for(const m of r.men){if(!m.alive||m.rank>ranks||(only!=null&&m.rank!==only))continue;m.shotT=B.t;if(B.fx)B.fx.shot(m,r.side,k++%2===0);if(Math.random()<p){const v=rndAlive(tg);if(v)kill(B,v,fm,{reg:r,kind:'musket',flank:fm})}}
  if(k&&B.fx&&B.fx.volley)B.fx.volley(r,k);
  r.fat=Math.min(100,r.fat+2);r.fired=true;if(isFoot(r.type))B.lastVolley=B.t;
}
function masked(B,r,tg){for(const o of B.regs){if(o===r||o.side!==r.side||!o.n||o.type==='gen'||isGun(o.type)||o.broken)continue;
    if((o.y-r.y)*(tg.y-r.y)>0&&Math.abs(o.y-r.y)>12&&Math.abs(o.y-r.y)<Math.abs(tg.y-r.y)-10&&Math.abs(o.x-r.x)<42)return true}return false}
function lineFactor(B,r){const back=r.side===0?1:-1;let s=0,k=0;for(const o of B.regs)if(o.side===r.side&&o.n&&isFoot(o.type)&&!o.broken&&!o.gar&&o.row===r.row){s+=o.y;k++}
  if(k<2)return 1;const ahead=(s/k-r.y)*back;return ahead>8?.25:ahead>3?.6:ahead<-6?1.25:1}
function waypoint(r,tg,w){const out=tg.x<FW/2?-1:1;return{x:clamp(tg.x+out*w,14,FW-14),y:tg.y}}
function foot(B,r,tg,d,dt){
  const o=ordOf(B,r);let cavNear=false;
  if(r.goal){if(moveToward(B,r,r.goal.x,r.goal.y,BT.infSpeed,dt,4)){r.goal=null;r.ord='hold'}}
  else{
    if(d<22){melee(B,r,tg,dt);return}
    if(o!=='ready'&&o!=='hold'&&o!=='dig'&&o!=='stand'&&!isGun(tg.type)){const gun=B.regs.find(e=>e.side!==r.side&&e.n&&isGun(e.type)&&Math.hypot(e.x-r.x,e.y-r.y)<95);if(gun&&!r.gar){r.target=tg=gun;d=Math.hypot(gun.x-r.x,gun.y-r.y)}}
    cavNear=B.regs.some(e=>e.side!==r.side&&e.n&&isHorse(e.type)&&e.mode==='charge'&&Math.hypot(e.x-r.x,e.y-r.y)<70);
    const deploying=(r.forming||r.form==='line'&&r.formT<2.6)&&o!=='charge'&&!r.bayonet;
    if(!r.gar&&!cavNear&&o!=='stand'&&o!=='ready'&&!deploying){
      if(o==='charge'||(isGun(tg.type)&&d<95&&o!=='hold'&&o!=='dig')){moveToward(B,r,tg.x,tg.y,BT.infSpeed*1.7,dt,18);r.bayonet=true}
      else if(o==='advance'){const dy=Math.abs(tg.y-r.y);
        if(d<45||(B.t>90&&dy<firingRange(r)*.7))moveToward(B,r,tg.x,tg.y,BT.infSpeed*1.8,dt,18);
        else if(dy>firingRange(r)*(B.t>60?.62:.88))moveToward(B,r,r.x+clamp(tg.x-r.x,-20,20),tg.y,BT.infSpeed*lineFactor(B,r),dt,firingRange(r)*(B.t>60?.62:.88))}
      else if(o==='flank'){if(!r.flanked){const w=waypoint(r,tg,90);if(moveToward(B,r,w.x,w.y,BT.infSpeed*1.2,dt,20))r.flanked=true}
        else if(d<60)moveToward(B,r,tg.x,tg.y,BT.infSpeed*1.8,dt,18);else if(d>firingRange(r)*.7)moveToward(B,r,tg.x,tg.y,BT.infSpeed,dt,firingRange(r)*.7)}
      else if(o==='hold'&&d>firingRange(r)*.9){if(Math.abs(tg.x-r.x)>30)moveToward(B,r,tg.x,r.y,BT.infSpeed,dt,0);else if(B.t>35&&!r.ord)moveToward(B,r,tg.x,tg.y,BT.infSpeed,dt,firingRange(r)*.8)}
      else if(o==='dig'&&!r.dug){r.digT+=dt;if(r.digT>8){r.dug=true;if(B.fx)B.fx.dig(r)}return}
    }
  }
  r.reload-=dt*(1-r.fat*.004);
  if(d<=firingRange(r)&&r.reload<=0&&r.form!=='column'&&masked(B,r,tg))r.maskedSeconds=(r.maskedSeconds||0)+dt;
  if(d<=firingRange(r)&&r.reload<=0&&!masked(B,r,tg)&&(r.form!=='column')&&!r.forming&&(!r.form||r.formT>2.6)){const rk=(r.rankTurn=((r.rankTurn||0)+1)%3);volley(B,r,tg,d,firingRange(r),BT.infHit*1.33,2,rk);r.reload=BT.infReload*.5*(.9+Math.random()*.2)*(cavNear&&isHorse(tg.type)?.7:1)}
}
function horse(B,r,tg,d,dt){
  let o=ordOf(B,r);
  if(r.goal){if(moveToward(B,r,r.goal.x,r.goal.y,BT.cavSpeed*.6,dt,4)){r.goal=null;r.ord='wait'}return}
  if(o==='auto'){
    if(r.mode!=='charge'){const isP=B.player===r.side,near=B.regs.some(e=>e.side!==r.side&&e.n&&e.type!=='gen'&&Math.hypot(e.x-r.x,e.y-r.y)<(r.side===1?165:170));
      if(near||(isP?B.t>20:(r.side===0?B.t>8:B.t>18||B.regs.some(e=>e.side===0&&isHorse(e.type)&&e.mode==='charge'&&e.n)||(B.t>14&&B.regs.some(e=>e.side===0&&isGun(e.type)&&e.n)))))r.mode='charge';else return}
    o='charge';
  }
  if(o==='wait'){r.mode='wait';return}
  if(o==='charge'){r.mode='charge';if(d<20){melee(B,r,tg,dt);return}moveToward(B,r,tg.x,tg.y,BT.cavSpeed*(r.type==='hus'?1.2:1),dt,16);return}
  if(o==='flank'){if(!r.flanked){r.mode='wait';if(!r.flankPoint||r.flankTarget!==tg.id){const w=waypoint(r,tg,100);r.flankPoint={x:w.x,y:(r.y+tg.y)/2};r.flankTarget=tg.id}
      if(moveToward(B,r,r.flankPoint.x,r.flankPoint.y,BT.cavSpeed*2.1,dt,12)||Math.hypot(r.x-r.flankPoint.x,r.y-r.flankPoint.y)<12.1)r.flanked=true;return}
    r.mode='charge';if(d<20){melee(B,r,tg,dt);return}moveToward(B,r,tg.x,tg.y,BT.cavSpeed*(r.type==='hus'?1.2:1),dt,16);return}
  if(o==='shoot'){r.mode='wait';const R=firingRange(r);
    if(d<24){melee(B,r,tg,dt);return}
    if(d>R*.9)moveToward(B,r,tg.x,tg.y,BT.cavSpeed*.5,dt,R*.8);
    r.reload-=dt;if(d<=R&&r.reload<=0){volley(B,r,tg,d,R,r.type==='cav'?.07:.05,1);r.reload=3.2}}
}
function wallPoint(B,from){
  if(B.fortKind==='capital')return{x:clamp(from.x,48,352),y:210};
  const R=B.fortKind==='palisade'?96:100,cx=200,cy=B.fortKind==='palisade'?125:120,a=Math.atan2(from.y-cy,from.x-cx);
  return{x:cx+Math.cos(a)*R,y:cy+Math.sin(a)*R};
}
function aimAt(B,r,g,tg){
  if(ordOf(B,r)==='walls'&&B.wallHp>0&&r.side===0){const w=wallPoint(B,g);return{x:w.x+(Math.random()-.5)*16,y:w.y+(Math.random()-.5)*8}}
  const v=rndAlive(tg);return v?{x:v.x+(Math.random()-.5)*20,y:v.y+(Math.random()-.5)*20}:null;
}
function guns(B,r,tg,d,dt){
  if(r.goal){if(r.type==='how'&&r.hs!=='limber'){if(r.hs!=='pack'){r.hs='pack';r.ht=3}r.ht-=dt;if(r.ht<=0)r.hs='limber';return}
    if(moveToward(B,r,r.goal.x,r.goal.y,r.type==='how'?6:4,dt,4)){r.goal=null;if(r.type==='how'){r.hs='deploy';r.ht=5}}return}
  if(r.type==='how')return howitzer(B,r,tg,d,dt);
  if(!r.gar&&r.side===0&&d>BT.artRange*.9&&ordOf(B,r)!=='stand')moveToward(B,r,tg.x,tg.y,4,dt,BT.artRange*.85);
  if(d<22)melee(B,r,tg,dt);
  for(const g of r.men){if(!g.alive||g.role)continue;const crew=g.crew.filter(c=>c.alive).length;if(!crew)continue;g.cd-=dt*(1-r.fat*.003)*(.35+.65*crew/3);if(g.cd>0)continue;
    const dd=Math.hypot(tg.x-g.x,tg.y-g.y),walls=ordOf(B,r)==='walls'&&B.wallHp>0&&r.side===0;
    if(dd<=BT.canRange&&!walls){let quota=Math.round(5*eff(B,r)+Math.random()*2);
      for(const e of B.regs){if(quota<=0)break;if(e.side===r.side||!e.n||Math.hypot(e.x-g.x,e.y-g.y)>BT.canRange*1.6)continue;
        const fm=flankMult(r,e),pk=eff(B,r)*BT.canHit*cover(B,e)*fm*(isHorse(e.type)?.55:1),ax=tg.x-g.x,ay=tg.y-g.y,al=Math.hypot(ax,ay)||1;
        for(const m of targets(e)){if(!m.alive)continue;const dx=m.x-g.x,dy=m.y-g.y,dl=Math.hypot(dx,dy);if(dl>BT.canRange*1.15||(dx*ax+dy*ay)/(dl*al||1)<.9)continue;if(quota>0&&Math.random()<pk){kill(B,m,fm,{reg:r,kind:'canister',flank:fm});quota--}}}
      g.shotT=B.t;if(B.fx)B.fx.cannon(g,r.side,true,tg);g.cd=BT.artReload*.8;r.fired=true;
    }else if(dd<=BT.artRange||walls){
      const aim=aimAt(B,r,g,tg);if(!aim)continue;const L=Math.hypot(aim.x-g.x,aim.y-g.y)||1;if(L>BT.artRange)continue;
      B.balls.push({x:g.x,y:g.y,dx:(aim.x-g.x)/L,dy:(aim.y-g.y)/L,fly:L,L,roll:BT.bounce,side:r.side,reg:r,hit:new Set(),bnc:0});
      g.shotT=B.t;if(B.fx)B.fx.cannon(g,r.side,false);g.cd=BT.artReload*(.85+Math.random()*.3);r.fired=true;
    }
  }
}
// howitzers travel limbered on a wagon, must unlimber (deploy) before firing, and lob shells that burst behind walls
function howitzer(B,r,tg,d,dt){
  const walls=ordOf(B,r)==='walls'&&B.wallHp>0&&r.side===0,aimD=walls?Math.hypot(wallPoint(B,r).x-r.x,wallPoint(B,r).y-r.y):d;
  if(r.hs==='limber'){if(ordOf(B,r)==='stand'&&aimD>BT.howRange)return;if(aimD>BT.howRange*.9)moveToward(B,r,tg.x,tg.y,6,dt,BT.howRange*.85);else{r.hs='deploy';r.ht=5;if(B.fx)B.fx.banner(`${r.label} unlimber`)}return}
  if(r.hs==='deploy'){r.ht-=dt;if(r.ht<=0){r.hs='ready';battleEvent(B,`${r.label}: deployed and ready`)};return}
  if(r.hs==='pack'){r.ht-=dt;if(r.ht<=0)r.hs='limber';return}
  if(aimD>BT.howRange*1.05&&!r.gar&&r.side===0&&ordOf(B,r)!=='stand'){r.hs='pack';r.ht=3;return}
  for(const g of r.men){if(!g.alive||g.role)continue;const crew=g.crew.filter(c=>c.alive).length;if(!crew)continue;g.cd-=dt*(1-r.fat*.003)*(.35+.65*crew/3);if(g.cd>0)continue;
    const aim=aimAt(B,r,g,tg);if(!aim)continue;const L=Math.hypot(aim.x-g.x,aim.y-g.y)||1;
    B.shells.push({x:g.x,y:g.y,sx:g.x,sy:g.y,tx:aim.x,ty:aim.y,L,pr:0,side:r.side,reg:r,e:eff(B,r)});
    g.shotT=B.t;if(B.fx){B.fx.cannon(g,r.side,false);if(B.fx.whistle)B.fx.whistle()}g.cd=BT.howReload*(.85+Math.random()*.3);r.fired=true;
  }
}
function ballHits(B,b,rad,p){
  for(const r of B.regs){if(r.side===b.side||!r.n||Math.abs(r.x-b.x)>90||Math.abs(r.y-b.y)>40)continue;const c=cover(B,r);
    for(const m of targets(r))if(m.alive&&!b.hit.has(m)&&Math.abs(m.x-b.x)<rad&&Math.abs(m.y-b.y)<rad){b.hit.add(m);if(Math.random()<p*c)kill(B,m,1,{reg:b.reg,kind:'roundshot',flank:1})}}
}
function nearWall(B,x,y){
  if(B.fortKind==='fort'){const d=Math.hypot(x-200,y-120);return d>76&&d<126}
  if(B.fortKind==='palisade'){const d=Math.hypot(x-200,y-125);return d>84&&d<108}
  return(Math.abs(y-210)<12&&x>28&&x<372)||(Math.abs(y-30)<12&&x>28&&x<372)||((Math.abs(x-40)<12||Math.abs(x-360)<12)&&y>20&&y<220);
}
// fort walls: sections that must be shot open; troops cross only through a breach
function inside(B,x,y){const k=B.fortKind;return k==='fort'?Math.hypot(x-200,y-120)<97:k==='palisade'?Math.hypot(x-200,y-125)<95:k==='capital'?x>40&&x<360&&y>30&&y<210:false}
function segOf(B,x,y){
  if(B.fortKind==='capital'){const d=[Math.abs(y-210),Math.abs(y-30),Math.abs(x-40),Math.abs(x-360)],side=d.indexOf(Math.min(...d));
    return side===0?clamp(Math.floor((x-40)/40),0,7):side===1?8+clamp(Math.floor((x-40)/40),0,7):side===2?16+clamp(Math.floor((y-30)/45),0,3):20+clamp(Math.floor((y-30)/45),0,3)}
  const cy=B.fortKind==='palisade'?125:120;return Math.floor((Math.atan2(y-cy,x-200)+Math.PI)/(Math.PI*2)*12)%12}
function segPoint(B,i){
  if(B.fortKind==='capital'){if(i<8)return{x:60+i*40,y:210};if(i<16)return{x:60+(i-8)*40,y:30};if(i<20)return{x:40,y:52+(i-16)*45};return{x:360,y:52+(i-20)*45}}
  const cy=B.fortKind==='palisade'?125:120,R=B.fortKind==='palisade'?96:100,a=(i+.5)/12*Math.PI*2-Math.PI;return{x:200+Math.cos(a)*R,y:cy+Math.sin(a)*R}}
function damageWall(B,x,y,dmg){
  if(!B.seg)return;const i=segOf(B,x,y);if(B.seg[i]<=0)return;B.seg[i]=Math.max(0,B.seg[i]-dmg);
  B.wallHp=B.seg.reduce((a,b)=>a+b,0)/(B.seg.length*B.segHp)*B.wallMax;
  if(B.seg[i]<=0){const p=segPoint(B,i);B.breaches.push({i,x:p.x,y:p.y});battleInsight(B,`breach-${i}`,'A wall breach opened: troops can cross this gap; wall cover also weakens as walls take damage.',4);if(B.fx){B.fx.breach(p.x,p.y,true);if(B.fx.breachOpen)B.fx.breachOpen(p.x,p.y,B.fortKind);B.fx.banner('The wall is breached!')}}
}
const nearBreach=(B,x,y,rad)=>B.breaches.some(b=>Math.hypot(b.x-x,b.y-y)<rad);
function nearestBreach(B,x,y){let best=null,bd=1e9;for(const b of B.breaches){const d=Math.hypot(b.x-x,b.y-y);if(d<bd){bd=d;best=b}}return best}
function aiCommand(B,side){
  const O=B.orders[side],foe=1-side,ms=sideStr(B,side),ts=sideStr(B,foe);
  if(!ms||!ts||B.routing>=0)return;
  if(B.t>50&&ms<B.start[side]*.42&&ms<ts*.55){rout(B,side,`${sideName(side)} ordered a retreat after falling below 42% of their starting steady strength and 55% of the enemy’s remaining strength.`);if(B.fx)B.fx.banner(`${side?'The defenders':'The attackers'} sound the retreat`);return}
  const siege=side===0&&B.fortKind;
  if(siege){const open=B.breaches.length>0;O.guns=open?'fire':'walls';O.foot=open?'charge':(B.t>BT.limit*.85?'advance':'stand');O.horse=open?'auto':'wait';return}
  const engaged=B.t-(B.lastVolley||-99)<4&&(B.fireT||0)>8;
  const foeHorseLoose=B.regs.some(r=>r.side===foe&&r.n&&isHorse(r.type)&&r.mode==='charge');
  if(engaged&&!foeHorseLoose&&O.horse!=='flank')O.horse='flank';
  else if(foeHorseLoose&&O.horse==='flank')O.horse='auto';
  if(B.regs.some(r=>r.side===side&&r.n&&r.type==='how'))O.guns='fire';
}
// A small, bounded personal-space correction prevents ranks merging during turns.
// Spatial buckets keep this linear in normal formations, including large battles.
function separateRanks(B,dt){
  const grid=new Map(),cell=16;
  for(const r of B.regs)if(!isGun(r.type))for(const m of r.men)if(m.alive){
    const bx=Math.floor(m.x/cell),by=Math.floor(m.y/cell),radius=isHorse(r.type)||r.type==='gen'?6.5:4.3;
    for(let y=by-1;y<=by+1;y++)for(let x=bx-1;x<=bx+1;x++)for(const other of grid.get(`${r.side}:${x}:${y}`)||[]){
      const n=other.m,dx=m.x-n.x,dy=m.y-n.y,d=Math.hypot(dx,dy),gap=radius+other.radius;
      if(d>=gap)continue;const ux=d>.001?dx/d:1,uy=d>.001?dy/d:0,push=Math.min((gap-d)*.5,dt*3);
      m.x+=ux*push;m.y+=uy*push;n.x-=ux*push;n.y-=uy*push;
    }
    const key=`${r.side}:${Math.floor(m.x/cell)}:${Math.floor(m.y/cell)}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push({m,radius});
  }
}
function rout(B,s,reason){if(B.routing<0){B.routing=s;B.loser=s;B.endReason=reason||`${sideName(s)} withdrew from the field.`;if(B.fx)B.fx.rout(s)}}
function stepBattle(B,dt){
  B.t+=dt;B.pairs=new Set();
  for(const r of B.regs)for(const m of r.men){m.px=m.x;m.py=m.y}
  if(B.t-(B.lastVolley||-99)<4)B.fireT=(B.fireT||0)+dt;
  if((B.cmdT=(B.cmdT||0)-dt)<=0){B.cmdT=2;for(const sd of[0,1])if(B.player!==sd)aiCommand(B,sd)}
  if(B.t>12&&B.player!==1&&!B.fortKind&&B.orders[1].foot==='hold'&&!B.aiMet&&B.regs.some(r=>r.side===1&&r.n&&(isHorse(r.type)||isGun(r.type))&&!r.gar)){B.aiMet=true;B.orders[1].foot='advance';if(B.fx)B.fx.banner('The defenders advance to meet the attack')}
  for(const r of B.regs){r.moving=false;r.melee=false;r.fired=false;r.atWall=false;r.bayonet=r.bayonet&&r.n>0&&ordOf(B,r)!=='hold'&&r.target&&Math.hypot(r.target.x-r.x,r.target.y-r.y)<70}
  for(const r of B.regs){if(!r.n)continue;const back=r.side===0?1:-1;
    if(r.fixUntil&&(r.broken||B.routing===r.side))r.fixUntil=0;
    if(B.routing===r.side){r.y+=back*22*dt;r.moving=true;continue}
    const G=inAura(B,r);
    if(r.drummer?.alive&&!r.broken&&r.drumUntil>B.t-dt){const gain=Math.max(0,Math.min(100-r.mor,2*(Math.min(B.t,r.drumUntil)-(B.t-dt))));r.mor+=gain;r.drumGained+=gain}
    finishDrumRally(B,r);
    if(B.player!==r.side&&r.mor<55)drumRally(B,r);
    r.mor=Math.min(100,r.mor+dt*((r.flagman&&r.flagman.alive?.5:0)+(r.drummer&&r.drummer.alive?.8:0)+(G?G.rec:0)+(r.broken?.8:0)+(r.dug?.3:0)));
    if(r.type==='gen'){if(B.player===r.side&&B.orders[r.side].foot==='stand'&&!B.regs.some(o=>o.side===r.side&&isFoot(o.type)&&(o.goal||o.ord&&o.ord!=='stand')))continue;
      let sx=0,sy=0,k=0;for(const o of B.regs)if(o.side===r.side&&o.n&&!o.broken&&o.type!=='gen'&&!isHorse(o.type)){sx+=o.x;sy+=o.y;k++}
      if(k)moveToward(B,r,sx/k,sy/k+48*back,12,dt,4);continue}
    if(!r.warned&&r.mor<30){r.warned=true;battleInsight(B,`wavering-${r.id}`,`${formationName(r)} fell below 30 morale: fighting efficiency reduced by 40%.`,2)}
    if(!r.broken&&r.mor<8){r.broken=true;r.target=null;r.dug=false;battleInsight(B,`break-${r.id}`,`${formationName(r)} broke below 8 morale and stopped contributing steady combat strength.`,4)}
    if(r.fixUntil&&r.broken)r.fixUntil=0;
    if(r.broken){if(r.mor>45){r.broken=false;if(B.fx)B.fx.banner(`${r.label} regains its courage!`)}else{if(r.y>10&&r.y<FH-10)r.y+=back*20*dt;r.moving=true;continue}}
    if(!r.target||!r.target.n||(r.retarget-=dt)<=0||(r.forced&&r.target!==r.forced)){r.target=pickTarget(B,r);r.retarget=1.5}
    const tg=r.target;if(!tg)continue;
    const d=Math.hypot(tg.x-r.x,tg.y-r.y);
    if(r.fixUntil){if(d<28){r.fixUntil=0;battleEvent(B,`${r.label}: bayonet preparation interrupted by the enemy.`)}
      else if(B.t>=r.fixUntil){r.fixUntil=0;r.bayonetsFixed=true;battleEvent(B,`${r.label}: bayonets fixed — ready to charge or hold against cavalry.`)}
      else continue}
    if(B.player!==r.side&&isFoot(r.type)&&!r.bayonetsFixed&&(ordOf(B,r)==='charge'||B.regs.some(e=>e.side!==r.side&&e.n&&isHorse(e.type)&&Math.hypot(e.x-r.x,e.y-r.y)<130))&&fixBayonets(B,r,false))continue;

    if(drumming(B,r)&&d>=28)continue;
    if(drumming(B,r)){r.drumUntil=B.t;finishDrumRally(B,r)}
    if(isFoot(r.type))foot(B,r,tg,d,dt);else if(isHorse(r.type))horse(B,r,tg,d,dt);else guns(B,r,tg,d,dt);
  }
  for(const r of B.regs){
    if(isFoot(r.type)&&r.men[0]&&r.men[0].l){
      const far=!r.target||Math.hypot(r.target.x-r.x,r.target.y-r.y)>firingRange(r)*1.3,want=r.formOrder||(ordOf(B,r)==='ready'?'line':r.forming?r.form:r.moving&&!r.gar&&!r.bayonet&&!r.melee&&!r.broken&&far?'column':'line');
      if(want!==r.form){r.formSw+=dt;if(r.formSw>(want==='line'?.4:1)){changeFormation(r,want)}}else r.formSw=0;
      r.formT+=dt;for(const m of r.men){const q=r.form==='column'?m.c:m.l;m.ox=q[0];m.oy=q[1]}}
    if(r.moving&&r.dug){r.dug=false;r.digT=0}
    const load=r.melee?10:r.moving?(isHorse(r.type)&&r.mode==='charge'?6:r.bayonet?4:1.2):r.fired?.3:-3;
    r.fat=clamp(r.fat+load*dt,0,100);
    if(r.type!=='gen'&&r.fat>=60&&(r.melee||r.fired))battleInsight(B,`fatigue-${r.id}`,`${formationName(r)} fought with high fatigue: fighting efficiency was reduced by ${Math.round(r.fat*.4)}% at that moment. Resting out of melee restores fatigue.`,3);
    for(const m of r.men){if(!m.alive)continue;let tx=r.x+m.ox,ty=r.y+m.oy;if(r.melee){const phase=B.t*2.8+m.rank*1.9+m.ox*.43;tx+=Math.sin(phase)*1.8;ty+=Math.cos(phase*.83)*1.4}
      if(r.broken){tx+=Math.sin(m.ox*1.37+m.rank)*12;ty+=Math.cos(m.ox*.67+m.rank)*8}
      if(isFoot(r.type)&&r.form&&(r.forming||r.formT<4)&&!r.melee&&!r.broken){const dx=tx-m.x,dy=ty-m.y,dd=Math.hypot(dx,dy),st=Math.min(dd,dt*(BT.infSpeed*1.7+(r.moving?BT.infSpeed:0)));if(dd>.01){m.x+=dx/dd*st;m.y+=dy/dd*st}}
      else{const k=1-Math.exp(-dt*(isHorse(r.type)?4:2.4));m.x+=(tx-m.x)*k;m.y+=(ty-m.y)*k}
      const dist=Math.hypot(m.x-m.px,m.y-m.py);m.gait=(m.gait||0)+dist*(isHorse(r.type)?.65:1.8);m.walk+=(Math.min(1,dist/dt*.5)-m.walk)*(1-Math.exp(-dt*8))}
    if(r.forming){const live=r.men.filter(m=>m.alive);r.formProgress=live.length?live.filter(m=>Math.hypot(m.x-r.x-m.ox,m.y-r.y-m.oy)<4).length/live.length:1;
      if(r.melee||r.broken||r.formT>=2.6&&r.formProgress>=.9)r.forming=false}
    for(const c of r.crews)if(c.alive){c.x=c.gun.x+c.ox;c.y=c.gun.y+c.oy}
  }
  separateRanks(B,dt);
  for(const b of B.balls){const s=BT.ballSpeed*dt;b.x+=b.dx*s;b.y+=b.dy*s;
    if(b.fly>0){b.fly-=s;if(b.fly<=0){if(B.fx)B.fx.dust(b.x,b.y,true);ballHits(B,b,6,.9);
      if(B.wallHp>0&&b.side===0&&nearWall(B,b.x,b.y)){damageWall(B,b.x,b.y,B.fortKind==='palisade'?3:B.fortKind==='fort'?1.2:1.8);b.roll=0;if(B.fx)B.fx.breach(b.x,b.y,false)}}}
    else{b.roll-=s;b.bnc+=s;if(b.bnc>28){b.bnc=0;if(B.fx)B.fx.dust(b.x,b.y,false)}ballHits(B,b,3.5,.85)}}
  B.balls=B.balls.filter(b=>b.fly>0||b.roll>0);
  for(const sh of B.shells){sh.pr+=BT.shellSpeed*dt/sh.L;sh.x=sh.sx+(sh.tx-sh.sx)*Math.min(1,sh.pr);sh.y=sh.sy+(sh.ty-sh.sy)*Math.min(1,sh.pr);
    if(sh.pr>=1){sh.done=true;if(B.fx)B.fx.shell(sh.tx,sh.ty);
      for(const r of B.regs){if(r.side===sh.side||!r.n||Math.abs(r.x-sh.tx)>80||Math.abs(r.y-sh.ty)>50)continue;const c=cover(B,r,true);
        for(const m of targets(r))if(m.alive&&Math.hypot(m.x-sh.tx,m.y-sh.ty)<BT.shellR&&Math.random()<.45*c*sh.e)kill(B,m,1.3,{reg:sh.reg,kind:'shell',flank:1,x:sh.tx,y:sh.ty})}
      if(B.wallHp>0&&sh.side===0&&nearWall(B,sh.tx,sh.ty)){damageWall(B,sh.tx,sh.ty,8);
        for(const r of B.regs)if(r.side===1&&r.gar&&isGun(r.type))for(const g of r.men)if(g.alive&&!g.role&&Math.hypot(g.x-sh.tx,g.y-sh.ty)<BT.shellR*1.5)for(let k=0;k<3;k++)kill(B,g,1.2,{reg:sh.reg,kind:'shell',flank:1,x:sh.tx,y:sh.ty});
        if(B.fx)B.fx.breach(sh.tx,sh.ty,true)}}}
  B.shells=B.shells.filter(s=>!s.done);
  if(B.routing<0&&B.t-B.lastChk>.5){B.lastChk=B.t;
    const fa=sideStr(B,0)/(B.start[0]||1),fd=sideStr(B,1)/(B.start[1]||1);
    if(fa<.35)rout(B,0,'Attackers routed: their unbroken combat strength fell below 35% of its starting value.');else if(fd<.35)rout(B,1,'Defenders routed: their unbroken combat strength fell below 35% of its starting value.');else if(B.t>BT.limit){const loser=fa>fd?1:0;rout(B,loser,`Time limit: ${sideName(1-loser).toLowerCase()} held the field with ${Math.round((loser?fa:fd)*100)}% of their original steady strength versus ${Math.round((loser?fd:fa)*100)}%${fa===fd?' (ties favour the defenders)':''}.`) }}
  if(B.routing>=0){B.routT+=dt;
    for(const r of B.regs)if(r.side===B.routing&&r.type!=='gen')for(const m of r.men)if(m.alive&&Math.random()<.05*dt)kill(B,m);
    if(B.routT>4)B.done=true}
}
function runToEnd(B){const max=Math.ceil((Math.max(0,BT.limit-B.t)+10)*30);let n=0;while(!B.done&&n++<max)stepBattle(B,1/30);if(!B.done)throw new Error("Battle failed to resolve");return B}
async function runToEndAsync(B,yieldFrame=()=>new Promise(resolve=>setTimeout(resolve,0))){
  const max=Math.ceil((Math.max(0,BT.limit-B.t)+10)*30);let n=0;
  while(!B.done&&n<max){const until=Date.now()+8;let batch=0;
    do{stepBattle(B,1/30);n++;batch++}while(!B.done&&n<max&&batch<120&&Date.now()<until);
    if(!B.done)await yieldFrame();
  }
  if(!B.done)throw new Error('Battle failed to resolve');return B;
}
function fracType(B,side,t){let a=0,z=0;for(const r of B.regs)if(r.side===side&&r.type===t&&!r.gar){z+=r.hp0;for(const m of r.men)if(operational(m))a+=m.hp}return z?a/z:0}
function battleLosses(B,u,side){
  const lost=zeroU();if(!u)return lost;
  for(const t of UT){if(!u[t])continue;let f=fracType(B,side,t);if(B.loser===side)f*=.85;const keep=Math.round(u[t]*f);lost[t]=u[t]-keep;u[t]=keep}
  if(B.loser!==side&&cnt(u)===0){const t=UT.reduce((b,t)=>lost[t]>lost[b]?t:b,'inf');u[t]=1;lost[t]--}
  return lost;
}
function garLoss(B,g){const l=zeroU();if(!g)return l;for(const r of B.regs)if(r.side===1&&r.gar)for(const m of r.men)if(!operational(m)&&!m.role)l[r.type]++;
  for(const t of['inf','mil'])l[t]=Math.min(g[t]||0,Math.round(l[t]/Math.max(1,menOf(B,t,1))));l.art=Math.min(g.art||0,l.art);return l}
