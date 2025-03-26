const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

class QuestionGenerator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBClM_kYYLR-XtMtDb_YXnXLKM5ENK4EQA");
  }

  async generateQuestions(description, prompt = "") {
    try {
      // Define a comprehensive schema for questions
      const schema = {
        description: "Quiz Question Generation",
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { 
                  type: "string",
                  description: "The main text of the question"
                },
                type: { 
                  type: "string", 
                  enum: [
                    "multiple_choice", 
                    "true_false", 
                    "short_answer", 
                    "fill_in_blank", 
                    "matching", 
                    "sequence_order"
                  ]
                },
                options: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Possible answers or choices (for applicable question types)"
                },
                correctAnswer: { 
                  type: "string", 
                  description: "The correct answer or key answer for the question"
                },
                explanation: { 
                  type: "string", 
                  description: "Optional explanation for the correct answer"
                },
                difficulty: { 
                  type: "string", 
                  enum: ["easy", "medium", "hard"],
                  description: "Difficulty level of the question"
                }
              },
              required: ["title", "type", "correctAnswer"]
            }
          }
        },
        required: ["questions"]
      };

      // Prepare the model with the schema
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      // Construct a detailed prompt
      const combinedPrompt = `
      You are an AI assistant tasked with generating a diverse set of quiz questions.

      Guidelines:
      * Generate questions about: ${prompt}
      * Include a mix of question types:
        - Multiple Choice
        - True/False
        - Short Answer
        - Fill in the Blank
        - Matching
        - Sequence Order
      * Ensure questions are:
        - Clearly worded
        - Appropriate for the topic
        - Have a varying difficulty level
      * For multiple-choice questions, provide 4 options
      * Include a correct answer and optional explanation for each question
      * Strictly follow the provided JSON schema

      Additional Context:
      Topic: ${prompt}
      Description: ${description}

      Return ONLY the valid JSON object with the questions array.
      `;

      // Generate content
      const result = await model.generateContent(combinedPrompt);

      try {
        // Parse the result
        const parsedResult = JSON.parse(result.response.text());
        return parsedResult.questions;
      } catch (jsonError) {
        console.error("JSON Parsing Error:", jsonError);
        console.error("Raw Response Text:", result.response.text());
        return this.getDefaultQuestions(prompt);
      }

    } catch (error) {
      console.error("Question Generation Error:", error);
      return this.getDefaultQuestions(prompt);
    }
  }

  // Fallback method for default questions
  getDefaultQuestions(prompt) {
    return [
      {
        title: `What is the main concept of ${prompt}?`,
        type: "multiple_choice",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: "Option 1",
        difficulty: "easy"
      },
      {
        title: "Provide a brief explanation of the key concept.",
        type: "short_answer",
        correctAnswer: "Key concept explanation",
        difficulty: "medium"
      }
    ];
  }
}

module.exports = new QuestionGenerator();