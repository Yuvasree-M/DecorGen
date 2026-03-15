import cloudinary  from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => (result ? resolve(result) : reject(err))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

export const uploadToCloudinary   = (buf) => uploadBuffer(buf, "interior-ai");
export const uploadPortfolioImage = (buf) => uploadBuffer(buf, "interior-ai/portfolio");
export const deleteFromCloudinary = (publicId) => cloudinary.uploader.destroy(publicId);
