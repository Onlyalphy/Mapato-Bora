
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
  LucideIcon
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

const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'];

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
    // Scroll to detail if needed or just show modal
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
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Globe className="text-blue-500" size={20} />
              Sector Rotation Signal
            </h2>
            <div className="space-y-4">
              {report.sector_rotation.map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className={`p-3 rounded-xl ${s.action === 'Overweight' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {s.action === 'Overweight' ? <TrendingUp size={20} /> : <Target size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">{s.sector}</span>
                      <span className="text-[10px] font-black uppercase text-slate-400">{s.signal}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{s.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden relative">
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
                <div className="h-48 flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={report.portfolio_modes[activeMode].allocation.map(a => ({ name: a.symbol, value: a.weight_pct }))} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                          {report.portfolio_modes[activeMode].allocation.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                   {report.portfolio_modes[activeMode].allocation.slice(0, 3).map((a, i) => (
                     <div key={i} className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">{a.symbol}</span>
                        <span>{a.weight_pct}%</span>
                     </div>
                   ))}
                </div>
              </div>
           </section>
           
           <div className="bg-white p-6 rounded-3xl border border-slate-200">
             <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-600">
                <ShieldAlert size={20} />
                Recent Alerts
              </h2>
              <div className="space-y-3">
                 <div className="text-[10px] p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold border border-emerald-100">
                   KPLC: Price entered Undervaluation Band (1.78)
                 </div>
                 <div className="text-[10px] p-3 bg-amber-50 text-amber-700 rounded-xl font-bold border border-amber-100">
                   SCOM: Nearing Fair Value Target (15.20)
                 </div>
              </div>
              <button onClick={() => setActiveTab('alerts')} className="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">View All Signals</button>
           </div>
        </div>
      </div>
    </div>
  );

  const MarketView = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
       <div className="bg-white p-8 rounded-3xl border border-slate-200">
          <h2 className="text-2xl font-black mb-8">NSE Market Intelligence</h2>
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
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
             <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowUpRight className="text-emerald-500" /> Top Sector Gainers</h3>
             <div className="space-y-4">
                {report.market_snapshot.sectors.sort((a,b) => b.div_yield_pct - a.div_yield_pct).map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                     <span className="font-bold text-slate-700">{s.name}</span>
                     <div className="text-right">
                        <div className="text-sm font-black">+{Math.floor(Math.random() * 5)}.%</div>
                        <div className="text-[10px] text-slate-400">{s.div_yield_pct}% Div Yield</div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200">
             <h3 className="font-bold mb-4 flex items-center gap-2"><Zap className="text-amber-500" /> Market Snapshot Audit</h3>
             <div className="space-y-4 text-sm font-medium text-slate-600">
                <p>Data Sources: {report.audit.data_sources.join(', ')}</p>
                <p>Market Cap: { (report.audit.metrics_snapshot.market_cap_kes / 1e12).toFixed(2) } Trillion KES</p>
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
                   <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Recent Changes</h4>
                   <ul className="list-disc list-inside space-y-1 text-xs">
                      {report.audit.changes_vs_prior.map((c, i) => <li key={i}>{c}</li>)}
                   </ul>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const SectorsView = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
       <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-3xl font-black">Industry Classification</h2>
            <p className="text-slate-500 font-medium mt-2">Nyoro-style quality picks filtered by industry</p>
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600"><Filter size={16}/> Filter</button>
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold"><Search size={16}/> Search NSE</button>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-12">
          {Object.values(MarketSector).map((sector) => {
            const stocks = MOCK_STOCKS.filter(s => s.sector === sector);
            if (stocks.length === 0) return null;
            return (
              <section key={sector} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">{sector}</h3>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stocks.map((stock, i) => (
                    <div key={i} onClick={() => handleStockClick(stock)} className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                           <h4 className="text-2xl font-black text-slate-900">{stock.symbol}</h4>
                           <span className="text-[10px] font-bold text-slate-400">NSE Listed</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-2xl font-black text-emerald-600">{stock.current_price}</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase">KES</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6">
                         <div className="bg-slate-50 p-3 rounded-xl">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Score</div>
                            <div className="text-lg font-black text-slate-700">{calculateScore(stock)}</div>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-xl">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Div Yield</div>
                            <div className="text-lg font-black text-emerald-600">{stock.valuation.div_yield_pct}%</div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                         <span>View Thesis</span>
                         <ChevronRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
       </div>
    </div>
  );

  const PortfoliosView = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {(['standard', 'low_risk', 'opportunistic'] as const).map(mode => (
            <div key={mode} className={`p-8 rounded-[2.5rem] border ${activeMode === mode ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' : 'bg-white text-slate-900 border-slate-200'}`}>
               <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-3xl ${activeMode === mode ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-900'}`}>
                     {mode === 'standard' ? <PieChartIcon /> : mode === 'low_risk' ? <ShieldAlert /> : <Zap />}
                  </div>
                  {activeMode === mode && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Active Selection</span>}
               </div>
               <h3 className="text-2xl font-black capitalize mb-2">{mode.replace('_', ' ')}</h3>
               <p className={`text-sm font-medium mb-8 leading-relaxed ${activeMode === mode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {mode === 'standard' ? "The core alpha strategy focusing on quality growth at a reasonable price (GARP)." : 
                   mode === 'low_risk' ? "Kuza-style stability focusing on blue-chips and consistent high dividend yields." : 
                   "Nyoro-style accumulation of deep value turnaround plays with high torque potential."}
               </p>
               <div className="space-y-4">
                  {report.portfolio_modes[mode].allocation.map((a, i) => (
                    <div key={i} className={`flex justify-between items-center p-3 rounded-2xl ${activeMode === mode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                       <span className="font-bold text-sm">{a.symbol}</span>
                       <span className={`text-xs font-black ${activeMode === mode ? 'text-emerald-400' : 'text-slate-500'}`}>{a.weight_pct}%</span>
                    </div>
                  ))}
               </div>
               <button onClick={() => setActiveMode(mode)} className={`w-full mt-8 py-4 rounded-2xl font-black text-sm transition-all ${activeMode === mode ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  {activeMode === mode ? 'Deploying...' : 'Select Strategy'}
               </button>
            </div>
          ))}
       </div>
    </div>
  );

  const AlertsView = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
       <div className="bg-white p-8 rounded-3xl border border-slate-200">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-black">Strategic Alerts Feed</h2>
             <span className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2"><Bell size={14}/> 3 Active Triggers</span>
          </div>
          
          <div className="space-y-6">
             {[
               { type: 'BUY', symbol: 'KPLC', msg: 'Price entered Undervaluation Band (1.78). ATR buffer confirmed.', time: '2h ago', level: 'High' },
               { type: 'EXIT', symbol: 'SCOM', msg: 'Approaching Fair Value (15.20). RSI overbought on 4H chart.', time: '5h ago', level: 'Medium' },
               { type: 'FUNDAMENTAL', symbol: 'UTL Sector', msg: 'Income deterioration reported in Q3. Reducing exposure.', time: '1d ago', level: 'Critical' },
               { type: 'DIVIDEND', symbol: 'BAT', msg: 'Announced final div of 45 KES. Ex-div date approaching.', time: '2d ago', level: 'Info' }
             ].map((alert, i) => (
               <div key={i} className="flex gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                  <div className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    alert.type === 'BUY' ? 'bg-emerald-100 text-emerald-600' : 
                    alert.type === 'EXIT' ? 'bg-amber-100 text-amber-600' : 
                    alert.type === 'FUNDAMENTAL' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {alert.type === 'BUY' ? <Target /> : alert.type === 'EXIT' ? <ArrowDownRight /> : alert.type === 'FUNDAMENTAL' ? <AlertTriangle /> : <Info />}
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <span className="font-black text-lg">{alert.symbol}</span>
                           <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              alert.level === 'Critical' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                           }`}>{alert.level}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{alert.time}</span>
                     </div>
                     <p className="text-sm font-medium text-slate-600">{alert.msg}</p>
                     <div className="mt-4 flex gap-4">
                        <button className="text-xs font-bold text-slate-900 underline underline-offset-4">Deep Analysis</button>
                        <button className="text-xs font-bold text-slate-400 hover:text-rose-600">Dismiss</button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );

  const AnalyzerView = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in duration-500">
       <div className="bg-white p-12 rounded-[3rem] border-4 border-dashed border-slate-200 text-center">
          <div className="bg-blue-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-blue-500">
             <Upload size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4">Financial Context Analyzer</h2>
          <p className="text-slate-500 font-medium mb-12 max-w-md mx-auto">
             Upload a stock's annual report, image of financial statements, or a news clip. Gemini will extract "Nyoro-style" insights instantly.
          </p>
          
          <div className="flex flex-col items-center gap-4">
             <input type="file" id="context-upload" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.txt" />
             <label htmlFor="context-upload" className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black cursor-pointer hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3">
               <FileText size={20} />
               {uploadedFile ? 'Change File' : 'Select Report / Image'}
             </label>
             {uploadedFile && (
               <div className="mt-4 flex flex-col items-center gap-4">
                  <span className="text-sm font-bold text-slate-400 flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={16}/> {uploadedFile.name} ready</span>
                  <button onClick={runFileAnalysis} disabled={analyzingFile} className={`px-10 py-5 rounded-3xl font-black transition-all ${analyzingFile ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20 shadow-xl'}`}>
                    {analyzingFile ? 'Analyzing Fundamentals...' : 'Run Alpha Extraction'}
                  </button>
               </div>
             )}
          </div>
       </div>

       {fileAnalysis && (
         <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                 <Zap className="text-amber-400" /> AI Strategic Insights
               </h3>
               <div className="prose prose-invert max-w-none text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                 {fileAnalysis}
               </div>
            </div>
            <div className="absolute top-0 right-0 p-10 text-emerald-500/10 pointer-events-none">
               <BarChart3 size={300} />
            </div>
         </div>
       )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-emerald-500 p-2 rounded-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight">Mapato Bora</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">NSE Strategic Analytics</p>
          </div>
        </div>
        <nav className="flex items-center gap-2 md:gap-6">
          {(['dashboard', 'market', 'sectors', 'portfolios', 'alerts', 'analyzer'] as AppTab[]).map((tab) => (
             <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all ${activeTab === tab ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-white'}`}
             >
                {tab}
             </button>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden lg:flex text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700 items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            NSE Live: <span className="text-emerald-400 font-bold">+0.8%</span>
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 pb-32">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'market' && <MarketView />}
        {activeTab === 'sectors' && <SectorsView />}
        {activeTab === 'portfolios' && <PortfoliosView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'analyzer' && <AnalyzerView />}

        {/* Floating Stock Detail Modal */}
        {selectedStock && (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm p-4 md:p-12 overflow-y-auto flex items-start justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden relative">
              <button onClick={() => setSelectedStock(null)} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 transition-colors z-20"><XCircle size={32} /></button>
              
              <div className="bg-slate-900 p-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black tracking-widest uppercase">Fundamental Score: {calculateScore(selectedStock)}</span>
                    <span className="text-slate-400 text-sm font-medium">{selectedStock.sector}</span>
                  </div>
                  <h2 className="text-6xl font-black mb-8">{selectedStock.symbol}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Current Price</p>
                      <p className="text-3xl font-black">{selectedStock.current_price} KES</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Target Price</p>
                      <p className="text-3xl font-black text-emerald-400">{selectedStock.fair_value_target_kes} KES</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">P/E Ratio</p>
                      <p className="text-3xl font-black text-amber-400">{selectedStock.valuation.pe}x</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Div Yield</p>
                      <p className="text-3xl font-black text-blue-400">{selectedStock.valuation.div_yield_pct}%</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-12 text-emerald-500/5 opacity-50 pointer-events-none">
                  <Target size={400} />
                </div>
              </div>
              
              <div className="p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="space-y-8">
                    <div>
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Thesis</h4>
                       <p className="text-slate-700 font-medium leading-relaxed">{selectedStock.notes}</p>
                    </div>
                    <div>
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Upcoming Catalysts</h4>
                       <ul className="space-y-3">
                          {selectedStock.catalysts.map((c, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {c}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
                 
                 <div className="lg:col-span-2 space-y-8">
                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl">
                       <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <TrendingUp size={16} /> Nyoro-Style Validation
                       </h4>
                       {loadingAi ? (
                         <div className="flex items-center gap-3 py-4">
                           <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                           <span className="text-sm font-bold text-emerald-600">Generating AI Alpha Insights...</span>
                         </div>
                       ) : (
                         <p className="text-emerald-900 font-bold text-lg leading-relaxed italic">"{aiInsight}"</p>
                       )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                          <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest mb-4">Risk Guards</h4>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center text-sm font-black">
                                <span className="text-rose-600">Dynamic Stop</span>
                                <span className="text-rose-900">{selectedStock.risk_controls.stop_kes} KES</span>
                             </div>
                             <div className="flex justify-between items-center text-sm font-black">
                                <span className="text-rose-600">Max DD Constraint</span>
                                <span className="text-rose-900">{selectedStock.risk_controls.max_drawdown_pct}%</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center justify-center">
                          <button className="bg-slate-900 text-white w-full py-6 rounded-3xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">Execute Staged Entry</button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-slate-900 text-slate-500 text-xs py-12 px-8 text-center border-t border-slate-800 mt-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center gap-8 mb-4">
            <span className="font-black text-slate-400">NSE AUDITED</span>
            <span className="font-black text-slate-400">AI POWERED</span>
            <span className="font-black text-slate-400">NYORO STRATEGY</span>
          </div>
          <p className="leading-relaxed">
            Mapato Bora is a strategic analytics terminal for the Nairobi Securities Exchange. Analysis is provided for educational purposes based on specific sector weighting rules. 
            No investment advice is implied. Returns are not guaranteed.
          </p>
          <p className="font-bold">&copy; {new Date().getFullYear()} Mapato Bora Terminal. Built for Alphonce.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
