# a-z-ure.namer

A web application for generating consistent, compliant Azure resource names. Based on Microsoft's Cloud Adoption Framework (CAF), which provides best practices for naming and organizing Azure resources to improve governance, discoverability, and management at scale.

## What it does

- Generates standardized names for 100+ Azure services
- Enforces Azure naming rules (character limits, allowed characters)
- Supports customizable naming patterns with workload, environment, region, and instance
- Automatically removes hyphens for resources that don't allow them (e.g., Storage Accounts)
- Warns when names exceed Azure's maximum length limits

## Live Demo

[https://a-zurenamer.app/](https://a-zurenamer.app/)

## Resources

- [Azure Naming Conventions](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming)
- [Azure Resource Abbreviations](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations)
