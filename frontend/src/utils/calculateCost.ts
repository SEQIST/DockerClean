/**
 * Berechnet die Kosten einer Aktivität basierend auf der Gesamtzeit, der Anzahl der Rollen und dem Ausführungsmodus.
 * @param {Object} activity - Die Aktivität, für die die Kosten berechnet werden sollen.
 * @param {number} totalHours - Die Gesamtzeit in Stunden (nach Anpassung für For Each).
 * @param {number} numRoles - Die Anzahl der Rollen.
 * @param {string} executionMode - Der Ausführungsmodus ('parallel' oder 'foreach').
 * @param {number} originalTotalHours - Die ursprüngliche Gesamtzeit (vor Anpassung für For Each).
 * @returns {number} - Die berechneten Kosten.
 */
export const calculateCost = (activity, totalHours, numRoles, executionMode, originalTotalHours) => {
  const role = activity.executedBy || {};
  const roleCostPerHour = role.costPerHour || 105; // Standardwert, falls nicht definiert

 // console.log(`calculateCost: totalHours=${totalHours}, numRoles=${numRoles}, executionMode=${executionMode}, originalTotalHours=${originalTotalHours}, roleCostPerHour=${roleCostPerHour}`);

  let cost;
  switch (executionMode) {
    case 'parallel':
      // Kosten = Ursprüngliche Gesamtzeit * Kosten pro Rolle
      cost = originalTotalHours * roleCostPerHour;
      break;
    case 'foreach':
      // Kosten = Ursprüngliche Gesamtzeit * Kosten pro Rolle * Anzahl Rollen
      cost = originalTotalHours * roleCostPerHour * numRoles;
      break;
    default:
      cost = totalHours * roleCostPerHour;
  }

  //console.log(`calculateCost: Calculated cost=${cost}`);

  return cost;
};