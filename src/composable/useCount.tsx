import { useState } from 'react'

// Custom hook for counter animation
export const useCountUp = (end: number, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start)
  const [isAnimating, setIsAnimating] = useState(false)

  const animateCount = () => {
    setIsAnimating(true)
    const startTime = performance.now()

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutQuart(progress)
      const current = Math.floor(start + (end - start) * easedProgress)

      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }

  const reset = () => {
    setCount(start)
    setIsAnimating(false)
  }

  return { count, animateCount, reset, isAnimating }
}
