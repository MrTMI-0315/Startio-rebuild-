import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
} from 'react-native';

import type { TimerStatus } from '@/core/session/timerMachine';

interface StepFeedback {
  message: string | null;
  animatedStyle: {
    opacity: Animated.Value;
    transform: Array<{ translateY: Animated.Value }>;
  };
}

export function useStepFeedback(
  currentStepOrder: number,
  status: TimerStatus,
): StepFeedback {
  const previousStepOrder = useRef(currentStepOrder);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const completedStepOrder = previousStepOrder.current;
    previousStepOrder.current = currentStepOrder;

    if (
      currentStepOrder <= completedStepOrder ||
      status === 'completed' ||
      status === 'abandoned'
    ) {
      return;
    }

    let cancelled = false;
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    const nextMessage = `${completedStepOrder}단계 완료`;

    setMessage(nextMessage);
    AccessibilityInfo.announceForAccessibility(nextMessage);

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotionEnabled) => {
      if (cancelled) {
        return;
      }

      opacity.setValue(1);

      if (reduceMotionEnabled) {
        translateY.setValue(0);
        hideTimeout = setTimeout(() => {
          opacity.setValue(0);
          setMessage(null);
        }, 800);
        return;
      }

      translateY.setValue(6);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            duration: 180,
            easing: Easing.out(Easing.cubic),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            duration: 180,
            easing: Easing.out(Easing.cubic),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(600),
        Animated.timing(opacity, {
          duration: 180,
          easing: Easing.in(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && !cancelled) {
          setMessage(null);
        }
      });
    });

    return () => {
      cancelled = true;
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      opacity.stopAnimation();
      translateY.stopAnimation();
    };
  }, [currentStepOrder, opacity, status, translateY]);

  return {
    message,
    animatedStyle: {
      opacity,
      transform: [{ translateY }],
    },
  };
}
