/**
 * API Usage Audit Script
 *
 * This script scans the codebase to ensure that all API calls flow
 * through the centralized API service and not directly from Vue components.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const sourcePath = path.resolve(__dirname, '../src')
const excludeDirs = ['services', 'config'] // Directories where direct API usage is allowed
const excludeFiles = ['apiService.js', 'api.js'] // Files where direct API usage is allowed

// Patterns to search for
const PATTERNS = {
  AXIOS_IMPORT: 'import axios from',
  AXIOS_USAGE: 'axios\\.(get|post|put|delete|patch)',
  API_BASE_URL: 'API_BASE_URL',
  FETCH_API: 'fetch\\(',
  DIRECT_HTTP_URL: '(http|https)://',
}

// Results storage
const results = {
  issues: [],
  componentsChecked: 0,
  issueCount: 0,
  servicesCount: 0,
}

/**
 * Check if a file should be excluded from checking
 */
function shouldExcludeFile(filePath) {
  const relativePath = path.relative(sourcePath, filePath)

  // Check if file is in an excluded directory
  for (const dir of excludeDirs) {
    if (relativePath.startsWith(dir + path.sep)) {
      return true
    }
  }

  // Check if file is an excluded file
  for (const file of excludeFiles) {
    if (path.basename(filePath) === file) {
      return true
    }
  }

  return false
}

/**
 * Scan a file for direct API usage
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const relativePath = path.relative(sourcePath, filePath)
    const fileIssues = []

    // Check patterns
    for (const [name, pattern] of Object.entries(PATTERNS)) {
      const regex = new RegExp(pattern)
      if (regex.test(content)) {
        fileIssues.push({
          type: name,
          line: findLineNumber(content, regex),
        })
      }
    }

    if (fileIssues.length > 0) {
      results.issues.push({
        file: relativePath,
        issues: fileIssues,
      })
      results.issueCount += fileIssues.length
    }

    // Count file by type
    if (filePath.endsWith('.vue')) {
      results.componentsChecked++
    } else if (filePath.includes('/services/') && !excludeFiles.includes(path.basename(filePath))) {
      results.servicesCount++
    }
  } catch (err) {
    console.error(`Error scanning ${filePath}:`, err.message)
  }
}

/**
 * Find the line number for a pattern match
 */
function findLineNumber(content, pattern) {
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      return i + 1
    }
  }
  return -1
}

/**
 * Walk the directory tree and scan each file
 */
function walkDir(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      walkDir(filePath)
    } else if (
      (filePath.endsWith('.vue') || filePath.endsWith('.js') || filePath.endsWith('.ts')) &&
      !shouldExcludeFile(filePath)
    ) {
      scanFile(filePath)
    }
  }
}

/**
 * Generate the report
 */
function generateReport() {
  console.log('\n=================================================')
  console.log('          API USAGE AUDIT REPORT                 ')
  console.log('=================================================\n')

  console.log(`Vue Components Checked: ${results.componentsChecked}`)
  console.log(`Service Files Checked: ${results.servicesCount}`)
  console.log(`Total Issues Found: ${results.issueCount}\n`)

  if (results.issues.length === 0) {
    console.log(
      '✅ No direct API calls found in components! All API calls are properly centralized.',
    )
  } else {
    console.log('❌ Found direct API usage in the following files:')

    for (const item of results.issues) {
      console.log(`\nFile: ${item.file}`)
      for (const issue of item.issues) {
        console.log(`  - Line ${issue.line}: ${issue.type}`)
      }
    }

    console.log('\n⚠️ These files need to be refactored to use the centralized API service.')
  }

  console.log('\n=================================================\n')
}

// Main execution
console.log('Starting API usage audit...')
walkDir(sourcePath)
generateReport()
