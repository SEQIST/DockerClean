// src/features/products/utils/exportUtils.js
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export const exportToWord = (selectedEntity, results, selectedFields, selectedDependencies, dependencyFields) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Abfrage: ${selectedEntity}`,
                bold: true,
                size: 24,
              }),
            ],
          }),
          ...results.flatMap((result, index) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Eintrag ${index + 1}`,
                  bold: true,
                  size: 20,
                }),
              ],
            }),
            ...selectedFields.map(field => new Paragraph({
              children: [
                new TextRun({
                  text: `${field}: ${result[field]}`,
                  size: 20,
                }),
              ],
            })),
            ...selectedDependencies.flatMap(dep => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: dep,
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
              ...(result[dep] || []).map((depItem, depIndex) => new Paragraph({
                children: [
                  new TextRun({
                    text: `  - ${(dependencyFields[dep] || []).map(field => `${field}: ${depItem[field]}`).join(', ')}`,
                    size: 20,
                  }),
                ],
              })),
            ]),
          ]),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `${selectedEntity}_Abfrage.docx`);
  });
};