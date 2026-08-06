import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";
import { Easing } from "react-native-reanimated";

import { ExampleScreen } from "../components/ExampleScreen";
import { Button } from "../components/ui/button";
import type { RootStackParamList } from "../navigation/types";

type AnimatedCounterScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AnimatedCounter"
>;

type CounterExamples = {
  balance: number;
  count: number;
  completion: number;
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const PERCENTAGE_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  style: "percent",
});

const INITIAL_VALUES: CounterExamples = {
  balance: 12_450,
  completion: 0.684,
  count: 1_248,
};

const SPINNING_ANIMATION_CONFIG = {
  duration: 340,
  easing: Easing.out(Easing.cubic),
};

export function AnimatedCounterScreen({
  navigation,
}: AnimatedCounterScreenProps) {
  const [values, setValues] = useState(INITIAL_VALUES);

  return (
    <ExampleScreen onBack={navigation.goBack} title="Animated counter">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <View style={styles.example}>
          <Text style={styles.sectionLabel}>NUMBER</Text>
          <View
            accessible
            accessibilityLabel={`Number: ${values.count}`}
            accessibilityLiveRegion="polite"
            style={styles.valueContainer}
            testID="animated-counter-number"
          >
            <AnimatedRollingNumber
              spinningAnimationConfig={SPINNING_ANIMATION_CONFIG}
              textStyle={styles.numberValue}
              useGrouping
              value={values.count}
            />
          </View>
        </View>

        <View style={styles.example}>
          <Text style={styles.sectionLabel}>CURRENCY</Text>
          <View
            accessible
            accessibilityLabel={`Currency: ${CURRENCY_FORMATTER.format(values.balance)}`}
            accessibilityLiveRegion="polite"
            style={styles.valueContainer}
            testID="animated-counter-currency"
          >
            <AnimatedRollingNumber
              formattedText={CURRENCY_FORMATTER.format(values.balance)}
              spinningAnimationConfig={SPINNING_ANIMATION_CONFIG}
              textStyle={[styles.numberValue, styles.currencyValue]}
              value={values.balance}
            />
          </View>
        </View>

        <View style={styles.example}>
          <Text style={styles.sectionLabel}>PERCENTAGE</Text>
          <View
            accessible
            accessibilityLabel={`Percentage: ${PERCENTAGE_FORMATTER.format(values.completion)}`}
            accessibilityLiveRegion="polite"
            style={styles.valueContainer}
            testID="animated-counter-percentage"
          >
            <AnimatedRollingNumber
              formattedText={PERCENTAGE_FORMATTER.format(values.completion)}
              spinningAnimationConfig={SPINNING_ANIMATION_CONFIG}
              textStyle={[styles.numberValue, styles.percentageValue]}
              value={values.completion * 100}
            />
          </View>
        </View>

        <Button
          onPress={() => setValues(createRandomCounterExamples())}
          size="sm"
          testID="animated-counter-randomize-button"
          variant="outline"
        >
          <Button.Label>Randomize values</Button.Label>
        </Button>
      </View>
    </ExampleScreen>
  );
}

function createRandomCounterExamples(): CounterExamples {
  return {
    balance: randomInteger(1_000, 40_000),
    completion: randomInteger(10, 99) / 100,
    count: randomInteger(100, 9_999),
  };
}

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  example: {
    gap: 10,
  },
  sectionLabel: {
    color: "#77736B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  valueContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E1DED6",
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 120,
    paddingHorizontal: 20,
  },
  numberValue: {
    color: "#1D1D1B",
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1.6,
    lineHeight: 52,
  },
  currencyValue: {
    color: "#2E6D59",
  },
  percentageValue: {
    color: "#6558D9",
  },
});
