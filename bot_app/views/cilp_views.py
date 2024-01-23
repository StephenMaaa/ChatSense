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
from ..models import User, SessionDetails, UserQueries, Theme, ImageQueries
from ctransformers import AutoModelForCausalLM
from langchain.llms import CTransformers
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import threading

# clip imports 
import torch
import clip
from ..clip import build_embeddings, build_index, search
from django.core.files import File
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.base import ContentFile
from io import BytesIO

# creates a session store.
session = SessionStore(session_key=settings.SESSION_KEY)
device = "cuda" if torch.cuda.is_available() else "cpu"

# added to load gguf models 
clip_model, preprocess = clip.load('ViT-B/32', device) 


def clipHomepage(request): 
    username = request.session["username"]
    user = User.objects.get(name=username)
    data = ImageQueries.objects.filter(user_id=user).values('question_text', 'image', 'image_response')
    data = list(data.values())
    print(len(data))
    for item in data: 
        print(item["image_response"])
    return render(request, 'clip.html', {'data': data}) 


@csrf_exempt
def fetchImage(request):
    if request.method == 'POST':
        query = ImageForm(request.POST, request.FILES)
        if query.is_valid():
            result = HttpResponse(waitForResult(func=fetchResponseFromCLIP, request=request, query=query), content_type='application/json') 
            print(result)
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

    question_text = queries.question_text if queries.question_text else None 
    image = queries.image.url if queries.image else None 
    query_resp = {
        'question_text':question_text,
        'image':image, 
        'image_response':queries.image_response.url
    }
    print(query_resp)
    return JsonResponse(query_resp)