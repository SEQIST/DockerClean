/**
 * Prüft die Verfügbarkeit der Rolle und passt die Startzeit an.
 * @param {Object} activity - Die Aktivität.
 * @param {Date} startTime - Der vorgeschlagene Startzeitpunkt.
 * @param {Object} roleAvailability - Verfügbarkeit der Rollen.
 * @returns {Date} - Angepasste Startzeit.
 */
export const checkRoleAvailability = (activity, startTime, roleAvailability) => {
    const roleId = activity.executedBy?._id || 'unknown';
    if (roleAvailability[roleId]) {
      const lastEndTime = roleAvailability[roleId].sort((a, b) => b.endTime - a.endTime)[0]?.endTime;
      if (lastEndTime && lastEndTime > startTime) {
        startTime = new Date(lastEndTime);
        console.log(`checkRoleAvailability: Startzeit-Konflikt für Rolle ${roleId}, verschoben auf ${startTime}`);
      }
    }
    return startTime;
  };