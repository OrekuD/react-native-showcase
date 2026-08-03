import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import {
  Camera,
  FileText,
  ImagePlus,
  Images,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { ExampleScreen } from "../components/ExampleScreen";
import { Button } from "../components/ui/Button";
import {
  Menu,
  MenuThemeProvider,
  type MenuTheme,
  type NativeMenuAction,
} from "../components/ui/menu";
import type { RootStackParamList } from "../navigation/types";

type MenuScreenProps = NativeStackScreenProps<RootStackParamList, "Menu">;

const NATIVE_ACTIONS = [
  { id: "rename", image: "pencil", title: "Rename" },
  { id: "duplicate", image: "doc.on.doc", title: "Duplicate" },
  {
    id: "delete",
    image: "trash",
    title: "Delete",
    attributes: { destructive: true },
  },
] satisfies readonly NativeMenuAction[];

const MENU_PROVIDER_THEME = {
  backgroundColor: "#EEF4FF",
  borderColor: "#D6E4FF",
  descriptionColor: "#52647D",
  iconBackgroundColor: "#DDEAFF",
  labelColor: "#172B4D",
  sectionLabelColor: "#52647D",
  separatorColor: "#C6D8F2",
  shadowColor: "#203A5D",
} satisfies MenuTheme;

export function MenuScreen({ navigation }: MenuScreenProps) {
  return (
    <ExampleScreen onBack={navigation.goBack} title="Menu">
      <StatusBar style="dark" />
      <View style={styles.stack}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUSTOM</Text>
          <Menu testID="menu-custom-trigger">
            <Menu.Trigger>
              <Button variant="secondary">
                <Button.Label>Add media</Button.Label>
              </Button>
            </Menu.Trigger>

            <Menu.Content align="start">
              <Menu.Section>
                <Menu.Item
                  description="Take a new photo or video."
                  haptics
                  icon={<Camera color="#151513" size={20} strokeWidth={2.2} />}
                >
                  Camera
                </Menu.Item>
                <Menu.Item
                  description="Choose from your library."
                  icon={<Images color="#151513" size={20} strokeWidth={2.2} />}
                >
                  Photos
                </Menu.Item>
                <Menu.Item
                  description="Browse documents on this device."
                  icon={
                    <FileText color="#151513" size={20} strokeWidth={2.2} />
                  }
                >
                  Files
                </Menu.Item>
              </Menu.Section>

              <Menu.Separator />

              <Menu.Section title="CREATE">
                <Menu.Item
                  description="Start with a blank image."
                  icon={
                    <ImagePlus color="#151513" size={20} strokeWidth={2.2} />
                  }
                >
                  Create image
                </Menu.Item>
                <Menu.Item
                  description="Make changes to an existing image."
                  icon={<Pencil color="#151513" size={20} strokeWidth={2.2} />}
                >
                  Edit image
                </Menu.Item>
              </Menu.Section>
            </Menu.Content>
          </Menu>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUSTOM · PLAIN ITEMS</Text>
          <Menu testID="menu-custom-plain-trigger">
            <Menu.Trigger>
              <Button variant="outline">
                <Button.Label>More options</Button.Label>
              </Button>
            </Menu.Trigger>

            <Menu.Content align="start">
              <Menu.Item>Share</Menu.Item>
              <Menu.Item>Duplicate</Menu.Item>
              <Menu.Item destructive>Delete</Menu.Item>
            </Menu.Content>
          </Menu>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUSTOM · COMPACT</Text>
          <Menu testID="menu-custom-compact-trigger">
            <Menu.Trigger>
              <Button variant="outline">
                <Button.Label>Quick actions</Button.Label>
              </Button>
            </Menu.Trigger>

            <Menu.Content align="start" size="compact">
              <Menu.Item
                haptics
                icon={<Camera color="#151513" size={20} strokeWidth={2.2} />}
              >
                Camera
              </Menu.Item>
              <Menu.Item
                icon={<Images color="#151513" size={20} strokeWidth={2.2} />}
              >
                Photos
              </Menu.Item>
              <Menu.Item
                destructive
                icon={<Trash2 color="#B42318" size={20} strokeWidth={2.2} />}
              >
                Delete
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COMPACT · PLAIN ITEMS</Text>
          <Menu testID="menu-custom-compact-plain-trigger">
            <Menu.Trigger>
              <Button variant="outline">
                <Button.Label>File actions</Button.Label>
              </Button>
            </Menu.Trigger>

            <Menu.Content align="start" size="compact">
              <Menu.Item>Rename</Menu.Item>
              <Menu.Item>Duplicate</Menu.Item>
              <Menu.Item destructive>Delete</Menu.Item>
            </Menu.Content>
          </Menu>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NATIVE</Text>
          <Menu
            actions={NATIVE_ACTIONS}
            mode="native"
            testID="menu-native-trigger"
            title="File"
          >
            <Menu.Trigger>
              <Button variant="outline">
                <Button.Label>Native actions</Button.Label>
                <Button.Icon>
                  {({ color, size }) => (
                    <MoreHorizontal
                      color={color}
                      size={size}
                      strokeWidth={2.4}
                    />
                  )}
                </Button.Icon>
              </Button>
            </Menu.Trigger>
          </Menu>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THEMING</Text>
          <MenuThemeProvider theme={MENU_PROVIDER_THEME}>
            <Menu testID="menu-provider-theme">
              <Menu.Trigger>
                <Button variant="secondary">
                  <Button.Label>Themed menu</Button.Label>
                </Button>
              </Menu.Trigger>

              <Menu.Content align="start" size="compact">
                <Menu.Item>Duplicate</Menu.Item>
                <Menu.Item>Share</Menu.Item>
              </Menu.Content>
            </Menu>
          </MenuThemeProvider>

          <Menu
            testID="menu-local-theme"
            theme={{
              destructiveLabelColor: "#A33B2B",
              iconBackgroundColor: "#F7EAD8",
              labelColor: "#4C2D0D",
              separatorColor: "#E7CFAE",
            }}
          >
            <Menu.Trigger>
              <Button variant="outline">
                <Button.Label>Local theme</Button.Label>
              </Button>
            </Menu.Trigger>

            <Menu.Content align="start" size="compact">
              <Menu.Item>Duplicate</Menu.Item>
              <Menu.Item destructive>Delete</Menu.Item>
            </Menu.Content>
          </Menu>
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
