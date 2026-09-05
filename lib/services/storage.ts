import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

export async function uploadPortalFile(
  path: string,
  file: File,
): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-()\u0600-\u06FF]+/g, "_");
  const fileRef = ref(storage, `${path}/${Date.now()}-${safeName}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
