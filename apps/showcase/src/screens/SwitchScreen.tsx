import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Check, X } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ExampleScreen } from "../components/ExampleScreen";
import {
  Switch,
  SwitchThemeProvider,
  type SwitchTheme,
} from "../components/ui/switch";
import type { RootStackParamList } from "../navigation/types";

type SwitchScreenProps = NativeStackScreenProps<RootStackParamList, "Switch">;

const SWITCH_PROVIDER_THEME = {
  off: {
    borderColor: "#AAB9B1",
    thumbColor: "#FFFFFF",
    trackColor: "#DDE9E1",
  },
  on: {
    borderColor: "#28594A",
    thumbColor: "#FFFFFF",
    trackColor: "#28594A",
  },
} satisfies SwitchTheme;

export function SwitchScreen({ navigation }: SwitchScreenProps) {
  const [solidEnabled, setSolidEnabled] = useState(true);
  const [outlineEnabled, setOutlineEnabled] = useState(false);
  const [tightEnabled, setTightEnabled] = useState(true);
  const [iconEnabled, setIconEnabled] = useState(true);
  const [providerEnabled, setProviderEnabled] = useState(true);
  const [nativeEnabled, setNativeEnabled] = useState(false);
  const [localEnabled, setLocalEnabled] = useState(false);

  return (
    <ExampleScreen onBack={navigation.goBack} title="Switch">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUSTOM</Text>
          <Switch
            description="The standard filled treatment."
            haptics
            label="Solid"
            onValueChange={setSolidEnabled}
            testID="switch-solid"
            value={solidEnabled}
            variant="solid"
          />
          <Switch
            description="A transparent track with a defined edge."
            haptics
            label="Outline"
            onValueChange={setOutlineEnabled}
            testID="switch-outline"
            value={outlineEnabled}
            variant="outline"
          />
          <Switch
            description="A closer thumb inset."
            haptics
            label="Solid tight"
            onValueChange={setTightEnabled}
            testID="switch-solid-tight"
            value={tightEnabled}
            variant="solid-tight"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THUMB ICONS</Text>
          <Switch
            description="State icons swap inside the thumb."
            haptics
            label="Thumb icons"
            onValueChange={setIconEnabled}
            testID="switch-thumb-icons"
            thumbIcons={{
              off: <X color="#A1A1AA" size={15} strokeWidth={2.5} />,
              on: <Check color="#5962EE" size={15} strokeWidth={2.8} />,
            }}
            value={iconEnabled}
            variant="solid-tight"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THEMING</Text>
          <SwitchThemeProvider theme={SWITCH_PROVIDER_THEME}>
            <View style={styles.themedStack}>
              <Switch
                description="Provider colors apply to custom and native modes."
                haptics
                label="Provider theme"
                onValueChange={setProviderEnabled}
                testID="switch-provider-theme"
                value={providerEnabled}
              />
              <Switch
                haptics
                label="Native mode"
                mode="native"
                onValueChange={setNativeEnabled}
                testID="switch-native"
                value={nativeEnabled}
              />
            </View>
          </SwitchThemeProvider>
          <Switch
            haptics
            label="Local override"
            onValueChange={setLocalEnabled}
            testID="switch-local-theme"
            theme={{
              off: { borderColor: "#C8B7EA", thumbColor: "#8C6CC1" },
              on: { borderColor: "#725DB7", thumbColor: "#725DB7" },
            }}
            value={localEnabled}
            variant="outline"
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
    gap: 12,
  },
  sectionLabel: {
    color: "#77736B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  themedStack: {
    gap: 12,
  },
});
