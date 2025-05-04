import { useState, useEffect } from 'react';

// Interface für Likelihood-Daten
interface Likelihood {
  level: number;
  description: string;
  probability: string;
}

// Interface für Severity-Daten
interface Severity {
  level: number;
  description: string;
  projectCostPercentage: string;
  repairTimePercentage: string;
}

const RiskMatrixSettings = () => {
  const [likelihoodData, setLikelihoodData] = useState<Likelihood[]>([]);
  const [severityData, setSeverityData] = useState<Severity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [likelihoodResponse, severityResponse] = await Promise.all([
          fetch('http://localhost:5001/api/riskmatrix/likelihood'),
          fetch('http://localhost:5001/api/riskmatrix/severity'),
        ]);

        if (!likelihoodResponse.ok) throw new Error('Fehler beim Laden der Likelihood-Daten');
        if (!severityResponse.ok) throw new Error('Fehler beim Laden der Severity-Daten');

        const fetchedLikelihoodData = await likelihoodResponse.json();
        const fetchedSeverityData = await severityResponse.json();

        // Typprüfung und Konvertierung der API-Daten
        const validatedLikelihoodData: Likelihood[] = Array.isArray(fetchedLikelihoodData)
          ? fetchedLikelihoodData.map((item: any) => ({
              level: Number(item.level),
              description: String(item.description || ''),
              probability: String(item.probability || ''),
            }))
          : [];

        const validatedSeverityData: Severity[] = Array.isArray(fetchedSeverityData)
          ? fetchedSeverityData.map((item: any) => ({
              level: Number(item.level),
              description: String(item.description || ''),
              projectCostPercentage: String(item.projectCostPercentage || ''),
              repairTimePercentage: String(item.repairTimePercentage || ''),
            }))
          : [];

        const defaultLikelihood: Likelihood[] = [
          { level: 1, description: "Very Low", probability: "<0,5%" },
          { level: 2, description: "Low", probability: "0,5% - 2%" },
          { level: 3, description: "Medium", probability: "2% - 5%" },
          { level: 4, description: "High", probability: "5% - 10%" },
          { level: 5, description: "Very High", probability: ">10%" },
        ];

        const defaultSeverity: Severity[] = [
          { level: 1, description: "Negligible", projectCostPercentage: "1%", repairTimePercentage: "<1%" },
          { level: 2, description: "Minor", projectCostPercentage: "2%", repairTimePercentage: "1% - 5%" },
          { level: 3, description: "Moderate", projectCostPercentage: "5%", repairTimePercentage: "5% - 10%" },
          { level: 4, description: "Major", projectCostPercentage: "10%", repairTimePercentage: "10% - 20%" },
          { level: 5, description: "Catastrophic", projectCostPercentage: ">20%", repairTimePercentage: ">20%" },
        ];

        const fullLikelihoodData: Likelihood[] = [];
        for (let level = 1; level <= 5; level++) {
          const existingData = validatedLikelihoodData.find((item) => item.level === level);
          if (existingData) {
            fullLikelihoodData.push(existingData);
          } else {
            const defaultData = defaultLikelihood.find((item) => item.level === level);
            if (defaultData) {
              fullLikelihoodData.push(defaultData);
            }
          }
        }

        const fullSeverityData: Severity[] = [];
        for (let level = 1; level <= 5; level++) {
          const existingData = validatedSeverityData.find((item) => item.level === level);
          if (existingData) {
            fullSeverityData.push(existingData);
          } else {
            const defaultData = defaultSeverity.find((item) => item.level === level);
            if (defaultData) {
              fullSeverityData.push(defaultData);
            }
          }
        }

        setLikelihoodData(fullLikelihoodData);
        setSeverityData(fullSeverityData);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLikelihoodChange = (index: number, field: keyof Likelihood, value: string) => {
    setLikelihoodData((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSeverityChange = (index: number, field: keyof Severity, value: string) => {
    setSeverityData((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async () => {
    try {
      const [likelihoodResponse, severityResponse] = await Promise.all([
        fetch('http://localhost:5001/api/riskmatrix/likelihood', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(likelihoodData),
        }),
        fetch('http://localhost:5001/api/riskmatrix/severity', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(severityData),
        }),
      ]);

      if (!likelihoodResponse.ok) throw new Error('Fehler beim Speichern der Likelihood-Daten');
      if (!severityResponse.ok) throw new Error('Fehler beim Speichern der Severity-Daten');

      alert('Daten erfolgreich gespeichert');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
        <div className="w-full max-w-[1800px] min-w-[1200px] text-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
            <div className="text-gray-500 dark:text-gray-400">Laden...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
        <div className="w-full max-w-[1800px] min-w-[1200px]">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
              Risikomatrix-Einstellungen
            </h2>
            <hr className="border-gray-200 dark:border-gray-700 mb-3" />
            <div className="text-red-500 dark:text-red-400">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
      <div className="w-full max-w-[1800px] min-w-[1200px]">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
            Risikomatrix-Einstellungen
          </h2>
          <hr className="border-gray-200 dark:border-gray-700 mb-3" />

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Likelihood
            </h3>
            <hr className="border-gray-200 dark:border-gray-700 mb-3" />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Level</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Beschreibung</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Wahrscheinlichkeit (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {likelihoodData.map((item, index) => (
                    <tr key={item.level} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{item.level}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => handleLikelihoodChange(index, 'description', e.target.value)}
                          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                        />
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">
                        <input
                          type="text"
                          value={item.probability || ''}
                          onChange={(e) => handleLikelihoodChange(index, 'probability', e.target.value)}
                          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Severity
            </h3>
            <hr className="border-gray-200 dark:border-gray-700 mb-3" />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Level</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Beschreibung</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Projektkosten (%)</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-800 dark:text-gray-200">Reparaturzeit (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {severityData.map((item, index) => (
                    <tr key={item.level} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{item.level}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => handleSeverityChange(index, 'description', e.target.value)}
                          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                        />
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">
                        <input
                          type="text"
                          value={item.projectCostPercentage || ''}
                          onChange={(e) => handleSeverityChange(index, 'projectCostPercentage', e.target.value)}
                          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                        />
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">
                        <input
                          type="text"
                          value={item.repairTimePercentage || ''}
                          onChange={(e) => handleSeverityChange(index, 'repairTimePercentage', e.target.value)}
                          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrixSettings;