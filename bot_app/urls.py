from django.urls import path
from . import views

urlpatterns = [
    path('', views.signin, name='signin'),
    path('signup', views.signup, name='signup'),
    path('llama', views.llamaHomepage, name='llama'),
    path('clip', views.clipHomepage, name='clip'),
    path('fetch_response', views.fetchResponse, name='fetch_response'), 
    path('fetch_image', views.fetchImage, name='fetch_image'), 
    path('update_theme', views.updateTheme, name='update_theme'),
    path('get_theme', views.getTheme, name='get_theme'),
    path('delete_chats', views.deleteChats, name='delete_chats'),
]
