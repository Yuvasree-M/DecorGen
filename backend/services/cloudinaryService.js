import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => (result ? resolve(result) : reject(err))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

const uploadUrl = (url, folder) =>
  cloudinary.uploader.upload(url, { folder });

export const uploadToCloudinary = (file) => {
  if (typeof file === "string") {
    return uploadUrl(file, "interior-ai");
  }
  return uploadBuffer(file, "interior-ai");
};

export const uploadPortfolioImage = (buf) =>
  uploadBuffer(buf, "interior-ai/portfolio");

export const deleteFromCloudinary = (publicId) =>
  cloudinary.uploader.destroy(publicId);