const axios = require('axios');
const createNewAssignment = async (auth, options) => {
    try {
        let {
            id,
            assignmentName: title,
            assignmentDescription: description,
            materials,
            state,
            dueDate,
            dueTime,
            maxMarks : maxPoints,
            associatedWithDeveloper,
            workType,
        } = options;

        workType = "ASSIGNMENT";
        state = state || "PUBLISHED";
        maxPoints = maxPoints || 100;
        associatedWithDeveloper = associatedWithDeveloper || false;
        workType = workType || "SHORT_ANSWER_QUESTION";
        materials = materials || [];

        console.log("creating new assignment for course : ", id);
        

        // Step 5: Create Assignment
    
        const assignmentDetails = {
            // "courseId": string,
            id,
            title,
            description,
            materials,
            state : "PUBLISHED",
            // "alternateLink": string,
            // "creationTime": string,
            // "updateTime": string,
            dueDate,
            dueTime,
            // "scheduledTime": string,
            "maxPoints": maxPoints,
            "workType": "ASSIGNMENT",
            "associatedWithDeveloper": true,
            // "assigneeMode": enum (AssigneeMode),
            // "individualStudentsOptions": {
            //   object (IndividualStudentsOptions)
            // },
            // "submissionModificationMode": enum (SubmissionModificationMode),
            // "creatorUserId": string,
            // "topicId": string,
            // "gradeCategory": {
            //   object (GradeCategory)
            // },
            // "previewVersion": enum (PreviewVersion),

            // Union field details can be only one of the following:
            // "assignment": {
            //   object (Assignment)
            // },
            // "multipleChoiceQuestion": {
            //   object (MultipleChoiceQuestion)
            // }
            // // End of list of possible types for union field details.
            // "gradingPeriodId": string
        };

        const assignmentUrl = `https://classroom.googleapis.com/v1/courses/${id}/courseWork`;

        const assignmentResponse = await axios.post(
            assignmentUrl,
            assignmentDetails,
            {
                headers: {
                    Authorization: `Bearer ${auth.access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return assignmentResponse.data;
    } catch (error) {
        console.error('Error creating course:', error.data || error.message);
        throw error;
    }
};
module.exports = createNewAssignment;