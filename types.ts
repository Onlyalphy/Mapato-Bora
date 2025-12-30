
export enum MarketSector {
  FINANCE = 'Finance',
  UTILITIES = 'Utilities',
  TELECOM = 'Telecommunication',
  AGRICULTURE = 'Agriculture',
  MANUFACTURING = 'Manufacturing',
  REAL_ESTATE = 'Real Estate',
  ENERGY = 'Energy & Petroleum',
  INVESTMENT = 'Investment'
}

// Added SectorWeights interface for valuation scoring and sector rotation analysis
export interface SectorWeights {
  quality: number;
  valuation: number;
  momentum: number;
  catalysts: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: 'Bullish' | 'Bearish' | 'Neutral';
  volume_24h: string;
  trend: 'Up' | 'Down' | 'Sideways';
}

export interface StockPick {
  symbol: string;
  sector: MarketSector;
  current_price: number;
  price_change_pct: number;
  quality_pass: boolean;
  valuation: {
    pe: number;
    pb: number;
    div_yield_pct: number;
  };
  buy_range_kes: {
    low: number;
    high: number;
  };
  position_size_pct: number;
  risk_controls: {
    stop_kes: number;
    max_drawdown_pct: number;
  };
  fair_value_target_kes: number;
  catalysts: string[];
  confidence: {
    score: number;
    explanation: string;
  };
  notes: string;
  news_headline?: string;
  recent_sentiment?: 'Positive' | 'Neutral' | 'Negative';
  indicators?: TechnicalIndicators;
}

export interface MapatoBoraReport {
  timestamp: string;
  market_snapshot: {
    indices: { name: string; value: number; change_pct: number }[];
    sectors: { name: string; market_cap_kes: number; div_yield_pct: number }[];
  };
  monthly_picks: StockPick[];
  yearly_picks: any[];
  sector_rotation: { sector: string; signal: string; action: string; evidence: string }[];
  portfolio_modes: {
    standard: { allocation: { symbol: string; weight_pct: number }[] };
    low_risk: { allocation: { symbol: string; weight_pct: number }[] };
    opportunistic: { allocation: { symbol: string; weight_pct: number }[] };
  };
  audit: {
    data_sources: string[];
    metrics_snapshot: { market_cap_kes: number; market_pe: number };
    changes_vs_prior: string[];
  };
}