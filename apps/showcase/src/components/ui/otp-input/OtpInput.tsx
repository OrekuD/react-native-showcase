import { forwardRef, useMemo, type ComponentProps } from "react";
import FastSquircleView from "react-native-fast-squircle";
import {
  OTPInput as NativeOtpInput,
  type OTPInputRef,
  type SlotProps,
} from "input-otp-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ColorValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  resolveOtpInputSize,
  resolveOtpInputVariant,
  shouldRenderInlineOtpGroups,
  shouldRenderOtpSeparator,
  type OtpInputSize,
  type OtpInputVariant,
} from "./otpState";
import type { ResolvedOtpInputTheme } from "./otpTheme";
import { useOtpInputTheme } from "./OtpInputThemeProvider";

export type { OTPInputRef as OtpInputRef } from "input-otp-native";
export type { OtpInputSize, OtpInputVariant } from "./otpState";
export type { OtpInputColorTheme, OtpInputTheme } from "./otpTheme";
export { OtpInputThemeProvider } from "./OtpInputThemeProvider";
export type { OtpInputThemeProviderProps } from "./OtpInputThemeProvider";

type NativeOtpInputProps = ComponentProps<typeof NativeOtpInput>;

/** Props accepted by the Showcase OTP input. */
export type OtpInputProps = Omit<
  NativeOtpInputProps,
  | "containerStyle"
  | "maxLength"
  | "onChange"
  | "onComplete"
  | "render"
  | "style"
> & {
  /** Overrides the active cell and cursor colors together for this input. */
  focusColor?: ColorValue;
  /** Number of cells rendered in the OTP input. @default 6 */
  numberOfDigits?: number;
  /** Called whenever the entered value changes. */
  onTextChange?: (value: string) => void;
  /** Called when every OTP cell has been filled. */
  onFilled?: (value: string) => void;
  /** Renders a visual divider between the two halves of an even-length code. */
  separator?: boolean;
  /** Selects the control scale. @default 'lg' */
  size?: OtpInputSize;
  /** Styles the outer OTP input wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Identifier applied to the outer OTP input wrapper. */
  testID?: string;
  /** Selects the visual treatment. @default 'outline' */
  variant?: OtpInputVariant;
};

type OtpSizeMetrics = {
  cellGap: number;
  cellHeight: number;
  cellRadius: number;
  cellWidth: number;
  fontSize: number;
  inlineCellWidth: number;
  inlineHeight: number;
  inlineRadius: number;
  inlineSeparatorGap: number;
  lineHeight: number;
  separatorGap: number;
  separatorWidth: number;
  underlineFontSize: number;
};

type SlotViewProps = {
  colors: ResolvedOtpInputTheme["colors"];
  metrics: OtpSizeMetrics;
  secureTextEntry: boolean;
  slot: SlotProps;
  variant: Exclude<OtpInputVariant, "inline">;
};

type OtpSlotsProps = {
  colors: ResolvedOtpInputTheme["colors"];
  metrics: OtpSizeMetrics;
  numberOfDigits: number;
  secureTextEntry: boolean;
  separator: boolean;
  slots: SlotProps[];
  variant: OtpInputVariant;
};

type OtpSlotEntry = {
  id: string;
  slot: SlotProps;
};

const OTP_SIZE_METRICS: Record<OtpInputSize, OtpSizeMetrics> = {
  sm: {
    cellGap: 8,
    cellHeight: 46,
    cellRadius: 12,
    cellWidth: 36,
    fontSize: 24,
    inlineCellWidth: 36,
    inlineHeight: 62,
    inlineRadius: 18,
    inlineSeparatorGap: 12,
    lineHeight: 30,
    separatorGap: 6,
    separatorWidth: 12,
    underlineFontSize: 27,
  },
  lg: {
    cellGap: 10,
    cellHeight: 58,
    cellRadius: 15,
    cellWidth: 44,
    fontSize: 30,
    inlineCellWidth: 44,
    inlineHeight: 76,
    inlineRadius: 20,
    inlineSeparatorGap: 16,
    lineHeight: 36,
    separatorGap: 6,
    separatorWidth: 14,
    underlineFontSize: 34,
  },
};

function getSlotCharacter(slot: SlotProps, secureTextEntry: boolean) {
  if (slot.char) {
    return secureTextEntry ? "•" : slot.char;
  }

  return slot.placeholderChar ?? "";
}

function OtpCursor({
  cursorColor,
  height,
}: {
  cursorColor: ColorValue;
  height: number;
}) {
  return (
    <View style={[styles.cursor, { backgroundColor: cursorColor, height }]} />
  );
}

