const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

class TextAssignmentGenerator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBClM_kYYLR-XtMtDb_YXnXLKM5ENK4EQA");
  }

  async generateAssignment(description, prompt = "", numberOfQuestions = 5) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro"
      });

      const assignmentPrompt = `
      You are an AI assistant tasked with generating a structured written assignment.

      Guidelines:
      * Topic: ${prompt}
      * Description: ${description}
      * Create ${numberOfQuestions} questions or writing prompts.
      * Each question should encourage critical thinking, reflection, or analysis.
      * Vary the style of prompts (e.g., open-ended, compare & contrast, argumentative).
      * Number each question.
      * Keep the output plain and structured. No JSON needed.

      Example Output:
      Assignment: [Title]
      Description: [Short paragraph]

      1. [Question 1]
      2. [Question 2]
      ...
      `;

      const result = await model.generateContent(assignmentPrompt);
      const text = result.response.text();

      console.log("Generated Assignment:", text);
      return text;
    } catch (error) {
      console.error("Assignment Generation Error:", error);
      return this.getFallbackAssignment(prompt);
    }
  }

  getFallbackAssignment(prompt) {
    return `
    Assignment: Introduction to ${prompt}
    Description: Answer the following questions based on your understanding of the topic.

    1. What is ${prompt} and why is it important?
    2. Describe the key components or principles involved.
    3. Compare ${prompt} with a related concept.
    4. How can ${prompt} be applied in a real-world context?
    5. Reflect on a challenge or issue related to ${prompt} and suggest solutions.
    `;
  }
}

module.exports = new TextAssignmentGenerator();
