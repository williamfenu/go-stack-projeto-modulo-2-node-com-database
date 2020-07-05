import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const tmpDirectory = path.resolve(__dirname, '..', '..', 'tmp');
export default {
  directory: tmpDirectory,
  storage: multer.diskStorage({
    destination: tmpDirectory,
    filename(request, file, callback) {
      const hashedFileName = crypto.randomBytes(10).toString('hex');
      const fileName = `${hashedFileName}${file.originalname}`;

      callback(null, fileName);
    },
  }),
};
