"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function SuccessPage() {
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          console.log("Raw data from API:", result.data); // Log raw data before aggregation

          // Count occurrences of each selectedOption
          const countMap = { 1: 0, 2: 0, 3: 0 };
          const tableEntries = [];

          result.data.forEach((item) => {
            if (item.selectedOption in countMap) {
              countMap[item.selectedOption] += item.count || 1; // Ensure count exists, assume 1 if missing
            }

            // Collect textInput values for the table
            if (item.textInput) {
              tableEntries.push({
                text: item.textInput,
                selected1: item.selectedOption === 1 ? "✓" : "",
                selected2: item.selectedOption === 2 ? "✓" : "",
                selected3: item.selectedOption === 3 ? "✓" : ""
              });
            }
          });

          // Limit table data to 20 rows max
          setTableData(tableEntries.slice(0, 20));

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

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                <th>Response</th>
                <th>Sequence 1</th>
                <th>Sequence 2</th>
                <th>Sequence 3</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.text}</td>
                  <td>{row.selected1}</td>
                  <td>{row.selected2}</td>
                  <td>{row.selected3}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
            margin: 20px auto; /* Adds margin and centers it */
            text-align: center;
        }

        .scrollable-table {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 5px;
          width: 100%; /* Ensures it takes the full width of the container */
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }

        th {
          background-color: #f4f4f4;
        }
      `}</style>
    </div>
  );
}
