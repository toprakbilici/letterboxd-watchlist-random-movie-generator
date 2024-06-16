const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const cors = require('cors')
const bodyparser = require('body-parser')

app.listen(8383);


app.use(cors({
    origin: 'http://localhost:3000',
}))
app.use(bodyparser.json())



let username;
app.post(('/'), (req,res) => {
    username = req.body.username;
    console.log(username);
})
app.get('/', (req,res) => {
    let links = [];
    const url = `https://letterboxd.com/${username}/watchlist/`

    async function runFirst(){
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, {waitUntil: 'domcontentloaded'});
        await page.waitForSelector('a', { timeout: 5_000 });
    

        links = await page.evaluate(() => Array.from(document.querySelectorAll('a'), (e) => e.href));
    
    
        await browser.close();
        
    }
    async function randomFilmGetter(){
        await runFirst();
        const pageLinks = links.filter((string) => string.includes('page'))
        const maxPageNumberString = await pageLinks[pageLinks.length - 1]
        try {
            let maxPageNumber = 0;
            if (maxPageNumberString !== undefined) {
                const matchResult = maxPageNumberString.match(/\d+/);
                if (matchResult) {
                    maxPageNumber = parseInt(matchResult[0], 10);
                } else {
                    maxPageNumber = 1; 
                }
            } else {
                maxPageNumber = 1;
            }
            let filmUrls = [];
            let filmCount = 0;
            for(let i = 1; i <= maxPageNumber; i++){
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                const watchlistPages = url + `page/${i}/`
                await page.goto(watchlistPages, {waitUntil: 'networkidle0'});
                await page.waitForSelector('.js-watchlist-main-content .poster-list .poster-container .poster div', { timeout: 10000 });
        
                const filmDatas = await page.evaluate(() => Array.from(document.querySelectorAll('.js-watchlist-main-content .poster-list .poster-container .poster div'), (e) => ({
                    title: e.querySelector('a .frame-title').innerText,
                    link: e.querySelector('a').href
                })));
                filmUrls = filmUrls.concat(filmDatas)
                filmCount = filmUrls.length;
                console.log(filmCount)
                console.log(filmUrls)
                await browser.close();
        
            }
    
        
            let randomFilmIndex = Math.floor(Math.random() * (filmCount - 1) + 1);
            return filmUrls[randomFilmIndex];
            
        } catch (error) {
            console.log(error)
        }

    }
    (async () => {
        res.json(await randomFilmGetter());
      })()
})



