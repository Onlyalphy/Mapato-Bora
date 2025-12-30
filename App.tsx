
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
  Video,
  Layers,
  RefreshCw,
  Clock,
  Calendar,
  ZapOff
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
type Timeframe = '24h' | '1w' | '1m';

const App: React.FC = () => {
  const [report, setReport] = useState<MapatoBoraReport>(INITIAL_REPORT);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [activeMode, setActiveMode] = useState<'standard' | 'low_risk' | 'opportunistic'>('standard');
  const [selectedStock, setSelectedStock] = useState<StockPick | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertTimeframe, setAlertTimeframe] = useState<Timeframe>('24h');
  const [isScanning, setIsScanning] = useState(false);
  
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

  const handleScanSignals = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000); // Simulate high-compute signal processing
  };

  // Components
  const StockIcon = ({ symbol, sector }: { symbol: string, sector: MarketSector }) => {
    const color = COLORS[Object.values(MarketSector).indexOf(sector) % COLORS.length];
    return (
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-inner shrink-0"
        style={{ backgroundColor: color }}
      >
        {symbol.slice(0, 2)}
      </div>
    );
  };

  const MarketTicker = () => (
    <div className="w-full bg-slate-900 overflow-hidden py-3 border-y border-slate-800 relative">
      <div className="flex whitespace-nowrap animate-ticker gap-12 items-center">
        {[...MOCK_STOCKS, ...MOCK_STOCKS].map((stock, i) => (
          <div key={i} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 px-3 py-1 rounded-lg transition-colors">
            <span className="text-white font-black text-xs">{stock.symbol}</span>
            <span className="text-slate-400 text-[10px] font-bold">{stock.current_price.toFixed(2)}</span>
            <span className={`text-[10px] font-black ${stock.price_change_pct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stock.price_change_pct >= 0 ? '▲' : '▼'} {Math.abs(stock.price_change_pct)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  );

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
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
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
                    <div className="flex items-center gap-3">
                      <StockIcon symbol={pick.symbol} sector={pick.sector} />
                      <span className="text-xl font-black">{pick.symbol}</span>
                    </div>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border text-slate-500">{calculateScore(pick)} Score</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1 ml-13">{pick.sector}</p>
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
              <Bell className="text-indigo-500" size={20} />
              Recent Alert Signals
            </h2>
            <div className="space-y-3">
               <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold border border-emerald-100 flex gap-3 text-xs cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setActiveTab('alerts')}>
                 <Target size={18} className="shrink-0" />
                 <div className="flex-1">
                    <p>KPLC: Staged entry active as price holds undervaluations.</p>
                    <span className="text-[10px] opacity-60 mt-1 block">Timeframe: Last 24h</span>
                 </div>
               </div>
               <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl font-bold border border-amber-100 flex gap-3 text-xs cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setActiveTab('alerts')}>
                 <ArrowDownRight size={18} className="shrink-0" />
                 <div className="flex-1">
                    <p>SCOM: Position resizing recommended near 15.20 resistance.</p>
                    <span className="text-[10px] opacity-60 mt-1 block">Timeframe: Last 24h</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
        <div className="space-y-8">
           <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden relative border border-slate-800">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Briefcase size={20} className="text-emerald-400" />
                Portfolio Active
              </h2>
              <p className="text-xs text-slate-400 mb-6 font-medium">Strategy: <span className="text-white font-black capitalize">{activeMode}</span></p>
              <div className="h-56">
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
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </section>
        </div>
      </div>
    </div>
  );

  const AlertsView = () => {
    // Extended alert logic with time-based filtering
    const alerts = [
      { id: 1, type: 'BUY', symbol: 'KPLC', sector: MarketSector.UTILITIES, msg: 'Price entered Undervaluation Band (1.78). Sector-specific weighting suggests immediate staged entry.', time: '2h ago', timeframe: '24h', level: 'High' },
      { id: 2, type: 'EXIT', symbol: 'SCOM', sector: MarketSector.TELECOM, msg: 'Approaching Fair Value Target (15.20). RSI indicating exhaustion on 4H timeframes.', time: '5h ago', timeframe: '24h', level: 'Medium' },
      { id: 3, type: 'FUNDAMENTAL', symbol: 'UTL Sector', sector: MarketSector.UTILITIES, msg: 'Sector-wide review indicates potential income deterioration in Q3. Interest coverage monitored closely.', time: '18h ago', timeframe: '24h', level: 'Critical' },
      { id: 4, type: 'DIVIDEND', symbol: 'BAT', sector: MarketSector.MANUFACTURING, msg: 'Announced final dividend. Current yield lock-in at 12.8%. Ex-dividend date approaching.', time: '3d ago', timeframe: '1w', level: 'Info' },
      { id: 5, type: 'BUY', symbol: 'KEGN', sector: MarketSector.UTILITIES, msg: 'Geothermal capacity expansion confirmed. Buy signal triggered at 2.10 support.', time: '4d ago', timeframe: '1w', level: 'High' },
      { id: 6, type: 'FUNDAMENTAL', symbol: 'EQTY', sector: MarketSector.FINANCE, msg: 'Regional integration complete. Revised growth targets for DRC operations.', time: '12d ago', timeframe: '1m', level: 'High' },
      { id: 7, type: 'DIVIDEND', symbol: 'TOTL', sector: MarketSector.ENERGY, msg: 'Interim dividend yield outperforming sector average. Maintain position.', time: '15d ago', timeframe: '1m', level: 'Medium' },
      { id: 8, type: 'EXIT', symbol: 'KCB', sector: MarketSector.FINANCE, msg: 'Non-performing loan ratio threshold breached. Partial exit recommended.', time: '22d ago', timeframe: '1m', level: 'High' }
    ];

    const filteredAlerts = alerts.filter(a => {
        if (alertTimeframe === '24h') return a.timeframe === '24h';
        if (alertTimeframe === '1w') return a.timeframe === '24h' || a.timeframe === '1w';
        return true;
    });

    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-500">
         <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
               <div>
                  <h2 className="text-3xl font-black text-slate-900">Strategic Signal Feed</h2>
                  <p className="text-slate-500 font-medium">Time-filtered triggers based on price breaches and fundamental shifts.</p>
               </div>
               <div className="flex flex-col items-end gap-3">
                  <button 
                    onClick={handleScanSignals} 
                    disabled={isScanning}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isScanning ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600'}`}
                  >
                    {isScanning ? <RefreshCw className="animate-spin" size={14}/> : <Zap size={14}/>}
                    {isScanning ? 'Scanning Alpha...' : 'Fetch Latest Signals'}
                  </button>
                  <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                    {(['24h', '1w', '1m'] as Timeframe[]).map((tf) => (
                        <button 
                          key={tf} 
                          onClick={() => setAlertTimeframe(tf)} 
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${alertTimeframe === tf ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {tf === '24h' ? '24 Hours' : tf === '1w' ? '1 Week' : 'Monthly'}
                        </button>
                    ))}
                  </div>
               </div>
            </div>
            
            <div className="space-y-6">
               {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
                 <div key={alert.id} className="flex flex-col md:flex-row gap-8 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group animate-in slide-in-from-bottom-2">
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
                             <StockIcon symbol={alert.symbol === 'UTL Sector' ? 'UT' : alert.symbol} sector={alert.sector} />
                             <span className="font-black text-2xl text-slate-900">{alert.symbol}</span>
                             <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                                alert.level === 'Critical' ? 'bg-rose-600 text-white shadow-lg' : 
                                alert.level === 'High' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-200 text-slate-600'
                             }`}>{alert.level}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> {alert.time}</span>
                             <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">{alert.timeframe === '24h' ? 'Intraday' : 'Swing'}</span>
                          </div>
                       </div>
                       <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-2xl">{alert.msg}</p>
                       <div className="mt-6 flex gap-6 items-center">
                          <button 
                            onClick={() => {
                              const stock = MOCK_STOCKS.find(s => s.symbol === alert.symbol);
                              if (stock) handleStockClick(stock);
                              else if (alert.symbol.includes('Sector')) setActiveTab('sectors');
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-emerald-600 hover:border-emerald-600 transition-all flex items-center gap-2"
                          >
                            Execute Fundamental Scan <ChevronRight size={14}/>
                          </button>
                       </div>
                    </div>
                 </div>
               )) : (
                 <div className="py-20 text-center flex flex-col items-center gap-4 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                    <ZapOff size={48} className="text-slate-200" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No signals found for this timeframe.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    );
  };

  const SectorsView = () => {
    const sectors = Object.values(MarketSector);
    return (
      <div className="space-y-12 animate-in slide-in-from-bottom duration-500">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-3xl font-black text-slate-900 mb-2">Industry Ecosystems</h2>
          <p className="text-slate-500 font-medium">Nyoro-style categorization based on sector-specific scoring weights.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sectors.map((sector) => {
            const stocks = MOCK_STOCKS.filter(s => s.sector === sector);
            if (stocks.length === 0) return null;
            const avgScore = Math.round(stocks.reduce((acc, s) => acc + calculateScore(s), 0) / stocks.length);
            
            return (
              <div key={sector} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{sector}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stocks.length} Assets Tracked</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Avg Quality</span>
                    <span className="text-xl font-black text-slate-900">{avgScore}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stocks.map((stock, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleStockClick(stock)}
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-blue-200 cursor-pointer transition-all"
                    >
                      <StockIcon symbol={stock.symbol} sector={stock.sector} />
                      <div>
                        <span className="text-sm font-black text-slate-900 block">{stock.symbol}</span>
                        <span className="text-[10px] font-bold text-emerald-600">{stock.current_price} KES</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const PortfoliosView = () => (
    <div className="space-y-12 animate-in slide-in-from-right duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(['standard', 'low_risk', 'opportunistic'] as const).map((mode) => (
          <div 
            key={mode} 
            className={`p-10 rounded-[3rem] border transition-all flex flex-col ${activeMode === mode ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10' : 'bg-white text-slate-900 border-slate-200 shadow-sm'}`}
          >
            <div className="flex justify-between items-start mb-10">
              <div className={`p-5 rounded-[1.5rem] ${activeMode === mode ? 'bg-emerald-500' : 'bg-slate-100'}`}>
                {mode === 'standard' ? <PieChartIcon size={24} /> : mode === 'low_risk' ? <ShieldAlert size={24} /> : <Zap size={24} />}
              </div>
              {activeMode === mode && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-500/20">Active Strategy</span>}
            </div>
            <h3 className="text-3xl font-black capitalize mb-3">{mode.replace('_', ' ')}</h3>
            <p className={`text-sm font-medium mb-10 leading-relaxed ${activeMode === mode ? 'text-slate-400' : 'text-slate-500'}`}>
              {mode === 'standard' ? "The primary 'Mapato' growth strategy. Balanced across blue-chips and turnaround plays." : 
               mode === 'low_risk' ? "Kuza-style stability. Focus on Tier-1 banks and defensive utilities with >10% yield." : 
               "High-torque value extraction. Concentrated bets on deep-value, asset-rich opportunities."}
            </p>
            <div className="space-y-4 mb-10 flex-1">
              {report.portfolio_modes[mode].allocation.map((a, i) => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-2xl ${activeMode === mode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <span className="font-black text-sm">{a.symbol}</span>
                  <span className={`text-xs font-black ${activeMode === mode ? 'text-emerald-400' : 'text-slate-900'}`}>{a.weight_pct}%</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveMode(mode)} 
              className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all ${activeMode === mode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-white'}`}
            >
              {activeMode === mode ? 'Strategy Deploying' : 'Activate Thesis'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const ScreenerView = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <MarketTicker />
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Activity className="text-emerald-500" />
              NSE Real-Time Screener
            </h2>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search symbols or sectors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Asset Name</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Market Price</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">24h Change</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">MACD Signal</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Alpha Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStocks.map((stock, i) => (
                <tr key={i} onClick={() => handleStockClick(stock)} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <StockIcon symbol={stock.symbol} sector={stock.sector} />
                      <div className="flex flex-col">
                        <span className="text-base font-black text-slate-900">{stock.symbol}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stock.sector}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">{stock.current_price.toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-black flex items-center gap-1 ${stock.price_change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stock.price_change_pct >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {Math.abs(stock.price_change_pct)}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${stock.indicators?.macd === 'Bullish' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                      {stock.indicators?.macd}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-black text-slate-900">{calculateScore(stock)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const MarketView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Globe className="text-blue-500" size={24} />
          <h2 className="text-2xl font-black text-slate-900">NSE Macro Trends</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.market_snapshot.indices}>
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={4} />
                <Tooltip />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
             {report.market_snapshot.sectors.map((sector, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-300 transition-all">
                  <span className="text-sm font-black text-slate-900">{sector.name}</span>
                  <div className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{sector.div_yield_pct}% Yield</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AnalyzerView = () => (
    <div className="max-w-5xl mx-auto space-y-12 animate-in zoom-in duration-500">
       <div className="bg-white p-16 rounded-[4rem] border-4 border-dashed border-slate-200 text-center relative overflow-hidden shadow-sm">
          <div className="bg-emerald-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-emerald-500 shadow-xl shadow-emerald-500/10">
             <Layers size={40} />
          </div>
          <h2 className="text-4xl font-black mb-6 text-slate-900 tracking-tight">Multi-Modal Strategy Lab</h2>
          <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
             Extract terminal-grade alpha from **Financial Images, Earnings Audio, or CEO Videos**. Mapato Bora supports diverse artifact ingestion.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <FileText className="mx-auto mb-2 text-blue-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">PDF Report</span>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <Newspaper className="mx-auto mb-2 text-emerald-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Image Grid</span>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <Mic className="mx-auto mb-2 text-indigo-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Call Audio</span>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <Video className="mx-auto mb-2 text-rose-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analysis Video</span>
             </div>
          </div>
          <div className="flex flex-col items-center gap-6">
             <input type="file" id="context-upload" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.txt,audio/*,video/*" />
             <label htmlFor="context-upload" className="bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black cursor-pointer hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3 uppercase tracking-widest text-xs group">
               <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" /> Initiate Artifact Scan
             </label>
             {uploadedFile && (
               <div className="mt-6 flex flex-col items-center gap-6 animate-in slide-in-from-top-4">
                  <span className="text-sm font-black text-slate-700">{uploadedFile.name}</span>
                  <button onClick={runFileAnalysis} disabled={analyzingFile} className={`px-12 py-6 rounded-[2rem] font-black text-xs uppercase transition-all shadow-xl ${analyzingFile ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white shadow-emerald-500/30'}`}>
                    {analyzingFile ? 'Synthesizing Thesis...' : 'Execute Alpha Scan'}
                  </button>
               </div>
             )}
          </div>
       </div>
       {fileAnalysis && (
         <div className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl border border-slate-800 relative overflow-hidden">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-4 relative z-10">AI Strategy Decomposition</h3>
            <div className="prose prose-invert max-w-none text-slate-300 font-bold text-lg leading-relaxed bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700/50 relative z-10 italic">
              "{fileAnalysis}"
            </div>
            <Globe className="absolute -bottom-20 -right-20 text-emerald-500/5 opacity-10 pointer-events-none" size={400} />
         </div>
       )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white">
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 px-6 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-emerald-500 p-2.5 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
            <TrendingUp size={26} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black tracking-tight leading-none">Mapato Bora</h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Terminal Engine</p>
          </div>
        </div>
        <nav className="flex items-center gap-1 md:gap-3 bg-slate-800/50 p-1 rounded-2xl border border-slate-700/50">
          {(['dashboard', 'market', 'screener', 'sectors', 'portfolios', 'alerts', 'analyzer'] as AppTab[]).map((tab) => (
             <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl scale-[1.05]' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
             >
                {tab}
             </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-10 space-y-12 pb-32">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'screener' && <ScreenerView />}
        {activeTab === 'market' && <MarketView />}
        {activeTab === 'sectors' && <SectorsView />}
        {activeTab === 'portfolios' && <PortfoliosView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'analyzer' && <AnalyzerView />}

        {selectedStock && (
          <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md p-4 md:p-16 overflow-y-auto flex items-start justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden relative border border-white/10">
              <button onClick={() => setSelectedStock(null)} className="absolute top-8 right-10 text-slate-400 hover:text-slate-900 hover:scale-110 transition-all z-20">
                <XCircle size={40} />
              </button>
              <div className="bg-slate-900 p-16 text-white relative overflow-hidden">
                <div className="flex items-center gap-6 mb-8 relative z-10">
                   <StockIcon symbol={selectedStock.symbol} sector={selectedStock.sector} />
                   <h2 className="text-8xl font-black tracking-tighter">{selectedStock.symbol}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-slate-800 pt-12 relative z-10">
                   <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Market Price</p><p className="text-4xl font-black">{selectedStock.current_price} KES</p></div>
                   <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Nyoro Target</p><p className="text-4xl font-black text-emerald-400">{selectedStock.fair_value_target_kes} KES</p></div>
                   <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">P/E Ratio</p><p className="text-4xl font-black text-amber-400">{selectedStock.valuation.pe}x</p></div>
                   <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Div Yield</p><p className="text-4xl font-black text-blue-400">{selectedStock.valuation.div_yield_pct}%</p></div>
                </div>
                <Target size={500} className="absolute -bottom-20 -right-20 text-white/5 pointer-events-none" />
              </div>
              <div className="p-16">
                 <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[2.5rem] relative overflow-hidden">
                   <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10"><Award size={18} /> Deep Value Reasoning</h4>
                   {loadingAi ? <div className="animate-pulse h-12 bg-emerald-100 rounded-xl relative z-10"></div> : <p className="text-emerald-900 font-bold text-2xl relative z-10 italic">"{aiInsight}"</p>}
                   <Globe size={300} className="absolute -bottom-20 -right-20 text-emerald-200/20 pointer-events-none" />
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-500 text-[10px] py-16 text-center border-t border-slate-800 font-black uppercase tracking-[0.4em]">
        &copy; {new Date().getFullYear()} Mapato Bora Terminal - Nairobi Securities Exchange Alpha Center
      </footer>
    </div>
  );
};

export default App;
