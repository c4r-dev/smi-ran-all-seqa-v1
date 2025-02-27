"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  
          // Convert to array format suitable for Recharts
          const aggregatedData = Object.keys(countMap).map((key) => ({
            selectedOption: key,
            count: countMap[key],
          }));
  
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
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="selectedOption" tickFormatter={(tick) => `Option ${tick}`} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" barSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
