const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.listen(3000);



app.get('/', (req,res) => {
    let links = [];
    const url = 'https://letterboxd.com/safakkbilici/watchlist/'
    async function runFirst(){
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
    
        //const text = await page.evaluate(() => document.body.innerText);
        //console.log(text);
    
        links = await page.evaluate(() => Array.from(document.querySelectorAll('a'), (e) => e.href));
    
    
        await browser.close();
        
    }
    async function randomFilmGetter(){
        await runFirst();
        const pageLinks = links.filter((string) => string.includes('page'))
        const maxPageNumberString = await pageLinks[pageLinks.length - 1]
        const maxPageNumber = await maxPageNumberString.match(/\d+/)[0];
        let filmUrls = [];
        let filmCount = 0;
        for(let i = 1; i <= maxPageNumber; i++){
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            const watchlistPages = url + `page/${i}/`
            await page.goto(watchlistPages);
            await page.waitForSelector('#content', { timeout: 5_000 });
    
            //await page.screenshot({path: `result${i}.png` })
            const filmDatas = await page.evaluate(() => Array.from(document.querySelectorAll('.js-watchlist-main-content .poster-list .poster-container .poster div'), (e) => ({
                title: e.querySelector('a .frame-title').innerText,
                link: e.querySelector('a').href
            })));
            filmUrls = filmUrls.concat(filmDatas)
            // console.log(filmUrls);
            filmCount = filmUrls.length;
            await browser.close();
    
        }
        //console.log(filmCount);
    
        let randomFilmIndex = Math.floor(Math.random() * (filmCount - 1) + 1);
        //console.log(randomFilmIndex);
        return filmUrls[randomFilmIndex];
    }
    (async () => {
        res.json(await randomFilmGetter());
      })()
})

/*let links = [];
const url = 'https://letterboxd.com/safakkbilici/watchlist/'
async function runFirst(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    //const text = await page.evaluate(() => document.body.innerText);
    //console.log(text);

    links = await page.evaluate(() => Array.from(document.querySelectorAll('a'), (e) => e.href));


    await browser.close();
    
}
async function randomFilmGetter(){
    await runFirst();
    const pageLinks = links.filter((string) => string.includes('page'))
    const maxPageNumberString = await pageLinks[pageLinks.length - 1]
    const maxPageNumber = await maxPageNumberString.match(/\d+/)[0];
    let filmUrls = [];
    let filmCount = 0;
    for(let i = 1; i <= maxPageNumber; i++){
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const watchlistPages = url + `page/${i}/`
        await page.goto(watchlistPages);
        await page.waitForSelector('#content', { timeout: 5_000 });

        //await page.screenshot({path: `result${i}.png` })
        const filmDatas = await page.evaluate(() => Array.from(document.querySelectorAll('.js-watchlist-main-content .poster-list .poster-container .poster div'), (e) => ({
            title: e.querySelector('a .frame-title').innerText,
            link: e.querySelector('a').href
        })));
        filmUrls = filmUrls.concat(filmDatas)
        // console.log(filmUrls);
        filmCount = filmUrls.length;
        await browser.close();

    }
    //console.log(filmCount);

    let randomFilmIndex = Math.floor(Math.random() * (filmCount - 1) + 1);
    //console.log(randomFilmIndex);
    return filmUrls[randomFilmIndex];
}

(async () => {
    console.log(await randomFilmGetter())
  })()
*/
