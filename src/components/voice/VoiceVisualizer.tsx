/**
 * Voice Visualizer Component
 * 
 * Displays animated audio waves during voice recording.
 * Provides visual feedback for noisy environments where
 * audio cues might be missed.
 */

import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface VoiceVisualizerProps {
  audioLevel: number; // 0-10 scale
  isListening: boolean;
  barCount?: number;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  audioLevel,
  isListening,
  barCount = 5,
}) => {
  // Create animated values for each bar
  const animatedValues = React.useRef(
    Array(barCount).fill(0).map(() => new Animated.Value(0))
  ).current;

  React.useEffect(() => {
    if (!isListening) {
      // Reset all bars when not listening
      animatedValues.forEach((anim) => anim.setValue(0));
      return;
    }

    // Animate bars based on audio level
    const animations = animatedValues.map((anim, index) => {
      const baseHeight = Math.max(10, audioLevel * 8);
      const variance = Math.sin(Date.now() / 200 + index) * 15;
      const targetHeight = baseHeight + variance;

      return Animated.spring(anim, {
        toValue: Math.max(4, Math.min(targetHeight, 60)),
        useNativeDriver: true,
        friction: 4,
        tension: 40,
      });
    });

    Animated.stagger(50, animations).start();

    // Continuous animation loop
    const interval = setInterval(() => {
      animatedValues.forEach((anim, index) => {
        const baseHeight = Math.max(10, audioLevel * 8);
        const variance = Math.sin(Date.now() / 200 + index * 0.5) * 15;
        const noise = Math.random() * 10 - 5;
        const targetHeight = baseHeight + variance + noise;

        Animated.spring(anim, {
          toValue: Math.max(4, Math.min(targetHeight, 60)),
          useNativeDriver: true,
          friction: 3,
          tension: 50,
        }).start();
      });
    }, 100);

    return () => clearInterval(interval);
  }, [audioLevel, isListening, animatedValues]);

  return (
    <View style={styles.container}>
      {animatedValues.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              transform: [
                {
                  scaleY: anim.interpolate({
                    inputRange: [0, 60],
                    outputRange: [0.1, 1],
                  }),
                },
              ],
              backgroundColor: isListening
                ? `rgba(198, 93, 59, ${0.6 + index * 0.1})` // Terracotta gradient
                : '#E6D5CC',
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    gap: 8,
  },
  bar: {
    width: 8,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#C65D3B',
  },
});

export default VoiceVisualizer;
