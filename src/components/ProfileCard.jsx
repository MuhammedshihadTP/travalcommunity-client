import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Avatar, Card, CardContent, IconButton } from '@mui/material';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axiosInstance from '../helpers/axiosInstance';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  username: Yup.string(),
  bio: Yup.string(),
  interestedCountries: Yup.array().of(Yup.string().required('Country is required')),
});

const ProfileCard = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get('/api/users/profile');
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUser();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpdateSubmit = async (values) => {
    const formData = new FormData();
  
    if (file) {
      formData.append('image', file);
    }
  
    formData.append('name', values.name);
    formData.append('username', values.username);
    formData.append('bio', values.bio);
    formData.append('interestedCountries',values.interestedCountries);
  
    // Log FormData contents
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  
    try {
      const response = await axiosInstance.put('/api/users/profile', formData);
      
      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };
  

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 5, p: 3 }}>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          {!isEditing ? (
            <>
              <Avatar
                src={user?.profilePicture ? `${process.env.REACT_APP_SERVER_URL}${user.profilePicture}` : '/path/to/default/image.jpg'}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Typography variant="h5" component="div">
                {user?.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                @{user?.username}
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                {user?.bio}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleEditClick}
                sx={{ mt: 2 }}
                startIcon={<EditIcon />}
              >
                Edit Profile
              </Button>
            </>
          ) : (
            <Formik
              initialValues={{
                name: user?.name || '',
                username: user?.username || '',
                bio: user?.bio || '',
                interestedCountries: user?.interestedCountries || [],
              }}
              validationSchema={validationSchema}
              onSubmit={handleUpdateSubmit}
            >
              {({ setFieldValue, values }) => (
                <Form>
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 2 }}>
                    <Avatar src={file ? URL.createObjectURL(file) : user?.profilePicture ? `${process.env.REACT_APP_SERVER_URL}${user.profilePicture}` : '/path/to/default/image.jpg'} sx={{ width: 100, height: 100, mb: 2 }} />
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ mb: 2 }}
                    >
                      Change Profile Picture
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>
                    <Field
                      name="name"
                      as={TextField}
                      label="Name"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                    />
                    <Field
                      name="username"
                      as={TextField}
                      label="Username"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                    />
                    <Field
                      name="bio"
                      as={TextField}
                      label="Bio"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      multiline
                      rows={4}
                    />
                    <FieldArray
                      name="interestedCountries"
                      render={(arrayHelpers) => (
                        <Box width="100%" mt={2}>
                          <Typography variant="h6">Interested Countries</Typography>
                          {values.interestedCountries.map((country, index) => (
                            <Box key={index} display="flex" alignItems="center" mt={1}>
                              <Field
                                name={`interestedCountries.${index}`}
                                as={TextField}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                placeholder="Enter country"
                              />
                              <IconButton
                                onClick={() => arrayHelpers.remove(index)}
                                sx={{ ml: 1 }}
                              >
                                <RemoveIcon />
                              </IconButton>
                            </Box>
                          ))}
                          <Button
                            variant="outlined"
                            onClick={() => arrayHelpers.push('')}
                            sx={{ mt: 1 }}
                            startIcon={<AddIcon />}
                          >
                            Add Country
                          </Button>
                        </Box>
                      )}
                    />
                    <Box display="flex" justifyContent="space-between" sx={{ mt: 2, width: '100%' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                       
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setIsEditing(false)}
                        sx={{ ml: 1 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                </Form>
              )}
            </Formik>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
