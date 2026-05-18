
import React, { useState } from 'react';
import { AnalysisResult, Patient, AlertLevel } from '../types';
import { FileText, Image as ImageIcon, ClipboardList, CheckSquare, Download, Copy, Check, Printer } from 'lucide-react';

interface SmartOutputProps {
  analysis: AnalysisResult | null;
  patient: Patient | null;
}

function downloadCSV(analysis: AnalysisResult, patient: Patient) {
  const today = new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', '');
  const todayISO = new Date().toISOString().split('T')[0];

  const medList = analysis.medications
    .map(m => `${m.name}(${m.ingredient}, ${m.dosage}, ${m.frequency})`)
    .join('; ');

  const duplicates = analysis.alerts.filter(a => a.reason.includes('중복') || a.title.includes('중복'));
  const adrAlerts = analysis.alerts.filter(a => a.title.includes('부작용') || a.title.includes('이상반응') || a.title.includes('이상'));
  const interactions = analysis.alerts.filter(a => a.title.includes('상호작용') || a.reason.includes('상호작용'));
  const redAlerts = analysis.alerts.filter(a => a.level === AlertLevel.RED);

  const highRiskCategories: string[] = [];
  const medNames = analysis.medications.map(m => (m.name + m.ingredient + (m.category || '')).toLowerCase());
  if (medNames.some(n => n.includes('와파린') || n.includes('warfarin') || n.includes('아픽사반') || n.includes('리바록사반'))) highRiskCategories.push('항응고제');
  if (medNames.some(n => n.includes('이부프로펜') || n.includes('naproxen') || n.includes('diclofenac') || n.includes('nsaid'))) highRiskCategories.push('NSAIDs');
  if (medNames.some(n => n.includes('인슐린') || n.includes('insulin'))) highRiskCategories.push('인슐린');
  if (medNames.some(n => n.includes('흡입') || n.includes('inhaler') || n.includes('부데소니'))) highRiskCategories.push('흡입기');
  if (medNames.some(n => n.includes('메트포르민') || n.includes('metformin') || n.includes('글리벤') || n.includes('당뇨'))) highRiskCategories.push('경구혈당강하제');
  if (medNames.some(n => n.includes('암로디핀') || n.includes('amlodipine') || n.includes('혈압') || n.includes('고혈압'))) highRiskCategories.push('항고혈압제');

  const rows: string[][] = [
    ['항목', '세부항목', '내용'],
    ['상담일자', '', todayISO],
    ['대상자 성명', '', patient.name],
    ['생년월일', '', patient.birthDate],
    ['성별', '', patient.gender === 'M' ? '남' : '여'],
    ['나이', '', `${patient.age}세`],
    ['방문유형', '', patient.visitType === 'Home' ? '가정방문' : '약국방문'],
    ['진단명(상병)', '', patient.diagnosisCodes.map(d => `${d.code} ${d.name}`).join('; ')],
    ['기저질환', '', patient.conditions.join('; ')],
    ['eGFR', '', patient.eGFR ? `${patient.eGFR} mL/min/1.73m²` : '미측정'],
    [''],
    ['[복용약물 현황]', '', ''],
    ['복용약물 수', '', `${analysis.medications.length}개`],
    ['약물 목록', '', medList],
    ...analysis.medications.map((m, i) => [
      `약물${i + 1}`, m.name, `성분: ${m.ingredient} | 용량: ${m.dosage} | 용법: ${m.frequency}`
    ]),
    [''],
    ['[2-1. 복약이행도 평가]', '', ''],
    ['해당여부', '', 'AI 추정 (약사 직접 확인 필요)'],
    ['복약이행도 낮은 약물', '', '(약사 기입)'],
    [''],
    ['[2-2. 중복 투약]', '', ''],
    ['해당여부', '', duplicates.length > 0 ? '있음' : '없음'],
    ['중복 약물명', '', duplicates.map(a => a.drugsInvolved.join(', ')).join('; ') || '해당없음'],
    [''],
    ['[2-3. 부작용(이상반응) 의심 약물]', '', ''],
    ['해당여부', '', adrAlerts.length > 0 ? '있음' : '없음'],
    ['의심 약물 및 증상', '', adrAlerts.map(a => `${a.drugsInvolved.join(', ')}: ${a.reason}`).join('; ') || '해당없음'],
    [''],
    ['[2-4. 약물-약물 상호작용]', '', ''],
    ['해당여부', '', interactions.length > 0 ? '있음' : '없음'],
    ['상호작용 내용', '', interactions.map(a => `${a.drugsInvolved.join(' ↔ ')} → ${a.action}`).join('; ') || '해당없음'],
    [''],
    ['[3-1. 의뢰/연계]', '', ''],
    ['의뢰여부', '', redAlerts.length > 0 ? '처방의사 확인 권고' : '해당없음'],
    ['의뢰 사유', '', redAlerts.map(a => a.title).join('; ') || ''],
    [''],
    ['[3-2. 약물 관련 문제 해결 결과]', '', ''],
    ['해결여부', '', '(약사 기입)'],
    [''],
    ['[3-3. 행동변화]', '', ''],
    ['행동변화 내용', '', '(약사 기입)'],
    [''],
    ['[3-4. 집중관리약제 교육]', '', ''],
    ['교육 약물군', '', highRiskCategories.length > 0 ? highRiskCategories.join('; ') : '해당없음'],
    ['교육 내용', '', '(약사 기입)'],
    [''],
    ['[3-5. 기타 / 다음 상담 계획]', '', ''],
    ['기타 사항', '', '(약사 기입)'],
    ['다음 상담 예정일', '', '(약사 기입)'],
    [''],
    ['[SOAP 노트 (AI 초안)]', '', ''],
    ['S (주관적 정보)', '', analysis.soapNote?.subjective || '(처방전 스캔 후 자동 생성)'],
    ['O (객관적 정보)', '', analysis.soapNote?.objective || ''],
    ['A (평가)', '', analysis.soapNote?.assessment || ''],
    ['P (계획)', '', analysis.soapNote?.plan || ''],
    ['AI 분석 요약', '', analysis.summary],
  ];

  const csvContent = rows
    .map(row =>
      row.length === 0
        ? ''
        : row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  // BOM: Excel UTF-8 인식을 위해 필요
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `다제약물_상담기록지_${patient.name}_${todayISO}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printRecord(analysis: AnalysisResult, patient: Patient) {
  const todayISO = new Date().toISOString().split('T')[0];
  const duplicates = analysis.alerts.filter(a => a.reason.includes('중복') || a.title.includes('중복'));
  const adrAlerts = analysis.alerts.filter(a => a.title.includes('부작용') || a.title.includes('이상반응') || a.title.includes('이상'));
  const interactions = analysis.alerts.filter(a => a.title.includes('상호작용') || a.reason.includes('상호작용'));
  const redAlerts = analysis.alerts.filter(a => a.level === AlertLevel.RED);
  const medNames = analysis.medications.map(m => (m.name + m.ingredient + (m.category || '')).toLowerCase());
  const highRisk: string[] = [];
  if (medNames.some(n => n.includes('와파린') || n.includes('warfarin') || n.includes('아픽사반') || n.includes('리바록사반'))) highRisk.push('항응고제');
  if (medNames.some(n => n.includes('이부프로펜') || n.includes('naproxen') || n.includes('diclofenac') || n.includes('nsaid'))) highRisk.push('NSAIDs');
  if (medNames.some(n => n.includes('인슐린') || n.includes('insulin'))) highRisk.push('인슐린');
  if (medNames.some(n => n.includes('흡입') || n.includes('inhaler') || n.includes('부데소니'))) highRisk.push('흡입기');
  if (medNames.some(n => n.includes('메트포르민') || n.includes('metformin') || n.includes('글리벤'))) highRisk.push('경구혈당강하제');

  const alertRows = (alerts: typeof analysis.alerts) =>
    alerts.length > 0
      ? `<ul class="alert-list">${alerts.map(a => `<li><strong>${a.drugsInvolved.join(', ')}</strong>: ${a.reason || a.action}</li>`).join('')}</ul>`
      : '<p class="none">□ 해당사항 없음</p>';

  const medTableRows = analysis.medications
    .map(m => `<tr><td>${m.name}</td><td>${m.ingredient}</td><td>${m.dosage}</td><td>${m.frequency}</td></tr>`)
    .join('');

  const soap = analysis.soapNote
    ? `<section><h4>SOAP 노트 (AI 초안)</h4>
        <table class="info-table"><tbody>
          <tr><td class="label">S (주관적)</td><td>${analysis.soapNote.subjective}</td></tr>
          <tr><td class="label">O (객관적)</td><td>${analysis.soapNote.objective}</td></tr>
          <tr><td class="label">A (평가)</td><td>${analysis.soapNote.assessment}</td></tr>
          <tr><td class="label">P (계획)</td><td>${analysis.soapNote.plan}</td></tr>
        </tbody></table></section>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<title>다제약물 관리사업 상담 기록지</title>
<style>
  body { font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; font-size: 11pt; margin: 15mm 15mm 15mm 15mm; color: #111; }
  h1 { text-align: center; font-size: 15pt; border-bottom: 2px solid #111; padding-bottom: 6px; margin-bottom: 4px; }
  .subtitle { text-align: center; font-size: 9pt; color: #555; margin-bottom: 16px; }
  section { margin-bottom: 12px; }
  h4 { background: #f1f5f9; padding: 4px 8px; font-size: 10pt; border-left: 3px solid #4f46e5; margin: 0 0 6px 0; }
  .info-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  .info-table td, .info-table th { border: 1px solid #cbd5e1; padding: 4px 8px; }
  .info-table th { background: #f8fafc; font-weight: bold; width: 30%; }
  .info-table .label { background: #f8fafc; font-weight: bold; width: 30%; }
  .med-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  .med-table th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; }
  .med-table td { border: 1px solid #e2e8f0; padding: 3px 6px; }
  .med-table tr:nth-child(even) td { background: #f8fafc; }
  .none { color: #64748b; margin: 2px 0 2px 12px; }
  .alert-list { margin: 2px 0 2px 20px; padding: 0; color: #b91c1c; }
  .alert-list li { margin-bottom: 3px; }
  .high-risk-tag { display: inline-block; border: 1px solid #f59e0b; background: #fffbeb; color: #92400e; font-size: 9pt; padding: 1px 6px; border-radius: 3px; margin: 2px; }
  .sign-row { display: flex; justify-content: flex-end; gap: 20px; margin-top: 16px; font-size: 10pt; }
  .sign-box { border-bottom: 1px solid #111; min-width: 120px; text-align: center; padding-bottom: 2px; }
  .footer-note { font-size: 8pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; margin-top: 12px; padding-top: 6px; }
  @page { size: A4; margin: 15mm; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<h1>다제약물 관리사업 상담 기록지(1차)</h1>
<p class="subtitle">국민건강보험공단 &nbsp;|&nbsp; 상담일: ${todayISO}</p>

<section>
<h4>대상자 기본 정보</h4>
<table class="info-table"><tbody>
  <tr><th>성명</th><td>${patient.name}</td><th>생년월일</th><td>${patient.birthDate}</td></tr>
  <tr><th>성별/나이</th><td>${patient.gender === 'M' ? '남' : '여'} / ${patient.age}세</td><th>방문유형</th><td>${patient.visitType === 'Home' ? '가정방문' : '약국방문'}</td></tr>
  <tr><th>진단명(상병)</th><td colspan="3">${patient.diagnosisCodes.map(d => `${d.code} ${d.name}`).join(', ') || '-'}</td></tr>
  <tr><th>기저질환</th><td colspan="3">${patient.conditions.join(', ') || '-'}</td></tr>
  <tr><th>eGFR</th><td colspan="3">${patient.eGFR ? patient.eGFR + ' mL/min/1.73m²' : '미측정'}</td></tr>
</tbody></table>
</section>

<section>
<h4>복용약물 현황 (총 ${analysis.medications.length}종)</h4>
<table class="med-table">
  <thead><tr><th>약품명</th><th>성분</th><th>용량</th><th>용법</th></tr></thead>
  <tbody>${medTableRows}</tbody>
</table>
</section>

<section>
<h4>2-1. 복약이행도 평가</h4>
<p class="none">□ 복약이행도 낮은 약물 없음&nbsp;&nbsp;&nbsp;□ 복약이행도 낮은 약물 있음: ________________</p>
</section>

<section>
<h4>2-2. 중복 투약</h4>${alertRows(duplicates)}</section>

<section>
<h4>2-3. 부작용(이상반응) 의심 약물</h4>${alertRows(adrAlerts)}</section>

<section>
<h4>2-4. 약물-약물 상호작용</h4>
${interactions.length > 0
  ? `<ul class="alert-list">${interactions.map(a => `<li><strong>${a.drugsInvolved.join(' ↔ ')}</strong>: ${a.action}</li>`).join('')}</ul>`
  : '<p class="none">□ 해당사항 없음</p>'}
</section>

<section>
<h4>3-1. 의뢰 / 연계</h4>
${redAlerts.length > 0
  ? `<p style="color:#b91c1c;font-weight:bold;">■ 처방의사 확인 권고</p><ul class="alert-list">${redAlerts.map(a => `<li>${a.title}</li>`).join('')}</ul>`
  : '<p class="none">□ 해당사항 없음</p>'}
</section>

<section>
<h4>3-2. 약물 관련 문제 해결 결과</h4>
<p class="none">□ 해결됨&nbsp;&nbsp;&nbsp;□ 부분 해결&nbsp;&nbsp;&nbsp;□ 해결되지 않음&nbsp;&nbsp;&nbsp;□ 해당없음</p>
</section>

<section>
<h4>3-3. 행동변화</h4>
<p class="none">□ 변화 있음&nbsp;&nbsp;&nbsp;□ 변화 없음&nbsp;&nbsp;&nbsp;□ 해당없음</p>
</section>

<section>
<h4>3-4. 집중관리약제 교육</h4>
${highRisk.length > 0
  ? highRisk.map(c => `<span class="high-risk-tag">${c} 교육 필요</span>`).join('')
  : '<p class="none">□ 집중관리약제 해당없음</p>'}
<div style="margin-top:4px;"><span style="font-size:9pt;color:#475569;">교육 내용: </span><span style="border-bottom:1px solid #aaa;display:inline-block;min-width:200px;">&nbsp;</span></div>
</section>

<section>
<h4>3-5. 기타 / 다음 상담 계획</h4>
<div style="border:1px solid #e2e8f0;min-height:32px;padding:4px 8px;font-size:9pt;color:#94a3b8;">약사 직접 기입</div>
</section>

${soap}

<section>
<h4>AI 분석 요약</h4>
<p style="font-size:10pt;">${analysis.summary}</p>
</section>

<div class="sign-row">
  <span>상담일: ${todayISO}</span>
  <div class="sign-box">담당약사 서명&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(인)</div>
</div>

<p class="footer-note">※ AI 분석은 임상 보조 수단이며, 최종 책임은 담당 약사에게 있습니다. (의료법 제27조 준수)</p>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=794,height=1123');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

const SmartOutput: React.FC<SmartOutputProps> = ({ analysis, patient }) => {
  const [mode, setMode] = useState<'pharmacist' | 'patient'>('pharmacist');
  const [copied, setCopied] = useState(false);

  const handleCopyDraft = async () => {
    if (!analysis) return;
    const lines: string[] = ['=== 다제약물 관리사업 AI 기록 초안 ===', ''];
    if (analysis.soapNote) {
      lines.push('[ SOAP 노트 ]');
      lines.push(`S: ${analysis.soapNote.subjective}`);
      lines.push(`O: ${analysis.soapNote.objective}`);
      lines.push(`A: ${analysis.soapNote.assessment}`);
      lines.push(`P: ${analysis.soapNote.plan}`);
      lines.push('');
    }
    if (analysis.alerts.length > 0) {
      lines.push('[ 약물 관련 문제 ]');
      analysis.alerts.forEach(a => lines.push(`- [${a.level}] ${a.title}: ${a.action}`));
      lines.push('');
    }
    lines.push(`[ 요약 ] ${analysis.summary}`);
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!analysis) {
    return (
      <div className="h-full bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm" role="status">
        분석이 완료되면 다제약물 관리사업 서식이 생성됩니다.
      </div>
    );
  }

  const duplicates = analysis.alerts.filter(a => a.reason.includes('중복') || a.title.includes('중복'));
  const adrAlerts = analysis.alerts.filter(a => a.title.includes('부작용') || a.title.includes('이상반응') || a.title.includes('이상'));
  const interactions = analysis.alerts.filter(a => a.title.includes('상호작용') || a.reason.includes('상호작용'));
  const redAlerts = analysis.alerts.filter(a => a.level === AlertLevel.RED);

  const medNames = analysis.medications.map(m => (m.name + m.ingredient + (m.category || '')).toLowerCase());
  const highRiskCategories: string[] = [];
  if (medNames.some(n => n.includes('와파린') || n.includes('warfarin') || n.includes('아픽사반') || n.includes('리바록사반'))) highRiskCategories.push('항응고제');
  if (medNames.some(n => n.includes('이부프로펜') || n.includes('naproxen') || n.includes('diclofenac') || n.includes('nsaid'))) highRiskCategories.push('NSAIDs');
  if (medNames.some(n => n.includes('인슐린') || n.includes('insulin'))) highRiskCategories.push('인슐린');
  if (medNames.some(n => n.includes('흡입') || n.includes('inhaler') || n.includes('부데소니'))) highRiskCategories.push('흡입기');
  if (medNames.some(n => n.includes('메트포르민') || n.includes('metformin') || n.includes('글리벤'))) highRiskCategories.push('경구혈당강하제');

  return (
    <section className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col" aria-labelledby="guide-title">
      <div className="p-4 border-b border-slate-100">
        <h2 id="guide-title" className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          다제약물 관리사업 결과 보고서
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-lg" role="tablist">
          <button
            onClick={() => setMode('pharmacist')}
            role="tab" aria-selected={mode === 'pharmacist'}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${mode === 'pharmacist' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-3.5 h-3.5" /> 공단 제출용
          </button>
          <button
            onClick={() => setMode('patient')}
            role="tab" aria-selected={mode === 'patient'}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${mode === 'patient' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> 대상자 발송용
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 hide-scrollbar" role="tabpanel">
        {mode === 'pharmacist' ? (
          <div className="bg-white border border-slate-200 shadow-sm p-5 text-xs space-y-5">
            {/* 헤더 */}
            <div className="border-b-2 border-slate-900 pb-3 text-center">
              <p className="text-[10px] text-slate-500 mb-1">국민건강보험공단</p>
              <h3 className="text-base font-black text-slate-900">다제약물 관리사업 상담 기록지(1차)</h3>
            </div>

            {/* 대상자 정보 */}
            {patient && (
              <section>
                <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 대상자 기본 정보
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-2">
                  <div><span className="text-slate-500">성명:</span> <span className="font-medium">{patient.name}</span></div>
                  <div><span className="text-slate-500">생년월일:</span> <span className="font-medium">{patient.birthDate}</span></div>
                  <div><span className="text-slate-500">성별:</span> <span className="font-medium">{patient.gender === 'M' ? '남' : '여'} / {patient.age}세</span></div>
                  <div><span className="text-slate-500">방문유형:</span> <span className="font-medium">{patient.visitType === 'Home' ? '가정방문' : '약국방문'}</span></div>
                  {patient.diagnosisCodes.length > 0 && (
                    <div className="col-span-2"><span className="text-slate-500">진단명:</span> <span className="font-medium">{patient.diagnosisCodes.map(d => `${d.code} ${d.name}`).join(', ')}</span></div>
                  )}
                  {patient.eGFR && (
                    <div><span className="text-slate-500">eGFR:</span> <span className="font-medium">{patient.eGFR} mL/min</span></div>
                  )}
                </div>
              </section>
            )}

            {/* 복용약물 현황 */}
            <section>
              <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 복용약물 현황
                <span className="ml-auto text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">총 {analysis.medications.length}종</span>
              </h4>
              {analysis.medications.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 px-2 py-1 text-left font-bold text-slate-600">약품명</th>
                      <th className="border border-slate-200 px-2 py-1 text-left font-bold text-slate-600">성분</th>
                      <th className="border border-slate-200 px-2 py-1 text-left font-bold text-slate-600">용법</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.medications.map((m, i) => (
                      <tr key={i} className="even:bg-slate-50/50">
                        <td className="border border-slate-200 px-2 py-1 font-medium">{m.name}</td>
                        <td className="border border-slate-200 px-2 py-1 text-slate-600">{m.ingredient}</td>
                        <td className="border border-slate-200 px-2 py-1 text-slate-600">{m.dosage} {m.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-400 pl-2">약물 정보 없음</p>
              )}
            </section>

            {/* 2-1 복약이행도 */}
            <section>
              <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 2-1. 복약이행도 평가
              </h4>
              <div className="pl-2 space-y-1">
                <p className="text-slate-500">□ 복약이행도 낮은 약물 없음</p>
                <p className="text-slate-500">□ 복약이행도 낮은 약물 있음: <span className="text-slate-400 italic">약사 직접 확인 후 기입</span></p>
              </div>
            </section>

            {/* 2-2 중복투약 */}
            <section>
              <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 2-2. 중복 투약
              </h4>
              <div className="pl-2">
                {duplicates.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-red-700">
                    {duplicates.map((a, i) => <li key={i}><span className="font-bold">{a.drugsInvolved.join(', ')}</span>: {a.reason}</li>)}
                  </ul>
                ) : <p className="text-slate-500">□ 해당사항 없음</p>}
              </div>
            </section>

            {/* 2-3 부작용 */}
            <section>
              <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 2-3. 부작용(이상반응) 의심 약물
              </h4>
              <div className="pl-2">
                {adrAlerts.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-amber-800">
                    {adrAlerts.map((a, i) => <li key={i}><span className="font-bold">{a.drugsInvolved.join(', ')}</span>: {a.reason}</li>)}
                  </ul>
                ) : <p className="text-slate-500">□ 해당사항 없음</p>}
              </div>
            </section>

            {/* 2-4 상호작용 */}
            <section>
              <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 2-4. 약물-약물 상호작용
              </h4>
              <div className="pl-2">
                {interactions.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-red-700">
                    {interactions.map((a, i) => (
                      <li key={i}><span className="font-bold">{a.drugsInvolved.join(' ↔ ')}</span>: {a.action}</li>
                    ))}
                  </ul>
                ) : <p className="text-slate-500">□ 해당사항 없음</p>}
              </div>
            </section>

            {/* 3-1 의뢰/연계 */}
            <section>
              <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 3-1. 의뢰 / 연계
              </h4>
              <div className="pl-2">
                {redAlerts.length > 0 ? (
                  <div className="text-red-700">
                    <p className="font-bold">■ 처방의사 확인 권고</p>
                    <ul className="list-disc pl-4 mt-1">
                      {redAlerts.map((a, i) => <li key={i}>{a.title}</li>)}
                    </ul>
                  </div>
                ) : <p className="text-slate-500">□ 해당사항 없음</p>}
              </div>
            </section>

            {/* 3-2 결과 */}
            <section>
              <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 3-2. 약물 관련 문제 해결 결과
              </h4>
              <div className="pl-2 space-y-1 text-slate-500">
                <p>□ 해결됨 &nbsp;&nbsp; □ 부분 해결 &nbsp;&nbsp; □ 해결되지 않음 &nbsp;&nbsp; □ 해당없음</p>
              </div>
            </section>

            {/* 3-3 행동변화 */}
            <section>
              <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 3-3. 행동변화
              </h4>
              <div className="pl-2 text-slate-500">
                <p>□ 변화 있음 &nbsp;&nbsp; □ 변화 없음 &nbsp;&nbsp; □ 해당없음</p>
              </div>
            </section>

            {/* 3-4 집중관리약제 교육 */}
            <section>
              <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 3-4. 집중관리약제 교육
              </h4>
              <div className="pl-2">
                {highRiskCategories.length > 0 ? (
                  <div>
                    <p className="text-amber-700 font-bold mb-1.5">※ AI 감지 집중관리 약물군:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {highRiskCategories.map(cat => (
                        <span key={cat} className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[10px] font-bold text-amber-800">{cat} 교육 필요</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">□ 집중관리약제 해당없음</p>
                )}
              </div>
            </section>

            {/* 3-5 기타 */}
            <section>
              <h4 className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded mb-2 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> 3-5. 기타 / 다음 상담 계획
              </h4>
              <div className="pl-2 text-slate-400 italic text-[10px] border border-dashed border-slate-200 rounded p-2 min-h-[40px]">
                약사 직접 기입
              </div>
            </section>

            {/* SOAP */}
            {analysis.soapNote && (
              <section>
                <h4 className="font-bold text-slate-700 bg-indigo-50 px-2 py-1 rounded mb-2 flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> SOAP 노트 (AI 초안)
                </h4>
                <div className="pl-2 space-y-2">
                  {[
                    ['S', '주관적 정보', analysis.soapNote.subjective],
                    ['O', '객관적 정보', analysis.soapNote.objective],
                    ['A', '평가', analysis.soapNote.assessment],
                    ['P', '계획', analysis.soapNote.plan],
                  ].map(([key, label, val]) => (
                    <div key={key}>
                      <span className="font-black text-indigo-700">{key}</span>
                      <span className="text-slate-500 ml-1">({label}):</span>
                      <p className="mt-0.5 text-slate-700 pl-3">{val}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AI 요약 */}
            <section className="border-t pt-3">
              <p className="text-[10px] text-slate-400 font-bold">AI 분석 요약</p>
              <p className="text-slate-600 mt-1">{analysis.summary}</p>
            </section>

            <p className="text-[9px] text-slate-400 text-center border-t pt-2">
              AI 분석은 임상 보조 수단이며, 최종 책임은 담당 약사에게 있습니다.
            </p>
          </div>
        ) : (
          /* 대상자 발송용 */
          <div className="bg-white border border-slate-200 shadow-sm p-5 min-h-[300px]">
            <div className="bg-red-50 text-center p-3 rounded-lg border border-red-100 mb-5">
              <h3 className="text-lg font-bold text-red-700">상 담 결 과 서</h3>
              <p className="text-xs text-red-600 mt-1">국민건강보험공단 다제약물 관리사업</p>
            </div>
            <div className="space-y-4 text-slate-800 text-sm">
              <p>안녕하십니까? 귀하의 약물상담 결과를 안내해 드립니다.<br/>
                안전한 약물 사용을 위해 아래 내용을 참고하시고, 자세한 내용은 의사선생님과 상담하시기 바랍니다.</p>
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-4">
                {redAlerts.length > 0 && (
                  <div>
                    <h4 className="font-bold text-red-700 flex items-center gap-1 mb-2">
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">!</span>
                      의사 선생님과 꼭 상의해야 할 약물
                    </h4>
                    <ul className="list-disc pl-6 space-y-2">
                      {redAlerts.map((alert, i) => (
                        <li key={i}>
                          <span className="font-bold">{alert.drugsInvolved.join(', ')}</span><br/>
                          <span className="text-slate-600">{alert.action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-teal-700 flex items-center gap-1 mb-2">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">✓</span>
                    복약 안내 사항
                  </h4>
                  <p className="text-slate-600">{analysis.summary}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-5 border-t pt-3">
                * 만성질환자 중 10개 이상 약물을 복용하는 환자에 대해 약물의 안전한 사용관리를 제공하는 사업입니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="p-3 border-t border-slate-100 bg-white grid grid-cols-3 gap-2">
        <button
          onClick={() => patient && downloadCSV(analysis, patient)}
          disabled={!patient}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-slate-900 outline-none disabled:opacity-40"
          aria-label="CSV 다운로드"
        >
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
        <button
          onClick={() => patient && printRecord(analysis, patient)}
          disabled={!patient}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-40"
          aria-label="상담기록지 인쇄"
        >
          <Printer className="w-3.5 h-3.5" /> 인쇄
        </button>
        <button
          onClick={handleCopyDraft}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors focus:ring-2 focus:ring-indigo-500 outline-none"
          aria-label="AI 기록 초안 복사"
        >
          {copied
            ? <><Check className="w-3.5 h-3.5" /> 완료!</>
            : <><Copy className="w-3.5 h-3.5" /> 초안 복사</>
          }
        </button>
      </div>
    </section>
  );
};

export default SmartOutput;
