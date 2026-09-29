import { projects } from './projects'
import type { Tech, TechCategory } from './tech'
import { LEARNING_NOW, TECH, TECH_CATEGORIES } from './tech'
import type { Project } from './types'

export interface ProvenSkill {
  readonly tech: Tech
  /** Projects that use it, flagship and featured first. */
  readonly provenBy: readonly Pick<Project, 'slug' | 'name' | 'tier'>[]
}

export interface SkillGroup {
  readonly category: TechCategory
  readonly skills: readonly ProvenSkill[]
}

const TIER_ORDER: Record<Project['tier'], number> = { flagship: 0, featured: 1, more: 2 }

/**
 * Skills are derived from project stacks, never listed by hand. A tech only
 * appears if a project uses it, and learning-now techs are never shown as shipped.
 */
export function shippedSkills(source: readonly Project[] = projects): readonly SkillGroup[] {
  const byTech = new Map<Tech, ProvenSkill['provenBy'][number][]>()

  for (const project of source) {
    for (const tech of project.stack) {
      if (LEARNING_NOW.includes(tech)) continue
      const list = byTech.get(tech) ?? []
      list.push({ slug: project.slug, name: project.name, tier: project.tier })
      byTech.set(tech, list)
    }
  }

  return TECH_CATEGORIES.map((category) => ({
    category,
    skills: [...byTech.entries()]
      .filter(([tech]) => TECH[tech] === category)
      .map(([tech, provenBy]) => ({
        tech,
        provenBy: provenBy.toSorted((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]),
      }))
      .toSorted((a, b) => b.provenBy.length - a.provenBy.length || a.tech.localeCompare(b.tech)),
  })).filter((group) => group.skills.length > 0)
}

export const learningNow = LEARNING_NOW
