import type { SafeRedirect } from './result.ts';

const CRISIS_PATTERNS = [
  /죽고\s*싶/,
  /자살/,
  /자해/,
  /목숨을\s*끊/,
  /사라지고\s*싶/,
];

const DANGEROUS_OR_ILLEGAL_PATTERNS = [
  /폭탄.*(?:만드|만들|제조)/,
  /사람.*(?:해치|죽이)/,
  /(?:해킹|계정\s*탈취).*방법/,
  /(?:훔치|절도).*방법/,
  /마약.*(?:만드|만들|제조)/,
];

const CLINICAL_ADVICE_PATTERNS = [
  /(?:나|저).*(?:진단|병명).*(?:내려|알려|판단)/,
  /(?:약|복용).*(?:끊|중단|늘리|줄이|줄여|바꾸|조절)/,
  /(?:상담|치료).*(?:대신|필요\s*없)/,
  /(?:치료법|약물\s*조언)/,
];

function matchesAny(value: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

export function classifySafety(input: string): SafeRedirect | null {
  const normalized = input.normalize('NFC').toLowerCase();

  if (matchesAny(normalized, CRISIS_PATTERNS)) {
    return {
      kind: 'safe_redirect',
      doNotChunk: true,
      reasonCode: 'crisis_or_self_harm',
      message:
        '지금의 안전이 가장 중요해요. 즉시 위험하다면 지역 긴급전화나 가까운 응급실에 연락하세요.',
      supportActions: [
        '혼자 있지 말고 믿을 수 있는 사람에게 지금 상황을 알리기',
        '위험한 물건에서 거리를 두고 안전한 장소로 이동하기',
      ],
    };
  }

  if (matchesAny(normalized, DANGEROUS_OR_ILLEGAL_PATTERNS)) {
    return {
      kind: 'safe_redirect',
      doNotChunk: true,
      reasonCode: 'dangerous_or_illegal_request',
      message: '다른 사람이나 자신을 위험하게 만드는 행동 계획은 만들 수 없어요.',
      supportActions: ['위험을 피할 수 있는 합법적이고 안전한 다음 행동을 선택하기'],
    };
  }

  if (matchesAny(normalized, CLINICAL_ADVICE_PATTERNS)) {
    return {
      kind: 'safe_redirect',
      doNotChunk: true,
      reasonCode: 'clinical_advice_request',
      message: '진단이나 치료·약물 조언은 제공하지 않아요. 해당 내용은 전문가와 상의해 주세요.',
      supportActions: ['진료 예약이나 문의 준비처럼 실용적인 할 일로 다시 적기'],
    };
  }

  return null;
}
