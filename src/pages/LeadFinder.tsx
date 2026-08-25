import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '../store/crmStore';
import { Lead } from '../store/crmTypes';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Toast, useToast } from '../components/ui/Toast';
import { 
  Search, Filter, Upload, Plus, Building2, CheckCircle2, FileSpreadsheet, 
  MapPin, Star, Phone, Globe, ExternalLink, RefreshCw, AlertCircle, Sparkles, CheckSquare, Square, BrainCircuit
} from 'lucide-react';

interface GoogleMapsPlaceLead {
  id: string;
  googlePlaceId: string;
  companyName: string;
  address: string;
  location: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  businessStatus: string;
  category: string;
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
  aiScore: number | null;
  aiClassification?: 'hot' | 'warm' | 'cold' | null;
  aiReason: string | null;
  aiConfidence?: number | null;
  aiAnalyzedAt?: string | null;
  companyDescription?: string | null;
  services?: string[];
  targetCustomers?: string[];
  businessStrengths?: string[];
  businessWeaknesses?: string[];
  onlinePresence?: string | null;
  websiteQuality?: string | null;
  socialPresence?: string | null;
  possiblePainPoints?: string[];
  salesOpportunity?: string | null;
  researchSummary?: string | null;
  researchedAt?: string | null;
  analyzing?: boolean;
}

const SEARCH_HISTORY_KEY = 'leadfinder_ai_search_history';

