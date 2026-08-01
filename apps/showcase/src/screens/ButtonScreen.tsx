import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ExampleScreen } from "../components/ExampleScreen";
import {
  Button,
  ButtonThemeProvider,
  type ButtonTheme,
  type ButtonThemeOverride,
} from "../components/ui/Button";
import type { RootStackParamList } from "../navigation/types";

type ButtonScreenProps = NativeStackScreenProps<RootStackParamList, "Button">;

const PROVIDER_THEME = {
  cornerSmoothing: 0.9,
  label: {
    fontSize: 17,
  },
  variants: {
    primary: {
      backgroundColor: "#28594A",
      foregroundColor: "#F4FBF7",
    },
  },
} satisfies ButtonTheme;

const LOCAL_THEME = {
  backgroundColor: "#EEE9FF",
  borderColor: "transparent",
  borderWidth: 0,
  cornerSmoothing: 0.95,
  foregroundColor: "#5138A5",
  label: {
    fontSize: 17,
  },
} satisfies ButtonThemeOverride;

type DemoIconProps = {
  color: string;
  glyph: string;
  size: number;
};

function DemoIcon({ color, glyph, size }: DemoIconProps) {
  return (
    <Text
      style={[
        styles.demoIcon,
        {
          color,
          fontSize: size,
          height: size,
          lineHeight: size,
          width: size,
        },
      ]}
    >
      {glyph}
    </Text>
  );
}

export function ButtonScreen({ navigation }: ButtonScreenProps) {
  const [loading, setLoading] = useState(false);

  const toggleLoading = () => {
    setLoading((currentLoading) => !currentLoading);
  };

  return (
    <ExampleScreen
      onBack={navigation.goBack}
      progressiveBlurHeader
      title="Button"
    >
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>VARIANTS</Text>
          <Button haptics testID="button-primary">
            <Button.Icon>
              {({ color, size }) => (
                <DemoIcon color={color} glyph="↓" size={size} />
              )}
            </Button.Icon>
            <Button.Label>Download file</Button.Label>
          </Button>

          <Button testID="button-secondary" variant="secondary">
            <Button.Label>Continue</Button.Label>
            <Button.Icon>
              {({ color, size }) => (
                <DemoIcon color={color} glyph="→" size={size} />
              )}
            </Button.Icon>
          </Button>

          <Button haptics testID="button-outline" variant="outline">
            <Button.Label>More</Button.Label>
          </Button>

          <Button testID="button-ghost" variant="ghost">
            <Button.Label>Learn more</Button.Label>
          </Button>

          <Button testID="button-destructive" variant="destructive">
            <Button.Icon>
              {({ color, size }) => (
                <DemoIcon color={color} glyph="×" size={size} />
              )}
            </Button.Icon>
            <Button.Label>Delete item</Button.Label>
          </Button>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionLabel}>STATES</Text>
            <Button
              onPress={toggleLoading}
              size="sm"
              testID="button-toggle-loading"
              variant="secondary"
            >
              <Button.Label>
                {loading ? "Stop loading" : "Start loading"}
              </Button.Label>
            </Button>
          </View>

          <Button loading={loading} testID="button-loading">
            <Button.Icon>
              {({ color, size }) => (
                <DemoIcon color={color} glyph="↑" size={size} />
              )}
            </Button.Icon>
            <Button.Label>Upload file</Button.Label>
          </Button>

          <Button disabled testID="button-disabled" variant="secondary">
            <Button.Label>Unavailable</Button.Label>
          </Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ICON BUTTONS</Text>
          <View style={styles.iconButtonRow}>
            <Button accessibilityLabel="Add item" size="icon">
              <Button.Icon>
                {({ color, size }) => (
                  <DemoIcon color={color} glyph="+" size={size} />
                )}
              </Button.Icon>
            </Button>

            <Button
              accessibilityLabel="Open next item"
              size="icon"
              variant="secondary"
            >
              <Button.Icon>
                {({ color, size }) => (
                  <DemoIcon color={color} glyph="→" size={size} />
                )}
              </Button.Icon>
            </Button>

            <Button
              accessibilityLabel={loading ? "Loading item" : "Refresh item"}
              loading={loading}
              size="icon"
              testID="button-icon-loading"
              variant="destructive"
            >
              <Button.Icon>
                {({ color, size }) => (
                  <DemoIcon color={color} glyph="↻" size={size} />
                )}
              </Button.Icon>
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SIZES</Text>

          <Button size="sm" testID="button-size-sm" variant="secondary">
            <Button.Label>Small</Button.Label>
          </Button>

          <Button size="md" testID="button-size-md" variant="secondary">
            <Button.Label>Medium</Button.Label>
          </Button>

          <Button size="lg" testID="button-size-lg" variant="secondary">
            <Button.Label>Large</Button.Label>
          </Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THEMING</Text>
          <ButtonThemeProvider theme={PROVIDER_THEME}>
            <Button haptics>
              <Button.Label>Provider theme</Button.Label>
            </Button>
          </ButtonThemeProvider>

          <Button theme={LOCAL_THEME} variant="secondary">
            <Button.Label>Per-button theme</Button.Label>
          </Button>
        </View>
      </View>
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 30,
  },
  section: {
    gap: 12,
  },
  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionLabel: {
    color: "#77736B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  iconButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  demoIcon: {
    fontWeight: "700",
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
});
