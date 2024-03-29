from django.urls import path
from .views import main_views, llama_views, cilp_views, codellama_views

urlpatterns = [
    path('', main_views.signin, name='signin'),
    path('signup', main_views.signup, name='signup'),
    # path('logout', main_views.logout, name='logout'),
    path('llama', main_views.llamaHomepage, name='llama'),
    path('clip', cilp_views.clipHomepage, name='clip'),
    path('codellama', codellama_views.codellamaHomepage, name='codellama'),
    path('fetch_response', llama_views.fetchResponse, name='fetch_response'), 
    path('fetch_image', cilp_views.fetchImage, name='fetch_image'), 
    path('fetch_code', codellama_views.fetchCode, name='fetch_code'), 
    path('fetch_chathistory', main_views.fetchChatHistory, name='fetch_chathistory'), 
    path('update_theme', main_views.updateTheme, name='update_theme'),
    path('get_theme', main_views.getTheme, name='get_theme'),
    path('delete_chats', main_views.deleteChats, name='delete_chats'), 
    path('delete_all_chats', main_views.deleteAllChats, name='delete_all_chats'), 
    path('delete_account', main_views.deleteAccount, name='delete_account'), 
    path('update_starred', main_views.updateStarred, name='update_starred'), 
    path('upload_profile', main_views.uploadProfile, name='upload_profile'), 
    path('get_profile', main_views.getProfile, name='get_profile'), 
    path('update_username', main_views.updateUsername, name='updateUsername') 
]
