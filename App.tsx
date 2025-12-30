
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  BarChart3, 
  LayoutDashboard, 
  Briefcase, 
  AlertTriangle,
  Info,
  ChevronRight,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { INITIAL_REPORT, SECTOR_WEIGHTS } from './constants';
import { StockPick, MarketSector, MapatoBoraReport } from './types';
import { getAIPickInsights } from './services/geminiService';

const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'];
const SUCCESS_COLOR = '#10b981';
const WARNING_COLOR = '#f59e0b';
const ERROR_COLOR = '#ef4444';

const App: React.FC = () => {
  const [report, setReport] = useState<MapatoBoraReport>(INITIAL_REPORT);
  const [activeMode, setActiveMode] = useState<'standard' | 'low_risk' | 'opportunistic'>('standard');
  const [selectedStock, setSelectedStock] = useState<StockPick | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Helper to calculate composite score
  const calculateScore = (pick: StockPick) => {
    const weights = SECTOR_WEIGHTS[pick.sector];
    if (!weights) return 0;

    // Simplified mock scores for demo purposes
    const qualityScore = pick.quality_pass ? 90 : 40;
    const valuationScore = (pick.valuation.pe < 8 && pick.valuation.pb < 1) ? 95 : 60;
    const momentumScore = pick.confidence.score; // uses user-provided as base
    const catalystScore = Math.min(pick.catalysts.length * 25, 100);

    return Math.round(
      (qualityScore * weights.quality) +
      (valuationScore * weights.valuation) +
      (momentumScore * weights.momentum) +
      (catalystScore * weights.catalysts)
    );
  };

  const handleStockClick = async (pick: StockPick) => {
    setSelectedStock(pick);
    setLoadingAi(true);
    const insight = await getAIPickInsights(pick);
    setAiInsight(insight || '');
    setLoadingAi(false);
  };

  const allocationData = useMemo(() => {
    return report.portfolio_modes[activeMode].allocation.map(a => ({
      name: a.symbol,
      value: a.weight_pct
    }));
  }, [activeMode, report]);

  const sectorChartData = useMemo(() => {
    return report.market_snapshot.sectors.map(s => ({
      name: s.name,
      cap: s.market_cap_kes / 1_000_000_000, // Billion KES
      yield: s.div_yield_pct
    }));
  }, [report]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Mapato Bora</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">NSE Strategic Analytics</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <button className="text-sm font-medium hover:text-emerald-400 transition-colors">Market</button>
          <button className="text-sm font-medium hover:text-emerald-400 transition-colors">Sectors</button>
          <button className="text-sm font-medium hover:text-emerald-400 transition-colors">Portfolios</button>
          <button className="text-sm font-medium hover:text-emerald-400 transition-colors">Alerts</button>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Live: NSE ASPI <span className="text-emerald-400">+0.8%</span></span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        
        {/* Top Summary Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {report.market_snapshot.indices.map((idx, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-sm font-medium">{idx.name}</span>
                {idx.change_pct >= 0 ? 
                  <ArrowUpRight size={18} className="text-emerald-500" /> : 
                  <ArrowDownRight size={18} className="text-rose-500" />
                }
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{idx.value}</span>
                <span className={`text-xs font-bold ${idx.change_pct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {idx.change_pct >= 0 ? '+' : ''}{idx.change_pct}%
                </span>
              </div>
            </div>
          ))}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-sm font-medium">Market PE</span>
                <BarChart3 size={18} className="text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{report.audit.metrics_snapshot.market_pe}x</span>
                <span className="text-xs text-slate-400">Historical low</span>
              </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-sm font-medium">Avg Div Yield</span>
                <Zap size={18} className="text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">8.4%</span>
                <span className="text-xs text-slate-400">Top 5% Global</span>
              </div>
          </div>
        </section>

        {/* Main Grid: Sector Analysis & Portfolio Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sector Rotation Logic */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="text-blue-600" />
                  Sector Yield & Market Cap
                </h2>
                <div className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  Updated: {report.timestamp}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="cap" name="Market Cap (B KES)" fill="#0f172a" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="yield" name="Dividend Yield (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Monthly Picks - The Core Component */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Monthly Nyoro-Style Picks</h2>
                <div className="flex gap-2 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1"><Info size={14} /> Based on sector-specific weights</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.monthly_picks.map((pick, i) => {
                  const score = calculateScore(pick);
                  return (
                    <div 
                      key={i} 
                      onClick={() => handleStockClick(pick)}
                      className={`cursor-pointer group relative bg-white p-6 rounded-3xl border transition-all hover:shadow-lg active:scale-95 ${selectedStock?.symbol === pick.symbol ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-200'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900">{pick.symbol}</h3>
                          <p className="text-sm font-semibold text-slate-400">{pick.sector}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl text-center border-2 ${score > 85 ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : score > 75 ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-slate-50 border-slate-300 text-slate-600'}`}>
                          <div className="text-[10px] font-bold uppercase tracking-wider">Comp Score</div>
                          <div className="text-xl font-black">{score}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Entry Range</p>
                          <p className="text-sm font-bold text-slate-700">{pick.buy_range_kes.low} - {pick.buy_range_kes.high} <span className="text-[10px]">KES</span></p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Target Fair Value</p>
                          <p className="text-sm font-bold text-emerald-600">{pick.fair_value_target_kes} <span className="text-[10px]">KES</span></p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {pick.catalysts.slice(0, 2).map((c, j) => (
                          <span key={j} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">#{c.replace(/\s+/g, '')}</span>
                        ))}
                        {pick.catalysts.length > 2 && <span className="text-[10px] font-bold text-slate-400">+{pick.catalysts.length - 2} more</span>}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-emerald-600 transition-colors">
                        Deep Drill Analysis <ChevronRight size={14} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Sidebar: Portfolio Modes & Alerts */}
          <div className="space-y-8">
            
            {/* Portfolio Selector */}
            <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Briefcase size={20} className="text-emerald-400" />
                  Portfolio Deployment
                </h2>
                
                <div className="flex bg-slate-800 p-1 rounded-2xl mb-8">
                  {(['standard', 'low_risk', 'opportunistic'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setActiveMode(mode)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${activeMode === mode ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="flex justify-center mb-6">
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocationData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                           itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  {report.portfolio_modes[activeMode].allocation.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="font-bold">{item.symbol}</span>
                      </div>
                      <span className="text-slate-400 font-medium">{item.weight_pct}%</span>
                    </div>
                  ))}
                </div>
                
                {report.portfolio_modes[activeMode].notes && (
                  <div className="mt-6 p-4 bg-slate-800 rounded-2xl border border-slate-700 text-[10px] italic text-slate-300 leading-relaxed">
                    "{report.portfolio_modes[activeMode].notes}"
                  </div>
                )}
              </div>
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full"></div>
            </section>

            {/* Alert Center */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200">
               <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-600">
                  <ShieldAlert size={20} />
                  Risk Alert Board
                </h2>
                <div className="space-y-4">
                   <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
                      <div className="mt-1"><Target className="text-emerald-500" size={18} /></div>
                      <div>
                        <p className="text-xs font-bold text-emerald-800">BUY Range Breach: KPLC</p>
                        <p className="text-[10px] text-emerald-600 mt-1">Price entered undervalued band (1.78). Stage 1 entry enabled.</p>
                      </div>
                   </div>
                   <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                      <div className="mt-1"><AlertTriangle className="text-amber-500" size={18} /></div>
                      <div>
                        <p className="text-xs font-bold text-amber-800">Exit Range Approach: SCOM</p>
                        <p className="text-[10px] text-amber-600 mt-1">Nearing fair value (15.20). Consider 30% exit or trailing stops.</p>
                      </div>
                   </div>
                   <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex gap-3">
                      <div className="mt-1"><ShieldAlert className="text-rose-500" size={18} /></div>
                      <div>
                        <p className="text-xs font-bold text-rose-800">Fundamental Break Warning</p>
                        <p className="text-[10px] text-rose-600 mt-1">UTL sector profitability under pressure due to forex losses.</p>
                      </div>
                   </div>
                </div>
            </section>

          </div>
        </div>

        {/* Modal-like Detail Section (Scroll to or conditional) */}
        {selectedStock && (
          <section id="stock-detail" className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black tracking-widest uppercase">Stock Deep Dive</span>
                  <span className="text-slate-400 text-sm font-medium">{selectedStock.sector}</span>
                </div>
                <h2 className="text-5xl font-black">{selectedStock.symbol}</h2>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Current Price</p>
                  <p className="text-3xl font-black">{selectedStock.current_price} <span className="text-sm font-medium">KES</span></p>
                </div>
                <div className="w-px h-12 bg-slate-800 hidden md:block"></div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Buy Range High</p>
                  <p className="text-3xl font-black text-emerald-400">{selectedStock.buy_range_kes.high} <span className="text-sm font-medium">KES</span></p>
                </div>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Investment Thesis</h4>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {selectedStock.notes}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Valuation Matrix</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">P/E Ratio</p>
                      <p className="text-lg font-black">{selectedStock.valuation.pe}x</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">P/B Ratio</p>
                      <p className="text-lg font-black">{selectedStock.valuation.pb}x</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">Dividend</p>
                      <p className="text-lg font-black">{selectedStock.valuation.div_yield_pct}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <TrendingUp size={16} />
                      AI "Nyoro-Style" Validation
                    </h4>
                    {loadingAi ? (
                      <div className="flex items-center gap-3 py-4">
                         <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-sm font-bold text-emerald-600">Simulating alpha capture...</span>
                      </div>
                    ) : (
                      <p className="text-emerald-900 font-bold text-lg leading-snug">
                        {aiInsight}
                      </p>
                    )}
                  </div>
                  {/* Decorative background element */}
                  <div className="absolute bottom-[-20%] right-[-5%] text-emerald-100 opacity-20 pointer-events-none">
                    <TrendingUp size={240} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Upcoming Catalysts</h4>
                    <ul className="space-y-3">
                      {selectedStock.catalysts.map((c, k) => (
                        <li key={k} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                    <h4 className="text-sm font-black text-rose-800 uppercase tracking-widest mb-4">Risk Controls</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-rose-600">Stop Loss</span>
                        <span className="text-sm font-black text-rose-900">{selectedStock.risk_controls.stop_kes} KES</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-rose-600">Max Drawdown</span>
                        <span className="text-sm font-black text-rose-900">{selectedStock.risk_controls.max_drawdown_pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-rose-200 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full w-[15%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      <footer className="bg-slate-900 text-slate-500 text-xs py-10 px-8 text-center border-t border-slate-800 mt-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="font-bold uppercase tracking-widest text-slate-400">Mapato Bora Strategic Analytics Platform</p>
          <p className="leading-relaxed">
            All financial data sourced from public records of the Nairobi Securities Exchange. This platform provides educational analysis based on sector weighting models. 
            Past performance is not indicative of future results. Please consult with a licensed investment advisor before committing capital.
          </p>
          <p>&copy; {new Date().getFullYear()} Mapato Bora. Built for Alphonce.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
