import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RiskForm from './RiskForm';

// Interface für WorkProduct
interface WorkProduct {
  _id: string;
  name: string;
}

const RiskEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [risk, setRisk] = useState<any | null>(null);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [strategies, setStrategies] = useState<{ _id: string; name: string }[]>([]);
  const [workProducts, setWorkProducts] = useState<WorkProduct[]>([]);
  const [formData, setFormData] = useState({
    category: '',
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
    strategy: '',
    workProducts: [] as WorkProduct[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchRisk(),
          fetchCategories(),
          fetchStrategies(),
          fetchWorkProducts(),
        ]);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchRisk = async () => {
    const response = await fetch(`http://localhost:5001/api/riskmatrix/risks/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Risiko nicht gefunden');
      }
      throw new Error(`Fehler beim Laden des Risikos: ${response.statusText}`);
    }
    const data = await response.json();
    setRisk(data);
    setFormData({
      category: data.category?._id || '',
      status: data.status || '',
      title: data.title || '',
      submitter: data.submitter || '',
      description: data.description || '',
      mitigation: data.mitigation || '',
      likelihoodBefore: data.likelihoodBefore || 1,
      severityBeforeEstimated: data.severityBeforeEstimated || 1,
      severityBeforeCalculated: data.severityBeforeCalculated || 1,
      likelihoodAfter: data.likelihoodAfter || 1,
      severityAfterEstimated: data.severityAfterEstimated || 1,
      severityAfterCalculated: data.severityAfterCalculated || 1,
      strategy: data.strategy?._id || '',
      workProducts: data.workProducts || [],
    });
  };

  const fetchCategories = async () => {
    const response = await fetch('http://localhost:5001/api/riskcategories');
    if (!response.ok) throw new Error('Fehler beim Laden der Kategorien');
    const data = await response.json();
    setCategories(data || []);
  };

  const fetchStrategies = async () => {
    const response = await fetch('http://localhost:5001/api/riskstrategies');
    if (!response.ok) throw new Error('Fehler beim Laden der Strategien');
    const data = await response.json();
    setStrategies(data || []);
  };

  const fetchWorkProducts = async () => {
    const response = await fetch('http://localhost:5001/api/workproducts');
    if (!response.ok) throw new Error('Fehler beim Laden der Work Products');
    const data = await response.json();
    setWorkProducts(data || []);
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
              Risiko bearbeiten
            </h2>
            <hr className="border-gray-200 dark:border-gray-700 mb-3" />
            <div className="text-red-500 dark:text-red-400">{error}</div>
            <button
              onClick={() => navigate('/riskmanagement')}
              className="mt-3 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
        <div className="w-full max-w-[1800px] min-w-[1200px]">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
              Risiko bearbeiten
            </h2>
            <hr className="border-gray-200 dark:border-gray-700 mb-3" />
            <div className="text-gray-700 dark:text-gray-300">Risiko nicht gefunden</div>
            <button
              onClick={() => navigate('/riskmanagement')}
              className="mt-3 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Zurück
            </button>
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
            Risiko bearbeiten
          </h2>
          <hr className="border-gray-200 dark:border-gray-700 mb-3" />
          <RiskForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            strategies={strategies}
            workProducts={workProducts}
            navigate={navigate}
            setError={setError}
            riskId={id}
          />
        </div>
      </div>
    </div>
  );
};

export default RiskEdit;