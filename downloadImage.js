const http = require('https')
const fs = require('fs')
const path = require('path')

const downloadImage = (filename, url) => {
  const filePath = path.join(__dirname, 'images/' + filename)
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath)
    const request = http
      .get(url, function(response) {
        const { statusCode } = response
        if (statusCode !== 200) {
          const error = new Error(
            'Request Failed.\n' + `Status Code: ${statusCode}`
          )
          console.error(error)
          reject(error)
          return
        }

        response.pipe(file)
      })
      .on('close', () => {
        resolve(filePath)
      })
  })
}


module.exports = (filename, url) => {
  return downloadImage(filename, url)
}
