// Wider separation must buy manoeuvre time without breaking reserve placement or approach.
const fs=require('fs'),assert=require('assert');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>Object.fromEntries(UT.map(t=>[t,0])),addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)])),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync(__dirname+'/../game/battle.js','utf8')+'\nvar fieldHeight=FH,footType=isFoot;');
assert.equal(fieldHeight,900);
for(const fortKind of ['', 'fort','palisade','capital'])for(const army of [{inf:1},{inf:10,mil:2,cav:2,art:2,how:1},{inf:20,mil:20,cav:20,hus:20,art:20,how:20}]){
 const B=makeBattle({att:{...zeroU(),...army},def:{...zeroU(),inf:6,cav:2,art:2},terrain:'plains',fortKind});
 const att=B.regs.filter(r=>!r.side),def=B.regs.filter(r=>r.side),a=att.filter(r=>r.type==='inf'),d=def.filter(r=>r.type==='inf');
 assert(Math.min(...a.map(r=>r.y))-Math.max(...d.map(r=>r.y))>=(fortKind?200:300),`Dense gap ${fortKind} ${JSON.stringify(army)}: ${Math.min(...a.map(r=>r.y))-Math.max(...d.map(r=>r.y))}`);
 for(const r of att){for(const m of r.men){assert(m.y>=0&&m.y<900,`${r.type}: figure inside field`);assert.equal(m.y,m.py,'No interpolation jump on first frame')}
 for(const crew of r.crews)assert(Math.abs(crew.y-crew.gun.y)<6,'Crews move with their guns')}
 if(!fortKind&&army.inf===1)assert.equal(a[0].y-d[0].y,450);
 B.player=0;B.cmdT=9999;B.orders[0]={foot:'stand',horse:'wait',guns:'stand'};B.orders[1]={foot:'stand',horse:'wait',guns:'stand'};
 for(const r of att.filter(r=>footType(r.type)))for(const other of att.filter(o=>footType(o.type)&&o.row===r.row+1&&Math.abs(o.x-r.x)<10)){assert(Math.min(...other.men.filter(m=>!m.role).map(m=>m.y))-Math.max(...r.men.filter(m=>!m.role).map(m=>m.y))>=6,'Deep foot reserves keep distinct rows')}
 const strength=[sideStr(B,0),sideStr(B,1)];for(let i=0;i<150;i++)stepBattle(B,1/30);assert.deepEqual([sideStr(B,0),sideStr(B,1)],strength,'No opening volleys across the enlarged gap');
}
const B=makeBattle({att:{...zeroU(),inf:1},def:{...zeroU(),inf:1},terrain:'plains'});B.player=0;B.cmdT=9999;B.orders[0].foot='advance';B.orders[1].foot='stand';const r=B.regs.find(r=>!r.side&&r.type==='inf');let first=0;
for(let i=0;i<7500;i++){stepBattle(B,1/30);if(r.fired){first=B.t;break}}
assert(first>60&&first<240,`Infantry must cross the larger field and still engage: ${first}`);
console.log(`Battle space: 900-pace depth, 450-pace opening lines, dense/siege placement, crew alignment, quiet deployment and infantry engagement at ${Math.round(first)}s pass.`);
