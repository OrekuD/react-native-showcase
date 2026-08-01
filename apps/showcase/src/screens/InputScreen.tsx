import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ExampleScreen } from '../components/ExampleScreen';
import { Input } from '../components/ui/Input';
import type { RootStackParamList } from '../navigation/types';

type InputScreenProps = NativeStackScreenProps<RootStackParamList, 'Input'>;

export function InputScreen({ navigation }: InputScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ExampleScreen onBack={navigation.goBack} title="Input">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <Input
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email address"
          testID="input-email"
          value={email}
        />
        <Input
          autoCapitalize="none"
          autoComplete="current-password"
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          testID="input-password"
          value={password}
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
