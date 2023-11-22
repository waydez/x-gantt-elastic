export function checkOs() {
  var isMac = ~(navigator.userAgentData?.platform || navigator.platform || '')
    .toLowerCase()
    .indexOf('mac')
  if (isMac) return { isMac: true }
  return { isWin: true }
}

export function dispatchResize(max, interval) {
  if (!interval && interval !== 0) {
    interval = 20
  }
  let count = max || 1
  const event = new Event('resize', { bubbles: true, cancelable: true })
  const poller = setInterval(() => {
    window.dispatchEvent(event)
    count--
    if (count < 1) {
      clearInterval(poller)
    }
  }, interval)
}

/**
 * Calculate height of scrollbar in current browser
 *
 * @returns {number}
 */
export function getScrollBarHeight() {
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.height = '100px'
  outer.style.msOverflowStyle = 'scrollbar'
  document.body.appendChild(outer)
  var noScroll = outer.offsetHeight
  outer.style.overflow = 'scroll'
  var inner = document.createElement('div')
  inner.style.height = '100%'
  outer.appendChild(inner)
  var withScroll = inner.offsetHeight
  outer.parentNode.removeChild(outer)
  const height = noScroll - withScroll
  return height
}
