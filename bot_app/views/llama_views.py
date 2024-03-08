#django imports
from django.shortcuts import render, redirect
from django.contrib.sessions.backends.file import SessionStore
from django.utils import timezone
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

# custom imports
from ..forms import QueryForm, SignInForm, SignUpForm, ThemeForm, ImageForm
from django.contrib import messages
# from llama_cpp import Llama
from ..models import User, SessionDetails, UserQueries, Theme, ImageQueries, CodeQueries, ChatHistories
from ctransformers import AutoModelForCausalLM
from langchain.llms import CTransformers
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import threading
import torch
import uuid
from django.utils import timezone
from datetime import datetime, timedelta
from .main_views import create, process_sentence, generate_unique_id 


# creates a session store.
session = SessionStore(session_key=settings.SESSION_KEY)
device = "cuda" if torch.cuda.is_available() else "cpu"

# added to load gguf models
llm = AutoModelForCausalLM.from_pretrained("C:/Users/Stephen Ma/Desktop/Llama-2-Chatbot/", model_file="llama-2-7b-chat.Q4_K_M.gguf", model_type="llama", max_new_tokens=1024, context_length = 4096, gpu_layers=600)


# # Displays the previous queries asked by the user.
# def llamaHomepage(request):
#     username = request.session["username"]
#     user = User.objects.get(name=username) 

#     # data = list(data.values())
#     # print(data)
#     return render(request, 'index.html') 

# def loadChatHistory(request): 

# # create new chat 
# def create(request, query, model_name): 
#     username = request.session["username"]
#     user = User.objects.get(name=username)
#     unique_id = generate_unique_id(request, model_name) 

#     # process chat history title 
#     chathistory_title = process_sentence(query.cleaned_data["query"], 20) 
#     queries = ChatHistories(user_id=user, chathistory_id=unique_id, chathistory_title=chathistory_title, model=model_name)  
#     queries.save()              # saves the query and response into database. 
#     # session.chathistory_id = unique_id
#     session["chathistory_id"] = unique_id
#     session.save()
#     request.session["chathistory_id"] = unique_id
#     # query_resp = {
#     #     'chathistory_id':unique_id
#     # }
#     return request, unique_id

# def process_sentence(sentence, max_length=20):
#     words = sentence.split()
#     processed_words = []
#     current_length = 0

#     for word in words:
#         if current_length + len(word) <= max_length:
#             processed_words.append(word)
#             current_length += len(word) + 1 
#         else:
#             break

#     processed_sentence = ' '.join(processed_words)

#     # check trailing space 
#     if (current_length < len(sentence)): 
#         processed_sentence += " ..." 
#     return processed_sentence 

# Whenever user clicks requests for a response, the server will send a prompt to the LLM model. And return the response to the html page.
@csrf_exempt
def fetchResponse(request): 
    print(request.method)
    print(request)

    
    if request.method == "POST":
        query = QueryForm(request.POST) 

        if query.is_valid():
            # check status (get chathistory id) 
            chatHistory = request.POST.get("chathistory_id")
            model_name = request.POST.get("model_name")
            print(chatHistory)
            if (chatHistory == "empty"): 
                request, chatHistory = create(request, query, model_name)
            # print(chatHistory)
                
            # update session 
            chatHistory = chatHistory if type(chatHistory) == str else chatHistory.chathistory_id 
            session["chathistory_id"] = chatHistory
            session.save()
            request.session["chathistory_id"] = chatHistory
            print(request.session["chathistory_id"])

            result = HttpResponse(waitForResult(func=fetchResponseFromModel, request=request, query=query), content_type='application/json') 
            print(result)
            # return HttpResponse(waitForResult(request=request, query=query), content_type='application/json')  
            return result 


def waitForResult(func, request, query):
    # if multiple user ask question to llama2 this method will wait until the lock has been released.
    # while not lock.acquire():
    #     print("Waiting..")
        # yield JsonResponse({'message':'Generating response'})

    # Once lock is released, the user's query will be sent to the llama2 model.
    try:
        query = func(request, query)
    except Exception as error:
        print("Failed to get response",type(error).__name__, "–", error)
        # yield JsonResponse({'message':'Failed to get response. Kindly re-enter your query..'})
    # finally:
        # lock.release()

    return query


# fetches the query response from llama 2 model and saves the respective user's queries in the database 
def fetchResponseFromModel(request, query):
    query_text = query.cleaned_data["query"]
    print(query_text)
    prompt = "Q: " + query_text + "? A:"
    output = llm(prompt) # fetches the response from the model
    response = output
    print(response)
    user: User = User.objects.get(name=request.session["username"]) 
    chathistory_id: ChatHistories = ChatHistories.objects.get(user_id=user, chathistory_id=request.session["chathistory_id"])
    queries = UserQueries(question_text=query_text, query_response=response, chathistory_id=chathistory_id)
    queries.save()              # saves the query and response into database 

    # update chat history timestamp 
    chathistory_id.timestamp = queries.timestamp 
    chathistory_id.save() 

    query_resp = {
        'question_text':queries.question_text,
        'query_response':response, 
        'chathistory_id':request.session["chathistory_id"], 
        'chathistory_title':chathistory_id.chathistory_title, 
        'starred': chathistory_id.starred 
    }
    return JsonResponse(query_resp)

# # generate unique id for chat history 
# def generate_unique_id(request, model_name): 
#     # generate a unique ID (UUID)
#     unique_id = uuid.uuid4()

#     # convert the UUID to a string if needed
#     unique_id = str(unique_id) 

#     # check = False; 
#     # unique_id = ""; 

#     # while (not check): 
#     #     # generate a unique ID (UUID)
#     #     unique_id = uuid.uuid4()

#     #     # convert the UUID to a string if needed
#     #     unique_id = str(unique_id) 

#     #     # check uniqueness 
#     #     username = request.session["username"]
#     #     user = User.objects.get(name=username)        
#     #     if (model_name == "Llama 2"): 
#     #         check = UserQueries.objects.filter(user_id=user).exists()
#     #     elif (model_name == "Code Llama"): 
#     #         check = CodeQueries.objects.filter(user_id=user).exists() 
#     #     else: 
#     #         check = ImageQueries.objects.filter(user_id=user).exists()
#     return unique_id