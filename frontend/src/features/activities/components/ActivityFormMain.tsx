// src/features/activities/components/ActivityFormMain.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import TriggerSection from './TriggerSection';
import MultiplicatorSection from './MultiplicatorSection';
import TimeSection from './TimeSection';
import VersionSection from './VersionSection';
import ResultSection from './ResultSection';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, Process, WorkProduct, Role } from '../../processes/services/processService';
import CustomAutocomplete from './CustomAutocomplete';
import useFetchActivityData from '../hooks/useFetchActivityData';

interface ActivityFormMainProps {
  activityId?: string;
  defaultProcess?: string;
  onClose?: () => void; // Neue Prop für das Schließen des Modals
}

interface ImportMetaEnv {
  readonly VITE_TINYMCE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || '8bmk9fctlv8xyyt73d6m24h';

interface WorkProductFormProps {
  onClose: () => void;
  onSave: (savedWorkProduct: WorkProduct) => void;
}

const WorkProductForm: React.FC<WorkProductFormProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = React.useState<WorkProduct>({
    name: '',
    abbreviation: '',
    description: '',
  });

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (content: string) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/workproducts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Work Products');
      }

      const savedWorkProduct: WorkProduct = await response.json();
      onSave(savedWorkProduct);
      onClose();
    } catch (error) {
      // TODO: Benutzerbenachrichtigung hinzufügen (z. B. Toast)
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Neues Work Product erstellen</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleTextChange}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Abkürzung</label>
        <input
          type="text"
          name="abbreviation"
          value={formData.abbreviation}
          onChange={handleTextChange}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
        <Editor
          apiKey={apiKey}
          value={formData.description || ''}
          onEditorChange={handleDescriptionChange}
          init={{
            height: 200,
            menubar: false,
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'image',
              'charmap',
              'preview',
              'anchor',
              'searchreplace',
              'visualblocks',
              'code',
              'fullscreen',
              'insertdatetime',
              'media',
              'table',
              'wordcount',
            ],
            toolbar:
              'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | removeformat | code | help',
          }}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Speichern
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
};

