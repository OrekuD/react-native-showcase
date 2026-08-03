import { MenuView, type MenuAction } from "@expo/ui/community/menu";
import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import {
  Children,
  cloneElement,
  createContext,
  Fragment,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type PressableProps,
} from "react-native";
import FastSquircleView from "react-native-fast-squircle";
import Animated, {
  Easing,
  FadeOut,
  ReduceMotion,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  isSelectValueSelected,
  resolveSelectMode,
  type SelectAlign,
  type SelectMode,
  type SelectSize,
} from "./selectState";
import {
  resolveSelectTokens,
  type ResolvedSelectTheme,
  type SelectThemeOverride,
} from "./selectTheme";
import { SelectThemeProvider, useSelectTheme } from "./SelectThemeProvider";
import { resolvePopoverSide } from "../popoverPosition";

export type { SelectAlign, SelectMode, SelectSize } from "./selectState";
export type {
  ResolvedSelectTheme,
  SelectTheme,
  SelectThemeOverride,
} from "./selectTheme";
export { SelectThemeProvider } from "./SelectThemeProvider";
export type { SelectThemeProviderProps } from "./SelectThemeProvider";

type SharedSelectProps = {
  /** The trigger and select content primitives that make up the control. */
  children: ReactNode;
  /** Initial selected value for an uncontrolled select. */
  defaultValue?: string;
  /** Prevents the trigger from opening the list. */
  disabled?: boolean;
  /** Receives the selected item value. */
  onValueChange?: (value: string) => void;
  /** Opens the select from a long press instead of a tap. */
  shouldOpenOnLongPress?: boolean;
  /** Test identifier applied to the trigger. */
  testID?: string;
  /** Controls the selected item. */
  value?: string;
};

type CustomSelectProps = SharedSelectProps & {
  /** Initial visibility for an uncontrolled custom select. */
  defaultOpen?: boolean;
  /** Uses Showcase's custom select treatment. */
  mode?: "custom";
  /** Receives visibility changes from the custom trigger, options, and backdrop. */
  onOpenChange?: (open: boolean) => void;
  /** Controls a custom select's visibility. */
  open?: boolean;
  /** Overrides visual tokens for this custom select only. */
  theme?: SelectThemeOverride;
};

type NativeSelectProps = SharedSelectProps & {
  /** Uses Expo UI's native menu with the selected action marked as checked. */
  mode: "native";
  /** Native select title. It is shown by iOS only. */
  title?: string;
};

/** Props accepted by the composed {@link Select} root. */
export type SelectProps = CustomSelectProps | NativeSelectProps;

type SelectOption = {
  disabled: boolean;
  groupLabel: string | undefined;
  label: string;
  value: string;
};

type SelectContextValue = {
  disabled: boolean;
  mode: SelectMode;
  options: readonly SelectOption[];
  selectValue: (value: string) => void;
  selectedOption: SelectOption | undefined;
  shouldOpenOnLongPress: boolean;
  size: SelectSize;
  testID: string | undefined;
  theme: ResolvedSelectTheme;
  triggerRef: RefObject<DropdownMenuPrimitive.TriggerRef | null>;
};

const SelectContext = createContext<SelectContextValue | null>(null);

const SELECT_ITEM_PRESS_IN_DURATION_MS = 120;
const SELECT_ITEM_PRESS_OUT_DURATION_MS = 90;
const SELECT_ITEM_PRESSED_SCALE = 0.97;
const CONTENT_EDGE_INSET = 16;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const CONTENT_ENTERING = ZoomIn.duration(190)
  .easing(EASE_OUT)
  .withInitialValues({ transform: [{ scale: 0.96 }] })
  .reduceMotion(ReduceMotion.System);
const CONTENT_EXITING = FadeOut.duration(130)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

const AnimatedSelectItem = Animated.createAnimatedComponent(Pressable);

function useSelectContext(componentName: string): SelectContextValue {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error(`${componentName} must be used inside Select.`);
  }

  return context;
}

function getOptionLabel({ children, label }: SelectItemProps): string {
  if (label) {
    return label;
  }

  return typeof children === "string" || typeof children === "number"
    ? String(children)
    : "";
}

