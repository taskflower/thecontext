// src/components/payment/PaymentSuccessPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUserData, getToken, setSuppressPaymentDialog } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'pending' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [tokenAmount, setTokenAmount] = useState<number | null>(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Suppress payment dialog on mount and restore on unmount
  useEffect(() => {
    setSuppressPaymentDialog(true);
    
    return () => {
      setSuppressPaymentDialog(false);
    };
  }, [setSuppressPaymentDialog]);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setVerificationStatus('error');
          setErrorMessage('Brak identyfikatora sesji płatności');
          return;
        }

        // Get auth token
        const authToken = await getToken();
        if (!authToken) {
          setVerificationStatus('error');
          setErrorMessage('Problem z autoryzacją. Spróbuj zalogować się ponownie.');
          return;
        }

        // Verify payment with backend
        const response = await fetch(
          `${API_URL}/api/v1/stripe/verify-session/${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        const { status, tokenAmount: tokens, message } = responseData.data;
        
        if (status === 'completed') {
          // Payment successfully processed
          setTokenAmount(tokens);
          
          // Refresh user data to get updated token count
          await refreshUserData();
          
          setVerificationStatus('success');
        } else if (status === 'pending' && retryCount < 5) {
          // Payment still processing, retry after delay
          setVerificationStatus('pending');
          
          // Retry after 2 seconds (increase for each retry)
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setIsVerifying(true);
          }, 2000 * (retryCount + 1));
        } else if (status === 'error' || retryCount >= 5) {
          // Error or too many retries
          setVerificationStatus('error');
          setErrorMessage(message || 'Problem z weryfikacją płatności');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Nieznany błąd weryfikacji płatności');
      } finally {
        setIsVerifying(false);
      }
    };

    if (isVerifying) {
      verifyPayment();
    }
  }, [searchParams, refreshUserData, getToken, retryCount, isVerifying, API_URL]);

  const handleManualRetry = () => {
    setIsVerifying(true);
  };

  const handleReturnToApp = () => {
    navigate('/dashboard'); // Zmień na odpowiednią ścieżkę w Twojej aplikacji
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
        {isVerifying ? (
          <div className="py-8">
            <div className="animate-pulse mb-4">
              <div className="h-12 w-12 bg-primary/20 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Weryfikacja płatności</h2>
            <p className="text-gray-500">Proszę czekać, weryfikujemy Twoją płatność...</p>
            {retryCount > 0 && (
              <p className="text-gray-400 text-sm mt-2">Próba {retryCount} z 5</p>
            )}
          </div>
        ) : verificationStatus === 'success' ? (
          <div className="py-8">
            <div className="text-green-500 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Płatność zakończona pomyślnie!</h2>
            <p className="text-gray-600 mb-2">
              Dziękujemy za zakup. Tokeny zostały dodane do Twojego konta.
            </p>
            {tokenAmount && (
              <p className="text-green-600 font-medium mb-6">
                Dodano {tokenAmount.toLocaleString()} tokenów
              </p>
            )}
            <button
              onClick={handleReturnToApp}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do aplikacji
            </button>
          </div>
        ) : verificationStatus === 'pending' ? (
          <div className="py-8">
            <div className="text-amber-500 mb-4">
              <RefreshCw className="h-16 w-16 mx-auto animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Płatność w trakcie przetwarzania</h2>
            <p className="text-gray-600 mb-6">
              Twoja płatność jest wciąż przetwarzana. To może potrwać chwilę.
            </p>
            <button
              onClick={handleManualRetry}
              className="inline-flex items-center px-4 py-2 mr-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sprawdź ponownie
            </button>
            <button
              onClick={handleReturnToApp}
              className="inline-flex items-center px-4 py-2 mt-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do aplikacji
            </button>
          </div>
        ) : (
          <div className="py-8">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Wystąpił problem z płatnością</h2>
            {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
            <p className="text-gray-600 mb-6">
              Prosimy o kontakt z obsługą klienta lub spróbowanie ponownie później.
            </p>
            <button
              onClick={handleManualRetry}
              className="inline-flex items-center px-4 py-2 mr-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Spróbuj ponownie
            </button>
            <button
              onClick={handleReturnToApp}
              className="inline-flex items-center px-4 py-2 mt-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do aplikacji
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;