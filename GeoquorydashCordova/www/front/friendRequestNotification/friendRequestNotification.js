// <div id="friend-request-modal" className="modal-pop-up">
//     <div className="modal-pop-up-content">
//         <img src="./img/friends/friendRequestNotification.png" alt="title" className="friend-request-title">
//     </div>
// </div>

const modalPopUp = document.createElement('div');
modalPopUp.id = 'friend-request-modal';
modalPopUp.className = 'modal-pop-up';

const modalPopUpContent = document.createElement('div');
modalPopUpContent.className = 'modal-pop-up-content';

const img = document.createElement('img');
img.src = '../img/friends/friendRequestNotification.png';
img.alt = 'title';
img.className = 'friend-request-title';

modalPopUpContent.appendChild(img);
modalPopUp.appendChild(modalPopUpContent);
document.body.appendChild(modalPopUp);
