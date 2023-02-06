const axiosInstance = require("../../Config/axiosInstance");
const fs = require('fs');
require('dotenv').config({
    path: ".env"
})
const api_key = process.env.PANDADOC_API_KEY;

const downloadDoc = async (result) => {
    if (result.status === "document.completed") {
        const config = {
            url: `https://api.pandadoc.com/public/v1/documents/${result.id}/download-protected`,
            headers: {
                'Content-Type': 'application/pdf',
                'Authorization': `Bearer ${api_key}`
            },
            method: "GET",
            responseType: "arraybuffer",
            responseEncoding: "binary"
        }
        let response = await axiosInstance(config);
        fs.writeFileSync('panda.pdf', response.data, null);
        console.log('Completed Document downloaded');
    } else {
        const config = {
            url: `https://api.pandadoc.com/public/v1/documents/${result.id}/download`,
            headers: {
                'Content-Type': 'application/pdf',
                'Authorization': `Bearer ${api_key}`
            },
            method: "GET",
            responseType: "arraybuffer",
            responseEncoding: "binary"
        }
        let response = await axiosInstance(config);
        fs.writeFileSync('panda.pdf', response.data, null);
        console.log('Document downloaded');
    }
    return
}

module.exports = downloadDoc;