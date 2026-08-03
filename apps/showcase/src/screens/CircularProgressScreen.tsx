import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ExampleScreen } from "../components/ExampleScreen";
import { Button } from "../components/ui/button";
import {
  CircularProgress,
  CircularProgressThemeProvider,
  type CircularProgressSegment,
  type CircularProgressTheme,
} from "../components/ui/circular-progress";
import type { RootStackParamList } from "../navigation/types";

type CircularProgressScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CircularProgress"
>;

const CIRCULAR_PROGRESS_THEME = {
  indicatorColor: "#2E8F6A",
  trackColor: "#DDE9E1",
} satisfies CircularProgressTheme;

const SEGMENTED_ARC_ITEMS = [
  { color: "#6558D9", id: "design", value: 28 },
  { color: "#C26638", id: "development", value: 22 },
  { color: "#2E8F6A", id: "testing", value: 20 },
  { color: "#BB3E61", id: "release", value: 15 },
] as const satisfies readonly CircularProgressSegment[];

const CUMULATIVE_ARC_ITEMS = [
  { color: "#2563EB", id: "blue", value: 30 },
  { color: "#EAB308", id: "yellow", value: 60 },
  { color: "#DC3545", id: "red", value: 80 },
] as const satisfies readonly CircularProgressSegment[];

export function CircularProgressScreen({
  navigation,
}: CircularProgressScreenProps) {
  const [value, setValue] = useState(64);

  return (
    <ExampleScreen onBack={navigation.goBack} title="Circular progress">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DEFAULT</Text>
          <View style={styles.defaultPreview}>
            <CircularProgress
              size={144}
              testID="circular-progress-default"
              value={value}
            >
              {({ percentage }) => (
                <Text style={styles.ringValue}>{percentage}%</Text>
              )}
            </CircularProgress>
          </View>
          <Button
            onPress={() =>
              setValue((current) => (current >= 90 ? 12 : current + 13))
            }
            size="sm"
            variant="outline"
          >
            <Button.Label>Advance progress</Button.Label>
          </Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ARCS</Text>
          <View style={styles.arcRow}>
            <View style={styles.arcExample}>
              <CircularProgress
                arcLayout="tight"
                color="#6558D9"
                size={150}
                startAngle={180}
                strokeCap="round"
                sweepAngle={180}
                thickness={12}
                trackColor="#E1DCF6"
                value={72}
              >
                {({ percentage }) => (
                  <Text style={styles.ringValue}>{percentage}%</Text>
                )}
              </CircularProgress>
              <Text style={styles.arcLabel}>SEMICIRCLE</Text>
            </View>

            <View style={styles.arcExample}>
              <CircularProgress
                arcLayout="tight"
                color="#C26638"
                size={120}
                startAngle={135}
                strokeCap="butt"
                sweepAngle={270}
                thickness={10}
                trackColor="#E7C8B6"
                value={58}
              >
                {({ percentage }) => (
                  <Text style={styles.ringValue}>{percentage}%</Text>
                )}
              </CircularProgress>
              <Text style={styles.arcLabel}>GAUGE ARC</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SEGMENTED ARC</Text>
          <View style={styles.segmentedPreview}>
            <CircularProgress
              arcLayout="tight"
              max={100}
              segmentGapAngle={3}
              segments={SEGMENTED_ARC_ITEMS}
              size={240}
              startAngle={180}
              strokeCap="round"
              sweepAngle={180}
              thickness={14}
              trackColor="#DDDAD3"
            >
              {({ percentage }) => (
                <View style={styles.ringSummary}>
                  <Text style={styles.segmentedValue}>{percentage}%</Text>
                  <Text style={styles.ringCaption}>TOTAL</Text>
                </View>
              )}
            </CircularProgress>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUMULATIVE ARC</Text>
          <View style={styles.segmentedPreview}>
            <CircularProgress
              arcLayout="tight"
              max={100}
              segmentMode="cumulative"
              segments={CUMULATIVE_ARC_ITEMS}
              size={240}
              startAngle={180}
              strokeCap="round"
              sweepAngle={180}
              thickness={14}
              trackColor="#DDDAD3"
            >
              {({ percentage }) => (
                <View style={styles.ringSummary}>
                  <Text style={styles.segmentedValue}>{percentage}%</Text>
                  <Text style={styles.ringCaption}>HIGHEST</Text>
                </View>
              )}
            </CircularProgress>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RING SIZES</Text>
          <View style={styles.ringRow}>
            <CircularProgress
              color="#C26638"
              size={76}
              thickness={6}
              trackColor="#E7C8B6"
              value={36}
            >
              {({ percentage }) => (
                <Text style={styles.ringValue}>{percentage}%</Text>
              )}
            </CircularProgress>
            <CircularProgress
              color="#6558D9"
              size={104}
              thickness={12}
              trackColor="#E1DCF6"
              value={68}
            >
              {({ percentage }) => (
                <Text style={styles.ringValue}>{percentage}%</Text>
              )}
            </CircularProgress>
            <CircularProgress
              color="#BB3E61"
              size={132}
              thickness={18}
              trackColor="#F4D8DF"
              value={84}
            >
              {({ percentage }) => (
                <View style={styles.ringSummary}>
                  <Text style={styles.ringValue}>{percentage}%</Text>
                  <Text style={styles.ringCaption}>COMPLETE</Text>
                </View>
              )}
            </CircularProgress>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THEMING</Text>
          <CircularProgressThemeProvider theme={CIRCULAR_PROGRESS_THEME}>
            <CircularProgress size={108} thickness={14} value={72}>
              {({ percentage }) => (
                <Text style={styles.ringValue}>{percentage}%</Text>
              )}
            </CircularProgress>
          </CircularProgressThemeProvider>
        </View>
      </View>
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 32,
  },
  section: {
    gap: 14,
  },
  sectionLabel: {
    color: "#77736B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  defaultPreview: {
    alignItems: "center",
    paddingVertical: 8,
  },
  arcRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  arcExample: {
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    minWidth: 150,
  },
  arcLabel: {
    color: "#77736B",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  segmentedPreview: {
    alignItems: "center",
    paddingVertical: 8,
  },
  segmentedValue: {
    color: "#252522",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  ringRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ringValue: {
    color: "#252522",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  ringSummary: {
    alignItems: "center",
    gap: 2,
  },
  ringCaption: {
    color: "#77736B",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
