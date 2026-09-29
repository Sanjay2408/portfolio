'use client'

import { useEffect } from 'react'
import { Moon, Sun } from './icons'

const STORAGE_KEY = 'theme'

function apply(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme
}

export function ThemeToggle() {
  // Follow OS changes until the visitor picks a theme themselves.
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return
      } catch {
        // Storage can be blocked; fall through and follow the OS.
      }
      apply(event.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // The theme still changes for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface hover:text-ink"
    >
      {/* Both icons render; CSS shows the right one, so server and client markup match. */}
      <Sun className="theme-icon-sun size-[18px]" />
      <Moon className="theme-icon-moon size-[18px]" />
    </button>
  )
}
