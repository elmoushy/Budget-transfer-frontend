# API Service Refactoring Documentation

## Overview

This document outlines the refactoring work completed to ensure all API calls in the application flow through a centralized service layer, rather than being made directly from components. This architecture improvement enhances maintainability, reduces code duplication, and provides a single point of contact for API interaction.

## Changes Made

### 1. Centralized Configuration

Created a centralized configuration file to store all API-related constants:

- **File**: `src/config/api.js`
- **Content**:
  - `API_BASE_URL` definition with environment variable fallback
  - Organized API endpoints by feature (AUTH, BUDGET, ACCOUNTS_ENTITIES)
  - Added pagination constants

### 2. API Service Layer

Implemented a comprehensive service layer to handle all API interactions:

- **File**: `src/services/apiService.js`
- **Features**:
  - Organized services by domain (auth, transfers, accountEntities)
  - Helper functions for common operations (getAuthHeaders, formatUrl)
  - Consistent error handling
  - Standardized response format

### 3. Component Refactoring

The following components were refactored to use the centralized API service:

#### Previously Refactored:

- `Login.vue`: Changed direct fetch call to use apiService.auth.login()
- `UserManagement.vue`: Replaced direct axios calls with apiService.auth methods
- `AccountEntityManagement.vue`: Using centralized services for entities and accounts
- `CostCenterTransferRequest.vue`: Updated API calls to use service layer
- `ContractDetail.vue`: Removed direct API calls
- Various modal components: Converted to use API service

#### Newly Refactored:

- `NewContractModal.vue`: Replaced direct axios.post with apiService.transfers.createTransfer()
- `EditContractModal.vue`: Updated axios.put to apiService.transfers.updateTransfer()
- `EnhancementsRequestModel.vue`: Changed direct API call to apiService.transfers.createTransfer()

### 4. Audit Tools

Created tools to ensure compliance with the new architecture:

- **File**: `scripts/audit-api-usage.js`
- **Purpose**: Scans codebase to find any remaining direct API calls
- **What It Checks For**:
  - Direct axios imports
  - Direct fetch API usage
  - API_BASE_URL references
  - HTTP/HTTPS URL strings in components

## Benefits

1. **Code Consistency**: All API calls follow the same pattern
2. **Centralized Error Handling**: Common error handling logic in one place
3. **Easier Maintenance**: URL changes need to be updated in only one location
4. **Improved Testing**: Services can be mocked for unit testing
5. **Better Type Safety**: Consistent typing of request/response objects

## Future Work

If the application continues to grow, consider:

1. Adding TypeScript interfaces for API responses
2. Implementing request cancellation for long-running requests
3. Adding a request queue for offline capabilities
4. Expanding the service layer with more specific domain-based services
