const axiosInstance = require("../../Config/axiosInstance");
require('dotenv').config({
    path: ".env"
})
const api_key = process.env.PANDADOC_API_KEY;
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`
    }
};

const docDetails = async (document_id) => {
    let response = await axiosInstance.get(`https://api.pandadoc.com/public/v1/documents/${document_id}/details`, headers);
    let result = await response.data;
    return result
}

module.exports = docDetails;