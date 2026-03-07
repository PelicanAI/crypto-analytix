export type GlossaryCategory =
  | 'derivatives'
  | 'defi'
  | 'onchain'
  | 'trading'
  | 'fundamentals'
  | 'risk'

export interface GlossaryTerm {
  term: string
  definition: string
  tradfi_analog: string
  category: GlossaryCategory
  related: string[]
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ─── DERIVATIVES ────────────────────────────────────────────────────────

  {
    term: 'Perpetual Swap',
    definition:
      'A futures contract with no expiration date. Traders hold positions indefinitely, with the contract price kept near spot via periodic funding rate payments between longs and shorts.',
    tradfi_analog:
      'Think of a rolling CME E-mini S&P 500 future that auto-rolls every 8 hours instead of quarterly. No expiry management, no roll cost — just continuous exposure with a funding mechanism replacing the roll.',
    category: 'derivatives',
    related: ['Funding Rate', 'Mark Price', 'Liquidation', 'Open Interest'],
  },
  {
    term: 'Funding Rate',
    definition:
      'A periodic payment (typically every 8 hours) exchanged between long and short holders of a perpetual swap. When positive, longs pay shorts; when negative, shorts pay longs. It keeps perp prices anchored to spot.',
    tradfi_analog:
      'Similar to the overnight repo rate or the cost-of-carry on a futures contract, but settled 3x daily instead of at expiry. Positive funding is like paying to borrow stock for a long position; negative funding is like earning a rebate on your short.',
    category: 'derivatives',
    related: ['Perpetual Swap', 'Basis', 'Open Interest', 'Mark Price'],
  },
  {
    term: 'Liquidation',
    definition:
      'Forced closure of a leveraged position when the trader\'s margin falls below the maintenance requirement. The exchange\'s liquidation engine takes over and closes the position at market, often triggering cascading liquidations nearby.',
    tradfi_analog:
      'Identical in concept to a margin call on a futures account, except there is no phone call and no grace period. Your FCM would give you until 3 PM to wire funds — crypto exchanges liquidate in milliseconds, 24/7, with no human in the loop.',
    category: 'derivatives',
    related: ['Leverage', 'Margin', 'Mark Price', 'Insurance Fund'],
  },
  {
    term: 'Open Interest',
    definition:
      'The total number of outstanding derivative contracts (perpetual swaps, futures, options) that have not been settled. Rising OI with rising price indicates new money entering; rising OI with falling price signals aggressive shorting.',
    tradfi_analog:
      'Exactly the same as open interest on CME futures or CBOE options. If you track ES or NQ OI to gauge positioning, the interpretation is identical in crypto — just remember crypto OI includes perps, which have no expiry cycle.',
    category: 'derivatives',
    related: ['Perpetual Swap', 'Funding Rate', 'Liquidation'],
  },
  {
    term: 'Basis',
    definition:
      'The price difference between a futures (or perpetual) contract and the underlying spot price. A positive basis means futures trade above spot; a negative basis means below.',
    tradfi_analog:
      'Same as the basis on any futures contract — the ES futures basis relative to the cash S&P 500. In crypto, the perp basis is tightly managed by funding rates, while quarterly futures show a traditional term structure.',
    category: 'derivatives',
    related: ['Contango', 'Backwardation', 'Funding Rate', 'Perpetual Swap'],
  },
  {
    term: 'Contango',
    definition:
      'When futures prices are higher than the current spot price, creating an upward-sloping term structure. Common in bullish crypto markets where demand for leveraged long exposure is high.',
    tradfi_analog:
      'Same concept as contango in crude oil (CL) or VIX futures. In crypto, persistent contango often shows up as consistently positive funding rates on perps — traders are paying a premium to stay long.',
    category: 'derivatives',
    related: ['Backwardation', 'Basis', 'Funding Rate'],
  },
  {
    term: 'Backwardation',
    definition:
      'When futures prices are lower than the current spot price, creating a downward-sloping term structure. Rare in crypto and typically signals extreme fear or forced selling.',
    tradfi_analog:
      'Same as backwardation in commodity futures. In crypto, backwardation (negative funding) often precedes short squeezes, similar to how extreme backwardation in VIX futures has historically signaled panic bottoms.',
    category: 'derivatives',
    related: ['Contango', 'Basis', 'Funding Rate'],
  },
  {
    term: 'Leverage',
    definition:
      'Borrowing capital to increase position size beyond your account balance. Crypto exchanges offer up to 100x or more, though most experienced traders use 2-5x. Higher leverage means smaller moves trigger liquidation.',
    tradfi_analog:
      'Same concept as leverage on ES futures (where 1 contract controls ~$250K on ~$13K margin, roughly 19x). The difference: crypto exchanges offer 50-125x with no regulatory guardrails, and liquidation is instant with no margin call buffer.',
    category: 'derivatives',
    related: ['Margin', 'Liquidation', 'Perpetual Swap'],
  },
  {
    term: 'Margin',
    definition:
      'The collateral deposited to open and maintain a leveraged position. Initial margin is required to open; maintenance margin is the minimum to keep the position alive. Falling below maintenance triggers liquidation.',
    tradfi_analog:
      'Functionally identical to initial and maintenance margin on CME futures. The key difference: crypto margin is typically in USDT or the asset itself, not USD in a segregated FCM account. Cross-margin mode pools all your exchange balance as collateral.',
    category: 'derivatives',
    related: ['Leverage', 'Liquidation', 'Mark Price'],
  },
  {
    term: 'Mark Price',
    definition:
      'A fair-value reference price calculated from multiple spot exchanges and the funding rate. Used to determine unrealized P&L and liquidation thresholds, preventing manipulation of a single exchange\'s order book from triggering mass liquidations.',
    tradfi_analog:
      'Similar to the settlement price on CME futures, which uses a volume-weighted calculation across the settlement window. Mark price serves the same purpose — a manipulation-resistant reference for margin calculations.',
    category: 'derivatives',
    related: ['Index Price', 'Liquidation', 'Funding Rate'],
  },
  {
    term: 'Index Price',
    definition:
      'A composite spot price aggregated from multiple major exchanges, weighted by volume. Serves as the reference for calculating the mark price and funding rate on derivatives.',
    tradfi_analog:
      'Conceptually like the S&P 500 index itself — a composite of underlying prices that derivatives reference. Just as ES futures settle against the S&P 500 cash index, crypto perps reference a multi-exchange index price.',
    category: 'derivatives',
    related: ['Mark Price', 'Funding Rate', 'Perpetual Swap'],
  },
  {
    term: 'Insurance Fund',
    definition:
      'A reserve pool maintained by the exchange to cover losses when liquidated positions cannot be closed at their bankruptcy price. Prevents "socialized losses" from being spread to profitable traders.',
    tradfi_analog:
      'Similar in purpose to the CME clearing house guarantee fund. When a client blows up and the FCM cannot cover the loss, the clearing house backstop kicks in. Crypto insurance funds serve the same role, but they are managed by the exchange itself, not a regulated clearinghouse.',
    category: 'derivatives',
    related: ['Liquidation', 'Leverage', 'Mark Price'],
  },

  // ─── DEFI ───────────────────────────────────────────────────────────────

  {
    term: 'TVL',
    definition:
      'Total Value Locked — the aggregate dollar value of all crypto assets deposited into a DeFi protocol. The primary metric for gauging a DeFi protocol\'s adoption, trustworthiness, and liquidity depth.',
    tradfi_analog:
      'Think of it like assets under management (AUM) for a fund or total deposits at a bank. A protocol with $5B TVL is roughly comparable to a mid-size bank\'s deposit base — it tells you how much capital the market trusts it with.',
    category: 'defi',
    related: ['Liquidity Pool', 'Yield Farming', 'Smart Contract Risk'],
  },
  {
    term: 'Yield Farming',
    definition:
      'Depositing crypto assets into DeFi protocols to earn returns, often by providing liquidity, lending, or staking. Returns come from trading fees, protocol token rewards, or interest from borrowers.',
    tradfi_analog:
      'Similar to deploying capital into a money market fund, securities lending, or earning interest on a sweep account — except the "bank" is a smart contract, the rates fluctuate minute-by-minute, and the principal is subject to smart contract risk.',
    category: 'defi',
    related: ['Liquidity Pool', 'TVL', 'Impermanent Loss', 'Staking'],
  },
  {
    term: 'Liquidity Pool',
    definition:
      'A smart contract holding paired token deposits (e.g., ETH/USDC) that enables decentralized trading. Depositors earn a share of trading fees proportional to their contribution.',
    tradfi_analog:
      'Imagine being a market maker on the NYSE — you provide two-sided liquidity and earn the spread. In a liquidity pool, anyone can become a market maker by depositing tokens. The pool\'s algorithm handles pricing instead of a specialist.',
    category: 'defi',
    related: ['AMM', 'Impermanent Loss', 'TVL', 'Yield Farming'],
  },
  {
    term: 'Impermanent Loss',
    definition:
      'The unrealized loss that liquidity providers experience when the price ratio of their deposited tokens changes relative to when they deposited. Called "impermanent" because it reverses if prices return to the original ratio.',
    tradfi_analog:
      'Similar to the opportunity cost of a covered call strategy. You earn premium (trading fees) but give up upside if one asset moves significantly. Except here, the loss is automatic and algorithmic — the pool rebalances against you as prices diverge.',
    category: 'defi',
    related: ['Liquidity Pool', 'AMM', 'Yield Farming'],
  },
  {
    term: 'AMM',
    definition:
      'Automated Market Maker — an algorithm that prices assets in a liquidity pool using a mathematical formula (typically x*y=k) instead of an order book. Enables trading without a traditional market maker or exchange.',
    tradfi_analog:
      'Replaces the NYSE specialist or Nasdaq market maker with a mathematical formula. Instead of a human quoting bids and asks, a smart contract uses a bonding curve. The trade-off: guaranteed liquidity at every price, but wider effective spreads for large orders.',
    category: 'defi',
    related: ['Liquidity Pool', 'Impermanent Loss', 'Slippage', 'Order Book'],
  },
  {
    term: 'Staking',
    definition:
      'Locking up crypto tokens to help secure a proof-of-stake blockchain network. In return, stakers earn protocol rewards (new token issuance + transaction fees), typically 3-8% annually.',
    tradfi_analog:
      'Closest to earning interest on a Treasury bond or dividend on a utility stock — you commit capital, receive yield, and help the system function. The lock-up period is similar to a CD maturity or bond duration, and unstaking often has a 7-21 day withdrawal queue.',
    category: 'defi',
    related: ['Yield Farming', 'Governance Token', 'TVL'],
  },
  {
    term: 'Governance Token',
    definition:
      'A token that grants holders voting rights on protocol decisions: fee structures, treasury spending, code upgrades. Holding governance tokens is how DeFi protocols are "owned" and directed by their communities.',
    tradfi_analog:
      'Like voting shares of a corporation. Owning UNI (Uniswap\'s governance token) is conceptually similar to owning voting stock in the NYSE — you get a say in how the exchange operates, what fees it charges, and how its treasury is deployed.',
    category: 'defi',
    related: ['Staking', 'TVL', 'Smart Contract Risk'],
  },

