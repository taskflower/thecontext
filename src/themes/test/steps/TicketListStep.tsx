// src/themes/test/steps/TicketListStep.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { configDB } from "../../../db";

export default function TicketListStep({ attrs }: any) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
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
        await loadTickets();
      } catch (error) {
        console.error("Failed to delete ticket:", error);
        alert("Błąd podczas usuwania zgłoszenia");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <span className="text-sm font-medium text-zinc-600">Ładowanie zgłoszeń</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-zinc-900">{attrs.title}</h1>
        
        <div className="flex gap-2">
          {attrs.widgets?.map((widget: any, i: number) => (
            <button
              key={i}
              onClick={() => navigate(`/exampleTicketApp/${widget.attrs.navPath}`)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                widget.attrs.variant === "primary"
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {widget.title}
            </button>
          ))}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50/50 rounded-lg border border-zinc-200/60">
          <div className="text-zinc-400 text-lg mb-3">📝</div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">Brak zgłoszeń</h3>
          <p className="text-zinc-600 text-sm mb-6 max-w-sm mx-auto">
            Nie masz jeszcze żadnych zgłoszeń. Stwórz pierwsze zgłoszenie, aby rozpocząć.
          </p>
          <button
            onClick={() => navigate("/exampleTicketApp/tickets/create")}
            className="bg-zinc-900 text-white px-5 py-2.5 text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
          >
            Stwórz zgłoszenie
          </button>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200/60 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50/80 border-b border-zinc-200/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    Zgłoszenie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    Priorytet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    Kategoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    Zgłaszający
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 text-sm">
                        {ticket.title}
                      </div>
                      {ticket.description && (
                        <div className="text-xs text-zinc-500 truncate max-w-xs mt-1">
                          {ticket.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.priority === "urgent"
                            ? "bg-red-100 text-red-700"
                            : ticket.priority === "high"
                            ? "bg-orange-100 text-orange-700"
                            : ticket.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === "closed"
                            ? "bg-zinc-100 text-zinc-700"
                            : ticket.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : ticket.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
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
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {ticket.category === "bug"
                        ? "błąd"
                        : ticket.category === "feature"
                        ? "funkcja"
                        : ticket.category === "support"
                        ? "wsparcie"
                        : "pytanie"}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {ticket.reporter}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() =>
                            navigate(`/exampleTicketApp/tickets/edit/${ticket.id}`)
                          }
                          className="text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
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
        </div>
      )}
    </div>
  );
}