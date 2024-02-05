# ChatSense - Llama 2 + Code Llama + CLIP based Chatbot 

## Demo 
[PENDING]

## Features

- Chat completions powered by Llama 2 
- Code completions powered by Code Llama 
- Text-image/image-image search chat powered by CLIP (with FAISS) 
- Side bar window for multiple chat histories for three models 
- ChatGPT-style GUI 
- Store and load user's chat history in local storage 
 
## To-Do

- [X] Integrate CLIP model into the app (front-end, backend) 
- [X] Integrate CodeLlama (front-end, backend) 
- [X] App header with dropdown model select 
- [X] Scrolling sidebars (chat container and side bar) 
- [X] Multiple chats (side bar) for Llama 2 
- [X] User settings (theme, logout, delete, profile) 
- [X] Multiple chats for Code Llama 
- [X] Multiple chats for CLIP 
- [ ] Data import/export [PENDING] 
- [ ] Refine minor UI [PENDING] 

## Setup

1. Clone the repository

```
git clone https://github.com/StephenMaaa/GPT.git
```

2. Install client dependencies

```
cd GPT
pip install -r requirements.txt
```

3. Download weights of Llama 2 and Code Llama from Huggingface 

URL [Llama 2]: https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF 

```
llama-2-7b-chat.Q4_K_M.gguf 
```

URL [Code Llama]: https://huggingface.co/TheBloke/CodeLlama-34B-GGUF 

```
codellama-34b.Q5_K_M.gguf 
```

1. Choose and download an image dataset for CLIP 

MS COCO URL: https://cocodataset.org/#download 

## Usage
1. Start the app 
```
python manage.py runserver
```

## License