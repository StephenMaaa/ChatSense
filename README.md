# Llama 2 + CLIP based Chatbot

## Demo 
[PENDING]

## Features

- Chat completions powered by Llama 2 
- Text-image/image-image search chat powered by CLIP (with FAISS) 
- ChatGPT-style GUI 
- Store and load user's chat history in local storage 
 
## To-Do

- [X] Integrate CLIP model into the app (front-end, backend) 
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

3. Download weights of Llama 2 from Huggingface 

URL: https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/tree/main

```
llama-2-7b-chat.Q4_K_M.gguf 
```

4. Choose and download an image dataset for CLIP 

MS COCO URL: https://cocodataset.org/#download 

## Usage
1. Start the app 
```
python manage.py runserver
```

## License