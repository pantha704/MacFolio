import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server-side setup credentials only. Never expose these as VITE_ variables.
const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = required.filter(name => !process.env[name]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOAD_PRESET_NAME = "macos_portfolio_uploads";
const ASSETS_DIR = path.join(__dirname, "../src/assets/gallery");
const OUTPUT_FILE = path.join(__dirname, "../src/constants/initialImages.json");

async function initCloudinary() {
  try {
    console.log("🚀 Starting Cloudinary Initialization...");

    // 1. Create Unsigned Upload Preset
    console.log("⚙️ Checking/Creating Upload Preset...");
    try {
      await cloudinary.api.create_upload_preset({
        name: UPLOAD_PRESET_NAME,
        unsigned: true,
        folder: "macos-portfolio",
        allowed_formats: "jpg,png,jpeg,webp,gif",
          max_file_size: 10 * 1024 * 1024,
      });
      console.log(`✅ Created upload preset: ${UPLOAD_PRESET_NAME}`);
    } catch (error) {
      if (
        error.error &&
        error.error.message &&
        error.error.message.includes("already exists")
      ) {
        console.log(`ℹ️ Upload preset ${UPLOAD_PRESET_NAME} already exists.`);
        // Update it just in case to ensure it's unsigned and has correct settings
        await cloudinary.api.update_upload_preset(UPLOAD_PRESET_NAME, {
          unsigned: true,
          folder: "macos-portfolio",
          allowed_formats: "jpg,png,jpeg,webp,gif",
          max_file_size: 10 * 1024 * 1024,
        });
        console.log(`✅ Updated upload preset: ${UPLOAD_PRESET_NAME}`);
      } else {
        throw new Error("Could not configure upload preset");
      }
    }

    // 2. Upload Existing Images
    console.log("📤 Uploading local images...");
    const files = fs
      .readdirSync(ASSETS_DIR)
      .filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
    const uploadedUrls = [];
    let failures = 0;

    for (const file of files) {
      const filePath = path.join(ASSETS_DIR, file);
      console.log(`   Uploading ${file}...`);
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "macos-portfolio",
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        });
        uploadedUrls.push(result.secure_url);
      } catch (err) {
        failures++;
        console.error(`   ❌ Failed to upload ${file}`);
      }
    }

    if (failures || !uploadedUrls.length) throw new Error("Incomplete upload: existing manifest was preserved");

    // 3. Save URLs to JSON
    console.log(`💾 Saving ${uploadedUrls.length} URLs to ${OUTPUT_FILE}...`);
    fs.writeFileSync(`${OUTPUT_FILE}.tmp`, JSON.stringify(uploadedUrls, null, 2));
    fs.renameSync(`${OUTPUT_FILE}.tmp`, OUTPUT_FILE);

    console.log("✨ Cloudinary Initialization Complete!");
    console.log("-----------------------------------");
    console.log("Cloud configuration loaded from environment.");
    console.log(`Upload Preset: ${UPLOAD_PRESET_NAME}`);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("Initialization failed; verify configuration and provider availability. Existing manifest was preserved.");
    process.exitCode = 1;
  }
}

initCloudinary();
