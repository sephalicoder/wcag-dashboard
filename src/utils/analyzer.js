function extractColors(code) {
  const matches = code.match(/#([0-9a-fA-F]{3,6})/g) || []
  return [...new Set(matches)]
}

function hexToLuminance(hex) {
  let c = hex.replace("#", "")
  if (c.length === 3) c = c.split("").map(x => x + x).join("")
  const [r, g, b] = [0, 2, 4].map(i => {
    const val = parseInt(c.slice(i, i + 2), 16) / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(hex1, hex2) {
  const l1 = hexToLuminance(hex1)
  const l2 = hexToLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100
}

export async function analyzeComponent(code) {
  const colors = extractColors(code)
  const fg = colors[0] || "#ffffff"
  const bg = colors[1] || "#000000"

  const ratio = contrastRatio(fg, bg)
  const wcagAA = ratio >= 4.5
  const wcagAAA = ratio >= 7

  let suggestion = "No AI suggestion available."

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, type: "suggest" })
    })
    const data = await response.json()
    suggestion = data.result || suggestion
  } catch (e) {
    console.error("API error:", e)
  }

  return { contrastRatio: ratio, wcagAA, wcagAAA, suggestion, fg, bg }
}