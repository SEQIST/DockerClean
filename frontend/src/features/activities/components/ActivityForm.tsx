import React, { useState, useEffect, ChangeEvent } from 'react';
import { Activity, Process, WorkProduct, ActivityFormMainProps } from '../types';

const ActivityFormMain: React.FC<ActivityFormMainProps> = ({ activityId, onClose, onSave, activities }) => {
  const [formData, setFormData] = useState<Activity>({
    _id: '',
    name: '',
    abbreviation: '',
    process: '',
    result: '',
    trigger: { workProducts: [] },
  });
  const [processes, setProcesses] = useState<Process[]>([]);
  const [workProducts, setWorkProducts] = useState<WorkProduct[]>([]);
  const [selectedWorkProducts, setSelectedWorkProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchProcesses(), fetchWorkProducts()]);
        if (activityId) {
          await fetchActivity();
        }
      } catch (err: any) {
        console.error('Fehler beim Laden der Daten:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activityId]);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/activities/${activityId}`);
      if (!response.ok) throw new Error('Fehler beim Abrufen der Aktivität');
      const data: Activity = await response.json();
      setFormData(data);
      setSelectedWorkProducts(data.trigger?.workProducts?.map(wp => wp._id) || []);
    } catch (error: any) {
      console.error('Fehler beim Abrufen der Aktivität:', error);
    }
  };

  const fetchProcesses = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/processes');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Prozesse');
      const data: Process[] = await response.json();
      setProcesses(data);
    } catch (error: any) {
      console.error('Fehler beim Abrufen der Prozesse:', error);
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
      console.error('Fehler beim Abrufen der Work Products:', error);
      throw error;
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || null, // Setze auf null, wenn der Wert leer ist
    }));
  };

  const handleWorkProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedWorkProducts(options);
    setFormData(prev => {
      const updatedFormData = {
        ...prev,
        trigger: { workProducts: options.map(id => ({ _id: id })) },
      };
      console.log('selectedWorkProducts:', options);
      console.log('formData.trigger.workProducts:', updatedFormData.trigger.workProducts);
      return updatedFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = activityId ? 'PATCH' : 'POST';
      const url = activityId
        ? `http://localhost:5001/api/activities/${activityId}`
        : 'http://localhost:5001/api/activities';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          process: formData.process || null, // Setze auf null, wenn leer
          result: formData.result || null,  // Setze auf null, wenn leer
        }),
      });
      if (!response.ok) throw new Error(`Fehler beim ${activityId ? 'Aktualisieren' : 'Erstellen'} der Aktivität`);
      const savedActivity: Activity = await response.json();
      onSave(savedActivity);
    } catch (error: any) {
      console.error('Fehler beim Speichern der Aktivität:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        {activityId ? 'Aktivität bearbeiten' : 'Neue Aktivität erstellen'}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Abkürzung</label>
          <input
            type="text"
            name="abbreviation"
            value={formData.abbreviation}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prozess</label>
          <select
            name="process"
            value={typeof formData.process === 'string' ? formData.process : formData.process?._id || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          >
            <option value="">Kein Prozess</option>
            {processes.map(process => (
              <option key={process._id} value={process._id}>{process.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ergebnis</label>
          <select
            name="result"
            value={typeof formData.result === 'string' ? formData.result : formData.result?._id || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          >
            <option value="">Kein Ergebnis</option>
            {workProducts.map(wp => (
              <option key={wp._id} value={wp._id}>{wp.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trigger (Work Products)</label>
          <select
            multiple
            value={selectedWorkProducts}
            onChange={handleWorkProductChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          >
            {workProducts.map(wp => (
              <option key={wp._id} value={wp._id}>{wp.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Abbrechen
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Speichern
        </button>
      </div>
    </form>
  );
};

export default ActivityFormMain;