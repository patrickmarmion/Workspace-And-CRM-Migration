const axiosInstance = require("../../Config/axiosInstance");
const fs = require('fs');
require('dotenv').config({
    path: ".env"
});
const api_key = process.env.PANDADOC_API_KEY;

const downloadDoc = async (result, retries = 0) => {
    try {
        let config = {
            url: `https://api.pandadoc.com/public/v1/documents/${result.id}/download${result.status === 'document.completed' ? '-protected' : ''}`,
            headers: {
                'Content-Type': 'application/pdf',
                'Authorization': `Bearer ${api_key}`
            },
            method: "GET",
            responseType: "arraybuffer",
            responseEncoding: "binary"
        };
    
        let response = await axiosInstance(config);
        fs.writeFileSync('panda.pdf', response.data, null);
        console.log(`${result.status === 'document.completed' ? 'Completed Document' : 'Document'} downloaded`);
    
        return;
    } catch (error) {
        if (error.response) {
            if (retries >= 5) {
              throw new Error("Max retries exceeded, giving up.");
            }
            console.log(`Received 403 error, retrying in 3 seconds... (attempt ${retries + 1} of 5)`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return await downloadDoc(id, retries + 1);
          }
          throw error;
    }
};

module.exports = downloadDoc;