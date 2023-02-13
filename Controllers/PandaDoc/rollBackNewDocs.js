const axiosInstance = require("../../Config/axiosInstance");
const fs = require('fs');
require('dotenv').config({
    path: "../../.env"
})
const {
    google
} = require('googleapis');
let authorize = require('../../Authorization/authorise');
const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = process.env.SPREADSHEET_NAME;
const access_token = process.env.NEW_ACCESS_TOKEN;
const headers = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  }
};

let counter = 4043;

const sheetAuth = async () => {
    const content = fs.readFileSync('../../Credentials/credentials.json');
    const auth = await authorize(JSON.parse(content), '../../Credentials/token.json', '../../Credentials/refresh.json');
    const sheets = google.sheets({
        version: 'v4',
        auth
    });
    return sheets
};

const sheetLength = async () => {
    let sheets = await sheetAuth();
    const range = [`${sheetName}!A:H`];
    const {
        data
    } = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
    });
    let len = data.values.length;
    return len
};


const readRow = async (rowNo) => {
    let sheets = await sheetAuth();
    const ranges = [`${sheetName}!A${rowNo}:K${rowNo}`];
    const {
        data
    } = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
    });
    let row = data.valueRanges[0].values[0][9]
    return row
}

const deleteDoc = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    await axiosInstance.delete(`https://api.pandadoc.com/public/v1/documents/${id}`, headers);
}

const script = async () => {
    let limit = await sheetLength();

    do {
        let id = await readRow(counter);
        console.log(id);
        await deleteDoc(id);
        counter ++;
        console.log(counter);
    } while (counter <= limit);

};

script();