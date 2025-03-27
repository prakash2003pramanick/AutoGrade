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
        req.user = {};
        req.user.google = {
            access_token: 'ya29.a0AeXRPp5LW_HnRnkMyx_mvuIYelFpwR5wy5RAL7r-MAm5NJi6mGplGwt9wsMgdPN_OaONgJp5ENBr-Ne8iA_Q6NsnVNpt_VVkx5QVD9W9QFL0OQH9-ykOLXHto_5L5euEHmVA1gT1XkSaPxUpaRTMl4H5-2S0Tg4WgbsbTHUlaCgYKAfUSARMSFQHGX2MiDhWq-h9H0hogHxqpdAquuw0175',
            expires_in: 3599,
            refresh_token: '1//0gwA7Zv7eI1gmCgYIARAAGBASNwF-L9IrfSHFmt4piCnPDrRMsawV2gXcr2qxtRAbe8SwXoYa2ighAYML2Ayb-NVuVMxIhHYNymc',
            scope: 'https://www.googleapis.com/auth/classroom.rosters https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/classroom.profile.emails https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/classroom.topics https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/forms.body https://www.googleapis.com/auth/classroom.student-submissions.students.readonly https://www.googleapis.com/auth/classroom.topics.readonly https://www.googleapis.com/auth/classroom.courses https://www.googleapis.com/auth/classroom.coursework.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/classroom.announcements openid https://www.googleapis.com/auth/classroom.courseworkmaterials https://www.googleapis.com/auth/classroom.student-submissions.me.readonly https://www.googleapis.com/auth/classroom.coursework.students',
            token_type: 'Bearer',
            id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyMWYzYmM2NmYwNzUxZjc4NDA2MDY3OTliMWFkZjllOWZiNjBkZmIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NTQyNzA3NzEyMTItYnMxY3Fpam9iZ21pbTgwNWF0YW00aWE2c2FnYjg4b2ouYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3NTQyNzA3NzEyMTItYnMxY3Fpam9iZ21pbTgwNWF0YW00aWE2c2FnYjg4b2ouYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTExNzI4Mzc0MDM1NDkxMTg5NDQiLCJlbWFpbCI6InByYWthc2hwcmFtYW5pY2tqc3IxNzE3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoia1RlT3NCTmM2dUtGWDVTQ0NlQWVkQSIsIm5hbWUiOiJQcmFrYXNoIFByYW1hbmljayIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJQmh6MjJkUXd0NVNBRnp3VjRGTnVuTVRZYXZWalhSeTBIbXpxeU1QeUlUNlhTdEZBYz1zOTYtYyIsImdpdmVuX25hbWUiOiJQcmFrYXNoIiwiZmFtaWx5X25hbWUiOiJQcmFtYW5pY2siLCJpYXQiOjE3NDMwMjIzMzgsImV4cCI6MTc0MzAyNTkzOH0.aAG1gabu1thgH3GhpjFrl6j4lD6QEjTo2egYwUdlNQBT0KCUeNuGP96JQfTGHqdD5aLrfviM66hDRjYsL8YofO9IT1oL5QOZcniDYA_yIVvAMQpJF8bf96vfJv3MhQ9_FluqxSTskyp_1XXEtb78YS3rjp2JMM_uea2uN7j6gqYS8ElEutcd42yYtPfQQPdp_FCREfPJMV1nqibvlXdYcQ9dvki4Tr9xkoVmVu4mrkRo5kDCysreOd676PbkapbE66oSAJwLPzklctKsXJhR4SC-YDXpxE1h0rceovXaix2bCCcTknp3UfvceJuiGi-p7eUDtkPey1bmWwisT9Qw5Q',
            refresh_token_expires_in: 604799
        }

        // change date&time format
        const formattedDateTime = convertToDateTimeFormat(req.body.dueDate, req.body.dueTime);
        req.body.dueDate = formattedDateTime.dueDate;
        req.body.dueTime = formattedDateTime.dueTime;

        req.body.material = [];
        let generatedFrom;
        // Create Quiz 
        if (req.body.assignmentType === 'Quiz') {
            //generate the quiz
            generatedFrom = await generateQuiz(req.user.google, req.body.assignmentPrompt);

            //add the form to the material
            if (generatedFrom) {
                req.body.material.push(
                    {
                        "link": {
                            "url": generatedFrom.formUrl,
                            "title": "new form for test",
                            // "thumbnailUrl": string
                        }
                    }
                )
            }
        }

        // Add other materials - if any

        // create the assignment
        const generatedAssignment = await createNewAssignment(req.user.google, req.body);

        if (generatedAssignment) {
            res.status(201).json({ assigment: generatedAssignment })
        }

    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send('Failed to retrieve courses');
    }
}

module.exports = { createAssignments };