
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Globe,
  PieChart as PieChartIcon,
  Bell,
  Upload,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  LucideIcon,
  Award,
  Newspaper,
  Smile,
  Meh,
  Frown
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
  Line,
  AreaChart,
  Area
} from 'recharts';
import { INITIAL_REPORT, SECTOR_WEIGHTS, MOCK_STOCKS } from './constants';
import { StockPick, MarketSector, MapatoBoraReport } from './types';
import { getAIPickInsights, analyzeFinancialFile } from './services/geminiService';

// Updated palette: Vibrant and distinct for stock/sector differentiation
const COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ef4444', // Rose
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#ec4899', // Pink
  '#06b6d4'  // Cyan
];

type AppTab = 'dashboard' | 'market' | 'sectors' | 'portfolios' | 'alerts' | 'analyzer';

const App: React.FC = () => {
  const [report, setReport] = useState<MapatoBoraReport>(INITIAL_REPORT);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [activeMode, setActiveMode] = useState<'standard' | 'low_risk' | 'opportunistic'>('standard');
  const [selectedStock, setSelectedStock] = useState<StockPick | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Analyzer State
  const [uploadedFile, setUploadedFile] = useState<{name: string, data: string, type: string} | null>(null);
  const [fileAnalysis, setFileAnalysis] = useState<string>('');
  const [analyzingFile, setAnalyzingFile] = useState(false);

  // Helper to calculate composite score
  const calculateScore = (pick: StockPick) => {
    const weights = SECTOR_WEIGHTS[pick.sector];
    if (!weights) return 0;
    const qualityScore = pick.quality_pass ? 90 : 40;
    const valuationScore = (pick.valuation.pe < 8 && pick.valuation.pb < 1) ? 95 : 60;
    const momentumScore = pick.confidence.score;
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setUploadedFile({
          name: file.name,
          data: base64String,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const runFileAnalysis = async () => {
    if (!uploadedFile) return;
    setAnalyzingFile(true);
    const result = await analyzeFinancialFile(uploadedFile.data, uploadedFile.type);
    setFileAnalysis(result || '');
    setAnalyzingFile(false);
  };

  // Views Components
  const DashboardView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {report.market_snapshot.indices.map((idx, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-sm font-medium">{idx.name}</span>
              {idx.change_pct >= 0 ? <ArrowUpRight size={18} className="text-emerald-500" /> : <ArrowDownRight size={18} className="text-rose-500" />}
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
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
              <Zap className="text-amber-500" size={20} />
              Hot Opportunities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.monthly_picks.slice(0, 4).map((pick, i) => (
                <div key={i} onClick={() => handleStockClick(pick)} className="group cursor-pointer p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xl font-black">{pick.symbol}</span>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border text-slate-500">{calculateScore(pick)} Score</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1">{pick.sector}</p>
                  <div className="mt-4 flex justify-between items-end">
                    <div className="text-emerald-600 font-bold text-sm">Target: {pick.fair_value_target_kes}</div>
                    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* News Feed Component */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Newspaper className="text-indigo-500" size={20} />
              NSE Business Sentiment Feed
            </h2>
            <div className="space-y-4">
              {MOCK_STOCKS.filter(s => s.news_headline).map((s, i) => (
                <div key={i} onClick={() => handleStockClick(s)} className="cursor-pointer group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                  <div className={`p-2 rounded-xl flex items-center justify-center ${
                    s.recent_sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-600' : 
                    s.recent_sentiment === 'Negative' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {s.recent_sentiment === 'Positive' ? <Smile size={20} /> : s.recent_sentiment === 'Negative' ? <Frown size={20} /> : <Meh size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.symbol}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        s.recent_sentiment === 'Positive' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'
                      }`}>{s.recent_sentiment} Sentiment</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-indigo-600">{s.news_headline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden relative border border-slate-800">
              <div className="relative z-10">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Briefcase size={20} className="text-emerald-400" />
                  Portfolio Deployment
                </h2>
                <div className="flex bg-slate-800 p-1 rounded-2xl mb-8">
                  {(['standard', 'low_risk', 'opportunistic'] as const).map((mode) => (
                    <button key={mode} onClick={() => setActiveMode(mode)} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${activeMode === mode ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}>
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <div className="h-56 flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={report.portfolio_modes[activeMode].allocation.map(a => ({ name: a.symbol, value: a.weight_pct }))} 
                          innerRadius={60} 
                          outerRadius={85} 
                          paddingAngle={5} 
                          dataKey="value"
                        >
                          {report.portfolio_modes[activeMode].allocation.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                   {report.portfolio_modes[activeMode].allocation.map((a, i) => (
                     <div key={i} className="flex justify-between text-xs font-bold items-center group cursor-pointer" onClick={() => {
                        const s = MOCK_STOCKS.find(stock => stock.symbol === a.symbol);
                        if(s) handleStockClick(s);
                     }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-slate-300 group-hover:text-white transition-colors">{a.symbol}</span>
                        </div>
                        <span className="text-emerald-400">{a.weight_pct}%</span>
                     </div>
                   ))}
                </div>
              </div>
           </section>
           
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-600">
                <ShieldAlert size={20} />
                Recent Alerts
              </h2>
              <div className="space-y-3">
                 <div className="text-[10px] p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold border border-emerald-100 flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                   <span>KPLC: Price entered Undervaluation Band (1.78). Staged entry triggered.</span>
                 </div>
                 <div className="text-[10px] p-4 bg-amber-50 text-amber-700 rounded-2xl font-bold border border-amber-100 flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0"></div>
                   <span>SCOM: Nearing Fair Value Target (15.20). RSI indicating exhaustion.</span>
                 </div>
              </div>
              <button onClick={() => setActiveTab('alerts')} className="w-full mt-6 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">View All Signals</button>
           </div>
        </div>
      </div>
    </div>
  );

  const MarketView = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
       <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Globe className="text-emerald-500" />
              NSE Market Intelligence Terminal
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { date: 'Mon', value: 102.1 }, { date: 'Tue', value: 103.5 }, { date: 'Wed', value: 102.8 }, { date: 'Thu', value: 104.2 }, { date: 'Fri', value: 104.5 }
                ]}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><ArrowUpRight className="text-emerald-500" /> Top Sector Gainers</h3>
             <div className="space-y-4">
                {report.market_snapshot.sectors.sort((a,b) => b.div_yield_pct - a.div_yield_pct).map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{s.name}</span>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-black text-emerald-600">+{ (Math.random() * 3 + 1).toFixed(1) }%</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.div_yield_pct}% Yield</div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Zap className="text-amber-500" /> Market Snapshot Audit</h3>
             <div className="space-y-6 text-sm font-medium text-slate-600">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-slate-400">Primary Data Sources</span>
                  <span className="font-bold text-slate-900">{report.audit.data_sources.join(', ')}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-slate-400">Total Market Cap</span>
                  <span className="font-bold text-slate-900">KES { (report.audit.metrics_snapshot.market_cap_kes / 1e12).toFixed(2) }T</span>
                </div>
                <div className="mt-4 p-6 bg-slate-900 text-white rounded-[2rem] relative overflow-hidden">
                   <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-3">Recent Strategy Changes</h4>
                   <ul className="space-y-3 relative z-10">
                      {report.audit.changes_vs_prior.map((c, i) => (
                        <li key={i} className="text-xs flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-slate-300 font-bold">{c}</span>
                        </li>
                      ))}
                   </ul>
                   <Target className="absolute -bottom-10 -right-10 text-white/5" size={120} />
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const SectorsView = () => (
    <div className="space-y-12 animate-in slide-in-from-right duration-500">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2rem] border border-slate-200">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Industry Buy-List</h2>
            <p className="text-slate-500 font-medium mt-2 max-w-md">The "Nyoro-Style" filtered list of top-tier quality picks across the main NSE industry classifications.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"><Filter size={18}/> Filter</button>
             <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl"><Search size={18}/> Global Search</button>
          </div>
       </div>

       <div className="space-y-16">
          {Object.values(MarketSector).map((sector) => {
            const stocks = MOCK_STOCKS.filter(s => s.sector === sector);
            if (stocks.length === 0) return null;
            
            // Find the highest scoring stock in the sector to mark as "Top Pick"
            const topStock = stocks.reduce((prev, current) => (calculateScore(prev) > calculateScore(current)) ? prev : current);

            return (
              <section key={sector} className="space-y-8">
                <div className="flex items-center gap-6">
                  <h3 className="text-xl font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-3 shrink-0">
                    <div className="w-1.5 h-8 bg-slate-900 rounded-full"></div>
                    {sector}
                  </h3>
                  <div className="h-px w-full bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {stocks.map((stock, i) => {
                    const isTopPick = stock.symbol === topStock.symbol;
                    return (
                      <div key={i} onClick={() => handleStockClick(stock)} className={`bg-white p-8 rounded-[2.5rem] border transition-all cursor-pointer group hover:scale-[1.02] ${isTopPick ? 'border-emerald-500 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/20' : 'border-slate-200 shadow-sm hover:shadow-lg'}`}>
                        <div className="flex justify-between items-start mb-8">
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-3xl font-black text-slate-900">{stock.symbol}</h4>
                                {isTopPick && (
                                  <span className="bg-emerald-500 text-white p-1 rounded-lg" title="Top Buy in Sector">
                                    <Award size={16} />
                                  </span>
                                )}
                             </div>
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stock.sector}</span>
                          </div>
                          <div className="text-right">
                             <div className="text-2xl font-black text-slate-900">{stock.current_price}</div>
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">KES PER SHARE</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-slate-100/50 transition-colors">
                              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Alpha Score</div>
                              <div className={`text-xl font-black ${calculateScore(stock) >= 85 ? 'text-emerald-600' : 'text-slate-800'}`}>{calculateScore(stock)}</div>
                           </div>
                           <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-slate-100/50 transition-colors">
                              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Div Yield</div>
                              <div className="text-xl font-black text-blue-600">{stock.valuation.div_yield_pct}%</div>
                           </div>
                        </div>

                        {isTopPick && (
                          <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] font-bold text-emerald-800 leading-relaxed">
                            <Zap size={14} className="inline mr-1 mb-1" />
                            Recommended: High conviction quality pass with {stock.valuation.pe}x PE discount.
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs font-black text-slate-400 group-hover:text-slate-900 transition-colors pt-2 border-t border-slate-100">
                           <span className="uppercase tracking-widest">Execute Deep Dive</span>
                           <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                             <ChevronRight size={18} />
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
       </div>
    </div>
  );

  const PortfoliosView = () => (
    <div className="space-y-12 animate-in slide-in-from-right duration-500">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {(['standard', 'low_risk', 'opportunistic'] as const).map(mode => (
            <div key={mode} className={`p-10 rounded-[3rem] border transition-all flex flex-col h-full ${activeMode === mode ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105 z-10' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-sm'}`}>
               <div className="flex justify-between items-start mb-10">
                  <div className={`p-5 rounded-[1.5rem] shadow-lg ${activeMode === mode ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-900'}`}>
                     {mode === 'standard' ? <PieChartIcon size={24} /> : mode === 'low_risk' ? <ShieldAlert size={24} /> : <Zap size={24} />}
                  </div>
                  {activeMode === mode && (
                    <div className="flex flex-col items-end">
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-emerald-500/30">Active Mode</span>
                    </div>
                  )}
               </div>
               <h3 className="text-3xl font-black capitalize mb-3 tracking-tight">{mode.replace('_', ' ')}</h3>
               <p className={`text-sm font-medium mb-10 leading-relaxed ${activeMode === mode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {mode === 'standard' ? "The master alpha strategy focusing on Quality Growth at a Reasonable Price (GARP). Rebalanced quarterly." : 
                   mode === 'low_risk' ? "Kuza-style stability focused on Tier-1 blue-chips with consistent dividend yields above 10%." : 
                   "High-torque 'Nyoro-style' accumulation of deep value turnaround plays with massive margin of safety."}
               </p>
               <div className="space-y-4 mb-10 flex-1">
                  {report.portfolio_modes[mode].allocation.map((a, i) => (
                    <div key={i} className={`flex justify-between items-center p-4 rounded-[1.25rem] transition-colors cursor-pointer ${activeMode === mode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200'}`}>
                       <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                         <span className="font-black text-sm">{a.symbol}</span>
                       </div>
                       <span className={`text-xs font-black ${activeMode === mode ? 'text-emerald-400' : 'text-slate-900'}`}>{a.weight_pct}%</span>
                    </div>
                  ))}
               </div>
               <button 
                onClick={() => setActiveMode(mode)} 
                className={`w-full py-5 rounded-[1.5rem] font-black text-sm tracking-widest uppercase transition-all shadow-xl ${activeMode === mode ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'}`}
               >
                  {activeMode === mode ? 'Current Strategy' : 'Activate Deployment'}
               </button>
            </div>
          ))}
       </div>
    </div>
  );

  const AlertsView = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
       <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
             <h2 className="text-3xl font-black text-slate-900">Strategic Signal Feed</h2>
             <div className="flex gap-2">
                <span className="px-4 py-2 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-2 animate-pulse"><Bell size={14}/> 3 Active Triggers</span>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Settings</button>
             </div>
          </div>
          
          <div className="space-y-6">
             {[
               { type: 'BUY', symbol: 'KPLC', msg: 'Price entered Undervaluation Band (1.78). Sector-specific weighting suggests immediate staged entry. ATR buffer confirmed for downside protection.', time: '2h ago', level: 'High' },
               { type: 'EXIT', symbol: 'SCOM', msg: 'Approaching Fair Value Target (15.20). RSI indicating exhaustion on 4H timeframes. Recommend trailing stops or partial exit (30%).', time: '5h ago', level: 'Medium' },
               { type: 'FUNDAMENTAL', symbol: 'UTL Sector', msg: 'Severe income deterioration reported in Sector Q3 analysis. Interest coverage dropping below 2x. Suspend buys immediately.', time: '1d ago', level: 'Critical' },
               { type: 'DIVIDEND', symbol: 'BAT', msg: 'Announced final dividend of 45 KES. Current yield lock-in at 12.8%. Ex-dividend date confirmed for next Tuesday.', time: '2d ago', level: 'Info' }
             ].map((alert, i) => (
               <div key={i} className="flex flex-col md:flex-row gap-8 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                  <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg ${
                    alert.type === 'BUY' ? 'bg-emerald-100 text-emerald-600' : 
                    alert.type === 'EXIT' ? 'bg-amber-100 text-amber-600' : 
                    alert.type === 'FUNDAMENTAL' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {alert.type === 'BUY' ? <Target size={24} /> : alert.type === 'EXIT' ? <ArrowDownRight size={24} /> : alert.type === 'FUNDAMENTAL' ? <AlertTriangle size={24} /> : <Info size={24} />}
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                           <span className="font-black text-2xl text-slate-900">{alert.symbol}</span>
                           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                              alert.level === 'Critical' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 
                              alert.level === 'High' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-200 text-slate-600'
                           }`}>{alert.level}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{alert.time}</span>
                     </div>
                     <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-2xl">{alert.msg}</p>
                     <div className="mt-6 flex gap-6 items-center">
                        <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-emerald-600 hover:border-emerald-600 transition-all">Detailed Fundamental Check</button>
                        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-all">Dismiss Trigger</button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );

  const AnalyzerView = () => (
    <div className="max-w-5xl mx-auto space-y-12 animate-in zoom-in duration-500">
       <div className="bg-white p-16 rounded-[4rem] border-4 border-dashed border-slate-200 text-center relative overflow-hidden shadow-sm">
          <div className="bg-emerald-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-emerald-500 shadow-lg shadow-emerald-500/10">
             <Upload size={40} />
          </div>
          <h2 className="text-4xl font-black mb-6 text-slate-900 tracking-tight">Financial Artifact Analyzer</h2>
          <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
             Insert images of financial statements, PDF annual reports, or text clips of market news. Mapato Bora AI will extract quality metrics and "Nyoro-style" sentiment instantly.
          </p>
          
          <div className="flex flex-col items-center gap-6">
             <input type="file" id="context-upload" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.txt" />
             <label htmlFor="context-upload" className="bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black cursor-pointer hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3 uppercase tracking-widest text-xs group">
               <FileText size={20} className="group-hover:scale-110 transition-transform" />
               {uploadedFile ? 'Switch Analysis Artifact' : 'Upload Financial Context'}
             </label>
             {uploadedFile && (
               <div className="mt-6 flex flex-col items-center gap-6 animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <CheckCircle2 className="text-emerald-500" size={18}/>
                    <span className="text-sm font-black text-slate-700">{uploadedFile.name}</span>
                  </div>
                  <button 
                    onClick={runFileAnalysis} 
                    disabled={analyzingFile} 
                    className={`px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl ${analyzingFile ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/30'}`}
                  >
                    {analyzingFile ? 'Extracting Strategic Value...' : 'Initiate AI Decomposition'}
                  </button>
               </div>
             )}
          </div>
          <Globe className="absolute -bottom-20 -left-20 text-slate-50 opacity-10 pointer-events-none" size={400} />
       </div>

       {fileAnalysis && (
         <div className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-800">
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-8">
                  <h3 className="text-2xl font-black flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                      <Zap size={20} />
                    </div>
                    Automated Alpha Insight
                  </h3>
                  <button onClick={() => setFileAnalysis('')} className="text-slate-500 hover:text-white transition-colors"><XCircle size={24} /></button>
               </div>
               <div className="prose prose-invert max-w-none text-slate-300 font-bold text-lg leading-relaxed whitespace-pre-wrap italic bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700/50">
                 "{fileAnalysis}"
               </div>
               <div className="mt-10 flex gap-4">
                  <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Add to Terminal Audit</button>
                  <button className="px-6 py-3 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Export PDF</button>
               </div>
            </div>
            <div className="absolute top-0 right-0 p-12 text-emerald-500/5 pointer-events-none rotate-12">
               <TrendingUp size={450} />
            </div>
         </div>
       )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 px-6 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-emerald-500 p-2.5 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
            <TrendingUp size={26} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black tracking-tight leading-none">Mapato Bora</h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Institutional Grade NSE Alpha</p>
          </div>
        </div>
        <nav className="flex items-center gap-1 md:gap-3 bg-slate-800/50 p-1 rounded-2xl border border-slate-700/50">
          {(['dashboard', 'market', 'sectors', 'portfolios', 'alerts', 'analyzer'] as AppTab[]).map((tab) => (
             <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
             >
                {tab}
             </button>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden lg:flex text-[10px] font-black bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 items-center gap-3 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            Market: <span className="text-emerald-400 font-black">+0.8%</span>
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-10 space-y-12 pb-32">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'market' && <MarketView />}
        {activeTab === 'sectors' && <SectorsView />}
        {activeTab === 'portfolios' && <PortfoliosView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'analyzer' && <AnalyzerView />}

        {/* Floating Stock Detail Modal */}
        {selectedStock && (
          <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md p-4 md:p-16 overflow-y-auto flex items-start justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative border border-white/10">
              <button 
                onClick={() => setSelectedStock(null)} 
                className="absolute top-8 right-10 text-slate-400 hover:text-slate-900 hover:scale-110 transition-all z-20"
              >
                <XCircle size={40} />
              </button>
              
              <div className="bg-slate-900 p-16 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[11px] font-black tracking-[0.2em] uppercase shadow-lg shadow-emerald-500/20">Fundamental Grade: {calculateScore(selectedStock)}</span>
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">{selectedStock.sector} Terminal</span>
                  </div>
                  <h2 className="text-8xl font-black mb-12 tracking-tighter">{selectedStock.symbol}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-slate-800 pt-12">
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Live Valuation</p>
                      <p className="text-4xl font-black">{selectedStock.current_price} <span className="text-sm font-medium text-slate-500">KES</span></p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Terminal Target</p>
                      <p className="text-4xl font-black text-emerald-400">{selectedStock.fair_value_target_kes} <span className="text-sm font-medium text-slate-500">KES</span></p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Price/Earnings</p>
                      <p className="text-4xl font-black text-amber-400">{selectedStock.valuation.pe}x</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Dividend Yield</p>
                      <p className="text-4xl font-black text-blue-400">{selectedStock.valuation.div_yield_pct}%</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-12 text-emerald-500/5 opacity-40 pointer-events-none">
                  <Target size={550} />
                </div>
              </div>
              
              <div className="p-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                 <div className="space-y-12">
                    <div>
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                         <FileText size={16} /> Nyoro Strategy Thesis
                       </h4>
                       <p className="text-slate-700 font-bold text-lg leading-relaxed">{selectedStock.notes}</p>
                    </div>
                    
                    {/* News Sentiment Section */}
                    {selectedStock.news_headline && (
                      <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-indigo-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Newspaper size={14} /> Market News Sentiment
                        </h4>
                        <p className="text-sm font-black text-indigo-900 mb-4">"{selectedStock.news_headline}"</p>
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            selectedStock.recent_sentiment === 'Positive' ? 'bg-emerald-500 text-white' : 
                            selectedStock.recent_sentiment === 'Negative' ? 'bg-rose-500 text-white' : 'bg-slate-400 text-white'
                          }`}>
                            {selectedStock.recent_sentiment} Signal
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 italic">Incorporated into Quality Score</span>
                        </div>
                      </div>
                    )}

                    <div>
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                         <Zap size={16} /> Key Value Catalysts
                       </h4>
                       <ul className="space-y-4">
                          {selectedStock.catalysts.map((c, i) => (
                            <li key={i} className="flex items-center gap-4 text-sm font-black text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                               <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></div> {c}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
                 
                 <div className="lg:col-span-2 space-y-12">
                    <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[2.5rem] relative overflow-hidden shadow-sm">
                       <h4 className="text-xs font-black text-emerald-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3 relative z-10">
                         <Award size={18} className="animate-bounce" /> Strategic AI Validation
                       </h4>
                       {loadingAi ? (
                         <div className="flex items-center gap-4 py-6 relative z-10">
                           <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                           <span className="text-lg font-black text-emerald-600 tracking-tight">Accessing Institutional Reasoning Layers...</span>
                         </div>
                       ) : (
                         <p className="text-emerald-900 font-bold text-2xl leading-snug italic relative z-10">"{aiInsight}"</p>
                       )}
                       <Globe className="absolute -bottom-20 -right-20 text-emerald-200/20 pointer-events-none" size={250} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                       <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 shadow-sm">
                          <h4 className="text-xs font-black text-rose-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <ShieldAlert size={16} /> Risk Architecture
                          </h4>
                          <div className="space-y-6">
                             <div className="flex justify-between items-center text-lg font-black">
                                <span className="text-rose-600 uppercase tracking-widest text-xs">Hard Stop</span>
                                <span className="text-rose-900">{selectedStock.risk_controls.stop_kes} KES</span>
                             </div>
                             <div className="flex justify-between items-center text-lg font-black">
                                <span className="text-rose-600 uppercase tracking-widest text-xs">Max Drawdown</span>
                                <span className="text-rose-900">{selectedStock.risk_controls.max_drawdown_pct}%</span>
                             </div>
                             <div className="w-full h-3 bg-rose-200 rounded-full overflow-hidden">
                               <div className="bg-rose-600 h-full w-[25%] shadow-[0_0_10px_rgba(225,29,72,0.4)]"></div>
                             </div>
                          </div>
                       </div>
                       <div className="flex flex-col gap-4">
                          <button className="bg-slate-900 text-white w-full py-8 rounded-[2.5rem] font-black text-xl uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/40 hover:scale-[1.02] active:scale-[0.98]">Execute Order</button>
                          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized for Alphonce Only</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-slate-900 text-slate-500 text-xs py-16 px-10 text-center border-t border-slate-800 mt-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center flex-wrap gap-10 opacity-60">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="font-black tracking-[0.2em]">NSE COMPLIANT</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span className="font-black tracking-[0.2em]">AI OPTIMIZED</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-blue-500" />
              <span className="font-black tracking-[0.2em]">NYORO STRATEGY</span>
            </div>
          </div>
          <p className="leading-relaxed font-medium text-slate-500 max-w-2xl mx-auto">
            Mapato Bora is an institutional-grade strategic analytics terminal for the Nairobi Securities Exchange. All data processed via proprietary alpha weighting models.
            Disclaimer: Educational analysis only. Market volatility requires independent verification.
          </p>
          <div className="w-20 h-px bg-slate-800 mx-auto"></div>
          <p className="font-black text-slate-600 uppercase tracking-[0.4em]">&copy; {new Date().getFullYear()} MAPATO BORA TERMINAL</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
