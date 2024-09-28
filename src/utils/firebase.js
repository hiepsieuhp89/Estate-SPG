import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export const fetchListings = async () => {
  const listingsCollection = collection(db, "listings");
  const q = query(listingsCollection, orderBy("date", "desc"));
  const listingsSnapshot = await getDocs(q);
  return listingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const createListing = async (newListing, imageFiles) => {
  try {
    // Generate a new document ID
    const newId = doc(collection(db, "listings")).id;

    // Upload images and get their URLs
    const imageUrls = await uploadImages(imageFiles);

    // Create the full listing object
    const fullListing = {
      ...newListing,
      id: newId,
      images: imageUrls,
      date: serverTimestamp(), // Use server timestamp
    };

    // Use set with merge option to create the document with the custom ID
    await setDoc(doc(db, "listings", newId), fullListing, { merge: true });

    // Return the full listing with a JavaScript Date object for the client-side
    return {
      ...fullListing,
      date: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in createListing: ", error);
    throw error;
  }
};

export const updateListingWithImageManagement = async (
  updatedListing,
  newImageFiles,
  removedImageUrls,
) => {
  try {
    let currentImages = updatedListing.images || [];

    // Remove specified images
    if (removedImageUrls && removedImageUrls.length > 0) {
      await Promise.all(
        removedImageUrls.map(async (url) => {
          try {
            await deleteImage(url);
          } catch (error) {
            console.error(`Error deleting image ${url}:`, error);
            // Continue with the update process even if image deletion fails
          }
        }),
      );
      currentImages = currentImages.filter(
        (url) => !removedImageUrls.includes(url),
      );
    }
    // Add new images
    if (newImageFiles && newImageFiles.length > 0) {
      const newImageUrls = await uploadImages(newImageFiles);
      currentImages = [...currentImages, ...newImageUrls];
    }

    const listingWithImages = { ...updatedListing, images: currentImages };
    const listingRef = doc(db, "listings", updatedListing.id);
    await updateDoc(listingRef, listingWithImages);
  } catch (error) {
    console.error("Error updating listing: ", error);
    throw error;
  }
};

export const deleteListingWithImages = async (id) => {
  try {
    const listingRef = doc(db, "listings", id);
    const listingSnapshot = await getDoc(listingRef);
    const listingData = listingSnapshot.data();

    if (listingData && listingData.images) {
      await Promise.all(
        listingData.images.map(async (url) => {
          try {
            await deleteImage(url);
          } catch (error) {
            console.error(`Error deleting image ${url}:`, error);
            // Continue with the deletion process even if image deletion fails
          }
        }),
      );
    }

    await deleteDoc(listingRef);
  } catch (error) {
    console.error("Error deleting listing: ", error);
    throw error;
  }
};

export const uploadImages = async (files) => {
  const uploadPromises = files.map(async (file) => {
    const storageRef = ref(storage, `listings/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  });

  return Promise.all(uploadPromises);
};

const deleteImage = async (url) => {
  const imageRef = ref(storage, url);
  try {
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image: ", error);
  }
};

export const deleteListing = async (id) => {
  await deleteDoc(doc(db, "listings", id));
};

export { db, storage, auth };
