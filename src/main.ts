import './style.css'

type Sensor = {
  name: string
  level: number
  top: string
  left: string
}

const sensors: Sensor[] = [
  { name: 'Dharavi', level: 82, top: '14%', left: '22%' },
  { name: 'Andheri East', level: 45, top: '18%', left: '68%' },
  { name: 'Kurla', level: 68, top: '42%', left: '38%' },
  { name: 'Bandra', level: 35, top: '28%', left: '52%' },
  { name: 'Powai', level: 91, top: '58%', left: '72%' },
  { name: 'Chembur', level: 52, top: '48%', left: '18%' },
  { name: 'Borivali', level: 28, top: '72%', left: '48%' },
  { name: 'Worli', level: 71, top: '62%', left: '88%' },
]

function nodeStyles(level: number): { background: string; boxShadow: string } {
  if (level > 75) {
    return {
      background: '#ef4444',
      boxShadow: '0 0 22px rgba(239, 68, 68, 0.55), 0 0 42px rgba(239, 68, 68, 0.2)',
    }
  }
  if (level >= 40) {
    return {
      background: '#f59e0b',
      boxShadow: '0 0 22px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.18)',
    }
  }
  return {
    background: '#22c55e',
    boxShadow: '0 0 22px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.18)',
  }
}

function formatUpdated(): string {
  return new Date().toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

type AlertStatus = 'critical' | 'warning' | 'clear'

type Alert = {
  area: string
  level: number
  status: AlertStatus
  timestamp: string
}

const alerts: Alert[] = [
  {
    area: 'Dharavi',
    level: 82,
    status: 'critical',
    timestamp: '14:32 · Today',
  },
  {
    area: 'Andheri East',
    level: 45,
    status: 'warning',
    timestamp: '14:18 · Today',
  },
  {
    area: 'Powai',
    level: 91,
    status: 'critical',
    timestamp: '14:05 · Today',
  },
  {
    area: 'Kurla',
    level: 68,
    status: 'warning',
    timestamp: '13:51 · Today',
  },
  {
    area: 'Bandra',
    level: 35,
    status: 'clear',
    timestamp: '13:40 · Today',
  },
]

function badgeClasses(status: AlertStatus): string {
  switch (status) {
    case 'critical':
      return 'border border-red-500/35 bg-red-500/15 text-red-300'
    case 'warning':
      return 'border border-amber-500/35 bg-amber-500/15 text-amber-300'
    case 'clear':
      return 'border border-emerald-500/35 bg-emerald-500/15 text-emerald-300'
  }
}

function badgeLabel(status: AlertStatus): string {
  switch (status) {
    case 'critical':
      return 'Critical'
    case 'warning':
      return 'Warning'
    case 'clear':
      return 'Clear'
  }
}

const alertsHtml = alerts
  .map((a) => {
    const isCritical = a.status === 'critical'
    const cardClass = isCritical
      ? 'alert-card-critical flex flex-col rounded-lg border border-red-500/25 bg-[#141b2e]/90 p-3.5'
      : 'flex flex-col rounded-lg border border-white/[0.08] bg-[#141b2e]/90 p-3.5'
    const dispatchBtn = isCritical
      ? `<div class="mt-3 border-t border-white/[0.08] pt-3">
          <p class="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">Zone response</p>
          <button
            type="button"
            data-dispatch-zone="${a.area}"
            class="w-full rounded-md bg-red-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-[0_0_12px_rgba(239,68,68,0.35)] transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            aria-label="Dispatch robot to ${a.area}"
          >Dispatch robot · ${a.area}</button>
        </div>`
      : ''
    return `
      <article class="${cardClass}">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-white">${a.area}</p>
            <p class="mt-0.5 text-xs text-slate-500">${a.timestamp}</p>
          </div>
          <span class="shrink-0 self-start rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClasses(a.status)}">${badgeLabel(a.status)}</span>
        </div>
        <p class="mt-2 text-xs text-slate-400">Waste level <span class="font-medium text-slate-200">${a.level}%</span></p>
        ${dispatchBtn}
      </article>
    `
  })
  .join('')

type LiveWorker = {
  id: string
  name: string
  location: string
  ppm: number
}

const liveWorkers: LiveWorker[] = [
  { id: 'w1', name: 'Vikram Mehta', location: 'Dharavi — Sector 4', ppm: 28 },
  { id: 'w2', name: 'Sunita Rao', location: 'Kurla — Waste Bay B', ppm: 46 },
  { id: 'w3', name: 'Ramesh Patil', location: 'Powai — Sorting Line', ppm: 52 },
]

/** SOS flash message expires (ms since epoch). */
const sosFlashUntil = new Map<string, number>()

function fluctuateGas(w: LiveWorker): void {
  const drift = (Math.random() - 0.5) * 6
  let next = w.ppm + drift
  next = Math.max(0, Math.min(92, next))
  w.ppm = Math.round(next * 10) / 10
}

function renderWorkerSafety(): void {
  const root = document.getElementById('worker-safety-cards')
  if (!root) return

  const now = Date.now()
  const expiredSos: string[] = []
  for (const [id, until] of sosFlashUntil) {
    if (until <= now) expiredSos.push(id)
  }
  for (const id of expiredSos) sosFlashUntil.delete(id)

  root.innerHTML = liveWorkers
    .map((w) => {
      const isAlert = w.ppm >= 50
      const cardBase =
        'flex min-h-full min-w-0 flex-col rounded-xl border bg-[#141b2e]/95 p-4 ring-1 ring-white/[0.04]'
      const cardClass = isAlert
        ? `${cardBase} worker-card-alert border-red-500/40`
        : `${cardBase} border-white/[0.08]`
      const badgeClass = isAlert
        ? 'border border-red-500/40 bg-red-500/20 text-base font-bold tracking-wide text-red-200'
        : 'border border-emerald-500/35 bg-emerald-500/15 text-base font-bold tracking-wide text-emerald-200'
      const ppmClass = isAlert ? 'text-red-300' : 'text-slate-200'
      const flashEnd = sosFlashUntil.get(w.id)
      const showSosFlash = flashEnd !== undefined && flashEnd > now
      const sosBlock = isAlert
        ? `
        <button
          type="button"
          data-worker-sos="${w.id}"
          class="mt-3 w-full rounded-md border border-red-400/40 bg-red-600 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_14px_rgba(239,68,68,0.45)] transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >SOS</button>
        ${
          showSosFlash
            ? '<p class="sos-notified-flash mt-2 text-center text-[11px] font-semibold leading-snug text-red-300">Emergency services notified</p>'
            : ''
        }
      `
        : ''
      return `
      <article class="${cardClass}">
        <p class="text-sm font-semibold text-white">${w.name}</p>
        <p class="mt-1 text-xs leading-relaxed text-slate-500">Location · <span class="text-slate-400">${w.location}</span></p>
        <p class="mt-3 flex items-baseline justify-between gap-2 text-xs text-slate-400">
          <span>Gas</span>
          <span class="font-mono text-sm font-medium tabular-nums ${ppmClass}">${w.ppm.toFixed(1)} ppm</span>
        </p>
        <div class="mt-3 flex justify-center">
          <span class="rounded-lg px-4 py-1.5 ${badgeClass}">${isAlert ? 'Alert' : 'Safe'}</span>
        </div>
        ${sosBlock}
      </article>
    `
    })
    .join('')
}

const WORKER_TICK_MS = 2800

function initLayoutToggles(): void {
  const alertsPanel = document.getElementById('panel-alerts')
  const workerPanel = document.getElementById('panel-worker-safety')
  const btnAlerts = document.getElementById('toggle-alerts')
  const btnWorker = document.getElementById('toggle-worker')
  if (!alertsPanel || !workerPanel || !btnAlerts || !btnWorker) return

  const pa = alertsPanel
  const pw = workerPanel
  const bAlerts = btnAlerts as HTMLButtonElement
  const bWorker = btnWorker as HTMLButtonElement

  const knobAlerts = bAlerts.querySelector<HTMLElement>('.switch-knob')
  const knobWorker = bWorker.querySelector<HTMLElement>('.switch-knob')

  let alertsOn = true
  let workerOn = true

  const trackOn = 'bg-emerald-600'
  const trackOff = 'bg-slate-700'
  const knobOn = 'translate-x-5'
  const knobOff = 'translate-x-0.5'

  function paintSwitch(
    btn: HTMLButtonElement,
    knob: HTMLElement | null,
    on: boolean,
  ): void {
    btn.setAttribute('aria-pressed', String(on))
    btn.setAttribute('aria-checked', String(on))
    btn.classList.toggle(trackOn, on)
    btn.classList.toggle(trackOff, !on)
    if (knob) {
      knob.classList.toggle(knobOn, on)
      knob.classList.toggle(knobOff, !on)
    }
  }

  function applyPanels(): void {
    pa.classList.toggle('hidden', !alertsOn)
    pw.classList.toggle('hidden', !workerOn)
    paintSwitch(bAlerts, knobAlerts, alertsOn)
    paintSwitch(bWorker, knobWorker, workerOn)
  }

  bAlerts.addEventListener('click', () => {
    alertsOn = !alertsOn
    applyPanels()
  })
  bWorker.addEventListener('click', () => {
    workerOn = !workerOn
    applyPanels()
  })

  applyPanels()
}

const DISPATCH_MAP_HIGHLIGHT_MS = 2200

function initDispatchZoneLinks(): void {
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-dispatch-zone]',
    )
    if (!btn) return
    const zone = btn.getAttribute('data-dispatch-zone')
    if (!zone) return
    const sel = `[data-map-zone="${CSS.escape(zone)}"]`
    const marker = document.querySelector<HTMLElement>(sel)
    if (!marker) return
    marker.classList.remove('map-zone-highlight')
    void marker.offsetWidth
    marker.classList.add('map-zone-highlight')
    window.setTimeout(() => {
      marker.classList.remove('map-zone-highlight')
    }, DISPATCH_MAP_HIGHLIGHT_MS)
  })
}

