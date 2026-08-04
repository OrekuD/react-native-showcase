import { Pressable, StyleSheet, Text, View } from "react-native";
import FastSquircleView from "react-native-fast-squircle";

import { createOutsetShadow } from "../outsetShadow";
import type { ToastOptions } from "./Toast";
import type { ResolvedToastTokens } from "./toastTheme";

type ToastSurfaceToast = Omit<ToastOptions, "id"> & { id: string };

type ToastSurfaceProps = {
  dismiss: (id: string) => void;
  onExpand?: () => void;
  toast: ToastSurfaceToast;
  tokens: ResolvedToastTokens;
};

/** Renders the interactive visual surface shared by every visible toast. */
export function ToastSurface({
  dismiss,
  onExpand,
  toast,
  tokens,
}: ToastSurfaceProps) {
  return (
    <Pressable
      accessibilityLabel={onExpand ? "Show all notifications" : undefined}
      accessibilityRole={onExpand ? "button" : undefined}
      disabled={!onExpand}
      onPress={onExpand}
    >
      <FastSquircleView
        cornerSmoothing={tokens.cornerSmoothing}
        style={[
          styles.surface,
          {
            backgroundColor: tokens.surface.backgroundColor,
            borderColor: tokens.surface.borderColor,
            borderRadius: tokens.borderRadius,
            gap: tokens.layout.gap,
            minHeight: tokens.layout.minHeight,
            paddingHorizontal: tokens.layout.paddingHorizontal,
            paddingVertical: tokens.layout.paddingVertical,
          },
          createOutsetShadow({
            blurRadius: 20,
            color: tokens.shadowColor,
            elevation: 8,
            offsetY: 12,
            opacity: 0.14,
          }),
        ]}
      >
        {toast.icon ? (
          <View
            style={[
              styles.icon,
              {
                backgroundColor: tokens.surface.iconBackgroundColor,
                borderRadius: tokens.layout.iconSize / 2,
                height: tokens.layout.iconSize,
                width: tokens.layout.iconSize,
              },
            ]}
          >
            {toast.icon}
          </View>
        ) : null}
        <Text
          style={[
            styles.message,
            {
              color: tokens.surface.labelColor,
              fontSize: tokens.label.fontSize,
              fontWeight: tokens.label.fontWeight,
              letterSpacing: tokens.label.letterSpacing,
              lineHeight: tokens.label.lineHeight,
            },
          ]}
        >
          {toast.message}
        </Text>
        {toast.action ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              toast.action?.onPress();
              if (toast.action?.dismissOnPress ?? true) {
                dismiss(toast.id);
              }
            }}
            style={({ pressed }) => [
              styles.action,
              pressed && styles.actionPressed,
            ]}
          >
            <Text
              style={[
                styles.actionLabel,
                {
                  color: tokens.surface.actionColor,
                  fontSize: tokens.actionLabel.fontSize,
                  fontWeight: tokens.actionLabel.fontWeight,
                  letterSpacing: tokens.actionLabel.letterSpacing,
                  lineHeight: tokens.actionLabel.lineHeight,
                },
              ]}
            >
              {toast.action.label}
            </Text>
          </Pressable>
        ) : null}
        {toast.dismissible ? (
          <Pressable
            accessibilityLabel="Dismiss notification"
            accessibilityRole="button"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              dismiss(toast.id);
            }}
            style={({ pressed }) => [
              styles.dismiss,
              pressed && styles.dismissPressed,
            ]}
          >
            <Text
              style={[
                styles.dismissLabel,
                { color: tokens.surface.labelColor },
              ]}
            >
              ×
            </Text>
          </Pressable>
        ) : null}
      </FastSquircleView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    justifyContent: "center",
    minHeight: 32,
    transform: [{ scale: 1 }],
  },
  actionLabel: {
    textDecorationLine: "underline",
  },
  actionPressed: {
    opacity: 0.64,
    transform: [{ scale: 0.96 }],
  },
  dismiss: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    transform: [{ scale: 1 }],
    width: 32,
  },
  dismissLabel: {
    fontSize: 28,
    fontWeight: "400",
    lineHeight: 30,
  },
  dismissPressed: {
    opacity: 0.58,
    transform: [{ scale: 0.9 }],
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
  },
  surface: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
  },
});
