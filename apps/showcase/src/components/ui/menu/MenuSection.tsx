import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { Text, View } from "react-native";

import { styles, type MenuSectionProps, useMenuContext } from "./menuShared";

export function MenuSection({ children, title }: MenuSectionProps) {
  const { size, theme } = useMenuContext("Menu.Section");
  return (
    <DropdownMenuPrimitive.Group asChild>
      <View style={[styles.section, size === "compact" && styles.sectionCompact]}>
        {title ? <DropdownMenuPrimitive.Label asChild><Text style={[styles.sectionTitle, size === "compact" && styles.sectionTitleCompact, { color: theme.sectionLabelColor }]}>{title}</Text></DropdownMenuPrimitive.Label> : null}
        <View style={[styles.sectionItems, size === "compact" && styles.sectionItemsCompact]}>{children}</View>
      </View>
    </DropdownMenuPrimitive.Group>
  );
}
