import { checkStartConditions } from './checkStartConditions';
import { calculateCost } from './calculateCost';
import { calculateDuration } from './calculateDuration';

interface WorkProductTrigger {
  _id: string;
  completionPercentage: number;
}

interface Activity {
  _id: string;
  name: string;
  process?: string;
  trigger?: {
    workProducts: WorkProductTrigger[];
  };
  result?: { _id: string } | string;
  executedBy?: { _id: string; name: string };
  knownTime: number;
  estimatedTime: number;
  multiplicator: number;
  compressor: 'multiply' | 'compress';
  executionMode: 'parallel' | 'forEach';
  workMode: 'Einer' | 'Jeder' | 'Geteilt';
}

interface Release {
  name: string;
  startDate: string;
  endDate: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  workProducts: { workProduct: string; knownItems: number; unknownItems: number }[];
}

interface SimulationData {
  workProducts: { _id: string; name: string; known: number; unknown: number }[];
}

interface CalculatedActivity {
  id: string;
  name: string;
  start: string;
  end: string;
  role: string;
  duration: number;
  knownDuration: number;
  estimatedDuration: number;
  cost: number;
  hasStartConflict: boolean;
  totalMinutes: number;
  minutesKnown: number;
  minutesUnknown: number;
  totalHours: number;
  workingHoursPerDay: number;
  numRoles: number;
  trigger: string;
  startConflict: string;
  dateConflict: string;
  budgetConflict: string;
  activityCostConflict: string;
  status: string;
  releaseId: string;
  releaseName: string;
  processId: string;
  processName: string;
  hasError?: boolean;
  warning?: string;
}

interface ResourceSummary {
  name: string;
  hours: number;
}

