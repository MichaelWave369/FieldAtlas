import { demoGraph, sourceGraph, diffusionStep, exciteNode, graphNeighbors, safeRepo } from './model.js';

const $ = id => document.getElementById(id);
const canvas = $('graph');
const ctx = canvas.getContext('2d');
const demo = demoGraph();
let graph = demo;
let evidence = null;
let state = Array(demo.nodes.length).fill(0);
let selectedId = 'n0';
let running = false;
let timer = null;
let soundOn = false;
let audio = null;
let coupling = 0.6;
let points = [];

const message = text => { $('lab-status').textContent = text; };
function setModeButtons() {
  $('mode-demo').setAttribute('aria-pressed', String(graph.kind === 'simulation'));
  $('mode-source').setAttribute('aria-pressed', String(graph.kind === 'source'));
  $('run').disabled = graph.kind !== 'simulation';
  $('reset').disabled = graph.kind !== 'simulation';
  $('coupling').disabled = graph.kind !== 'simulation';
  $('graph-count').textContent = graph.nodes.length + ' nodes · ' + graph.edges.length + ' links';
  $('trust-note').textContent = graph.notice;
  $('mode-description').textContent = graph.kind === 'source'
    ? 'Recorded GitHub source metadata, not verified live-service connections. Each line means that an observation describes the selected repository.'
    : 'Fictional 12-node network. Click a node to add an impulse. The explicit-Euler diffusion model moves activation across weighted links.';
}
function stop() {
  running = false;
  if (timer) clearInterval(timer);
  timer = null;
  $('run').textContent = 'Run';
}
function setGraph(next) {
  stop();
  graph = next;
  state = Array(next.nodes.length).fill(0);
  selectedId = next.nodes[0]?.id || '';
  setModeButtons();
  buildNodeList();
  inspect();
  draw();
  message(next.kind === 'simulation' ? 'Simulation stopped. Select a node to excite it.' : 'Read-only evidence map loaded.');
}
function selectNode(id, excite = true) {
  if (!graph.nodes.some(n => n.id === id)) return;
  selectedId = id;
  if (graph.kind === 'simulation' && excite) state = exciteNode(graph,state,id);
  buildNodeList();
  inspect();
  draw();
  if (soundOn) playNode(id);
}
function buildNodeList() {
  const parent = $('node-list');
  parent.replaceChildren();
  for (const node of graph.nodes) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = node.label;
    b.setAttribute('aria-pressed', String(selectedId === node.id));
    b.addEventListener('click', () => selectNode(node.id));
    parent.appendChild(b);
  }
}
function inspect() {
  const node = graph.nodes.find(n => n.id === selectedId);
  if (!node) return;
  $('selected-label').textContent = node.label;
  const neighbors = graphNeighbors(graph,node.id).length;
  const index = graph.nodes.findIndex(n => n.id === selectedId);
  const signal = graph.kind === 'simulation' ? ' · Activation ' + (state[index]||0).toFixed(3) : '';
  $('selected-detail').textContent = (node.detail || 'Source record.') +
    ' · ' + neighbors + ' adjacent record(s)' + signal;
  const a = $('source-link');
  if (graph.kind === 'source' && typeof node.evidenceUrl === 'string' &&
    node.evidenceUrl.startsWith('https://github.com/MichaelWave369/')) {
    a.href = node.evidenceUrl;
    a.hidden = false;
  } else {
    a.hidden = true;
    a.removeAttribute('href');
  }
}
function layout(width,height) {
  const count = graph.nodes.length;
  const radius = Math.max(66,Math.min(width*0.35,height*0.34));
  const cx = width/2, cy = height/2;
  return graph.nodes.map((node,i) => {
    const isCenter = graph.kind === 'source' && i === 0;
    const theta = -Math.PI/2 + 2*Math.PI*(graph.kind === 'source' ? (i-1)/Math.max(1,count-1) : i/count);
    return {id:node.id, x:isCenter?cx:cx+radius*Math.cos(theta),
      y:isCenter?cy:cy+radius*Math.sin(theta)};
  });
}
function draw() {
  if (!ctx) return;
  const r = canvas.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const scale = Math.min(2,window.devicePixelRatio||1);
  const pw=Math.round(r.width*scale), ph=Math.round(r.height*scale);
  if (canvas.width !== pw || canvas.height !== ph) {canvas.width=pw;canvas.height=ph;}
  ctx.setTransform(scale,0,0,scale,0,0);
  ctx.clearRect(0,0,r.width,r.height);
  points=layout(r.width,r.height);
  const byId=new Map(points.map(p=>[p.id,p]));
  for (const edge of graph.edges) {
    const from=byId.get(edge.from),to=byId.get(edge.to);
    if (!from || !to) continue;
    ctx.beginPath();
    ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);
    ctx.strokeStyle=graph.kind === 'source' ? 'rgba(145,203,208,.55)' : 'rgba(206,159,215,.40)';
    ctx.lineWidth=graph.kind === 'source' ? 2 : 1.5+1.2*(edge.weight||0);
    ctx.stroke();
  }
  graph.nodes.forEach((n,i) => {
    const p=points[i], active=n.id===selectedId;
    const level=graph.kind==='simulation' ? (state[i]||0) : 0;
    ctx.beginPath();
    ctx.arc(p.x,p.y,active?21:16+level*9,0,Math.PI*2);
    ctx.fillStyle=active?'#eac678':graph.kind==='source'?'#81c0c9':'rgb('+Math.round(117+level*125)+','+Math.round(95+level*83)+',177)';
    ctx.fill();
    ctx.lineWidth=active?4:2;
    ctx.strokeStyle=active?'#fff5d6':'#33372c';
    ctx.stroke();
    ctx.font='12px system-ui, sans-serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillStyle=active?'#171a17':'#f9f4e6';
    ctx.fillText(String(i+1),p.x,p.y);
    ctx.fillStyle='#f1e6cf';
    ctx.font='11px system-ui, sans-serif';
    const label=n.label.length>18 ? n.label.slice(0,16)+'…' : n.label;
    ctx.fillText(label,p.x, p.y+35);
  });
}
function hitTest(event) {
  const rect=canvas.getBoundingClientRect();
  const x=event.clientX-rect.left,y=event.clientY-rect.top;
  let closest=null,dist=Infinity;
  for (const p of points) {
    const d=Math.hypot(p.x-x,p.y-y);
    if (d<32 && d<dist) {closest=p;dist=d;}
  }
  if (closest) selectNode(closest.id);
}
async function ensureAudio() {
  const Ctor=window.AudioContext||window.webkitAudioContext;
  if (!Ctor) {message('This browser does not support Web Audio. Visual controls still work.');return false;}
  if (!audio) audio=new Ctor();
  try { await audio.resume(); return audio.state === 'running'; }
  catch { message('Browser blocked audio. Try the sound control again.'); return false; }
}
function playNode(id) {
  if (!audio || audio.state !== 'running') return;
  const idx=graph.nodes.findIndex(n=>n.id===id);
  if (idx<0) return;
  const t=audio.currentTime;
  const osc=audio.createOscillator(),gain=audio.createGain();
  const energy=graph.kind==='simulation'?state[idx]:0.45;
  osc.type='sine';
  osc.frequency.value=164.81 * Math.pow(2,idx/12);
  gain.gain.setValueAtTime(0.0001,t);
  gain.gain.exponentialRampToValueAtTime(0.04+0.10*energy,t+0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001,t+0.32);
  osc.connect(gain);gain.connect(audio.destination);
  osc.start(t);osc.stop(t+0.34);
  osc.onended=()=>{osc.disconnect();gain.disconnect();};
}
$('mode-demo').addEventListener('click',()=>setGraph(demo));
$('mode-source').addEventListener('click',()=>{if(evidence)setGraph(evidence);});
$('run').addEventListener('click',()=>{
  if (graph.kind!=='simulation') return;
  if (running) {stop();message('Simulation paused.');return;}
  running=true;
  $('run').textContent='Pause';
  message('Deterministic diffusion demo running. It is not actual service telemetry.');
  timer=setInterval(()=>{
    if (document.hidden) {stop();message('Paused when browser tab became hidden.');return;}
    state=diffusionStep(graph,state,{k:coupling,dt:0.06,decay:0.02});
    inspect();draw();
  },60);
});
$('reset').addEventListener('click',()=>{
  if (graph.kind!=='simulation')return;
  stop();state=Array(graph.nodes.length).fill(0);
  inspect();draw();message('Synthetic state reset.');
});
$('listen').addEventListener('click', async ()=>{
  if (!soundOn) {
    if (!await ensureAudio()) return;
    soundOn=true;message('Audio enabled. Select nodes to hear their current state.');
  } else {
    soundOn=false;message('Audio disabled.');
  }
  $('listen').textContent=soundOn?'Sound on':'Sound off';
  $('listen').setAttribute('aria-pressed',String(soundOn));
});
$('coupling').addEventListener('input',event=>{
  coupling=Number(event.target.value);
  $('coupling-label').textContent=coupling.toFixed(2);
});
canvas.addEventListener('click',hitTest);
canvas.addEventListener('keydown',event=>{
  if (!['ArrowLeft','ArrowRight','Enter',' '].includes(event.key))return;
  event.preventDefault();
  let index=graph.nodes.findIndex(n=>n.id===selectedId);
  if (event.key==='ArrowLeft')index=(index+graph.nodes.length-1)%graph.nodes.length;
  if (event.key==='ArrowRight')index=(index+1)%graph.nodes.length;
  selectNode(graph.nodes[index]?.id);
});
window.addEventListener('resize',draw);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)stop();});
setGraph(demo);
(async function loadSource() {
  const params=new URLSearchParams(window.location.search);
  const requested=params.getAll('repo');
  if (requested.length!==1 || !safeRepo(requested[0])) {
    message('Choose a public project dossier in FieldAtlas to inspect its history; synthetic lab is available now.');
    return;
  }
  try {
    const response=await fetch('../encyclopedia.json',{credentials:'omit',cache:'no-store'});
    if (!response.ok) throw new Error('Snapshot unavailable');
    const snapshot=await response.json();
    evidence=sourceGraph(snapshot,requested[0]);
    if (!evidence) {
      message('This project is not in the available public snapshot. No source graph was invented.');
      return;
    }
    $('mode-source').disabled=false;
    setGraph(evidence);
    if (snapshot.complete !== true) message('Source snapshot is partial; only the recorded observations are shown.');
  } catch {
    message('Public snapshot could not be read. Synthetic experiment remains available offline.');
  }
})();