function collectOptions(children: ReactNode, groupLabel?: string): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) {
      return [];
    }

    if (child.type === SelectItem) {
      const props = child.props as SelectItemProps;

      return [
        {
          disabled: props.disabled ?? false,
          groupLabel,
          label: getOptionLabel(props),
          value: props.value,
        },
      ];
    }

    if (child.type === SelectGroup) {
      const props = child.props as SelectGroupProps;

      return collectOptions(props.children, props.label);
    }

    if (child.type === SelectContent) {
      const props = child.props as SelectContentProps;

      return collectOptions(props.children, groupLabel);
    }

    if (child.type === Fragment) {
      const props = child.props as { children?: ReactNode };

      return collectOptions(props.children, groupLabel);
    }

    return [];
  });
}

function getNativeActions(
  options: readonly SelectOption[],
  selectedValue: string | undefined
): MenuAction[] {
  const groups = new Map<string | undefined, SelectOption[]>();

  for (const option of options) {
    const group = groups.get(option.groupLabel) ?? [];
    groups.set(option.groupLabel, [...group, option]);
  }

  return Array.from(groups.entries()).flatMap(([groupLabel, groupOptions]) => {
    const actions = groupOptions.map<MenuAction>((option) => ({
      attributes: option.disabled ? { disabled: true } : undefined,
      id: option.value,
      state: isSelectValueSelected(selectedValue, option.value) ? "on" : "off",
      title: option.label,
    }));

    if (!groupLabel) {
      return actions;
    }

    return [
      {
        displayInline: true,
        id: `group-${groupLabel}`,
        subactions: actions,
        title: groupLabel,
      },
    ];
  });
}

function SelectRoot(props: SelectProps) {
  const mode = resolveSelectMode(props.mode);
  const inheritedTheme = useSelectTheme();
  const localTheme = props.mode === "native" ? undefined : props.theme;
  const theme = useMemo(
    () => resolveSelectTokens(inheritedTheme, localTheme),
    [inheritedTheme, localTheme]
  );
  const triggerRef = useRef<DropdownMenuPrimitive.TriggerRef>(null);
  const primitiveOpenRef = useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    props.mode === "native" ? false : props.defaultOpen ?? false
  );
  const [uncontrolledValue, setUncontrolledValue] = useState(props.defaultValue);
  const value = props.value ?? uncontrolledValue;
  const options = useMemo(() => collectOptions(props.children), [props.children]);
  const selectedOption = useMemo(
    () => options.find((option) => isSelectValueSelected(value, option.value)),
    [options, value]
  );
  const requestedOpen =
    props.mode === "native" ? false : props.open ?? uncontrolledOpen;
  const selectValue = useCallback(
    (nextValue: string) => {
      if (props.value === undefined) {
        setUncontrolledValue(nextValue);
      }

      props.onValueChange?.(nextValue);
    },
    [props]
  );
  const handlePrimitiveOpenChange = useCallback(
    (nextOpen: boolean) => {
      primitiveOpenRef.current = nextOpen;

      if (props.mode === "native") {
        return;
      }

      if (props.open === undefined) {
        setUncontrolledOpen(nextOpen);
      }

      props.onOpenChange?.(nextOpen);
    },
    [props]
  );

  useEffect(() => {
    if (props.mode === "native") {
      return;
    }

    const trigger = triggerRef.current;

    if (!trigger || primitiveOpenRef.current === requestedOpen) {
      return;
    }

    if (requestedOpen) {
      trigger.open();
      return;
    }

    trigger.close();
  }, [props.mode, requestedOpen]);

  const context = useMemo<SelectContextValue>(
    () => ({
      disabled: props.disabled ?? false,
      mode,
      options,
      selectValue,
      selectedOption,
      shouldOpenOnLongPress:
        props.mode === "native" ? false : props.shouldOpenOnLongPress ?? false,
      size: "default",
      testID: props.testID,
      theme,
      triggerRef,
    }),
    [
      mode,
      options,
      props.disabled,
      props.testID,
      selectValue,
      selectedOption,
      props.shouldOpenOnLongPress,
      theme,
    ]
  );
  const nativeActions = useMemo(
    () => getNativeActions(options, value),
    [options, value]
  );
  const handleNativeAction = useCallback(
    (nextValue: string) => {
      const option = options.find((item) => item.value === nextValue);

      if (option && !option.disabled) {
        selectValue(nextValue);
      }
    },
    [options, selectValue]
  );

  if (props.mode === "native") {
    const content = <SelectContext.Provider value={context}>{props.children}</SelectContext.Provider>;

    if (props.disabled) {
      return content;
    }

    return (
      <MenuView
        actions={nativeActions}
        onPressAction={(event) => handleNativeAction(event.nativeEvent.event)}
        shouldOpenOnLongPress={props.shouldOpenOnLongPress}
        testID={props.testID}
        title={props.title}
      >
        {content}
      </MenuView>
    );
  }

  return (
    <DropdownMenuPrimitive.Root onOpenChange={handlePrimitiveOpenChange}>
      <SelectContext.Provider value={context}>{props.children}</SelectContext.Provider>
    </DropdownMenuPrimitive.Root>
  );
}

