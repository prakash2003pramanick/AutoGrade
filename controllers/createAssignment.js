//creaste assignment controller

const createASsignments = async (req, res) => {
    try {
        const token = req.query.token;
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: token });

        const response = await classroom.courses.list({ auth });
        const courses = response.data.courses || [];

        res.send(`<h1>Your Courses</h1><ul>${courses.map(course => `<li>${course.name}</li>`).join('')}</ul>`);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send('Failed to retrieve courses');
    }
}

module.exports =  createASsignments;