  // ─── ON-CHAIN ───────────────────────────────────────────────────────────

  {
    term: 'Whale',
    definition:
      'An individual or entity holding a large amount of a cryptocurrency — typically enough to move markets when they trade. Whale watching is a core on-chain analysis technique, tracking large wallets for early signals.',
    tradfi_analog:
      'Like tracking 13F filings or large block trades on the NYSE tape. When Berkshire moves, people notice. On-chain, every large wallet\'s transactions are public and real-time — imagine if you could see Soros\'s order flow live.',
    category: 'onchain',
    related: ['Exchange Flows', 'Wallet', 'Block Explorer'],
  },
  {
    term: 'Exchange Flows',
    definition:
      'The movement of crypto assets into (inflows) and out of (outflows) exchange wallets. Inflows often signal intent to sell; outflows suggest accumulation for long-term holding or DeFi deployment.',
    tradfi_analog:
      'Analogous to tracking fund flows — when equity mutual funds see redemptions, it signals selling pressure. Exchange inflows are the crypto equivalent: assets moving to where they can be sold. Outflows are like new subscriptions to a closed-end fund.',
    category: 'onchain',
    related: ['Whale', 'Wallet', 'Block Explorer'],
  },
  {
    term: 'Wallet',
    definition:
      'A cryptographic address on a blockchain that can hold, send, and receive crypto assets. Wallets can be software (app), hardware (device), or smart contract-based. Your wallet address is public; your private key is the password.',
    tradfi_analog:
      'Think of it as a brokerage account with a publicly visible balance. Anyone can see your holdings and every transaction, but only you (with the private key) can authorize trades. There is no SIPC insurance and no password reset.',
    category: 'onchain',
    related: ['Private Key', 'Smart Contract', 'Exchange Flows'],
  },
  {
    term: 'Private Key',
    definition:
      'A secret cryptographic string that proves ownership of a wallet and authorizes all transactions. Losing your private key means permanently losing access to your assets. There is no recovery mechanism.',
    tradfi_analog:
      'Like the master password to your brokerage account, except there is no "Forgot Password" link, no customer support, and no legal recourse. If someone gets your private key, they empty your account instantly and irrevocably — no chargebacks, no FINRA arbitration.',
    category: 'onchain',
    related: ['Wallet', 'Smart Contract', 'Counterparty Risk'],
  },
  {
    term: 'Smart Contract',
    definition:
      'Self-executing code deployed on a blockchain that automatically enforces the terms of an agreement. DeFi protocols, token standards, and NFTs are all built on smart contracts. Once deployed, they run autonomously.',
    tradfi_analog:
      'Like an escrow agreement that executes automatically with no lawyer, no bank, and no court. Imagine if your futures contract margin rules, auto-liquidation, and settlement were all handled by code that runs 24/7 with no human override possible.',
    category: 'onchain',
    related: ['Smart Contract Risk', 'Gas Fees', 'Wallet'],
  },
  {
    term: 'MEV',
    definition:
      'Maximal Extractable Value — profit that block producers (validators) or specialized bots can extract by reordering, inserting, or censoring transactions within a block. Includes front-running, back-running, and sandwich attacks.',
    tradfi_analog:
      'The crypto version of front-running and latency arbitrage on equity exchanges. Like HFT firms co-locating at NYSE to see and react to orders before they execute — except on-chain, the pending transaction pool (mempool) is public, making front-running structurally easier.',
    category: 'onchain',
    related: ['Gas Fees', 'Smart Contract', 'Slippage'],
  },
  {
    term: 'Gas Fees',
    definition:
      'Transaction fees paid to blockchain validators for processing and confirming transactions. Gas prices fluctuate with network demand — during high congestion, a simple transfer can cost $50+ on Ethereum.',
    tradfi_analog:
      'Similar to exchange commission fees or ECN access charges, but highly variable. Imagine if your commission on an ES trade ranged from $0.50 to $200 depending on how busy the CME was at that moment — that is the gas fee experience on Ethereum.',
    category: 'onchain',
    related: ['MEV', 'Smart Contract', 'Wallet'],
  },
  {
    term: 'Block Explorer',
    definition:
      'A website or tool that allows anyone to search and view all transactions, wallet balances, and smart contract activity on a public blockchain. Etherscan (Ethereum) and Solscan (Solana) are the most popular.',
    tradfi_analog:
      'Like a real-time Bloomberg terminal for blockchain data, except it is free and anyone can use it. Imagine if every trade, every account balance, and every corporate treasury transaction at every brokerage was publicly searchable in real time.',
    category: 'onchain',
    related: ['Wallet', 'Exchange Flows', 'Whale'],
  },

