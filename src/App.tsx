import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import Curtain from './components/Curtain'
import HomePanel from './components/HomePanel'
import ProjectsPanel from './components/ProjectsPanel'
import ExperiencePanel from './components/ExperiencePanel'
import NotesPanel from './components/NotesPanel'
import ArtPanel from './components/ArtPanel'
import EducationPanel from './components/EducationPanel'
import ContactModal from './components/ContactModal'
import PassportStamps from './components/PassportStamps'
import VisitorCounter from './components/VisitorCounter'
import PullDownTab from './components/PullDownTab'
import menuIcon from './asset/menu1.png'
import notesData from './data/notes.json'
import artData from './data/art.json'
import type { TabConfig } from './types'

const RetroArcade = lazy(() => import('./components/RetroArcade'))

const allTabs: TabConfig[] = [
  { id: 'home', label: 'Home', bg: '#f0e681', text: '#2E2A22' },
  { id: 'projects', label: 'Projects', bg: '#a5d5e7', text: '#2E2A22' },
  { id: 'experience', label: 'Experience', bg: '#E7B6C5', text: '#2E2A22' },
  { id: 'education', label: 'Education', bg: '#a6deb0', text: '#2E2A22' },
  { id: 'notes', label: 'Notes', bg: '#cab6db', text: '#2E2A22' },
  { id: 'art', label: 'Artfolio', bg: '#E7C9A9', text: '#2E2A22' },
]

const tabs = allTabs.filter(t =>
  (t.id !== 'notes' || notesData.length > 0) &&
  (t.id !== 'art' || artData.length > 0)
)

