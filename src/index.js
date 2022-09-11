import { Controller } from '@hotwired/stimulus'
import CableReady from 'cable_ready'
import { gsap } from 'gsap'

const dasherize = string => {
  return string.replace(/[A-Z]/g, function (char, index) {
    return (index !== 0 ? '-' : '') + char.toLowerCase()
  })
}

export default class extends Controller {
  static values = { duration: Number }

  initialize () {
    this.operations = Object.keys(CableReady.DOMOperations).map(key =>
      dasherize(key)
    )
    this.duration = 7
  }

  connect () {
    this.operations.forEach(operation =>
      document.addEventListener(
        `cable-ready:after-${operation}`,
        this.intercept
      )
    )
  }

  disconnect () {
    this.operations.forEach(operation =>
      document.removeEventListener(
        `cable-ready:after-${operation}`,
        this.intercept
      )
    )
  }

  durationValueChanged () {
    this.duration = this.durationValue
  }

  intercept = ({ detail, target, type }) => {
    if (target !== document) {
      const body = target === document.body
      const style = getComputedStyle(target)
      const border = style.getPropertyValue('border')
      const title = document.createElement('div')
      const overlay = document.createElement('div')
      const eventType = type.split('after-')[1]
      const color = eventType === 'morph' ? '#FF9800' : '#0F0'
      const d = detail.stimulusReflex
      const titleTarget = (d && d.target) || ''
      const reflexId = (d && d.reflexId) || ''

      setTimeout(() => {
        const t_rect = target.getBoundingClientRect()
        const rect = body ? { top: 56, left: 0 } : t_rect
        const titleTop = rect.top - 56 + Math.round(scrollY)
        const oTop = body ? 0 : t_rect.top + Math.round(scrollY)

        title.style.cssText = `position:absolute;z-index:5001;top:${titleTop}px;left:${rect.left}px;background-color:#fff;padding: 3px 8px 3px 8px;border: 1px solid #000;pointer-events: none;`
        title.innerHTML = `${eventType} <b>${titleTarget}</b> \u2192 ${detail.selector}<br><small>${reflexId}</small>`

        overlay.style.cssText = `position:absolute;z-index:5000;top:${oTop}px;left:${t_rect.left}px;width:${t_rect.width}px;height:${t_rect.height}px;background-color: ${color};pointer-events: none;`
        overlay.style.border = border

        document.body.appendChild(title)
        document.body.appendChild(overlay)

        gsap.fromTo(
          overlay,
          {
            opacity: 1.0
          },
          {
            opacity: 0,
            duration: this.duration,
            ease: 'expo',
            onComplete: () => {
              title.remove()
              overlay.remove()
            }
          }
        )
      })
    }
  }
}
