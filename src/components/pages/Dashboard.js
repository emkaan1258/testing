import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from '../../utils/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get('/pages');
      setPages(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pages. Please try again later.');
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPages(items);

    try {
      await axios.put(`/pages/${reorderedItem._id}/reorder`, {
        newPosition: result.destination.index,
      });
    } catch (err) {
      console.error('Error reordering pages:', err);
      fetchPages(); // Refresh the list if reordering fails
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      await axios.delete(`/pages/${pageId}`);
      fetchPages();
    } catch (err) {
      console.error('Error deleting page:', err);
      setError('Failed to delete page. Please try again later.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Website Pages
        </Typography>
        <Button
          variant="contained"
          color="primary"  
          onClick={() => navigate('/pages/new')}
        >
          Create New Page
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pages">
          {(provided) => (
            <Grid
              container
              spacing={3}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {pages.map((page, index) => (
                <Draggable key={page?._id} draggableId={page?._id} index={index}>
                  {(provided) => (
                    <Grid
                      item
                      xs={12}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Card
                        sx={{
                          '&:hover': {
                            boxShadow: (theme) => theme.shadows[4],
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease',
                          },
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <div {...provided.dragHandleProps}>
                              <DragIcon color="action" />
                            </div>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" component="h2" gutterBottom>
                                {page?.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {page?.description || 'No description available'}
                              </Typography>
                            </Box>
                            <Box>
                              <Tooltip title="Edit Page">
                                <IconButton
                                  onClick={() => navigate(`/pages/${page?._id}`)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Page">
                                <IconButton
                                  onClick={() => handleDeletePage(page?._id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>

      {pages.length === 0 && !error && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No Pages Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first page to get started with your website content.
          </Typography>
          <Button
            variant="contained"
            color="primary" 
            onClick={() => navigate('/pages/new')}
          >
            Create New Page
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
