"use client";
import { useEffect, useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import CustomButton from "../components/CustomButton";

export default function SuccessPage() {
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [showRandomSequence, setShowRandomSequence] = useState(false);
  const [chartHeight, setChartHeight] = useState(400);
  const [isPurple, setIsPurple] = useState(false);
  const chartRef = useRef(null);

  // Helper function to check if text has at least 2 words
  const hasAtLeastTwoWords = (text) => {
    if (!text || typeof text !== 'string') return false;
    // Trim whitespace and split by spaces
    const words = text.trim().split(/\s+/);
    return words.length >= 2;
  };

  // Filter function to apply to table data
  const filterTableData = (data) => {
    return data.filter(row => 
      hasAtLeastTwoWords(row.selected1) || 
      hasAtLeastTwoWords(row.selected2) || 
      hasAtLeastTwoWords(row.selected3)
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setChartHeight(window.innerWidth < 600 ? 300 : 400);
    }

    fetch("/api/data")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          console.log("Raw data from API:", result.data); // Log raw data before aggregation

          // Count occurrences of each selectedOption
          const countMap = { 1: 0, 2: 0, 3: 0 };

          const tableEntries = Array(100).fill().map(() => ({ selected1: "", selected2: "", selected3: "" }));
          var cnt1 = 0, cnt2 = 0, cnt3 = 0;
          var s1, s2, s3;

          result.data.forEach((item) => {
            if (item.selectedOption in countMap) {
              countMap[item.selectedOption] += item.count || 1; // Ensure count exists, assume 1 if missing
            }

            if (item.selectedOption === '1') {
              s2 = tableEntries[cnt1].selected2;
              s3 = tableEntries[cnt1].selected3;
              tableEntries[cnt1] = {
                selected1: item.textInput,
                selected2: s2,
                selected3: s3,
              };
              cnt1++;
            } else if (item.selectedOption === '2') {
              s1 = tableEntries[cnt2].selected1;
              s3 = tableEntries[cnt2].selected3;
              tableEntries[cnt2] = {
                selected2: item.textInput,
                selected1: s1,
                selected3: s3,
              };
              cnt2++
            } else {
              s1 = tableEntries[cnt3].selected1;
              s2 = tableEntries[cnt3].selected2;
              tableEntries[cnt3] = {
                selected3: item.textInput,
                selected2: s2,
                selected1: s1,
              };
              cnt3++;
            }
          });

          // Limit table data to 20 rows max
          var slice = 10;
          if (cnt1 > cnt2 && cnt1 > cnt3) {
            slice = cnt1;
          } else if (cnt2 > cnt1 && cnt2 > cnt3) {
            slice = cnt2;
          } else {
            slice = cnt3;
          }

          if (slice > 20) {
            slice = 20;
          }

          const unfiltered = tableEntries.slice(0, slice);
          setTableData(unfiltered);
          
          // Apply the filter to remove entries with less than 2 words
          const filtered = filterTableData(unfiltered);
          setFilteredTableData(filtered);
          
          console.log("Unfiltered table data:", unfiltered);
          console.log("Filtered table data:", filtered);

          // Correctly format aggregatedData as an array of objects with 'sequence', 'count', and 'color'
          const aggregatedData = [
            { sequence: "Sequence 1", count: countMap[1], color: "#1859d7" }, // Green
            { sequence: "Sequence 2", count: countMap[2], color: "#ff5a00" }, // Blue
            { sequence: "Sequence 3", count: countMap[3], color: "#f031dd", isRandom: true }  // Orange with isRandom flag
          ];

          console.log("Aggregated data for chart:", aggregatedData); // Log after transformation

          setData(aggregatedData);
        }
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const handleClick = () => {
    setShowRandomSequence(true);
    setIsPurple(true); // Set the button to purple when clicked
  };

  // Custom styling for cells when random sequence is revealed
  const getCellStyle = (entry) => {
    if (showRandomSequence && entry.isRandom) {
      return {
        filter: 'drop-shadow(0 0 10px #6f00ff)',
        stroke: '#6f00ff',
        strokeWidth: 2
      };
    }
    return {};
  };

  return (
    <div>
      <h2 className="responsive-text" style={{ marginBottom: "40px" }}>
        Here's how your classmates answered. Review their reasoning before revealing which sequence was truly random.
      </h2>

      {/* Added div wrapper with top padding */}
      <div style={{ paddingTop: "30px" }}>
        <ResponsiveContainer width="100%" height={chartHeight} ref={chartRef}>
          <BarChart
            data={data}
            margin={{ top: 45, right: 30, left: 20, bottom: 20 }}
          >
            <text
              x="50%"
              y={20}
              textAnchor="middle"
              fontSize={18}
              fontWeight="bold"
            >
              Distribution of Selections
            </text>
            
            {/* Adding extra space between title and chart */}
            <text x="0" y={40} opacity="0">
              Padding space
            </text>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sequence" />
            <YAxis allowDecimals={false} label={{ value: "Number of Students", angle: -90, position: "insideLeft" }} />
            <Tooltip />

            <Bar dataKey="count" name="Count">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  style={getCellStyle(entry)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scrollable Table */}  
      <div className="table-container">
        <h3>Student Reasoning</h3>
        {/* <p className="filter-info">Showing quality responses with 2+ words</p> */}
        <div className="scrollable-table">
          <table>
            <thead>
              <tr>
                <th>Sequence 1</th>
                <th>Sequence 2</th>
                <th className={showRandomSequence ? "highlight-header" : ""}>
                  Sequence 3 {showRandomSequence && <span className="random-indicator">✓ Random</span>}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTableData.length > 0 ? (
                filteredTableData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.selected1}</td>
                    <td>{row.selected2}</td>
                    <td className={showRandomSequence ? "highlight-cell" : ""}>{row.selected3}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data-message">No quality responses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Reveal the Random Sequence Button */}
        <div style={{ marginTop: '20px', padding: '10px 0' }}>
          <CustomButton
            variant={isPurple ? "#6f00ff" : "primary"} // Use purple color when isPurple is true
            onClick={handleClick}
          >
            Reveal the Random Sequence
          </CustomButton>
        </div>
      </div>

      <style jsx>{`
        .table-container {
            display: flex;
            flex-direction: column;
            align-items: center; /* Centers table horizontally */
            justify-content: center; /* Centers table vertically */
            width: 100%;
            max-width: 800px;
            margin: 30px auto; /* Increased top/bottom margin for better spacing */
            text-align: center;
            padding: 0 20px; /* Added horizontal padding */
        }

        .filter-info {
          font-size: 0.9rem;
          color: #666;
          margin-top: -10px;
          margin-bottom: 10px;
          font-style: italic;
        }

        .scrollable-table {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 8px; /* Increased border radius for softer look */
          width: 100%; /* Ensures it takes the full width of the container */
          position: relative; /* Allows the table to be centered */
          margin-bottom: 30px; /* Adds space below the table */
          padding: 15px; /* Added internal padding around the table */
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); /* Added subtle shadow */
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          position: sticky;
          top: 0;
          background-color: #f4f4f4; /* Keeps header visible */
          z-index: 10; /* Ensures it stays on top */
        }

        th, td {
          width: 33.33%;
          border: 1px solid #ddd;
          padding: 12px; /* Increased cell padding */
          text-align: center;
          white-space: nowrap;
        }

        th {
          background-color: #f4f4f4;
          font-weight: bold;
        }
        
        .highlight-header {
          color: #6f00ff;
          font-weight: bold;
          box-shadow: 0 0 10px 2px rgba(111, 0, 255, 0.5);
        }
        
        .highlight-cell {
          background-color: rgba(111, 0, 255, 0.1);
        }
        
        .random-indicator {
          color: #6f00ff;
          margin-left: 5px;
          font-weight: bold;
        }

        .no-data-message {
          color: #666;
          font-style: italic;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}