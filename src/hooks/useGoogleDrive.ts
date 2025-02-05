import { useEffect, useState } from 'react';
import { auth } from '@/firebase/config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export function useGoogleDrive() {
 const [driveConnected, setDriveConnected] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [resourcesDirId, setResourcesDirId] = useState<string | null>(null);

 const checkOrCreateDirectory = async (accessToken: string) => {
   try {
     const listResponse = await fetch(
       'https://www.googleapis.com/drive/v3/files?q=name%3D%27theContextResources%27%20and%20mimeType%3D%27application/vnd.google-apps.folder%27&fields=files(id,name)',
       {
         headers: {
           'Authorization': `Bearer ${accessToken}`
         }
       }
     );
     const listData = await listResponse.json();
     
     if (!listData.files?.length) {
       const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${accessToken}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           name: 'theContextResources',
           mimeType: 'application/vnd.google-apps.folder'
         })
       });
       const createData = await createResponse.json();
       setResourcesDirId(createData.id);
     } else {
       setResourcesDirId(listData.files[0].id);
     }
   } catch (err) {
     console.error('Directory check/create error:', err);
     setError(err instanceof Error ? err.message : 'Directory operation failed');
   }
 };

 const connectToDrive = async () => {
   try {
     const provider = new GoogleAuthProvider();
     provider.addScope('https://www.googleapis.com/auth/drive.file');
     
     const result = await signInWithPopup(auth, provider);
     const credential = GoogleAuthProvider.credentialFromResult(result);
     const accessToken = credential?.accessToken;
     
     if (!accessToken) throw new Error('Brak access tokena');
     
     localStorage.setItem('driveAccessToken', accessToken);
     
     await initializeDriveApi(accessToken);
     setDriveConnected(true);
     await checkOrCreateDirectory(accessToken);
   } catch (err) {
     console.error('Błąd połączenia z Drive:', err);
     setError(err instanceof Error ? err.message : 'Połączenie nieudane');
   }
 };

 const initializeDriveApi = async (accessToken: string) => {
   await new Promise<void>((resolve) => gapi.load('client', resolve));
   await gapi.client.init({
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
   });
   gapi.client.setToken({ access_token: accessToken });
 };

 useEffect(() => {
   const checkConnection = async () => {
     const accessToken = localStorage.getItem('driveAccessToken');
     if (!accessToken) {
       setDriveConnected(false);
       return;
     }
     try {
       await initializeDriveApi(accessToken);
       setDriveConnected(true);
       await checkOrCreateDirectory(accessToken); 
     } catch {
       setDriveConnected(false);
       localStorage.removeItem('driveAccessToken');
     }
   };
   checkConnection();
 }, []);

 return { driveConnected, error, connectToDrive, resourcesDirId };
}