const express = require('express');
const bodyParser = require ("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs");

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
    res.render("forum");
});

app.route("/newsletter")
.get((req, res) =>{
    //Renderizar newsletter
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