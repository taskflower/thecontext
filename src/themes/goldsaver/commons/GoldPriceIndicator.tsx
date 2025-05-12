import React, { useState, useEffect } from "react";

interface GoldPriceProps {
  variant?: "compact" | "full";
}

interface GoldPriceData {
  price: number;
  change: number;
  lastPrice: number;
  date: string;
}

// Skeleton component to maintain consistent height during loading
const GoldPriceSkeleton: React.FC<{ variant: "compact" | "full" }> = ({ variant }) => {
  return (
    <div className={`${variant === "full" ? "px-6 py-4" : "p-3"} bg-yellow-50 border-b border-yellow-100`}>
      <div className="flex justify-between items-center">
        <div>
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className={`h-${variant === "full" ? "6" : "5"} w-28 bg-gray-200 rounded animate-pulse mb-2`}></div>
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export const GoldPriceIndicator: React.FC<GoldPriceProps> = ({ 
  variant = "full" 
}) => {
  const [goldData, setGoldData] = useState<GoldPriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        setLoading(true);
        
        // Pobieramy aktualną cenę złota
        const response = await fetch("https://api.nbp.pl/api/cenyzlota/", {
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status}`);
        }
        
        const currentData = await response.json();
        
        // Pobieramy poprzednią cenę złota (z wczoraj)
        // Używamy daty dzisiejszej pomniejszonej o 1 dzień, ale możemy też użyć /last/2/ aby pobrać 2 ostatnie notowania
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Format daty YYYY-MM-DD
        const yesterdayFormatted = yesterday.toISOString().split('T')[0];
        
        const previousResponse = await fetch(`https://api.nbp.pl/api/cenyzlota/${yesterdayFormatted}`, {
          headers: {
            "Accept": "application/json"
          }
        });
        
        // Jeśli nie ma danych z wczoraj (np. weekend), użyjemy danych sprzed 2 dni
        let previousData;
        if (!previousResponse.ok) {
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          const twoDaysAgoFormatted = twoDaysAgo.toISOString().split('T')[0];
          
          const response2 = await fetch(`https://api.nbp.pl/api/cenyzlota/${twoDaysAgoFormatted}`, {
            headers: {
              "Accept": "application/json"
            }
          });
          
          if (!response2.ok) {
            // Jeśli nadal brak danych, pobierzmy ostatnie 2 notowania
            const lastTwoResponse = await fetch("https://api.nbp.pl/api/cenyzlota/last/2/", {
              headers: {
                "Accept": "application/json"
              }
            });
            
            if (!lastTwoResponse.ok) {
              throw new Error("Nie można pobrać danych historycznych");
            }
            
            const lastTwoData = await lastTwoResponse.json();
            previousData = lastTwoData[1]; // Bierzemy przedostatni (starszy) element
          } else {
            previousData = await response2.json();
            previousData = previousData[0]; // API zwraca tablicę
          }
        } else {
          previousData = await previousResponse.json();
          previousData = previousData[0]; // API zwraca tablicę
        }
        
        // Obliczamy zmianę procentową
        const currentPrice = currentData[0].cena;
        const previousPrice = previousData.cena;
        const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
        
        setGoldData({
          price: currentPrice,
          lastPrice: previousPrice,
          change: parseFloat(changePercent.toFixed(2)),
          date: currentData[0].data
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching gold price:", err);
        setError("Nie można pobrać danych o cenie złota");
        setLoading(false);
      }
    };

    fetchGoldPrice();
    
    // Odświeżaj dane co godzinę (NBP aktualizuje dane raz dziennie, ale dla pewności)
    const interval = setInterval(fetchGoldPrice, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <GoldPriceSkeleton variant={variant} />;
  }

  if (error) {
    return (
      <div className={`${variant === "full" ? "px-6 py-4" : "p-3"} bg-yellow-50 border-b border-yellow-100`}>
        <div className="flex justify-between items-center">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${variant === "full" ? "px-6 py-4" : "p-3"} bg-yellow-50 border-b border-yellow-100`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">Cena złota (1g)</p>
          <p className={`${variant === "full" ? "text-lg" : "text-md"} font-bold text-yellow-700`}>
            {goldData?.price.toFixed(2)} PLN
          </p>
          <p className="text-xs text-gray-500">{goldData?.date}</p>
        </div>
        <div
          className={`text-sm font-medium ${
            goldData && goldData.change >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {goldData && goldData.change >= 0 ? "+" : ""}
          {goldData?.change}%
        </div>
      </div>
    </div>
  );
};