const fs = require('fs');
const database = async (result) => {
    const size = checkSize();

    const document = {
        "id": result.id,
        "name": result.name,
        "status": result.status,
        "grand_total": result.grand_total.amount,
        "document_size": `${size} MBs`
    }

    return {
        result,
        document,
        size
    }
}

const checkSize = () => {
    const stats = fs.statSync('panda.pdf');
    const MB = stats.size / 1000000;
    return MB
}

const createDB = (data) => {
    let read = JSON.parse(fs.readFileSync('./Database/documents.json'));
    read.push(data.document);
    fs.writeFileSync('./Database/documents.json', JSON.stringify(read));
    console.log('Database created');
    return data
}

const sizeFile = async (data) => {
    return new Promise((resolve, reject) => {
        if (data.size < 45) {
            return resolve(data)
        } else {
            return reject('reject file is too large')
        }
    })
}
module.exports = {
    database,
    createDB,
    sizeFile
}