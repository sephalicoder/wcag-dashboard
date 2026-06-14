import { useEffect, useRef } from "react"

export default function LivePreview({ code }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!iframeRef.current) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 24px;
              background: #1f2937;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: sans-serif;
              box-sizing: border-box;
            }
            ${code}
          </style>
        </head>
        <body>
          <div class="card">
            <h2 class="title">Sample Heading</h2>
            <p class="text">This is a preview of your component with the pasted styles applied.</p>
            <button class="button">Click me</button>
          </div>
        </body>
      </html>
    `

    const doc = iframeRef.current.contentDocument
    doc.open()
    doc.write(html)
    doc.close()
  }, [code])

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-950">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-xs text-gray-500 ml-2">Live Preview</span>
      </div>
      <iframe
        ref={iframeRef}
        className="w-full h-56 border-0"
        title="Component Preview"
        sandbox="allow-same-origin"
      />
    </div>
  )
}