//fetch assignments 
const axios = require('axios');
const fetchSubmission = async (auth, options) => {
    try {
        const { access_token } = auth;
        const { course_id, course_work_id } = options

        // Get assignment submissions
        const getCourseWorkURL = `https://classroom.googleapis.com/v1/courses/${course_id}/courseWork/${course_work_id}/studentSubmissions`

        console.log("getCourseWorkURL", getCourseWorkURL);

        const foundCourseWork = await axios.get(getCourseWorkURL, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        return foundCourseWork

    } catch (error) {
        console.log("Error message : ", error.message || error.data);
        return
    }
}
module.exports = fetchSubmission;