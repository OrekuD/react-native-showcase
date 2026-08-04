import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import {
  resolveToastPosition,
  resolveToastPresentationStack,
  resolveToastRepeatCount,
  resolveToastStack,
  resolveToastSwipeDirections,
  resolveToastTimeoutMs,
  type ToastPosition,
  type ToastStack,
  type ToastSwipeDirection,
} from "./toastState";
import {
  mergeToastTheme,
  resolveToastTokens,
  type ResolvedToastTheme,
  type ToastTheme,
  type ToastThemeOverride,
} from "./toastTheme";
import { useToastTheme } from "./ToastThemeProvider";
import { ToastSurface } from "./ToastSurface";

const TOAST_EASING = Easing.bezier(0.22, 1, 0.36, 1);
const ENTER_FROM_BOTTOM = FadeInDown.duration(220)
  .easing(TOAST_EASING)
  .reduceMotion(ReduceMotion.System);
const ENTER_FROM_TOP = FadeInUp.duration(220)
  .easing(TOAST_EASING)
  .reduceMotion(ReduceMotion.System);
const EXIT_TO_BOTTOM = FadeOutDown.duration(160)
  .easing(Easing.out(Easing.quad))
  .reduceMotion(ReduceMotion.System);
const EXIT_TO_TOP = FadeOutUp.duration(160)
  .easing(Easing.out(Easing.quad))
  .reduceMotion(ReduceMotion.System);
const TOAST_LAYOUT = LinearTransition.duration(220)
  .easing(TOAST_EASING)
  .reduceMotion(ReduceMotion.System);
const SWIPE_DISMISS_DISTANCE = 88;
const SWIPE_DISMISS_VELOCITY = 760;
const SWIPE_EXIT_DISTANCE = 640;

/** An optional labeled action displayed at the trailing edge of a toast. */
export type ToastAction = {
  /** Whether the toast closes after this action runs. @default true */
  dismissOnPress?: boolean;
  /** Visible action label. */
  label: string;
  /** Called when the action is pressed. */
  onPress: () => void;
};

/** Options accepted by {@link ToastApi.show}. */
export type ToastOptions = {
  /** Optional trailing action. */
  action?: ToastAction;
  /** Shows an accessible close control. @default false */
  dismissible?: boolean;
  /** Lifetime in milliseconds. Use `null` for a persistent toast. @default 5000 */
  durationMs?: number | null;
  /** Optional leading visual such as an icon. */
  icon?: ReactNode;
  /** Stable identifier used to update and pulse a matching visible toast. */
  id?: string;
  /** Main toast content. */
  message: string;
  /** Visual tokens applied only to this toast. */
  theme?: ToastThemeOverride;
};

/** Imperative toast operations exposed by {@link useToast}. */
export type ToastApi = {
  /** Removes one visible toast by its identifier. */
  dismiss: (id: string) => void;
  /** Removes every visible toast. */
  dismissAll: () => void;
  /** Adds a toast and returns its identifier. */
  show: (options: ToastOptions) => string;
};

/** Props accepted by {@link ToastProvider}. */
export type ToastProviderProps = {
  /** Application UI and a {@link ToastViewport} rendered under this provider. */
  children: ReactNode;
  /** Maximum number of visible toasts. @default 3 */
  maxToasts?: number;
  /** Screen edge used by the viewport. @default 'bottom' */
  position?: ToastPosition;
  /** Arrangement used for multiple notifications. @default 'deck' */
  stack?: ToastStack;
  /** Directions that dismiss visible toasts with a swipe. @default ['left', 'right'] */
  swipeDirections?: readonly ToastSwipeDirection[];
  /** Local tokens merged after the closest {@link ToastThemeProvider}. */
  theme?: ToastTheme;
};

/** Props accepted by {@link ToastViewport}. */
export type ToastViewportProps = {
  /** Test identifier applied to the full-screen viewport. */
  testID?: string;
};

