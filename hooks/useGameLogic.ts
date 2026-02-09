import { getHighScore, saveHighScore } from "@/constants/storage";
import { useCallback, useEffect, useRef, useState } from "react";

export type GameState =
  | "IDLE"
  | "SHOWING_SEQUENCE"
  | "PLAYER_TURN"
  | "GAME_OVER";
export type GameMode = "SOLO" | "FRIEND";

interface UseGameLogicReturn {
  gameState: GameState;
  score: number;
  sequence: number[];
  playerSequence: number[];
  activePlayer: 1 | 2;
  mode: GameMode;
  highScore: number;
  startGame: (selectedMode: GameMode) => void;
  handleTilePress: (index: number) => void;
  resetGame: () => void;
  showingIndex: number | null; // The index of the sequence currently being highlighted
}

export const useGameLogic = (): UseGameLogicReturn => {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [mode, setMode] = useState<GameMode>("SOLO");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [highScore, setHighScore] = useState(0);
  const [showingIndex, setShowingIndex] = useState<number | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load high score when mode changes
    setHighScore(getHighScore(mode));
  }, [mode]);

  const addToSequence = () => {
    const nextTile = Math.floor(Math.random() * 9);
    setSequence((prev) => [...prev, nextTile]);
  };

  const playSequence = useCallback(async (seq: number[]) => {
    setGameState("SHOWING_SEQUENCE");
    setShowingIndex(null);

    // Initial delay before starting
    await new Promise((resolve) => setTimeout(resolve, 500));

    for (let i = 0; i < seq.length; i++) {
      setShowingIndex(seq[i]);
      // Highlight duration
      await new Promise((resolve) => setTimeout(resolve, 600));
      setShowingIndex(null);
      // Gap between highlights
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setGameState("PLAYER_TURN");
  }, []);

  useEffect(() => {
    if (sequence.length > 0 && gameState === "IDLE") {
      // This effect might be tricky. Let's trigger playSequence explicitly.
    }
  }, [sequence, gameState]);

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setGameState("IDLE");
    setScore(0);
    setSequence([]);
    setPlayerSequence([]);
    setActivePlayer(1);

    // Start the first round
    startRound();
  };

  const startRound = () => {
    setPlayerSequence([]);
    const nextTile = Math.floor(Math.random() * 9);
    setSequence((prev) => {
      const newSeq = [...prev, nextTile];
      // We need to play the sequence after setting the state.
      // But setState is async.
      // A better approach might be to not use the sequence state immediately for playing?
      // Or user a useEffect to trigger playing when sequence changes?
      // Let's rely on a helper that takes the sequence as arg.

      // Actually, let's wait a tick for state to update or just pass newSeq.
      setTimeout(() => playSequence(newSeq), 100);
      return newSeq;
    });
  };

  const handleTilePress = (index: number) => {
    if (gameState !== "PLAYER_TURN") return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    // Validate input
    const currentIndex = newPlayerSequence.length - 1;
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      // Wrong input
      handleGameOver();
      return;
    }

    // Check if sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      if (mode === "SOLO") {
        setScore((prev) => prev + 1);
        setTimeout(startRound, 1000);
      } else {
        // Friend mode: logic is different.
        // Player 1 completes sequence?
        // Logic:
        // "Player 1 starts by completing the sequence." -> Wait, the prompt says "The game starts by glowing a short sequence... Player 1 starts by completing the sequence. Player 2 must repeat the same sequence. Each round adds a new tile."

        // Interpretation:
        // Round 1: Game generates seq (length 1). Player 1 repeats it. (Success)
        // Then Player 2 must repeat it? Or does Player 2 take the NEXT round?
        // "Player 1 starts by completing the sequence. Player 2 must repeat the same sequence. Each round adds a new tile."

        // This implies:
        // Seq: [A]
        // Player 1: [A] -> Success
        // Seq: [A]
        // Player 2: [A] -> Success
        // Round ends? Add new tile?

        // "Each round adds a new tile to the sequence."
        // "Two players take turns on the same device; each player tries to reproduce the sequence, and the one who fails loses." (From prompt top)
        // "Player 1 starts by completing the sequence. Player 2 must repeat the same sequence. Each round adds a new tile to the sequence."

        // Revised Friend Mode Flow:
        // 1. Game generates seq.
        // 2. Show seq.
        // 3. Active Player repeats seq.
        // 4. If correct -> Switch Active Player. COMPLETE SAME SEQ? OR ADD NEW TILE?
        // Prompt says "Player 2 must repeat the same sequence."
        // So:
        // Round 1:
        //   Seq: [A]
        //   Show [A]
        //   P1 repeats [A]. Correct.
        //   P2 must repeat [A]?? Or just P2's turn now?
        //   If P2 repeats [A], then what?

        // Let's stick to a simpler "PASS THE BOMB" style or "Simul" style?
        // "Player 1 starts by completing the sequence. Player 2 must repeat the same sequence. Each round adds a new tile to the sequence."

        // Let's assume:
        // Round N: Sequence Length N.
        // Turn 1: P1 watches, then repeats.
        // Turn 2: P2 watches (optional?), then repeats SAME sequence.
        // If both succeed -> Round N+1 (Length N+1).

        // Let's implement this.

        if (activePlayer === 1) {
          // Player 1 finished. Now Player 2's turn for the SAME sequence.
          setActivePlayer(2);
          setPlayerSequence([]);
          setGameState("IDLE"); // Small pause
          setTimeout(() => {
            alert("Player 2's turn!"); // We'll make this better UI later
            playSequence(sequence);
          }, 1000);
        } else {
          // Player 2 finished. Round complete.
          setScore((prev) => prev + 1);
          setActivePlayer(1);
          setTimeout(() => {
            alert("Round Complete! Next level.");
            startRound();
          }, 1000);
        }
      }
    }
  };

  const handleGameOver = () => {
    setGameState("GAME_OVER");
    if (mode === "SOLO") {
      saveHighScore("SOLO", score);
      // Update local high score state if current score is higher
      if (score > highScore) {
        setHighScore(score);
      }
    }
  };

  const resetGame = () => {
    setGameState("IDLE");
    setScore(0);
    setSequence([]);
    setPlayerSequence([]);
    setShowingIndex(null);
  };

  return {
    gameState,
    score,
    sequence,
    playerSequence,
    activePlayer,
    mode,
    highScore,
    startGame,
    handleTilePress,
    resetGame,
    showingIndex,
  };
};
