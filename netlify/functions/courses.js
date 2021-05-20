// Goal: Kellogg course reviews API!
//
// Business logic:
// - Courses can be taught by more than one lecturer (e.g. Brian Eng's KIEI-451 and Ben Block's KIEI-451)
// - Information on a course includes the course number (KIEI-451) and name (Intro to Software Development)
// - Lecturers can teach more than one course (e.g. Brian Eng teaches KIEI-451 and KIEI-925)
// - Reviews can be written (anonymously) about the lecturer/course combination (what would that be called?)
// - Reviews contain a String body, and a numeric rating from 1-5
// - Keep it simple and ignore things like multiple course offerings and quarters; assume reviews are written
//   about the lecturer/course combination only – also ignore the concept of a "user" and assume reviews
//   are written anonymously
//
// Tasks:
// - (Lab) Think about and write the domain model - fill in the blanks below
// - (Lab) Build the domain model and some sample data using Firebase
// - (Lab) Write an API endpoint, using this lambda function, that accepts a course number and returns 
//   information on the course and who teaches it
// - (Homework) Provide reviews of the lecturer/course combinations 
// - (Homework) As part of the returned API, provide the total number of reviews and the average rating for 
//   BOTH the lecturer/course combination and the course as a whole.

// === Domain model - fill in the blanks ===
// There are 4 models: courses, lecturers, sections, reviews
// There is one many-to-many relationship: courses <-> lecturers, which translates to two one-to-many relationships:
// - One-to-many: courses -> sections
// - One-to-many: lecturers -> sections
// And one more one-to-many: sections -> reviews
// Therefore:
// - The first model, courses, contains the following fields: courseNumber, name
// - The second model, lecturers, contains the following fields: name
// - The third model, sections, contains the following fields: courseId, lecturerId
// - The fourth model, reviews, contains the following fields, sectionId, body, rating

// allows us to use firebase
let firebase = require(`./firebase`)

// /.netlify/functions/courses?courseNumber=KIEI-451
exports.handler = async function(event) {

  // get the course number being requested
  let courseNumber = event.queryStringParameters.courseNumber
  // establish a connection to firebase in memory
  let db = firebase.firestore()
  // ask Firebase for the course that corresponds to the course number, wait for the response
  let courseQuery = await db.collection('courses').where(`courseNumber`, `==`, courseNumber).get()
  // get the first document from the query
  let course = courseQuery.docs[0]
  // get the id from the document
  let courseId = course.id
  // get the data from the document
  let courseData = course.data()
  // create an object with the course data to hold the return value from our lambda
  let returnValue = {
    courseNumber: courseData.courseNumber,
    name: courseData.name
  }

  // set a new Array as part of the return value
  returnValue.sections = []
  
  // ask Firebase for the sections corresponding to the Document ID of the course, wait for the response
  let sectionsQuery = await db.collection('sections').where(`courseId`, `==`, courseId).get()

  // get the documents from the query
  let sections = sectionsQuery.docs

 //declaring a variable for use in calculating the average course rating
 let sumCourseRating = 0

 //declaring a variable for use in calculating the number of course reviews
 let courseReviewCounter = 0

  // loop through the documents
  for (let i=0; i < sections.length; i++) {
    // get the document ID of the section
    let sectionId = sections[i].id
    // get the data from the section
    let sectionData = sections[i].data()
    // create an Object to be added to the return value of our lambda
    let sectionObject = {}
    // ask Firebase for the lecturer with the ID provided by the section; hint: read "Retrieve One Document (when you know the Document ID)" in the reference
    let lecturerQuery = await db.collection('lecturers').doc(sectionData.lecturerId).get()
    // get the data from the returned document
    let lecturer = lecturerQuery.data()
    // add the lecturer's name to the section Object
    sectionObject.lecturerName = lecturer.name


    returnValue.sections.push(sectionObject)


  // 🔥🔥🔥🔥🔥🔥 your code for the reviews/ratings goes here🔥🔥🔥🔥🔥🔥
    // ask Firebase for the reviews corresponding to the Section ID of the course, wait for the response
    let reviewsQuery = await db.collection('reviews').where(`sectionId`, `==`, sectionId).get()
    // get the documents from the query
    let reviews = reviewsQuery.docs

    //declaring a variable for use in calculating the average section rating
    let avgSecRating = 0
   
    // loop through the reviews
    for (let i=0; i < reviews.length; i++) {
      // create an Object to be added to the return value of our lambda
      let reviewsObject = {}
      // get the data from the review
      let reviewsData = reviews[i].data()
      // add the review body to the review object
      reviewsObject.comment = reviewsData.body
      // add the rating to the review Object
      reviewsObject.rating = reviewsData.rating
      // add the review Object to the sections object
      returnValue.sections.push(reviewsObject)
      // add up the section ratings while in the loop for use later
      avgSecRating += reviewsData.rating
      } 

      //Count the number of reviews for this particular section
      let sectionReviewCount = `Number of reviews for section: ${reviews.length}`
      //Send the section review count to the section object
      returnValue.sections.push(sectionReviewCount)

      //Calculate the average section rating
      let averageSecRate = avgSecRating/reviews.length
      //Take the average section rating and insert into a string
      let averageSectionRating = `Average Rating of Section: ${averageSecRate}`
      //Send the average section rating string to the section object
      returnValue.sections.push(averageSectionRating)
      //Calculating the sum of the section ratings to find Average Course Rating
      sumCourseRating += averageSecRate

      //Inserting the Average Course Rating into the Return Value
      returnValue.averageCourseRating = sumCourseRating/sections.length

      //Counting reviews for the course
      courseReviewCounter += reviews.length

      //Inserting the total number of course reviews into the Return Value
      returnValue.totalCourseReviews = courseReviewCounter

}
// return the standard response
  return {
    statusCode: 200,
    body: JSON.stringify(returnValue)
  }

}
