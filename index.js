// Political Engagement and Nucleation by Interpersonal Socialization (PENIS)

const express = require("express");
const app = express();
const db = require("mongodb");

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
    const userQuerySnapshot = db.collection('users').where('username', '==', identifier).get()
    if(userQuerySnapshot.size > 1){
        res.send(500, "You're a dumbass. You broke everything. Now watch it burn!");
        throw new Error("Two usernames same name");
    }
    else if(userQuerySnapshot.size == 1){
        const user = userQuerySnapshot.docs[0]
        return handleLogin(res, user, password);
    }else {
        const userQuerySnapshot = db.collection('users').where('email', '==', identifier).get()
        if(userQuerySnapshot.size > 1){
            res.send(500, "You're a dumbass. You broke everything. Now watch it burn!");
            throw new Error("Two usernames same name");
        }else if(userQuerySnapshot.size == 1){
            const user = userQuerySnapshot.docs[0]
            return handleLogin(res, user, password);
        }else if (!user){
            res.send(404, "User Not Found :(");
        }
        console.error(err);
        res.send(500, "Oopsie :(");
    }
    res.send(500, "Something went very wrong");
});


app.get("/register", async (req,res)=>{
    const { username, email, password } = req.body;
    const user = db.collection('users').where('username', '==', username).get()
    if(user){
        return res.send(400, "User already exists");
    }
    await db.collection('users').add({
        username: username,
        email: email,
        password: password,
        verified: false,
        total_read: 0,
        karma: 0,
        read_today: 0,
    });
    jwt.sign({username: user.username}, process.env.KEY, { algorithm: 'RS256' }, function(err, token) {
        if(err)
            res.sendStatus(500);
        res.cookie("token", token);
        if(req.query.next)
            return res.redirect(req.query.next);
        return res.redirect(".");
    });
});

app.listen(80);