import { design, profile, wins } from './profile'
import { projects } from './projects'
import { headlineSentence } from './risk-atlas'

/** Every piece of copy on the site, for tests and tooling that walk all of it. */
export const allContent = {
  projects,
  profile,
  wins,
  design,
  flagship: { headlineSentence },
} as const
