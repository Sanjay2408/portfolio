import { describe, expect, it } from 'vitest'
import {
  formatCount,
  formatInr,
  formatMultiplier,
  formatPercent,
  formatRate,
  NOT_APPLICABLE,
} from './format'

describe('formatRate', () => {
  it('uses two decimals for ordinary rates', () => {
    expect(formatRate(0.5828)).toBe('0.58')
    expect(formatRate(1)).toBe('1.00')
    expect(formatRate(0.857)).toBe('0.86')
  })

  it('keeps a small non-zero rate from rounding to zero', () => {
    expect(formatRate(0.0052)).toBe('0.005')
  })

  it('shows zero as zero', () => {
    expect(formatRate(0)).toBe('0.00')
  })

  it('marks a missing rate as not applicable', () => {
    expect(formatRate(null)).toBe(NOT_APPLICABLE)
  })
})

describe('formatPercent', () => {
  it('shows one decimal', () => {
    expect(formatPercent(0.9948)).toBe('99.5%')
    expect(formatPercent(0.9497)).toBe('95.0%')
  })

  it('marks a missing share as not applicable', () => {
    expect(formatPercent(null)).toBe(NOT_APPLICABLE)
  })
})

describe('formatInr', () => {
  it('rounds to whole rupees with separators', () => {
    expect(formatInr(594799.03)).toBe('₹594,799')
    expect(formatInr(1711.69)).toBe('₹1,712')
    expect(formatInr(0)).toBe('₹0')
  })
})

describe('formatMultiplier', () => {
  it('rounds large ratios to whole numbers', () => {
    expect(formatMultiplier(376.54)).toBe('377×')
    expect(formatMultiplier(81.7)).toBe('82×')
  })

  it('keeps two decimals below 10x', () => {
    expect(formatMultiplier(2.18)).toBe('2.18×')
  })

  it('marks a missing ratio as not applicable', () => {
    expect(formatMultiplier(null)).toBe(NOT_APPLICABLE)
  })
})

describe('formatCount', () => {
  it('adds thousands separators', () => {
    expect(formatCount(4573)).toBe('4,573')
    expect(formatCount(0)).toBe('0')
  })
})
