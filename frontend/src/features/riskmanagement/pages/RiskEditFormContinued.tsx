import RiskMatrix from './RiskMatrix';

interface RiskEditFormContinuedProps {
  formData: {
    likelihoodBefore: number;
    severityBeforeEstimated: number;
    severityBeforeCalculated: number;
    likelihoodAfter: number;
    severityAfterEstimated: number;
    severityAfterCalculated: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<RiskEditFormContinuedProps['formData']>>;
  handleSubmit: () => void;
  navigate: (path: string) => void;
}

const RiskEditFormContinued = ({ formData, setFormData, handleSubmit, navigate }: RiskEditFormContinuedProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Likelihood Before</label>
          <input
            type="number"
            name="likelihoodBefore"
            value={formData.likelihoodBefore}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sev. Before Est.</label>
          <input
            type="number"
            name="severityBeforeEstimated"
            value={formData.severityBeforeEstimated}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sev. Before Calc.</label>
          <input
            type="number"
            name="severityBeforeCalculated"
            value={formData.severityBeforeCalculated}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Likelihood After</label>
          <input
            type="number"
            name="likelihoodAfter"
            value={formData.likelihoodAfter}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sev. After Est.</label>
          <input
            type="number"
            name="severityAfterEstimated"
            value={formData.severityAfterEstimated}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sev. After Calc.</label>
          <input
            type="number"
            name="severityAfterCalculated"
            value={formData.severityAfterCalculated}
            onChange={handleChange}
            min="1"
            max="5"
            className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div className="col-span-1 md:col-span-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risikomatrix</label>
          <RiskMatrix
            likelihoodBefore={formData.likelihoodBefore || 1}
            severityBefore={formData.severityBeforeCalculated || 1}
            likelihoodAfter={formData.likelihoodAfter || 1}
            severityAfter={formData.severityAfterCalculated || 1}
          />
        </div>
        <div className="col-span-1 md:col-span-6">
          <div className="flex gap-2 mt-2 sticky bottom-0 bg-white dark:bg-gray-900 p-1">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Speichern
            </button>
            <button
              onClick={() => navigate('/riskmanagement')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RiskEditFormContinued;