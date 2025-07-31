const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfs, gridfsBucket;

const connectGridFS = (conn) => {
  gridfsBucket = new GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });

  gfs = require('gridfs-stream')(conn.db, mongoose.mongo);
  gfs.collection('uploads');
};

module.exports = { connectGridFS, getGridFS: () => gfs, getBucket: () => gridfsBucket };
