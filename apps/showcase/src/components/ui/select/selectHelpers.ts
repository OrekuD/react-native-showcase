import type { MenuAction } from "@expo/ui/community/menu";

import { isSelectValueSelected } from "./selectState";
import type { SelectItemProps, SelectOption } from "./selectShared";

export function getOptionLabel({ children, label }: Pick<SelectItemProps, "children" | "label">): string {
  if (label) return label;
  return typeof children === "string" || typeof children === "number" ? String(children) : "";
}

export function getNativeActions(options: readonly SelectOption[], selectedValue: string | undefined): MenuAction[] {
  const groups = new Map<string | undefined, SelectOption[]>();
  for (const option of options) {
    const group = groups.get(option.groupLabel) ?? [];
    groups.set(option.groupLabel, [...group, option]);
  }
  return Array.from(groups.entries()).flatMap(([groupLabel, groupOptions]) => {
    const actions = groupOptions.map<MenuAction>((option) => ({
      attributes: option.disabled ? { disabled: true } : undefined,
      id: option.value,
      state: isSelectValueSelected(selectedValue, option.value) ? "on" : "off",
      title: option.label,
    }));
    return groupLabel ? [{ displayInline: true, id: `group-${groupLabel}`, subactions: actions, title: groupLabel }] : actions;
  });
}
