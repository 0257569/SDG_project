const express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs"); 
app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true
})); 

var username = "eselemu";

const userFilePath = "./data/user.json";
const user = require(userFilePath);

app.route("/")
.get((req, res) =>{
  res.render("index");
})
.post((req, res) =>{
    res.redirect("/");
});

app.route("/signup")
  .get((req, res) => {
    res.render("login_singup", { action: 'signup' });
  })
  .post((req, res) => {
    // Recopila los datos del formulario de registro
    const newUser = {
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };

    // Verifica si el usuario ya existe
    const userExists = user.some(user => user.username === newUser.username);

    if (userExists) {
      return res.status(400).send("User already exists");
    }

    // Agrega el nuevo usuario al array
    user.push(newUser);

    // Guarda los usuarios en el archivo JSON
    fs.writeFile(userFilePath, JSON.stringify(user, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing users:', err);
        return res.status(500).send('Server Error');
      }
      req.session.username = newUser.username; // Inicia sesión al usuario registrado
      res.redirect("/forum");
    });
  });

app.route("/login")
  .get((req, res) => {
    res.render("login_singup", { action: 'login' });
  })
  .post((req, res) => {
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;

    // Verifica las credenciales del usuario
    //const user = user.find(user => user.username === inputUsername);
    const foundUser = user.find(u => u.username === inputUsername);


    if (foundUser && foundUser.password === inputPassword) {
      req.session.username = inputUsername; // Inicia sesión al usuario
      res.redirect("/forum");
    } else {
      res.status(401).send("Login failed");
    }
  });

/*app.route("/login")
.get((req, res) =>{
  res.render("login_singup");
}) 
.post((req, res) => {
  res.redirect("/");
});*/

// Serve images from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//Routes to my json files
const postsFilePath = "./data/posts.json";
const topicsFilePath = "./data/topics.json"
//Get the list of posts and topics in my json
const posts = require(postsFilePath);
const topics = require(topicsFilePath);
//Current topic of the posts section
var currTopic = "HEALTH";

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: 'uploads/', // Specify the directory for storing uploaded images
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
});

const upload = multer({ storage: storage });

//Filtered posts depending on the topic
var filteredPosts;

app.route("/forum")
.get((req, res) =>{
  //Filter the posts depending on the topic
  filteredPosts = posts.filter(post => post.topic === currTopic);
  // Render your EJS template with the filtered posts
  res.render("forum", { posts: filteredPosts, username: username, currTopic: currTopic, topics: topics.topics });
});

//My post endpoint that is triggered by my post action
//It uploads the images that receives from the request(if any is uploaded)
app.post('/post', upload.single('image'), (req, res) => {
  //Recieve the topic and the content of the post
  const topic = req.body.topic.toUpperCase();
  const content = req.body.content;
  //Creation of json object with the atributes of the post
  const post = {
    author: username,
    topic: topic,
    content: content,
    image: req.file ? `/uploads/${req.file.filename}` : null,//Here if a file is received then it will save in the json object the route to teh alredy uploaded img in uploads
    comments: [],//Comments array, by default the post doesnt have any
    createdAt: moment(new Date()).format('MMM DD, YYYY, HH:mm:ss'),//Date of creation, it is formatted using moment (In order to look nicer and more readable)
  };

    posts.push(post); // Add the new post to the array
    //If the topic doesnt exist then I add it
    if(!(topics.topics.includes(topic))){
      topics.topics.push(topic);
    }
    //Set the current topic to the topic of the new uploaded post
    currTopic = topic;

    // Write the updated topics back to the JSON file
    fs.writeFile(topicsFilePath, JSON.stringify(topics, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing posts:', err);
        return res.status(500).send('Server Error');
      }
    });
    // Write the updated posts back to the JSON file
    fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing posts:', err);
        return res.status(500).send('Server Error');
      }
      //If no errors appear, then is redirected to forum end point
      res.redirect('/forum');
    });
});

app.post('/postComment', (req, res) => {
  currTopic = req.body.currTopic;
  filteredPosts = posts.filter(post => post.topic === currTopic);
  console.log(currTopic);
  const content = req.body.postComment;
  const indexPost = req.body.indexPost;
  console.log(indexPost);

  const comment = {
    author: username,
    text: content,
    createdAt: moment(new Date()).format('MMM DD, YYYY, HH:mm:ss'), // Comment creation timestamp
  };
  posts.forEach(post => {
    if(filteredPosts[indexPost] == post){
      post.comments.push(comment);
    }
  });
  fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing posts:', err);
      return res.status(500).send('Server Error');
    }

    res.redirect('/forum');
  });
});

app.route("/searchTopic")
.get((req, res) =>{
  const topic = req.query.topic.toUpperCase();
  if(topics.topics.includes(topic)){
    currTopic = topic;
  }
  else{
    currTopic = "HEALTH"
  }
  res.redirect('/forum');
});

const news = require('./news.json');

app.route("/newsletter")
.get((req, res) =>{
    res.render("newsletter", {news: news});
});

app.post('/newNews', upload.single('Image'), (req, res) => {
  console.log(req.body.Title);
  const title = req.body.Title;
  const text = req.body.Text;
  const url = req.body.URL;
  const shortD = req.body.ShortDescription
  const newDataToAppend = {
    Image: req.file ? `/uploads/${req.file.filename}` : null,//Here if a file is received then it will save in the json object the route to teh alredy uploaded img in uploads
    Author: "",
    // New author needs the database of users, thats why it is empty
    Title: title,
    Text: text,
    URL: url,
    ShortDescription: shortD
};
news.push(newDataToAppend);
fs.writeFile('./news.json', JSON.stringify(news, null, 2), 'utf8', (err) => {
  if (err) {
    console.error('Error writing news to JSON file:', err);
  } else {
    console.log('News updated in JSON file.');
  }
});

  res.redirect('/newsletter');
});

app.route("/videogame")
.get((req, res) => {
  res.render("videogame");
})
.post((req, res) => {
  res.redirect("/");
});

app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send("There was an error in the app");
});

app.listen(3000, () => {
    console.log("Listening Port 3000");
});