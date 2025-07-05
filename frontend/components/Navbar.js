import React, { useState, useContext } from 'react';
import { AppBar, Toolbar, Typography, InputBase, IconButton, Avatar, Box } from '@mui/material';
import { Search, VideoCall, Menu, Home, Subscriptions, VideoLibrary } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: 1300, backgroundColor: '#fff', color: '#000' }}>
            <Toolbar>
                <IconButton onClick={onMenuClick} sx={{ mr: 2 }}>
                    <Menu />
                </IconButton>
                
                <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4, color: '#ff0000' }}>
                    YouTube Clone
                </Typography>

                <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, maxWidth: 600, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 1 }}>
                        <InputBase
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1, px: 2 }}
                        />
                        <IconButton type="submit" sx={{ p: 1 }}>
                            <Search />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {user ? (
                        <>
                            <IconButton onClick={() => navigate('/upload')}>
                                <VideoCall />
                            </IconButton>
                            <Avatar 
                                src={user.profile_picture} 
                                onClick={() => navigate('/dashboard')}
                                sx={{ cursor: 'pointer' }}
                            >
                                {user.username[0].toUpperCase()}
                            </Avatar>
                        </>
                    ) : (
                        <button onClick={() => navigate('/login')}>Login</button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
