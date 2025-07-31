import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [language, setLanguage] = useState(user?.language || 'en');

  useEffect(() => {
    if (user?._id) {
      axios.get(`http://localhost:3001/api/files/user/${user._id}`)
        .then(res => setFiles(res.data))
        .catch(err => console.error('Error fetching files:', err));
    }
  }, [user]);

  const handleLangChange = async (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    try {
      await axios.put(`http://localhost:3001/api/users/${user._id}/language`, { language: newLang });
    } catch (err) {
      console.error('Failed to update language:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user?.username}!</h2>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Uploaded Files</h3>
        {files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <ul className="bg-white p-4 rounded shadow">
            {files.map(file => (
              <li key={file._id} className="py-1 border-b flex justify-between">
                <span>{file.filename}</span>
                <a
                  href={`http://localhost:3001/api/files/${file._id}`}
                  download
                  className="text-blue-500 underline"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2">Preferred Language</h3>
        <select
          value={language}
          onChange={handleLangChange}
          className="border p-2 rounded"
        >
          <option value="en">English</option>
          <option value="te">Telugu</option>
          <option value="hi">Hindi</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>
      </section>
    </div>
  );
};

export default UserDashboard;
