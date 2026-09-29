import { shippedProjects } from './projects'
import type { Link, Maybe } from './types'
import { todo } from './types'

export interface Win {
  readonly title: string
  readonly detail: Maybe<string>
  /** Internal project page or external proof. */
  readonly href?: string
}

export interface DesignRole {
  readonly role: string
  readonly org: string
  readonly detail?: string
}

export interface Profile {
  readonly name: string
  readonly shortName: string
  readonly headline: string
  readonly about: string
  readonly email: string
  readonly links: {
    readonly github: string
    readonly linkedin: string
    readonly designWork: string
    readonly source: string
  }
  readonly resume: Maybe<string>
}

const domains = 'fintech, health and ML'

export const profile: Profile = {
  name: 'Sanjay S G',
  shortName: 'Sandy',
  headline: `I learn by shipping. ${shippedProjects.length} projects built across ${domains}.`,
  about:
    'Final-year Computer Science undergrad at RV University, Bengaluru, with a minor in Digital Experience Design. CGPA 9.45. I learn by building, not by studying first. My strongest language is Python, and I am working in TypeScript now.',
  email: 'avpsgsanjay@gmail.com',
  links: {
    github: 'https://github.com/Sanjay2408',
    linkedin: 'https://www.linkedin.com/in/sanjay2408',
    designWork: 'https://canva.link/iyf106enp81r7d4',
    source: 'https://github.com/Sanjay2408/portfolio',
  },
  resume: todo('Add your resume PDF at public/resume.pdf and set this to "/resume.pdf".'),
}

export const wins: readonly Win[] = [
  {
    title: 'Winner, Analytica 3.0',
    detail: todo('One line on what Analytica 3.0 was and what you built or solved.'),
  },
  {
    title: 'Winner, Kalpavikas 1.0 System Design Competition',
    detail: todo('One line on the system you designed.'),
  },
  {
    title: 'Top 10, IIT Hyderabad hackathon',
    detail: 'The original IntelliCredit, which I later rebuilt end to end.',
    href: '/projects/intellicredit',
  },
  {
    title: 'NPTEL Deep Learning certificate',
    detail: todo('Add the score or grade if you want it shown, and a link to the certificate.'),
  },
]

export const design = {
  pitch:
    'I design what I build. Client work for fintech brands is why my products look finished instead of like prototypes.',
  roles: [
    {
      role: 'Senior Graphic Designer',
      org: 'The Crazy Part',
      detail: 'Content for Motilal Oswal and Groww',
    },
    { role: 'Founding designer', org: 'FinFloww' },
    { role: 'Freelance designer', org: 'Red Bull' },
  ] satisfies readonly DesignRole[],
  portfolio: {
    label: 'See my design work',
    href: 'https://canva.link/iyf106enp81r7d4',
  } satisfies Link,
} as const
