// src/themes/goldsaver/widgets/ProfitChartWidget.tsx
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";

export default function ProfitChartWidget({ data = [] }: { data: any[] }) {
  const [timeRange, setTimeRange] = useState("month"); // 'week', 'month', 'year', 'all'
  const [showDetails, setShowDetails] = useState(false);

  // Filtrujemy i formatujemy dane na podstawie zakresu czasu
  const getFilteredData = () => {
    if (!data || data.length === 0) {
      return generateMockData();
    }

    // Filtrowanie danych w zależności od wybranego zakresu
    const now = new Date();
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.date);

      if (timeRange === "week") {
        // Ostatni tydzień
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
      } else if (timeRange === "month") {
        // Ostatni miesiąc
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return itemDate >= monthAgo;
      } else if (timeRange === "year") {
        // Ostatni rok
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return itemDate >= yearAgo;
      }

      // Wszystkie dane
      return true;
    });

    return filtered.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "short",
      }),
      // Dodajemy cumulative profit dla lepszej analizy trendu
      cumulativeProfit: item.profit,
    }));
  };

  // Funkcja generująca przykładowe dane, gdy faktyczne nie są dostępne
  const generateMockData = () => {
    const mockData = [];
    const now = new Date();
    let cumulativeProfit = 0;

    // Liczba dni do wygenerowania w zależności od zakresu
    let daysToGenerate = 30;
    if (timeRange === "week") daysToGenerate = 7;
    if (timeRange === "year") daysToGenerate = 365;
    if (timeRange === "all") daysToGenerate = 730;

    // Generujemy tylko odpowiednią liczbę dni
    const stepSize = Math.max(1, Math.floor(daysToGenerate / 30)); // Nie więcej niż 30 punktów na wykresie

    for (let i = daysToGenerate; i >= 0; i -= stepSize) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const formattedDate = date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "short",
      });

      // Generuje wartość która oscyluje wokół zera
      const randomProfit = Math.random() * 400 - 200;
      cumulativeProfit += randomProfit;

      mockData.push({
        date: formattedDate,
        profit: randomProfit,
        cumulativeProfit: cumulativeProfit,
      });
    }

    return mockData;
  };

  const chartData = getFilteredData();

  // Obliczanie statystyk
  const calculateStats = () => {
    if (!chartData || chartData.length === 0)
      return {
        totalProfit: 0,
        averageProfit: 0,
        maxProfit: 0,
        minProfit: 0,
        profitableCount: 0,
      };

    const profits = chartData.map((item) => item.profit);
    const totalProfit = profits.reduce((sum, val) => sum + val, 0);
    const averageProfit = totalProfit / profits.length;
    const maxProfit = Math.max(...profits);
    const minProfit = Math.min(...profits);
    const profitableCount = profits.filter((p) => p > 0).length;
    const profitablePercent = (profitableCount / profits.length) * 100;

    return {
      totalProfit,
      averageProfit,
      maxProfit,
      minProfit,
      profitableCount,
      profitablePercent,
      totalTransactions: profits.length,
    };
  };

  const stats:any = calculateStats();
  const isProfitable = stats.totalProfit >= 0;

  // Formatowanie liczb do wyświetlenia
  const formatNumber = (num: number) => {
    return num.toLocaleString("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Zysk/Strata (PLN)
          </h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-gray-600 hover:text-gray-900 flex items-center px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {showDetails ? "Ukryj szczegóły" : "Pokaż szczegóły"}
            </button>

            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { label: "T", value: "week", tooltip: "Tydzień" },
                { label: "M", value: "month", tooltip: "Miesiąc" },
                { label: "R", value: "year", tooltip: "Rok" },
                { label: "C", value: "all", tooltip: "Cały okres" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    timeRange === option.value
                      ? "bg-white text-yellow-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title={option.tooltip}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <div
            className={`p-2 rounded-full ${
              isProfitable ? "bg-green-100" : "bg-red-100"
            } mr-3`}
          >
            {isProfitable ? (
              <TrendingUp
                className={`w-5 h-5 ${
                  isProfitable ? "text-green-600" : "text-red-600"
                }`}
              />
            ) : (
              <TrendingDown
                className={`w-5 h-5 ${
                  isProfitable ? "text-green-600" : "text-red-600"
                }`}
              />
            )}
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${
                isProfitable ? "text-green-600" : "text-red-600"
              }`}
            >
              {isProfitable ? "+" : ""}
              {formatNumber(stats.totalProfit)} PLN
            </p>
            <p className="text-sm text-gray-500">
              Całkowity {isProfitable ? "zysk" : "strata"} w wybranym okresie
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-xs text-gray-500">Średni dzienny zysk</p>
              <p
                className={`text-base font-semibold ${
                  stats.averageProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.averageProfit >= 0 ? "+" : ""}
                {formatNumber(stats.averageProfit)} PLN
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-xs text-gray-500">Najwyższy dzienny zysk</p>
              <p className="text-base font-semibold text-green-600">
                +{formatNumber(stats.maxProfit)} PLN
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-xs text-gray-500">Najniższy dzienny zysk</p>
              <p className="text-base font-semibold text-red-600">
                {formatNumber(stats.minProfit)} PLN
              </p>
            </div>
          </div>
        )}

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)}`}
              />
              <CartesianGrid
                vertical={false}
                stroke="#E5E7EB"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={0}
                stroke="#9CA3AF"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const label =
                    name === "profit" ? "Zysk dzienny" : "Zysk skumulowany";
                  return [`${value.toLocaleString("pl-PL")} PLN`, label];
                }}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{
                  borderRadius: "0.375rem",
                  padding: "0.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  boxShadow:
                    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                  borderColor: "#E5E7EB",
                }}
              />
              {showDetails && (
                <Line
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="cumulativeProfit"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 1 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              )}
              <Line
                type="monotone"
                dataKey="profit"
                name="profit"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={{ r: 1 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Legend
                content={(props) => {
                  const { payload } = props;
                  return (
                    <div className="flex justify-center mt-3">
                      {payload?.map((entry, index) => {
                        const label =
                          entry.dataKey === "profit"
                            ? "Zysk dzienny"
                            : "Zysk skumulowany";
                        return (
                          <div
                            key={`item-${index}`}
                            className="flex items-center mx-3"
                          >
                            <div
                              className="w-3 h-3 mr-2"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs text-gray-600">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {showDetails && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <div className="p-1 bg-yellow-100 rounded-full mt-0.5 mr-3">
              <AlertTriangle className="w-4 h-4 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Informacja o ryzyku
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Dane historyczne nie gwarantują przyszłych wyników. Wartość
                inwestycji w złoto może zarówno rosnąć jak i spadać.
                {stats.profitablePercent > 0 && (
                  <>
                    {" "}
                    W analizowanym okresie {stats.profitablePercent.toFixed(1)}%
                    dni zakończyło się zyskiem.
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            <span>
              Dane za okres:{" "}
              {timeRange === "week"
                ? "ostatni tydzień"
                : timeRange === "month"
                ? "ostatni miesiąc"
                : timeRange === "year"
                ? "ostatni rok"
                : "cały okres"}
            </span>
            <span className="mx-2">•</span>
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <span>Liczba analizowanych dni: {stats.totalTransactions}</span>
          </div>
        </div>
      )}
    </div>
  );
}
