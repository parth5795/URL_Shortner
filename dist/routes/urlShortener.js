"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomShortUrl = exports.generateShortUrl = exports.isValidUrl = exports.urlShortenerRouter = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
exports.urlShortenerRouter = (0, express_1.Router)();
const urlMappingModel_1 = __importDefault(require("../models/urlMappingModel"));
// Define a constant for the desired short URL length
const SHORT_URL_LENGTH = 8;
// This endpoint will take a long URL and return a short URL
exports.urlShortenerRouter.post('/long_url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { originalUrl } = req.body;
        // request body can not be empty
        if (!originalUrl) {
            return res.status(400).json({ error: 'Original URL is missing' });
        }
        // Validate the original URL (e.g., check if it's a valid URL)
        if (!isValidUrl(originalUrl)) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }
        // Generate a unique short URL (e.g., using a hash function or base62 encoding)
        const shortUrl = yield generateShortUrl(originalUrl);
        // save the short URL to the database
        const urlMapping = new urlMappingModel_1.default({
            originalUrl,
            shortUrl,
        });
        yield urlMapping.save();
        // Return the short URL
        res.json({ shortUrl });
    }
    catch (error) {
        // Need proper error message
        console.error('Error shortening URL:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// create a get endpoint which will take shortened url and redirect to the original URL
exports.urlShortenerRouter.get('/:shortUrl', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortUrl } = req.params;
        // Validate the short URL (e.g., check if it's a valid format) 
        if (!shortUrl) {
            return res.status(400).json({ error: 'Short URL is missing' });
        }
        // Find the original URL in the database based on the short URL 
        const urlMapping = yield urlMappingModel_1.default.findOne({ shortUrl });
        if (!urlMapping) {
            return res.status(404).json({ error: 'Short URL not found' });
        }
        // Redirect to the original URL using HTTP status code 301 (permanent redirection)
        res.status(301).redirect(urlMapping.originalUrl);
    }
    catch (error) {
        console.error('Error redirecting to original URL:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Utility function to validate URL format
function isValidUrl(url) {
    // Implement your validation logic here (e.g., regex check)
    // Return true if valid, false otherwise
    // Example: Use a regex pattern to validate URLs
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return urlPattern.test(url);
}
exports.isValidUrl = isValidUrl;
// Utility function to generate a short URL
// Generate a unique short URL using MD5 hash and Base62 encoding
function generateShortUrl(originalUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Calculate the MD5 hash of the original URL
            const md5Hash = crypto_1.default.createHash('md5').update(originalUrl).digest('hex');
            // Encode the MD5 hash using Base64
            const base64Encoded = Buffer.from(md5Hash, 'hex').toString('base64');
            // Replace non-urlsafe characters to make the string urlsafe
            const base62Encoded = base64Encoded
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, ''); // Trim base64 padding characters
            // Shorten the string to the desired length (e.g., 8 characters)
            let shortUrl = base62Encoded.slice(0, SHORT_URL_LENGTH);
            // Check if the generated short URL already exists in the system
            // Here you would perform a database lookup or any other storage mechanism
            // to ensure uniqueness
            const existingUrl = yield urlMappingModel_1.default.findOne({ shortUrl });
            // if the generated short URL already exists , create a new one
            if (existingUrl) {
                return generateRandomShortUrl();
            }
            return shortUrl;
        }
        catch (error) {
            throw new Error('Error generating short URL');
        }
    });
}
exports.generateShortUrl = generateShortUrl;
// Utility function to generate a random short URL
function generateRandomShortUrl() {
    // Generate a random string of characters (e.g., alphanumeric, base62, etc.)
    // Return the generated random string
    return crypto_1.default.randomBytes(4).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); // Trim base64 padding characters
}
exports.generateRandomShortUrl = generateRandomShortUrl;
exports.default = exports.urlShortenerRouter;
