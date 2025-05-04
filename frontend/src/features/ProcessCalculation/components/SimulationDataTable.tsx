import React from 'react';

const SimulationDataTable = ({
  simulationData,
  setSimulationData,
  editIndex,
  editedValues,
  handleEdit,
  handleSave,
  handleDeleteWorkProduct,
  handleChange,
  handleAddDialogOpen,
}: {
  simulationData: any;
  setSimulationData: any;
  editIndex: any;
  editedValues: any;
  handleEdit: any;
  handleSave: any;
  handleDeleteWorkProduct: any;
  handleChange: any;
  handleAddDialogOpen: any;
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Simulation Data
      </h3>
      <button
        onClick={handleAddDialogOpen}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Hinzufügen
      </button>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Work Product</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Known (#Items)</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Unknown (#Items)</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {(simulationData.workProducts || []).map((wp: any, index: number) => (
              <tr key={wp._id || index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{wp.name}</td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                  {editIndex === index ? (
                    <input
                      name="known"
                      value={editedValues.known}
                      onChange={handleChange}
                      type="number"
                      className="w-full px-2 py-1 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                    />
                  ) : (
                    wp.known || 0
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                  {editIndex === index ? (
                    <input
                      name="unknown"
                      value={editedValues.unknown}
                      onChange={handleChange}
                      type="number"
                      className="w-full px-2 py-1 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                    />
                  ) : (
                    wp.unknown || 0
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                  {editIndex === index ? (
                    <button
                      onClick={() => handleSave(index)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Speichern
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorkProduct(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimulationDataTable;