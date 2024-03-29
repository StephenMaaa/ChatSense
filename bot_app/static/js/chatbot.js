const chatInput = document.querySelector(".chat-input");
const logoutButton = document.querySelector("#logout-btn");
const sendButton = document.querySelector("#queryBtn");
const chatContainer = document.querySelector(".chat-container");
const chatHistoryContainer = document.querySelector(".chat-history");
// const themeButton = document.querySelector("#theme-main-btn");
const themeButton = document.querySelector("#theme-btn");
// const deleteButton = document.querySelector("#delete-btn");
const deleteAllButton = document.querySelector("#delete-all-btn");
const newchatButton = document.querySelector(".newchat-btn");
const newchatMainButton = document.querySelector("#newchat-main-btn");
const userButton = document.querySelector(".user-btn"); 
const profileUploadButton = document.querySelector(".profile-button"); 
const model = document.querySelector(".dropdown-header");
let userText = null;

// dropdown features in header 
const modelDropdown = document.getElementById('modelDropdown');
const header = document.getElementById('header');

function toggleDropdown() {
    modelDropdown.classList.toggle('clicked');
    const dropdownList = document.querySelector('.dropdown-list');
    dropdownList.style.display = dropdownList.style.display === 'block' ? 'none' : 'block';
}

function hideDropdown() {
    modelDropdown.classList.remove('clicked');
    const dropdownList = document.querySelector('.dropdown-list');
    dropdownList.style.display = 'none';
}

function showDropdown() {
    modelDropdown.classList.add('clicked');
    const dropdownList = document.querySelector('.dropdown-list');
    dropdownList.style.display = 'block';
}

// Add event listener to hide dropdown on mouse move outside the header
document.addEventListener('mousemove', function(event) {
    const isOutsideHeader = !header.contains(event.target);
    if (isOutsideHeader) {
        hideDropdown();
    }
});

function selectModel(model) {
    // const dropdownHeader = document.querySelector('.dropdown-header');
    // dropdownHeader.textContent = model;
    // hideDropdown(); 
    window.location.href = model;
}

// logout 
logoutButton.addEventListener("click", () => {
    // redirect to the login page 
    window.location.href = "/"; 
});

// side bar window 
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.querySelector('.open-btn');
    const elementsToAdjust = document.querySelectorAll('.adjust-width');
    const elementsToAdjust2 = document.querySelectorAll('.adjust-left');
    const isOpen = sidebar.style.width === '250px';

    if (isOpen) {
      console.log("opened"); 
      sidebar.style.width = '0';
      openBtn.style.left = '0';
      newchatMainButton.style.display = "flex";
      elementsToAdjust.forEach(element => {
        element.style.marginLeft = '0';
      });
      elementsToAdjust2.forEach(element => {
        element.style.marginLeft = '0';
      });
    } else {
      sidebar.style.width = '250px';
      openBtn.style.left = '250px';
      newchatMainButton.style.display = "none";
      // content.style.marginLeft = '250px';
      elementsToAdjust.forEach(element => {
        element.style.marginLeft = '250px';
      });
      elementsToAdjust2.forEach(element => {
        element.style.marginLeft = '-250px';
      });
    }

    // close user settings 
    var navigationList = document.getElementById('navigationList');
    navigationList.style.display = 'none'; 
    if (userButton.classList.contains("user-selected")) {
        userButton.classList.remove("user-selected"); 
    }
}

function showChat(chatId) {
    // hide all chat history
    document.querySelectorAll('.chat-history').forEach((chat) => {
      chat.style.display = 'none';
    });

    // show the selected chat history
    const selectedChat = document.getElementById(`chat${chatId}`);
    if (selectedChat) {
        selectedChat.style.display = 'block';
    }
}

