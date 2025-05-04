import { WorkProduct } from '../../processes/services/processService';

const API_URL = 'http://localhost:5001/api/workproducts';

// Abrufen aller Work Products
export const fetchWorkProducts = async (): Promise<{ data: WorkProduct[] }> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Fehler beim Abrufen der Work Products');
  }
  const data: WorkProduct[] = await response.json();
  return { data };
};

// Erstellen eines neuen Work Products
export const createWorkProduct = async (workProduct: WorkProduct): Promise<{ data: WorkProduct }> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workProduct),
  });
  if (!response.ok) {
    throw new Error('Fehler beim Erstellen des Work Products');
  }
  const data: WorkProduct = await response.json();
  return { data };
};

// Aktualisieren eines bestehenden Work Products
export const updateWorkProduct = async (id: string, workProduct: WorkProduct): Promise<{ data: WorkProduct }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workProduct),
  });
  if (!response.ok) {
    throw new Error('Fehler beim Aktualisieren des Work Products');
  }
  const data: WorkProduct = await response.json();
  return { data };
};

// Löschen eines Work Products
export const deleteWorkProduct = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Fehler beim Löschen des Work Products');
  }
};