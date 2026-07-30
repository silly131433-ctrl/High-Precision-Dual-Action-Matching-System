import * as XLSX from 'xlsx';
import { FixtureData } from '../types';
import { EXCEL_COLUMN_MAP } from '../constants';

/**
 * Normalizes string keys to find matching column mappings
 */
function findMappedField(header: string): string | null {
  const cleanHeader = header.trim().replace(/\s+/g, '');
  
  // Direct match
  if (EXCEL_COLUMN_MAP[cleanHeader]) {
    return EXCEL_COLUMN_MAP[cleanHeader];
  }
  
  // Check if header is a tolerance header
  const isToleranceHeader = 
    cleanHeader.includes('公差') || 
    cleanHeader.includes('下限') || 
    cleanHeader.includes('(-)') || 
    cleanHeader.includes('neg') || 
    cleanHeader.includes('tol');
    
  // Sort entries by key length in descending order to match most specific keywords first
  const sortedEntries = Object.entries(EXCEL_COLUMN_MAP).sort((a, b) => b[0].length - a[0].length);
  
  // List of geometric and specific measurement terms to avoid false-positive fuzzy matches
  const geometricTerms = ['同心度', '位置度', '平面度', '粗糙度', '真圓度', '平行度', '垂直度', '對稱度', '定位', '配合'];

  for (const [key, field] of sortedEntries) {
    const isFieldTolerance = field.endsWith('NegTol');
    
    // Strict separation: tolerance header can only match tolerance field, and nominal header can only match nominal field
    if (isToleranceHeader !== isFieldTolerance) {
      continue;
    }
    
    // Strict geometric term matching: if the column header contains a geometric/specific term (e.g. 同心度, 位置度) 
    // but the key we are testing does NOT contain that term, we must reject the match to prevent false positives.
    const hasGeometricTermConflict = geometricTerms.some(term => 
      cleanHeader.includes(term) && !key.includes(term)
    );
    if (hasGeometricTermConflict) {
      continue;
    }
    
    if (cleanHeader.includes(key) || key.includes(cleanHeader)) {
      return field;
    }
  }
  
  return null;
}

/**
 * Parses an Excel file (ArrayBuffer) and returns structured FixtureData list.
 */
export function parseExcelFile(arrayBuffer: ArrayBuffer): {
  data: FixtureData[];
  sheets: string[];
  columnsDetected: string[];
} {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheets = workbook.SheetNames;
  
  if (sheets.length === 0) {
    throw new Error('Excel 檔案中找不到任何工作表');
  }
  
  // Parse the first sheet by default
  const firstSheetName = sheets[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });
  
  if (rawRows.length === 0) {
    return { data: [], sheets, columnsDetected: [] };
  }
  
  // Detect headers from first row keys
  const headers = Object.keys(rawRows[0]);
  
  const parsedData: FixtureData[] = rawRows.map((row, index) => {
    const fixture: Partial<FixtureData> = {
      id: `EXCEL-${index + 1}-${Math.floor(Math.random() * 1000)}`,
      raw: row
    };
    
    // Default value parsing
    Object.entries(row).forEach(([colHeader, colVal]) => {
      const fieldName = findMappedField(colHeader);
      if (fieldName) {
        let val: any = undefined;
        
        // Parse numerical values
        if (fieldName !== 'category' && fieldName !== 'model') {
          if (colVal !== null && colVal !== undefined && String(colVal).trim() !== '') {
            let strVal = String(colVal).trim();
            // Convert full-width numbers to half-width numbers
            strVal = strVal.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
            // Extract the first matching float pattern (e.g., "60°" -> "60", "3.035 mm" -> "3.035")
            const match = strVal.match(/-?\d+(\.\d+)?/);
            if (match) {
              val = parseFloat(match[0]);
            } else {
              val = parseFloat(strVal);
            }
            if (isNaN(val)) val = undefined;
          }
        } else if (fieldName === 'category') {
          if (colVal !== null && colVal !== undefined && String(colVal).trim() !== '') {
            // Standardize category strings (e.g. "H12", "H13", "H15", "H23", "H32", "H33")
            let cat = String(colVal).trim().toUpperCase();
            if (cat.includes('12')) cat = 'H12';
            else if (cat.includes('13')) cat = 'H13';
            else if (cat.includes('15')) cat = 'H15';
            else if (cat.includes('23')) cat = 'H23';
            else if (cat.includes('32')) cat = 'H32';
            else if (cat.includes('33')) cat = 'H33';
            val = cat;
          }
        } else if (fieldName === 'model') {
          if (colVal !== null && colVal !== undefined && String(colVal).trim() !== '') {
            val = String(colVal).trim();
          }
        }
        
        // Assign to fixture - ONLY assign if value is defined and non-empty to prevent overwriting
        if (val !== undefined && val !== null && val !== '') {
          (fixture as any)[fieldName] = val;
        }
      }
    });
    
    // Ensure basic defaults
    if (!fixture.category) {
      fixture.category = 'H12'; // Fallback
    }
    if (!fixture.model) {
      fixture.model = `模仁-${index + 1}`;
    }
    
    return fixture as FixtureData;
  });
  
  return {
    data: parsedData,
    sheets,
    columnsDetected: headers
  };
}

