import { useEffect, useState } from 'react'

function getMatches(query: string) {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(query).matches
}

// Shared responsive hook for behavior that must match the CSS breakpoint
// strategy without duplicating media query listener setup in components.
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => getMatches(query))

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)

    const handleChange = () => {
      setMatches(mediaQueryList.matches)
    }

    handleChange()

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handleChange)

      return () => {
        mediaQueryList.removeEventListener('change', handleChange)
      }
    }

    mediaQueryList.addListener(handleChange)

    return () => {
      mediaQueryList.removeListener(handleChange)
    }
  }, [query])

  return matches
}
