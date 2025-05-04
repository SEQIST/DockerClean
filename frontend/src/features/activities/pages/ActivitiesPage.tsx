// src/features/activities/pages/ActivitiesPage.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import ActivityFormMain from '../components/ActivityFormMain';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import Pagination from '../../../components/tables/DataTables/TableThree/Pagination';
import { Activity, Process, WorkProduct } from '../types';

const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [workProducts, setWorkProducts] = useState<WorkProduct[]>([]);
  const [addActivityModalOpen, setAddActivityModalOpen] = useState<boolean>(false);
  const [editActivityModalOpen, setEditActivityModalOpen] = useState<boolean>(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Activity | 'process' | 'result' | 'trigger'; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchActivities(),
          fetchProcesses(),
          fetchWorkProducts(),
        ]);
      } catch (err: any) {
        setError('Fehler beim Laden der Daten: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!activities || !processes || !workProducts) {
      setFilteredActivities([]);
      return;
    }

    let filtered = [...activities];
    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((activity) => {
        const name = activity.name || '';
        const abbreviation = activity.abbreviation || '';
        const processName = (processes.find(p => p._id === (typeof activity.process === 'string' ? activity.process : activity.process?._id))?.name || '').toLowerCase();
        const resultName = (workProducts.find(wp => wp._id === (typeof activity.result === 'string' ? activity.result : activity.result?._id))?.name || '').toLowerCase();
        return (
          name.toLowerCase().includes(lowerSearchQuery) ||
          abbreviation.toLowerCase().includes(lowerSearchQuery) ||
          processName.includes(lowerSearchQuery) ||
          resultName.includes(lowerSearchQuery)
        );
      });
    }

    filtered.sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (key === 'process') {
        const aName = processes.find(p => p._id === (typeof a.process === 'string' ? a.process : a.process?._id))?.name || '';
        const bName = processes.find(p => p._id === (typeof b.process === 'string' ? b.process : b.process?._id))?.name || '';
        return direction * aName.localeCompare(bName);
      } else if (key === 'result') {
        const aName = workProducts.find(wp => wp._id === (typeof a.result === 'string' ? a.result : a.result?._id))?.name || '';
        const bName = workProducts.find(wp => wp._id === (typeof b.result === 'string' ? b.result : b.result?._id))?.name || '';
        return direction * aName.localeCompare(bName);
      } else if (key === 'trigger') {
        const aCount = a.trigger?.workProducts?.length || 0;
        const bCount = b.trigger?.workProducts?.length || 0;
        return direction * (aCount - bCount);
      }
      const aValue = a[key];
      const bValue = b[key];
      const aStr = aValue !== undefined && aValue !== null ? String(aValue) : '';
      const bStr = bValue !== undefined && bValue !== null ? String(bValue) : '';
      return direction * aStr.localeCompare(bStr);
    });

    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [activities, searchQuery, sortConfig, processes, workProducts]);

  const fetchActivities = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/activities');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Aktivitäten');
      const data: Activity[] = await response.json();
      setActivities(data);
      setError(null);
    } catch (error: any) {
      throw error;
    }
  };

  const fetchProcesses = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/processes');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Prozesse');
      const data: Process[] = await response.json();
      setProcesses(data);
    } catch (error: any) {
      throw error;
    }
  };

  const fetchWorkProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/workproducts');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Work Products');
      const data: WorkProduct[] = await response.json();
      setWorkProducts(data);
    } catch (error: any) {
      throw error;
    }
  };

  const handleAddActivityModalOpen = () => setAddActivityModalOpen(true);
  const handleAddActivityModalClose = () => {
    setAddActivityModalOpen(false);
    window.location.href = '/quality/activities';
  };
  const handleEditActivityModalOpen = (activity: Activity) => {
    setEditActivity(activity);
    setEditActivityModalOpen(true);
  };
  const handleEditActivityModalClose = () => {
    setEditActivityModalOpen(false);
    setEditActivity(null);
    window.location.href = '/quality/activities';
  };

  const handleAdd = (newActivity: Activity) => {
    setActivities([...activities, newActivity]);
    handleAddActivityModalClose();
  };

  const handleEditSave = (updatedActivity: Activity) => {
    setActivities(activities.map(activity =>
      activity._id === updatedActivity._id ? updatedActivity : activity
    ));
    handleEditActivityModalClose();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/activities/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen der Aktivität');
      setActivities(activities.filter(activity => activity._id !== id));
      setError(null);
    } catch (error: any) {
      setError('Fehler beim Löschen der Aktivität: ' + error.message);
    }
  };

  const handleSort = (key: keyof Activity | 'process' | 'result' | 'trigger') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    alert('Importfunktion kommt bald – Datei bitte im richtigen Format bereitstellen!');
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

  const totalPages = Math.ceil(filteredActivities.length / rowsPerPage);
  const currentData = filteredActivities.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalEntries = filteredActivities.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Activities | SEQ.IST - Project Management Solution"
        description="Manage activities in the SEQ.IST Project Management Solution"
      />
      <PageBreadcrumb pageTitle="Activities" />
      <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03] w-full">
        {/* Kopfzeile nur anzeigen, wenn kein Bearbeitungsmodal offen ist */}
        {!editActivityModalOpen && (
          <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400">Show</span>
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
              <span className="text-gray-500 dark:text-gray-400">entries</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suche nach Name..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                />
              </div>
              <button
                onClick={handleAddActivityModalOpen}
                className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Aktivität hinzufügen
              </button>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 dark:text-gray-400 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer">
                Importieren
                <input type="file" hidden onChange={handleImport} accept=".xlsx,.docx" />
              </label>
            </div>
          </div>
        )}
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="w-full table-auto">
            <div className="border-b border-gray-100 dark:border-white/[0.05]">
              <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-3 px-4">
                <div className="w-[250px] pr-4 cursor-pointer" onClick={() => handleSort('name')}>
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <div className="w-[100px] pr-4 cursor-pointer" onClick={() => handleSort('abbreviation')}>
                  Abk. {sortConfig.key === 'abbreviation' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <div className="w-[250px] pr-4 cursor-pointer" onClick={() => handleSort('process')}>
                  Prozess {sortConfig.key === 'process' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <div className="w-[250px] pr-4 cursor-pointer" onClick={() => handleSort('result')}>
                  Ergebnis {sortConfig.key === 'result' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <div className="w-[150px] pr-4 cursor-pointer" onClick={() => handleSort('trigger')}>
                  Trigger {sortConfig.key === 'trigger' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <div className="w-[100px] pr-4 text-center">Aktionen</div>
              </div>
            </div>
            {currentData.map((activity) => (
              <div key={activity._id} className="flex items-center text-sm text-gray-600 dark:text-gray-400 py-2 px-4 border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="w-[250px] pr-4">{activity.name || 'Unbekannt'}</div>
                <div className="w-[100px] pr-4">{activity.abbreviation || 'N/A'}</div>
                <div className="w-[250px] pr-4">
                  {processes.find(p => p._id === (typeof activity.process === 'string' ? activity.process : activity.process?._id))?.name || 'Keiner'}
                </div>
                <div className="w-[250px] pr-4">
                  {workProducts.find(wp => wp._id === (typeof activity.result === 'string' ? activity.result : activity.result?._id))?.name || 'Keins'}
                </div>
                <div className="w-[150px] pr-4 flex items-center">
                  <svg
                    className={`w-5 h-5 mr-1 ${activity.trigger?.workProducts?.length > 0 ? 'text-green-500' : 'text-gray-500'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 011.767-.735l4.108 5.262a1 1 0 010 1.184l-4.108 5.262a1 1 0 01-1.767-.735l.806-4.146a2 2 0 00-1.986-2.182H5a1 1 0 110-2h5.176l.806-4.146zM2 9a1 1 0 011-1h.01a1 1 0 110 2H3a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{activity.trigger?.workProducts?.length || 0} Trigger{activity.trigger?.workProducts?.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-[100px] pr-4 flex justify-center space-x-2">
                  <button
                    onClick={() => handleEditActivityModalOpen(activity)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(activity._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 00-2 2v1h8V5a2 2 0 00-2-2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
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

      {addActivityModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <ActivityFormMain
              defaultProcess=""
              onClose={handleAddActivityModalClose}
            />
          </div>
        </div>
      )}

      {editActivityModalOpen && editActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <ActivityFormMain
              activityId={editActivity._id}
              defaultProcess=""
              onClose={handleEditActivityModalClose}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ActivitiesPage;