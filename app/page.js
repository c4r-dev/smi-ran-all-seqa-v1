'use client';

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const generateSystematic = (n = 30) => {
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? "A" : "B"));
};

const generateManual = (n = 30) => {
  // Ensure n is even for easier distribution
  if (n % 2 !== 0) n = n + 1;

  // Decide the difference between A and B (0, 2, or 4)
  const possibleDifferences = [0, 2, 4];
  const difference = possibleDifferences[Math.floor(Math.random() * possibleDifferences.length)];

  // Calculate counts based on the difference
  const countA = Math.floor(n / 2) + Math.floor(difference / 2);
  const countB = n - countA;

  // Create initial array with the right counts
  const elements = Array(countA).fill('A').concat(Array(countB).fill('B'));

  // Custom shuffling that attempts to break up long runs
  let result = [];
  let prevElement = null;
  let runLength = 0;
  const maxRunLength = 3; // Maximum allowed run length

  // First shuffle using Fisher-Yates
  for (let i = elements.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [elements[i], elements[j]] = [elements[j], elements[i]];
  }

  // Then process the shuffled array to avoid long runs
  for (let i = 0; i < elements.length; i++) {
    const currentElement = elements[i];

    if (currentElement === prevElement) {
      runLength++;

      // If run would be too long, look ahead to find a different element
      if (runLength >= maxRunLength) {
        // Find next different element to swap with
        for (let j = i + 1; j < elements.length; j++) {
          if (elements[j] !== currentElement) {
            // Swap elements
            [elements[i], elements[j]] = [elements[j], elements[i]];
            runLength = 1; // Reset run counter
            break;
          }
        }
      }
    } else {
      runLength = 1;
    }

    result.push(elements[i]);
    prevElement = elements[i];
  }

  return result;
};

const generateRandom = (n = 30) => {
  return Array.from({ length: n }, () => (Math.random() < 0.5 ? "A" : "B"));
};

const getLongestRun = (sequence) => {
  let maxRun = 0;
  let currentRun = 1;

  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === sequence[i - 1]) {
      currentRun++;
    } else {
      maxRun = Math.max(maxRun, currentRun);
      currentRun = 1;
    }
  }
  return Math.max(maxRun, currentRun);
};

const countOccurrences = (sequence) => {
  return sequence.reduce(
    (acc, val) => {
      acc[val]++;
      return acc;
    },
    { A: 0, B: 0 }
  );
};

const calculateEffect = (counts) => {
  const total = counts.A + counts.B;
  const expected = total / 2;
  const effect = Math.abs((counts.A - expected) / expected).toFixed(2);
  return effect;
};

const calculatePValue = (counts) => {
  // Simple chi-square test for equal proportions
  const total = counts.A + counts.B;
  const expected = total / 2;
  const chiSquare = Math.pow(counts.A - expected, 2) / expected + Math.pow(counts.B - expected, 2) / expected;
  
  // Simple approximation of p-value from chi-square with df=1
  // This is a simplified calculation for demonstration purposes
  const pValue = Math.exp(-0.5 * chiSquare);
  return pValue.toFixed(3);
};

const makeCountPlot = (sequence) => {
  const counts = countOccurrences(sequence);

  return {
    data: [
      {
        x: Object.keys(counts),
        y: Object.values(counts),
        type: "bar",
        marker: { color: ["#39E1F8", "#FFA800"] },
      },
    ],
    layout: {
      showlegend: false,
      yaxis: { title: "Count" },
      xaxis: { title: "Group" },
      margin: { t: 20 },
    },
  };
};

