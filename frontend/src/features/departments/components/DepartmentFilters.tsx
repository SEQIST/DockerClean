interface DepartmentFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortOption: string;
  setSortOption: (value: string) => void;
}

const DepartmentFilters: React.FC<DepartmentFiltersProps> = ({ searchQuery, setSearchQuery, sortOption, setSortOption }) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className="relative w-[300px]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Suche"
          className="w-full py-2 pl-10 pr-4 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:border-blue-300 focus:ring-3 focus:ring-blue-500/10"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="w-[200px] py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:border-blue-300 focus:ring-3 focus:ring-blue-500/10"
      >
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
      </select>
    </div>
  );
};

export default DepartmentFilters;