function OtpSlot({
  colors,
  metrics,
  secureTextEntry,
  slot,
  variant,
}: SlotViewProps) {
  const isUnderline = variant === "underline";
  const isPlaceholder = slot.char === null;

  return (
    <Pressable onPress={slot.focus}>
      <View
        style={[
          styles.cell,
          {
            borderBottomColor: isUnderline
              ? slot.isActive
                ? colors.focus
                : colors.underline
              : undefined,
            borderBottomWidth: isUnderline
              ? metrics.cellHeight > 50
                ? 3
                : 2
              : variant === "outline"
              ? 1.5
              : 2,
            borderColor:
              !isUnderline && slot.isActive
                ? colors.focus
                : variant === "outline"
                ? colors.outlineBorder
                : "transparent",
            borderRadius: isUnderline ? 0 : metrics.cellRadius,
            borderWidth: isUnderline ? 0 : variant === "outline" ? 1.5 : 2,
            height: metrics.cellHeight,
            width: metrics.cellWidth,
          },
          variant === "filled" && { backgroundColor: colors.surface },
          isUnderline && styles.transparentCell,
        ]}
      >
        {slot.hasFakeCaret ? (
          <OtpCursor
            cursorColor={colors.cursor}
            height={Math.round(metrics.cellHeight * 0.45)}
          />
        ) : (
          <Text
            style={[
              styles.character,
              {
                color: isPlaceholder ? colors.placeholder : colors.text,
                fontSize: isUnderline
                  ? metrics.underlineFontSize
                  : metrics.fontSize,
                fontWeight: isUnderline ? "400" : "600",
                lineHeight: metrics.lineHeight,
              },
            ]}
          >
            {getSlotCharacter(slot, secureTextEntry)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function InlineSlot({
  colors,
  hasLeadingDivider,
  metrics,
  secureTextEntry,
  slot,
}: Omit<SlotViewProps, "variant"> & { hasLeadingDivider: boolean }) {
  const isPlaceholder = slot.char === null;

  return (
    <Pressable onPress={slot.focus}>
      <View
        style={[
          styles.inlineCell,
          {
            height: metrics.inlineHeight,
            width: metrics.inlineCellWidth,
          },
          hasLeadingDivider && styles.inlineCellDivider,
          hasLeadingDivider && { borderLeftColor: colors.inlineDivider },
        ]}
      >
        {slot.hasFakeCaret ? (
          <OtpCursor
            cursorColor={colors.cursor}
            height={Math.round(metrics.inlineHeight * 0.4)}
          />
        ) : (
          <Text
            style={[
              styles.character,
              {
                color: isPlaceholder ? colors.placeholder : colors.text,
                fontSize: metrics.fontSize,
                fontWeight: "600",
                lineHeight: metrics.lineHeight,
              },
            ]}
          >
            {getSlotCharacter(slot, secureTextEntry)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function InlineGroup({
  colors,
  metrics,
  secureTextEntry,
  entries,
}: Omit<SlotViewProps, "slot" | "variant"> & { entries: OtpSlotEntry[] }) {
  let isFirstSlot = true;

  return (
    <FastSquircleView
      cornerSmoothing={0.7}
      style={[
        styles.inlineGroup,
        {
          backgroundColor: colors.surface,
          borderRadius: metrics.inlineRadius,
          height: metrics.inlineHeight,
        },
      ]}
    >
      {entries.map((entry) => {
        const hasLeadingDivider = !isFirstSlot;
        isFirstSlot = false;

        return (
          <InlineSlot
            colors={colors}
            hasLeadingDivider={hasLeadingDivider}
            key={entry.id}
            metrics={metrics}
            secureTextEntry={secureTextEntry}
            slot={entry.slot}
          />
        );
      })}
    </FastSquircleView>
  );
}

function SlotRow({
  colors,
  metrics,
  secureTextEntry,
  entries,
  variant,
}: Omit<SlotViewProps, "slot"> & { entries: OtpSlotEntry[] }) {
  return (
    <View style={[styles.slotRow, { gap: metrics.cellGap }]}>
      {entries.map((entry) => (
        <OtpSlot
          colors={colors}
          key={entry.id}
          metrics={metrics}
          secureTextEntry={secureTextEntry}
          slot={entry.slot}
          variant={variant}
        />
      ))}
    </View>
  );
}

function OtpSlots({
  colors,
  metrics,
  numberOfDigits,
  secureTextEntry,
  separator,
  slots,
  variant,
}: OtpSlotsProps) {
  let slotPosition = 0;
  const entries = slots.map((slot) => ({
    id: `otp-slot-${slotPosition++}`,
    slot,
  }));
  const showSeparator = shouldRenderOtpSeparator({
    numberOfDigits,
    separator,
  });
  const showInlineGroups = shouldRenderInlineOtpGroups({
    numberOfDigits,
    separator,
    variant,
  });

  if (variant === "inline") {
    const splitIndex = numberOfDigits / 2;

    return (
      <View
        style={[
          styles.inlineRow,
          showInlineGroups && { gap: metrics.inlineSeparatorGap },
        ]}
      >
        {showInlineGroups ? (
          <>
            <InlineGroup
              colors={colors}
              metrics={metrics}
              secureTextEntry={secureTextEntry}
              entries={entries.slice(0, splitIndex)}
            />
            <View
              style={[
                styles.separator,
                {
                  backgroundColor: colors.separator,
                  width: metrics.separatorWidth,
                },
              ]}
            />
            <InlineGroup
              colors={colors}
              metrics={metrics}
              secureTextEntry={secureTextEntry}
              entries={entries.slice(splitIndex)}
            />
          </>
        ) : (
          <InlineGroup
            colors={colors}
            metrics={metrics}
            secureTextEntry={secureTextEntry}
            entries={entries}
          />
        )}
      </View>
    );
  }

  if (showSeparator) {
    const splitIndex = numberOfDigits / 2;

    return (
      <View
        style={[
          styles.splitRow,
          {
            gap: metrics.separatorGap,
            paddingTop: 10,
            paddingBottom: 10,
          },
        ]}
      >
        <SlotRow
          colors={colors}
          metrics={metrics}
          secureTextEntry={secureTextEntry}
          entries={entries.slice(0, splitIndex)}
          variant={variant}
        />
        <View
          style={[
            styles.separator,
            {
              backgroundColor: colors.separator,
              width: metrics.separatorWidth,
            },
          ]}
        />
        <SlotRow
          colors={colors}
          metrics={metrics}
          secureTextEntry={secureTextEntry}
          entries={entries.slice(splitIndex)}
          variant={variant}
        />
      </View>
    );
  }

  return (
    <SlotRow
      colors={colors}
      metrics={metrics}
      secureTextEntry={secureTextEntry}
      entries={entries}
      variant={variant}
    />
  );
}

/**
 * A styled wrapper around input-otp-native with reusable OTP treatments.
 * Pass normal TextInput behavior props directly, including value and inputMode.
 */
export const OtpInput = forwardRef<OTPInputRef, OtpInputProps>(
  function OtpInput(
    {
      focusColor,
      numberOfDigits = 6,
      onFilled,
      onTextChange,
      secureTextEntry = false,
      separator = false,
      size,
      style,
      testID,
      variant,
      ...props
    },
    ref
  ) {
    const inheritedTheme = useOtpInputTheme();
    const resolvedSize = resolveOtpInputSize(size);
    const resolvedVariant = resolveOtpInputVariant(variant);
    const metrics = OTP_SIZE_METRICS[resolvedSize];
    const colors = useMemo(() => {
      if (focusColor === undefined) return inheritedTheme.colors;

      return {
        ...inheritedTheme.colors,
        cursor: focusColor,
        focus: focusColor,
      };
    }, [focusColor, inheritedTheme.colors]);

    return (
      <View style={[styles.root, style]} testID={testID}>
        <NativeOtpInput
          {...props}
          maxLength={numberOfDigits}
          onChange={onTextChange}
          onComplete={onFilled}
          ref={ref}
          secureTextEntry={secureTextEntry}
          style={styles.hiddenNativeInput}
          render={({ slots }) => (
            <OtpSlots
              colors={colors}
              metrics={metrics}
              numberOfDigits={numberOfDigits}
              secureTextEntry={secureTextEntry}
              separator={separator}
              slots={slots}
              variant={resolvedVariant}
            />
          )}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    width: "100%",
  },
  hiddenNativeInput: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    color: "transparent",
  },
  slotRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  splitRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  cell: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  transparentCell: {
    backgroundColor: "transparent",
  },
  character: {
    includeFontPadding: false,
    textAlign: "center",
  },
  cursor: {
    borderRadius: 1,
    width: 2,
  },
  separator: {
    borderRadius: 1,
    height: 2,
  },
  inlineRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  inlineGroup: {
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
  },
  inlineCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  inlineCellDivider: {
    borderLeftWidth: 1,
  },
});
