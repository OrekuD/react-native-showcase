import { useSelectContext } from "./selectShared";

/** Displays the selected option label or a placeholder inside a trigger. */
export function SelectValue({ placeholder = "Select an option" }: { placeholder?: string }) {
  const { selectedOption } = useSelectContext("Select.Value");
  return selectedOption?.label || placeholder;
}