// chathistory item features 
async function selectChatHistory(chatId) {
    const chatHistoryList = document.querySelectorAll('.chathistory-item');
    chatHistoryList.forEach(history => {
      history.classList.remove('selected');
    });

    const selectedChatHistory = document.getElementById(`chat${chatId}`);
    selectedChatHistory.classList.add('selected'); 

    // load chat history 
    try{
        const formData = new FormData(); 

        // check init 
        formData.append('chathistory_id', selectedChatHistory.id.substring(4)); 
        formData.append('model_name', model.textContent); 
        
        // fetch response from Llama2/CLIP 
        response = await fetch('fetch_chathistory', {
            method:'POST',
            body: formData,
        });

        // create response element 
        const chat_data = await response.json(); 

        // load chat history 
        chatContainer.innerHTML = ""; 
        console.log(model.textContent); 
        if (model.textContent === "Llama 2") {
            console.log("Loading Llama 2");
            loadLlamaChatHistory(chat_data); 
        } else if (model.textContent === "CLIP") {
            console.log("Loading CLIP"); 
            loadCLIPChatHistory(chat_data); 
        } else if (model.textContent === "Code Llama") {
            console.log("Loading Code Llama");
            loadLlamaChatHistory(chat_data); 
        }
    }catch(error){
        console.error('There was a error with fetching the chat history : ', error); 
        return ''; 
    }
}

function deleteChatHistory(chatId) {
    const deletedChatHistory = document.getElementById(`chat${chatId}`);

    // delete from backend 
    // remove the chats from local storage 
    $.post('delete_chats', 
    {
        csrfmiddlewaretoken: "{{ csrf_token }}",
        chathistory_id: chatId, 
        model_name: model.textContent
    }, 
    function(data) {
        console.log("Successfully delete!"); 
    });

    deletedChatHistory.style.transition = 'margin 0.5s';
    deletedChatHistory.style.marginLeft = '-250px'; // adjust this value based on the width of your sidebar
    setTimeout(() => {
        deletedChatHistory.remove(); 

        // edge case: empty list 
        chatHistoryContainer.querySelectorAll(".date-category").forEach(div => {
            if (div.nextSibling.classList === undefined || div.nextSibling.classList.contains("date-category")) {
                div.remove();   
            }
        }); 
    }, 500); 
    
    // check reloading 
    if (deletedChatHistory.classList.contains("selected")) {
        // reload empty chat container 
        console.log(model.textContent); 
        if (model.textContent === "Llama 2") {
            loadLlamaChatHistory(null); 
        } else if (model.textContent === "CLIP") {
            loadCLIPChatHistory(null); 
        } else if (model.textContent === "Code Llama") {
            loadLlamaChatHistory(null); 
        }
    }
}

function toggleStar(chatId) {
    const trashIcon = document.querySelector(`#chat${chatId} .fa-trash`);
    const starIcon = document.querySelector(`#chat${chatId} .fa-star`);
    starIcon.classList.toggle('fas');
    starIcon.classList.toggle('far'); 

    // update 
    const starred = starIcon.classList.contains("far") ? "far" : "fas"; 
    $.post('update_starred', 
    {
        csrfmiddlewaretoken: "{{ csrf_token }}",
        chathistory_id: chatId, 
        starred: starred
    }, 
    function(data) {
        console.log("Successfully update starred!"); 
    });
}

function showIcons(iconContainer) {
    // display icons 
    const trashIcon = iconContainer.querySelector(`.fa-trash`); 
    const starIcon = iconContainer.querySelector(`.fa-star`); 
    trashIcon.style.display = "inline-block"; 
    starIcon.style.display = "inline-block"; 
}

function hideIcons(iconContainer) {
    // hide icons 
    const trashIcon = iconContainer.querySelector(`.fa-trash`); 
    const starIcon = iconContainer.querySelector(`.fa-star`); 

    // only display starred 
    trashIcon.style.display = "none"; 
    if (starIcon.classList.contains("far")) {
        starIcon.style.display = "none"; 
    }
}

function disableOnClick(element) {
    // prevent background color change when clicking on icons
    element.querySelectorAll("i").forEach(icon => {
        icon.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
        });
    }); 
}

// create new chat 
function createNewChat() {
    // reload empty chat container 
    console.log(model.textContent); 
    if (model.textContent === "Llama 2") {
        loadLlamaChatHistory(null); 
    } else if (model.textContent === "CLIP") {
        loadCLIPChatHistory(null); 
    } else if (model.textContent === "Code Llama") {
        loadLlamaChatHistory(null); 
    }

    // remove selected chat history 
    const chatHistoryList = document.querySelectorAll('.chathistory-item');
    chatHistoryList.forEach(history => {
      history.classList.remove('selected');
    });
}

newchatButton.addEventListener("click", createNewChat); 
newchatMainButton.addEventListener("click", createNewChat); 

