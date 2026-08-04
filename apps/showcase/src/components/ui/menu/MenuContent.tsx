import { MenuCustomContent } from "./MenuCustomContent";
import { type MenuContentProps, useMenuContext } from "./menuShared";

export function MenuContent({ align = "end", children, sideOffset = 8, size = "default" }: MenuContentProps) {
  const context = useMenuContext("Menu.Content");
  if (context.mode === "native") return null;
  return <MenuCustomContent align={align} context={context} sideOffset={sideOffset} size={size}>{children}</MenuCustomContent>;
}
