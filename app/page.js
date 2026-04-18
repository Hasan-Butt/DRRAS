"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [disasters, setDisasters] = useState([]);

  useEffect(() => {
    fetch("/api/test-db")
      .then(res => res.json())
      .then(data => setDisasters(data));
  }, []);

  return (
    <div className="min-h-screen bg-red-100 p-6">
      <h1 className="text-3xl font-bold mb-6">🚨 DRRAS Dashboard</h1>

      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Active Disasters</h2>

        {disasters.length === 0 ? (
          <p>No disasters found</p>
        ) : (
          disasters.map((d) => (
            <div
              key={d.DisasterID}
              className="border-b py-2 flex justify-between"
            >
              <span>{d.Title}</span>
              <span>Severity: {d.SeverityLevel}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}