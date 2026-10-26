import type { ProjectTag } from '@/data/projects'

export type TagFilter = ProjectTag | 'all'

export const TAG_ORDER: ProjectTag[] = ['work', 'muse', 'venture', 'tool', 'club']

export const TAG_LABELS: Record<ProjectTag, string> = {
  work: 'Work',
  muse: 'Muse',
  venture: 'Venture',
  tool: 'Tool',
  club: 'Club',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatProjectDate(date: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(date)
  const month = match ? Number(match[2]) : 0
  if (!match || month < 1 || month > 12) return date
  return `${MONTHS[month - 1]} ${match[1]}`
}

/** Newest first. Array.prototype.sort is stable, so same-month items keep file order. */
export function sortProjects<T extends { date: string }>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date))
}

export function filterProjects<T extends { tag: ProjectTag }>(list: readonly T[], filter: TagFilter): T[] {
  return filter === 'all' ? [...list] : list.filter(p => p.tag === filter)
}

export function tagCounts(list: readonly { tag: ProjectTag }[]): Record<TagFilter, number> {
  const counts: Record<TagFilter, number> = { all: list.length, work: 0, muse: 0, venture: 0, tool: 0, club: 0 }
  for (const p of list) counts[p.tag]++
  return counts
}

/** The selected id if it's in the list, otherwise the first item's id. */
export function resolveSelection(list: readonly { id: string }[], id: string | null): string | null {
  if (id && list.some(p => p.id === id)) return id
  return list[0]?.id ?? null
}

/** Step the selection by one row, clamped to the ends of the list. */
export function moveSelection(list: readonly { id: string }[], id: string | null, delta: 1 | -1): string | null {
  const index = list.findIndex(p => p.id === id)
  if (index === -1) return list[0]?.id ?? null
  const next = Math.min(list.length - 1, Math.max(0, index + delta))
  return list[next].id
}
