const axiosInstance = require("../../Config/axiosInstance");
require('dotenv').config({
  path: ".env"
})
const access_token = process.env.NEW_ACCESS_TOKEN;
const headers = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  }
};

const subscribe = async (id) => {
  let response = await axiosInstance.get(`https://api.pandadoc.com/public/v1/documents/${id}`, headers);
  
  if (response.data.status !== 'document.draft') {
    throw new Error("Not Draft Doc");
  }
  return id
}

const pollingManager = async (id) => {
    try {
        return await subscribe(id)
    } catch (e) {
        console.error(e);
    } finally {
        await new Promise(resolve => setTimeout(resolve, 700));
    }
}

const polling = async (id) => {
    return await pollingManager(id)
}

//module.exports = subscribe;