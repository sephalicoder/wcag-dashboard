import { useState, useRef, useEffect } from "react"

export default function ChatPanel({ componentCode, analysisResult }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I've analyzed your component. Ask me anything — like 'why did it fail?', 'what colors should I use?', or 'make it dark mode friendly' 💬"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")

    // Add user message instantly
    setMessages(prev => [...prev, { role: "user", text: userMessage }])
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          componentCode,
          analysisResult: {
            contrastRatio: analysisResult.contrastRatio,
            wcagAA: analysisResult.wcagAA,
            wcagAAA: analysisResult.wcagAAA,
            fg: analysisResult.fg,
            bg: analysisResult.bg,
          }
        })
      })

      const data = await response.json()
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: data.result || "Sorry, I couldn't process that." }
      ])
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again." }
      ])
    }

    setLoading(false)
  }

  // Send on Enter key
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-950">
        <span className="text-green-400">💬</span>
        <p className="text-sm font-bold text-white">Ask about your component</p>
        <span className="ml-auto text-xs text-gray-500">Powered by Gemini</span>
      </div>

      {/* Suggested questions */}
      <div className="px-4 pt-3 flex flex-wrap gap-2">
        {[
          "Why did it fail WCAG?",
          "What colors should I use?",
          "Make it dark mode friendly",
          "Explain contrast ratio",
        ].map(q => (
          <button
            key={q}
            onClick={() => setInput(q)}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full border border-gray-700 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-green-600 text-white rounded-br-none"
                  : "bg-gray-800 text-gray-200 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 rounded-xl rounded-bl-none px-4 py-2 text-sm">
              <span className="animate-pulse">Gemini is thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your component..."
          className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-green-500 transition-colors placeholder-gray-500"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
          ) : (
            "Send"
          )}
        </button>
      </div>

    </div>
  )
}