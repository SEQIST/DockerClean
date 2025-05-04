// src/features/activities/components/TriggerSection.tsx
import React, { useState, useEffect } from 'react';
import CustomAutocomplete from './CustomAutocomplete';
import { WorkProduct, Activity } from '../../processes/services/processService';

interface TriggerSectionProps {
  activity: Activity;
  setActivity: (activity: Activity) => void;
  availableWorkProductsForTrigger: WorkProduct[];
  allWorkProducts: WorkProduct[];
}

const TriggerSection: React.FC<TriggerSectionProps> = ({ activity, setActivity, availableWorkProductsForTrigger, allWorkProducts }) => {
  const [fetchedWorkProducts, setFetchedWorkProducts] = useState<WorkProduct[]>([]);
  const [invalidWorkProducts, setInvalidWorkProducts] = useState<string[]>([]);
  const [missingWorkProducts, setMissingWorkProducts] = useState<string[]>([]);

  useEffect(() => {
    const fetchMissingWorkProducts = async () => {
      const missingWorkProductIds = (activity.trigger?.workProducts || [])
        .map(wp => typeof wp._id === 'string' ? wp._id : wp._id?._id)
        .filter(wpId => wpId && !allWorkProducts.some(wp => wp._id === wpId));

      if (missingWorkProductIds.length === 0) {
        setMissingWorkProducts([]);
        return;
      }

      const promises = missingWorkProductIds.map(async (id) => {
        try {
          const response = await fetch(`http://localhost:5001/api/workproducts/${id}`);
          if (!response.ok) {
            return null;
          }
          const workProduct: WorkProduct = await response.json();
          return workProduct;
        } catch (error) {
          return null;
        }
      });

      const results = await Promise.all(promises);
      const newWorkProducts = results.filter((wp): wp is WorkProduct => wp !== null);
      const notFoundIds = missingWorkProductIds.filter((_, index) => results[index] === null);
      setFetchedWorkProducts(newWorkProducts);
      setMissingWorkProducts(notFoundIds);
    };

    fetchMissingWorkProducts();
  }, [activity.trigger?.workProducts, allWorkProducts]);

  const combinedWorkProducts = [...allWorkProducts, ...fetchedWorkProducts];

  const resultWorkProductId = typeof activity.result === 'string' ? activity.result : activity.result?._id;
  const filteredOptions = combinedWorkProducts.filter(wp => wp._id !== resultWorkProductId);

  useEffect(() => {
    const invalidWpIds = (activity.trigger?.workProducts || [])
      .map(wp => typeof wp._id === 'string' ? wp._id : wp._id?._id)
      .filter(wpId => wpId && wpId === resultWorkProductId);

    if (invalidWpIds.length > 0) {
      setInvalidWorkProducts(invalidWpIds);

      const updatedWorkProducts = (activity.trigger?.workProducts || []).filter(wp => {
        const wpId = typeof wp._id === 'string' ? wp._id : wp._id?._id;
        return !invalidWpIds.includes(wpId);
      });

      setActivity({
        ...activity,
        trigger: {
          ...activity.trigger,
          workProducts: updatedWorkProducts,
          andOr: activity.trigger?.andOr || 'AND',
          timeTrigger: activity.trigger?.timeTrigger || { unit: 'sec', value: 0, repetition: '' },
          determiningFactorId: activity.trigger?.determiningFactorId || null,
        },
      });
    } else {
      setInvalidWorkProducts([]);
    }
  }, [activity.result, activity.trigger?.workProducts, setActivity]);

  const handleAddWorkProduct = () => {
    setActivity({
      ...activity,
      trigger: {
        ...activity.trigger,
        workProducts: [
          ...(activity.trigger?.workProducts || []),
          { _id: '', completionPercentage: 100, isWorkloadDetermining: (activity.trigger?.workProducts || []).length === 0 },
        ],
        andOr: activity.trigger?.andOr || 'AND',
        timeTrigger: activity.trigger?.timeTrigger || { unit: 'sec', value: 0, repetition: '' },
        determiningFactorId: activity.trigger?.determiningFactorId || null,
      },
    });
  };

  const handleRemoveWorkProduct = (index: number) => {
    setActivity({
      ...activity,
      trigger: {
        ...activity.trigger,
        workProducts: (activity.trigger?.workProducts || []).filter((_, i) => i !== index).map((wp, i) => ({
          ...wp,
          isWorkloadDetermining: i === 0,
        })),
        andOr: activity.trigger?.andOr || 'AND',
        timeTrigger: activity.trigger?.timeTrigger || { unit: 'sec', value: 0, repetition: '' },
        determiningFactorId: activity.trigger?.determiningFactorId || null,
      },
    });
  };

  const handleWorkProductChange = (index: number, field: string, value: any) => {
    setActivity({
      ...activity,
      trigger: {
        ...activity.trigger,
        workProducts: (activity.trigger?.workProducts || []).map((wp, i) => {
          if (i !== index) return wp;
          if (field === '_id') return { ...wp, _id: value };
          if (field === 'completionPercentage') return { ...wp, completionPercentage: Number(value) || 100 };
          if (field === 'isWorkloadDetermining') {
            return { ...wp, isWorkloadDetermining: true };
          }
          return wp;
        }).map((wp, i) => ({
          ...wp,
          isWorkloadDetermining: field === 'isWorkloadDetermining' ? i === index : wp.isWorkloadDetermining,
        })),
        andOr: activity.trigger?.andOr || 'AND',
        timeTrigger: activity.trigger?.timeTrigger || { unit: 'sec', value: 0, repetition: '' },
        determiningFactorId: activity.trigger?.determiningFactorId || null,
      },
    });
  };

  const handleAndOrChange = (value: 'AND' | 'OR') => {
    setActivity({
      ...activity,
      trigger: {
        ...activity.trigger,
        andOr: value,
        workProducts: activity.trigger?.workProducts || [],
        timeTrigger: activity.trigger?.timeTrigger || { unit: 'sec', value: 0, repetition: '' },
        determiningFactorId: activity.trigger?.determiningFactorId || null,
      },
    });
  };

  const handleTimeTriggerChange = (field: 'unit' | 'value' | 'repetition', value: any) => {
    setActivity({
      ...activity,
      trigger: {
        ...activity.trigger,
        workProducts: activity.trigger?.workProducts || [],
        andOr: activity.trigger?.andOr || 'AND',
        timeTrigger: {
          ...activity.trigger?.timeTrigger,
          [field]: field === 'value' ? Number(value) || 0 : value,
          unit: activity.trigger?.timeTrigger?.unit || 'sec',
          value: activity.trigger?.timeTrigger?.value || 0,
          repetition: activity.trigger?.timeTrigger?.repetition || '',
        },
        determiningFactorId: activity.trigger?.determiningFactorId || null,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trigger by</h4>
        {invalidWorkProducts.length > 0 && (
          <div className="text-red-500 mb-2">
            Warnung: Die folgenden Work Products können nicht als Trigger verwendet werden, da sie das Ergebnis-Work Product der Aktivität sind: {invalidWorkProducts.join(', ')}. Sie wurden entfernt.
          </div>
        )}
        {missingWorkProducts.length > 0 && (
          <div className="text-red-500 mb-2">
            Warnung: Die folgenden Work Products konnten nicht gefunden werden: {missingWorkProducts.join(', ')}. Bitte überprüfen Sie die Daten.
          </div>
        )}
        <div className="space-y-2">
          {(activity.trigger?.workProducts || []).map((wp, index) => {
            const wpId = typeof wp._id === 'string' ? wp._id : wp._id?._id;
            const selectedWorkProduct = combinedWorkProducts.find(product => product._id === wpId);

            const getOptionLabel = (option: WorkProduct) => {
              const label = `${option.name} (${option.abbreviation || 'Keine Abkürzung'})`;
              return label;
            };

            return (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Product</label>
                  {selectedWorkProduct ? (
                    <CustomAutocomplete<WorkProduct>
                      options={filteredOptions}
                      value={selectedWorkProduct}
                      onChange={(newValue: WorkProduct | null) => handleWorkProductChange(index, '_id', newValue?._id || '')}
                      getOptionLabel={getOptionLabel}
                      placeholder="Work Product auswählen"
                      disabled={true}
                    />
                  ) : (
                    <div className="text-red-500">Work Product nicht gefunden (ID: {wpId})</div>
                  )}
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">% Fertigstellung</label>
                  <input
                    type="number"
                    value={wp.completionPercentage || 100}
                    onChange={(e) => handleWorkProductChange(index, 'completionPercentage', e.target.value)}
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={wp.isWorkloadDetermining || false}
                    onChange={() => handleWorkProductChange(index, 'isWorkloadDetermining', true)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-700 dark:focus:ring-blue-800"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Ja</span>
                </div>
                <button
                  onClick={() => handleRemoveWorkProduct(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 00-2 2v1h8V5a2 2 0 00-2-2z"></path>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleAddWorkProduct}
            className="px-3 py-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            + Neues WP hinzufügen
          </button>
          <button
            onClick={() => {}} // Entfernte die Konsolenmeldung
            className="px-3 py-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            + Vorhandenes WP hinzufügen
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verknüpfung</h4>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="AND"
              checked={(activity.trigger?.andOr || 'AND') === 'AND'}
              onChange={() => handleAndOrChange('AND')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-700 dark:focus:ring-blue-800"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">AND</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="OR"
              checked={(activity.trigger?.andOr || 'AND') === 'OR'}
              onChange={() => handleAndOrChange('OR')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-700 dark:focus:ring-blue-800"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">OR</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zeitlicher Trigger</h4>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zeit</label>
            <input
              type="number"
              value={activity.trigger?.timeTrigger?.value || 0}
              onChange={(e) => handleTimeTriggerChange('value', e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Einheit</label>
            <select
              value={activity.trigger?.timeTrigger?.unit || 'sec'}
              onChange={(e) => handleTimeTriggerChange('unit', e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            >
              <option value="sec">Sekunden</option>
              <option value="min">Minuten</option>
              <option value="hour">Stunden</option>
              <option value="day">Tage</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wiederholung</label>
            <input
              type="text"
              value={activity.trigger?.timeTrigger?.repetition || ''}
              onChange={(e) => handleTimeTriggerChange('repetition', e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriggerSection;