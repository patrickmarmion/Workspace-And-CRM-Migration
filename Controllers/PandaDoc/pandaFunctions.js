require('dotenv').config({
    path: "../../.env"
});
const axiosInstance = require("../../Config/axiosInstance");
const access_token = process.env.NEW_ACCESS_TOKEN;
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
    }
};

const updateLinkedObject = async (rowDetail) => {
    let body = {
        "provider": rowDetail.provider,
        "entity_type": rowDetail.crmEntity,
        "entity_id": rowDetail.new_entity_id
    }
    await axiosInstance.post(`https://api.pandadoc.com/public/v1/documents/${rowDetail.new_document_id}/linked-objects`, body, headers);
}

module.exports = updateLinkedObject