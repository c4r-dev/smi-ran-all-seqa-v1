'use client';

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

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

  const generateNewSequences = () => {
    const newSequences = {
      s1: generateSystematic(),
      s2: generateManual(),
      s3: generateRandom(),
    };

    const newEntry = {
      generation: generationCount + 1,
      sequences: [
        {
          type: "Systematic",
          ...countOccurrences(newSequences.s1),
          longestRun: getLongestRun(newSequences.s1),
        },
        {
          type: "Manual",
          ...countOccurrences(newSequences.s2),
          longestRun: getLongestRun(newSequences.s2),
        },
        {
          type: "Random",
          ...countOccurrences(newSequences.s3),
          longestRun: getLongestRun(newSequences.s3),
        },
      ],
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
      <table border="1" cellPadding="5" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
            <th>Generation</th>
            <th>Type</th>
            <th>Number of A</th>
            <th>Number of B</th>
            <th>Longest Run</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) =>
            entry.sequences.map((seq, index) => (
              <tr key={`${entry.generation}-${seq.type}`} style={{ borderBottom: "1px solid #ddd" }}>
                {index === 0 && (
                  <td rowSpan="3" style={{ textAlign: "center", fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
                    {entry.generation}
                  </td>
                )}
                <td>{seq.type}</td>
                <td>{seq.A}</td>
                <td>{seq.B}</td>
                <td>{seq.longestRun}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
