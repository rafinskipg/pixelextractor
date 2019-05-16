const phantom = require('phantom');
const cheerio = require('cheerio')
const config = require('./config')
const downloadImage = require('./downloadImage')

const settingsPage = {
  headers: {
    userAgent : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36'
  }
}

function fetchInstagram(page, url) {
 
  return fetchInstagramDetail(page, url)
    .then(data => {
      console.log('finished getting instagram page');
  
      return data
    })
}

function waitUntilImagesLoaded(page, url) {
  const TIME_WAIT = 1000
  
  return new Promise((resolve, reject) => {

    let timesWait = 0;
    
    // REcursive
    const doWait = (page, time, cb) => {
      timesWait++;
      console.log('Waiting')
      setTimeout(() => {
        page.property('content')
          .then(content => {
            const $ = cheerio.load(content)
            const imgs = $('article img').attr('src')
            
            if(imgs) {
              // Has finished cloud protection
              resolve(page.property('content'))
            } else if(timesWait < 4) {
              cb(page, time, cb)
            } else {
              console.log('Rejecting')
              reject()
            }
          })
      }, time)
    }
    
    page.open(url, settingsPage)
      .then(s => {
        doWait(page, TIME_WAIT, doWait)
      })
      .catch(reject)

  })
}


function fetchInstagramDetail(page, url, urlRedirect) {
  console.log('opening page', url)
  return waitUntilImagesLoaded(page, url)
    .then(content => {
      console.log('page opened')
  
      const $ = cheerio.load(content)
      const imgs = $('article img')

      const srcs = []
      const srcSets = []
      imgs.each((index, img) => {
        srcs.push($(img).attr('src')) 
        srcSets.push($(img).attr('srcset'))
      })
      console.log('Fetched content')

      const data = {
        imgs: srcs,
        sets: srcSets,
        error: false
      }

      return data
    })
    .catch(err => {
      console.log(err, 'Can not open new page')
      return {
        crawled: false,
        error: true
      }
    })
}

function scrap() {
  return phantom.create()
    .then(ph => {
      return ph.createPage()
        .then(page => {
          page.viewportSize = {
            width: 1200,
            height: 1200
          };
          console.log('Going to scrap 1 page')
          return fetchInstagram(page, config.page)
        })
        .then(res => {
          console.log('instagram scrapped')
          // Close instance
          return ph.exit()
          .then(whatever => {
            console.log('Closed instance')
            return res
          })
        })

    })
}

scrap()
  .then(data => {
    console.log('Saving images')
    console.log(data.imgs)


    const promises = []
    data.imgs.forEach(src => {
      promises.push(downloadImage(Date.now() + '.png', src))
    })

    return Promise.all(promises)
  })
  .then(() => {
    console.log('All images saved')
  })
  .catch(err => {
    console.log('Error downloading images, ', err)
  })