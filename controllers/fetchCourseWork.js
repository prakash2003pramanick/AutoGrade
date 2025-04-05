//fetchCourses
// to keep in form while creating an assignment 
const axios = require('axios');
const fetchCourseWork = async (req, res) => {
    console.log("Fetch Courses funtion");
    
    const { access_token } = req.user.google;
    const { courseId } = req.params;

    console.log("courseID ", courseId);
    try {
        const courseWorkResponse = await axios.get(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        console.log("Courses Response", courseWorkResponse.data);
        const courseWork = courseWorkResponse.data.courseWork;
        res.status(200).json({ courseWork });

    } catch (error) {
        console.error("Error fetching courses", error.response?.data || error.message);
    }
}
module.exports = { fetchCourseWork };