import axios from 'axios'
// import fs from 'fs'
import FormData from 'form-data'
const pin = async ()=>{


  // Create a form and append the file to it.
  const form = new FormData()
  const axiosConfig = {
    headers: form.getHeaders()
  }

  // Add file
  // const filePath = `../2024.jpeg`
  // form.append('file', fs.createReadStream(filePath), '2024.jpeg')

  // Add text string as a file.
  form.append('file', 'Text data', 'test.txt')

  // Send the file to the server
  const result = await axios.post(`http://localhost:5001/pin`, form, axiosConfig)
  console.log('result', result.data)
}

pin()