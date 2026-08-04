import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Check, PartyPopper, Send } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ExampleScreen } from "../components/ExampleScreen";
import { Button } from "../components/ui/button";
import { Toast } from "../components/ui/toast/ToastNamespace";
import { useToast } from "../components/ui/toast/Toast";
import { ToastThemeProvider } from "../components/ui/toast/ToastThemeProvider";
import type {
  ToastTheme,
  ToastThemeOverride,
} from "../components/ui/toast/toastTheme";
import type { ToastPosition, ToastStack } from "../components/ui/toast/toastState";
import type { RootStackParamList } from "../navigation/types";

type ToastScreenProps = NativeStackScreenProps<RootStackParamList, "Toast">;

const SOFT_TOAST_THEME = {
  actionColor: "#102419",
  backgroundColor: "#A4F6BE",
  borderColor: "rgba(255, 255, 255, 0.76)",
  iconBackgroundColor: "rgba(255, 255, 255, 0.58)",
  labelColor: "#102419",
} as const satisfies ToastThemeOverride;

const SOLID_TOAST_THEME = {
  backgroundColor: "#3FAF81",
  borderColor: "rgba(255, 255, 255, 0.16)",
  iconBackgroundColor: "rgba(255, 255, 255, 0.94)",
  labelColor: "#FFFFFF",
} as const satisfies ToastThemeOverride;

const INVERSE_TOAST_THEME = {
  actionColor: "#FFFFFF",
  backgroundColor: "#10100F",
  borderColor: "rgba(255, 255, 255, 0.18)",
  iconBackgroundColor: "#FFFFFF",
  labelColor: "#FFFFFF",
} as const satisfies ToastThemeOverride;

const TOAST_PROVIDER_THEME = {
  shadowColor: "#181A17",
} as const satisfies ToastTheme;

export function ToastScreen({ navigation }: ToastScreenProps) {
  const [position, setPosition] = useState<ToastPosition>("bottom");
  const [stack, setStack] = useState<ToastStack>("deck");

  return (
    <ToastThemeProvider theme={TOAST_PROVIDER_THEME}>
      <Toast.Provider maxToasts={3} position={position} stack={stack}>
        <View style={styles.root}>
          <ExampleScreen onBack={navigation.goBack} title="Toast">
            <StatusBar style="dark" />
            <ToastExamples
              onPositionChange={setPosition}
              onStackChange={setStack}
              position={position}
              stack={stack}
            />
          </ExampleScreen>
          <Toast.Viewport testID="toast-viewport" />
        </View>
      </Toast.Provider>
    </ToastThemeProvider>
  );
}

type ToastExamplesProps = {
  onPositionChange: (position: ToastPosition) => void;
  onStackChange: (stack: ToastStack) => void;
  position: ToastPosition;
  stack: ToastStack;
};

function ToastExamples({
  onPositionChange,
  onStackChange,
  position,
  stack,
}: ToastExamplesProps) {
  const toast = useToast();

  return (
    <View style={styles.stack}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DEFAULT</Text>
        <Button
          onPress={() => toast.show({ message: "Changes saved successfully" })}
          variant="secondary"
        >
          <Button.Label>Show default toast</Button.Label>
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>STYLE RECIPES</Text>
        <Button
          onPress={() =>
            toast.show({
              action: { label: "Undo", onPress: () => {} },
              icon: <Check color="#102419" size={21} strokeWidth={3} />,
              message: "Item removed everywhere",
              theme: SOFT_TOAST_THEME,
              durationMs: null,
            })
          }
          testID="toast-soft"
          variant="secondary"
        >
          <Button.Label>Show soft toast</Button.Label>
        </Button>
        <Button
          onPress={() =>
            toast.show({
              icon: <PartyPopper color="#287B61" size={20} strokeWidth={2.4} />,
              message: "Your invites are on their way",
              theme: SOLID_TOAST_THEME,
            })
          }
          testID="toast-solid"
        >
          <Button.Label>Show solid toast</Button.Label>
        </Button>
        <Button
          onPress={() =>
            toast.show({
              action: { label: "Dismiss", onPress: () => {} },
              durationMs: null,
              message: "Thanks! We’ve received your feedback.",
              theme: INVERSE_TOAST_THEME,
            })
          }
          testID="toast-inverse"
          variant="outline"
        >
          <Button.Label>Show inverse toast</Button.Label>
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>STACKING</Text>
        <View style={styles.optionRow}>
          <Button
            onPress={() => onStackChange("deck")}
            size="sm"
            variant={stack === "deck" ? "primary" : "outline"}
          >
            <Button.Label>Deck</Button.Label>
          </Button>
          <Button
            onPress={() => onStackChange("vertical")}
            size="sm"
            variant={stack === "vertical" ? "primary" : "outline"}
          >
            <Button.Label>Vertical</Button.Label>
          </Button>
        </View>
        <Button
          onPress={() => {
            toast.show({
              durationMs: null,
              icon: <Send color="#102419" size={19} strokeWidth={2.6} />,
              id: "toast-one",
              message: "First notification",
              theme: SOFT_TOAST_THEME,
            });
            toast.show({
              durationMs: null,
              id: "toast-two",
              message: "Second notification",
              theme: SOLID_TOAST_THEME,
            });
            toast.show({
              durationMs: null,
              id: "toast-three",
              message: "Third notification",
              theme: INVERSE_TOAST_THEME,
            });
          }}
          testID="toast-stack"
          variant="secondary"
        >
          <Button.Label>Show three toasts</Button.Label>
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>REPEAT FEEDBACK</Text>
        <Button
          onPress={() =>
            toast.show({
              icon: <Check color="#102419" size={21} strokeWidth={3} />,
              id: "clipboard-copied",
              message: "Copied to clipboard",
              theme: SOFT_TOAST_THEME,
            })
          }
          testID="toast-repeat"
          variant="secondary"
        >
          <Button.Label>Show copied toast</Button.Label>
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>LOCAL THEME</Text>
        <Button
          onPress={() =>
            toast.show({
              icon: <PartyPopper color="#FFFFFF" size={18} strokeWidth={2.4} />,
              message: "A toast styled for this moment",
              theme: {
                backgroundColor: "#6558D9",
                borderColor: "#8F84EB",
                borderRadius: 16,
                iconBackgroundColor: "rgba(255, 255, 255, 0.16)",
                label: { fontSize: 14 },
                labelColor: "#FFFFFF",
                layout: {
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                },
              },
            })
          }
          variant="outline"
        >
          <Button.Label>Show themed toast</Button.Label>
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>POSITION</Text>
        <View style={styles.optionRow}>
          <Button
            onPress={() => onPositionChange("top")}
            size="sm"
            variant={position === "top" ? "primary" : "outline"}
          >
            <Button.Label>Top</Button.Label>
          </Button>
          <Button
            onPress={() => onPositionChange("bottom")}
            size="sm"
            variant={position === "bottom" ? "primary" : "outline"}
          >
            <Button.Label>Bottom</Button.Label>
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
  optionRow: {
    flexDirection: "row",
    gap: 10,
  },
});
