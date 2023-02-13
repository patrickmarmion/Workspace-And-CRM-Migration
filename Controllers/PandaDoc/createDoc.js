const axiosInstance = require("../../Config/axiosInstance");
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config({
    path: "../../.env"
})
const access_token = process.env.NEW_ACCESS_TOKEN;
const folderId = process.env.FOLDER_ID;
const headersNew = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
    }
};
let data;

const docOwner = async (result) => {
        //List members of new workspace - new api key
        let members = await axiosInstance.get("https://api.pandadoc.com/public/v1/members/", headersNew);
        let member = await members.data.results

        // Filter based on user ID.
        let filteredMember = member.filter(x => (x.user_id == result.created_by.id) && (x.is_active == true))

        if (filteredMember.length) {
            let docCreator = filteredMember[0].email
            return docCreator
        } else {
            let docCreator = "patrick.marmion@pandadoc.com"
            return docCreator
        }
}

const requestBody = (result, owner) => {
    switch (true) {
        case ((result.version == 2) && (result.linked_objects.length > 0)):
            return new Promise((resolve) => {
                let recipients = [];
                let recip = result.recipients;
                recip.map(({
                    email,
                    first_name,
                    last_name
                }) => {
                    recipients.push({
                        "email": email,
                        "first_name": first_name,
                        "last_name": last_name
                    });
                });
                data = {
                    "name": `${result.name}`,
                    "recipients": recipients,
                    "folder_uuid": folderId,
                    "owner": {
                        "email": owner
                    },
                    "tokens": result.tokens,
                    "metadata": {
                        "migratedDocID": result.id,
                        "migratedDocStatus": result.status,
                        "CRMProvider": result.linked_objects[0].provider,
                        "CRMEntityType": result.linked_objects[0].entity_type,
                        "CRMEntityId": result.linked_objects[0].entity_id
                    },
                    "parse_form_fields": false
                }
                return resolve(data)
            })
        case ((result.version == 2) && (result.linked_objects.length == 0)):
            return new Promise((resolve) => {
                let recipients = [];
                let recip = result.recipients;
                recip.map(({
                    email,
                    first_name,
                    last_name
                }) => {
                    recipients.push({
                        "email": email,
                        "first_name": first_name,
                        "last_name": last_name
                    });
                });
                data = {
                    "name": `${result.name}`,
                    "recipients": recipients,
                    "folder_uuid": folderId,
                    "owner": {
                        "email": owner
                    },
                    "tokens": result.tokens,
                    "metadata": {
                        "migratedDocID": result.id,
                        "migratedDocStatus": result.status
                    },
                    "parse_form_fields": false
                }
                return resolve(data)
            })
        case (result.version == 1):
            return new Promise((resolve) => {
                data = {
                    "name": `${result.name}`,
                    "recipients": [],
                    "folder_uuid": folderId,
                    "metadata": {
                        "migratedDocID": result.id,
                        "migratedDocStatus": result.status
                    },
                    "parse_form_fields": false
                }
                return resolve(data)
            })
    }
}

const upload = async (reqBody) => {
    let body = JSON.stringify(reqBody);
    let formData = new FormData();
    formData.append('file', fs.createReadStream('./panda.pdf'), {
        'filename': 'panda.pdf'
    });
    formData.append('data', body);

    try {
        let response = await axiosInstance.post('https://api.pandadoc.com/public/v1/documents/', formData, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.log("Error Occured at the upload function")
        throw error;
    }
};

const create = async (result) => {
    let owner = await docOwner(result);
    let reqBod = await requestBody(result, owner);
    let newDoc = await upload(reqBod);
    let id = await newDoc.id
    return {id, owner}
}

module.exports = create;