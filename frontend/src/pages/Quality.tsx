import React from "react";
import { Link } from "react-router-dom";
import PageMeta from "../components/common/PageMeta";
import AppLayout from "../layout/AppLayout";

export default function Quality() {
  return (
    <>
      <PageMeta
        title="Quality Management | SEQ.IST - Project Management Solution"
        description="Manage quality metrics in the SEQ.IST Project Management Solution"
      />
      <AppLayout>
        <div className="p-6">
          <Link to="/settings" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 inline-block">
            ← Zurück zu Einstellungen
          </Link>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Qualitätsmanagement
              </h3>
              <Link
                to="/settings/quality/add"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                Neue Qualitätsmetrik
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Metrik
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Beschreibung
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Zielwert
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Aktueller Wert
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-4 px-6 text-gray-800 dark:text-gray-200">Fehlerquote</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">Prozentsatz der Fehler pro Produktionseinheit</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">≤ 1%</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">0.8%</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">Erfüllt</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          Bearbeiten
                        </button>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-800 dark:text-gray-200">Lieferzeit</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">Durchschnittliche Zeit bis zur Auslieferung</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">≤ 3 Tage</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">4 Tage</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">Nicht erfüllt</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          Bearbeiten
                        </button>
                        <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}