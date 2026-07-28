export const TIMER_DIAL_SEGMENT_COUNT = 24 as const;

function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

export function getElapsedSegmentCount(
  progress: number,
  segmentCount: number = TIMER_DIAL_SEGMENT_COUNT,
): number {
  return Math.min(
    segmentCount,
    Math.max(0, Math.floor(clampProgress(progress) * segmentCount)),
  );
}

export function getRemainingPercent(progress: number): number {
  return Math.round((1 - clampProgress(progress)) * 100);
}

export function formatTimerStartLabel(seconds: number): string {
  const wholeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = wholeSeconds % 60;

  if (minutes === 0) {
    return `${remainder}초 시작`;
  }
  if (remainder === 0) {
    return `${minutes}분 시작`;
  }
  return `${minutes}분 ${remainder}초 시작`;
}
