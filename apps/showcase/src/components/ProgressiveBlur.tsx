import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView, type BlurTint } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { RefObject } from 'react';
import {
  StyleSheet,
  View,
  type View as NativeView,
  type ViewProps,
} from 'react-native';

export type ProgressiveBlurProps = Omit<ViewProps, 'children'> & {
  blurTarget?: RefObject<NativeView | null>;
  intensity?: number;
  tint?: BlurTint;
};

export function ProgressiveBlur({
  blurTarget,
  intensity = 18,
  style,
  tint = 'systemChromeMaterialLight',
  ...props
}: ProgressiveBlurProps) {
  return (
    <MaskedView
      {...props}
      pointerEvents="none"
      maskElement={
        <LinearGradient
          colors={['black', 'rgba(0, 0, 0, 0.88)', 'transparent']}
          locations={[0, 0.58, 1]}
          style={StyleSheet.absoluteFill}
        />
      }
      style={[styles.container, style]}
    >
      <BlurView
        blurMethod="dimezisBlurViewSdk31Plus"
        blurTarget={blurTarget}
        intensity={intensity}
        style={StyleSheet.absoluteFill}
        tint={tint}
      />
      <View style={styles.tint} />
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  tint: {
    backgroundColor: 'rgba(242, 240, 234, 0.2)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
