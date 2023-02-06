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
  console.log("Polling..." + id)
  await new Promise(resolve => setTimeout(resolve, 700));
  let response = await axiosInstance.get(`https://api.pandadoc.com/public/v1/documents/${id}`, headers);

  if (response.data.status !== 'document.draft') {
    await subscribe(id);
  }
  return id
}

module.exports = subscribe;