const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

exports.generatePDF = async (html) => {
    const browser = await puppeteer.launch({
        executablePath: await chromium.executablePath(),
        args: chromium.args,
        headless: true
    });

    try {
        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "networkidle0"
        });

        return await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20px",
                right: "20px",
                bottom: "20px",
                left: "20px"
            }
        });

    } finally {
        await browser.close();
    }
};