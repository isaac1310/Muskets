// Battle balance check: node tools/battletune.js [runs]
const fs=require('fs'),path=require('path');
const UT=['mil','inf','cav','hus','art','how'],zeroU=()=>({mil:0,inf:0,cav:0,hus:0,art:0,how:0}),cnt=u=>UT.reduce((s,t)=>s+u[t],0);
const addU=(a,b)=>{const o=zeroU();for(const t of UT)o[t]=(a[t]||0)+(b[t]||0);return o},clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
eval(fs.readFileSync(path.join(__dirname,'../game/battle.js'),'utf8'));
const U=o=>Object.assign(zeroU(),o),N=+(process.argv[2]||80);
const originalRandom=Math.random,seedBase=+(process.env.SEED||1740);
function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function trial(a,d,o={}){let aw=0,t=0;for(let i=0;i<N;i++){Math.random=seeded(seedBase+i);const B=makeBattle({att:U(a),def:U(d),gar:o.gar?U(o.gar):null,terrain:o.terrain||'plains',fortKind:o.fk||'',river:!!o.river,gen:o.gen});
  if(o.player!=null)B.player=o.player;
  if(o.ord)B.orders[0]=Object.assign({},B.orders[0],o.ord);runToEnd(B);if(!B.done)throw Error("Unfinished trial");if(B.loser===1)aw++;t+=B.t}Math.random=originalRandom;const p=aw/N,z=1.96,den=1+z*z/N,mid=(p+z*z/(2*N))/den,half=z*Math.sqrt(p*(1-p)/N+z*z/(4*N*N))/den;return `${aw}/${N} att wins (${Math.round(p*100)}%; 95% interval ${Math.round((mid-half)*100)}–${Math.round((mid+half)*100)}%)  ${Math.round(t/N)}s`}
const cases=[
 ['3 inf vs 10 militia (same gold)',{inf:3},{mil:10}],
 ['12 inf vs 40 militia (same gold)',{inf:12},{mil:40}],
 ['6 inf vs 12 militia (same upkeep)',{inf:6},{mil:12}],
 ['3 inf vs 3 inf, forest',{inf:3},{inf:3},{terrain:'forest'}],
 ['6 inf vs 6 inf, hills',{inf:6},{inf:6},{terrain:'hills'}],
 ['12 inf vs 12 inf, plain',{inf:12},{inf:12}],
 ['8 inf vs 4 cav (inf should win)',{inf:8},{cav:4}],['4 cav vs 3 art (horse should win)',{cav:4},{art:3}],['3 art vs 6 inf (guns should win)',{art:3},{inf:6}],
 ['6 inf vs 6 inf',{inf:6},{inf:6}],['8 inf vs 6 inf (numbers)',{inf:8},{inf:6}],['10 inf vs 6 inf',{inf:10},{inf:6}],
 ['6 inf vs 6 militia',{inf:6},{mil:6}],['6 inf vs 20 militia (same cost)',{inf:6},{mil:20}],
 ['6i2c vs 6i2c, attacker flanks with horse',{inf:6,cav:2},{inf:6,cav:2},{player:0,ord:{horse:'flank'}}],['6i2c vs 6i2c, plain',{inf:6,cav:2},{inf:6,cav:2},{player:0}],
 ['10i2c2a vs 10i2c2a, plain',{inf:10,cav:2,art:2},{inf:10,cav:2,art:2}],
 ['6 inf vs 5 inf, attacker holds and digs',{inf:6},{inf:5},{ord:{foot:'dig'}}],
 ['8i2a vs stone fort 3i+2guns',{inf:8,art:2},{inf:3},{gar:{art:2},fk:'fort'}],['8i2h vs stone fort 3i+2guns, target walls',{inf:8,how:2},{inf:3},{gar:{art:2},fk:'fort',ord:{guns:'walls'}}],
 ['8i2a vs wooden fort 3i+1gun',{inf:8,art:2},{inf:3},{gar:{art:1},fk:'palisade'}],['8i1c1a vs free city 3i3m1a',{inf:8,cav:1,art:1},{},{gar:{inf:3,mil:3,art:1},fk:'capital'}],
 ['6i vs 6i, attacker has lvl-4 general',{inf:6},{inf:6},{gen:[{name:'X',lvl:4},null]}],
 ['big 20i6c4a2h vs 18i8c4a',{inf:20,cav:6,art:4,how:2},{inf:18,cav:8,art:4}],
];
console.log(`Paired seeds ${seedBase}–${seedBase+N-1}; AI on both sides unless a player command is named. Intervals describe sampling uncertainty, not human balance.`);
const filter=process.argv[3];for(const[n,a,d,o]of cases)if(!filter||n.includes(filter))console.log(n.padEnd(46),trial(a,d,o));
