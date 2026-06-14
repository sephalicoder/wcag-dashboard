export default function ResultPanel({ result }) {
  const { contrastRatio, wcagAA, wcagAAA, suggestion, fg, bg } = result

  const scoreColor = wcagAA ? "text-green-400" : "text-red-400"

  const whyItHits = [
    `Contrast ratio is ${contrastRatio}:1 — ${wcagAA ? "meets" : "does not meet"} WCAG AA (min 4.5:1)`,
    `WCAG AAA ${wcagAAA ? "passed ✅" : "not met ❌"} — requires 7:1 ratio for enhanced accessibility`,
    `AI-powered suggestions demonstrate "AI-assisted tools for coding/documentation"`,
    `Covers component architecture, frontend observability, and accessibility from the JD`,
  ]

  const techStack = [
    { icon: "⚛️", label: "React / Vue" },
    { icon: "🌐", label: "WCAG APIs" },
    { icon: "🎨", label: "Design tokens" },
    { icon: "💬", label: "LLM suggestions" },
  ]

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-4 p-5">
        <ScoreCard label="Contrast Ratio" value={`${contrastRatio}:1`} color="text-blue-400" />
        <ScoreCard label="WCAG AA" value={wcagAA ? "✅ Pass" : "❌ Fail"} color={scoreColor} />
        <ScoreCard label="WCAG AAA" value={wcagAAA ? "✅ Pass" : "❌ Fail"} color={scoreColor} />
      </div>

      {/* Color Preview */}
      <div className="px-5 pb-4 flex gap-3 items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-gray-600" style={{ background: fg }} />
          <span className="text-xs text-gray-400">Foreground: {fg}</span>
        </div>
        <span className="text-gray-600">→</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-gray-600" style={{ background: bg }} />
          <span className="text-xs text-gray-400">Background: {bg}</span>
        </div>
      </div>

      {/* Why This Hits */}
      <div className="px-5 pb-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
          WHY THIS HITS THE JD
        </p>
        <ul className="space-y-2">
          {whyItHits.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Suggestion */}
      <div className="mx-5 mb-5 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
          AI Suggestion
        </p>
        <p className="text-sm text-gray-200 leading-relaxed">{suggestion}</p>
      </div>

      {/* Tech Stack Bar */}
      <div className="grid grid-cols-4 border-t border-gray-800">
        {techStack.map((tech) => (
          <div
            key={tech.label}
            className="flex flex-col items-center justify-center gap-1 py-3 border-r border-gray-800 last:border-r-0 hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <span className="text-lg">{tech.icon}</span>
            <span className="text-xs text-gray-400">{tech.label}</span>
          </div>
        ))}
      </div>

      {/* JD Match Bar */}
      <div className="px-5 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-1">88% JD match</p>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all duration-700"
            style={{ width: "88%" }}
          />
        </div>
      </div>

    </div>
  )
}

function ScoreCard({ label, value, color }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
}