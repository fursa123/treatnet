from django.urls import re_path
from patients import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<channel_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
]