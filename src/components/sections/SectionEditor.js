import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from '../../utils/axios';

const EMPTY_SECTION = {
    name: '',
    title: '',
    content: '',
    type: 'custom',
    images: [],
    isArabic: false
};

const SectionEditor = () => {
    const { pageId, sectionId } = useParams();
    const navigate = useNavigate();
    const [section, setSection] = useState(EMPTY_SECTION);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const isNewSection = !sectionId || sectionId === 'new';

    const sectionTypes = [
        { value: 'hero', label: 'Hero Section' },
        { value: 'about', label: 'About Section' },
        { value: 'services', label: 'Services Section' },
        { value: 'contact', label: 'Contact Section' },
        { value: 'custom', label: 'Custom Section' }
    ];

    useEffect(() => {
        if (!isNewSection) {
            fetchSectionData();
        }
    }, [sectionId]);

    const fetchSectionData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/sections/${sectionId}`);
            setSection(response?.data?.data || EMPTY_SECTION);
        } catch (error) {
            console.error('Error fetching section:', error);
            setError('Failed to fetch section data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);

        // Validate if files are selected
        if (files.length === 0) {
            setError('No files selected for upload.');
            return;
        }

        for (const file of files) {
            // Validate if the file is an image
            if (!file.type.startsWith('image/')) {
                setError('Please upload only image files.');
                continue; // Skip non-image files
            }

            const formData = new FormData();
            formData.append('image', file);

            try {
                setLoading(true);
                const response = await axios.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(progress);
                    },
                });

                // Check if the server returned a valid URL
                const imageUrl = response?.data?.url || response?.data?.data?.url;
                if (!imageUrl) {
                    throw new Error('Invalid server response. Image URL is missing.');
                }

                // Update section state with the new image
                setSection((prev) => ({
                    ...prev,
                    images: [...prev.images, { url: imageUrl, caption: file.name }],
                }));
            } catch (error) {
                console.log(error)
                console.error('Error uploading image:', error);
                setError(
                    error.response?.data?.message || 'Failed to upload image. Please try again.'
                );
            } finally {
                setLoading(false);
                setUploadProgress(0);
            }
        }
    };


    const handleRemoveImage = (indexToRemove) => {
        setSection(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSaveSection = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const sectionData = {
                ...section,
                page: pageId
            };

            if (isNewSection) {
                await axios.post('/sections', sectionData);
            } else {
                await axios.put(`/sections/${sectionId}`, sectionData);
            }
            navigate(`/pages/${pageId}`);
        } catch (err) {
            console.error('Error saving section:', err);
            setError('Failed to save the section. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleArabicToggle = (e) => {
        setSection(prev => ({
            ...prev,
            isArabic: e.target.checked
        }));
    };

    if (loading && !uploadProgress) {
        return (
            <Container sx={{ textAlign: 'center', mt: 5 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1">
                        {isNewSection ? 'Create New Section' : 'Edit Section'}
                    </Typography>
                </Box>

                {error && (
                    <Box sx={{ mb: 2 }}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                )}

                <form onSubmit={handleSaveSection}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                label="Section Name"
                                value={section.name}
                                onChange={(e) => setSection({ ...section, name: e.target.value })}
                                dir={section.isArabic ? 'rtl' : 'ltr'}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="Section Type"
                                value={section.type}
                                onChange={(e) => setSection({ ...section, type: e.target.value })}
                            >
                                {sectionTypes.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Section Title"
                                value={section.title}
                                onChange={(e) => setSection({ ...section, title: e.target.value })}
                                dir={section.isArabic ? 'rtl' : 'ltr'}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Content"
                                value={section.content}
                                onChange={(e) => setSection({ ...section, content: e.target.value })}
                                dir={section.isArabic ? 'rtl' : 'ltr'}
                            />
                        </Grid>

                        {/* Image Upload Section */}
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Section Images
                                </Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ mb: 2 }}
                                >
                                    Upload Images
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                    />
                                </Button>
                            </Box>

                            {uploadProgress > 0 && (
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <LinearProgress variant="determinate" value={uploadProgress} />
                                    <Typography variant="body2" color="text.secondary">
                                        Uploading: {uploadProgress}%
                                    </Typography>
                                </Box>
                            )}

                            {section.images.length > 0 && (
                                <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={200}>
                                    {section.images.map((image, index) => (
                                        <ImageListItem key={index}>
                                            <img
                                                src={image.url}
                                                alt={image.caption}
                                                loading="lazy"
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                            <ImageListItemBar
                                                title={image.caption}
                                                actionIcon={
                                                    <IconButton
                                                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                }
                                            />
                                        </ImageListItem>
                                    ))}
                                </ImageList>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={section.isArabic}
                                        onChange={handleArabicToggle}
                                    />
                                }
                                label="Arabic Content"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(`/pages/${pageId}`)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                >
                                    {isNewSection ? 'Create Section' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default SectionEditor;
