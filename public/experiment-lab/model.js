// R9 Field Experiment Lab: deterministic, browser-independent model.
// Source observations and synthetic simulation are deliberately separate.
const OWNER = 'MichaelWave369';
const REPO_RE = /^(?!\.{1,2}$)[A-Za-z0-9._-]{1,100}$/;
export const DEMO_NODE_COUNT = 12;

export function safeRepo(value) {
  return typeof value === 'string' && REPO_RE.test(value);
}

export function demoGraph() {
  const nodes = Array.from({ length: DEMO_NODE_COUNT }, (_, i) => ({
    id: 'n' + i, label: 'Node ' + String(i + 1).padStart(2, '0'),
    kind: 'synthetic', detail: 'Fictional oscillator / diffusion node.'
  }));
  const edges = [];
  for (let i = 0; i < DEMO_NODE_COUNT; i++) {
    edges.push({ from: 'n' + i, to: 'n' + ((i + 1) % DEMO_NODE_COUNT), weight: 1 });
  }
  for (let i = 0; i < 6; i++) {
    edges.push({ from: 'n' + i, to: 'n' + (i + 6), weight: 0.45 });
  }
  return { kind: 'simulation', nodes, edges,
    notice: 'Synthetic 12-node graph. Connections and values are invented for demonstration; they are not PhiOS or Agentora telemetry.' };
}

function iso(value) {
  if (typeof value !== 'string') return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

/**
 * A star graph of *observations about one public repository*.
 * Edges mean "this record describes this repository", NEVER a technical dependency.
 * No arbitrary incoming URLs or owner names are rendered as outbound links.
 */
export function sourceGraph(snapshot, repositoryName) {
  if (!safeRepo(repositoryName) || !snapshot || snapshot.schema_version !== 1 ||
    snapshot.owner !== OWNER || !Array.isArray(snapshot.repositories)) return null;
  const records = snapshot.repositories.filter(r =>
    r && r.isPublic === true && safeRepo(r.repo) &&
    r.repo.toLowerCase() === repositoryName.toLowerCase() &&
    Number.isSafeInteger(r.id) && r.id > 0);
  if (records.length !== 1) return null;
  const record = records[0];
  const repoUrl = 'https://github.com/' + OWNER + '/' + encodeURIComponent(record.repo);
  const nodes = [{
    id: 'repo:' + record.id, label: record.repo, kind: 'repository',
    detail: record.description ? String(record.description).slice(0,200) : 'Owner-public GitHub source repository.',
    evidenceUrl: repoUrl
  }];
  const edges = [];
  const add = (id,label,detail,kind,evidenceUrl) => {
    nodes.push({id,label,detail,kind,evidenceUrl});
    edges.push({from:nodes[0].id,to:id,kind:'documents'});
  };
  const created = iso(record.createdAt);
  const pushed = iso(record.pushedAt);
  if (created) add('created','Repository created',created + ' · repository metadata, not date of the original idea.','observation',repoUrl);
  if (pushed) add('pushed','Last push observed',pushed + ' · does not demonstrate a deployment.','observation',repoUrl);
  const used = new Set();
  for (const m of (Array.isArray(record.milestones) ? record.milestones : []).slice(0,30)) {
    if (nodes.length >= 7) break;
    if (!m || m.kind !== 'merged-pr' || !Number.isSafeInteger(m.number) || m.number <= 0 ||
      !iso(m.date) || used.has(m.number)) continue;
    used.add(m.number);
    add('pr:'+m.number,'Merged PR #'+m.number,
      iso(m.date)+' · '+String(m.title||'Untitled').slice(0,140)+'. Merge is not proof of deployment.',
      'merged-pr',repoUrl+'/pull/'+m.number);
  }
  return {kind:'source',nodes,edges,repoUrl,
    notice: 'Public-source observations only. Links mean "describes repository", not code dependency, runtime integration, or proof that the app works.'};
}

export function graphNeighbors(graph, id) {
  if (!graph || !Array.isArray(graph.edges)) return [];
  const result = new Set();
  for (const edge of graph.edges) {
    if (edge.from === id) result.add(edge.to);
    if (edge.to === id) result.add(edge.from);
  }
  return [...result];
}

// Explicit Euler integration of dx/dt = k*sum(w*(x_neighbor-x)) - decay*x.
// A teaching demo, NOT a physical structural solver or a quantum model.
export function diffusionStep(graph, input, options = {}) {
  if (!graph || graph.kind !== 'simulation' || !Array.isArray(graph.nodes) ||
    !Array.isArray(graph.edges) || !Array.isArray(input) ||
    input.length !== graph.nodes.length || input.some(x => !Number.isFinite(x))) {
    throw new Error('Invalid synthetic simulation state');
  }
  const k = Number.isFinite(options.k) ? Math.min(1,Math.max(0,options.k)) : 0.6;
  const dt = Number.isFinite(options.dt) ? Math.min(0.1,Math.max(0,options.dt)) : 0.06;
  const decay = Number.isFinite(options.decay) ? Math.min(1,Math.max(0,options.decay)) : 0.02;
  const delta = new Array(input.length).fill(0);
  const lookup = new Map(graph.nodes.map((n,i) => [n.id,i]));
  for (const edge of graph.edges) {
    const a=lookup.get(edge.from), b=lookup.get(edge.to);
    if (a === undefined || b === undefined || a === b) continue;
    const weight=Number(edge.weight);
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) continue;
    const transfer=k*weight*(input[b]-input[a]);
    delta[a]+=transfer;
    delta[b]-=transfer;
  }
  return input.map((v,i) => Math.max(0, Math.min(1,v+dt*(delta[i]-decay*v))));
}

export function exciteNode(graph, input, id, amount=0.85) {
  if (graph?.kind !== 'simulation' || !Array.isArray(input) ||
    input.length !== graph.nodes.length) return input;
  const index=graph.nodes.findIndex(n=>n.id===id);
  if (index<0) return input;
  const copy=input.slice();
  copy[index]=Math.max(0,Math.min(1,Number.isFinite(amount)?amount:0.85));
  return copy;
}
