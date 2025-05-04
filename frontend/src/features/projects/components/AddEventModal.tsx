import React from 'react';
import { WorkProduct } from '../types';

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  newEventModal: {
    releaseId: string;
    name: string;
    startDate: string;
    workProduct: { workProduct: string | null; knownItems: number; unknownItems: number };
  } | null;
  setNewEventModal: (modal: AddEventModalProps['newEventModal']) => void;
  handleSaveNewEvent: () => void;
  workProducts: WorkProduct[];
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  open,
  onClose,
  newEventModal,
  setNewEventModal,
  handleSaveNewEvent,
  workProducts,
}) => {
  if (!open || !newEventModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Neues Event hinzufügen</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={newEventModal.name}
            onChange={(e) => setNewEventModal({ ...newEventModal, name: e.target.value })}
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            placeholder="Name"
          />
          <input
            type="date"
            value={newEventModal.startDate}
            onChange={(e) => setNewEventModal({ ...newEventModal, startDate: e.target.value })}
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
          />
          <select
            value={newEventModal.workProduct?.workProduct || ''}
            onChange={(e) =>
              setNewEventModal({
                ...newEventModal,
                workProduct: { ...newEventModal.workProduct, workProduct: e.target.value },
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
            value={newEventModal.workProduct?.knownItems || 0}
            onChange={(e) =>
              setNewEventModal({
                ...newEventModal,
                workProduct: { ...newEventModal.workProduct, knownItems: Number(e.target.value) },
              })
            }
            className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            placeholder="Known Items"
          />
          <input
            type="number"
            value={newEventModal.workProduct?.unknownItems || 0}
            onChange={(e) =>
              setNewEventModal({
                ...newEventModal,
                workProduct: { ...newEventModal.workProduct, unknownItems: Number(e.target.value) },
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
          <button onClick={handleSaveNewEvent} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;