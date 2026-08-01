import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type ReactNode,
} from "react";
import { CircleX, Eye, EyeOff, type LucideProps } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  View,
  type PressableProps,
  type TextInputProps as NativeTextInputProps,
  type TextProps,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import FastSquircleView from "react-native-fast-squircle";

import {
  hasInputContent,
  resolveInputExternalLabelOffset,
  resolveInputFocusColors,
  resolveInputMessageTone,
  resolveInputHorizontalInsets,
  resolveInputSize,
  resolveInputStatus,
  type InputAppearance,
  type InputMessageTone,
  type InputSize,
  type InputStatus,
} from "./inputState";
import {
  resolveInputTokens,
  type InputThemeOverride,
  type ResolvedInputSizeTheme,
  type ResolvedInputTokens,
} from "./inputTheme";
import { useInputTheme } from "./InputThemeProvider";

export type { InputAppearance, InputSize } from "./inputState";
export type {
  InputAppearanceTheme,
  InputColorTheme,
  InputSizeTheme,
  InputTheme,
  InputThemeOverride,
} from "./inputTheme";
export { InputThemeProvider } from "./InputThemeProvider";
export type { InputThemeProviderProps } from "./InputThemeProvider";

type InputContextValue = {
  accessibilityLabel?: string;
  appearance: InputAppearance;
  colors: ResolvedInputTokens["colors"];
  disabled: boolean;
  fieldBackgroundColor: string;
  focusColor: string;
  focused: boolean;
  hasCustomTrailing: boolean;
  hasLabel: boolean;
  hasLeading: boolean;
  hasTrailing: boolean;
  iconColor: string;
  labelBackgroundColor: string;
  sizeTokens: ResolvedInputSizeTheme;
  secureEntry: boolean;
  secureVisible: boolean;
  setFocused: (focused: boolean) => void;
  status: InputStatus;
  toggleSecureEntry: () => void;
};

type InputRootProps = Omit<ViewProps, "children"> & {
  /** Accessible name applied to the native text field when it has no label. */
  accessibilityLabel?: string;
  /** Selects the visual treatment for the composed field. */
  appearance?: InputAppearance;
  /** Disables the field and its trailing actions. @default false */
  disabled?: boolean;
  /** Promotes the field to an error state without requiring an error message. */
  invalid?: boolean;
  /** Changes the focused border, label, caret, and active adornment color. */
  focusColor?: string;
  /** Color painted behind labels that overlap the field border. */
  labelBackgroundColor?: string;
  /** Controls field height, typography, spacing, and trailing touch targets. @default 'md' */
  size?: InputSize;
  /** Enables secure text entry and adds the default password visibility action. */
  secureEntry?: boolean;
  /** Selects the semantic visual state. @default 'default' */
  status?: InputStatus;
  /** Overrides theme tokens for this Input only. */
  theme?: InputThemeOverride;
  /** Styles the field shell without changing the outer message layout. */
  fieldStyle?: ViewStyle;
  children?: ReactNode;
};

export type InputProps = InputRootProps;

type InputLabelProps = TextProps & {
  children: ReactNode;
  required?: boolean;
};

type InputControlProps = NativeTextInputProps & {
  /** Adds a clear action while the input contains text. @default false */
  clearable?: boolean;
};

type InputTrailingProps = Omit<ViewProps, "children"> & {
  children?: ReactNode;
};

type InputLeadingProps = InputTrailingProps;

type InputIconRenderProps = {
  color: string;
  size: number;
};

type InputIconProps = Omit<ViewProps, "children"> & {
  /** Overrides the status-based key used to animate a custom icon swap. */
  animationKey?: string | number;
  children: ReactNode | ((props: InputIconRenderProps) => ReactNode);
};

type InputActionProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
};

type InputPasswordToggleRenderProps = InputIconRenderProps & {
  visible: boolean;
};

