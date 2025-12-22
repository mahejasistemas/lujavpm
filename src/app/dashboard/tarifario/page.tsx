"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import "./page.css";

type TarifaRow = {
  id?: number;
  origen: string;
  cargaDescarga: string;
  rabon: string;
  sencillo: string;
  sencilloSobrepeso: string;
  full: string;
  fullSobrepeso: string;
};

export default function TarifarioPage() {
  const [tarifas, setTarifas] = useState<TarifaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBase, setSelectedBase] = useState<string>("Todas");

  useEffect(() => {
    fetchTarifas();
  }, []);

  const fetchTarifas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tarifas')
        .select('*')
        .order('origen', { ascending: true });

      if (error) {
        console.error('Error fetching tarifas:', error);
        return;
      }

      if (data) {
        const formattedData: TarifaRow[] = data.map((item: any) => ({
          id: item.id,
          origen: item.origen,
          cargaDescarga: item.carga_descarga, // Mapeo de snake_case a camelCase
          rabon: item.rabon,
          sencillo: item.sencillo,
          sencilloSobrepeso: item.sencillo_sobrepeso,
          full: item.precio_full,
          fullSobrepeso: item.full_sobrepeso
        }));
        setTarifas(formattedData);
      }
    } catch (error) {
      console.error('Error interno:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener lista única de bases (origenes)
  const bases = useMemo(() => {
    const uniqueBases = Array.from(new Set(tarifas.map((t) => t.origen)));
    return ["Todas", ...uniqueBases];
  }, [tarifas]);

  // Filtrar tarifas basado en la selección
  const filteredTarifas = useMemo(() => {
    if (selectedBase === "Todas") return tarifas;
    return tarifas.filter((t) => t.origen === selectedBase);
  }, [selectedBase, tarifas]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#B80000]">Tarifario</h1>
          <p className="text-gray-500 mt-1">Consulta las tarifas vigentes por origen y tipo de unidad</p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <label htmlFor="base-filter" className="font-medium text-gray-700 text-sm uppercase tracking-wide">
            Filtrar por Base:
          </label>
          <select
            id="base-filter"
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-md focus:ring-[#B80000] focus:border-[#B80000] block w-48 p-2"
          >
            {bases.map((base) => (
              <option key={base} value={base}>
                {base}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <div className="overflow-auto h-full">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider text-[#B80000]">
                  ORIGEN
                </th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">
                  CARGA / DESCARGA
                </th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">
                  RABON
                </th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">
                  SENCILLO
                </th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">
                  SENCILLO SOBREPESO
                </th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">
                  FULL
                </th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">
                  FULL SOBREPESO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col justify-center items-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B80000]"></div>
                      <span className="text-gray-400">Cargando tarifas...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTarifas.length > 0 ? (
                filteredTarifas.map((row, idx) => (
                  <tr 
                    key={`${row.origen}-${idx}`}
                    className="hover:bg-red-50/30 transition-colors duration-150"
                  >
                    <th scope="row" className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      {row.origen}
                    </th>
                    <td className="px-6 py-4 font-medium">
                      {row.cargaDescarga}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {row.rabon}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {row.sencillo}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {row.sencilloSobrepeso}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {row.full}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {row.fullSobrepeso}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 bg-gray-50">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg font-medium">No se encontraron resultados</span>
                      <span className="text-sm">Intenta seleccionar otra base o verifica los datos.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
