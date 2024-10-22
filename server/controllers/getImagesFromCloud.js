import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: "e-commerce-anime",
  keyFilename: "google-api-credentials.json",
});

const bucket = storage.bucket("anime_images_url");

const options = {
  version: "v4",
  action: "read",
  expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
};

export const getSignedUrl = async (file) => {
  const filePath = `profile_pic/${file}`;
  const [url] = await bucket.file(filePath).getSignedUrl(options);
  return url;
}

export const getProductsImage = async (file) => {
  const filePath = `products/${file}`;
  const [url] = await bucket.file(filePath).getSignedUrl(options);
  return url;
};
