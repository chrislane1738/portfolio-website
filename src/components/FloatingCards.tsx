'use client'

import { projects } from '@/data/projects'

const projectsWithImages = projects.filter(p => p.image)

// Each card gets a unique CSS animation with different keyframes
// This avoids JS entirely — pure CSS, guaranteed to animate
const cardConfigs = [
  { top: '3%',  left: '2%',  anim: 'drift1', dur: '25s' },
  { top: '5%',  left: '45%', anim: 'drift2', dur: '30s' },
  { top: '18%', left: '22%', anim: 'drift3', dur: '28s' },
  { top: '15%', left: '58%', anim: 'drift4', dur: '22s' },
  { top: '35%', left: '5%',  anim: 'drift5', dur: '26s' },
  { top: '32%', left: '48%', anim: 'drift6', dur: '32s' },
  { top: '48%', left: '28%', anim: 'drift7', dur: '24s' },
  { top: '45%', left: '62%', anim: 'drift8', dur: '27s' },
]

export default function FloatingCards() {
  return (
    <>
      <style jsx global>{`
        @keyframes drift1 {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(80px, -40px); }
          50%  { transform: translate(-30px, 60px); }
          75%  { transform: translate(50px, 30px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift2 {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(-60px, 50px); }
          50%  { transform: translate(40px, -30px); }
          75%  { transform: translate(-40px, -50px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift3 {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(50px, 70px); }
          50%  { transform: translate(-70px, -20px); }
          75%  { transform: translate(30px, -60px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift4 {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(-80px, -30px); }
          50%  { transform: translate(60px, 50px); }
          75%  { transform: translate(-20px, 70px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift5 {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(70px, 40px); }
          50%  { transform: translate(-50px, -60px); }
          75%  { transform: translate(40px, -30px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift6 {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(-40px, 60px); }
          50%  { transform: translate(80px, -40px); }
          75%  { transform: translate(-60px, -20px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift7 {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(60px, -50px); }
          50%  { transform: translate(-40px, 40px); }
          75%  { transform: translate(50px, 60px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift8 {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(-70px, 30px); }
          50%  { transform: translate(30px, -70px); }
          75%  { transform: translate(-50px, 40px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {projectsWithImages.map((project, i) => {
          const cfg = cardConfigs[i % cardConfigs.length]
          return (
            <div
              key={project.id}
              className="absolute"
              style={{
                top: cfg.top,
                left: cfg.left,
                animation: `${cfg.anim} ${cfg.dur} ease-in-out infinite`,
              }}
            >
              <div className="relative w-[200px] md:w-[260px] rounded-sm overflow-hidden border border-[rgba(255,255,255,0.06)] opacity-[0.12]">
                <img
                  src={project.image}
                  alt=""
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 35%, rgba(14,17,22,0.65) 75%, #0e1116 100%)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
