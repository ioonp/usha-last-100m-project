import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.82,
  });
  return compressed;
}

export async function uploadAsset(file: File, userId: string, folder: string): Promise<string> {
  const compressed = file.type.startsWith("image/") ? await compressImage(file) : file;
  const ext = (compressed.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("location-assets").upload(path, compressed, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("location-assets").getPublicUrl(path);
  return data.publicUrl;
}
