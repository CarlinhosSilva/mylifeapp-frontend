export interface ParsedPurchaseNote {
  supplierName: string
  totalValue: number
  purchaseDate: string
}

export function normalizeCurrencyValue(value: string | number): number {
  if (typeof value === 'number') return Number(value || 0)

  let cleaned = String(value)
    .replace(/R\$\s*/gi, '')
    .replace(/[^\d,.-\s]/g, '')
    .trim()

  if (!cleaned) return 0

  cleaned = cleaned.replace(/\s+/g, '')
  const brazilianFormat = /^-?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/
  const internationalFormat = /^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?$/
  let normalized: string

  if (cleaned.includes(',') && cleaned.includes('.')) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.') && brazilianFormat.test(cleaned)) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.')
    } else if (cleaned.lastIndexOf('.') > cleaned.lastIndexOf(',') && internationalFormat.test(cleaned)) {
      normalized = cleaned.replace(/,/g, '')
    } else {
      return 0
    }
  } else if (cleaned.includes(',')) {
    if (brazilianFormat.test(cleaned)) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      return 0
    }
  } else if (cleaned.includes('.')) {
    if (/^-?\d{1,3}(?:\.\d{3})+$/.test(cleaned)) {
      normalized = cleaned.replace(/\./g, '')
    } else if (/^-?\d+\.\d{1,2}$/.test(cleaned)) {
      normalized = cleaned
    } else {
      return 0
    }
  } else if (/^-?\d+$/.test(cleaned)) {
    normalized = cleaned
  } else {
    return 0
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseCurrencyLine(line: string): number {
  const match = line.match(/\d[\d.]*(?:,\s*\d{1,2})?/)
  return match ? normalizeCurrencyValue(match[0]) : 0
}

function findNumberInText(text: string): number {
  const matches = text.match(/\d[\d.]*(?:,\s*\d{1,2})/g) ?? []
  return matches.reduce((max, value) => Math.max(max, normalizeCurrencyValue(value)), 0)
}

function parseDateValue(value: string): string | null {
  const isoMatch = value.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  const localMatch = value.match(/\b(\d{1,2})[./-](\d{1,2})[./-](20\d{2})\b/)
  const parts = isoMatch
    ? [Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3])]
    : localMatch
      ? [Number(localMatch[3]), Number(localMatch[2]), Number(localMatch[1])]
      : null

  if (!parts) return null

  const [year, month, day] = parts
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function extractPurchaseDate(text: string): string {
  const lines = text.split(/\n|\r/).map(line => line.trim()).filter(Boolean)
  const labeledLine = lines.find(line => /(?:emiss[aã]o|data\s*(?:da\s*)?(?:compra|nota|emiss[aã]o)|compra)/i.test(line))
  const labeledDate = labeledLine ? parseDateValue(labeledLine) : null
  if (labeledDate) return labeledDate

  for (const line of lines) {
    const date = parseDateValue(line)
    if (date) return date
  }
  return ''
}

export function parsePurchaseNoteText(rawText: string): ParsedPurchaseNote {
  const text = String(rawText ?? '').trim()
  const supplierMatch = text.match(/(?:fornecedor|raz[ãa]o social|nome fantasia)\s*[:\-]?\s*([^\n]+)/i)
  const supplierLine = text
    .split(/\n|\r/)
    .map(line => line.trim())
    .find(line => line.length >= 3
      && /(?:mercado|supermercado|loja|empresa|estabelecimento|atacado|frigorifico|açougue)/i.test(line)
      && !/^\d{4,16}\s+[A-ZÀ-Ÿ]/i.test(line)
      && !/\b\d+(?:[.,]\s*\d+)?\s*(?:unid|und|uni|kg|g|mg|ml|l|lt)\b/i.test(line))
  const supplierName = (supplierMatch?.[1] ?? supplierLine ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const totalCandidates = text
    .split(/\n|\r/)
    .map(line => line.trim())
    .map(line => {
      const preferredMatch = line.match(/(?:valor\s*total|total\s*da\s*nota)\b(.*)/i)
      const totalMatch = line.match(/\btotal\b(.*)/i)
      const payableMatch = line.match(/valor\s*(?:à|a)\s*pagar|valor\s*pago/i)
      const payableWithAmount = payableMatch
        ? line.slice((payableMatch.index ?? 0) + payableMatch[0].length)
        : ''
      const amountText = preferredMatch?.[1] ?? totalMatch?.[1] ?? payableWithAmount
      return {
        priority: preferredMatch ? 3 : totalMatch ? 2 : payableMatch ? 1 : 0,
        value: parseCurrencyLine(amountText),
      }
    })
    .filter(candidate => candidate.priority > 0 && candidate.value > 0)
    .sort((first, second) => second.priority - first.priority || second.value - first.value)

  return {
    supplierName,
    totalValue: totalCandidates[0]?.value ?? findNumberInText(text),
    purchaseDate: extractPurchaseDate(text),
  }
}
