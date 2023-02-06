require('dotenv').config({
    path: ".env"
});
const fs = require('fs');
const {
    google
} = require('googleapis');
let authorize = require('../../Authorization/authorise');
const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = process.env.SPREADSHEET_NAME;

//AUTH FUNCTION
const sheetAuth = async () => {
    const content = fs.readFileSync('./Credentials/credentials.json');
    const auth = await authorize(JSON.parse(content), './Credentials/token.json');
    const sheets = google.sheets({
        version: 'v4',
        auth
    });
    return sheets
};

//Copying FUNCTION
const readRow = async (rowNo) => {
    let sheets = await sheetAuth();
    const ranges = [`${sheetName}!A${rowNo}:H${rowNo}`];
    const {
        data
    } = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
    });
    let row = {
        id: data.valueRanges[0].values[0][0],
        status: data.valueRanges[0].values[0][4]
    }
    return row
}

const writeColumn = async (item, column, counter) => {
    let sheets = await sheetAuth();
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!${column}${counter}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[item]],
        },
      });
}

//MIGRATING FUNCTIONS
const sheetLength = async () => {
    let sheets = await sheetAuth();
    const range = [`${sheetName}!A:J`];
    const {
        data
    } = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
    });
    let len = data.values.length;
    return len
};

const readSheet = async (counter) => {
    let sheets = await sheetAuth();
    const ranges = [`${sheetName}!A${counter}:J${counter}`];
    const {
        data
    } = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
    });
    let row = {
        new_entity_id: await data.valueRanges[0].values[0][8],
        new_document_id: await data.valueRanges[0].values[0][9],
        crmEntity: await data.valueRanges[0].values[0][6],
        provider: await data.valueRanges[0].values[0][5]
    }
    return row
};

module.exports = {
    readRow,
    writeColumn,
    sheetLength,
    readSheet
}