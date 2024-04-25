import { isMobileDevice } from '../js/utils.js';

const gameRequestBtn = document.getElementById('gameFriendButton');

gameRequestBtn.addEventListener('click', () => {
    window.location.href = '../friendSelection/friendSelection.html';
});

document.addEventListener("DOMContentLoaded", function() {
    if(isMobileDevice()) {
        var connect = navigator.connection.type;
        if (connect.toString() === "none") {
            console.log("noneIsTheNetwork");
            document.getElementById("gameOnlineButton").style.opacity = "0.5";
            document.getElementById("gameFriendButton").style.opacity = "0.5";
            document.getElementById("gameOnlineButton").style.pointerEvents = "none";
            document.getElementById("gameFriendButton").style.pointerEvents = "none";
            document.getElementById("networkError").style.display = "block";

        }
        if (connect.toString() === "wifi") {
            console.log("wifiIsTheNetwork");
            document.getElementById("networkError").style.display = "none";


        }
        if (connect.toString() === "cellular") {
            console.log("cellularIsTheNetwork");
            document.getElementById("networkError").style.display = "none";


        }
    }else {
        document.getElementById("networkError").style.display = "none";
    }
});

window.addEventListener('online', function(event) {
    location.reload();
});

window.addEventListener('offline', function(event) {
    location.reload();
});