/**
 * Generates a correctly-formatted sample Excel file and triggers download
 */
export function downloadSampleExcel() {
  const sampleHeaders = [
    '治具分類 (必填)', 
    '治具型號 (必填)', 
    '功能孔角度 (H12/H32/H33)', 
    '第一階孔內徑 (H12/H32/H33)', 
    '第一階孔內徑公差(-) (H12/H32/H33)',
    '功能孔倒角 (H12)', 
    '功能孔倒角公差(-) (H12)', 
    '功能孔厚度 (H12/H23)', 
    '功能孔內徑 (H23)', 
    '功能孔內徑公差(-) (H23)', 
    '第二階孔內徑 (H32/H33)', 
    '第一階孔深度 (H32/H33)'
  ];

  const sampleRows = [
    // H12 Examples
    {
      '治具分類 (必填)': 'H12',
      '治具型號 (必填)': 'TP-H12-DEMO-01',
      '功能孔角度 (H12/H32/H33)': 30,
      '第一階孔內徑 (H12/H32/H33)': 1.215,
      '第一階孔內徑公差(-) (H12/H32/H33)': 0.003,
      '功能孔倒角 (H12)': 3.035,
      '功能孔倒角公差(-) (H12)': 0.005,
      '功能孔厚度 (H12/H23)': 2.47,
      '功能孔內徑 (H23)': '',
      '功能孔內徑公差(-) (H23)': '',
      '第二階孔內徑 (H32/H33)': '',
      '第一階孔深度 (H32/H33)': ''
    },
    {
      '治具分類 (必填)': 'H12',
      '治具型號 (必填)': 'TP-H12-NECK-DEMO',
      '功能孔角度 (H12/H32/H33)': 30,
      '第一階孔內徑 (H12/H32/H33)': 2.20,
      '第一階孔內徑公差(-) (H12/H32/H33)': 0.005,
      '功能孔倒角 (H12)': 4.035,
      '功能孔倒角公差(-) (H12)': 0.005,
      '功能孔厚度 (H12/H23)': 3.50,
      '功能孔內徑 (H23)': '',
      '功能孔內徑公差(-) (H23)': '',
      '第二階孔內徑 (H32/H33)': '',
      '第一階孔深度 (H32/H33)': ''
    },
    // H23 Examples
    {
      '治具分類 (必填)': 'H23',
      '治具型號 (必填)': 'BA-H23-DEMO-01',
      '功能孔角度 (H12/H32/H33)': '',
      '第一階孔內徑 (H12/H32/H33)': '',
      '第一階孔內徑公差(-) (H12/H32/H33)': '',
      '功能孔倒角 (H12)': '',
      '功能孔倒角公差(-) (H12)': '',
      '功能孔厚度 (H12/H23)': 10.20,
      '功能孔內徑 (H23)': 3.028,
      '功能孔內徑公差(-) (H23)': 0.005,
      '第二階孔內徑 (H32/H33)': '',
      '第一階孔深度 (H32/H33)': ''
    },
    // H32 Examples
    {
      '治具分類 (必填)': 'H32',
      '治具型號 (必填)': 'BP-H32-DEMO-01',
      '功能孔角度 (H12/H32/H33)': 45,
      '第一階孔內徑 (H12/H32/H33)': 3.025,
      '第一階孔內徑公差(-) (H12/H32/H33)': 0.003,
      '功能孔倒角 (H12)': '',
      '功能孔倒角公差(-) (H12)': '',
      '功能孔厚度 (H12/H23)': '',
      '功能孔內徑 (H23)': '',
      '功能孔內徑公差(-) (H23)': '',
      '第二階孔內徑 (H32/H33)': 0.83,
      '第一階孔深度 (H32/H33)': 1.80
    },
    // H33 Examples
    {
      '治具分類 (必填)': 'H33',
      '治具型號 (必填)': 'BP-H33-DEMO-01',
      '功能孔角度 (H12/H32/H33)': 45,
      '第一階孔內徑 (H12/H32/H33)': 3.021,
      '第一階孔內徑公差(-) (H12/H32/H33)': 0.001,
      '功能孔倒角 (H12)': '',
      '功能孔倒角公差(-) (H12)': '',
      '功能孔厚度 (H12/H23)': '',
      '功能孔內徑 (H23)': '',
      '功能孔內徑公差(-) (H23)': '',
      '第二階孔內徑 (H32/H33)': 0.82,
      '第一階孔深度 (H32/H33)': 1.50
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: sampleHeaders });
  
  // Set column widths to look ultra-professional
  worksheet['!cols'] = [
    { wch: 15 }, // category
    { wch: 25 }, // model
    { wch: 28 }, // holeAngle
    { wch: 28 }, // firstStageInnerDia
    { wch: 34 }, // firstStageInnerDiaNegTol
    { wch: 22 }, // holeChamfer
    { wch: 25 }, // holeChamferNegTol
    { wch: 22 }, // holeThickness
    { wch: 20 }, // holeInnerDia
    { wch: 24 }, // holeInnerDiaNegTol
    { wch: 25 }, // secondStageInnerDia
    { wch: 25 }  // firstStageDepth
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '治具資料庫範本');
  
  // Generate download
  XLSX.writeFile(workbook, '生產模仁治具資料庫範本.xlsx');
}
