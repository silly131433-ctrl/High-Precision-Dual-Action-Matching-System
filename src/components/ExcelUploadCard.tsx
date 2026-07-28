import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { FixtureData } from '../types';
import { parseExcelFile, downloadSampleExcel } from '../utils/excelHelper';

interface ExcelUploadCardProps {
  onDataImported: (data: FixtureData[], fileName: string, headers: string[]) => void;
  onClearDatabase: () => void;
  importedFileName: string | null;
  totalFixtureCount: number;
}

export const ExcelUploadCard: React.FC<ExcelUploadCardProps> = ({
  onDataImported,
  onClearDatabase,
  importedFileName,
  totalFixtureCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('請上傳 .xlsx 或 .xls 格式的 Excel 檔案！');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const { data, columnsDetected } = parseExcelFile(buffer);
          
          if (data.length === 0) {
            setError('此 Excel 檔案中找不到有效的治具資料，或資料工作表為空！');
            return;
          }
          
          onDataImported(data, file.name, columnsDetected);
        } catch (err: any) {
          setError(`解析失敗：${err.message || '格式不符'}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('讀取檔案時發生錯誤！');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            治具型號資料庫 (EXCEL)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">匯入生產現有的治具庫，自動比對規格</p>
        </div>
        
        <button
          onClick={downloadSampleExcel}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          下載空白範本
        </button>
      </div>

      <div className="p-5">
        {/* Upload Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/30'
              : 'border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50/30'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".xlsx, .xls"
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
              isDragging ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <Upload className="w-5 h-5 animate-pulse" />
            </div>
            
            <p className="text-sm font-semibold text-slate-700">
              {isDragging ? '拖放檔案至此處' : '拖曳 Excel 檔案至此或點擊上傳'}
            </p>
            <p className="text-xs text-slate-400 mt-1">支援 .xlsx, .xls 試算表檔案</p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3.5 flex items-start gap-2 text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* DB Status */}
        <div className="mt-4 border border-slate-150 rounded-xl p-3.5 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {importedFileName ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
              <span className="text-xs font-semibold text-slate-700">
                {importedFileName ? `已載入：${importedFileName}` : '目前狀態：尚未匯入治具資料庫'}
              </span>
            </div>
            {importedFileName && (
              <button
                onClick={onClearDatabase}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                title="清除目前上傳的治具資料，重新匯入"
              >
                <RefreshCw className="w-3 h-3" />
                清除匯入資料
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200/60 text-xs">
            <div>
              <p className="text-slate-400 font-medium">總治具比對數量</p>
              <p className="text-base font-bold text-slate-800 font-mono mt-0.5">{totalFixtureCount} 筆</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">資料庫狀態</p>
              <p className="text-base font-bold text-slate-800 mt-0.5">
                {importedFileName ? (
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-normal text-xs">已載入外部資料庫</span>
                ) : (
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-normal text-xs">空資料庫 (待上傳)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ExcelUploadCard;
