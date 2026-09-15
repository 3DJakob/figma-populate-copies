figma.showUI(__html__, { width: 420, height: 760, themeColors: true });

function getSelectionPayload() {
  const node = figma.currentPage.selection[0];
  if (!node) return { kind: 'empty' };

  const displayName = (key, property) => property.name || key.split('#')[0] || 'Unnamed property';

  const isInstance = node.type === 'INSTANCE';
  const definitions = 'componentPropertyDefinitions' in node
    ? node.componentPropertyDefinitions
    : {};
  const properties = isInstance
    ? Object.entries(node.componentProperties).map(([key, property]) => ({
        key,
        name: displayName(key, property),
        type: property.type,
        value: property.value,
        readonly: property.type === 'INSTANCE_SWAP'
      }))
    : Object.entries(definitions).map(([key, property]) => ({
        key,
        name: displayName(key, property),
        type: property.type,
        value: property.defaultValue,
        readonly: property.type === 'INSTANCE_SWAP'
      }));

  return {
    kind: isInstance ? 'instance' : 'component',
    nodeType: node.type,
    nodeName: node.name,
    nodeId: node.id,
    properties
  };
}

function sendSelection() {
  figma.ui.postMessage({ type: 'selection', payload: getSelectionPayload() });
}

figma.on('selectionchange', sendSelection);
sendSelection();

figma.ui.onmessage = (message) => {
  if (message.type === 'refresh-selection') {
    sendSelection();
    return;
  }

  if (message.type === 'populate') {
    const node = figma.currentPage.selection[0];
    if (!node || node.type !== 'INSTANCE') {
      figma.notify('Select an instance to populate copies.');
      return;
    }

    const rows = Array.isArray(message.rows) ? message.rows : [];
    const mappings = message.mappings || {};
    const validMappings = Object.entries(mappings).filter(([, column]) => column);
    if (!rows.length || !validMappings.length) {
      figma.notify('Add data and map at least one property.');
      return;
    }

    const parent = node.parent;
    if (!parent || !('appendChild' in parent)) {
      figma.notify('The selected instance cannot be duplicated here.');
      return;
    }

    const created = [];
    rows.forEach((row, index) => {
      const copy = node.clone();
      copy.name = `${node.name} · ${index + 1}`;
      validMappings.forEach(([propertyKey, column]) => {
        const value = row[column];
        const propertyEntry = Object.entries(copy.componentProperties).find(([key, property]) => key === propertyKey || property.name === propertyKey);
        if (value !== undefined && value !== null && propertyEntry) {
          copy.setProperties({ [propertyEntry[0]]: String(value) });
        }
      });
      created.push(copy);
    });

    const gap = 32;
    created.forEach((copy, index) => {
      copy.x = node.x + (node.width + gap) * (index + 1);
      copy.y = node.y;
    });
    figma.currentPage.selection = created;
    figma.viewport.scrollAndZoomIntoView([node, ...created]);
    figma.notify(`Created ${created.length} populated cop${created.length === 1 ? 'y' : 'ies'}.`);
  }
};
