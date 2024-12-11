import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

const TimelineWave = ({ events, width = 1000, height = 200 }) => {
  const canvasRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const animationRef = useRef(null)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth > 768 ? 700 : window.innerWidth - 48,
        height: 200
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial size

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!events.length || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Clear any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Scale setup
    const xScale = (x) => (x * dimensions.width) / (events.length - 1 || 1)
    const yScale = (y) => dimensions.height / 2 - (y * dimensions.height) / 400

    // Generate base wave points
    const points = Array.from({ length: dimensions.width }, (_, i) => ({
      x: i,
      y: dimensions.height / 2 + Math.sin(i * 0.02) * 10,
      baseY: dimensions.height / 2 + Math.sin(i * 0.02) * 10
    }))

    // Add event influences
    events.forEach((event, i) => {
      const eventX = xScale(i)
      const eventY = yScale(event.happiness || 0)
      const intensity = Math.abs(event.happiness || 0) / 100

      for (let j = 0; j < points.length; j++) {
        const distance = Math.abs(j - eventX)
        const influence = Math.exp(-distance * 0.01) * intensity
        points[j].baseY = points[j].baseY * (1 - influence) + eventY * influence
      }
    })

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)
      
      // Draw wave
      ctx.beginPath()
      points.forEach((point, i) => {
        const vibration = Math.sin(frame * 0.05 + i * 0.1) * 2
        point.y = point.baseY + vibration

        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })

      ctx.strokeStyle = '#0066cc'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw event markers
      events.forEach((event, i) => {
        const x = xScale(i)
        const y = yScale(event.happiness || 0)
        const color = getEmotionColor(event.happiness || 0)

        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })

      frame++
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [events, dimensions])

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="w-full"
    />
  )
}

// Helper function for emotion colors
const getEmotionColor = (happiness) => {
  if (happiness >= 75) return '#9400D3' // Violet
  if (happiness >= 50) return '#4B0082' // Indigo
  if (happiness >= 25) return '#0000FF' // Blue
  if (happiness >= 0) return '#00FF00'  // Green
  if (happiness >= -25) return '#FFFF00' // Yellow
  if (happiness >= -50) return '#FF7F00' // Orange
  return '#FF0000' // Red
}

TimelineWave.propTypes = {
  events: PropTypes.arrayOf(PropTypes.shape({
    happiness: PropTypes.number
  })).isRequired,
  width: PropTypes.number,
  height: PropTypes.number
}

export default TimelineWave 