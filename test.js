// const getScore = require("./bigML.js");
// getScore("Joe Biden is a very stinky old man. I love Trump. Babies, guns, bless the church. Amen and God Bless America.").then((score)=>{
//     console.log(score);
// })

// Political Engagement and Nucleation by Interpersonal Socialization (PENIS)
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./politicalsentimentsocialmedia-912a5a03cd6b.json');
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

// db.collection("Topics").add({
//     author: "JackDeezNuts",
//     title: "Post Title",
//     date: new Date(),
//     content: "Post content. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eos in tempora cumque, qui tempore delectus nostrum voluptas ullam nihil deleniti nam explicabo atque blanditiis pariatur officia harum quam rerum enim. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eos in tempora cumque, qui tempore delectus nostrum voluptas ullam nihil deleniti nam explicabo atque blanditiis pariatur officia harum quam rerum enim."
// });

// (async () => {
//     let topics = await db.collection("Topics").get();
//     console.log(topics.docs[0].id);
// })();
const getScore = require("./bigML.js");
getScore("I have a vagina").then((score)=>{
    console.log(score);
});

const shuffleViews = require("./viewShuffler.js");
const comments = shuffleViews([{"politicization_index":-.9},{"politicization_index":-.7},{"politicization_index":-.5},{"politicization_index":-.3},{"politicization_index":-.1},{"politicization_index":.1},{"politicization_index":.3},{"politicization_index":.5},{"politicization_index":.7},{"politicization_index":.9}]);
console.log(comments);
