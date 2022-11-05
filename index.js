// Political Engagement and Nucleation by Interpersonal Socialization (PENIS)

const express = require("express");
const app = express();
const db = require("mongodb");

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://admin:harry_potter_and_the_hunger_games@sexypolitics.q3wqw8w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
async function run() {
    try {
        const database = client.db('sample_mflix');
        const movies = database.collection('movies');
        // Query for a movie that has the title 'Back to the Future'
        const query = { title: 'Back to the Future' };
        const movie = await movies.findOne(query);
        console.log(movie);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("./verifyToken.js");
require("dotenv/config");

const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(require('cookie-parser')());
app.set('view engine', 'pug');

app.get("/", (req,res) => {
    res.render("index");
});

app.get("/login", verifyToken, (req,res) => {
    res.render("login");
});

function handleLogin(res, user, password){
    bcrypt.compare(password, user.password, (err, same)=>{
        if(err)
            // redirect to error page
            res.sendStatus(500);
        if(!same)
            res.send(400, "Bad Password");
        // Validate URL
        jwt.sign({ username: user.username }, process.env.KEY, { algorithm: 'RS256' }, function(err, token) {
            if(err)
                res.sendStatus(500);
            res.cookie("token", token);
            if(req.query.next)
                return res.redirect(req.query.next);
            return res.redirect(".");
        });
    });
}

app.post("/login", (req,res) => {
    const { identifier, password } = req.body;
    users.find({email: identifier}, (err, [user])=>{
        if(err){
            console.error(err);
            res.send(500, "Oopsie :(");
        }
        if(user)
            return handleLogin(res, user, password);
        users.find({username: identifier}, (err, [user])=>{
            if(err){
                console.error(err);
                res.sendStatus(500);
            } else if (!user){
                res.send(404, "User Not Found :(");
            }
            handleLogin(res, user, password);
        });
    });
    res.send(500, "Something went very wrong");
});

app.get("/register", (req,res)=>{
    const { username, email, password } = req.body;
    users.find({username}, (err, [user])=>{
        if(err){
            console.error(err);
            res.send(500, "Oopsie :(");
        } else if(!user){
            res.send(400, "User already exists");
        }
        users.insert({username, email, password, verified: false, total_read: 0, karma: 0, read_today: 0}, (err)=>{
            if(err){
                console.error(err);
                res.send(500, "error adding user to database");
            }
            jwt.sign({username: user.username}, process.env.KEY, { algorithm: 'RS256' }, function(err, token) {
                if(err)
                    res.sendStatus(500);
                res.cookie("token", token);
                if(req.query.next)
                    return res.redirect(req.query.next);
                return res.redirect(".");
            });
        });
    })
});

app.listen(80);