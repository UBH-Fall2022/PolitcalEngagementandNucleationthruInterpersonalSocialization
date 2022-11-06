module.exports = function(allCommentData, recursive=false){
    let orderedComments = [];
    const sortedComments = allCommentData.sort((a,b) => a.politicization_index - b.politicization_index);
    let polList=[];
    for (let x of sortedComments){
        polList.push(x.get("politicization_index"));
    }
    while (polList.length >= 4){
        var index = polList.length;
        var sml = Math.floor(polList.length / 4);
        var grouping = [];
        for (const x of Array(4).keys()){
            index -= sml;
            var targetdel = index + Math.floor(sml * Math.random());
            grouping.push(sortedComments[targetdel]);
            sortedComments.splice(targetdel,1);
        }
        polList=[];
        for (let x of sortedComments){
            polList.push(x.get("politicization_index"));
        }
        var shuffled = grouping;
        const shuffledArray = shuffled.sort((a,b) => 0.5 - Math.random());
        orderedComments.push(...shuffledArray);
    }
    orderedComments.push(...sortedComments);
    return orderedComments;
}