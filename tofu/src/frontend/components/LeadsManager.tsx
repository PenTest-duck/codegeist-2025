/**
 * Leads Manager Component
 * 
 * Manages saved leads with filtering, status updates, and actions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stack,
  Inline,
  Text,
  Heading,
  Button,
  ButtonGroup,
  Select,
  Label,
  Lozenge,
  DynamicTable,
  SectionMessage,
  Spinner,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
  Link,
  xcss,
} from '@forge/react';
import { invoke } from '@forge/bridge';

import type { Lead, LeadStatus } from '../../types';

interface LeadsManagerProps {
  onLeadUpdated: () => void;
}

/**
 * Format a date string to a readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const LeadsManager = ({ onLeadUpdated }: LeadsManagerProps): JSX.Element => {
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load leads
  const loadLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await invoke('getSavedLeads', {
        type: filterType,
        status: filterStatus,
        offset: 0,
        limit: 50,
      }) as { items: Lead[]; total: number };
      
      setLeads(result.items || []);
      setTotal(result.total);
    } catch (err) {
      console.error('Error loading leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterType, filterStatus]);
  
  useEffect(() => {
    loadLeads();
  }, [loadLeads]);
  
  // Update lead status
  const handleStatusUpdate = async (leadId: string, leadType: string, newStatus: LeadStatus) => {
    try {
      const result = await invoke('updateLeadStatus', {
        leadId,
        leadType,
        newStatus,
      }) as { success: boolean };
      
      if (result.success) {
        await loadLeads();
        onLeadUpdated();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };
  
  // Delete lead
  const handleDelete = async (leadId: string, leadType: string) => {
    try {
      const result = await invoke('deleteLead', {
        leadId,
        leadType,
      }) as { success: boolean };
      
      if (result.success) {
        setIsModalOpen(false);
        setSelectedLead(null);
        await loadLeads();
        onLeadUpdated();
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };
  
  // View lead details
  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };
  
  // Type filter options
  const typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'People', value: 'person' },
    { label: 'Companies', value: 'company' },
  ];
  
  // Status filter options
  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Contacted', value: 'contacted' },
  ];
  
  // Table configuration
  const tableHead = {
    cells: [
      { key: 'name', content: 'Name' },
      { key: 'type', content: 'Type' },
      { key: 'summary', content: 'Summary' },
      { key: 'status', content: 'Status' },
      { key: 'found', content: 'Found' },
      { key: 'actions', content: 'Actions' },
    ],
  };
  
  const tableRows = (leads || []).map((lead) => ({
    key: lead.id,
    cells: [
      { 
        key: 'name', 
        content: (
          <Button appearance="subtle" onClick={() => handleViewLead(lead)}>
            {lead.name.substring(0, 30) + (lead.name.length > 30 ? '...' : '')}
          </Button>
        ),
      },
      { 
        key: 'type', 
        content: lead.type === 'person' ? '👤 Person' : '🏢 Company',
      },
      { 
        key: 'summary', 
        content: (lead.summary || '').substring(0, 40) + ((lead.summary || '').length > 40 ? '...' : ''),
      },
      { 
        key: 'status', 
        content: (
          <Lozenge 
            appearance={
              lead.status === 'accepted' ? 'success' : 
              lead.status === 'rejected' ? 'removed' : 
              lead.status === 'contacted' ? 'inprogress' : 
              'default'
            }
          >
            {lead.status}
          </Lozenge>
        ),
      },
      { key: 'found', content: formatDate(lead.foundAt) },
      { 
        key: 'actions', 
        content: (
          <ButtonGroup>
            {lead.status !== 'accepted' && (
              <Button 
                appearance="subtle" 
                onClick={() => handleStatusUpdate(lead.id, lead.type, 'accepted')}
              >
                Accept
              </Button>
            )}
            {lead.status !== 'rejected' && (
              <Button 
                appearance="subtle" 
                onClick={() => handleStatusUpdate(lead.id, lead.type, 'rejected')}
              >
                Reject
              </Button>
            )}
          </ButtonGroup>
        ),
      },
    ],
  }));
  
  // Get lead URL
  const getLeadUrl = (lead: Lead): string | undefined => {
    if (lead.type === 'person') {
      return (lead as any).profileUrl;
    }
    return (lead as any).website;
  };
  
  return (
    <Stack space="space.300">
      {/* Filters */}
      <Inline space="space.200" alignBlock="center">
        <Box xcss={filterBoxStyles}>
          <Label labelFor="type-filter">Type</Label>
          <Select
            inputId="type-filter"
            options={typeOptions}
            value={typeOptions.find(o => o.value === filterType)}
            onChange={(option) => setFilterType((option as any)?.value || 'all')}
          />
        </Box>
        <Box xcss={filterBoxStyles}>
          <Label labelFor="status-filter">Status</Label>
          <Select
            inputId="status-filter"
            options={statusOptions}
            value={statusOptions.find(o => o.value === filterStatus)}
            onChange={(option) => setFilterStatus((option as any)?.value || 'all')}
          />
        </Box>
        <Button appearance="subtle" onClick={loadLeads}>
          Refresh
        </Button>
      </Inline>
      
      {/* Results Count */}
      <Text>{total} lead{total !== 1 ? 's' : ''} found</Text>
      
      {/* Loading State */}
      {isLoading && (
        <Box xcss={centerStyles}>
          <Spinner size="medium" />
        </Box>
      )}
      
      {/* Leads Table */}
      {!isLoading && leads.length > 0 && (
        <DynamicTable
          head={tableHead}
          rows={tableRows}
          rowsPerPage={10}
        />
      )}
      
      {/* Empty State */}
      {!isLoading && leads.length === 0 && (
        <SectionMessage appearance="information">
          <Text>No leads found matching your filters. Try adjusting your filters or search for new leads using the Tofu agent.</Text>
        </SectionMessage>
      )}
      
      {/* Lead Detail Modal */}
      <ModalTransition>
        {isModalOpen && selectedLead && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <ModalHeader>
              <ModalTitle>
                {selectedLead.type === 'person' ? '👤' : '🏢'} {selectedLead.name}
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Stack space="space.200">
                <Inline space="space.100">
                  <Text>Status:</Text>
                  <Lozenge 
                    appearance={
                      selectedLead.status === 'accepted' ? 'success' : 
                      selectedLead.status === 'rejected' ? 'removed' : 
                      selectedLead.status === 'contacted' ? 'inprogress' : 
                      'default'
                    }
                  >
                    {selectedLead.status}
                  </Lozenge>
                </Inline>
                
                {selectedLead.summary && (
                  <Stack space="space.050">
                    <Text>Summary:</Text>
                    <Text>{selectedLead.summary}</Text>
                  </Stack>
                )}
                
                {getLeadUrl(selectedLead) && (
                  <Stack space="space.050">
                    <Text>Source:</Text>
                    <Link href={getLeadUrl(selectedLead) || ''} openNewTab>
                      {getLeadUrl(selectedLead)}
                    </Link>
                  </Stack>
                )}
                
                <Text>Found: {formatDate(selectedLead.foundAt)}</Text>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <ButtonGroup>
                <Button 
                  appearance="danger" 
                  onClick={() => handleDelete(selectedLead.id, selectedLead.type)}
                >
                  Delete
                </Button>
                <Button 
                  appearance="primary"
                  onClick={() => handleStatusUpdate(selectedLead.id, selectedLead.type, 'accepted')}
                >
                  Accept Lead
                </Button>
                <Button 
                  appearance="subtle"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </Stack>
  );
};

// Styles
const filterBoxStyles = xcss({
  minWidth: '150px',
});

const centerStyles = xcss({
  display: 'block',
  textAlign: 'center',
  padding: 'space.400',
});

