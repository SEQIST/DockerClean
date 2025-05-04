import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Company } from "../types/organization";
import { cleanSubsidiary } from "../utils/organizationUtils";
import { useSubsidiaryCalculations } from "../hooks/useSubsidiaryCalculations";

const EditCompanyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const calculatedValues = useSubsidiaryCalculations(company ?? {});

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:5001/api/company")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      })
      .then((data: Company) => {
        if (!data || data._id.toString() !== id) throw new Error("Company not found");

        const updatedCompany: Company = {
          ...data,
          country: data.country || "",
          timezone: data.timezone || "",
          currency: data.currency || "EUR",
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };

        setCompany(updatedCompany);
        setLoading(false);
      })
      .catch((error: Error) => {
        console.error("Fehler beim Laden der Daten:", error);
        setError(error.message);
        setCompany(null);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (field: keyof Company, value: string | number) => {
    setCompany((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
    try {
      if (!company?.name) throw new Error("Name ist erforderlich");
      const cleanedCompany: Company = {
        ...company,
        subsidiaries: company.subsidiaries.map((sub) => cleanSubsidiary(sub)),
      };
      const response = await fetch(`http://localhost:5001/api/company/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedCompany),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fehler beim Speichern der Firma");
      }
      navigate("/organization");
    } catch (error: any) {
      console.error("Fehler beim Speichern der Firma:", error);
      setError("Fehler beim Speichern der Firma: " + error.message);
    }
  };

  if (loading) return <div className="p-4 text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 dark:text-red-400">{error}</div>;
  if (!company) return <div className="p-4 text-red-500 dark:text-red-400">Firma nicht gefunden.</div>;

  return (
    <>
      <PageMeta
        title="Edit Company | SEQ.IST Demonstrator - React.js Admin Dashboard Template"
        description="Edit the company in the SEQ.IST Demonstrator dashboard"
      />
      <PageBreadcrumb pageTitle="Edit Company" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
            Firma bearbeiten
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={company.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Standort
                </label>
                <input
                  type="text"
                  value={company.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Land
                </label>
                <input
                  type="text"
                  value={company.country || ""}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Zeitzone
                </label>
                <input
                  type="text"
                  value={company.timezone || ""}
                  onChange={(e) => handleChange("timezone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Währung
                </label>
                <input
                  type="text"
                  value={company.currency || "EUR"}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                Arbeitszeit bestimmende Faktoren
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stunden/Tag
                  </label>
                  <input
                    type="number"
                    value={company.workHoursDay || 0}
                    onChange={(e) => handleChange("workHoursDay", Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Urlaubstage
                  </label>
                  <input
                    type="number"
                    value={company.approvedHolidayDays || 0}
                    onChange={(e) =>
                      handleChange("approvedHolidayDays", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Feiertage/Jahr
                  </label>
                  <input
                    type="number"
                    value={company.publicHolidaysYear || 0}
                    onChange={(e) =>
                      handleChange("publicHolidaysYear", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Krankheitstage
                  </label>
                  <input
                    type="number"
                    value={company.avgSickDaysYear || 0}
                    onChange={(e) =>
                      handleChange("avgSickDaysYear", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Arbeits-Tage/Woche
                  </label>
                  <input
                    type="number"
                    value={company.workdaysWeek || 0}
                    onChange={(e) => handleChange("workdaysWeek", Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max. Belastung (%)
                  </label>
                  <input
                    type="number"
                    value={company.maxLoad || 0}
                    onChange={(e) => handleChange("maxLoad", Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                Berechnete Werte
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tage/Jahr
                  </label>
                  <input
                    type="number"
                    value={calculatedValues.workdaysYear.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tage/Monat
                  </label>
                  <input
                    type="number"
                    value={calculatedValues.workdaysMonth.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stunden/Jahr
                  </label>
                  <input
                    type="number"
                    value={calculatedValues.workHoursYear.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stunden/Jahr (Max)
                  </label>
                  <input
                    type="number"
                    value={calculatedValues.workHoursYearMaxLoad.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stunden/Tag (Max)
                  </label>
                  <input
                    type="number"
                    value={calculatedValues.workHoursDayMaxLoad.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stunden/Arbeitstag
                  </label>
                  <input
                    type="number"
                    value={calculatedValues.workHoursWorkday.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-200"
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                Metadaten
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Erstellt am
                  </label>
                  <input
                    type="text"
                    value={new Date(company.createdAt).toLocaleString()}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zuletzt aktualisiert
                  </label>
                  <input
                    type="text"
                    value={new Date(company.updatedAt).toLocaleString()}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-200"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => navigate("/organization")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditCompanyPage;