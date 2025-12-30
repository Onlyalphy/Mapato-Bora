
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
  Frown,
  Activity,
  ArrowUpDown,
  Mic,
  Video
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

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#f97316', '#14b8a6', '#ec4899', '#06b6d4'
];

type AppTab = 'dashboard' | 'market' | 'screener' | 'sectors' | 'portfolios' | 'alerts' | 'analyzer';

const App: React.FC = () => {
  const [report, setReport] = useState<MapatoBoraReport>(INITIAL_REPORT);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [activeMode, setActiveMode] = useState<'standard' | 'low_risk' | 'opportunistic'>('standard');
  const [selectedStock, setSelectedStock] = useState<StockPick | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Analyzer State
  const [uploadedFile, setUploadedFile] = useState<{name: string, data: string, type: string} | null>(null);
  const [fileAnalysis, setFileAnalysis] = useState<string>('');
  const [analyzingFile, setAnalyzingFile] = useState(false);

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

  const filteredStocks = useMemo(() => {
    return MOCK_STOCKS.filter(s => 
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Views
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <Zap className="text-amber-500" size={20} />
                Hot Opportunities
              </h2>
              <button onClick={() => setActiveTab('sectors')} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">View All Sectors</button>
            </div>
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
                      }`}>{s.recent_sentiment}</span>
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
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
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
        </div>
      </div>
    </div>
  );

  const ScreenerView = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Activity className="text-emerald-500" />
              NSE Live Market Terminal
            </h2>
            <p className="text-slate-500 text-sm font-medium">Real-time indicators and Nyoro-style scoring for all listed equities.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search symbol, sector or indicator..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Symbol <ArrowUpDown size={12} className="inline ml-1" /></th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Price</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Change</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">RSI (14)</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">MACD Signal</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Volume</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Alpha Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStocks.map((stock, i) => (
                <tr key={i} onClick={() => handleStockClick(stock)} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-slate-900 group-hover:text-blue-600">{stock.symbol}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{stock.sector}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{stock.current_price.toFixed(2)}</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live data"></div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-black ${stock.price_change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stock.price_change_pct >= 0 ? '+' : ''}{stock.price_change_pct}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1 w-24">
                      <span className={`text-[10px] font-bold ${stock.indicators?.rsi! > 70 ? 'text-rose-600' : stock.indicators?.rsi! < 30 ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {stock.indicators?.rsi}
                      </span>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stock.indicators?.rsi! > 70 ? 'bg-rose-500' : stock.indicators?.rsi! < 30 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${stock.indicators?.rsi}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${
                      stock.indicators?.macd === 'Bullish' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                      stock.indicators?.macd === 'Bearish' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      {stock.indicators?.macd}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-bold text-slate-600">{stock.indicators?.volume_24h}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-black ${calculateScore(stock) >= 85 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {calculateScore(stock)}
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(star => (
                          <div key={star} className={`w-1.5 h-1.5 rounded-full ${star <= Math.round(calculateScore(stock)/20) ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // FIX: Added missing MarketView component to visualize aggregate NSE statistics
  const MarketView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Globe className="text-blue-500" size={24} />
          <h2 className="text-2xl font-black text-slate-900">NSE Market Composition</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.market_snapshot.indices}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorMarket)" />
                <defs>
                  <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Sector Capitalization Breakdown</h3>
            <div className="grid grid-cols-1 gap-3">
              {report.market_snapshot.sectors.map((sector, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 hover:bg-blue-50/10 transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">{sector.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Sector</span>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900 group-hover:text-blue-600">{(sector.market_cap_kes / 1e9).toFixed(1)}B KES</div>
                    <div className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">{sector.div_yield_pct}% Dividend Yield</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <h2 className="text-4xl font-black mb-6 text-slate-900 tracking-tight">Multi-Modal Strategy Lab</h2>
          <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
             Mapato Bora's proprietary engine now supports direct ingestion of **Images, Audio calls, Video clips, and PDF reports**. 
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <FileText className="mx-auto mb-2 text-blue-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">PDF Reports</span>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <Newspaper className="mx-auto mb-2 text-emerald-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Image News</span>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <Mic className="mx-auto mb-2 text-indigo-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Earnings Audio</span>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <Video className="mx-auto mb-2 text-rose-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">CEO Video</span>
             </div>
          </div>

          <div className="flex flex-col items-center gap-6">
             <input type="file" id="context-upload" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.txt,audio/*,video/*" />
             <label htmlFor="context-upload" className="bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black cursor-pointer hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3 uppercase tracking-widest text-xs">
               Initiate Signal Extraction
             </label>
             {uploadedFile && (
               <div className="mt-6 flex flex-col items-center gap-6 animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <CheckCircle2 className="text-emerald-500" size={18}/>
                    <span className="text-sm font-black text-slate-700">{uploadedFile.name}</span>
                  </div>
                  <button onClick={runFileAnalysis} disabled={analyzingFile} className={`px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl ${analyzingFile ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white shadow-emerald-500/30'}`}>
                    {analyzingFile ? 'Synthesizing Strategic Advantage...' : 'Extract Alpha'}
                  </button>
               </div>
             )}
          </div>
       </div>

       {fileAnalysis && (
         <div className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-4">AI Decomposition Report</h3>
            <div className="prose prose-invert max-w-none text-slate-300 font-bold text-lg leading-relaxed bg-slate-800/50 p-8 rounded-[2rem]">
              {fileAnalysis}
            </div>
         </div>
       )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 px-6 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-emerald-500 p-2.5 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
            <TrendingUp size={26} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black tracking-tight leading-none">Mapato Bora</h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">NSE Analytics Terminal</p>
          </div>
        </div>
        <nav className="flex items-center gap-1 md:gap-3 bg-slate-800/50 p-1 rounded-2xl border border-slate-700/50">
          {(['dashboard', 'market', 'screener', 'sectors', 'portfolios', 'alerts', 'analyzer'] as AppTab[]).map((tab) => (
             <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                {tab}
             </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-10 space-y-12 pb-32">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'screener' && <ScreenerView />}
        {activeTab === 'market' && <MarketView />}
        {activeTab === 'sectors' && <div className="p-8 bg-white rounded-3xl text-center font-bold text-slate-400 italic">Sector Analysis Engine Initializing...</div>}
        {activeTab === 'portfolios' && <div className="p-8 bg-white rounded-3xl text-center font-bold text-slate-400 italic">Portfolio Deployment Systems Active</div>}
        {activeTab === 'alerts' && <div className="p-8 bg-white rounded-3xl text-center font-bold text-slate-400 italic">Strategic Signal Processor Running</div>}
        {activeTab === 'analyzer' && <AnalyzerView />}

        {selectedStock && (
          <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md p-4 md:p-16 overflow-y-auto flex items-start justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden relative border border-white/10">
              <button onClick={() => setSelectedStock(null)} className="absolute top-8 right-10 text-slate-400 hover:text-slate-900 transition-all z-20">
                <XCircle size={40} />
              </button>
              <div className="bg-slate-900 p-16 text-white">
                <h2 className="text-8xl font-black mb-12 tracking-tighter">{selectedStock.symbol}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-slate-800 pt-12">
                   <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Current Price</p><p className="text-4xl font-black">{selectedStock.current_price} KES</p></div>
                   <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Alpha Target</p><p className="text-4xl font-black text-emerald-400">{selectedStock.fair_value_target_kes} KES</p></div>
                   <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">PE Ratio</p><p className="text-4xl font-black text-amber-400">{selectedStock.valuation.pe}x</p></div>
                   <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Div Yield</p><p className="text-4xl font-black text-blue-400">{selectedStock.valuation.div_yield_pct}%</p></div>
                </div>
              </div>
              <div className="p-16">
                 <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[2.5rem]">
                   <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-6 flex items-center gap-3">AI Reasoning</h4>
                   {loadingAi ? <div className="animate-pulse h-12 bg-emerald-100 rounded-xl"></div> : <p className="text-emerald-900 font-bold text-2xl leading-snug">"{aiInsight}"</p>}
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-500 text-[10px] py-16 text-center border-t border-slate-800 font-black uppercase tracking-[0.4em]">
        &copy; {new Date().getFullYear()} Mapato Bora Terminal - Nairobi Securities Exchange
      </footer>
    </div>
  );
};

export default App;