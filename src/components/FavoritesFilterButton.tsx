'use client'

export default function FavoritesFilterButton({
  active,
  onToggle,
}: {
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? 'Show all projects' : 'Show favorite projects only'}
      className={`fixed left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 group flex flex-row items-center gap-2 px-3 py-2 rounded-sm border transition-all duration-300 ${
        active
          ? 'border-accent bg-accent/10 text-accent shadow-[0_0_18px_rgba(91, 207, 135,0.25)]'
          : 'border-[rgba(255,255,255,0.08)] bg-[rgba(14,17,22,0.85)] text-text-body hover:border-accent/40 hover:text-accent'
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span className="font-mono text-[9px] tracking-[2px] uppercase">
        {active ? 'All' : 'Favorites'}
      </span>
    </button>
  )
}
