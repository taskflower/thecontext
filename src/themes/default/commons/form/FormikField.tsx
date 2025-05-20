// src/themes/default/commons/form/FormikField.tsx - bez map, w pełni dynamiczne
import React, { lazy, Suspense } from 'react';
import { FormikProps } from 'formik';
import { FieldSchema } from './types';
import Loader from '../Loader';

interface FormikFieldProps {
  name: string;
  formik: FormikProps<any>;
  fieldSchema: FieldSchema;
  nodeSlug?: string;
  customFields?: Record<string, React.ComponentType<any>>;
}

const FormikField: React.FC<FormikFieldProps> = ({
  name,
  formik,
  fieldSchema,
  nodeSlug,
  customFields = {},
}) => {
  const { 
    title, 
    required, 
    description, 
    fieldType,
    help
  } = fieldSchema;
  
  const error = formik.touched[name] && formik.errors[name];
  const fieldId = `field-${nodeSlug}-${name}`;
  
  // Komponent pola z customFields lub dynamicznie ładowany
  let FieldComponent;
  
  // Najpierw sprawdź czy istnieje w przekazanych customFields
  if (customFields[fieldType]) {
    FieldComponent = customFields[fieldType];
  } else {
    // Próba dynamicznego załadowania komponentu na podstawie nazwy
    try {
      // Konwencja: nazwa typu pola + "Field", np. "text" -> "TextField"
      const componentName = fieldType.charAt(0).toUpperCase() + fieldType.slice(1) + 'Field';
      
      // Dynamiczny import komponentu - próbujemy różne ścieżki
      FieldComponent = lazy(() => 
        import(`./fields/${componentName}`)
          .catch(() => import(`./fields/${fieldType}`))
          .catch(() => import(`../fields/${componentName}`))
          .catch(() => import(`../fields/${fieldType}`))
          .catch(() => import(`@/themes/default/commons/form/fields/${componentName}`))
          .catch(() => import(`@/themes/default/commons/form/fields/${fieldType}`))
          .catch(() => {
            console.warn(`Nie znaleziono komponentu pola dla typu: ${fieldType}`);
            // Fallback do prostego komponentu input jako ostateczność
            return {
              default: (props: any) => (
                <div className="relative w-full border rounded border-gray-200 px-3 py-2">
                  <input
                    type="text"
                    id={props.fieldId}
                    name={props.name}
                    value={props.formik.values[props.name] || ""}
                    onChange={props.formik.handleChange}
                    onBlur={props.formik.handleBlur}
                    className="w-full bg-transparent text-sm focus:outline-none"
                    placeholder={props.fieldSchema.placeholder}
                  />
                </div>
              )
            };
          })
      );
    } catch (e) {
      // Fallback do komponentu tekstowego w przypadku błędu
      console.error(`Błąd ładowania komponentu dla typu: ${fieldType}`, e);
      FieldComponent = (props: any) => (
        <div className="relative w-full border rounded border-gray-200 px-3 py-2">
          <input
            type="text"
            id={props.fieldId}
            name={props.name}
            value={props.formik.values[props.name] || ""}
            onChange={props.formik.handleChange}
            onBlur={props.formik.handleBlur}
            className="w-full bg-transparent text-sm focus:outline-none"
            placeholder={props.fieldSchema.placeholder}
          />
        </div>
      );
    }
  }
  
  return (
    <div className="my-4 space-y-2">
      <label htmlFor={fieldId} className="text-sm font-semibold text-gray-900">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      
      {description && <p className="text-sm text-gray-500">{description}</p>}
      
      <Suspense fallback={<Loader />}>
        <FieldComponent
          name={name}
          formik={formik}
          fieldSchema={fieldSchema}
          fieldId={fieldId}
        />
      </Suspense>
      
      {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
      
      {error && <p className="text-red-500 text-xs mt-1">{String(error)}</p>}
    </div>
  );
};

export default FormikField;