type TriggerChildProps = Pick<
  PressableProps,
  "accessibilityRole" | "disabled" | "onLongPress" | "onPress"
>;

/** Props accepted by {@link Select.Trigger}. */
export type SelectTriggerProps = {
  /** One pressable element, such as Showcase's {@link Button}. */
  children: ReactElement<TriggerChildProps>;
};

/** Composes one pressable child into the select trigger. */
function SelectTrigger({ children }: SelectTriggerProps) {
  const {
    disabled,
    mode,
    shouldOpenOnLongPress,
    testID,
    triggerRef,
  } = useSelectContext("Select.Trigger");
  const trigger = cloneElement<TriggerChildProps>(children, {
    accessibilityRole: children.props.accessibilityRole ?? "button",
    disabled: Boolean(disabled || children.props.disabled),
  });
  const isDisabled = Boolean(disabled || children.props.disabled);
  const handleLongPress = useCallback(
    (...args: Parameters<NonNullable<TriggerChildProps["onLongPress"]>>) => {
      if (isDisabled) {
        return;
      }

      triggerRef.current?.open();
      children.props.onLongPress?.(...args);
    },
    [children.props.onLongPress, isDisabled, triggerRef]
  );

  if (mode === "native") {
    return trigger;
  }

  if (shouldOpenOnLongPress) {
    return (
      <DropdownMenuPrimitive.Trigger
        asChild
        disabled
        ref={triggerRef}
        testID={testID}
      >
        <View accessible={false} collapsable={false}>
          {cloneElement(trigger, { onLongPress: handleLongPress })}
        </View>
      </DropdownMenuPrimitive.Trigger>
    );
  }

  return (
    <DropdownMenuPrimitive.Trigger
      asChild
      disabled={disabled}
      ref={triggerRef}
      testID={testID}
    >
      {trigger}
    </DropdownMenuPrimitive.Trigger>
  );
}

/** Props accepted by {@link Select.Content}. */
export type SelectContentProps = {
  /** Positions content against the trigger's start or end edge. @default "end" */
  align?: SelectAlign;
  /** Select groups and items. */
  children: ReactNode;
  /** Space between the trigger and custom select content. @default 8 */
  sideOffset?: number;
  /** The density used by all custom options. @default "default" */
  size?: SelectSize;
};

/** Renders a collision-aware custom select popover. */
function SelectContent({
  align = "end",
  children,
  sideOffset = 8,
  size = "default",
}: SelectContentProps) {
  const context = useSelectContext("Select.Content");
  if (context.mode === "native") {
    return null;
  }

  return (
    <SelectCustomContent
      align={align}
      context={context}
      sideOffset={sideOffset}
      size={size}
    >
      {children}
    </SelectCustomContent>
  );
}

