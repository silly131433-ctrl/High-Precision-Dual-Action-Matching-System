import React, { useState, useEffect } from 'react';
import { DimensionValue } from '../types';

interface DimensionInputGroupProps {
  label: string;
  dimValue: DimensionValue;
  onChange: (updated: DimensionValue) => void;
  description?: string;
  placeholder?: string;
}

export const DimensionInputGroup: React.FC<DimensionInputGroupProps> = ({
  label,
  dimValue,
  onChange,
  description,
  placeholder = ''
}) => {
  const [localVal, setLocalVal] = useState('');
  const [localPos, setLocalPos] = useState('');
  const [localNeg, setLocalNeg] = useState('');

  // Sync from props only when the value parsed from local state is different from props.
  // This allows typing partial entries like "0." or "0.0" without getting overwritten.
  useEffect(() => {
    const parsed = parseFloat(localVal);
    const current = isNaN(parsed) ? 0 : parsed;
    if (current !== dimValue.value || (dimValue.value === 0 && localVal === '')) {
      setLocalVal(dimValue.value === 0 || dimValue.value === undefined ? '' : String(dimValue.value));
    }
  }, [dimValue.value]);

  useEffect(() => {
    const parsed = parseFloat(localPos);
    const current = isNaN(parsed) ? 0 : parsed;
    if (current !== dimValue.posTol || (dimValue.posTol === 0 && localPos === '')) {
      setLocalPos(dimValue.posTol === 0 || dimValue.posTol === undefined ? '' : String(dimValue.posTol));
    }
  }, [dimValue.posTol]);

  useEffect(() => {
    const parsed = parseFloat(localNeg);
    const current = isNaN(parsed) ? 0 : parsed;
    if (current !== dimValue.negTol || (dimValue.negTol === 0 && localNeg === '')) {
      setLocalNeg(dimValue.negTol === 0 || dimValue.negTol === undefined ? '' : String(dimValue.negTol));
    }
  }, [dimValue.negTol]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only numeric, dot, and minus characters
    const sanitized = raw.replace(/[^0-9.-]/g, '');
    setLocalVal(sanitized);
    const val = parseFloat(sanitized);
    onChange({
      ...dimValue,
      value: isNaN(val) ? 0 : val,
    });
  };

  const handlePosTolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw.replace(/[^0-9.-]/g, '');
    setLocalPos(sanitized);
    const val = parseFloat(sanitized);
    onChange({
      ...dimValue,
      posTol: isNaN(val) ? 0 : val,
    });
  };

  const handleNegTolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw.replace(/[^0-9.-]/g, '');
    setLocalNeg(sanitized);
    const val = parseFloat(sanitized);
    onChange({
      ...dimValue,
      negTol: isNaN(val) ? 0 : val,
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 shadow-xs transition-all hover:border-slate-300">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          {label}
        </label>
        {description && (
          <span className="text-[10px] text-slate-500 font-mono bg-slate-200/50 px-1.5 py-0.5 rounded">
            {description}
          </span>
        )}
      </div>

      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Nominal Value */}
        <div className="col-span-6 relative">
          <input
            type="text"
            inputMode="decimal"
            value={localVal}
            onChange={handleValueChange}
            placeholder={placeholder}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-mono"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium uppercase pointer-events-none">
            公稱
          </div>
        </div>

        {/* Tolerances (+ / -) */}
        <div className="col-span-6 grid grid-cols-2 gap-1.5">
          {/* Positive Tolerance */}
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-bold pointer-events-none">+</span>
            <input
              type="text"
              inputMode="decimal"
              value={localPos}
              onChange={handlePosTolChange}
              placeholder=""
              className="w-full bg-emerald-50/30 border border-emerald-200 rounded-lg pl-5 pr-2 py-1.5 text-xs text-emerald-800 font-mono font-medium focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
            />
          </div>

          {/* Negative Tolerance */}
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-rose-600 font-bold pointer-events-none">-</span>
            <input
              type="text"
              inputMode="decimal"
              value={localNeg}
              onChange={handleNegTolChange}
              placeholder=""
              className="w-full bg-rose-50/30 border border-rose-200 rounded-lg pl-5 pr-2 py-1.5 text-xs text-rose-800 font-mono font-medium focus:ring-1 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DimensionInputGroup;
