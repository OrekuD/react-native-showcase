import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimationListItem } from '../components/AnimationListItem';
import type { RootStackParamList } from '../navigation/types';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const ANIMATIONS = [
  {
    id: 'currency-formatting',
    title: 'Currency formatting',
    description: 'Locale-aware values with rolling digits and symbols.',
    tags: ['Number', 'Transition'],
    route: 'CurrencyFormatting',
  },
] as const;

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <FlatList
        contentContainerStyle={styles.content}
        data={ANIMATIONS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.eyebrowRow}>
              <View style={styles.dot} />
              <Text style={styles.eyebrow}>MOTION PLAYGROUND</Text>
            </View>
            <Text style={styles.title}>Motion Lab</Text>
            <Text style={styles.subtitle}>
              Small interactions, studied one at a time.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <AnimationListItem
            description={item.description}
            index={index + 1}
            onPress={() => navigation.navigate(item.route)}
            tags={item.tags}
            testID={`animation-card-${item.id}`}
            title={item.title}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F5F3EE',
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    paddingBottom: 34,
    paddingTop: 50,
  },
  eyebrowRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  dot: {
    backgroundColor: '#8B7CF6',
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  eyebrow: {
    color: '#6B6962',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  title: {
    color: '#1D1D1B',
    fontSize: 46,
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 51,
  },
  subtitle: {
    color: '#6B6962',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 9,
  },
});