function initWorkerSafety(): void {
  const root = document.getElementById('worker-safety-cards')
  if (!root) return

  root.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-worker-sos]')
    if (!btn) return
    const id = btn.getAttribute('data-worker-sos')
    if (!id) return
    sosFlashUntil.set(id, Date.now() + 5000)
    renderWorkerSafety()
  })

  window.setInterval(() => {
    for (const w of liveWorkers) fluctuateGas(w)
    renderWorkerSafety()
  }, WORKER_TICK_MS)

  renderWorkerSafety()
}

const app = document.querySelector<HTMLDivElement>('#app')!
app.className =
  'flex h-svh max-h-svh min-h-0 flex-col overflow-hidden bg-[#0a0f1a] font-sans text-slate-200 antialiased'

const nodesHtml = sensors
  .map((s) => {
    const st = nodeStyles(s.level)
    return `
      <div class="absolute flex flex-col items-center -translate-x-1/2" data-map-zone="${s.name}" style="top: ${s.top}; left: ${s.left};">
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-white/10"
          style="background: ${st.background}; box-shadow: ${st.boxShadow};"
        >${s.level}%</div>
        <span class="mt-2 max-w-[7.5rem] text-center text-xs font-medium text-slate-400">${s.name}</span>
      </div>
    `
  })
  .join('')

