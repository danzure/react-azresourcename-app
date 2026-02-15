
import { SPOKE_TYPES } from '../data/constants';

/**
 * Generates a bundle of related resources based on the selected topology.
 * 
 * This function takes a primary resource and a topology type, and returns an array
 * of related resources that should be deployed together. This simplifies the process
 * of naming multiple dependent resources (e.g., VNet + Subnets, SQL Server + Database).
 * 
 * @param {Object} resource - The main resource object from constants.js
 * @param {string} topology - The selected topology ('single', 'hub-spoke', 'bundle')
 * @param {Array} selectedSpokes - Optional array of selected spokes for VNet topology
 * @returns {Array|null} - An array of resource objects representing the bundle, or null if no bundle applies.
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
        // AKS Bundle logic:
        // 1. AKS Cluster (primary)
        // 2. Container Registry (acr) - Required for storing container images
        // 3. Managed Identity (id) - Required for secure cluster identity

        // Note: Container Registry has strict naming rules (no hyphens).
        // We override the 'abbrev' to 'cr' to match the resource definition.

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

    if (resource.name === 'SQL server' && topology === 'bundle') {
        // SQL Bundle logic:
        // 1. SQL Server (primary) - The logical server container
        // 2. SQL Database (sqldb) - The actual database instance
        //    Scope is set to 'Server' to imply it lives within the SQL Server.
        return [
            { ...resource, name: 'SQL Server' }, // sql (original)
            {
                ...resource,
                abbrev: 'sqldb',
                name: 'SQL Database',
                chars: 'a-z, A-Z, 0-9, -, _, .',
                maxLength: 128,
                scope: 'Server'
            }
        ];
    }

    if (resource.name === 'App Service' && topology === 'bundle') {
        // Web App Bundle logic:
        // 1. App Service (primary) - The web application itself
        // 2. App Service Plan (asp) - The compute backing the app
        // 3. Application Insights (appi) - Monitoring and telemetry
        return [
            { ...resource, name: 'App Service' }, // app (original)
            {
                ...resource,
                abbrev: 'asp',
                name: 'App Service Plan',
                chars: 'a-z, A-Z, 0-9, -',
                maxLength: 40,
                scope: 'Resource group'
            },
            {
                ...resource,
                abbrev: 'appi',
                name: 'Application Insights',
                chars: 'a-z, A-Z, 0-9, -, _, .',
                maxLength: 260,
                scope: 'Resource group'
            }
        ];
    }

    // Default: Single resource (no bundle)
    return null;
}
