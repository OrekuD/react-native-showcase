import {
  TrueSheet,
  type TrueSheetProps,
} from "@lodev09/react-native-true-sheet";
import { useCallback } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import FastSquircleView from "react-native-fast-squircle";

import { createOutsetShadow } from "../outsetShadow";
import { ActionSheetDefaultItem } from "./ActionSheetDefaultItem";
import { isActionSheetCancellation } from "./actionSheetState";
import { DEFAULT_ACTION_SHEET_THEME } from "./actionSheetTheme";
import {
  type ActionSheetAction,
  type ActionSheetContentProps,
  useActionSheetContext,
} from "./actionSheetShared";

export function ActionSheetContent({
  cornerSmoothing,
  gap,
  inset,
  itemCornerSmoothing,
  itemLabelStyle,
  itemStyle,
  renderAction,
  showHandle,
  style,
  titleStyle,
}: ActionSheetContentProps) {
  const {
    actions,
    dismissReasonRef,
    dismissible,
    haptics,
    message,
    mode,
    onCustomDismiss,
    selectAction,
    sheetRef,
    theme,
    title,
  } = useActionSheetContext("ActionSheet.Content");
  const close = useCallback(() => {
    dismissReasonRef.current = "programmatic";
    void sheetRef.current?.dismiss();
  }, [dismissReasonRef, sheetRef]);

  const handleSelect = useCallback(
    (action: ActionSheetAction) => {
      dismissReasonRef.current = "selection";
      const dismissal = sheetRef.current?.dismiss();
      if (!dismissal) {
        selectAction(action);
        return;
      }
      void dismissal.then(
        () => selectAction(action),
        () => selectAction(action)
      );
    },
    [dismissReasonRef, selectAction, sheetRef]
  );

  if (mode === "native") return null;

  const detachedFrameBottomOffset = Platform.select({
    ios: 0,
    web: 0,
    default: theme.detachedOffset,
  });
  const horizontalInset =
    inset ??
    (Platform.OS === "ios" &&
    theme.horizontalInset === DEFAULT_ACTION_SHEET_THEME.horizontalInset
      ? 8
      : theme.horizontalInset);

  const sheetProps = {
    backgroundColor: "transparent",
    cornerRadius: 0,
    detached: true,
    detachedOffset: theme.detachedOffset,
    detents: ["auto"],
    dismissible,
    elevation: 0,
    grabber: false,
    onDidDismiss: () => {
      onCustomDismiss(isActionSheetCancellation(dismissReasonRef.current));
      dismissReasonRef.current = null;
    },
  } satisfies TrueSheetProps;

  return (
    <TrueSheet ref={sheetRef} {...sheetProps}>
      <View
        style={[
          styles.detachedFrame,
          {
            paddingBottom: detachedFrameBottomOffset,
            paddingHorizontal: horizontalInset,
          },
        ]}
      >
        <FastSquircleView
          cornerSmoothing={cornerSmoothing ?? theme.cornerSmoothing}
          style={[
            styles.panel,
            {
              backgroundColor: theme.backgroundColor,
              borderColor: theme.borderColor,
              borderRadius: theme.borderRadius,
              padding: theme.panelPadding,
            },
            createOutsetShadow({
              blurRadius: 24,
              color: theme.shadowColor,
              elevation: 10,
              offsetY: 12,
              opacity: theme.shadowOpacity,
            }),
            style,
          ]}
        >
          {(showHandle ?? theme.showHandle) ? (
            <View
              style={[styles.handle, { backgroundColor: theme.handleColor }]}
            />
          ) : null}
          {title || message ? (
            <View style={styles.header}>
              {title ? (
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.titleColor,
                      fontSize: theme.titleFontSize,
                      textAlign: theme.textAlign,
                    },
                    titleStyle,
                  ]}
                >
                  {title}
                </Text>
              ) : null}
              {message ? (
                <Text
                  style={[
                    styles.message,
                    { color: theme.messageColor, textAlign: theme.textAlign },
                  ]}
                >
                  {message}
                </Text>
              ) : null}
            </View>
          ) : null}
          <View style={{ gap: gap ?? theme.actionGap }}>
            {actions.map((action) => (
              <View key={action.id}>
                {action.separatorBefore ? (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: theme.separatorColor },
                    ]}
                  />
                ) : null}
                {renderAction ? (
                  renderAction(action, {
                    close,
                    select: () => handleSelect(action),
                    theme,
                  })
                ) : (
                  <ActionSheetDefaultItem
                    action={action}
                    haptics={haptics}
                    itemCornerSmoothing={
                      itemCornerSmoothing ?? theme.itemCornerSmoothing
                    }
                    itemLabelStyle={itemLabelStyle}
                    itemStyle={itemStyle}
                    onPress={() => handleSelect(action)}
                    theme={theme}
                  />
                )}
              </View>
            ))}
          </View>
        </FastSquircleView>
      </View>
    </TrueSheet>
  );
}

const styles = StyleSheet.create({
  detachedFrame: { paddingTop: 8 },
  handle: {
    alignSelf: "center",
    borderRadius: 2,
    height: 4,
    marginBottom: 6,
    marginTop: 2,
    width: 36,
  },
  header: { gap: 4, paddingBottom: 10, paddingHorizontal: 8, paddingTop: 4 },
  message: { fontSize: 13, lineHeight: 18 },
  panel: { borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 8 },
  title: { fontSize: 17, fontWeight: "600", letterSpacing: -0.25 },
});
