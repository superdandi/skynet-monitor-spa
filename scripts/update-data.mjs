#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.resolve(__dirname, '../public/data/dashboard.json')

const FEEDS = [
  'https://feeds.feedburner.com/TheHackersNews',
  'https://www.bleepingcomputer.com/feed/',
  'https://feeds.arstechnica.com/arstechnica/index',
  'https://www.theregister.com/security/headlines.atom',
  'https://www.schneier.com/feed/atom/',
  'https://threatpost.com/feed/',
  'https://cyberscoop.com/feed/',
]

const AI_KEYWORDS = [
  'openai', 'anthropic', 'claude', 'gpt', 'deepmind', 'gemini', 'meta ai',
  'xai', 'grok', 'mistral', 'glm', 'moonshot', 'hugging face', 'artificial intelligence',
  'ai agent', 'ai model', 'llm', 'large language model', 'ai chatbot', 'artificial-intelligence',
]

const SEVERITY_RULES = [
  { score: 5, match: ['breach', 'ransomware', 'hacked', 'compromis', 'critical', '0-day', 'zero-day', 'exploit', 'hacking campaign', 'data theft', 'data stealing'] },
  { score: 4, match: ['leak', 'backdoor', 'malware', 'data expos', 'credential', 'stolen', 'attack on', 'under attack', 'distill', 'secret'] },
  { score: 3, match: ['cve', 'vulnerab', 'advisory', 'patch', 'flaw', 'misconfig', 'sandbox'] },
  { score: 2, match: ['warn', 'risk', 'suspens', 'researcher', 'probe'] },
]

const INCIDENT_VERBS = [
  'breach', 'ransomware', 'hacked', 'hack', 'compromis', 'exploit', 'attack', 'leak',
  'backdoor', 'malware', 'steal', 'theft', 'expos', 'credential', 'stole', 'vulnerab',
  'cve', 'flaw', 'bypass', 'evad', 'kill chain', 'rogue', 'autonomous', 'sabotage',
  'distill', 'bypassing', 'hijack', 'phish',
]

const COMPANY_MAP = [
  { id: 'openai', name: 'OpenAI', names: ['openai', 'chatgpt'], city: 'San Francisco', coords: [-122.42, 37.77] },
  { id: 'anthropic', name: 'Anthropic', names: ['anthropic', 'claude'], city: 'San Francisco', coords: [-122.35, 37.74] },
  { id: 'google-deepmind', name: 'Google DeepMind', names: ['deepmind', 'gemini', 'google', 'alphabet'], city: 'London', coords: [-0.13, 51.51] },
  { id: 'meta-ai', name: 'Meta AI', names: ['meta ai', 'meta', 'llama'], city: 'Menlo Park', coords: [-122.19, 37.45] },
  { id: 'xai', name: 'xAI', names: ['xai', 'x ai', 'grok'], city: 'Palo Alto', coords: [-122.14, 37.42] },
  { id: 'mistral', name: 'Mistral AI', names: ['mistral'], city: 'Paris', coords: [2.35, 48.86] },
  { id: 'z-ai-glm', name: 'Z.ai (GLM)', names: ['glm', 'z.ai', 'zhipu'], city: 'Beijing', coords: [116.44, 39.92] },
  { id: 'moonshot-ai', name: 'Moonshot AI', names: ['moonshot', 'kimi'], city: 'Beijing', coords: [116.41, 39.9] },
]

const VALUATION_REGEX = /\b(\d+(?:\.\d+)?)\s*(billion|bn|b)\b.?([^.]{0,40}?valuation)?/i

const SEVERITY_LABEL = { 5: 'CRITICAL', 4: 'HIGH', 3: 'MODERATE', 2: 'LOW', 1: 'LOW' }

const NOISE_BLOCKERS = [
  'my talk at', 'solves a historical cipher', 'wrap-up', 'roundup', 'opinion', 'editorial',
  'sponsored', 'podcast', 'video', 'webinar', 'scheduled', 'announce', 'event',
  'genie', 'lawyer punished', 'made-up', 'fabricat', 'credit', 'appease', 'pledges',
  'horror story', 'died young', 'chilling logs', 'commits $', 'tries to appease',
  'fable', 'essay', 'talk at', 'solves', 'horizon', 'frontier',
  'compress exploit timeline', 'reasoning traces', 'as modern genies', 'historical cipher',
]

