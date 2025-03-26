// src/components/PaymentDialog.tsx
import React, { useState } from "react";
import { Coins, CreditCard, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PackageOption {
  tokens: number;
  price: number;
  label: string;
}

export const PaymentDialog: React.FC = () => {
  const { availableTokens, processPayment, setShowPaymentDialog } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Token package options
  const packages: PackageOption[] = [
    { tokens: 10000, price: 10, label: "Basic" },
    { tokens: 40000, price: 35, label: "Standard" },
    { tokens: 100000, price: 75, label: "Professional" },
  ];

  const handlePurchase = async () => {
    if (!selectedPackage) {
      setMessage({ type: 'error', text: 'Wybierz pakiet tokenów' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      // Uruchom proces płatności - spowoduje przekierowanie do Stripe
      const result = await processPayment(selectedPackage.tokens);
      
      if (!result) {
        // Jeśli processPayment zwróci false, wyświetl błąd
        setMessage({
          type: 'error',
          text: 'Nie udało się rozpocząć procesu płatności. Spróbuj ponownie później.'
        });
        setIsProcessing(false);
        return;
      }
      
      // Przekieruj do strony płatności Stripe jeśli URL jest dostępny
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setMessage({
          type: 'error',
          text: 'Brak URL do systemu płatności. Skontaktuj się z administratorem.'
        });
        setIsProcessing(false);
      }
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd'
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button 
          onClick={() => setShowPaymentDialog(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex p-3 rounded-full bg-muted mb-4">
            <Coins className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Kup tokeny</h2>
          <p className="text-muted-foreground text-sm">
            Aktualnie masz <span className="font-medium text-foreground">{availableTokens}</span> tokenów.
          </p>
        </div>

        <div className="grid gap-4 mb-6">
          {packages.map((pkg) => (
            <button
              key={pkg.tokens}
              onClick={() => setSelectedPackage(pkg)}
              className={`p-4 border rounded-md flex justify-between items-center transition-colors ${
                selectedPackage?.tokens === pkg.tokens 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div>
                <div className="font-medium">{pkg.label}</div>
                <div className="text-muted-foreground text-sm">{pkg.tokens.toLocaleString()} tokenów</div>
              </div>
              <div className="text-right font-medium">${pkg.price}</div>
            </button>
          ))}
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <button
          onClick={handlePurchase}
          disabled={!selectedPackage || isProcessing}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>Przetwarzanie...</>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Kup teraz
            </>
          )}
        </button>
      </div>
    </div>
  );
};