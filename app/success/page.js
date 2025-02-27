"use client";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setData(result.data);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div>
      <h2 className="responsive-text">
        Here's how your classmates answered. Review their reasoning before revealing which sequence was truly random.
      </h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            {JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}
