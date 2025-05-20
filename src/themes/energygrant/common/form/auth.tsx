// src/themes/energygrant/commons/form/AuthField.tsx
import React from 'react';
import { useAuthContext } from '@/auth/AuthContext';
import { BaseFieldProps } from '@/themes/default/commons/form/types';

const AuthField: React.FC<BaseFieldProps> = ({ name, formik, fieldId }) => {
  const { loading, signInWithGoogle, user } = useAuthContext();

  const handleAuth = async () => {
    try {
      await signInWithGoogle();
      if (user) {
        // Wypełniamy pola formularza danymi użytkownika
        formik.setFieldValue('email', user.email);
        const [firstName = '', lastName = ''] = (user.displayName || '').split(' ');
        formik.setFieldValue('firstName', firstName);
        formik.setFieldValue('lastName', lastName);
        formik.setFieldValue('tokens', user.availableTokens ?? 0);
        formik.setFieldValue('isLoggedIn', true);
        // Przechodzimy do następnego kroku
        formik.handleSubmit();
      }
    } catch (error) {
      console.error('Błąd logowania:', error);
    }
  };

  return (
    <div id={fieldId} className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleAuth}
        disabled={loading}
        className="w-full flex items-center justify-center py-3 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
      >
        {loading ? 'Logowanie...' : 'Zaloguj przez Google'}
      </button>
      {formik.touched[name] && formik.errors[name] && (
        <p className="text-red-500 text-xs">{String(formik.errors[name])}</p>
      )}
    </div>
  );
};

export default AuthField;