app.innerHTML = `
  <header class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-white/[0.06] px-4 py-3 sm:px-6 sm:py-4">
    <div class="flex flex-wrap items-center gap-4 sm:gap-6">
      <h1 class="text-xl font-semibold tracking-tight text-white">KleenNet</h1>
      <div class="flex items-center gap-2">
        <span class="relative flex h-2.5 w-2.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </span>
        <span class="text-sm font-medium text-emerald-400/95">Live</span>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-4 sm:gap-6">
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-slate-500">Alerts</span>
        <button
          type="button"
          id="toggle-alerts"
          class="relative inline-flex h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 bg-emerald-600"
          aria-pressed="true"
          role="switch"
          aria-label="Toggle Active Alerts sidebar"
        >
          <span class="switch-knob pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform translate-x-5" aria-hidden="true"></span>
        </button>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-slate-500">Workers</span>
        <button
          type="button"
          id="toggle-worker"
          class="relative inline-flex h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 bg-emerald-600"
          aria-pressed="true"
          role="switch"
          aria-label="Toggle Worker Safety panel"
        >
          <span class="switch-knob pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform translate-x-5" aria-hidden="true"></span>
        </button>
      </div>
      <p id="last-updated" class="text-sm text-slate-500"></p>
    </div>
  </header>
  <main class="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden md:gap-0 md:p-0">
    <div class="order-2 flex min-h-[min(45vh,420px)] min-w-0 flex-1 flex-col gap-4 p-4 sm:p-6 md:order-1 md:min-h-0 md:gap-4 md:py-6 md:pl-6 md:pr-3">
      <div class="city-map relative min-h-[200px] w-full flex-1 overflow-hidden rounded-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:min-h-0">
        ${nodesHtml}
      </div>
      <section id="panel-worker-safety" class="shrink-0 rounded-xl border border-white/[0.06] bg-[#0f1628] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-5 sm:py-4">
        <h2 class="text-sm font-semibold tracking-tight text-white">Worker Safety</h2>
        <div id="worker-safety-cards" class="mt-3 grid grid-cols-1 gap-3 min-[560px]:grid-cols-3"></div>
      </section>
    </div>
    <aside id="panel-alerts" class="order-1 box-border flex max-h-[min(52vh,480px)] w-full shrink-0 flex-col border-b border-white/[0.08] bg-[#0f1628] px-4 py-4 sm:px-5 md:order-2 md:max-h-none md:h-full md:min-h-0 md:w-[300px] md:shrink-0 md:border-b-0 md:border-l md:px-4 md:py-6">
      <h2 class="shrink-0 text-base font-semibold tracking-tight text-white">Active Alerts</h2>
      <div class="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto md:overflow-y-auto">
        ${alertsHtml}
      </div>
    </aside>
  </main>
`

const el = document.getElementById('last-updated')
if (el) el.textContent = `Last updated ${formatUpdated()}`

initLayoutToggles()
initDispatchZoneLinks()
initWorkerSafety()
