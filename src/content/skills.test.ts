import { describe, expect, it } from 'vitest'
import { projects } from './projects'
import { learningNow, shippedSkills } from './skills'
import type { Project } from './types'

const shipped = shippedSkills().flatMap((group) => group.skills)

describe('shippedSkills', () => {
  it('only lists a skill that a project proves', () => {
    for (const skill of shipped) {
      expect(skill.provenBy.length, skill.tech).toBeGreaterThan(0)
      for (const proof of skill.provenBy) {
        const project = projects.find((p) => p.slug === proof.slug)
        expect(project?.stack).toContain(skill.tech)
      }
    }
  })

  it('covers every tech a project uses, except the ones I am still learning', () => {
    const used = new Set(projects.flatMap((p) => p.stack))
    const listed = new Set(shipped.map((s) => s.tech))
    for (const tech of used) {
      if (learningNow.includes(tech)) continue
      expect(listed.has(tech), tech).toBe(true)
    }
  })

  it('never shows TypeScript or Node.js as shipped', () => {
    const listed = shipped.map((s) => s.tech)
    expect(listed).not.toContain('TypeScript')
    expect(listed).not.toContain('Node.js')
    expect(learningNow).toEqual(['TypeScript', 'Node.js'])
  })

  it('lists each skill once, most-proven first within a category', () => {
    const techs = shipped.map((s) => s.tech)
    expect(new Set(techs).size).toBe(techs.length)
    for (const group of shippedSkills()) {
      const counts = group.skills.map((s) => s.provenBy.length)
      expect(counts).toEqual(counts.toSorted((a, b) => b - a))
    }
  })

  it('orders proof flagship first', () => {
    const fixture: Project[] = [
      { ...projects.find((p) => p.tier === 'more')!, stack: ['Python'] },
      { ...projects.find((p) => p.tier === 'flagship')!, stack: ['Python'] },
    ]
    const [python] = shippedSkills(fixture).flatMap((g) => g.skills)
    expect(python?.provenBy.map((p) => p.tier)).toEqual(['flagship', 'more'])
  })

  it('drops empty categories', () => {
    const fixture: Project[] = [{ ...projects[0]!, stack: ['Python'] }]
    expect(shippedSkills(fixture).map((g) => g.category)).toEqual(['Languages'])
  })
})
