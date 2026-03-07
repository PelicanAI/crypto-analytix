/**
 * Pelican contextual prompt utilities.
 *
 * Builds URLs that navigate to the Pelican Portal with a pre-loaded prompt,
 * and provides prompt templates for dashboard → chat navigation.
 */

// ---------------------------------------------------------------------------
// Chat URL builder
// ---------------------------------------------------------------------------

/**
 * Build a URL that navigates to the Pelican Portal with a pre-loaded prompt.
 * The portal reads `?prompt=` on mount and auto-sends it.
 */
export function buildChatUrl(prompt: string): string {
  return `/pelican-portal?prompt=${encodeURIComponent(prompt)}`
}

// ---------------------------------------------------------------------------
// Dashboard contextual prompt templates
// ---------------------------------------------------------------------------

export function topMoverPrompt(
  asset: string,
  price: number,
  change24h: number,
): string {
  const sign = change24h >= 0 ? '+' : ''
  return `Analyze ${asset} at $${price.toLocaleString()} — 24h change ${sign}${change24h.toFixed(2)}%. What's the technical and derivatives setup?`
}

export function smartMoneyPrompt(
  walletLabel: string,
  action: string,
  amountDisplay: string,
  asset: string,
): string {
  return `Explain this whale movement: ${walletLabel} ${action} ${amountDisplay}. What does this signal for ${asset}?`
}

export function marketPulsePrompt(): string {
  return 'Give me a comprehensive crypto market analysis covering BTC dominance, derivatives positioning, and macro catalysts'
}

export function walletDnaPrompt(): string {
  return 'Analyze my wallet behavior profile and suggest improvements'
}

export function portfolioValuePrompt(totalValue: number): string {
  return `My portfolio is worth $${totalValue.toLocaleString()}. Give me a portfolio health check — concentration risk, correlation, and actionable suggestions.`
}

export function pnlPrompt(pnl: number, pnlPct: number): string {
  const sign = pnl >= 0 ? '+' : ''
  return `My 24h P&L is ${sign}$${Math.abs(pnl).toLocaleString()} (${sign}${pnlPct.toFixed(2)}%). What's driving this move and should I be concerned?`
}

export function alertsPrompt(): string {
  return 'What AI alerts should I set up for my portfolio? Recommend funding rate thresholds, whale activity monitors, and analyst-triggered alerts.'
}

export function walletHealthPrompt(): string {
  return 'Evaluate my wallet health — diversity, risk exposure, and how I compare to smart money patterns.'
}

// ---------------------------------------------------------------------------
// Slash command prompt mappings
// ---------------------------------------------------------------------------

export const SLASH_PROMPTS: Record<string, string> = {
  '/market': 'Give me a quick crypto market overview — BTC dominance, sentiment, and the biggest moves in the last 24 hours.',
  '/portfolio': 'Analyze my portfolio — allocation breakdown, concentration risk, correlation to BTC, and any positions I should review.',
  '/funding': 'Show me current funding rates across major tokens. Explain which are elevated and what that means in terms I understand from futures markets.',
  '/whale': 'What are the most significant whale movements in the last 24 hours? Focus on smart money wallets with proven track records.',
  '/calendar': 'What crypto events are coming up this week? Token unlocks, governance votes, Fed meetings, and anything else that could move the market.',
}
