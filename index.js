const config = require('./config')
const fs = require('fs')
const path = require('path')

const { createCanvas, loadImage } = require('canvas')

const pixelSize = 1
const width = 650
const height = 650

// Removes all colors under this threshold
const filterFunction = item => {
  if (item[0] < 150 && item[1] < 150 && item[2] < 150) {
    return item
  } else {
    return [255, 255, 255, 255]
  }
}

const reducerFunction = item => {
  return item.map(p => p / 255)
}

const amplifierFunction = item => {
  return item.map(p => p * 255)
}

const randomize = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

const processData = (data, filename) => {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const dots = data.data

  let counter = 0
  for (var i = 0; i < data.width / data.pixelSize; i++) {
    for (var j = 0; j < data.height / data.pixelSize; j++) {
      const x = i * data.pixelSize
      const y = j * data.pixelSize
      const item = amplifierFunction(dots[counter])

      const color =
        'rgba(' +
        item[0] +
        ', ' +
        item[1] +
        ', ' +
        item[2] +
        ', ' +
        item[3] / 255 +
        ')'
      ctx.fillStyle = color
      ctx.fillRect(x, y, data.pixelSize, data.pixelSize)
      counter++
    }
  }

  var buf = canvas.toBuffer()
  fs.writeFileSync('processed/images/' + filename, buf)
}

const processImage = file => {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const filename = path.parse(file).name // hello

  loadImage('images/' + file).then(image => {
    ctx.drawImage(image, 0, 0, width, height)

    const result = []

    for (var i = 0; i < width; i = i + pixelSize) {
      for (var j = 0; j < height; j = j + pixelSize) {
        const im = ctx.getImageData(i, j, pixelSize, pixelSize)
        const data = im.data

        result.push(reducerFunction(filterFunction(data)))
      }
    }

    const out = {
      pixelSize,
      width,
      height,
      data: result
    }

    fs.writeFileSync(
      './processed/data/' + filename + '.json',
      JSON.stringify(out)
    )

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
