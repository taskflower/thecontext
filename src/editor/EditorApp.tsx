import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FirebaseAdapter } from "@/provideDB/firebase/FirebaseAdapter";
import { AppConfig } from "@/core/types";
import ConfigEditor from "./ConfigEditor";
import { Loading } from "@/components";

export const EditorApp: React.FC = () => {
  const { configId } = useParams<{ configId: string }>();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [cfg, setCfg] = useState<AppConfig | null>(null);
  const db = new FirebaseAdapter("application_configs");

  useEffect(() => {
    if (!configId) return setErr("Brak ID"), setLoading(false);
    db.retrieveData(configId)
      .then((r) => {
        if (!r?.payload) throw new Error("Nie znaleziono");
        setCfg(r.payload as AppConfig);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [configId]);

  if (loading) return <Loading message="Ładowanie..." />;
  if (err || !cfg) return <div className="p-4 text-red-600">{err}</div>;
  return configId ? (
    <ConfigEditor initialConfig={cfg} configId={configId} />
  ) : null;
};

export default EditorApp;
