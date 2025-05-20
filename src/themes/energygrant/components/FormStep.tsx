// src/themes/energygrant/components/FormStep.tsx
import React from 'react'
// ścieżka względna w stosunku do tego pliku:
import DefaultFormStep from '@/themes/default/components/FormStep'
import RoleSelectField from '@/themes/energygrant/common/form/RoleSelectField'
import AuthField from '../common/form/AuthField'



type DefaultFormStepProps = React.ComponentProps<typeof DefaultFormStep>

export default function FormStep(props: DefaultFormStepProps) {
  const { customFields = {}, ...rest } = props

  return (
    <DefaultFormStep
      {...rest}
      customFields={{
        ...customFields,
        // pole "auth" do logowania
        auth: AuthField,
        // pole "role" do wyboru roli
        role: RoleSelectField,
      }}
    />
  )
}