function updateSideBarList(chat_data) {
    var chatHistoryToday = document.getElementById("Today-chathistory"); 
    var selectedChatHistory = document.getElementById(`chat${chat_data.chathistory_id}`); 

    // edge case: init 
    if (chatHistoryToday === null) {
        // add date separator 
        const dateDiv = document.createElement("div"); 
        dateDiv.textContent = "Today"; 
        dateDiv.className = "date-category"; 
        dateDiv.classList.add("chathistory-item"); 
        dateDiv.id = "Today-chathistory"; 
        chatHistoryContainer.insertBefore(dateDiv, chatHistoryContainer.firstChild); 
        chatHistoryToday = document.getElementById("Today-chathistory"); 
    }

    // check existence 
    if (selectedChatHistory) {
        // update (move to the top of the list) 
        // chatHistoryContainer.removeChild(selectedChatHistory); 
        // chatHistoryContainer.insertBefore(selectedChatHistory, chatHistoryToday.nextSibling); 
        moveBlock(selectedChatHistory); 
    } else {
        var chatHistoryDiv = createChatHistory(chat_data); 
        chatHistoryContainer.insertBefore(chatHistoryDiv, chatHistoryToday.nextSibling); 
        chatHistoryDiv.classList.add('selected'); 
    }
}

function createChatHistory(chat_data) {
    const chatHistoryDiv = document.createElement("div"); 
    const image_title = "[IMAGE_TITLE]"; 

    // handle image title for CLIP 
    var prompt_html; 
    // console.log(chat_data.question_text.length); 
    console.log(typeof chat_data.chathistory_title); 
    if (model.textContent === "CLIP" && chat_data.chathistory_title.startsWith(image_title)) {
        prompt_html = `<img src="${chat_data.chathistory_title.substring(image_title.length)}" id="chat-profile" alt="input-img"></img>
                        <div class="icons">
                            <i class="fas fa-trash" onclick="deleteChatHistory('${chat_data.chathistory_id}')"></i>
                            <i class="star ${chat_data.starred} fa-star" onclick="toggleStar('${chat_data.chathistory_id}')"></i>
                        </div>`; 
        chatHistoryDiv.classList.add("chathistory-image-item"); 
    } else {
        prompt_html = `${chat_data.chathistory_title}
                        <div class="icons">
                            <i class="fas fa-trash" onclick="deleteChatHistory('${chat_data.chathistory_id}')"></i>
                            <i class="star ${chat_data.starred} fa-star" onclick="toggleStar('${chat_data.chathistory_id}')"></i>
                        </div>`; 
    }
    chatHistoryDiv.classList.add("chathistory-item"); 
    chatHistoryDiv.setAttribute('onclick', `selectChatHistory('${chat_data.chathistory_id}')`);
    chatHistoryDiv.id = `chat${chat_data.chathistory_id}`;  
    chatHistoryDiv.innerHTML = prompt_html; 

    // add functionalities 
    disableOnClick(chatHistoryDiv); 

    chatHistoryDiv.addEventListener('mouseover', () => {
        showIcons(chatHistoryDiv);
    });
  
    chatHistoryDiv.addEventListener('mouseout', () => {
        hideIcons(chatHistoryDiv);
    });
    return chatHistoryDiv; 
}

// animation for updating side bar list 
function moveBlock(selectedBlock) {
    console.log("start func"); 
    const blocks = Array.from(chatHistoryContainer.children);

    const selectedBlockIndex = blocks.indexOf(selectedBlock);

    blocks.forEach((currentBlock, index) => {
        console.log("start animation"); 
        if (index > 0 && index <= selectedBlockIndex) {
            var translateYValue = `${currentBlock.offsetHeight}px`; 
            if (index === selectedBlockIndex) {
            translateYValue = `${-(index - 1) * currentBlock.offsetHeight}px`; 
            }
            currentBlock.style.transform = `translateY(${translateYValue})`; 
            currentBlock.style.transition = `transform 0.5s ease-in-out, top 0.5s ease-in-out 0.05s`;
            // currentBlock.style.transition = `transform 0.5s ease-in-out, top 0.5s ease-in-out 0.1s`;
        }
    });

    // reset animation 
    setTimeout(() => {
        blocks.forEach((currentBlock, index) => {
            if (index > 0 && index <= selectedBlockIndex) {
                currentBlock.style.transition = 'none'; // Remove the transition temporarily
                currentBlock.style.transform = '';
            }
        }); 
        var chatHistoryToday = document.getElementById("Today-chathistory"); 
        chatHistoryContainer.removeChild(selectedBlock); 
        chatHistoryContainer.insertBefore(selectedBlock, chatHistoryToday.nextSibling); 

        // edge case: empty list 
        chatHistoryContainer.querySelectorAll(".date-category").forEach(div => {
            if (div.nextSibling === null || div.nextSibling.classList.contains("date-category")) {
                div.remove();   
            }
        }); 
    }, 500); 
}

