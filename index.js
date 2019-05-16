const axios = require('axios')
const config = require('./config')
const fs = require('fs')
const path = require('path');

const { createCanvas, loadImage } = require('canvas')

const pixelSize = 1
const width = 400
const height = 200

const processData = (data, filename) => {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  let counter = 0
  for (var i = 0; i < data.width / data.pixelSize; i++) {
    for(var j = 0; j < data.height / data.pixelSize; j++) {
      const x = i * data.pixelSize
      const y = j * data.pixelSize
      ctx.fillStyle = data.data[counter]
      ctx.fillRect(x, y, data.pixelSize, data.pixelSize);
      counter++
    }
  }

  var buf = canvas.toBuffer();
  fs.writeFileSync("processed/images/" + filename, buf);
}

const processImage = file => {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const filename = path.parse(file).name; // hello

  loadImage('images/' + file).then(image => {
    ctx.drawImage(image, 0, 0, width, height)

    const result = []

    for (var i = 0; i < width; i = i + pixelSize) {
      for (var j = 0; j < height; j = j + pixelSize) {
        const im = ctx.getImageData(i, j, pixelSize, pixelSize)
        const data = im.data

        const rgba =
          'rgba(' +
          data[0] +
          ', ' +
          data[1] +
          ', ' +
          data[2] +
          ', ' +
          data[3] / 255 +
          ')'
        result.push(rgba)
      }
    }

    const out = {
      pixelSize,
      width,
      height,
      data: result
    }

    fs.writeFileSync('./processed/data/' + filename + '.json', JSON.stringify(out))

    processData(out, filename + '.png')
  })
}


const doThings = () => {
  fs.readdir('./images/', (err, files) => {
    files.forEach(file => {
      processImage(file)
    })
  })
}

doThings()
