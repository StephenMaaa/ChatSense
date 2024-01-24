# ChatSense - Llama 2 + Code Llama + CLIP based Chatbot 

## Demo 
[PENDING]

## Features

- Chat completions powered by Llama 2 
- Text-image/image-image search chat powered by CLIP (with FAISS) 
- Code completions powered by Code Llama 
- ChatGPT-style GUI 
- Store and load user's chat history in local storage 
 
## To-Do

- [X] Integrate CLIP model into the app (front-end, backend) 
- [X] Integrate CodeLlama (front-end, backend) 
- [X] App header with dropdown model select 
- [X] Logout 
- [ ] Scrolling sidebar
- [ ] Multiple chats 
- [ ] PENDING 

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