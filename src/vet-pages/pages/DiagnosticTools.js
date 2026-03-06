import { useState } from "react";
import { Brain, AlertTriangle, CheckCircle, HelpCircle, RotateCcw, X, Dog, Cat } from "lucide-react";
import SuccessToast from "../../template/SuccessToast";
import ErrorToast from "../../template/ErrorToast";

const symptomCategories = [
  {
    label: "Digestive",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    checkColor: "accent-orange-500",
    symptoms: ["Vomiting", "Diarrhea", "Loss of appetite", "Bloating", "Bad breath", "Drooling excessively"],
  },
  {
    label: "Respiratory",
    color: "text-sky-600",
    bg: "bg-sky-50 border-sky-200",
    checkColor: "accent-sky-500",
    symptoms: ["Coughing", "Sneezing", "Labored breathing", "Nasal discharge", "Wheezing"],
  },
  {
    label: "Skin & External",
    color: "text-pink-600",
    bg: "bg-pink-50 border-pink-200",
    checkColor: "accent-pink-500",
    symptoms: ["Itching", "Skin redness", "Hair loss", "Ear scratching", "Eye discharge", "Sores or lesions"],
  },
  {
    label: "General / Behavioral",
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    checkColor: "accent-violet-500",
    symptoms: ["Lethargy", "Fever", "Weight loss", "Pale gums", "Restlessness", "Aggression or mood changes"],
  },
  {
    label: "Urinary",
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-200",
    checkColor: "accent-teal-500",
    symptoms: ["Increased thirst", "Frequent urination", "Blood in urine", "Straining to urinate", "Incontinence"],
  },
  {
    label: "Musculoskeletal",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    checkColor: "accent-amber-500",
    symptoms: ["Lameness", "Stiffness", "Swelling in joints", "Reluctance to move", "Muscle tremors"],
  },
];

const sampleDiagnoses = [
  {
    id: 1,
    condition: "Gastroenteritis",
    confidence: 85,
    description: "Inflammation of the stomach and intestines, often caused by dietary indiscretion or infection.",
    symptoms: ["Vomiting", "Diarrhea", "Lethargy", "Loss of appetite"],
    treatment: "Supportive care, bland diet, anti-nausea medication",
  },
  {
    id: 2,
    condition: "Urinary Tract Infection",
    confidence: 72,
    description: "Bacterial infection in the urinary system, common in older pets.",
    symptoms: ["Frequent urination", "Straining to urinate", "Blood in urine", "Lethargy"],
    treatment: "Antibiotics, increased water intake",
  },
  {
    id: 3,
    condition: "Allergic Dermatitis",
    confidence: 68,
    description: "Skin inflammation caused by allergic reactions to environmental factors or food.",
    symptoms: ["Itching", "Skin redness", "Hair loss", "Ear scratching"],
    treatment: "Antihistamines, topical treatments, dietary changes",
  },
];

