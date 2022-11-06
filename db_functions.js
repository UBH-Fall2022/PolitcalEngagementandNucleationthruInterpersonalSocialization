const verifyToken = require("./verifyToken.js");
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./politicalsentimentsocialmedia-912a5a03cd6b.json');
const e = require("express");

initializeApp({
    credential: cert(serviceAccount)
  });
const db = getFirestore();


async function getUser_Connection(userPk, connectPk, dbName){
    let user_post = await db.collection(dbName).where('user_id', '==', userPk).where('post_id', connectPk).get();
    if (user_post.size==1){
        return user_post;
    }else{
        throw new Error("Found multiple user_id model with post_id, Expected Size: 1, Found "+ user_post.size)
    }
}

async function getUser_Posts(userPk, postPk){
    try{
        return await getUser_Connection(userPk, postPk, "user_post");
    } 
    catch (err) {
        throw err;
    }
}

async function getUser_Topic(userPk, topicPk){
    try{
        return await getUser_Connection(userPk, postPk, "user_topic");
    }
    catch (err){
        throw err;
    }
}
// assume username and postPk are single values
async function canUserThis(user_this, field){
    const user = user_this.docs[0];
    const cur_this_done = user.get(field)
    return cur_this_done >= 4
}

async function canUserComment(user_post){
    return await canUserThis(user_post, "comments_read");
}

async function canUserPost(user_topic){
    return await canUserThis(user_post, "comments_made");
}


async function userRead(user_post){
    if (user_post.size == 1){
        const user = user_post.docs[0];
        const cur_comments_read = user.get("comments_read")
        return await user.update({comments_read: cur_comments_read + 1})
    }
}

async function userCommented(user_post){
    if (user_post.size == 1){
        const user = user_post.docs[0];
        const cur_comments_made = user.get("comments_made")
        return await user.update({comments_made: cur_comments_made + 1})
    }
}

app.getO("ascac", verifyToken, (req,res)=>{
    const username = req.JWTBody.username
})