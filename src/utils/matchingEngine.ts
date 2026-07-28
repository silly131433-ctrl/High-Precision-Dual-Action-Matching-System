import { 
  FixtureData, 
  FormingNeedleInputs, 
  SingleNeckingInputs, 
  MatchResult, 
  MatchRuleResult,
  ProductType
} from '../types';

/**
 * Match a TP Mold Core (H12)
 */
export function matchTPCore(
  fixture: FixtureData,
  productType: ProductType,
  needleInputs: FormingNeedleInputs,
  neckingInputs: SingleNeckingInputs
): MatchResult {
  const rules: MatchRuleResult[] = [];
  let isMatched = true;

  if (productType === 'needle') {
    const baTpAngle = needleInputs.baTpAngle.value;
    const tpSmallDia = needleInputs.tpSmallDia.value;
    const tpSmallDiaPosTol = needleInputs.tpSmallDia.posTol;
    const baOutDia = needleInputs.baOutDia.value;
    const baOutDiaPosTol = needleInputs.baOutDia.posTol;
    const tpProjLen = needleInputs.tpProjLen.value;

    // Rule 1: 功能孔角度 = BA管TP端縮口角度
    const angle = fixture.holeAngle ?? 0;
    const isAnglePassed = Math.abs(angle - baTpAngle) < 0.01;
    rules.push({
      ruleName: '功能孔角度',
      formulaDesc: `功能孔角度應等於 BA管TP端縮口角度 (${baTpAngle}°)`,
      isPassed: isAnglePassed,
      actualDesc: `實測角度為 ${angle}°。計算標準：|${angle}° - ${baTpAngle}°| = ${Math.abs(angle - baTpAngle).toFixed(2)}° (合格標準：差值 < 0.01°)，判定結果：${isAnglePassed ? '合格' : '不合格'}`
    });

    // Rule 2: TP小徑直徑+0.01 <= 第一階孔內徑 <= TP小徑直徑+0.02
    // AND (第一階孔內徑 - 第一階孔內徑公差(-)) 不可小於 TP小徑直徑+正公差
    const d1 = fixture.firstStageInnerDia ?? 0;
    const d1NegTol = fixture.firstStageInnerDiaNegTol ?? 0;
    const minD1 = tpSmallDia + 0.01;
    const maxD1 = tpSmallDia + 0.02;
    const limitD1 = tpSmallDia + tpSmallDiaPosTol;

    const isD1RangePassed = d1 >= minD1 - 0.0001 && d1 <= maxD1 + 0.0001;
    const actualLowerD1 = d1 - d1NegTol;
    const isD1TolPassed = actualLowerD1 >= limitD1 - 0.0001;

    rules.push({
      ruleName: '第一階孔內徑範圍 & 下限公差',
      formulaDesc: `${minD1.toFixed(3)} <= 第一階孔內徑 <= ${maxD1.toFixed(3)}，且實測下限值 (第一階孔內徑 ${d1.toFixed(3)} - 下公差 ${d1NegTol.toFixed(3)}) = ${actualLowerD1.toFixed(3)} 應 >= TP小徑直徑+正公差 (${limitD1.toFixed(3)})`,
      isPassed: isD1RangePassed && isD1TolPassed,
      actualDesc: `計算結果：(1) 實測內徑 ${d1.toFixed(3)} ${isD1RangePassed ? '符合' : '不符合'} 區間 [${minD1.toFixed(3)} ~ ${maxD1.toFixed(3)}]；(2) 下限值：${d1.toFixed(3)} - ${d1NegTol.toFixed(3)} = ${actualLowerD1.toFixed(3)} ${isD1TolPassed ? '>=' : '<'} 限制值 ${limitD1.toFixed(3)} (${isD1TolPassed ? '合格' : '不合格'})`
    });

    // Rule 3: BA管外直徑+正公差+0.01 <= 功能孔倒角 <= BA管外直徑+正公差+0.02
    // AND (功能孔倒角 - 功能孔倒角公差(-)) 不可小於 BA管外直徑+正公差
    const chamfer = fixture.holeChamfer ?? 0;
    const chamferNegTol = fixture.holeChamferNegTol ?? 0;
    const targetBase = baOutDia + baOutDiaPosTol;
    const minChamfer = targetBase + 0.01;
    const maxChamfer = targetBase + 0.02;

    const isChamferRangePassed = chamfer >= minChamfer - 0.0001 && chamfer <= maxChamfer + 0.0001;
    const actualLowerChamfer = chamfer - chamferNegTol;
    const isChamferTolPassed = actualLowerChamfer >= targetBase - 0.0001;

    rules.push({
      ruleName: '功能孔倒角範圍 & 下限公差',
      formulaDesc: `${minChamfer.toFixed(3)} <= 功能孔倒角 <= ${maxChamfer.toFixed(3)}，且實測下限值 (功能孔倒角 ${chamfer.toFixed(3)} - 倒角公差(-) ${chamferNegTol.toFixed(3)}) = ${actualLowerChamfer.toFixed(3)} 應 >= BA管外直徑+正公差 (${targetBase.toFixed(3)})`,
      isPassed: isChamferRangePassed && isChamferTolPassed,
      actualDesc: `計算結果：(1) 實測倒角 ${chamfer.toFixed(3)} ${isChamferRangePassed ? '符合' : '不符合'} 區間 [${minChamfer.toFixed(3)} ~ ${maxChamfer.toFixed(3)}]；(2) 下限值：${chamfer.toFixed(3)} - ${chamferNegTol.toFixed(3)} = ${actualLowerChamfer.toFixed(3)} ${isChamferTolPassed ? '>=' : '<'} 限制值 ${targetBase.toFixed(3)} (${isChamferTolPassed ? '合格' : '不合格'})`
    });

    // Rule 4: TP凸出長-0.04 <= 功能孔厚度 <= TP凸出長-0.02
    const thickness = fixture.holeThickness ?? 0;
    const minThick = tpProjLen - 0.04;
    const maxThick = tpProjLen - 0.02;
    const isThicknessPassed = thickness >= minThick - 0.0001 && thickness <= maxThick + 0.0001;

    rules.push({
      ruleName: '功能孔厚度',
      formulaDesc: `${minThick.toFixed(3)} <= 功能孔厚度 <= ${maxThick.toFixed(3)} (TP凸出長 ${tpProjLen.toFixed(3)} 減 0.04~0.02)`,
      isPassed: isThicknessPassed,
      actualDesc: `計算結果：實測厚度 ${thickness.toFixed(3)} ${isThicknessPassed ? '符合' : '不符合'} 區間 [${minThick.toFixed(3)} ~ ${maxThick.toFixed(3)}]`
    });

    isMatched = isAnglePassed && isD1RangePassed && isD1TolPassed && isChamferRangePassed && isChamferTolPassed && isThicknessPassed;

  } else {
    // Single Necking (單縮口)
    const baAngle = neckingInputs.baAngle.value;
    const baDia = neckingInputs.baDia.value;
    const baDiaPosTol = neckingInputs.baDia.posTol;
    const redDia = neckingInputs.redDia.value;

    // Rule 1: 功能孔角度 = BA管縮口角度
    const angle = fixture.holeAngle ?? 0;
    const isAnglePassed = Math.abs(angle - baAngle) < 0.01;
    rules.push({
      ruleName: '功能孔角度',
      formulaDesc: `功能孔角度應等於 BA管縮口角度 (${baAngle}°)`,
      isPassed: isAnglePassed,
      actualDesc: `實測角度為 ${angle}°。計算標準：|${angle}° - ${baAngle}°| = ${Math.abs(angle - baAngle).toFixed(2)}° (合格標準：差值 < 0.01°)，判定結果：${isAnglePassed ? '合格' : '不合格'}`
    });

    // Rule 2: BA管外直徑+正公差+0.01 <= 功能孔倒角 <= BA管外直徑+正公差+0.02
    // AND (功能孔倒角-功能孔倒角公差(-)) 不可小於 BA管外直徑+正公差
    const chamfer = fixture.holeChamfer ?? 0;
    const chamferNegTol = fixture.holeChamferNegTol ?? 0;
    const targetBase = baDia + baDiaPosTol;
    const minChamfer = targetBase + 0.01;
    const maxChamfer = targetBase + 0.02;

    const isChamferRangePassed = chamfer >= minChamfer - 0.0001 && chamfer <= maxChamfer + 0.0001;
    const actualLowerChamfer = chamfer - chamferNegTol;
    const isChamferTolPassed = actualLowerChamfer >= targetBase - 0.0001;

    rules.push({
      ruleName: '功能孔倒角範圍 & 下限公差',
      formulaDesc: `${minChamfer.toFixed(3)} <= 功能孔倒角 <= ${maxChamfer.toFixed(3)}，且實測下限值 (功能孔倒角 ${chamfer.toFixed(3)} - 倒角公差(-) ${chamferNegTol.toFixed(3)}) = ${actualLowerChamfer.toFixed(3)} 應 >= BA管直徑+正公差 (${targetBase.toFixed(3)})`,
      isPassed: isChamferRangePassed && isChamferTolPassed,
      actualDesc: `計算結果：(1) 實測倒角 ${chamfer.toFixed(3)} ${isChamferRangePassed ? '符合' : '不符合'} 區間 [${minChamfer.toFixed(3)} ~ ${maxChamfer.toFixed(3)}]；(2) 下限值：${chamfer.toFixed(3)} - ${chamferNegTol.toFixed(3)} = ${actualLowerChamfer.toFixed(3)} ${isChamferTolPassed ? '>=' : '<'} 限制值 ${targetBase.toFixed(3)} (${isChamferTolPassed ? '合格' : '不合格'})`
    });

    // Rule 3: 第一階孔內徑 < 縮口直徑
    const d1 = fixture.firstStageInnerDia ?? 0;
    const isD1Passed = d1 < redDia;
    rules.push({
      ruleName: '第一階孔內徑限制',
      formulaDesc: `第一階孔內徑 應小於 縮口直徑 (${redDia.toFixed(3)})`,
      isPassed: isD1Passed,
      actualDesc: `計算結果：實測內徑 ${d1.toFixed(3)} ${isD1Passed ? '<' : '>='} 縮口直徑 ${redDia.toFixed(3)} (${isD1Passed ? '合格' : '不合格'})`
    });

    isMatched = isAnglePassed && isChamferRangePassed && isChamferTolPassed && isD1Passed;
  }

  const passedCount = rules.filter(r => r.isPassed).length;
  const score = rules.length > 0 ? passedCount / rules.length : 0;

  return { fixture, isMatched, score, rules };
}

