
import { MarketSector, SectorWeights, StockPick } from './types';

export const SECTOR_WEIGHTS: Record<MarketSector, SectorWeights> = {
  [MarketSector.FINANCE]: { quality: 0.40, valuation: 0.30, momentum: 0.15, catalysts: 0.15 },
  [MarketSector.UTILITIES]: { quality: 0.50, valuation: 0.30, momentum: 0.10, catalysts: 0.10 },
  [MarketSector.TELECOM]: { quality: 0.30, valuation: 0.20, momentum: 0.30, catalysts: 0.20 },
  [MarketSector.AGRICULTURE]: { quality: 0.35, valuation: 0.35, momentum: 0.10, catalysts: 0.20 },
  [MarketSector.MANUFACTURING]: { quality: 0.45, valuation: 0.25, momentum: 0.15, catalysts: 0.15 },
  [MarketSector.REAL_ESTATE]: { quality: 0.25, valuation: 0.50, momentum: 0.10, catalysts: 0.15 },
  [MarketSector.ENERGY]: { quality: 0.40, valuation: 0.40, momentum: 0.10, catalysts: 0.10 },
  [MarketSector.INVESTMENT]: { quality: 0.30, valuation: 0.40, momentum: 0.15, catalysts: 0.15 }
};

export const MOCK_STOCKS: StockPick[] = [
  {
    symbol: "SCOM",
    sector: MarketSector.TELECOM,
    current_price: 15.20,
    price_change_pct: 1.2,
    quality_pass: true,
    valuation: { pe: 11.2, pb: 4.5, div_yield_pct: 5.8 },
    buy_range_kes: { low: 13.5, high: 16.0 },
    position_size_pct: 15.0,
    risk_controls: { stop_kes: 12.0, max_drawdown_pct: 12.0 },
    fair_value_target_kes: 22.0,
    catalysts: ["Ethiopia operations break-even", "M-Pesa growth"],
    confidence: { score: 75, explanation: "Momentum play contingent on Ethiopia." },
    notes: "Accumulate on dips.",
    news_headline: "Safaricom Ethiopia subscribers hit 5 million mark.",
    recent_sentiment: 'Neutral',
    indicators: { rsi: 52, macd: 'Neutral', volume_24h: '4.2M', trend: 'Sideways' }
  },
  {
    symbol: "EQTY",
    sector: MarketSector.FINANCE,
    current_price: 44.50,
    price_change_pct: 2.1,
    quality_pass: true,
    valuation: { pe: 4.5, pb: 0.9, div_yield_pct: 8.9 },
    buy_range_kes: { low: 38.0, high: 45.0 },
    position_size_pct: 12.0,
    risk_controls: { stop_kes: 35.0, max_drawdown_pct: 10.0 },
    fair_value_target_kes: 58.0,
    catalysts: ["Regional expansion", "High dividend payout"],
    confidence: { score: 91, explanation: "Consistent ROE outperformer." },
    notes: "Core holding for high-yield portfolio.",
    news_headline: "Equity Group Q3 profits surge by 20% on regional growth.",
    recent_sentiment: 'Positive',
    indicators: { rsi: 64, macd: 'Bullish', volume_24h: '1.8M', trend: 'Up' }
  },
  {
    symbol: "KCB",
    sector: MarketSector.FINANCE,
    current_price: 32.10,
    price_change_pct: -0.5,
    quality_pass: true,
    valuation: { pe: 3.8, pb: 0.6, div_yield_pct: 9.2 },
    buy_range_kes: { low: 28.0, high: 33.0 },
    position_size_pct: 10.0,
    risk_controls: { stop_kes: 26.0, max_drawdown_pct: 12.0 },
    fair_value_target_kes: 45.0,
    catalysts: ["Trust Merchant Bank integration", "Cost-to-income improvement"],
    confidence: { score: 85, explanation: "Deep value play in Tier 1 banking." },
    notes: "Attractive PB discount vs peers.",
    recent_sentiment: 'Neutral',
    indicators: { rsi: 41, macd: 'Bearish', volume_24h: '850K', trend: 'Down' }
  },
  {
    symbol: "TOTL",
    sector: MarketSector.ENERGY,
    current_price: 18.50,
    price_change_pct: 0.3,
    quality_pass: true,
    valuation: { pe: 5.1, pb: 0.6, div_yield_pct: 10.5 },
    buy_range_kes: { low: 17.5, high: 19.5 },
    position_size_pct: 8.0,
    risk_controls: { stop_kes: 16.0, max_drawdown_pct: 10.0 },
    fair_value_target_kes: 26.0,
    catalysts: ["Increased aviation fuel demand", "Strong dividend history"],
    confidence: { score: 89, explanation: "Undisputed leader in market share with fortress balance sheet." },
    notes: "TotalEnergies is a classic Nyoro value play. Heavy cash flow and huge PB discount.",
    news_headline: "TotalEnergies reports 15% growth in non-fuel revenue.",
    recent_sentiment: 'Positive',
    indicators: { rsi: 58, macd: 'Bullish', volume_24h: '120K', trend: 'Up' }
  },
  {
    symbol: "RUBI",
    sector: MarketSector.ENERGY,
    current_price: 32.10,
    price_change_pct: 1.5,
    quality_pass: true,
    valuation: { pe: 7.2, pb: 0.9, div_yield_pct: 6.8 },
    buy_range_kes: { low: 29.0, high: 33.5 },
    position_size_pct: 6.0,
    risk_controls: { stop_kes: 27.5, max_drawdown_pct: 12.0 },
    fair_value_target_kes: 42.0,
    catalysts: ["Expansion into LPG market", "Regional logistics efficiency"],
    confidence: { score: 82, explanation: "Efficient operator gaining market share." },
    notes: "Strategic focus on higher-margin LPG segments provides long-term upside.",
    news_headline: "Rubis announces new terminal completion in Mombasa.",
    recent_sentiment: 'Positive',
    indicators: { rsi: 61, macd: 'Bullish', volume_24h: '45K', trend: 'Up' }
  },
  {
    symbol: "KPLC",
    sector: MarketSector.UTILITIES,
    current_price: 1.85,
    price_change_pct: 4.2,
    quality_pass: true,
    valuation: { pe: 2.1, pb: 0.2, div_yield_pct: 0.0 },
    buy_range_kes: { low: 1.5, high: 1.9 },
    position_size_pct: 8.0,
    risk_controls: { stop_kes: 1.4, max_drawdown_pct: 15.0 },
    fair_value_target_kes: 3.5,
    catalysts: ["Debt restructuring", "Tariff review success"],
    confidence: { score: 82, explanation: "Deep value play with significant margin of safety." },
    notes: "Extreme undervaluation.",
    recent_sentiment: 'Positive',
    indicators: { rsi: 68, macd: 'Bullish', volume_24h: '12.4M', trend: 'Up' }
  },
  {
    symbol: "BAT",
    sector: MarketSector.MANUFACTURING,
    current_price: 415.0,
    price_change_pct: -1.2,
    quality_pass: true,
    valuation: { pe: 8.5, pb: 4.2, div_yield_pct: 12.8 },
    buy_range_kes: { low: 390.0, high: 425.0 },
    position_size_pct: 10.0,
    risk_controls: { stop_kes: 360.0, max_drawdown_pct: 8.0 },
    fair_value_target_kes: 520.0,
    catalysts: ["New product categories", "Regional exports"],
    confidence: { score: 92, explanation: "Exceptional cash flow and dividend track record." },
    notes: "Defensive play with inflation hedge.",
    recent_sentiment: 'Positive',
    indicators: { rsi: 45, macd: 'Neutral', volume_24h: '18K', trend: 'Sideways' }
  },
  {
    symbol: "CTUM",
    sector: MarketSector.INVESTMENT,
    current_price: 8.50,
    price_change_pct: 0.0,
    quality_pass: true,
    valuation: { pe: 3.2, pb: 0.2, div_yield_pct: 7.1 },
    buy_range_kes: { low: 8.0, high: 9.0 },
    position_size_pct: 5.0,
    risk_controls: { stop_kes: 7.2, max_drawdown_pct: 15.0 },
    fair_value_target_kes: 14.5,
    catalysts: ["Asset sales", "Debt reduction"],
    confidence: { score: 70, explanation: "Asset-rich play trading at deep discount to NAV." },
    notes: "Speculative value play.",
    recent_sentiment: 'Neutral',
    indicators: { rsi: 38, macd: 'Neutral', volume_24h: '420K', trend: 'Sideways' }
  },
  {
    symbol: "KEGN",
    sector: MarketSector.UTILITIES,
    current_price: 2.15,
    price_change_pct: 0.5,
    quality_pass: true,
    valuation: { pe: 4.1, pb: 0.3, div_yield_pct: 8.5 },
    buy_range_kes: { low: 2.0, high: 2.3 },
    position_size_pct: 10.0,
    risk_controls: { stop_kes: 1.8, max_drawdown_pct: 10.0 },
    fair_value_target_kes: 4.2,
    catalysts: ["Geothermal expansion", "Stable PPA agreements"],
    confidence: { score: 88, explanation: "Defensive cash cow with massive asset base." },
    notes: "Core utility holding.",
    recent_sentiment: 'Positive',
    indicators: { rsi: 55, macd: 'Bullish', volume_24h: '1.2M', trend: 'Up' }
  }
];

