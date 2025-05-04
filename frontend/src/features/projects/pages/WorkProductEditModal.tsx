import React from 'react';

interface WorkProduct {
  workProduct: string;
  knownItems: number;
  unknownItems: number;
}

interface WorkProductEditModalProps {
  open: boolean;
  onClose: () => void;
  workProduct: WorkProduct | null;
  onChange: (field: keyof WorkProduct, value: any) => void;
  onSave: () => void;
  availableWorkProducts: any[];
}

const WorkProductEditModal: React.FC<WorkProductEditModalProps> = ({
  open,
  onClose,
  workProduct,
  onChange,
  onSave,
  availableWorkProducts,
}) => {
  if (!open || !workProduct) return null;

  const sortedWorkProducts = [...availableWorkProducts].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[600px] p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Work Product bearbeiten
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Product</label>
            <select
              value={workProduct.workProduct || ''}
              onChange={(e) => onChange('workProduct', e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            >
              <option value="">Keine</option>
              {sortedWorkProducts.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} ({product.abbreviation || 'Keine Abkürzung'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Known (#Items)</label>
            <input
              type="number"
              value={workProduct.knownItems || 0}
              onChange={(e) => onChange('knownItems', Number(e.target.value))}
              placeholder="Known (#Items)"
              className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unknown (#Items)</label>
            <input
              type="number"
              value={workProduct.unknownItems || 0}
              onChange={(e) => onChange('unknownItems', Number(e.target.value))}
              placeholder="Unknown (#Items)"
              className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Abbrechen
            </button>
            <button
              onClick={onSave}
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

export default WorkProductEditModal;