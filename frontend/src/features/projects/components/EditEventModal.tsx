import React from 'react';
import { WorkProduct } from '../types';

interface EditEventModalProps {
  open: boolean;
  onClose: () => void;
  editEventModal: {
    _id: string;
    name: string;
    startDate: string;
    workProduct: { workProduct: string | null; knownItems: number; unknownItems: number };
  } | null;
  setEditEventModal: (modal: EditEventModalProps['editEventModal']) => void;
  handleSaveEditedEvent: () => void;
  workProducts: WorkProduct[];
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  open,
  onClose,
  editEventModal,
  setEditEventModal,
  handleSaveEditedEvent,
  workProducts,
}) => {
  if (!open || !editEventModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Event bearbeiten</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editEventModal.name}
            onChange={(e) => setEditEventModal({ ...editEventModal, name: e.target.value })}
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            placeholder="Name"
          />
          <input
            type="date"
            value={editEventModal.startDate}
            onChange={(e) => setEditEventModal({ ...editEventModal, startDate: e.target.value })}
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />
          <select
            value={editEventModal.workProduct?.workProduct || ''}
            onChange={(e) =>
              setEditEventModal({
                ...editEventModal,
                workProduct: { ...editEventModal.workProduct, workProduct: e.target.value },
              })
            }
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          >
            <option value="">Kein Work Product</option>
            {workProducts.map((wp) => (
              <option key={wp._id} value={wp._id}>
                {wp.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={editEventModal.workProduct?.knownItems || 0}
            onChange={(e) =>
              setEditEventModal({
                ...editEventModal,
                workProduct: { ...editEventModal.workProduct, knownItems: Number(e.target.value) },
              })
            }
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            placeholder="Known Items"
          />
          <input
            type="number"
            value={editEventModal.workProduct?.unknownItems || 0}
            onChange={(e) =>
              setEditEventModal({
                ...editEventModal,
                workProduct: { ...editEventModal.workProduct, unknownItems: Number(e.target.value) },
              })
            }
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            placeholder="Unknown Items"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Abbrechen
          </button>
          <button onClick={handleSaveEditedEvent} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;