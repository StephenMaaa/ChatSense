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
from .main_views import categorize_dates, create, process_sentence, generate_unique_id 


# creates a session store.
session = SessionStore(session_key=settings.SESSION_KEY)
device = "cuda" if torch.cuda.is_available() else "cpu"

# added to load gguf models
codellama = AutoModelForCausalLM.from_pretrained("C:/Users/Stephen Ma/Desktop/Llama-2-Chatbot/", model_file="codellama-34b.Q5_K_M.gguf", model_type="llama", max_new_tokens=1024, context_length = 4096, gpu_layers=0)

# Code Llama page 
def codellamaHomepage(request):
    username = request.session["username"]
    print(username) 
    user = User.objects.get(name=username) 

    chatHistories = ChatHistories.objects.filter(user_id=user, model="Code Llama").values('chathistory_id', 'chathistory_title', 'starred', 'timestamp') 
    chatHistories = list(chatHistories.values()) 
    data = categorize_dates(chatHistories) 
    # data = list(data.values())

    for category, items in data.items():
        if items:
            print(f"{category}:")
            for item in items:
                print(item) 
    return render(request, 'codellama.html', {'data': data, 'username': username}) 


# Whenever user clicks requests for a response, the server will send a prompt to the LLM model. And return the response to the html page.
@csrf_exempt
def fetchCode(request):
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

            result = HttpResponse(waitForResult(func=fetchResponseFromCodeLlama, request=request, query=query), content_type='application/json') 
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


# fetches the query response from llama 2 model and saves the respective user's queries in the database.
def fetchResponseFromCodeLlama(request, query):
    query_text = query.cleaned_data["query"]
    print(query_text)
    prompt = "Q: " + query_text + "? A:"
    output = codellama(prompt) # fetches the response from the model
    response = output
    print(response)

    user: User = User.objects.get(name=request.session["username"]) 
    chathistory_id: ChatHistories = ChatHistories.objects.get(user_id=user, chathistory_id=request.session["chathistory_id"])
    queries = CodeQueries(question_text=query_text, query_response=response, chathistory_id=chathistory_id)
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