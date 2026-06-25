export function formatPKR(amount) {
  if (amount == null) return 'Rs. 0.00'
  const abs = Math.abs(amount)
  if (abs >= 10000000) return `Rs. ${(amount / 10000000).toFixed(2)}Cr`
  if (abs >= 100000) return `Rs. ${(amount / 100000).toFixed(2)}L`
  if (abs >= 1000) return `Rs. ${(amount / 1000).toFixed(1)}K`
  return `Rs. ${amount.toFixed(2)}`
}
