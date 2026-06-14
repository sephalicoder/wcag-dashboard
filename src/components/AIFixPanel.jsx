import { useState } from "react"

export default function AIFixPanel({ originalCode }) {
  const [fixedCSS, setFixedCSS] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  async function handleGetFix(e) {
    if (e) e.preventDefault()
    if (!originalCode?.trim()) {
      setError("No component code found. Please analyze a component first.")
      return
    }

    setLoading(true)
    setFixedCSS("")
    setError("")

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: originalCode,
          type: "fix"
        })
      })

      // Show exact error if not ok
      if (!response.ok) {
        const errData = await response.json()
        setError(`Server error ${response.status}: ${errData.error || "Unknown error"}`)
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.result) {
        setFixedCSS(data.result)
      } else {
        setError("AI returned empty response. Please try again.")
      }

    } catch {
      setError("Network error — please check your connection and try again.")
    }

    setLoading(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(fixedCSS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white">✨ AI Auto-Fix</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Gemini rewrites your CSS to pass WCAG AA
          </p>
          {originalCode?.trim() ? (
            <p className="text-xs text-green-500 mt-0.5">
              ✅ Component loaded ({originalCode.length} chars)
            </p>
          ) : (
            <p className="text-xs text-red-400 mt-0.5">
              ⚠️ No component detected
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleGetFix}
          disabled={loading || !originalCode?.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Fixing...
            </>
          ) : (
            "⚡ Get AI Fix"
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Fixed CSS output */}
      {fixedCSS && (
        <div className="space-y-2">
          <div className="relative">
            <pre className="bg-gray-800 text-green-400 text-xs font-mono rounded-lg p-4 overflow-x-auto border border-gray-700 max-h-48">
              {fixedCSS}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-xs text-white px-3 py-1 rounded-md transition-colors"
            >
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            ↑ Paste this into your project to fix the accessibility issues
          </p>
        </div>
      )}
    </div>
  )
}