// navigation - user settings 
function toggleNavigation() {
    // toggle selection 
    if (userButton.classList.contains("user-selected")) {
        userButton.classList.remove("user-selected"); 
    } else {
        userButton.classList.add("user-selected"); 
    }
    var navigationList = document.getElementById('navigationList');
    navigationList.style.display = (navigationList.style.display === 'block') ? 'none' : 'block'; 
}

// user settings 
function openSettings() {
    console.log("open settings"); 
    var settings = document.querySelector(".outer-modal");
    var settingsWrapper = document.querySelector(".modal-wrapper");
    var gridModal = document.querySelector(".grid-modal"); 
    var settingsModal = document.querySelector(".settings-modal"); 
    settings.style.display = 'block'; 
    settingsWrapper.style.display = 'block'; 
    gridModal.style.display = 'grid';
    settingsModal.style.display = 'block';
}

function closeSettings() {
    var settings = document.querySelector(".outer-modal");
    var settingsModal = document.querySelector(".grid-modal"); 
    settings.style.display = 'none'; 
    settingsModal.style.display = 'none';
}

// toggle settings selector 
function selectSettings(selectedSettings) {
    const settingsList = document.querySelectorAll('.selector-item');
    settingsList.forEach(settings => {
      settings.classList.remove('settings-selected');
    });

    selectedSettings.classList.add('settings-selected'); 

    // display 
    var generalSection = document.getElementById(selectedSettings.dataset.info); 
    showSection(generalSection); 
}

// theme button 
themeButton.addEventListener('click', () => {
    console.log("change theme"); 
    themeButton.classList.toggle('active'); 
    document.body.classList.toggle("light-mode"); 
    updateTheme(themeButton.getAttribute("data-info")); 
    
    // update theme mode 
    if (document.body.classList.contains("light-mode")) {
        themeButton.setAttribute("data-info", "light_mode"); 
    } else {
        themeButton.setAttribute("data-info", "dark_mode"); 
    }
});

// toggle settings selection 
function showSection(selectedSection) {
    console.log(selectedSection); 

    // hide all sections
    var sections = document.querySelectorAll('.main-settings');
    sections.forEach(function(section) {
        section.classList.remove('selected-section');
    });

    // show the selected section
    selectedSection.classList.add('selected-section'); 
}

// trigger profile uploading 
function triggerUploadProfile() {
    console.log("here"); 
    document.getElementById('profile-input').click(); 
}

// change username 
function toggleEdit() {
    const username = document.querySelector(".username");
    const editButton = document.getElementById('edit-username-btn');
    const doneButton = document.getElementById('done-username-btn'); 
    const inputField = document.getElementById('changeUsername');

    doneButton.style.display = 'flex';
    inputField.style.display = 'inline-block';
    username.style.display = 'none';
    editButton.style.display = 'none'; 

    // pre-fill value 
    inputField.value = username.innerText; 
}

// update username 
function updateUsername() {
    const username = document.querySelector(".username");
    const editButton = document.getElementById('edit-username-btn');
    const doneButton = document.getElementById('done-username-btn'); 
    const inputField = document.getElementById('changeUsername'); 
    const usernameDiv = document.querySelector(".user"); 

    // update username 
    username.innerText = inputField.value; 
    usernameDiv.innerText = inputField.value; 

    // Hide edit mode
    doneButton.style.display = 'none';
    inputField.style.display = 'none';
    username.style.display = 'inline-block';
    editButton.style.display = 'flex'; 

    // update 
    $.post('update_username', { username: inputField.value }, function(data) {
        if (data.success) {
            console.log('Username updated successfully');
            // You can perform additional actions upon successful update
        } else {
            console.error('Failed to update username');
        }
    });
}

