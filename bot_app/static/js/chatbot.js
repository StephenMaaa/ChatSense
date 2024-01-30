const chatInput = document.querySelector(".chat-input");
const logoutButton = document.querySelector("#logout-btn");
const sendButton = document.querySelector("#queryBtn");
const chatContainer = document.querySelector(".chat-container");
const chatHistoryContainer = document.querySelector(".chat-history");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const newchatButton = document.querySelector(".newchat-btn");
const newchatMainButton = document.querySelector("#newchat-main-btn");
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
        element.style.marginLeft = '-5.5%';
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
        element.style.marginLeft = '-15%';
      });
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
            if (div.nextSibling === null || div.nextSibling.classList.contains("date-category")) {
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
        chatHistoryContainer.appendChild(dateDiv); 
        chatHistoryToday = document.getElementById("Today-chathistory"); 
    }

    // check existence 
    if (selectedChatHistory) {
        // update (move to the top of the list) 
        chatHistoryContainer.removeChild(selectedChatHistory); 
        chatHistoryContainer.insertBefore(selectedChatHistory, chatHistoryToday.nextSibling); 
    } else {
        // chat_data["starred"] = "far"; 
        var chatHistoryDiv = createChatHistory(chat_data); 
        chatHistoryContainer.insertBefore(chatHistoryDiv, chatHistoryToday.nextSibling); 
        chatHistoryDiv.classList.add('selected'); 
    }
}

function createChatHistory(chat_data) {
    const chatHistoryDiv = document.createElement("div");
    const prompt_html = `${chat_data.chathistory_title}
                            <div class="icons">
                            <i class="fas fa-trash" onclick="deleteChatHistory('${chat_data.chathistory_id}')"></i>
                            <i class="star ${chat_data.starred} fa-star" onclick="toggleStar('${chat_data.chathistory_id}')"></i>
                            </div>` 
    chatHistoryDiv.className = "chathistory-item"; 
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

// // manage scroll bars 
// document.addEventListener('DOMContentLoaded', function () {
//     const sidebar = document.getElementById('sidebar');

//     document.addEventListener('mousemove', function (event) {
//       const x = event.clientX;

//       if (x < sidebar.offsetWidth) {
//         // Cursor is in the sidebar
//         sidebar.style.overflowY = 'hidden';
//         document.style.overflowY = 'hidden';
//       } else {
//         // Cursor is in the main content
//         sidebar.style.overflowY = 'hidden';
//         document.style.overflowY = 'hidden';
//       }
//     });
// });

document.addEventListener('DOMContentLoaded', function() {
    // // handle refreshing page 
    // const navigationEntries = performance.getEntriesByType('navigation');
    // const isPageRefreshed = navigationEntries.length > 0 && navigationEntries[0].type === 'reload';
    // if (isPageRefreshed) {
    //     console.log("yes"); 
    //     return; 
    // }

    // load theme 
    var theme; 
    $.get('get_theme', function(data) {
        theme = data.theme;
        console.log('Current Theme:', theme); 
        document.body.classList.toggle("light-mode", theme === "light_mode");
        themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    });

    // retrieve the data_list from the Django template context
    var chatHistories = JSON.parse(document.getElementById('data').textContent); 

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
            const prompt_html = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="static/images/user.jpg" id="chat-profile" alt="user-img"></img>
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
            var prompt_html = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="static/images/user.jpg" id="chat-profile" alt="user-img"></img>
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
            element.textContent = chat_data.query_response; 
        } else {
            response = await fetch('fetch_image', {
                method:'POST',
                body: formData,
            });

            // console.log(response) 
            // create response element 
            element = document.createElement("img"); 
            const chat_data = await response.json();
            element.src = chat_data.image_response; 
            element.id = "chat-image"; 
            element.onclick = function() {
                openModal(imgElement.src); 
            };
        }

        // reset form 
        form.reset();
    }catch(error){
        console.error('There was a error with fetching the response : ', error);
        element.classList.add("error");
        element.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
        return ''; 
    }

    // Remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(element);
    // localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard 
    var model = changeButton.getAttribute("data-info"); 
    var responseElement; 

    if (model === "llama") {
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
    // Display the typing animation and call the getChatResponse function
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
    var html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="static/images/user.jpg" id="chat-profile" alt="user-img"></img>
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

deleteButton.addEventListener("click", () => {
    // remove the chats from local storage 
    $.post('delete_chats', 
      {
        csrfmiddlewaretoken: "{{ csrf_token }}",
        model_name: model.textContent
      }, 
      function(data) {
        console.log("Successfully delete!"); 
        location.reload(); 
    });
});

themeButton.addEventListener("click", () => {
    // toggle the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode"); 
    updateTheme(themeButton.innerText); 
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    // updateTheme(themeButton.innerText); 
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

window.onload = function(){
    // handleOutgoingChat(); 
    const form = document.getElementById('form-query');
    form.addEventListener('submit', function(event){
        event.preventDefault();
        handleOutgoingChat();
        // fetchResponse();
    })

    const fetchBtn = document.getElementById('query-box');
    fetchBtn.addEventListener('keydown', function(event){
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
    document.getElementById('myModal').style.display = 'flex';

    // set the image source in the modal
    document.getElementById('modalImage').src = imageSrc;
}

function closeModal() {
    // hide the modal
    document.getElementById('myModal').style.display = 'none';
}