const DiagnosticTool = () => {
  const [species, setSpecies] = useState("dog");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diagnosisResults, setDiagnosisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const clearAll = () => {
    setSelectedSymptoms([]);
    setDiagnosisResults(null);
    setShowModal(false);
  };

  const handleSpeciesChange = (newSpecies) => {
    setSpecies(newSpecies);
    setSelectedSymptoms([]);
    setDiagnosisResults(null);
    setShowModal(false);
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      setToast({ type: "error", message: "Please select at least one symptom before analyzing." });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const shouldShowNoDiagnosis = Math.random() > 0.7;

      if (shouldShowNoDiagnosis) {
        setDiagnosisResults({
          inputSymptoms: selectedSymptoms,
          species,
          possibleDiagnoses: [],
          analysisNotes: `Analyzed ${selectedSymptoms.length} symptom(s) but found no matching diagnoses.`,
          noDiagnosisFound: true,
        });
      } else {
        setDiagnosisResults({
          inputSymptoms: selectedSymptoms,
          species,
          possibleDiagnoses: sampleDiagnoses,
          analysisNotes: `Analyzed ${selectedSymptoms.length} symptom(s) using multiple regression model.`,
          noDiagnosisFound: false,
        });
      }

      setLoading(false);
      setShowModal(true);
      setToast({ type: "success", message: "Analysis complete! Review the results." });
    }, 2000);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "text-green-700 bg-green-100 border-green-200";
    if (confidence >= 60) return "text-yellow-700 bg-yellow-100 border-yellow-200";
    return "text-red-700 bg-red-100 border-red-200";
  };

  const getConfidenceBar = (confidence) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col h-screen bg-[#FBFBFB] font-sans overflow-hidden">

      {/* Species Selector */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm w-fit">
          <button
            onClick={() => handleSpeciesChange("dog")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              species === "dog"
                ? "bg-[#5EE6FE] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Dog  size = {18}/> Dog
          </button>
          <button
            onClick={() => handleSpeciesChange("cat")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              species === "cat"
                ? "bg-[#5EE6FE] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Cat  size = {18}/> Cat
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 ml-1">
          Diagnosing for: <span className="font-semibold text-gray-600 capitalize">{species}</span>
          <span className="mx-1">·</span>Switching species will reset your symptom selection.
        </p>
      </div>

      {/* Main Content — left scrolls, right stays fixed */}
      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-6">

        {/* LEFT: Scrollable symptom area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-w-0">

          {/* Symptom Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#5EE6FE]" />
                  Select Symptoms
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Check all symptoms clearly observed in the patient.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {selectedSymptoms.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5EE6FE]/10 text-[#5EE6FE] border border-[#5EE6FE]/30 rounded-full text-sm font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {selectedSymptoms.length} selected
                  </span>
                )}
                {selectedSymptoms.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Symptom Category Cards */}
          {symptomCategories.map((cat) => (
            <div
              key={cat.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className={`px-5 py-3 border-b ${cat.bg} flex items-center gap-2`}>
                <span className={`text-sm font-semibold ${cat.color}`}>{cat.label}</span>
                {cat.symptoms.filter((s) => selectedSymptoms.includes(s)).length > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.bg} ${cat.color} border`}>
                    {cat.symptoms.filter((s) => selectedSymptoms.includes(s)).length} selected
                  </span>
                )}
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cat.symptoms.map((symptom) => {
                  const checked = selectedSymptoms.includes(symptom);
                  return (
                    <label
                      key={symptom}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                        checked
                          ? `${cat.bg} ${cat.color} border-current font-medium`
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSymptom(symptom)}
                        className={`w-4 h-4 rounded ${cat.checkColor} flex-shrink-0`}
                      />
                      <span className="text-[13px] leading-tight">{symptom}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Analyze Button */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <button
              onClick={analyzeSymptoms}
              disabled={loading || selectedSymptoms.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#5EE6FE] text-white hover:bg-[#4dd5ed] transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze Symptoms{selectedSymptoms.length > 0 && ` (${selectedSymptoms.length})`}
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: Sticky info panel — never scrolls */}
        <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col gap-4 overflow-hidden">

          {/* How It Works */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-shrink-0">
            <h3 className="text-base font-semibold text-gray-800 mb-4">How It Works</h3>
            <div className="space-y-4">
              {[
                { step: "1", title: "Choose Species", desc: "Select whether the patient is a Dog or Cat before starting." },
                { step: "2", title: "Select Symptoms", desc: "Check all observable symptoms from the categories on the left." },
                { step: "3", title: "Run Analysis", desc: "Our regression model ranks possible conditions by confidence." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#5EE6FE]/10 border border-[#5EE6FE]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#5EE6FE] text-sm font-bold">{item.step}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-3.5 bg-[#5EE6FE]/5 border border-[#5EE6FE]/20 rounded-xl">
              <p className="text-xs text-[#3ab8cf] leading-relaxed">
                <strong>Tip:</strong> Select all clearly evident symptoms. More symptoms yield more accurate results.
              </p>
            </div>
          </div>

          {/* Selected Symptoms Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-800">Selected Symptoms</h3>
              {selectedSymptoms.length > 0 && (
                <span className="text-xs text-gray-400">
                  {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {selectedSymptoms.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-xs text-gray-400">No symptoms selected yet</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <div className="flex flex-wrap gap-1.5">
                  {selectedSymptoms.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5EE6FE]/10 text-[#5EE6FE] border border-[#5EE6FE]/20 rounded-full text-xs font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition group"
                      title="Click to remove"
                    >
                      {s}
                      <span className="opacity-0 group-hover:opacity-100 transition ml-0.5">×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showModal && diagnosisResults && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5EE6FE]/10 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-[#5EE6FE]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Analysis Results</h3>
                  <p className="text-xs text-gray-400 capitalize">
                    {diagnosisResults.species} · {diagnosisResults.inputSymptoms.length} symptom{diagnosisResults.inputSymptoms.length !== 1 ? "s" : ""} analyzed
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {/* Input Summary */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-2">{diagnosisResults.analysisNotes}</p>
                <div className="flex flex-wrap gap-1.5">
                  {diagnosisResults.inputSymptoms.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded-full border border-gray-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* No Diagnosis Found */}
              {diagnosisResults.noDiagnosisFound ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-800 mb-2">No Specific Diagnosis Found</h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                    The selected symptoms don't closely match any condition in our database. A full clinical evaluation is recommended.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {diagnosisResults.possibleDiagnoses.map((diagnosis) => (
                    <div
                      key={diagnosis.id}
                      className="p-5 rounded-xl border border-gray-200 hover:border-[#5EE6FE]/40 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h4 className="font-semibold text-gray-800">{diagnosis.condition}</h4>
                        <span className={`flex-shrink-0 flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getConfidenceColor(diagnosis.confidence)}`}>
                          {diagnosis.confidence}% match
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
                        <div
                          className={`h-full rounded-full ${getConfidenceBar(diagnosis.confidence)} transition-all`}
                          style={{ width: `${diagnosis.confidence}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{diagnosis.description}</p>
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Matching Symptoms</p>
                        <div className="flex flex-wrap gap-1.5">
                          {diagnosis.symptoms.map((symptom, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Important:</strong> This analysis is a decision support tool only. Always combine results with clinical examination and professional veterinary judgment.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => { clearAll(); }}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition font-medium"
              >
                New Analysis
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#5EE6FE] text-white hover:bg-[#4dd5ed] transition text-sm font-semibold shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {toast?.type === "success" && <SuccessToast message={toast.message} onClose={() => setToast(null)} />}
      {toast?.type === "error" && <ErrorToast message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default DiagnosticTool;