import './landing.css'

const NODE_TICK_MS = 2200
const CLOCK_TICK_MS = 1000
const REVEAL_STAGGER_MS = 80
const COUNT_DURATION_MS = 1800

function initCursorGlow(): void {
  const glow = document.getElementById('cursorGlow')
  if (!glow) return
  document.addEventListener('mousemove', (e: MouseEvent) => {
    glow.style.left = `${e.clientX}px`
    glow.style.top = `${e.clientY}px`
  })
}

function initScrollReveal(): void {
  const reveals = document.querySelectorAll<HTMLElement>('.reveal')
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return
        const target = entry.target as HTMLElement
        window.setTimeout(() => {
          target.classList.add('visible')
        }, i * REVEAL_STAGGER_MS)
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.1 },
  )
  reveals.forEach((el) => observer.observe(el))
}

type NodeState = { id: string; val: number }

const liveNodes: NodeState[] = [
  { id: 'n1', val: 87 },
  { id: 'n2', val: 61 },
  { id: 'n3', val: 28 },
  { id: 'n4', val: 92 },
  { id: 'n5', val: 19 },
  { id: 'n6', val: 54 },
  { id: 'n7', val: 33 },
  { id: 'n8', val: 48 },
]

function nodeClassForValue(v: number): string {
  if (v >= 75) return 'red'
  if (v >= 40) return 'yellow'
  return 'green'
}

function updateLiveNodes(): void {
  for (const n of liveNodes) {
    n.val = Math.max(5, Math.min(99, n.val + (Math.random() * 6 - 3)))
    const v = Math.round(n.val)
    const el = document.getElementById(n.id)
    const span = document.getElementById(`${n.id}v`)
    if (!el || !span) continue
    span.textContent = `${v}%`
    el.className = `node ${nodeClassForValue(v)}`
  }
}

function initLiveNodes(): void {
  window.setInterval(updateLiveNodes, NODE_TICK_MS)
}

function animateCount(el: HTMLElement): void {
  const raw = el.dataset.target
  if (raw === undefined) return
  const target = Number.parseInt(raw, 10)
  if (Number.isNaN(target)) return
  const suffix = el.dataset.suffix ?? ''
  const prefix = el.dataset.prefix ?? ''
  if (prefix === '₹' && target === 0) {
    el.textContent = '₹0'
    return
  }
  let start = 0
  const step = (timestamp: number): void => {
    if (!start) start = timestamp
    const progress = Math.min((timestamp - start) / COUNT_DURATION_MS, 1)
    const eased = 1 - (1 - progress) ** 3
    el.textContent = `${prefix}${Math.round(eased * target)}${suffix}`
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function initStatCounters(): void {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target
          .querySelectorAll<HTMLElement>('.stat-num[data-target]')
          .forEach(animateCount)
        statObserver.unobserve(entry.target)
      })
    },
    { threshold: 0.3 },
  )
  document
    .querySelectorAll<HTMLElement>('.stat-grid')
    .forEach((grid) => statObserver.observe(grid))
}

function initFooterClock(): void {
  const el = document.getElementById('footerTime')
  if (!el) return
  const tick = (): void => {
    el.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false })
  }
  tick()
  window.setInterval(tick, CLOCK_TICK_MS)
}

initCursorGlow()
initScrollReveal()
initLiveNodes()
initStatCounters()
initFooterClock()
