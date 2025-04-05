//creaste assignment controller

const createNewAssignment = require("../utils/assignment/createNewAssignment");
const generateQuiz = require("../utils/form/createQuiz");

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
        console.log("req.user", req.user);

        // change date&time format
        const formattedDateTime = convertToDateTimeFormat(req.body.dueDate, req.body.dueTime);
        req.body.dueDate = formattedDateTime.dueDate;
        req.body.dueTime = formattedDateTime.dueTime;

        req.body.material = [];

        console.log("req.body", req.body);
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
                req.body.material.push(
                    {
                        "link": {
                            "url": generatedFrom.responderUri,
                            "title": "new form for test",
                            // "thumbnailUrl": string
                        }
                    }
                )
                console.log(req.body.material);
            }
            else {
                return res.status(500).json({ error: "Failed to generate quiz" });
            }

        }
        else {
            // Add other materials - if any
            console.log("No quiz requested");
            req.body.workType = "SHORT_ANSWER_TYPE"

        }


        // Add other materials - if any
        console.log("Creating Assignment");

        // create the assignment
        const generatedAssignment = await createNewAssignment(req.user.google, req.body);
        console.log("generatedAssignment", generatedAssignment);

        if (generatedAssignment) {
            return res.status(201).json({ assigment: generatedAssignment })
        } else {
            return res.status(500).json({ error: "Failed to create assignment" });
        }

    } catch (error) {
        console.error('Error fetching courses:', error.data || error.message);
        res.status(500).send('Failed to retrieve courses');
    }
}

module.exports = { createAssignments };