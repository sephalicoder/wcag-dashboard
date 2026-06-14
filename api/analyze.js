import { checkCORS, checkRateLimit, validateInput, sanitizeInput } from "./security.js"

export default async function handler(req, res) {

  // ✅ Security Check 1 — CORS
  const handled = checkCORS(req, res)
  if (handled) return

  // ✅ Security Check 2 — Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // ✅ Security Check 3 — Rate limiting
  const rateLimited = checkRateLimit(req, res)
  if (rateLimited) return

  // ✅ Security Check 4 — Validate input
  const invalid = validateInput(req, res)
  if (invalid) return

  // ✅ Security Check 5 — Sanitize input
  const { type } = req.body
  const code = sanitizeInput(req.body.code)

  const prompt = type === "fix"
    ? `You are a WCAG accessibility expert.
Rewrite this CSS to fix all accessibility issues — especially contrast ratios to meet WCAG AA (4.5:1 minimum).
Return ONLY the fixed CSS code, no explanation, no markdown backticks, no comments.

Original CSS:
${code}`
    : `You are a WCAG accessibility expert. Analyze this UI component code and give ONE short, specific improvement suggestion (2-3 sentences max) focused on accessibility and contrast:

${code}`

  try {
    const apiKey = globalThis.process?.env?.GEMINI_API_KEY

    // ✅ Security Check 6 — Make sure API key exists
    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error" })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    // ✅ Security Check 7 — Handle Gemini API errors
    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", errorData)
      return res.status(502).json({ error: "AI service error. Please try again." })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return res.status(200).json({ result: text.trim() })

  } catch (error) {
    console.error("Server error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}