/**
 * Match a BA Mold Core (H23)
 */
export function matchBACore(
  fixture: FixtureData,
  productType: ProductType,
  needleInputs: FormingNeedleInputs,
  neckingInputs: SingleNeckingInputs
): MatchResult {
  const rules: MatchRuleResult[] = [];
  let isMatched = true;

  if (productType === 'needle') {
    const baOutDia = needleInputs.baOutDia.value;
    const baOutDiaPosTol = needleInputs.baOutDia.posTol;
    const baLen = needleInputs.baLen.value;

    // Rule 1: BA管外直徑+正公差+0.005 <= 功能孔內徑 <= BA管外直徑+正公差+0.01
    // AND (功能孔內徑 - 功能孔內徑公差(-)) 不可小於 BA管外直徑+正公差
    const dInner = fixture.holeInnerDia ?? 0;
    const dInnerNegTol = fixture.holeInnerDiaNegTol ?? 0;
    const targetBase = baOutDia + baOutDiaPosTol;
    const minInner = targetBase + 0.005;
    const maxInner = targetBase + 0.01;

    const isInnerRangePassed = dInner >= minInner - 0.0001 && dInner <= maxInner + 0.0001;
    const actualLowerInner = dInner - dInnerNegTol;
    const isInnerTolPassed = actualLowerInner >= targetBase - 0.0001;

    rules.push({
      ruleName: '功能孔內徑範圍 & 下限公差',
      formulaDesc: `${minInner.toFixed(4)} <= 功能孔內徑 <= ${maxInner.toFixed(4)}，且實測下限值 (功能孔內徑 ${dInner.toFixed(4)} - 內徑公差(-) ${dInnerNegTol.toFixed(4)}) = ${actualLowerInner.toFixed(4)} 應 >= BA管外直徑+正公差 (${targetBase.toFixed(4)})`,
      isPassed: isInnerRangePassed && isInnerTolPassed,
      actualDesc: `計算結果：(1) 實測內徑 ${dInner.toFixed(4)} ${isInnerRangePassed ? '符合' : '不符合'} 區間 [${minInner.toFixed(4)} ~ ${maxInner.toFixed(4)}]；(2) 下限值：${dInner.toFixed(4)} - ${dInnerNegTol.toFixed(4)} = ${actualLowerInner.toFixed(4)} ${isInnerTolPassed ? '>=' : '<'} 限制值 ${targetBase.toFixed(4)} (${isInnerTolPassed ? '合格' : '不合格'})`
    });

    // Rule 2: BA管長度-0.7-(BA管長度*0.1) <= 功能孔厚度 <= BA管長度-0.5-(BA管長度*0.1)
    const thickness = fixture.holeThickness ?? 0;
    const term = baLen * 0.1;
    const minThick = baLen - 0.7 - term;
    const maxThick = baLen - 0.5 - term;
    const isThicknessPassed = thickness >= minThick - 0.0001 && thickness <= maxThick + 0.0001;

    rules.push({
      ruleName: '功能孔厚度',
      formulaDesc: `${minThick.toFixed(3)} <= 功能孔厚度 <= ${maxThick.toFixed(3)} (BA管長度 ${baLen.toFixed(3)} - 0.7/0.5 - BA管長度*10% (${term.toFixed(3)}))`,
      isPassed: isThicknessPassed,
      actualDesc: `計算結果：實測厚度 ${thickness.toFixed(3)} ${isThicknessPassed ? '符合' : '不符合'} 區間 [${minThick.toFixed(3)} ~ ${maxThick.toFixed(3)}]`
    });

    isMatched = isInnerRangePassed && isInnerTolPassed && isThicknessPassed;

  } else {
    // Single Necking (單縮口)
    const baDia = neckingInputs.baDia.value;
    const baDiaPosTol = neckingInputs.baDia.posTol;
    const baLen = neckingInputs.baLen.value;

    // Rule 1: BA管外直徑+正公差+0.005 <= 功能孔內徑 <= BA管外直徑+正公差+0.01
    // AND (功能孔內徑-功能孔內徑公差(-)) 不可小於 BA管外直徑+正公差
    const dInner = fixture.holeInnerDia ?? 0;
    const dInnerNegTol = fixture.holeInnerDiaNegTol ?? 0;
    const targetBase = baDia + baDiaPosTol;
    const minInner = targetBase + 0.005;
    const maxInner = targetBase + 0.01;

    const isInnerRangePassed = dInner >= minInner - 0.0001 && dInner <= maxInner + 0.0001;
    const actualLowerInner = dInner - dInnerNegTol;
    const isInnerTolPassed = actualLowerInner >= targetBase - 0.0001;

    rules.push({
      ruleName: '功能孔內徑範圍 & 下限公差',
      formulaDesc: `${minInner.toFixed(4)} <= 功能孔內徑 <= ${maxInner.toFixed(4)}，且實測下限值 (功能孔內徑 ${dInner.toFixed(4)} - 內徑公差(-) ${dInnerNegTol.toFixed(4)}) = ${actualLowerInner.toFixed(4)} 應 >= BA管直徑+正公差 (${targetBase.toFixed(4)})`,
      isPassed: isInnerRangePassed && isInnerTolPassed,
      actualDesc: `計算結果：(1) 實測內徑 ${dInner.toFixed(4)} ${isInnerRangePassed ? '符合' : '不符合'} 區間 [${minInner.toFixed(4)} ~ ${maxInner.toFixed(4)}]；(2) 下限值：${dInner.toFixed(4)} - ${dInnerNegTol.toFixed(4)} = ${actualLowerInner.toFixed(4)} ${isInnerTolPassed ? '>=' : '<'} 限制值 ${targetBase.toFixed(4)} (${isInnerTolPassed ? '合格' : '不合格'})`
    });

    // Rule 2: BA管長度-0.7 <= 功能孔厚度 <= BA管長度-0.5
    const thickness = fixture.holeThickness ?? 0;
    const minThick = baLen - 0.7;
    const maxThick = baLen - 0.5;
    const isThicknessPassed = thickness >= minThick - 0.0001 && thickness <= maxThick + 0.0001;

    rules.push({
      ruleName: '功能孔厚度',
      formulaDesc: `${minThick.toFixed(3)} <= 功能孔厚度 <= ${maxThick.toFixed(3)} (BA管長度 ${baLen.toFixed(3)} - 0.7 ~ 0.5)`,
      isPassed: isThicknessPassed,
      actualDesc: `計算結果：實測厚度 ${thickness.toFixed(3)} ${isThicknessPassed ? '符合' : '不符合'} 區間 [${minThick.toFixed(3)} ~ ${maxThick.toFixed(3)}]`
    });

    isMatched = isInnerRangePassed && isInnerTolPassed && isThicknessPassed;
  }

  const passedCount = rules.filter(r => r.isPassed).length;
  const score = rules.length > 0 ? passedCount / rules.length : 0;

  return { fixture, isMatched, score, rules };
}

