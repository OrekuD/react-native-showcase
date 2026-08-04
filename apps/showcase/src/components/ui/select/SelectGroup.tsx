import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import { Text, View } from "react-native";

import { styles, type SelectGroupProps, useSelectContext } from "./selectShared";

export function SelectGroup({ children, label }: SelectGroupProps) {
  const { size, theme } = useSelectContext("Select.Group");
  return <DropdownMenuPrimitive.Group asChild><View style={[styles.group, size === "compact" && styles.groupCompact]}>{label ? <DropdownMenuPrimitive.Label asChild><Text style={[styles.groupLabel, size === "compact" && styles.groupLabelCompact, { color: theme.sectionLabelColor }]}>{label}</Text></DropdownMenuPrimitive.Label> : null}<View style={[styles.groupItems, size === "compact" && styles.groupItemsCompact]}>{children}</View></View></DropdownMenuPrimitive.Group>;
}