function htmlDecode(str = '') {
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function parseRSS(xml) {
  const items = []
  const normalized = xml.replace(/<!\[CDATA\[/g, '<![CDATA[')
  const itemRegex = /<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/g
  const matches = normalized.match(itemRegex) || []

  for (const raw of matches) {
    const g = (tag) => htmlDecode((raw.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)) || [])[1] || '')

    const title = g('title') || g('media:title')
    const description = g('description') || g('summary') || g('content:encoded') || ''
    const link = g('link') || ''
    const dateStr = g('pubDate') || g('published') || g('updated') || g('date')
    const date = dateStr ? new Date(dateStr) : null

    if (!title) continue
    items.push({ title, description, link, date })
  }
  return items
}

async function fetchFeed(url) {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'skynet-monitor/1.0 (+https://github.com/superdandi/skynet-monitor-spa)' },
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
      console.warn(`[SKYNET] feed ${url} -> HTTP ${res.status}`)
      return []
    }
    const xml = await res.text()
    return parseRSS(xml)
  } catch (err) {
    console.warn(`[SKYNET] feed ${url} errored: ${err.message}`)
    return []
  }
}

async function fetchOSV() {
  try {
    const res = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ecosystem: 'PyPI',
        query: '',
        page_size: 50,
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) return []
    const data = await res.json()
    const vulns = Array.isArray(data) ? data : []
    const aiPackages = ['torch', 'tensorflow', 'transformers', 'langchain', 'openai', 'anthropic', 'mlflow']
    return vulns
      .filter((v) => {
        const packages = (v.packages || []).map((p) => p.package?.name || '').join(' ')
        const summary = `${v.summary} `.toLowerCase()
        return aiPackages.some((p) => packages.toLowerCase().includes(p) || summary.includes(p))
      })
      .map((v) => ({
        title: `CVE: ${v.id} - ${v.summary || 'vulnerability'}`.slice(0, 160),
        description: v.details || v.summary || '',
        link: v.references?.[0]?.url || `https://osv.dev/vulnerability/${v.id}`,
        date: v.modified ? new Date(v.modified) : new Date(),
      }))
  } catch (err) {
    console.warn(`[SKYNET] OSV errored: ${err.message}`)
    return []
  }
}

function isAIRelevant(text) {
  const lower = text.toLowerCase()
  return AI_KEYWORDS.some((k) => lower.includes(k.toLowerCase()))
}

function classifySeverity(text) {
  const lower = text.toLowerCase()
  let score = 1
  for (const rule of SEVERITY_RULES) {
    if (rule.match.some((m) => lower.includes(m))) {
      score = Math.max(score, rule.score)
    }
  }
  return SEVERITY_LABEL[score]
}

function detectCompany(text) {
  const lower = text.toLowerCase()
  for (const c of COMPANY_MAP) {
    if (c.names.some((n) => lower.includes(n))) return c
  }
  return null
}

function makeId(title, date) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80)
  const day = date ? date.toISOString().slice(0, 10) : 'unknown'
  return `${day}-${slug}`
}

const STOPWORDS = new Set(['a', 'an', 'the', 'of', 'for', 'in', 'on', 'to', 'and', 'or', 'with', 'by', 'at', 'as', 'from', 'that', 'this', 'its', 'their', 'over', 'under'])

function tokenSet(title) {
  return new Set(
    title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !STOPWORDS.has(w))
  )
}

function similarTitle(a, b) {
  const sa = tokenSet(a)
  const sb = tokenSet(b)
  const inter = [...sa].filter((w) => sb.has(w)).length
  return inter / Math.max(sa.size, sb.size) >= 0.45
}

function extractTags(title, description, company) {
  const text = `${title} ${description}`.toLowerCase()
  const tags = []
  const map = [
    ['autonomous-ai', ['autonomous', 'rogue', 'agent', 'crawler']],
    ['zero-day', ['0-day', 'zero-day', 'zero day']],
    ['ransomware', ['ransomware']],
    ['supply-chain', ['supply chain', 'third-party', 'oauth', 'npm']],
    ['model-leak', ['model leak', 'weights', 'checkpoint']],
    ['backdoor', ['backdoor']],
    ['privacy', ['privacy', 'data expos', 'data leak']],
    ['ai-defense', ['defense', 'incident response', 'responder']],
    ['market-impact', ['market', 'valuation', 'stock', 'shares']],
    ['misconfiguration', ['misconfig']],
    ['data-exposure', ['data expos', 'exposed']],
  ]
  for (const [tag, keys] of map) {
    if (company?.id && text.includes(company.id)) tags.push(company.id)
    if (keys.some((k) => text.includes(k))) tags.push(tag)
  }
  const slug = company?.id
  if (slug && !tags.includes(slug)) tags.push(slug)
  return [...new Set(tags)].slice(0, 6)
}

