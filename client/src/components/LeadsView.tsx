// src/components/LeadsView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, User, Phone, Mail, Edit, Trash2, X } from 'lucide-react';
import { Lead } from '../models/Lead';
import * as leadService from '../services/leadService';
import toast from 'react-hot-toast';
import { useApp } from '../contexts/AppContext';

interface LeadFormProps {
    lead?: Lead | null;
    onSave: (lead: Lead) => void;
    onClose: () => void;
    theme: 'dark' | 'light';
}

const LeadForm: React.FC<LeadFormProps> = ({ lead, onSave, onClose, theme }) => {
    const [name, setName] = useState(lead?.name || '');
    const [phoneNumber, setPhoneNumber] = useState(lead?.phone_number || '');
    const [email, setEmail] = useState(lead?.email || '');
    const [region, setRegion] = useState(lead?.region || '');
    const [status, setStatus] = useState<Lead['status']>(lead?.status || 'New');
    const [company, setCompany] = useState(lead?.company || '');
    const [industry, setIndustry] = useState(lead?.industry || '');
    const [source, setSource] = useState(lead?.source || '');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        setIsSaving(true);

        if (!name || !phoneNumber) {
            setFormError('Name and phone number are required.');
            setIsSaving(false);
            return;
        }

        const leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'> = {
            name,
            phone_number: phoneNumber,
            email: email || null, // Allow null values
            region: region || null,
            status,
            company: company || null,
            industry: industry || null,
            source
        };

        try {
            let savedLead: Lead;
            if (lead) {
                // Update existing lead
                savedLead = await leadService.updateLead(lead.id, leadData);
            } else {
                // Create new lead
                savedLead = await leadService.createLead(leadData);
            }
            onSave(savedLead); // update the parent
            toast.success(lead ? 'Lead updated!' : 'Lead added!');
            onClose();

        } catch (error: any) {
            setFormError(error.message || 'An error occurred while saving the lead.');

        } finally {
          setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {lead ? 'Edit Lead' : 'Add Lead'}
                    </h2>
                  <button onClick={onClose} className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}>
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                   {formError && <p className="text-red-500 text-sm">{formError}</p>}
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            required
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            required
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                    </div>
                     <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Region</label>
                        <input
                            type="text"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Lead['status'])}
                        className={`mt-1 block w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        <option value="New">New</option>
                        <option value="Cold">Cold</option>
                        <option value="Warm">Warm</option>
                        <option value="Hot">Hot</option>
                      </select>
                   </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Company</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      />
                    </div>
                    <div>
                       <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Industry</label>
                       <input
                         type="text"
                         value={industry}
                         onChange={(e) => setIndustry(e.target.value)}
                         className={`mt-1 block w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                       />
                    </div>
                     <div>
                       <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Source</label>
                       <input
                         type="text"
                         value={source}
                         onChange={(e) => setSource(e.target.value)}
                         className={`mt-1 block w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                       />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`px-4 py-2 text-sm font-medium ${
                              isSaving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                            } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                           {isSaving ? (lead ? 'Updating...' : 'Adding...') : (lead ? 'Update Lead' : 'Add Lead')}
                        </button>
                         <button
                            type="button"
                            onClick={onClose}
                            className={`ml-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${theme === 'dark' ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'}`}
                            >
                            Cancel
                         </button>

                    </div>
                </form>
            </div>
        </div>
    );
};


interface LeadsViewProps {
    theme: 'dark' | 'light';
    leads: Lead[];      // Receives leads.
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>; // Receives setLeads
}

export function LeadsView({ theme, leads, setLeads }: LeadsViewProps) {  //Receives leads and setLeads
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { socket } = useApp(); // Access the socket from the context

    useEffect(() => {
        if(!socket) return;
        const handleLeadAdded = (newLead: Lead) => {
            setLeads(prevLeads => [...prevLeads, newLead]);
        };

        const handleLeadUpdated = (updatedLead: Lead) => {
            setLeads(prevLeads =>
                prevLeads.map(lead =>
                    lead.id === updatedLead.id ? updatedLead : lead
                )
            );
        };

        const handleLeadDeleted = (deletedLeadId: string) => {
            setLeads(prevLeads => prevLeads.filter(lead => lead.id !== deletedLeadId));
        };

        socket.on('lead_added', handleLeadAdded);
        socket.on('lead_updated', handleLeadUpdated);
        socket.on('lead_deleted', handleLeadDeleted);

        return () => {
          if(socket){
            socket.off('lead_added', handleLeadAdded);
            socket.off('lead_updated', handleLeadUpdated);
            socket.off('lead_deleted', handleLeadDeleted);
          }
        };
    }, [socket, setLeads]);


  const handleAddLead = () => {
        setSelectedLead(null);
        setShowLeadForm(true);
    };

    const handleEditLead = (lead: Lead) => {
        setSelectedLead(lead);
        setShowLeadForm(true);
    };

    const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadService.deleteLead(leadId);
        // Optimistically update the UI *after* the backend operation succeeds.
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
        toast.success('Lead deleted!');
      } catch (error) {
        console.error("Failed to delete lead:", error);
        toast.error('Failed to delete lead.');
        // Consider re-fetching leads if the optimistic update fails
        // fetchLeads();
      }
    }
  };


    const handleSaveLead = useCallback((updatedLead: Lead) => {
      if (selectedLead) {
        // Update existing lead in the list
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead.id === updatedLead.id ? updatedLead : lead
          )
        );
      } else {
        // Add new lead to the list
        setLeads(prevLeads => [...prevLeads, updatedLead]);
      }
    }, [selectedLead, setLeads]);


    const filteredLeads = leads.filter(lead =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.phone_number.includes(searchQuery)
    );

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Leads</h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`pl-10 pr-4 py-2 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                            } border rounded-lg w-64 placeholder-gray-400 focus:outline-none focus:border-indigo-500`}
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>

                    <button
                        onClick={handleAddLead}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Lead</span>
                    </button>
                </div>
            </div>

            {/* Leads Table */}
            <div className={`overflow-x-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg shadow-md`}>
                <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Name</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Email</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Phone</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Company</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Status</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'} divide-y divide-gray-200`}>
                        {filteredLeads.map((lead) => (
                            <tr key={lead.id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50':'hover:bg-gray-50'} transition-colors`}>
                                <td className="px-6 py-4 whitespace-nowrap">{lead.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lead.phone_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lead.company}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{lead.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={() => handleEditLead(lead)} className="text-blue-500 hover:text-blue-700 mr-2">
                                        <Edit className='h-4 w-4'/>
                                    </button>
                                    <button onClick={() => handleDeleteLead(lead.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className='h-4 w-4'/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

              {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Lead</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
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
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    className={`w-full px-3 py-2 ${
                        theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                  } border rounded-lg focus:outline-none focus:border-indigo-500`}
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
               <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Notes</label>
                    <textarea
                        className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        value={newLead.notes}
                        onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    />
                </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddLeadModal(false)}
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
    )
}
