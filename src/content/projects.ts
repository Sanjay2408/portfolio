import {
  EVALUATION_SOURCE,
  README_SOURCE as ATLAS_README,
  benignEventsInA,
  evaluationTable,
  falsePositiveCostTable,
  headlineMetrics,
  lossCalibration,
} from './risk-atlas'
import { formatCount } from '@/lib/format'
import type { Project } from './types'
import { todo } from './types'

const GITHUB = 'https://github.com/Sanjay2408'

/** Permalinks pinned to the commit the copy was written against. */
const pinned = (repo: string, sha: string) => (path: string) =>
  `${GITHUB}/${repo}/blob/${sha}/${path}`

const twoAsk = pinned('Nitte_2ask', '9143cf03b01fb620637d66079d20c8329913a718')
const intelli = pinned('intelli-credit', 'f01878b2d299eef1c23cd894f9f9c745975836d7')
const dose = pinned('DoseWise', '3bf3b78bee1004adb3825cb9fb689dd94c492ade')
const voice = pinned('AI-voice-detection', '471f34b2e137438fb9ccbed8c3ada025c9e58882')
const cine = pinned('Cine-NLP', 'b9d3157edf752c38625929a686e42d9c24271c16')

export const PORTFOLIO_SLUG = 'portfolio'

export const projects: readonly Project[] = [
  {
    slug: 'risk-atlas',
    name: 'RISK//ATLAS',
    tier: 'flagship',
    domain: 'fintech',
    context: 'Built for the Razorpay AI Buildathon',
    problem:
      'Coordinated fraud hides inside payments that each look normal, so transaction-level models miss it by design.',
    built:
      'A defense-only engine that finds fraud campaigns spread across many payments, reconstructs how each attack unfolded, and simulates the least disruptive way to contain it. It recommends. A human approves.',
    stack: [
      'Python',
      'FastAPI',
      'Kafka (Redpanda)',
      'PostgreSQL',
      'Redis',
      'XGBoost',
      'NetworkX',
      'React',
      'Docker',
      'GitHub Actions',
      'pytest',
    ],
    metrics: headlineMetrics,
    repo: { visibility: 'public', url: `${GITHUB}/Riskops` },
    tables: [evaluationTable, falsePositiveCostTable],
    caseStudy: {
      problem:
        'A transaction model asks "is this payment risky?" Coordinated attackers beat that question on purpose. They keep every payment under every threshold and spread the attack across identities, devices, cards and merchants. I wanted to ask a different question: what attack is happening, who is connected to it, and what is the smallest intervention that stops it?',
      role: todo(
        'State your role. Git shows all 14 commits are yours, from the day 0 spec to the final evaluation fix. Say whether you built it solo and what the buildathon format was.',
      ),
      architecture: {
        description:
          'Payment events flow through an event bus into a signal engine, then a campaign engine that clusters an entity graph, then a read-only AI investigator, then a counterfactual engine that simulates interventions. A human approves the action.',
        nodes: [
          {
            id: 'events',
            label: 'Payment events',
            detail: 'webhook, EventBus, Redpanda',
            col: 0,
            row: 0,
          },
          {
            id: 'signal',
            label: 'Signal engine',
            detail: 'velocity, amount, device',
            col: 0,
            row: 1,
          },
          {
            id: 'campaign',
            label: 'Campaign engine',
            detail: 'entity graph, hub-split clustering',
            col: 0,
            row: 2,
          },
          {
            id: 'investigator',
            label: 'AI investigator',
            detail: 'read-only tools, cited evidence',
            col: 0,
            row: 3,
          },
          {
            id: 'counterfactual',
            label: 'Counterfactual engine',
            detail: 'simulates every intervention',
            col: 0,
            row: 4,
          },
          {
            id: 'human',
            label: 'Human-approved action',
            detail: 'ATLAS never moves money',
            col: 0,
            row: 5,
          },
          {
            id: 'store',
            label: 'Postgres + Redis',
            detail: 'events, features, campaigns',
            col: 1,
            row: 1,
          },
          {
            id: 'datagen',
            label: 'Campaign generator',
            detail: 'datasets A to E, with ground truth',
            col: 1,
            row: 0,
          },
        ],
        edges: [
          { from: 'datagen', to: 'events', label: 'replay' },
          { from: 'events', to: 'signal' },
          { from: 'signal', to: 'store' },
          { from: 'signal', to: 'campaign' },
          { from: 'campaign', to: 'investigator' },
          { from: 'investigator', to: 'counterfactual' },
          { from: 'counterfactual', to: 'human' },
        ],
      },
      decisions: [
        {
          title: "Detect on what the attack's economics force",
          body: 'Rate, amount and timing are chosen by the attacker, so they only corroborate. Clustering rests on structural reuse: an attacker cannot skip testing a card before using it, cannot throw away cards that worked, and cannot afford a separate device for every fake identity.',
        },
        {
          title: 'Lock the evaluation before the detector exists',
          body: 'On day 0 I wrote the attack model, the data generator and the evaluation protocol into a spec, including a test that campaigns must be invisible to the transaction layer. That test failing later forced the most important fix in the project.',
        },
        {
          title: 'The LLM is never the source of truth',
          body: 'Detection, scoring and staging are deterministic and finish before the investigator runs. Its tools are read-only, and any claim whose evidence does not resolve to a stored row is dropped in code, not in the prompt. With no API key it falls back to a deterministic report.',
        },
        {
          title: 'Score outcomes against labels the system never saw',
          body: 'ATLAS picks interventions without labels, as it would in production. The rupee outcome is then scored against ground truth, because grading a decision system with its own beliefs measures self-consistency, not accuracy.',
        },
        {
          title: 'Publish the error instead of tuning it away',
          body: `The model assumes ${lossCalibration.assumed} of fraud becomes realized loss. Simulated chargebacks measured ${lossCalibration.measured}, an ${lossCalibration.errorPercent} underestimate. I left the constant and reported the error, because the recommended strategy is the same at 0.4, 0.65 and 0.9.`,
        },
      ],
      broke: [
        {
          title: 'My own invisibility test failed at 7.8%',
          symptom:
            'I required at least 80% of campaign transactions to score below the transaction-level flag. The first run measured 7.8%. The generator put 400 card tests on 1 to 3 devices, a loud attacker any velocity rule would catch.',
          fix: 'Rewrote the generator around a per-entity budget, so attack volume comes from many identities sharing a little infrastructure. Invisibility reached 99.5% on the evasive attacker. Every earlier number had to be re-measured. I did not lower the threshold to make the test pass.',
        },
        {
          title: 'A constant the attacker controls',
          symptom:
            'On the evasive dataset the card-testing stage came back empty and 70 declined authorizations were labelled as monetization. Stage inference used a fixed bound of ₹60, and this attacker tested at ₹60 to ₹250.',
          fix: "Made stage inference scale-free: stages come from each card's own value progression. Then I audited the pipeline for any other threshold the attacker gets to choose.",
        },
        {
          title: 'The evasive attacker beat both layers',
          symptom:
            'Campaign recall on dataset E was 0.00. The graph window was 7 days, picked by feel, and the attack ran longer than that.',
          fix: 'Swept the window length. Benign data produced zero false campaigns at every length tested, detection plateaued at 14 days, and I locked 30 for margin.',
        },
        {
          title: 'A demo line the system never produced',
          symptom:
            'The demo printed "Insufficient evidence. Escalating to analyst." while the object on screen had escalate set to false.',
          fix: 'Rewrote the beat to show what really happens: the borderline cluster scores 0.38, under the 0.55 threshold, and no campaign is raised. Demo text is now generated from live objects.',
        },
      ],
      next: todo(
        'What would you do next? Candidates from the README limitations: test on real data (everything is synthetic today), batch Kafka delivery reports (about 60 ms per event), widen the narrow 0.50 to 0.60 operating point.',
      ),
    },
  },

  {
    slug: 'intellicredit',
    name: 'IntelliCredit',
    tier: 'featured',
    domain: 'fintech',
    context: 'My end-to-end rebuild of our IIT Hyderabad hackathon project',
    credit: {
      text: 'Original hackathon repo:',
      label: 'Priyanshu-Madhup/intelli_credit',
      href: 'https://github.com/Priyanshu-Madhup/intelli_credit',
    },
    problem:
      'A lender has to turn a stack of financial documents, in any format, into a credit decision and a bank-standard appraisal memo.',
    built:
      'Upload any company document and get an explainable credit decision: a 0 to 100 risk score, loan terms, SWOT, GST checks, live web research, and a credit appraisal memo exported as PDF or DOCX.',
    stack: [
      'React',
      'Vite',
      'Tailwind CSS',
      'JavaScript',
      'FastAPI',
      'Python',
      'Groq API',
      'Vercel',
    ],
    metrics: [
      {
        value: '12',
        label: 'file formats ingested, up from PDF only',
        source: `${intelli('README.md')}#L13`,
      },
      {
        value: '14',
        label: 'sections in the bank-standard appraisal memo',
        source: `${intelli('api/index.py')}#L752-L787`,
      },
      {
        value: '~2 GB',
        label: 'of FAISS and PyTorch dependencies removed so it runs serverless',
        source: `${intelli('README.md')}#L17`,
      },
    ],
    liveUrl: 'https://intelli-credit-seven.vercel.app',
    repo: { visibility: 'public', url: `${GITHUB}/intelli-credit` },
    tables: [
      {
        caption: 'The original hackathon build against my rebuild',
        columns: ['', 'Original', 'My rebuild'],
        rows: [
          [
            'File formats',
            'PDF only (Excel partially)',
            'PDF, XLSX, XLS, CSV, TSV, DOCX, TXT, MD, JSON, PNG/JPG/WEBP (vision OCR)',
          ],
          [
            'File size',
            'Limited by server',
            'No practical cap: large files are text-extracted in the browser (pdf.js, SheetJS)',
          ],
          [
            'KYC',
            'None',
            'PAN and GSTIN auto-detection, structural validation, external web verification',
          ],
          ['CAM format', 'Free-form prose', 'Standard bank CAM template, 14 numbered sections'],
          [
            'Retrieval',
            "FAISS + PyTorch embeddings (~2 GB, can't deploy serverless)",
            'Stateless BM25: pure Python, deploys anywhere, survives cold starts',
          ],
          [
            'Web research',
            'Serper API (extra paid key)',
            'Groq compound model with built-in web search, one key',
          ],
          ['Hosting', 'Not hosted', 'Single Vercel deployment (React + FastAPI serverless)'],
          ['UI', 'Basic Tailwind', 'Apple-inspired: SF type, frosted nav, rounded cards'],
          [
            'State',
            'Server-side index (single user)',
            'Client-held document chunks, an isolated session per visitor',
          ],
        ],
        highlightColumn: 2,
        source: `${intelli('README.md')}#L9-L21`,
      },
    ],
    caseStudy: {
      problem:
        'At the IIT Hyderabad hackathon our team built a credit appraisal engine that placed in the top 10. It ran on FAISS and PyTorch embeddings, read PDFs and some Excel, kept one server-side index for everyone, and was never hosted. I rebuilt it end to end so anyone can use it from a link.',
      role: 'Everything in this repo is my rebuild: the React frontend, the FastAPI backend, retrieval, KYC checks, the memo template and the Vercel deployment. The original was a team effort, credited above.',
      architecture: {
        description:
          'The React app extracts large files in the browser and keeps document chunks in local storage. It sends chunks with each request to one FastAPI serverless function, which ranks them with BM25 and asks Groq models for analysis, OCR and web research, then exports the memo.',
        nodes: [
          {
            id: 'browser',
            label: 'React app',
            detail: 'pdf.js + SheetJS, chunks in localStorage',
            col: 0,
            row: 0,
          },
          {
            id: 'api',
            label: 'FastAPI on Vercel',
            detail: 'one serverless function',
            col: 0,
            row: 1,
          },
          {
            id: 'bm25',
            label: 'BM25 retrieval',
            detail: 'per request, pure Python',
            col: 0,
            row: 2,
          },
          {
            id: 'groq',
            label: 'Groq models',
            detail: 'analysis, image OCR, web search',
            col: 1,
            row: 2,
          },
          { id: 'cam', label: 'Decision + memo', detail: 'PDF and DOCX export', col: 1, row: 3 },
        ],
        edges: [
          { from: 'browser', to: 'api', label: 'chunks per request' },
          { from: 'api', to: 'bm25' },
          { from: 'bm25', to: 'groq', label: 'top chunks' },
          { from: 'groq', to: 'cam' },
        ],
      },
      decisions: [
        {
          title: 'BM25 instead of a vector database',
          body: 'The original used FAISS with PyTorch embeddings, about 2 GB of dependencies, which cannot run in a serverless function. BM25 in pure Python needs no model and no persistent index, so a cold start loses nothing. The tradeoff is weaker matching on paraphrased questions.',
        },
        {
          title: 'Keep document state in the browser',
          body: 'Chunks live in localStorage and travel with each request. The server holds nothing, so every visitor gets an isolated session and there is no shared index to leak between users. The cost is bigger request bodies.',
        },
        {
          title: 'Extract large files on the client',
          body: 'PDFs and spreadsheets are parsed in the browser with pdf.js and SheetJS, and only text reaches the server. That removes the upload size ceiling of a serverless function.',
        },
        {
          title: 'One API key for everything',
          body: "Web research moved from Serper to Groq's compound model with built-in search, so the whole app runs on a single key.",
        },
      ],
      broke: todo(
        'What broke during the rebuild? Your commit "Remove upload size cap, add PAN/GSTIN verification, bank-template CAM" suggests the upload limit was one. Write the symptom and the fix.',
      ),
      next: todo('What would you do next with IntelliCredit?'),
    },
  },

  {
    slug: '2ask-ledger',
    name: '2ASK Ledger',
    tier: 'featured',
    domain: 'fintech',
    problem:
      'Indian freelancers track income, invoices and GST deadlines across scattered PDFs, spreadsheets and payment apps.',
    built:
      'An AI CFO for freelancers. Upload bank statements, get categorized cash flow and a health score, raise GST-aware invoices, see filing deadlines, and ask questions answered from your own documents. Every invoice gets a SHA-256 proof, so tampering shows.',
    stack: [
      'React',
      'Tailwind CSS',
      'JavaScript',
      'FastAPI',
      'Python',
      'SQLite',
      'JWT auth',
      'LanceDB',
      'sentence-transformers',
      'Groq API',
    ],
    metrics: [
      {
        value: '6',
        label: 'kinds of personal data redacted before anything is embedded or sent to the LLM',
        source: `${twoAsk('backend/services/redaction_service.py')}#L5-L86`,
      },
      {
        value: '5',
        label: 'weighted factors in the financial health score',
        source: `${twoAsk('backend/services/finance_service.py')}#L188-L250`,
      },
      {
        value: '70/30',
        label: 'vector and keyword weighting in hybrid retrieval',
        source: `${twoAsk('backend/services/rag_service.py')}#L171-L186`,
      },
    ],
    repo: { visibility: 'public', url: `${GITHUB}/Nitte_2ask` },
    caseStudy: {
      problem:
        'A freelancer in India needs to know who owes them money, what their GST liability is this quarter, and when GSTR-1, GSTR-3B and advance tax are due, usually from a mess of statements and invoices. I wanted one ledger they can trust and ask questions of.',
      role: todo(
        'Describe your role. Git shows every 2ASK commit is yours: the April v2.1 work and the July v3 rebuild that changed 93 files. The repo started from the IntelliCredit hackathon code. Mention the event behind the repo name "Nitte" if there was one.',
      ),
      architecture: {
        description:
          'A React app talks to a FastAPI backend that checks a JWT on every route. Uploads are parsed, redacted and embedded into LanceDB per user. Ask CFO combines retrieved chunks with a live ledger summary and asks Groq. Documents and invoices are hashed into proof records stored in SQLite.',
        nodes: [
          {
            id: 'app',
            label: 'React 19 app',
            detail: 'dashboard, invoices, Ask CFO',
            col: 0,
            row: 0,
          },
          {
            id: 'api',
            label: 'FastAPI',
            detail: 'JWT on every route, per-user data',
            col: 0,
            row: 1,
          },
          { id: 'db', label: 'SQLite', detail: 'ledger, invoices, proofs, audit', col: 1, row: 1 },
          { id: 'ingest', label: 'Ingestion', detail: 'parse, redact PII, chunk', col: 0, row: 2 },
          {
            id: 'proof',
            label: 'Proof service',
            detail: 'SHA-256 per document and invoice',
            col: 1,
            row: 2,
          },
          {
            id: 'vectors',
            label: 'LanceDB',
            detail: 'MiniLM embeddings, filtered by user',
            col: 0,
            row: 3,
          },
          {
            id: 'cfo',
            label: 'Ask CFO',
            detail: 'hybrid retrieval + ledger, via Groq',
            col: 0,
            row: 4,
          },
        ],
        edges: [
          { from: 'app', to: 'api' },
          { from: 'api', to: 'db' },
          { from: 'api', to: 'ingest', label: 'uploads' },
          { from: 'api', to: 'proof' },
          { from: 'proof', to: 'db' },
          { from: 'ingest', to: 'vectors' },
          { from: 'vectors', to: 'cfo', label: 'retrieve' },
        ],
      },
      decisions: [
        {
          title: 'Redact before embedding, not after',
          body: 'PAN, GSTIN, bank account, phone, email and Aadhaar numbers are masked before text is embedded or sent to the LLM, so neither the vector store nor the model ever sees them.',
        },
        {
          title: 'Hybrid retrieval',
          body: 'Chunks are ranked 70% on vector similarity and 30% on keyword match. Questions about a GSTR-3B deadline or an invoice number hinge on exact terms that embeddings alone can blur.',
        },
        {
          title: 'Tamper evidence without a blockchain',
          body: 'Each document and invoice is hashed with SHA-256 into a proof record with an audit event. Verification re-hashes the file, so any changed byte fails. The chain anchor is mocked today, and the code says so.',
        },
        {
          title: 'Degrade to retrieval-only',
          body: 'If Groq is unreachable, Ask CFO still returns the retrieved passages instead of failing.',
        },
      ],
      broke: todo(
        'What broke? The v3 commit message mentions "real multi-user auth", so moving from one demo user to per-user isolation may be the story.',
      ),
      next: todo('What would you do next with 2ASK Ledger?'),
    },
  },

  {
    slug: 'dosewise',
    name: 'DoseWise',
    tier: 'featured',
    domain: 'health',
    problem:
      'Older adults on several medicines need reminders they can actually read, and their caregivers need to know when something is off.',
    built:
      'A medication companion with large, simple screens for patients and a summary dashboard for caregivers. A LangGraph agent reminds, escalates and reorders on fixed rules. An LLM only writes the plain-language summary.',
    stack: [
      'React',
      'JavaScript',
      'FastAPI',
      'Python',
      'LangGraph',
      'SQLite',
      'JWT auth',
      'Groq API',
    ],
    metrics: [
      {
        value: '4',
        label: 'agent steps per run: observe, reason, plan, act',
        source: `${dose('backend/app/agent/graph.py')}#L27-L47`,
      },
      {
        value: '3',
        label: 'text sizes for older eyes',
        source: `${dose('frontend/src/App.jsx')}#L22-L26`,
      },
      {
        value: '90 s',
        label: 'hard timeout per agent run, off the event loop',
        source: `${dose('backend/app/api/routes.py')}#L52-L60`,
      },
    ],
    repo: { visibility: 'public', url: `${GITHUB}/DoseWise` },
    caseStudy: {
      problem:
        'Most medication apps assume small text and small buttons. The patient here is older, and the caregiver needs a clear "what should I look at" view, without an AI making medical calls.',
      role: todo(
        'Describe your role and who DoseWise was for. The history is squashed into 2 commits, so say what you built.',
      ),
      architecture: {
        description:
          'A React app talks to a FastAPI backend with per-user SQLite storage. Each agent run is one LangGraph pass: observe, reason, plan, act. The reason step uses fixed rules and may ask an LLM to phrase a caregiver summary, with a rule-based fallback.',
        nodes: [
          {
            id: 'app',
            label: 'React app',
            detail: 'A / A+ / A++ text, big tap targets',
            col: 0,
            row: 0,
          },
          { id: 'api', label: 'FastAPI', detail: 'bcrypt + JWT, per-user scope', col: 0, row: 1 },
          { id: 'db', label: 'SQLite', detail: 'users and per-user state', col: 1, row: 1 },
          { id: 'observe', label: 'Observe', detail: 'due doses, vitals, stock', col: 0, row: 2 },
          { id: 'reason', label: 'Reason', detail: 'rule-based trends', col: 0, row: 3 },
          {
            id: 'llm',
            label: 'LLM summary',
            detail: 'Groq or Gemini, 20 s timeout',
            col: 1,
            row: 3,
          },
          { id: 'plan', label: 'Plan', detail: 'REMIND, ESCALATE, REORDER', col: 0, row: 4 },
          { id: 'act', label: 'Act', detail: 'reminders, email alerts', col: 0, row: 5 },
        ],
        edges: [
          { from: 'app', to: 'api' },
          { from: 'api', to: 'db' },
          { from: 'api', to: 'observe', label: 'one pass' },
          { from: 'observe', to: 'reason' },
          { from: 'reason', to: 'llm', label: 'wording only' },
          { from: 'reason', to: 'plan' },
          { from: 'plan', to: 'act' },
        ],
      },
      decisions: [
        {
          title: 'Rules decide, the LLM only writes',
          body: 'Escalation comes from deterministic rules, such as blood pressure above 140/90 on each of the last 3 days with readings. The LLM phrases the caregiver summary, has a 20 second timeout, and falls back to rule-based text. A model is never the reason an alert fires or stays quiet.',
        },
        {
          title: 'One pass, never a loop',
          body: 'Each run is exactly one observe, reason, plan, act pass, executed off the event loop with a 90 second timeout, so one slow run cannot freeze the server.',
        },
        {
          title: 'Designed for older eyes',
          body: 'Three text sizes, big tap targets, plain labels like "Take now", and a full-screen check mark after every tap so there is no doubt it registered. It respects reduced motion and shows keyboard focus.',
        },
      ],
      broke: [
        {
          title: 'LangGraph broke on Python 3.12',
          symptom:
            'The older 0.0.x LangGraph releases pin a langsmith version that breaks on Python 3.12.',
          fix: 'Pinned langgraph 0.2.76, which runs on both 3.11 and 3.12.',
        },
        {
          title: 'A node name collided with the state',
          symptom:
            'LangGraph node names cannot match keys in the agent state, and "plan" is a state key.',
          fix: 'Named the planner node plan_step and kept every node name distinct from state keys.',
        },
      ],
      next: todo('What would you do next with DoseWise?'),
    },
  },

  {
    slug: PORTFOLIO_SLUG,
    name: 'This portfolio',
    tier: 'featured',
    domain: 'web',
    problem: 'A portfolio should prove its claims, not just make them.',
    built:
      'This site. Every number links to the file that proves it, tests fail CI if a claim loses its source or an em dash slips in, and a status route checks each live project every 5 minutes.',
    stack: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'Vitest', 'Vercel'],
    metrics: [
      todo('Lighthouse scores, measured on the deployed site.'),
      todo('Test coverage, from npm run coverage.'),
    ],
    repo: { visibility: 'public', url: `${GITHUB}/portfolio` },
    caseStudy: {
      problem:
        'Most portfolios are a list of claims. I wanted one where a reviewer can click any number and land on the line of code or report that produced it, and where the build enforces that.',
      role: todo('Describe how you built this site and what you owned.'),
      architecture: {
        description:
          'Typed content files feed static pages and a test suite. A cached status route pings each live project and a small client component shows the result on each card.',
        nodes: [
          {
            id: 'content',
            label: 'Typed content',
            detail: 'projects.ts, sources on every number',
            col: 0,
            row: 0,
          },
          {
            id: 'tests',
            label: 'Vitest',
            detail: 'sources, copy rules, status logic',
            col: 1,
            row: 0,
          },
          {
            id: 'pages',
            label: 'Static pages',
            detail: 'home + one page per project',
            col: 0,
            row: 1,
          },
          {
            id: 'status',
            label: '/api/status',
            detail: 'cached 5 min, 8 s timeout per ping',
            col: 1,
            row: 1,
          },
          {
            id: 'dot',
            label: 'Status dot',
            detail: 'client component, no layout shift',
            col: 0,
            row: 2,
          },
          { id: 'live', label: 'Live projects', detail: 'up, down or timeout', col: 1, row: 2 },
        ],
        edges: [
          { from: 'content', to: 'tests' },
          { from: 'content', to: 'pages' },
          { from: 'pages', to: 'dot' },
          { from: 'dot', to: 'status', label: 'fetch' },
          { from: 'status', to: 'live', label: 'ping' },
        ],
      },
      decisions: [
        {
          title: 'Content is typed data, not JSX',
          body: 'Projects live in one typed file. A technology that is not in the registry is a compile error, and the skills section is derived from project stacks, so it cannot list anything no project uses.',
        },
        {
          title: 'Numbers are derived where possible',
          body: `RISK//ATLAS figures are computed from a verbatim copy of its evaluation report, so "${formatCount(benignEventsInA)} benign events" cannot drift from the source.`,
        },
        {
          title: 'Three states, not two',
          body: 'The status check reports up, down or timeout. A serverless project waking from a cold start is slow, not broken, and should not look like an outage.',
        },
        {
          title: 'Diagrams as data, drawn as SVG at build time',
          body: 'A diagram library would ship hundreds of kilobytes of JavaScript to draw a few boxes. These are server-rendered SVG with a text description for screen readers.',
        },
      ],
      broke: [
        {
          title: 'A cold start looked like an outage',
          symptom:
            'While planning, the Voice API did not answer a first request within 10 seconds, then answered the next in under a second. An up or down check would have marked a healthy project as down.',
          fix: 'Added a timeout state separate from down, with an 8 second budget per ping, and cached results for 5 minutes so visitors never wait on a ping.',
        },
      ],
      next: todo('What would you add next to this site?'),
    },
  },

  {
    slug: 's45-lens',
    name: 'S45 Lens',
    tier: 'more',
    domain: 'fintech',
    problem:
      'IPO prospectuses are long and dense, and any tool that explains them has to stay inside SEBI rules.',
    built:
      'A SEBI-compliant IPO research companion that explains prospectuses in plain language and keeps facts and opinions separate. Shaped by real user research and four pivots around SEBI constraints.',
    stack: ['React', 'Vite'],
    metrics: [
      todo(
        'Add a number with a source, such as how many people you interviewed, or link the write-up of the four SEBI pivots. Also complete the stack: the live bundle only shows React and Vite.',
      ),
    ],
    liveUrl: 'https://s45-lens.vercel.app',
    repo: { visibility: 'private' },
  },

  {
    slug: 'voice-detection-api',
    name: 'AI Voice Detection API',
    tier: 'more',
    domain: 'ml',
    credit: { text: 'Built with', label: 'sif01', href: 'https://github.com/sif01' },
    problem: 'Tell whether a voice clip is AI-generated or human.',
    built:
      'A FastAPI REST API that classifies base64 audio with a Random Forest over MFCC, spectral, chroma, mel and tonnetz features. API-key auth, Docker image, deployed on Vercel.',
    stack: ['Python', 'FastAPI', 'scikit-learn', 'librosa', 'Docker', 'Vercel'],
    metrics: [
      {
        value: '233',
        label: 'audio features per clip',
        source: `${voice('app/inference.py')}#L54-L66`,
      },
      {
        value: '300',
        label: 'trees in the Random Forest, balanced class weights',
        source: `${voice('train_model.py')}#L83`,
      },
      todo(
        'Record test accuracy. train_model.py prints it on a 15% stratified holdout but never saves it.',
      ),
    ],
    liveUrl: 'https://voice-detection-api-dun.vercel.app',
    repo: { visibility: 'public', url: `${GITHUB}/AI-voice-detection` },
  },

  {
    slug: 'cine-nlp',
    name: 'Cine-NLP',
    tier: 'more',
    domain: 'ml',
    credit: {
      text: 'Voice integration by',
      label: 'Varshini Puttabakula',
      href: `${GITHUB}/Cine-NLP/pull/1`,
    },
    problem: 'See every classic NLP stage run on real text, from spell correction to perplexity.',
    built:
      'A 6-stage NLP pipeline with a web UI: sentiment, BART summarization, a from-scratch Levenshtein spell corrector, preprocessing, a trigram language model with Laplace smoothing, and perplexity. It pulls movie plots from TMDB to analyze.',
    stack: ['Python', 'Flask', 'Hugging Face Transformers', 'NLTK', 'spaCy', 'JavaScript'],
    metrics: [
      {
        value: '230k+',
        label: 'dictionary words searched by the spell corrector',
        source: `${cine('README.md')}#L13`,
      },
      {
        value: '6',
        label: 'pipeline stages',
        source: `${cine('README.md')}#L9-L18`,
      },
    ],
    repo: { visibility: 'public', url: `${GITHUB}/Cine-NLP` },
  },
]

export const flagship = projects.find((p) => p.tier === 'flagship')
export const featured = projects.filter((p) => p.tier === 'featured')
export const more = projects.filter((p) => p.tier === 'more')

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)

/** Projects built for someone other than this site. Drives the hero count. */
export const shippedProjects = projects.filter((p) => p.slug !== PORTFOLIO_SLUG)

/** Projects with a case study get a detail page. */
export const detailPageProjects = projects.filter((p) => p.caseStudy !== undefined)

export { ATLAS_README, EVALUATION_SOURCE }
