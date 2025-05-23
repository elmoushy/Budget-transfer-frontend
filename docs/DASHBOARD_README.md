# Futuristic Quantum Dashboard

## Overview

A cutting-edge dashboard component that provides real-time budget transfer analytics with a futuristic quantum-themed design.

## Features

### 🎨 Visual Design

- **Quantum Theme**: Futuristic design with neural networks, energy flows, and orbital animations
- **Glass Morphism**: Modern translucent design elements with backdrop blur effects
- **Responsive Grid**: Adaptive layout that works on all screen sizes
- **Dark Mode**: Full dark theme support with automatic theme switching
- **RTL Support**: Right-to-left language support for Arabic

### 📊 Data Visualization

- **Primary Metrics**: Interactive constellation view of key statistics
- **Approval Pipeline**: Visual pipeline showing approval workflow status
- **Cost Center Flow**: Toggle between inflow/outflow analysis
- **Interactive Charts**: Chart.js powered visualizations with theme adaptation
- **Network Analysis**: Visual representation of transfer relationships
- **Timeline View**: Event-based timeline of recent transfers

### 🔗 API Integration

- **Real-time Data**: Connected to `/api/budget/dashboard/` endpoint
- **Error Handling**: Comprehensive error states and retry functionality
- **Loading States**: Animated loading indicators with quantum effects
- **Authentication**: Secure API calls with JWT token authentication

## Usage

### Basic Implementation

```vue
<template>
  <Dashboard />
</template>

<script>
import Dashboard from '@/views/Dashboard.vue'

export default {
  components: {
    Dashboard,
  },
}
</script>
```

### API Endpoint

```
GET /api/budget/dashboard/
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Expected Response Format

```typescript
interface DashboardData {
  total_transfers: number
  total_transfers_far: number
  total_transfers_afr: number
  total_transfers_fad: number
  approved_transfers: number
  rejected_transfers: number
  pending_transfers: {
    Level1: number
    Level2: number
    Level3: number
    Level4: number
  }
  filtered_combinations: Array<{
    cost_center_code_str: string
    account_code_str: string
    total_from_center: number
    total_to_center: number
  }>
  cost_center_totals: Array<
    Array<{
      cost_center_code_str: string
      total_from_center: number
      total_to_center: number
    }>
  >
  account_code_totals: Array<
    Array<{
      account_code_str: string
      total_from_center: number
      total_to_center: number
    }>
  >
  all_combinations: Array<
    Array<{
      cost_center_code_str: string
      account_code_str: string
      total_from_center: number
      total_to_center: number
    }>
  >
}
```

## Configuration

### Theme Variables

The dashboard uses CSS custom properties for theming:

```css
:root {
  --quantum-primary: #0f766e;
  --quantum-secondary: #06b6d4;
  --quantum-accent: #8b5cf6;
  --quantum-danger: #ef4444;
  --quantum-success: #10b981;
  --quantum-warning: #f59e0b;
}
```

### Chart Configuration

Charts are automatically themed based on the current theme:

```javascript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: textColor },
    },
  },
}
```

## Component Structure

### Main Sections

1. **Neural Header** - Title and sync indicator
2. **Metrics Constellation** - Primary KPI display
3. **Approval Pipeline** - Workflow status visualization
4. **Cost Center Flow** - Flow analysis with toggles
5. **Charts Matrix** - Interactive data charts
6. **Network Analysis** - Relationship mapping
7. **Timeline Visualization** - Event timeline

### State Management

- Uses Vue 3 Composition API for reactive state
- Integrates with Pinia theme store
- Manages loading, error, and data states
- Handles chart lifecycle and updates

## Performance

### Optimizations

- Lazy chart loading
- Efficient data processing
- Hardware-accelerated animations
- Minimal re-renders with Vue reactivity

### Browser Support

- Modern browsers with ES6+ support
- Mobile responsive design
- Touch interaction support

## Accessibility

### Features

- High contrast color scheme
- Keyboard navigation
- Screen reader compatible
- Semantic HTML structure
- Focus indicators

## Development

### Local Testing

1. Start the development server: `npm run dev`
2. Navigate to the dashboard route
3. Ensure API endpoint is available
4. Check browser console for any errors

### Debugging

- Use Vue DevTools for component inspection
- Check network tab for API calls
- Monitor console for chart rendering issues

## Troubleshooting

### Common Issues

1. **API Call Fails**

   - Check authentication token
   - Verify endpoint URL in `src/config/api.js`
   - Ensure CORS is configured on backend

2. **Charts Not Rendering**

   - Verify Chart.js is installed
   - Check canvas element is mounted
   - Ensure data format matches expected structure

3. **Styling Issues**
   - Clear browser cache
   - Check CSS custom properties
   - Verify responsive breakpoints

### Error States

The dashboard handles various error conditions:

- Network failures
- Authentication errors
- Invalid data formats
- Missing API endpoints

## Future Enhancements

### Planned Features

- Real-time WebSocket updates
- Advanced filtering options
- Export functionality
- Custom dashboard layouts
- Additional chart types

### Performance Improvements

- Virtual scrolling for large datasets
- Chart data caching
- Progressive loading
- Background data refresh

## License

Part of the Budget Transfer Frontend application.
