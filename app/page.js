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

const makeCountPlot = (sequence) => {
  const counts = sequence.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  return {
    data: [
      {
        x: Object.keys(counts),
        y: Object.values(counts),
        type: "bar",
        marker: { color: ["blue", "red"] },
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

  useEffect(() => {
    setSequences({
      s1: generateSystematic(),
      s2: generateManual(),
      s3: generateRandom(),
    });
  }, []);

  if (!sequences) {
    return <p>Loading...</p>; // Prevent SSR rendering mismatch
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Consider these "random" sequences</h1>
      <button onClick={() => setSequences({
        s1: generateSystematic(),
        s2: generateManual(),
        s3: generateRandom(),
      })}>
        Generate new sequences (N=30)
      </button>
      <p>Which one do you think is truly randomized?</p>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        {["s1", "s2", "s3"].map((key, idx) => (
          <div key={key} style={{ flex: 1, margin: "0 10px" }}>
            <h3>Sequence {idx + 1}</h3>
            <p style={{ wordWrap: "break-word" }}>{sequences[key].join(" ")}</p>
            <Plot {...makeCountPlot(sequences[key])} style={{ width: "100%", height: "200px" }} />
            <p>Longest run: {getLongestRun(sequences[key])}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
