// src/components/UsageInfo.tsx
import React from 'react';

const UsageInfo = () => {
  return (
    <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h2 className="font-bold mb-2 text-blue-800">Jak korzystać z kreatora:</h2>
      <ol className="list-decimal pl-5 space-y-1 text-sm">
        <li>Dodaj węzły (prompty) z treścią pytań/instrukcji.</li>
        <li>Połącz węzły, aby utworzyć sekwencję kroków.</li>
        <li>
          W treści promptu możesz używać zmiennych{' '}
          <code className="bg-blue-100 px-1 rounded">{'{{nodeId.response}}'}</code>, aby odwołać się do wcześniejszych odpowiedzi.
        </li>
        <li>Uruchom cały graf lub pojedynczy węzeł, aby rozpocząć interakcję.</li>
        <li>W każdym kroku wprowadź odpowiedź, która zostanie zapisana i może być użyta w kolejnych krokach.</li>
      </ol>
    </div>
  );
};

export default UsageInfo;
