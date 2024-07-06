// src/components/CreatePostModal.js
import * as React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Input } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../helpers/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';

const CreatePostModal = ({ open, handleClose }) => {
  const formik = useFormik({
    initialValues: {
      content: '',
      country: '',
      image: null, 
    },
    validationSchema: Yup.object({
      content: Yup.string().required('Content is required'),
      country: Yup.string().required('Country is required'),
      image: Yup.mixed()
        .required('Image is required')
        .test('fileSize', 'File is too large', value => value && value.size <= 5000000) // 5MB limit
        .test('fileType', 'Unsupported File Format', value => value && ['image/jpeg', 'image/png', 'image/gif'].includes(value.type)),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Handle form submission here
      const formData = new FormData();
      formData.append('content', values.content);
      formData.append('country', values.country);
      formData.append('image', values.image);

      

      console.log('FormData:', formData);
      const response = await axiosInstance.post(`/api/posts`,formData);
      console.log(response)
      toast.success('successfully created new post');
      resetForm();
      handleClose(); 
    },
  });

  return (
    <Dialog open={open} onClose={handleClose}>
      <ToastContainer/>
      <DialogTitle>Create a New Post</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Content"
          fullWidth
          variant="outlined"
          name="content"
          value={formik.values.content}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.content && Boolean(formik.errors.content)}
          helperText={formik.touched.content && formik.errors.content}
        />
        <TextField
          margin="dense"
          label="Country"
          fullWidth
          variant="outlined"
          name="country"
          value={formik.values.country}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.country && Boolean(formik.errors.country)}
          helperText={formik.touched.country && formik.errors.country}
        />
        <Input
          margin="dense"
          type="file"
          name="image"
          onChange={(event) => formik.setFieldValue('image', event.currentTarget.files[0])}
          onBlur={formik.handleBlur}
          error={formik.touched.image && Boolean(formik.errors.image)}
          helperText={formik.touched.image && formik.errors.image}
        />
        {formik.errors.image && formik.touched.image && (
          <div style={{ color: 'red', marginTop: '8px' }}>{formik.errors.image}</div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={formik.handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostModal;
