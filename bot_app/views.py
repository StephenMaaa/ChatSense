#django imports
from django.shortcuts import render, redirect
from django.contrib.sessions.backends.file import SessionStore
from django.utils import timezone
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

# custom imports
from .forms import QueryForm, SignInForm, SignUpForm, ThemeForm, ImageForm
from django.contrib import messages
# from llama_cpp import Llama
from .models import User, SessionDetails, UserQueries, Theme, ImageQueries
from ctransformers import AutoModelForCausalLM
from langchain.llms import CTransformers
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import threading

# clip imports 
import torch
import clip
from .clip import build_embeddings, build_index, search
from django.core.files import File
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.base import ContentFile
from io import BytesIO

import os

# creates a session store.
session = SessionStore()
device = "cuda" if torch.cuda.is_available() else "cpu"

# added to load gguf llama2 models
llm = AutoModelForCausalLM.from_pretrained("C:/Users/Stephen Ma/Desktop/Llama-2-Chatbot/", model_file="llama-2-7b-chat.Q4_K_M.gguf", model_type="llama")
clip_model, preprocess = clip.load('ViT-B/32', device)

# used to block access while handling request for a query
# lock = threading.Lock()


# Displays the previous queries asked by the user.
def llamaHomepage(request):
    # print(os.getcwd())
    username = request.session["username"]
    user = User.objects.get(name=username)
    data = UserQueries.objects.filter(user_id=user).values('question_text', 'query_response')
    data = list(data.values())
    print(len(data))
    for item in data: 
        print("item")
    return render(request, 'index.html', {'data': data})

def clipHomepage(request): 
    username = request.session["username"]
    user = User.objects.get(name=username)
    data = ImageQueries.objects.filter(user_id=user).values('question_text', 'image', 'image_response')
    data = list(data.values())
    print(len(data))
    for item in data: 
        print("item")
    return render(request, 'clip.html')

@csrf_exempt
def fetchImage(request):
    if request.method == 'POST':
        query = ImageForm(request.POST, request.FILES)
        if query.is_valid():
            result = HttpResponse(waitForResult(func=fetchResponseFromCLIP, request=request, query=query), content_type='application/json') 
            print(result)
            return result
            # return redirect('clipHomepage')  # redirect to a success page
    # else:
    #     form = ImageForm()
    
    # return render(request, 'upload_image.html', {'form': form})

@csrf_exempt
def updateTheme(request):
    username = request.session["username"]
    user = User.objects.get(name=username)
    theme = request.POST.get('theme')
    user_preference, created = Theme.objects.get_or_create(user_id=user)
    user_preference.theme = theme
    print(theme)
    user_preference.save()
    return JsonResponse({'success': True}) 

@csrf_exempt
def getTheme(request): 
    username = request.session["username"]
    user = User.objects.get(name=username)
    user_preference, created = Theme.objects.get_or_create(user_id=user)
    theme = user_preference.theme
    return JsonResponse({'theme': theme})

@csrf_exempt
def deleteChats(request):
    username = request.session["username"]
    user = User.objects.get(name=username)

    model_name = request.POST.get("model_name")
    if (model_name == "llama"): 
        UserQueries.objects.filter(user_id=user).delete()
    else: 
        ImageQueries.objects.filter(user_id=user).delete()
    return JsonResponse({'message': 'History cleared successfully'})

# def getTheme(request):
#     username = request.session["username"]
#     user = User.objects.get(name=username)
#     theme_color = "light_mode" 
#     try:
#         theme_color = Theme.objects.get(user_id=user).values("theme")
#     except Theme.DoesNotExist:
#         theme = Theme(user_id=user, theme='light_mode')
#         theme.save()

#     # if request.method == "POST":
#     #     form = ThemeForm(request.POST, instance=user_preference)
#     #     if form.is_valid():
#     #         form.save()
#     #         return redirect('some_redirect_view')  # Redirect to a suitable view
#     # else:
#     #     form = ThemePreferenceForm(instance=user_preference)
#     theme_resp = {
#         "theme_color": theme_color
#     }
#     return JsonResponse(theme_resp)


# Whenever user clicks requests for a response, the server will send a prompt to the LLM model. And return the response to the html page.
@csrf_exempt
def fetchResponse(request):
    print(request.method)
    print(request)
    if request.method == "POST":
        query = QueryForm(request.POST)
        print(query)
        if query.is_valid():
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

# fetches the query response from llama 2 model and saves the respective user's queries in the database.
def fetchResponseFromModel(request, query):
    query_text = query.cleaned_data["query"]
    print(query_text)
    prompt = "Q: " + query_text + "? A:"
    output = llm(prompt) # fetches the response from the model
    response = output
    user: User = User.objects.get(name=request.session["username"]) 
    queries = UserQueries(question_text=query_text, query_response=response, user_id=user,
                                timestamp=timezone.now())
    queries.save()              # saves the query and response into database.
    query_resp = {
        'question_text':queries.question_text,
        'query_response':response
    }
    return JsonResponse(query_resp)

# fetches the query response from CLIP model and saves the respective user's queries in the database.
def fetchResponseFromCLIP(request, query):
    query_text = query.cleaned_data["query"]
    query_image = query.cleaned_data["image"]
    # print(query_text) 
    # print(query_image)
    # print(type(query_image))

    if len(query_text) > 0: 
        output = search(clip_model, preprocess, "embeddings.pkl", "vector.index", query_text, "text", 1) 
    else: 
        output = search(clip_model, preprocess, "embeddings.pkl", "vector.index", query_image, "image", 1) 
    response = output
    print(response)

    # save 
    with open(response, 'rb') as f:
        data = f.read()

    buffer = BytesIO(data)

    image_response = InMemoryUploadedFile(
        file=ContentFile(buffer.read()),
        field_name='image_response',  # Replace with the actual field name in your model
        name=response,
        content_type='image/jpeg',
        size=len(data),
        charset=None
    )

    user: User = User.objects.get(name=request.session["username"]) 
    queries = ImageQueries(user_id=user, question_text=query_text, image=query_image, image_response=image_response, 
                                timestamp=timezone.now())
    queries.save()              # saves the query and response into database.

    query_resp = {
        'question_text':queries.question_text,
        'image':queries.image.url, 
        'image_response':queries.image_response.url
    }
    print(query_resp)
    return JsonResponse(query_resp)

# Verifies and logs into the view.
def signin(request):
    if request.method == "POST":
        sign_in_details = SignInForm(request.POST)
        if sign_in_details.is_valid():
            username = sign_in_details.cleaned_data["username"]
            password = sign_in_details.cleaned_data["password"]
            try:
                user: User = User.objects.get(name=username)
                if password == user.password:
                    createsession(request, user, username)
                    return redirect(llamaHomepage)
                else:
                    messages.warning(request, 'Incorrect Password')
            except:
                messages.warning(request, 'User ID not found. Please register...')
    return render(request, 'login.html')

# Whenever user logs in creates a new session
def createsession(request, user, username):
    session["username"] = username
    session.create()
    request.session = session
    session_details = SessionDetails(user_id=user, session_id=session.session_key,
                                     login_time=timezone.now())
    session_details.save()


# If new user, sign up and create a new session whenever register is clicked.
def signup(request):
    if request.method == "POST":
        signup_details = SignUpForm(request.POST)
        if signup_details.is_valid():
            username = signup_details.cleaned_data["username"]
            password = signup_details.cleaned_data["password"]
            user = User(name=username, password=password, role='user')
            user.save()
            createsession(request=request, user=user, username=username)
            return redirect(llamaHomepage)

    return render(request, 'signup.html')