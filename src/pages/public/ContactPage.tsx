import ProcessCommunicator from "@/components/public/MockProcesCommunicator";

// src/pages/ContactPage.tsx
export default function ContactPage() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold pb-6">SERVICES</h1>

      <ProcessCommunicator />
    </div>
  );
}
