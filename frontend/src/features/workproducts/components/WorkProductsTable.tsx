import React, { useState, useEffect } from 'react';
import WorkProductForm from './WorkProductForm';
import { WorkProduct } from '../../processes/services/processService';

const WorkProductsTable: React.FC = () => {
  const [workProducts, setWorkProducts] = useState<WorkProduct[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingWorkProduct, setEditingWorkProduct] = useState<WorkProduct | null>(null);

  useEffect(() => {
    const fetchWorkProducts = async () => {
      const response = await fetch('http://localhost:5001/api/workproducts');
      const data = await response.json();
      setWorkProducts(data);
    };
    fetchWorkProducts();
  }, []);

  const handleAddWorkProduct = () => {
    setEditingWorkProduct(null);
    setIsFormOpen(true);
  };

  const handleEditWorkProduct = (workProduct: WorkProduct) => {
    setEditingWorkProduct(workProduct);
    setIsFormOpen(true);
  };

  const handleDeleteWorkProduct = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/workproducts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen des Work Products');
      setWorkProducts(workProducts.filter(wp => wp._id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const handleWorkProductSave = (savedWorkProduct: WorkProduct) => {
    if (savedWorkProduct._id && workProducts.some(wp => wp._id === savedWorkProduct._id)) {
      // Update existing work product
      setWorkProducts(workProducts.map(wp => (wp._id === savedWorkProduct._id ? savedWorkProduct : wp)));
    } else {
      // Add new work product
      setWorkProducts([...workProducts, savedWorkProduct]);
    }
    setIsFormOpen(false);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const workProductsToImport = JSON.parse(text);

        const response = await fetch('http://localhost:5001/api/workproducts/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workProductsToImport),
        });

        if (!response.ok) {
          throw new Error('Fehler beim Importieren der Work Products');
        }

        const newWorkProducts = await response.json();
        setWorkProducts((prev) => [...prev, ...newWorkProducts]);
        alert('Work Products erfolgreich importiert!');
      } catch (error) {
        const err = error as Error; // Typisieren des Fehlers
        alert('Fehler beim Importieren: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">Work Products</h2>
      <div className="flex justify-between mb-4">
        <div>
          <label htmlFor="import-file" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer">
            Importieren
          </label>
          <input
            id="import-file"
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        <button
          onClick={handleAddWorkProduct}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Work Product hinzufügen
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Nummer</th>
            <th className="border px-4 py-2 text-left">Use Mode</th>
            <th className="border px-4 py-2 text-left">Digitalisierbar durch</th>
            <th className="border px-4 py-2 text-left">Kosten</th>
            <th className="border px-4 py-2 text-left">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {workProducts.map((wp) => (
            <tr key={wp._id} className="border-t">
              <td className="border px-4 py-2">{wp.name}</td>
              <td className="border px-4 py-2">{wp.number}</td>
              <td className="border px-4 py-2">{wp.useMode}</td>
              <td className="border px-4 py-2">{wp.digitalisierbarDurch?.join(', ') || 'N/A'}</td>
              <td className="border px-4 py-2">{wp.cost || 'N/A'}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEditWorkProduct(wp)}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteWorkProduct(wp._id!)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <WorkProductForm
              open={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              workProduct={editingWorkProduct}
              setWorkProduct={setEditingWorkProduct}
              setWorkProducts={setWorkProducts}
              workProducts={workProducts}
              title={editingWorkProduct ? "Work Product bearbeiten" : "Work Product hinzufügen"}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkProductsTable;