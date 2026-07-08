const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

exports.generatePDF = async (html) => {
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
    });

    try {
        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "networkidle0",
        });

        return await page.pdf({
            format: "A4",
            printBackground: true,
        });
    } finally {
        await browser.close();
    }
};