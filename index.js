// Political Engagement and Nucleation by Interpersonal Socialization (PENIS)
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./politicalsentimentsocialmedia-912a5a03cd6b.json');
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("./verifyToken.js");
require("dotenv/config");

const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(require('cookie-parser')());
app.use("/static", express.static(`${__dirname}/public`));
app.set('view engine', 'pug');

app.get("/", (req,res) => {
    res.render("index");
});

app.get("/login", verifyToken, (req,res) => {
    res.render("login");
});

app.post("/login", async (req,res) => {
    const { identifier, password } = req.body;
    let users = await db.collection('users').where('email', '==', identifier).get();
    if(!users.size)
        users = await db.collection('users').where('username', '==', identifier).get();
    if(!users.size){
        return res.status(404).send("User Not Found :(");
    }
    const user = users.docs[0];
    bcrypt.compare(password, user.get("password"), (err, same)=>{
        if(err)
            // redirect to error page
            return res.status(500, err);
        if(!same)
            return res.status(400).send("Bad Password");
        // Validate URL
        jwt.sign({ username: user.get("username") }, process.env.KEY, function(err, token) {
            if(err)
                return res.status(500).send("token not created");
            if(req.query.next)
                return res.cookie("token", token).redirect(req.query.next);
            return res.cookie("token", token).redirect(".");
        });
    });
});

app.get("/register", verifyToken, (req,res) => {
    res.render("register");
});

app.post("/register", async (req,res)=>{
    const { username, email, password } = req.body;
    const users = await db.collection('users').where('username', '==', username).get()
    if(users.size > 1){
        res.send(500, "You're a dumbass. You broke everything. Now watch it burn!");
        throw new Error("Two usernames same name");
    }else if(users.size == 1){
        return res.send(400, "User already exists");
    }
    await db.collection('users').add({
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 10),
        verified: false,
        total_read: 0,
        karma: 0,
        read_today: 0,
    });
    jwt.sign({username: username}, process.env.KEY, function(err, token) {
        if(err){
            console.error(err);
            return res.status(500).send("jwt failed");
        }
        res.cookie("token", token);
        if(req.query.next)
            return res.redirect(req.query.next);
        return res.redirect(".");
    });
});

app.get("/chat", verifyToken, (req,res)=>{
    if(req.anonymous)
        return res.redirect(`/login?next=${req.originalUrl}`);
    res.render("chat");
});

function getTopics(){
    return db.collection("topics").get();
}

function getTopic(topic_id){
    return db.collection("topics").where("ID", "==", req.params.topic).get()?.docs?.[0];
}

function getTopicPosts(topic_id){
    return getTopic(topic_id)?.get("posts").get();
}

app.get("/chat/:topic/", verifyToken, (req,res)=>{
    if(!req.params.topic)
        return res.redirect("/chat");
    const topic = getTopic();
    if(!topic)
        return res.status(404).send("Topic Not Found");
    res.render("topic", {
        topic,
        posts: getTopicPosts(req)
    });
});

app.get("/chat/:topic/:post", verifyToken, (req,res)=>{
    const topic_collection = db.collection("topics").where("ID", "==", req.params.topic).get();
    let topic = topic_collection.docs?.[0];
    if(!topic)
        return res.status(404).send("Topic Not Found");
    const post_collection = topic.get("posts").get();
});

app.post("/chat", verifyToken, (req,res)=>{
    if(req.anonymous)
        return res.sendStatus(401);
});

app.listen(80);