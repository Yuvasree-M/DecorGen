import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
