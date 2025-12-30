
import { MarketSector, SectorWeights } from './types';

export const SECTOR_WEIGHTS: Record<MarketSector, SectorWeights> = {
  [MarketSector.FINANCE]: { quality: 0.40, valuation: 0.30, momentum: 0.15, catalysts: 0.15 },
  [MarketSector.UTILITIES]: { quality: 0.50, valuation: 0.30, momentum: 0.10, catalysts: 0.10 },
  [MarketSector.TELECOM]: { quality: 0.30, valuation: 0.20, momentum: 0.30, catalysts: 0.20 },
  [MarketSector.AGRICULTURE]: { quality: 0.35, valuation: 0.35, momentum: 0.10, catalysts: 0.20 },
  [MarketSector.MANUFACTURING]: { quality: 0.45, valuation: 0.25, momentum: 0.15, catalysts: 0.15 },
  [MarketSector.REAL_ESTATE]: { quality: 0.25, valuation: 0.50, momentum: 0.10, catalysts: 0.15 }
};

export const INITIAL_REPORT = {
  timestamp: new Date().toISOString().split('T')[0],
  market_snapshot: {
    indices: [
      { name: "NSE All Share", value: 104.5, change_pct: 0.8 },
      { name: "NSE 20", value: 1620.4, change_pct: -0.2 }
    ],
    sectors: [
      { name: "Finance", market_cap_kes: 450_000_000_000, div_yield_pct: 8.5 },
      { name: "Telecom", market_cap_kes: 650_000_000_000, div_yield_pct: 4.2 },
      { name: "Utilities", market_cap_kes: 120_000_000_000, div_yield_pct: 12.1 }
    ]
  },
  monthly_picks: [
    {
      symbol: "KPLC",
      sector: MarketSector.UTILITIES,
      current_price: 1.85,
      quality_pass: true,
      valuation: { pe: 2.1, pb: 0.2, div_yield_pct: 0.0 },
      buy_range_kes: { low: 1.5, high: 1.9 },
      position_size_pct: 8.0,
      risk_controls: { stop_kes: 1.4, max_drawdown_pct: 15.0 },
      fair_value_target_kes: 3.5,
      catalysts: ["Debt restructuring", "Tariff review success", "Improved hydrology"],
      confidence: { score: 82, explanation: "Deep value play with significant margin of safety on PB basis." },
      notes: "Nyoro-style accumulation rationale: Extreme undervaluation vs book value."
    },
    {
      symbol: "EQTY",
      sector: MarketSector.FINANCE,
      current_price: 44.50,
      quality_pass: true,
      valuation: { pe: 4.5, pb: 0.9, div_yield_pct: 8.9 },
      buy_range_kes: { low: 38.0, high: 45.0 },
      position_size_pct: 12.0,
      risk_controls: { stop_kes: 35.0, max_drawdown_pct: 10.0 },
      fair_value_target_kes: 58.0,
      catalysts: ["Regional expansion", "Interest rate cap removal tailwinds", "High dividend payout"],
      confidence: { score: 91, explanation: "Consistent ROE outperformer with solid regional diversification." },
      notes: "Core holding for high-yield portfolio."
    },
    {
        symbol: "SCOM",
        sector: MarketSector.TELECOM,
        current_price: 15.20,
        quality_pass: true,
        valuation: { pe: 11.2, pb: 4.5, div_yield_pct: 5.8 },
        buy_range_kes: { low: 13.5, high: 16.0 },
        position_size_pct: 15.0,
        risk_controls: { stop_kes: 12.0, max_drawdown_pct: 12.0 },
        fair_value_target_kes: 22.0,
        catalysts: ["Ethiopia operations break-even", "M-Pesa growth acceleration"],
        confidence: { score: 75, explanation: "Momentum play contingent on Ethiopia stabilization." },
        notes: "Accumulate on dips below 14.0."
      }
  ],
  yearly_picks: [
    {
      symbol: "COOP",
      thesis: { fundamentals: "Strong cooperative backbone", dividend_policy: "Stable payouts", re_rating_path: "Credit growth recovery" },
      role: "Core",
      risk_summary: "Macro-economic headwinds impacting credit quality",
      monitoring: { events: ["earnings", "policy"], review_cycle: "quarterly" }
    }
  ],
  sector_rotation: [
    { sector: "Finance", signal: "Improving Breadth", action: "Overweight", evidence: "Banks showing resilient NIM despite inflation." },
    { sector: "Utilities", signal: "Policy Shift", action: "Equal-weight", evidence: "Regulatory updates favoring grid modernization." }
  ],
  portfolio_modes: {
    standard: {
      allocation: [
        { symbol: "EQTY", weight_pct: 15 },
        { symbol: "SCOM", weight_pct: 20 },
        { symbol: "KCB", weight_pct: 10 },
        { symbol: "BAT", weight_pct: 10 },
        { symbol: "COOP", weight_pct: 10 }
      ]
    },
    low_risk: {
      allocation: [
        { symbol: "BAT", weight_pct: 15 },
        { symbol: "KEGN", weight_pct: 12 },
        { symbol: "COOP", weight_pct: 12 },
        { symbol: "SCBK", weight_pct: 15 }
      ],
      notes: "Kuza-style constraints: Max 8% per stock, focus on dividend yield > 10%."
    },
    opportunistic: {
      allocation: [
        { symbol: "KPLC", weight_pct: 15 },
        { symbol: "NCBA", weight_pct: 12 },
        { symbol: "SCOM", weight_pct: 25 }
      ],
      risk_constraints: { VaR_95_pct: 4.5 }
    }
  },
  audit: {
    data_sources: ["NSE", "TradingView", "Internal Analytics"],
    metrics_snapshot: { market_cap_kes: 1_850_000_000_000, market_pe: 7.2 },
    changes_vs_prior: ["Added KPLC due to valuation trigger", "Reduced SCOM weight"],
    assumptions: ["No guarantees; educational use only"]
  }
};
