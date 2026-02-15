
import { SPOKE_TYPES } from '../data/constants';

/**
 * Generates a bundle of related resources based on the selected topology.
 * @param {Object} resource - The main resource object.
 * @param {string} topology - The selected topology ('single', 'hub-spoke', 'bundle').
 * @param {Array} selectedSpokes - Selected spokes for VNet topology.
 * @returns {Array} - An array of resource objects representing the bundle. Returns null if no bundle.
 */
export function getBundleResources(resource, topology, selectedSpokes = []) {
    if (resource.name === 'Virtual network' && topology === 'hub-spoke') {
        const hub = { ...resource, abbrev: 'vnet-hub', name: 'Hub VNet' };

        const spokes = [];
        if (selectedSpokes.length > 0) {
            SPOKE_TYPES.filter(s => selectedSpokes.includes(s.value)).forEach(spoke => {
                spokes.push({
                    ...resource,
                    abbrev: `vnet-${spoke.abbrev}`,
                    name: `${spoke.label} Spoke`
                });
            });
        }

        return [hub, ...spokes];
    }

    if (resource.name === 'Host Pool' && topology === 'bundle') {
        // AVD Bundle: Pool, Workspace, App Group, Scaling Plan
        return [
            { ...resource, name: 'Host Pool' }, // vdpool (original)
            { ...resource, abbrev: 'vdws', name: 'Workspace', category: 'Desktop Virtualization' },
            { ...resource, abbrev: 'vdag', name: 'App Group', category: 'Desktop Virtualization' },
            { ...resource, abbrev: 'vdscaling', name: 'Scaling Plan', category: 'Desktop Virtualization' }
        ];
    }

    if (resource.name === 'Kubernetes (AKS)' && topology === 'bundle') {
        // AKS Bundle: Cluster, Registry, Identity
        // Registry (acr) should NOT include hyphens. This is usually handled by `generateName` checking the resource definition.
        // But here we are passing a "virtual" resource. 
        // We need to ensure the system knows ACR has no hyphens.
        // We can pass `chars: 'a-z, 0-9'` to override? 
        // `generateName` looks at `resource.chars` or `resource.name`.
        // Let's rely on `abbrev: 'cr'` which matches "Container registry" abbrev.
        // But wait, "Container registry" has `chars: 'a-z, A-Z, 0-9'`.
        // I should stick to the attributes defined in constants.js if possible, or override them here.

        return [
            { ...resource, name: 'AKS Cluster' }, // aks (original)
            {
                ...resource,
                abbrev: 'cr',
                name: 'Container Registry',
                chars: 'a-z, 0-9',
                maxLength: 50,
                // Registry needs to be global scope usually, or at least unique.
                // We'll mimic the "Container registry" resource definition.
            },
            {
                ...resource,
                abbrev: 'id',
                name: 'Managed Identity',
                chars: 'a-z, A-Z, 0-9, -, _',
                maxLength: 128
            }
        ];
    }

    // Default: Single resource (no bundle)
    return null;
}
