# SAK - Solana Token Creation App

SAK is a cross-platform mobile and web application built with Ionic React and Capacitor that enables users to create and manage Solana tokens through the Pump.fun platform. The app provides a seamless interface for token creation, wallet integration, and token management.

## 🚀 Tech Stack

- **Frontend Framework**: React 18.2.0 with TypeScript
- **Mobile Framework**: Ionic React 8.5.0
- **Cross-Platform**: Capacitor 7.3.0 (iOS & Android)
- **Build Tool**: Vite 5.2.0
- **Styling**: TailwindCSS 4.1.8 + Ant Design 5.25.4
- **Blockchain**: Solana Web3.js 1.98.2
- **Authentication**: Privy 2.14.1
- **State Management**: TanStack React Query 5.80.7
- **Testing**: Vitest + Cypress

## 📁 Project Structure

### Root Configuration Files

#### `package.json`

Main project configuration file containing:

- Project metadata (name: "sak", version: 0.0.1)
- NPM scripts for development, building, testing, and linting
- Dependencies including Ionic React, Solana Web3.js, Privy Auth, and UI libraries
- Development dependencies for testing, linting, and build tools

#### `vite.config.ts`

Vite build configuration:

- React plugin setup with legacy browser support
- Build target set to 'esnext' with BigInt support for Solana
- Vitest configuration for unit testing
- Rollup configuration for ES module output

#### `capacitor.config.ts`

Capacitor configuration for mobile app deployment:

- App ID: `com.timur.sak`
- App name: "sak"
- Web directory: "dist"

#### `ionic.config.json`

Ionic framework configuration:

- Project type: "react-vite"
- Capacitor integration enabled
- Project ID: "34659eec"

#### `tsconfig.json` & `tsconfig.node.json`

TypeScript configuration files:

- `tsconfig.json`: Main TypeScript configuration for the application
- `tsconfig.node.json`: Node.js specific TypeScript configuration for build tools

#### `.env.local`

Environment variables configuration (432 bytes):

- Contains API keys and configuration values
- Includes Helius RPC URL for Solana connection

#### Configuration Files for Tools

- `.prettierrc`: Code formatting configuration
- `.browserslistrc`: Browser compatibility targets
- `eslint.config.js`: ESLint linting rules and configuration
- `postcss.config.mjs`: PostCSS configuration for CSS processing
- `cypress.config.ts`: End-to-end testing configuration
- `.nvmrc`: Node.js version specification
- `.gitignore`: Git ignore patterns

### Source Code (`src/`)

#### Main Application Files

##### `src/main.tsx`

Application entry point:

- Sets up QueryClient for TanStack React Query
- Configures Ant Design theme provider with dark/light mode detection
- Renders the root App component with React StrictMode

##### `src/App.tsx`

Main application component:

- Sets up Ionic React framework
- Configures routing with IonReactRouter
- Implements tab-based navigation structure
- Wraps app with PrivyProvider for authentication
- Includes bottom navigation bar

##### `src/index.css`

Global CSS styles (minimal, 23 bytes):

- Basic global styling for the application

##### `src/vite-env.d.ts`

TypeScript environment declarations for Vite

##### `src/App.test.tsx`

Basic test file for the App component

##### `src/setupTests.ts`

Test environment setup:

- Configures Jest DOM testing utilities
- Sets up testing environment for React components

### Components (`src/components/`)

#### `src/components/index.ts`

Barrel export file for components

#### `src/components/PrivyProvider.tsx`

Authentication provider component:

- Configures Privy authentication with Solana support
- Sets up wallet connection and authentication flow

#### `src/components/ProtectedRoute.tsx`

Route protection component:

- Implements authentication-based route guarding
- Redirects unauthenticated users to login page

#### `src/components/ExploreContainer.tsx` & `ExploreContainer.css`

Generic container component:

- Reusable UI component for content display
- Associated CSS styles for component styling

#### Component Directories

##### `src/components/BottomNavbar/`

Bottom navigation component directory containing the main navigation interface

##### `src/components/WalletBalance/`

Wallet balance display component directory for showing user's Solana balance

##### `src/components/CreatedTokens/`

Component directory for displaying user's created tokens list

##### `src/components/Routes/`

Routing component directory containing application route definitions

### Pages (`src/pages/`)

#### `src/pages/Login.tsx`

Login page component (2.9KB):

- Implements user authentication interface
- Integrates with Privy authentication provider

#### `src/pages/Tab2.tsx`

Main application tab (6.4KB, 223 lines):

- Primary interface for token creation and management
- Largest page component with comprehensive functionality

#### `src/pages/Tab3.tsx` & `Tab3.css`

Third tab page component:

- Additional application functionality
- Associated CSS file (empty)

#### `src/pages/CreateToken/`

Token creation page directory:

- Contains components for creating new Solana tokens
- Implements token creation form and logic

### Services (`src/services/`)

#### `src/services/solanaService.ts`

Core Solana blockchain service (3.8KB, 145 lines):

- Handles Solana Web3.js integration
- Manages transaction creation, signing, and sending
- Implements keypair generation and management
- Provides connection to Solana network

#### `src/services/tokenApi.ts`

Token API service (3.2KB, 112 lines):

- Handles API communication for token creation
- Implements HTTP requests to Pump.fun API
- Manages token launch API integration

#### `src/services/pumpFunCreatedTokensService.ts`

Pump.fun token service (6.7KB, 234 lines):

