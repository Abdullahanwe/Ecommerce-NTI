import multer from 'multer';
import path from 'path';
import fs from 'fs';

function createStorage(folderName) {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(process.cwd(), 'uploads', folderName);
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });
}

export const uploadProjectImage = multer({ storage: createStorage('products-Image') });