  // ─── TRADING ────────────────────────────────────────────────────────────

  {
    term: 'Slippage',
    definition:
      'The difference between the expected price of a trade and the actual execution price. On DEXs, slippage occurs because the AMM formula reprices assets as you trade. On CEXs, it results from thin order book depth.',
    tradfi_analog:
      'Same concept as slippage on any market order — you expect to fill ES at 5200 and get 5200.25. In crypto, slippage can be much worse: illiquid tokens on a DEX can slip 1-5% on modest size, similar to trading a micro-cap stock with $50K daily volume.',
    category: 'trading',
    related: ['AMM', 'Order Book', 'Liquidity Pool', 'Market Maker'],
  },
  {
    term: 'Order Book',
    definition:
      'A real-time list of buy and sell orders organized by price level. Centralized exchanges (CEXs) like Binance use traditional order books. Decentralized exchanges (DEXs) mostly use AMMs, though some newer DEXs are order book-based.',
    tradfi_analog:
      'Identical to the Level 2 order book on any stock or futures exchange. CEX order books look and behave just like what you see on your NinjaTrader DOM. DEX AMM pools replace the order book with an algorithm — no visible bid/ask queue.',
    category: 'trading',
    related: ['AMM', 'Market Maker', 'Slippage', 'Spread'],
  },
  {
    term: 'Market Maker',
    definition:
      'An entity that provides liquidity by placing simultaneous buy and sell orders, earning the spread. On CEXs, professional firms like Wintermute and Jump fill this role. On DEXs, the liquidity pool and AMM algorithm replace traditional market makers.',
    tradfi_analog:
      'Same as Citadel Securities or Virtu making markets on the NYSE/Nasdaq. Crypto market makers use the same strategies (delta-hedging, statistical arbitrage) and often the same firms are involved. The key difference: anyone can market-make on a DEX via liquidity pools.',
    category: 'trading',
    related: ['Order Book', 'Spread', 'Slippage', 'Liquidity Pool'],
  },
  {
    term: 'Spread',
    definition:
      'The difference between the best bid and best ask price. On major pairs (BTC/USDT) at top exchanges, spreads are sub-penny. On illiquid altcoins or DEXs, spreads can be 0.5-3%, significantly impacting execution cost.',
    tradfi_analog:
      'Exactly the same as the bid-ask spread on any traded instrument. Major crypto pairs on Binance have tighter spreads than most FX pairs. But tail-end altcoins trade like penny stocks — wide spreads, thin books, and real execution risk.',
    category: 'trading',
    related: ['Order Book', 'Market Maker', 'Slippage'],
  },

