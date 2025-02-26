// src/components/LeadsView.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { Lead } from '../models/Lead';
import * as leadService from '../services/leadService';
import { Plus, Search, Edit, Trash2, FileDown, FileUp, X, User, Phone, Mail, Building, Globe, Check, AlertTriangle } from 'lucide-react';
import { AnimatedCard } from './shared/AnimatedCard';
import { format } from 'date-fns';


interface LeadsViewProps {}

const LeadsView: React.FC<LeadsViewProps> = () => {
    const { leads, setLeads, theme, isLoading, error } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddLeadModal, setShowAddLeadModal] = useState(false);
    const [showEditLeadModal, setShowEditLeadModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false); // Import modal
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
    const [sortField, setSortField] = useState<'name' | 'created_at'>('created_at'); // Default sort by creation date
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for CSV file handling
    const [importError, setImportError] = useState<string | null>(null);

    const [newLead, setNewLead] = useState<Lead>({
        id: '',
        name: '',
        email: '',
        phone_number: '',
        company: '',
        website: '',
        status: 'new',
        notes: '',
        created_at: new Date().toISOString(),
        last_contacted: null
    });

    // Editing
    const [editLeadData, setEditLeadData] = useState<Lead>({
        id: '',
        name: '',
        email: '',
        phone_number: '',
        company: '',
        website: '',
        status: 'new',
        notes: '',
        created_at: '',
        last_contacted: null
    });

    const fetchLeads = useCallback(async () => {
      try {
            const fetchedLeads = await leadService.getAllLeads();
            setLeads(fetchedLeads);
        } catch (error: any) {
            console.error("Failed to fetch leads:", error);
        }
    }, [setLeads]); // Include setLeads in the dependency array

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleAddLead = async () => {
        try {
          if (
                !newLead.name.trim() ||
                !newLead.email.trim() ||
                !newLead.phone_number.trim()
            ) {
                alert('Please fill in all required fields (Name, Email, Phone).');
                return;
            }
            const addedLead = await leadService.createLead(newLead);
            setLeads(prevLeads => [addedLead, ...prevLeads]);
            setShowAddLeadModal(false);
            setNewLead({ // Reset the form
                id: '',
                name: '',
                email: '',
                phone_number: '',
                company: '',
                website: '',
                status: 'new',
                notes: '',
                created_at: new Date().toISOString(),
                last_contacted: null
            });

        } catch (error: any) {
            console.error("Error adding lead:", error);
            alert(`Error adding lead: ${error.message}`);
        }
    };

        const handleEditLead = async () => {
        try {
             if (
                !editLeadData.name.trim() ||
                !editLeadData.email.trim() ||
                !editLeadData.phone_number.trim()
            ) {
                alert('Please fill in all required fields (Name, Email, Phone).');
                return;
            }
            const updatedLead = await leadService.updateLead(editLeadData.id, editLeadData);
            // Update the local state
            setLeads(prevLeads =>
                prevLeads.map(lead => (lead.id === updatedLead.id ? updatedLead : lead))
            );

            setShowEditLeadModal(false);  // Close the modal
            setEditLeadData({             // Clear the edit form
                id: '', name: '', email: '', phone_number: '', company: '', website: '',
                status: 'new', notes: '', created_at: '', last_contacted: null
            });
        } catch (error: any) {
            console.error("Error updating lead:", error);
        }
    };

    const handleDeleteLead = async (id: string) => {
        try {
            await leadService.deleteLead(id);
            setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
        } catch (error : any) {
            console.error("Error deleting lead:", error);
        }
        setShowDeleteConfirmation(false);
    };


  const sortedLeads = [...leads].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    let comparison = 0;
    if (fieldA && fieldB) {
        if (fieldA > fieldB) {
            comparison = 1;
        } else if (fieldA < fieldB) {
            comparison = -1;
        }
    }
    return sortDirection === 'asc' ? comparison : -comparison;
});


  const filteredLeads = sortedLeads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleImportLeads = async () => {
        if (!selectedFile) {
            alert('Please select a CSV file to import.');
            return;
        }

        try {
           setImportError(null); // Clear previous errors
            const importedLeads = await leadService.importLeadsFromCSV(selectedFile);

            // Add new leads, avoiding duplicates based on a unique identifier (e.g., email)
            setLeads(prevLeads => {
                const existingEmails = new Set(prevLeads.map(lead => lead.email));
                const newLeads = importedLeads.filter(lead => !existingEmails.has(lead.email));
                return [...prevLeads, ...newLeads];
            });
          //  alert(`${importedLeads.length} leads imported successfully.`);
            setShowImportModal(false); // Close modal after successful import
              setSelectedFile(null);
        } catch (error : any) {
            console.error("Error importing leads:", error);
            setImportError(error.message || "Failed to import leads. Please check the CSV format.");
        }
    };

     const handleExportLeads = async () => {
    try {
      const csvData = await leadService.exportLeadsToCSV(leads);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', 'leads.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting leads:', error);
    }
  };


    return (
        <div className={`p-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Leads</h2>
            <div className="flex justify-between items-center mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        className={`pl-10 pr-4 py-2 w-64 rounded-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                     <button
                        onClick={() => setShowImportModal(true)}
                        className={`flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors`}
                    >
                        <FileUp className="mr-2 h-4 w-4" />
                        Import
                    </button>
                    <button
                        onClick={handleExportLeads}
                        className={`flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors`}
                    >
                         <FileDown className="mr-2 h-4 w-4" />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddLeadModal(true)}
                        className={`flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors`}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lead
                    </button>
                </div>
            </div>

             {/* Leads Table */}
            <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-300'}`}>
                    <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                <button onClick={() => {
                                    setSortField('name');
                                    setSortDirection(sortField === 'name' && sortDirection === 'asc' ? 'desc' : 'asc');
                                }} className="flex items-center">
                                    Name
                                    {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                                </button>
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Email</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Phone</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Company</th>
                           <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                             <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                <button onClick={() => {
                                     setSortField('created_at');
                                     setSortDirection(sortField === 'created_at' && sortDirection === 'asc' ? 'desc' : 'asc')
                                }} className="flex items-center">
                                Created At
                                {sortField === 'created_at' && (sortDirection === 'asc' ? '▲' : '▼')}
                                </button>
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                        {filteredLeads.map(lead => (
                            <tr key={lead.id}>
                                <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <div className="flex items-center">
                                        <User className="mr-2 h-4 w-4 text-gray-500" />
                                        {lead.name}
                                    </div>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      <div className="flex items-center">
                                        <Mail className="mr-2 h-4 w-4 text-gray-500" />
                                        {lead.email}
                                      </div>
                                    </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      <div className="flex items-center">
                                        <Phone className="mr-2 h-4 w-4 text-gray-500" />
                                        {lead.phone_number}
                                      </div>
                                    </td>
                                 <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <div className="flex items-center">
                                        <Building className="mr-2 h-4 w-4 text-gray-500" />
                                        {lead.company}
                                      </div>
                                    </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{lead.status}</td>
                                 <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {format(new Date(lead.created_at), 'yyyy-MM-dd')}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                   <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setEditLeadData(lead);
                                            setShowEditLeadModal(true);
                                        }}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                         onClick={() => {
                                            setLeadToDelete(lead.id);
                                            setShowDeleteConfirmation(true);
                                          }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {/* Add Lead Modal */}
            {showAddLeadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={`rounded-lg shadow-xl p-6 w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add Lead</h3>
                            <button onClick={() => setShowAddLeadModal(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Name</label>
                                <input
                                    type="text"
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={newLead.name}
                                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email</label>
                                <input
                                    type="email"
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={newLead.email}
                                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Phone</label>
                                <input
                                    type="tel"
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={newLead.phone_number}
                                    onChange={(e) => setNewLead({ ...newLead, phone_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Company</label>
                                <input
                                    type="text"
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={newLead.company}
                                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Website</label>
                                <input
                                    type="url"
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={newLead.website}
                                    onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Status</label>
                                <select
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={newLead.status}
                                    onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="converted">Converted</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Notes</label>
                                <textarea
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={newLead.notes}
                                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 gap-3">
                            <button
                                onClick={() => setShowAddLeadModal(false)}
                                className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-600 rounded-lg transition-colors`}
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

              {/* Edit Lead Modal */}
            {showEditLeadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={`rounded-lg shadow-xl p-6 w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Lead</h3>
                            <button onClick={() => setShowEditLeadModal(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Name</label>
                                <input
                                    type="text"
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={editLeadData.name}
                                    onChange={(e) => setEditLeadData({ ...editLeadData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email</label>
                                <input
                                    type="email"
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={editLeadData.email}
                                    onChange={(e) => setEditLeadData({ ...editLeadData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Phone</label>
                                <input
                                    type="tel"
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={editLeadData.phone_number}
                                    onChange={(e) => setEditLeadData({ ...editLeadData, phone_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Company</label>
                                <input
                                    type="text"
                                     className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={editLeadData.company}
                                    onChange={(e) => setEditLeadData({ ...editLeadData, company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Website</label>
                                <input
                                    type="url"
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={editLeadData.website}
                                    onChange={(e) => setEditLeadData({ ...editLeadData, website: e.target.value })}
                                />
                            </div>
                            <div>
                                 <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Status</label>
                                <select
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={editLeadData.status}
                                    onChange={(e) => setEditLeadData({ ...editLeadData, status: e.target.value })}
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="converted">Converted</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Notes</label>
                                <textarea
                                    className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    value={editLeadData.notes}
                                    onChange={(e) => setEditLeadData({ ...editLeadData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 gap-3">
                            <button
                                onClick={() => setShowEditLeadModal(false)}
                                className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-600 rounded-lg transition-colors`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditLead}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

             {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={`rounded-lg shadow-xl p-6 w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Confirm Delete</h3>
                            <button onClick={() => setShowDeleteConfirmation(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Are you sure you want to delete this lead?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirmation(false)}
                                className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-600 rounded-lg transition-colors`}

                            >
                                Cancel
                            </button>
                            <button
                                 onClick={() => leadToDelete && handleDeleteLead(leadToDelete)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className={`rounded-lg shadow-xl p-6 w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Import Leads</h3>
                        <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Select CSV File</label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            />
                        </div>
                        {importError && (
                            <div className="flex items-center p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              {importError}
                            </div>
                          )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-600 rounded-lg transition-colors`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImportLeads}
                                disabled={!selectedFile}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                Import
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadsView;