function uploadProfile() {
    var imageInput = document.getElementById('profile-input');
    var profile_image = document.querySelector('.profile-image'); 

    console.log(imageInput.files[0]); 

    if (imageInput.files && imageInput.files[0]) {
        var reader = new FileReader();
  
        reader.onload = function(e) {
            profile_image.src = e.target.result;
  
            // Send the file data to the Django backend using jQuery $.post
            var formData = new FormData();
            formData.append('image', imageInput.files[0]);
            console.log(imageInput.files[0]); 

            // $.post('upload_profile', { profile: formData }, function(data) {
            //     if (data.success) {
            //         console.log('Profile updated successfully');
            //         // You can perform additional actions upon successful update
            //     } else {
            //         console.error('Failed to update profile');
            //     }
            // });
            $.ajax({
                url: 'upload_profile', // Adjust the URL as needed
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    console.log('Image uploaded and database updated successfully');
                    loadProfile(); 
                },
                error: function() {
                    console.error('Error uploading image');
                }
            });
        };
    };

    // load profile 
    reader.readAsDataURL(imageInput.files[0]); 
}

// load theme 
function loadTheme() {
    var theme; 
    $.get('get_theme', function(data) {
        theme = data.theme;
        console.log('Current Theme:', theme); 
        themeButton.classList.toggle('active', theme === "light_mode"); 
        document.body.classList.toggle("light-mode", theme === "dark_mode"); 
        
        // update theme mode 
        if (document.body.classList.contains("light-mode")) {
            themeButton.setAttribute("data-info", "light_mode"); 
        } else {
            themeButton.setAttribute("data-info", "dark_mode"); 
        }
    }); 
}

// load profile 
function loadProfile() {
    var profile_image;  
    $.get('get_profile', function(data) {
        profile_image = data.profile_image; 

        // check init 
        if (profile_image === "") {
            profile_image = "static/images/user.jpg"; 
        }
        console.log('Current Profile:', profile_image); 
        
        // set profiles 
        var userButtonImage = document.getElementById("user-profile"); 
        userButtonImage.src = profile_image; 

        var profileImage = document.querySelector(".profile-image"); 
        profileImage.src = profile_image; 

        // set profiles in chat container (if selected) 
        const selectedChatHistory = document.querySelector('.chat-history .selected'); 
        if (selectedChatHistory != null) {
            const chats = chatContainer.querySelectorAll(".outgoing #chat-profile"); 
            chats.forEach(item => {
                item.src = profile_image; 
            }); 
        }
    }); 
}

function deleteAllChats() {
    // delete from backend 
    // remove the chats from local storage 
    $.post('delete_all_chats', 
    {
        csrfmiddlewaretoken: "{{ csrf_token }}"
    }, 
    function(data) {
        console.log("Successfully delete all chats!"); 
    });
    
    // delete from side bar window 
    chatHistoryContainer.innerHTML = ""; 

    // reload empty chat container 
    console.log(model.textContent); 
    if (model.textContent === "Llama 2") {
        loadLlamaChatHistory(null); 
    } else if (model.textContent === "CLIP") {
        loadCLIPChatHistory(null); 
    } else if (model.textContent === "Code Llama") {
        loadLlamaChatHistory(null); 
    }
}

function deleteAccount() {
    // delete from backend 
    $.post('delete_account', 
    {
        csrfmiddlewaretoken: "{{ csrf_token }}"
    }, 
    function(data) {
        console.log("Successfully delete account!"); 
    }); 

    // redirect to the login page 
    window.location.href = "/"; 
}

