// src/themes/default/widgets/UserProfileSummaryWidget.tsx
import { User, Mail, ArrowRight } from 'lucide-react';

type UserProfileSummaryWidgetProps = {
  fullName?: string;
  email?: string;
};

export default function UserProfileSummaryWidget({ 
  fullName = '', 
  email = ''
}: UserProfileSummaryWidgetProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="ml-5 flex-1">
            <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
            
            <div className="mt-2 flex items-center text-gray-500">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <span>{email}</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <a href="/profile" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
                Edytuj profil <ArrowRight className="ml-1 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}