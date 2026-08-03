import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { AnimatedRollingNumber } from 'react-native-animated-rolling-numbers';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Easing, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CURRENCY_OPTIONS,
  createRandomCounterState,
  formatCounterValue,
} from '../features/currency-formatting/currencyFormatting';
import type { RootStackParamList } from '../navigation/types';

type CurrencyFormattingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CurrencyFormatting'
>;

const ROLLING_TIMING = {
  duration: 260,
  easing: Easing.out(Easing.cubic),
  reduceMotion: ReduceMotion.System,
};

export function CurrencyFormattingScreen({
  navigation,
}: CurrencyFormattingScreenProps) {
  const { width } = useWindowDimensions();
  const [{ amount, currencyIndex }, setCounterState] = useState(
    () => createRandomCounterState(),
  );
  const currency = CURRENCY_OPTIONS[currencyIndex];
  const formattedValue = formatCounterValue(amount, currency);
  const numberFontSize = Math.min(
    48,
    Math.max(32, (width - 80) / (formattedValue.length * 0.56)),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to animations"
          accessibilityRole="button"
          hitSlop={8}
          onPress={navigation.goBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          testID="currency-back-button"
        >
          <ArrowLeft
            accessible={false}
            color="#1C1C1A"
            size={22}
            strokeWidth={2.2}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Rolling currency</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.stage}>
        <AnimatedRollingNumber
          accessibilityLabel={formattedValue}
          accessibilityLiveRegion="polite"
          accessibilityRole="text"
          accessible
          formattedText={formattedValue}
          spinningAnimationConfig={ROLLING_TIMING}
          textStyle={[
            styles.number,
            {
              fontSize: numberFontSize,
              lineHeight: Math.round(numberFontSize * 1.18),
            },
          ]}
          value={amount}
        />
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityHint="Shows a new amount in dollars, euros, or Ghana cedis"
          accessibilityRole="button"
          onPress={() => setCounterState(createRandomCounterState())}
          style={({ pressed }) => [
            styles.randomizeButton,
            pressed && styles.randomizeButtonPressed,
          ]}
          testID="currency-randomize-button"
        >
          <Text style={styles.randomizeText}>Randomize</Text>
          <View style={styles.randomizeIconFrame}>
            <Text accessibilityElementsHidden style={styles.randomizeIcon}>
              ↻
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#EFEEE8',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 66,
    paddingHorizontal: 20,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D7CF',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    transform: [{ scale: 1 }],
    width: 48,
  },
  backButtonPressed: {
    backgroundColor: '#E3E1D9',
    transform: [{ scale: 0.96 }],
  },
  headerTitle: {
    color: '#66645E',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  number: {
    color: '#1C1C1A',
    fontFamily: 'System',
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    letterSpacing: -1.6,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  randomizeButton: {
    alignItems: 'center',
    backgroundColor: '#1C1C1A',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 10,
    minHeight: 50,
    paddingLeft: 18,
    paddingRight: 6,
    transform: [{ scale: 1 }],
  },
  randomizeButtonPressed: {
    backgroundColor: '#343430',
    transform: [{ scale: 0.98 }],
  },
  randomizeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  randomizeIconFrame: {
    alignItems: 'center',
    backgroundColor: '#F8F6ED',
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  randomizeIcon: {
    color: '#1C1C1A',
    fontSize: 20,
    lineHeight: 23,
  },
});
