import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ExampleScreen } from '../components/ExampleScreen';
import { Switch } from '../components/ui/Switch';
import type { RootStackParamList } from '../navigation/types';

type SwitchScreenProps = NativeStackScreenProps<RootStackParamList, 'Switch'>;

export function SwitchScreen({ navigation }: SwitchScreenProps) {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <ExampleScreen onBack={navigation.goBack} title="Switch">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <Switch
          description="Use subtle feedback for taps and gestures."
          label="Haptics"
          onValueChange={setHapticsEnabled}
          value={hapticsEnabled}
        />
        <Switch
          description="Prefer calmer transitions throughout the app."
          label="Reduce motion"
          onValueChange={setReduceMotion}
          value={reduceMotion}
        />
      </View>
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
});
