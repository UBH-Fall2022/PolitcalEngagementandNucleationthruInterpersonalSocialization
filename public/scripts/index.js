console.log("gen stars");
const thisBody = document.getElementsByTagName("body")

class shiningStar{
    constructor(x, y, obj){
        this.x = x;
        this.y = y;
        this.size = 0;
        this.time_to_life = 100;
        this.halfway = 50;
        this.obj = obj;
        this.obj.style.position = "absolute"
        this.obj.style.left = x + "px";
        this.obj.style.top = y + "px";
    }
    shine(starShine){
        this.time_to_life -= 1
        if (this.time_to_life <= 0){
            clearInterval(starShine);
            this.kill()
        }
        if (this.time_to_life >= this.halfway){
            this.size += 1;
        }else{
            this.size -= 1;  
        }
        this.obj.style.width = this.size + "px";
        this.obj.style.height = this.size + "px";
        this.obj.style.x = this.obj.style.x - 1;
        this.obj.style.y = this.obj.style.y - 1;
        this.obj.style.opacity = this.size * 2 + "%";
    }

    display(){
        thisBody[0].prepend(this.obj);
    }

    kill(){
        this.obj.remove();
    }
    
}

var genStars = setInterval(function(){
    const starImg = document.createElement("img")
    starImg.src = "/static/Star 4.svg"
    const myStarObj = new shiningStar(Math.random() * document.body.clientWidth, window.scrollY + Math.random() * document.body.clientHeight, starImg)
    starImg.style.width = 0;
    starImg.style.height = 0;
    starImg.classList.add("star");
    myStarObj.display()
    const starShine = setInterval(function(){
        myStarObj.shine(starShine)
    }, 50)
}, 1000)
