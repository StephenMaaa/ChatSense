#django imports
from django.shortcuts import render, redirect
from django.contrib.sessions.backends.file import SessionStore
from django.utils import timezone
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

# custom imports
from .forms import QueryForm, SignInForm, SignUpForm
from django.contrib import messages
# from llama_cpp import Llama
from .models import User, SessionDetails, UserQueries
from ctransformers import AutoModelForCausalLM
from langchain.llms import CTransformers
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import threading

# creates a session store.
session = SessionStore()

# added to load gguf llama2 models
llm = AutoModelForCausalLM.from_pretrained("C:/Users/Stephen Ma/Desktop/Llama-2-Chatbot/server", model_file="llama-2-7b-chat.Q4_K_M.gguf", model_type="llama")

# used to block access while handling request for a query
# lock = threading.Lock()


# Displays the previous queries asked by the user.
def homepage(request):
    username = request.session["username"]
    user = User.objects.get(name=username)
    data = UserQueries.objects.filter(user_id=user).values('question_text', 'query_response')
    return render(request, 'index.html', {'data': data})
    # return render(request, 'index.html')


# Whenever user clicks requests for a response, the server will send a prompt to the LLM model. And return the response to the html page.
@csrf_exempt
def fetchResponse(request):
    print(request.method)
    print(request)
    if request.method == "POST":
        query = QueryForm(request.POST)
        print(query)
        if query.is_valid():
            result = HttpResponse(waitForResult(request=request, query=query), content_type='application/json') 
            print(result)
            # return HttpResponse(waitForResult(request=request, query=query), content_type='application/json')  
            return result      


def waitForResult(request, query):
    # if multiple user ask question to llama2 this method will wait until the lock has been released.
    # while not lock.acquire():
    #     print("Waiting..")
        # yield JsonResponse({'message':'Generating response'})

    # Once lock is released, the user's query will be sent to the llama2 model.
    try:
        query = fetchResponseFromModel(request, query)
    except Exception as error:
        print("Failed to get response",type(error).__name__, "–", error)
        # yield JsonResponse({'message':'Failed to get response. Kindly re-enter your query..'})
    # finally:
        # lock.release()

    return query

# fetches the query response from llama 2 model and saves the respective user's queries in the database.
def fetchResponseFromModel(request, query):
    query_txt = query.cleaned_data["query"]
    print(query_txt)
    prompt = "Q: " + query_txt + "? A:"
    output = llm(prompt) # fetches the response from the model
    response = output
    user: User = User.objects.get(name=request.session["username"]) 
    queries = UserQueries(question_text=query_txt, query_response=response, user_id=user,
                                timestamp=timezone.now())
    queries.save()              # saves the query and response into database.
    query_resp = {
        'question_text':queries.question_text,
        'query_response':response
    }
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
                    return redirect(homepage)
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
            return redirect(homepage)

    return render(request, 'signup.html')
