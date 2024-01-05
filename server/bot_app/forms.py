from django import forms


class QueryForm(forms.Form):
    query = forms.CharField(max_length=200)


class SignInForm(forms.Form):
    username = forms.CharField(max_length=20)
    password = forms.CharField(max_length=10)


class SignUpForm(forms.Form):
    username = forms.CharField(max_length=20)
    password = forms.CharField(max_length=10)
