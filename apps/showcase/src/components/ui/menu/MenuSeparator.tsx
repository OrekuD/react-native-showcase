import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { View } from "react-native";

import { styles, useMenuContext } from "./menuShared";

export function MenuSeparator() {
  const { size, theme } = useMenuContext("Menu.Separator");
  return <DropdownMenuPrimitive.Separator asChild decorative><View style={[styles.separator, size === "compact" && styles.separatorCompact, { backgroundColor: theme.separatorColor }]} /></DropdownMenuPrimitive.Separator>;
}
