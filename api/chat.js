import { checkCORS, checkRateLimit, sanitizeInput } from "./security.js"

export default async function handler(req, res) {

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

  const wcagAA = analysisResult?.wcagAA ? "Pass" : "Fail"
  const wcagAAA = analysisResult?.wcagAAA ? "Pass" : "Fail"
  const ratio = analysisResult?.contrastRatio || "N/A"
  const fg = analysisResult?.fg || "N/A"
  const bg = analysisResult?.bg || "N/A"

  const context = "You are a friendly WCAG accessibility expert assistant. "
    + "The user has pasted a UI component and got these results. "
    + "Component Code: " + cleanCode + " "
    + "Analysis Results: "
    + "Contrast Ratio: " + ratio + ":1, "
    + "WCAG AA: " + wcagAA + ", "
    + "WCAG AAA: " + wcagAAA + ", "
    + "Foreground color: " + fg + ", "
    + "Background color: " + bg + ". "
    + "Answer the user question in a helpful, conversational way. "
    + "Keep answers short (3-5 sentences max). "
    + "If they ask for color suggestions, give specific hex codes. "
    + "If they ask for code, give a small CSS snippet."

  try {
    // eslint-disable-next-line no-undef
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error" })
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: context },
            { role: "user", content: message }
          ],
          max_tokens: 1000
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Groq chat error:", errorData)
      return res.status(502).json({ error: "AI service error. Please try again." })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ""

    return res.status(200).json({ result: text.trim() })

  } catch (error) {
    console.error("Chat error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}