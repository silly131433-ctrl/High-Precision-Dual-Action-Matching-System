import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Settings, 
  Filter, 
  AlertTriangle 
} from 'lucide-react';
import { MatchResult, ProductType } from '../types';

interface MatchResultTabsProps {
  resultsTP: MatchResult[];
  resultsBA: MatchResult[];
  resultsBP: MatchResult[];
  productType: ProductType;
}

export const MatchResultTabs: React.FC<MatchResultTabsProps> = ({
  resultsTP,
  resultsBA,
  resultsBP,
  productType,
}) => {
  const [activeTab, setActiveTab] = useState<'TP' | 'BA' | 'BP'>('TP');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMatched, setShowOnlyMatched] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  // Select active result set
  const getActiveResults = (): { results: MatchResult[]; title: string; category: string } => {
    switch (activeTab) {
      case 'TP':
        return { results: resultsTP, title: 'TP 模仁', category: 'H12、H13、H15' };
      case 'BA':
        return { results: resultsBA, title: 'BA 模仁', category: 'H23' };
      case 'BP':
        return { results: resultsBP, title: 'BP 模仁', category: 'H32、H33' };
    }
  };

  const { results, title, category } = getActiveResults();

  // Filter and sort results
  const filteredResults = results
    .filter((item) => {
      const matchQuery = item.fixture.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchOnlyMatched = !showOnlyMatched || item.isMatched;
      return matchQuery && matchOnlyMatched;
    })
    // Sort so matched ones come first, then sort by match score (highest to lowest)
    .sort((a, b) => {
      if (a.isMatched && !b.isMatched) return -1;
      if (!a.isMatched && b.isMatched) return 1;
      return b.score - a.score;
    });

  const exactMatchCount = results.filter(r => r.isMatched).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Tab Selectors */}
      <div className="bg-slate-50/50 border-b border-slate-150 p-2 flex gap-1.5 shrink-0">
        {(['TP', 'BA', 'BP'] as const).map((tab) => {
          const count = tab === 'TP' ? resultsTP.length : tab === 'BA' ? resultsBA.length : resultsBP.length;
          const matches = tab === 'TP' ? resultsTP.filter(r => r.isMatched).length : tab === 'BA' ? resultsBA.filter(r => r.isMatched).length : resultsBP.filter(r => r.isMatched).length;
          const isActive = activeTab === tab;
          
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setExpandedRow(null);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-white border border-slate-200 shadow-xs text-blue-600'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wide">
                {tab === 'TP' ? 'TP 模仁' : tab === 'BA' ? 'BA 模仁' : 'BP 模仁'}
              </span>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                分類 {tab === 'TP' ? 'H12/13/15' : tab === 'BA' ? 'H23' : 'H32/H33'}
              </span>
              <div className="flex gap-1.5 mt-1">
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  matches > 0 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-200 text-slate-600'
                }`}>
                  配對: {matches}
                </span>
                <span className="text-[9px] text-slate-400">總共: {count}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-150 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`搜尋 ${title} 型號...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-sm outline-hidden focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOnlyMatched}
              onChange={(e) => setShowOnlyMatched(e.target.checked)}
              className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4"
            />
            <span className="text-xs font-medium text-slate-600">僅顯示完全符合</span>
          </label>

          <span className="text-xs text-slate-500 font-medium font-mono">
            已篩選：<strong className="text-slate-800">{filteredResults.length}</strong> / {results.length} 筆
          </span>
        </div>
      </div>

      {/* Main Results Table Content */}
      <div className="flex-1 overflow-y-auto min-h-[300px]">
        {filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">找不到相符的治具模仁</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              {showOnlyMatched 
                ? '目前開啟了「僅顯示完全符合」篩選。您可以關閉該篩選，以查看那些僅差一些公差即可匹配的模仁型號。'
                : '請確認您輸入的角度、外徑與長度等尺寸資訊是否符合，或者匯入更多的治具型號進行比對。'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredResults.map((item) => {
              const { fixture, isMatched, score, rules } = item;
              const isExpanded = expandedRow === fixture.id;
              const passedRules = rules.filter(r => r.isPassed).length;
              const totalRules = rules.length;
              const percent = Math.round((passedRules / totalRules) * 100);

              return (
                <div 
                  key={fixture.id} 
                  className={`transition-colors ${
                    isMatched 
                      ? 'bg-emerald-50/15 hover:bg-emerald-50/30' 
                      : isExpanded
                        ? 'bg-slate-50/50'
                        : 'hover:bg-slate-50/30'
                  }`}
                >
                  {/* Summary Row */}
                  <div 
                    onClick={() => toggleExpand(fixture.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    {/* Model & Category */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isMatched ? (
                          <div className="text-emerald-600 bg-emerald-100 rounded-full p-1 flex items-center justify-center" title="完全符合規格要求">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : score > 0.5 ? (
                          <div className="text-amber-600 bg-amber-100 rounded-full p-1 flex items-center justify-center" title="部分符合（公差或厚度不符）">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="text-slate-400 bg-slate-100 rounded-full p-1 flex items-center justify-center" title="不符合規格要求">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-sans">
                            零件料號
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm tracking-tight">{fixture.model}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-600 font-mono">
                            {fixture.category}
                          </span>
                        </div>

                        {/* Visual parameters overview */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1.5 font-mono">
                          {fixture.holeAngle !== undefined && (
                            <span>角度: {fixture.holeAngle}°</span>
                          )}
                          {fixture.firstStageInnerDia !== undefined && (
                            <span>第一階內徑: {fixture.firstStageInnerDia} (下公差 {fixture.firstStageInnerDiaNegTol ?? 0})</span>
                          )}
                          {fixture.holeChamfer !== undefined && (
                            <span>倒角: {fixture.holeChamfer} (下公差 {fixture.holeChamferNegTol ?? 0})</span>
                          )}
                          {fixture.holeInnerDia !== undefined && (
                            <span>內徑: {fixture.holeInnerDia} (下公差 {fixture.holeInnerDiaNegTol ?? 0})</span>
                          )}
                          {fixture.holeThickness !== undefined && (
                            <span>厚度: {fixture.holeThickness}</span>
                          )}
                          {fixture.secondStageInnerDia !== undefined && (
                            <span>第二階內徑: {fixture.secondStageInnerDia}</span>
                          )}
                          {fixture.firstStageDepth !== undefined && (
                            <span>第一階深度: {fixture.firstStageDepth}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Matching stats & Expand button */}
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t border-slate-100 pt-2 md:border-none md:pt-0">
                      <div className="text-left md:text-right">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isMatched ? 'bg-emerald-500' : score > 0.5 ? 'bg-amber-500' : 'bg-slate-400'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold font-mono ${
                            isMatched ? 'text-emerald-700' : score > 0.5 ? 'text-amber-700' : 'text-slate-500'
                          }`}>
                            {passedRules}/{totalRules} 項符合 ({percent}%)
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isMatched ? '各項工藝條件全部合格' : '點擊展開查看未符合項目'}
                        </p>
                      </div>

                      <div className="text-slate-400 hover:text-slate-600 transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Diagnostic panel */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-150 bg-slate-50/50"
                      >
                        <div className="p-4 md:px-12 md:py-5 border-b border-slate-150">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            詳細匹配檢驗清單 (Diagnostic Checklist)
                          </h5>

                          <div className="space-y-2.5">
                            {rules.map((rule, idx) => (
                              <div 
                                key={idx} 
                                className={`border rounded-xl p-3 flex gap-3 items-start transition-all ${
                                  rule.isPassed 
                                    ? 'bg-emerald-50/30 border-emerald-100/80 text-emerald-900' 
                                    : 'bg-rose-50/30 border-rose-100/80 text-rose-900 shadow-2xs'
                                }`}
                              >
                                <div className="mt-0.5">
                                  {rule.isPassed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <span className="font-bold text-xs">
                                      {rule.ruleName}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      rule.isPassed 
                                        ? 'bg-emerald-100/80 text-emerald-800' 
                                        : 'bg-rose-100/80 text-rose-800 animate-pulse'
                                    }`}>
                                      {rule.isPassed ? '判定合格' : '判定不合格'}
                                    </span>
                                  </div>

                                  <div className="text-xs font-medium text-slate-500/90 mt-1 font-mono break-all leading-normal">
                                    公式規則：{rule.formulaDesc}
                                  </div>

                                  <div className={`text-xs font-bold mt-1.5 p-1.5 rounded-md font-mono ${
                                    rule.isPassed ? 'bg-emerald-100/30 text-emerald-800' : 'bg-rose-100/40 text-rose-800'
                                  }`}>
                                    檢驗實測：{rule.actualDesc}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Raw Data Reference */}
                          {fixture.raw && (
                            <div className="mt-4 pt-4 border-t border-slate-200/50">
                              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                                Excel 原始資料列參照
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
                                {Object.entries(fixture.raw).map(([key, val]) => (
                                  <div key={key} className="bg-white border border-slate-200 rounded p-1.5 text-center">
                                    <p className="text-[9px] text-slate-400 truncate" title={key}>{key}</p>
                                    <p className="text-xs font-semibold text-slate-700 mt-0.5 font-mono truncate">{val !== null && val !== '' ? String(val) : '-'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info bar */}
      <div className="bg-slate-50 border-t border-slate-150 px-5 py-3 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
        <span className="flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          比對演算法：標準公差嚴格篩選
        </span>
        <span>
          完全符合：<strong className="text-emerald-600 font-bold font-mono">{exactMatchCount}</strong> 筆
        </span>
      </div>
    </div>
  );
};
export default MatchResultTabs;
