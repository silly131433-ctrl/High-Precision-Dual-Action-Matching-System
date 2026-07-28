export type ProductType = 'needle' | 'necking'; // '成針' | '單縮口'

export interface DimensionValue {
  name: string;
  value: number;
  posTol: number; // 正公差
  negTol: number; // 負公差
}

export interface FormingNeedleInputs {
  baTpAngle: DimensionValue;      // BA管TP端縮口角度
  baBpAngle: DimensionValue;      // BA管BP端縮口角度
  bpRedDia: DimensionValue;       // BP側縮口直徑
  baLen: DimensionValue;          // BA管長度
  baOutDia: DimensionValue;       // BA管外直徑
  baInDia: DimensionValue;        // BA管內直徑
  tpSmallDia: DimensionValue;     // TP小徑直徑
  bpSmallDia: DimensionValue;     // BP小徑直徑
  tpProjLen: DimensionValue;      // TP凸出長
  totalLen: DimensionValue;       // 成針總長
}

export interface SingleNeckingInputs {
  baAngle: DimensionValue;        // BA管縮口角度
  baDia: DimensionValue;          // BA管直徑
  baLen: DimensionValue;          // BA管長度
  redDia: DimensionValue;         // 縮口直徑
  baInDia: DimensionValue;        // BA管內直徑 (補充輸入，用於BP模仁比對)
}

export interface FixtureData {
  id: string;
  category: 'H12' | 'H23' | 'H32' | 'H33'; // 治具分類
  model: string;                          // 治具型號 / 編號
  holeAngle?: number;                      // 功能孔角度 / 第一階孔角度
  firstStageInnerDia?: number;             // 第一階孔內徑
  firstStageInnerDiaNegTol?: number;       // 第一階孔內徑公差(-)
  holeChamfer?: number;                    // 功能孔倒角
  holeChamferNegTol?: number;              // 功能孔倒角公差(-)
  holeThickness?: number;                  // 功能孔厚度
  holeInnerDia?: number;                   // 功能孔內徑
  holeInnerDiaNegTol?: number;             // 功能孔內徑公差(-)
  secondStageInnerDia?: number;            // 第二階孔內徑
  firstStageDepth?: number;                // 第一階孔深度
  // Raw row data kept for reference or custom display
  raw?: Record<string, any>;
}

export interface MatchRuleResult {
  ruleName: string;
  formulaDesc: string;
  isPassed: boolean;
  actualDesc: string; // e.g. "第一階孔內徑 1.25, 限制 [1.21, 1.22]"
}

export interface MatchResult {
  fixture: FixtureData;
  isMatched: boolean;
  score: number; // Percentage or fraction of rules passed (e.g. 3/4)
  rules: MatchRuleResult[];
}
