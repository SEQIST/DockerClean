// src/features/activities/components/ResultSection.tsx
import React from 'react';
import CustomAutocomplete from './CustomAutocomplete';
import { WorkProduct, Activity } from '../../processes/services/processService';

interface ResultSectionProps {
  activity: Activity;
  workProducts: WorkProduct[];
  handleChange: (field: keyof Activity, value: any) => void; // Typ angepasst
  handleAddNewWorkProductForResult: () => void;
}

const ResultSection: React.FC<ResultSectionProps> = ({ activity, workProducts, handleChange, handleAddNewWorkProductForResult }) => {
  const selectedWorkProduct = workProducts.find(product => product._id === activity.result) || null;

  const getOptionLabel = (option: WorkProduct) => {
    return `${option.name} (${option.abbreviation || 'Keine Abkürzung'})`;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ergebnis Work Product</label>
          <CustomAutocomplete<WorkProduct>
            options={workProducts}
            value={selectedWorkProduct}
            onChange={(newValue: WorkProduct | null) => handleChange('result', newValue?._id || null)}
            getOptionLabel={getOptionLabel}
            placeholder="Work Product auswählen"
            disabled={false}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleAddNewWorkProductForResult}
            className="px-3 py-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            + Neues Work Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultSection;