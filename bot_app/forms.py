from django import forms


class QueryForm(forms.Form):
    query = forms.CharField(max_length=1000)


class SignInForm(forms.Form):
    username = forms.CharField(max_length=20)
    password = forms.CharField(max_length=10)


class SignUpForm(forms.Form):
    username = forms.CharField(max_length=20)
    password = forms.CharField(max_length=10)

class ThemeForm(forms.ModelForm):
    theme = forms.CharField(max_length=20)

class ImageForm(forms.Form):
    query = forms.CharField(max_length=1000, required=False)
    image = forms.ImageField(required=False)
