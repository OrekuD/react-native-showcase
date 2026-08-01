import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Check, Search } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ExampleScreen } from '../components/ExampleScreen';
import {
  Input,
  InputThemeProvider,
  type InputTheme,
  type InputThemeOverride,
} from '../components/ui/Input';
import type { RootStackParamList } from '../navigation/types';

type InputScreenProps = NativeStackScreenProps<RootStackParamList, 'Input'>;

const INPUT_SIZES = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
] as const;

const INPUT_APPEARANCES = [
  { label: 'Filled', value: 'filled' },
  { label: 'Stacked', value: 'stacked' },
  { label: 'Notched', value: 'notched' },
  { label: 'External', value: 'external' },
] as const;

const INPUT_PROVIDER_THEME = {
  appearances: {
    filled: { backgroundColor: '#E8F0EC' },
  },
  colors: {
    filledFocusBorder: '#4D806E',
    focus: '#28594A',
  },
} satisfies InputTheme;

const INPUT_LOCAL_THEME = {
  appearance: {
    backgroundColor: '#EEE9FF',
    borderRadius: 16,
  },
  colors: {
    filledFocusBorder: '#725DB7',
    focus: '#5138A5',
  },
  cornerSmoothing: 0.9,
} satisfies InputThemeOverride;

export function InputScreen({ navigation }: InputScreenProps) {
  const [email, setEmail] = useState('');
  const [lastName, setLastName] = useState('Doe');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const emailIsValid =
    email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailStatus =
    email.length === 0 ? 'default' : emailIsValid ? 'success' : 'error';
  const lastNameIsValid = lastName.trim().length > 0;
  const firstNameIsValid = firstName.trim().length > 0;
  const passwordIsValid = password.length >= 8;
  const passwordHasInput = password.length > 0;

  return (
    <ExampleScreen keyboardAware onBack={navigation.goBack} title="Input">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APPEARANCES</Text>

          <Input.Root appearance="filled" status={emailStatus}>
            <Input.Control
              autoCapitalize="none"
              autoComplete="email"
              clearable
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email address"
              testID="input-filled"
              value={email}
            />
            <Input.Message
              tone={emailStatus === 'default' ? 'info' : emailStatus}
            >
              {emailStatus === 'default'
                ? 'We will only use this to contact you about your account.'
                : emailIsValid
                  ? 'Email looks good.'
                  : 'Enter a valid email address.'}
            </Input.Message>
          </Input.Root>

          <Input.Root
            appearance="stacked"
            status={lastNameIsValid ? 'success' : 'error'}
          >
            <Input.Label>Last name</Input.Label>
            <Input.Control
              onChangeText={setLastName}
              testID="input-stacked"
              value={lastName}
            />
            <Input.Trailing>
              <Input.Icon>
                {({ color, size }) =>
                  lastNameIsValid ? (
                    <Check color={color} size={size} strokeWidth={2.4} />
                  ) : (
                    <AlertCircle color={color} size={size} strokeWidth={2} />
                  )}
              </Input.Icon>
            </Input.Trailing>
            {!lastNameIsValid ? (
              <Input.Message tone="error">Last name is required.</Input.Message>
            ) : null}
          </Input.Root>

          <Input.Root
            appearance="notched"
            status={firstNameIsValid ? 'success' : 'error'}
          >
            <Input.Label required>First name</Input.Label>
            <Input.Control
              onChangeText={setFirstName}
              testID="input-notched"
              value={firstName}
            />
            <Input.Trailing>
              <Input.Icon>
                {({ color, size }) =>
                  firstNameIsValid ? (
                    <Check color={color} size={size} strokeWidth={2.4} />
                  ) : (
                    <AlertCircle color={color} size={size} strokeWidth={2} />
                  )}
              </Input.Icon>
            </Input.Trailing>
            <Input.Message tone={firstNameIsValid ? 'success' : 'error'}>
              {firstNameIsValid
                ? 'First name is ready.'
                : 'Enter your first name to continue.'}
            </Input.Message>
          </Input.Root>

          <Input.Root
            appearance="external"
            secureEntry
            status={
              passwordHasInput
                ? passwordIsValid
                  ? 'success'
                  : 'error'
                : 'default'
            }
          >
            <Input.Label required>Password</Input.Label>
            <Input.Control
              autoCapitalize="none"
              autoComplete="current-password"
              onChangeText={setPassword}
              testID="input-secure"
              value={password}
            />
            <Input.Message
              tone={
                passwordHasInput
                  ? passwordIsValid
                    ? 'success'
                    : 'error'
                  : 'info'
              }
            >
              {passwordHasInput
                ? passwordIsValid
                  ? 'Password is strong enough.'
                  : 'Use at least 8 characters.'
                : 'Use at least 8 characters.'}
            </Input.Message>
          </Input.Root>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COMPOSED SEARCH</Text>

          <Input.Root appearance="filled">
            <Input.Leading>
              <Input.Icon>
                {({ color, size }) => (
                  <Search color={color} size={size} strokeWidth={2} />
                )}
              </Input.Icon>
            </Input.Leading>
            <Input.Control
              accessibilityLabel="Search components"
              autoCorrect={false}
              clearable
              onChangeText={setSearchQuery}
              placeholder="Search components"
              returnKeyType="search"
              testID="input-composed-search"
              value={searchQuery}
            />
          </Input.Root>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SIZES</Text>

          {INPUT_APPEARANCES.map(({ label: appearanceLabel, value }) => (
            <View key={value} style={styles.sizeGroup}>
              <Text style={styles.sizeGroupLabel}>{appearanceLabel}</Text>
              {INPUT_SIZES.map(({ label: sizeLabel, value: size }) => (
                <Input.Root appearance={value} key={size} size={size}>
                  {value === 'filled' ? null : (
                    <Input.Label>{sizeLabel}</Input.Label>
                  )}
                  <Input.Control placeholder={`${sizeLabel} input`} />
                </Input.Root>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THEMING</Text>

          <InputThemeProvider theme={INPUT_PROVIDER_THEME}>
            <Input.Root appearance="filled">
              <Input.Control placeholder="Provider theme" />
            </Input.Root>
          </InputThemeProvider>

          <Input.Root appearance="filled" theme={INPUT_LOCAL_THEME}>
            <Input.Control placeholder="Per-input theme" />
          </Input.Root>
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
    gap: 18,
  },
  sectionLabel: {
    color: '#77736B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  sizeGroup: {
    gap: 14,
  },
  sizeGroupLabel: {
    color: '#969189',
    fontSize: 12,
    fontWeight: '600',
  },
});
