import { S3 } from "@aws-sdk/client-s3";

export async function uploadToS3(file: File){
  try {
    const s3 = new S3({
      region: "ap-south-1",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
    });

    // Generate a unique file key with the "uploads" folder prefix
    const file_key = `uploads/${Date.now().toString()}-${file.name.replace(/ /g, "-")}`;

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: file, // Use the File object directly (browser handles it as a Blob)
      ContentType: file.type, // Set the file's content type
    };

    console.log("Uploading file to S3 with params:", params); // Debugging

    // Upload the file to S3
    const data = await s3.putObject(params);
    console.log("Upload successful:", data);

    return {
      file_key,
      file_name: file.name,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${file_key}`;
  return url;
}