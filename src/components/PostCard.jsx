import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    CardMedia,
    Button,
    IconButton,
    TextField,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import getUserIdFromToken from '../helpers/TokenDecode';
import axiosInstance from '../helpers/axiosInstance';
import { io } from 'socket.io-client';

const PostCard = () => {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState({});
    const [open, setOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [likedPosts, setLikedPosts] = useState(new Set()); // Track liked posts
    const [error, setError] = useState('');


  
    const userId=getUserIdFromToken()

    const fetchPosts = async () => {
        try {
            const { data } = await axiosInstance.get(`/api/posts`);
            setPosts(data);
            console.log(posts,"posttt")
            const initialLikedPosts = new Set();
            
            data.forEach(post => {
               
                const userLikedPost = post.likes.some(like => like._id.toString() === userId);
                
                if (userLikedPost) {
                  initialLikedPosts.add(post._id);
                }
              });
        console.log(initialLikedPosts,"initaliked posts")
        setLikedPosts(initialLikedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };
    useEffect(() => {
       

        fetchPosts();
    }, []);

    const handleLike = async (postId) => {
        try {
            await axiosInstance.post(`/api/likes/${postId}`, ); 
          
            fetchPosts()
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleUnlike = async (postId) => {
        try {
            await axiosInstance.post(`/api/likes/${postId}/unlike`,);
           
            fetchPosts()
        } catch (error) {
            console.error('Error unliking post:', error);
        }
    };

    const handleCommentChange = (e, postId) => {
        setComments({ ...comments, [postId]: e.target.value });
    };

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        const newComment = comments[postId] || '';
        if (!newComment.trim()) {
            setError('Please enter a comment.');
            setTimeout(() => setError(''), 3000); 
            return;
        }
        try {
            const response = await axiosInstance.post(`/api/comments/${postId}`, {
                
                text: newComment,
            });

           
            const updatedPosts = posts.map((post) => {
                if (post._id === postId) {
                    return response.data; 
                }
                return post;
            });
            setPosts(updatedPosts);
            const updatedSelectedPost = updatedPosts.find(post => post._id === postId);
            setSelectedPost(updatedSelectedPost);
            setComments({ ...comments, [postId]: '' });
            fetchPosts()
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };


    const handleCommentDelet = async (postId, commentId) => {
        try {
            await axiosInstance.delete(`/api/comments/${postId}/${commentId}`);

            
            const updatedPosts = posts.map((post) => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: post.comments.filter(comment => comment._id !== commentId)
                    };
                }
                return post;
            });
            setPosts(updatedPosts);
            const updatedSelectedPost = updatedPosts.find(post => post._id === postId);
            setSelectedPost(updatedSelectedPost);
            fetchPosts()
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };


    const handleOpen = (post) => {
        setSelectedPost(post);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedPost(null);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    
    const filteredPosts = posts.filter((post) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            post?.country.toLowerCase().includes(searchLower) ||
            post?.user?.username.toLowerCase().includes(searchLower) ||
            post?.content?.toLowerCase().includes(searchLower)
        );
    });

    const socket = io(`${process.env.REACT_APP_SERVER_URL}`); 

const useSocket = (updateComments) => {
    useEffect(() => {
        socket.on('newComment', (data) => {
            updateComments(data);
        });

        return () => {
            socket.off('newComment');
        };
    }, [updateComments]);
};

useSocket((data) => {
    const updatedPosts = posts.map(post => {
        if (post._id === data.postId) {
            return {
                ...post,
                comments: [...post.comments, data.comment]
            };
        }
        return post;
    });
    setPosts(updatedPosts);

    // Update the selected post if it's open
    if (selectedPost && selectedPost._id === data.postId) {
        setSelectedPost(prevPost => ({
            ...prevPost,
            comments: [...prevPost.comments, data.comment]
        }));
    }
});

    return (
        <Container>
            <Box sx={{ marginBottom: 2 }}>
                <TextField
                    label="Search posts"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </Box>
            <Grid container spacing={4} justifyContent="center">
                {filteredPosts.map((post) => (
                    <Grid item key={post._id} xs={12} sm={8} md={6}>
                        <Card sx={{ maxWidth: 600, margin: 'auto', borderRadius: '16px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                            {post.image && (
                                <CardMedia component="img" image={`${process.env.REACT_APP_SERVER_URL}${post?.image}`} alt="Post image" />
                            )}
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {post.user.name}
                                    </Typography>
                                    <IconButton sx={{ marginLeft: 'auto' }}>
                                        <MoreHorizIcon />
                                    </IconButton>
                                </Box>
                                <Typography variant="body2" sx={{ marginBottom: 2 }}>
                                    {post.content}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                                    <IconButton
                                        onClick={() => {
                                            likedPosts.has(post._id) ? handleUnlike(post._id) : handleLike(post._id);
                                        }}
                                        sx={{
                                            color: likedPosts.has(post._id) ? 'blue' : 'default',
                                        }}
                                    >
                                        <ThumbUpAltIcon />
                                    </IconButton>
                                    <Typography variant="body2" sx={{ marginRight: 1 }}>
                                        {post?.likes?.length} likes
                                    </Typography>
                                    <IconButton onClick={() => handleUnlike(post._id)}>
                                        <ThumbDownAltIcon />
                                    </IconButton>
                                </Box>
                                <Box>
                                    {post?.comments?.length > 0 && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ marginBottom: 1, cursor: 'pointer' }}
                                            onClick={() => handleOpen(post)}
                                        >
                                            View all {post?.comments?.length} comments
                                        </Typography>
                                    )}
                                </Box>
                                <Divider sx={{ marginY: 2 }} />
                                <form onSubmit={(e) => handleCommentSubmit(e, post._id)} style={{ display: 'flex', alignItems: 'center' }}>
                                    <TextField
                                        placeholder="Add a comment..."
                                        variant="outlined"
                                        size="small"
                                        value={comments[post._id] || ''}
                                        onChange={(e) => handleCommentChange(e, post._id)}
                                        fullWidth
                                        sx={{ marginRight: 1, backgroundColor: '#f0f0f0', borderRadius: '16px' }}
                                    />

                                    <Button type="submit" variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: '16px' }}>
                                        Post
                                    </Button>


                                </form>
                                {error && (
                                    <Typography variant="body2" color="error" sx={{ marginTop: 1 }}>
                                        {error}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {selectedPost && (
                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                    <DialogTitle>Comments</DialogTitle>
                    <DialogContent>
                        {selectedPost.comments.map((comment, index) => (
                            <Box key={index} display="flex" justifyContent="space-between" alignItems="center" sx={{ marginBottom: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>{comment.user.name}</strong> {comment.text}
                                </Typography>
                                {comment.user._id === userId && (
                                    <IconButton onClick={() => handleCommentDelet(selectedPost._id, comment._id)} sx={{ color: 'gray' }}>
                                        <DeleteIcon />
                                    </IconButton>
                                )}

                            </Box>
                        ))}

                        <form onSubmit={(e) => handleCommentSubmit(e, selectedPost._id)} style={{ marginTop: 1 }}>
                            <TextField
                                placeholder="Add a comment..."
                                variant="outlined"
                                size="small"
                                value={comments[selectedPost._id] || ''}
                                onChange={(e) => handleCommentChange(e, selectedPost._id)}
                                fullWidth
                                sx={{ marginBottom: 1 }}
                            />
                            <Button type="submit" variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: '16px' }}>
                                Post
                            </Button>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary" sx={{ textTransform: 'none', borderRadius: '16px' }}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Container>
    );
};

export default PostCard;
