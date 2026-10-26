'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { projects } from '@/data/projects'
import {
  TAG_LABELS,
  TAG_ORDER,
  filterProjects,
  formatProjectDate,
  moveSelection,
  resolveSelection,
  sortProjects,
  tagCounts,
  type TagFilter,
} from '@/lib/projects'
import ProjectDetail from './ProjectDetail'

const sorted = sortProjects(projects)
const counts = tagCounts(sorted)
const FILTERS: TagFilter[] = ['all', ...TAG_ORDER]

export default function ProjectIndex() {
  const [filter, setFilter] = useState<TagFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Mobile only: which row is expanded inline.
  const [openId, setOpenId] = useState<string | null>(null)
  const rowRefs = useRef(new Map<string, HTMLButtonElement>())

  const visible = useMemo(() => filterProjects(sorted, filter), [filter])
  const activeId = resolveSelection(visible, selectedId)
  const active = visible.find(p => p.id === activeId) ?? null

  // Deep link: /projects?p=<id>
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('p')
    if (id && sorted.some(p => p.id === id)) {
      setSelectedId(id)
      setOpenId(id)
      rowRefs.current.get(id)?.scrollIntoView({ block: 'nearest' })
    }
  }, [])

  // Mirror selection in the URL so a project can be linked directly.
  useEffect(() => {
    // Leave the URL alone until something has actually been picked.
    if (!activeId || selectedId === null) return
    const url = new URL(window.location.href)
    if (url.searchParams.get('p') === activeId) return
    url.searchParams.set('p', activeId)
    window.history.replaceState(null, '', url)
  }, [activeId, selectedId])

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = moveSelection(visible, activeId, e.key === 'ArrowDown' ? 1 : -1)
      if (next) {
        setSelectedId(next)
        rowRefs.current.get(next)?.focus()
      }
    } else if (e.key === 'Enter' && active?.link) {
      e.preventDefault()
      if (active.link.external) window.open(active.link.url, '_blank', 'noopener,noreferrer')
      else window.location.assign(active.link.url)
    }
  }

  return (
    <div className="flex flex-col md:flex-1 md:min-h-0">
      <div
        role="tablist"
        aria-label="Filter projects"
        className="flex gap-2 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 [scrollbar-width:none]"
      >
        {FILTERS.map(t => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={filter === t}
            onClick={() => setFilter(t)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200 ${
              filter === t
                ? 'border-accent/50 bg-accent-dim text-text-primary'
                : 'border-hairline text-text-body hover:text-text-primary'
            }`}
          >
            {t === 'all' ? 'All' : TAG_LABELS[t]}
            <span className="ml-1.5 text-text-subtle tabular-nums">{counts[t]}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 md:mt-8 md:flex-1 md:min-h-0 md:grid md:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] md:gap-12">
        <ul
          onKeyDown={onListKeyDown}
          className="md:overflow-y-auto md:min-h-0 md:pb-12 border-t border-hairline [scrollbar-width:none] md:[mask-image:linear-gradient(to_bottom,black_calc(100%_-_56px),transparent)]"
        >
          {visible.map(p => {
            const selected = p.id === activeId
            const open = p.id === openId
            return (
              <li key={p.id} className="border-b border-hairline">
                <button
                  ref={el => {
                    if (el) rowRefs.current.set(p.id, el)
                    else rowRefs.current.delete(p.id)
                  }}
                  type="button"
                  aria-current={selected || undefined}
                  aria-expanded={open}
                  onMouseEnter={() => setSelectedId(p.id)}
                  onFocus={() => setSelectedId(p.id)}
                  onClick={() => {
                    setSelectedId(p.id)
                    setOpenId(o => (o === p.id ? null : p.id))
                  }}
                  className={`w-full grid grid-cols-[68px_minmax(0,1fr)_auto] md:grid-cols-[84px_minmax(0,1fr)_auto] items-baseline gap-3 md:gap-4 px-2 md:px-3 py-3.5 text-left outline-none transition-colors duration-150 focus-visible:bg-bg-elevated ${
                    selected ? 'md:bg-bg-elevated' : 'md:hover:bg-bg-elevated'
                  }`}
                >
                  <span className="text-[12px] md:text-[13px] text-text-subtle tabular-nums">
                    {formatProjectDate(p.date)}
                  </span>
                  <span
                    className={`md:truncate text-[15px] transition-colors duration-150 ${
                      selected ? 'md:text-text-primary text-text-secondary' : 'text-text-secondary'
                    }`}
                  >
                    {p.title}
                  </span>
                  <span className="text-[10px] md:text-[11px] tracking-[0.1em] uppercase text-text-subtle">
                    {TAG_LABELS[p.tag]}
                  </span>
                </button>
                {open && (
                  <div className="md:hidden px-2 pt-2 pb-8 detail-in">
                    <ProjectDetail project={p} />
                  </div>
                )}
              </li>
            )
          })}
          {visible.length === 0 && (
            <li className="py-10 text-center text-[14px] text-text-subtle">Nothing here yet.</li>
          )}
        </ul>

        <aside className="hidden md:block md:overflow-y-auto md:min-h-0 [scrollbar-width:none]" aria-live="polite">
          {active && (
            <div key={active.id} className="detail-in">
              <ProjectDetail project={active} />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
