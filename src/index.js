const xlsxj = require('xlsx-to-json');
const { promises } = require('fs');
const sales = require('./models/salesModel.js');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

const readFile = promises.readFile;

const PATH = './src/data/';

global.fileName = `${PATH}dados_NBS.json`;

async function convertExcelToJson() {
  try {
    xlsxj(
      {
        input: `${PATH}dados_NBS.xlsx`,
        output: `${PATH}dados_NBS.json`,
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
          await convertExcelToJson();

          const data = await readFile(global.fileName, 'utf8');
          const json = JSON.parse(data);

          updateDataBase(json);
        } catch (err) {
          console.log(err);
        }
      })();
    }, 10000);
  } catch (err) {
    console.log(`Error Connecting MongoDB - ${err}`);
  }
})();
