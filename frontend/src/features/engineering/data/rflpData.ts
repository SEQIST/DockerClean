// features/engineering/data/rflpData.js
export const rflpData = {
    project: {
      id: "project-1",
      name: "Projekt 1",
      requirements: [
        {
          id: "req-1",
          name: "Story 1",
          type: "Story",
          classification: "Projektspezifisch",
          description: "Als Benutzer möchte ich Fotos aufnehmen können.",
          trace: [], // Verknüpfungen zu Funktionen
        },
        {
          id: "req-2",
          name: "Use Case 1",
          type: "Use Case",
          classification: "Standard",
          description: "Das System soll Bilder speichern können.",
          trace: [],
        },
      ],
      functional: [
        {
          id: "func-1",
          name: "Fotos aufnehmen",
          parentId: null,
          trace: ["req-1"], // Verknüpfung zu Story 1
          subFunctions: [
            {
              id: "func-1-1",
              name: "Kamera aktivieren",
              trace: ["req-1"],
            },
            {
              id: "func-1-2",
              name: "Bild speichern",
              trace: ["req-2"],
            },
          ],
        },
      ],
      logical: [
        {
          id: "logic-1",
          name: "Kamera-Controller",
          parentId: null,
          trace: ["func-1"], // Verknüpfung zu Funktion "Fotos aufnehmen"
          subLogics: [
            {
              id: "logic-1-1",
              name: "Kamera-Sensor",
              trace: ["func-1-1"],
            },
            {
              id: "logic-1-2",
              name: "Speicher-Modul",
              trace: ["func-1-2"],
            },
          ],
        },
      ],
      physical: [
        {
          id: "phys-1",
          name: "Kamera-Hardware",
          parentId: null,
          trace: ["logic-1"], // Verknüpfung zu Kamera-Controller
          subPhysicals: [
            {
              id: "phys-1-1",
              name: "CMOS-Sensor",
              trace: ["logic-1-1"],
            },
            {
              id: "phys-1-2",
              name: "SSD-Speicher",
              trace: ["logic-1-2"],
            },
          ],
        },
      ],
    },
  };