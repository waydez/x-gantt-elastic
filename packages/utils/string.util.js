function camel2Dash(camel) {
  return camel.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function dash2Camel(dash, upper) {
  if (dash) {
    if (upper) {
      const data = dash.trim()
      dash = data.replace(data[0], data[0].toUpperCase())
    }
    return dash.replace(/-(.)/gi, (m, p1) => {
      return p1.toUpperCase()
    })
  }
  return ''
}

function dash2UpperCamel(dash) {
  return dash2Camel(dash, true)
}

export default {
  camel2Dash,
  dash2Camel,
  dash2UpperCamel
}
