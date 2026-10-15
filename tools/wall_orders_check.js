const fs=require('fs'),assert=require('assert');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>Object.fromEntries(UT.map(t=>[t,0])),addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)])),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync(__dirname+'/../game/battle.js','utf8'));
function fixture(kind){const B=makeBattle({att:{...zeroU(),inf:2,art:1},def:{...zeroU(),inf:2,mil:1,cav:1},fortKind:kind,terrain:'plains'});B.player=1;B.cmdT=9999;for(const r of B.regs)r.ord='stand';return B}
for(const kind of ['fort','palisade','capital']){
 const B=fixture(kind),own=B.regs.filter(r=>r.side===1&&['inf','mil'].includes(r.type)),enemy=B.regs.find(r=>!r.side&&r.type==='inf');
 assert(!garrisonWalls(B,enemy));assert(!garrisonWalls(B,B.regs.find(r=>r.type==='cav')));
 const before=own.map(r=>r.men.map(m=>[m.x,m.y]));own.forEach((r,i)=>{assert(garrisonWalls(B,r));assert.deepEqual(r.men.map(m=>[m.x,m.y]),before[i],'Ordering must not teleport figures')});
 assert.equal(new Set(own.map(r=>r.wallPost)).size,own.length);
 for(let i=0;i<5400;i++)stepBattle(B,1/30);
 for(const r of own){assert(r.wallPost!=null);assert(Math.hypot(r.x-r.wallDest.x,r.y-r.wallDest.y)<1,`${kind}: reach wall post ${JSON.stringify({p:[r.x,r.y],dest:r.wallDest,entry:r.wallEntry,at:r.atWall,m:r.moving,fat:r.fat,post:r.wallPost})}`);assert(r.men.every(m=>!m.alive||inside(B,m.x,m.y)),`${kind}: ranks inside wall`);assert(r.manualFace);assert.equal(r.ord,'garrison')}
 const r=own[0],f=frontVector(r);enemy.x=r.x+f.x*60;enemy.y=r.y+f.y*60;r.target=enemy;r.reload=0;r.forming=false;r.formT=99;r.fired=false;foot(B,r,enemy,60,1/30);assert(r.fired,'Wall troops fire outward after settling');
 const post=r.wallPost,p=segPoint(B,post);damageWall(B,p.x,p.y,100);marchToWall(B,r,1/30);assert.equal(r.wallPost,null);assert.equal(r.ord,'stand');assert(r.men.every(m=>!m.wallOffset));
 const second=own[1];orderFormation(second,'column');assert.equal(second.wallPost,null,'New formation releases the wall post');
 const third=own[2];faceFormation(third,third.x+20,third.y);assert.equal(third.wallPost,null,'New facing releases the wall post');
 // A defender coming from outside uses friendly access; this must not open a breach for attackers.
 const C=fixture(kind),reserve=C.regs.find(r=>r.side===1&&r.type==='inf');reserve.x=200;reserve.y=280;for(const m of reserve.men){m.x=m.px=reserve.x+m.ox;m.y=m.py=reserve.y+m.oy}assert(garrisonWalls(C,reserve));
 for(let i=0;i<3600;i++)stepBattle(C,1/30);assert(inside(C,reserve.x,reserve.y),'Outside defenders can enter');assert.equal(C.breaches.length,0);
 const attacker=C.regs.find(r=>!r.side&&r.type==='inf');attacker.x=200;attacker.y=kind==='capital'?212:kind==='palisade'?222:219;const y=attacker.y;moveToward(C,attacker,200,100,20,1,0);assert.equal(attacker.y,y,'Friendly access does not admit attackers');
}
// Exact projectile landings deliver the advertised damage, even when a frame travels farther than the remaining flight.
for(const [kind,hits] of [['palisade',3],['fort',9],['capital',7]]){
 const B=fixture(kind);B.regs=[];const i=kind==='capital'?3:8,p=segPoint(B,i);
 for(let n=0;n<hits;n++){B.balls.push({x:p.x,y:p.y+1,dx:0,dy:-1,fly:1,L:1,roll:90,bnc:0,side:0,hit:new Set()});stepBattle(B,1/30);if(n<hits-1)assert(B.seg[i]>0)}
 assert.equal(B.seg[i],0);assert.equal(B.breaches.filter(b=>b.i===i).length,1);assert.notDeepEqual(wallPoint(B,{x:p.x,y:p.y+100}),p,'Bombardment switches away from breached sections');
}
console.log('Walls: gradual separate posts, outward fire, safe defender entry, attacker blocking, breach/order release and 3/9/7 direct cannon hits for timber/stone/city breaches pass.');

for(const [kind,hits] of [['palisade',2],['fort',3],['capital',3]]){
 const B=fixture(kind);B.regs=[];const i=kind==='capital'?3:8,p=segPoint(B,i);
 for(let n=0;n<hits;n++){B.shells.push({sx:p.x,sy:p.y+1,tx:p.x,ty:p.y,L:1,pr:0,side:0,e:1});stepBattle(B,1/30);if(n<hits-1)assert(B.seg[i]>0)}
 assert.equal(B.seg[i],0);assert.equal(B.breaches.filter(b=>b.i===i).length,1);
}
console.log('Howitzers: 2 direct shell hits breach timber; 3 breach stone or city walls.');

for(const kind of ['palisade','fort','capital']){
 const B=makeBattle({att:{...zeroU(),inf:1,art:1,how:1},def:{...zeroU(),inf:1,art:1},fortKind:kind,terrain:'plains'});B.player=0;
 const infantry=B.regs.find(r=>r.type==='inf'),defGun=B.regs.find(r=>r.side===1&&['art','how'].includes(r.type)),enemy=B.regs.find(r=>r.side===1&&r.type==='inf');
 assert(!orderWallTarget(B,infantry,0));assert(!orderWallTarget(B,defGun,0));
 for(const r of B.regs.filter(r=>r.side===0&&['art','how'].includes(r.type))){
  assert(!orderWallTarget(B,r,-1));assert(!orderWallTarget(B,r,999));assert(orderWallTarget(B,r,2));
  const p=segPoint(B,2),aim=aimAt(B,r,r.men[0],enemy);assert(Math.hypot(p.x-aim.x,p.y-aim.y)<5,'Shots aim at the chosen section, not nearest wall or enemy');
  const before={x:r.x,y:r.y};r.hs='limber';guns(B,r,enemy,1,1);assert(Math.hypot(r.x-before.x,r.y-before.y)>0,'Guns approach distant wall even with nearby enemy target');
  B.seg[2]=0;const balls=B.balls.length,shells=B.shells.length;for(const g of r.men)g.cd=0;r.hs='ready';guns(B,r,enemy,1,1);assert.equal(B.balls.length,balls);assert.equal(B.shells.length,shells);assert.equal(r.wallTarget,2,'Hold fire at the breach instead of silently choosing another wall');
  assert(!orderWallTarget(B,r,2));assert(orderWallTarget(B,r,3));assert.equal(r.wallTarget,3);B.seg[2]=B.segHp;
 }
}
console.log('Chosen wall sections: attacker artillery only, point-specific aim/approach, cease fire on breach and retargeting pass.');
