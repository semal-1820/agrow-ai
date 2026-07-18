const axios = require("axios");

const PYTHON_API = "http://127.0.0.1:8000";

exports.generateForecast = async (financialData) => {
  try {
    const response = await axios.post(
      `${PYTHON_API}/forecast`,
      financialData
    );

    return response.data;
  } catch (err) {
    console.log("===== AXIOS ERROR =====");
    console.log("Status:", err.response?.status);
    console.log("Data:", err.response?.data);
    console.log("Message:", err.message);

    throw new Error(
      err.response?.data?.message || err.message
    );
  }
};