const chatInput = document.querySelector(".chat-input");
const sendButton = document.querySelector("#queryBtn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const model = document.querySelector(".dropdown-header");
let userText = null;

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

document.addEventListener('DOMContentLoaded', function() {
    // load theme 
    var theme; 
    $.get('get_theme', function(data) {
        theme = data.theme;
        console.log('Current Theme:', theme); 
        document.body.classList.toggle("light-mode", theme === "light_mode");
        themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    });

    // Retrieve the data_list from the Django template context
    var chat = JSON.parse(document.getElementById('data').textContent); 

    // Get the <ul> element by its id
    // var dataListElement = document.getElementById("dataList");

    // load chat history 
    console.log(model); 
    if (model.textContent === "Llama 2") {
        console.log("Loading Llama 2");
        loadLlamaChatHistory(chat); 
    } else if (model.textContent === "CLIP") {
        console.log("Loading CLIP"); 
        loadCLIPChatHistory(chat); 
    } else if (model.textContent === "Code Llama") {
        console.log("Loading Code Llama");
        loadLlamaChatHistory(chat); 
    }
});

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
        // const loadDiv = document.getElementById('loadingDiv');
        // loadDiv.style.display = 'block';
        const form = document.getElementById('form-query');
        const formData = new FormData(form);
        
        // fetch response from Llama2/CLIP 
        var response; 
        var element; 
        if (model.textContent === "Llama 2") {
            response = await fetch('fetch_response', {
                method:'POST',
                body: formData,
            });

            // console.log(response) 
            // create response element 
            element = document.createElement("p"); 
            const chat_data = await response.json();
            element.textContent = chat_data.query_response; 
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
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
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