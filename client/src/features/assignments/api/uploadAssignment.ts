import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "@/firebase";

export const uploadAssignmentVideo = async (
  file: File,
  studentId: string,
  lessonId: string
) => {
  const storage = getStorage(firebaseApp);

  const fileRef = ref(
    storage,
    `assignments/${studentId}/${lessonId}/submission.mp4`
  );

  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};
