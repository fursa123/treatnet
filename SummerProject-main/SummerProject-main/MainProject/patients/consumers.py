import json
import datetime

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message
from .serializer import MessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print('start connect', self.scope['url_route']['kwargs']['channel_id'])
        self.room_name = self.scope['url_route']['kwargs']['channel_id']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        print('leaving...')
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sent_id = text_data_json['user_id']
        channel_id = self.scope['url_route']['kwargs']['channel_id']
        message_ = await sync_to_async(Message.objects.create)(channel_id=channel_id, user_id=sent_id, content=message)

        print('message coming: ', message, 'from', sent_id)

        serializer = MessageSerializer(message_)
        # await self.send(text_data=json.dumps(serializer.data))
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message',
             'message': serializer.data}
        )

    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
