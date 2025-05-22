// src/themes/test/steps/TicketListStep.tsx
import { useEffect, useState } from "react";
import { WidgetContainer } from "@/engine/components/WidgetContainer";
import { useAppNavigation, useConfig } from "@/engine";
import { useDBData } from "@/engine/hooks/useDBData";
import { AppConfig } from "@/engine/types";

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  assignee?: string;
  reporter: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketListStepProps {
  attrs?: {
    title?: string;
    collection: string;
    widgets?: any[];
  };
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const statusColors = {
  new: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-200 text-gray-600",
};

export default function TicketListStep({ attrs }: TicketListStepProps) {
  const { config, navigateTo } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(`/src/configs/${config}/app.json`);
  const { getAllItems, deleteItem } = useDBData<Ticket>(attrs?.collection || "");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const items = await getAllItems();
      setTickets(items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to zgłoszenie?")) return;
    
    try {
      await deleteItem(id);
      await loadTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const handleEdit = (id: string) => {
    navigateTo(`tickets/edit/form/${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="text-center py-8">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {attrs?.title && <h1 className="text-3xl font-bold mb-6">{attrs.title}</h1>}
      
      {/* Action widgets */}
      {attrs?.widgets && (
        <div className="mb-6">
          <WidgetContainer
            widgets={attrs.widgets}
            templateDir={appConfig?.tplDir}
            layout="grid"
          />
        </div>
      )}

      {/* Tickets table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Brak zgłoszeń
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tytuł
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorytet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zgłaszający
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data utworzenia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ticket.status as keyof typeof statusColors]}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.reporter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(ticket.id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Usuń
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}