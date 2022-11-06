// Not perseverant memory
[...document.querySelectorAll(".comment")].forEach(el=>{
    el.addEventListener("click", (e)=>{
        fetch("/increaseUserCommentsRead", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: document.getElementById("user_id").textContent,
                post_id: location.href.split("/").reverse().filter(x=>x.length)[0]
            }),
        });
    });
});