import type { PressableProps } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
};

export function Button({
  disabled = false,
  label,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...props}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 22,
    transform: [{ scale: 1 }],
  },
  primary: {
    backgroundColor: '#1D1D1B',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D6D3CA',
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.38,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#1D1D1B',
  },
  ghostLabel: {
    color: '#6558D9',
  },
});
