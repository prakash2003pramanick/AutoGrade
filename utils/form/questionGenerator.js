const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

class QuestionGenerator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBClM_kYYLR-XtMtDb_YXnXLKM5ENK4EQA");
  }

  async generateQuestions(description, prompt = "", numberOfQuestions =  10) {
    try {
      // Define a comprehensive schema for questions
      const schema = {
        description: "Quiz Question Creation Schema",
        type: "object",
        properties: {
          requests: {
            type: "array",
            items: {
              type: "object",
              properties: {
                createItem: {
                  type: "object",
                  properties: {
                    item: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        questionItem: {
                          type: "object",
                          properties: {
                            question: {
                              type: "object",
                              properties: {
                                required: { type: "boolean" },
                                grading: {
                                  type: "object",
                                  properties: {
                                    pointValue: { type: "integer" },
                                    correctAnswers: {
                                      type: "object",
                                      properties: {
                                        answers: {
                                          type: "array",
                                          items: {
                                            type: "object",
                                            properties: {
                                              value: { type: "string" }
                                            },
                                            required: ["value"]
                                          }
                                        }
                                      },
                                      required: ["answers"]
                                    },
                                    whenRight: {
                                      type: "object",
                                      properties: {
                                        text: { type: "string" }
                                      },
                                      required: ["text"]
                                    },
                                    whenWrong: {
                                      type: "object",
                                      properties: {
                                        text: { type: "string" }
                                      },
                                      required: ["text"]
                                    }
                                  },
                                  required: ["pointValue", "correctAnswers", "whenRight", "whenWrong"]
                                },
                                choiceQuestion: {
                                  type: "object",
                                  properties: {
                                    type: {
                                      type: "string",
                                      enum: ["RADIO", "CHECKBOX", "DROP_DOWN"]
                                    },
                                    options: {
                                      type: "array",
                                      items: {
                                        type: "object",
                                        properties: {
                                          value: { type: "string" },
                                          isOther: { type: "boolean" }
                                        },
                                        required: ["value", "isOther"]
                                      }
                                    },
                                    shuffle: { type: "boolean" }
                                  },
                                  required: ["type", "options", "shuffle"]
                                }
                              },
                              required: ["required", "grading", "choiceQuestion"]
                            }
                          },
                          required: ["question"]
                        }
                      },
                      required: ["title", "questionItem"]
                    },
                    location: {
                      type: "object",
                      properties: {
                        index: { type: "integer" }
                      },
                      required: ["index"]
                    }
                  },
                  required: ["item", "location"]
                }
              },
              required: ["createItem"]
            }
          }
        },
        required: ["requests"]
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
      Number of Questions: ${numberOfQuestions}

      Return ONLY the valid JSON object with the questions array.
      `;

      try {
        // Generate content
        const result = await model.generateContent(combinedPrompt);
        // Parse the result
        const parsedResult = JSON.parse(result.response.text());

        console.log("Generated Questions:", parsedResult);
        return parsedResult;
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