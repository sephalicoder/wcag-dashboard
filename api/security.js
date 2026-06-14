// Rate limiting store (in-memory)
const rateLimitStore = new Map()

// Config
const RATE_LIMIT = {
  windowMs: 60 * 1000,  // 1 minute window
  maxRequests: 10,       // max 10 requests per minute per IP
}

const MAX_INPUT_LENGTH = 5000  // max characters allowed

// Allowed origins
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://wcag-dashboard-omega.vercel.app", // replace with your actual vercel URL
]

// ✅ Check 1 — CORS Protection
export function checkCORS(req, res) {
  const origin = req.headers.origin

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
  } else {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS[0])
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end()
    return true // request handled
  }

  return false
}

// ✅ Check 2 — Rate Limiting
export function checkRateLimit(req, res) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown"

  const now = Date.now()
  const windowStart = now - RATE_LIMIT.windowMs

  // Clean old entries
  if (rateLimitStore.has(ip)) {
    const requests = rateLimitStore.get(ip).filter(t => t > windowStart)
    rateLimitStore.set(ip, requests)
  } else {
    rateLimitStore.set(ip, [])
  }

  const requests = rateLimitStore.get(ip)

  if (requests.length >= RATE_LIMIT.maxRequests) {
    res.status(429).json({
      error: "Too many requests. Please wait a minute before trying again."
    })
    return true // blocked
  }

  // Add current request
  requests.push(now)
  rateLimitStore.set(ip, requests)

  return false
}

// ✅ Check 3 — Input Validation
export function validateInput(req, res) {
  const { code, type } = req.body

  // Check code exists
  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Invalid input: code is required" })
    return true
  }

  // Check length
  if (code.length > MAX_INPUT_LENGTH) {
    res.status(400).json({
      error: `Input too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.`
    })
    return true
  }

  // Check type is valid
  if (type && !["fix", "suggest"].includes(type)) {
    res.status(400).json({ error: "Invalid type. Must be 'fix' or 'suggest'" })
    return true
  }

  // Check for suspicious patterns (basic XSS / injection)
  const suspiciousPatterns = [
  /<script\s/i,
  /javascript:\s*\S/i,
  /eval\s*\(\s*['"]/i,
]

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(code))
  if (isSuspicious) {
    res.status(400).json({
      error: "Invalid input: potentially unsafe content detected"
    })
    return true
  }

  return false
}

// ✅ Check 4 — Sanitize input before sending to AI
export function sanitizeInput(code) {
  // eslint-disable-next-line no-control-regex
  const controlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
  return code
    .trim()
    .slice(0, MAX_INPUT_LENGTH)
    .replace(controlChars, "")
}