// Role definitions
type Role = {
    id: string;
    name: string;
    description: string;
    icon: string;
    features: string[];
    color: string;
  };
  
export const roles: Role[] = [
    {
      id: "beneficiary",
      name: "Beneficjent",
      description: "Właściciel domu, który ubiega się o dotację energetyczną",
      icon: "house",
      features: [
        "Kontakt z operatorem",
        "Kalkulator zdolności do dotacji",
        "Zlecanie audytów energetycznych",
        "Zlecanie prac wykonawczych",
        "Zarządzanie zleceniami",
      ],
      color: "blue",
    },
    {
      id: "contractor",
      name: "Wykonawca",
      description: "Firma wykonująca prace termomodernizacyjne i energetyczne",
      icon: "wrench",
      features: [
        "Dostęp do giełdy zleceń",
        "Składanie ofert na zlecenia",
        "Zarządzanie portfolio",
        "Kontakt z beneficjentami",
      ],
      color: "orange",
    },
    {
      id: "auditor",
      name: "Audytor",
      description: "Specjalista wykonujący audyty energetyczne",
      icon: "square-check-big",
      features: [
        "Dostęp do zleceń audytów",
        "Składanie ofert na audyty",
        "Zarządzanie portfolio",
        "Kontakt z beneficjentami",
      ],
      color: "indigo",
    },
    {
      id: "operator",
      name: "Operator",
      description: "Administrator programu dotacji energetycznych",
      icon: "settings",
      features: [
        "Weryfikacja wniosków",
        "Moderacja zleceń",
        "Wsparcie beneficjentów",
        "Chat z uczestnikami programu",
      ],
      color: "green",
    },
  ];
