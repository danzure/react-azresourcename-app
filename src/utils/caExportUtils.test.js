import { describe, it, expect } from 'vitest';
import { generateConditionalAccessTerraform, generateConditionalAccessJSON } from './caExportUtils';

describe('Conditional Access Export Utilities', () => {
    describe('generateConditionalAccessTerraform', () => {
        it('generates basic policy with default MFA grant control', () => {
            const result = generateConditionalAccessTerraform(
                'CA-All-All-All-RequireMFA',
                'All',
                'All',
                'AnyPlatform',
                'RequireMFA'
            );

            expect(result).toContain('resource "azurerm_conditional_access_policy" "generated_policy"');
            expect(result).toContain('name  = "CA-All-All-All-RequireMFA"');
            expect(result).toContain('state = "reportOnly"');
            expect(result).toContain('included_applications = ["All"]');
            expect(result).toContain('included_users = ["All"]');
            expect(result).toContain('included_platforms = ["all"]');
            expect(result).toContain('built_in_controls = ["mfa"]');
            expect(result).toContain('operator          = "AND"');
        });

        it('handles Block action with OR operator and empty grant control', () => {
            const result = generateConditionalAccessTerraform(
                'CA-Guests-All-Any-BlockLegacyAuth',
                'Guests',
                'All',
                'AnyPlatform',
                'BlockLegacyAuth'
            );

            expect(result).toContain('included_users = ["GuestsOrExternalUsers"]');
            expect(result).toContain('built_in_controls = []');
            expect(result).toContain('operator          = "OR"');
        });

        it('handles Admins persona and Office 365 cloud app', () => {
            const result = generateConditionalAccessTerraform(
                'CA-Admins-O365-Windows-RequirePhishResist',
                'Admins',
                'O365',
                'Windows',
                'RequirePhishResist'
            );

            expect(result).toContain('included_users = ["Role: Global Administrator"]');
            expect(result).toContain('included_applications = ["Office365"]');
            expect(result).toContain('included_platforms = ["windows"]');
            expect(result).toContain('built_in_controls = ["phishingResistantMfa"]');
        });

        it('handles AIAgents persona and AzurePortal resource', () => {
            const result = generateConditionalAccessTerraform(
                'CA-AIAgents-AzurePortal-All-RequireCompliant',
                'AIAgents',
                'AzurePortal',
                'AnyPlatform',
                'RequireCompliant'
            );

            expect(result).toContain('included_users = ["ServicePrincipals"]');
            expect(result).toContain('included_applications = ["797f4846-ba00-4fd7-ba43-dac1f8f63013"]');
            expect(result).toContain('built_in_controls = ["compliantDevice"]');
        });

        it('handles SessionControl action', () => {
            const result = generateConditionalAccessTerraform(
                'CA-All-All-All-SessionControl',
                'All',
                'All',
                'AnyPlatform',
                'SessionControl'
            );

            expect(result).toContain('session_controls {');
            expect(result).toContain('sign_in_frequency = 1');
            expect(result).toContain('sign_in_frequency_period = "hours"');
            expect(result).not.toContain('grant_controls {');
        });

        it('handles RequirePasswordChange action', () => {
            const result = generateConditionalAccessTerraform(
                'CA-All-All-All-RequirePasswordChange',
                'All',
                'All',
                'AnyPlatform',
                'RequirePasswordChange'
            );

            expect(result).toContain('built_in_controls = ["passwordChange"]');
        });

        it('escapes quotes and backslashes in policyName for Terraform', () => {
            const result = generateConditionalAccessTerraform(
                'CA-Policy "Special"\\Test',
                'All',
                'All',
                'AnyPlatform',
                'RequireMFA'
            );

            expect(result).toContain('name  = "CA-Policy \\"Special\\"\\\\Test"');
        });
    });

    describe('generateConditionalAccessJSON', () => {
        it('generates valid JSON with default MFA grant control', () => {
            const jsonStr = generateConditionalAccessJSON(
                'CA-All-All-All-RequireMFA',
                'All',
                'All',
                'AnyPlatform',
                'RequireMFA'
            );

            const parsed = JSON.parse(jsonStr);
            expect(parsed.displayName).toBe('CA-All-All-All-RequireMFA');
            expect(parsed.state).toBe('enabledForReportingButNotEnforced');
            expect(parsed.conditions.applications.includeApplications).toEqual(['All']);
            expect(parsed.conditions.users.includeUsers).toEqual(['All']);
            expect(parsed.conditions.platforms.includePlatforms).toEqual(['all']);
            expect(parsed.grantControls.operator).toBe('AND');
            expect(parsed.grantControls.builtInControls).toEqual(['mfa']);
        });

        it('handles AIAgents persona correctly in JSON', () => {
            const jsonStr = generateConditionalAccessJSON(
                'CA-AIAgents-All-All-RequireMFA',
                'AIAgents',
                'All',
                'AnyPlatform',
                'RequireMFA'
            );

            const parsed = JSON.parse(jsonStr);
            expect(parsed.conditions.users.includeUsers).toEqual(['ServicePrincipals']);
        });

        it('handles SessionControl action with sessionControls payload', () => {
            const jsonStr = generateConditionalAccessJSON(
                'CA-All-All-All-SessionControl',
                'All',
                'All',
                'AnyPlatform',
                'SessionControl'
            );

            const parsed = JSON.parse(jsonStr);
            expect(parsed.sessionControls).toBeDefined();
            expect(parsed.sessionControls.signInFrequency).toEqual({
                value: 1,
                type: 'hours',
                isEnabled: true
            });
            expect(parsed.grantControls).toBeUndefined();
        });

        it('handles Block action with OR operator and block builtInControl', () => {
            const jsonStr = generateConditionalAccessJSON(
                'CA-Guests-All-All-Block',
                'Guests',
                'All',
                'AnyPlatform',
                'Block'
            );

            const parsed = JSON.parse(jsonStr);
            expect(parsed.conditions.users.includeUsers).toEqual(['GuestsOrExternalUsers']);
            expect(parsed.grantControls.operator).toBe('OR');
            expect(parsed.grantControls.builtInControls).toEqual(['block']);
        });

        it('handles specific platforms and target cloud applications', () => {
            const jsonStr = generateConditionalAccessJSON(
                'CA-Admins-AzurePortal-macOS-RequireCompliant',
                'Admins',
                'AzurePortal',
                'macOS',
                'RequireCompliant'
            );

            const parsed = JSON.parse(jsonStr);
            expect(parsed.conditions.users.includeUsers).toEqual(['Role: Global Administrator']);
            expect(parsed.conditions.applications.includeApplications).toEqual(['797f4846-ba00-4fd7-ba43-dac1f8f63013']);
            expect(parsed.conditions.platforms.includePlatforms).toEqual(['macos']);
            expect(parsed.grantControls.builtInControls).toEqual(['compliantDevice']);
        });

        it('handles RequirePhishResist and RequirePasswordChange in JSON', () => {
            const phishJson = JSON.parse(generateConditionalAccessJSON('CA-Phish', 'All', 'All', 'AnyPlatform', 'RequirePhishResist'));
            expect(phishJson.grantControls.builtInControls).toEqual(['phishingResistantMfa']);

            const pwdJson = JSON.parse(generateConditionalAccessJSON('CA-Pwd', 'All', 'All', 'AnyPlatform', 'RequirePasswordChange'));
            expect(pwdJson.grantControls.builtInControls).toEqual(['passwordChange']);
        });
    });
});