// load main page 
document.addEventListener('DOMContentLoaded', function() {
    // // handle refreshing page 
    // const navigationEntries = performance.getEntriesByType('navigation');
    // const isPageRefreshed = navigationEntries.length > 0 && navigationEntries[0].type === 'reload';
    // if (isPageRefreshed) {
    //     console.log("yes"); 
    //     return; 
    // }

    // load theme 
    loadTheme(); 

    // load profile 
    loadProfile(); 


    // retrieve the data_list from the Django template context
    var chatHistories = JSON.parse(document.getElementById('data').textContent); 
    var user = JSON.parse(document.getElementById('username').textContent); 

    // load user name 
    const usernameDiv = document.querySelector(".user"); 
    usernameDiv.textContent = user; 
    const usernameProfile = document.querySelector(".username"); 
    usernameProfile.textContent = user; 
    console.log(user); 

    // load chat history list in side bar window 
    console.log(model.textContent); 
    loadChatHistoriesList(chatHistories); 

    // reload empty chat container 
    if (model.textContent === "Llama 2") {
        loadLlamaChatHistory(null); 
    } else if (model.textContent === "CLIP") {
        loadCLIPChatHistory(null); 
    } else if (model.textContent === "Code Llama") {
        loadLlamaChatHistory(null); 
    }
});

// load chat history list in side bar window 
function loadChatHistoriesList(chatHistories) {
    for (var category in chatHistories) {
        if (chatHistories[category].length > 0) {
            // add date separator 
            const dateDiv = document.createElement("div"); 
            dateDiv.textContent = category; 
            dateDiv.className = "date-category"; 
            dateDiv.classList.add("chathistory-item"); 
            dateDiv.id = `${category.split(' ').join('')}-chathistory`; 
            chatHistoryContainer.appendChild(dateDiv); 

            // add chat histories within date 
            chatHistories[category].forEach(function(item) {
                chatHistoryContainer.appendChild(createChatHistory(item)); 
            });
        }
    }
}

// load Llama 2/Code Llama chat history 
function loadLlamaChatHistory(chat) {
    // populate chat history 
    if (chat != null && chat.length > 0) {
        chat.forEach(function(item) {
            console.log("running"); 
    
            // fetch prompt 
            const userProfile = document.getElementById("user-profile").src; 
            const prompt_html = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="${userProfile}" id="chat-profile" alt="user-img"></img>
                                <p>${item.question_text}</p>
                            </div>
                        </div>`;
    
            // create an outgoing chat div with user's message and append it to chat container
            const outgoingChatDiv = createChatElement(prompt_html, "outgoing");
            chatContainer.querySelector(".default-text")?.remove();
            chatContainer.appendChild(outgoingChatDiv);
            chatContainer.scrollTo(0, chatContainer.scrollHeight); 
    
            // fetch response 
            const response_html = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="static/images/chatbot.jpg" id="chat-profile" alt="chatbot-img"></img>
                                <p>${item.query_response}</p>
                            </div>
                            <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                        </div>`;
            // create an incoming chat div with typing animation and append it to chat container
            const incomingChatDiv = createChatElement(response_html, "incoming");
            chatContainer.appendChild(incomingChatDiv);
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
        }); 
        chat = null; 
    } else {
        var defaultText; 
        if (model.textContent === "Llama 2") {
            defaultText = `<div class="default-text">
                            <h1>Llama 2</h1>
                            <p>Start a conversation and explore chat completions.</p>
                        </div>`
        } else {
            defaultText = `<div class="default-text">
                            <h1>Code Llama</h1>
                            <p>Start a conversation and explore code completions.</p>
                        </div>`
        }
        chatContainer.innerHTML = defaultText; 
        chatContainer.scrollTo(0, chatContainer.scrollHeight); 
    }
}

