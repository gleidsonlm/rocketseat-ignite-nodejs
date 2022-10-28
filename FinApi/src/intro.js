/* 
 * Node.js project for API services backend.
 */

/* Express will be the HTTP server by default. */
const express = require('express');
// Express will listen on port 8080
const app = express();
try {
  app.listen(8080); 
  console.log('Express server listening on port 8080'); 
} catch (error) {
  console.error();
}

/* API will handle json request/responses body. */
app.use(express.json());

// Favicon route
app.get('/favicon.ico', (req, res) => {
  res.sendFile(__dirname + '/public/favicon.ico');
})

// Course array for example is global
const courses = [{id: 1,name: 'Math'},{id: 2,name: 'Physics'},{id: 3,name: 'Chemistry'},{id: 4,name: 'Biology'}]

/* 
 * get "/" route returns endpoints list
 */
app.get('/', (req, res) => {
  const query = req.query;
  console.log(query);
  res.json({
    endpoints: "use these endpoints for your requests",
    course: "/courses",
  })
});

/* Course Routes */

/* GET "/courses" return all courses paginated (limit,offset)
 * Query parameters return course by id and pagination options.
 */
app.get('/courses', (req, res) => {
  const query = req.query;
  console.log(query);
  res.json(courses);
});

/* POST "/courses" add a new course to the array. */
app.post('/courses', (req, res) => {
    console.log(req.body);
    const newCourse = req.body;
    // Check if the body is a JSON object
    if(typeof newCourse!== 'object') {
      res.status(400).json({
          message: 'Body must be a JSON object'
      });
    // Check if the JSON object has a "name" property.
    } else if(!newCourse.name) {
        res.status(400).json({
            message: 'Body must be JSON object with "name" property and value.'
        });
    // create the new course object 
    } else {
      const newCourseId = courses.length + 1;
      const newCourseObj = {
          id: newCourseId,
          name: newCourse.name,
      }
      // push the new course with autoincrement "id" and request body "name"
      courses.push(newCourseObj);
      res.json(newCourseObj);
    }
  });

/* get "/courses/:id" return the course identified in the route parameter */
app.get('/courses/:id', (req, res) => {
  const id = req.params.id;
  console.log(`select * from courses where id = ${id}`);
  let found = courses.find((e) => e.id == req.params.id)
  res.json(found);
});

/* app.put(
  '/courses/:id',
  (req, res) => {
    console.log(req.body);
    res.json({ 'implemented': false  })
})

app.patch(
  '/courses/:id',
  (req, res) => {
    console.log(req.body);
    res.json({'implemented': false
  })
})
app.delete(
  '/courses/:id',
  (req, res) => {
    console.log(req.body);
    res.json({'implemented': false
  })
})
*/