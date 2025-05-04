import React, { useState, useEffect, ChangeEvent } from 'react';
import WorkProductList from '../components/WorkProductList';
import WorkProductForm from '../components/WorkProductForm';
import WorkProductFilter from '../components/WorkProductFilter';
import WorkProductImport from '../components/WorkProductImport';
import ImportHintTooltip from '../components/ImportHintTooltip';
import ErrorBoundary from '../components/ErrorBoundary';
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Pagination from "../../../components/tables/DataTables/TableThree/Pagination";
import { WorkProduct } from '../../processes/services/processService'; // Änderung hier: Import aus processService

const WorkProductPage: React.FC = () => {
  const [workProducts, setWorkProducts] = useState<WorkProduct[]>([]);
  const [filteredWorkProducts, setFilteredWorkProducts] = useState<WorkProduct[]>([]);
  const [newWorkProduct, setNewWorkProduct] = useState<WorkProduct | null>({
    _id: undefined,
    name: '',
    number: '',
    useMode: 'Internal',
    cost: null,
    description: '',
    digitalisierbarDurch: [],
  });
  const [editWorkProduct, setEditWorkProduct] = useState<WorkProduct | null>(null);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkProducts();
  }, []);

  useEffect(() => {
    let filtered = [...workProducts];
    if (searchQuery) {
      filtered = filtered.filter((wp) =>
        (wp.name && wp.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (wp.number && wp.number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (wp.useMode && wp.useMode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (wp.description && wp.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (wp.cost && wp.cost.toString().includes(searchQuery))
      );
    }
    setFilteredWorkProducts(filtered);
    setCurrentPage(1);
  }, [workProducts, searchQuery]);

  const fetchWorkProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/workproducts');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Work Products');
      const data: WorkProduct[] = await response.json();
      setWorkProducts(data);
      setFilteredWorkProducts(data);
    } catch (error) {
      console.error('Fehler:', error);
      setError('Fehler beim Abrufen der Work Products: ' + (error as Error).message);
    }
  };

  const handleEditOpen = (wp: WorkProduct) => {
    setEditWorkProduct(wp);
    setOpenEditModal(true);
  };

  const handleAddClose = () => {
    setOpenAddModal(false);
    setNewWorkProduct({ _id: undefined, name: '', number: '', useMode: 'Internal', cost: null, description: '', digitalisierbarDurch: [] });
  };

  const handleEditClose = () => {
    setOpenEditModal(false);
    setEditWorkProduct(null);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredWorkProducts.length / rowsPerPage);
  const currentData = filteredWorkProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalEntries = filteredWorkProducts.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);

  return (
    <>
      <PageMeta
        title="Work Products | SEQ.IST - Project Management Solution"
        description="Manage work products in the SEQ.IST Project Management Solution"
      />
      <PageBreadcrumb pageTitle="Work Products" />
      <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03] w-full">
        <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-gray-400"> Show </span>
            <div className="relative z-20 bg-transparent">
              <select
                className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value="20" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">20</option>
                <option value="50" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">50</option>
                <option value="100" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">100</option>
              </select>
              <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                <svg
                  className="stroke-current"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400"> entries </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <WorkProductFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              workProducts={workProducts}
              filteredWorkProducts={filteredWorkProducts}
              setFilteredWorkProducts={setFilteredWorkProducts}
            />
            <button
              onClick={() => setOpenAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Work Product hinzufügen
            </button>
            <WorkProductImport
              importFile={importFile}
              setImportFile={setImportFile}
              setError={setError}
              setWorkProducts={setWorkProducts}
              workProducts={workProducts}
            />
            <ImportHintTooltip />
          </div>
        </div>
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="w-full table-auto">
            <WorkProductList
              workProducts={currentData}
              setWorkProducts={setWorkProducts}
              onEdit={handleEditOpen}
            />
          </div>
        </div>
        <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
            <div className="pb-3 xl:pb-0">
              <p className="pb-3 text-sm font-medium text-center text-gray-500 border-b border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left">
                Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
              </p>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {openAddModal && newWorkProduct && (
        <ErrorBoundary>
          <WorkProductForm
            open={openAddModal}
            onClose={handleAddClose}
            workProduct={newWorkProduct}
            setWorkProduct={setNewWorkProduct as React.Dispatch<React.SetStateAction<WorkProduct | null>>} // Typ explizit angeben
            setWorkProducts={setWorkProducts}
            workProducts={workProducts}
            title="Neues Work Product erstellen"
          />
        </ErrorBoundary>
      )}

      {openEditModal && editWorkProduct && (
        <ErrorBoundary>
          <WorkProductForm
            open={openEditModal}
            onClose={handleEditClose}
            workProduct={editWorkProduct}
            setWorkProduct={setEditWorkProduct}
            setWorkProducts={setWorkProducts}
            workProducts={workProducts}
            title="Work Product bearbeiten"
          />
        </ErrorBoundary>
      )}
    </>
  );
};

export default WorkProductPage;