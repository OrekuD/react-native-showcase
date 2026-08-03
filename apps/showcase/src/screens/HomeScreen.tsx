import { Host, List, ListItem, Text as ExpoText } from "@expo/ui";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootStackParamList } from "../navigation/types";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <Text style={styles.pageTitle}>Showcase</Text>
      <Host colorScheme="light" seedColor="#6558D9" style={styles.host}>
        <List testID="showcase-home-list">
          <ExpoText
            style={styles.firstSectionLabel}
            textStyle={textStyles.sectionLabel}
          >
            COMPONENTS
          </ExpoText>
          <ListItem
            onPress={() => navigation.navigate("Button")}
            testID="home-component-button"
            trailing="›"
          >
            Button
          </ListItem>
          <ListItem
            onPress={() => navigation.navigate("Input")}
            testID="home-component-input"
            trailing="›"
          >
            Input
          </ListItem>
          <ListItem
            onPress={() => navigation.navigate("OtpInput")}
            testID="home-component-otp-input"
            trailing="›"
          >
            OTP Input
          </ListItem>
          <ListItem
            onPress={() => navigation.navigate("ConfirmationDialog")}
            testID="home-component-confirmation-dialog"
            trailing="›"
          >
            Confirmation Dialog
          </ListItem>
          <ListItem
            onPress={() => navigation.navigate("Switch")}
            testID="home-component-switch"
            trailing="›"
          >
            Switch
          </ListItem>
          <ListItem
            onPress={() => navigation.navigate("Menu")}
            testID="home-component-menu"
            trailing="›"
          >
            Menu
          </ListItem>
          <ListItem
            onPress={() => navigation.navigate("Select")}
            testID="home-component-select"
            trailing="›"
          >
            Select
          </ListItem>

          <ExpoText
            style={styles.sectionLabel}
            textStyle={textStyles.sectionLabel}
          >
            INTERACTIONS
          </ExpoText>
          <ListItem
            onPress={() => navigation.navigate("CurrencyFormatting")}
            testID="home-interaction-rolling-currency"
            trailing="›"
          >
            Rolling currency
          </ListItem>

          <ExpoText
            style={styles.sectionLabel}
            textStyle={textStyles.sectionLabel}
          >
            SHOWCASES
          </ExpoText>
          <ExpoText style={styles.emptyState} textStyle={textStyles.emptyState}>
            Larger visual experiments will live here.
          </ExpoText>
        </List>
      </Host>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F2F0EA",
    flex: 1,
  },
  host: {
    backgroundColor: "#F2F0EA",
    flex: 1,
  },
  pageTitle: {
    color: "#1D1D1B",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.2,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  firstSectionLabel: {
    paddingBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionLabel: {
    paddingBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  emptyState: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
});

const textStyles = {
  sectionLabel: {
    color: "#77736B",
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.3,
  },
  emptyState: {
    color: "#8A867E",
    fontSize: 14,
    lineHeight: 20,
  },
};
