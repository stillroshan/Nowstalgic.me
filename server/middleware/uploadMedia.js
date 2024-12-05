import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime'];

    if (allowedImageTypes.includes(file.mimetype)) {
        file.mediaType = 'image';
        cb(null, true);
    } else if (allowedVideoTypes.includes(file.mimetype)) {
        file.mediaType = 'video';
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter
});