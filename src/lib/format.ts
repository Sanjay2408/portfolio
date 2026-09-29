/** Placeholder for a value that does not exist, e.g. precision on a dataset with no campaigns. */
export const NOT_APPLICABLE = 'n/a'

const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/**
 * A 0 to 1 rate. Two decimals, or three when that is the only way to avoid
 * rounding a real but small rate to zero (0.0052 reads "0.005", not "0.01").
 */
export function formatRate(value: number | null): string {
  if (value === null) return NOT_APPLICABLE
  if (value > 0 && value < 0.01) return value.toFixed(3)
  return value.toFixed(2)
}

/** A 0 to 1 share as a percentage with one decimal. */
export function formatPercent(value: number | null): string {
  if (value === null) return NOT_APPLICABLE
  return `${(value * 100).toFixed(1)}%`
}

/** Whole rupees with thousands separators, matching the source reports. */
export function formatInr(value: number): string {
  return `₹${integer.format(Math.round(value))}`
}

/** A ratio such as containment efficiency: whole numbers from 10x up, two decimals below. */
export function formatMultiplier(value: number | null): string {
  if (value === null) return NOT_APPLICABLE
  return value >= 10 ? `${integer.format(Math.round(value))}×` : `${value.toFixed(2)}×`
}

export function formatCount(value: number): string {
  return integer.format(value)
}
