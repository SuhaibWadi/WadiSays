import { ThemedText } from "@/components/ThemedText";
import { getHighScore } from "@/constants/storage";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFocusEffect } from "@expo/router";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [soloHigh, setSoloHigh] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setSoloHigh(getHighScore("SOLO"));
    }, []),
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          WadiSays
        </ThemedText>
        <ThemedText style={styles.subtitle}>Memory Game</ThemedText>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={() =>
            router.push({ pathname: "/game", params: { mode: "SOLO" } })
          }
        >
          <ThemedText style={styles.buttonText}>Solo Mode</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.icon, marginTop: 20 },
          ]}
          onPress={() =>
            router.push({ pathname: "/game", params: { mode: "FRIEND" } })
          }
        >
          <ThemedText style={styles.buttonText}>Friend Mode</ThemedText>
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText>Solo High Score: {soloHigh}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
  },
  spacer: {
    height: 50,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 50,
  },
});
