import { SearchService } from '../Services/searchService.js';

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('friendsForm');
    const searchResults = document.getElementById('searchResults');

    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = searchForm.querySelector('[name="search"]').value;
        SearchService.searchUsers(username)
            .then(data => {
                displaySearchResults(data);
            })
            .catch(error => {
                console.error(error);
            });
    });

    function displaySearchResults(results) {
        searchResults.innerHTML = '';

        const ul = document.createElement('ul');

        results.forEach(result => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `../profilePage/profile.html?username=${result.username}`;
            link.textContent = result.username;
            link.target = "_blank";
            li.appendChild(link);
            ul.appendChild(li);
        });

        searchResults.appendChild(ul);
    }
});
