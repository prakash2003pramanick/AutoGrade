const googleFormService = require('../services/googleFormService');
const questionGenerator = require('../utils/form/questionGenerator')
const { google } = require('googleapis');



exports.generateQuiz = async (req, res) => {
  console.log(req.body); 
  try {
    const { prompt, accessToken } = req.body;
    
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
   
   
    const formTitle = `Quiz:`;
    const description = `This quiz is based on: "${prompt}"`;

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const formCreationResponse = await googleFormService.createForm(formTitle, description, accessToken);
    console.log(formCreationResponse.formId, "form created"); 



    const questions = await questionGenerator.generateQuestions(prompt);
    console.log(questions); 
    for (const question of questions) {
      try {
        await googleFormService.addQuestionToForm(
          formCreationResponse.formId, 
          question, 
          accessToken
        );
      } catch (questionAddError) {
        console.error(`Error adding question: ${questionAddError.message}`);
        // Continue adding other questions
      }
    }
    // await googleFormService.enableQuizMode(formId, auth);


    // Generate shareable form link
    const formUrl = `https://docs.google.com/forms/d/${formCreationResponse.formId}/edit`;

    res.status(200).json({
      message: 'Quiz generated successfully',
      formId: formCreationResponse.formId,
      formUrl: formUrl, 
      responderUri: formCreationResponse.responderUri,
      questions: questions // Optionally return generated questions
    });

    // res.json({ formUrl });
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    res.status(500).json({ 
      error: "Failed to generate quiz", 
      details: error?.response?.message 
    });
  }
};