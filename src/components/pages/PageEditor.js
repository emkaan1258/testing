import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import axios from '../../utils/axios';

const EMPTY_PAGE = {
  name: '',
  title: '',
  description: '',
  metaTitle: '',
  metaDescription: '',
  isActive: true,
};

const PageEditor = () => {
  const { id } = useParams(); // Get the ID from the route parameters
  const navigate = useNavigate();
  const [page, setPage] = useState(EMPTY_PAGE); // Default state for the page
  const [sections, setSections] = useState([]); // Sections of the page
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error message state
  const [showArabic, setShowArabic] = useState(false); // Toggle between English and Arabic sections
  const isNewPage = !id || id === 'new'; // Determine if this is a new page or edit

  useEffect(() => {
    if (!isNewPage) {
      fetchPageData();
    }
  }, [id, showArabic]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const pageResponse = await axios.get(`/pages/${id}`);
      setPage(pageResponse?.data?.data || EMPTY_PAGE);

      // Fetch sections with the isArabic flag
      const sectionsResponse = await axios.get(`/sections`, {
        params: {
          pageId: id 
        }
      });
      console.log('Fetched sections:', sectionsResponse);
      setSections(sectionsResponse?.data?.data || []);
    } catch (error) {
      console.error('Error fetching page data:', error);
      setError('Failed to fetch page data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isNewPage) {
        // Create a new page
        await axios.post('/pages', page);
      } else {
        // Update an existing page
        await axios.put(`/pages/${id}`, page);
      }
      navigate('/pages');
    } catch (err) {
      console.error('Error saving page:', err);
      setError('Failed to save the page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return; // If dropped outside the list, do nothing

    const reorderedSections = Array.from(sections);
    const [movedSection] = reorderedSections.splice(result.source.index, 1);
    reorderedSections.splice(result.destination.index, 0, movedSection);

    // Update the state
    setSections(reorderedSections);

    // Optionally, send the new order to the backend
    try {
      axios.put('/sections/order', {
        sections: reorderedSections.map(({ _id, order }, index) => ({
          _id,
          order: index,
        })),
      });
    } catch (error) {
      console.error('Error updating section order:', error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      await axios.delete(`/sections/${sectionId}`);
      setSections(sections.filter((section) => section._id !== sectionId));
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleToggleActive = () => {
    setPage({ ...page, isActive: !page.isActive });
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setPage((prev) => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value,
    }));
  };

  const handleLanguageToggle = () => {
    setShowArabic(!showArabic);
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {isNewPage ? 'Create New Page' : 'Edit Page'}
          </Typography>
          {!isNewPage && (
            <FormControlLabel
              control={
                <Switch
                  checked={showArabic}
                  onChange={handleLanguageToggle}
                  name="showArabic"
                />
              }
              label={showArabic ? "Show Arabic Sections" : "Show English Sections"}
            />
          )}
        </Box>

        {error && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <form onSubmit={handleSavePage}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Page Name"
                name="name"
                value={page.name || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Page Title"
                name="title"
                value={page.title || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={page.description || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Meta Title"
                name="metaTitle"
                value={page.metaTitle || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Meta Description"
                name="metaDescription"
                value={page.metaDescription || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={page.isActive}
                    onChange={handleChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/pages')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {isNewPage ? 'Create Page' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Sections Panel - Always show for existing pages */}
      {!isNewPage && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              {showArabic ? "Arabic Sections" : "English Sections"}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/pages/${id}/sections/new${showArabic ? '?isArabic=true' : ''}`)}
            >
              Add New Section
            </Button>
          </Box>

          {/* Show message if no sections */}
          {sections.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary" gutterBottom>
                No sections added yet
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/pages/${id}/sections/new${showArabic ? '?isArabic=true' : ''}`)}
                sx={{ mt: 2 }}
              >
                Create Your First Section
              </Button>
            </Box>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <List {...provided.droppableProps} ref={provided.innerRef}>
                    {sections.map((section, index) => (
                      <Draggable key={section._id} draggableId={section._id} index={index}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              bgcolor: 'background.paper',
                              mb: 1,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Box {...provided.dragHandleProps} sx={{ mr: 2 }}>
                              <DragIndicatorIcon />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography>{section.title}</Typography>
                            </Box>
                            <Box>
                              <IconButton
                                onClick={() => navigate(`/pages/${id}/sections/${section._id}${showArabic ? '?isArabic=true' : ''}`)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteSection(section._id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Box>
      )}
    </Container>
  );
};

export default PageEditor;
