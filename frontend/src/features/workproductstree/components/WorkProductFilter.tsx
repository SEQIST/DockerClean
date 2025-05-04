import React, { useState, useMemo } from 'react';

// Schnittstelle für WorkProduct basierend auf dem Mongoose-Schema
interface WorkProduct {
  _id: string;
  name: string;
  description?: string;
  number?: string;
  uid: string;
  useMode: 'None' | 'Internal' | 'FromCustomer' | 'FromSupplier' | 'ToCustomer';
  cost: number | null;
  createdAt: string;
  updatedAt: string;
}

// Schnittstelle für die Props der WorkProductFilter-Komponente
interface WorkProductFilterProps {
  workProducts: WorkProduct[];
  selectedEndProduct: WorkProduct | null;
  setSelectedEndProduct: React.Dispatch<React.SetStateAction<WorkProduct | null>>;
  showWorkProducts: boolean;
  setShowWorkProducts: React.Dispatch<React.SetStateAction<boolean>>;
  showActivities: boolean;
  setShowActivities: React.Dispatch<React.SetStateAction<boolean>>;
  showRoles: boolean;
  setShowRoles: React.Dispatch<React.SetStateAction<boolean>>;
}

const WorkProductFilter: React.FC<WorkProductFilterProps> = ({
  workProducts,
  selectedEndProduct,
  setSelectedEndProduct,
  showWorkProducts,
  setShowWorkProducts,
  showActivities,
  setShowActivities,
  showRoles,
  setShowRoles,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Entferne Duplikate basierend auf _id
  const uniqueWorkProducts = useMemo(() => {
    return Array.from(new Map(workProducts.map((wp) => [wp._id, wp])).values());
  }, [workProducts]);

  // Filtere Work Products basierend auf der Suchanfrage
  const filteredWorkProducts = useMemo(() => {
    if (!searchQuery.trim()) return uniqueWorkProducts;
    const query = searchQuery.toLowerCase();
    return uniqueWorkProducts.filter(
      (wp) =>
        wp.name.toLowerCase().includes(query) ||
        wp._id.toLowerCase().includes(query) ||
        wp.number?.toLowerCase().includes(query)
    );
  }, [searchQuery, uniqueWorkProducts]);

  // Debugging: Ausgabe der gefilterten Work Products
  console.log('Filtered Work Products:', filteredWorkProducts);

  return (
    <div className="flex gap-4 mb-4">
      <div className="min-w-[200px]">
        <label htmlFor="end-product-input" className="block text-sm font-medium text-gray-700">
          Endprodukt suchen
        </label>
        <input
          id="end-product-input"
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // Optional: Automatisch das erste gefilterte Produkt auswählen
            const firstMatch = filteredWorkProducts[0] || null;
            setSelectedEndProduct(firstMatch);
          }}
          placeholder="Work Product suchen..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {/* Anzeige der gefilterten Ergebnisse */}
        {searchQuery && (
          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
            {filteredWorkProducts.length > 0 ? (
              filteredWorkProducts.map((wp) => (
                <div
                  key={wp._id}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedEndProduct?._id === wp._id ? 'bg-gray-200' : ''
                  }`}
                  onClick={() => setSelectedEndProduct(wp)}
                >
                  {wp.name} ({wp._id})
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500">Keine Ergebnisse gefunden</div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="show-work-products"
          checked={showWorkProducts}
          onChange={(e) => setShowWorkProducts(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="show-work-products" className="ml-2 block text-sm text-gray-900">
          Work Product
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="show-activities"
          checked={showActivities}
          onChange={(e) => setShowActivities(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="show-activities" className="ml-2 block text-sm text-gray-900">
          Activity
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="show-roles"
          checked={showRoles}
          onChange={(e) => setShowRoles(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="show-roles" className="ml-2 block text-sm text-gray-900">
          Role
        </label>
      </div>
    </div>
  );
};

export default WorkProductFilter;