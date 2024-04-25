const gameRequestBtn = document.getElementById('gameFriendButton');

gameRequestBtn.addEventListener('click', () => {
    window.location.href = '../friendSelection/friendSelection.html';
});

document.addEventListener("DOMContentLoaded", function() {
    var connect = navigator.connection.type;
    if(connect.toString() === "none"){
        console.log("noneIsTheNetwork");
        document.getElementById("gameOnlineButton").style.opacity = "0.5";
        document.getElementById("gameFriendButton").style.opacity = "0.5";
        document.getElementById("gameOnlineButton").style.pointerEvents = "none";
        document.getElementById("gameFriendButton").style.pointerEvents = "none";
    }
    if(connect.toString() === "wifi"){
        console.log("wifiIsTheNetwork");

    }
    if(connect.toString() === "cellular"){
        console.log("cellularIsTheNetwork");

    }
});

window.addEventListener('online', function(event) {
    location.reload();
});

window.addEventListener('offline', function(event) {
    location.reload();
});
