import { Event } from '../types';

export const handleAddEvent = (
  releaseId: string,
  setNewEventModal: (modal: {
    releaseId: string;
    name: string;
    startDate: string;
    workProduct: { workProduct: string | null; knownItems: number; unknownItems: number };
  } | null) => void
) => {
  setNewEventModal({
    releaseId,
    name: '',
    startDate: '',
    workProduct: { workProduct: null, knownItems: 0, unknownItems: 0 },
  });
};

export const handleSaveNewEvent = async (
  newEventModal: {
    releaseId: string;
    name: string;
    startDate: string;
    workProduct: { workProduct: string | null; knownItems: number; unknownItems: number };
  } | null,
  setNewEventModal: (modal: {
    releaseId: string;
    name: string;
    startDate: string;
    workProduct: { workProduct: string | null; knownItems: number; unknownItems: number };
  } | null) => void,
  addEvent: (event: Event) => void,
  projectId: string,
  setError: (error: string | null) => void
) => {
  if (newEventModal) {
    if (!newEventModal.name) {
      setError('Bitte geben Sie einen Namen für das Event ein.');
      return;
    }
    const newEvent: Event = {
      name: newEventModal.name,
      startDate: newEventModal.startDate || null,
      workProduct: newEventModal.workProduct?.workProduct
        ? {
            workProduct: newEventModal.workProduct.workProduct,
            knownItems: Number(newEventModal.workProduct.knownItems) || 0,
            unknownItems: Number(newEventModal.workProduct.unknownItems) || 0,
          }
        : null,
      release: newEventModal.releaseId,
      project: projectId,
    };
    await addEvent(newEvent);
    setNewEventModal(null);
  }
};

export const handleEditEvent = (
  event: Event,
  setEditEventModal: (modal: {
    _id: string;
    name: string;
    startDate: string;
    workProduct: { workProduct: string | null; knownItems: number; unknownItems: number };
  } | null) => void
) => {
  setEditEventModal({
    _id: event._id,
    name: event.name,
    startDate: event.startDate ? event.startDate.split('T')[0] : '',
    workProduct: event.workProduct || { workProduct: null, knownItems: 0, unknownItems: 0 },
  });
};

export const handleSaveEditedEvent = async (
  editEventModal: {
    _id: string;
    name: string;
    startDate: string;
    workProduct: { workProduct: string | null; knownItems: number; unknownItems: number };
  } | null,
  setEditEventModal: (modal: {
    _id: string;
    name: string;
    startDate: string;
    workProduct: { workProduct: string | null; knownItems: number; unknownItems: number };
  } | null) => void,
  updateEvent: (eventId: string, updatedEvent: Partial<Event>) => void,
  setError: (error: string | null) => void
) => {
  if (editEventModal) {
    if (!editEventModal.name) {
      setError('Bitte geben Sie einen Namen für das Event ein.');
      return;
    }
    const updatedEvent: Partial<Event> = {
      ...editEventModal,
      startDate: editEventModal.startDate || null,
      workProduct: editEventModal.workProduct?.workProduct
        ? {
            workProduct: editEventModal.workProduct.workProduct,
            knownItems: Number(editEventModal.workProduct.knownItems) || 0,
            unknownItems: Number(editEventModal.workProduct.unknownItems) || 0,
          }
        : null,
    };
    await updateEvent(editEventModal._id, updatedEvent);
    setEditEventModal(null);
  }
};