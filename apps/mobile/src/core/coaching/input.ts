export const MIN_TASK_GRAPHEMES = 2;
export const MAX_TASK_GRAPHEMES = 240;

export type TaskInputError = 'too_short' | 'too_long';

export interface TaskInputValidation {
  value: string;
  graphemeCount: number;
  error: TaskInputError | null;
  isValid: boolean;
}

function splitGraphemes(value: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(value), ({ segment }) => segment);
  }

  return Array.from(value);
}

export function countGraphemes(value: string): number {
  return splitGraphemes(value).length;
}

export function validateTaskInput(rawValue: string): TaskInputValidation {
  const value = rawValue.trim();
  const graphemeCount = countGraphemes(value);
  const error =
    graphemeCount < MIN_TASK_GRAPHEMES
      ? 'too_short'
      : graphemeCount > MAX_TASK_GRAPHEMES
        ? 'too_long'
        : null;

  return {
    value,
    graphemeCount,
    error,
    isValid: error === null,
  };
}

export function getTaskInputErrorMessage(error: TaskInputError | null): string | null {
  if (error === 'too_short') {
    return '두 글자 이상 적어주세요.';
  }

  if (error === 'too_long') {
    return '240자 안으로 줄여주세요.';
  }

  return null;
}
