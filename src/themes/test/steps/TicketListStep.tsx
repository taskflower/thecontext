// src/themes/test/steps/TicketListStep.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { configDB } from "../../../db";

export default function TicketListStep({ attrs }: any) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tickets from IndexedDB
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      // Load all records that start with "tickets:"
      const records = await configDB.records
        .where("id")
        .startsWith("tickets:")
        .toArray();
      const ticketList = records.map((record) => ({
        id: record.id?.replace("tickets:", "") ?? "",
        ...record.data,
      }));
      setTickets(ticketList);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (confirm("Czy na pewno chcesz usunąć to zgłoszenie?")) {
      try {
        await configDB.records.delete(`tickets:${ticketId}`);
        await loadTickets(); // Refresh list
      } catch (error) {
        console.error("Failed to delete ticket:", error);
        alert("Błąd podczas usuwania zgłoszenia");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-600">Ładowanie zgłoszeń...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{attrs.title}</h1>

        {/* Render widgets from config */}
        <div className="flex gap-2">
          {attrs.widgets?.map((widget: any, i: number) => (
            <button
              key={i}
              onClick={() => navigate(`/testApp/${widget.attrs.navPath}`)}
              className={`px-4 py-2 rounded font-medium ${
                widget.attrs.variant === "primary"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {widget.title}
            </button>
          ))}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-lg mb-4">📝 Brak zgłoszeń</div>
          <p className="text-gray-600 mb-6">
            Nie masz jeszcze żadnych zgłoszeń. Stwórz pierwsze!
          </p>
          <button
            onClick={() => navigate("/testApp/tickets/create")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Stwórz pierwsze zgłoszenie
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tytuł
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Priorytet
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Kategoria
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Zgłaszający
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {ticket.title}
                    </div>
                    {ticket.description && (
                      <div className="text-sm text-gray-600 truncate max-w-xs">
                        {ticket.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : ticket.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : ticket.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === "closed"
                          ? "bg-gray-100 text-gray-800"
                          : ticket.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : ticket.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {ticket.status === "in_progress"
                        ? "w trakcie"
                        : ticket.status === "resolved"
                        ? "rozwiązane"
                        : ticket.status === "closed"
                        ? "zamknięte"
                        : "nowe"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {ticket.category === "bug"
                      ? "błąd"
                      : ticket.category === "feature"
                      ? "funkcja"
                      : ticket.category === "support"
                      ? "wsparcie"
                      : "pytanie"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {ticket.reporter}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {/* POPRAWKA: Zmieniona ścieżka nawigacji do edycji */}
                      <button
                        onClick={() =>
                          navigate(`/testApp/tickets/edit/${ticket.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