type InputPasswordToggleProps = Omit<PressableProps, "children"> & {
  children?: ReactNode | ((props: InputPasswordToggleRenderProps) => ReactNode);
};

type InputMessageProps = TextProps & {
  children: ReactNode;
  tone?: InputMessageTone;
};

const ICON_ENTER_DURATION_MS = 280;
const ICON_EXIT_DURATION_MS = ICON_ENTER_DURATION_MS * 0.7;
const ICON_EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const ICON_SIZE = 20;

const ICON_ENTERING = ZoomIn.duration(ICON_ENTER_DURATION_MS)
  .easing(ICON_EASE_OUT)
  .withInitialValues({ transform: [{ scale: 0.42 }] })
  .reduceMotion(ReduceMotion.System);

const ICON_EXITING = ZoomOut.duration(ICON_EXIT_DURATION_MS)
  .easing(ICON_EASE_OUT)
  .reduceMotion(ReduceMotion.System);

const InputContext = createContext<InputContextValue | null>(null);

function useInputContext(componentName: string) {
  const context = useContext(InputContext);

  if (!context) {
    throw new Error(`${componentName} must be rendered inside Input.`);
  }

  return context;
}

function isInputChild(child: ReactNode, component: unknown) {
  return isValidElement(child) && child.type === component;
}

