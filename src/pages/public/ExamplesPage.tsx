import { AppLink } from "@/components/common";
import ProcessCommunicator from "@/components/public/MockProcesCommunicator";
import { Button } from "@/components/ui";
import { useAdminNavigate } from "@/hooks";
import { Trans } from "@lingui/macro";

// src/pages/ContactPage.tsx
export default function ExamplesPage() {
  const adminNavigate = useAdminNavigate();
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold pb-6">Process communicator</h1>
        <div className="flex gap-6 items-center">
          <AppLink forcePublic to="/examples2" className="text-sm">
            ExpPath
          </AppLink>
          <Button
            size="sm"
            variant="outline"
            onClick={() => adminNavigate("/documents/manager")}
          >
            <Trans>Experimental manager</Trans>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => adminNavigate("/documents/ragnarok")}
          >
            <Trans>Experimental tasks</Trans>
          </Button>
        </div>
      </div>

      <ProcessCommunicator />
    </div>
  );
}
