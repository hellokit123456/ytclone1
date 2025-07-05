import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Box, Typography, Button, Avatar, IconButton, Divider } from '@mui/material';
import { ThumbUp, ThumbDown, Share, PlaylistAdd, Subscribe } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { videoService } from '../services/api';

const VideoPlayer = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        fetchVideo();
        fetchComments();
    }, [id]);

    const fetchVideo = async () => {
        try {
            const response = await videoService.getVideo(id);
            setVideo(response.data);
        } catch (error) {
            console.error('Error fetching video:', error);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await videoService.getComments(id);
            setComments(response.data.results);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleLike = async (likeType) => {
        if (!user) return;
        try {
            await videoService.likeVideo(id, likeType);
            fetchVideo(); // Refresh video data
        } catch (error) {
            console.error('Error liking video:', error);
        }
    };

    const handleSubscribe = async () => {
        if (!user || !video) return;
        try {
            await videoService.subscribe(video.user.id);
            setIsSubscribed(!isSubscribed);
        } catch (error) {
            console.error('Error subscribing:', error);
        }
    };

    const handleWatchLater = async () => {
        if (!user) return;
        try {
            await videoService.addToWatchLater(id);
            alert('Added to Watch Later!');
        } catch (error) {
            console.error('Error adding to watch later:', error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;
        
        try {
            await videoService.addComment(id, newComment);
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    if (!video) return <div>Loading...</div>;

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
            <Box sx={{ mb: 2 }}>
                <ReactPlayer
                    url={video.video_file}
                    width="100%"
                    height="500px"
                    controls
                    playing
                />
            </Box>

            <Typography variant="h5" gutterBottom>
                {video.title}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={video.user.profile_picture}>
                        {video.user.username[0].toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">{video.user.username}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {video.user.subscriber_count} subscribers
                        </Typography>
                    </Box>
                    <Button
                        variant={isSubscribed ? "outlined" : "contained"}
                        color="error"
                        onClick={handleSubscribe}
                        startIcon={<Subscribe />}
                    >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleLike('like')}>
                        <ThumbUp />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {video.like_count}
                        </Typography>
                    </IconButton>
                    <IconButton onClick={() => handleLike('dislike')}>
                        <ThumbDown />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {video.dislike_count}
                        </Typography>
                    </IconButton>
                    <IconButton>
                        <Share />
                    </IconButton>
                    <IconButton onClick={handleWatchLater}>
                        <PlaylistAdd />
                    </IconButton>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" sx={{ mb: 2 }}>
                {video.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
                Comments ({comments.length})
            </Typography>

            {user && (
                <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar src={user.profile_picture}>
                            {user.username[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Button type="submit" variant="contained" size="small">
                                    Comment
                                </Button>
                                <Button onClick={() => setNewComment('')} size="small">
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}

            <Box>
                {comments.map((comment) => (
                    <Box key={comment.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar src={comment.user.profile_picture}>
                            {comment.user.username[0].toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight="bold">
                                {comment.user.username}
                            </Typography>
                            <Typography variant="body2">
                                {comment.content}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default VideoPlayer;