  // ─── RISK ───────────────────────────────────────────────────────────────

  {
    term: 'Counterparty Risk',
    definition:
      'The risk that the entity holding your assets (an exchange, lending protocol, or custodian) fails, gets hacked, or freezes withdrawals. FTX, Celsius, and BlockFi collapses demonstrated this risk in 2022.',
    tradfi_analog:
      'Similar to broker-dealer insolvency risk, but without SIPC protection. Imagine if your FCM collapsed and your segregated margin vanished overnight with no insurance and no regulatory recourse. That is what FTX depositors experienced — $8B in customer funds gone.',
    category: 'risk',
    related: ['Smart Contract Risk', 'Private Key', 'Wallet'],
  },
  {
    term: 'Smart Contract Risk',
    definition:
      'The risk that a DeFi protocol\'s code contains bugs, vulnerabilities, or exploitable logic that leads to loss of deposited funds. Even audited protocols have been exploited for hundreds of millions.',
    tradfi_analog:
      'Like operational risk at a bank, but magnified. Imagine if a bug in the NYSE matching engine could let someone drain every account on the exchange — and there was no rollback, no insurance, and the "exchange" is anonymous code no one fully controls.',
    category: 'risk',
    related: ['Smart Contract', 'Counterparty Risk', 'Oracle Risk', 'TVL'],
  },
  {
    term: 'Rug Pull',
    definition:
      'A scam where project developers drain the liquidity pool or treasury and disappear, leaving token holders with worthless assets. Can be sudden (liquidity removal) or gradual (slow sell-off by insiders).',
    tradfi_analog:
      'The crypto-native version of a pump-and-dump scheme combined with securities fraud. Like a shell company listing on OTC Markets, pumping the stock, and then the management team fleeing the country — except in crypto, the perpetrators are often pseudonymous and there is no SEC enforcement.',
    category: 'risk',
    related: ['Counterparty Risk', 'Smart Contract Risk', 'Liquidity Pool'],
  },
  {
    term: 'Oracle Risk',
    definition:
      'The risk that a price feed (oracle) providing off-chain data to on-chain smart contracts delivers incorrect, stale, or manipulated prices. DeFi protocols depend on oracles for mark prices, liquidation triggers, and loan collateral valuations.',
    tradfi_analog:
      'Like the risk of a bad price feed from a data vendor causing your stop-loss to trigger on a phantom quote. Imagine if Bloomberg\'s price feed briefly showed gold at $0.01 and every automated system executed against that price — that is an oracle manipulation exploit in DeFi.',
    category: 'risk',
    related: ['Smart Contract Risk', 'Mark Price', 'Liquidation'],
  },

