import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ExampleScreen } from '../components/ExampleScreen';
import { Button } from '../components/ui/Button';
import type { RootStackParamList } from '../navigation/types';

type ButtonScreenProps = NativeStackScreenProps<RootStackParamList, 'Button'>;

export function ButtonScreen({ navigation }: ButtonScreenProps) {
  const [saved, setSaved] = useState(false);

  return (
    <ExampleScreen onBack={navigation.goBack} title="Button">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <Button
          label={saved ? 'Saved' : 'Save changes'}
          onPress={() => setSaved(true)}
          testID="button-primary"
        />
        <Button label="Preview" testID="button-secondary" variant="secondary" />
        <Button label="Learn more" testID="button-ghost" variant="ghost" />
      </View>
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
});
