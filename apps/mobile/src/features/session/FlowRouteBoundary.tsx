import { useRouter } from 'expo-router';
import { type PropsWithChildren, useEffect } from 'react';

import {
  resolveFlowRoute,
  type GuardedFlowRoute,
} from '@/core/session/routeGuard';
import { useStartioFlow } from '@/features/session/StartioFlowProvider';

export function FlowRouteBoundary({
  children,
  target,
}: PropsWithChildren<{ target: GuardedFlowRoute }>) {
  const router = useRouter();
  const { isHydrated, result, timerState } = useStartioFlow();
  const decision = resolveFlowRoute({
    target,
    isHydrated,
    result,
    timerState,
  });

  useEffect(() => {
    if (decision.kind === 'redirect') {
      router.replace(decision.href);
    }
  }, [decision.kind, decision.kind === 'redirect' ? decision.href : null, router]);

  return decision.kind === 'allow' ? children : null;
}
