#!/bin/bash
echo "Starting Budget Transfer Dashboard in Mock Mode..."
echo ""
echo "Available at: http://localhost:3000"
echo "Mock Mode: Enabled (using sample data)"
echo ""
VITE_MOCK_MODE=true npm run dev -- --port 3000
