import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ExampleScreen } from "../components/ExampleScreen";
import {
  ConfirmationDialog,
  type ConfirmationDialogMode,
  type ConfirmationDialogVariant,
} from "../components/ui/ConfirmationDialog";
import { Button } from "../components/ui/Button";
import type { RootStackParamList } from "../navigation/types";

type ConfirmationDialogScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ConfirmationDialog"
>;

type DialogExample = {
  description: string;
  mode: ConfirmationDialogMode;
  title: string;
  variant: ConfirmationDialogVariant;
};

const ACTION_SHEET: DialogExample = {
  description: "Choose what you want to mute. They won't be notified.",
  mode: "custom",
  title: "Mute updates?",
  variant: "action-sheet",
};

const COMPACT: DialogExample = {
  description: "This comment will be removed from every day where it appears.",
  mode: "custom",
  title: "Remove this comment?",
  variant: "compact",
};

const PROMINENT: DialogExample = {
  description:
    "Your link will stop working and you won't be able to receive payment.",
  mode: "custom",
  title: "Cancel this request?",
  variant: "prominent",
};

const NATIVE: DialogExample = {
  description: "This uses the platform alert instead of a custom dialog.",
  mode: "native",
  title: "Continue?",
  variant: "compact",
};

export function ConfirmationDialogScreen({
  navigation,
}: ConfirmationDialogScreenProps) {
  const [activeExample, setActiveExample] = useState<DialogExample>(COMPACT);
  const [open, setOpen] = useState(false);

  const show = (example: DialogExample) => {
    setActiveExample(example);
    setOpen(true);
  };

  return (
    <ExampleScreen onBack={navigation.goBack} title="Confirmation Dialog">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUSTOM VARIANTS</Text>
          <Button
            onPress={() => show(ACTION_SHEET)}
            testID="confirmation-dialog-action-sheet"
            variant="secondary"
          >
            <Button.Label>Action sheet</Button.Label>
          </Button>
          <Button
            onPress={() => show(COMPACT)}
            testID="confirmation-dialog-compact"
            variant="secondary"
          >
            <Button.Label>Compact dialog</Button.Label>
          </Button>
          <Button
            onPress={() => show(PROMINENT)}
            testID="confirmation-dialog-prominent"
            variant="secondary"
          >
            <Button.Label>Prominent dialog</Button.Label>
          </Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MODE</Text>
          <Button
            onPress={() => show(NATIVE)}
            testID="confirmation-dialog-native"
            variant="outline"
          >
            <Button.Label>Native alert</Button.Label>
          </Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>IMPERATIVE</Text>
          <Button
            onPress={() =>
              ConfirmationDialog.alert(
                "Delete this draft?",
                "You won't be able to recover it after deleting.",
                [
                  { text: "Keep draft", style: "cancel" },
                  { text: "Delete", style: "destructive" },
                ],
                { mode: "custom" }
              )
            }
            testID="confirmation-dialog-imperative"
            variant="destructive"
          >
            <Button.Label>Show imperatively</Button.Label>
          </Button>
        </View>
      </View>

      <ConfirmationDialog
        buttons={
          activeExample.variant === "action-sheet"
            ? [
                { text: "Mute story", style: "destructive" },
                { text: "Mute story and posts" },
                { text: "Cancel", style: "cancel" },
              ]
            : undefined
        }
        cancelLabel={
          activeExample.variant === "action-sheet" ? "Keep updates" : "Cancel"
        }
        confirmLabel={
          activeExample.variant === "action-sheet"
            ? "Mute story"
            : activeExample.variant === "prominent"
            ? "Cancel request"
            : "Remove"
        }
        description={activeExample.description}
        destructive={activeExample.variant !== "action-sheet"}
        dismissible={activeExample.variant !== "action-sheet"}
        mode={activeExample.mode}
        onOpenChange={setOpen}
        open={open}
        title={activeExample.title}
        variant={activeExample.variant}
      />
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
