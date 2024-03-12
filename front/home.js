document.addEventListener("DOMContentLoaded", function() {
    var accountModal = document.getElementById("accountModal");
    var openAccountPage = document.getElementById("openAccountPage");
    var accountFrame = document.getElementById("accountFrame");

    openAccountPage.addEventListener("click", function(e) {
        e.preventDefault();
        accountFrame.src = "accountPage/account.html";
        accountModal.style.display = "flex";
    });

    window.addEventListener("click", function(event) {
        if (event.target === accountModal) {
            accountModal.style.display = "none";
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    var friendsModal = document.getElementById("friendsModal");
    var openFriendsPage = document.getElementById("openFriendsPage");
    var friendsFrame = document.getElementById("friendsFrame");

    openFriendsPage.addEventListener("click", function(e) {
        e.preventDefault();
        friendsFrame.src = "friendsPage/friends.html";
        friendsModal.style.display = "flex";
    });

    window.addEventListener("click", function(event) {
        if (event.target === friendsModal) {
            friendsModal.style.display = "none";
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    var accountModal = document.getElementById("accountModal");
    var accountFrame = document.getElementById("accountFrame");

    if (window.location.search.includes("login=true")) {
        accountFrame.src = "accountPage/account.html";
        accountModal.style.display = "flex";
    }

    window.addEventListener("click", function(event) {
        if (event.target === accountModal) {
            accountModal.style.display = "none";
        }
    });
});