function loadCLIPChatHistory(chat) {
    // populate chat history  
    if (chat != null && chat.length > 0) {
        chat.forEach(function(item) {
            console.log("running"); 
    
            // fetch prompt 
            const userProfile = document.getElementById("user-profile").src; 
            var prompt_html = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="${userProfile}" id="chat-profile" alt="user-img"></img>
                            </div>
                        </div>`; 
    
            // create an outgoing chat div with user's message and append it to chat container
            const outgoingChatDiv = createChatElement(prompt_html, "outgoing"); 

            // add user input 
            if (item.image) {
                console.log('Image:', item.image); 
    
                // display the image 
                var imgSrcElement = document.createElement('img');
                imgSrcElement.src = "media/" + item.image;
                imgSrcElement.id = "chat-image"; 
                imgSrcElement.onclick = function() {
                    openModal(imgSrcElement.src); 
                };
                outgoingChatDiv.querySelector(".chat-details").appendChild(imgSrcElement); 
            } else {
                var pElement = document.createElement("p"); 
                pElement.textContent = item.question_text; 
                outgoingChatDiv.querySelector(".chat-details").appendChild(pElement); 
            }
            chatContainer.querySelector(".default-text")?.remove();
            chatContainer.appendChild(outgoingChatDiv);
            chatContainer.scrollTo(0, chatContainer.scrollHeight); 
    
            // fetch response 
            const response_html = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="static/images/chatbot.jpg" id="chat-profile" alt="chatbot-img"></img>
                            </div>
                            <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                        </div>`; 

            // create an incoming chat div with typing animation and append it to chat container
            const incomingChatDiv = createChatElement(response_html, "incoming"); 

            // add response 
            // console.log('Image response:', item.image_response); 
            var imgElement = document.createElement('img');
            imgElement.src = "media/" + item.image_response; 
            imgElement.id = "chat-image"; 
            imgElement.onclick = function() {
                openModal(imgElement.src); 
            };
            incomingChatDiv.querySelector(".chat-details").appendChild(imgElement); 

            chatContainer.appendChild(incomingChatDiv); 
            chatContainer.scrollTo(0, chatContainer.scrollHeight); 
        }); 
        chat = null; 
    } else {
        const defaultText = `<div class="default-text">
            <h1>CLIP</h1>
            <p>Start a conversation or upload an image to explore the power of CLIP.</p>
        </div>`
        chatContainer.innerHTML = defaultText; 
        chatContainer.scrollTo(0, chatContainer.scrollHeight); 
    }
}

const createChatElement = (content, className) => {
    // Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}

const fetchResponse = async (incomingChatDiv) => {
    // handleOutgoingChat();  
    try{
        const form = document.getElementById('form-query');
        const formData = new FormData(form); 

        // check init 
        const selectedChatHistory = document.querySelector('.chat-history .selected'); 
        if (selectedChatHistory != null) {
            formData.append('chathistory_id', selectedChatHistory.id.substring(4));
        } else {
            formData.append('chathistory_id', 'empty'); 
        }
        formData.append('model_name', model.textContent); 

        // reset form 
        form.reset(); 
        chatInput.style.height = "55px"; 
        chatContainer.style.paddingBottom = "150px"; 
        // chatContainer.scrollTo(0, chatContainer.scrollHeight); 
        
        // fetch response from Llama2/CLIP 
        var response; 
        var element; 
        if (model.textContent === "Llama 2") {
            response = await fetch('fetch_response', {
                method:'POST',
                body: formData,
            });

            // create response element 
            element = document.createElement("p"); 
            const chat_data = await response.json();
            console.log(chat_data.chathistory_id); 
            element.textContent = chat_data.query_response; 

            // update side bar 
            updateSideBarList(chat_data); 
        } else if (model.textContent === "Code Llama") {
            response = await fetch('fetch_code', {
                method:'POST',
                body: formData,
            });

            // console.log(response) 
            // create response element 
            element = document.createElement("p"); 
            const chat_data = await response.json(); 
            console.log(chat_data.chathistory_id); 
            element.textContent = chat_data.query_response; 

            // update side bar 
            updateSideBarList(chat_data); 
        } else {
            response = await fetch('fetch_image', {
                method:'POST',
                body: formData,
            });

            // console.log(response) 
            // create response element 
            element = document.createElement("img"); 
            const chat_data = await response.json(); 
            console.log(chat_data.chathistory_id); 
            element.src = chat_data.image_response; 
            element.id = "chat-image"; 
            element.onclick = function() {
                openModal(element.src); 
            };

            // update side bar 
            updateSideBarList(chat_data); 
        }

        // // reset form 
        // form.reset();
    }catch(error){
        console.error('There was a error with fetching the response : ', error);
        element.classList.add("error");
        element.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
        return ''; 
    }

    // remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(element);
    // localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    // copy the text content of the response to the clipboard 
    var responseElement; 

    if (model.textContent !== "CLIP") {
        responseElement = copyBtn.parentElement.querySelector("p"); 
        navigator.clipboard.writeText(responseElement.textContent); 
    } else {
        responseElement = copyBtn.parentElement.querySelector("img:nth-child(2)"); 
        navigator.clipboard.writeText(responseElement.src);
    }
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000); 
}

