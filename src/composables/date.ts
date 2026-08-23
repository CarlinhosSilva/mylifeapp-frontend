export function formatDateToApi(date: Date | null): string {
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatDateToBR(date: string): string {
  if (!date) return ''

  const [year, month, day] = date.slice(0, 10).split('-')

  return `${day}/${month}/${year}`
}

export function parseDate(date: string): Date | null {
  if (!date) return null

  const datePart = date.slice(0, 10)
  const [year, month, day] = datePart.split('-').map(Number)

  if (![year, month, day].every(Number.isInteger)) return null

  return new Date(year, month - 1, day)
}