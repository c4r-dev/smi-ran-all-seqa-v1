"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function SuccessPage() {
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showRandomSequence, setShowRandomSequence] = useState(false);

  useEffect(() => {
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

          setTableData(tableEntries.slice(0, slice));
          console.log(tableData);

          // Correctly format aggregatedData as an array of objects with 'sequence', 'count', and 'color'
          const aggregatedData = [
            { sequence: "Sequence 1", count: countMap[1], color: "#28a745" }, // Green
            { sequence: "Sequence 2", count: countMap[2], color: "#007bff" }, // Blue
            { sequence: "Sequence 3", count: countMap[3], color: "#fd7e14" }  // Orange
          ];

          console.log("Aggregated data for chart:", aggregatedData); // Log after transformation

          setData(aggregatedData);
        }
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div>
      <h2 className="responsive-text">
        Here's how your classmates answered. Review their reasoning before revealing which sequence was truly random.
      </h2>

      <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 300 : 400}>
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <text
            x="50%"
            y={20}
            textAnchor="middle"
            fontSize={18}
          >
            Distribution of Selections
          </text>
           
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sequence" />
          <YAxis allowDecimals={false} label={{ value: "Number of Students", angle: -90, position: "insideLeft" }} />
          <Tooltip />

          <Bar dataKey="count" name="Count">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Scrollable Table */}
      <div className="table-container">
        <h3>Student Reasoning</h3>
        <div className="scrollable-table">
          <table>
            <thead>
              <tr>
                {/* <th>Response</th> */}
                <th>Sequence 1</th>
                <th>Sequence 2</th>
                <th>Sequence 3</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {/* <td>{row.text}</td> */}
                  <td>{row.selected1}</td>
                  <td>{row.selected2}</td>
                  <td>{row.selected3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reveal the Random Sequence Button */}
        <button className="regenerate-button" onClick={() => setShowRandomSequence(true)}>
          Reveal the Random Sequence
        </button>

        {showRandomSequence && (
          <div className="random-sequence-message">
            Sequence 3 was the truly random sequence.
          </div>
        )}

      </div>

      <style jsx>{`
        .table-container {
            display: flex;
            flex-direction: column;
            align-items: center; /* Centers table horizontally */
            justify-content: center; /* Centers table vertically */
            width: 100%;
            max-width: 800px;
            margin: 20px auto; /* Adds margin and centers it */
            text-align: center;
        }

        .scrollable-table {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 5px;
          width: 100%; /* Ensures it takes the full width of the container */
          position: relative; /* Allows the table to be centered */
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
          padding: 8px;
          text-align: center;
          white-space: nowrap;
        }

        th {
          background-color: #f4f4f4;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
