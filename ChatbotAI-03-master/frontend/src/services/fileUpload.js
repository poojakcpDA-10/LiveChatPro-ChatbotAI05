import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/chat'; // Adjust if your backend uses a different path

/**
 * Upload a voice or file to the server via multipart/form-data.
 * @param {Blob|File} file - The file or audio blob to upload.
 * @param {Object} options - Extra options like duration, room, etc.
 * @returns {Promise<Object>} Response with fileId, fileName, etc.
 */
export const uploadFile = async (file, { duration, room = 'general', onProgress }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('room', room);
  formData.append('duration', duration);

  try {
    const res = await axios.post(`${API_BASE}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      onUploadProgress: (e) => {
        if (onProgress && typeof onProgress === 'function') {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      },
    });

    return res.data; // { fileId, fileName, url, message }
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
};
