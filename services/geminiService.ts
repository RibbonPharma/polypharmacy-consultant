
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AlertLevel, Patient } from "../types";
import { checkLocalDUR } from "./durEngine";
import { searchWhoDb, WHO_ADVERSE_DB } from "./whoAdverseDb";

const SESSION_KEY = 'pharmgni_gemini_key';

// vite.config define이 키 없을 때 "undefined" 문자열을 주입하는 케이스 필터링
function isValidKey(k: string | null | undefined): k is string {
  return !!k && k.length > 10 && k !== 'undefined' && !k.startsWith('YOUR_');
}

// 우선순위: 사용자 입력(sessionStorage) > .env.local > Codespaces Secret
function getApiKey(): string {
  const session = sessionStorage.getItem(SESSION_KEY);
  if (isValidKey(session)) return session;
  const env = process.env.GEMINI_API_KEY;
  if (isValidKey(env)) return env;
  return "";
}

export function isApiKeyConfigured(): boolean {
  return getApiKey().length > 0;
}

export function saveApiKey(key: string): void {
  sessionStorage.setItem(SESSION_KEY, key.trim());
}

// 각 호출 시점에 키를 읽어 동적으로 클라이언트 생성
function createClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

function cleanJsonString(text: string): string {
  // 1. Try to find a JSON code block (robust against "thinking" text preamble)
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }
  
  // 2. If no code block, try to find the first '{' and the last '}'
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  
  // 3. Fallback: return original (trimmed)
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
}

/**
 * 시뮬레이션: 전송 전 로컬 환경에서 개인정보 마스킹
 * 실제 구현 시에는 NER(개체명 인식) 라이브러리를 통해 성함 등을 마스킹함.
 */
const simulateLocalMasking = async (base64: string) => {
    // 0.5초간 마스킹 프로세스 시뮬레이션
    return new Promise(resolve => setTimeout(() => resolve(base64), 500));
};

export const analyzeMedicalImage = async (
  base64Image: string,
  patientContext: string
): Promise<AnalysisResult> => {
  try {
    if (!isApiKeyConfigured()) {
      throw new Error("NO_API_KEY");
    }
    // [보완] 전송 전 로컬 마스킹 단계 거침 (Legal Compliance)
    const maskedBase64 = await simulateLocalMasking(base64Image);
    
    // [중요] 실제 서비스 연동 시 사용자 환경에 맞게 API 키를 기입해야 합니다.
    // gemini-3-pro-preview 모델 사용 (Thinking Mode 자동 활성화)
    const modelId = "gemini-3-pro-preview"; 

    const prompt = `
      System Instruction:
      You are a Clinical Pharmacist AI Assistant (Korean Language).
      
      [CRITICAL RULES]
      1. **OUTPUT FORMAT**: Provide the final result inside a **JSON code block** ( \`\`\`json ... \`\`\` ).
      2. **LANGUAGE**: All generated text (summary, reasons, actions) MUST be in **Korean (한국어)**.
      3. **STRICT DATA EXTRACTION (NO INFERENCE)**: 
         - **Patient Information**: Extract 'Name', 'Age', 'Gender', 'Birth Date' ONLY if they are **explicitly printed** on the document (e.g. '성명: 홍길동', '주민등록번호'). 
         - **DO NOT** infer patient details from the context or guess. If a field is not visible, do not include it.
         - **Diagnoses**: Extract ICD-10 codes and Disease Names explicitly written on the document. Do not mix with patient's historical conditions.
      
      TASK 1: TEXT EXTRACTION
      - Analyze the prescription, medication bag, or dietary supplement label (건강기능식품) image.
      - Extract visible Patient Info (Name, Age, Gender, DOB) only if printed.
      - Extract visible Diagnosis Codes (Code + Name) or dietary supplement name & ingredients.
      - Extract all visible medications or supplements (Name, Ingredient, Dosage, Frequency).

      TASK 2: CLINICAL ANALYSIS
      - Based on the extracted medications and the provided patient context (below), check for:
        1. Drug-Drug Interactions
        2. Beers Criteria (for elderly patients)
        3. Dosage warnings
      - Provide clinical references (e.g. 'AGS Beers Criteria 2023').

      Patient Clinical Data (Context for Analysis Only):
      ${patientContext}
    `;

    const response = await createClient().models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: maskedBase64 } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                extractedPatientInfo: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Explicitly printed name" },
                        age: { type: Type.NUMBER, description: "Explicitly printed age" },
                        gender: { type: Type.STRING, enum: ["M", "F"], description: "Explicitly printed gender" },
                        birthDate: { type: Type.STRING, description: "Explicitly printed birth date (YYYY-MM-DD)" }
                    },
                    description: "Patient info visible on the document. Null if not found."
                },
                diagnoses: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            code: { type: Type.STRING, description: "ICD-10 Code (e.g. J20.9)" },
                            name: { type: Type.STRING, description: "Disease Name (e.g. 급성 기관지염)" }
                        }
                    },
                    description: "Diagnoses explicitly printed on the document."
                },
                medications: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            ingredient: { type: Type.STRING },
                            dosage: { type: Type.STRING },
                            frequency: { type: Type.STRING },
                            category: { type: Type.STRING }
                        }
                    }
                },
                alerts: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            level: { type: Type.STRING, enum: ["RED", "YELLOW", "GREEN"] },
                            title: { type: Type.STRING, description: "In Korean" },
                            reason: { type: Type.STRING, description: "In Korean" },
                            action: { type: Type.STRING, description: "In Korean" },
                            drugsInvolved: { type: Type.ARRAY, items: { type: Type.STRING } },
                            isVerifiedByLocalDB: { type: Type.BOOLEAN },
                            reference: { type: Type.STRING }
                        }
                    }
                },
                summary: { type: Type.STRING, description: "Clinical summary in Korean" },
                soapNote: {
                    type: Type.OBJECT,
                    description: "Initial SOAP Note based on findings",
                    properties: {
                        subjective: { type: Type.STRING, description: "주관적 정보 (예: 내원 목적 등)" },
                        objective: { type: Type.STRING, description: "객관적 정보 (스캔된 처방, 진단 등 요약)" },
                        assessment: { type: Type.STRING, description: "평가 (발견된 약물 관련 문제)" },
                        plan: { type: Type.STRING, description: "계획 (복약 지도 내용, 처방의사 상의 등)" }
                    }
                }
            }
        }
      },
    });

    if (response.text) {
      let parsed: AnalysisResult;
      try {
        const cleanedText = cleanJsonString(response.text);
        parsed = JSON.parse(cleanedText) as AnalysisResult;
        
        // Ensure arrays are initialized to avoid UI errors
        parsed.medications = parsed.medications || [];
        parsed.alerts = parsed.alerts || [];
        parsed.diagnoses = parsed.diagnoses || [];

      } catch (e) {
        console.error("JSON Parsing Error:", e);
        // console.debug("Raw Text:", response.text) — 처방전 분석 원문은 환자 정보를 포함할 수 있으므로 프로덕션에서 로깅 금지
        throw new Error("Invalid JSON response from AI");
      }
      
      parsed.isVerifiedByPharmacist = false; // Initial state: Not verified

      const drugNames = parsed.medications.map(m => m.name || m.ingredient || "");
      const localAlerts = checkLocalDUR(drugNames);
      
      localAlerts.forEach(local => {
          const alreadyExists = parsed.alerts.some(a => 
            (a.title && (a.title.includes(local.drugA) || a.title.includes(local.drugB)))
          );

          if (!alreadyExists) {
              parsed.alerts.push({
                  level: local.severity === 'CRITICAL' ? AlertLevel.RED : AlertLevel.YELLOW,
                  title: `[Local DB] ${local.drugA} - ${local.drugB || '주의'} 이슈`,
                  reason: local.reason,
                  action: "로컬 데이터베이스 규칙에 따른 주의가 필요합니다.",
                  drugsInvolved: [local.drugA, local.drugB].filter(Boolean) as string[],
                  isVerifiedByLocalDB: true,
                  reference: local.reference
              });
          }
      });

      return parsed;
    }
    
    throw new Error("No response from AI");
  } catch (error) {
    const isKeyMissing = error instanceof Error && error.message === "NO_API_KEY";
    console.error("Gemini Analysis Error:", error);
    return {
      medications: [],
      alerts: [],
      summary: isKeyMissing
        ? "NO_API_KEY"
        : "분석 중 오류가 발생했습니다.",
    };
  }
};

