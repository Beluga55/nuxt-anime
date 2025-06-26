import { Storage } from "@google-cloud/storage";
import { createClient } from 'redis';

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

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.log('Redis Client Error', err);
});

let isRedisConnected = false;

const connectRedis = async () => {
  if (!isRedisConnected) {
    try {
      await redisClient.connect();
      isRedisConnected = true;
      console.log('Redis connected successfully');
    } catch (error) {
      console.error('Redis connection failed:', error);
    }
  }
};

export const getSignedUrl = async (file) => {
  await connectRedis();
  
  const cacheKey = `profile_pic:${file}`;
  
  try {
    const cachedUrl = await redisClient.get(cacheKey);
    if (cachedUrl) {
      console.log(`Cache hit for ${file}`);
      return cachedUrl;
    }
  } catch (error) {
    console.log('Redis get error:', error);
  }
  
  const filePath = `profile_pic/${file}`;
  const [url] = await bucket.file(filePath).getSignedUrl(options);
  
  try {
    await redisClient.setEx(cacheKey, 60 * 60 * 24 * 6, url);
    console.log(`Cached URL for ${file}`);
  } catch (error) {
    console.log('Redis set error:', error);
  }
  
  return url;
}

export const getProductsImage = async (file) => {
  await connectRedis();
  
  const cacheKey = `products:${file}`;
  
  try {
    const cachedUrl = await redisClient.get(cacheKey);
    if (cachedUrl) {
      console.log(`Cache hit for ${file}`);
      return cachedUrl;
    }
  } catch (error) {
    console.log('Redis get error:', error);
  }
  
  const filePath = `products/${file}`;
  const [url] = await bucket.file(filePath).getSignedUrl(options);
  
  try {
    await redisClient.setEx(cacheKey, 60 * 60 * 24 * 6, url);
    console.log(`Cached URL for ${file}`);
  } catch (error) {
    console.log('Redis set error:', error);
  }
  
  return url;
};
