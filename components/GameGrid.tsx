import React from "react";
import { StyleSheet, View } from "react-native";
import { GameTile } from "./GameTile";

interface GameGridProps {
  onTilePress: (index: number) => void;
  showingIndex: number | null;
  disabled: boolean;
}

export function GameGrid({
  onTilePress,
  showingIndex,
  disabled,
}: GameGridProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: 9 }).map((_, index) => (
        <GameTile
          key={index}
          index={index}
          active={showingIndex === index}
          onPress={() => onTilePress(index)}
          disabled={disabled}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
  },
});