function detectValuation(text, company) {
  const match = text.match(VALUATION_REGEX)
  if (!match || !company) return null
  const hasValuationWord = /valuation|valued|valor/i.test(text.slice(match.index ?? 0, (match.index ?? 0) + 80))
  if (!hasValuationWord) return null
  let mult = 1
  if (/bn|billion/i.test(match[2])) mult = 1
  return Math.round(parseFloat(match[1]) * mult)
}

function runWindow(now) {
  const MIN_AGE_H = 19
  const MAX_AGE_H = 24 * 30
  return (d) => now - d >= MIN_AGE_H * 3600e3 && now - d <= MAX_AGE_H * 3600e3
}

async function main() {
  console.log('[SKYNET] Starting data update...')

  const rawData = await readFile(DATA_PATH, 'utf8').catch(() => null)
  let data
  if (rawData) {
    try { data = JSON.parse(rawData) } catch { data = null }
  }
  if (!data) throw new Error('CRITICAL: unable to read current dashboard.json - aborting')

  const existing = new Set(data.incidents.map((i) => i.id || makeId(i.title, new Date(i.date))))
  data.incidents = data.incidents.map((i) => ({ id: i.id || makeId(i.title, new Date(i.date)), ...i }))
  const now = Date.now()
  const inWindow = runWindow(now)

  let candidates = []
  for (const url of FEEDS) {
    candidates = candidates.concat(await fetchFeed(url))
  }
  candidates = candidates.concat(await fetchOSV())

  let added = 0
  let valuations = 0

  for (const item of candidates) {
    const text = `${item.title} ${item.description}`.trim()
    if (!text || !isAIRelevant(text)) continue
    if (NOISE_BLOCKERS.some((b) => item.title.toLowerCase().includes(b))) continue

    const lowerTitle = item.title.toLowerCase()
    const incidentVerb = INCIDENT_VERBS.some((v) => lowerTitle.includes(v))
    if (!incidentVerb) continue

    const date = item.date || new Date()
    if (!inWindow(date)) continue

    const id = makeId(item.title, date)
    if (existing.has(id)) continue
    const dup = data.incidents.some((i) => similarTitle(i.title, item.title))
    if (dup) {
      console.log(`[SKYNET] skip duplicated: ${item.title.slice(0, 60)}`)
      continue
    }

    const company = detectCompany(text)
    const severity = classifySeverity(text)

    const incident = {
      severity,
      date: date.toISOString().slice(0, 10),
      title: item.title.slice(0, 200),
      summary: htmlDecode(item.description).slice(0, 300),
      source: item.link ? new URL(item.link).hostname.replace(/^www\./, '') : 'RSS Feed',
      company: company?.name || null,
      tags: extractTags(item.title, item.description, company),
      id,
    }

    data.incidents.push(incident)
    existing.add(id)
    added++
    console.log(`[SKYNET] + ${severity} ${incident.date} - ${incident.title.slice(0, 70)}`)

    const val = detectValuation(text, company)
    if (val) {
      const cp = data.companies.find((c) => c.id === company.id)
      if (cp) {
        cp.valuation_b = val
        valuations++
        console.log(`[SKYNET] valuation ${company.name} -> $${val}B`)
      }
    }
  }

  data.incidents.sort((a, b) => new Date(b.date) - new Date(a.date))
  data.incidents = data.incidents.slice(0, 40)

  const counts = { CRITICAL: 0, HIGH: 0, MODERATE: 0, LOW: 0 }
  data.incidents.forEach((i) => { counts[i.severity] = (counts[i.severity] || 0) + 1 })

  if (data.threat_level) {
    let level = 1
    if (counts.CRITICAL >= 1) level = 4
    else if (counts.HIGH >= 2) level = 3
    else if (counts.HIGH >= 1 || counts.MODERATE >= 2) level = 2
    data.threat_level.level = level
    data.threat_level.last_incident = data.incidents[0]?.title || data.threat_level.last_incident
  }

  if (data.market_stats) {
    const catCompanies = data.companies.filter((c) => c.valuation_b != null)
    const totalVal = catCompanies.reduce((s, c) => s + c.valuation_b, 0)
    data.companies.forEach((c) => {
      c.incidents_count = data.incidents.filter((i) => i.company === c.name).length
    })
    data.market_stats = {
      companies_tracked: data.companies.length,
      total_incidents: data.incidents.length,
      critical_incidents: counts.CRITICAL,
      total_valuation: totalVal > 0 ? totalVal : data.market_stats.total_valuation,
      system_status: 'ONLINE',
    }
  }

  await writeFile(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8')

  console.log(`[SKYNET] Done. +${added} incidents, ${valuations} valuations updated. Total incidents: ${data.incidents.length}`)
}

main().catch((err) => {
  console.error(`[SKYNET] FATAL: ${err.message}`)
  process.exit(1)
})