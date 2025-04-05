//fetch assignments 
const axios = require('axios');
const fetchSubmissionsController = async (req, res) => {
    try {
        const {access_token} = req.user.google;
        const { course_id, coruse_work_id } = req.params;

        // Get assignment submissions
        const getCourseWorkURL = `https://classroom.googleapis.com/v1/courses/${course_id}/courseWork/${coruse_work_id}/studentSubmissions`

        console.log("getCourseWorkURL", getCourseWorkURL);

        const foundCourseWork = await axios.get(getCourseWorkURL, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        console.log("foundCoursework",foundCourseWork.data);
        res.status(200).json({courseWork : foundCourseWork.data.studentSubmissions});

    } catch (error) {
        console.log("Error message : ", error.message || error.data);
    }
}
module.exports = { fetchSubmissionsController };