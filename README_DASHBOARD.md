# Budget Transfer Dashboard

A production-ready Vue 3 + TypeScript dashboard for budget transfer analytics with comprehensive data visualization capabilities.

## Features

- **Multi-Mode Analytics**: Normal, All, and Smart modes for different data perspectives
- **Real-time Charts**: Interactive charts using Chart.js for status, trends, and flows
- **Data Visualization**: Heatmaps, Sankey diagrams, and timeline analysis
- **Cairo Timezone Support**: All dates displayed in Africa/Cairo timezone
- **Export Capabilities**: CSV export for all data tables
- **Mock Mode**: Development mode with sample data
- **Responsive Design**: Mobile-friendly dashboard layout
- **Dark Mode**: Theme switching support

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **State Management**: Pinia
- **Charts**: Chart.js with custom components
- **HTTP Client**: Axios with interceptors
- **Styling**: CSS with utility classes
- **Date Handling**: Intl API for timezone support

## Project Structure

```
src/
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and transformations
├── api/             # HTTP layer and API calls
├── stores/          # Pinia stores for state management
├── components/      # Vue components
│   ├── charts/      # Chart components
│   └── BudgetDashboard.vue
└── views/           # Main view components
```

## Setup & Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Configure your environment variables:

   - `VITE_API_BASE_URL`: Your API base URL
   - `VITE_MOCK_MODE`: Set to 'true' for development with mock data

3. **Development Server**

   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## API Integration

The dashboard expects these endpoints:

- `GET /api/budget/dashboard/?type={normal|all|smart}`

### Authentication

All requests require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Response Formats

#### Normal Mode

```json
{
  "total_transfers": 11,
  "approved_transfers": 2,
  "rejected_transfers": 1,
  "pending_transfers": 8,
  "pending_transfers_by_level": { "Level1": 7, "Level2": 1 },
  "request_dates": ["2025-08-12T07:48:10.158688+00:00"],
  "performance_metrics": { "total_processing_time": 0.49 }
}
```

#### All/Smart Mode

```json
{
  "filtered_combinations": [
    {
      "cost_center_code": 9900002,
      "account_code": 415220,
      "total_from_center": 0.0,
      "total_to_center": 3000.0
    }
  ],
  "cost_center_totals": [
    { "cost_center_code": 9900002, "total_from_center": 3100.0, "total_to_center": 3100.0 }
  ],
  "performance_metrics": { "total_processing_time": 0.67 }
}
```

## Development Features

### Mock Mode

Enable mock mode for development without a backend:

```bash
echo "VITE_MOCK_MODE=true" > .env
```

This provides realistic sample data for all dashboard modes.

### Chart Components

Each chart is a self-contained Vue component:

- `StatusDonut.vue` - Transfer status breakdown
- `TransferCategories.vue` - Category distribution
- `PendingByLevel.vue` - Approval workflow status
- `RequestsTimeline.vue` - Timeline analysis
- `CostCenterTotals.vue` - Cost center flow analysis
- `AccountCodeTotals.vue` - Account code analysis
- `FlowHeatmap.vue` - Interactive flow visualization
- `SankeyDiagram.vue` - Flow direction visualization

### Data Transformations

Utility functions handle all data transformations:

- `bucketDatesByDayCairo()` - Date bucketing with Cairo timezone
- `toGroupedTotals()` - Chart data preparation
- `toHeatmapCells()` - Heatmap data transformation
- `toSankey()` - Sankey diagram data preparation
- `calculateTotalSums()` - Financial calculations

## Usage

### Basic Integration

```vue
<template>
  <BudgetDashboard />
</template>

<script setup>
import BudgetDashboard from '@/components/BudgetDashboard.vue'
</script>
```

### Store Integration

```typescript
import { useBudgetDashboardStore } from '@/stores/budgetDashboard'

const store = useBudgetDashboardStore()

// Load data
await store.load('normal', authToken)

// Refresh data
await store.refresh(authToken)

// Switch modes
store.setCurrentType('smart')
```

## Data Flow

1. **Authentication**: User provides Bearer token via auth store
2. **Mode Selection**: User selects Normal/All/Smart mode
3. **API Call**: Dashboard fetches data with appropriate parameters
4. **Data Transformation**: Utils process raw API data for charts
5. **Visualization**: Charts render processed data
6. **Caching**: Results cached to prevent unnecessary API calls

## Error Handling

- **401 Errors**: Prompts for re-authentication
- **5xx Errors**: Shows retry option
- **Network Errors**: Graceful degradation with error messages
- **Empty Data**: Displays appropriate empty states

## Performance

- **Caching**: Smart caching prevents duplicate API calls
- **Lazy Loading**: Charts only render when visible
- **Data Chunking**: Large datasets handled efficiently
- **Abort Controllers**: Prevent memory leaks from cancelled requests

## Customization

### Adding New Chart Types

1. Create chart component in `src/components/charts/`
2. Add data transformation in `src/utils/transforms.ts`
3. Integrate in `BudgetDashboard.vue`

### Extending API Support

1. Update types in `src/types/dashboard.ts`
2. Modify API calls in `src/api/budget.ts`
3. Update store logic in `src/stores/budgetDashboard.ts`

## Browser Support

- Modern browsers with ES2020+ support
- Chart.js canvas rendering
- Intl API for timezone handling
- CSS Grid and Flexbox

## License

This dashboard component is part of a larger budget management system.
