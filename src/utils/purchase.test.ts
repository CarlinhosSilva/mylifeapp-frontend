import { describe, expect, it } from 'vitest'
import { normalizeCurrencyValue, parsePurchaseNoteText } from './purchase'

describe('purchase utility', () => {
  it('normalizes values from BRL text', () => {
    expect(normalizeCurrencyValue('R$ 123,45')).toBe(123.45)
    expect(normalizeCurrencyValue('123.45')).toBe(123.45)
    expect(normalizeCurrencyValue('1.234,56')).toBe(1234.56)
    expect(normalizeCurrencyValue('1.234')).toBe(1234)
    expect(normalizeCurrencyValue('105, 30')).toBe(105.3)
    expect(normalizeCurrencyValue('0,05')).toBe(0.05)
    expect(normalizeCurrencyValue('1,234.56')).toBe(1234.56)
    expect(normalizeCurrencyValue('1,234')).toBe(0)
    expect(normalizeCurrencyValue('12,345')).toBe(0)
    expect(normalizeCurrencyValue('0')).toBe(0)
  })

  it('extracts supplier, total and date from invoice text', () => {
    const result = parsePurchaseNoteText(`SUPERMERCADO BOM PRECO
DATA DE EMISSAO: 02/11/2026
VALOR TOTAL R$ 1.234,56`)

    expect(result).toEqual({
      supplierName: 'SUPERMERCADO BOM PRECO',
      totalValue: 1234.56,
      purchaseDate: '2026-11-02',
    })
  })

  it('does not use item and address amounts as the invoice total', () => {
    const result = parsePurchaseNoteText(`SUPERMERCADO BOM PRECO
RUA DAS FLORES, 123
ARROZ 25,90
VALOR TOTAL R$ 42,90`)

    expect(result.totalValue).toBe(42.9)
  })

})
