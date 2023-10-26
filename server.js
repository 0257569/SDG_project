const express = require('express');
const bodyParser = require ("body-parser");
const moment = require('moment');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs");

//All this is going to be obtained from the server
const posts = [
    {
      author: 'User1',
      topic: 'First Post',
      content: 'This is the first post. Welcome to the community!',
      image: 'image1.jpg',
      comments: [
        {
          author: 'User2',
          text: 'Welcome! Excited to be here.',
          createdAt: moment(new Date()).format('MMM DD, YYYY, HH:mm:ss'), // Comment creation timestamp
        },
        {
          author: 'User3',
          text: 'Thanks for starting this community!',
          createdAt: moment(new Date()).format('MMM DD, YYYY, HH:mm:ss'), // Comment creation timestamp
        },
      ],
      createdAt: moment(new Date()).format('MMM DD, YYYY, HH:mm:ss'), // Post creation timestamp
    },
    {
      author: 'User4',
      topic: 'Second Post',
      content: 'Here\'s the second post. Feel free to share your thoughts!',
      image: 'image2.jpg',
      comments: [
        {
          author: 'User5',
          text: 'Looking forward to some interesting discussions!',
          createdAt: moment(new Date()).format('MMM DD, YYYY, HH:mm:ss'), // Comment creation timestamp
        },
      ],
      createdAt: moment(new Date()).format('MMM DD, YYYY, HH:mm:ss'), // Post creation timestamp
    },
  ];
  

var username = "eselemu";

app.route("/")
.get((req, res) =>{
    //Renderizar index
})
.post((req, res) =>{
    res.redirect("/");
});

app.route("/login")
.get((req, res) =>{
    //Renderizar login
});

app.route("/forum")
.get((req, res) =>{
    res.render("forum", {posts: posts, username: username});
});

app.post('/post', (req, res) => {
    const topic = req.body.topic;
    const content = req.body.content;
    //For now I wont be handling images or post it them through the server as this will be done from the database :)
  
    const post = {
        author: username,
        topic: topic,
        content: content,
        image: 'bommmba.jpg',
        comments: [],
        createdAt: moment(new Date()).format('MMM DD, YYYY, HH:mm:ss'),
    };
    console.log(post);
    posts.push(post);
    res.redirect('/forum');
});

app.route("/newsletter")
.get((req, res) =>{
    res.render("newsletter");
});

app.route("/videogame")
.get((req, res) =>{
    //Renderizar videogame
});

app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send("There was an error in the app");
});

app.listen(3000, () => {
    console.log("Listening Port 3000");
});