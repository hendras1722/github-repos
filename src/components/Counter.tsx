import { useCountUp } from '@/composable/useCount'
import { useEffect, useRef, useState } from 'react'

const Counter = ({ number, delay = 0 }: { number: number; delay?: number }) => {
  const { count, animateCount } = useCountUp(number, 2000)
  const [hasAnimated, setHasAnimated] = useState(false)
  const counterRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAnimated) {
        animateCount()
        setHasAnimated(true)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, hasAnimated, animateCount])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              animateCount()
              setHasAnimated(true)
            }, delay)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => observer.disconnect()
  }, [delay, hasAnimated, animateCount])

  return (
    <div ref={counterRef}>
      <div>{count.toLocaleString()}</div>
    </div>
  )
}

export default Counter
