// ------ src/themes/test/steps/LoginEmailStep.tsx ------
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAppNavigation } from "@/engine";
import { useMockAuth } from "../useMockAuth";


interface LoginEmailStepProps {
  attrs?: {
    title?: string;
    nextStep?: string;
  };
}

export default function LoginEmailStep({ attrs }: LoginEmailStepProps) {
  const { navigateTo } = useAppNavigation();
  const { setAuthStep, setTempEmail } = useMockAuth();
  const [loading, setLoading] = useState(false);

  const validate = (values: { email: string }) => {
    const errors: any = {};
    
    if (!values.email) {
      errors.email = "Email jest wymagany";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Nieprawidłowy format email";
    }
    
    return errors;
  };

  const handleSubmit = async (values: { email: string }, { setSubmitting }: any) => {
    try {
      setLoading(true);
      
      // Mock API call - sprawdzenie czy email istnieje
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Zapisz email w tymczasowym stanie
      setTempEmail(values.email);
      setAuthStep('profile');
      
      if (attrs?.nextStep) {
        navigateTo(attrs.nextStep);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white p-8 rounded-lg border shadow-sm">
        {attrs?.title && (
          <h1 className="text-2xl font-bold mb-6 text-center">{attrs.title}</h1>
        )}

        <Formik
          initialValues={{ email: "" }}
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres email
                </label>
                <Field
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="twoj@email.com"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Sprawdzanie..." : "Dalej"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}