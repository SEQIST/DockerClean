import React, { useState } from 'react';
import WorkProductsSection from './WorkProductsSection';

interface WorkProduct {
  workProduct: string;
  knownItems: number;
  unknownItems: number;
}

interface WorkProductOption {
  _id: string;
  name: string;
}

interface Release {
  name: string;
  startDate: string;
  endDate: string;
  workProducts: WorkProduct[];
}

interface ReleasesSectionProps {
  releases: Release[];
  setReleases: (releases: Release[]) => void;
  onSave: (updatedReleases: Release[]) => void;
  availableWorkProducts: WorkProductOption[];
}

const ReleasesSection: React.FC<ReleasesSectionProps> = ({
  releases,
  setReleases,
  onSave,
  availableWorkProducts,
}) => {
  const [newRelease, setNewRelease] = useState<Release | null>(null);
  const [editReleaseIndex, setEditReleaseIndex] = useState<number | null>(null);
  const [editReleaseValues, setEditReleaseValues] = useState<Release | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddRelease = () => {
    console.log('handleAddRelease aufgerufen');
    const newReleaseData = {
      name: '',
      startDate: '',
      endDate: '',
      workProducts: [],
    };
    setNewRelease(newReleaseData);
    console.log('newRelease gesetzt:', newReleaseData);
    setErrorMessage(null);
  };

  const handleReleaseChange = (field: keyof Release, value: string, isNew: boolean) => {
    if (isNew && newRelease) {
      setNewRelease((prev: Release | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: value,
        };
      });
    } else if (editReleaseIndex !== null && editReleaseValues) {
      setEditReleaseValues((prev: Release | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: value,
        };
      });
    }
    setErrorMessage(null);
  };

  const validateDates = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return true; // Validierung überspringen, wenn eines der Felder leer ist
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end >= start;
  };

  const handleSaveRelease = () => {
    if (newRelease) {
      if (!newRelease.name || !newRelease.startDate || !newRelease.endDate) {
        setErrorMessage('Bitte füllen Sie alle Felder aus.');
        return;
      }
      if (!validateDates(newRelease.startDate, newRelease.endDate)) {
        setErrorMessage('Das Enddatum muss größer oder gleich dem Startdatum sein.');
        return;
      }
      const updatedReleases = [...releases, newRelease];
      setReleases(updatedReleases);
      onSave(updatedReleases);
      setNewRelease(null);
      setErrorMessage(null);
    } else if (editReleaseIndex !== null && editReleaseValues) {
      if (!editReleaseValues.name || !editReleaseValues.startDate || !editReleaseValues.endDate) {
        setErrorMessage('Bitte füllen Sie alle Felder aus.');
        return;
      }
      if (!validateDates(editReleaseValues.startDate, editReleaseValues.endDate)) {
        setErrorMessage('Das Enddatum muss größer oder gleich dem Startdatum sein.');
        return;
      }
      const updatedReleases = [...releases];
      updatedReleases[editReleaseIndex] = editReleaseValues;
      setReleases(updatedReleases);
      onSave(updatedReleases);
      setEditReleaseIndex(null);
      setEditReleaseValues(null);
      setErrorMessage(null);
    }
  };

  const handleCancelRelease = () => {
    setNewRelease(null);
    setEditReleaseIndex(null);
    setEditReleaseValues(null);
    setErrorMessage(null);
  };

  const handleEditRelease = (index: number) => {
    setEditReleaseIndex(index);
    setEditReleaseValues(releases[index]);
    setErrorMessage(null);
  };

  const handleDeleteRelease = (index: number) => {
    const updatedReleases = releases.filter((_, i) => i !== index);
    setReleases(updatedReleases);
    onSave(updatedReleases);
  };

  const handleWorkProductsSave = (releaseIndex: number, updatedWorkProducts: WorkProduct[]) => {
    console.log('handleWorkProductsSave aufgerufen für Release', releaseIndex, 'mit Work Products:', updatedWorkProducts);
    const updatedReleases = [...releases];
    updatedReleases[releaseIndex] = {
      ...updatedReleases[releaseIndex],
      workProducts: updatedWorkProducts,
    };
    console.log('Updated Releases:', updatedReleases);
    setReleases(updatedReleases);
    onSave(updatedReleases);
  };

  return (
    <>
      <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">Releases / Sprints</h3>
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md mb-4">
        <button
          onClick={handleAddRelease}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Hinzufügen
        </button>
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {errorMessage}
          </div>
        )}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Startdatum</th>
              <th className="px-4 py-2 text-left">Enddatum</th>
              <th className="px-4 py-2 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {releases.map((release, index) => (
              <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                {editReleaseIndex === index ? (
                  <>
                    <td className="px-4 py-2 border">
                      <input
                        type="text"
                        value={editReleaseValues?.name || ''}
                        onChange={(e) => handleReleaseChange('name', e.target.value, false)}
                        placeholder="Name"
                        className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="date"
                        value={editReleaseValues?.startDate || ''}
                        onChange={(e) => handleReleaseChange('startDate', e.target.value, false)}
                        className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="date"
                        value={editReleaseValues?.endDate || ''}
                        onChange={(e) => handleReleaseChange('endDate', e.target.value, false)}
                        className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={handleSaveRelease}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 mr-2"
                      >
                        Speichern
                      </button>
                      <button
                        onClick={handleCancelRelease}
                        className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                      >
                        Abbrechen
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 border">{release.name}</td>
                    <td className="px-4 py-2 border">{release.startDate}</td>
                    <td className="px-4 py-2 border">{release.endDate}</td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleEditRelease(index)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 mr-2"
                      >
                        Speichern
                      </button>
                      <button
                        onClick={() => handleDeleteRelease(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                      >
                        Abbrechen
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {newRelease && (
              <tr className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="px-4 py-2 border">
                  <input
                    type="text"
                    value={newRelease.name || ''}
                    onChange={(e) => handleReleaseChange('name', e.target.value, true)}
                    placeholder="Name"
                    className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                  />
                </td>
                <td className="px-4 py-2 border">
                  <input
                    type="date"
                    value={newRelease.startDate || ''}
                    onChange={(e) => handleReleaseChange('startDate', e.target.value, true)}
                    className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                  />
                </td>
                <td className="px-4 py-2 border">
                  <input
                    type="date"
                    value={newRelease.endDate || ''}
                    onChange={(e) => handleReleaseChange('endDate', e.target.value, true)}
                    className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                  />
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={handleSaveRelease}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 mr-2"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={handleCancelRelease}
                    className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                  >
                    Abbrechen
                  </button>
                </td>
              </tr>
            )}
            {releases.length === 0 && !newRelease && (
              <tr>
                <td colSpan={4} className="px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                  Keine Releases vorhanden
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Work Products pro Release */}
        {releases.map((release, index) => (
          <div key={index} className="mt-4">
            <h4 className="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">{release.name} - Work Products</h4>
            <WorkProductsSection
              workProducts={release.workProducts || []}
              setWorkProducts={(updatedWorkProducts) => handleWorkProductsSave(index, updatedWorkProducts)}
              availableWorkProducts={availableWorkProducts}
              onSave={(updatedWorkProducts) => handleWorkProductsSave(index, updatedWorkProducts)}
              showRegulatory={false}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ReleasesSection;