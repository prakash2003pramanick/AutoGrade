//creaste assignment controller

const createNewAssignment = require("../utils/assignment/createNewAssignment");
const generateQuiz = require("../utils/form/createQuiz");
const TextAssignmentGenerator = require("../utils/form/TextAssignmentGenerator");

function convertToDateTimeFormat(dueDate, dueTime) {
    // Extract date components
    const [year, month, day] = dueDate.split('-').map(Number);

    // Extract time components
    const [hours, minutes] = dueTime.split(':').map(Number);

    // Construct the desired format
    return {
        dueDate: {
            year,
            month,
            day
        },
        dueTime: {
            hours,
            minutes,
            seconds: 0,
            nanos: 0
        }
    };
}

const createAssignments = async (req, res) => {
    try {
        console.log("req.body", req.body);

        // change date&time format
        const formattedDateTime = convertToDateTimeFormat(req.body.dueDate, req.body.dueTime);
        req.body.dueDate = formattedDateTime.dueDate;
        req.body.dueTime = formattedDateTime.dueTime;

        req.body.materials = [];
        let generatedFrom;

        console.log("req.body.assignmentType", req.body.assignmentType);
        // Create Quiz 
        if (req.body.assignmentType === 'QUIZ') {
            console.log("Generating Quiz");
            //generate the quiz
            generatedFrom = await generateQuiz(req.user.google, req.body);

            console.log("generatedFrom", generatedFrom);

            //add the form to the material
            if (generatedFrom) {
                req.body.materials.push(
                    {
                        "link": {
                            "url": generatedFrom.responderUri,
                            "title": req.body.assignmentName
                        }
                    }
                )
                console.log(req.body.materials);
            }
            else {
                return res.status(500).json({ error: "Failed to generate quiz" });
            }

        }
        else {
            // Add other materials - if any
            console.log("No quiz requested");
            // create the assignment
            const textAssignmentGenerator = await TextAssignmentGenerator.generateAssignment(req.body.description, req.body.assignmentPrompt, req.body.numberOfQuestions);
            console.log("textAssignmentGenerator", textAssignmentGenerator);
            req.body.assignmentDescription = textAssignmentGenerator;

            console.log("req.body changed description", req.body);
        }

        // Add other materials - if any
        console.log("Creating Assignment");

        // create the assignment
        const generatedAssignment = await createNewAssignment(req.user.google, req.body);
        console.log("generatedAssignment", generatedAssignment);

        if (generatedAssignment) {
            return res.status(201).json({ assigment: generatedAssignment, form : generatedFrom });
        } else {
            return res.status(500).json({ error: "Failed to create assignment" });
        }

    } catch (error) {
        console.error('Error fetching courses:', error.data || error.message);
        res.status(500).send('Failed to retrieve courses');
    }
}

module.exports = { createAssignments };