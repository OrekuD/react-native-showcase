import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { X } from "lucide-react-native";
import { Portal } from "@rn-primitives/portal";
import { Fragment, useCallback, useEffect } from "react";
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type AlertButton,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  ReduceMotion,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ConfirmationDialogRequest } from "./confirmationDialogStore";
import type { ConfirmationDialogVariant } from "./confirmationDialogState";

type ConfirmationDialogOverlayProps = {
  onDismiss: () => void;
  onSelect: (button: AlertButton) => void;
  portalName: string;
  request: ConfirmationDialogRequest;
};

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const BACKDROP_ENTERING = FadeIn.duration(180)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);
const BACKDROP_EXITING = FadeOut.duration(130)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);
const CONTENT_ENTERING = ZoomIn.duration(220)
  .easing(EASE_OUT)
  .withInitialValues({ transform: [{ scale: 0.94 }] })
  .reduceMotion(ReduceMotion.System);
const CONTENT_EXITING = FadeOut.duration(130)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

function ConfirmationDialogAction({
  button,
  containerStyle,
  onPress,
  variant,
}: {
  button: AlertButton;
  containerStyle?: StyleProp<ViewStyle>;
  onPress: (button: AlertButton) => void;
  variant: ConfirmationDialogVariant;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const isActionSheet = variant === "action-sheet";
  const isCompact = variant === "compact";
  const isProminent = variant === "prominent";
  const isCancel = button.style === "cancel";
  const isDestructive = button.style === "destructive";
  const label = button.text ?? "OK";

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, {
      duration: 120,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    });
  }, [scale]);
  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: 90,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    });
  }, [scale]);
  const handlePress = useCallback(
    (_event: GestureResponderEvent) => onPress(button),
    [button, onPress]
  );

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <FastSquircleView
        cornerSmoothing={isActionSheet ? 0 : 0.88}
        style={[
          styles.actionFrame,
          isActionSheet && styles.actionSheetActionFrame,
          isCompact && styles.compactActionFrame,
          isCancel && styles.cancelActionFrame,
          isDestructive && styles.destructiveActionFrame,
          isActionSheet && isCancel && styles.actionSheetCancelActionFrame,
          isActionSheet && isDestructive && styles.actionSheetDestructiveFrame,
          isProminent && styles.prominentActionFrame,
          isProminent && isCancel && styles.prominentCancelActionFrame,
        ]}
      >
        <Pressable
          accessibilityLabel={label}
          accessibilityRole="button"
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.actionPressable,
            isActionSheet && styles.actionSheetActionPressable,
            isCompact && styles.compactActionPressable,
            isProminent && styles.prominentActionPressable,
          ]}
        >
          <Text
            style={[
              styles.actionLabel,
              isActionSheet && styles.actionSheetActionLabel,
              isCancel && styles.cancelActionLabel,
              isDestructive && styles.destructiveActionLabel,
              isActionSheet && isCancel && styles.actionSheetCancelActionLabel,
              isActionSheet &&
                isDestructive &&
                styles.actionSheetDestructiveLabel,
              isProminent && styles.prominentActionLabel,
              isProminent && isCancel && styles.prominentCancelActionLabel,
            ]}
          >
            {label}
          </Text>
        </Pressable>
      </FastSquircleView>
    </Animated.View>
  );
}

/** Renders a custom dialog above the app through the default Portal host. */
export function ConfirmationDialogOverlay({
  onDismiss,
  onSelect,
  portalName,
  request,
}: ConfirmationDialogOverlayProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cancelable = request.cancelable ?? true;
  const variant = request.variant ?? "compact";
  const isActionSheet = variant === "action-sheet";
  const isCompact = variant === "compact";
  const isProminent = variant === "prominent";
  const panelWidth = Math.min(
    Math.max(width - (isProminent ? 48 : 72), 280),
    isProminent ? 480 : 368
  );
  const useGlassBackdrop = Platform.OS === "ios" && isGlassEffectAPIAvailable();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (cancelable) onDismiss();

        return true;
      }
    );

    return () => subscription.remove();
  }, [cancelable, onDismiss]);

  const displayButtons = isProminent
    ? [
        ...request.buttons.filter((button) => button.style !== "cancel"),
        ...request.buttons.filter((button) => button.style === "cancel"),
      ]
    : request.buttons;
  const actions = displayButtons.map((button, index) => (
    <Fragment key={`${button.text ?? "OK"}-${index}`}>
      {isActionSheet && index > 0 ? (
        <View style={styles.actionSheetSeparator} />
      ) : null}
      <ConfirmationDialogAction
        button={button}
        containerStyle={isCompact ? styles.compactAction : undefined}
        onPress={onSelect}
        variant={variant}
      />
    </Fragment>
  ));
  const panel = (
    <FastSquircleView
      cornerSmoothing={0.82}
      style={[
        styles.panel,
        { width: panelWidth },
        isActionSheet && styles.actionSheetPanel,
        isProminent && styles.prominentPanel,
      ]}
    >
      <View pointerEvents="none" style={styles.panelSurface} />
      <View
        style={[
          styles.panelContent,
          isActionSheet && styles.actionSheetPanelContent,
          isCompact && styles.compactPanelContent,
          isProminent && styles.prominentPanelContent,
        ]}
      >
        {request.dismissible && !isActionSheet ? (
          <Pressable
            accessibilityLabel="Dismiss confirmation dialog"
            accessibilityRole="button"
            disabled={!cancelable}
            hitSlop={8}
            onPress={onDismiss}
            style={[
              styles.dismissButton,
              isCompact && styles.compactDismissButton,
            ]}
          >
            <X
              color="#1D1D1B"
              size={isCompact ? 17 : isProminent ? 28 : 24}
              strokeWidth={2}
            />
          </Pressable>
        ) : null}
        <View
          style={[
            styles.copyBlock,
            isActionSheet && styles.actionSheetCopyBlock,
            isProminent && styles.prominentCopyBlock,
          ]}
        >
          <Text style={[styles.title, isProminent && styles.prominentTitle]}>
            {request.title}
          </Text>
          {request.description ? (
            <Text
              style={[
                styles.description,
                isProminent && styles.prominentDescription,
              ]}
            >
              {request.description}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.actionStack,
            isActionSheet && styles.actionSheetActionStack,
            isCompact && styles.compactActionStack,
            isProminent && styles.prominentActionStack,
          ]}
        >
          {actions}
        </View>
      </View>
    </FastSquircleView>
  );

  return (
    <Portal name={portalName}>
      <View accessibilityViewIsModal style={styles.overlay}>
        {useGlassBackdrop ? (
          <>
            <GlassView
              glassEffectStyle="clear"
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
              tintColor="rgba(27, 23, 24, 0.24)"
            />
            <Pressable
              accessibilityLabel="Dismiss confirmation dialog"
              accessibilityRole="button"
              disabled={!cancelable}
              onPress={onDismiss}
              style={styles.glassBackdropPressable}
            />
          </>
        ) : (
          <Animated.View
            entering={BACKDROP_ENTERING}
            exiting={BACKDROP_EXITING}
            style={StyleSheet.absoluteFill}
          >
            <Pressable
              accessibilityLabel="Dismiss confirmation dialog"
              accessibilityRole="button"
              disabled={!cancelable}
              onPress={onDismiss}
              style={styles.backdrop}
            />
          </Animated.View>
        )}
        <View
          pointerEvents="box-none"
          style={[
            styles.contentWrap,
            {
              paddingBottom: Math.max(insets.bottom, 20),
              paddingTop: Math.max(insets.top, 20),
            },
          ]}
        >
          <Animated.View entering={CONTENT_ENTERING} exiting={CONTENT_EXITING}>
            {panel}
          </Animated.View>
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(20, 19, 17, 0.28)",
  },
  glassBackdropPressable: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(20, 19, 17, 0.08)",
  },
  contentWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  panel: {
    borderColor: "rgba(255, 255, 255, 0.88)",
    borderRadius: 26,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#1D1D1B",
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
  },
  actionSheetPanel: {
    borderRadius: 22,
  },
  prominentPanel: {
    borderRadius: 34,
  },
  panelSurface: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 254, 250, 0.98)",
  },
  panelContent: {
    gap: 22,
    padding: 18,
  },
  actionSheetPanelContent: {
    gap: 0,
    padding: 0,
  },
  compactPanelContent: {
    paddingTop: 30,
  },
  prominentPanelContent: {
    gap: 24,
    padding: 28,
    paddingTop: 20,
  },
  dismissButton: {
    alignItems: "center",
    backgroundColor: "rgba(237, 236, 231, 0.84)",
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    position: "absolute",
    right: 18,
    top: 18,
    width: 48,
    zIndex: 1,
  },
  compactDismissButton: {
    height: 34,
    right: 16,
    top: 16,
    width: 34,
  },
  copyBlock: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  actionSheetCopyBlock: {
    paddingBottom: 26,
    paddingHorizontal: 30,
    paddingTop: 34,
  },
  prominentCopyBlock: {
    alignItems: "flex-start",
    gap: 20,
    paddingHorizontal: 0,
    paddingRight: 28,
    paddingTop: 38,
  },
  title: {
    color: "#171716",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.42,
    lineHeight: 26,
    textAlign: "center",
  },
  prominentTitle: {
    fontSize: 38,
    letterSpacing: -1.3,
    lineHeight: 43,
    textAlign: "left",
  },
  description: {
    color: "#6E6B65",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 21,
    textAlign: "center",
  },
  prominentDescription: {
    color: "#57544F",
    fontSize: 17,
    lineHeight: 25,
    textAlign: "left",
  },
  actionStack: {
    gap: 10,
  },
  actionSheetActionStack: {
    gap: 0,
  },
  compactActionStack: {
    flexDirection: "row",
  },
  prominentActionStack: {
    gap: 14,
  },
  compactAction: {
    flex: 1,
  },
  actionFrame: {
    backgroundColor: "#1D1D1B",
    borderRadius: 18,
    overflow: "hidden",
  },
  actionSheetActionFrame: {
    backgroundColor: "transparent",
    borderRadius: 0,
  },
  compactActionFrame: {
    borderRadius: 999,
    height: 48,
  },
  actionSheetSeparator: {
    backgroundColor: "rgba(29, 29, 27, 0.14)",
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  actionSheetDestructiveFrame: {
    backgroundColor: "transparent",
  },
  actionSheetCancelActionFrame: {
    borderColor: "transparent",
    borderWidth: 0,
  },
  cancelActionFrame: {
    backgroundColor: "transparent",
    borderColor: "#1D1D1B",
    borderWidth: 1.5,
  },
  destructiveActionFrame: {
    backgroundColor: "#B73C36",
    borderColor: "transparent",
    borderWidth: 0,
  },
  prominentActionFrame: {
    borderRadius: 999,
    height: 72,
  },
  prominentCancelActionFrame: {
    borderColor: "#31420F",
    borderWidth: 1.5,
  },
  actionPressable: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 20,
  },
  actionSheetActionPressable: {
    minHeight: 64,
  },
  compactActionPressable: {
    height: 48,
    minHeight: 48,
  },
  prominentActionPressable: {
    height: 72,
    minHeight: 72,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  actionSheetActionLabel: {
    color: "#1D1D1B",
    fontSize: 18,
    fontWeight: "500",
  },
  actionSheetDestructiveLabel: {
    color: "#D91947",
    fontWeight: "600",
  },
  actionSheetCancelActionLabel: {
    fontWeight: "500",
  },
  cancelActionLabel: {
    color: "#1D1D1B",
    fontWeight: "600",
  },
  destructiveActionLabel: {
    color: "#FFFFFF",
  },
  prominentActionLabel: {
    fontSize: 19,
  },
  prominentCancelActionLabel: {
    color: "#31420F",
  },
});
