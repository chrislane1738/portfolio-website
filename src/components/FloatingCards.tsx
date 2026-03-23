'use client'

import { projects } from '@/data/projects'

const projectsWithImages = projects.filter(p => p.image)

// Each card gets a unique CSS animation with different keyframes
// This avoids JS entirely — pure CSS, guaranteed to animate
const cardConfigs = [
  { top: '2%',  left: '0%',  anim: 'drift1', dur: '25s' },
  { top: '5%',  left: '50%', anim: 'drift2', dur: '30s' },
  { top: '25%', left: '25%', anim: 'drift3', dur: '28s' },
  { top: '20%', left: '65%', anim: 'drift4', dur: '22s' },
  { top: '50%', left: '5%',  anim: 'drift5', dur: '26s' },
  { top: '45%', left: '55%', anim: 'drift6', dur: '32s' },
  { top: '65%', left: '30%', anim: 'drift7', dur: '24s' },
  { top: '60%', left: '70%', anim: 'drift8', dur: '27s' },
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
              <div className="relative w-[280px] md:w-[340px] rounded-sm overflow-hidden border border-[rgba(255,255,255,0.06)] opacity-[0.12]">
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
