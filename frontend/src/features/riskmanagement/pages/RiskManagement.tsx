import { useState, useEffect } from 'react';
import RiskList from '../components/RiskList';
import RiskForm from './RiskForm';
import { useNavigate } from 'react-router-dom';

// Interface für ein Risiko
interface Risk {
  _id: string;
  category?: { _id: string; name: string } | string;
  status?: string;
  title?: string;
  submitter?: string;
  description?: string;
  likelihoodBefore?: number;
  severityBeforeCalculated?: number;
}

// Interface für Kategorien, Strategien und Work Products
interface Category {
  _id: string;
  name: string;
}

interface Strategy {
  _id: string;
  name: string;
}

interface WorkProduct {
  _id: string;
  name: string;
}

const RiskManagement = () => {
  const navigate = useNavigate();
  const [risks, setRisks] = useState<Risk[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [workProducts, setWorkProducts] = useState<WorkProduct[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newRiskData, setNewRiskData] = useState({
    category: null as string | null,
    status: '',
    title: '',
    submitter: '',
    description: '',
    mitigation: '',
    likelihoodBefore: 1,
    severityBeforeEstimated: 1,
    severityBeforeCalculated: 1,
    likelihoodAfter: 1,
    severityAfterEstimated: 1,
    severityAfterCalculated: 1,
    strategy: null as string | null,
    workProducts: [] as WorkProduct[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [risksResponse, categoriesResponse, strategiesResponse, workProductsResponse] = await Promise.all([
          fetch('http://localhost:5001/api/riskmatrix/risks'),
          fetch('http://localhost:5001/api/riskcategories'),
          fetch('http://localhost:5001/api/riskstrategies'),
          fetch('http://localhost:5001/api/workproducts'),
        ]);

        if (!risksResponse.ok) throw new Error('Fehler beim Laden der Risiken');
        if (!categoriesResponse.ok) throw new Error('Fehler beim Laden der Kategorien');
        if (!strategiesResponse.ok) throw new Error('Fehler beim Laden der Strategien');
        if (!workProductsResponse.ok) throw new Error('Fehler beim Laden der Work Products');

        const risksData = await risksResponse.json();
        const categoriesData = await categoriesResponse.json();
        const strategiesData = await strategiesResponse.json();
        const workProductsData = await workProductsResponse.json();

        const validRisks: Risk[] = Array.isArray(risksData) ? risksData.filter((risk: any) => risk && typeof risk === 'object' && risk._id) : [];

        setRisks(validRisks);
        setCategories(categoriesData || []);
        setStrategies(strategiesData || []);
        setWorkProducts(workProductsData || []);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddRisk = async () => {
    try {
      const cleanedData = {
        ...newRiskData,
        category: newRiskData.category === '' ? null : newRiskData.category,
        strategy: newRiskData.strategy === '' ? null : newRiskData.strategy,
        workProducts: newRiskData.workProducts || [],
        likelihoodBefore: newRiskData.likelihoodBefore || 1,
        severityBeforeEstimated: newRiskData.severityBeforeEstimated || 1,
        severityBeforeCalculated: newRiskData.severityBeforeCalculated || 1,
        likelihoodAfter: newRiskData.likelihoodAfter || 1,
        severityAfterEstimated: newRiskData.severityAfterEstimated || 1,
        severityAfterCalculated: newRiskData.severityAfterCalculated || 1,
      };

      const response = await fetch('http://localhost:5001/api/riskmatrix/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Hinzufügen');
      }
      const savedRisk: Risk = await response.json();
      setRisks((prev) => (prev ? [...prev, savedRisk] : [savedRisk]));
      setAddModalOpen(false);
      setNewRiskData({
        category: null,
        status: '',
        title: '',
        submitter: '',
        description: '',
        mitigation: '',
        likelihoodBefore: 1,
        severityBeforeEstimated: 1,
        severityBeforeCalculated: 1,
        likelihoodAfter: 1,
        severityAfterEstimated: 1,
        severityAfterCalculated: 1,
        strategy: null,
        workProducts: [],
      });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  const handleDeleteRisk = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/riskmatrix/risks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen');
      setRisks((prev) => (prev ? prev.filter((risk) => risk._id !== id) : prev));
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  if (loading) return <div className="text-gray-500 dark:text-gray-400 p-4">Laden...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 p-4">{error}</div>;

  return (
    <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
      <div className="w-full max-w-[1800px] min-w-[1200px]">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
            Risikomanagement
          </h2>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Neues Risiko
            </h3>
            <hr className="border-gray-200 dark:border-gray-700 mb-3" />
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Risiko hinzufügen
              </button>
            </div>
          </div>

          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Risikoliste
            </h3>
            <hr className="border-gray-200 dark:border-gray-700 mb-3" />
            {Array.isArray(risks) && risks.length > 0 ? (
              <RiskList risks={risks} setRisks={setRisks} onDelete={handleDeleteRisk} />
            ) : (
              <p className="text-gray-700 dark:text-gray-300">Keine Risiken verfügbar</p>
            )}
          </div>

          {addModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg w-[800px] p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Neues Risiko
                </h2>
                <RiskForm
                  formData={newRiskData}
                  setFormData={setNewRiskData}
                  categories={categories}
                  strategies={strategies}
                  workProducts={workProducts}
                  navigate={navigate}
                  setError={setError}
                  onSubmit={handleAddRisk}
                  onCancel={() => setAddModalOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;