import { useState } from "react"
import { analyzeComponent } from "../utils/analyzer"

export default function InputPanel({ onResult }) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleAnalyze(e) {
    if (e) e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    try {
      const result = await analyzeComponent(code)
      onResult(result, code)
    } catch {
      console.error("Analysis failed")
    }
    setLoading(false)
  }

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <p className="text-sm text-gray-400 mb-3">
        Paste your component code or CSS below:
      </p>
      <textarea
        className="w-full bg-gray-800 text-green-400 text-sm font-mono rounded-lg p-4 h-40 resize-none border border-gray-700 focus:outline-none focus:border-green-500 transition-colors"
        placeholder={`/* Example — paste any CSS or component */\n.button {\n  background: #ffffff;\n  color: #cccccc;\n}`}
        value={code}
        onChange={e => setCode(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && e.ctrlKey) handleAnalyze(e)
        }}
      />

      <div className="flex items-center gap-4 mt-3">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !code.trim()}
          className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            "⚡ Analyze Component"
          )}
        </button>

        {loading && (
          <p className="text-xs text-gray-500 animate-pulse">
            Running WCAG checks + asking AI...
          </p>
        )}
      </div>

      <p className="text-xs text-gray-600 mt-2">
        Tip: Press Ctrl + Enter to analyze quickly
      </p>
    </div>
  )
}