function SelectCustomContent({
  align,
  children,
  context,
  sideOffset,
  size,
}: Omit<SelectContentProps, "align" | "sideOffset" | "size"> & {
  align: SelectAlign;
  context: SelectContextValue;
  sideOffset: number;
  size: SelectSize;
}) {
  const { selectValue, selectedOption, theme } = context;
  const { contentLayout, triggerPosition } = DropdownMenuPrimitive.useRootContext();
  const { width: viewportWidth } = useWindowDimensions();
  const side = resolvePopoverSide({
    contentHeight: contentLayout?.height,
    insetBottom: CONTENT_EDGE_INSET,
    insetTop: CONTENT_EDGE_INSET,
    triggerHeight: triggerPosition?.height,
    triggerY: triggerPosition?.pageY,
    viewportHeight: Dimensions.get("screen").height,
  });
  const contentContext = useMemo<SelectContextValue>(
    () => ({ ...context, size }),
    [context, size]
  );

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Overlay asChild>
        <Pressable
          accessibilityLabel="Dismiss select"
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
        />
      </DropdownMenuPrimitive.Overlay>
      <DropdownMenuPrimitive.Content
        align={align}
        avoidCollisions
        insets={{
          bottom: CONTENT_EDGE_INSET,
          left: CONTENT_EDGE_INSET,
          right: CONTENT_EDGE_INSET,
          top: CONTENT_EDGE_INSET,
        }}
        side={side}
        sideOffset={sideOffset}
      >
        <Animated.View
          entering={CONTENT_ENTERING}
          exiting={CONTENT_EXITING}
        >
          <FastSquircleView
            cornerSmoothing={theme.cornerSmoothing}
            style={[
              styles.panel,
              size === "compact" && styles.panelCompact,
              {
                borderRadius: theme.borderRadius,
                shadowColor: theme.shadowColor,
                width: Math.min(320, Math.max(0, viewportWidth - 32)),
              },
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.panelSurface,
                { backgroundColor: theme.backgroundColor },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.panelChrome,
                {
                  borderColor: theme.borderColor,
                  borderRadius: theme.borderRadius,
                },
              ]}
            />
            <SelectContext.Provider value={contentContext}>
              <DropdownMenuPrimitive.RadioGroup
                asChild
                onValueChange={selectValue}
                value={selectedOption?.value}
              >
                <View
                  style={[
                    styles.content,
                    size === "compact" && styles.contentCompact,
                  ]}
                >
                  {children}
                </View>
              </DropdownMenuPrimitive.RadioGroup>
            </SelectContext.Provider>
          </FastSquircleView>
        </Animated.View>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

/** Props accepted by {@link Select.Group}. */
export type SelectGroupProps = {
  /** Select items belonging to this group. */
  children: ReactNode;
  /** Label shown above the group and as an inline native section title. */
  label?: string;
};

/** Groups related select options. */
function SelectGroup({ children, label }: SelectGroupProps) {
  const { size, theme } = useSelectContext("Select.Group");

  return (
    <DropdownMenuPrimitive.Group asChild>
      <View style={[styles.group, size === "compact" && styles.groupCompact]}>
        {label ? (
          <DropdownMenuPrimitive.Label asChild>
            <Text
              style={[
                styles.groupLabel,
                size === "compact" && styles.groupLabelCompact,
                { color: theme.sectionLabelColor },
              ]}
            >
              {label}
            </Text>
          </DropdownMenuPrimitive.Label>
        ) : null}
        <View
          style={[
            styles.groupItems,
            size === "compact" && styles.groupItemsCompact,
          ]}
        >
          {children}
        </View>
      </View>
    </DropdownMenuPrimitive.Group>
  );
}

/** Props accepted by {@link Select.Item}. */
export type SelectItemProps = {
  /** Option label. Provide `label` too when this is not plain text. */
  children: ReactNode;
  /** Supplemental copy shown beneath the option label in custom mode. */
  description?: string;
  /** Prevents this option from being selected. */
  disabled?: boolean;
  /** Enables light impact feedback after selection. @default false */
  haptics?: boolean;
  /** Optional leading icon rendered in a rounded treatment in custom mode. */
  icon?: ReactNode;
  /** Plain-text label used by the native action when `children` is not text. */
  label?: string;
  /** The value emitted when this option is selected. */
  value: string;
};

/** A select option with a trailing checkmark when selected. */
function SelectItem({
  children,
  description,
  disabled = false,
  haptics = false,
  icon,
  label,
  value,
}: SelectItemProps) {
  const { selectedOption, size, theme } = useSelectContext("Select.Item");
  const isCompact = size === "compact";
  const isSelected = isSelectValueSelected(selectedOption?.value, value);
  const pressedScale = useSharedValue(1);
  const textValue = label ?? getOptionLabel({ children, label, value });
  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressedScale.value }],
  }));
  const handlePressIn = useCallback(() => {
    pressedScale.value = withTiming(SELECT_ITEM_PRESSED_SCALE, {
      duration: SELECT_ITEM_PRESS_IN_DURATION_MS,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    });
  }, [pressedScale]);
  const handlePressOut = useCallback(() => {
    pressedScale.value = withTiming(1, {
      duration: SELECT_ITEM_PRESS_OUT_DURATION_MS,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    });
  }, [pressedScale]);
  const handlePress = useCallback(() => {
    if (haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [haptics]);

  return (
    <DropdownMenuPrimitive.RadioItem
      asChild
      disabled={disabled}
      textValue={textValue}
      value={value}
    >
      <AnimatedSelectItem
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.item,
          isCompact && styles.itemCompact,
          disabled && styles.itemDisabled,
          animatedPressStyle,
        ]}
      >
        {icon ? (
          <FastSquircleView
            cornerSmoothing={1}
            style={[
              styles.iconContainer,
              isCompact && styles.iconContainerCompact,
              { backgroundColor: theme.iconBackgroundColor },
            ]}
          >
            <View style={isCompact && styles.iconCompact}>{icon}</View>
          </FastSquircleView>
        ) : null}
        <View style={[styles.itemCopy, isCompact && styles.itemCopyCompact]}>
          <Text
            style={[
              styles.itemLabel,
              isCompact && styles.itemLabelCompact,
              { color: theme.labelColor },
            ]}
          >
            {children}
          </Text>
          {description ? (
            <Text
              style={[
                styles.itemDescription,
                isCompact && styles.itemDescriptionCompact,
                { color: theme.descriptionColor },
              ]}
            >
              {description}
            </Text>
          ) : null}
        </View>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={[styles.checkmark, isCompact && styles.checkmarkCompact]}
        >
          {isSelected ? (
            <Check color={theme.checkmarkColor} size={20} strokeWidth={2.6} />
          ) : null}
        </View>
      </AnimatedSelectItem>
    </DropdownMenuPrimitive.RadioItem>
  );
}

/** Displays the selected option label or a placeholder inside a trigger. */
function SelectValue({ placeholder = "Select an option" }: { placeholder?: string }) {
  const { selectedOption } = useSelectContext("Select.Value");

  return selectedOption?.label || placeholder;
}

/**
 * A composed single-select control with a custom popover by default and an
 * Expo UI menu implementation that marks the selected native action.
 */
export const Select = Object.assign(SelectRoot, {
  Content: SelectContent,
  Group: SelectGroup,
  Item: SelectItem,
  Trigger: SelectTrigger,
  Value: SelectValue,
});

const styles = StyleSheet.create({
  panel: {
    overflow: "hidden",
    padding: 12,
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  panelCompact: {
    padding: 8,
  },
  panelChrome: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
  },
  panelSurface: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    gap: 8,
  },
  contentCompact: {
    gap: 6,
  },
  group: {
    gap: 8,
  },
  groupCompact: {
    gap: 6,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    paddingHorizontal: 8,
    paddingTop: 2,
  },
  groupLabelCompact: {
    fontSize: 10,
    letterSpacing: 1,
    paddingHorizontal: 6,
  },
  groupItems: {
    gap: 4,
  },
  groupItemsCompact: {
    gap: 2,
  },
  item: {
    alignItems: "center",
    borderRadius: 22,
    flexDirection: "row",
    gap: 14,
    minHeight: 64,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  itemCompact: {
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  itemDisabled: {
    opacity: 0.42,
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  iconContainerCompact: {
    borderRadius: 15,
    height: 30,
    width: 30,
  },
  iconCompact: {
    transform: [{ scale: 0.82 }],
  },
  itemCopy: {
    flex: 1,
    gap: 2,
  },
  itemCopyCompact: {
    gap: 1,
  },
  itemLabel: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  itemLabelCompact: {
    fontSize: 15,
    letterSpacing: -0.1,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemDescriptionCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
  checkmark: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  checkmarkCompact: {
    height: 24,
    width: 24,
  },
});
