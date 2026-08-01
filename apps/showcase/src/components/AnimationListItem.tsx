import { Pressable, StyleSheet, Text, View } from 'react-native';

type AnimationListItemProps = {
  index: number;
  title: string;
  description: string;
  tags: readonly string[];
  testID?: string;
  onPress: () => void;
};

export function AnimationListItem({
  index,
  title,
  description,
  tags,
  testID,
  onPress,
}: AnimationListItemProps) {
  return (
    <Pressable
      accessibilityHint="Opens the animation demo"
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      testID={testID}
    >
      <View style={styles.topRow}>
        <Text style={styles.index}>{String(index).padStart(2, '0')}</Text>
        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.arrow}>
          <Text accessibilityElementsHidden style={styles.arrowText}>
            ›
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDD9CF',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    transform: [{ scale: 1 }],
  },
  cardPressed: {
    backgroundColor: '#F0EDE5',
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  index: {
    color: '#8B877E',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: '#EFECFF',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tagText: {
    color: '#504690',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  contentRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 16,
    marginTop: 30,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: '#1D1D1B',
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  description: {
    color: '#6B6962',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },
  arrow: {
    alignItems: 'center',
    backgroundColor: '#1D1D1B',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  arrowText: {
    color: '#F5F3EE',
    fontSize: 28,
    lineHeight: 30,
    marginTop: -2,
  },
});
