const axiosInstance = require("../../Config/axiosInstance");
const rp = require('request-promise');
const fs = require('fs');
require('dotenv').config({
    path: "../../.env"
})
const access_token = process.env.NEW_ACCESS_TOKEN;
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
            let docCreator = "yaniv@zoomer.ca"
            return docCreator
        }
}

const requestBody = (owner, result) => {
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

const upload = (reqBody) => {
    return new Promise((resolve) => {
        let body = JSON.stringify(reqBody);
        resolve(
            rp({
                method: 'POST',
                url: 'https://api.pandadoc.com/public/v1/documents/',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                },
                formData: {
                    file: {
                        'value': fs.createReadStream('/Users/patrickmarmion/Documents/VSCode/Migrations/Workspace/panda.pdf'),
                        'options': {
                            'filename': 'panda.pdf',
                            'contentType': null
                        }
                    },
                    data: body
                }
            })
        )
    })
}

const create = async (result) => {
    let id = await docOwner(result)
        .then(docOwner => requestBody(docOwner, result))
        .then(dataa => upload(dataa))
        .then(res => JSON.parse(res))
        .then((details) => details.id)
        .catch(error => {
            console.log(error);
        });
    return id
}

module.exports = create;