export default function Page() {
  const [sequences, setSequences] = useState(null);
  const [history, setHistory] = useState([]);
  const [generationCount, setGenerationCount] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [textInput, setTextInput] = useState("");

  const router = useRouter();

  const generateNewSequences = () => {
    const newSequences = {
      s1: generateSystematic(),
      s2: generateManual(),
      s3: generateRandom(),
    };

    const s1Counts = countOccurrences(newSequences.s1);
    const s2Counts = countOccurrences(newSequences.s2);
    const s3Counts = countOccurrences(newSequences.s3);

    const newEntry = {
      generation: generationCount + 1,
      systematic: { 
        ...s1Counts, 
        longestRun: getLongestRun(newSequences.s1),
        effect: calculateEffect(s1Counts),
        pValue: calculatePValue(s1Counts)
      },
      manual: { 
        ...s2Counts, 
        longestRun: getLongestRun(newSequences.s2),
        effect: calculateEffect(s2Counts),
        pValue: calculatePValue(s2Counts)
      },
      random: { 
        ...s3Counts, 
        longestRun: getLongestRun(newSequences.s3),
        effect: calculateEffect(s3Counts),
        pValue: calculatePValue(s3Counts)
      },
    };

    setSequences(newSequences);
    setHistory((prev) => [newEntry, ...prev]);
    setGenerationCount((prev) => prev + 1);
  };

  useEffect(() => {
    generateNewSequences();
  }, []);

  if (!sequences) {
    return <p>Loading...</p>;
  }

  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleTextChange = (event) => {
    setTextInput(event.target.value);
  };

  const handleAlert = () => {
    alert("\nSelect which sequence you think is random. is not selected.\n\nand/or\n\nWhy do you think your selected sequence is the truly random one? is blank.");
  };

  const handleSubmit = async () => {
    if (!selectedOption || !textInput) {
      handleAlert();
      return;
    }

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedOption, textInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      router.push("/success");

    } catch (error) {
      console.error("Error submitting data:", error);
      alert("An error occurred while saving your response.");
    }
  };

  return (
    <div>
      <h2 className="responsive-text">
        These three allocation sequences from published studies claimed to use randomization. Only one of these studies was truly randomized. Which one do you think it is?.
        <br />
        <br />
        "Generate new sequences" to observe patterns in how each sequence behaves.
      </h2>
      <div className="sequence-container">
        {["s1", "s2", "s3"].map((key, idx) => (
          <div key={key} style={{ flex: 1, margin: "0 10px" }}>
            <h3>Sequence {idx + 1}</h3>
            <p style={{ wordWrap: "break-word" }}>{sequences[key].join(" ")}</p>
            <Plot {...makeCountPlot(sequences[key])} style={{ width: "100%", height: "auto", minHeight: "180px" }} />
            <p>Longest run: {getLongestRun(sequences[key])}</p>
          </div>
        ))}
      </div>

      <button className="regenerate-button" onClick={generateNewSequences}>
        Generate new sequences
      </button>

      {/* Generation History Table */}
      <h2>Generation History</h2>
      <div style={{ overflowX: "auto" }}>
        <table border="1" cellPadding="5" style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>

          <thead>
            <tr style={{ backgroundColor: "#f2f2f2", textAlign: "center" }}>
              <th>Generation</th>
              <th colSpan="5">Sequence 1</th>
              <th colSpan="5">Sequence 2</th>
              <th colSpan="5">Sequence 3</th>
            </tr>
            <tr style={{ backgroundColor: "#e6e6e6", textAlign: "center" }}>
              <th></th>
              <th>A</th>
              <th>B</th>
              <th>Run</th>
              <th>Effect</th>
              <th>p-value</th>
              <th>A</th>
              <th>B</th>
              <th>Run</th>
              <th>Effect</th>
              <th>p-value</th>
              <th>A</th>
              <th>B</th>
              <th>Run</th>
              <th>Effect</th>
              <th>p-value</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.generation} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ textAlign: "center", fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
                  {entry.generation}
                </td>
                <td style={{ textAlign: "center" }}>{entry.systematic.A}</td>
                <td style={{ textAlign: "center" }}>{entry.systematic.B}</td>
                <td style={{ textAlign: "center" }}>{entry.systematic.longestRun}</td>
                <td style={{ textAlign: "center" }}>{entry.systematic.effect}</td>
                <td style={{ textAlign: "center" }}>{entry.systematic.pValue}</td>
                <td style={{ textAlign: "center" }}>{entry.manual.A}</td>
                <td style={{ textAlign: "center" }}>{entry.manual.B}</td>
                <td style={{ textAlign: "center" }}>{entry.manual.longestRun}</td>
                <td style={{ textAlign: "center" }}>{entry.manual.effect}</td>
                <td style={{ textAlign: "center" }}>{entry.manual.pValue}</td>
                <td style={{ textAlign: "center" }}>{entry.random.A}</td>
                <td style={{ textAlign: "center" }}>{entry.random.B}</td>
                <td style={{ textAlign: "center" }}>{entry.random.longestRun}</td>
                <td style={{ textAlign: "center" }}>{entry.random.effect}</td>
                <td style={{ textAlign: "center" }}>{entry.random.pValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="radio-container">
        <h3>Select which sequence you think is random.</h3>
        <div className="radio-group">
          <label>
            <input type="radio" name="random-sequence" value="1" onChange={handleRadioChange} />
            Sequence 1
          </label>
          <label>
            <input type="radio" name="random-sequence" value="2" onChange={handleRadioChange} />
            Sequence 2
          </label>
          <label>
            <input type="radio" name="random-sequence" value="3" onChange={handleRadioChange} />
            Sequence 3
          </label>
        </div>
      </div>

      <h3 style={{
        textAlign: "center",
        paddingTop: "10px"
      }}>
        Why do you think your selected sequence is the truly random one?
      </h3>


      {/* Textbox for user input */}
      <textarea
        placeholder="Explain your reasoning..."
        style={{
          width: "100%",
          height: "100px",
          padding: "5px",
          fontFamily: "'General Sans', sans-serif",
          fontSize: "16px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          resize: "vertical"
        }}
        onChange={handleTextChange}
      ></textarea>

      <div>
        {/* Compare Answer Button */}
        <button
          className="compare-answer-button"
          style={{
            marginTop: "10px",
            opacity: selectedOption && textInput ? "1" : "0.4",
            cursor: selectedOption && textInput ? "pointer" : "not-allowed",
          }}
          onClick={handleSubmit}
        >
          Compare Answer
        </button>
      </div>

    </div>
  );
}