# Dynamic Navigation Menu Documentation

## Overview

The NavigationMenu component now fetches route names from the database on every page refresh, ensuring that when route names are changed in the admin panel, they are reflected immediately after a browser refresh.

## Features

### 1. **Fresh Data on Page Load**

- **No Caching**: Always fetches fresh data from the API
- **Page Refresh Only**: Updates only when the browser is refreshed
- **Real-time Updates**: Shows the latest route names from the database

### 2. **Simple and Reliable**

- **Direct API Calls**: No complex caching or background refresh logic
- **Error Handling**: Graceful fallback to static data if API fails
- **Performance Optimized**: Only makes API calls on page load

### 3. **Updated Route Names**

- **Transfer (not Transfers)**: Now correctly shows "Transfer" as updated in the database
- **Control (not Controller)**: Updated route name for ID 12
- **All Routes Dynamic**: All route names come from the database

## Current Route Mapping

Based on your API response, here are the current route names:

| ID  | English Name               | Arabic Name              | Vue Route                   |
| --- | -------------------------- | ------------------------ | --------------------------- |
| 2   | Dashboard                  | لوحة القيادة             | Dashboard                   |
| 3   | **Transfer**               | المناقلات                | Home                        |
| 4   | Fund Adjustment Department | التسويه                  | Settlements                 |
| 5   | Additional Fund Request    | التعزيزات                | Enhancements                |
| 6   | Pending Transfers          | التعزيزات قيد الاعتماد   | EnhancementsPendingApproval |
| 7   | Pending Fund Adjustment    | العقود قيد الاعتماد      | ContractsPendingApproval    |
| 8   | Pending Additional Fund    | التسويات قيد الاعتماد    | SettlementsPendingApproval  |
| 9   | User Management            | إدارة المستخدمين         | UserManagement              |
| 10  | Account-Entity Management  | إدارة الحسابات والكيانات | AccountEntityManagement     |
| 11  | Accounts & Entities        | الحسابات والكيانات       | AccountsEntityView          |
| 12  | **Control**                | التحكم                   | Controller                  |

## Usage Examples

### Basic Usage

The component works automatically - fetches fresh data on every page load:

```vue
<template>
  <NavigationMenu />
</template>
```

### How to See Updated Route Names

1. Update route names in your admin panel
2. Save changes to the database via the API
3. Refresh the browser page (F5 or Ctrl+R)
4. Navigation menu will show the updated names

### No Manual Intervention Required

- No need to call refresh functions
- No need to clear cache
- Simply refresh the page to see updates

## Technical Details

### API Endpoint

```
GET /api/admin_panel/main-routes/
Authorization: Bearer {token}
```

### Response Format

```json
{
  "message": "Main routes names retrieved successfully.",
  "data": [
    {
      "id": 3,
      "english_name": "Transfer",
      "arabic_name": "المناقلات"
    }
    // ... other routes
  ]
}
```

## Implementation Notes

### No Caching

- Component fetches fresh data on every page load
- No local storage or session storage used
- No automatic background refresh timers
- No complex cache invalidation logic

### Simple Refresh Strategy

- Data is fetched only when component mounts (page loads)
- To see updated route names: refresh the browser
- Fallback data is used only if API completely fails

### Updated Route Names

The following route names have been updated in your database:

- **ID 3**: "Transfers" → "Transfer"
- **ID 12**: "Controller" → "Control"

## Troubleshooting

### Route Names Not Updating

1. Check browser console for API errors
2. Verify the `/api/admin_panel/main-routes/` endpoint is accessible
3. Ensure route IDs in database match the component mapping
4. Try a force refresh: `navMenu.value.forceRefresh()`

### Performance Issues

1. Increase `CACHE_DURATION` to reduce API calls
2. Increase `AUTO_REFRESH_INTERVAL` for less frequent updates
3. Use `stopAutoRefresh()` to disable automatic updates if needed

### Data Not Matching Database

1. Check if route IDs in `routeIdToRouteName` mapping are correct
2. Verify API response format matches expected structure
3. Clear browser cache and localStorage

## Best Practices

1. **After Admin Changes**: Always call `refreshNavigation()` after updating route names
2. **Error Handling**: Component gracefully falls back to static data on API failures
3. **Performance**: Auto-refresh is optimized with caching - avoid manual calls unless necessary
4. **User Experience**: Background refresh indicator shows when updates are happening
5. **Accessibility**: Refresh indicator includes appropriate ARIA labels and tooltips

## Events

### Custom Events

- **`refreshNavigation`**: Global event for triggering manual refresh
  - Dispatched on `window` object
  - Contains timestamp and reason in event detail

### Component Events

The component listens for:

- `visibilitychange`: Refreshes when tab becomes visible
- `refreshNavigation`: Custom refresh events from other components

## Migration Notes

### From Static Menu

No breaking changes - existing implementations continue to work. The component now automatically fetches data instead of using static arrays.

### Adding New Routes

1. Add route to database via admin panel
2. Add route ID mapping in `routeIdToRouteName`
3. If admin-only, add ID to `adminRouteIds` array
4. Call `refreshNavigation()` to update immediately
