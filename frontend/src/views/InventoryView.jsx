import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { AlertTriangle, Plus, RefreshCw, ShieldAlert, CheckCircle2, Sliders } from 'lucide-react';

export default function InventoryView({ userRole }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [replenishQty, setReplenishQty] = useState('');
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [editingThresholdItem, setEditingThresholdItem] = useState({
    id: null,
    materialName: '',
    lowStockThreshold: 0,
    quantity: 0,
    unit: ''
  });

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await api.inventory.list();
      setInventory(data);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleReplenish = async (e) => {
    e.preventDefault();
    if (!selectedItem || !replenishQty) return;

    try {
      await api.inventory.addStock(selectedItem.id, parseInt(replenishQty));
      setSelectedItem(null);
      setReplenishQty('');
      loadInventory();
    } catch (error) {
      alert("Failed to update stock: " + error.message);
    }
  };

  const handleThresholdUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.inventory.updateThreshold(editingThresholdItem.id, editingThresholdItem);
      setIsThresholdModalOpen(false);
      loadInventory();
    } catch (error) {
      alert("Failed to update threshold: " + error.message);
    }
  };

  const openThresholdModal = (item) => {
    setEditingThresholdItem({ ...item });
    setIsThresholdModalOpen(true);
  };

  // RBAC checks
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Stock Levels</h1>
          <p className="text-sm text-slate-500">Track and replenish clinic consumables and material alerts.</p>
        </div>
        <button
          onClick={loadInventory}
          className="p-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Low Stock Alerts Banner */}
      {inventory.some(item => item.quantity < item.lowStockThreshold) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 text-red-800">
          <ShieldAlert className="w-5 h-5 mt-0.5 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Critical Material Depletions</h4>
            <p className="text-xs mt-1 text-red-700">
              One or more clinical consumable levels are currently below their recommended backup reserve threshold. Please replenish these immediately to prevent procedure delays.
            </p>
          </div>
        </div>
      )}

      {/* Main Stock Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase bg-slate-50/50">
                <th className="px-6 py-3.5">Material Name</th>
                <th className="px-6 py-3.5">Stock Level</th>
                <th className="px-6 py-3.5">Reserve Threshold</th>
                <th className="px-6 py-3.5">Status</th>
                {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {inventory.map((item) => {
                const isLow = item.quantity < item.lowStockThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">{item.materialName}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700 text-base">{item.quantity}</span>
                      <span className="text-xs text-slate-400 ml-1">({item.unit})</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span>{item.lowStockThreshold}</span>
                      <span className="text-xs ml-1">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <span className="inline-flex items-center space-x-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Low Stock Alert</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Optimal</span>
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center space-x-1 text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition text-xs font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Replenish</span>
                        </button>
                        <button
                          onClick={() => openThresholdModal(item)}
                          className="inline-flex items-center space-x-1 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition text-xs font-semibold border border-slate-200"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Configure</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Replenish Stock Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="bg-primary-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Replenish Material</h3>
              <button onClick={() => setSelectedItem(null)} className="text-white/80 hover:text-white text-2xl font-semibold">&times;</button>
            </div>
            <form onSubmit={handleReplenish} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500">Add stock volume for clinical material:</p>
                <p className="font-bold text-slate-800 mt-1 text-base">{selectedItem.materialName}</p>
                <p className="text-xs text-slate-400 mt-0.5">Current Stock: {selectedItem.quantity} {selectedItem.unit}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Add Quantity ({selectedItem.unit})</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Enter volume to add"
                  value={replenishQty}
                  onChange={(e) => setReplenishQty(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg transition text-sm font-semibold shadow-md"
                >
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Threshold Modal */}
      {isThresholdModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Configure Material Details</h3>
              <button onClick={() => setIsThresholdModalOpen(false)} className="text-white/80 hover:text-white text-2xl font-semibold">&times;</button>
            </div>
            <form onSubmit={handleThresholdUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Material Name</label>
                <input
                  type="text"
                  required
                  value={editingThresholdItem.materialName}
                  onChange={(e) => setEditingThresholdItem({ ...editingThresholdItem, materialName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={editingThresholdItem.quantity}
                    onChange={(e) => setEditingThresholdItem({ ...editingThresholdItem, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={editingThresholdItem.unit}
                    onChange={(e) => setEditingThresholdItem({ ...editingThresholdItem, unit: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Low-Stock Alert Threshold</label>
                <input
                  type="number"
                  required
                  value={editingThresholdItem.lowStockThreshold}
                  onChange={(e) => setEditingThresholdItem({ ...editingThresholdItem, lowStockThreshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsThresholdModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition text-sm font-semibold shadow-md"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
