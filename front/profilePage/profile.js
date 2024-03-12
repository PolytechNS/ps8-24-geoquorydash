import { ProfileService } from '../Services/profileService.js';

document.addEventListener('DOMContentLoaded', () => {
    const profilePicture = document.querySelector('.profile-picture');
    const usernameElement = document.querySelector('.username');

    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');

    usernameElement.textContent = username;

    ProfileService.picture(username)
        .then(profileData => {
            if (profileData.profilePicture) {
                profilePicture.src = profileData.profilePicture;
            } else {
                profilePicture.src = '../img/Skin002.png';
            }
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
        });
});
