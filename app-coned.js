require('dotenv').config()
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const puppeteer = require('puppeteer');
const server = new express();
const mongoose = require('mongoose')
const Outage = require('./models/conedOutage')
// const assert = require('assert')

// todo: make 2nd and 3rd level scrape
// todo: put in array loop
// todo: cast to numbers
// todo: add interval
// todo: make comparison before post
// todo: post to mongo (schema...)  <===<<<
// todo: push to git
server.use(express.json())
server.use(morgan('combined'));
const DEVELOPMENT = true;
if (DEVELOPMENT == true) {
    ENDPOINT = { hostname: 'vtran-dev.oem.nycnet', path: '/api-coned', port: 3100 }
    BROWSER_SETTINGS = {
        headless: true
    }
} else {
    ENDPOINT = { hostname: 'CPV-STG-IIS02.OEM.NYCNET', path: '/api-coned', port: 3100 }
    BROWSER_SETTINGS = {
        headless: true
    }
}
console.log('DEVELOPMENT: ', DEVELOPMENT);
server.use(
    cors({
        allowHeaders: ['sessionId', 'Content-Type'],
        exposedHeaders: ['sessionId'],
        origin: '*',
        methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
        preflightContinue: false
    })
);
const blockedResourceTypes = [
    'image',
    'media',
    'font',
    'texttrack',
    'object',
    'beacon',
    'csp_report',
    'imageset',
    'stylesheet',
    'script',
    'xhr',
    'gif',
    'png'
];
const skippedResources = [
    'quantserve',
    'adzerk',
    'doubleclick',
    'adition',
    'exelator',
    'sharethrough',
    'cdn.api.twitter',
    'google-analytics',
    'googletagmanager',
    'google',
    'fontawesome',
    'facebook',
    'analytics',
    'optimizely',
    'clicktale',
    'mixpanel',
    'zedo',
    'clicksor',
    'tiqcdn',
    'map'
];

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}
const URL_CONED = 'https://apps.coned.com/stormcenter/external/default.html';
// !!!!!! CONEDISON FEEDERS DATA
// !!!!!! CONEDISON FEEDERS DATA
// !!!!!! CONEDISON FEEDERS DATA
let oldData = null;

// server.use('/outages', outagesRouter)

mongoose.connect(
    process.env.DATABASE_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }
)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to database.'))

server.post('/', async (req, res) => {
    const outage = new Outage({
        test: "test"
    })

    try {
        const newSubscriber = await outage.save()
        res.status(201).json(newSubscriber)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})


let j = null;
let k = null;
let conedData = null;

// $$$  SETTIMEOUT INTERVAL 60 SECONDS
setTimeout(async function getConed() {
    // try {
    const browser = await puppeteer.launch(BROWSER_SETTINGS);
    const page = await browser.newPage();

    await page.goto(URL_CONED).catch(err => {
        console.log('caught goto: ', err.message);
    }), { timeout: 25000, waitUntil: 'networkidle2' }



    await page.waitForSelector('header');
    const header = await page.$$('header');
    // console.log('header length: ', header.length);
    const buttonMenu = await header[0].$('#btn-menu');
    // console.log('butonMenu: ', buttonMenu);
    const buttonName = await page.evaluate(buttonMenu => buttonMenu.innerText, buttonMenu);
    // console.log('buttonName: ', buttonName);
    // buttonMenu.click();  // open menu is default

    await page.waitForSelector("#menu-content > a:nth-child(9)");
    const menuSummary = await page.$$('#menu-content > a:nth-child(9)');
    // console.log('menuSummary Length: ', menuSummary.length);
    const menuSummaryButton = await menuSummary[0].$('#menu-summary'); //#menu-summary
    // console.log('summaryButton', menuSummaryButton);
    const menuSummaryButtonName = await page.evaluate(menuSummaryButton => menuSummaryButton.innerText, menuSummaryButton);
    // console.log('summary Button Name: ', menuSummaryButtonName);
    menuSummaryButton.click();
    wait(100);


    await page.waitForSelector("#menu-content-summary"); //#view-summary-nyc //#menu-content-summary
    const menuSummaryNYC = await page.$$('#menu-content-summary');
    // console.log('menuSummaryNYC length: ', menuSummaryNYC);
    const viewSummaryNYCButton = await menuSummaryNYC[0].$('#view-summary-nyc');
    // console.log('viewSummaryNYCButton: ', viewSummaryNYCButton);
    const viewSummaryNYCButtonName = await page.evaluate(viewSummaryNYCButton => viewSummaryNYCButton.innerText, viewSummaryNYCButton);
    // console.log('viewSummaryNYCButtonName: ', viewSummaryNYCButtonName);
    viewSummaryNYCButton.click();
    wait(100);

    await page.waitForSelector('#report-panel-nyc > div.report-panel-body.sc-panel-body > div.report-panel-totals');
    const tableNYC = await page.$$('#report-panel-nyc > div.report-panel-body.sc-panel-body > div.report-panel-totals');
    // console.log('tableNYC: ', tableNYC.length);
    // wait(100);
    // const outage1 = await tableNYC[0].$eval('div.desktopTotals > div.activeOutageHeader > label.total-outages-rep-value', outage => outage.innerText);
    // console.log('outage1: ', outage1);
    // wait(1000);
    // await page.waitForNavigation({
    //     waitUntil: 'networkidle2',
    // });
    await page.waitForSelector("#report-panel-nyc-table > tbody");

    const headLine = await page.evaluate(() => {
        // outageName = document.querySelector("#report-panel-nyc > div.report-panel-body.sc-panel-body > div.report-panel-totals > div.desktopTotals > div.custAffectedHeader > label.bold").innerHTML;
        outageAreaName = document.querySelector("#report-panel-nyc > div.report-panel-body.sc-panel-body > div.report-panel-totals > div.desktopTotals > div.countyName.bold").innerHTML.replace(":", "");
        currentOutage = document.querySelector("#report-panel-nyc > div.report-panel-body.sc-panel-body > div.report-panel-totals > div.desktopTotals > div.activeOutageHeader > label.total-outages-rep-value").innerHTML.replace(',', '');
        customersOut = document.querySelector("#report-panel-nyc > div.report-panel-body.sc-panel-body > div.report-panel-totals > div.desktopTotals > div.custAffectedHeader > label.total-customers-affected-rep-value").innerHTML.replace(',', '');
        // console.log('test', currentOutage);
        lastUpdate = document.querySelector("#report-panel-nyc > div.report-panel-body.sc-panel-body > div.report-panel-totals > div.desktopTotals > div.lastUpdatedHeader > label.last-updated-value").innerHTML;

        downloadDate = new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour12: false });
        updateFrequency = document.querySelector("#report-panel-nyc > div.report-panel-body.sc-panel-body > div.report-panel-totals > div.desktopTotals > div.lastUpdatedHeader > label.update-wording-value").innerHTML;
        reportDescription = document.querySelector("#report-panel-nyc > div.report-panel-body.sc-panel-body > div.report-panel-description").innerText;
        return {
            "outageAreaName": outageAreaName,
            "currentOutages": currentOutage,
            "customersOut": customersOut,
            // "downloadDate": downloadDate,
            "lastUpdate": lastUpdate,
            "updateFrequency": updateFrequency,
            "reportDescription": reportDescription
        };
    })

    var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
    var utc2 = new Date().toLocaleString("en-US", { timeZoneName: "short", timeZone: "America/New_York", hour12: false });
    var utc3 = new Date();
    // console.log('---utc----', utc2);
    // console.log('---utc----', utc3);


    const boroughsRaw = await page.evaluate(() => {
        const tds = Array.from(document.querySelectorAll('#report-panel-nyc-table > tbody  > tr '),
            row => Array.from(row.querySelectorAll('td'), cell => cell.textContent)
        )
        return tds;
        // return tds.map(td => {
        //     return txt = td.innerHTML;
        // return txt.replace(/<a [^>]+>[^<]*<\/a>/g, '').trim();
        // })
    })

    console.log("Number of boroughs and zones: ", boroughsRaw.length);
    // const tmp_values = {};
    const boroughs = [];
    for (var i = 2; i < boroughsRaw.length; i++) {
        lastStr = boroughsRaw[i][5].split(/[_]+/).pop();
        borough_fmt = boroughsRaw[i][0].toLowerCase().replace(/\s+/g, "");
        if (lastStr === borough_fmt) {
            impactedArea = 'borough';
        } else { impactedArea = 'neighborhood' }

        var tmp_values = {
            "location": boroughsRaw[i][0],
            "customersOutage": boroughsRaw[i][1].replace(',', ''),
            "customerServed": boroughsRaw[i][2].replace(',', ''),
            "estimateRestore": boroughsRaw[i][3],
            "zone": boroughsRaw[i][5],
            "impactedArea": impactedArea
        };
        boroughs.push(tmp_values);
    }

    let dataSource = { "conedOutages": [{ "headLine": headLine, "boroughs": boroughs }] }
    // console.log('dataSource2: ', dataSource2.conedOutages[0].boroughs[0]);
    // $ succeed saving to mongo.
    // todo: modify save block and put inside compare.
    const outage = new Outage(
        { conedOutages: dataSource.conedOutages }
    )


    // console.log('dataSource2 :', JSON.stringify(dataSource2, null, ' '));
    let newData = dataSource;
    conedData = dataSource;
    // console.log('dataSource2 :', dataSource2);
    // $COMPARE NEW DATA WITH OLD DATA: NULL IS NO CHANGE

    if (oldData != null) {
        let diff = getDifference(oldData, newData);
        if (diff == null) {
            console.log('------> NO CHANGE -- NO SAVE');
        } else {
            console.log('------> NEW DATA ----PREPARING TO SAVE...');
            // console.log('diff :', diff);
            oldData = newData;
            console.log('diff :', JSON.stringify(diff, null, ' '));

            // TODO: POST NEWDATA TO MONGO
            outage.save((error, outage) => {
                if (error) return console.log('error :', error);
                else return console.log('outage is saved:', outage);
            });
            k++;
            // console.log(oldData);
        }
        j++;
        console.log(`${j} comparison and ${k} uploads`);

    } else {
        oldData = newData;
        k = 1;
        console.log('interval number: FIRST PASS.  ----interval');
        outage.save((error, outage) => {
            if (error) return console.log('error :', error);
            else return console.log('outage is saved:', outage);
        });
    }
    await page.close();
    await browser.close();

    setTimeout(getConed, 60 * 1000)

}, 1000);


