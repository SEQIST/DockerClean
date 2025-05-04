// src/features/products/utils/flowUtils.js
export const convertToFlowElements = (endProduct, activities, roles, collapsedNodes = new Set(), showWorkProducts, showActivities, showRoles) => {
    console.log('convertToFlowElements - endProduct:', endProduct); // Debugging
    console.log('convertToFlowElements - activities:', activities); // Debugging
    console.log('convertToFlowElements - roles:', roles); // Debugging
  
    const nodes = [];
    const edges = [];
  
    // Root-Node (Endprodukt)
    const rootId = endProduct._id;
    nodes.push({
      id: rootId,
      type: 'custom',
      data: {
        id: rootId,
        workProduct: endProduct.name || 'N/A',
        activity: 'N/A',
        role: 'N/A',
        showWorkProducts,
        showActivities,
        showRoles,
        hasChildren: false,
      },
      position: { x: 800, y: 0 }, // Root ganz rechts
      style: { width: 200 },
    });
  
    // Aktivitäten, die dieses Work Product als Result haben
    const relatedActivities = activities.filter((activity) => {
      const resultId = activity.result?._id || activity.result;
      return resultId === rootId;
    });
  
    // Rekursiv Abhängigkeiten verarbeiten
    const processDependencies = (activity, parentId, level, yOffset) => {
      const nodeId = activity._id;
      const isCollapsed = collapsedNodes.has(nodeId);
  
      // Node für die Aktivität erstellen
      const executedByRole = roles.find((role) => role._id === (activity.executedBy?._id || activity.executedBy))?.name || 'Unbekannt';
      nodes.push({
        id: nodeId,
        type: 'custom',
        data: {
          id: nodeId,
          workProduct: endProduct.name || 'N/A',
          activity: activity.name || 'N/A',
          role: executedByRole,
          showWorkProducts,
          showActivities,
          showRoles,
          hasChildren: activity.trigger?.workProducts?.length > 0,
        },
        position: { x: 800 - (level + 1) * 250, y: yOffset }, // Von rechts nach links
        style: { width: 200 },
      });
  
      // Edge zum Parent hinzufügen
      edges.push({
        id: `e-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'step',
      });
  
      // Abhängigkeiten (Trigger-Work Products) verarbeiten, nur wenn nicht eingeklappt
      if (activity.trigger?.workProducts?.length > 0 && !isCollapsed) {
        const childHeight = activity.trigger.workProducts.length * 150;
        let currentYOffset = yOffset - childHeight / 2;
  
        activity.trigger.workProducts.forEach((wp) => {
          const wpId = wp._id?._id ? wp._id._id.toString() : wp._id.toString();
          const dependentActivities = activities.filter((act) => {
            const resultId = act.result?._id || act.result;
            return resultId === wpId;
          });
  
          dependentActivities.forEach((depActivity) => {
            processDependencies(depActivity, nodeId, level + 1, currentYOffset);
            currentYOffset += 150;
          });
        });
      }
    };
  
    // Alle Aktivitäten, die zum Endprodukt führen, verarbeiten
    const totalHeight = relatedActivities.length * 150;
    let currentYOffset = -totalHeight / 2;
    relatedActivities.forEach((activity) => {
      processDependencies(activity, rootId, 0, currentYOffset);
      currentYOffset += 150;
    });
  
    return { nodes, edges };
  };