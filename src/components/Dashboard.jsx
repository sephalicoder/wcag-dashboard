import { useState } from "react"
import InputPanel from "./InputPanel"
import ResultPanel from "./ResultPanel"
import LivePreview from "./LivePreview"
import AIFixPanel from "./AIFixPanel"

export default function Dashboard() {
  const [result, setResult] = useState(null)
  const [code, setCode] = useState("")

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono p-6">

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            2
          </span>
          <h1 className="text-xl font-bold">
            Conversational UI Design System Dashboard
          </h1>
        </div>
        <p className="text-gray-400 text-sm ml-11">
          Paste a component → get contrast ratios, WCAG scores, live preview, and AI-generated fixes
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4 ml-11">
          {["React", "REST API Integration", "AI/LLM", "WCAG / a11y", "CSS design tokens"].map(tag => (
            <span key={tag} className="border border-gray-600 text-gray-300 text-xs px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Input */}
        <InputPanel onResult={(r, c) => { setResult(r); setCode(c) }} />

        {result && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LivePreview code={code} />
              <ResultPanel result={result} />
            </div>
            <AIFixPanel originalCode={code} />
          </>
        )}
      </div>
    </div>
  )
}