/**
 * Quick test script to verify the navigation API integration
 * This file can be deleted after testing
 */

import apiService from './src/services/apiService.js'

// Test function to verify the API endpoint
async function testNavigationAPI() {
  try {
    console.log('Testing navigation API endpoint...')

    // This will test if the endpoint is properly configured
    const response = await apiService.accountEntities.getMainRoutes()

    console.log('API Response:', response)

    if (response.data && Array.isArray(response.data)) {
      console.log('✅ API endpoint working correctly')
      console.log('Route names found:')

      response.data.forEach((route) => {
        console.log(`  ID: ${route.id}, EN: ${route.english_name}, AR: ${route.arabic_name}`)
      })
    } else {
      console.log('❌ Invalid response format')
    }
  } catch (error) {
    console.error('❌ API Error:', error.message)

    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

// Uncomment to run the test
// testNavigationAPI()

export { testNavigationAPI }
