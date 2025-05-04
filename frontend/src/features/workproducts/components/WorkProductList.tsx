import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkProduct } from '../../processes/services/processService';

interface WorkProductListProps {
  workProducts: WorkProduct[];
  setWorkProducts: (wps: WorkProduct[]) => void; // Direkte Funktion
  onEdit: (wp: WorkProduct) => void;
  onDelete: (id: string) => void;
}

const WorkProductList: React.FC<WorkProductListProps> = ({ workProducts, setWorkProducts, onEdit }) => {
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/workproducts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen');
      const updatedWorkProducts = workProducts.filter((wp: WorkProduct) => wp._id !== id);
      setWorkProducts(updatedWorkProducts);
    } catch (error) {
      console.error('Löschfehler:', error);
    }
  };

  const handleDuplicate = (wp: WorkProduct) => {
    const newNumber = `${wp.number}D`;
    const newWorkProduct = { ...wp, number: newNumber, _id: undefined };
    fetch('http://localhost:5001/api/workproducts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkProduct),
    })
      .then((response) => response.json())
      .then((savedWorkProduct: WorkProduct) => {
        setWorkProducts([...workProducts, savedWorkProduct]);
      });
  };

  const handleNavigateToTree = (workProductId: string) => {
    navigate(`/quality/work-products-tree?selected=${workProductId}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nummer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Use Mode</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kosten</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktionen</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {workProducts.map((wp) => (
            <tr key={wp._id}>
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-gray-100">{wp.name}</td>
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-gray-100">{wp.number}</td>
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-gray-100">{wp.useMode}</td>
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-gray-100">{wp.cost || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-gray-100">
                <button onClick={() => onEdit(wp)} className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
                <button onClick={() => handleDuplicate(wp)} className="text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                </button>
                <button onClick={() => handleDelete(wp._id ?? '')} className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
                <button onClick={() => handleNavigateToTree(wp._id ?? '')} className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg) scaleX(-1)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v5m0 0l-4-4m4 4l4-4m-4 4v5m-4-5h8m-4 5v5m-4-5h8" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkProductList;