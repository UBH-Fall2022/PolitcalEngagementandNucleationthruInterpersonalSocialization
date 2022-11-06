window.onload = function(){
    var user_karma = document.getElementById("user_karma")
    var karma_value = user_karma.innerText.split('/')[0].trim()
    if (karma_value < 50){
        document.getElementById("form").style.opacity = '50%';
    }
}