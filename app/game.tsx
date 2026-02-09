import { GameGrid } from "@/components/GameGrid";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { GameMode, useGameLogic } from "@/hooks/useGameLogic";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = (params.mode as GameMode) || "SOLO";

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const {
    gameState,
    score,
    activePlayer,
    startGame,
    handleTilePress,
    showingIndex,
    resetGame,
    highScore, // Current session high score if we want to show it, or just rely on storage
  } = useGameLogic();

  useEffect(() => {
    startGame(mode);
    return () => resetGame(); // Cleanup
  }, [mode]);

  const handleQuit = () => {
    Alert.alert("Quit Game", "Are you sure you want to quit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Quit", style: "destructive", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} style={styles.backButton}>
          <ThemedText style={{ fontSize: 24 }}>←</ThemedText>
        </TouchableOpacity>
        <View style={styles.scoreContainer}>
          <ThemedText type="subtitle">
            {mode === "SOLO" ? `Score: ${score}` : `Round: ${score + 1}`}
          </ThemedText>
          {mode === "FRIEND" && (
            <ThemedText
              style={{ color: activePlayer === 1 ? "#4ECDC4" : "#FF6B6B" }}
            >
              Player {activePlayer}'s Turn
            </ThemedText>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.gameArea}>
        <ThemedText style={styles.statusText}>
          {gameState === "SHOWING_SEQUENCE"
            ? "Watch sequence..."
            : gameState === "PLAYER_TURN"
              ? "Your turn!"
              : ""}
        </ThemedText>

        <GameGrid
          showingIndex={showingIndex}
          onTilePress={handleTilePress}
          disabled={gameState !== "PLAYER_TURN"}
        />
      </View>

      {/* Game Over Overlay */}
      {gameState === "GAME_OVER" && (
        <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.8)" }]}>
          <ThemedText type="title" style={{ color: "white", marginBottom: 20 }}>
            Game Over
          </ThemedText>

          <ThemedText
            style={{ color: "white", marginBottom: 30, fontSize: 20 }}
          >
            {mode === "SOLO"
              ? `Final Score: ${score}`
              : `Player ${activePlayer} Lost!`}
          </ThemedText>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={() => startGame(mode)}
          >
            <ThemedText style={{ color: "white", fontWeight: "bold" }}>
              Play Again
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#666", marginTop: 15 }]}
            onPress={() => router.back()}
          >
            <ThemedText style={{ color: "white", fontWeight: "bold" }}>
              Main Menu
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
  },
  scoreContainer: {
    alignItems: "center",
  },
  gameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    marginBottom: 20,
    fontSize: 24,
    fontWeight: "600",
    height: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    minWidth: 150,
    alignItems: "center",
  },
});