export const INITIAL_REPORT = {
  timestamp: new Date().toISOString().split('T')[0],
  market_snapshot: {
    indices: [
      { name: "NSE All Share", value: 104.5, change_pct: 0.8 },
      { name: "NSE 20", value: 1620.4, change_pct: -0.2 },
      { name: "NSE 25", value: 2450.2, change_pct: 0.5 }
    ],
    sectors: [
      { name: "Finance", market_cap_kes: 450_000_000_000, div_yield_pct: 8.5 },
      { name: "Telecom", market_cap_kes: 650_000_000_000, div_yield_pct: 4.2 },
      { name: "Utilities", market_cap_kes: 120_000_000_000, div_yield_pct: 12.1 },
      { name: "Agriculture", market_cap_kes: 45_000_000_000, div_yield_pct: 14.5 },
      { name: "Manufacturing", market_cap_kes: 210_000_000_000, div_yield_pct: 10.2 },
      { name: "Energy", market_cap_kes: 85_000_000_000, div_yield_pct: 9.8 }
    ]
  },
  monthly_picks: MOCK_STOCKS.slice(0, 6),
  yearly_picks: [],
  sector_rotation: [
    { sector: "Finance", signal: "Improving Breadth", action: "Overweight", evidence: "Banks showing resilient NIM despite inflation." },
    { sector: "Energy", signal: "Demand Recovery", action: "Overweight", evidence: "Recovery in transport fuel consumption." }
  ],
  portfolio_modes: {
    standard: {
      allocation: [
        { symbol: "EQTY", weight_pct: 15 },
        { symbol: "SCOM", weight_pct: 20 },
        { symbol: "TOTL", weight_pct: 10 }
      ]
    },
    low_risk: {
      allocation: [
        { symbol: "BAT", weight_pct: 15 },
        { symbol: "TOTL", weight_pct: 12 }
      ]
    },
    opportunistic: {
      allocation: [
        { symbol: "KPLC", weight_pct: 15 },
        { symbol: "RUBI", weight_pct: 12 }
      ]
    }
  },
  audit: {
    data_sources: ["NSE", "Internal Terminal"],
    metrics_snapshot: { market_cap_kes: 1_850_000_000_000, market_pe: 7.2 },
    changes_vs_prior: ["Added Screener capabilities", "Updated Technicals"]
  }
};
