import React from 'react';
import { Release } from '../types';

interface EditReleaseModalProps {
  open: boolean;
  onClose: () => void;
  editReleaseModal: {
    _id: string;
    name: string;
    plannedStartDate: string;
    plannedEndDate: string;
    version: { major: number; minor: number };
  } | null;
  setEditReleaseModal: (modal: EditReleaseModalProps['editReleaseModal']) => void;
  handleSaveEditedRelease: () => void;
}

const EditReleaseModal: React.FC<EditReleaseModalProps> = ({
  open,
  onClose,
  editReleaseModal,
  setEditReleaseModal,
  handleSaveEditedRelease,
}) => {
  if (!open || !editReleaseModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Release bearbeiten</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editReleaseModal.name}
            onChange={(e) => setEditReleaseModal({ ...editReleaseModal, name: e.target.value })}
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            placeholder="Name"
          />
          <input
            type="date"
            value={editReleaseModal.plannedStartDate}
            onChange={(e) => setEditReleaseModal({ ...editReleaseModal, plannedStartDate: e.target.value })}
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />
          <input
            type="date"
            value={editReleaseModal.plannedEndDate}
            onChange={(e) => setEditReleaseModal({ ...editReleaseModal, plannedEndDate: e.target.value })}
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />
          <input
            type="number"
            value={editReleaseModal.version.major}
            onChange={(e) =>
              setEditReleaseModal({
                ...editReleaseModal,
                version: { ...editReleaseModal.version, major: Number(e.target.value) },
              })
            }
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            placeholder="Version Major"
          />
          <input
            type="number"
            value={editReleaseModal.version.minor}
            onChange={(e) =>
              setEditReleaseModal({
                ...editReleaseModal,
                version: { ...editReleaseModal.version, minor: Number(e.target.value) },
              })
            }
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            placeholder="Version Minor"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Abbrechen
          </button>
          <button onClick={handleSaveEditedRelease} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditReleaseModal;