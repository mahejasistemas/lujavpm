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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    origen: "",
    cargaDescarga: "Carga",
    rabon: "",
    sencillo: "",
    sencilloSobrepeso: "",
    full: "",
    fullSobrepeso: ""
  });
  const [saving, setSaving] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from('tarifas').insert([{
        origen: formData.origen,
        carga_descarga: formData.cargaDescarga,
        rabon: formData.rabon,
        sencillo: formData.sencillo,
        sencillo_sobrepeso: formData.sencilloSobrepeso,
        precio_full: formData.full,
        full_sobrepeso: formData.fullSobrepeso
      }]);

      if (error) throw error;

      // Reset form and close modal
      setFormData({
        origen: "",
        cargaDescarga: "Carga",
        rabon: "",
        sencillo: "",
        sencilloSobrepeso: "",
        full: "",
        fullSobrepeso: ""
      });
      setIsModalOpen(false);
      
      // Refresh data
      fetchTarifas();
      
    } catch (error) {
      console.error('Error saving tarifa:', error);
      alert('Error al guardar la tarifa');
    } finally {
      setSaving(false);
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
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[#B80000]">Tarifario</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#B80000] text-white px-4 py-2 rounded-md hover:bg-[#8B0000] transition-colors text-sm font-medium"
          >
            + Agregar Tarifa
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="base-filter" className="font-medium text-gray-700">
            Filtrar por Base:
          </label>
          <select
            id="base-filter"
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#B80000] focus:border-transparent"
          >
            {bases.map((base) => (
              <option key={base} value={base}>
                {base}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tarifario-table min-w-full">
            <thead>
              <tr>
                <th>ORIGEN</th>
                <th>CARGA / DESCARGA</th>
                <th>RABON</th>
                <th>SENCILLO</th>
                <th>SENCILLO SOBREPESO</th>
                <th>FULL</th>
                <th>FULL SOBREPESO</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B80000]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTarifas.length > 0 ? (
                filteredTarifas.map((row, idx) => (
                  <tr key={`${row.origen}-${idx}`}>
                    <td>{row.origen}</td>
                    <td>{row.cargaDescarga}</td>
                    <td>{row.rabon}</td>
                    <td>{row.sencillo}</td>
                    <td>{row.sencilloSobrepeso}</td>
                    <td>{row.full}</td>
                    <td>{row.fullSobrepeso}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No se encontraron resultados para la base seleccionada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Nueva Tarifa</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                    <input
                      type="text"
                      name="origen"
                      required
                      value={formData.origen}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B80000]"
                      placeholder="Ej. Veracruz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carga / Descarga</label>
                    <select
                      name="cargaDescarga"
                      value={formData.cargaDescarga}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B80000]"
                    >
                      <option value="Carga">Carga</option>
                      <option value="Descarga">Descarga</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rabon</label>
                    <input
                      type="text"
                      name="rabon"
                      required
                      value={formData.rabon}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B80000]"
                      placeholder="Ej. $1,200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sencillo</label>
                    <input
                      type="text"
                      name="sencillo"
                      required
                      value={formData.sencillo}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B80000]"
                      placeholder="Ej. $1,800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sencillo Sobrepeso</label>
                    <input
                      type="text"
                      name="sencilloSobrepeso"
                      required
                      value={formData.sencilloSobrepeso}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B80000]"
                      placeholder="Ej. $2,100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full</label>
                    <input
                      type="text"
                      name="full"
                      required
                      value={formData.full}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B80000]"
                      placeholder="Ej. $2,600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Sobrepeso</label>
                    <input
                      type="text"
                      name="fullSobrepeso"
                      required
                      value={formData.fullSobrepeso}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B80000]"
                      placeholder="Ej. $3,000"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-[#B80000] text-white rounded-md hover:bg-[#8B0000] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar Tarifa"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
