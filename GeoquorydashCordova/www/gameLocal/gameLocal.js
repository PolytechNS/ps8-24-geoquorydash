import { isMobileDevice } from "../js/utils.js";

document.addEventListener("DOMContentLoaded", function() {
    // Vérifiez si l'appareil est un téléphone mobile
    if (isMobileDevice()) {
        var connect = navigator.connection.type;
        if (connect === "none") {
            console.log("noneIsTheNetwork");
            document.getElementById("gameHistoryButton").style.opacity = "0.5";
            document.getElementById("gameHistoryButton").style.pointerEvents = "none";
            document.getElementById("networkError").style.display = "block";
        }
        if (connect === "wifi") {
            console.log("wifiIsTheNetwork");
            document.getElementById("networkError").style.display = "none";
        }
        if (connect === "cellular") {
            console.log("cellularIsTheNetwork");
            document.getElementById("networkError").style.display = "none";
        }
    } else {
        // Si ce n'est pas un téléphone mobile, cachez les éléments liés au réseau
        document.getElementById("networkError").style.display = "none";
    }
});

window.addEventListener('online', function(event) {
    location.reload();
});

window.addEventListener('offline', function(event) {
    location.reload();
});
