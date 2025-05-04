import { Release } from '../types';

export const handleEditRelease = (
  release: Release,
  setEditReleaseModal: (modal: {
    _id: string;
    name: string;
    plannedStartDate: string;
    plannedEndDate: string;
    version: { major: number; minor: number };
    abbreviation: string;
  } | null) => void
) => {
  setEditReleaseModal({
    _id: release._id!,
    name: release.name,
    plannedStartDate: release.plannedStartDate ? release.plannedStartDate.split('T')[0] : '',
    plannedEndDate: release.plannedEndDate ? release.plannedEndDate.split('T')[0] : '',
    version: release.version || { major: 1, minor: 0 },
    abbreviation: release.abbreviation,
  });
};

export const handleSaveEditedRelease = async (
  releaseId: string,
  updatedRelease: {
    _id: string;
    name: string;
    plannedStartDate: string;
    plannedEndDate: string;
    version: { major: number; minor: number };
    abbreviation: string;
  },
  setEditReleaseModal: (modal: {
    _id: string;
    name: string;
    plannedStartDate: string;
    plannedEndDate: string;
    version: { major: number; minor: number };
    abbreviation: string;
  } | null) => void,
  updateRelease: (releaseId: string, updatedRelease: Partial<Release>) => void
) => {
  if (updatedRelease) {
    await updateRelease(releaseId, updatedRelease);
    setEditReleaseModal(null);
  }
};