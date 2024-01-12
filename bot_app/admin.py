from django.contrib import admin

# Register your models here.
from .models import User as user
from .models import UserQueries as queries
from .models import SessionDetails as sessions


admin.site.register(user)
admin.site.register(queries)
admin.site.register(sessions)