- Specialized service for Pump.fun platform integration
- Handles created tokens retrieval and management
- Implements platform-specific API calls

### Hooks (`src/hooks/`)

Custom React hooks for application logic:

#### `src/hooks/usePrivyWallet.ts`

Privy wallet integration hook (2.8KB, 97 lines):

- Manages wallet connection through Privy
- Handles wallet state and authentication

#### `src/hooks/useTokenApi.ts`

Token API hook (472 bytes, 20 lines):

- React Query hook for token API calls
- Simplifies API state management

#### `src/hooks/useWalletBalance.ts`

Wallet balance hook (987 bytes, 40 lines):

- Manages and displays wallet balance
- Handles balance updates and formatting

#### `src/hooks/useCreateTokenWithPrivy.ts`

Token creation with Privy hook (2.7KB, 84 lines):

- Combines token creation with Privy authentication
- Handles the complete token creation flow

#### `src/hooks/useCreateTokenWithPrivyHybrid.ts`

Hybrid token creation hook (3.7KB, 114 lines):

- Advanced token creation implementation
- Provides alternative token creation methods

#### `src/hooks/useCreatedTokens.ts`

Created tokens management hook (745 bytes, 29 lines):

- Manages list of user's created tokens
- Handles token data fetching and caching

#### `src/hooks/useLaunchTokenOnly.ts`

Token launch hook (1.2KB, 48 lines):

- Handles token launching process
- Separates launch logic from creation

#### `src/hooks/useCreateToken.ts`

Core token creation hook (2.5KB, 79 lines):

- Main token creation logic
- Integrates with Solana services

#### `src/hooks/usePhotoGallery.ts`

Photo gallery hook (2.5KB, 97 lines):

- Handles image selection and management
- Integrates with Capacitor Camera plugin

### Utilities (`src/utils/`)

#### `src/utils/fileUtils.ts`

File handling utilities (2.0KB, 95 lines):

- File upload and processing functions
- Image handling and conversion utilities

#### `src/utils/keypairManager.ts`

Keypair management utilities (2.8KB, 114 lines):

- Solana keypair generation and storage
- Secure key management using Capacitor Preferences

### Constants (`src/constants/`)

#### `src/constants/index.ts`

Main constants barrel export file

#### `src/constants/api.ts`

API configuration constants:

- Base URLs for API endpoints
- API configuration values

#### `src/constants/routes.ts`

Route constants:

- Application route definitions
- Navigation path constants

### Types (`src/types/`)

TypeScript type definitions directory (currently empty but structured for type definitions)

### Modules (`src/modules/`)

#### `src/modules/pump-fun/`

Pump.fun platform integration module containing:

- Specialized components for Pump.fun integration
- Platform-specific services and utilities
- Custom hooks for Pump.fun functionality
- Type definitions for Pump.fun API
- Navigation and screen components

### Examples (`src/examples/`)

Example code directory containing demonstration implementations and usage examples

### Mobile Platform Directories

#### `android/`

Android platform-specific files and configuration:

- Generated by Capacitor for Android app builds
- Contains Android Studio project files
- Platform-specific resources and configuration

#### `ios/`

iOS platform-specific files and configuration:

- Generated by Capacitor for iOS app builds
- Contains Xcode project files
- Platform-specific resources and configuration

### Build and Distribution

#### `dist/`

Production build output directory:

- Generated by Vite build process
- Contains optimized and bundled application files

#### `public/`

Static assets directory:

- `favicon.png`: Application favicon (930 bytes)
- `manifest.json`: Web app manifest for PWA functionality

#### `resources/`

Capacitor resources directory:

- Contains app icons and splash screens for mobile platforms

### Testing

#### `cypress/`

End-to-end testing directory:

- Contains Cypress test files and configuration
- E2E test scenarios and fixtures

## 🚀 Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- npm or yarn package manager
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sak

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

### Development

```bash
# Start development server
ionic serve
or
npm run dev

# Lint code
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Mobile Development

```bash
# Build
npm run build

# Sync with Capacitor
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode
npx cap open ios
```

## 📱 Features

- **Token Creation**: Create Solana tokens through Pump.fun platform
- **Wallet Integration**: Secure wallet connection with Privy
- **Cross-Platform**: Works on web, iOS, and Android
- **Dark Mode**: Automatic dark/light theme detection
- **Photo Gallery**: Camera integration for token images
- **Balance Display**: Real-time wallet balance updates
- **Token Management**: View and manage created tokens

## 🔧 Configuration

The application uses various configuration files:

- Environment variables in `.env.local`
- API endpoints in `src/constants/api.ts`
- Routing configuration in `src/constants/routes.ts`
- Solana network configuration in services

## 📝 API Integration

The app integrates with:

- **Pump.fun API**: For token creation and management
- **Solana RPC**: For blockchain interactions
- **Privy Auth**: For wallet authentication

Detailed API documentation is available in `TOKEN_API_README.md`.

## ⚠️ Pre-production Checklist

Before launching the application into a production environment, please review the following critical points:

### 1. API Endpoints

Ensure all services are configured to use **production API endpoints**. Verify that no test or development URLs are hardcoded or configured in the environment variables for the production build.

### 2. Code Cleanup

This project contains some legacy code from a previous "alarm clock" feature, which has since been migrated to the `alarm` project. It is recommended to remove any unused components, services, and hooks related to this functionality to keep the codebase clean and optimized.
