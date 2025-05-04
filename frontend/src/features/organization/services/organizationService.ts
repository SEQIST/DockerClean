import { Company } from "../types/organization";

// Rückgabewert-Typ für fetchCompany
type FetchCompanyResult = Company | { error: string };

export const fetchCompany = async (): Promise<FetchCompanyResult> => {
  try {
    const response = await fetch("http://localhost:5001/api/company");
    if (!response.ok) {
      const errorMessage = `API-Fehler: ${response.status}`;
      console.log(errorMessage);
      return { error: "No company found" };
    }
    const data: Company = await response.json();
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    console.error("Fetch-Fehler:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const saveCompany = async (company: Company): Promise<Company> => {
  try {
    const response = await fetch("http://localhost:5001/api/company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(company),
    });
    if (!response.ok) {
      const errorMessage = `Fehler beim Speichern: ${response.status}`;
      throw new Error(errorMessage);
    }
    const data: Company = await response.json();
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    console.error("Speicherfehler:", errorMessage);
    throw new Error(errorMessage);
  }
};