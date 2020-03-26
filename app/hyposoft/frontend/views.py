from django.shortcuts import render

def index(request):
  print(request.META)
  return render(request, 'index.html')