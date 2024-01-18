const chatInput = document.querySelector(".chat-input");
const sendButton = document.querySelector("#queryBtn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const changeButton = document.querySelector("#change-btn");
let userText = null;

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
    // console.log(data[0]); 
    // data = JSON.parse(data);
    // console.log(data[1]); 
    // console.log(chat[0]); 

    // Get the <ul> element by its id
    // var dataListElement = document.getElementById("dataList");

    // Populate the <ul> with list items using JavaScript 
    if (chat != null && chat.length > 0) {
        chat.forEach(function(item) {
            console.log("running"); 
    
            // fetch prompt 
            const prompt_html = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="static/images/user.jpg" alt="user-img">
                                <p>${item.question_text}</p>
                            </div>
                        </div>`;
    
            // Create an outgoing chat div with user's message and append it to chat container
            const outgoingChatDiv = createChatElement(prompt_html, "outgoing");
            chatContainer.querySelector(".default-text")?.remove();
            chatContainer.appendChild(outgoingChatDiv);
            chatContainer.scrollTo(0, chatContainer.scrollHeight); 
    
            // fetch response 
            const response_html = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="static/images/chatbot.jpg" alt="chatbot-img"></img>
                                <p>${item.query_response}</p>
                            </div>
                            <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                        </div>`;
            // Create an incoming chat div with typing animation and append it to chat container
            const incomingChatDiv = createChatElement(response_html, "incoming");
            chatContainer.appendChild(incomingChatDiv);
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
        }); 
        chat = null; 
    } else {
        const defaultText = `<div class="default-text">
            <h1>Llama 2</h1>
            <p>Start a conversation and explore the power of gen-AI.</p>
        </div>`
        chatContainer.innerHTML = defaultText; 
        chatContainer.scrollTo(0, chatContainer.scrollHeight); 
    }
});

const createChatElement = (content, className) => {
    // Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}

const fetchResponse = async (incomingChatDiv) => {
    // handleOutgoingChat(); 
    var model = changeButton.getAttribute("data-info"); 
    const pElement = document.createElement("p"); 
    try{
        // const loadDiv = document.getElementById('loadingDiv');
        // loadDiv.style.display = 'block';
        const form = document.getElementById('form-query');
        const formData = new FormData(form);
        
        // fetch response from Llama2/CLIP 
        var response; 
        if (model === "llama") {
            response = await fetch('fetch_response', {
                method:'POST',
                body: formData,
            });
        } else {
            response = await fetch('fetch_image', {
                method:'POST',
                body: formData,
            });
        }
        // const response = await fetch('fetch_image', {
        //     method:'POST',
        //     body: formData,
        // });
        console.log(response)
        const chat_data = await response.json();
        pElement.textContent = chat_data.query_response; 
        // handleOutgoingChat(); 
        form.reset();
        // location.reload(); 
    }catch(error){
        console.error('There was a error with fetching the response : ', error);
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
        return ''; 
    }

    // Remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    // localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    const reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    // Display the typing animation and call the getChatResponse function
    //                         <img src="{% static 'chatbot.jpg' %}" alt="chatbot-img">
    // <img src="{% static 'images/chatbot.jpg' %}" alt="chatbot-img"></img>
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="static/images/chatbot.jpg" alt="chatbot-img"></img>
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
                        <img src="static/images/user.jpg" alt="user-img">
                    </div>
                </div>`; 
    const outgoingChatDiv = createChatElement(html, "outgoing"); 

    // display user inputs for Llama2 and CLIP 
    var model = changeButton.getAttribute("data-info"); 
    if (model === "clip") {
        var userImage = document.getElementById('fileInput').files[0]; 
        if (userImage) {
            console.log('Image file:', userImage);

            // display the image 
            var imgElement = document.createElement('img');
            imgElement.src = URL.createObjectURL(userImage);
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
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    var model = changeButton.getAttribute("data-info"); 
    console.log(model); 
    
    $.post('delete_chats', 
      {
        csrfmiddlewaretoken: "{{ csrf_token }}",
        model_name: model
      }, 
      function(data) {
        console.log("Successfully delete!"); 
        location.reload(); 
    });
});

themeButton.addEventListener("click", () => {
    // Toggle body's class for the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    updateTheme(themeButton.innerText); 
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    // updateTheme(themeButton.innerText); 
});

changeButton.addEventListener("click", () => {
    var model = changeButton.getAttribute("data-info"); 
    console.log(model); 

    // switch models 
    if (model === "clip") {
        window.location.href = "llama"; 
    } else {
        window.location.href = "clip"; 
    }
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

// loadDataFromLocalstorage();