function isClearableControl(child: ReactNode) {
  return (
    isValidElement<InputControlProps>(child) &&
    child.type === InputControl &&
    child.props.clearable === true
  );
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

const InputRoot = forwardRef<View, InputRootProps>(function InputRoot(
  {
    accessibilityLabel,
    appearance = "filled",
    children,
    disabled = false,
    fieldStyle,
    focusColor,
    invalid = false,
    labelBackgroundColor,
    size,
    secureEntry = false,
    status,
    style,
    theme,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [secureVisible, setSecureVisible] = useState(false);
  const inheritedTheme = useInputTheme();
  const resolvedSize = resolveInputSize(size);
  const tokens = useMemo(
    () => resolveInputTokens(inheritedTheme, appearance, resolvedSize, theme),
    [appearance, inheritedTheme, resolvedSize, theme]
  );
  const focusedColors = resolveInputFocusColors({
    appearance,
    defaultColor: tokens.colors.focus,
    defaultBorderColor: tokens.colors.focusBorder,
    filledDefaultBorderColor: tokens.colors.filledFocusBorder,
    focusColor,
  });
  const resolvedLabelBackgroundColor =
    labelBackgroundColor ?? tokens.colors.labelBackground;
  const externalLabelOffset = resolveInputExternalLabelOffset(
    tokens.size.labelLineHeight
  );
  const childArray = Children.toArray(children);
  const resolvedStatus = resolveInputStatus({ invalid, status });
  const hasLabel = childArray.some((child) => isInputChild(child, InputLabel));
  const hasLeading = childArray.some((child) =>
    isInputChild(child, InputLeading)
  );
  const hasTrailing = childArray.some((child) =>
    isInputChild(child, InputTrailing)
  );
  const hasClearableControl =
    !secureEntry && !hasTrailing && childArray.some(isClearableControl);
  const messages = childArray.filter((child) =>
    isInputChild(child, InputMessage)
  );
  const fieldChildren = childArray.filter(
    (child) => !isInputChild(child, InputMessage)
  );
  const shouldRenderDefaultPasswordToggle = secureEntry && !hasTrailing;
  const iconColor = disabled
    ? tokens.colors.disabled
    : resolvedStatus === "error"
    ? tokens.colors.error
    : resolvedStatus === "success"
    ? tokens.colors.success
    : focused
    ? focusedColors.contentColor
    : tokens.colors.muted;

  const contextValue = useMemo<InputContextValue>(
    () => ({
      accessibilityLabel,
      appearance,
      colors: tokens.colors,
      disabled,
      fieldBackgroundColor: tokens.appearance.backgroundColor,
      focusColor: focusedColors.contentColor,
      focused,
      hasCustomTrailing: hasTrailing,
      hasLabel,
      hasLeading,
      hasTrailing:
        hasTrailing || shouldRenderDefaultPasswordToggle || hasClearableControl,
      iconColor,
      labelBackgroundColor: resolvedLabelBackgroundColor,
      sizeTokens: tokens.size,
      secureEntry,
      secureVisible,
      setFocused,
      status: resolvedStatus,
      toggleSecureEntry: () => setSecureVisible((visible) => !visible),
    }),
    [
      accessibilityLabel,
      appearance,
      disabled,
      tokens.appearance.backgroundColor,
      focusedColors.contentColor,
      focused,
      hasClearableControl,
      hasLabel,
      hasLeading,
      hasTrailing,
      iconColor,
      resolvedLabelBackgroundColor,
      resolvedStatus,
      secureEntry,
      secureVisible,
      shouldRenderDefaultPasswordToggle,
      tokens.colors,
      tokens.size,
    ]
  );

  return (
    <InputContext.Provider value={contextValue}>
      <View {...props} ref={ref} style={[styles.root, style]}>
        <FastSquircleView
          cornerSmoothing={tokens.cornerSmoothing}
          style={[
            styles.field,
            styles[`field${appearanceSuffix(appearance)}`],
            {
              backgroundColor: tokens.appearance.backgroundColor,
              borderColor: tokens.appearance.borderColor,
              borderRadius: tokens.appearance.borderRadius,
              borderWidth: tokens.appearance.borderWidth,
              minHeight: tokens.size.fieldHeight,
            },
            hasLabel &&
              appearance === "notched" &&
              styles.fieldNotchedWithLabel,
            hasLabel &&
              appearance === "external" && {
                marginTop: externalLabelOffset,
              },
            resolvedStatus === "error" && {
              borderColor: tokens.colors.error,
            },
            resolvedStatus === "success" && {
              borderColor: tokens.colors.success,
            },
            focused &&
              resolvedStatus === "default" && {
                borderColor: focusedColors.borderColor,
              },
            disabled && styles.fieldDisabled,
            fieldStyle,
          ]}
        >
          {fieldChildren}
          {shouldRenderDefaultPasswordToggle ? (
            <InputTrailing>
              <InputPasswordToggle />
            </InputTrailing>
          ) : null}
        </FastSquircleView>
        {messages}
      </View>
    </InputContext.Provider>
  );
});

function appearanceSuffix(value: InputAppearance): Capitalize<InputAppearance> {
  return `${value[0].toUpperCase()}${value.slice(
    1
  )}` as Capitalize<InputAppearance>;
}

function InputLabel({
  children,
  required = false,
  style,
  ...props
}: InputLabelProps) {
  const {
    appearance,
    colors,
    disabled,
    focusColor,
    focused,
    iconColor,
    labelBackgroundColor,
    sizeTokens,
    status,
  } = useInputContext("Input.Label");
  const isInsetLabel = appearance === "filled" || appearance === "stacked";
  const color = disabled
    ? colors.disabled
    : status === "error"
    ? colors.error
    : status === "success"
    ? colors.success
    : focused
    ? focusColor
    : iconColor;
  const labelBackground =
    appearance === "notched" ? labelBackgroundColor : "transparent";
  const externalLabelOffset = resolveInputExternalLabelOffset(
    sizeTokens.labelLineHeight
  );

  return (
    <Text
      {...props}
      style={[
        styles.label,
        styles[`label${appearanceSuffix(appearance)}`],
        {
          backgroundColor: labelBackground,
          color,
          fontSize: sizeTokens.labelFontSize,
          left: isInsetLabel
            ? sizeTokens.insetLabelLeft
            : appearance === "notched"
            ? sizeTokens.notchedLabelLeft
            : sizeTokens.externalLabelLeft,
          lineHeight: sizeTokens.labelLineHeight,
          paddingHorizontal:
            appearance === "notched" ? sizeTokens.borderLabelPadding : 0,
          top: isInsetLabel
            ? sizeTokens.insetLabelTop
            : appearance === "notched"
            ? sizeTokens.borderLabelTop
            : -externalLabelOffset,
        },
        style,
      ]}
    >
      {children}
      {required ? <Text style={{ color }}> *</Text> : null}
    </Text>
  );
}

const InputControl = forwardRef<NativeTextInput, InputControlProps>(
  function InputControl(
    {
      accessibilityLabel,
      clearable = false,
      defaultValue,
      editable,
      onBlur,
      onFocus,
      onChangeText,
      placeholderTextColor,
      secureTextEntry,
      selectionColor,
      style,
      value,
      ...props
    },
    ref
  ) {
    const {
      accessibilityLabel: rootAccessibilityLabel,
      appearance,
      colors,
      disabled,
      fieldBackgroundColor,
      focusColor,
      hasCustomTrailing,
      hasLabel,
      hasLeading,
      hasTrailing,
      iconColor,
      secureEntry,
      secureVisible,
      sizeTokens,
      setFocused,
    } = useInputContext("Input.Control");
    const nativeInputRef = useRef<NativeTextInput>(null);
    const [uncontrolledHasContent, setUncontrolledHasContent] = useState(() =>
      hasInputContent(defaultValue)
    );
    const hasContent =
      value === undefined
        ? uncontrolledHasContent
        : hasInputContent(value);
    const supportsClearAction = clearable && !secureEntry && !hasCustomTrailing;
    const showsClearAction = supportsClearAction && hasContent;
    const clearIconColor = fieldBackgroundColor;
    const horizontalInsets = resolveInputHorizontalInsets({
      basePadding: sizeTokens.controlHorizontalPadding[appearance],
      hasLeading,
      hasTrailing,
      leadingPadding: sizeTokens.controlLeadingPadding,
      trailingPadding: sizeTokens.controlTrailingPadding,
    });

    const setNativeInputRef = useCallback(
      (node: NativeTextInput | null) => {
        nativeInputRef.current = node;
        assignRef(ref, node);
      },
      [ref]
    );

    const handleFocus = useCallback(
      (event: Parameters<NonNullable<NativeTextInputProps["onFocus"]>>[0]) => {
        setFocused(true);
        onFocus?.(event);
      },
      [onFocus, setFocused]
    );
    const handleBlur = useCallback(
      (event: Parameters<NonNullable<NativeTextInputProps["onBlur"]>>[0]) => {
        setFocused(false);
        onBlur?.(event);
      },
      [onBlur, setFocused]
    );
    const handleChangeText = useCallback(
      (text: string) => {
        if (value === undefined) {
          setUncontrolledHasContent(hasInputContent(text));
        }

        onChangeText?.(text);
      },
      [onChangeText, value]
    );
    const handleClear = useCallback(() => {
      nativeInputRef.current?.clear();
      setUncontrolledHasContent(false);
      onChangeText?.("");
      nativeInputRef.current?.focus();
    }, [onChangeText]);

    return (
      <>
        <NativeTextInput
          {...props}
          accessibilityLabel={accessibilityLabel ?? rootAccessibilityLabel}
          defaultValue={defaultValue}
          editable={disabled ? false : editable}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          placeholderTextColor={placeholderTextColor ?? colors.muted}
          ref={setNativeInputRef}
          secureTextEntry={secureEntry ? !secureVisible : secureTextEntry}
          selectionColor={selectionColor ?? focusColor}
          style={[
            styles.control,
            styles[`control${appearanceSuffix(appearance)}`],
            hasLabel &&
              appearance === "filled" &&
              styles.controlFilledWithLabel,
            hasTrailing && styles.controlWithTrailing,
            {
              color: disabled ? colors.disabled : colors.text,
              fontSize: sizeTokens.controlFontSize,
              minHeight: sizeTokens.fieldHeight,
              paddingBottom: sizeTokens.controlPaddingBottom,
              ...horizontalInsets,
              paddingTop: hasLabel
                ? sizeTokens.controlPaddingTopWithLabel[appearance]
                : sizeTokens.controlPaddingTop[appearance],
            },
            style,
          ]}
          value={value}
        />
        {supportsClearAction ? (
          <InputTrailing>
            <InputAction
              accessibilityElementsHidden={!showsClearAction}
              accessibilityLabel="Clear input"
              disabled={!showsClearAction}
              onPress={handleClear}
              pointerEvents={showsClearAction ? "auto" : "none"}
            >
              <InputIcon
                animationKey={
                  showsClearAction ? "clear-visible" : "clear-hidden"
                }
              >
                {showsClearAction ? (
                  <CircleX
                    color={clearIconColor}
                    fill={iconColor}
                    size={sizeTokens.iconSize}
                    strokeWidth={2.4}
                  />
                ) : null}
              </InputIcon>
            </InputAction>
          </InputTrailing>
        ) : null}
      </>
    );
  }
);

function InputLeading({ children, style, ...props }: InputLeadingProps) {
  const { sizeTokens } = useInputContext("Input.Leading");

  return (
    <View
      {...props}
      pointerEvents="box-none"
      style={[styles.leading, { minWidth: sizeTokens.trailingWidth }, style]}
    >
      {children}
    </View>
  );
}

function InputTrailing({ children, style, ...props }: InputTrailingProps) {
  const { sizeTokens } = useInputContext("Input.Trailing");

  return (
    <View
      {...props}
      pointerEvents="box-none"
      style={[styles.trailing, { minWidth: sizeTokens.trailingWidth }, style]}
    >
      {children}
    </View>
  );
}

function InputIcon({
  animationKey,
  children,
  style,
  ...props
}: InputIconProps) {
  const { iconColor, sizeTokens, status } = useInputContext("Input.Icon");
  const iconSize = sizeTokens.iconSize;
  const icon =
    typeof children === "function"
      ? children({ color: iconColor, size: iconSize })
      : children;

  return (
    <View
      {...props}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.icon, { height: iconSize, width: iconSize }, style]}
    >
      <Animated.View
        entering={ICON_ENTERING}
        exiting={ICON_EXITING}
        key={animationKey ?? status}
        style={styles.iconLayer}
      >
        {icon}
      </Animated.View>
    </View>
  );
}

