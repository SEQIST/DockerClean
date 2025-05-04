import { checkStartConditions } from './checkStartConditions';
import { calculateCost } from './calculateCost';

/**
 * Berechnet die Projektaktivität mit Startzeiten, Dauern und Kosten basierend auf den Aktivitäten und Simulationsdaten.
 * @param {Array} activities - Array von Aktivitätsobjekten mit knownTime, estimatedTime, multiplicator, workMode, etc.
 * @param {Object} simulationData - Objekt mit workProducts (z. B. { workProducts: [{ name: 'WP1', known: 10, unknown: 10 }] }).
 * @param {Date} projectStartDate - Startdatum des Projekts (Standard: aktuelles Datum).
 * @param {String} processId - ID des Prozesses.
 * @param {Array} releases - Array von Releases (nicht verwendet in dieser Version).
 * @param {Number} plannedBudget - Geplantes Budget (nicht verwendet in dieser Version).
 * @returns {Object} - Objekt mit berechneten Aktivitäten, Ressourcenübersicht und Gesamtkosten.
 */
export const calculateProcess = async (activities, simulationData, projectStartDate = new Date(), processId = null, releases = [], plannedBudget = 0) => {
  console.log('calculateProcess: Starting calculation');
  console.log('calculateProcess: Activities:', activities);
  console.log('calculateProcess: Simulation Data:', simulationData);
  console.log('calculateProcess: Process ID:', processId);

  if (!activities || activities.length === 0) {
    console.error('calculateProcess: No activities provided');
    throw new Error('Keine Aktivitäten vorhanden.');
  }

  // Lösche alle bestehenden Einträge in den Tabellen (für Testzwecke)
  await fetch('http://localhost:5001/api/roleAvailabilityforCalculation', {
    method: 'DELETE',
  });
  await fetch('http://localhost:5001/api/activitySchedule', {
    method: 'DELETE',
  });
  await fetch('http://localhost:5001/api/roleUtilization', {
    method: 'DELETE',
  });

  // Initialisiere die Rollenverfügbarkeit
  const roleIds = [...new Set(activities.map(activity => activity.executedBy?._id || 'unknown'))];
  for (const roleId of roleIds) {
    await fetch('http://localhost:5001/api/roleAvailabilityforCalculation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roleId,
        availableFrom: projectStartDate.toISOString(),
        availableHoursPerDay: 3.68, // Standardwert, wird später überschrieben
        restrictedHoursPerDay: 0,
        restrictedUntil: null,
        processId,
      }),
    });
  }

  const calculatedActivities = []; // Ergebnisarray für die berechneten Aktivitäten
  const resourcesSummary = []; // Array für die Ressourcenübersicht
  let totalCost = 0; // Gesamtkosten der Simulation
  const workProductProgress = {}; // Speichert den Fortschritt der Work-Products (inkl. known und unknown)
  const unprocessedActivities = new Set(); // Verfolgt Aktivitäten, die nicht starten können

  const activityMap = activities.reduce((map, activity) => {
    map[activity._id] = activity;
    return map;
  }, {});

  const processed = new Set(); // Verfolgt bereits verarbeitete Aktivitäten
  const queue = [...activities]; // Starte mit allen Aktivitäten

  // Erstelle eine Abhängigkeitskarte
  const dependencies = new Map();
  activities.forEach((activity) => {
    dependencies.set(activity._id, new Set());
    if (activity.trigger?.workProducts?.length) {
      activity.trigger.workProducts.forEach((wp) => {
        const wpId = wp._id?._id || wp._id;
        const producingActivity = activities.find(a => (a.result?._id || a.result) === wpId);
        if (producingActivity) {
          dependencies.get(activity._id).add(producingActivity._id);
        }
      });
    }
  });

  console.log('calculateProcess: Dependencies:', dependencies);

  // Finde Aktivitäten ohne Vorgänger
  activities.forEach((activity) => {
    if (dependencies.get(activity._id).size === 0) {
      queue.push(activity);
    }
  });

  console.log('calculateProcess: Initial Queue:', queue);

  // Topologische Sortierung
  while (queue.length > 0) {
    const activity = queue.shift();
    if (!activity || processed.has(activity._id)) continue;

    // Prüfe Startbedingungen (Work Products)
    const { canStart, startTime: wpStartTime, latestPredecessorEndTime } = checkStartConditions(activity, calculatedActivities, activities, projectStartDate, simulationData);
    if (!canStart) {
      if (unprocessedActivities.has(activity._id)) {
        console.log(`calculateProcess: Aktivität ${activity.name} kann nicht starten, da die Work Product-Bedingungen nicht erfüllt sind.`);
        continue; // Überspringe die Aktivität, wenn sie bereits als nicht startbar markiert wurde
      }
      unprocessedActivities.add(activity._id);
      queue.push(activity); // Füge die Aktivität wieder zur Queue hinzu, um sie später erneut zu prüfen
      continue;
    }

    const roleId = activity.executedBy?._id || 'unknown';
    let startTime = wpStartTime;

    // Prüfe Rollenverfügbarkeit aus der MongoDB-Tabelle
    const roleAvailabilityResponse = await fetch(`http://localhost:5001/api/roleAvailabilityforCalculation/${roleId}`);
    const roleAvailability = await roleAvailabilityResponse.json();
    console.log(`calculateProcess: Role Availability for ${roleId}:`, roleAvailability);

    // Berechne das erstmögliche Datum, an dem die Rolle verfügbar ist
    const roleStartTime = roleAvailability.length > 0
      ? new Date(Math.max(...roleAvailability.map(entry => new Date(entry.availableFrom))))
      : new Date(projectStartDate);

    // Wähle die späteste Startzeit (Work Products oder Rollenverfügbarkeit)
    startTime = new Date(Math.max(startTime.getTime(), roleStartTime.getTime()));
    console.log(`Startzeit für ${activity.name} auf ${startTime} gesetzt (Work Products: ${wpStartTime}, Rolle: ${roleStartTime})`);

    // Zusätzliche Prüfung für "GF"-Aktivitäten: Sie dürfen nicht gleichzeitig starten
    if (activity.name.includes('GF')) {
      const gfActivities = calculatedActivities.filter(a => a.name.includes('GF') && a.role === roleId);
      if (gfActivities.length > 0) {
        const latestGfEndTime = new Date(Math.max(...gfActivities.map(a => new Date(a.end))));
        if (latestGfEndTime > startTime) {
          startTime = new Date(latestGfEndTime);
          console.log(`Rollenkonflikt für GF-Rolle bei ${activity.name}: Startzeit verschoben auf ${startTime}, da vorherige GF-Aktivität bis ${latestGfEndTime} läuft.`);
        }
      }
    }

    // Berechne Dauer
    let knownCount = 0;
    let unknownCount = 0;

    // Prüfe, ob die Aktivität einen Trigger-Work-Product hat
    if (activity.trigger?.workProducts?.length) {
      const wp = activity.trigger.workProducts[0];
      const wpId = wp._id?._id || wp._id;

      // Prüfe, ob der Work Product in den benutzerdefinierten Simulationdaten existiert
      const simWp = simulationData.workProducts.find(swp => swp._id === wpId);
      if (simWp) {
        knownCount = simWp.known || 0;
        unknownCount = simWp.unknown || 0;
      } else if (workProductProgress[wpId]) {
        // Wenn der Work Product nicht in den Simulationdaten ist, aber von einer vorherigen Aktivität erzeugt wurde
        knownCount = workProductProgress[wpId].known || 0;
        unknownCount = workProductProgress[wpId].unknown || 0;
      } else {
        console.log(`Work Product ${wpId} nicht in simulationData oder workProductProgress gefunden. Verwende Fallback.`);
        knownCount = 0;
        unknownCount = 0;
      }
    } else {
      console.log(`Aktivität ${activity.name} hat keinen Trigger-Work-Product. Verwende Fallback.`);
      knownCount = 0;
      unknownCount = 0;
    }

    console.log(`Aktivität ${activity.name}: Known Count=${knownCount}, Unknown Count=${unknownCount}`);

    // Setze die Zeit pro Item direkt aus der Aktivität
    const knownTimePerItem = parseFloat(activity.knownTime || 0);
    const estimatedTimePerItem = parseFloat(activity.estimatedTime || 0);
    const multiplicator = activity.multiplicator || 1;

    // Berechne die Gesamtminuten
    const calculatedMinutesKnown = knownCount * multiplicator * knownTimePerItem;
    const calculatedMinutesUnknown = unknownCount * multiplicator * estimatedTimePerItem;
    let totalMinutes = calculatedMinutesKnown + calculatedMinutesUnknown;

    // Fallback-Berechnung (vorübergehend, kann später entfernt werden)
    if (totalMinutes === 0) {
      totalMinutes = (knownTimePerItem + estimatedTimePerItem) * multiplicator;
    }

    // Konvertiere Minuten in Stunden
    let totalHours = totalMinutes / 60;
    const totalKnownHours = calculatedMinutesKnown / 60;
    const totalEstimatedHours = calculatedMinutesUnknown / 60;

    const role = activity.executedBy || {};
    // Verwende die verfügbaren Stunden pro Tag aus der Rolle (availableDailyHours)
    const workingHoursPerDay = parseFloat(role.availableDailyHours) || 3.68; // Verwende availableDailyHours anstatt dailyWorkload
    const numRoles = role.numberOfHolders || 1;
    const executionMode = (activity.executionMode || 'Parallel').toLowerCase(); // Konvertiere in Kleinbuchstaben

    console.log(`Aktivität ${activity.name}: Total Hours=${totalHours}, Werte: Num Roles=${numRoles}, Working Hours Per Day=${workingHoursPerDay}, Execution Mode=${executionMode}`);
    console.log(`Aktivität ${activity.name}: role.numberOfHolders=${role.numberOfHolders}, role=${JSON.stringify(role)}`);

    // Speichere die ursprüngliche Gesamtzeit für die Kostenberechnung
    const originalTotalHours = totalHours;

    // Berechne die Aufgewendeten Stunden und die Ausführungsdauer
    let spentHours = totalHours;
    let durationDays; // Hier wird durationDays mit let deklariert

    switch (executionMode) {
      case 'parallel':
        console.log('Entering Parallel mode');
        // Aufgewendete Stunden: Total Hours
        spentHours = totalHours;
        // Ausführungsdauer: Total Hours / (Verfügbare Zeit * Anzahl der Rollen)
        durationDays = totalHours / (workingHoursPerDay * numRoles);
        console.log(`Parallel: totalHours=${totalHours}, workingHoursPerDay=${workingHoursPerDay}, numRoles=${numRoles}, durationDays=${durationDays}`);
        break;
      case 'foreach':
        console.log('Entering ForEach mode');
        // Aufgewendete Stunden: Total Hours * Anzahl der Rollen
        spentHours = totalHours * numRoles;
        // Ausführungsdauer: Total Hours / Verfügbare Zeit
        durationDays = totalHours / workingHoursPerDay;
        // Total Hours für die Anzeige anpassen
        totalHours = spentHours;
        console.log(`For Each: totalHours=${totalHours}, spentHours=${spentHours}, workingHoursPerDay=${workingHoursPerDay}, numRoles=${numRoles}, durationDays=${durationDays}`);
        break;
      default:
        console.log('Entering Default mode');
        spentHours = totalHours;
        durationDays = totalHours / workingHoursPerDay;
        console.log(`Default: totalHours=${totalHours}, workingHoursPerDay=${workingHoursPerDay}, durationDays=${durationDays}`);
    }

    // Runde die Dauer auf 2 Dezimalstellen
    durationDays = Math.round(durationDays * 100) / 100;

    console.log(`calculateProcess: Aufgewendete Stunden für ${activity.name}: ${spentHours} Stunden`);
    console.log(`calculateProcess: Ausführungsdauer für ${activity.name}: ${durationDays} Tage`);

    // Berechne Endzeit korrekt
    let endTime = new Date(startTime);
    endTime.setDate(startTime.getDate() + Math.ceil(durationDays));
    console.log(`calculateProcess: Endzeit für ${activity.name}: ${endTime}`);

    // End time Conflict für "Ende" prüfen
    const isEnde = activity.name === 'Ende';
    if (isEnde && latestPredecessorEndTime && endTime < latestPredecessorEndTime) {
      console.log(`End time Conflict bei Aktivität ${activity.name}: Berechnetes Enddatum (${endTime}) ist früher als Vorgänger (${latestPredecessorEndTime})`);
      
      const timeForOneItemHours = (activity.knownTime || 0) + (activity.estimatedTime || 0);
      const timeForOneItemDays = Math.ceil(timeForOneItemHours / 3.87);

      endTime = new Date(latestPredecessorEndTime);
      endTime.setDate(endTime.getDate() + timeForOneItemDays);

      // Aktualisiere durationDays mit der neuen Dauer
      durationDays = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));

      console.log(`Neues Enddatum für ${activity.name}: ${endTime}, neue Dauer: ${durationDays} Tage`);
    }

    // Berechne Kosten
    const cost = calculateCost(activity, totalHours, numRoles, executionMode, originalTotalHours);
    const roundedCost = Math.round(cost * 100) / 100;

    // Work-Product-Fortschritt aktualisieren
    const wpId = activity.result?._id || activity.result;
    if (wpId) {
      // Berechne die Anzahl der erzeugten Items basierend auf der Aktivität
      const producedKnown = knownCount; // Vererbe die Anzahl der bekannten Items
      const producedUnknown = unknownCount; // Vererbe die Anzahl der unbekannten Items
      workProductProgress[wpId] = {
        start: startTime,
        duration: durationDays,
        known: producedKnown,
        unknown: producedUnknown
      };
      console.log(`Work Product ${wpId} erzeugt mit known=${producedKnown}, unknown=${producedUnknown}`);
    }

    calculatedActivities.push({
      id: activity._id,
      name: activity.name,
      start: startTime,
      end: endTime,
      role: roleId,
      duration: durationDays,
      knownDuration: totalKnownHours,
      estimatedDuration: totalEstimatedHours,
      cost: roundedCost,
      hasStartConflict: roleStartTime > wpStartTime,
      totalMinutes,
      minutesKnown: calculatedMinutesKnown,
      minutesUnknown: calculatedMinutesUnknown,
      totalHours,
      workingHoursPerDay,
      numRoles,
    });

    // Aktualisiere die Rollenverfügbarkeit in der MongoDB-Tabelle
    const roleAvailabilityUpdateResponse = await fetch(`http://localhost:5001/api/roleAvailabilityforCalculation/${roleAvailability[0]._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        availableFrom: endTime.toISOString(),
        availableHoursPerDay: roleAvailability[0].availableHoursPerDay,
        restrictedHoursPerDay: roleAvailability[0].restrictedHoursPerDay,
        restrictedUntil: roleAvailability[0].restrictedUntil,
        processId,
      }),
    });
    console.log(`calculateProcess: Role Availability Update Response for ${roleId}:`, await roleAvailabilityUpdateResponse.json());

    // Speichere die Aktivität in der ActivitySchedule-Tabelle
    await fetch('http://localhost:5001/api/activitySchedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityId: activity._id,
        roleId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationDays,
        processId,
      }),
    });

    // Füge nachfolgende Aktivitäten zur Queue hinzu
    activities.forEach((nextActivity) => {
      const nextDeps = dependencies.get(nextActivity._id);
      if (nextDeps && nextDeps.has(activity._id) && !processed.has(nextActivity._id)) {
        nextDeps.delete(activity._id);
        if (nextDeps.size === 0) {
          queue.push(nextActivity);
        }
      }
    });

    // Füge die Rolle zur Ressourcenübersicht hinzu
    if (activity.executedBy) {
      resourcesSummary.push({
        name: activity.executedBy.name || 'Unbekannt',
        hours: spentHours,
      });
    }

    // Addiere die Kosten zur Gesamtsumme
    totalCost += roundedCost;

    processed.add(activity._id);
  }

  // Protokolliere nicht startbare Aktivitäten
  if (unprocessedActivities.size > 0) {
    console.log('calculateProcess: Folgende Aktivitäten konnten nicht starten:', Array.from(unprocessedActivities).map(id => activityMap[id].name));
  }

  // Rückgabe des Ergebnisses im erwarteten Format
  return {
    calculatedActivities,
    resourcesSummary,
    totalCost,
  };
};