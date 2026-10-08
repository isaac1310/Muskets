const fs=require('fs'),assert=require('assert'),path=require('path');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>Object.fromEntries(UT.map(t=>[t,0]));
const addU=(a,b)=>Object.fromEntries(UT.map(t=>[t,(a[t]||0)+(b[t]||0)])),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync(path.join(__dirname,'../game/battle.js'),'utf8'));
const B=makeBattle({att:{...zeroU(),inf:6,mil:3,cav:2},def:{...zeroU(),inf:4},terrain:'plains'});
for(const r of B.regs.filter(r=>['inf','mil'].includes(r.type))){const row=r.men.filter(m=>!m.role&&m.rank===0).sort((a,b)=>a.ox-b.ox);for(let i=1;i<row.length;i++)assert(row[i].ox-row[i-1].ox>=6.79);const men=r.men.filter(m=>!m.role);for(const m of men)assert(m.c&&m.l)}
const src=fs.readFileSync(path.join(__dirname,'../game/script.js'),'utf8');
eval(src.slice(src.indexOf('function placeFallen('),src.indexOf('function fxOf(')));
const FW=400,FH=620;const v={dead:[]};for(let i=0;i<20;i++)placeFallen(v,{x:200,y:300,kind:'foot',rot:0});
assert(new Set(v.dead.map(d=>d.x.toFixed(2)+','+d.y.toFixed(2))).size>15);
assert(v.dead.every(d=>Math.hypot(d.x-200,d.y-300)<15));
console.log('Wider infantry spacing, marching offsets, and bounded casualty scatter pass.');
