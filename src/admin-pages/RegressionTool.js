import React, { useState } from "react";

export default function RegressionTool() {
  const [form, setForm] = useState({ symptoms: "", age: "", breed: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runPrediction = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Example POST — replace with real ML endpoint later
      await new Promise((r) => setTimeout(r, 1200));
      setResult({
        predictions: [
          { label: "Gastroenteritis", probability: 0.72 },
          { label: "Parvovirus", probability: 0.18 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-[#2FA394]">
        Regression-Based Diagnosis Assistant
      </h2>

      <div className="space-y-3">
        <input
          value={form.symptoms}
          onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
          placeholder="Symptoms ( comma separated )"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE]"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            placeholder="Pet Age"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE]"
          />
          <input
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
            placeholder="Breed"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE]"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={runPrediction}
            disabled={loading}
            className="bg-[#2FA394] text-white px-4 py-2 rounded-lg hover:bg-[#278e82] transition"
          >
            {loading ? "Analyzing..." : "Run Prediction"}
          </button>
          <button
            onClick={() => {
              setForm({ symptoms: "", age: "", breed: "" });
              setResult(null);
            }}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Clear
          </button>
        </div>

        {result && (
          <div className="mt-5">
            <h3 className="font-semibold text-gray-700 mb-2">Predicted Results</h3>
            <ul className="space-y-2">
              {result.predictions.map((p, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-4 py-2"
                >
                  <span>{p.label}</span>
                  <span className="text-gray-700 font-medium">
                    {(p.probability * 100).toFixed(1)} %
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
