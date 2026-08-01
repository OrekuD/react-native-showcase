import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ExampleScreenProps = {
  children: ReactNode;
  onBack: () => void;
  title: string;
};

export function ExampleScreen({ children, onBack, title }: ExampleScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to showcase"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Text accessibilityElementsHidden style={styles.backIcon}>
            ←
          </Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.preview}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F2F0EA',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: 20,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DAD7CE',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    transform: [{ scale: 1 }],
    width: 48,
  },
  backButtonPressed: {
    backgroundColor: '#E7E4DC',
    transform: [{ scale: 0.96 }],
  },
  backIcon: {
    color: '#1D1D1B',
    fontSize: 24,
    lineHeight: 27,
  },
  title: {
    color: '#66645E',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  preview: {
    alignSelf: 'center',
    maxWidth: 420,
    width: '100%',
  },
});
