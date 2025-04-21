/**
 *  Replaces the URL in the documentation and code with the base URL
 */
import fs from 'fs'
import path from 'path'

const baseUrl = process.env.API_URL || 'localhost:8001' // For example, take from environment variable

const replaceDocsUrl = (filePath) => {
  // Path to apidoc's index.html or code comments
  const bundlePath = path.resolve(filePath) // or the JS file containing the comment

  // Dynamic base URL that can be configured depending on environment

  // Read the documentation or code file
  const content = fs.readFileSync(bundlePath, 'utf-8')

  // Replace the dynamic URL in the example block
  const result = content.replace(/localhost:5001/g, baseUrl)

  // Write the modified file
  fs.writeFileSync(filePath, result, 'utf-8')

  console.log(`✅ Dynamic URL replacement completed: "localhost:5001" → "${baseUrl}"`)
}

replaceDocsUrl('./docs/assets/main.bundle.js')
replaceDocsUrl('./docs/index.html')
