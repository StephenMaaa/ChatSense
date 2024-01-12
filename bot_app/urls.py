from django.urls import path
from . import views

urlpatterns = [
    path('', views.signin, name='signin'),
    path('signup', views.signup, name='signup'),
    path('homepage', views.homepage, name='homepage'),
    path('fetch_response', views.fetchResponse, name='fetch_response'), 
    path('update_theme', views.updateTheme, name='update_theme'),
    path('get_theme', views.getTheme, name='get_theme'),
    path('delete_chats', views.deleteChats, name='delete_chats'),
]
