'use client';

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const generateSystematic = (n = 30) => {
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? "A" : "B"));
};

const generateManual = (n = 30) => {
  const result = [];
  let lastThree = ["A", "B", "A"];

  for (let i = 0; i < n; i++) {
    if (lastThree.every((x) => x === "A")) {
      result.push("B");
    } else if (lastThree.every((x) => x === "B")) {
      result.push("A");
    } else {
      result.push(Math.random() < 0.5 ? "A" : "B");
    }
    lastThree = [...lastThree.slice(1), result[i]];
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

    const newEntry = {
      generation: generationCount + 1,
      systematic: { ...countOccurrences(newSequences.s1), longestRun: getLongestRun(newSequences.s1) },
      manual: { ...countOccurrences(newSequences.s2), longestRun: getLongestRun(newSequences.s2) },
      random: { ...countOccurrences(newSequences.s3), longestRun: getLongestRun(newSequences.s3) },
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
        Generate new sequences multiple times to observe patterns (n=30).
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
              <th colSpan="3">Sequence 1</th>
              <th colSpan="3">Sequence 2</th>
              <th colSpan="3">Sequence 3</th>
            </tr>
            <tr style={{ backgroundColor: "#e6e6e6", textAlign: "center" }}>
              <th></th>
              <th>A</th>
              <th>B</th>
              <th>Run</th>
              <th>A</th>
              <th>B</th>
              <th>Run</th>
              <th>A</th>
              <th>B</th>
              <th>Run</th>
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
                <td style={{ textAlign: "center" }}>{entry.manual.A}</td>
                <td style={{ textAlign: "center" }}>{entry.manual.B}</td>
                <td style={{ textAlign: "center" }}>{entry.manual.longestRun}</td>
                <td style={{ textAlign: "center" }}>{entry.random.A}</td>
                <td style={{ textAlign: "center" }}>{entry.random.B}</td>
                <td style={{ textAlign: "center" }}>{entry.random.longestRun}</td>
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
            onMouseEnter={() => {
              if (!selectedOption || !textInput) {
                handleAlert();
              }
            }}
            onClick={handleSubmit}
          >
            Compare Answer
          </button>
        </div>

      </div>
      );
}
