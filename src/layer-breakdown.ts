import './layer-breakdown.css'

/** 0 = nothing yet, 1–3 = rows, 4 = footer shown */
let step = 0

function revealRow(n: 1 | 2 | 3): void {
  document
    .querySelector<HTMLElement>(`[data-reveal-order="${n}"]`)
    ?.classList.add('is-visible')
}

function revealFooterEl(): void {
  document.getElementById('breakdownFooter')?.classList.add('is-visible')
}

function advanceToStep(target: 1 | 2 | 3 | 4): void {
  while (step < target) {
    step++
    if (step <= 3) revealRow(step as 1 | 2 | 3)
    else revealFooterEl()
  }
}

function advanceOne(): void {
  if (step >= 4) return
  advanceToStep((step + 1) as 1 | 2 | 3 | 4)
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key !== 'ArrowRight' || e.repeat) return
  e.preventDefault()
  advanceOne()
}

document.addEventListener('keydown', onKeyDown)
