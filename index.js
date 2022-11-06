// Political Engagement and Nucleation by Interpersonal Socialization (PENIS)
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./politicalsentimentsocialmedia-912a5a03cd6b.json');

// db_functions.js 

async function getUser_Other(user_id, other_id, otherName, dbName){
    let user_post = await db.collection(dbName).where('user_id', '==', user_id).where(`${otherName}_id`, '==', other_id).get();
    return user_post;
}

async function userCommentsRead(user_id, post_id){
    const user_post_query = await getUser_Other(user_id, post_id, "post", "user_post");
    if(!user_post_query.size)
        return 0;
    return user_post.query.docs[0].get("comments_read");
}

async function userCommentsMade(user_id, topic_id){
    const user_topic_query = await getUser_Other(user_id, topic_id, "topic", "user_topic");
    if(!user_topic_query.size)
        return 0;
    return user_topic_query.docs[0].get("comments_made");
}

// Expect paramaters are preprocessed maps
async function canUserThis(user_doc, other_id, field){
    switch(field){
        case "comment":
            return userCommentsRead(user.id, other_id) >= 4;
        case "post":
            return userPostsInteractedWith(user.id, other_id) >= 4;
        default:
            throw new Error("Unimplemented field");
    }
}

async function canUserComment(user_post){
    return await canUserThis(user_post, "comments_read");
}

async function canUserPost(user_topic){
    return await canUserThis(user_topic, "comments_made");
}

async function userRead(user_id, post_id){
    const user_post_query = await db.collection("User_Post").where("user_id", "==", user_id).where("post_id", "==", post_id).get();
    if(user_post_query.size == 0){
        db.collection("User_Post").add({
            user_id,
            post_id,
            comments_read: 1
        });
        return;
    }
    const user_post_doc = user_post_query.docs[0];
    const user_doc = await db.collection("users").doc(user_id);
    await user_doc.update({karma: user_doc.get("karma") + 1});
    await db.collection("User_Post").doc(user_post_doc.id).update({comments_read: user_post_doc.get("comments_read") + 1});
}

async function userCommented(user_id, tppic_id){
    const user_topic_query = await db.collection("User_Topic").where("user_id", "==", user_id).where("topic_id", "==", topic_id).get();
    if(user_topic_query.size == 0){
        db.collection("User_Topic").add({
            user_id,
            topic_id,
            comments_made: 0
        });
        return;
    }
    const user_topic_doc = user_topic_query.docs[0];
    const user_doc = await db.collection("users").doc(user_id);
    await user_doc.update({karma: user_doc.get("karma") + 1});
    await db.collection("User_Topic").doc(user_topic_doc.id).update({comments_made: user_topic_doc.get("comments_made") + 1});
}

async function userPosted(user){
    const cur_karma = user.get('karma')
    return await user.update({karma: cur_karma + 4})
}


initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();
const shuffle = require("./viewShuffler.js");

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
    if(!users.size)
        return res.status(404).send("User Not Found :(");
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

async function getTopics(){
    return (await db.collection("Topics").get()).docs;
}

async function getTopic(topic_id){
    if(!topic_id || topic_id == "")
        return null;  
    return await db.collection("Topics").doc(topic_id).get();
}

async function getPost(post_id, topic_id){
    return await db.collection("Topics").doc(topic_id).collection("Posts").doc(post_id).get();
}

async function getTopicPosts(topic_id){
    return await db.collection("Topics").doc(topic_id).collection("Posts").get();
}

async function getPostComments(post_id, topic_id){
    return await db.collection("Topics").doc(topic_id).collection("Posts").doc(post_id).collection("Comments").get();
}

app.get("/chat", verifyToken, async (req,res)=>{
    if(req.anonymous)
        return res.redirect(`/login?next=${req.originalUrl}`);
    const topics = await getTopics();
    const username = req.JWTBody.username;
    const temp = await db.collection("users").where("username", "==", username).get();
    const user = temp.docs[0];
    res.render("chat", {
        topics: await getTopics(),
        user_id: user.id,
        user_karma: user.get("karma"),
    });
});

