import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput as NativeTextInput,
  View,
  type TextInputProps as NativeTextInputProps,
} from 'react-native';

export type InputProps = NativeTextInputProps & {
  invalid?: boolean;
};

export const Input = forwardRef<NativeTextInput, InputProps>(function Input(
  {
    invalid = false,
    onBlur,
    onFocus,
    placeholderTextColor = '#969189',
    style,
    ...props
  },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.shell,
        focused && styles.focused,
        invalid && styles.invalid,
      ]}
    >
      <NativeTextInput
        ref={ref}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        placeholderTextColor={placeholderTextColor}
        selectionColor="#6558D9"
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D6D3CA',
    borderRadius: 17,
    borderWidth: 1,
  },
  focused: {
    borderColor: '#6558D9',
    borderWidth: 2,
  },
  invalid: {
    borderColor: '#C84A43',
  },
  input: {
    color: '#1D1D1B',
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 17,
    paddingVertical: 14,
  },
});
