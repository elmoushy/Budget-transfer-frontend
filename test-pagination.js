// Test pagination calculation
function calculateTotalPages(totalCount, pageSize) {
  if (totalCount === 0) return 1
  return Math.ceil(totalCount / pageSize)
}

// Import base URL (add this if you're using the file in the application)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Test with the API response you provided
const apiResponse = {
  count: 10,
  next: `${BASE_URL}/api/budget/transfers/list/?page=2&page_size=6`,
  previous: null,
  results: [
    /* sample data */
  ],
}

// Extract page size from URL
function extractPageSize(url) {
  if (!url) return 6 // Default
  try {
    const parsedUrl = new URL(url)
    const pageSize = parsedUrl.searchParams.get('page_size')
    return pageSize ? parseInt(pageSize) : 6
  } catch (error) {
    console.error('Error parsing URL:', error)
    return 6 // Fallback
  }
}

const pageSize = extractPageSize(apiResponse.next)
const totalPages = calculateTotalPages(apiResponse.count, pageSize)

console.log(`API Count: ${apiResponse.count}`)
console.log(`Page Size: ${pageSize}`)
console.log(`Total Pages: ${totalPages}`)
console.log('Previous calculation (PAGE_SIZE = 10): ' + calculateTotalPages(apiResponse.count, 10))
console.log('Fixed calculation (PAGE_SIZE = 6): ' + calculateTotalPages(apiResponse.count, 6))
