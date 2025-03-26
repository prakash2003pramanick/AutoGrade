//fetchCourses
// to keep in form while creating an assignment 
const axios = require('axios');
const COURSES_URL = 'https://classroom.googleapis.com/v1/courses';
const fetchCourses = async (req, res) => {
    const { access_token } = req.user.google;
    try {
        const coursesResponse = await axios.get(COURSES_URL, {
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
module.exports = { fetchCourses };