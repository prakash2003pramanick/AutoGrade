const googleFormService = require('../../services/googleFormService');
const questionGenerator = require('./questionGenerator')
const { google } = require('googleapis');

const generateQuiz = async (auth, options) => {
  try {
    console.log('options', options)
    const { assignmentPrompt: prompt } = options;

    if (!prompt) {
      console.error('Prompt is required to generate quiz');
      return
    }

    const formTitle = options.assignmentName || "Quiz";
    const description = options.assignmentDescription;

    const formCreationResponse = await googleFormService.createForm(formTitle, description, auth.access_token);
    console.log("form created", formCreationResponse);


    const questions = await questionGenerator.generateQuestions(prompt, options.numberOfQuestions);

    await googleFormService.addQuestionToForm(
      formCreationResponse.formId,
      questions.requests,
      auth.access_token
    );
    // console.log("questions added");

    // for (const question of questions) {
    //   try {
    //     await googleFormService.addQuestionToForm(
    //       formCreationResponse.formId,
    //       question,
    //       auth.access_token
    //     );
    //   } catch (questionAddError) {
    //     console.error(`Error adding question: ${questionAddError.message}`);
    //     // Continue adding other questions
    //   }
    // }


    // // Generate shareable form link
    const formUrl = `https://docs.google.com/forms/d/${formCreationResponse.formId}/edit`;

    const quiz = {
      message: 'Quiz generated successfully',
      formId: formCreationResponse.formId,
      formUrl,
      responderUri: formCreationResponse.responderUri,
      questions: questions
    };

    return quiz;

    // return questions;
    // return formCreationResponse.requests;

    // res.json({ formUrl });
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    return error;
  }
};

module.exports = generateQuiz;