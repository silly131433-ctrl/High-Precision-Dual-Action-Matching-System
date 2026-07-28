import { useState, useMemo } from 'react';
import { 
  Layers, 
  Database, 
  HelpCircle, 
  Wrench, 
  RotateCcw, 
  Compass, 
  Info,
  Check,
  Activity,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { 
  FormingNeedleInputs, 
  SingleNeckingInputs, 
  FixtureData, 
  ProductType 
} from './types';
import { 
  DEFAULT_NEEDLE_PRESETS, 
  DEFAULT_NECKING_PRESETS, 
  DEMO_FIXTURES 
} from './constants';
import { 
  matchTPCore, 
  matchBACore, 
  matchBPCore 
} from './utils/matchingEngine';
import DimensionInputGroup from './components/DimensionInputGroup';
import ExcelUploadCard from './components/ExcelUploadCard';
import MatchResultTabs from './components/MatchResultTabs';
import RulesViewer from './components/RulesViewer';

export default function App() {
  // Main Tab Paging system
  const [activeMainTab, setActiveMainTab] = useState<'compare' | 'database' | 'rules'>('compare');
  
  // Product type choice ('needle' | 'necking')
  const [productType, setProductType] = useState<ProductType>('needle');

  // Input states
  const [needleInputs, setNeedleInputs] = useState<FormingNeedleInputs>(() => {
    const presets = JSON.parse(JSON.stringify(DEFAULT_NEEDLE_PRESETS)) as FormingNeedleInputs;
    Object.keys(presets).forEach((key) => {
      const k = key as keyof FormingNeedleInputs;
      presets[k].value = 0;
      presets[k].posTol = 0;
      presets[k].negTol = 0;
    });
    return presets;
  });
  const [neckingInputs, setNeckingInputs] = useState<SingleNeckingInputs>(() => {
    const presets = JSON.parse(JSON.stringify(DEFAULT_NECKING_PRESETS)) as SingleNeckingInputs;
    Object.keys(presets).forEach((key) => {
      const k = key as keyof SingleNeckingInputs;
      presets[k].value = 0;
      presets[k].posTol = 0;
      presets[k].negTol = 0;
    });
    return presets;
  });

  // Fixture Database states (either empty or uploaded excel data)
  const [fixtures, setFixtures] = useState<FixtureData[]>([]);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);

  // Database Tab States
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [dbCategoryFilter, setDbCategoryFilter] = useState<string>('all');

  // Load Preset function to reset parameters to test perfectly matched cases
  const handleLoadPresets = () => {
    if (productType === 'needle') {
      setNeedleInputs(JSON.parse(JSON.stringify(DEFAULT_NEEDLE_PRESETS)));
    } else {
      setNeckingInputs(JSON.parse(JSON.stringify(DEFAULT_NECKING_PRESETS)));
    }
  };

  // Reset inputs to zeroes
  const handleResetInputs = () => {
    if (productType === 'needle') {
      const resetNeedle = JSON.parse(JSON.stringify(DEFAULT_NEEDLE_PRESETS)) as FormingNeedleInputs;
      Object.keys(resetNeedle).forEach((key) => {
        const k = key as keyof FormingNeedleInputs;
        resetNeedle[k].value = 0;
        resetNeedle[k].posTol = 0;
        resetNeedle[k].negTol = 0;
      });
      setNeedleInputs(resetNeedle);
    } else {
      const resetNecking = JSON.parse(JSON.stringify(DEFAULT_NECKING_PRESETS)) as SingleNeckingInputs;
      Object.keys(resetNecking).forEach((key) => {
        const k = key as keyof SingleNeckingInputs;
        resetNecking[k].value = 0;
        resetNecking[k].posTol = 0;
        resetNecking[k].negTol = 0;
      });
      setNeckingInputs(resetNecking);
    }
  };

  // Upload callback
  const handleDataImported = (data: FixtureData[], fileName: string, headers: string[]) => {
    setFixtures(data);
    setImportedFileName(fileName);
    setExcelHeaders(headers);
    setDbCategoryFilter('all'); // Reset filter upon importing new file
  };

  // Clear loaded database
  const handleClearDatabase = () => {
    setFixtures([]);
    setImportedFileName(null);
    setExcelHeaders([]);
    setDbCategoryFilter('all');
  };

  // Dimension value change handlers
  const handleNeedleValueChange = (key: keyof FormingNeedleInputs, updatedValue: typeof DEFAULT_NEEDLE_PRESETS.baTpAngle) => {
    setNeedleInputs(prev => ({
      ...prev,
      [key]: updatedValue
    }));
  };

  const handleNeckingValueChange = (key: keyof SingleNeckingInputs, updatedValue: typeof DEFAULT_NECKING_PRESETS.baAngle) => {
    setNeckingInputs(prev => ({
      ...prev,
      [key]: updatedValue
    }));
  };

  // Memoized calculations for matches to optimize performance
  const matchResults = useMemo(() => {
    // 1. Separate database by categories
    const fixturesH12 = fixtures.filter(f => f.category === 'H12');
    const fixturesH23 = fixtures.filter(f => f.category === 'H23');
    const fixturesBP = fixtures.filter(f => f.category === 'H32' || f.category === 'H33');

    // 2. Perform matches
    const matchedTP = fixturesH12.map(f => matchTPCore(f, productType, needleInputs, neckingInputs));
    const matchedBA = fixturesH23.map(f => matchBACore(f, productType, needleInputs, neckingInputs));
    const matchedBP = fixturesBP.map(f => matchBPCore(f, productType, needleInputs, neckingInputs));

    return {
      tp: matchedTP,
      ba: matchedBA,
      bp: matchedBP
    };
  }, [fixtures, productType, needleInputs, neckingInputs]);

  // Total summary of perfect matches
  const tpMatchesCount = matchResults.tp.filter(r => r.isMatched).length;
  const baMatchesCount = matchResults.ba.filter(r => r.isMatched).length;
  const bpMatchesCount = matchResults.bp.filter(r => r.isMatched).length;
  const totalMatchesCount = tpMatchesCount + baMatchesCount + bpMatchesCount;

  // Dynamic categories from imported file
  const dbCategories = useMemo(() => {
    const cats = new Set<string>();
    fixtures.forEach(f => {
      if (f.category) {
        cats.add(f.category);
      }
    });
    return ['all', ...Array.from(cats).sort()];
  }, [fixtures]);

  // Filter DB explorer rows
  const filteredDbFixtures = useMemo(() => {
    return fixtures.filter(f => {
      const matchCat = dbCategoryFilter === 'all' || f.category === dbCategoryFilter;
      const matchSearch = f.model.toLowerCase().includes(dbSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [fixtures, dbCategoryFilter, dbSearchQuery]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="bg-slate-900 text-white shrink-0 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                生產模仁規格比對分析系統
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-900/50">
                  Ver 1.2
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                高精密度 TP(H12)、BA(H23)、BP(H32/33) 治具型號規格智慧匹配工具
              </p>
            </div>
          </div>

          {/* Navigation Tabs (分頁系統) */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 self-start md:self-center">
            <button
              onClick={() => setActiveMainTab('compare')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeMainTab === 'compare'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              規格比對分析
            </button>
            <button
              onClick={() => setActiveMainTab('database')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeMainTab === 'database'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              治具資料庫總覽
            </button>
            <button
              onClick={() => setActiveMainTab('rules')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeMainTab === 'rules'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              工藝公式說明
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 overflow-hidden flex flex-col">
        {activeMainTab === 'compare' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 overflow-hidden">
            {/* Left Column: Switch + Input Values Form (Width: 5/12) */}
            <div className="lg:col-span-5 space-y-6 lg:max-h-full lg:overflow-y-auto pr-1">
              {/* Product Mode Selector Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm mb-3.5 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  產品工藝類型選擇
                </h3>
                
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setProductType('needle')}
                    className={`py-2 px-4 rounded-lg text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      productType === 'needle'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 ${productType === 'needle' ? 'text-amber-500' : ''}`} />
                    成針 (Forming Needle)
                  </button>
                  <button
                    onClick={() => setProductType('necking')}
                    className={`py-2 px-4 rounded-lg text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      productType === 'necking'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LayoutGrid className={`w-3.5 h-3.5 ${productType === 'necking' ? 'text-blue-500' : ''}`} />
                    單縮口 (Single Necking)
                  </button>
                </div>
              </div>

              {/* Excel Import Card */}
              <ExcelUploadCard
                onDataImported={handleDataImported}
                onClearDatabase={handleClearDatabase}
                importedFileName={importedFileName}
                totalFixtureCount={fixtures.length}
              />

              {/* Dimension Inputs Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      產品規格尺寸與公差輸入
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">請輸入成品檢驗尺寸，下限值將自動參與運算</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleLoadPresets}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-all flex items-center gap-1"
                      title="載入系統預設產品規格與公差數值"
                    >
                      恢復預設數值
                    </button>
                    <button
                      onClick={handleResetInputs}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2 py-1 rounded-md transition-all flex items-center gap-1"
                      title="重設所有輸入數值為 0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      歸零
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Info Badge */}
                  <div className="bg-blue-50 border border-blue-100/60 rounded-xl p-3 flex gap-2.5 text-xs text-blue-800 leading-relaxed font-medium">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      公差輸入：<strong>正公差(+)</strong> 和 <strong>負公差(-)</strong> 請皆輸入<strong>正的數值</strong> (例如正公差為 +0.02，請填 0.02；負公差為 -0.01，請填 0.01)。
                    </span>
                  </div>

                  {/* Form inputs depending on product mode */}
                  {productType === 'needle' ? (
                    <div className="grid grid-cols-1 gap-3">
                      <DimensionInputGroup
                        label="BA管TP端縮口角度 (θ_TP)"
                        dimValue={needleInputs.baTpAngle}
                        onChange={(val) => handleNeedleValueChange('baTpAngle', val)}
                        description="H12功能角度"
                      />
                      <DimensionInputGroup
                        label="BA管BP端縮口角度 (θ_BP)"
                        dimValue={needleInputs.baBpAngle}
                        onChange={(val) => handleNeedleValueChange('baBpAngle', val)}
                        description="H32/33第1階角度"
                      />
                      <DimensionInputGroup
                        label="BP側縮口直徑"
                        dimValue={needleInputs.bpRedDia}
                        onChange={(val) => handleNeedleValueChange('bpRedDia', val)}
                        description="用於H32/33限制公式"
                      />
                      <DimensionInputGroup
                        label="BA管長度 (L)"
                        dimValue={needleInputs.baLen}
                        onChange={(val) => handleNeedleValueChange('baLen', val)}
                        description="用於H23與H32/33厚度比例"
                      />
                      <DimensionInputGroup
                        label="BA管外直徑 (OD)"
                        dimValue={needleInputs.baOutDia}
                        onChange={(val) => handleNeedleValueChange('baOutDia', val)}
                        description="核心比對基準"
                      />
                      <DimensionInputGroup
                        label="BA管內直徑 (ID)"
                        dimValue={needleInputs.baInDia}
                        onChange={(val) => handleNeedleValueChange('baInDia', val)}
                      />
                      <DimensionInputGroup
                        label="TP小徑直徑 (D_TP)"
                        dimValue={needleInputs.tpSmallDia}
                        onChange={(val) => handleNeedleValueChange('tpSmallDia', val)}
                        description="用於H12第1階孔"
                      />
                      <DimensionInputGroup
                        label="BP小徑直徑 (D_BP)"
                        dimValue={needleInputs.bpSmallDia}
                        onChange={(val) => handleNeedleValueChange('bpSmallDia', val)}
                        description="用於H32/33第2階孔"
                      />
                      <DimensionInputGroup
                        label="TP凸出長 (H_TP)"
                        dimValue={needleInputs.tpProjLen}
                        onChange={(val) => handleNeedleValueChange('tpProjLen', val)}
                        description="用於H12厚度範圍"
                      />
                      <DimensionInputGroup
                        label="成針總長"
                        dimValue={needleInputs.totalLen}
                        onChange={(val) => handleNeedleValueChange('totalLen', val)}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <DimensionInputGroup
                        label="BA管縮口角度 (θ)"
                        dimValue={neckingInputs.baAngle}
                        onChange={(val) => handleNeckingValueChange('baAngle', val)}
                        description="H12功能角度"
                      />
                      <DimensionInputGroup
                        label="BA管直徑"
                        dimValue={neckingInputs.baDia}
                        onChange={(val) => handleNeckingValueChange('baDia', val)}
                        description="H12倒角與H23內徑比對"
                      />
                      <DimensionInputGroup
                        label="BA管長度 (L)"
                        dimValue={neckingInputs.baLen}
                        onChange={(val) => handleNeckingValueChange('baLen', val)}
                        description="用於H23厚度比對"
                      />
                      <DimensionInputGroup
                        label="縮口直徑"
                        dimValue={neckingInputs.redDia}
                        onChange={(val) => handleNeckingValueChange('redDia', val)}
                        description="用於H12第1階內徑限制"
                      />
                      <DimensionInputGroup
                        label="BA管內直徑 (ID)"
                        dimValue={neckingInputs.baInDia}
                        onChange={(val) => handleNeckingValueChange('baInDia', val)}
                        description="用於BP(H32/33)第1階限制"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Calculations Matches and Visual Tables (Width: 7/12) */}
            <div className="lg:col-span-7 flex flex-col lg:max-h-full overflow-hidden gap-5">
              {/* Overall Summary Widgets */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-emerald-100">完全符合治具</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-2xl font-extrabold font-mono">{totalMatchesCount}</span>
                    <span className="text-[10px] text-emerald-100">筆合格</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-500">比對治具總庫</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-extrabold text-slate-800 font-mono">{fixtures.length}</span>
                    <span className="text-[10px] text-slate-400">個型號</span>
                  </div>
                </div>

                <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-blue-100">比對運作模式</span>
                  <div className="text-xs font-bold mt-2 truncate">
                    {productType === 'needle' ? '成針模式 (10項尺寸)' : '單縮口模式 (5項尺寸)'}
                  </div>
                </div>
              </div>

              {/* Core Results Tabs Component */}
              <div className="flex-1 overflow-hidden min-h-[500px]">
                <MatchResultTabs
                  resultsTP={matchResults.tp}
                  resultsBA={matchResults.ba}
                  resultsBP={matchResults.bp}
                  productType={productType}
                />
              </div>
            </div>
          </div>
        )}

        {activeMainTab === 'database' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
            {/* Tab Header with Search */}
            <div className="border-b border-slate-150 bg-slate-50/50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  治具資料庫總覽 ({fixtures.length} 筆)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">顯示目前載入的治具資料表（支援欄位智慧對應）</p>
              </div>

              {/* Category selector */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1 flex items-center gap-1">
                  分類篩選:
                </span>
                {dbCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDbCategoryFilter(cat)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      dbCategoryFilter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all' ? '全部' : cat}
                  </button>
                ))}
              </div>
            </div>
 
            {/* Sub Filter Search Bar */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 shrink-0">
              <input
                type="text"
                placeholder="輸入治具型號 / 關鍵字進行檢索..."
                value={dbSearchQuery}
                onChange={(e) => setDbSearchQuery(e.target.value)}
                className="max-w-md w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-hidden focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
              <span className="text-xs text-slate-400 font-mono font-medium ml-auto">
                符合項目：{filteredDbFixtures.length} 筆
              </span>
            </div>
 
            {/* Spreadsheet Spreadsheet Content */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-250 sticky top-0 z-10">
                    {excelHeaders.length > 0 ? (
                      excelHeaders.map((header) => (
                        <th key={header} className="p-3 pl-4 text-left whitespace-nowrap first:pl-5">{header}</th>
                      ))
                    ) : (
                      <>
                        <th className="p-3 pl-5">分類</th>
                        <th className="p-3">治具型號</th>
                        <th className="p-3 text-right">功能孔角度 (H12/32/33)</th>
                        <th className="p-3 text-right">第1階內徑 (H12/32/33)</th>
                        <th className="p-3 text-right">第1階內徑(-)公差</th>
                        <th className="p-3 text-right">倒角 (H12)</th>
                        <th className="p-3 text-right">倒角(-)公差</th>
                        <th className="p-3 text-right">功能孔厚度 (H12/23)</th>
                        <th className="p-3 text-right">內徑 (H23)</th>
                        <th className="p-3 text-right">內徑(-)公差</th>
                        <th className="p-3 text-right">第2階內徑 (H32/33)</th>
                        <th className="p-3 text-right">第1階孔深 (H32/33)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredDbFixtures.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      {excelHeaders.length > 0 ? (
                        excelHeaders.map((header) => {
                          const val = row.raw ? row.raw[header] : undefined;
                          
                          // Style category column specifically if it matches
                          const isCategoryCol = header.includes('分類') || header.toLowerCase() === 'category' || header.includes('Category');
                          const isModelCol = header.includes('型號') || header.toLowerCase() === 'model' || header.includes('Model');
                          
                          if (isCategoryCol) {
                            return (
                              <td key={header} className="p-3 pl-4 first:pl-5 font-semibold">
                                <span className="px-2 py-0.5 font-bold rounded-sm text-[10px] bg-blue-100 text-blue-800">
                                  {val !== undefined && val !== null ? String(val) : '-'}
                                </span>
                              </td>
                            );
                          }
                          if (isModelCol) {
                            return (
                              <td key={header} className="p-3 pl-4 first:pl-5 font-bold text-slate-900">
                                {val !== undefined && val !== null ? String(val) : '-'}
                              </td>
                            );
                          }
                          
                          const isNumeric = val !== null && val !== undefined && val !== '' && !isNaN(Number(val));
                          return (
                            <td key={header} className={`p-3 pl-4 first:pl-5 ${isNumeric ? 'text-left font-medium text-slate-600' : 'text-left text-slate-600'}`}>
                              {val !== undefined && val !== null ? String(val) : '-'}
                            </td>
                          );
                        })
                      ) : (
                        <>
                          <td className="p-3 pl-5">
                            <span className={`px-2 py-0.5 font-bold rounded-sm text-[10px] ${
                              row.category === 'H12' ? 'bg-amber-100 text-amber-800' :
                              row.category === 'H23' ? 'bg-blue-100 text-blue-800' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>
                              {row.category}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-900">{row.model}</td>
                          <td className="p-3 text-right text-slate-600">{row.holeAngle !== undefined ? `${row.holeAngle}°` : '-'}</td>
                          <td className="p-3 text-right text-slate-600 font-semibold">{row.firstStageInnerDia !== undefined ? row.firstStageInnerDia : '-'}</td>
                          <td className="p-3 text-right text-slate-400">{row.firstStageInnerDiaNegTol !== undefined ? row.firstStageInnerDiaNegTol : '-'}</td>
                          <td className="p-3 text-right text-slate-600 font-semibold">{row.holeChamfer !== undefined ? row.holeChamfer : '-'}</td>
                          <td className="p-3 text-right text-slate-400">{row.holeChamferNegTol !== undefined ? row.holeChamferNegTol : '-'}</td>
                          <td className="p-3 text-right text-slate-600">{row.holeThickness !== undefined ? row.holeThickness : '-'}</td>
                          <td className="p-3 text-right text-slate-600 font-semibold">{row.holeInnerDia !== undefined ? row.holeInnerDia : '-'}</td>
                          <td className="p-3 text-right text-slate-400">{row.holeInnerDiaNegTol !== undefined ? row.holeInnerDiaNegTol : '-'}</td>
                          <td className="p-3 text-right text-slate-600">{row.secondStageInnerDia !== undefined ? row.secondStageInnerDia : '-'}</td>
                          <td className="p-3 text-right text-slate-600">{row.firstStageDepth !== undefined ? row.firstStageDepth : '-'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                  {filteredDbFixtures.length === 0 && (
                    <tr>
                      <td colSpan={excelHeaders.length > 0 ? excelHeaders.length : 12} className="text-center py-12 text-slate-400 bg-slate-50/20">
                        查無任何符合過濾條件的治具！
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Explorer Footer details */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500 font-medium shrink-0">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                {importedFileName ? `已載入使用者上傳 Excel 檔案：${importedFileName}` : '尚未匯入治具資料庫，請於比對頁面上傳 Excel 檔案'}
              </span>
              <span>
                型號佔比：H12 (<strong>{fixtures.filter(f=>f.category==='H12').length}</strong>) | H23 (<strong>{fixtures.filter(f=>f.category==='H23').length}</strong>) | H32/H33 (<strong>{fixtures.filter(f=>f.category==='H32'||f.category==='H33').length}</strong>)
              </span>
            </div>
          </div>
        )}

        {activeMainTab === 'rules' && (
          <div className="flex-1 overflow-hidden min-h-[450px]">
            <RulesViewer />
          </div>
        )}
      </main>
    </div>
  );
}
