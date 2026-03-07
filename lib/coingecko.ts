import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Ticker → CoinGecko ID mapping
// ---------------------------------------------------------------------------

export const TICKER_TO_COINGECKO: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  XRP: 'ripple',
  BNB: 'binancecoin',
  ATOM: 'cosmos',
  UNI: 'uniswap',
  AAVE: 'aave',
  ARB: 'arbitrum',
  OP: 'optimism',
  SUI: 'sui',
  APT: 'aptos',
  NEAR: 'near',
  FTM: 'fantom',
  PEPE: 'pepe',
  WIF: 'dogwifcoin',
  JUP: 'jupiter-exchange-solana',
}

// Reverse mapping for response parsing
const COINGECKO_TO_TICKER: Record<string, string> = Object.fromEntries(
  Object.entries(TICKER_TO_COINGECKO).map(([ticker, id]) => [id, ticker])
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CoinGeckoPrice {
  usd: number
  usd_24h_change: number | null
}

export interface CoinGeckoMarketData {
  current_price: number
  market_cap: number
  total_volume: number
  price_change_24h: number
  price_change_percentage_24h: number
  high_24h: number
  low_24h: number
  sparkline_7d: number[]
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const CACHE_TTL = 15_000 // 15 seconds

const priceCache = new Map<string, CacheEntry<Record<string, CoinGeckoPrice>>>()
const marketDataCache = new Map<string, CacheEntry<CoinGeckoMarketData>>()
const sparklineCache = new Map<string, CacheEntry<Record<string, number[]>>>()

function getCacheKey(tickers: string[]): string {
  return [...tickers].sort().join(',')
}

function isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  return !!entry && Date.now() - entry.timestamp < CACHE_TTL
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  return process.env.COINGECKO_API_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: 'application/json' }
  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-pro-api-key'] = process.env.COINGECKO_API_KEY
  }
  return headers
}

function tickersToIds(tickers: string[]): string[] {
  return tickers
    .map((t) => TICKER_TO_COINGECKO[t.toUpperCase()])
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// getPrices — batch price lookup
// ---------------------------------------------------------------------------

export async function getPrices(
  tickers: string[]
): Promise<Record<string, CoinGeckoPrice>> {
  if (tickers.length === 0) return {}

  const cacheKey = getCacheKey(tickers)
  const cached = priceCache.get(cacheKey)
  if (isCacheValid(cached)) return cached.data

  const ids = tickersToIds(tickers)
  if (ids.length === 0) return {}

  try {
    const url = `${getBaseUrl()}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`
    const res = await fetch(url, { headers: getHeaders() })

    if (!res.ok) {
      logger.error('CoinGecko getPrices failed', {
        status: res.status,
        statusText: res.statusText,
      })
      return {}
    }

    const json = (await res.json()) as Record<
      string,
      { usd?: number; usd_24h_change?: number | null }
    >

    // Map CoinGecko IDs back to ticker symbols
    const result: Record<string, CoinGeckoPrice> = {}
    for (const [cgId, data] of Object.entries(json)) {
      const ticker = COINGECKO_TO_TICKER[cgId]
      if (ticker && data.usd !== undefined) {
        result[ticker] = {
          usd: data.usd,
          usd_24h_change: data.usd_24h_change ?? null,
        }
      }
    }

    priceCache.set(cacheKey, { data: result, timestamp: Date.now() })
    return result
  } catch (err) {
    logger.error('CoinGecko getPrices error', {
      error: err instanceof Error ? err.message : String(err),
    })
    return {}
  }
}

// ---------------------------------------------------------------------------
// getMarketData — detailed data for a single asset
// ---------------------------------------------------------------------------

export async function getMarketData(
  ticker: string
): Promise<CoinGeckoMarketData | null> {
  const cgId = TICKER_TO_COINGECKO[ticker.toUpperCase()]
  if (!cgId) return null

  const cached = marketDataCache.get(ticker)
  if (isCacheValid(cached)) return cached.data

  try {
    const url = `${getBaseUrl()}/coins/${cgId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`
    const res = await fetch(url, { headers: getHeaders() })

    if (!res.ok) {
      logger.error('CoinGecko getMarketData failed', {
        ticker,
        status: res.status,
      })
      return null
    }

    const json = await res.json()
    const md = json.market_data

    if (!md) return null

    const result: CoinGeckoMarketData = {
      current_price: md.current_price?.usd ?? 0,
      market_cap: md.market_cap?.usd ?? 0,
      total_volume: md.total_volume?.usd ?? 0,
      price_change_24h: md.price_change_24h ?? 0,
      price_change_percentage_24h: md.price_change_percentage_24h ?? 0,
      high_24h: md.high_24h?.usd ?? 0,
      low_24h: md.low_24h?.usd ?? 0,
      sparkline_7d: md.sparkline_7d?.price ?? [],
    }

    marketDataCache.set(ticker, { data: result, timestamp: Date.now() })
    return result
  } catch (err) {
    logger.error('CoinGecko getMarketData error', {
      ticker,
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}

// ---------------------------------------------------------------------------
// getSparklines — 7-day sparkline for multiple assets
// ---------------------------------------------------------------------------

export async function getSparklines(
  tickers: string[]
): Promise<Record<string, number[]>> {
  if (tickers.length === 0) return {}

  const cacheKey = getCacheKey(tickers)
  const cached = sparklineCache.get(cacheKey)
  if (isCacheValid(cached)) return cached.data

  const ids = tickersToIds(tickers)
  if (ids.length === 0) return {}

  try {
    const url = `${getBaseUrl()}/coins/markets?vs_currency=usd&ids=${ids.join(',')}&sparkline=true&price_change_percentage=24h`
    const res = await fetch(url, { headers: getHeaders() })

    if (!res.ok) {
      logger.error('CoinGecko getSparklines failed', {
        status: res.status,
      })
      return {}
    }

    const json = (await res.json()) as Array<{
      id: string
      sparkline_in_7d?: { price: number[] }
    }>

    const result: Record<string, number[]> = {}
    for (const coin of json) {
      const ticker = COINGECKO_TO_TICKER[coin.id]
      if (ticker && coin.sparkline_in_7d?.price) {
        result[ticker] = coin.sparkline_in_7d.price
      }
    }

    sparklineCache.set(cacheKey, { data: result, timestamp: Date.now() })
    return result
  } catch (err) {
    logger.error('CoinGecko getSparklines error', {
      error: err instanceof Error ? err.message : String(err),
    })
    return {}
  }
}
