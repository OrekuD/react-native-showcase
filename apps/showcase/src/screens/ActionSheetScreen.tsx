import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import {
  CheckSquare2,
  Copy,
  Link2,
  LogOut,
  Printer,
  Trash2,
} from "lucide-react-native";
import { Platform, StyleSheet, Text, View } from "react-native";

import { ExampleScreen } from "../components/ExampleScreen";
import {
  ActionSheet,
  ActionSheetThemeProvider,
  type ActionSheetAction,
} from "../components/ui/action-sheet";
import { Button } from "../components/ui/button";
import type { RootStackParamList } from "../navigation/types";

type ActionSheetScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ActionSheet"
>;

const TASK_ACTIONS = [
  {
    description: "Stop receiving updates for this task.",
    icon: ({ color, size }) => <LogOut color={color} size={size} />,
    id: "unsubscribe",
    label: "Unsubscribe",
  },
  {
    description: "Send this task to a connected printer.",
    icon: ({ color, size }) => <Printer color={color} size={size} />,
    id: "print",
    label: "Print task",
  },
  {
    icon: ({ color, size }) => <Link2 color={color} size={size} />,
    id: "copy-link",
    label: "Copy link",
  },
  {
    icon: ({ color, size }) => <CheckSquare2 color={color} size={size} />,
    id: "hide-completed",
    label: "Hide completed tasks",
  },
  {
    destructive: true,
    icon: ({ color, size }) => <Trash2 color={color} size={size} />,
    id: "delete",
    label: "Delete task",
    separatorBefore: true,
  },
] satisfies readonly ActionSheetAction[];

const SHARE_ACTIONS = [
  {
    icon: ({ color, size }) => <Copy color={color} size={size} />,
    id: "copy",
    label: "Copy",
  },
  {
    icon: ({ color, size }) => <Link2 color={color} size={size} />,
    id: "share-link",
    label: "Share link",
  },
] satisfies readonly ActionSheetAction[];

const FILE_FORMAT_ACTIONS = [
  { id: "csv", label: "Comma Separated Values (CSV)" },
  { id: "ofx", label: "Open Financial Exchange (OFX)" },
  { id: "qfx", label: "Quicken Financial Exchange (QFX)" },
  { id: "qbo", label: "QuickBooks (QBO)" },
] satisfies readonly ActionSheetAction[];

export function ActionSheetScreen({ navigation }: ActionSheetScreenProps) {
  return (
    <ExampleScreen onBack={navigation.goBack} title="Action Sheet">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        {Platform.OS === "ios" ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AUTOMATIC</Text>
            <ActionSheet
              actions={TASK_ACTIONS}
              message="Choose what to do with this task."
              testID="action-sheet-automatic-trigger"
              title="Task actions"
            >
              <ActionSheet.Trigger>
                <Button variant="secondary">
                  <Button.Label>Open platform sheet</Button.Label>
                </Button>
              </ActionSheet.Trigger>
              <ActionSheet.Content />
            </ActionSheet>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUSTOM · DETACHED</Text>
          <ActionSheet
            actions={TASK_ACTIONS}
            haptics
            mode="custom"
            testID="action-sheet-custom-trigger"
          >
            <ActionSheet.Trigger>
              <Button variant="outline">
                <Button.Label>Open custom sheet</Button.Label>
              </Button>
            </ActionSheet.Trigger>
            <ActionSheet.Content />
          </ActionSheet>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THEMING</Text>
          <ActionSheetThemeProvider
            theme={{
              backgroundColor: "#EEF4FF",
              borderColor: "#D6E4FF",
              iconBackgroundColor: "#DDEAFF",
              iconColor: "#365A8C",
              labelColor: "#172B4D",
              separatorColor: "#C6D8F2",
            }}
          >
            <ActionSheet
              actions={SHARE_ACTIONS}
              mode="custom"
              testID="action-sheet-themed-trigger"
            >
              <ActionSheet.Trigger>
                <Button variant="secondary">
                  <Button.Label>Open themed sheet</Button.Label>
                </Button>
              </ActionSheet.Trigger>
              <ActionSheet.Content />
            </ActionSheet>
          </ActionSheetThemeProvider>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUSTOMIZED FORMAT PICKER</Text>
          <ActionSheet
            actions={FILE_FORMAT_ACTIONS}
            haptics
            mode="custom"
            testID="action-sheet-format-picker-trigger"
            title="Select a file format"
          >
            <ActionSheet.Trigger>
              <Button variant="secondary">
                <Button.Label>Choose file format</Button.Label>
              </Button>
            </ActionSheet.Trigger>
            <ActionSheet.Content
              cornerSmoothing={0.9}
              gap={10}
              inset={8}
              itemCornerSmoothing={1}
              itemLabelStyle={styles.formatPickerItemLabel}
              itemStyle={styles.formatPickerItem}
              showHandle={false}
              style={styles.formatPickerSheet}
              titleStyle={styles.formatPickerTitle}
            />
          </ActionSheet>
        </View>
      </View>
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  formatPickerItem: {
    backgroundColor: "#E4E4EA",
    borderRadius: 999,
    minHeight: 54,
    height: 54,
  },
  formatPickerItemLabel: { fontWeight: "500", textAlign: "center" },
  formatPickerSheet: {
    backgroundColor: "#F9F9FC",
    borderColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 34,
    padding: 24,
  },
  formatPickerTitle: {
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
  },
  section: { gap: 12 },
  sectionLabel: {
    color: "#77736B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  stack: { gap: 30 },
});