server.get('/api-coned', (req, res) => {
    (async function getConed() {

        // console.log('test %%%%', conedData);
        try {
            res.end(JSON.stringify(conedData, null, ' '));
        } catch (err) {
            console.log('failure: ', err);
            res.sendStatus(500);
            res.end();
            return;
        }
    })();
});


server.listen(ENDPOINT, () => {
    console.log(`http://${ENDPOINT.hostname}:${ENDPOINT.port}${ENDPOINT.path}`);
});


function getDifference(o1, o2) {
    var diff = {};
    var tmp = null;
    if (JSON.stringify(o1) === JSON.stringify(o2)) return null;

    for (var k in o1) {
        if (Array.isArray(o1[k]) && Array.isArray(o2[k])) {
            tmp = o1[k].reduce(function (p, c, i) {
                var _t = getDifference(c, o2[k][i]);
                if (_t)
                    p.push(_t);
                return p;
            }, []);
            if (Object.keys(tmp).length > 0)
                diff[k] = tmp;
        } else if (typeof (o1[k]) === "object" && typeof (o2[k]) === "object") {
            tmp = getDifference(o1[k], o2[k]);
            if (tmp && Object.keys(tmp) > 0)
                diff[k] = tmp;
        } else if (o1[k] !== o2[k]) {
            diff[k] = o2[k]
        }
    }
    return diff;
}
