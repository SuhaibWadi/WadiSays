import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface GameTileProps {
  index: number;
  active: boolean; // Managed by game logic (for sequence playback)
  onPress: () => void;
  disabled?: boolean;
}

export function GameTile({ index, active, onPress, disabled }: GameTileProps) {
  const glowOpacity = useSharedValue(0);
  const scale = useSharedValue(1);

  // Colors for different tiles to make it colorful? Or uniform?
  // Let's use uniform for now, or maybe a set of 9 colors.
  const tileColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
    "#E67E22",
  ];
  const color = tileColors[index % tileColors.length];

  useEffect(() => {
    if (active) {
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400 }),
      );
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 200 }),
      );
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.6 + glowOpacity.value * 0.4, // Base opacity 0.6, goes to 1
      transform: [{ scale: scale.value }],
      backgroundColor: color,
      // Add shadow/glow effect
      shadowColor: color,
      shadowOpacity: glowOpacity.value,
      shadowRadius: 10 * glowOpacity.value + 2,
      shadowOffset: { width: 0, height: 0 },
      elevation: 5 * glowOpacity.value,
    };
  });

  const handlePress = () => {
    if (disabled) return;
    // Trigger local animation
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 }),
    );
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withTiming(1, { duration: 100 }),
    );
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={styles.container}
    >
      <Animated.View style={[styles.tile, animatedStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "30%",
    aspectRatio: 1,
    margin: "1.6%",
  },
  tile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
});
