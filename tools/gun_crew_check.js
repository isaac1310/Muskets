// Check that gun crew are separate casualties and that an uncrewed gun cannot fire.
const fs=require('fs'),path=require('path');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>({mil:0,inf:0,cav:0,hus:0,art:0,how:0});
const addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync(path.join(__dirname,'../game/battle.js'),'utf8'));
const B=makeBattle({att:{...zeroU(),art:1,how:1},def:{...zeroU(),inf:2},terrain:'plains'});
const battery=B.regs.find(r=>r.side===0&&r.type==='art'),gun=battery.men.find(m=>!m.role);
if(gun.crew.length!==3||targets(battery).filter(m=>m.role==='crew').length!==3)throw Error('Crew was not deployed as individual targets');
const strength=sideStr(B,0),count=battery.n;
kill(B,gun.crew[0]);
if(gun.crew[0].alive||gun.crew.filter(c=>c.alive).length!==2||battery.n!==count||sideStr(B,0)!==strength)throw Error('Crew casualty changed gun strength or gun count');
gun.cd=0;for(const c of gun.crew)kill(B,c);
if(sideStr(B,0)>=strength)throw Error('Abandoned gun still contributes strength');
const enemy=B.regs.find(r=>r.side===1&&r.type==='inf');
guns(B,battery,enemy,100,1);
if(B.balls.length||gun.shotT!=null)throw Error('Uncrewed gun fired');
for(let i=0;i<gun.hp+6&&gun.alive;i++)kill(B,gun);if(gun.alive||battery.n!==count-1)throw Error('Destroyed gun was not counted');
console.log('Gun crews: individual casualties, strength accounting, and firing stop pass.');