type ToastRecord = Required<Pick<ToastOptions, "id" | "message">> &
  Omit<ToastOptions, "id" | "message"> & {
    repeatCount: number;
    revision: number;
  };

type ToastContextValue = ToastApi & {
  maxToasts: number;
  position: ToastPosition;
  stack: ToastStack;
  swipeDirections: readonly ToastSwipeDirection[];
  theme: ResolvedToastTheme;
  toasts: readonly ToastRecord[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Holds toast state for a subtree. Render {@link ToastViewport} as an overlay
 * sibling of the screen content, then call {@link useToast} below this provider.
 */
export function ToastProvider({
  children,
  maxToasts = 3,
  position,
  stack,
  swipeDirections,
  theme: themeOverride,
}: ToastProviderProps) {
  if (!Number.isInteger(maxToasts) || maxToasts < 1) {
    throw new RangeError("Toast maxToasts must be a positive integer.");
  }

  const inheritedTheme = useToastTheme();
  const theme = useMemo(
    () => mergeToastTheme(inheritedTheme, themeOverride),
    [inheritedTheme, themeOverride],
  );
  const [toasts, setToasts] = useState<readonly ToastRecord[]>([]);
  const nextToastNumber = useRef(0);
  const resolvedPosition = resolveToastPosition(position);
  const resolvedStack = resolveToastStack(stack);
  const resolvedSwipeDirections = resolveToastSwipeDirections(swipeDirections);

  const dismiss = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      const id =
        options.id ?? `toast-${Date.now()}-${nextToastNumber.current++}`;

      resolveToastTimeoutMs(options.durationMs);
      setToasts((currentToasts) => {
        const matchingToast = currentToasts.find((toast) => toast.id === id);
        const nextToast: ToastRecord = {
          ...options,
          id,
          message: options.message,
          repeatCount: resolveToastRepeatCount(
            matchingToast?.repeatCount ?? 0,
            matchingToast !== undefined,
          ),
          revision: (matchingToast?.revision ?? -1) + 1,
        };

        return [
          nextToast,
          ...currentToasts.filter((toast) => toast.id !== id),
        ].slice(0, maxToasts);
      });

      return id;
    },
    [maxToasts],
  );

  const value = useMemo(
    () => ({
      dismiss,
      dismissAll,
      maxToasts,
      position: resolvedPosition,
      show,
      stack: resolvedStack,
      swipeDirections: resolvedSwipeDirections,
      theme,
      toasts,
    }),
    [
      dismiss,
      dismissAll,
      maxToasts,
      resolvedPosition,
      resolvedStack,
      resolvedSwipeDirections,
      show,
      theme,
      toasts,
    ],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

/** Reads the nearest {@link ToastProvider} API. */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider.");
  }

  return context;
}

/** Renders visible notifications at the screen edge configured by {@link ToastProvider}. */
export function ToastViewport({ testID }: ToastViewportProps) {
  const context = useContext(ToastContext);
  const insets = useSafeAreaInsets();
  const [isDeckExpanded, setIsDeckExpanded] = useState(false);
  if (!context) {
    throw new Error("ToastViewport must be used inside a ToastProvider.");
  }

  const {
    dismiss,
    maxToasts,
    position,
    stack,
    swipeDirections,
    theme,
    toasts,
  } = context;
  const visibleToasts = toasts.slice(0, maxToasts);
  const presentationStack = resolveToastPresentationStack(
    stack,
    isDeckExpanded,
  );
  const edgeOffset = (position === "top" ? insets.top : insets.bottom) + 12;

  useEffect(() => {
    if (stack !== "deck" || visibleToasts.length < 2) {
      setIsDeckExpanded(false);
    }
  }, [stack, visibleToasts.length]);

  return (
    <View pointerEvents="box-none" style={styles.viewport} testID={testID}>
      <View
        pointerEvents="box-none"
        style={[
          styles.stack,
          position === "top"
            ? { top: edgeOffset }
            : { bottom: edgeOffset },
          stack === "deck" && styles.deck,
        ]}
      >
        {visibleToasts.map((toast, index) => (
          <ToastItem
            dismiss={dismiss}
            onExpand={
              stack === "deck" &&
              !isDeckExpanded &&
              index === 0 &&
              visibleToasts.length > 1
                ? () => setIsDeckExpanded(true)
                : undefined
            }
            index={index}
            key={toast.id}
            position={position}
            stack={presentationStack}
            swipeDirections={swipeDirections}
            theme={theme}
            toast={toast}
          />
        ))}
      </View>
    </View>
  );
}

