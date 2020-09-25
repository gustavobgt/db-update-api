const xlsxj = require('xlsx-to-json');
const { promises } = require('fs');
const sales = require('./models/salesModel.js');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

const readFile = promises.readFile;

const PATH = './src/data';

/**
 * Global Variables
 */

// Excel files
global.EXCEL_SALES = `${PATH}/SALES.xlsx`;
global.EXCEL_FINANCES = `${PATH}/FINANCES.xls`;
global.EXCEL_SERVICES = `${PATH}/SERVICES.xls`;

// Json files
global.JSON_SALES = `${PATH}/json/SALES.json`;
global.JSON_FINANCES = `${PATH}/json/FINANCES.json`;
global.JSON_SERVICES = `${PATH}/json/SERVICES.json`;

async function convertExcelToJson(excelFileName, jsonFileName) {
  try {
    xlsxj(
      {
        input: excelFileName,
        output: jsonFileName,
      },
      (err, _) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Convertion Succeded');
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}

async function convertion(excelFileName, jsonFileName) {
  try {
    await convertExcelToJson(excelFileName, jsonFileName);

    const data = await readFile(jsonFileName, 'utf8');

    return JSON.parse(data);
  } catch (err) {
    console.log(err);
  }
}

async function updateDataBase(json) {
  try {
    const documentsCount = await sales.countDocuments({});

    if (documentsCount !== json.length) {
      await sales.deleteMany({}, (err, res) => {
        console.log('All documents removed');
      });

      await sales.insertMany(json, (err, res) => {
        if (err) throw err;
        console.log(`Inserted: ${json.length} documents`);
      });
    } else {
      console.log('Nothing to update');
    }
  } catch (err) {
    console.log(err);
  }
}

console.log('Starting MongoDB Connection...');

(async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDB');

    console.log('Sarting update routine...');

    setInterval(function () {
      (async () => {
        try {
          const {
            EXCEL_SALES,
            JSON_SALES,
            EXCEL_FINANCES,
            JSON_FINANCES,
            EXCEL_SERVICES,
            JSON_SERVICES,
          } = global;

          const sales = await convertion(EXCEL_SALES, JSON_SALES);
          const finances = await convertion(EXCEL_FINANCES, JSON_FINANCES);
          const services = await convertion(EXCEL_SERVICES, JSON_SERVICES);

          const DB_ARRAY = [];

          sales.forEach((sale) => {
            const {
              customer,
              carModel,
              proposalNumber,
              yearMonthDay,
              salesPrice,
              cost,
              bonus,
              totalCost,
              parentUser,
            } = sale;
            // FINANCE
            const foundFinance = finances.find((finance) => {
              return (
                parseInt(proposalNumber) === parseInt(finance.proposalNumber)
              );
            });

            let tabel_FI = '';
            let otherTabels = '';
            let zeroRate = '';

            if (foundFinance) {
              const { nickname } = foundFinance;

              if (nickname === 'DN') {
                tabel_FI = 'S';
              } else if (nickname === 'TX0') {
                zeroRate = 'S';
              } else if (
                nickname === 'SEMPRENV' ||
                nickname === 'GO50' ||
                nickname === 'GO40'
              ) {
                otherTabels = 'S';
              }
            }

            // SERVICES
            // const foundServices = services.filter((service) => {
            //   return (
            //     parseInt(proposalNumber) === parseInt(service.proposalNumber)
            //   );
            // });

            const fullSale = {
              customer,
              carModel,
              proposalNumber,
              yearMonthDay,
              salesPrice,
              cost,
              bonus,
              totalCost,
              sellingExpenses,
              accessories,
              tabel_FI,
              otherTabels,
              zeroRate,
              parentUser,
            };

            console.log(fullSale);
          });

          // updateDataBase(sales);
        } catch (err) {
          console.log(err);
        }
      })();
    }, 2000);
  } catch (err) {
    console.log(`Error Connecting MongoDB - ${err}`);
  }
})();
