import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { NumberFlow } from 'number-flow-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CURRENCIES,
  createRandomCurrencyState,
} from '../features/currency-formatting/currencyFormatting';
import type { RootStackParamList } from '../navigation/types';

type CurrencyFormattingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CurrencyFormatting'
>;

const TRANSFORM_TIMING = {
  duration: 280,
  easing: Easing.out(Easing.cubic),
};

const OPACITY_TIMING = {
  duration: 180,
  easing: Easing.out(Easing.cubic),
};

export function CurrencyFormattingScreen({
  navigation,
}: CurrencyFormattingScreenProps) {
  const [{ amount, currencyIndex }, setCurrencyState] = useState(
    createRandomCurrencyState,
  );
  const currency = CURRENCIES[currencyIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to animations"
          accessibilityRole="button"
          hitSlop={10}
          onPress={navigation.goBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          testID="currency-back-button"
        >
          <Text accessibilityElementsHidden style={styles.backIcon}>
            ‹
          </Text>
        </Pressable>
        <Text style={styles.headerTitle}>01 / Currency</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.stage}>
        <View style={styles.label}>
          <Text style={styles.labelText}>LIVE FORMAT</Text>
        </View>

        <View style={styles.numberFrame}>
          <NumberFlow
            format={{ style: 'currency', currency: currency.code }}
            locales={currency.locale}
            opacityTiming={OPACITY_TIMING}
            spinTiming={TRANSFORM_TIMING}
            style={styles.number}
            transformTiming={TRANSFORM_TIMING}
            value={amount}
          />
        </View>

        <Text style={styles.localeLabel}>
          {currency.label} · {currency.locale}
        </Text>
      </View>

      <View style={styles.controls}>
        <Text style={styles.helpText}>
          Change the value and locale to watch every digit and symbol find its
          new place.
        </Text>
        <Pressable
          accessibilityHint="Generates a new amount and currency"
          accessibilityRole="button"
          onPress={() => setCurrencyState(createRandomCurrencyState())}
          style={({ pressed }) => [
            styles.randomizeButton,
            pressed && styles.randomizeButtonPressed,
          ]}
          testID="currency-randomize-button"
        >
          <Text style={styles.randomizeText}>Randomize</Text>
          <Text accessibilityElementsHidden style={styles.randomizeIcon}>
            ↗
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#121210',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#292925',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    transform: [{ scale: 1 }],
    width: 42,
  },
  backButtonPressed: {
    backgroundColor: '#383832',
    transform: [{ scale: 0.96 }],
  },
  backIcon: {
    color: '#F5F3EE',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -2,
  },
  headerTitle: {
    color: '#A6A49C',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSpacer: {
    width: 42,
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    borderColor: '#4A4943',
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 34,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  labelText: {
    color: '#A6A49C',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  numberFrame: {
    alignItems: 'center',
    minHeight: 68,
    justifyContent: 'center',
    width: '100%',
  },
  number: {
    color: '#F5F3EE',
    fontFamily: 'System',
    fontSize: 50,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 62,
  },
  localeLabel: {
    color: '#77756E',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.7,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  controls: {
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  helpText: {
    color: '#8E8C84',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
    maxWidth: 330,
  },
  randomizeButton: {
    alignItems: 'center',
    backgroundColor: '#D7FF72',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: 20,
    transform: [{ scale: 1 }],
  },
  randomizeButtonPressed: {
    backgroundColor: '#C9EF68',
    transform: [{ scale: 0.98 }],
  },
  randomizeText: {
    color: '#161614',
    fontSize: 16,
    fontWeight: '700',
  },
  randomizeIcon: {
    color: '#161614',
    fontSize: 21,
  },
});
