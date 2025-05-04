export const calculateDuration = (activity, simulationData) => {
  //console.log('Simulation Data:', simulationData);
  //console.log('Activity Trigger Work Products:', activity.trigger?.workProducts);
  //console.log('First Work Product in Activity Trigger:', JSON.stringify(activity.trigger?.workProducts?.[0], null, 2));

  const triggerWp = simulationData.workProducts.find(wp => {
    const wpId = wp._id; // z. B. "67e1a632b5abb2fe1e56f6dc"
    const activityWp = activity.trigger?.workProducts?.[0];
    let activityWpId;

    if (activityWp && typeof activityWp === 'object') {
      // Extrahiere die ID aus der verschachtelten Struktur
      activityWpId = activityWp._id?._id || activityWp._id || activityWp.id;
      if (!activityWpId) {
     //   console.error('Konnte activityWpId nicht extrahieren aus:', JSON.stringify(activityWp, null, 2));
      }
    } else {
      activityWpId = activityWp; // Fallback für einfache IDs
    }

   // console.log(`Comparing Work Product IDs: wp._id=${wpId}, activityWpId=${activityWpId}`);
    return wpId === activityWpId;
  }) || { known: 0, unknown: 0 }; // Fallback, falls kein Match gefunden wird

  const knownCount = triggerWp.known || 0;
  const unknownCount = triggerWp.unknown || 0;
  //console.log(`Known Count: ${knownCount}, Unknown Count: ${unknownCount}`);

  let knownTimePerItem = parseFloat(activity.knownTime || 0);
  let estimatedTimePerItem = parseFloat(activity.estimatedTime || 0);
  const multiplicator = activity.multiplicator || 1;
  const executionMode = activity.executionMode || 'Parallel';
  const timeUnit = activity.timeUnit || 'Minutes';

  const role = activity.executedBy || {};
  const companyWorkHoursDay = role.company?.workHoursDay || 8;
  const companyMaxLoad = role.company?.maxLoad || 85;
  const workingHoursPerDay = role.maxWorkload || (companyWorkHoursDay * (companyMaxLoad / 100));
  const numRoles = role.numberOfHolders || 1;

  if (timeUnit === 'Hours') {
    knownTimePerItem *= 60;
    estimatedTimePerItem *= 60;
  } else if (timeUnit === 'Days') {
    knownTimePerItem *= workingHoursPerDay * 60;
    estimatedTimePerItem *= workingHoursPerDay * 60;
  }

  const calculatedMinutesKnown = knownCount * multiplicator * knownTimePerItem;
  const calculatedMinutesUnknown = unknownCount * multiplicator * estimatedTimePerItem;
  let totalMinutes = calculatedMinutesKnown + calculatedMinutesUnknown;

  if (totalMinutes === 0) {
    totalMinutes = (knownTimePerItem + estimatedTimePerItem) * multiplicator;
  }

  let totalHours = totalMinutes / 60;
  let durationDays;
  switch (executionMode) {
    case 'Parallel':
      durationDays = totalHours / workingHoursPerDay;
      break;
    case 'for each':
      durationDays = totalHours / (workingHoursPerDay * numRoles);
      break;
    default:
      durationDays = totalHours / workingHoursPerDay;
  }
  durationDays = Math.round(durationDays * 10) / 10;

  // console.log(`calculateDuration: Activity ${activity.name}, Minutes Known: ${calculatedMinutesKnown}, Minutes Unknown: ${calculatedMinutesUnknown}, Total Minutes: ${totalMinutes}, Total Hours: ${totalHours}, Duration Days: ${durationDays}, Execution Mode: ${executionMode}, Known Count: ${knownCount}, Unknown Count: ${unknownCount}, Working Hours Per Day: ${workingHoursPerDay}, Num Roles: ${numRoles}`);

  return { 
    durationDays, 
    totalHours, 
    knownHours: calculatedMinutesKnown / 60, 
    estimatedHours: calculatedMinutesUnknown / 60, 
    totalMinutes, 
    calculatedMinutesKnown, 
    calculatedMinutesUnknown, 
    workingHoursPerDay, 
    numRoles 
  };
};