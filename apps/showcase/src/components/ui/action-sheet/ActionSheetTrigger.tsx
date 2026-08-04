import { cloneElement, useCallback } from "react";

import {
  callChildPress,
  type ActionSheetTriggerProps,
  useActionSheetContext,
} from "./actionSheetShared";

export function ActionSheetTrigger({ children }: ActionSheetTriggerProps) {
  const { openSheet, testID } = useActionSheetContext("ActionSheet.Trigger");
  const handlePress = useCallback<
    NonNullable<typeof children.props.onPress>
  >(
    (event) => {
      if (children.props.disabled) return;
      openSheet();
      callChildPress(children.props.onPress, event);
    },
    [children.props.disabled, children.props.onPress, openSheet]
  );

  return cloneElement(children, {
    accessibilityRole: children.props.accessibilityRole ?? "button",
    onPress: handlePress,
    testID,
  });
}
