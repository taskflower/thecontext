/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/firebase/config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export const userService = {
  // Pobieranie wszystkich użytkowników
  getUsers: async (): Promise<any[]> => {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Pobieranie użytkownika po ID
  getUser: async (userId: string): Promise<any | null> => {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return {
      id: userDoc.id,
      ...userDoc.data(),
    };
  },
};

export default userService;
