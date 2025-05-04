// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const RegulatoryISO = require('../models/RegulatoryISO');
const RegulatoryContent = require('../models/RegulatoryContent');
const EngineeringStandard = require('../models/engineeringStandard');
const EngineeringContent = require('../models/engineeringContent');

const upload = multer({ storage: multer.memoryStorage() });

// Hilfsfunktion: Prüft, ob eine Zeile in Title Case geschrieben ist
const isTitleCase = (line) => {
  if (!line) return false;
  const words = line.split(/\s+/);
  if (words.length === 0) return false;
  return words.every(word => {
    if (word.length <= 2) return true; // Ignoriere kurze Wörter wie "and", "or"
    return word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase();
  });
};

router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload-Endpunkt erreicht');
    console.log('Empfangene Datei:', req.file);
    if (!req.file) {
      console.log('Keine Datei hochgeladen');
      return res.status(400).json({ message: 'Keine Datei hochgeladen' });
    }

    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;
    console.log('Dateityp:', fileType);
    let text = '';

    if (fileType === 'application/pdf') {
      console.log('Verarbeite PDF-Datei');
      const data = await pdfParse(fileBuffer);
      text = data.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('Verarbeite .docx-Datei');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } else if (fileType === 'application/msword') {
      console.log('Verarbeite .doc-Datei (Dummy-Antwort)');
      text = 'Inhalt von .doc-Datei (nicht verarbeitet)';
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      console.log('Verarbeite .xlsx-Datei');
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      text = XLSX.utils.sheet_to_txt(sheet);
    } else {
      console.log('Nicht unterstützter Dateityp:', fileType);
      return res.status(400).json({ message: 'Nur PDF, Word (.docx, .doc) und Excel (.xlsx) Dateien sind erlaubt' });
    }

    console.log('Extrahierter Text:', text);

    const isEngineering = req.body.context === 'engineering';
    console.log('Kontext:', isEngineering ? 'Engineering' : 'Regulatory');
    let standard;
    if (isEngineering) {
      standard = new EngineeringStandard({
        name: req.file.originalname,
        description: 'Eingelesen aus Datei',
        source: req.file.originalname,
      });
    } else {
      standard = new RegulatoryISO({
        name: req.file.originalname,
        description: 'Eingelesen aus Datei',
        source: req.file.originalname,
      });
    }
    const savedStandard = await standard.save();
    console.log('Standard gespeichert:', savedStandard);

    // Verbesserte Kapitel-Erkennung
    const lines = text.split('\n');
    const contents = [];
    let currentChapter = null;
    let currentParagraph = [];

    for (let i = 0; i < lines.length; i++) {
      const trimmedLine = lines[i].trim();

      // Erkenne Kapitel (Überschriften)
      const isNumberedHeading = /^\d+(\.\d+)*\s/.test(trimmedLine); // Nummerierte Überschriften (z. B. 1., 1.1.)
      const isUpperCase = trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 0; // Komplett Großbuchstaben
      const isTitleCaseHeading = isTitleCase(trimmedLine) && trimmedLine.length < 30; // Title Case und nicht zu lang
      const isShortLine = trimmedLine.length > 0 && trimmedLine.length < 30; // Kurze Zeile
      const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
      const isFollowedByEmptyLine = nextLine === ''; // Nächste Zeile ist leer

      // Kapitel erkannt, wenn:
      // - Nummerierte Überschrift (z. B. 1., 1.1.)
      // - Komplett in Großbuchstaben (z. B. SEQ IST)
      // - Title Case und kurz (z. B. Description, Basic Method)
      // - Gefolgt von einer Leerzeile
      if (
        isNumberedHeading ||
        isUpperCase ||
        (isTitleCaseHeading && isShortLine) ||
        (isShortLine && isFollowedByEmptyLine)
      ) {
        // Wenn wir einen Absatz gesammelt haben, speichern wir ihn
        if (currentParagraph.length > 0) {
          const paragraphText = currentParagraph.join(' ').trim();
          if (paragraphText) {
            contents.push({
              [isEngineering ? 'engineeringStandard' : 'regulatoryISO']: savedStandard._id,
              text: paragraphText,
              type: 'Information',
              createdAt: new Date(),
            });
          }
          currentParagraph = [];
        }

        // Kapitel erkannt
        currentChapter = trimmedLine;
        contents.push({
          [isEngineering ? 'engineeringStandard' : 'regulatoryISO']: savedStandard._id,
          text: trimmedLine,
          type: 'Header',
          createdAt: new Date(),
        });
      } else if (trimmedLine.length > 0) {
        // Abschnitt erkannt
        if (currentChapter) {
          currentParagraph.push(trimmedLine);
          const isLastLine = i === lines.length - 1;
          if (isLastLine || nextLine === '' || /^\d+(\.\d+)*\s/.test(nextLine) || nextLine === nextLine.toUpperCase() || (isTitleCase(nextLine) && nextLine.length < 30)) {
            const paragraphText = currentParagraph.join(' ').trim();
            if (paragraphText) {
              contents.push({
                [isEngineering ? 'engineeringStandard' : 'regulatoryISO']: savedStandard._id,
                text: paragraphText,
                type: 'Information',
                createdAt: new Date(),
              });
            }
            currentParagraph = [];
          }
        }
      }
    }

    console.log('Inhaltselemente erstellt:', contents);
    let savedContents;
    if (isEngineering) {
      savedContents = await EngineeringContent.insertMany(contents);
    } else {
      savedContents = await RegulatoryContent.insertMany(contents);
    }
    console.log('Inhaltselemente gespeichert:', savedContents);

    res.status(200).json({
      message: 'Datei erfolgreich verarbeitet',
      [isEngineering ? 'engineeringStandard' : 'regulatoryISO']: savedStandard,
      contents: savedContents,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Fehler beim Verarbeiten der Datei', error: error.message });
  }
});

module.exports = router;