# a-zurenamer 🌐

A modern, web-based tool for generating **Microsoft Cloud Adoption Framework (CAF)** compliant names for Azure resources. 

This application simplifies governance by ensuring all resource names adhere to Azure's strict naming rules, character limits, and scope uniqueness requirements, while providing helpful guidance and best practices.

## 🔗 Live Demo
[https://a-zurenamer.app/](https://a-zurenamer.app/)

## 🚀 Key Features

### 🔹 Intelligent Naming Generation
- **Supports 100+ Azure Resources**: Computed naming logic for specific resource types including Compute, Networking, Storage, Databases, AI, and more.
- **CAF Compliance**: Automatically applies Microsoft's recommended abbreviations and naming patterns.
- **Scope Awareness**: Visual indicators for resource scope uniqueness (Global, Subscription, Resource Group, etc.).
- **Smart Validation**: 
  - Enforces character limits (e.g., Storage Accounts: max 24 chars).
  - Validates allowed characters (e.g., no hyphens in Storage Accounts or Key Vaults).
  - Checks for mandatory names (e.g., `AzureFirewallSubnet`, `GatewaySubnet`).

### 🔹 Enhanced User Experience
- **One-Click Copy**: Quickly copy generated names to clipboard.
- **Dark Mode**: Fully supported dark theme that respects system preferences.
- **Responsive Design**: Optimized for desktop, tablet, and mobile workflows.
- **Instant Feedback**: Real-time validation errors and warnings.
- **Resource Guidance**: Built-in descriptions, learn links, and best practice tips for every resource.

## 🛠️ Technology Stack

Built with a modern, performance-focused stack:

- **Frontend**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: Optimized for Azure Static Web Apps

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (included with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/azres-naming-tool.git
   cd azres-naming-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

This will generate optimized static assets in the `dist` directory, ready for deployment.

## 📂 Project Structure

```
src/
├── components/       # UI Components (ConfigPanel, ResourceCard, etc.)
├── data/            # Static data including Azure resource definitions
├── App.jsx          # Main application logic and state management
├── main.jsx         # Entry point
└── index.css        # Global styles and Tailwind directives
```

## 📖 Resources

- [Azure Naming Conventions](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming)
- [Azure Resource Abbreviations](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations)
