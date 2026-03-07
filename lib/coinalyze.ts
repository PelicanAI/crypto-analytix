import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FundingRateData {
  rate: number
  exchange: string
  next_funding: string
  annualized: number
}

export interface OpenInterestData {
  oi_usd: number
  oi_change_24h: number
}

// ---------------------------------------------------------------------------
// Ticker → Coinalyze symbol mapping
// ---------------------------------------------------------------------------

const TICKER_TO_COINALYZE: Record<string, string> = {
  BTC: 'BTCUSD_PERP',
  ETH: 'ETHUSD_PERP',
  SOL: 'SOLUSD_PERP',
  AVAX: 'AVAXUSD_PERP',
  LINK: 'LINKUSD_PERP',
  DOT: 'DOTUSD_PERP',
  MATIC: 'MATICUSD_PERP',
  ADA: 'ADAUSD_PERP',
  DOGE: 'DOGEUSD_PERP',
  XRP: 'XRPUSD_PERP',
  BNB: 'BNBUSD_PERP',
  ATOM: 'ATOMUSD_PERP',
  UNI: 'UNIUSD_PERP',
  AAVE: 'AAVEUSD_PERP',
  ARB: 'ARBUSD_PERP',
  OP: 'OPUSD_PERP',
  SUI: 'SUIUSD_PERP',
  APT: 'APTUSD_PERP',
  NEAR: 'NEARUSD_PERP',
  FTM: 'FTMUSD_PERP',
  PEPE: 'PEPEUSD_PERP',
  WIF: 'WIFUSD_PERP',
  JUP: 'JUPUSD_PERP',
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const CACHE_TTL = 60_000 // 60 seconds

const fundingCache = new Map<string, CacheEntry<Record<string, FundingRateData>>>()
const oiCache = new Map<string, CacheEntry<OpenInterestData>>()

function isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  return !!entry && Date.now() - entry.timestamp < CACHE_TTL
}

// ---------------------------------------------------------------------------
// Mock data — used when COINALYZE_API_KEY is not set
// ---------------------------------------------------------------------------

function getNextFunding(hoursFromNow: number): string {
  const d = new Date()
  d.setHours(d.getHours() + hoursFromNow)
  return d.toISOString()
}

function getMockFundingRate(ticker: string): FundingRateData {
  const mocks: Record<string, FundingRateData> = {
    BTC: {
      rate: 0.00008,
      exchange: 'Binance',
      next_funding: getNextFunding(4),
      annualized: 0.00008 * 3 * 365 * 100, // ~8.76%
    },
    ETH: {
      rate: 0.00012,
      exchange: 'Binance',
      next_funding: getNextFunding(4),
      annualized: 0.00012 * 3 * 365 * 100, // ~13.14%
    },
    SOL: {
      rate: 0.00025,
      exchange: 'Bybit',
      next_funding: getNextFunding(2),
      annualized: 0.00025 * 3 * 365 * 100, // ~27.38%
    },
    AVAX: {
      rate: -0.00003,
      exchange: 'Binance',
      next_funding: getNextFunding(6),
      annualized: -0.00003 * 3 * 365 * 100, // ~-3.29%
    },
    LINK: {
      rate: 0.00005,
      exchange: 'Binance',
      next_funding: getNextFunding(5),
      annualized: 0.00005 * 3 * 365 * 100, // ~5.48%
    },
  }

  return (
    mocks[ticker.toUpperCase()] ?? {
      rate: 0.00015,
      exchange: 'Binance',
      next_funding: getNextFunding(4),
      annualized: 0.00015 * 3 * 365 * 100,
    }
  )
}

