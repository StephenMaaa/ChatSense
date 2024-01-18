from django.db import models


# Create your models here.
class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=80)
    password = models.CharField(max_length=20)
    role = models.CharField(max_length=100, null=True)

    def __str__(self):
        return self.name


class SessionDetails(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=60)
    login_time = models.DateTimeField()


class UserQueries(models.Model):
    id = models.AutoField(primary_key=True)
    question_text = models.CharField(max_length=200)
    query_response = models.CharField(max_length=1000)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.TimeField(null=True)

    def __str__(self):
        return self.question_text
        # , self.user_id, self.timestamp, self.query_response
    
class Theme(models.Model):
    # Define your model fields here
    user_id = models.OneToOneField(User, on_delete=models.CASCADE)
    theme = models.CharField(max_length=10, choices=[('light_mode', 'light_mode'), ('dark_mode', 'dark_mode')], default='light_mode')

    def __str__(self):
        return self.theme
    
class ImageQueries(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    question_text = models.CharField(max_length=200)
    image = models.ImageField(upload_to='images/')
    image_response = models.ImageField(upload_to='images/')
    timestamp = models.TimeField(null=True)

    def __str__(self):
        return self.question_text, self.image, self.image_response
