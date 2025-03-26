const axios = require(axios);
const createAssignment = async (auth, options) => {
    try {
        const {
            id,
            title,
            description,
            state,
            dueDate,
            dueTime,
            maxPoints,
            associatedWithDeveloper,
            workType,
        } = options;
        // Step 5: Create Assignment
        const assignmentDetails = {
            // "courseId": string,
            id,
            title,
            description,
            // "materials": [
            //   {
            //     object (Material)
            //   }
            // ],
            state,
            // "alternateLink": string,
            // "creationTime": string,
            // "updateTime": string,
            dueDate,
            dueTime,
            // "scheduledTime": string,
            maxPoints,
            associatedWithDeveloper,
            workType,
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
        // const assignmentDetails = {
        //     // "courseId": string,
        //     "id": myClasses[0].id,
        //     "title": "New Assignment Test",
        //     "description": "This is testing for the new assignment",
        //     // "materials": [
        //     //   {
        //     //     object (Material)
        //     //   }
        //     // ],
        //     "state": "PUBLISHED",
        //     // "alternateLink": string,
        //     // "creationTime": string,
        //     // "updateTime": string,
        //     "dueDate": {
        //         "year": 2025,
        //         "month": 3,
        //         "day": 26
        //     },
        //     "dueTime": {
        //         "hours": 0,
        //         "minutes": 0,
        //         "seconds": 0,
        //         "nanos": 0
        //     },
        //     // "scheduledTime": string,
        //     "maxPoints": 150,
        //     "workType": "SHORT_ANSWER_QUESTION",
        //     "associatedWithDeveloper": false,
        //     // "assigneeMode": enum (AssigneeMode),
        //     // "individualStudentsOptions": {
        //     //   object (IndividualStudentsOptions)
        //     // },
        //     // "submissionModificationMode": enum (SubmissionModificationMode),
        //     // "creatorUserId": string,
        //     // "topicId": string,
        //     // "gradeCategory": {
        //     //   object (GradeCategory)
        //     // },
        //     // "previewVersion": enum (PreviewVersion),

        //     // Union field details can be only one of the following:
        //     // "assignment": {
        //     //   object (Assignment)
        //     // },
        //     // "multipleChoiceQuestion": {
        //     //   object (MultipleChoiceQuestion)
        //     // }
        //     // // End of list of possible types for union field details.
        //     // "gradingPeriodId": string
        // };

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
        console.error('Error creating course:', error);
        throw error;
    }
};
module.exports = createAssignment;