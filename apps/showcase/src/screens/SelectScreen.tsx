import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import {
  BriefcaseBusiness,
  ChevronDown,
  Code2,
  Palette,
  UserRound,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ExampleScreen } from "../components/ExampleScreen";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectThemeProvider,
  type SelectTheme,
} from "../components/ui/select";
import type { RootStackParamList } from "../navigation/types";

type SelectScreenProps = NativeStackScreenProps<RootStackParamList, "Select">;

const SELECT_PROVIDER_THEME = {
  backgroundColor: "#EEF4FF",
  borderColor: "#D6E4FF",
  checkmarkColor: "#205EAF",
  descriptionColor: "#52647D",
  iconBackgroundColor: "#DDEAFF",
  labelColor: "#172B4D",
  sectionLabelColor: "#52647D",
  shadowColor: "#203A5D",
} satisfies SelectTheme;

export function SelectScreen({ navigation }: SelectScreenProps) {
  const [workspace, setWorkspace] = useState("design");
  const [compactValue, setCompactValue] = useState("recent");
  const [localThemeValue, setLocalThemeValue] = useState("monthly");
  const [nativeValue, setNativeValue] = useState("personal");
  const [providerThemeValue, setProviderThemeValue] = useState("personal");

  return (
    <ExampleScreen onBack={navigation.goBack} title="Select">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUSTOM</Text>
          <Select
            onValueChange={setWorkspace}
            testID="select-custom-trigger"
            value={workspace}
          >
            <Select.Trigger>
              <Button variant="secondary">
                <Button.Label>
                  <Select.Value placeholder="Choose workspace" />
                </Button.Label>
                <Button.Icon>
                  {({ color, size }) => (
                    <ChevronDown color={color} size={size} strokeWidth={2.4} />
                  )}
                </Button.Icon>
              </Button>
            </Select.Trigger>

            <Select.Content align="start">
              <Select.Group label="WORKSPACES">
                <Select.Item
                  description="Your private workspace."
                  haptics
                  icon={<UserRound color="#151513" size={18} strokeWidth={2.2} />}
                  value="personal"
                >
                  Personal
                </Select.Item>
                <Select.Item
                  description="Shared with the product team."
                  icon={<Palette color="#151513" size={18} strokeWidth={2.2} />}
                  value="design"
                >
                  Design
                </Select.Item>
                <Select.Item
                  description="For engineering work and experiments."
                  icon={<Code2 color="#151513" size={18} strokeWidth={2.2} />}
                  value="engineering"
                >
                  Engineering
                </Select.Item>
              </Select.Group>
            </Select.Content>
          </Select>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUSTOM · COMPACT</Text>
          <Select
            onValueChange={setCompactValue}
            testID="select-compact-trigger"
            value={compactValue}
          >
            <Select.Trigger>
              <Button variant="outline">
                <Button.Label>
                  <Select.Value placeholder="Sort by" />
                </Button.Label>
                <Button.Icon>
                  {({ color, size }) => (
                    <ChevronDown color={color} size={size} strokeWidth={2.4} />
                  )}
                </Button.Icon>
              </Button>
            </Select.Trigger>

            <Select.Content align="start" size="compact">
              <Select.Item value="recent">Most recent</Select.Item>
              <Select.Item value="name">Name</Select.Item>
              <Select.Item value="updated">Last updated</Select.Item>
            </Select.Content>
          </Select>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NATIVE</Text>
          <Select
            mode="native"
            onValueChange={setNativeValue}
            testID="select-native-trigger"
            title="Workspace"
            value={nativeValue}
          >
            <Select.Trigger>
              <Button variant="outline">
                <Button.Label>
                  <Select.Value placeholder="Choose workspace" />
                </Button.Label>
                <Button.Icon>
                  {({ color, size }) => (
                    <ChevronDown color={color} size={size} strokeWidth={2.4} />
                  )}
                </Button.Icon>
              </Button>
            </Select.Trigger>

            <Select.Content>
              <Select.Group label="WORKSPACES">
                <Select.Item value="personal">Personal</Select.Item>
                <Select.Item value="design">Design</Select.Item>
                <Select.Item value="engineering">Engineering</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THEMING</Text>
          <SelectThemeProvider theme={SELECT_PROVIDER_THEME}>
            <Select
              onValueChange={setProviderThemeValue}
              testID="select-provider-theme"
              value={providerThemeValue}
            >
              <Select.Trigger>
                <Button variant="secondary">
                  <Button.Label>
                    <Select.Value placeholder="Choose workspace" />
                  </Button.Label>
                  <Button.Icon>
                    {({ color, size }) => (
                      <ChevronDown color={color} size={size} strokeWidth={2.4} />
                    )}
                  </Button.Icon>
                </Button>
              </Select.Trigger>

              <Select.Content align="start" size="compact">
                <Select.Item value="personal">Personal</Select.Item>
                <Select.Item value="design">Design</Select.Item>
              </Select.Content>
            </Select>
          </SelectThemeProvider>

          <Select
            onValueChange={setLocalThemeValue}
            testID="select-local-theme"
            theme={{
              checkmarkColor: "#7A4814",
              iconBackgroundColor: "#F7EAD8",
              labelColor: "#4C2D0D",
            }}
            value={localThemeValue}
          >
            <Select.Trigger>
              <Button variant="outline">
                <Button.Label>
                  <Select.Value placeholder="Choose interval" />
                </Button.Label>
                <Button.Icon>
                  {({ color, size }) => (
                    <ChevronDown color={color} size={size} strokeWidth={2.4} />
                  )}
                </Button.Icon>
              </Button>
            </Select.Trigger>

            <Select.Content align="start" size="compact">
              <Select.Item value="weekly">Weekly</Select.Item>
              <Select.Item value="monthly">Monthly</Select.Item>
            </Select.Content>
          </Select>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DISABLED</Text>
          <Select disabled defaultValue="archive">
            <Select.Trigger>
              <Button variant="secondary">
                <Button.Label>
                  <Select.Value placeholder="Choose destination" />
                </Button.Label>
                <Button.Icon>
                  {({ color, size }) => (
                    <BriefcaseBusiness
                      color={color}
                      size={size}
                      strokeWidth={2.2}
                    />
                  )}
                </Button.Icon>
              </Button>
            </Select.Trigger>

            <Select.Content>
              <Select.Item value="archive">Archive</Select.Item>
            </Select.Content>
          </Select>
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
});
