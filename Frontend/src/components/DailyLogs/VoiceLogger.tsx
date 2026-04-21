import React, { useState } from "react";
import toast from "react-hot-toast";

// --- TYPES ---
interface Food {
  food_name: string;
  keywords: string[];
}

interface Props {
  foodLibrary: Food[];
  onLog: (food: any, qty: number) => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// This calculates how many edits typos it takes to turn word A into word B.
// e.g. "jol" -> "jhol" = distance 1. "momo" -> "momo" = distance 0.
const levenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }
  return matrix[a.length][b.length];
};

const VoiceLogger: React.FC<Props> = ({ foodLibrary, onLog }) => {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState("");

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Use Chrome browser.");

    const recognition = new SpeechRecognition();
    //recognition.lang = "en-IN";
    recognition.lang = "en-US";
    //recognition.lang = "ne-NP";
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback("Listening...");
    };

    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const raw = event.results[0][0].transcript;
      console.log(" RAW AUDIO:", raw); // Log raw STT as requested
      processCommand(raw.toLowerCase());
    };

    recognition.start();
  };

  const processCommand = (rawText: string) => {
    // 1. DICTIONARY NORMALIZATION (Handle common Nepali phonetic spellings)
    let text = rawText;
    const corrections: { [key: string]: string } = {
      daal: "dal",
      dhal: "dal",
      bhat: "bhat",
      baat: "bhat",
      bhaat: "bhat",
      jol: "jhol",
      jhoul: "jhol",
      cauli: "kauli",
      gobi: "kauli",
      alu: "aloo",
      aalu: "aloo",
      buff: "buffalo",
      baf: "buffalo",
    };

    Object.keys(corrections).forEach((typo) => {
      // Replace whole words only
      text = text.replace(new RegExp(`\\b${typo}\\b`, "g"), corrections[typo]);
    });

    console.log(" CLEANED TEXT:", text);

    // 2. EXTRACT QUANTITY
    let qty = 1;
    const words = text.split(" ");
    const numMap: any = {
      one: 1,
      two: 2,
      three: 3,
      ek: 1,
      dui: 2,
      tin: 3,
      a: 1,
    };

    words.forEach((w) => {
      if (!isNaN(parseInt(w))) qty = parseInt(w);
      if (numMap[w]) qty = numMap[w];
    });

    // 3. INTELLIGENT MATCHING ENGINE
    let bestMatch: any = null;
    let bestScore = -1;

    foodLibrary.forEach((food) => {
      // Break food name into tokens (e.g., "Chicken Momo" -> ["chicken", "momo"])
      const foodTokens = food.food_name.toLowerCase().split(" ");

      // Calculate how many of these tokens are present in the user's speech
      let matchedTokensCount = 0;

      foodTokens.forEach((token) => {
        // We check if the user said this token (fuzzy check)
        // We scan every word the user said
        const userSaidToken = words.some((userWord) => {
          // Exact match OR Levenshtein distance < 2 (handles minor typos)
          return userWord === token || levenshtein(userWord, token) <= 1;
        });

        if (userSaidToken) matchedTokensCount++;
      });

      // --- SCORING FORMULA ---
      // Accuracy = (Matches / Total words in food Name)
      // e.g. User says "Jhol Momo"
      // Candidate "Momo": 1/1 match (100%) -> Score: 1.0
      // Candidate "Chicken Momo": 1/2 match (50%) -> Score: 0.5
      // Candidate "Jhol Momo": 2/2 match (100%) -> Score: 1.0

      const accuracy = matchedTokensCount / foodTokens.length;

      // SPECIFICITY BOOST:
      // If two foods have 100% accuracy, prefer the LONGER one.
      // "Jhol Momo" (2 words) > "Momo" (1 word)
      const finalScore = accuracy + foodTokens.length * 0.1;

      // Log for debugging (Check console to see the race!)
      if (accuracy > 0.5) {
        console.log(
          `np Candidate: ${food.food_name} | Accuracy: ${accuracy.toFixed(2)} | Final: ${finalScore.toFixed(2)}`,
        );
      }

      if (finalScore > bestScore && accuracy >= 0.5) {
        // Threshold: Must match at least 50% of the name
        bestScore = finalScore;
        bestMatch = food;
      }
    });

    // 4. RESULT
    if (bestMatch) {
      console.log(" WINNER:", bestMatch.food_name);
      onLog(bestMatch, qty);
      setFeedback(` Logged: ${qty} x ${bestMatch.food_name}`);
    } else {
      setFeedback(` No match found for "${text}"`);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={startListening}
        disabled={isListening}
        className={`w-full py-4 rounded-full font-bold text-white transition-all shadow-md flex items-center justify-center gap-2
          ${isListening ? "bg-red-500 animate-pulse" : "bg-blue-600 active:scale-95 hover:bg-blue-700"}`}
      >
        {isListening ? " Listening..." : "🎤 Tap to Speak"}
      </button>
      {feedback && (
        <p className="text-center text-sm font-semibold text-green-700 mt-2">
          {feedback}
        </p>
      )}
    </div>
  );
};

export default VoiceLogger;
