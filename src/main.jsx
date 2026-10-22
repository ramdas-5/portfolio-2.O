import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Lenis from 'lenis'

// Inertia smooth scrolling for the whole page. Users who ask for reduced
// motion get native, unsmoothed scrolling instead.
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

const lenis = new Lenis(prefersReducedMotion ? { smoothWheel: false } : {})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

// Glide to sections when a nav link (#about, #home, ...) is clicked
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]')
  if (!link) return
  const hash = link.getAttribute('href')
  if (!hash || hash === '#') return
  const target = document.querySelector(hash)
  if (!target) return
  e.preventDefault()
  window.history.replaceState(null, '', hash)
  lenis.scrollTo(target, { offset: -24, immediate: prefersReducedMotion })
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
