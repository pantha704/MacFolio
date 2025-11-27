import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
cloudinary.config({
  cloud_name: "dtf88ojhi",
  api_key: "335146622887452",
  api_secret: "Y0pBOYMJ1mEStd1T9uYrJeVfDlY",
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
        allowed_formats: "jpg,png,jpeg,svg,webp",
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
          allowed_formats: "jpg,png,jpeg,svg,webp",
        });
        console.log(`✅ Updated upload preset: ${UPLOAD_PRESET_NAME}`);
      } else {
        console.error("❌ Error creating preset:", error);
      }
    }

    // 2. Upload Existing Images
    console.log("📤 Uploading local images...");
    const files = fs
      .readdirSync(ASSETS_DIR)
      .filter((file) => /\.(jpg|jpeg|png|svg|webp)$/i.test(file));
    const uploadedUrls = [];

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
        console.error(`   ❌ Failed to upload ${file}:`, err.message);
      }
    }

    // 3. Save URLs to JSON
    console.log(`💾 Saving ${uploadedUrls.length} URLs to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uploadedUrls, null, 2));

    console.log("✨ Cloudinary Initialization Complete!");
    console.log("-----------------------------------");
    console.log("Cloud Name: dtf88ojhi");
    console.log(`Upload Preset: ${UPLOAD_PRESET_NAME}`);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("❌ Fatal Error:", error);
  }
}

initCloudinary();
