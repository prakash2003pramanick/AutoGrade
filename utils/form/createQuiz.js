const googleFormService = require('../../services/googleFormService');
const questionGenerator = require('./questionGenerator')
const { google } = require('googleapis');

const generateQuiz = async (auth, options) => {
  try {
    console.log('options',options)
    const { assignmentPrompt: prompt } = options;

    if (!prompt) {
      return;;
    }


    const formTitle = `Quiz:`;
    const description = `This quiz is based on: "${prompt}"`;

    console.log("creating form");
    const formCreationResponse = await googleFormService.createForm(formTitle, description, auth.access_token);
    console.log("form created",formCreationResponse);



    const questions = await questionGenerator.generateQuestions(prompt);
    console.log(questions);
    for (const question of questions) {
      try {
        await googleFormService.addQuestionToForm(
          formCreationResponse.formId,
          question,
          auth.access_token
        );
      } catch (questionAddError) {
        console.error(`Error adding question: ${questionAddError.message}`);
        // Continue adding other questions
      }
    }


    // Generate shareable form link
    const formUrl = `https://docs.google.com/forms/d/${formCreationResponse.formId}/edit`;

    const quiz = {
      message: 'Quiz generated successfully',
      formId: formCreationResponse.formId,
      formUrl: formUrl,
      responderUri: formCreationResponse.responderUri,
      questions: questions
    };

    return quiz;

    // res.json({ formUrl });
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    return error;
  }
};

module.exports = generateQuiz;