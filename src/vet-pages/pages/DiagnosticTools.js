import { useState } from "react";
// import Header from "../../admin-pages/template/Header";
import { Search, Brain, AlertTriangle, CheckCircle, X, Tag, HelpCircle } from "lucide-react";
import SuccessToast from "../../template/SuccessToast";

const DiagnosticTool = () => {
  const [symptomsInput, setSymptomsInput] = useState("");
  const [diagnosisResults, setDiagnosisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedQuickSymptoms, setSelectedQuickSymptoms] = useState([]);

  const sampleDiagnoses = [
    {
      id: 1,
      condition: "Gastroenteritis",
      confidence: 85,
      description: "Inflammation of the stomach and intestines, often caused by dietary indiscretion or infection.",
      symptoms: ["Vomiting", "Diarrhea", "Lethargy", "Loss of appetite"],
      treatment: "Supportive care, bland diet, anti-nausea medication",
      severity: "Moderate"
    },
    {
      id: 2,
      condition: "Urinary Tract Infection",
      confidence: 72,
      description: "Bacterial infection in the urinary system, common in older pets.",
      symptoms: ["Frequent urination", "Straining to urinate", "Blood in urine", "Lethargy"],
      treatment: "Antibiotics, increased water intake",
      severity: "Mild"
    },
    {
      id: 3,
      condition: "Allergic Dermatitis",
      confidence: 68,
      description: "Skin inflammation caused by allergic reactions to environmental factors or food.",
      symptoms: ["Itching", "Skin redness", "Hair loss", "Ear infections"],
      treatment: "Antihistamines, topical treatments, dietary changes",
      severity: "Mild"
    }
  ];

  const commonSymptoms = [
    "Vomiting", "Diarrhea", "Lethargy", "Loss of appetite", "Fever",
    "Coughing", "Sneezing", "Itching", "Skin redness", "Hair loss",
    "Weight loss", "Increased thirst", "Frequent urination", "Lameness",
    "Eye discharge", "Ear scratching", "Bad breath", "Pale gums"
  ];

  const getSymptomsArray = () => {
    return symptomsInput
      .split(',')
      .map(symptom => symptom.trim())
      .filter(symptom => symptom.length > 0);
  };

  const handleQuickSymptomToggle = (symptom) => {
    const symptomsArray = getSymptomsArray();
    
    if (selectedQuickSymptoms.includes(symptom)) {
      const newSymptoms = symptomsArray.filter(s => s !== symptom);
      setSymptomsInput(newSymptoms.join(', '));
      setSelectedQuickSymptoms(prev => prev.filter(s => s !== symptom));
    } else {
      const newSymptoms = [...symptomsArray, symptom];
      setSymptomsInput(newSymptoms.join(', '));
      setSelectedQuickSymptoms(prev => [...prev, symptom]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSymptomsInput(value);
    
    const symptomsArray = value.split(',').map(s => s.trim()).filter(s => s);
    setSelectedQuickSymptoms(commonSymptoms.filter(symptom => 
      symptomsArray.includes(symptom)
    ));
  };

  const clearSymptoms = () => {
    setSymptomsInput("");
    setSelectedQuickSymptoms([]);
  };

  const analyzeSymptoms = () => {
    const symptomsArray = getSymptomsArray();
    if (symptomsArray.length === 0) {
      setToast({ type: "error", message: "Please enter at least one symptom" });
      return;
    }

    setLoading(true);
    
    // Simulate API call - randomly decide if we should show "no diagnosis"
    setTimeout(() => {
      const shouldShowNoDiagnosis = Math.random() > 0.7; // 30% chance of no diagnosis
      
      if (shouldShowNoDiagnosis) {
        setDiagnosisResults({
          inputSymptoms: symptomsArray,
          possibleDiagnoses: [], // Empty array means no diagnoses found
          analysisNotes: `Analyzed ${symptomsArray.length} symptom(s) but found no matching diagnoses.`,
          noDiagnosisFound: true
        });
      } else {
        setDiagnosisResults({
          inputSymptoms: symptomsArray,
          possibleDiagnoses: sampleDiagnoses,
          analysisNotes: `Analyzed ${symptomsArray.length} symptom(s) using multiple regression model.`,
          noDiagnosisFound: false
        });
      }
      
      setLoading(false);
      setToast({ type: "success", message: "Analysis complete! Review the results below." });
    }, 2000);
  };

  const resetAnalysis = () => {
    setSymptomsInput("");
    setSelectedQuickSymptoms([]);
    setDiagnosisResults(null);
    setSelectedDiagnosis(null);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "text-green-600 bg-green-100";
    if (confidence >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "mild": return "text-green-600 bg-green-100";
      case "moderate": return "text-yellow-600 bg-yellow-100";
      case "severe": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const handleToastClose = () => {
    setToast(null);
  };

  const symptomsArray = getSymptomsArray();

  return (
    <div className="flex flex-col h-screen bg-[#FBFBFB] font-sans">
      {/* <div className="p-6 pb-0">
        <Header title="Diagnostic Tool" />
      </div> */}

      <div className="flex-1 overflow-y-auto p-6 pt-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Symptom Input */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-500" />
                  Enter Symptoms
                </h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={symptomsInput}
                      onChange={handleInputChange}
                      placeholder="Enter symptoms separated by commas (e.g., vomiting, fever, lethargy)..."
                      rows="3"
                      className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    {symptomsInput && (
                      <button
                        onClick={clearSymptoms}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {symptomsArray.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 mb-2 font-medium">Symptoms entered:</p>
                      <div className="flex flex-wrap gap-1">
                        {symptomsArray.map((symptom, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200"
                          >
                            <Tag className="w-3 h-3" />
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Quick Add Common Symptoms
                    <span className="text-gray-500 text-xs ml-2">
                      {selectedQuickSymptoms.length} selected
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {commonSymptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => handleQuickSymptomToggle(symptom)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition border ${
                          selectedQuickSymptoms.includes(symptom)
                            ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={resetAnalysis}
                    className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={analyzeSymptoms}
                    disabled={loading || symptomsArray.length === 0}
                    className="flex-1 px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Brain className="w-4 h-4" />
                        Analyze Symptoms ({symptomsArray.length})
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Information Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">How It Works</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">Enter Symptoms</h4>
                      <p className="text-gray-600 text-xs mt-1">Type symptoms separated by commas or click quick-add buttons.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">AI Analysis</h4>
                      <p className="text-gray-600 text-xs mt-1">Our multiple regression model analyzes symptom patterns.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">Review Results</h4>
                      <p className="text-gray-600 text-xs mt-1">Get possible diagnoses or recommendations.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs text-green-700">
                    <strong>Tip:</strong> Start with the most prominent symptoms first for more accurate results.
                  </p>
                </div>
              </div>

              {symptomsArray.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Symptoms entered:</span>
                      <span className="font-semibold text-blue-600">{symptomsArray.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quick selections:</span>
                      <span className="font-semibold text-green-600">{selectedQuickSymptoms.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {diagnosisResults && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Analysis Results
                </h3>

                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <strong>Input Symptoms:</strong> {diagnosisResults.inputSymptoms.join(", ")}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {diagnosisResults.analysisNotes}
                  </p>
                </div>

                {/* No Diagnosis Found Message */}
                {diagnosisResults.noDiagnosisFound ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HelpCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">No Specific Diagnosis Found</h4>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      The symptoms you entered don't match any specific conditions in our database. 
                      This could be due to uncommon symptom combinations or the need for additional clinical evaluation.
                    </p>
                  </div>
                ) : (
                  /* Regular Diagnosis Results */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {diagnosisResults.possibleDiagnoses.map((diagnosis) => (
                      <div
                        key={diagnosis.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedDiagnosis?.id === diagnosis.id
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-25"
                        }`}
                        onClick={() => setSelectedDiagnosis(diagnosis)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800">{diagnosis.condition}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(diagnosis.severity)}`}>
                              {diagnosis.severity}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(diagnosis.confidence)}`}>
                              {diagnosis.confidence}%
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{diagnosis.description}</p>
                        
                        <div className="mb-2">
                          <span className="text-xs text-gray-500">Matching symptoms:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {diagnosis.symptoms.map((symptom, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700">
                          <strong>Suggested Treatment:</strong> {diagnosis.treatment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      <strong>Important:</strong> This analysis is based on statistical modeling and should be used as a decision support tool only. Always combine with clinical examination and professional judgment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {toast && (
        <SuccessToast 
          message={toast.message} 
          onClose={handleToastClose}
        />
      )}
    </div>
  );
};

export default DiagnosticTool;