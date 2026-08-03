import { MenuView, type MenuAction } from "@expo/ui/community/menu";
import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import * as Haptics from "expo-haptics";
import {
  cloneElement,
  createContext,
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
  resolveMenuMode,
  type MenuAlign,
  type MenuMode,
  type MenuSize,
} from "./menuState";
import {
  resolveMenuTokens,
  type MenuThemeOverride,
  type ResolvedMenuTheme,
} from "./menuTheme";
import { MenuThemeProvider, useMenuTheme } from "./MenuThemeProvider";
import { resolvePopoverSide } from "../popoverPosition";

export type { MenuAlign, MenuMode, MenuSize } from "./menuState";
export type {
  MenuTheme,
  MenuThemeOverride,
  ResolvedMenuTheme,
} from "./menuTheme";
export { MenuThemeProvider } from "./MenuThemeProvider";
export type { MenuThemeProviderProps } from "./MenuThemeProvider";

/** Expo-compatible actions rendered by {@link Menu} in native mode. */
export type NativeMenuAction = MenuAction;

type CustomMenuProps = {
  /** The trigger and custom content primitives that make up the menu. */
  children: ReactNode;
  /** Initial visibility for an uncontrolled custom menu. */
  defaultOpen?: boolean;
  /** Uses Showcase's custom menu treatment. */
  mode?: "custom";
  /** Receives visibility changes from the custom trigger, items, and backdrop. */
  onOpenChange?: (open: boolean) => void;
  /** Controls a custom menu's visibility. */
  open?: boolean;
  /** Opens the custom menu from a long press instead of a tap. */
  shouldOpenOnLongPress?: boolean;
  /** Test identifier applied to the custom trigger. */
  testID?: string;
  /** Overrides visual tokens for this custom menu only. */
  theme?: MenuThemeOverride;
};

type NativeMenuProps = {
  /** Expo-compatible actions rendered by the platform menu. */
  actions: readonly NativeMenuAction[];
  /** The menu trigger. Render {@link Menu.Trigger} around one pressable child. */
  children: ReactNode;
  /** Uses Expo UI's platform menu implementation. */
  mode: "native";
  /** Receives the id of the selected native menu action. */
  onSelect?: (id: string) => void;
  /** Opens the native menu from a long press instead of a tap. */
  shouldOpenOnLongPress?: boolean;
  /** Test identifier applied to Expo UI's native trigger wrapper. */
  testID?: string;
  /** Native menu title. It is displayed by iOS only. */
  title?: string;
};

/** Props accepted by the composed {@link Menu} root. */
export type MenuProps = CustomMenuProps | NativeMenuProps;

type MenuContextValue = {
  mode: MenuMode;
  shouldOpenOnLongPress: boolean;
  size: MenuSize;
  testID: string | undefined;
  theme: ResolvedMenuTheme;
  triggerRef: RefObject<DropdownMenuPrimitive.TriggerRef | null>;
};

const MenuContext = createContext<MenuContextValue | null>(null);

const MENU_ITEM_PRESS_IN_DURATION_MS = 120;
const MENU_ITEM_PRESS_OUT_DURATION_MS = 90;
const MENU_ITEM_PRESSED_SCALE = 0.97;
const CONTENT_EDGE_INSET = 16;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const CONTENT_ENTERING = ZoomIn.duration(190)
  .easing(EASE_OUT)
  .withInitialValues({ transform: [{ scale: 0.96 }] })
  .reduceMotion(ReduceMotion.System);
const CONTENT_EXITING = FadeOut.duration(130)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

const AnimatedMenuItem = Animated.createAnimatedComponent(Pressable);

function useMenuContext(componentName: string): MenuContextValue {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error(`${componentName} must be used inside Menu.`);
  }

  return context;
}

function MenuRoot(props: MenuProps) {
  const mode = resolveMenuMode(props.mode);
  const inheritedTheme = useMenuTheme();
  const localTheme = props.mode === "native" ? undefined : props.theme;
  const theme = useMemo(
    () => resolveMenuTokens(inheritedTheme, localTheme),
    [inheritedTheme, localTheme]
  );
  const triggerRef = useRef<DropdownMenuPrimitive.TriggerRef>(null);
  const primitiveOpenRef = useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    props.mode === "native" ? false : props.defaultOpen ?? false
  );
  const requestedOpen =
    props.mode === "native" ? false : props.open ?? uncontrolledOpen;
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

  const context = useMemo<MenuContextValue>(
    () => ({
      mode,
      shouldOpenOnLongPress:
        props.mode === "native" ? false : props.shouldOpenOnLongPress ?? false,
      size: "default",
      testID: props.testID,
      theme,
      triggerRef,
    }),
    [mode, props.shouldOpenOnLongPress, props.testID, theme]
  );

  if (props.mode === "native") {
    return (
      <MenuContext.Provider value={context}>
        <MenuView
          actions={[...props.actions]}
          onPressAction={(event) => props.onSelect?.(event.nativeEvent.event)}
          shouldOpenOnLongPress={props.shouldOpenOnLongPress}
          testID={props.testID}
          title={props.title}
        >
          {props.children}
        </MenuView>
      </MenuContext.Provider>
    );
  }

  return (
    <DropdownMenuPrimitive.Root onOpenChange={handlePrimitiveOpenChange}>
      <MenuContext.Provider value={context}>{props.children}</MenuContext.Provider>
    </DropdownMenuPrimitive.Root>
  );
}

type TriggerChildProps = Pick<
  PressableProps,
  "accessibilityRole" | "disabled" | "onLongPress" | "onPress"
>;

/** Props accepted by {@link Menu.Trigger}. */
export type MenuTriggerProps = {
  /** One pressable element, such as Showcase's {@link Button}. */
  children: ReactElement<TriggerChildProps>;
};

/** Composes a single pressable child into the menu trigger. */
function MenuTrigger({ children }: MenuTriggerProps) {
  const {
    mode,
    shouldOpenOnLongPress,
    testID,
    triggerRef,
  } = useMenuContext("Menu.Trigger");
  const isDisabled = Boolean(children.props.disabled);
  const trigger = cloneElement<TriggerChildProps>(children, {
    accessibilityRole: children.props.accessibilityRole ?? "button",
  });
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
      <DropdownMenuPrimitive.Trigger asChild disabled ref={triggerRef} testID={testID}>
        <View accessible={false} collapsable={false}>
          {cloneElement(trigger, { onLongPress: handleLongPress })}
        </View>
      </DropdownMenuPrimitive.Trigger>
    );
  }

  return (
    <DropdownMenuPrimitive.Trigger asChild ref={triggerRef} testID={testID}>
      {trigger}
    </DropdownMenuPrimitive.Trigger>
  );
}

/** Props accepted by {@link Menu.Content}. */
export type MenuContentProps = {
  /** Positions content against the trigger's start or end edge. @default "end" */
  align?: MenuAlign;
  /** Menu sections, separators, and items. */
  children: ReactNode;
  /** Space between the trigger and menu content. @default 8 */
  sideOffset?: number;
  /** The density used by all menu items. @default "default" */
  size?: MenuSize;
};

/** Renders a collision-aware custom menu popover. */
function MenuContent({
  align = "end",
  children,
  sideOffset = 8,
  size = "default",
}: MenuContentProps) {
  const context = useMenuContext("Menu.Content");
  if (context.mode === "native") {
    return null;
  }

  return (
    <MenuCustomContent
      align={align}
      context={context}
      sideOffset={sideOffset}
      size={size}
    >
      {children}
    </MenuCustomContent>
  );
}

function MenuCustomContent({
  align,
  children,
  context,
  sideOffset,
  size,
}: Omit<MenuContentProps, "align" | "sideOffset" | "size"> & {
  align: MenuAlign;
  context: MenuContextValue;
  sideOffset: number;
  size: MenuSize;
}) {
  const { theme } = context;
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
  const contentContext = useMemo<MenuContextValue>(
    () => ({ ...context, size }),
    [context, size]
  );

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Overlay asChild>
        <Pressable
          accessibilityLabel="Dismiss menu"
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
            <MenuContext.Provider value={contentContext}>
              <View
                style={[
                  styles.content,
                  size === "compact" && styles.contentCompact,
                ]}
              >
                {children}
              </View>
            </MenuContext.Provider>
          </FastSquircleView>
        </Animated.View>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

/** Props accepted by {@link Menu.Section}. */
export type MenuSectionProps = {
  /** Menu items belonging to this group. */
  children: ReactNode;
  /** Optional label shown above the grouped items. */
  title?: string;
};

/** Groups related custom menu items and optionally labels the group. */
function MenuSection({ children, title }: MenuSectionProps) {
  const { size, theme } = useMenuContext("Menu.Section");

  return (
    <DropdownMenuPrimitive.Group asChild>
      <View style={[styles.section, size === "compact" && styles.sectionCompact]}>
        {title ? (
          <DropdownMenuPrimitive.Label asChild>
            <Text
              style={[
                styles.sectionTitle,
                size === "compact" && styles.sectionTitleCompact,
                { color: theme.sectionLabelColor },
              ]}
            >
              {title}
            </Text>
          </DropdownMenuPrimitive.Label>
        ) : null}
        <View
          style={[
            styles.sectionItems,
            size === "compact" && styles.sectionItemsCompact,
          ]}
        >
          {children}
        </View>
      </View>
    </DropdownMenuPrimitive.Group>
  );
}

/** Props accepted by {@link Menu.Item}. */
export type MenuItemProps = {
  /** Action label. */
  children: ReactNode;
  /** Supplemental copy shown beneath the action label. */
  description?: string;
  /** Applies the destructive treatment. */
  destructive?: boolean;
  /** Prevents the action from being selected. */
  disabled?: boolean;
  /** Enables light impact feedback after the item is selected. @default false */
  haptics?: boolean;
  /** Optional leading icon rendered in a round treatment. */
  icon?: ReactNode;
  /** Invoked after the custom menu closes. */
  onSelect?: () => void;
};

/** A custom menu action with optional icon and supporting description. */
function MenuItem({
  children,
  description,
  destructive = false,
  disabled = false,
  haptics = false,
  icon,
  onSelect,
}: MenuItemProps) {
  const { size, theme } = useMenuContext("Menu.Item");
  const isCompact = size === "compact";
  const pressedScale = useSharedValue(1);
  const textValue =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined;
  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressedScale.value }],
  }));
  const handlePressIn = useCallback(() => {
    pressedScale.value = withTiming(MENU_ITEM_PRESSED_SCALE, {
      duration: MENU_ITEM_PRESS_IN_DURATION_MS,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    });
  }, [pressedScale]);
  const handlePressOut = useCallback(() => {
    pressedScale.value = withTiming(1, {
      duration: MENU_ITEM_PRESS_OUT_DURATION_MS,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    });
  }, [pressedScale]);
  const handlePress = useCallback(() => {
    if (haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onSelect?.();
  }, [haptics, onSelect]);

  return (
    <DropdownMenuPrimitive.Item
      asChild
      disabled={disabled}
      textValue={textValue}
    >
      <AnimatedMenuItem
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
              {
                color: destructive
                  ? theme.destructiveLabelColor
                  : theme.labelColor,
              },
            ]}
          >
            {children}
          </Text>
          {description ? (
            <Text
              style={[
                styles.itemDescription,
                isCompact && styles.itemDescriptionCompact,
                {
                  color: destructive
                    ? theme.destructiveDescriptionColor
                    : theme.descriptionColor,
                },
              ]}
            >
              {description}
            </Text>
          ) : null}
        </View>
      </AnimatedMenuItem>
    </DropdownMenuPrimitive.Item>
  );
}

/** A visual divider for ungrouped custom menu items. */
function MenuSeparator() {
  const { size, theme } = useMenuContext("Menu.Separator");

  return (
    <DropdownMenuPrimitive.Separator asChild decorative>
      <View
        style={[
          styles.separator,
          size === "compact" && styles.separatorCompact,
          { backgroundColor: theme.separatorColor },
        ]}
      />
    </DropdownMenuPrimitive.Separator>
  );
}

/**
 * A composed menu that uses Expo UI's {@link MenuView} in native mode and a
 * collision-aware rn-primitives popover in custom mode.
 */
export const Menu = Object.assign(MenuRoot, {
  Content: MenuContent,
  Item: MenuItem,
  Section: MenuSection,
  Separator: MenuSeparator,
  Trigger: MenuTrigger,
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
  section: {
    gap: 8,
  },
  sectionCompact: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    paddingHorizontal: 8,
    paddingTop: 2,
  },
  sectionTitleCompact: {
    fontSize: 10,
    letterSpacing: 1,
    paddingHorizontal: 6,
  },
  sectionItems: {
    gap: 4,
  },
  sectionItemsCompact: {
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
    borderRadius: 22.5,
    height: 45,
    justifyContent: "center",
    width: 45,
  },
  iconContainerCompact: {
    borderRadius: 18,
    height: 36,
    width: 36,
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
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.25,
  },
  itemLabelCompact: {
    fontSize: 16,
    letterSpacing: -0.15,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemDescriptionCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  separatorCompact: {
    marginHorizontal: 6,
    marginVertical: 3,
  },
});
