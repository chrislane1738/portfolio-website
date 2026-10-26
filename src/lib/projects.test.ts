import { describe, expect, it } from 'vitest'
import { filterProjects, formatProjectDate, moveSelection, resolveSelection, sortProjects, tagCounts } from './projects'

const items = [
  { id: 'a', date: '2026-02', tag: 'tool' as const },
  { id: 'b', date: '2026-07', tag: 'work' as const },
  { id: 'c', date: '2026-07', tag: 'tool' as const },
  { id: 'd', date: '2026-10', tag: 'muse' as const },
]

describe('formatProjectDate', () => {
  it('formats YYYY-MM', () => expect(formatProjectDate('2026-10')).toBe('Oct 2026'))
  it('returns malformed input verbatim', () => {
    expect(formatProjectDate('Oct 2026')).toBe('Oct 2026')
    expect(formatProjectDate('2026-13')).toBe('2026-13')
  })
})

describe('sortProjects', () => {
  it('sorts newest first, keeping file order within a month', () => {
    expect(sortProjects(items).map(p => p.id)).toEqual(['d', 'b', 'c', 'a'])
  })
})

describe('filterProjects / tagCounts', () => {
  it('filters by tag and passes everything for all', () => {
    expect(filterProjects(items, 'tool').map(p => p.id)).toEqual(['a', 'c'])
    expect(filterProjects(items, 'all')).toHaveLength(4)
  })
  it('counts per tag including zeros', () => {
    expect(tagCounts(items)).toEqual({ all: 4, work: 1, muse: 1, venture: 0, tool: 2, club: 0 })
  })
})

describe('resolveSelection', () => {
  it('keeps a visible id', () => expect(resolveSelection(items, 'c')).toBe('c'))
  it('falls back to first item for unknown or filtered-out id', () => {
    expect(resolveSelection(items, 'nope')).toBe('a')
    expect(resolveSelection(filterProjects(items, 'tool'), 'b')).toBe('a')
    expect(resolveSelection(items, null)).toBe('a')
  })
  it('returns null for an empty list', () => expect(resolveSelection([], 'a')).toBeNull())
})

describe('moveSelection', () => {
  it('moves and clamps at the ends', () => {
    expect(moveSelection(items, 'a', 1)).toBe('b')
    expect(moveSelection(items, 'a', -1)).toBe('a')
    expect(moveSelection(items, 'd', 1)).toBe('d')
  })
  it('starts from the first item when nothing valid is selected', () => {
    expect(moveSelection(items, 'nope', 1)).toBe('a')
    expect(moveSelection([], null, 1)).toBeNull()
  })
})
