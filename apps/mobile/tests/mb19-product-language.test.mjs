import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const USER_FACING_FILES = [
  'src/features/start/StartScreen.tsx',
  'src/features/start/ResumeCard.tsx',
  'src/features/start/AiConsentSheet.tsx',
  'src/features/plan/PlanScreen.tsx',
  'src/features/timer/TimerScreen.tsx',
  'src/features/completion/CompletionScreen.tsx',
  'src/features/completion/PhotoProofPicker.tsx',
  'src/features/history/HistoryScreen.tsx',
  'src/features/settings/SettingsScreen.tsx',
  'src/features/settings/DeleteLocalDataDialog.tsx',
];

const sources = USER_FACING_FILES.map((path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
).join('\n');

test('MB-19 removes infrastructure and QA language from product screens', () => {
  for (const forbidden of [
    '동의 버전',
    '원격 AI 연결',
    '일부 저장소',
    '체크 완료',
    '기기 안의 기본 계획',
    '막히는 일을 적어보세요',
    '인증 사진',
    '로컬 데이터',
  ]) {
    assert.equal(
      sources.includes(forbidden),
      false,
      `user-facing source contains "${forbidden}"`,
    );
  }
});

test('MB-19 guards destructive exits with native confirmation', () => {
  const timerSource = readFileSync(
    new URL('../src/features/timer/TimerScreen.tsx', import.meta.url),
    'utf8',
  );
  const resumeSource = readFileSync(
    new URL('../src/features/start/ResumeCard.tsx', import.meta.url),
    'utf8',
  );

  assert.match(timerSource, /Alert\.alert\(\s*'진행을 끝낼까요\?'/);
  assert.match(resumeSource, /Alert\.alert\(\s*'새 일을 시작할까요\?'/);
});

test('approved start and completion copy stays aligned with the product flow', () => {
  const startSource = readFileSync(
    new URL('../src/features/start/StartScreen.tsx', import.meta.url),
    'utf8',
  );
  const photoSource = readFileSync(
    new URL('../src/features/completion/PhotoProofPicker.tsx', import.meta.url),
    'utf8',
  );
  const completionSource = readFileSync(
    new URL('../src/features/completion/CompletionScreen.tsx', import.meta.url),
    'utf8',
  );

  assert.match(startSource, /placeholder="한 문장만 적어보세요"/);
  assert.match(startSource, /'첫 행동을 만드는 중…'/);
  assert.match(photoSource, /launchCameraAsync/);
  assert.match(photoSource, /'사진으로 남기기'/);
  assert.match(photoSource, /'앨범에서 선택'/);
  assert.match(completionSource, /완료를 기록할까요\?/);
  assert.equal(completionSource.includes('세 단계를 마쳤어요'), false);
  assert.match(completionSource, /Animated\.ScrollView/);
  assert.match(completionSource, /tokens\.reduceMotion/);
});
