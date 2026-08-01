import {
  StyleSheet,
  Switch as NativeSwitch,
  Text,
  View,
} from 'react-native';

export type SwitchProps = {
  description?: string;
  disabled?: boolean;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
};

export function Switch({
  description,
  disabled = false,
  label,
  onValueChange,
  value,
}: SwitchProps) {
  return (
    <View style={[styles.row, disabled && styles.disabled]}>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <NativeSwitch
        accessibilityLabel={label}
        disabled={disabled}
        ios_backgroundColor="#D8D5CD"
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: '#D8D5CD', true: '#6558D9' }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DCD9D0',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 18,
    minHeight: 82,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  copy: {
    flex: 1,
  },
  label: {
    color: '#1D1D1B',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  description: {
    color: '#77736B',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
});
