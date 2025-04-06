const axios = require('axios');

class GoogleFormService {
  async createForm(title, description, accessToken) {
    const formDetails = {
      info: {
        title: title,
        // description: description 
      }
    };

    const createFormUrl = `https://forms.googleapis.com/v1/forms`;
    try {
      const response = await axios.post(
        createFormUrl,
        formDetails,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Form Created", response.data);

      const requests = [(
        {
          "updateSettings": {
            "settings": {
              "quizSettings": {
                "isQuiz": true
              },
              "emailCollectionType": "VERIFIED"
            },
            "updateMask": "quizSettings.isQuiz,emailCollectionType"
          }
        }
      )];
      const requestBody = {
        requests
      };

      //update settings to quiz
      await axios.post(
        `https://forms.googleapis.com/v1/forms/${response.data.formId}:batchUpdate`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        formId: response.data.formId,
        responderUri: response.data.responderUri
      };
    } catch (error) {
      console.error('Form Creation Error:', error?.response?.data);
      throw error;
    }
  }

  async addQuestionToForm(formId, requests, accessToken) {
    try {
      const requestBody = {
        requests
      };

      const response = await axios.post(
        `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Add Question Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  // Helper method to map question types
  mapQuestionType(question) {
    switch (question.type) {
      case 'multiple_choice':
        return {
          choiceQuestion: {
            type: 'RADIO',
            options: (question.options || []).map(opt => ({ value: opt })),
            shuffle: true
          }
        };
      case 'true_false':
        return {
          choiceQuestion: {
            type: 'RADIO',
            options: [
              { value: 'True' },
              { value: 'False' }
            ]
          }
        };
      case 'short_answer':
        return {
          textQuestion: {
            paragraph: false
          }
        };
      case 'fill_in_blank':
        return {
          textQuestion: {
            paragraph: false
          }
        };
      case 'matching':
        // Google Forms doesn't directly support matching, 
        // so we'll convert to multiple choice
        return {
          choiceQuestion: {
            type: 'RADIO',
            options: (question.options || []).map(opt => ({ value: opt })),
            shuffle: true
          }
        };
      case 'sequence_order':
        // Convert to multiple choice
        return {
          choiceQuestion: {
            type: 'RADIO',
            options: (question.options || []).map(opt => ({ value: opt })),
            shuffle: true
          }
        };
      default:
        return {
          textQuestion: {
            paragraph: false
          }
        };
    }
  }
}

module.exports = new GoogleFormService();