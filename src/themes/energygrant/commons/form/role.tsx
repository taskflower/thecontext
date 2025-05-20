// src/themes/energygrant/commons/form/RoleSelectField.tsx
import React, { useState, useEffect } from 'react'
import { I } from '@/components'
import { BaseFieldProps } from '@/themes/default/commons/form/types'

interface RoleOption {
  id: string
  name: string
  description: string
  icon: string
  features: string[]
}

const roles: RoleOption[] = [
  {
    id: 'beneficiary',
    name: 'Beneficjent',
    description: 'Właściciel domu, który ubiega się o dotację energetyczną',
    icon: 'house', // Zmieniono z 'home' na 'house'
    features: [
      'Kontakt z operatorem',
      'Kalkulator zdolności do dotacji',
      'Zlecanie audytów energetycznych',
      'Zlecanie prac wykonawczych',
      'Zarządzanie zleceniami',
    ],
  },
  {
    id: 'contractor',
    name: 'Wykonawca',
    description: 'Firma wykonująca prace termomodernizacyjne i energetyczne',
    icon: 'wrench', // Zmieniono z 'tool' na 'wrench'
    features: [
      'Dostęp do giełdy zleceń',
      'Składanie ofert na zlecenia',
      'Zarządzanie portfolio',
      'Kontakt z beneficjentami',
    ],
  },
  {
    id: 'auditor',
    name: 'Audytor',
    description: 'Specjalista wykonujący audyty energetyczne',
    icon: 'square-check-big',
    features: [
      'Dostęp do zleceń audytów',
      'Składanie ofert na audyty',
      'Zarządzanie portfolio',
      'Kontakt z beneficjentami',
    ],
  },
  {
    id: 'operator',
    name: 'Operator',
    description: 'Administrator programu dotacji energetycznych',
    icon: 'settings',
    features: [
      'Weryfikacja wniosków',
      'Moderacja zleceń',
      'Wsparcie beneficjentów',
      'Chat z uczestnikami programu',
    ],
  },
]


const RoleSelectField: React.FC<BaseFieldProps> = ({ name, formik, fieldId }) => {
  const selected: string = formik.values[name] || ''
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (selected && !expanded) setExpanded(selected)
  }, [selected, expanded])

  const onSelect = (id: string) => {
    formik.setFieldValue(name, id)
    formik.setFieldTouched(name, true)
    setExpanded(id)
  }

  const onHeaderClick = (id: string, isExp: boolean) => {
    const next = isExp ? null : id
    setExpanded(next)
    if (next) onSelect(id)
  }

  return (
    <div id={fieldId} className="grid grid-cols-1 gap-4">
      {roles.map(role => {
        const isSel = selected === role.id
        const isExp = expanded === role.id
        const border = isSel ? 'border-green-500' : 'border-gray-200'
        const bgHead = isExp ? 'bg-green-50 rounded-t-lg' : 'bg-white'

        return (
          <div 
            key={role.id} 
            className={`border ${border} rounded-lg transition-shadow ${isExp ? 'shadow-md' : 'shadow-sm'}`}
          >
            <div
              className={`flex items-center p-4 cursor-pointer ${bgHead}`}
              onClick={() => onHeaderClick(role.id, isExp)}
            >
              <I 
                name={role.icon} 
                className="w-5 h-5 text-green-600 mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-800">{role.name}</div>
                <div className="text-xs text-gray-500 mt-1">{role.description}</div>
              </div>
              <div className="flex items-center">
                <I 
                  name={isExp ? 'chevron-up' : 'chevron-down'} 
                  className="w-4 h-4 mr-3 text-gray-400" 
                />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onSelect(role.id) }}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isSel ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSel ? 'Wybrano' : 'Wybierz'}
                </button>
              </div>
            </div>
            {isExp && (
              <div className="px-6 py-3 bg-green-50 rounded-b-lg border-t border-green-100 text-xs text-gray-600">
                <strong className="block mb-2 text-sm text-gray-700">Funkcje:</strong>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {role.features.map((f, i) => (
                    <li key={i} className="flex items-center">
                      <I name="check" className="w-3.5 h-3.5 text-green-600 mr-2" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
      {formik.touched[name] && formik.errors[name] && (
        <p className="text-red-500 text-xs mt-1">{String(formik.errors[name])}</p>
      )}
    </div>
  )
}

export default RoleSelectField