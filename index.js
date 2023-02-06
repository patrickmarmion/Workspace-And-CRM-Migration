let {
    readRow,
    writeColumn,
    sheetLength,
    readSheet
} = require('./Controllers/Google/copyingFunctions');
let docDetails = require('./Controllers/PandaDoc/details');
let downloadDoc = require('./Controllers/PandaDoc/download');
let subscribe = require('./Controllers/PandaDoc/polling');
let updateDoc = require('./Controllers/PandaDoc/status');
const updateLinkedObject = require('./Controllers/PandaDoc/pandaFunctions');
let {
    database,
    createDB,
    sizeFile
} = require('./Database/entry');
const create = require('./Controllers/PandaDoc/create');

let counter = 1;

//Copying Functions 
const index = async () => {
    //Loops though Folder of document's to be migrated and returns ids of Completed Documents
    let doc = await readRow(counter);

    //Retrieve details of each document and download them
    let result = await docDetails(doc.id);

    await downloadDoc(result);

    //Store certain details of document into a json log file 
    //then create a new doc in other workspace from the downloaded PDF
    let newDocId = await db(result);

    //Change status of newly created doc to Completed
    await updateDoc(newDocId, result);

    //Write ID of new doc back to spreadsheet
    await writeColumn(newDocId, "J", counter);
};

const db = async (result) => {
    let dbase = await database(result)
        .then(data => createDB(data))
        .catch(err => console.log(err));

    let check = await sizeFile(dbase)
        .then(res => create(res.result))
        .then(id => subscribe(id))
        .catch(err => console.log(err));

    return check
};

//Migration Functions
const readEntity = async () => {
    let rowDetail = await readSheet(counter);
    if ((rowDetail.provider) && (rowDetail.crmEntity === "opportunity")) {
        await updateLinkedObject(rowDetail);
        await writeColumn("Object Changed", "K", counter)
    } else {
        await new Promise(resolve => setTimeout(resolve, 200));
        return
    }
}

const script = async () => {
    let limit = await sheetLength();

    do {
        await index()
        counter ++;
        console.log(counter);
    } while (counter <= limit);

    do {
        await readEntity()
        counter++;
        console.log(counter)
    } while (counter <= limit);

};

script();