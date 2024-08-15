import axios from 'axios'
// import fs from 'fs'
import FormData from 'form-data'

const upload = async () => {
  // Create a form and append the file to it.
  const form = new FormData()
  const axiosConfig = {
    headers: form.getHeaders()
  }

  // Add file
  // const filePath = `../image.jpeg`
  // form.append('file', fs.createReadStream(filePath), 'image.jpeg')

  // Add text string as a file.
  form.append('file', 'Text data', 'test.txt')

  // Send the file to the server
  const result = await axios.post('http://localhost:5001/files', form, axiosConfig)
  console.log('result', result.data)
}

upload()
