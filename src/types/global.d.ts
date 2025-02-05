// src/types/global.d.ts
declare let gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (config: {
        apiKey: string;
        discoveryDocs: string[];
      }) => Promise<void>;
      setToken: (token: { access_token: string }) => void;
      drive: {
        files: {
          list: (params: {
            pageSize: number;
            fields: string;
          }) => Promise<{
            result: {
              files: Array<{
                id: string;
                name: string;
              }>;
            };
          }>;
        };
      };
    };
  };