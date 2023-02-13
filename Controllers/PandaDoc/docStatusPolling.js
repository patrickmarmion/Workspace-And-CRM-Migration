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

const Polling = async (id, retries = 0) => {
  console.log("Polling..." + id)
  await new Promise(resolve => setTimeout(resolve, 700));

  try {
    let response = await axiosInstance.get(`https://api.pandadoc.com/public/v1/documents/${id}`, headers);

    if (response.data.status !== 'document.draft') {
      await Polling(id);
    }
    return id;
  } catch (error) {
    if (error.response) {
      if (retries >= 5) {
        throw new Error("Max retries exceeded, giving up.");
      }
      console.log(`Received 403 error, retrying in 3 seconds... (attempt ${retries + 1} of 5)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return await Polling(id, retries + 1);
    }
    throw error;
  }
};


module.exports = Polling;