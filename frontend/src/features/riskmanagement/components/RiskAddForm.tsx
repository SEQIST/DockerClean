import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import RiskMatrix from '../pages/RiskMatrix';

// Interface für WorkProduct
interface WorkProduct {
  _id: string;
  name: string;
}

// Interface für Kategorien und Strategien
interface Category {
  _id: string;
  name: string;
}

interface Strategy {
  _id: string;
  name: string;
}

interface RiskAddFormProps {
  categories: Category[];
  strategies: Strategy[];
  workProducts: WorkProduct[];
  onSubmit: (formData: {
    category: string;
    status: string;
    title: string;
    submitter: string;
    description: string;
    mitigation: string;
    likelihoodBefore: number;
    severityBeforeEstimated: number;
    severityBeforeCalculated: number;
    likelihoodAfter: number;
    severityAfterEstimated: number;
    severityAfterCalculated: number;
    strategy: string;
    workProducts: WorkProduct[];
  }) => void;
  onCancel: () => void;
}

const RiskAddForm = ({ categories, strategies, workProducts, onSubmit, onCancel }: RiskAddFormProps) => {
  const [formData, setFormData] = useState({
    category: '',
    status: '',
    title: '',
    submitter: '',
    description: '',
    mitigation: '',
    likelihoodBefore: 1,
    severityBeforeEstimated: 1,
    severityBeforeCalculated: 1,
    likelihoodAfter: 1,
    severityAfterEstimated: 1,
    severityAfterCalculated: 1,
    strategy: '',
    workProducts: [] as WorkProduct[],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string, field: 'description' | 'mitigation') => {
    setFormData((prev) => ({ ...prev, [field]: content }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleWorkProductSelect = (wp: WorkProduct) => {
    if (!formData.workProducts.some((selected) => selected._id === wp._id)) {
      setFormData((prev) => ({
        ...prev,
        workProducts: [...prev.workProducts, wp],
      }));
    }
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleRemoveWorkProduct = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      workProducts: prev.workProducts.filter((wp) => wp._id !== id),
    }));
  };

  const filteredWorkProducts = workProducts.filter(
    (wp) =>
      wp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !formData.workProducts.some((selected) => selected._id === wp._id)
  );

  const handleSubmit = () => {
    onSubmit(formData);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="col-span-1 md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategorie</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        >
          <option value="">Keine Kategorie</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
        <input
          type="text"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Submitter</label>
        <input
          type="text"
          name="submitter"
          value={formData.submitter}
          onChange={handleChange}
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div className="col-span-1 md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung *</label>
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          value={formData.description}
          onEditorChange={(content) => handleEditorChange(content, 'description')}
          init={{
            height: 150,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
              'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar:
              'undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; background-color: #1f2937; color: #d1d5db; }',
            skin: 'oxide-dark',
            content_css: 'dark',
          }}
        />
      </div>
      <div className="col-span-1 md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mitigation</label>
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          value={formData.mitigation}
          onEditorChange={(content) => handleEditorChange(content, 'mitigation')}
          init={{
            height: 150,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
              'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar:
              'undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; background-color: #1f2937; color: #d1d5db; }',
            skin: 'oxide-dark',
            content_css: 'dark',
          }}
        />
      </div>
      <div className="col-span-1 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strategie</label>
        <select
          name="strategy"
          value={formData.strategy}
          onChange={handleChange}
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        >
          <option value="">Keine Strategie</option>
          {strategies.map((strat) => (
            <option key={strat._id} value={strat._id}>
              {strat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-1 md:col-span-2 relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Auslösendes Ereignis / Incoming Work Product
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Work Product suchen..."
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
        {isDropdownOpen && filteredWorkProducts.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredWorkProducts.map((wp) => (
              <div
                key={wp._id}
                onClick={() => handleWorkProductSelect(wp)}
                className="p-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {wp.name}
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.workProducts.map((wp) => (
            <span
              key={wp._id}
              className="inline-flex items-center px-2 py-1 text-sm text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-full"
            >
              {wp.name}
              <button
                onClick={() => handleRemoveWorkProduct(wp._id)}
                className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="col-span-1 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Likelihood Before</label>
        <input
          type="number"
          name="likelihoodBefore"
          value={formData.likelihoodBefore}
          onChange={handleChange}
          min="1"
          max="5"
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div className="col-span-1 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sev. Before Est.</label>
        <input
          type="number"
          name="severityBeforeEstimated"
          value={formData.severityBeforeEstimated}
          onChange={handleChange}
          min="1"
          max="5"
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div className="col-span-1 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sev. Before Calc.</label>
        <input
          type="number"
          name="severityBeforeCalculated"
          value={formData.severityBeforeCalculated}
          onChange={handleChange}
          min="1"
          max="5"
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div className="col-span-1 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Likelihood After</label>
        <input
          type="number"
          name="likelihoodAfter"
          value={formData.likelihoodAfter}
          onChange={handleChange}
          min="1"
          max="5"
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div className="col-span-1 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sev. After Est.</label>
        <input
          type="number"
          name="severityAfterEstimated"
          value={formData.severityAfterEstimated}
          onChange={handleChange}
          min="1"
          max="5"
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gamma-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div className="col-span-1 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sev. After Calc.</label>
        <input
          type="number"
          name="severityAfterCalculated"
          value={formData.severityAfterCalculated}
          onChange={handleChange}
          min="1"
          max="5"
          className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div className="col-span-1 md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risikomatrix</label>
        <RiskMatrix
          likelihoodBefore={formData.likelihoodBefore}
          severityBefore={formData.severityBeforeCalculated}
          likelihoodAfter={formData.likelihoodAfter}
          severityAfter={formData.severityAfterCalculated}
        />
      </div>
      <div className="col-span-1 md:col-span-3">
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Speichern
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskAddForm;