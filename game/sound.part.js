/* ============ sound: procedural Web Audio, no downloaded files ============ */
const SND={ctx:null,master:null,musicBus:null,fxBus:null,nb:null,musicT:null,step:0,mode:'',last:{},heat:0,heatAt:0,battleState:{paused:true,marching:false,rally:false},
  init(){if(this.ctx||!PREFS.sound||UI.headless)return;try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    const c=this.ctx=new C(),limit=c.createDynamicsCompressor();limit.threshold.value=-18;limit.knee.value=18;limit.ratio.value=3;limit.attack.value=.004;limit.release.value=.22;
    this.master=c.createGain();this.master.connect(limit);limit.connect(c.destination);
    this.musicBus=c.createGain();this.fxBus=c.createGain();const warmth=c.createBiquadFilter();warmth.type='lowpass';warmth.frequency.value=2600;warmth.Q.value=.45;this.musicDuck=c.createGain();this.musicBus.connect(this.musicDuck);this.musicDuck.connect(warmth);warmth.connect(this.master);this.fxBus.connect(this.master);
    this.drumBus=c.createGain();this.drumBus.connect(this.fxBus);
    const len=c.sampleRate*2;this.nb=c.createBuffer(1,len,c.sampleRate);const d=this.nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    // a generated open-field echo: early reflections off woods and walls, then a diffuse tail
    const ir=c.createBuffer(2,Math.round(c.sampleRate*1.8),c.sampleRate);
    for(let ch=0;ch<2;ch++){const o=ir.getChannelData(ch);for(let i=0;i<o.length;i++){const tt=i/c.sampleRate;o[i]=(Math.random()*2-1)*Math.exp(-tt*3.4)*(tt<.03?tt/.03:1)*.55}
      for(const[et,eg]of[[.085+ch*.012,.5],[.16+ch*.02,.34],[.29+ch*.03,.22],[.47,.12]]){const k=Math.round(et*c.sampleRate);for(let j=0;j<240;j++)o[k+j]+=(Math.random()*2-1)*eg*Math.exp(-j/60)}}
    this.verb=c.createConvolver();this.verb.buffer=ir;this.verbSend=c.createGain();this.verbSend.gain.value=.34;this.verbSend.connect(this.verb);this.verb.connect(this.fxBus);
    // gentle saturation gives gunfire its grit
    this.grit=c.createWaveShaper();const cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cv[i]=Math.tanh(x*2.4)}this.grit.curve=cv;this.grit.connect(this.fxBus);this.grit.connect(this.verbSend);
    this.setLevels();
  }catch(e){this.ctx=null;this.master=null;this.musicBus=null;this.fxBus=null}},
  setLevels(){if(!this.ctx)return;const t=this.ctx.currentTime;
    this.master.gain.setTargetAtTime(PREFS.sound?.78:0,t,.025);
    this.musicBus.gain.setTargetAtTime(Math.max(0,Math.min(100,PREFS.musicVol))/100*.52,t,.025);
    this.fxBus.gain.setTargetAtTime(Math.max(0,Math.min(100,PREFS.effectsVol))/100*.86,t,.025)},
  duckMusic(depth=.58){if(!this.ctx)return;const t=this.ctx.currentTime,g=this.musicDuck.gain;
    g.cancelScheduledValues(t);g.setTargetAtTime(depth,t,.018);g.setTargetAtTime(1,t+.4,.3)},
  combatHeat(t){return this.heat*Math.exp(-Math.max(0,t-this.heatAt)/5)},
  combatPulse(amount){if(!this.ctx||this.mode!=='battle')return;const t=this.ctx.currentTime;this.heat=Math.min(1,this.combatHeat(t)+amount);this.heatAt=t},
  syncBattle(v){
    const paused=!v||v.closed||v.paused||v.resolving||v.B.done;
    const state={paused,marching:false,rally:false};
    if(!paused)for(const r of v.B.regs){if(!r.n||r.broken)continue;if(drumming(v.B,r))state.rally=true;if((r.moving||r.forming)&&r.men.some(m=>m.alive&&m.role==='drum'))state.marching=true}
    if(this.ctx&&this.battleState.paused!==paused)this.drumBus.gain.setTargetAtTime(paused?0:1,this.ctx.currentTime,.025);
    this.battleState=state;
  },
  bus(name){return name==='music'?this.musicBus:name==='drum'?this.drumBus:this.fxBus},
  ok(k,gap){if(!this.ctx||!PREFS.sound)return false;const t=performance.now();if(this.last[k]&&t-this.last[k]<gap)return false;this.last[k]=t;if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return true},
  noise(t,dur,type,freq,gain,q=1,bus='fx'){
    const c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.nb;s.loop=true;f.type=type;f.frequency.value=freq;f.Q.value=q;
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.001,gain),t+.006);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    s.connect(f);f.connect(g);g.connect(this.bus(bus));s.start(t,Math.random());s.stop(t+dur+.02)},
  tone(t,freq,dur,type,gain,slide=0,bus='fx',attack=.014){
    const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.001,gain),t+attack);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(g);g.connect(this.bus(bus));o.start(t);o.stop(t+dur+.02)},
  // crisp burst: instant attack, optional stereo position, routed through grit and the echo
  burst(t,dur,type,freq,gain,q=1,pan=0,echo=true){
    const c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.nb;s.loop=true;f.type=type;f.frequency.value=freq;f.Q.value=q;
    g.gain.setValueAtTime(Math.max(.001,gain),t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    let out=g;if(c.createStereoPanner){const pn=c.createStereoPanner();pn.pan.value=Math.max(-1,Math.min(1,pan));g.connect(pn);out=pn}
    s.connect(f);f.connect(g);out.connect(echo?this.grit:this.fxBus);s.start(t,Math.random()*1.5);s.stop(t+dur+.02)},
  thump(t,f0,f1,dur,gain,pan=0){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur*.6);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain,t+.002);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    let out=g;if(c.createStereoPanner){const pn=c.createStereoPanner();pn.pan.value=pan;g.connect(pn);out=pn}o.connect(g);out.connect(this.grit);o.start(t);o.stop(t+dur+.02)},
  cannon(near=1){if(!this.ok('cannon',110))return;this.combatPulse(.22);this.duckMusic(.48);const t=this.ctx.currentTime,k=Math.max(.35,Math.min(1,near)),pan=(Math.random()-.5)*.9;
    this.burst(t,.018,'highpass',2600,.9*k,.7,pan);
    this.burst(t+.002,.05,'bandpass',1500,.55*k,.9,pan);
    this.thump(t,120,38,.75,.95*k,pan);
    this.burst(t+.008,.9,'lowpass',170+120*k,.8*k,.7,pan);
    this.burst(t+.12,1.6,'lowpass',95,.28*k,.5,pan*.5);
    this.burst(t+.38+Math.random()*.15,.7,'lowpass',260,.09*k,.6,-pan*.6)},
  howitzer(near=1,pan=0){if(!this.ok('howitzer',140))return;this.combatPulse(.3);this.duckMusic(.36);const t=this.ctx.currentTime,k=Math.max(.35,Math.min(1,near));
    this.burst(t,.028,'highpass',1700,.7*k,.7,pan);
    this.thump(t,105,27,1.15,1.05*k,pan);this.thump(t+.035,58,24,1.5,.38*k,pan);
    this.burst(t+.006,.48,'bandpass',360,.72*k,.65,pan);
    this.burst(t+.04,1.8,'lowpass',155,.7*k,.6,pan);
    this.burst(t+.32,.9,'lowpass',240,.2*k,.5,-pan*.5)},
  shellWhistle(pan=0){if(!this.ok('shellWhistle',180))return;const t=this.ctx.currentTime;
    this.tone(t,1600,.65,'sine',.065,310);this.tone(t+.03,1080,.57,'triangle',.025,190);
    this.burst(t,.55,'bandpass',1350,.07,5,pan,false)},
  howitzerImpact(near=1,pan=0){if(!this.ok('howitzerImpact',150))return;this.combatPulse(.4);this.duckMusic(.28);const t=this.ctx.currentTime,k=Math.max(.35,Math.min(1,near));
    this.burst(t,.055,'highpass',1200,.92*k,.6,pan);this.thump(t,94,20,1.9,1.1*k,pan);
    this.burst(t+.012,1.5,'bandpass',440,.72*k,.5,pan);this.burst(t+.05,2.5,'lowpass',160,.9*k,.5,pan);
    for(let i=0;i<8;i++)this.burst(t+.1+i*.075,.04+i*.008,'highpass',1800+i*310,.14*k,.8,Math.max(-1,Math.min(1,pan+(i%2?-.4:.4))),false);
    this.burst(t+.45,2.2,'lowpass',90,.3*k,.5,-pan*.4)},
  explosion(k=1){if(!this.ok('explosion',140))return;this.combatPulse(.28);this.duckMusic(.42);const t=this.ctx.currentTime,pan=(Math.random()-.5)*.9;
    this.burst(t,.045,'highpass',1400,1*k,.7,pan);this.thump(t,82,22,1.7,1*k,pan);
    this.burst(t+.006,1.9,'lowpass',260,1*k,.6,pan);this.burst(t+.03,.75,'bandpass',620,.45*k,.5,pan);
    for(let i=0;i<10;i++)this.burst(t+.09+Math.random()*1.1,.03+Math.random()*.05,'highpass',2000+Math.random()*2400,(.12+Math.random()*.16)*k,.9,pan+(Math.random()-.5)*.9);
    this.burst(t+.45,2.4,'lowpass',85,.34*k,.5,0)},
  boom(){if(!this.ok('boom',170))return;this.combatPulse(.2);this.duckMusic(.48);const t=this.ctx.currentTime,pan=(Math.random()-.5)*.8;
    this.burst(t,.03,'highpass',1800,1,.7,pan);this.thump(t,95,28,1.1,1,pan);
    this.burst(t+.01,1.4,'lowpass',230,1,.65,pan);this.burst(t+.05,.5,'bandpass',700,.35,.5,pan);
    for(let i=0;i<5;i++)this.burst(t+.08+Math.random()*.4,.05,'highpass',3000,.18,.8,pan+(Math.random()-.5)*.6);
    this.burst(t+.25,1.5,'lowpass',110,.3,.5,0)},
  musket(pan){if(!this.ok('musket',110))return;this.combatPulse(.035);this.shot(this.ctx.currentTime,pan==null?(Math.random()-.5)*1.2:pan,1)},
  shot(t,pan,g){const j=Math.random(),d=.035+j*.03;
    this.burst(t,.03,'bandpass',3400,.07*g,2.5,pan,false);
    this.burst(t+d,.011,'highpass',3200+j*1500,1.05*g,.6,pan);
    this.burst(t+d+.001,.045,'bandpass',900+j*500,.6*g,.8,pan);
    this.thump(t+d,190+j*60,80,.12,.32*g,pan);
    this.burst(t+d+.02,.28,'lowpass',520,.12*g,.5,pan)},
  volley(n=12){if(!this.ok('volley',220))return;this.combatPulse(.18);this.duckMusic();const t=this.ctx.currentTime,count=Math.min(12,Math.max(4,Math.round(n*.6))),centre=(Math.random()-.5)*.8;
    for(let i=0;i<count;i++)this.shot(t+Math.random()*.32+i*.012,centre+(Math.random()-.5)*.9,.55+Math.random()*.25);
    this.burst(t+.05,.55,'lowpass',380,.22,.5,centre)},
  hooves(){if(!this.ok('hooves',340))return;const t=this.ctx.currentTime;
    for(let i=0;i<4;i++){this.noise(t+i*.075,.065,'lowpass',220+i*35,.11,.7);this.tone(t+i*.075,95+i*8,.06,'triangle',.07,45)}},
  neigh(){if(!this.ok('neigh',9000))return;const t=this.ctx.currentTime;this.tone(t,420,.34,'sawtooth',.025,760);this.tone(t+.3,760,.55,'sawtooth',.022,340)},
  wounded(){if(!this.ok('wounded',2200))return;const t=this.ctx.currentTime;this.tone(t,230,.36,'triangle',.018,125)},
  command(){if(!this.ok('command',900))return;const t=this.ctx.currentTime;
    this.tone(t,185,.13,'sawtooth',.035,155);this.tone(t+.19,220,.16,'sawtooth',.028,176)},
  whistle(){if(!this.ok('whistle',350))return;const t=this.ctx.currentTime;
    this.tone(t,1250,.55,'sine',.04,290);this.noise(t,.5,'bandpass',1100,.035,7)},
  ambience(){if(!this.ok('ambience',3000))return;const t=this.ctx.currentTime;
    this.noise(t,2.7,'lowpass',180,.018,.35);this.noise(t+.2,1.9,'bandpass',680,.012,.3)},
  clash(){if(!this.ok('clash',95))return;const t=this.ctx.currentTime,f=780+Math.random()*350;
    this.noise(t,.045,'highpass',3200,.11);this.tone(t,f,.18,'sine',.085);this.tone(t,f*1.49,.12,'sine',.045)},
  bugle(){if(!this.ok('bugle',1400))return;const t=this.ctx.currentTime;
    [392,523,659,784,659].forEach((f,i)=>{this.tone(t+i*.155,f,.23,'sawtooth',.095,0,'fx',.035);this.tone(t+i*.155,f*2,.16,'sine',.028,0,'fx',.035)})},
  // A rope-tension field drum: low membrane resonance, wooden body and a soft snare rattle.
  fieldDrum(t,g,bus='drum'){
    this.tone(t,138,.34,'sine',g,62,bus,.003);
    this.tone(t,205,.17,'triangle',g*.32,112,bus,.004);
    this.noise(t,.19,'bandpass',760,g*.3,.65,bus);
    this.noise(t,.065,'highpass',1800,g*.13,.7,bus);
  },
  rallyDrum(){if(!this.ctx||!PREFS.sound)return;this.syncBattle(BV)},
  marchDrum(t,g=.16){this.fieldDrum(t,g)},
  snare(t,g){this.fieldDrum(t,g,'music')},
  bassDrum(t,g){this.tone(t,92,.38,'sine',g,43,'music',.004);this.tone(t,165,.16,'triangle',g*.23,92,'music',.004);this.noise(t,.08,'lowpass',260,g*.2,.7,'music')},
  fife(t,n,dur,g=1){const f=440*Math.pow(2,(n+12-69)/12);this.tone(t,f,dur,'triangle',.105*g,0,'music',.025);this.tone(t,f*2,dur*.72,'sine',.026*g,0,'music',.02);this.noise(t,dur*.65,'bandpass',2200,.01*g,3,'music')},
  strings(t,n,dur,g=.06){const f=440*Math.pow(2,(n-69)/12);this.tone(t,f,dur,'sawtooth',g,0,'music',.09);this.tone(t,f*1.005,dur,'triangle',g*.45,0,'music',.1)},
  brass(t,n,dur,g=1){const f=440*Math.pow(2,(n-69)/12);this.tone(t,f,dur,'sawtooth',.06*g,0,'music',.055);this.tone(t,f*2,dur*.75,'triangle',.017*g,0,'music',.06)},
  // Original four-bar fife phrase in G, with a separate marching drum pattern.
  MEL:[67,0,71,74,72,71,69,67,69,71,72,69,67,66,67,0, 74,0,72,71,69,71,72,74,76,74,72,71,69,67,69,0, 67,0,71,74,72,71,69,67,72,74,76,72,71,69,67,0, 69,71,72,74,76,74,72,71,69,67,66,69,67,0,67,0],
  MAP_MEL:[64,0,67,69,71,69,67,64,62,64,67,69,67,64,62,0, 69,0,71,72,74,72,71,69,67,69,71,67,64,62,64,0, 64,0,67,69,71,69,67,64,69,71,72,69,67,64,62,0, 67,69,71,72,74,72,71,69,67,64,62,64,64,0,64,0],
  BATTLE_MEL:[62,0,0,65,69,0,67,65,62,0,0,60,62,0,0,0, 65,0,0,69,70,0,69,65,62,0,0,65,62,0,0,0, 65,0,0,67,69,0,72,69,67,0,0,65,64,0,0,0, 67,0,0,64,60,0,64,67,69,0,67,64,62,0,0,0],
  CHORDS:{home:[[55,59,62],[50,54,57],[52,55,59],[48,52,55]],campaign:[[52,55,59],[48,52,55],[55,59,62],[50,54,57]],battle:[[50,53,57],[46,50,53],[53,57,60],[48,52,55]]},
  DRUM:[1,0,.48,.36,1,0,.6,.36,1,0,.48,.36,1,.5,.65,.65],
  battleMusicStep(t,step,spb){
    const i=step%64,beat=i%8,phrase=Math.floor(step/64)%4,ch=this.CHORDS.battle[Math.floor(i/16)],state=this.battleState;
    const heat=state.paused?0:this.combatHeat(t);
    // Space for orders when paused; sustain only a quiet harmonic bed.
    if(state.paused){if(i%16===0){this.strings(t,ch[0],spb*7,.016);this.strings(t,ch[2],spb*7,.008)}return}
    // Field drummers and accompaniment share this clock, even with Music set to zero.
    if(state.rally){const strength=[1,.38,.7,.42,1,.4,.75,.55][beat];this.fieldDrum(t,.18*strength);if(beat===7)this.fieldDrum(t+spb*.5,.075)}
    else if(state.marching){if(beat%2===0)this.marchDrum(t,beat===0?.18:.13);else if(beat===3||beat===7)this.fieldDrum(t,.05)}
    const liveDrums=state.rally||state.marching;
    if(beat===0||beat===4)this.bassDrum(t,(beat===0?.15:.1)*(1+heat*.3));
    if(!liveDrums&&(beat===2||beat===6))this.snare(t,.045+heat*.025);
    if(!liveDrums&&heat>.55&&beat===7)this.snare(t,.03);
    if(i%8===0){this.strings(t,ch[0]-12,spb*7.5,.029);this.strings(t,ch[1],spb*7,.013);this.strings(t,ch[2],spb*7,.012)}
    if(heat>.25&&i%2===0)this.strings(t,ch[(i/2)%3|0]+12,spb*1.55,.012+heat*.015);
    const n=this.BATTLE_MEL[i];if(n&&phrase!==2)this.fife(t,n,spb*(i%4===0?2.4:.85),.58-heat*.18);
    if(i%16===0||heat>.65&&i%16===8){this.brass(t,ch[0]+12,spb*3,.45+heat*.4);this.brass(t,ch[2],spb*2.8,.35+heat*.25)}
  },
  musicStep(next,mode,step,spb){if(mode==='battle'){this.battleMusicStep(next,step,spb);return}const fast=mode==='battle',i=step%64,phrase=Math.floor(step/64)%4,n=(mode==='campaign'?this.MAP_MEL:fast?this.BATTLE_MEL:this.MEL)[i],d=this.DRUM[i%16],ch=this.CHORDS[mode][Math.floor(i/16)];
    // Alternate melody and accompaniment phrases so a long battle has breathing room.
    if(n&&(!fast||i%2===0)&&(phrase!==2||i%4===0))this.fife(next,n,spb*(i%4===0?1.25:.8));
    if(d)this.snare(next,.049*d*(fast?1.18:.85));if(i%8===0)this.bassDrum(next,fast?.19:.12);
    if(i%8===4)this.bassDrum(next,.075);
    if(i%4===0){this.strings(next,ch[0]-12,spb*3.8,fast?.024:.037);this.strings(next,ch[1],spb*3.7,fast?.012:.021);this.strings(next,ch[2],spb*3.7,fast?.011:.019)}
    if(i%4===2&&phrase!==3)this.strings(next,ch[(i/2)%3|0]+12,spb*1.45,fast?.01:.016);
    if(i%16===0||fast&&phrase===1&&i%16===8){this.brass(next,ch[0],spb*2.5);this.brass(next,ch[2],spb*2.2)}
  },
  music(on,fast){const mode=fast?'battle':document.getElementById('home')?.hidden?'campaign':'home';if(on&&this.musicT&&mode===this.mode)return;
    clearInterval(this.musicT);this.musicT=null;this.mode=mode;this.step=0;this.heat=0;this.heatAt=this.ctx?.currentTime||0;if(!on||!this.ctx||!PREFS.sound)return;if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});
    const now=this.ctx.currentTime,target=Math.max(0,Math.min(100,PREFS.musicVol))/100*.52;
    this.musicBus.gain.cancelScheduledValues(now);this.musicBus.gain.setValueAtTime(this.musicBus.gain.value,now);
    this.musicBus.gain.linearRampToValueAtTime(.005,now+.12);this.musicBus.gain.linearRampToValueAtTime(target,now+.45);
    this.musicDuck.gain.cancelScheduledValues(now);this.musicDuck.gain.setTargetAtTime(1,now,.08);
    this.drumBus.gain.setTargetAtTime(fast&&!this.battleState.paused?1:0,now,.025);
    const spb=fast?.26:mode==='home'?.25:.22;let next=now+.2;
    this.musicT=setInterval(()=>{if(!this.ctx)return;next=Math.max(next,this.ctx.currentTime+.02);
      while(next<this.ctx.currentTime+.3){this.musicStep(next,mode,this.step++,spb);next+=spb}},75)},
  signal(kind){if(!this.ok('signal-'+kind,2400))return;const t=this.ctx.currentTime,notes=kind==='morale'?[392,330,262]:kind==='breach'?[262,392,523]:[392,523];notes.forEach((f,i)=>this.tone(t+i*.16,f,.18,'triangle',.07,0,'fx',.02))},
  preview(){this.init();if(!this.ok('preview',900))return;const t=this.ctx.currentTime+.03;
    this.fieldDrum(t,.22,'fx');this.fieldDrum(t+.26,.12,'fx');this.fieldDrum(t+.52,.2,'fx');
    this.noise(t+.85,.055,'highpass',1150,.45);this.noise(t+.87,.7,'lowpass',290,.7,.6);this.tone(t+.85,100,.55,'sine',.5,36)},
};
document.addEventListener('pointerdown',()=>{if(!SND.ctx&&PREFS.sound){SND.init();SND.music(true,!!BV)}},{passive:true});
