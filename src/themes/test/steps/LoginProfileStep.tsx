// ------ src/themes/test/steps/LoginProfileStep.tsx ------
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAppNavigation } from "@/engine";
import { useDBData } from "@/engine/hooks/useDBData";
import { useMockAuth } from "../useMockAuth";

interface LoginProfileStepProps {
  attrs?: {
    title?: string;
    onSuccess?: string;
  };
}

export default function LoginProfileStep({ attrs }: LoginProfileStepProps) {
  const { navigateTo } = useAppNavigation();
  const { tempEmail, login, setAuthStep } = useMockAuth();
  const { addItem } = useDBData("users");
  const [loading, setLoading] = useState(false);

  // Jeśli nie ma email z poprzedniego kroku, przekieruj
  if (!tempEmail) {
    navigateTo("users/login-email");
    return null;
  }

  const validate = (values: { firstName: string; lastName: string }) => {
    const errors: any = {};
    
    if (!values.firstName) {
      errors.firstName = "Imię jest wymagane";
    }
    
    if (!values.lastName) {
      errors.lastName = "Nazwisko jest wymagane";
    }
    
    return errors;
  };

  const handleSubmit = async (values: { firstName: string; lastName: string }, { setSubmitting }: any) => {
    try {
      setLoading(true);
      
      // Utworz użytkownika w bazie
      const userId = `user_${Date.now()}`;
      const userData = {
        id: userId,
        email: tempEmail,
        role: "user",
        firstName: values.firstName,
        lastName: values.lastName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addItem(userData);
      
      // Zaloguj użytkownika
      login(userData);
      
      // Przekieruj do głównej aplikacji
      if (attrs?.onSuccess) {
        navigateTo(attrs.onSuccess);
      }
    } catch (error) {
      console.error("Profile creation error:", error);
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

        <div className="mb-4 text-sm text-gray-600 text-center">
          Email: <strong>{tempEmail}</strong>
        </div>

        <Formik
          initialValues={{ firstName: "", lastName: "" }}
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imię *
                </label>
                <Field
                  type="text"
                  name="firstName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage
                  name="firstName"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwisko *
                </label>
                <Field
                  type="text"
                  name="lastName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage
                  name="lastName"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('email');
                    navigateTo("users/login-email");
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Wstecz
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Tworzenie..." : "Zaloguj się"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}