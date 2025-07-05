from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Video, Comment, Like, Subscription, WatchLater

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'profile_picture', 'bio', 'subscriber_count')
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class VideoSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Video
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = '__all__'
    
    def get_replies(self, obj):
        if obj.parent_comment is None:
            replies = Comment.objects.filter(parent_comment=obj)
            return CommentSerializer(replies, many=True).data
        return []
