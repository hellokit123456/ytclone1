from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Video, Comment, Like, Subscription, WatchLater
from .serializers import VideoSerializer, CommentSerializer, UserSerializer

class VideoListCreateView(generics.ListCreateAPIView):
    queryset = Video.objects.filter(is_published=True).order_by('-upload_date')
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def retrieve(self, request, *args, **kwargs):
        video = self.get_object()
        video.view_count += 1
        video.save()
        return super().retrieve(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def like_video(request, video_id):
    try:
        video = Video.objects.get(id=video_id)
        like_type = request.data.get('like_type', 'like')
        
        like_obj, created = Like.objects.get_or_create(
            user=request.user, 
            video=video,
            defaults={'like_type': like_type}
        )
        
        if not created:
            if like_obj.like_type == like_type:
                like_obj.delete()
                return Response({'message': 'Like removed'})
            else:
                like_obj.like_type = like_type
                like_obj.save()
        
        # Update video counts
        video.like_count = Like.objects.filter(video=video, like_type='like').count()
        video.dislike_count = Like.objects.filter(video=video, like_type='dislike').count()
        video.save()
        
        return Response({'message': 'Like updated successfully'})
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=404)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def subscribe_channel(request, user_id):
    try:
        channel = User.objects.get(id=user_id)
        subscription, created = Subscription.objects.get_or_create(
            subscriber=request.user,
            subscribed_to=channel
        )
        
        if not created:
            subscription.delete()
            message = 'Unsubscribed successfully'
        else:
            message = 'Subscribed successfully'
        
        # Update subscriber count
        channel.subscriber_count = Subscription.objects.filter(subscribed_to=channel).count()
        channel.save()
        
        return Response({'message': message})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
