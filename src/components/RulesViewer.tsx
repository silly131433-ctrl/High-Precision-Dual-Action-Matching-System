import React, { useState } from 'react';
import { HelpCircle, ChevronRight, BookOpen, Layers, Settings, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const RulesViewer: React.FC = () => {
  const [selectedCore, setSelectedCore] = useState<'TP' | 'BA' | 'BP'>('TP');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      {/* Title */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <div>
          <h3 className="font-bold text-slate-800 text-sm">比對運算公式與治具規則說明</h3>
          <p className="text-xs text-slate-500 mt-0.5">系統自動匹配模仁型號之精準工程計算公式</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Core Type List Side panel */}
        <div className="w-1/4 border-r border-slate-150 bg-slate-50/50 p-2.5 flex flex-col gap-1 shrink-0">
          <button
            onClick={() => setSelectedCore('TP')}
            className={`flex items-center justify-between text-xs font-semibold px-3 py-2.5 rounded-lg transition-all text-left ${
              selectedCore === 'TP'
                ? 'bg-blue-50 text-blue-700 shadow-3xs'
                : 'text-slate-600 hover:bg-slate-150'
            }`}
          >
            <span>TP 模仁 (H12/H13/H15)</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
          
          <button
            onClick={() => setSelectedCore('BA')}
            className={`flex items-center justify-between text-xs font-semibold px-3 py-2.5 rounded-lg transition-all text-left ${
              selectedCore === 'BA'
                ? 'bg-blue-50 text-blue-700 shadow-3xs'
                : 'text-slate-600 hover:bg-slate-150'
            }`}
          >
            <span>BA 模仁 (H23)</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
          
          <button
            onClick={() => setSelectedCore('BP')}
            className={`flex items-center justify-between text-xs font-semibold px-3 py-2.5 rounded-lg transition-all text-left ${
              selectedCore === 'BP'
                ? 'bg-blue-50 text-blue-700 shadow-3xs'
                : 'text-slate-600 hover:bg-slate-150'
            }`}
          >
            <span>BP 模仁 (H32/H33)</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <div className="mt-auto bg-blue-50/40 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-800 leading-normal">
            <div className="flex items-center gap-1 font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>工藝公差安全保障</span>
            </div>
            系統所採用的下限公式皆為確保模仁加工內徑在最差公差情況下，仍不可小於產品外徑上限，以避免模仁與管材產生干涉。
          </div>
        </div>

        {/* Selected Core Rules Details */}
        <div className="flex-1 p-5 overflow-y-auto">
          {selectedCore === 'TP' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">H12 / H13 / H15</span>
                <h4 className="font-bold text-slate-800 text-sm">TP 模仁對應條件</h4>
              </div>

              {/* Needle Mode Rules */}
              <div className="border border-emerald-100/80 bg-emerald-50/10 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-800">選擇【成針】模式時的匹配公式</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">1. 功能孔角度符合性</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                      治具功能孔角度 = BA管TP端縮口角度
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">2. 第一階孔內徑尺寸 & 下公差極限</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                      <p>• 尺寸區間：TP小徑直徑 + 0.01 &le; 第一階孔內徑 &le; TP小徑直徑 + 0.02</p>
                      <p>• 極限下限：(第一階孔內徑 - 第一階孔內徑公差(-)) 不可小於 TP小徑直徑 + 正公差</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">3. 功能孔倒角尺寸 & 下公差極限</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                      <p>• 尺寸區間：BA管外直徑 + 正公差 + 0.01 &le; 功能孔倒角 &le; BA管外直徑 + 正公差 + 0.02</p>
                      <p>• 極限下限：(功能孔倒角 - 功能孔倒角公差(-)) 不可小於 BA管外直徑 + 正公差</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">4. 功能孔厚度匹配</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                      TP凸出長 - 0.04 &le; 功能孔厚度 &le; TP凸出長 - 0.02
                    </div>
                  </div>
                </div>
              </div>

              {/* Necking Mode Rules */}
              <div className="border border-indigo-100 bg-indigo-50/10 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-indigo-800">選擇【單縮口】模式時的匹配公式</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">1. 功能孔角度符合性</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                      治具功能孔角度 = BA管縮口角度
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">2. 功能孔倒角尺寸 & 下公差極限</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                      <p>• 尺寸區間：BA管直徑 + 正公差 + 0.01 &le; 功能孔倒角 &le; BA管直徑 + 正公差 + 0.02</p>
                      <p>• 極限下限：(功能孔倒角 - 功能孔倒角公差(-)) 不可小於 BA管直徑 + 正公差</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">3. 第一階孔內徑尺寸</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                      第一階孔內徑 &lt; 縮口直徑
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCore === 'BA' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">H23</span>
                <h4 className="font-bold text-slate-800 text-sm">BA 模仁對應條件</h4>
              </div>

              {/* Needle Mode Rules */}
              <div className="border border-emerald-100 bg-emerald-50/10 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-800">選擇【成針】模式時的匹配公式</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">1. 功能孔內徑尺寸 & 下公差極限</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                      <p>• 尺寸區間：BA管外直徑 + 正公差 + 0.005 &le; 功能孔內徑 &le; BA管外直徑 + 正公差 + 0.01</p>
                      <p>• 極限下限：(功能孔內徑 - 功能孔內徑公差(-)) 不可小於 BA管外直徑 + 正公差</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">2. 功能孔厚度匹配</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                      BA管長度 - 0.7 - (BA管長度 * 0.1) &le; 功能孔厚度 &le; BA管長度 - 0.5 - (BA管長度 * 0.1)
                    </div>
                  </div>
                </div>
              </div>

              {/* Necking Mode Rules */}
              <div className="border border-indigo-100 bg-indigo-50/10 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-indigo-800">選擇【單縮口】模式時的匹配公式</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">1. 功能孔內徑尺寸 & 下公差極限</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                      <p>• 尺寸區間：BA管直徑 + 正公差 + 0.005 &le; 功能孔內徑 &le; BA管直徑 + 正公差 + 0.01</p>
                      <p>• 極限下限：(功能孔內徑 - 功能孔內徑公差(-)) 不可小於 BA管直徑 + 正公差</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">2. 功能孔厚度匹配</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                      BA管長度 - 0.7 &le; 功能孔厚度 &le; BA管長度 - 0.5
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCore === 'BP' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">H32 / H33</span>
                <h4 className="font-bold text-slate-800 text-sm">BP 模仁對應條件</h4>
              </div>

              {/* Needle Mode Rules */}
              <div className="border border-emerald-100 bg-emerald-50/10 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-800">選擇【成針】模式時的匹配公式</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">1. 第一階孔角度符合性</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                      第一階孔角度 = BA管BP端縮口角度
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">2. 第一階孔內徑尺寸 & 下公差極限</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                      <p>• 尺寸區間：BA管外直徑 + 正公差 &le; 第一階孔內徑 &lt; BA管外直徑 + 正公差 + 0.01</p>
                      <p>• 極限下限：(第一階孔內徑 - 第一階孔內徑公差(-)) 不可小於 BA管外直徑 + 正公差</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">3. 第二階孔內徑尺寸 & 下公差極限</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                      <p>• 尺寸區間：BP小徑直徑 + 0.02 &le; 第二階孔內徑 &le; BP小徑直徑 + 0.04</p>
                      <p>• 極限限制：(第二階孔內徑 - 第一階孔內徑公差(-)) 不可小於 BP側縮口直徑 + 正公差</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">4. 第一階孔深度比例</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 font-bold">
                      BA管長度 * 0.1 &le; 第一階孔深度 &le; BA管長度 * 0.2
                    </div>
                  </div>
                </div>
              </div>

              {/* Necking Mode Rules */}
              <div className="border border-indigo-100 bg-indigo-50/10 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-indigo-800">選擇【單縮口】模式時的匹配公式</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white border border-slate-150 rounded-lg p-3">
                    <p className="text-xs font-bold text-slate-800">1. 第一階孔內徑安全界限</p>
                    <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                      第一階孔內徑 &le; BA管內直徑 - 0.1
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default RulesViewer;
