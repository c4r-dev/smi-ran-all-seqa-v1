'use client';

// Import useRef along with other hooks
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// --- Functions (generateSystematic, generateManual, etc.) remain the same ---
const generateSystematic = (n = 30) => {
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? "A" : "B"));
};

const generateManual = (n = 30) => {
  if (n % 2 !== 0) n = n + 1;
  const possibleDifferences = [0, 2, 4];
  const difference = possibleDifferences[Math.floor(Math.random() * possibleDifferences.length)];
  const countA = Math.floor(n / 2) + Math.floor(difference / 2);
  const countB = n - countA;
  const elements = Array(countA).fill('A').concat(Array(countB).fill('B'));
  let result = [];
  let prevElement = null;
  let runLength = 0;
  const maxRunLength = 3;
  for (let i = elements.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [elements[i], elements[j]] = [elements[j], elements[i]];
  }
  for (let i = 0; i < elements.length; i++) {
    const currentElement = elements[i];
    if (currentElement === prevElement) {
      runLength++;
      if (runLength >= maxRunLength) {
        for (let j = i + 1; j < elements.length; j++) {
          if (elements[j] !== currentElement) {
            [elements[i], elements[j]] = [elements[j], elements[i]];
            runLength = 1;
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
  if (!sequence || sequence.length === 0) return 0;
  let maxRun = 1;
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

const calculateEffectSize = (set) => {
  const trueEffectSize = 0.2;
  const randomFactor = set === "systematic" ? Math.random() * 0.5 + 0.3 :
                       set === "manual" ? Math.random() * 0.2 + 0.1 :
                       Math.random() * 0.2 - 0.1;
  return parseFloat((trueEffectSize + randomFactor).toFixed(2));
};

const calculatePValue = (set) => {
  const randomFactor = set === "systematic" ? Math.random() * 0.03 :
                       set === "manual" ? Math.random() * 0.08 :
                       Math.random() * 0.25 + 0.05;
  return parseFloat(randomFactor.toFixed(3));
};

// --- BarChartVisualizer Component remains the same ---
const BarChartVisualizer = ({ sequence, title }) => {
    // (Code for BarChartVisualizer is unchanged from the previous version)
    if (!sequence) return null;
    const countA = sequence.filter(item => item === 'A').length;
    const countB = sequence.filter(item => item === 'B').length;
    const total = sequence.length;
    const percentA = total > 0 ? (countA / total * 100).toFixed(1) : 0;
    const percentB = total > 0 ? (countB / total * 100).toFixed(1) : 0;
    const barWidth = 60;
    const maxBarHeight = 200;
    const barHeightA = total > 0 ? Math.max((countA / total) * maxBarHeight, 30) : 30;
    const barHeightB = total > 0 ? Math.max((countB / total) * maxBarHeight, 30) : 30;
    const sequencePreview = sequence.slice(0, 49);

    return (
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: 'inset 0px 0px 5px rgba(0, 0, 0, 0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>{title}</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '5px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', minHeight: '100px' }}>
          {sequencePreview.map((item, index) => (
            <div key={`preview-${title}-${index}`} style={{ width: '32px', height: '32px', margin: '2px', backgroundColor: item === 'A' ? '#39E1F8' : '#FFA800', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px', textShadow: '1px 1px 1px rgba(0,0,0,0.3)' }} title={`Item ${index + 1}: ${item}`}>
              {item}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1, backgroundColor: 'white', borderRadius: '4px', padding: '10px', marginTop: '10px', boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: `${Math.max(barHeightA, barHeightB) + 10}px`, justifyContent: 'center', width: '100%', marginTop: '5px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '30px' }}>
                  <div style={{ width: `${barWidth + 15}px`, height: `${barHeightA}px`, backgroundColor: '#39E1F8', borderRadius: '6px 6px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'height 0.5s ease' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.2)', fontSize: '14px' }}>{countA}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: `${barWidth + 15}px`, height: `${barHeightB}px`, backgroundColor: '#FFA800', borderRadius: '6px 6px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'height 0.5s ease' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.2)', fontSize: '14px' }}>{countB}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginTop: '5px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', width: `${barWidth + 15}px`, textAlign: 'center', marginRight: '30px' }}>A</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', width: `${barWidth + 15}px`, textAlign: 'center' }}>B</div>
              </div>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginTop: '5px' }}>
                <div style={{ fontSize: '14px', width: `${barWidth + 15}px`, textAlign: 'center', marginRight: '30px' }}>{percentA}%</div>
                <div style={{ fontSize: '14px', width: `${barWidth + 15}px`, textAlign: 'center' }}>{percentB}%</div>
              </div>
            </div>
          </div>
        </div>
      );
};

// --- Main Page Component ---
export default function Page() {
  const [sequences, setSequences] = useState({ systematic: [], manual: [], random: [] });
  const [history, setHistory] = useState([]);
  const [generationCount, setGenerationCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [textInput, setTextInput] = useState("");

  const router = useRouter();

  // === Ref to track if initial effect has run ===
  const hasRunInitialEffect = useRef(false);
  // =============================================

  const generateNewSequences = () => {
    const newSystematic = generateSystematic();
    const newManual = generateManual();
    const newRandom = generateRandom();

    const newSequencesData = {
      systematic: newSystematic,
      manual: newManual,
      random: newRandom,
    };

    const systematicStats = {
        A: newSystematic.filter(item => item === 'A').length,
        B: newSystematic.filter(item => item === 'B').length,
        longestRun: getLongestRun(newSystematic),
        effect: calculateEffectSize('systematic'),
        pValue: calculatePValue('systematic')
      };
     const manualStats = {
        A: newManual.filter(item => item === 'A').length,
        B: newManual.filter(item => item === 'B').length,
        longestRun: getLongestRun(newManual),
        effect: calculateEffectSize('manual'),
        pValue: calculatePValue('manual')
      };
     const randomStats = {
        A: newRandom.filter(item => item === 'A').length,
        B: newRandom.filter(item => item === 'B').length,
        longestRun: getLongestRun(newRandom),
        effect: calculateEffectSize('random'),
        pValue: calculatePValue('random')
      };

    const currentGeneration = generationCount + 1;

    const newEntry = {
      id: crypto.randomUUID(), // Generate unique ID
      generation: currentGeneration,
      systematic: { ...systematicStats },
      manual: { ...manualStats },
      random: { ...randomStats }
    };

    setSequences(newSequencesData);
    setHistory((prev) => [newEntry, ...prev].slice(0, 5));
    setGenerationCount(currentGeneration);
  };

  // === Updated useEffect hook ===
  useEffect(() => {
    // Only run the initial generation logic if the ref indicates it hasn't run yet
    if (!hasRunInitialEffect.current) {
      generateNewSequences();
      // Mark that the initial effect has now run
      hasRunInitialEffect.current = true;
    }
  }, []); // Empty dependency array ensures this effect logic runs only on mount
  // ============================


  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleTextChange = (event) => {
    setTextInput(event.target.value);
  };

  const handleAlert = () => {
    alert("\nPlease select which sequence you think is random.\n\nand/or\n\nExplain why you think your selected sequence is the truly random one in the text box.");
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
        const errorData = await response.text();
        throw new Error(`Failed to submit data: ${response.status} ${errorData}`);
      }

      router.push("/success");

    } catch (error) {
      console.error("Error submitting data:", error);
      alert(`An error occurred while saving your response: ${error.message}`);
    }
  };

  if (!sequences.systematic.length && history.length === 0) { // Adjusted loading check slightly
    return <p>Loading...</p>;
  }

  const getConditionalColor = (statType, value) => {
      switch (statType) {
          case 'effect':
              const effectValue = typeof value === 'number' ? value : parseFloat(value);
              return effectValue > 0.15 ? "#228B22" : effectValue === 0 ? "#DC143C" : "inherit";
          case 'pValue':
              const pValueNum = typeof value === 'number' ? value : parseFloat(value);
              return pValueNum < 0.05 ? "#228B22" : pValueNum > 0.5 ? "#DC143C" : "inherit";
          case 'run':
              const runValue = typeof value === 'number' ? value : parseInt(value, 10);
              return runValue > 5 ? "#DC143C" : runValue < 3 ? "#228B22" : "inherit";
          default:
              return "inherit";
      }
  };

  // --- JSX rendering (unchanged from previous version below this point) ---
  return (
    <div>
      <h2 className="responsive-text">
         These three allocation sequences claimed to use randomization. Only one of these studies was truly randomized. Which one do you think it is?
         <br /> (Sample size n=30) <br/>
        "Generate new sequences" to observe patterns.
      </h2>

      <div style={{
           maxWidth: "1200px",
           margin: "30px auto",
           display: "flex",
           flexWrap: "wrap",
           justifyContent: "center",
           gap: "20px"
       }}>
           <div style={{
             width: "320px",
             backgroundColor: "white",
             borderRadius: "8px",
             boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.05)",
             overflow: "hidden",
             display: "flex"
           }}>
             <BarChartVisualizer
               sequence={sequences.systematic}
               title="Sequence 1 (Systematic)"
             />
           </div>
           <div style={{
             width: "320px",
             backgroundColor: "white",
             borderRadius: "8px",
             boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.05)",
             overflow: "hidden",
              display: "flex"
           }}>
             <BarChartVisualizer
               sequence={sequences.manual}
               title="Sequence 2 (Manual)"
             />
           </div>
           <div style={{
             width: "320px",
             backgroundColor: "white",
             borderRadius: "8px",
             boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.05)",
             overflow: "hidden",
              display: "flex"
           }}>
             <BarChartVisualizer
               sequence={sequences.random}
               title="Sequence 3 (Random)"
             />
           </div>
       </div>

       <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <button className="regenerate-button" onClick={generateNewSequences}>
                Regenerate<br />sequences
            </button>
       </div>

      <div style={{
          maxWidth: "1200px",
          margin: "30px auto",
          boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          backgroundColor: "white"
      }}>
          <h3 style={{
              textAlign: "center",
              marginBottom: "15px",
              padding: "15px 15px 0 15px"
          }}>Generation History (Last 5)</h3>

          <div style={{
              overflowY: "auto",
              maxHeight: "400px",
              width: "100%",
              padding: "0 0 15px 0"
          }}>
              <table style={{
                  minWidth: "900px",
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "center"
              }}>
                  <thead style={{
                      position: "sticky",
                      top: "0",
                      zIndex: "1"
                  }}>
                      <tr style={{ backgroundColor: "#00C802", color: "black" }}>
                          <th style={{ padding: "12px 15px" }}>Gen</th>
                          <th colSpan="4" style={{ padding: "12px 15px", borderLeft: "2px solid white" }}>Sequence 1 (Systematic)</th>
                          <th colSpan="4" style={{ padding: "12px 15px", borderLeft: "2px solid white" }}>Sequence 2 (Manual)</th>
                          <th colSpan="4" style={{ padding: "12px 15px", borderLeft: "2px solid white" }}>Sequence 3 (Random)</th>
                      </tr>
                      <tr style={{ backgroundColor: "#00C80266", color: "black" }}>
                          <th style={{ padding: "8px 10px" }}></th>
                          <th style={{ padding: "8px 10px", borderLeft: "2px solid white" }}>A/B</th>
                          <th style={{ padding: "8px 10px" }}>Effect</th>
                          <th style={{ padding: "8px 10px" }}>p-value</th>
                          <th style={{ padding: "8px 10px" }}>Run</th>
                          <th style={{ padding: "8px 10px", borderLeft: "2px solid white" }}>A/B</th>
                          <th style={{ padding: "8px 10px" }}>Effect</th>
                          <th style={{ padding: "8px 10px" }}>p-value</th>
                          <th style={{ padding: "8px 10px" }}>Run</th>
                          <th style={{ padding: "8px 10px", borderLeft: "2px solid white" }}>A/B</th>
                          <th style={{ padding: "8px 10px" }}>Effect</th>
                          <th style={{ padding: "8px 10px" }}>p-value</th>
                          <th style={{ padding: "8px 10px" }}>Run</th>
                      </tr>
                  </thead>
                  <tbody>
                      {history.map((entry) => (
                          <tr key={entry.id} // Using unique ID for key
                              style={{
                                  backgroundColor: entry.generation % 2 === 0 ? "#f9f9f9" : "white",
                                  transition: "background-color 0.2s ease"
                              }}>
                              <td style={{
                                  padding: "12px",
                                  fontWeight: "bold",
                                  backgroundColor: "#f0f0f0"
                              }}>{entry.generation}</td>
                              <td style={{ padding: "10px", borderLeft: "2px solid #eee" }}>{entry.systematic.A}/{entry.systematic.B}</td>
                              <td style={{ padding: "10px", color: getConditionalColor('effect', entry.systematic.effect) }}>{entry.systematic.effect.toFixed(2)}</td>
                              <td style={{ padding: "10px", color: getConditionalColor('pValue', entry.systematic.pValue) }}>{entry.systematic.pValue.toFixed(3)}</td>
                              <td style={{ padding: "10px", color: getConditionalColor('run', entry.systematic.longestRun) }}>{entry.systematic.longestRun}</td>
                              <td style={{ padding: "10px", borderLeft: "2px solid #eee" }}>{entry.manual.A}/{entry.manual.B}</td>
                              <td style={{ padding: "10px", color: getConditionalColor('effect', entry.manual.effect) }}>{entry.manual.effect.toFixed(2)}</td>
                              <td style={{ padding: "10px", color: getConditionalColor('pValue', entry.manual.pValue) }}>{entry.manual.pValue.toFixed(3)}</td>
                              <td style={{ padding: "10px", color: getConditionalColor('run', entry.manual.longestRun) }}>{entry.manual.longestRun}</td>
                              <td style={{ padding: "10px", borderLeft: "2px solid #eee" }}>{entry.random.A}/{entry.random.B}</td>
                              <td style={{ padding: "10px", color: getConditionalColor('effect', entry.random.effect) }}>{entry.random.effect.toFixed(2)}</td>
                              <td style={{ padding: "10px", color: getConditionalColor('pValue', entry.random.pValue) }}>{entry.random.pValue.toFixed(3)}</td>
                              <td style={{ padding: "10px", color: getConditionalColor('run', entry.random.longestRun) }}>{entry.random.longestRun}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      <div className="radio-container" style={{ maxWidth: '800px', margin: '30px auto' }}>
        <h3>Select which sequence you think is random.</h3>
        <div className="radio-group">
          <label>
            <input type="radio" name="random-sequence" value="1" checked={selectedOption === '1'} onChange={handleRadioChange} />
            Sequence 1
          </label>
          <label>
            <input type="radio" name="random-sequence" value="2" checked={selectedOption === '2'} onChange={handleRadioChange} />
            Sequence 2
          </label>
          <label>
            <input type="radio" name="random-sequence" value="3" checked={selectedOption === '3'} onChange={handleRadioChange} />
            Sequence 3
          </label>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        <h3 style={{ textAlign: "center", paddingTop: "10px" }}>
          Why do you think your selected sequence is the truly random one?
        </h3>
        <textarea
          value={textInput}
          onChange={handleTextChange}
          placeholder="Explain your reasoning..."
          style={{
            width: "100%",
            height: "100px",
            padding: "10px",
            fontFamily: "'General Sans', sans-serif",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            resize: "vertical",
            boxSizing: 'border-box'
          }}
        ></textarea>
      </div>

       <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <button
                className="compare-answer-button"
                style={{
                    opacity: selectedOption && textInput ? "1" : "0.4",
                    cursor: selectedOption && textInput ? "pointer" : "not-allowed",
                 }}
                onClick={handleSubmit}
                disabled={!selectedOption || !textInput}
            >
                Compare Answer
            </button>
        </div>
    </div>
  );
}