const ActivityFormMain: React.FC<ActivityFormMainProps> = ({ activityId, defaultProcess, onClose }) => {
  const navigate = useNavigate();
  const { id: routeActivityId } = useParams<{ id: string }>();
  const effectiveActivityId = activityId || routeActivityId;

  const { roles, workProducts: initialWorkProducts, allWorkProducts, processes, activity, loading, error } = useFetchActivityData(effectiveActivityId, defaultProcess);
  const [addWorkProductModalOpen, setAddWorkProductModalOpen] = React.useState<boolean>(false);
  const [workProducts, setWorkProducts] = React.useState<WorkProduct[]>(initialWorkProducts);

  const initialActivity: Activity = {
    _id: '',
    name: '',
    process: defaultProcess || null,
    executedBy: null,
    result: null,
    roles: [],
    multiplicator: 1,
    compressor: 'multiply',
    executionMode: 'parallel',
    knownTime: 0,
    estimatedTime: 0,
    timeUnit: 'minutes',
    versionMajor: 1,
    versionMinor: 0,
    icon: '',
    description: '',
    abbreviation: '',
    timeFactor: 0,
    duration: 0,
    effort: 0,
    trigger: {
      workProducts: [],
      andOr: 'AND',
      timeTrigger: { unit: 'sec', value: 0, repetition: '' },
      determiningFactorId: null,
    },
  };

  const [formData, setFormData] = React.useState<Activity>(initialActivity);

  React.useEffect(() => {
    if (activity) {
      setFormData({
        ...activity,
        process: activity.process || defaultProcess || null,
        executedBy: activity.executedBy || null,
        result: activity.result || null,
        multiplicator: activity.multiplicator || 1,
      });
    }
  }, [activity, defaultProcess]);

  React.useEffect(() => {
    setWorkProducts(initialWorkProducts);
  }, [initialWorkProducts]);

  const handleChange = (field: keyof Activity, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNewWorkProductForResult = () => setAddWorkProductModalOpen(true);

  const handleAddWorkProductModalClose = () => setAddWorkProductModalOpen(false);

  const handleWorkProductSave = (newWorkProduct: WorkProduct) => {
    setFormData(prev => ({ ...prev, result: newWorkProduct._id || null }));
    setWorkProducts((prev: WorkProduct[]) => [...prev, newWorkProduct]);
    handleAddWorkProductModalClose();
  };

  const handleSave = async () => {
    try {
      const method = effectiveActivityId ? 'PUT' : 'POST';
      const url = effectiveActivityId
        ? `http://localhost:5001/api/activities/${effectiveActivityId}`
        : 'http://localhost:5001/api/activities';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Aktivität');
      }

      setAddWorkProductModalOpen(false);
      if (onClose) {
        onClose(); // Schließe das Modal/Fenster
      } else {
        navigate('/quality/activities'); // Fallback, falls onClose nicht definiert ist
      }
    } catch (error) {
      // TODO: Benutzerbenachrichtigung hinzufügen (z. B. Toast)
    }
  };

  const handleCancel = () => {
    setAddWorkProductModalOpen(false);
    if (onClose) {
      onClose(); // Schließe das Modal/Fenster
    } else {
      navigate('/quality/activities'); // Fallback, falls onClose nicht definiert ist
    }
  };

  if (loading) return <div className="text-gray-500 dark:text-gray-400 p-4">Lade Aktivität...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 p-4">Fehler: {error}</div>;

  const sortedProcesses = [...processes].sort((a, b) => (a.name as string).localeCompare(b.name as string));
  const sortedRoles = [...roles].sort((a, b) => (a.name as string).localeCompare(b.name as string));

  const selectedProcess = sortedProcesses.find(p => {
    const processId = typeof formData.process === 'string' ? formData.process : formData.process?._id;
    return p._id === processId;
  }) || null;
  const selectedRole = sortedRoles.find(r => {
    const roleId = typeof formData.executedBy === 'string' ? formData.executedBy : formData.executedBy?._id;
    return r._id === roleId;
  }) || null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          {effectiveActivityId ? 'Aktivität bearbeiten' : 'Aktivität hinzufügen'}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 pl-10"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18m-9-9v18"></path>
                    </svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Abkürzung</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.abbreviation || ''}
                    onChange={(e) => handleChange('abbreviation', e.target.value)}
                    placeholder="Abk."
                    maxLength={10}
                    className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 pl-10"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 4v2m-2 0v2m-2-2v2m-2 0v2m8 0v2m-2 0v2m-2-2v2m-2 0v2m8 0v2m-2 0v2m-2-2v2m-2 0v2"></path>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung *</label>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg">
                <Editor
                  apiKey={apiKey}
                  value={formData.description || ''}
                  onEditorChange={(content: string) => handleChange('description', content)}
                  init={{
                    height: 120,
                    menubar: false,
                    plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'],
                    toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"></path>
                  </svg>
                  Wenn = Bedingung(en)
                </h3>
                <TriggerSection
                  activity={formData}
                  setActivity={setFormData}
                  availableWorkProductsForTrigger={workProducts}
                  allWorkProducts={allWorkProducts}
                />
              </div>

              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-green-700 dark:text-gray-300 mb-2 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Möchte ich (Aktivität)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prozess</label>
                    <CustomAutocomplete<Process>
                      options={sortedProcesses}
                      value={selectedProcess}
                      onChange={(newValue: Process | null) => handleChange('process', newValue?._id || null)}
                      getOptionLabel={(option: Process) => option.name}
                      placeholder="Prozess auswählen"
                      disabled={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ausgeführt von (Rolle)</label>
                    <CustomAutocomplete<Role>
                      options={sortedRoles}
                      value={selectedRole}
                      onChange={(newValue: Role | null) => handleChange('executedBy', newValue?._id || null)}
                      getOptionLabel={(option: Role) => option.name}
                      placeholder="Rolle auswählen"
                      disabled={false}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Multiplicator</label>
                  <MultiplicatorSection activity={formData} setActivity={setFormData} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zeit</label>
                  <TimeSection activity={formData} setActivity={setFormData} />
                </div>
              </div>

              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Ziel/Work Product
                </h3>
                <ResultSection
                  activity={formData}
                  workProducts={workProducts}
                  handleChange={handleChange}
                  handleAddNewWorkProductForResult={handleAddNewWorkProductForResult}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
              <VersionSection activity={formData} setActivity={setFormData} />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Speichern
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>

        {addWorkProductModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Neues Work Product hinzufügen</h2>
              <WorkProductForm
                onClose={handleAddWorkProductModalClose}
                onSave={handleWorkProductSave}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFormMain;