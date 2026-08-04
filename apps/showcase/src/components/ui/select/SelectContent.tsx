import { SelectCustomContent } from "./SelectCustomContent";
import { type SelectContentProps, useSelectContext } from "./selectShared";

export function SelectContent({ align = "end", children, sideOffset = 8, size = "default" }: SelectContentProps) {
  const context = useSelectContext("Select.Content");
  if (context.mode === "native") return null;
  return <SelectCustomContent align={align} context={context} sideOffset={sideOffset} size={size}>{children}</SelectCustomContent>;
}
