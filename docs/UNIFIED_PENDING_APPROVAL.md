# Unified Pending Approval Component

## Overview

The three separate pending approval pages (`TransfersPendingApproval.vue`, `ContractsPendingApproval.vue`, and `SettlementsPendingApproval.vue`) have been merged into a single unified component `UnifiedPendingApproval.vue`, similar to how `UnifiedTransfers.vue` works.

## What Was Changed

### 1. New Unified Component

- **File**: `src/views/UnifiedPendingApproval.vue`
- **Purpose**: Handles all three types of pending approval pages based on the current route
- **Approach**: Route-based configuration that determines:
  - Page title (Arabic and English)
  - API endpoint code
  - Detail route pattern
  - Whether to show view button
  - Table headers

### 2. Route Configuration

The component uses a configuration object that maps route names to their specific settings:

```typescript
const routeConfigs: Record<string, RouteConfig> = {
  EnhancementsPendingApproval: {
    title: { ar: 'المناقلات قيد الاعتماد', en: 'Transfers Pending Approval' },
    apiCode: 'FAR',
    detailRoute: '/cost-center-transfer/:id?viewOnly=true',
    showViewButton: false,
    // ... headers
  },
  ContractsPendingApproval: {
    title: { ar: 'العقود قيد الاعتماد', en: 'Fund Adjustment Pending Approval' },
    apiCode: 'CON',
    detailRoute: '/contracts/:id',
    showViewButton: true,
    // ... headers
  },
  SettlementsPendingApproval: {
    title: { ar: 'التسويات قيد الاعتماد', en: 'Additional Fund Pending Approval' },
    apiCode: 'SET',
    detailRoute: '/settlements/:id',
    showViewButton: false,
    // ... headers
  },
}
```

### 3. Updated Router

- **File**: `src/router/index.ts`
- **Change**: All three routes now point to `UnifiedPendingApproval.vue`

```typescript
// Before
component: () => import('@/views/TransfersPendingApproval.vue'),
component: () => import('@/views/ContractsPendingApproval.vue'),
component: () => import('@/views/SettlementsPendingApproval.vue'),

// After
component: () => import('@/views/UnifiedPendingApproval.vue'),
component: () => import('@/views/UnifiedPendingApproval.vue'),
component: () => import('@/views/UnifiedPendingApproval.vue'),
```

## Key Features

### 1. Route-Based Configuration

- Automatically detects the current route and loads appropriate configuration
- Displays correct title, headers, and functionality based on the route
- Uses different API codes for different types of requests

### 2. Dynamic API Integration

- Uses `TransfersFlowService.fetchPendingTransfers()` with route-specific API codes
- Handles approve/reject actions with proper validation
- Supports bulk operations for multiple selections

### 3. Conditional UI Elements

- Shows/hides the "View" button based on route configuration
- Generates correct detail routes for each type
- Maintains consistent styling and behavior across all types

### 4. Internationalization

- Supports both Arabic and English languages
- Route-specific titles and headers
- Proper RTL support for Arabic interface

### 5. Error Handling

- Comprehensive error handling for API calls
- User-friendly error messages in both languages
- Loading states and proper feedback

## Benefits

### 1. Code Reusability

- Eliminates code duplication across three similar components
- Single source of truth for pending approval functionality
- Easier maintenance and updates

### 2. Consistency

- Ensures consistent behavior across all pending approval pages
- Unified styling and user experience
- Consistent error handling and validation

### 3. Scalability

- Easy to add new pending approval types by adding to the configuration
- Centralized logic makes it easier to implement new features
- Reduced bundle size due to code consolidation

### 4. Maintainability

- Single component to maintain instead of three
- Changes propagate automatically to all approval types
- Centralized bug fixes and improvements

## API Integration

The component uses the existing `TransfersFlowService` with different API codes:

- **FAR**: For transfer requests (EnhancementsPendingApproval)
- **CON**: For contract/fund adjustment requests (ContractsPendingApproval)
- **SET**: For settlement/additional fund requests (SettlementsPendingApproval)

## Migration

The original three components can now be safely deleted:

- `src/views/TransfersPendingApproval.vue`
- `src/views/ContractsPendingApproval.vue`
- `src/views/SettlementsPendingApproval.vue`

All existing routes and functionality remain unchanged from the user perspective.

## Navigation Menu

The navigation menu (`NavigationMenu.vue`) continues to work without any changes, as the route names remain the same.

## Testing

The unified component has been tested to ensure:

- ✅ Proper route detection and configuration loading
- ✅ Correct API calls with appropriate codes
- ✅ Proper approve/reject functionality
- ✅ Internationalization support
- ✅ Dark mode compatibility
- ✅ Responsive design
- ✅ Error handling

## Future Enhancements

With this unified approach, future improvements can be easily implemented:

- Toast notifications for success/error messages
- Advanced filtering and sorting options
- Export functionality
- Batch operations improvements
- Real-time updates via WebSocket integration
