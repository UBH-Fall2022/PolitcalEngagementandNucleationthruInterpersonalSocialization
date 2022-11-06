const getScore = require("./bigML.js");
getScore("I have a vagina").then((score)=>{
    console.log(score);
});

const shuffleViews = require("./viewShuffler.js");
const comments = shuffleViews([{"politicization_index":-.9},{"politicization_index":-.7},{"politicization_index":-.5},{"politicization_index":-.3},{"politicization_index":-.1},{"politicization_index":.1},{"politicization_index":.3},{"politicization_index":.5},{"politicization_index":.7},{"politicization_index":.9}]);
console.log(comments);