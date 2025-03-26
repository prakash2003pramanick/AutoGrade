const express = require('express');
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const connectDB = require('./config/db');
const { getAccessToken } = require('./controllers/auth/google/getAccessToken');
require('dotenv').config();

const app = express();
const port = 3000;
connectDB();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const TOKEN_URL = process.env.GOOGLE_TOKEN_URL;
const AUTH_URL = process.env.GOOGLE_AUTH_URL;

const SCOPES = encodeURIComponent([
  'openid profile email',
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/classroom.topics',
  'https://www.googleapis.com/auth/classroom.topics.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/forms.body',
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
].join(' '));

// Configure axios-retry
axiosRetry(axios, {
  retries: 5, // Number of retries
  retryDelay: (retryCount) => {
    console.log(`Retrying... Attempt ${retryCount}`);
    return retryCount * 1000; // Exponential backoff (1s, 2s, 3s, ...)
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx responses
    return error.code === 'EAI_AGAIN' || axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
});

app.get('/auth/google', (req, res) => {
  const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}&access_type=offline&prompt=consent`;
  console.log('Redirecting to:', authUrl);
  return res.redirect(authUrl);
});

app.get('/auth/google/callback', getAccessToken)
// app.get('/auth/google/callback', async (req, res) => {
//   const code = req.query.code;

//   try {
//     // Step 1: Exchange code for tokens
//     const tokenResponse = await axios.post(TOKEN_URL, null, {
//       params: {
//         code,
//         client_id: CLIENT_ID,
//         client_secret: CLIENT_SECRET,
//         redirect_uri: REDIRECT_URI,
//         grant_type: 'authorization_code',
//       },
//     });

//     console.log("Token Response", tokenResponse.data);
//     const { access_token } = tokenResponse.data;

//     // // Step 2: Fetch Google Classroom Courses
//     // const coursesResponse = await axios.get('https://classroom.googleapis.com/v1/courses', {
//     //   headers: {
//     //     Authorization: `Bearer ${access_token}`,
//     //   },
//     // });

//     // const courses = coursesResponse.data.courses || [];
//     // console.log("Courses", courses);

//     // Step 3: Fetch Google User Info
//     // const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
//     //   headers: {
//     //     Authorization: `Bearer ${access_token}`,
//     //   },
//     // });

//     // console.log("Google User Info", userResponse.data);

//     // // Step 4: Filter Classes Created by You
//     // const myClasses = courses.filter(course => course.ownerId === userResponse.data.id);
//     // console.log("My Classes", myClasses);

//     // if (myClasses.length === 0) {
//     //   return res.status(404).json({ error: 'No classes created by you.' });
//     // }

//     // // Step 5: Create Assignment
//     const assignmentDetails = {
//       // "courseId": string,
//       "id": "762199467218",
//       "title": "Assignment 2",
//       "description": "This is testing for the new assignment",
//       "materials": [
//         {
//           "link": {
//             "url": "https://docs.google.com/forms/d/e/1FAIpQLSfvdOwzj1uVkguQ3BlWYHg2bC6HFh0GRm7A9wKk_21l9YBM0A/viewform",
//             "title": "new form for test",
//             // "thumbnailUrl": string
//           }
//         }
//       ],
//       "state": "PUBLISHED",
//       // "alternateLink": string,
//       // "creationTime": string,
//       // "updateTime": string,
//       "dueDate": {
//         "year": 2025,
//         "month": 3,
//         "day": 28
//       },
//       "dueTime": {
//         "hours": 0,
//         "minutes": 0,
//         "seconds": 0,
//         "nanos": 0
//       },
//       // "scheduledTime": string,
//       "maxPoints": 150,
//       "workType": "ASSIGNMENT",
//       "associatedWithDeveloper": false,
//       // "assigneeMode": enum (AssigneeMode),
//       // "individualStudentsOptions": {
//       //   object (IndividualStudentsOptions)
//       // },
//       // "submissionModificationMode": enum (SubmissionModificationMode),
//       // "creatorUserId": string,
//       // "topicId": string,
//       // "gradeCategory": {
//       //   object (GradeCategory)
//       // },
//       // "previewVersion": enum (PreviewVersion),

//       // Union field details can be only one of the following:
//       // "assignment": {
//       //   object (Assignment)
//       // },
//       // "multipleChoiceQuestion": {
//       //   object (MultipleChoiceQuestion)
//       // }
//       // // End of list of possible types for union field details.
//       // "gradingPeriodId": string
//     };

//     // const assignmentUrl = `https://classroom.googleapis.com/v1/courses/762199467218/courseWork`;
//     // // console.log("Assignment URL", assignmentUrl);

//     // const assignmentResponse = await axios.post(
//     //   assignmentUrl,
//     //   assignmentDetails,
//     //   {
//     //     headers: {
//     //       Authorization: `Bearer ${access_token}`,
//     //       'Content-Type': 'application/json',
//     //     },
//     //   }
//     // );

//     // console.log("Assignment Created", assignmentResponse.data);

//     // // Step 6 : Get assignment submissions
//     // const getCourseWorkURL = `https://classroom.googleapis.com/v1/courses/762199467218/courseWork/762419292233/studentSubmissions`
//     // // const getCourseWorkURL=`https://classroom.googleapis.com/v1/courses/762199467218/courseWork/762419292233`
//     // const foundCourseWork = await axios.get(getCourseWorkURL, {
//     //   headers: {
//     //     Authorization: `Bearer ${access_token}`,
//     //   },
//     // });

//     // console.log("Course Work", foundCourseWork.data.studentSubmissions[0].shortAnswerSubmission);
//     // console.log("History Work", foundCourseWork.data.studentSubmissions[0].submissionHistory);
//     // const createFormUrl = `https://forms.googleapis.com/v1/forms`;
//     // const formDetails = {
//     //   // "formId": string,
//     //   "info": {
//     //     "title": "new form for test",
//     //     // "documentTitle": "test document title",
//     //     // "description": "test description"
//     //   },
//     //   // "settings": {
//     //   //   "quizSettings": {
//     //   //     "isQuiz": true
//     //   //   },
//     //   //   "emailCollectionType": "DO_NOT_COLLECT"
//     //   // },
//     //   // "items": [
//     //   //   {
//     //   //     // "itemId": string,
//     //   //     "title": "this is titile of item 0",
//     //   //     "description": "This is description of item 0",

//     //   //     // Union field kind can be only one of the following:
//     //   //     "questionItem": {
//     //   //       "question": {
//     //   //         // "questionId": string,
//     //   //         "required": true,
//     //   //         "grading": {
//     //   //           "pointValue": 5,
//     //   //           "correctAnswers": {
//     //   //             "answers": [
//     //   //               {
//     //   //                 "value": 'This is an example correct answer'
//     //   //               }
//     //   //             ]
//     //   //           },
//     //   //           // "whenRight": {
//     //   //           //   object (Feedback)
//     //   //           // },
//     //   //           // "whenWrong": {
//     //   //           //   object (Feedback)
//     //   //           // },
//     //   //           // "generalFeedback": {
//     //   //           //   object (Feedback)
//     //   //           // }
//     //   //         }
//     //   //         ,
//     //   //         "textQuestion": {
//     //   //           "paragraph": false
//     //   //         },
//     //   //       },
//     //   //       // "image": {
//     //   //       //   object (Image)
//     //   //       // }
//     //   //     },
//     //   //     // End of list of possible types for union field kind.
//     //   //   }
//     //   // ],
//     //   // "revisionId": string,
//     //   // "responderUri": string,
//     //   // "linkedSheetId": string
//     // };
//     // // Create Form
//     // const createForm = await axios.post(
//     //   createFormUrl,
//     //   formDetails,
//     //   {
//     //     headers: {
//     //       Authorization: `Bearer ${access_token}`,
//     //       'Content-Type': 'application/json',
//     //     },
//     //   }
//     // );
//     // console.log("Form Created", createForm.data);
//     // const updateBatchUrl = `https://forms.googleapis.com/v1/forms/1ZWbNg9Czm26wOj3nSok9qt86-BykRiZmR_k7KrySZo4:batchUpdate`;
//     // const updateDetails = {
//     //   "includeFormInResponse": true,
//     //   "requests": [
//     //     {
//     //       "createItem": {
//     //         "item": {
//     //           // "itemId": string,
//     //           "title": "this is titile of item 0",
//     //           "description": "This is description of item 0",

//     //           // Union field kind can be only one of the following:
//     //           "questionItem": {
//     //             "question": {
//     //               // "questionId": string,
//     //               "required": true,
//     //               // "grading": {
//     //               //   "pointValue": 5,
//     //               //   "correctAnswers": {
//     //               //     "answers": [
//     //               //       {
//     //               //         "value": 'This is an example correct answer'
//     //               //       }
//     //               //     ]
//     //               //   },
//     //               //   // "whenRight": {
//     //               //   //   object (Feedback)
//     //               //   // },
//     //               //   // "whenWrong": {
//     //               //   //   object (Feedback)
//     //               //   // },
//     //               //   // "generalFeedback": {
//     //               //   //   object (Feedback)
//     //               //   // }
//     //               // },
//     //               "textQuestion": {
//     //                 "paragraph": false
//     //               },
//     //             },
//     //             // "image": {
//     //             //   object (Image)
//     //             // }
//     //           },
//     //           //   //     // End of list of possible types for union field kind.
//     //         },
//     //         "location": {

//     //           // Union field where can be only one of the following:
//     //           "index": 0
//     //           // End of list of possible types for union field where.
//     //         }
//     //       },
//     //     }
//     //   ],
//     //   "writeControl": {

//     //     // Union field control can be only one of the following:
//     //     "requiredRevisionId": "00000002",
//     //     // End of list of possible types for union field control.
//     //   }
//     // };
//     // // Create Form
//     // const updateForm = await axios.post(
//     //   updateBatchUrl,
//     //   updateDetails,
//     //   {
//     //     headers: {
//     //       Authorization: `Bearer ${access_token}`,
//     //       'Content-Type': 'application/json',
//     //     },
//     //   }
//     // );
//     // console.log("Form Created", updateForm.data);





//     res.redirect(`http://localhost:5173?token=200`);
//   } catch (error) {
//     console.error('Error:', error?.response?.data || error.message);
//     console.error('Error :', error?.response?.data.error.details[0].fieldViolations);
//     console.error('Error message:', error.message);
//     // console.error('Error details:', error?.error?.details);
//     res.status(500).json({ error: 'Something went wrong.' });
//   }
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
