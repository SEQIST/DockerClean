/**
 * Prüft, ob alle Trigger-Bedingungen einer Aktivität erfüllt sind.
 * @param {Object} activity - Die Aktivität, deren Bedingungen geprüft werden sollen.
 * @param {Array} calculatedActivities - Bereits berechnete Aktivitäten.
 * @param {Array} activities - Alle Aktivitäten.
 * @param {Date} projectStartDate - Startdatum des Projekts.
 * @param {Object} simulationData - Simulationsdaten.
 * @returns {Object} - { canStart: boolean, startTime: Date, latestPredecessorEndTime: Date }
 */
export const checkStartConditions = (activity, calculatedActivities, activities, projectStartDate, simulationData) => {
  //console.log(`checkStartConditions: Checking triggers for ${activity.name}`);
  let startTime = new Date(projectStartDate);
  let latestPredecessorEndTime = null;
  let allConditionsMet = true;

  if (activity.trigger?.workProducts?.length) {
    let latestStartTime = startTime;

    for (const wp of activity.trigger.workProducts) {
      const wpId = wp._id?._id || wp._id;
      const requiredCompletion = wp.completionPercentage || 100;

      //console.log(`checkStartConditions: Checking WP ${wpId} with required completion ${requiredCompletion}%`);

      // Prüfe, ob das Work Product in simulationData vorhanden ist
      const simWp = simulationData.workProducts.find(w => w._id === wpId);
      if (simWp) {
        // Wenn das Work Product in simulationData vorhanden ist, ist es 100% fertig
        //console.log(`checkStartConditions: WP ${wpId} found in simulationData, assuming 100% completion`);
        continue;
      }

      const producingActivity = activities.find(a => (a.result?._id || a.result) === wpId);
      if (producingActivity && calculatedActivities.find(a => a.id === producingActivity._id)) {
        const prodActivity = calculatedActivities.find(a => a.id === producingActivity._id);
        let completionDate;

        if (requiredCompletion === 100) {
          // Wenn 100% Fortschritt erforderlich ist, muss die produzierende Aktivität vollständig abgeschlossen sein
          completionDate = new Date(prodActivity.end);
        } else {
          // Berechne das Datum, an dem der erforderliche Fortschritt erreicht wird
          const durationDays = prodActivity.duration;
          const daysToCompletion = (requiredCompletion / 100) * durationDays;
          completionDate = new Date(prodActivity.start);
          completionDate.setDate(completionDate.getDate() + daysToCompletion);
        }

        //console.log(`checkStartConditions: Aktivität ${activity.name}: WP ${wpId} benötigt ${requiredCompletion}%, erreicht am ${completionDate}`);
        if (completionDate > latestStartTime) {
          latestStartTime = completionDate;
        }
        if (!latestPredecessorEndTime || prodActivity.end > latestPredecessorEndTime) {
          latestPredecessorEndTime = new Date(prodActivity.end);
        }
      } else {
        // Wenn die produzierende Aktivität nicht gefunden oder noch nicht berechnet wurde, kann die Aktivität nicht starten
        //console.log(`checkStartConditions: Condition not met for WP ${wpId}, producing activity not found or not calculated`);
        allConditionsMet = false;
        break;
      }
    }

    if (allConditionsMet) {
      startTime = latestStartTime > startTime ? latestStartTime : startTime;
      //console.log(`checkStartConditions: Startzeit für ${activity.name} auf ${startTime} gesetzt (Trigger)`);
    }
  }

  return { canStart: allConditionsMet, startTime, latestPredecessorEndTime };
};