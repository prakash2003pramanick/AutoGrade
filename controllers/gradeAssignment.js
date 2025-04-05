// Grade Assignment
const axios = require('axios');
const gradeAssignment = require('../utils/assignment/gradeAssignment');
const fetchSubmission = require('../utils/assignment/fetchSubmission');
const gradeAssignmentController = async (req, res) => {
    console.log("Grade funtion");
    try {
        const { access_token } = req.user.google;
        // const { courseId, itemId, assignmentId, submissionId, marks, studentId } = req.body;
        const { courseId, assignmentId, submissionId, grade } = req.body;

        if (!courseId || !assignmentId) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        // Step 1 : Fetch all the submission for the assignment
        const courseWork = await fetchSubmission(req.user.google, { course_id: courseId, course_work_id: assignmentId });
        console.log("courseWork", courseWork?.data);

        const submissions = courseWork?.data?.studentSubmissions.forEach(assignment => {

            
            return {

            }
        });;

        // Step 2 : Send Assignment for grading




        // Step3 : Grade The assignment
        // const url = `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${assignmentId}/studentSubmissions/${submissionId}`;

        // const studentSubmission = {
        //     assignedGrade: grade,
        //     // draftGrade: grade,
        //     state: 'RETURNED',
        // };

        // const response = await axios.patch(url, studentSubmission, {
        //     headers: {
        //         Authorization: `Bearer ${access_token}`,
        //         'Content-Type': 'application/json',
        //     },
        //     params: {
        //         updateMask: 'assignedGrade',
        //     },
        // });

        // console.log("Courses Response", response.data);
        res.status(200).json({ status: true });
    } catch (error) {
        console.error("Error fetching courses", error.response?.data || error.message);
    }
}
module.exports = { gradeAssignmentController };