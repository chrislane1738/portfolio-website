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
    <div className="flex flex-col">
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

      <div className="mt-6 md:mt-8 md:grid md:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] md:gap-12 md:items-start">
        <ul
          onKeyDown={onListKeyDown}
          className="md:h-[520px] md:overflow-y-auto md:py-6 [scrollbar-width:none] md:[mask-image:linear-gradient(to_bottom,transparent,black_28px,black_calc(100%_-_56px),transparent)]"
        >
          {visible.map((p, i) => {
            const selected = p.id === activeId
            const open = p.id === openId
            const first = i === 0
            const last = i === visible.length - 1
            return (
              <li key={p.id}>
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
                  className="group relative w-full grid grid-cols-[68px_16px_minmax(0,1fr)_auto] md:grid-cols-[84px_16px_minmax(0,1fr)_auto] items-center gap-3 md:gap-4 px-2 md:px-3 py-3.5 text-left outline-none rounded-lg focus-visible:bg-bg-elevated"
                >
                  {/* Timeline line: runs through the dot column, trimmed at the ends */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-[96px] md:left-[120px] -translate-x-1/2 w-px bg-white/15 ${first ? 'top-1/2' : 'top-0'} ${last ? 'bottom-1/2' : 'bottom-0'}`}
                  />
                  <span className="text-[12px] md:text-[13px] text-text-subtle tabular-nums">
                    {formatProjectDate(p.date)}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`relative justify-self-center rounded-full transition-all duration-200 ${
                      selected
                        ? 'w-3 h-3 bg-accent shadow-[0_0_0_4px_rgba(163,172,217,0.15),0_0_12px_rgba(163,172,217,0.5)]'
                        : 'w-2 h-2 bg-text-muted group-hover:bg-text-body'
                    }`}
                  />
                  <span
                    className={`md:truncate text-[15px] transition-colors duration-150 ${
                      selected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                    }`}
                  >
                    {p.title}
                  </span>
                  <span className="text-[10px] md:text-[11px] tracking-[0.1em] uppercase text-text-subtle">
                    {TAG_LABELS[p.tag]}
                  </span>
                </button>
                {open && (
                  <div className="md:hidden relative pl-[104px] pr-2 pt-1 pb-8 detail-in">
                    {!last && (
                      <span aria-hidden="true" className="absolute left-[96px] -translate-x-1/2 top-0 bottom-0 w-px bg-white/15" />
                    )}
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

        <aside className="hidden md:block md:pt-6" aria-live="polite">
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
