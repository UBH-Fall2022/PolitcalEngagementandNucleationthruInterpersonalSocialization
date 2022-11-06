const getScore = require("./bigML.js");
getScore("I have a vagina").then((score)=>{
    console.log(score);
})