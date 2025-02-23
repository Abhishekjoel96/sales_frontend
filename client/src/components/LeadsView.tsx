// src/components/LeadsView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Filter, ArrowUpDown, Pencil, Trash2, X, Check } from 'lucide-react';
import * as leadService from '../services/leadService';
import { Lead } from '../models/Lead';
import { useDebounce } from '../hooks/useDebounce'; // Import the debounce hook


interface LeadsViewProps {
    theme: 'dark' | 'light';
}

interface EditableFieldProps {
    value: string | null | undefined;
    isEditing: boolean;
    onEdit: (value: string) => void;
    theme: 'dark' | 'light';
    type?: string;
    onClick?: () => void;
}
//Editable Fields
function EditableField({ value, isEditing, onEdit, theme, type = 'text', onClick }: EditableFieldProps) {
    const [editValue, setEditValue] = useState(value || '');

    useEffect(() => {
        setEditValue(value || '');
    }, [value]);


    const handleBlur = () => {
        onEdit(editValue);

    }

    if (!isEditing) {
        return (
            <span
                className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} cursor-pointer hover:text-indigo-400`}
                onClick={onClick}
            >

                {value != null ? value : '-'}
            </span>
        );
    }

    return (

        <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') { handleBlur() } }}
            autoFocus
            className={`w-full px-2 py-1 text-sm ${
                theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } border rounded focus:outline-none focus:border-indigo-500`}
        />
    );
}

export function LeadsView({ theme }: LeadsViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCell, setEditingCell] = useState<{ leadId: string; field: keyof Lead } | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Lead | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [newLead, setNewLead] = useState<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>({
        name: '',
        phone_number: '',
        email: '',
        region: '',
        source: '',  // Ensure 'source' is included and initialized
        status: 'New',
        company: '',
        industry: ''
    });

    const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce


     const fetchLeads = useCallback(async () => {
        try {
            setLoading(true);
            const data = await leadService.getLeads();
            setLeads(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

     const handleCellEdit = async (leadId: string, field: keyof Lead, value: string) => {
        try {
            // Optimistically update the UI
            const updatedLeads = leads.map(lead =>
                lead.id === leadId ? { ...lead, [field]: value } : lead
            );
            setLeads(updatedLeads);
            setEditingCell(null);

            // Send update to the backend
            await leadService.updateLead(leadId, { [field]: value });
            // Don't re-fetch here; rely on WebSocket for update

        } catch (error: any) {
            console.error("Error updating lead:", error);
            setError("Failed to update lead.");
            // Revert to original state on error.  Requires storing original state.  Simplified for brevity.
            fetchLeads();
        }
    };
    const handleAddLead = async () => {
        try {
            const createdLead = await leadService.createLead(newLead);
            setLeads(prevLeads => [...prevLeads, createdLead]); // Optimistic update
            setShowAddModal(false);
            setNewLead({
                name: '',
                phone_number: '',
                email: '',
                region: '',
                source: '', // Reset source
                status: 'New',
                company: '',
                industry: ''
            });
        } catch (err: any) {
            setError(err.message || 'Failed to add lead');
        }
    };

    const handleDeleteLead = async (leadId: string) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                // Optimistically update the UI *before* the API call.
                setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
                await leadService.deleteLead(leadId);
                // Don't refetch here, rely on the websocket

            } catch (error: any) {
                setError(error.message || 'Failed to delete lead');
                fetchLeads();  // Re-fetch on error (to revert optimistic update)
            }
        }
    };

      // Filtering and Sorting

    const filteredLeads = leads.filter(lead =>
      (lead.name && lead.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
      (lead.company && lead.company.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
      (lead.phone_number && lead.phone_number.includes(debouncedSearchQuery))
    ).filter(lead => !filterStatus || lead.status === filterStatus);


     const sortedLeads = [...filteredLeads].sort((a, b) => {
        if (!sortField) return 0;

        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const getStatusIcon = (status: Lead['status']) => {
      switch (status) {
        case 'Hot':
          return <Flame className="w-4 h-4 text-red-400" />;
        case 'Warm':
            return <TrendingUp className="w-4 h-4 text-yellow-400" />;
        case 'Cold':
          return <Snowflake className="w-4 h-4 text-blue-400" />;
        default:
          return null;
      }
    };

     const getStatusColor = (status: Lead['status']) => {
        switch (status) {
            case 'Hot':
                return 'bg-red-400/20 text-red-400';
            case 'Warm':
                return 'bg-yellow-400/20 text-yellow-400';
            case 'Cold':
                return 'bg-blue-400/20 text-blue-400';
            default:
                return '';
        }
    };

    if (loading) {
        return <div>Loading leads...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <header className="mb-8">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Leads</h2>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Manage and track your leads</p>
            </header>
             {/* Quick Access Bar */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 mb-6 border flex items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Lead</span>
                </button>
                </div>

                <div className="flex-1 max-w-md relative">
                <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 ${
                        theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                    } border rounded-lg placeholder-gray-400 focus:outline-none focus:border-indigo-500`}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>

                <div className="flex items-center gap-2">
                 <button className = {`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                 <Filter className="w-5 h-5 text-gray-400" />
                 </button>
                 <button className= {`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                 onClick={() => {
                    if (sortDirection === 'asc') {
                        setSortDirection('desc');
                      } else {
                        setSortDirection('asc');
                      }
                 }}>
                    <SortAsc className="w-5 h-5 text-gray-400" />
                </button>

                </div>
            </div>

            {/* Leads Table */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Name</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Contact</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Company</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Industry</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Region</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Last Contact</th>
                                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Edit</th>
                            </tr>
                        </thead>
                        <tbody className={`${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
                            {sortedLeads.map((lead) => (
                                <tr key={lead.id} className={theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                                    <td className="px-6 py-4">
                                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        <EditableField
                                            value={lead.name}
                                            isEditing={editingCell?.leadId === lead.id && editingCell?.field === 'name'}
                                            onEdit={(value) => handleCellEdit(lead.id, 'name', value)}
                                            theme={theme}
                                            onClick={() => setEditingCell({ leadId: lead.id, field: 'name' })}
                                        />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1">
                                          <div className="flex items-center gap-1">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <EditableField
                                                    value={lead.email}
                                                    isEditing={editingCell?.leadId === lead.id && editingCell?.field === 'email'}
                                                    onEdit={(value) => handleCellEdit(lead.id, 'email', value)}
                                                    theme={theme}
                                                    type="email"
                                                    onClick={() => setEditingCell({ leadId: lead.id, field: 'email' })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <EditableField
                                                    value={lead.phone_number}
                                                    isEditing={editingCell?.leadId === lead.id && editingCell?.field === 'phone_number'}
                                                    onEdit={(value) => handleCellEdit(lead.id, 'phone_number', value)}
                                                    theme={theme}
                                                    type="tel"
                                                    onClick={() => setEditingCell({ leadId: lead.id, field: 'phone_number' })}
                                                />
                                            </div>

                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Building2 className="w-4 h-4 text-gray-400" />
                                        <EditableField
                                            value={lead.company}
                                            isEditing={editingCell?.leadId === lead.id && editingCell?.field === 'company'}
                                            onEdit={(value) => handleCellEdit(lead.id, 'company', value)}
                                            theme={theme}
                                            onClick={() => setEditingCell({ leadId: lead.id, field: 'company' })}
                                        />
                                       </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingCell?.leadId === lead.id && editingCell?.field === 'status' ? (
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleCellEdit(lead.id, 'status', e.target.value as Lead['status'])}
                                                className={`px-2 py-1 text-sm ${
                                                    theme === 'dark'? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                                                } border rounded focus:outline-none focus:border-indigo-500`}
                                                autoFocus
                                            >
                                                <option value="Hot">Hot</option>
                                                <option value="Warm">Warm</option>
                                                <option value="Cold">Cold</option>
                                                <option value="New">New</option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)} cursor-pointer`}
                                                onClick={() => setEditingCell({ leadId: lead.id, field: 'status' })}
                                            >
                                                {getStatusIcon(lead.status)}
                                                {lead.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Factory className="w-4 h-4 text-gray-400" />
                                        <EditableField
                                            value={lead.industry}
                                            isEditing={editingCell?.leadId === lead.id && editingCell?.field === 'industry'}
                                            onEdit={(value) => handleCellEdit(lead.id, 'industry', value)}
                                            theme={theme}
                                            onClick={() => setEditingCell({ leadId: lead.id, field: 'industry' })}
                                        />
                                         </div>
                                    </td>
                                    <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Globe2 className="w-4 h-4 text-gray-400" />
                                        <EditableField
                                            value={lead.region}
                                            isEditing={editingCell?.leadId === lead.id && editingCell?.field === 'region'}
                                            onEdit={(value) => handleCellEdit(lead.id, 'region', value)}
                                            theme={theme}
                                            onClick={() => setEditingCell({ leadId: lead.id, field: 'region' })}
                                        />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <EditableField
                                            value={lead.lastContact}
                                            isEditing={editingCell?.leadId === lead.id && editingCell?.field === 'lastContact'}
                                            onEdit={(value) => handleCellEdit(lead.id, 'lastContact', value)}
                                            theme={theme}
                                            onClick={() => setEditingCell({ leadId: lead.id, field: 'lastContact' })}
                                        />
                                       </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDeleteLead(lead.id)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Lead Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Lead</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Name</label>
                                <input
                                    type="text"
                                    value={newLead.name}
                                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                    className={`w-full px-3 py-2 ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-gray-50 border-gray-300 text-gray-900'
                                    } border rounded-lg focus:outline-none focus:border-indigo-500`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Email</label>
                                <input
                                    type="email"
                                    value={newLead.email || ''}
                                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                    className={`w-full px-3 py-2 ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-gray-50 border-gray-300 text-gray-900'
                                    } border rounded-lg focus:outline-none focus:border-indigo-500`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Phone</label>
                                <input
                                    type="tel"
                                    value={newLead.phone_number}
                                    onChange={(e) => setNewLead({ ...newLead, phone_number: e.target.value })}
                                    className={`w-full px-3 py-2 ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-gray-50 border-gray-300 text-gray-900'
                                    } border rounded-lg focus:outline-none focus:border-indigo-500`}
                                />
                            </div>

                            <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Company</label>
                <input
                  type="text"
                  value={newLead.company || ''}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className={`w-full px-3 py-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border rounded-lg focus:outline-none focus:border-indigo-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Status</label>
                <select
                  value={newLead.status}
                  onChange={(e) => setNewLead({ ...newLead, status: e.target.value as Lead['status'] })}
                  className={`w-full px-3 py-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border rounded-lg focus:outline-none focus:border-indigo-500`}
                >
                  <option value="New">New</option>
                  <option value="Cold">Cold</option>
                  <option value="Warm">Warm</option>
                  <option value="Hot">Hot</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Source</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value})}
                  className={`w-full px-3 py-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border rounded-lg focus:outline-none focus:border-indigo-500`}
                >
                  <option value="">Select Source</option>
                  <option value="Website">Website</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS</option>
                  <option value="Email">Email</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Industry</label>
                <input
                  type="text"
                  value={newLead.industry || ''}
                  onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                  className={`w-full px-3 py-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border rounded-lg focus:outline-none focus:border-indigo-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Region</label>
                <input
                  type="text"
                  value={newLead.region || ''}
                  onChange={(e) => setNewLead({ ...newLead, region: e.target.value })}
                  className={`w-full px-3 py-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border rounded-lg focus:outline-none focus:border-indigo-500`}
                />
              </div>

                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className={`px-4 py-2 ${
                                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                                } text-gray-400 rounded-lg transition-colors`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddLead}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Add Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}