type ToastItemProps = {
  dismiss: (id: string) => void;
  index: number;
  onExpand?: () => void;
  position: ToastPosition;
  stack: ToastStack;
  swipeDirections: readonly ToastSwipeDirection[];
  theme: ResolvedToastTheme;
  toast: ToastRecord;
};

function ToastItem({
  dismiss,
  index,
  onExpand,
  position,
  stack,
  swipeDirections,
  theme,
  toast,
}: ToastItemProps) {
  const timeoutMs = resolveToastTimeoutMs(toast.durationMs);
  const tokens = resolveToastTokens(theme, toast.theme);
  const shouldReduceMotion = useReducedMotion();
  const repeatOpacity = useSharedValue(1);
  const repeatScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isSwipeDismissed = useSharedValue(false);
  const supportsLeft = swipeDirections.includes("left");
  const supportsRight = swipeDirections.includes("right");
  const supportsUp = swipeDirections.includes("up");
  const supportsDown = swipeDirections.includes("down");
  const supportsHorizontal = supportsLeft || supportsRight;
  const supportsVertical = supportsUp || supportsDown;
  const isSwipeEnabled = supportsHorizontal || supportsVertical;

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));
  const repeatStyle = useAnimatedStyle(() => ({
    opacity: repeatOpacity.value,
    transform: [{ scale: repeatScale.value }],
  }));

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isSwipeEnabled)
        .minDistance(4)
        .onUpdate((event) => {
          const isHorizontalDrag =
            supportsHorizontal &&
            (!supportsVertical ||
              Math.abs(event.translationX) >= Math.abs(event.translationY));

          if (isHorizontalDrag) {
            const isAllowed =
              event.translationX < 0 ? supportsLeft : supportsRight;
            translateX.value = isAllowed
              ? event.translationX
              : event.translationX * 0.16;
            translateY.value = 0;
            return;
          }

          const isAllowed = event.translationY < 0 ? supportsUp : supportsDown;
          translateX.value = 0;
          translateY.value = isAllowed
            ? event.translationY
            : event.translationY * 0.16;
        })
        .onEnd((event) => {
          const isHorizontalDrag =
            supportsHorizontal &&
            (!supportsVertical ||
              Math.abs(event.translationX) >= Math.abs(event.translationY));
          const translation = isHorizontalDrag
            ? event.translationX
            : event.translationY;
          const velocity = isHorizontalDrag ? event.velocityX : event.velocityY;
          const isAllowed = isHorizontalDrag
            ? translation < 0
              ? supportsLeft
              : supportsRight
            : translation < 0
              ? supportsUp
              : supportsDown;
          const shouldDismiss =
            isAllowed &&
            (Math.abs(translation) >= SWIPE_DISMISS_DISTANCE ||
              Math.abs(velocity) >= SWIPE_DISMISS_VELOCITY);

          if (shouldDismiss && !isSwipeDismissed.value) {
            isSwipeDismissed.value = true;
            const exitDistance =
              Math.sign(translation || velocity || 1) * SWIPE_EXIT_DISTANCE;
            if (isHorizontalDrag) {
              translateX.value = withTiming(
                exitDistance,
                {
                  duration: 180,
                  easing: TOAST_EASING,
                  reduceMotion: ReduceMotion.System,
                },
                (finished) => {
                  if (finished) scheduleOnRN(dismiss, toast.id);
                },
              );
              return;
            }

            translateY.value = withTiming(
              exitDistance,
              {
                duration: 180,
                easing: TOAST_EASING,
                reduceMotion: ReduceMotion.System,
              },
              (finished) => {
                if (finished) scheduleOnRN(dismiss, toast.id);
              },
            );
            return;
          }

          translateX.value = withSpring(0, {
            damping: 18,
            reduceMotion: ReduceMotion.System,
            stiffness: 240,
            velocity: event.velocityX,
          });
          translateY.value = withSpring(0, {
            damping: 18,
            reduceMotion: ReduceMotion.System,
            stiffness: 240,
            velocity: event.velocityY,
          });
        }),
    [
      dismiss,
      isSwipeEnabled,
      isSwipeDismissed,
      supportsDown,
      supportsHorizontal,
      supportsLeft,
      supportsRight,
      supportsUp,
      supportsVertical,
      toast.id,
      translateX,
      translateY,
    ],
  );

  useEffect(() => {
    if (toast.repeatCount === 0) return;

    if (shouldReduceMotion) {
      repeatScale.value = 1;
      repeatOpacity.value = withSequence(
        withTiming(0.82, {
          duration: 70,
          easing: Easing.out(Easing.quad),
          reduceMotion: ReduceMotion.Never,
        }),
        withTiming(1, {
          duration: 130,
          easing: TOAST_EASING,
          reduceMotion: ReduceMotion.Never,
        }),
      );
      return;
    }

    repeatOpacity.value = 1;
    repeatScale.value = withSequence(
      withTiming(1.03, {
        duration: 80,
        easing: Easing.out(Easing.quad),
        reduceMotion: ReduceMotion.Never,
      }),
      withTiming(1, {
        duration: 130,
        easing: TOAST_EASING,
        reduceMotion: ReduceMotion.Never,
      }),
    );
  }, [
    repeatOpacity,
    repeatScale,
    shouldReduceMotion,
    toast.repeatCount,
  ]);

  useEffect(() => {
    if (timeoutMs === null) return;

    const timeout = setTimeout(() => dismiss(toast.id), timeoutMs);
    return () => clearTimeout(timeout);
  }, [dismiss, timeoutMs, toast.id, toast.revision]);

  const deckStyle: StyleProp<ViewStyle> =
    stack === "deck"
      ? [
          styles.deckPosition,
          position === "top" ? { top: index * 10 } : { bottom: index * 10 },
          { zIndex: 10 - index },
        ]
      : undefined;
  const deckAppearanceStyle: StyleProp<ViewStyle> =
    stack === "deck"
      ? [
          styles.deckAppearance,
          {
            opacity: 1 - index * 0.16,
            transform: [{ scale: 1 - index * 0.035 }],
          },
        ]
      : undefined;

  return (
    <Animated.View
      layout={TOAST_LAYOUT}
      pointerEvents={stack === "deck" && index > 0 ? "none" : "auto"}
      style={[styles.toastWrapper, deckStyle]}
    >
      <Animated.View style={[styles.toastContent, deckAppearanceStyle]}>
        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={[styles.toastContent, swipeStyle]}>
            <Animated.View style={[styles.toastContent, repeatStyle]}>
              <Animated.View
                entering={position === "top" ? ENTER_FROM_TOP : ENTER_FROM_BOTTOM}
                exiting={position === "top" ? EXIT_TO_TOP : EXIT_TO_BOTTOM}
                style={styles.toastContent}
              >
                <ToastSurface
                  dismiss={dismiss}
                  onExpand={onExpand}
                  toast={toast}
                  tokens={tokens}
                />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
  stack: {
    left: 20,
    position: "absolute",
    right: 20,
  },
  deck: {
    minHeight: 70,
  },
  toastWrapper: {
    marginBottom: 10,
    width: "100%",
  },
  toastContent: {
    width: "100%",
  },
  deckPosition: {
    left: 0,
    marginBottom: 0,
    position: "absolute",
    right: 0,
  },
  deckAppearance: {
    width: "100%",
  },
});
