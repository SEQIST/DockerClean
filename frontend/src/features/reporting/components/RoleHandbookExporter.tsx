import { useState } from 'react';
import { jsPDF } from 'jspdf';

interface RoleHandbookExporterProps {
  roleData: any;
}

const RoleHandbookExporter: React.FC<RoleHandbookExporterProps> = ({ roleData }) => {
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      let pageNumber = 1;

      const addHeaderFooter = () => {
        pdf.setFontSize(12);
        pdf.text(`Rollenhandbuch für ${roleData.name}`, 20, 10);
        pdf.text(new Date().toLocaleDateString(), pdfWidth - 40, 10, { align: 'right' });
        pdf.setFontSize(10);
        pdf.text(`Seite ${pageNumber}`, pdfWidth - 20, pdfHeight - 10, { align: 'right' });
      };

      addHeaderFooter();
      pdf.setFontSize(12);
      pdf.text(`Standort nicht angegeben, den ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(14);
      pdf.text('Generelle Beschreibung', 20, yPosition);
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.text('Die Rolle ist wie folgt beschrieben:', 20, yPosition);
      yPosition += 6;
      pdf.text(roleData.description || 'Keine Beschreibung verfügbar', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(14);
      pdf.text('Abteilung', 20, yPosition);
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.text(roleData.department?.name || 'N/A', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(14);
      pdf.text('Unternehmen', 20, yPosition);
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.text(typeof roleData.company === 'string' ? roleData.company : roleData.company?.name || 'N/A', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(14);
      pdf.text('Vorgesetzter', 20, yPosition);
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.text(roleData.supervisorRole?.name || 'N/A', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(14);
      pdf.text('Untergeordnete Rollen', 20, yPosition);
      yPosition += 8;
      if (roleData.subordinateRoles.length > 0) {
        roleData.subordinateRoles.forEach((subRole: any) => {
          pdf.setFontSize(12);
          pdf.text(subRole.name, 20, yPosition);
          yPosition += 6;

          if (yPosition > pdfHeight - 20) {
            pdf.addPage();
            pageNumber += 1;
            yPosition = 20;
            addHeaderFooter();
          }
        });
      } else {
        pdf.setFontSize(12);
        pdf.text('Keine untergeordneten Rollen vorhanden', 20, yPosition);
        yPosition += 10;
      }

      pdf.setFontSize(14);
      pdf.text('Auszuführende Tätigkeiten', 20, yPosition);
      yPosition += 8;

      if (roleData.activities.length > 0) {
        roleData.activities.forEach((activity: any) => {
          pdf.setFontSize(12);
          pdf.text(activity.name, 20, yPosition);
          yPosition += 6;

          pdf.text('Bei Eingang von:', 20, yPosition);
          yPosition += 6;
          if (activity.trigger?.workProducts?.length) {
            activity.trigger.workProducts.forEach((wp: any, idx: number) => {
              pdf.text(
                `${idx + 1}. ${wp._id?.name || wp._id} in einem Fertigstellungsgrad von ${wp.completionPercentage || 100}%`,
                25,
                yPosition
              );
              yPosition += 6;
            });
          } else {
            pdf.text('Keine Trigger vorhanden', 25, yPosition);
            yPosition += 6;
          }

          pdf.text('wird folgendes durchgeführt:', 20, yPosition);
          yPosition += 6;
          pdf.text(activity.description || 'Keine Beschreibung verfügbar', 20, yPosition);
          yPosition += 6;

          pdf.text('Das Ergebnis der Tätigkeit ist:', 20, yPosition);
          yPosition += 6;
          pdf.text(activity.result?.name || activity.result || 'Kein Ergebnis angegeben', 20, yPosition);
          yPosition += 10;

          if (yPosition > pdfHeight - 20) {
            pdf.addPage();
            pageNumber += 1;
            yPosition = 20;
            addHeaderFooter();
          }
        });
      } else {
        pdf.setFontSize(12);
        pdf.text('[Keine Aktivitäten verfügbar.]', 20, yPosition);
        yPosition += 10;
      }

      pdf.save(`${roleData.name}_role_handbook.pdf`);
      setExportError(null);
    } catch (err) {
      console.error('Fehler beim Exportieren des PDFs:', err);
      setExportError('Fehler beim Exportieren des PDFs. Bitte überprüfen Sie die Konsole für Details.');
    }
  };

  return (
    <div>
      {exportError && (
        <div className="mb-4 text-[#ef4444]">
          {exportError}
        </div>
      )}
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-[#2563eb] text-[#ffffff] rounded hover:bg-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
      >
        Als PDF exportieren
      </button>
    </div>
  );
};

export default RoleHandbookExporter;