export const calculateProject = async (
  sortedActivities: Activity[],
  simulationData: SimulationData,
  projectStartDate: string,
  projectId: string,
  releases: Release[],
  plannedBudget: number | null
): Promise<{ calculatedActivities: CalculatedActivity[]; resourcesSummary: ResourceSummary[]; totalCost: number }> => {
  console.log('calculateProject - Eingabedaten:', {
    sortedActivities,
    simulationData,
    projectStartDate,
    projectId,
    releases,
    plannedBudget,
  });

  // Finde das früheste Startdatum der Releases
  const earliestReleaseStartDate = releases.reduce((earliest: Date, release: Release) => {
    const releaseStart = new Date(release.plannedStartDate || release.startDate);
    return releaseStart < earliest ? releaseStart : earliest;
  }, new Date(projectStartDate));

  console.log('Frühestes Release-Startdatum:', earliestReleaseStartDate);

  // Startdatum für die Simulation: Das früheste Release-Startdatum
  const simulationStartDate = new Date(earliestReleaseStartDate);
  simulationStartDate.setHours(0, 0, 0, 0);
  console.log('Simulationsstartdatum:', simulationStartDate);

  if (!sortedActivities || sortedActivities.length === 0) {
    console.error('calculateProject: No activities provided');
    throw new Error('Keine Aktivitäten vorhanden.');
  }

  // Initialisiere die Rollenverfügbarkeit
  const roleIds = [...new Set(sortedActivities.map(activity => activity.executedBy?._id || 'unknown'))];
  for (const roleId of roleIds) {
    // Lösche bestehende Rollenverfügbarkeiten für dieses Projekt, um sicherzustellen, dass wir bei simulationStartDate beginnen
    await fetch(`http://localhost:5001/api/roleAvailabilityforCalculation/project/${projectId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    // Initialisiere die Rollenverfügbarkeit ab simulationStartDate
    await fetch('http://localhost:5001/api/roleAvailabilityforCalculation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roleId,
        availableFrom: simulationStartDate.toISOString(),
        availableHoursPerDay: 3.68, // Standardwert
        restrictedHoursPerDay: 0,
        restrictedUntil: null,
        projectId,
      }),
    });
  }

  const calculatedActivities: CalculatedActivity[] = [];
  const resourcesSummary: ResourceSummary[] = [];
  let totalCost = 0;
  const workProductProgress: { [key: string]: { start: Date; duration: number; known: number; unknown: number } } = {};
  const unprocessedActivities = new Set<string>();

  const activityMap: { [key: string]: Activity } = sortedActivities.reduce((map: { [key: string]: Activity }, activity: Activity) => {
    map[activity._id] = activity;
    return map;
  }, {});

  const processed = new Set<string>();
  const queue: Activity[] = [];

  // Erstelle eine Abhängigkeitskarte
  const dependencies = new Map<string, Set<string>>();
  sortedActivities.forEach((activity: Activity) => {
    dependencies.set(activity._id, new Set());
    if (activity.trigger?.workProducts?.length) {
      activity.trigger.workProducts.forEach((wp: WorkProductTrigger) => {
        const wpId = wp._id;
        const producingActivity = sortedActivities.find(a => {
          const resultId = typeof a.result === 'string' ? a.result : a.result?._id;
          return resultId === wpId;
        });
        if (producingActivity) {
          dependencies.get(activity._id)!.add(producingActivity._id);
        }
      });
    }
  });

  console.log('calculateProject: Dependencies:', dependencies);

  // Finde Aktivitäten ohne Vorgänger
  sortedActivities.forEach((activity: Activity) => {
    if (dependencies.get(activity._id)!.size === 0) {
      queue.push(activity);
    }
  });

  console.log('calculateProject: Initial Queue:', queue);

  // Topologische Sortierung
  while (queue.length > 0) {
    const activity = queue.shift();
    if (!activity || processed.has(activity._id)) continue;

    // Prüfe Startbedingungen (Work Products)
    const { canStart, startTime: wpStartTime, latestPredecessorEndTime } = checkStartConditions(activity, calculatedActivities, sortedActivities, simulationStartDate, simulationData);
    let warning: string | undefined = undefined;

    if (!canStart) {
      if (unprocessedActivities.has(activity._id)) {
        console.log(`calculateProject: Aktivität ${activity.name} kann nicht starten, da die Work Product-Bedingungen nicht erfüllt sind.`);
        continue;
      }
      unprocessedActivities.add(activity._id);
      warning = `Warnung: Startbedingung für Aktivität ${activity.name} nicht erfüllt`;
      console.log(warning);
    }

    const roleId = activity.executedBy?._id || 'unknown';
    let startTime = wpStartTime;

    // Wenn die Aktivität keine Vorgänger hat, starte sie am simulationStartDate
    if (dependencies.get(activity._id)!.size === 0) {
      startTime = new Date(simulationStartDate);
      console.log(`Aktivität ${activity.name} hat keine Vorgänger, starte am Simulationsstartdatum: ${startTime}`);
    }

    // Prüfe Rollenverfügbarkeit aus der MongoDB-Tabelle
    const roleAvailabilityResponse = await fetch(`http://localhost:5001/api/roleAvailabilityforCalculation/${roleId}`);
    const roleAvailability = await roleAvailabilityResponse.json();
    console.log(`calculateProject: Role Availability for ${roleId}:`, roleAvailability);

    // Berechne das erstmögliche Datum, an dem die Rolle verfügbar ist
    const roleStartTime = roleAvailability.length > 0
      ? new Date(Math.max(...roleAvailability.map((entry: any) => new Date(entry.availableFrom).getTime())))
      : new Date(simulationStartDate);

    // Wähle die späteste Startzeit (Work Products oder Rollenverfügbarkeit)
    startTime = new Date(Math.max(startTime.getTime(), roleStartTime.getTime()));
    console.log(`Startzeit für ${activity.name} auf ${startTime} gesetzt (Work Products: ${wpStartTime}, Rolle: ${roleStartTime})`);

    // Zusätzliche Prüfung für "GF"-Aktivitäten: Sie dürfen nicht gleichzeitig starten
    if (activity.name.includes('GF')) {
      const gfActivities = calculatedActivities.filter((a: CalculatedActivity) => a.name.includes('GF') && a.role === roleId);
      if (gfActivities.length > 0) {
        const latestGfEndTime = new Date(Math.max(...gfActivities.map((a: CalculatedActivity) => new Date(a.end).getTime())));
        if (latestGfEndTime > startTime) {
          startTime = new Date(latestGfEndTime);
          console.log(`Rollenkonflikt für GF-Rolle bei ${activity.name}: Startzeit verschoben auf ${startTime}, da vorherige GF-Aktivität bis ${latestGfEndTime} läuft.`);
        }
      }
    }

    // Berechne Dauer
    let { durationDays, totalHours, knownHours, estimatedHours, totalMinutes, calculatedMinutesKnown, calculatedMinutesUnknown, workingHoursPerDay, numRoles } = calculateDuration(activity, simulationData);

    // Berechne Endzeit korrekt
    let endTime = new Date(startTime);
    endTime.setDate(startTime.getDate() + Math.ceil(durationDays));
    console.log(`calculateProject: Endzeit für ${activity.name}: ${endTime}`);

    // End time Conflict für "Ende" prüfen
    const isEnde = activity.name === 'Ende';
    if (isEnde && latestPredecessorEndTime && endTime < latestPredecessorEndTime) {
      console.log(`End time Conflict bei Aktivität ${activity.name}: Berechnetes Enddatum (${endTime}) ist früher als Vorgänger (${latestPredecessorEndTime})`);

      const timeForOneItemHours = (activity.knownTime || 0) + (activity.estimatedTime || 0);
      const timeForOneItemDays = Math.ceil(timeForOneItemHours / 3.87);

      endTime = new Date(latestPredecessorEndTime);
      endTime.setDate(endTime.getDate() + timeForOneItemDays);

      const newDurationDays = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
      durationDays = newDurationDays;

      console.log(`Neues Enddatum für ${activity.name}: ${endTime}, neue Dauer: ${durationDays} Tage`);
    }

    // Berechne Kosten
    const cost = calculateCost(activity, totalHours, numRoles, activity.executionMode || 'Parallel', totalHours);
    const roundedCost = Math.round(cost * 100) / 100;

    // Work-Product-Fortschritt aktualisieren
    const wpId = typeof activity.result === 'string' ? activity.result : activity.result?._id;
    if (wpId) {
      const producedKnown = simulationData.workProducts.find((wp: any) => wp._id === wpId)?.known || 0;
      const producedUnknown = simulationData.workProducts.find((wp: any) => wp._id === wpId)?.unknown || 0;
      workProductProgress[wpId] = {
        start: startTime,
        duration: durationDays,
        known: producedKnown,
        unknown: producedUnknown,
      };
      console.log(`Work Product ${wpId} erzeugt mit known=${producedKnown}, unknown=${producedUnknown}`);
    }

    // Finde den Prozess der Aktivität
    const processId = activity.process || 'unknown';
    const processName = processId !== 'unknown' ? `Prozess ${processId}` : 'Unbekannt';

    // Finde das Release für die Aktivität
    let releaseId = 'unknown';
    let releaseName = 'Unbekannt';
    for (const release of releases) {
      if (release.workProducts.some(wp => wp.workProduct === wpId)) {
        releaseId = release.name; // Verwende nur den Namen, da _id nicht immer vorhanden ist
        releaseName = release.name;
        break;
      }
    }

    calculatedActivities.push({
      id: activity._id,
      name: activity.name,
      start: startTime.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('.').reverse().join('-'),
      end: endTime.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('.').reverse().join('-'),
      role: roleId,
      duration: durationDays,
      knownDuration: knownHours,
      estimatedDuration: estimatedHours,
      cost: roundedCost,
      hasStartConflict: roleStartTime > wpStartTime,
      totalMinutes,
      minutesKnown: calculatedMinutesKnown,
      minutesUnknown: calculatedMinutesUnknown,
      totalHours,
      workingHoursPerDay,
      numRoles,
      trigger: activity.trigger && Array.isArray(activity.trigger.workProducts) && activity.trigger.workProducts.length > 0 ? 'Ja' : 'Nein',
      startConflict: roleStartTime > wpStartTime ? 'Startkonflikt' : 'Kein Konflikt',
      dateConflict: endTime > new Date(releases[0].plannedEndDate || releases[0].endDate) ? 'Datumskonflikt' : 'Kein Konflikt',
      budgetConflict: plannedBudget !== null && totalCost + roundedCost > plannedBudget ? 'Budgetkonflikt' : 'Kein Konflikt',
      activityCostConflict: plannedBudget !== null && roundedCost > (plannedBudget * 0.3) ? 'Hohe Kosten' : 'Kein Konflikt',
      status: (roleStartTime > wpStartTime || endTime > new Date(releases[0].plannedEndDate || releases[0].endDate) || (plannedBudget !== null && totalCost + roundedCost > plannedBudget)) ? 'Konflikt' : 'OK',
      hasError: !activity.trigger?.workProducts?.length || !canStart,
      warning: warning,
      releaseId,
      releaseName,
      processId,
      processName,
    });

    // Aktualisiere die Rollenverfügbarkeit in der MongoDB-Tabelle, nur wenn Einträge vorhanden sind
    if (roleAvailability.length > 0) {
      const roleAvailabilityUpdateResponse = await fetch(`http://localhost:5001/api/roleAvailabilityforCalculation/${roleAvailability[0]._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableFrom: endTime.toISOString(),
          availableHoursPerDay: roleAvailability[0].availableHoursPerDay,
          restrictedHoursPerDay: roleAvailability[0].restrictedHoursPerDay,
          restrictedUntil: roleAvailability[0].restrictedUntil,
          projectId,
        }),
      });
      console.log(`calculateProject: Role Availability Update Response for ${roleId}:`, await roleAvailabilityUpdateResponse.json());
    } else {
      console.warn(`Keine Rollenverfügbarkeit für Rolle ${roleId} gefunden. Überspringe Aktualisierung.`);
    }

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
        projectId,
      }),
    });

    // Füge nachfolgende Aktivitäten zur Queue hinzu
    sortedActivities.forEach((nextActivity: Activity) => {
      const nextDeps = dependencies.get(nextActivity._id);
      if (nextDeps && nextDeps.has(activity._id) && !processed.has(nextActivity._id)) {
        nextDeps.delete(activity._id);
        if (nextDeps.size === 0) {
          // Propagiere die Warnung an nachfolgende Aktivitäten
          if (warning) {
            console.log(`Warnung wird an nachfolgende Aktivität ${nextActivity.name} weitergegeben: ${warning}`);
          }
          queue.push(nextActivity);
        }
      }
    });

    // Füge die Rolle zur Ressourcenübersicht hinzu
    if (activity.executedBy) {
      resourcesSummary.push({
        name: activity.executedBy.name || 'Unbekannt',
        hours: totalHours,
      });
    }

    totalCost += roundedCost;
    processed.add(activity._id);
  }

  // Protokolliere nicht startbare Aktivitäten
  if (unprocessedActivities.size > 0) {
    console.log('calculateProject: Folgende Aktivitäten konnten nicht starten:', Array.from(unprocessedActivities).map((id: string) => activityMap[id].name));
  }

  return {
    calculatedActivities,
    resourcesSummary,
    totalCost,
  };
};