function getMockOpenInterest(ticker: string): OpenInterestData {
  const mocks: Record<string, OpenInterestData> = {
    BTC: { oi_usd: 18_400_000_000, oi_change_24h: 2.3 },
    ETH: { oi_usd: 8_200_000_000, oi_change_24h: -1.1 },
    SOL: { oi_usd: 2_100_000_000, oi_change_24h: 8.5 },
    AVAX: { oi_usd: 340_000_000, oi_change_24h: -3.2 },
    LINK: { oi_usd: 520_000_000, oi_change_24h: 4.7 },
  }

  return (
    mocks[ticker.toUpperCase()] ?? {
      oi_usd: 200_000_000,
      oi_change_24h: 0.5,
    }
  )
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

const API_BASE = 'https://api.coinalyze.net/v1'

function getHeaders(): HeadersInit {
  return {
    Accept: 'application/json',
    api_key: process.env.COINALYZE_API_KEY ?? '',
  }
}

function isApiConfigured(): boolean {
  return !!process.env.COINALYZE_API_KEY
}

// ---------------------------------------------------------------------------
// getFundingRate — single asset
// ---------------------------------------------------------------------------

export async function getFundingRate(ticker: string): Promise<FundingRateData> {
  const result = await getFundingRates([ticker])
  return result[ticker.toUpperCase()] ?? getMockFundingRate(ticker)
}

// ---------------------------------------------------------------------------
// getFundingRates — multiple assets in one call
// ---------------------------------------------------------------------------

export async function getFundingRates(
  tickers: string[]
): Promise<Record<string, FundingRateData>> {
  if (tickers.length === 0) return {}

  const cacheKey = [...tickers].sort().join(',')
  const cached = fundingCache.get(cacheKey)
  if (isCacheValid(cached)) return cached.data

  // Fall back to mock data when API key is not configured
  if (!isApiConfigured()) {
    logger.warn('Coinalyze API key not set — using mock funding data')
    const result: Record<string, FundingRateData> = {}
    for (const t of tickers) {
      result[t.toUpperCase()] = getMockFundingRate(t)
    }
    fundingCache.set(cacheKey, { data: result, timestamp: Date.now() })
    return result
  }

  const symbols = tickers
    .map((t) => TICKER_TO_COINALYZE[t.toUpperCase()])
    .filter(Boolean)

  if (symbols.length === 0) return {}

  try {
    const url = `${API_BASE}/funding-rate?symbols=${symbols.join(',')}`
    const res = await fetch(url, { headers: getHeaders() })

    if (!res.ok) {
      logger.error('Coinalyze getFundingRates failed', {
        status: res.status,
        statusText: res.statusText,
      })
      // Fall back to mock on API error
      const result: Record<string, FundingRateData> = {}
      for (const t of tickers) {
        result[t.toUpperCase()] = getMockFundingRate(t)
      }
      return result
    }

    const json = (await res.json()) as Array<{
      symbol: string
      value: number
      exchange?: string
      next_funding_time?: number
    }>

    const result: Record<string, FundingRateData> = {}
    for (const entry of json) {
      // Reverse-lookup: BTCUSD_PERP → BTC
      const ticker = Object.entries(TICKER_TO_COINALYZE).find(
        ([, sym]) => sym === entry.symbol
      )?.[0]
      if (ticker) {
        const rate = entry.value
        result[ticker] = {
          rate,
          exchange: entry.exchange ?? 'Binance',
          next_funding: entry.next_funding_time
            ? new Date(entry.next_funding_time * 1000).toISOString()
            : getNextFunding(8),
          annualized: rate * 3 * 365 * 100,
        }
      }
    }

    // Fill any missing tickers with mock
    for (const t of tickers) {
      const upper = t.toUpperCase()
      if (!result[upper]) {
        result[upper] = getMockFundingRate(upper)
      }
    }

    fundingCache.set(cacheKey, { data: result, timestamp: Date.now() })
    return result
  } catch (err) {
    logger.error('Coinalyze getFundingRates error', {
      error: err instanceof Error ? err.message : String(err),
    })
    const result: Record<string, FundingRateData> = {}
    for (const t of tickers) {
      result[t.toUpperCase()] = getMockFundingRate(t)
    }
    return result
  }
}

// ---------------------------------------------------------------------------
// getOpenInterest — single asset
// ---------------------------------------------------------------------------

export async function getOpenInterest(
  ticker: string
): Promise<OpenInterestData> {
  const upper = ticker.toUpperCase()

  const cached = oiCache.get(upper)
  if (isCacheValid(cached)) return cached.data

  if (!isApiConfigured()) {
    logger.warn('Coinalyze API key not set — using mock OI data')
    const mock = getMockOpenInterest(upper)
    oiCache.set(upper, { data: mock, timestamp: Date.now() })
    return mock
  }

  const symbol = TICKER_TO_COINALYZE[upper]
  if (!symbol) return getMockOpenInterest(upper)

  try {
    const url = `${API_BASE}/open-interest?symbols=${symbol}`
    const res = await fetch(url, { headers: getHeaders() })

    if (!res.ok) {
      logger.error('Coinalyze getOpenInterest failed', {
        ticker,
        status: res.status,
      })
      return getMockOpenInterest(upper)
    }

    const json = (await res.json()) as Array<{
      symbol: string
      value: number
      change_24h?: number
    }>

    const entry = json[0]
    if (!entry) return getMockOpenInterest(upper)

    const result: OpenInterestData = {
      oi_usd: entry.value,
      oi_change_24h: entry.change_24h ?? 0,
    }

    oiCache.set(upper, { data: result, timestamp: Date.now() })
    return result
  } catch (err) {
    logger.error('Coinalyze getOpenInterest error', {
      ticker,
      error: err instanceof Error ? err.message : String(err),
    })
    return getMockOpenInterest(upper)
  }
}
