from django.urls import path
from .views import pushup_counter_api

urlpatterns = [
    path('api/pushup-counter/', pushup_counter_api, name='pushup_counter_api'),
]
