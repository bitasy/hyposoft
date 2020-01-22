from django.urls import path
from rest_framework import routers

#from .views import

router = routers.DefaultRouter()

urlpatterns = [
    path('equipment/eventCreate', EventListCreateView.as_view()),
    path('reminders/eventDetail/<int:pk>', EventDetailView.as_view()),
    path('reminders/reminderCreate', ReminderListCreateView.as_view()),
    path('reminders/reminderDetail/<int:pk>', ReminderDetailView.as_view()),
    path('reminders/allReminderList', AllReminderListView.as_view()),
    path('reminders/allEventList', AllEventListView.as_view()),
]