const showTypingAnimation = () => {
    // display the typing animation and call the getChatResponse function
    //                         <img src="{% static 'chatbot.jpg' %}" alt="chatbot-img">
    // <img src="{% static 'images/chatbot.jpg' %}" alt="chatbot-img"></img>
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="static/images/chatbot.jpg" id="chat-profile" alt="chatbot-img"></img>
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    // Create an incoming chat div with typing animation and append it to chat container
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    fetchResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = document.getElementById('query-box').value; 
    // if(!userText) return; // If chatInput is empty return from here 

    // create user div 
    const userProfile = document.getElementById("user-profile").src; 
    var html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="${userProfile}" id="chat-profile" alt="user-img"></img>
                    </div>
                </div>`; 
    const outgoingChatDiv = createChatElement(html, "outgoing"); 

    // display user inputs for Llama2, Code Llama and CLIP 
    if (model.textContent === "CLIP") {
        var userImage = document.getElementById('fileInput').files[0]; 
        if (userImage) {
            // display the image 
            var imgElement = document.createElement('img');
            imgElement.src = URL.createObjectURL(userImage); 
            imgElement.id = "chat-image"; 
            imgElement.onclick = function() {
                openModal(imgElement.src); 
            };
            outgoingChatDiv.querySelector(".chat-details").appendChild(imgElement);
        } else {
            var pElement = document.createElement("p"); 
            pElement.textContent = userText; 
            outgoingChatDiv.querySelector(".chat-details").appendChild(pElement);
        }
    } else {
        var pElement = document.createElement("p"); 
        pElement.textContent = userText; 
        outgoingChatDiv.querySelector(".chat-details").appendChild(pElement);
    }

    // Create an outgoing chat div with user's message and append it to chat container
    // const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

// deleteButton.addEventListener("click", () => {
//     // remove the chats from local storage 
//     $.post('delete_chats', 
//       {
//         csrfmiddlewaretoken: "{{ csrf_token }}",
//         model_name: model.textContent
//       }, 
//       function(data) {
//         console.log("Successfully delete!"); 
//         location.reload(); 
//     });
// });

deleteAllButton.addEventListener("click", () => {
    // remove the chats from local storage 
    console.log("delete all"); 
});

function updateTheme(theme) {
    $.post('update_theme', { theme: theme }, function(data) {
        if (data.success) {
            console.log('Theme updated successfully');
            // You can perform additional actions upon successful update
        } else {
            console.error('Failed to update theme');
        }
    });
}

const initialInputHeight = chatInput.scrollHeight;
chatInput.addEventListener("input", () => {   
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height =  `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

function triggerFileInput() {
    document.getElementById('fileInput').click();
}

// trigger form submission 
function submitForm() {
    document.getElementById('hiddenButton').click(); 
}

window.onload = function(){
    // handleOutgoingChat(); 
    const form = document.getElementById('form-query'); 
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        handleOutgoingChat();
        // fetchResponse();
    })

    const fetchBtn = document.getElementById('query-box');
    fetchBtn.addEventListener('keydown', function(event) {
        if(event.key == 'Enter'){
            event.preventDefault();
            // handleOutgoingChat();
            form.submit();
        }
    })
}

// zoom in images 
function openModal(imageSrc) {
    console.log(imageSrc); 
    // display the modal
    document.querySelector('.typing-container').style.display = 'none'; 
    document.getElementById('myModal').style.display = 'flex';

    // set the image source in the modal
    document.getElementById('modalImage').src = imageSrc;
}

function closeModal() {
    // hide the modal 
    document.querySelector('.typing-container').style.display = 'flex'; 
    document.getElementById('myModal').style.display = 'none';
}

function resizeTextarea(element) {
    console.log("change"); 
    element.style.height = "auto"; // Reset height to auto
    element.style.height = (element.scrollHeight) + "px"; // Set new height

    const typingContainer = document.querySelector(".typing-container"); 
    console.log(typingContainer.scrollHeight); 

    console.log(element.value); 

    // adjust padding bottom 
    if (element.value === "") {
        chatContainer.style.paddingBottom = "150px"; 
    } else {
        chatContainer.style.paddingBottom = (typingContainer.scrollHeight + 74) + "px"; 
    }

    chatContainer.scrollTo(0, chatContainer.scrollHeight); 
    // console.log(container.style.paddingBottom); 
}

var generalButton = document.querySelector('[data-info="general"]'); 
selectSettings(generalButton); 