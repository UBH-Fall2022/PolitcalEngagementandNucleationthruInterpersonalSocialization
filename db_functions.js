async function getUser_Connection(userPk, connectPk, dbName){
    let user_post = await db.collection(dbName).where('user_id', '==', userPk).where('post_id', connectPk).get();
    user_post = user_post.docs[0]
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
// Expect paramaters are preprocessed maps
async function canUserThis(user_this, field){
    const user = user_this.docs[0];
    const cur_this_done = user.get(field)
    return cur_this_done >= 4
}

async function canUserComment(user_post){
    return await canUserThis(user_post, "comments_read");
}

async function canUserPost(user_topic){
    return await canUserThis(user_topic, "comments_made");
}

async function howMany(user_this, field){
    const user = user_this.docs[0];
    const cur_this_done = user.get(field)
    return cur_this_done
}

async function numUserRead(user_post){
    return await canUserThis(user_post, "comments_read");
}

async function numUserWrite(user_topic){
    return await canUserThis(user_topic, "comments_made");
}

async function userRead(user, user_post){
    const cur_comments_read = user_post.get("comments_read")
    const cur_karma = user.get('karma')
    await user.update({karma: cur_karma + 1})
    return await user_post.update({comments_read: cur_comments_read + 1})
}

async function userCommented(user, user_topic){
    const cur_comments_made = user_topic.get("comments_made")
    const cur_karma = user.get('karma')
    await user.update({karma: cur_karma + 2})
    return await user_topic.update({comments_made: cur_comments_made + 1})
}

async function userPosted(user){
    const cur_karma = user.get('karma')
    return await user.update({karma: cur_karma + 4})
}