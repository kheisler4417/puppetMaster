const express = require('express');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

const puppeteer = require('puppeteer');

let results = [];

app.post('/scrape', async (req, res) => {
    const { url, selector } = req.body;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        const data = await page.$$eval(selector, elements => elements.map(e => e.textContent));
        await browser.close();

        const result = {
            url,
            selector,
            data,
            timestamp: new Date()
        };
        results.unshift(result);

        if (results.length > 10) {
            results.pop();
        }

        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Failed to scrape data' });
    }
});

app.get('/past-results', (req, res) => {
    res.send(results);
});
