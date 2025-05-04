import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Subsidiary } from "../types/organization";
import { useSubsidiaryCalculations } from "../hooks/useSubsidiaryCalculations";

const AddSubsidiaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [newSubsidiary, setNewSubsidiary] = useState<Partial<Subsidiary>>({
    name: "",
    location: "",
    type: "building",
    workHoursDay: 8,
    approvedHolidayDays: 0,
    publicHolidaysYear: 0,
    avgSickDaysYear: 0,
    workdaysWeek: 7,
    maxLoad: 85,
    country: "",
    timezone: "",
    currency: "EUR",
  });
  const calculatedValues = useSubsidiaryCalculations(newSubsidiary);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const searchParams = new URLSearchParams(location.search);
    const parentIdFromQuery = searchParams.get("parentId");
    const companyIdFromState = (location.state as { companyId?: string })?.companyId;

    setParentId(parentIdFromQuery);
    setCompanyId(companyIdFromState || null);

    if (!companyIdFromState) {
      fetch("http://localhost:5001/api/company")
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
          return r.json();
        })
        .then((data) => {
          setCompanyId(data?._id || null);
          setLoading(false);
        })
        .catch((error: Error) => {
          console.error("Fehler beim Laden der Daten:", error);
          setError(error.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [location]);

  const handleChange = (field: keyof Subsidiary, value: string | number) => {
    setNewSubsidiary((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = async () => {
    try {
      setError(null);
      if (!newSubsidiary.name) {
        throw new Error("Name ist erforderlich");
      }
      const payload = {
        ...newSubsidiary,
        companyId,
        parentId,
      };
      console.log("Sending payload to API:", payload);
      const response = await fetch("http://localhost:5001/api/company/subsidiaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fehler beim Hinzufügen des Standorts");
      }
      navigate("/settings/organization");
    } catch (error: any) {
      console.error("Fehler beim Hinzufügen des Standorts:", error);
      setError("Fehler beim Hinzufügen des Standorts: " + error.message);
    }
  };

  if (loading) return <div className="p-4 text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error && !newSubsidiary.name) return <div className="p-4 text-red-500 dark:text-red-400">{error}</div>;

  return (
    <>
      <PageMeta
        title="Add Subsidiary | SEQ.IST Demonstrator - React.js Admin Dashboard Template"
        description="Add a new subsidiary in the SEQ.IST Demonstrator dashboard"
      />
      <PageBreadcrumb pageTitle="Add Subsidiary" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
            Neuer Standort
          </h3>
          {error && <div className="p-4 text-red-500 dark:text-red-400 mb-4">{error}</div>}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newSubsidiary.name ?? ""}
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
                  value={newSubsidiary.location ?? ""}
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
                  value={newSubsidiary.country ?? ""}
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
                  value={newSubsidiary.timezone ?? ""}
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
                  value={newSubsidiary.currency ?? "EUR"}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Typ
                </label>
                <select
                  value={newSubsidiary.type ?? "building"}
                  onChange={(e) => handleChange("type", e.target.value as "building" | "department")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="building">Gebäude</option>
                  <option value="department">Abteilung</option>
                </select>
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
                    value={newSubsidiary.workHoursDay ?? 8}
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
                    value={newSubsidiary.approvedHolidayDays ?? 0}
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
                    value={newSubsidiary.publicHolidaysYear ?? 0}
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
                    value={newSubsidiary.avgSickDaysYear ?? 0}
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
                    value={newSubsidiary.workdaysWeek ?? 7}
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
                    value={newSubsidiary.maxLoad ?? 85}
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
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => navigate("/settings/organization")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddSubsidiaryPage;