window.onload = function(){
    var login = document.getElementById("login")
    let ca = document.cookie.split(';');
    var i = 0;
    for (i=0; i < ca.length; i++){
        let mylist = ca[i].split("=")
        if (mylist[0].trim() == "token"){
            login.style.display = "none"
        }
    }
}
