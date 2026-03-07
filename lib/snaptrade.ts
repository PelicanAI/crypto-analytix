import crypto from 'crypto'
import { logger } from '@/lib/logger'
import type { SnapTradeAccount, SnapTradePosition, SnapTradeBalance } from '@/types/snaptrade'

const SNAPTRADE_BASE_URL = 'https://api.snaptrade.com/api/v1'

function getConfig() {
  const clientId = process.env.SNAPTRADE_CLIENT_ID
  const consumerKey = process.env.SNAPTRADE_CONSUMER_KEY
  if (!clientId || !consumerKey) {
    throw new SnapTradeError('SnapTrade credentials not configured', 'CONFIG_ERROR')
  }
  return { clientId, consumerKey }
}

export class SnapTradeError extends Error {
  code: string
  statusCode?: number

  constructor(message: string, code: string, statusCode?: number) {
    super(message)
    this.name = 'SnapTradeError'
    this.code = code
    this.statusCode = statusCode
  }
}

function generateSignature(
  consumerKey: string,
  requestData: string
): string {
  return crypto
    .createHmac('sha256', consumerKey)
    .update(requestData)
    .digest('hex')
}

async function snapTradeRequest<T>(
  method: string,
  path: string,
  params?: Record<string, string>,
  body?: unknown
): Promise<T> {
  const { clientId, consumerKey } = getConfig()
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const queryParams = new URLSearchParams({ clientId, ...params })
  const queryString = queryParams.toString()
  const fullPath = `${path}?${queryString}`

  const bodyString = body ? JSON.stringify(body) : ''
  const signatureContent = `/api/v1${path}${bodyString}${queryString}${timestamp}`
  const signature = generateSignature(consumerKey, signatureContent)

  const url = `${SNAPTRADE_BASE_URL}${fullPath}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Timestamp': timestamp,
    'Signature': signature,
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? bodyString : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      logger.error('SnapTrade API error', {
        path,
        status: response.status,
        error: errorText,
      })
      throw new SnapTradeError(
        'SnapTrade API request failed',
        'API_ERROR',
        response.status
      )
    }

    const data = await response.json() as T
    return data
  } catch (error) {
    if (error instanceof SnapTradeError) throw error

    logger.error('SnapTrade network error', {
      path,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw new SnapTradeError(
      'Unable to reach SnapTrade API',
      'NETWORK_ERROR'
    )
  }
}

export async function registerUser(
  userId: string
): Promise<{ userId: string; userSecret: string }> {
  const result = await snapTradeRequest<{ userId: string; userSecret: string }>(
    'POST',
    '/snapTrade/registerUser',
    {},
    { userId }
  )
  logger.info('SnapTrade user registered', { userId })
  return result
}

export async function generateConnectionLink(
  userId: string,
  userSecret: string,
  broker?: string
): Promise<string> {
  const body: Record<string, string> = {}
  if (broker) body.broker = broker

  const result = await snapTradeRequest<{ redirectURI: string }>(
    'POST',
    `/snapTrade/login/${userId}`,
    { userSecret },
    Object.keys(body).length > 0 ? body : undefined
  )
  return result.redirectURI
}

export async function listAccounts(
  userId: string,
  userSecret: string
): Promise<SnapTradeAccount[]> {
  return snapTradeRequest<SnapTradeAccount[]>(
    'GET',
    '/accounts',
    { userId, userSecret }
  )
}

export async function getPositions(
  userId: string,
  userSecret: string,
  accountId: string
): Promise<SnapTradePosition[]> {
  return snapTradeRequest<SnapTradePosition[]>(
    'GET',
    `/accounts/${accountId}/positions`,
    { userId, userSecret }
  )
}

export async function getBalances(
  userId: string,
  userSecret: string,
  accountId: string
): Promise<SnapTradeBalance[]> {
  return snapTradeRequest<SnapTradeBalance[]>(
    'GET',
    `/accounts/${accountId}/balances`,
    { userId, userSecret }
  )
}

export async function getTransactions(
  userId: string,
  userSecret: string,
  accountId: string,
  startDate?: string
): Promise<unknown[]> {
  const params: Record<string, string> = { userId, userSecret }
  if (startDate) params.startDate = startDate

  return snapTradeRequest<unknown[]>(
    'GET',
    `/accounts/${accountId}/activities`,
    params
  )
}

export async function deleteUser(
  userId: string,
  userSecret: string
): Promise<void> {
  await snapTradeRequest<unknown>(
    'DELETE',
    '/snapTrade/deleteUser',
    { userId, userSecret }
  )
  logger.info('SnapTrade user deleted', { userId })
}