function InputAction({
  children,
  disabled,
  style,
  ...props
}: InputActionProps) {
  const context = useInputContext("Input.Action");
  const actionSize = context.sizeTokens.actionSize;

  return (
    <Pressable
      {...props}
      accessibilityRole={props.accessibilityRole ?? "button"}
      disabled={context.disabled || disabled}
      style={(state) => [
        styles.action,
        { height: actionSize, minWidth: actionSize },
        context.disabled && styles.actionDisabled,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}

function InputPasswordToggle({ children, ...props }: InputPasswordToggleProps) {
  const {
    iconColor,
    secureEntry,
    secureVisible,
    sizeTokens,
    toggleSecureEntry,
  } = useInputContext("Input.PasswordToggle");
  const iconSize = sizeTokens.iconSize;

  if (!secureEntry) {
    throw new Error("Input.PasswordToggle requires secureEntry on Input.");
  }

  const iconProps: LucideProps = {
    color: iconColor,
    size: iconSize,
    strokeWidth: 2,
  };
  const icon =
    typeof children === "function"
      ? children({ color: iconColor, size: iconSize, visible: secureVisible })
      : children;
  const handlePress: NonNullable<PressableProps["onPress"]> = (event) => {
    toggleSecureEntry();
    props.onPress?.(event);
  };

  return (
    <InputAction
      {...props}
      accessibilityLabel={
        props.accessibilityLabel ??
        (secureVisible ? "Hide password" : "Show password")
      }
      onPress={handlePress}
    >
      <View
        style={[styles.passwordIcon, { height: iconSize, width: iconSize }]}
      >
        {children ? (
          <Animated.View
            entering={ICON_ENTERING}
            exiting={ICON_EXITING}
            key={secureVisible ? "visible-custom" : "hidden-custom"}
            style={styles.iconLayer}
          >
            {icon}
          </Animated.View>
        ) : (
          <Animated.View
            entering={ICON_ENTERING}
            exiting={ICON_EXITING}
            key={secureVisible ? "visible" : "hidden"}
            style={styles.iconLayer}
          >
            {secureVisible ? <EyeOff {...iconProps} /> : <Eye {...iconProps} />}
          </Animated.View>
        )}
      </View>
    </InputAction>
  );
}

function InputMessage({ children, style, tone, ...props }: InputMessageProps) {
  const { colors, disabled, sizeTokens, status } =
    useInputContext("Input.Message");
  const resolvedTone = resolveInputMessageTone(status, tone);
  const color = disabled
    ? colors.disabled
    : resolvedTone === "error"
    ? colors.error
    : resolvedTone === "success"
    ? colors.success
    : colors.muted;

  return (
    <Text
      {...props}
      accessibilityRole={resolvedTone === "error" ? "alert" : undefined}
      style={[
        styles.message,
        {
          color,
          fontSize: sizeTokens.messageFontSize,
          lineHeight: sizeTokens.messageLineHeight,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** A composable React Native text input with four visual appearances. */
export const Input = Object.assign(InputRoot, {
  Action: InputAction,
  Control: InputControl,
  Icon: InputIcon,
  Label: InputLabel,
  Leading: InputLeading,
  Message: InputMessage,
  PasswordToggle: InputPasswordToggle,
  Root: InputRoot,
  Trailing: InputTrailing,
});

const styles = StyleSheet.create({
  root: {
    gap: 7,
    width: "100%",
  },
  field: {
    alignItems: "center",
    flexDirection: "row",
    overflow: "visible",
    position: "relative",
  },
  fieldFilled: {},
  fieldStacked: {},
  fieldNotched: {},
  fieldNotchedWithLabel: {
    marginTop: 10,
  },
  fieldExternal: {},
  fieldDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    position: "absolute",
    zIndex: 2,
  },
  labelFilled: {
    left: 17,
    top: 10,
  },
  labelStacked: {
    left: 17,
    top: 10,
  },
  labelNotched: {
    left: 13,
    paddingHorizontal: 5,
    top: -10,
  },
  labelExternal: {
    left: 14,
  },
  control: {
    flex: 1,
    fontSize: 17,
    includeFontPadding: false,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  controlFilled: {
    minHeight: 64,
    paddingHorizontal: 19,
  },
  controlStacked: {
    minHeight: 70,
    paddingTop: 30,
  },
  controlNotched: {
    minHeight: 62,
    paddingTop: 17,
  },
  controlExternal: {
    minHeight: 50,
  },
  controlFilledWithLabel: {
    paddingTop: 25,
  },
  controlWithTrailing: {
    paddingRight: 56,
  },
  trailing: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    minWidth: 52,
    paddingHorizontal: 4,
    position: "absolute",
    right: 0,
    top: 0,
  },
  leading: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    minWidth: 52,
    paddingHorizontal: 4,
    position: "absolute",
    top: 0,
  },
  action: {
    alignItems: "center",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    minWidth: 44,
    paddingHorizontal: 8,
  },
  actionDisabled: {
    opacity: 0.65,
  },
  icon: {
    alignItems: "center",
    height: ICON_SIZE,
    justifyContent: "center",
    width: ICON_SIZE,
  },
  passwordIcon: {
    height: ICON_SIZE,
    position: "relative",
    width: ICON_SIZE,
  },
  iconLayer: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
});
