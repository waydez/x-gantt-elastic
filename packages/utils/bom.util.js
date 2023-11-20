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
