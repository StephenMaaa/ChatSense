const chatInput = document.querySelector(".chat-input");
const sendButton = document.querySelector("#queryBtn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
let userText = null;

const loadDataFromLocalstorage = () => {
    // Load saved chats and theme from local storage and apply/add on the page
    const themeColor = localStorage.getItem("themeColor");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    const defaultText = `<div class="default-text">
                            <h1>ChatGPT Clone</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.</p>
                        </div>`
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
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
    const pElement = document.createElement("p");
    try{
        // const loadDiv = document.getElementById('loadingDiv');
        // loadDiv.style.display = 'block';
        const form = document.getElementById('form-query');
        const formData = new FormData(form);
        const response = await fetch('fetch_response', {
            method:'POST',
            body: formData,
        });
        const data = await response.json();
        pElement.textContent = data.query_response; 
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
    localStorage.setItem("all-chats", chatContainer.innerHTML);
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
    const html = `<div class="chat-content">
                    <div class="chat-details">
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
    // userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
    console.log(userText); 
    if(!userText) return; // If chatInput is empty return from here
    // Clear the input field and reset its height
    // document.getElementById('query-box').value = "";
    // <img src="../images/user.jpg" alt="user-img">
    chatInput.style.height = `${initialInputHeight}px`;
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <p>${userText}</p>
                    </div>
                </div>`;

    // Create an outgoing chat div with user's message and append it to chat container
    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    // Toggle body's class for the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;
chatInput.addEventListener("input", () => {   
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height =  `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

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

loadDataFromLocalstorage();