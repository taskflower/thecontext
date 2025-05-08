import { db } from '../_firebase/config';

const firestore: any = db;

export const getDocument = async (collection: string, id: string) => {
  const docRef = firestore.collection(collection).doc(id);
  const doc = await docRef.get();
  return doc.data();
};

export const saveDocument = async (collection: string, data: any) => {
  const docRef = firestore.collection(collection).doc();
  await docRef.set(data);
}