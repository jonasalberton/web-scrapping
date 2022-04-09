import puppeteer from "puppeteer";
import createCsvWriter from "csv-writer";
import { USER, PASSWORD, FINACIAL_URL, LOGIN_URL } from "../config.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDueDateList() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(LOGIN_URL);
  await page.type("#j_username", USER);
  await page.type("#senha", PASSWORD);
  await page.click("#btnLogin");
  await sleep(2000);
  await page.goto(FINACIAL_URL);
  await sleep(2000);

  const dueDates = await page
    .$$eval("tbody > tr > td:nth-child(3n) > span", (trs) => trs.map((tr) => tr.innerHTML));
  
  await page.screenshot({ path: "out/example.png" });
  await browser.close();
  return dueDates;
}

function generateCsvFile(data) {
  createCsvWriter
    .createObjectCsvWriter({
      path: "out/agenda.csv",
      header: [
        { id: "subject", title: "Subject" },
        { id: "startDate", title: "Start date" },
        { id: "allDay", title: "All Day Event" },
      ],
    })
    .writeRecords(data)
    .then(() => console.log("The CSV file was written successfully"));
}

function transformData(dueDates) {
  return dueDates.map((dueDate) => {
    const array = dueDate.split("/");
    const formatedDate = `${array[1]}/${array[0]}/${array[2]}`;

    return {
      subject: "Pagamento Pos Graduacao",
      startDate: formatedDate,
      allDay: true,
    };
  });
}


async function init() {
  const dueDateList = await getDueDateList();
  const data = transformData(dueDateList);
  generateCsvFile(data);
}

init();