export const askClinicalAi = async (
  query: string,
  patient: Patient,
  analysis: AnalysisResult | null
): Promise<string> => {
  try {
    // 모듈 상단의 ai 인스턴스를 재사용합니다.
    
    // 1. 환자의 현재 약물 리스트 추출
    const currentMeds = analysis && analysis.medications 
      ? analysis.medications.map(m => m.name || m.ingredient).filter(Boolean) as string[] 
      : [];
    
    // 2. WHO DB에서 관련 정보 검색 (Grounding)
    const relevantWhoData = searchWhoDb(currentMeds, query);
    
    const whoContextData = relevantWhoData.length > 0 
        ? JSON.stringify(relevantWhoData, null, 2)
        : "No direct match in Local WHO DB. Use general pharmacological knowledge based on WHO criteria.";

    // 3. Prompt Engineering
    const clinicalContext = `
      [Clinical Context - No Personal ID]
      - Age: ${patient.age}, Gender: ${patient.gender}
      - Conditions: ${patient.conditions.join(", ")}
      - Current Diagnosis (Scan): ${patient.diagnosisCodes.map(d => `${d.code}:${d.name}`).join(", ")}
      - eGFR: ${patient.eGFR || 'Unknown'}
      - Medications: ${currentMeds.join(", ")}

      [WHO Adverse Reaction Database (Local Knowledge)]
      ${whoContextData}

      [Task Definition]
      You are a specialized expert in 'Adverse Drug Reaction (ADR) Causality Assessment'.
      The user is asking about a symptom. You must evaluate if any of the patient's medications could be the cause based on the WHO-UMC Causality Categories (Certain, Probable, Possible, Unlikely).

      [Output Requirements]
      1. If the user reports a symptom (e.g., dizziness, edema, pain), you MUST output the analysis in a MARKDOWN TABLE format exactly as below:
      
      | 호소 증상 | 의심되는 원인약물 | 인과정도 (WHO Criteria) | 근거 및 평가 (Mechanism) |
      |---|---|---|---|
      | (Symptom) | (Drug Name) | (Certain/Probable/Possible/Unlikely) | (Explain mechanism & WHO criteria logic) |

      2. If multiple drugs are suspected, list them in separate rows.
      3. If no specific drug is suspected but the symptom is concerning, state that in the table with 'Unknown' drug.
      4. After the table, provide a brief clinical recommendation in Korean.
      5. If a 'reference' URL is available in the WHO DB entry, please include it at the bottom of the response labeled as '[Reference]'.
    `;

    const response = await createClient().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { text: clinicalContext },
        { text: query }
      ],
      config: {
        systemInstruction: "You are a BCGP Assistant. Use only Korean for the final explanation, but keep WHO Criteria terms (Certain, Probable etc) in English/Korean mix for clarity. Never ask for Personal IDs.",
        temperature: 0.4,
      }
    });

    return response.text || "답변을 생성하지 못했습니다.";
  } catch (error) {
    return "상담 중 오류가 발생했습니다.";
  }
};
