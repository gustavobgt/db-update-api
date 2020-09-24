const xlsxj = require('xlsx-to-json');
const sales = require('./testModel');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

console.log('Starting MongoDB Connection...');

(async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log(`Error Connecting MongoDB - ${err}`);
  }
})();

try {
  xlsxj(
    {
      input: 'dados_NBS.xlsx',
      output: 'dados_NBS.json',
    },
    (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.error(result);
      }
    }
  );
} catch (err) {
  console.log(err);
}

// setInterval(function () {
//   (async () => {
//     try {
//       const data = await csvtojson().fromFile('bezkoder.csv');

//       // log the JSON array
//       console.log(data);

//       testModel.deleteMany({}, (err, res) => {
//         console.log('All documents removed');
//       });
//       testModel.insertMany(data, (err, res) => {
//         if (err) throw err;
//         console.log(`Inserted: ${data.length} rows`);
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   })();
// }, 10000);
