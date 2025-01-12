const fs = require('fs');
const axios = require('axios');

const logError = (message, error) => {
  const logMessage = `${new Date().toISOString()} - ${message}: ${error.message}\n`;
  fs.appendFileSync('error.log', logMessage, 'utf-8');
};

const validateApiKey = (apiKey) => {
  if (!apiKey) {
    const error = new Error('Missing OpenAI API key');
    logError('API Key Validation Error', error);
    throw error;
  }
};

const handleApiRequest = async (url, data, apiKey) => {
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      logError('API Rate Limit Error', error);
    } else {
      logError('API Request Error', error);
    }
    throw error;
  }
};

const logGenerationStatus = (status, details) => {
  const logMessage = `${new Date().toISOString()} - Generation ${status}: ${details}\n`;
  fs.appendFileSync('generation.log', logMessage, 'utf-8');
};

module.exports = {
  logError,
  validateApiKey,
  handleApiRequest,
  logGenerationStatus
};