const mobileTabs = tabs.slice(0, 2)
const overflowTabs = tabs.slice(2)

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [visitedTabs, setVisitedTabs] = useState<string[]>(['home'])
  const [menuOpen, setMenuOpen] = useState(false)
  const [arcadeOpen, setArcadeOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const clickTimestamps = useRef<number[]>([])
  const hoverRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const current = tabs.find(t => t.id === activeTab)!

  const allVisited = tabs.every(t => visitedTabs.includes(t.id))

  // track visited tabs
  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.includes(activeTab)) return prev
      return [...prev, activeTab]
    })
  }, [activeTab])

  // scroll panel to top on tab switch
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab])

  // 90s ghost cursor trail — desktop only
  useEffect(() => {
    if (window.innerWidth < 768) return

    const LIFE_SPAN = 12
    const MIN_DELAY = 3
    const MAX_DELAY = 20
    let width = window.innerWidth
    let height = window.innerHeight
    const particles: { x: number; y: number; life: number; initial: number }[] = []
    let animationFrame: number

    const baseImage = new Image()
    baseImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath d='M2 1L2 20L7 15L11 22L14 20.5L10 13.5L17 13.5Z' fill='%23000' stroke='%23000' stroke-width='1'/%3E%3Cpath d='M3 3L3 18L7.2 14L11.2 21L13 20L9 13L15.5 13Z' fill='%23fff'/%3E%3C/svg%3E"

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.style.position = 'fixed'
    canvas.style.top = '0px'
    canvas.style.left = '0px'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '9999999999'
    canvas.width = width
    canvas.height = height
    document.body.appendChild(canvas)

    let lastAdd = Date.now()
    let interval = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY

    function onMouseMove(e: MouseEvent) {
      if (lastAdd + interval > Date.now()) return
      lastAdd = Date.now()
      interval = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY
      particles.push({ x: e.clientX, y: e.clientY, life: LIFE_SPAN, initial: LIFE_SPAN })
    }

    function onResize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    function loop() {
      if (particles.length > 0) {
        ctx.clearRect(0, 0, width, height)
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.life--
          if (p.life < 0) { particles.splice(i, 1); continue }
          ctx.globalAlpha = Math.max(p.life / p.initial, 0) * 0.5
          ctx.drawImage(baseImage, p.x, p.y)
        }
        if (particles.length === 0) ctx.clearRect(0, 0, width, height)
      }
      animationFrame = requestAnimationFrame(loop)
    }

    document.body.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', onResize)
    loop()

    return () => {
      cancelAnimationFrame(animationFrame)
      canvas.remove()
      document.body.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // perforated hover magnify — desktop only
  useEffect(() => {
    const el = hoverRef.current
    if (!el) return
    function onMove(e: MouseEvent) {
      el!.style.setProperty('--mx', e.clientX + 'px')
      el!.style.setProperty('--my', e.clientY + 'px')
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: Event) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [menuOpen])

  const tabClass = (isActive: boolean) =>
    `font-['Syne_Mono'] text-[11px] sm:text-xs tracking-[0.06em] uppercase px-4 sm:px-5 py-2 sm:py-2.5 border-none cursor-pointer whitespace-nowrap transition-all duration-150 hover:scale-110 origin-bottom ${
      isActive ? 'translate-y-0 relative z-20' : 'translate-y-2.5 relative z-0'
    }`

  const tabStyle = (tab: TabConfig) => ({
    backgroundColor: tab.bg,
    color: tab.text,
    clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0% 100%)',
    WebkitTextStroke: '0.4px currentColor',
  })

  const isOverflowActive = overflowTabs.some(t => t.id === activeTab)

  return (
    <div
      className="min-h-dvh bg-[#2C2C2C] flex items-center justify-center p-2 sm:p-4 md:p-8"
      style={{
        backgroundImage: `
          radial-gradient(circle, rgba(0,0,0,0.35) 3px, rgba(255,255,255,0.03) 3.5px, transparent 4px),
          radial-gradient(circle, rgba(0,0,0,0.35) 3px, rgba(255,255,255,0.03) 3.5px, transparent 4px)
        `,
        backgroundSize: '14px 14px',
        backgroundPosition: '0 0, 7px 7px',
      }}
    >
      {/* Hover magnify overlay — larger holes revealed near cursor */}
      <div
        ref={hoverRef}
        className="fixed inset-0 pointer-events-none hidden md:block"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(0,0,0,0.45) 5px, rgba(255,255,255,0.05) 5.5px, transparent 6.5px),
            radial-gradient(circle, rgba(0,0,0,0.45) 5px, rgba(255,255,255,0.05) 5.5px, transparent 6.5px)
          `,
          backgroundSize: '14px 14px',
          backgroundPosition: '0 0, 7px 7px',
          WebkitMaskImage: 'radial-gradient(circle 200px at var(--mx, -300px) var(--my, -300px), black 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)',
          maskImage: 'radial-gradient(circle 200px at var(--mx, -300px) var(--my, -300px), black 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)',
        }}
      />

      {/* India flag — large screens only */}
      <div className="hidden xl:block fixed top-4 right-5 z-40">
        <svg width="36" height="25" viewBox="0 0 36 25" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}>
          <rect x="0" y="0" width="36" height="8.33" rx="1" fill="#FF9933" />
          <rect x="0" y="8.33" width="36" height="8.34" fill="#FFFFFF" />
          <rect x="0" y="16.67" width="36" height="8.33" rx="1" fill="#138808" />
          <circle cx="18" cy="12.5" r="3.2" fill="none" stroke="#000080" strokeWidth="0.5" />
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={18}
                y1={12.5}
                x2={18 + Math.cos(angle) * 3}
                y2={12.5 + Math.sin(angle) * 3}
                stroke="#000080"
                strokeWidth="0.3"
              />
            );
          })}
          <circle cx="18" cy="12.5" r="0.6" fill="#000080" />
        </svg>
      </div>

      <ContactModal />
      <Curtain />
      <VisitorCounter />
      <PullDownTab />

      <div className="w-full max-w-[960px] min-h-[80vh] relative">
        {/* Tab nav — desktop: all tabs */}
        <nav className="hidden md:flex gap-1 pl-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={tabClass(activeTab === tab.id)}
              style={tabStyle(tab)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab nav — mobile: Home, Projects, Menu */}
        <nav className="flex md:hidden gap-1 pl-4">
          {mobileTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMenuOpen(false) }}
              className={tabClass(activeTab === tab.id)}
              style={tabStyle(tab)}
            >
              {tab.label}
            </button>
          ))}

          {/* Menu tab */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className={tabClass(isOverflowActive)}
              style={{
                backgroundColor: isOverflowActive ? current.bg : '#E7B6C5',
                color: '#2E2A22',
                clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0% 100%)',
              }}
            >
              <img src={menuIcon} alt="More" className="w-4 h-4 inline-block" />
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 rounded-lg overflow-hidden shadow-lg">
                {overflowTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMenuOpen(false) }}
                    className="block w-full text-left font-['Syne_Mono'] text-[11px] tracking-[0.06em] uppercase px-5 py-2.5 border-none cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: tab.bg,
                      color: tab.text,
                      WebkitTextStroke: '0.4px currentColor',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Folder body */}
        <main
          ref={mainRef}
          className="relative rounded-tr-[20px] rounded-b-[20px] p-6 sm:p-8 md:p-10 lg:p-12 h-[75vh] overflow-y-auto"
          style={{
            backgroundColor: current.bg,
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 4px),
              radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(0,0,0,0.04), transparent 50%)
            `,
            boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 0 rgba(255,255,255,0.15) inset',
          }}
        >
          <div key={activeTab} className={`animate-fade-in ${activeTab === 'home' ? 'h-full' : 'pb-2'}`}>
            {activeTab === 'home' && <HomePanel />}
            {activeTab === 'projects' && <ProjectsPanel />}
            {activeTab === 'experience' && <ExperiencePanel />}
            {activeTab === 'notes' && <NotesPanel />}
            {activeTab === 'art' && <ArtPanel />}
            {activeTab === 'education' && <EducationPanel />}
          </div>
        </main>

        <div className="hidden xl:block">
          <PassportStamps tabs={tabs} visitedTabs={visitedTabs} allVisited={allVisited} />
        </div>

      </div>

      {/* Secret arcade click zone — desktop only, below folder to screen bottom */}
      <div
        className="hidden md:block fixed left-0 right-0 bottom-0 cursor-default select-none"
        style={{ height: 'calc((100vh - 75vh) / 2)' }}
        onClick={() => {
          const now = Date.now()
          const ts = clickTimestamps.current
          ts.push(now)
          if (ts.length > 5) ts.shift()
          if (ts.length === 5 && now - ts[0] < 2500) {
            setArcadeOpen(true)
            ts.length = 0
          }
        }}
      />

      {arcadeOpen && (
        <Suspense fallback={null}>
          <RetroArcade onClose={() => setArcadeOpen(false)} />
        </Suspense>
      )}

      <Analytics />
    </div>
  )
}

export default App
