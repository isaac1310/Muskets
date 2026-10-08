// Verify that a raised hill projects both ground and units and that ground clicks invert it.
const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../game/script.js'),'utf8');
const code=source.slice(source.indexOf('const PK='),source.indexOf('function drawBattle(v)'));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),BV={o:{terrain:'hills'}};
const {P,UP,hillHeight,HILL_Y}=new Function('clamp','FW','FH','BV',code+';return {P,UP,hillHeight,HILL_Y}')(clamp,400,620,BV);
if(hillHeight(200,HILL_Y)<20||hillHeight(0,400)!==0)throw Error('Hill height is not localized');
for(const [x,y] of [[200,HILL_Y],[140,HILL_Y-20],[280,HILL_Y+25],[50,310],[200,400]]){
  const q=P(x,y),back=UP(q[0],q[1]);
  if(Math.hypot(back.x-x,back.y-y)>.3)throw Error(`Hill click projection differs at ${x},${y}: ${JSON.stringify(back)}`);
}
const crest=P(200,HILL_Y)[1];BV.o.terrain='plains';
if(P(200,HILL_Y)[1]-crest<10)throw Error('Hill crest is not visibly elevated');
console.log('Hill elevation and ground click projection pass.');
