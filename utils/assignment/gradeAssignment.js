// Grade Assignment
const axios = require('axios');
const gradeAssignment = async (auth, options) => {
    try {
        const { access_token } = auth;
        console.log("Access Token ", access_token);
        console.log("Options ", options);
        const { courseId, itemId, attachmentId, submissionId, marks, studentId } = options;

        const updateMarksURL = `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${itemId}/addOnAttachments/${attachmentId}/studentSubmissions/${submissionId}`;
        console.log("updateMarksURL", updateMarksURL);

        const coursesResponse = await axios.patch(updateMarksURL, 
            {
                "pointsEarned": marks,
                "postSubmissionState": "RETURNED",
                "userId": studentId
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
        console.log("Courses Response", coursesResponse.data);
        const courses = coursesResponse.data.courses;
        res.status(200).json({ courses });

    } catch (error) {
        console.error("Error grading courses", error.response?.data || error.message);
    }
}
module.exports = gradeAssignment;