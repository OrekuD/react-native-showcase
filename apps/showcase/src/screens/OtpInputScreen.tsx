import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef } from "react";
import type { KeyboardAwareScrollViewRef } from "react-native-keyboard-controller";
import {
  Keyboard,
  StyleSheet,
  Text,
  View,
  type FocusEvent,
} from "react-native";

import { ExampleScreen } from "../components/ExampleScreen";
import {
  OtpInput,
  OtpInputThemeProvider,
  type OtpInputTheme,
} from "../components/ui/OtpInput";
import type { RootStackParamList } from "../navigation/types";

type OtpInputScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "OtpInput"
>;

const OTP_PROVIDER_THEME = {
  colors: {
    cursor: "#C2410C",
    focus: "#28594A",
    outlineBorder: "#AAB9B1",
    placeholder: "#8C9A91",
    separator: "#4C655B",
    surface: "#E8F0EC",
  },
} satisfies OtpInputTheme;

export function OtpInputScreen({ navigation }: OtpInputScreenProps) {
  const keyboardScrollViewRef = useRef<KeyboardAwareScrollViewRef>(null);
  const focusedOtpTargetRef = useRef<FocusEvent["target"] | null>(null);
  const scrollFocusedOtpIntoView = useCallback(() => {
    const focusedOtpTarget = focusedOtpTargetRef.current;

    if (focusedOtpTarget === null) return;

    keyboardScrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
      focusedOtpTarget,
      24,
      true
    );
  }, []);
  const handleOtpFocus = useCallback(
    (event: FocusEvent) => {
      focusedOtpTargetRef.current = event.target;
      scrollFocusedOtpIntoView();
    },
    [scrollFocusedOtpIntoView]
  );

  useEffect(() => {
    const subscription = Keyboard.addListener(
      "keyboardDidShow",
      scrollFocusedOtpIntoView
    );

    return () => subscription.remove();
  }, [scrollFocusedOtpIntoView]);

  return (
    <ExampleScreen
      keyboardAware
      keyboardAwareScrollViewRef={keyboardScrollViewRef}
      onBack={navigation.goBack}
      title="OTP Input"
    >
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INLINE</Text>
          <Text style={styles.sizeLabel}>LARGE</Text>
          <OtpInput
            autoFocus={false}
            numberOfDigits={6}
            onFocus={handleOtpFocus}
            placeholder="******"
            separator
            size="lg"
            testID="otp-inline-large"
            variant="inline"
          />
          <Text style={styles.sizeLabel}>SMALL</Text>
          <OtpInput
            autoFocus={false}
            numberOfDigits={6}
            onFocus={handleOtpFocus}
            placeholder="******"
            separator
            size="sm"
            testID="otp-inline-small"
            variant="inline"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OUTLINE</Text>
          <Text style={styles.sizeLabel}>LARGE</Text>
          <OtpInput
            autoFocus={false}
            numberOfDigits={6}
            onFocus={handleOtpFocus}
            placeholder="******"
            separator
            size="lg"
            testID="otp-outline-large"
            variant="outline"
          />
          <Text style={styles.sizeLabel}>SMALL</Text>
          <OtpInput
            autoFocus={false}
            numberOfDigits={6}
            onFocus={handleOtpFocus}
            placeholder="******"
            separator
            size="sm"
            testID="otp-outline-small"
            variant="outline"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FILLED</Text>
          <Text style={styles.sizeLabel}>LARGE</Text>
          <OtpInput
            autoFocus={false}
            numberOfDigits={6}
            onFocus={handleOtpFocus}
            separator
            size="lg"
            testID="otp-filled-large"
            variant="filled"
          />
          <Text style={styles.sizeLabel}>SMALL</Text>
          <OtpInput
            autoFocus={false}
            numberOfDigits={6}
            onFocus={handleOtpFocus}
            placeholder="••••••"
            separator
            size="sm"
            testID="otp-filled-small"
            variant="filled"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>UNDERLINE</Text>
          <Text style={styles.sizeLabel}>LARGE</Text>
          <OtpInput
            autoFocus={false}
            numberOfDigits={6}
            onFocus={handleOtpFocus}
            placeholder="••••••"
            separator
            size="lg"
            testID="otp-underline-large"
            variant="underline"
          />
          <Text style={styles.sizeLabel}>SMALL</Text>
          <OtpInput
            autoFocus={false}
            numberOfDigits={6}
            onFocus={handleOtpFocus}
            placeholder="••••••"
            separator
            size="sm"
            testID="otp-underline-small"
            variant="underline"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THEMING</Text>
          <OtpInputThemeProvider theme={OTP_PROVIDER_THEME}>
            <OtpInput
              autoFocus={false}
              numberOfDigits={6}
              onFocus={handleOtpFocus}
              placeholder="••••••"
              separator
              size="lg"
              testID="otp-themed"
              variant="filled"
            />
          </OtpInputThemeProvider>
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
  sectionLabel: {
    color: "#77736B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  sizeLabel: {
    color: "#A19D95",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
});
