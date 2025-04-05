//fetchCourses
// to keep in form while creating an assignment 
const axios = require('axios');
const fetchCourses = async (req, res) => {
    console.log("Fetch Courses funtion");
    
    const { access_token } = req.user.google;
    console.log("Access Token ", access_token);
    try {
        const coursesResponse = await axios.get("https://classroom.googleapis.com/v1/courses", {
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