import { checkCORS, checkRateLimit, validateInput, sanitizeInput } from "./security.js"

export default async function handler(req, res) {

  // Security checks
  const handled = checkCORS(req, res)
  if (handled) return

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const rateLimited = checkRateLimit(req, res)
  if (rateLimited) return

  const { message, componentCode, analysisResult } = req.body

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" })
  }

  if (message.length > 500) {
    return res.status(400).json({ error: "Message too long" })
  }

  const cleanCode = sanitizeInput(componentCode || "")

  // Build a smart system context
  const context = `
You are a friendly WCAG accessibility expert assistant.
The user has pasted a UI component and got these results:

Component Code:
${cleanCode}

Analysis Results:
- Contrast Ratio: ${analysisResult?.contrastRatio}:1
- WCAG AA: ${analysisResult?.wcagAA ? "Pass ✅" : "Fail ❌"}
- WCAG AAA: ${analysisResult?.wcagAAA ? "Pass ✅" : "Fail ❌"}
- Foreground color: ${analysisResult?.fg}
- Background color: ${analysisResult?.bg}

Answer the user's question in a helpful, conversational way.
Keep answers short (3-5 sentences max).
If they ask for color suggestions, give specific hex codes.
If they ask for code, give a small CSS snippet.
`

  try {
    const apiKey = globalThis.process?.env?.GEMINI_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error" })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: context }],
              role: "user"
            },
            {
              parts: [{ text: "Understood! I'm ready to help with accessibility questions about this component." }],
              role: "model"
            },
            {
              parts: [{ text: message }],
              role: "user"
            }
          ]
        })
      }
    )

    if (!response.ok) {
      return res.status(502).json({ error: "AI service error. Please try again." })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return res.status(200).json({ result: text.trim() })

  } catch (error) {
    console.error("Chat error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}