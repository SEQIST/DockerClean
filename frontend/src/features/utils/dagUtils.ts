/**
 * Erstellt einen Directed Acyclic Graph (DAG) basierend auf den Abhängigkeiten der Aktivitäten.
 * @param {Array} activities - Array von Aktivitäten.
 * @returns {Object} - DAG als Objekt, wobei jede Aktivität eine Liste ihrer Abhängigkeiten hat.
 */
export const buildDAG = (activities) => {
  const dag = {};
  const activityMap = new Map();

  // Erstelle eine Map von Aktivitäten und ihren Ergebnissen (Work Products, die sie produzieren)
  activities.forEach(activity => {
    dag[activity._id] = [];
    activityMap.set(activity._id, activity);
  });

  // Baue Abhängigkeiten auf
  activities.forEach(activity => {
    const triggerWorkProducts = activity.trigger?.workProducts?.map(wp => wp._id.toString()) || [];
    // Finde Aktivitäten, die diese Trigger-WPs produzieren
    activities.forEach(potentialDependency => {
      if (potentialDependency._id === activity._id) return; // Überspringe die gleiche Aktivität
      const producedWorkProduct = potentialDependency.result?._id?.toString();
      if (producedWorkProduct && triggerWorkProducts.includes(producedWorkProduct)) {
        dag[activity._id].push(potentialDependency._id);
      }
    });
  });

  return dag;
};

/**
 * Führt eine topologische Sortierung des DAG durch.
 * @param {Object} dag - Der Directed Acyclic Graph.
 * @returns {Array} - Array von Aktivitäts-IDs in topologischer Reihenfolge.
 */
export const topologicalSort = (dag) => {
  const sorted = [];
  const visited = new Set();
  const temp = new Set(); // Für Zyklenprüfung

  const visit = (node) => {
    if (temp.has(node)) throw new Error(`Zyklus erkannt bei Aktivität: ${node}`);
    if (visited.has(node)) return;

    temp.add(node);
    (dag[node] || []).forEach(dep => visit(dep));
    temp.delete(node);

    visited.add(node);
    sorted.push(node);
  };

  Object.keys(dag).forEach(node => visit(node));
  return sorted;
};