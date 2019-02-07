import * as express from 'express';
import * as fs from 'fs';
import authHelpers from '../auth/_helpers';
import * as puppeteer from 'puppeteer';

const router = express.Router();
const frontendHostName = process.env.FE_HOST_NAME || 'http://localhost:8080';

async function generatePdf(page, reportUrl, fileName) {
  await page.goto(reportUrl, {waitUntil: 'networkidle0'});
  await page.emulateMedia('print');
  await page.pdf({path: fileName, printBackground: true, format: 'A4', preferCSSPageSize: true});
  return true;
}

router.get('/pdf/:workfile_id', authHelpers.ensureAuthenticated, async (req: any, res) => {
  try{
    let workfile_id = req.params.workfile_id;

    let fileName = 'output.pdf';
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(frontendHostName);
    await page.evaluate((jwtToken) => localStorage.setItem('__jWt-s3cReT__', jwtToken), req.headers.authorization.split(' ')[1]);
    const reportUrl = `${frontendHostName}/workfiles/${workfile_id}/report-preview`;
    const pdfSuccess = await generatePdf(page, reportUrl, fileName);
    if (pdfSuccess) {
      fs.createReadStream(fileName).pipe(res);
    }
    await browser.close();
  } catch(err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;
