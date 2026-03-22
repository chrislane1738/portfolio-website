export default function SectionDivider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center my-12">
      <div className="flex-1 h-[1px] bg-[rgba(255,255,255,0.06)]" />
      <span className="font-mono text-[10px] text-text-muted tracking-[2px] px-4">
        {label}
      </span>
      <div className="flex-1 h-[1px] bg-[rgba(255,255,255,0.06)]" />
    </div>
  )
}
