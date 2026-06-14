import { useState } from "react"

export default function AIFixPanel({ originalCode }) {
  const [fixedCSS, setFixedCSS] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleGetFix() {
    console.log("originalCode:", originalCode) // add this line
  if (!originalCode?.trim()) return
    setLoading(true)
    setFixedCSS("")

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: originalCode, type: "fix" })
      })
      const data = await response.json()
      setFixedCSS(data.result || "/* No fix generated */")
    } catch (e) {
      setFixedCSS("/* Error getting fix — please try again */")
      console.error(e)
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
        </div>
        <button
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

      {fixedCSS && (
        <div className="space-y-2">
          <div className="relative">
            <pre className="bg-gray-800 text-green-400 text-xs font-mono rounded-lg p-4 overflow-x-auto border border-gray-700 max-h-48">
              {fixedCSS}
            </pre>
            <button
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