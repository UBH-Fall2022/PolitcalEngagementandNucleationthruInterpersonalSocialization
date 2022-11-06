const getScore = require("./bigML.js");
getScore("Joe Biden is a very stinky old man. I love Trump. Babies, guns, bless the church. Amen and God Bless America.").then((score)=>{
    console.log(score);
})