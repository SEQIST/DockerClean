import { parse } from 'papaparse';
import mammoth from 'mammoth';
import { ImportedData } from '../types/dataImportTypes';

export const parseCSV = (
  file: File,
  onSuccess: (data: ImportedData[]) => void,
  onError: (error: string) => void
) => {
  parse(file, {
    header: true,
    complete: (result) => {
      if (result.errors.length > 0) {
        onError(result.errors[0].message);
        return;
      }
      onSuccess(result.data);
    },
    error: (error) => {
      onError(error.message);
    },
  });
};

export const parseWord = (
  file: File,
  onSuccess: (data: ImportedData[]) => void,
  onError: (error: string) => void
) => {
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const { value: text } = await mammoth.extractRawText({ arrayBuffer });
      // Einfaches Parsing: Absätze als Einträge behandeln
      const paragraphs = text.split('\n\n').filter(p => p.trim()).map((p, index) => ({
        content: p.trim(),
      }));
      onSuccess(paragraphs);
    } catch (error) {
      onError((error as Error).message);
    }
  };
  reader.onerror = () => {
    onError('Fehler beim Lesen der Datei');
  };
  reader.readAsArrayBuffer(file);
};