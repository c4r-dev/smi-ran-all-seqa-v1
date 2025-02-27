"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function SuccessPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          console.log("Raw data from API:", result.data); // Log raw data before aggregation

          // Count occurrences of each selectedOption
          const countMap = { 1: 0, 2: 0, 3: 0 };

          result.data.forEach((item) => {
            if (item.selectedOption in countMap) {
              countMap[item.selectedOption] += item.count || 1; // Ensure count exists, assume 1 if missing
            }
          });

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
          {/* Chart Title */}
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
          
          {/* Single Bar for all data, using dynamic color via Cell */}
          <Bar dataKey="count" name="Count">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