  // ─── FUNDAMENTALS ───────────────────────────────────────────────────────

  {
    term: 'Tokenomics',
    definition:
      'The economic design of a cryptocurrency: total supply, emission schedule, distribution, burn mechanisms, staking rewards, and treasury allocation. Tokenomics determine long-term supply/demand dynamics and inflation rate.',
    tradfi_analog:
      'Combines share structure analysis (float, insider holdings, lockup schedules) with monetary policy analysis (is the Fed printing or tapering?). A token with 10% circulating and 90% locked is like a stock with massive insider lockups about to expire.',
    category: 'fundamentals',
    related: ['Governance Token', 'Staking', 'Token Unlock'],
  },
  {
    term: 'Token Unlock',
    definition:
      'A scheduled event where previously locked tokens (allocated to team, investors, or treasury) become transferable and sellable. Large unlocks can create significant sell pressure as early investors take profits.',
    tradfi_analog:
      'Identical to an IPO lockup expiration. When insiders and VCs can finally sell their shares, selling pressure often increases. Crypto unlocks happen on predefined schedules (monthly, quarterly cliffs) and the amounts are publicly visible on-chain.',
    category: 'fundamentals',
    related: ['Tokenomics', 'Exchange Flows', 'Whale'],
  },
  {
    term: 'DeFi',
    definition:
      'Decentralized Finance — financial services (lending, borrowing, trading, insurance) built on smart contracts that operate without traditional intermediaries like banks, brokers, or clearinghouses.',
    tradfi_analog:
      'Imagine if every financial service you use — your brokerage, your bank, your insurance company — was replaced by open-source software anyone can audit, fork, or compose together. The upside: 24/7, global, permissionless. The downside: no FDIC, no SIPC, and bugs can drain the vault.',
    category: 'fundamentals',
    related: ['Smart Contract', 'TVL', 'Liquidity Pool', 'Yield Farming'],
  },
  {
    term: 'Layer 2',
    definition:
      'A secondary blockchain built on top of a Layer 1 (like Ethereum) to increase transaction speed and reduce gas fees. Transactions are processed on L2 and periodically settled back to L1 for security. Examples: Arbitrum, Optimism, Base.',
    tradfi_analog:
      'Like the relationship between a dark pool and the primary exchange. Trades execute faster and cheaper on the dark pool (L2), but ultimately settle through the primary exchange (L1) for finality. The L1 provides the security guarantee.',
    category: 'fundamentals',
    related: ['Gas Fees', 'Smart Contract', 'DeFi'],
  },
  {
    term: 'Halving',
    definition:
      'A programmed event (approximately every 4 years for Bitcoin) that cuts the block reward for miners in half, reducing the rate of new BTC supply entering the market. The most recent halving was in April 2024.',
    tradfi_analog:
      'Imagine if the Fed was programmed to cut money printing in half every 4 years on a fixed schedule, with no ability to change it. That is Bitcoin\'s monetary policy — predictable, deflationary, and completely immune to political pressure.',
    category: 'fundamentals',
    related: ['Tokenomics', 'Token Unlock'],
  },
]