app.get("/chat/:topic/", verifyToken, async (req,res)=>{
    if(req.anonymous)
        return res.redirect(`/login?next=${req.originalUrl}`);
    if(!req.params.topic){
        console.error("No topic");
        return res.redirect("/chat");
    }
    const topic = await getTopic(req.params.topic);
    if(!topic){ // 404
        console.error("Topic Not Found");
        return res.redirect("/");
    }
    const posts = await getTopicPosts(req.params.topic);
    const username = req.JWTBody.username;
    const users = await db.collection("users").where("username", "==", username).get();
    const user = users.docs[0];
    const user_topic = (await userCommentsMade(user.id, req.params.topic))?.docs?.[0];
    res.render("topic", {
        topic,
        posts: shuffle(posts.docs),
        user_id: user.id,
        comments_made: user_topic?.get("comments_made") ?? 0
    });
});

app.get("/chat/:topic/:post", verifyToken, async (req,res)=>{
    if(req.anonymous)
        return res.redirect(`/login?next=${req.originalUrl}`);
    if(!req.params.topic){
        console.error("No topic");
        return res.redirect("/chat");
    }
    const topic = await getTopic(req.params.topic);
    if(!topic){ // 404
        console.error("Topic Not Found");
        return res.redirect("/");
    }
    if(!req.params.post){
        console.error("No post");
        return res.redirect("/chat");
    }
    // Unsafe:
    const user = (await db.collection("users").where("username", "==", req.JWTBody.username).get()).docs[0];
    const post = await getPost(req.params.post, req.params.topic);
    if(!post){ // 404
        console.error("Post Not Found");
        return res.redirect("/");
    }
    let comments = await getPostComments(req.params.post, req.params.topic);
    let comments_read = await userCommentsRead(user.id, req.params.post);
    res.render("post", {
        topic,
        post,
        comments_read,
        user_id: user.id,
        comments: shuffle(comments?.docs)
    });
});

app.post("/chat", verifyToken, async (req,res)=>{
    if(req.anonymous)
        return res.redirect(`/login?next=${req.originalUrl}`);
    const {title, context} = req.body;
    const username = req.JWTBody.username;
    const users = await db.collection("users").where("username", "==", username).get();
    const user = users.docs[0];
    if(user.get("verified") || user.get("karma") >= 50){
        db.collection("users").doc(user.id).update({karma: user.get("karma") - 50});
        db.collection("Topics").add({
            author: username,
            date: new Date().toISOString(),
            title,
            context,
        });
        res.redirect("/chat");
    }
});

app.post("/chat/:topic", verifyToken, async (req,res)=>{
    const {title, content} = req.body;
    if(req.anonymous)
        return res.redirect(`/login/?next=${req.originalUrl}`);
    const username = req.JWTBody.username;
    const users = await db.collection("users").where("username", "==", username).get();
    const user = users.docs[0];
    if(canUserPost(user)){
        db.collection("Topics").doc(req.params.topic).collection("Posts").add({
            author: username,
            date: new Date().toISOString(),
            title
        });
        res.redirect("/chat");
    }
});

app.get("/karma_please", verifyToken, async (req,res)=>{
    if(req.anonymous){
        return res.redirect("/login");
    }
    const username = req.JWTBody.username;
    const users = await db.collection("users").where("username", "==", username).get();
    const user = users.docs[0];
    await db.collection("users").doc(user.id).update({karma: user.get("karma") + 500});
    res.send("The karma has been added to your account!");
});

app.get("/rules", verifyToken, (req, res)=>{
    res.render("rules");
});

app.get("/about_us", verifyToken, (req, res)=>{
    res.render("about_us");
});

// API stuff

app.post("/increaseUserCommentsRead", async (req,res)=>{
    const {user_id, post_id} = req.body;
    await userRead(user_id, post_id);
    res.send("Comment marked as read if no error");
})

const PORT = process.env.PORT || 80;

app.listen(PORT);