/**
 * Match a BP Mold Core (H32, H33)
 */
export function matchBPCore(
  fixture: FixtureData,
  productType: ProductType,
  needleInputs: FormingNeedleInputs,
  neckingInputs: SingleNeckingInputs
): MatchResult {
  const rules: MatchRuleResult[] = [];
  let isMatched = true;

  if (productType === 'needle') {
    const baBpAngle = needleInputs.baBpAngle.value;
    const baOutDia = needleInputs.baOutDia.value;
    const baOutDiaPosTol = needleInputs.baOutDia.posTol;
    const bpSmallDia = needleInputs.bpSmallDia.value;
    const bpRedDia = needleInputs.bpRedDia.value;
    const bpRedDiaPosTol = needleInputs.bpRedDia.posTol;
    const baLen = needleInputs.baLen.value;

    // Rule 1: 第一階孔角度 = BA管BP端縮口角度
    const angle = fixture.holeAngle ?? 0;
    const isAnglePassed = Math.abs(angle - baBpAngle) < 0.01;
    rules.push({
      ruleName: '第一階孔角度',
      formulaDesc: `第一階孔角度應等於 BA管BP端縮口角度 (${baBpAngle}°)`,
      isPassed: isAnglePassed,
      actualDesc: `實測角度為 ${angle}°。計算標準：|${angle}° - ${baBpAngle}°| = ${Math.abs(angle - baBpAngle).toFixed(2)}° (合格標準：差值 < 0.01°)，判定結果：${isAnglePassed ? '合格' : '不合格'}`
    });

    // Rule 2: BA管外直徑+正公差 <= 第一階孔內徑 < BA管外直徑+正公差+0.01
    // AND (第一階孔內徑 - 第一階孔內徑公差(-)) 不可小於 BA管外直徑+正公差
    const d1 = fixture.firstStageInnerDia ?? 0;
    const d1NegTol = fixture.firstStageInnerDiaNegTol ?? 0;
    const targetBase = baOutDia + baOutDiaPosTol;
    const minD1 = targetBase;
    const maxD1 = targetBase + 0.01;

    const isD1RangePassed = d1 >= minD1 - 0.0001 && d1 < maxD1 - 0.0001;
    const actualLowerD1 = d1 - d1NegTol;
    const isD1TolPassed = actualLowerD1 >= targetBase - 0.0001;

    rules.push({
      ruleName: '第一階孔內徑範圍 & 下限公差',
      formulaDesc: `${minD1.toFixed(3)} <= 第一階孔內徑 < ${maxD1.toFixed(3)}，且實測下限值 (第一階孔內徑 ${d1.toFixed(3)} - 內徑公差(-) ${d1NegTol.toFixed(3)}) = ${actualLowerD1.toFixed(3)} 應 >= BA管直徑+正公差 (${targetBase.toFixed(3)})`,
      isPassed: isD1RangePassed && isD1TolPassed,
      actualDesc: `計算結果：(1) 實測內徑 ${d1.toFixed(3)} ${isD1RangePassed ? '符合' : '不符合'} 區間 [${minD1.toFixed(3)} ~ ${maxD1.toFixed(3)})；(2) 下限值：${d1.toFixed(3)} - ${d1NegTol.toFixed(3)} = ${actualLowerD1.toFixed(3)} ${isD1TolPassed ? '>=' : '<'} 限制值 ${targetBase.toFixed(3)} (${isD1TolPassed ? '合格' : '不合格'})`
    });

    // Rule 3: BP小徑直徑+0.02 <= 第二階孔內徑 <= BP小徑直徑+0.04
    // AND (第二階孔內徑 - 第一階孔內徑公差(-)) 不可小於 BP側縮口直徑+正公差
    const d2 = fixture.secondStageInnerDia ?? 0;
    const minD2 = bpSmallDia + 0.02;
    const maxD2 = bpSmallDia + 0.04;
    const limitD2 = bpRedDia + bpRedDiaPosTol;

    const isD2RangePassed = d2 >= minD2 - 0.0001 && d2 <= maxD2 + 0.0001;
    const actualLowerD2 = d2 - d1NegTol; // Formula explicitly specifies "第一階孔內徑公差(-)"
    const isD2TolPassed = actualLowerD2 >= limitD2 - 0.0001;

    rules.push({
      ruleName: '第二階孔內徑範圍 & 限制條件',
      formulaDesc: `${minD2.toFixed(3)} <= 第二階孔內徑 <= ${maxD2.toFixed(3)}，且實測限制值 (第二階孔內徑 ${d2.toFixed(3)} - 第一階內徑公差(-) ${d1NegTol.toFixed(3)}) = ${actualLowerD2.toFixed(3)} 應 >= BP側縮口直徑+正公差 (${limitD2.toFixed(3)})`,
      isPassed: isD2RangePassed && isD2TolPassed,
      actualDesc: `計算結果：(1) 實測第二階內徑 ${d2.toFixed(3)} ${isD2RangePassed ? '符合' : '不符合'} 區間 [${minD2.toFixed(3)} ~ ${maxD2.toFixed(3)}]；(2) 限制值：${d2.toFixed(3)} - ${d1NegTol.toFixed(3)} = ${actualLowerD2.toFixed(3)} ${isD2TolPassed ? '>=' : '<'} 限制值 ${limitD2.toFixed(3)} (${isD2TolPassed ? '合格' : '不合格'})`
    });

    // Rule 4: BA管長度*0.1 <= 第一階孔深度 <= BA管長度*0.2
    const depth = fixture.firstStageDepth ?? 0;
    const minDepth = baLen * 0.1;
    const maxDepth = baLen * 0.2;
    const isDepthPassed = depth >= minDepth - 0.0001 && depth <= maxDepth + 0.0001;

    rules.push({
      ruleName: '第一階孔深度',
      formulaDesc: `${minDepth.toFixed(3)} <= 第一階孔深度 <= ${maxDepth.toFixed(3)} (BA管長度 ${baLen.toFixed(3)} * 0.1 ~ 0.2)`,
      isPassed: isDepthPassed,
      actualDesc: `計算結果：實測深度 ${depth.toFixed(3)} ${isDepthPassed ? '符合' : '不符合'} 區間 [${minDepth.toFixed(3)} ~ ${maxDepth.toFixed(3)}]`
    });

    isMatched = isAnglePassed && isD1RangePassed && isD1TolPassed && isD2RangePassed && isD2TolPassed && isDepthPassed;

  } else {
    // Single Necking (單縮口)
    const baInDia = neckingInputs.baInDia.value;

    // Rule 1: 第一階孔內徑 <= BA管內直徑 - 0.1，如第一階孔內徑讀取為零則使用功能孔內徑
    const d1Raw = fixture.firstStageInnerDia ?? 0;
    const dInner = fixture.holeInnerDia ?? 0;
    const d1 = d1Raw === 0 ? dInner : d1Raw;
    const isUsingHoleInner = d1Raw === 0;
    const fieldName = isUsingHoleInner ? '功能孔內徑' : '第一階孔內徑';

    const maxAllowedD1 = baInDia - 0.1;
    const isD1Passed = d1 <= maxAllowedD1 + 0.0001;

    rules.push({
      ruleName: isUsingHoleInner ? '功能孔內徑限制' : '第一階孔內徑限制',
      formulaDesc: `${fieldName} 應 <= BA管內直徑 (${baInDia.toFixed(3)}) - 0.1 = ${maxAllowedD1.toFixed(3)}${isUsingHoleInner ? ' (因第一階孔內徑為0/未讀，改用功能孔內徑)' : ''}`,
      isPassed: isD1Passed,
      actualDesc: `計算結果：實測${fieldName} ${d1.toFixed(3)} ${isD1Passed ? '<=' : '>'} 限制上限 ${maxAllowedD1.toFixed(3)} (${isD1Passed ? '合格' : '不合格'})`
    });

    isMatched = isD1Passed;
  }

  const passedCount = rules.filter(r => r.isPassed).length;
  const score = rules.length > 0 ? passedCount / rules.length : 0;

  return { fixture, isMatched, score, rules };
}
