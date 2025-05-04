import axios from 'axios';

export const uploadPDF = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('/api/data-import/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Fehler beim Verarbeiten der PDF');
  }
};

export const uploadData = async (data: any[]): Promise<void> => {
  try {
    await axios.post('/api/data-import', { data });
  } catch (error) {
    throw new Error('Fehler beim Speichern der Daten');
  }
};