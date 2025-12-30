
export enum MarketSector {
  FINANCE = 'Finance',
  UTILITIES = 'Utilities',
  TELECOM = 'Telecommunication',
  AGRICULTURE = 'Agriculture',
  MANUFACTURING = 'Manufacturing',
  REAL_ESTATE = 'Real Estate'
}

export interface SectorWeights {
  quality: number;
  valuation: number;
  momentum: number;
  catalysts: number;
}

export interface ValuationMetrics {
  pe: number;
  pb: number;
  div_yield_pct: number;
}

export interface BuyRange {
  low: number;
  high: number;
}

export interface RiskControls {
  stop_kes: number;
  max_drawdown_pct: number;
}

export interface StockPick {
  symbol: string;
  sector: MarketSector;
  current_price: number;
  quality_pass: boolean;
  valuation: ValuationMetrics;
  buy_range_kes: BuyRange;
  position_size_pct: number;
  risk_controls: RiskControls;
  fair_value_target_kes: number;
  catalysts: string[];
  confidence: {
    score: number;
    explanation: string;
  };
  notes: string;
}

export interface PortfolioMode {
  allocation: { symbol: string; weight_pct: number }[];
  notes?: string;
  risk_constraints?: { VaR_95_pct: number };
}

export interface MarketSnapshot {
  indices: { name: string; value: number; change_pct: number }[];
  sectors: { name: string; market_cap_kes: number; div_yield_pct: number }[];
}

export interface MapatoBoraReport {
  timestamp: string;
  market_snapshot: MarketSnapshot;
  monthly_picks: StockPick[];
  yearly_picks: any[];
  sector_rotation: { sector: string; signal: string; action: string; evidence: string }[];
  portfolio_modes: {
    standard: PortfolioMode;
    low_risk: PortfolioMode;
    opportunistic: PortfolioMode;
  };
}
