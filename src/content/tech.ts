/**
 * Every technology a project can list. Using a key that is not here is a
 * compile error, so the skills section cannot drift from the project data.
 */
export const TECH = {
  Python: 'Languages',
  JavaScript: 'Languages',
  TypeScript: 'Languages',

  React: 'Frontend',
  'Next.js': 'Frontend',
  'Tailwind CSS': 'Frontend',
  Vite: 'Frontend',
  Recharts: 'Frontend',

  FastAPI: 'Backend',
  Flask: 'Backend',
  'Node.js': 'Backend',
  'JWT auth': 'Backend',
  SQLAlchemy: 'Backend',

  PostgreSQL: 'Data',
  SQLite: 'Data',
  Redis: 'Data',
  'Kafka (Redpanda)': 'Data',
  LanceDB: 'Data',

  'scikit-learn': 'ML and AI',
  XGBoost: 'ML and AI',
  NetworkX: 'ML and AI',
  librosa: 'ML and AI',
  'sentence-transformers': 'ML and AI',
  'Hugging Face Transformers': 'ML and AI',
  NLTK: 'ML and AI',
  spaCy: 'ML and AI',
  LangGraph: 'ML and AI',
  'Groq API': 'ML and AI',

  Docker: 'Tooling',
  'GitHub Actions': 'Tooling',
  pytest: 'Tooling',
  Vitest: 'Tooling',
  Vercel: 'Tooling',
} as const satisfies Record<string, TechCategory>

export type TechCategory = 'Languages' | 'Frontend' | 'Backend' | 'Data' | 'ML and AI' | 'Tooling'

export type Tech = keyof typeof TECH

export const TECH_CATEGORIES: readonly TechCategory[] = [
  'Languages',
  'Frontend',
  'Backend',
  'Data',
  'ML and AI',
  'Tooling',
]

/** What I am working in now but have not shipped a project with yet. Never shown as "shipped". */
export const LEARNING_NOW: readonly Tech[] = ['TypeScript', 'Node.js']
