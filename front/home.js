document.addEventListener("DOMContentLoaded", function() {
    var accountModal = document.getElementById("accountModal");
    var openAccountPage = document.getElementById("openAccountPage");
    var accountFrame = document.getElementById("accountFrame");
    var closeBtn = accountModal.querySelector(".close");

    // Ouvrir la fenêtre modale lorsque le lien account est cliqué
    openAccountPage.addEventListener("click", function(e) {
        e.preventDefault();
        accountFrame.src = "accountPage/account.html";
        accountModal.style.display = "block";
    });

    // Fermer la fenêtre modale lorsque l'utilisateur clique sur le bouton de fermeture
    closeBtn.addEventListener("click", function() {
        accountModal.style.display = "none";
    });

    // Fermer la fenêtre modale lorsque l'utilisateur clique en dehors de celle-ci
    window.addEventListener("click", function(event) {
        if (event.target === accountModal) {
            accountModal.style.display = "none";
        }
    });
});
