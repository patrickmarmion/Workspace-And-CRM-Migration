const axiosInstance = require("../../Config/axiosInstance");
require('dotenv').config({
    path: ".env"
})
const access_token = process.env.NEW_ACCESS_TOKEN;
const organisationID = process.env.ORGANISATION_ID;
const workspaceID = process.env.WORKSPACE_ID;
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
    }
};
const headersPrivate = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'Private_API'
    }
};

const setDocValue = async (newDoc, result) => {
    let body = {
        "type":"1",
        "amount": result.grand_total.amount,
        "currency": result.grand_total.currency
    }
    let response = await axiosInstance.patch(`https://api.pandadoc.com/org/${organisationID}/ws/${workspaceID}/documents/${newDoc}/grand_total`, body, headersPrivate);
    console.log(response.status)
}

const changeStatus = async (newDoc, result) => {
    switch (true) {
        case (result.status === "document.voided"):
            let bodySend = {
                subject: '',
                silent: true
            }
            await axiosInstance.post(`https://api.pandadoc.com/public/v1/documents/${newDoc}/send`, bodySend, headers);
            let bodyExpire = {
                "expiration": {
                    "expires_at": 86600,
                    "notification_enabled": "false",
                    "notification_interval": 86500
                }
            }
            await axiosInstance.patch(`https://api.pandadoc.com/documents/${newDoc}/settings`, bodyExpire, headersPrivate)
            break;
        case (result.status === "document.declined"):
            let bodyD = {
                "status": 12,
                "notify_recipients": false
            };
            await axiosInstance.patch(`https://api.pandadoc.com/public/v1/documents/${newDoc}/status`, bodyD, headers);
            break;
        case (result.status === "document.completed"):
            let bodyC = {
                "status": 2,
                "notify_recipients": false
            };
            await axiosInstance.patch(`https://api.pandadoc.com/public/v1/documents/${newDoc}/status`, bodyC, headers);
            break;
        default:
            console.log("Draft Doc")
    }
}

const updateDoc = async (newDoc, result) => {
    await setDocValue(newDoc, result);
    await changeStatus(newDoc, result);
}

module.exports = updateDoc;