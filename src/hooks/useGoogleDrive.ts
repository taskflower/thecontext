/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export function useGoogleDrive() {
  const [driveConnected, setDriveConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourcesDirId, setResourcesDirId] = useState<string | null>(null);
  const [allFolders, setAllFolders] = useState<any[]>([]);

  const listAllFolders = async (accessToken: string) => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application/vnd.google-apps.folder%27&fields=files(id,name,trashed)',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('All folders:', data.files);
      setAllFolders(data.files);
      return data.files;
    } catch (err) {
      console.error('List folders error:', err);
      return [];
    }
  };

  const checkOrCreateDirectory = async (accessToken: string) => {
    try {
      // Debug - list all folders first
      await listAllFolders(accessToken);

      const listResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=name%3D%27theContextResources%27%20and%20mimeType%3D%27application/vnd.google-apps.folder%27%20and%20trashed%3Dfalse&fields=files(id,name,trashed)',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (!listResponse.ok) {
        throw new Error(`API error: ${listResponse.status}`);
      }

      const listData = await listResponse.json();
      console.log('theContextResources folders:', listData.files);
      
      // Jeśli są duplikaty, usuń wszystkie oprócz pierwszego
      if (listData.files && listData.files.length > 1) {
        console.log('Found duplicates, removing...');
        for (let i = 1; i < listData.files.length; i++) {
          const deleteResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${listData.files[i].id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );
          console.log(`Deleted folder ${listData.files[i].id}: ${deleteResponse.ok}`);
        }
      }

      if (!listData.files || listData.files.length === 0) {
        console.log('No folder found, creating new one...');
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

        if (!createResponse.ok) {
          throw new Error(`Create folder error: ${createResponse.status}`);
        }

        const createData = await createResponse.json();
        console.log('Created new folder:', createData);
        setResourcesDirId(createData.id);
      } else {
        console.log('Using existing folder:', listData.files[0]);
        setResourcesDirId(listData.files[0].id);
      }

      // Debug - list all folders after operations
      await listAllFolders(accessToken);
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

  return { driveConnected, error, connectToDrive, resourcesDirId, allFolders };
}