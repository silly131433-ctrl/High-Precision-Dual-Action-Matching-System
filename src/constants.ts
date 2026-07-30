import { FormingNeedleInputs, SingleNeckingInputs, FixtureData } from './types';

// Default presets for Forming Needle (成針)
export const DEFAULT_NEEDLE_PRESETS: FormingNeedleInputs = {
  baTpAngle: { name: 'BA管TP端縮口角度', value: 30, posTol: 0.1, negTol: 0.1 },
  baBpAngle: { name: 'BA管BP端縮口角度', value: 45, posTol: 0.1, negTol: 0.1 },
  bpRedDia: { name: 'BP側縮口直徑', value: 0.75, posTol: 0.01, negTol: 0.01 },
  baLen: { name: 'BA管長度', value: 12.00, posTol: 0.05, negTol: 0.05 },
  baOutDia: { name: 'BA管外直徑', value: 3.00, posTol: 0.02, negTol: 0.01 },
  baInDia: { name: 'BA管內直徑', value: 2.00, posTol: 0.01, negTol: 0.01 },
  tpSmallDia: { name: 'TP小徑直徑', value: 1.20, posTol: 0.01, negTol: 0.01 },
  bpSmallDia: { name: 'BP小徑直徑', value: 0.80, posTol: 0.01, negTol: 0.01 },
  tpProjLen: { name: 'TP凸出長', value: 2.50, posTol: 0.02, negTol: 0.02 },
  totalLen: { name: '成針總長', value: 15.00, posTol: 0.1, negTol: 0.1 },
};

// Default presets for Single Necking (單縮口)
export const DEFAULT_NECKING_PRESETS: SingleNeckingInputs = {
  baAngle: { name: 'BA管縮口角度', value: 30, posTol: 0.1, negTol: 0.1 },
  baDia: { name: 'BA管直徑', value: 4.00, posTol: 0.02, negTol: 0.01 },
  baLen: { name: 'BA管長度', value: 15.00, posTol: 0.1, negTol: 0.1 },
  redDia: { name: '縮口直徑', value: 2.50, posTol: 0.05, negTol: 0.05 },
  baInDia: { name: 'BA管內直徑', value: 3.00, posTol: 0.02, negTol: 0.02 },
};

// High-quality empty fixtures - built-in demo database has been removed as requested.
export const DEMO_FIXTURES: FixtureData[] = [];

// Excel Header mappings to support friendly auto-matching of varied header names
export const EXCEL_COLUMN_MAP: Record<string, keyof Omit<FixtureData, 'id' | 'raw'>> = {
  '治具分類': 'category',
  'PD分類': 'category',
  '分類': 'category',
  '治具型號': 'model',
  '型號': 'model',
  '治具編號': 'model',
  '編號': 'model',
  '零件料號': 'model',
  '料號': 'model',
  
  '功能孔角度': 'holeAngle',
  '第一階孔角度': 'holeAngle',
  '角度': 'holeAngle',
  
  '第一階孔內徑': 'firstStageInnerDia',
  '第一階內徑': 'firstStageInnerDia',
  
  '第一階孔內徑公差': 'firstStageInnerDiaNegTol',
  '第一階孔內徑公差(-)': 'firstStageInnerDiaNegTol',
  '第一階孔內徑下公差': 'firstStageInnerDiaNegTol',
  '第一階內徑下公差': 'firstStageInnerDiaNegTol',
  
  '功能孔倒角': 'holeChamfer',
  '功能孔倒角(D)': 'holeChamfer',
  '倒角': 'holeChamfer',
  
  '功能孔倒角公差': 'holeChamferNegTol',
  '功能孔倒角公差(-)': 'holeChamferNegTol',
  '功能孔倒角下公差': 'holeChamferNegTol',
  '倒角下公差': 'holeChamferNegTol',
  
  '功能孔厚度': 'holeThickness',
  '厚度': 'holeThickness',
  '治具厚度': 'holeThickness',
  
  '功能孔內徑': 'holeInnerDia',
  '孔內徑': 'holeInnerDia',
  '內徑': 'holeInnerDia',
  
  '功能孔內徑公差': 'holeInnerDiaNegTol',
  '功能孔內徑公差(-)': 'holeInnerDiaNegTol',
  '功能孔內徑下公差': 'holeInnerDiaNegTol',
  '內徑下公差': 'holeInnerDiaNegTol',
  
  '第二階孔內徑': 'secondStageInnerDia',
  '第二階內徑': 'secondStageInnerDia',
  
  '第一階孔深度': 'firstStageDepth',
  '第一階深度': 'firstStageDepth',
  '孔深度': 'firstStageDepth',
};
