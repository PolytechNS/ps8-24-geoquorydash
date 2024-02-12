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