export function LeadFinder() {
  const { leads, addLead, importLeads } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  // Search Form State
  const [category, setCategory] = useState('HVAC Contractor');
  const [location, setLocation] = useState('Kathmandu, Nepal');
  const [keywords, setKeywords] = useState('air conditioning installation');
  const [radius, setRadius] = useState('10'); // km

  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GoogleMapsPlaceLead[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  // Search History
  const [searchHistory, setSearchHistory] = useState<Array<{ query: string; location: string; time: string }>>(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [
        { query: 'HVAC contractors', location: 'Kathmandu, Nepal', time: 'Yesterday' },
        { query: 'Restaurants', location: 'Lalitpur', time: '2 days ago' },
        { query: 'Dentists', location: 'Pokhara', time: '3 days ago' }
      ];
    } catch {
      return [];
    }
  });

  // Existing CRM Leads search filter view toggle
  const [activeTab, setActiveTab] = useState<'finder' | 'crm'>('finder');
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Single Add & CSV Import Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    jobTitle: '',
    industry: 'Software',
    location: 'San Francisco, CA',
    website: '',
    email: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    source: 'Google Maps',
    companySize: '11-50',
    leadScore: 85,
    status: 'new' as Lead['status'],
    owner: 'Admin'
  });

  const [csvText, setCsvText] = useState('');
  const [importStats, setImportStats] = useState<{ imported: number; skipped: number; errors: number } | null>(null);

  // Perform Google Maps Search
  const handleFindLeads = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!category.trim() || !location.trim()) {
      toast('Please enter Business Category and Location', 'error');
      return;
    }

    setSearching(true);
    setSearchMessage(null);

    try {
      const res = await fetch('/api/leads/google-maps/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: category,
          location,
          keywords,
          radius: parseInt(radius) * 1000 // meters
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to search Google Maps');
      }

      setSearchResults(data.places || []);
      if (data.message) {
        setSearchMessage(data.message);
      }

      // Update Search History
      const newHistoryItem = { query: category, location, time: 'Just now' };
      const updatedHistory = [newHistoryItem, ...searchHistory.filter(h => h.query !== category || h.location !== location)].slice(0, 10);
      setSearchHistory(updatedHistory);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));

      if (data.places && data.places.length > 0) {
        toast(`Found ${data.places.length} businesses on Google Maps`, 'success');
      } else {
        toast(data.message || 'No businesses found for this search.', 'warning');
      }
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Google Maps API error occurred.', 'error');
      setSearchMessage(err.message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleRepeatSearch = (item: { query: string; location: string }) => {
    setCategory(item.query);
    setLocation(item.location);
    setActiveTab('finder');
  };

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedPlaceIds.length === searchResults.length) {
      setSelectedPlaceIds([]);
    } else {
      setSelectedPlaceIds(searchResults.map(p => p.googlePlaceId));
    }
  };

  const toggleSelectPlace = (placeId: string) => {
    if (selectedPlaceIds.includes(placeId)) {
      setSelectedPlaceIds(selectedPlaceIds.filter(id => id !== placeId));
    } else {
      setSelectedPlaceIds([...selectedPlaceIds, placeId]);
    }
  };

  // Helper for deduplication
  const isDuplicateLead = (place: GoogleMapsPlaceLead, existingLeads: Lead[]): boolean => {
    return existingLeads.some(existing => {
      if (existing.googlePlaceId && existing.googlePlaceId === place.googlePlaceId) return true;
      if (place.website && existing.website && place.website.toLowerCase().trim() === existing.website.toLowerCase().trim()) return true;
      if (place.phone && existing.phone && place.phone.replace(/\D/g, '') === existing.phone.replace(/\D/g, '')) return true;
      if (existing.companyName.toLowerCase().trim() === place.companyName.toLowerCase().trim() && 
          existing.location.toLowerCase().trim() === place.location.toLowerCase().trim()) return true;
      return false;
    });
  };

  // AI Lead Qualification and Scoring handler for single place
  const handleAnalyzePlace = async (placeId: string, force = false) => {
    const place = searchResults.find(p => p.googlePlaceId === placeId);
    if (!place) return;

    // Cost Control / Caching Check
    if (!force && place.aiAnalyzedAt && place.aiScore !== null && place.aiScore !== undefined) {
      toast(`Using cached AI analysis for ${place.companyName}`, 'info');
      return;
    }

    setSearchResults(prev => prev.map(p => p.googlePlaceId === placeId ? { ...p, analyzing: true } : p));

    try {
      const res = await fetch('/api/ai/qualify-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: place.companyName,
          category: place.category,
          location: place.address,
          website: place.website,
          phone: place.phone,
          rating: place.rating,
          reviewCount: place.reviewCount,
          businessStatus: place.businessStatus,
          source: 'Google Maps'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI analysis failed. Try again.');
      }

      setSearchResults(prev => prev.map(p => {
        if (p.googlePlaceId === placeId) {
          return {
            ...p,
            aiScore: data.score,
            aiClassification: data.classification,
            aiReason: data.reason,
            aiConfidence: data.confidence,
            aiAnalyzedAt: new Date().toISOString(),
            analyzing: false
          };
        }
        return p;
      }));

      toast(`Successfully analyzed ${place.companyName} (Score: ${data.score})`, 'success');
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'AI analysis failed. Try again.', 'error');
      setSearchResults(prev => prev.map(p => p.googlePlaceId === placeId ? { ...p, analyzing: false } : p));
    }
  };

  // Bulk AI Analysis for Selected Places
  const handleAnalyzeSelected = async () => {
    if (selectedPlaceIds.length === 0) {
      toast('No businesses selected', 'warning');
      return;
    }

    const placesToAnalyze = searchResults.filter(p => selectedPlaceIds.includes(p.googlePlaceId));
    let analyzedCount = 0;

    for (const place of placesToAnalyze) {
      analyzedCount++;
      setSearchMessage(`Analyzing ${analyzedCount} / ${placesToAnalyze.length}: ${place.companyName}...`);

      try {
        const res = await fetch('/api/ai/qualify-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: place.companyName,
            category: place.category,
            location: place.address,
            website: place.website,
            phone: place.phone,
            rating: place.rating,
            reviewCount: place.reviewCount,
            businessStatus: place.businessStatus,
            source: 'Google Maps'
          })
        });

        const data = await res.json();
        if (res.ok) {
          setSearchResults(prev => prev.map(p => {
            if (p.googlePlaceId === place.googlePlaceId) {
              return {
                ...p,
                aiScore: data.score,
                aiClassification: data.classification,
                aiReason: data.reason,
                aiConfidence: data.confidence,
                aiAnalyzedAt: new Date().toISOString(),
                analyzing: false
              };
            }
            return p;
          }));
        }
      } catch (e) {
        console.error("Batch AI Error for", place.companyName, e);
      }
    }

    setSearchMessage(null);
    toast(`Successfully analyzed ${placesToAnalyze.length} selected businesses!`, 'success');
  };

  const handleResearchSelected = async () => {
    const placesToResearch = searchResults.filter(p => selectedPlaceIds.includes(p.googlePlaceId));
    if (placesToResearch.length === 0) {
      toast('No businesses selected', 'warning');
      return;
    }

    let researchedCount = 0;
    for (const place of placesToResearch) {
      researchedCount++;
      setSearchMessage(`Researching ${researchedCount} / ${placesToResearch.length}: ${place.companyName}...`);

      try {
        const res = await fetch('/api/ai/research-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: place.companyName,
            category: place.category,
            location: place.address,
            website: place.website,
            phone: place.phone,
            rating: place.rating,
            reviewCount: place.reviewCount,
            businessStatus: place.businessStatus,
            source: 'Google Maps'
          })
        });

        const data = await res.json();
        if (res.ok) {
          setSearchResults(prev => prev.map(p => {
            if (p.googlePlaceId === place.googlePlaceId) {
              return {
                ...p,
                companyDescription: data.companyDescription,
                services: data.services,
                targetCustomers: data.targetCustomers,
                businessStrengths: data.businessStrengths,
                businessWeaknesses: data.businessWeaknesses,
                onlinePresence: data.onlinePresence,
                websiteQuality: data.websiteQuality,
                socialPresence: data.socialPresence,
                possiblePainPoints: data.possiblePainPoints,
                salesOpportunity: data.salesOpportunity,
                researchSummary: data.researchSummary,
                researchedAt: data.researchedAt
              };
            }
            return p;
          }));
        }
      } catch (e) {
        console.error("Batch Research Error for", place.companyName, e);
      }
    }

    setSearchMessage(null);
    toast(`Successfully researched ${placesToResearch.length} selected businesses!`, 'success');
  };

  // Add Single Lead from Google Maps search result
  const handleAddSingleLead = (place: GoogleMapsPlaceLead) => {
    if (isDuplicateLead(place, leads)) {
      toast(`Lead "${place.companyName}" already exists in CRM (Duplicate detected).`, 'warning');
      return;
    }

    addLead({
      companyName: place.companyName,
      contactName: 'Manager / Owner',
      jobTitle: 'Director',
      industry: place.category || category,
      location: place.address || location,
      website: place.website || '',
      email: '',
      phone: place.phone || '',
      whatsapp: null,
      facebook: null,
      instagram: null,
      source: 'Google Maps',
      companySize: '11-50',
      leadScore: place.aiScore ?? 75,
      status: 'new',
      tags: ['google-maps', category.toLowerCase().replace(/\s+/g, '-')],
      owner: 'Admin',
      googlePlaceId: place.googlePlaceId,
      googleMapsUrl: place.googleMapsUrl,
      rating: place.rating,
      reviewCount: place.reviewCount,
      businessStatus: place.businessStatus,
      category: place.category,
      aiScore: place.aiScore ?? null,
      aiClassification: place.aiClassification ?? null,
      aiReason: place.aiReason ?? null,
      aiConfidence: place.aiConfidence ?? null,
      aiAnalyzedAt: place.aiAnalyzedAt ?? null,
      companyDescription: place.companyDescription ?? null,
      services: place.services ?? [],
      targetCustomers: place.targetCustomers ?? [],
      businessStrengths: place.businessStrengths ?? [],
      businessWeaknesses: place.businessWeaknesses ?? [],
      onlinePresence: place.onlinePresence ?? null,
      websiteQuality: place.websiteQuality ?? null,
      socialPresence: place.socialPresence ?? null,
      possiblePainPoints: place.possiblePainPoints ?? [],
      salesOpportunity: place.salesOpportunity ?? null,
      researchSummary: place.researchSummary ?? null,
      researchedAt: place.researchedAt ?? null
    });

    toast(`Successfully added "${place.companyName}" to CRM!`, 'success');
  };

  // Add Selected Leads
  const handleAddSelectedLeads = () => {
    const selectedPlaces = searchResults.filter(p => selectedPlaceIds.includes(p.googlePlaceId));
    if (selectedPlaces.length === 0) {
      toast('No businesses selected', 'warning');
      return;
    }

    let addedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    selectedPlaces.forEach(place => {
      try {
        if (isDuplicateLead(place, leads)) {
          skippedCount++;
        } else {
          addLead({
            companyName: place.companyName,
            contactName: 'Manager / Owner',
            jobTitle: 'Director',
            industry: place.category || category,
            location: place.address || location,
            website: place.website || '',
            email: '',
            phone: place.phone || '',
            whatsapp: null,
            facebook: null,
            instagram: null,
            source: 'Google Maps',
            companySize: '11-50',
            leadScore: place.aiScore ?? 75,
            status: 'new',
            tags: ['google-maps', category.toLowerCase().replace(/\s+/g, '-')],
            owner: 'Admin',
            googlePlaceId: place.googlePlaceId,
            googleMapsUrl: place.googleMapsUrl,
            rating: place.rating,
            reviewCount: place.reviewCount,
            businessStatus: place.businessStatus,
            category: place.category,
            aiScore: place.aiScore ?? null,
            aiClassification: place.aiClassification ?? null,
            aiReason: place.aiReason ?? null,
            aiConfidence: place.aiConfidence ?? null,
            aiAnalyzedAt: place.aiAnalyzedAt ?? null,
            companyDescription: place.companyDescription ?? null,
            services: place.services ?? [],
            targetCustomers: place.targetCustomers ?? [],
            businessStrengths: place.businessStrengths ?? [],
            businessWeaknesses: place.businessWeaknesses ?? [],
            onlinePresence: place.onlinePresence ?? null,
            websiteQuality: place.websiteQuality ?? null,
            socialPresence: place.socialPresence ?? null,
            possiblePainPoints: place.possiblePainPoints ?? [],
            salesOpportunity: place.salesOpportunity ?? null,
            researchSummary: place.researchSummary ?? null,
            researchedAt: place.researchedAt ?? null
          });
          addedCount++;
        }
      } catch (e) {
        failedCount++;
      }
    });

    toast(`Added: ${addedCount} | Skipped duplicates: ${skippedCount} | Failed: ${failedCount}`, addedCount > 0 ? 'success' : 'warning');
    setSelectedPlaceIds([]);
  };

  // Filtered CRM leads for CRM tab
  const filteredCrmLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.companyName.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
        lead.contactName.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
        lead.industry.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
        lead.location.toLowerCase().includes(crmSearchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, crmSearchQuery, statusFilter]);

  const handleSaveAddModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast('Company Name is required', 'error');
      return;
    }
    addLead({
      ...formData,
      tags: ['manual'],
      whatsapp: formData.whatsapp || null,
      facebook: formData.facebook || null,
      instagram: formData.instagram || null,
    });
    setIsAddModalOpen(false);
    toast('Lead added successfully', 'success');
  };

  const handleDownloadTemplate = () => {
    const template = 'companyName,contactName,jobTitle,industry,location,website,email,phone,source\n"Stripe","Patrick Collison","CEO","Fintech","San Francisco, CA","https://stripe.com","patrick@stripe.com","+15550122","Google Maps"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_finder_template.csv';
    a.click();
    toast('CSV template downloaded', 'success');
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) {
      toast('Please enter CSV data', 'error');
      return;
    }
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        toast('Invalid CSV format', 'error');
        return;
      }
      let imported = 0;
      const newLeadsList: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (row.length < 2) continue;
        newLeadsList.push({
          companyName: row[0] || 'Company',
          contactName: row[1] || 'Contact',
          jobTitle: row[2] || 'Director',
          industry: row[3] || 'Technology',
          location: row[4] || 'Remote',
          website: row[5] || '',
          email: row[6] || '',
          phone: row[7] || '',
          whatsapp: null,
          facebook: null,
          instagram: null,
          source: row[8] || 'CSV Import',
          companySize: '11-50',
          leadScore: 80,
          status: 'new',
          tags: ['discovered'],
          owner: 'Admin'
        });
        imported++;
      }
      importLeads(newLeadsList);
      setImportStats({ imported, skipped: 0, errors: 0 });
      toast(`Successfully imported ${imported} leads!`, 'success');
    } catch (e) {
      toast('Error parsing CSV', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Lead Finder AI (Google Maps & Gemini)</h1>
          <p className="text-sm text-brand-muted mt-1">Discover qualified local businesses, run AI qualification & scoring, and sync to your CRM pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={16} className="mr-2" /> Import CSV
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('finder')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'finder' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Google Maps Discovery ({searchResults.length})
        </button>
        <button
          onClick={() => setActiveTab('crm')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'crm' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Existing CRM Leads ({leads.length})
        </button>
      </div>

      {activeTab === 'finder' ? (
        <div className="space-y-6">
          {/* Search Form Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="text-brand-primary" size={18} /> Google Places API Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFindLeads} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Business Category *</label>
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      placeholder="e.g. HVAC Contractor"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Kathmandu, Nepal"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Keywords (Optional)</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={e => setKeywords(e.target.value)}
                      placeholder="e.g. air conditioning installation"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Radius (km)</label>
                    <select
                      value={radius}
                      onChange={e => setRadius(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    >
                      <option value="5">5 km</option>
                      <option value="10">10 km</option>
                      <option value="25">25 km</option>
                      <option value="50">50 km</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-brand-muted">
                    Server-side Google Places API search with secure API key protection & Gemini AI lead qualification.
                  </div>
                  <Button type="submit" disabled={searching} className="gap-2">
                    {searching ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
                    {searching ? 'Searching Google Maps...' : 'Find Leads'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-semibold text-brand-muted shrink-0">Recent Searches:</span>
              {searchHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRepeatSearch(item)}
                  className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
                >
                  <span className="font-medium text-brand-text">{item.query}</span>
                  <span className="text-gray-400">({item.location})</span>
                  <span className="text-[10px] text-brand-primary ml-1">Repeat</span>
                </button>
              ))}
            </div>
          )}

          {/* Results Table Section */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Search Results ({searchResults.length})</CardTitle>
                <p className="text-xs text-brand-muted mt-0.5">Select businesses to run AI analysis and add to CRM.</p>
              </div>
              {selectedPlaceIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleAnalyzeSelected} className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <Sparkles size={16} /> Analyze Selected ({selectedPlaceIds.length})
                  </Button>
                  <Button variant="outline" onClick={handleResearchSelected} className="gap-1.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50">
                    <BrainCircuit size={16} /> Research Selected ({selectedPlaceIds.length})
                  </Button>
                  <Button onClick={handleAddSelectedLeads} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 size={16} /> Add Selected Leads ({selectedPlaceIds.length})
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {searching ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="animate-spin mx-auto text-brand-primary" size={32} />
                  <p className="text-sm font-medium text-brand-text">Searching Google Maps...</p>
                  <p className="text-xs text-brand-muted">Querying official Google Places API endpoints.</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <AlertCircle className="mx-auto text-gray-300" size={36} />
                  <p className="text-sm font-semibold text-brand-text">No businesses found yet.</p>
                  <p className="text-xs text-brand-muted">Enter a category and location above and click "Find Leads".</p>
                  {searchMessage && (
                    <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 p-2 rounded inline-block">
                      {searchMessage}
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {searchMessage && (
                    <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-xs font-medium text-indigo-700 flex items-center gap-2">
                      <Sparkles size={14} className="animate-spin" /> {searchMessage}
                    </div>
                  )}
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-brand-muted">
                        <th className="p-3 w-10 text-center">
                          <button onClick={toggleSelectAll} className="text-gray-500 hover:text-brand-primary">
                            {selectedPlaceIds.length === searchResults.length && searchResults.length > 0 ? (
                              <CheckSquare size={16} className="text-brand-primary" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </th>
                        <th className="p-3">Company</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Rating</th>
                        <th className="p-3">AI Score & Classification</th>
                        <th className="p-3">Phone / Website</th>
                        <th className="p-3">Google Maps</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {searchResults.map(place => {
                        const isSelected = selectedPlaceIds.includes(place.googlePlaceId);
                        const alreadyExists = leads.some(l => l.googlePlaceId === place.googlePlaceId || (place.website && l.website && l.website.toLowerCase().trim() === place.website.toLowerCase().trim()));
                        
                        // Classification badge styling
                        let classBadge = null;
                        if (place.aiClassification) {
                          const cls = place.aiClassification.toLowerCase();
                          if (cls === 'hot') {
                            classBadge = <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-1.5 py-0.5 rounded">HOT</span>;
                          } else if (cls === 'warm') {
                            classBadge = <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded">WARM</span>;
                          } else {
                            classBadge = <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded">COLD</span>;
                          }
                        }

                        return (
                          <tr key={place.googlePlaceId} className={`hover:bg-gray-50/55 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                            <td className="p-3 text-center">
                              <button onClick={() => toggleSelectPlace(place.googlePlaceId)} className="text-gray-400 hover:text-brand-primary">
                                {isSelected ? <CheckSquare size={16} className="text-brand-primary" /> : <Square size={16} />}
                              </button>
                            </td>
                            <td className="p-3 font-semibold text-brand-text">
                              <div className="flex items-center gap-1.5">
                                {place.companyName}
                                {place.businessStatus !== 'OPERATIONAL' && (
                                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Closed</span>
                                )}
                              </div>
                              <div className="text-xs text-brand-muted font-normal max-w-xs truncate">{place.address}</div>
                            </td>
                            <td className="p-3 text-xs text-brand-muted">{place.category}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-xs font-semibold text-brand-text">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                <span>{place.rating || 'N/A'}</span>
                                <span className="text-gray-400 font-normal">({place.reviewCount || 0})</span>
                              </div>
                            </td>
                            <td className="p-3">
                              {place.aiScore !== null && place.aiScore !== undefined ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-brand-text">{place.aiScore}</span>
                                    {classBadge}
                                    <button 
                                      onClick={() => handleAnalyzePlace(place.googlePlaceId, true)} 
                                      className="text-[10px] text-gray-400 hover:text-brand-primary underline ml-1"
                                      title="Re-analyze with Gemini AI"
                                    >
                                      Re-analyze
                                    </button>
                                  </div>
                                  {place.aiReason && (
                                    <p className="text-[11px] text-brand-muted max-w-xs line-clamp-2" title={place.aiReason}>
                                      {place.aiReason}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  disabled={place.analyzing}
                                  onClick={() => handleAnalyzePlace(place.googlePlaceId)}
                                  className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                >
                                  {place.analyzing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                  {place.analyzing ? 'Analyzing...' : 'Analyze'}
                                </Button>
                              )}
                            </td>
                            <td className="p-3 text-xs text-brand-muted">
                              <div className="font-mono">{place.phone || 'N/A'}</div>
                              {place.website ? (
                                <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline flex items-center gap-1 truncate max-w-[140px] mt-0.5">
                                  <Globe size={11} /> {place.website.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-gray-400 text-[11px]">No website</span>
                              )}
                            </td>
                            <td className="p-3">
                              <a 
                                href={place.googleMapsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-200 transition-colors"
                              >
                                <ExternalLink size={12} /> Maps
                              </a>
                            </td>
                            <td className="p-3 text-right">
                              {alreadyExists ? (
                                <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full">In CRM</span>
                              ) : (
                                <Button size="sm" onClick={() => handleAddSingleLead(place)} className="gap-1">
                                  <Plus size={14} /> Add Lead
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* CRM Leads Tab */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={crmSearchQuery}
                onChange={e => setCrmSearchQuery(e.target.value)}
                placeholder="Search CRM leads..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCrmLeads.map(lead => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-brand-text">
                        <Link to={`/leads/${lead.id}`} className="hover:text-brand-primary transition-colors">
                          {lead.companyName}
                        </Link>
                      </h3>
                      <p className="text-xs text-brand-muted">{lead.industry} • {lead.location}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {lead.aiScore !== undefined && lead.aiScore !== null && (
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                          AI: {lead.aiScore}
                        </span>
                      )}
                      <Badge variant="primary">{lead.status}</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-brand-muted">
                    <p>Phone: {lead.phone || 'N/A'}</p>
                    <p>Source: {lead.source || 'Manual'}</p>
                    {lead.aiReason && (
                      <p className="text-[11px] text-gray-500 mt-1 italic line-clamp-2">"{lead.aiReason}"</p>
                    )}
                  </div>
                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <Link to={`/leads/${lead.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Single Lead Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add Prospect"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAddModal}>Save Prospect</Button>
          </>
        }
      >
        <form onSubmit={handleSaveAddModal} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Company Name *</label>
              <input 
                type="text" 
                required
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="Acme Inc"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Contact Name</label>
              <input 
                type="text" 
                value={formData.contactName}
                onChange={e => setFormData({...formData, contactName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="john@acme.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Phone</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="+1 555-0199"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Location</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Website</label>
              <input 
                type="text" 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="https://acme.com"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Leads CSV"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <FileSpreadsheet size={16} className="mr-2" /> Download Template
            </Button>
            <Button onClick={handleProcessImport}>Process Import</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">
            Paste CSV rows to add leads to the database.
          </p>
          <textarea
            rows={5}
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="companyName,contactName,jobTitle,industry,location,website,email,phone,source"
            className="w-full font-mono text-xs p-3 border border-gray-200 rounded-lg"
          />
          {importStats && (
            <div className="p-3 bg-brand-success/10 text-brand-success rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>Successfully imported {importStats.imported} leads!</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
