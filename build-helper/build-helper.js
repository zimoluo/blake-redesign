const optimizeResource = require("./image-optimizer");
const generateFavicon = require("./website-favicon-generator");

console.log("Running build helper scripts...");

optimizeResource();
generateFavicon();
