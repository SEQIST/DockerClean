import React from 'react';
import Select from 'react-select';

const AddWorkProductDialog = ({
  open,
  onClose,
  newWorkProduct,
  setNewWorkProduct,
  known,
  setKnown,
  unknown,
  setUnknown,
  availableWorkProducts,
  handleAddWorkProduct,
}: {
  open: boolean;
  onClose: any;
  newWorkProduct: any;
  setNewWorkProduct: any;
  known: string;
  setKnown: any;
  unknown: string;
  setUnknown: any;
  availableWorkProducts: any;
  handleAddWorkProduct: any;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[500px] p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Neues Work Product hinzufügen
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Work Product auswählen
            </label>
            <Select
              options={availableWorkProducts}
              value={newWorkProduct}
              onChange={(newValue: any) => setNewWorkProduct(newValue)}
              getOptionLabel={(option: any) => option.label}
              getOptionValue={(option: any) => option._id}
              placeholder="Work Product auswählen"
              className="text-gray-800 dark:text-gray-200"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: 'transparent',
                  borderColor: '#d1d5db',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    borderColor: '#3b82f6',
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
                  color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937',
                }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected
                    ? '#3b82f6'
                    : isFocused
                    ? '#e5e7eb'
                    : document.documentElement.classList.contains('dark')
                    ? '#1f2937'
                    : '#fff',
                  color: isSelected
                    ? '#fff'
                    : document.documentElement.classList.contains('dark')
                    ? '#d1d5db'
                    : '#1f2937',
                  '&:hover': {
                    backgroundColor: '#e5e7eb',
                  },
                }),
                singleValue: (base) => ({
                  ...base,
                  color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937',
                }),
                input: (base) => ({
                  ...base,
                  color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937',
                }),
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bekannt
            </label>
            <input
              name="known"
              value={known}
              onChange={(e: any) => setKnown(e.target.value)}
              type="number"
              className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unbekannt
            </label>
            <input
              name="unknown"
              value={unknown}
              onChange={(e: any) => setUnknown(e.target.value)}
              type="number"
              className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Abbrechen
          </button>
          <button
            onClick={handleAddWorkProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWorkProductDialog;