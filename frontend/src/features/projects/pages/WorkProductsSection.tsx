import React, { useState } from 'react';

interface WorkProduct {
  workProduct: string;
  knownItems: number;
  unknownItems: number;
}

interface WorkProductOption {
  _id: string;
  name: string;
}

interface WorkProductsSectionProps {
  workProducts: WorkProduct[];
  setWorkProducts: (workProducts: WorkProduct[]) => void;
  availableWorkProducts: WorkProductOption[];
  onSave: (updatedWorkProducts: WorkProduct[]) => void;
  releases?: { workProducts: WorkProduct[] }[];
  showRegulatory?: boolean;
}

const WorkProductsSection: React.FC<WorkProductsSectionProps> = ({
  workProducts,
  setWorkProducts,
  availableWorkProducts,
  onSave,
  releases,
  showRegulatory = true,
}) => {
  const [newWorkProduct, setNewWorkProduct] = useState<WorkProduct | null>(null);
  const [editWorkProductIndex, setEditWorkProductIndex] = useState<number | null>(null);
  const [editWorkProductValues, setEditWorkProductValues] = useState<WorkProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredWorkProducts, setFilteredWorkProducts] = useState<WorkProductOption[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Berechnung, ob ein spezifisches Work Product verteilt ist
  const isWorkProductDistributed = (wp: WorkProduct) => {
    if (!releases || releases.length === 0) return false;

    // Summe der knownItems und unknownItems für dieses Work Product in allen Releases
    const releasesTotal = releases.reduce((acc, release) => {
      const matchingWorkProducts = (release.workProducts || []).filter(
        (releaseWp) => releaseWp.workProduct === wp.workProduct
      );
      const releaseTotal = matchingWorkProducts.reduce(
        (subAcc, releaseWp) => ({
          knownItems: subAcc.knownItems + releaseWp.knownItems,
          unknownItems: subAcc.unknownItems + releaseWp.unknownItems,
        }),
        { knownItems: 0, unknownItems: 0 }
      );
      return {
        knownItems: acc.knownItems + releaseTotal.knownItems,
        unknownItems: acc.unknownItems + releaseTotal.unknownItems,
      };
    }, { knownItems: 0, unknownItems: 0 });

    // Prüfen, ob die Summen übereinstimmen
    return wp.knownItems === releasesTotal.knownItems && wp.unknownItems === releasesTotal.unknownItems;
  };

  const handleSearchChange = (value: string, isNew: boolean) => {
    setSearchQuery(value);
    const filtered = availableWorkProducts.filter((wp) =>
      wp.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredWorkProducts(filtered);
    setShowDropdown(value.length > 0 && filtered.length > 0);

    if (isNew) {
      setNewWorkProduct((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          workProduct: value.length > 0 ? filtered[0]?._id || '' : '',
        };
      });
    } else if (editWorkProductIndex !== null && editWorkProductValues) {
      setEditWorkProductValues((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          workProduct: value.length > 0 ? filtered[0]?._id || '' : '',
        };
      });
    }
  };

  const handleSelectWorkProduct = (workProductId: string, isNew: boolean) => {
    setSearchQuery(availableWorkProducts.find((wp) => wp._id === workProductId)?.name || '');
    setShowDropdown(false);

    if (isNew) {
      setNewWorkProduct((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          workProduct: workProductId,
        };
      });
    } else if (editWorkProductIndex !== null && editWorkProductValues) {
      setEditWorkProductValues((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          workProduct: workProductId,
        };
      });
    }
  };

  const handleAddWorkProduct = () => {
    console.log('handleAddWorkProduct aufgerufen');
    const newWorkProductData = {
      workProduct: '',
      knownItems: 0,
      unknownItems: 0,
    };
    setNewWorkProduct(newWorkProductData);
    console.log('newWorkProduct gesetzt:', newWorkProductData);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleWorkProductChange = (field: keyof WorkProduct, value: any, isNew: boolean) => {
    if (isNew && newWorkProduct) {
      setNewWorkProduct((prev: WorkProduct | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: value,
        };
      });
    } else if (editWorkProductIndex !== null && editWorkProductValues) {
      setEditWorkProductValues((prev: WorkProduct | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: value,
        };
      });
    }
  };

  const handleSaveWorkProduct = () => {
    if (newWorkProduct) {
      if (!newWorkProduct.workProduct || newWorkProduct.knownItems < 0 || newWorkProduct.unknownItems < 0) {
        alert('Bitte füllen Sie alle Felder korrekt aus.');
        return;
      }
      const updatedWorkProducts = [...workProducts, newWorkProduct];
      setWorkProducts(updatedWorkProducts);
      onSave(updatedWorkProducts);
      setNewWorkProduct(null);
      setSearchQuery('');
      setShowDropdown(false);
    } else if (editWorkProductIndex !== null && editWorkProductValues) {
      if (!editWorkProductValues.workProduct || editWorkProductValues.knownItems < 0 || editWorkProductValues.unknownItems < 0) {
        alert('Bitte füllen Sie alle Felder korrekt aus.');
        return;
      }
      const updatedWorkProducts = [...workProducts];
      updatedWorkProducts[editWorkProductIndex] = editWorkProductValues;
      setWorkProducts(updatedWorkProducts);
      onSave(updatedWorkProducts);
      setEditWorkProductIndex(null);
      setEditWorkProductValues(null);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const handleCancelWorkProduct = () => {
    setNewWorkProduct(null);
    setEditWorkProductIndex(null);
    setEditWorkProductValues(null);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleEditWorkProduct = (index: number) => {
    setEditWorkProductIndex(index);
    setEditWorkProductValues(workProducts[index]);
    setSearchQuery(availableWorkProducts.find((wp) => wp._id === workProducts[index].workProduct)?.name || '');
    setShowDropdown(false);
  };

  const handleDeleteWorkProduct = (index: number) => {
    const updatedWorkProducts = workProducts.filter((_, i) => i !== index);
    setWorkProducts(updatedWorkProducts);
    onSave(updatedWorkProducts);
  };

  return (
    <>
      <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400 flex items-center">
        Inputs
      </h3>
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md mb-4 flex">
        <div className={showRegulatory ? "w-1/2" : "w-full"}>
          <button
            onClick={handleAddWorkProduct}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Hinzufügen
          </button>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-2 text-left">Work Product</th>
                <th className="px-4 py-2 text-left">Known (#Items)</th>
                <th className="px-4 py-2 text-left">Unknown (#Items)</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {workProducts.map((wp, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  {editWorkProductIndex === index ? (
                    <>
                      <td className="px-4 py-2 border relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value, false)}
                          placeholder="Work Product suchen..."
                          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                        />
                        {showDropdown && (
                          <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg mt-1">
                            {filteredWorkProducts.map((wp) => (
                              <li
                                key={wp._id}
                                onClick={() => handleSelectWorkProduct(wp._id, false)}
                                className="px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                {wp.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          value={editWorkProductValues?.knownItems || 0}
                          onChange={(e) => handleWorkProductChange('knownItems', Number(e.target.value), false)}
                          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          value={editWorkProductValues?.unknownItems || 0}
                          onChange={(e) => handleWorkProductChange('unknownItems', Number(e.target.value), false)}
                          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                        />
                      </td>
                      <td className="px-4 py-2 border"></td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={handleSaveWorkProduct}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 mr-2"
                        >
                          Speichern
                        </button>
                        <button
                          onClick={handleCancelWorkProduct}
                          className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                        >
                          Abbrechen
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 border">
                        {availableWorkProducts.find((availWp) => availWp._id === wp.workProduct)?.name || wp.workProduct}
                      </td>
                      <td className="px-4 py-2 border">{wp.knownItems}</td>
                      <td className="px-4 py-2 border">{wp.unknownItems}</td>
                      <td className="px-4 py-2 border">
                        {releases ? (
                          isWorkProductDistributed(wp) ? (
                            <span className="inline-block w-4 h-4 bg-green-500 rounded-full" title="Work Product vollständig verteilt"></span>
                          ) : (
                            <span className="inline-block w-4 h-4 bg-red-500 rounded-full" title="Work Product nicht vollständig verteilt"></span>
                          )
                        ) : (
                          <span className="inline-block w-4 h-4 bg-gray-500 rounded-full" title="Keine Releases vorhanden"></span>
                        )}
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => handleEditWorkProduct(index)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWorkProduct(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                        >
                          Löschen
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {workProducts.length === 0 && !newWorkProduct && (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                    Keine Work Products vorhanden
                  </td>
                </tr>
              )}
              {newWorkProduct && (
                <tr className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="px-4 py-2 border relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value, true)}
                      placeholder="Work Product suchen..."
                      className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                    />
                    {showDropdown && (
                      <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg mt-1">
                        {filteredWorkProducts.map((wp) => (
                          <li
                            key={wp._id}
                            onClick={() => handleSelectWorkProduct(wp._id, true)}
                            className="px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            {wp.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    <input
                      type="number"
                      value={newWorkProduct.knownItems || 0}
                      onChange={(e) => handleWorkProductChange('knownItems', Number(e.target.value), true)}
                      className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    <input
                      type="number"
                      value={newWorkProduct.unknownItems || 0}
                      onChange={(e) => handleWorkProductChange('unknownItems', Number(e.target.value), true)}
                      className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                    />
                  </td>
                  <td className="px-4 py-2 border"></td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={handleSaveWorkProduct}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 mr-2"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={handleCancelWorkProduct}
                      className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                    >
                      Abbrechen
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {showRegulatory && (
          <div className="w-1/2 pl-4">
            <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">Regulatory</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md h-full">
              <p className="text-gray-500 dark:text-gray-400">Platzhalter für Regulatory</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkProductsSection;