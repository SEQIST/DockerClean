import React, { useState, ChangeEvent } from 'react';
import { WorkProduct } from '../types/WorkProduct';

interface WorkProductFilterProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  workProducts: WorkProduct[];
  filteredWorkProducts: WorkProduct[];
  setFilteredWorkProducts: React.Dispatch<React.SetStateAction<WorkProduct[]>>;
}

const WorkProductFilter: React.FC<WorkProductFilterProps> = ({
  searchQuery,
  setSearchQuery,
  workProducts,
  filteredWorkProducts,
  setFilteredWorkProducts,
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleSelectWorkProduct = (wp: WorkProduct) => {
    setSearchQuery(wp.name);
    setShowDropdown(false);
    setFilteredWorkProducts(
      workProducts.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(wp.name.toLowerCase())) ||
          (item.number && item.number.toLowerCase().includes(wp.name.toLowerCase())) ||
          (item.useMode && item.useMode.toLowerCase().includes(wp.name.toLowerCase())) ||
          (item.description && item.description.toLowerCase().includes(wp.name.toLowerCase())) ||
          (item.cost && item.cost.toString().includes(wp.name))
      )
    );
  };

  return (
    <div className="relative">
      <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
        <svg
          className="fill-current w-5 h-5"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
            fill=""
          />
        </svg>
      </button>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Suche nach Name..."
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
      />
      {showDropdown && searchQuery && (
        <div className="absolute z-20 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1">
          {filteredWorkProducts.length > 0 ? (
            filteredWorkProducts.map((wp) => (
              <div
                key={wp._id}
                className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelectWorkProduct(wp)}
              >
                {wp.name} ({wp.number})
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              Keine Ergebnisse gefunden
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkProductFilter;