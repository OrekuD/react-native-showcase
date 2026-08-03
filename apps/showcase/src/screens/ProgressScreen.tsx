import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ExampleScreen } from "../components/ExampleScreen";
import { Button } from "../components/ui/button";
import {
  Progress,
  ProgressThemeProvider,
  type ProgressTheme,
} from "../components/ui/progress";
import type { RootStackParamList } from "../navigation/types";

type ProgressScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Progress"
>;

const PROGRESS_THEME = {
  indicatorColor: "#2E8F6A",
  trackColor: "#DDE9E1",
} satisfies ProgressTheme;

export function ProgressScreen({ navigation }: ProgressScreenProps) {
  const [value, setValue] = useState(42);

  return (
    <ExampleScreen onBack={navigation.goBack} title="Progress">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>DEFAULT</Text>
            <Text style={styles.valueLabel}>{value}%</Text>
          </View>
          <Progress testID="progress-default" value={value} />
          <Button
            onPress={() =>
              setValue((current) => (current >= 90 ? 18 : current + 18))
            }
            size="sm"
            variant="outline"
          >
            <Button.Label>Advance progress</Button.Label>
          </Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SIZES AND COLORS</Text>
          <Progress color="#E47A50" height={5} value={28} />
          <Progress color="#6558D9" height={14} value={68} />
          <Progress color="#BB3E61" height={20} value={82} width="72%" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THEMING</Text>
          <ProgressThemeProvider theme={PROGRESS_THEME}>
            <Progress height={12} value={74} />
          </ProgressThemeProvider>
          <Progress
            height={12}
            theme={{ indicatorColor: "#B7682E", trackColor: "#F2E3D4" }}
            value={56}
          />
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
    gap: 14,
  },
  sectionHeader: {
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
  valueLabel: {
    color: "#4F4C46",
    fontSize: 14,
    fontWeight: "700",
  },
});
