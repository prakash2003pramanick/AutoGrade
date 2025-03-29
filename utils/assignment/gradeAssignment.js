// Grade Assignment
const axios = require('axios');
const gradeAssignment = async (auth, options) => {
    try {
        const { access_token } = auth;
        console.log("Access Token ", access_token);
        console.log("Options ", options);
        const { courseId, itemId, attachmentId, submissionId } = options;
        
        const coursesResponse = await axios.get(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${itemId}/addOnAttachments/${attachmentId}/studentSubmissions/${submissionId}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        console.log("Courses Response", coursesResponse.data);
        const courses = coursesResponse.data.courses;
        res.status(200).json({ courses });

    } catch (error) {
        console.error("Error fetching courses", error.response?.data || error.message);
    }
}
module.exports = gradeAssignment;