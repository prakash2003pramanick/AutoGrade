const axios = require('axios');
const fetchSubmission = require('../utils/assignment/fetchSubmission');

const gradeAssignmentController = async (req, res) => {
    console.log("📥 Grade function triggered");
    try {
        const { access_token } = req.user.google;
        const { courseId, assignmentId } = req.body;

        if (!courseId || !assignmentId) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        // Step 1: Fetch all the submissions
        const courseWork = await fetchSubmission(req.user.google, {
            course_id: courseId,
            course_work_id: assignmentId,
        });

        const cleanSubmissions = courseWork?.data.studentSubmissions.map((submission) => ({
            courseId: submission.courseId,
            courseWorkId: submission.courseWorkId,
            id: submission.id,
            userId: submission.userId,
            creationTime: submission.creationTime,
            updateTime: submission.updateTime,
            state: submission.state,
            alternateLink: submission.alternateLink,
            courseWorkType: submission.courseWorkType,
            assignmentSubmission: submission.assignmentSubmission || {},
            associatedWithDeveloper: submission.associatedWithDeveloper || true,
            submissionHistory: submission.submissionHistory || [],
        }));

        // Intermediate Step
        const courseWorkResponse = await axios.get(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${assignmentId}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        // console.log("Courses Response", courseWorkResponse.data);

        const requestBody = { courseWork: cleanSubmissions, assignmentInfo: courseWorkResponse.data };

        console.log("Request Body", requestBody);

        // Step 2: Send to Flask API for grading
        const gradeAssignment = await axios.post(
            process.env.FLASK_URL,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const gradingResults = gradeAssignment.data.grading_results;

        // Step 3: Fetch all students to map userId -> name/email
        const studentListResponse = await axios.get(
            `https://classroom.googleapis.com/v1/courses/${courseId}/students`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const studentMap = {};
        studentListResponse.data.students.forEach((student) => {
            studentMap[student.userId] = {
                name: student.profile.name.fullName,
                email: student.profile.emailAddress,
            };
        });

        const gradedStudents = [];

        // Step 4: Grade each submission and collect result
        for (const result of gradingResults) {
            const {
                feedback,
                grade,
                submission_id: submissionId,
                user_id: studentId,
            } = result;

            const patchUrl = `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${assignmentId}/studentSubmissions/${submissionId}`;

            const studentSubmission = {
                assignedGrade: grade,
                state: 'RETURNED',
            };

            try {
                await axios.patch(patchUrl, studentSubmission, {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        updateMask: 'assignedGrade',
                    },
                });

                const student = studentMap[studentId] || { name: "Unknown", email: "Unknown" };

                gradedStudents.push({
                    name: student.name,
                    email: student.email,
                    userId: studentId,
                    feedback,
                    grade,
                });

                console.log(`✅ Graded: ${student.name} (${studentId}) → ${grade}`);
            } catch (err) {
                console.error(`❌ Failed to grade ${studentId}`, err.response?.data || err.message);
            }
        }

        // Step 5: Return result
        res.status(200).json({
            status: true,
            gradedStudents,
        });
    } catch (error) {
        console.error("❌ Error in gradeAssignmentController:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to process grading" });
    }
};

module.exports = { gradeAssignmentController };
