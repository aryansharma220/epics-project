import { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
// Using the browser's built-in toast functionality instead of component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import {
  Calendar,
  Download,
  ArrowUpDown,
  Info,
  CheckCircle2,
  XCircle,
  Landmark,
  Award,
  Building,
  FileText,
  Clock,
  Users,
  HelpCircle,
  Map,
  TrendingUp,
  Filter,
  ChevronDown,
  Search,
  Share2,
  Printer,
  Star,
  Bell,
  Bookmark
} from 'lucide-react';
import { getSchemes, checkEligibility } from '../services/schemeService';
import type { Scheme } from '../types';

// Component for visualizing success metrics
const SuccessMetric = ({ 
  label, 
  value, 
  icon,
  suffix = "",
  format = (v: number) => v.toLocaleString() 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode;
  suffix?: string;
  format?: (value: number) => string;
}) => (
  <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
    <div className="mb-2 text-green-600 dark:text-green-400">{icon}</div>
    <div className="text-2xl font-bold mb-1">{format(value)}{suffix}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{label}</div>
  </div>
);

// Timeline component
const Timeline = ({ timeline }: { timeline: Scheme['timeline'] }) => {
  if (!timeline) return null;
  
  const timelineItems = [
    { date: timeline.applicationStart, label: 'Application Start' },
    { date: timeline.applicationEnd, label: 'Application Deadline' },
    { date: timeline.implementationStart, label: 'Implementation Start' },
    { date: timeline.completionDate, label: 'Project Completion' }
  ].filter(item => item.date);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold mb-2 flex items-center">
        <Clock className="h-4 w-4 mr-2 text-orange-600" />
        Timeline
      </h4>
      <div className="relative space-y-3">
        {timelineItems.map((item, idx) => (
          <div key={item.label} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <div className="rounded-full h-3 w-3 bg-green-600"></div>
              {idx < timelineItems.length - 1 && <div className="h-full w-0.5 bg-gray-300 my-1"></div>}
            </div>
            <div>
              <span className="text-sm font-medium block">{item.label}</span>
              <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// FAQ component
const FAQSection = ({ faqs }: { faqs?: Array<{question: string; answer: string}> }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  if (!faqs || faqs.length === 0) return null;
  
  return (
    <div className="space-y-4 mt-6">
      <h4 className="text-lg font-semibold flex items-center">
        <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
        Frequently Asked Questions
      </h4>
      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              className="w-full text-left px-4 py-3 flex justify-between items-center"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <span className="font-medium">{faq.question}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openIndex === idx ? 'transform rotate-180' : ''}`} />
            </button>
            {openIndex === idx && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Required Documents component
const DocumentsList = ({ documents }: { documents?: string[] }) => {
  if (!documents || documents.length === 0) return null;
  
  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2 flex items-center">
        <FileText className="h-4 w-4 mr-2 text-purple-600" />
        Required Documents
      </h4>
      <ul className="list-disc pl-5 space-y-1">
        {documents.map((doc, idx) => (
          <li key={idx} className="text-sm">{doc}</li>
        ))}
      </ul>
    </div>
  );
};

const Schemes = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("agriculture");
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibilityData, setEligibilityData] = useState<Record<string, string>>({});
  const [eligibilityResult, setEligibilityResult] = useState<{ eligible: boolean; reasons: string[] } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterOptions, setFilterOptions] = useState({
    minSuccessRate: 0,
    maxBudget: 100000,
    selectedMinistries: [] as string[]
  });
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [subscribedSchemes, setSubscribedSchemes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSchemes() {
      try {
        const data = await getSchemes();
        setSchemes(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching schemes data:", error);
        window.alert("Failed to load government schemes");
        setLoading(false);
      }
    }

    fetchSchemes();
  }, []);

  // Filter by activeTab, search term, and filter options
  const filteredSchemes = schemes.filter(item => {
    // Base category filter
    if (item.category !== activeTab) return false;
    
    // Search term filter
    const searchMatch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchMatch) return false;
    
    // Advanced filters
    if (item.metrics?.successRate !== undefined && 
        item.metrics.successRate < filterOptions.minSuccessRate) {
      return false;
    }
    
    if (item.budget !== undefined && 
        item.budget > filterOptions.maxBudget) {
      return false;
    }
    
    if (filterOptions.selectedMinistries.length > 0 &&
        !filterOptions.selectedMinistries.includes(item.ministry)) {
      return false;
    }
    
    return true;
  });

  // Sort data based on current sort configuration
  const sortedSchemes = [...filteredSchemes].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Scheme];
    const bValue = b[sortConfig.key as keyof Scheme];
    
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction: direction as 'ascending' | 'descending' });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'ascending' 
      ? <ArrowUpDown className="ml-2 h-4 w-4 text-green-500" /> 
      : <ArrowUpDown className="ml-2 h-4 w-4 text-red-500" />;
  };

  const exportToCSV = () => {
    const headers = ['Scheme Name', 'Ministry/Department', 'Eligibility', 'Benefits', 'Application Process'];
    const csvContent = [
      headers.join(','), 
      ...sortedSchemes.map(scheme => [
        `"${scheme.name}"`,
        `"${scheme.ministry}"`,
        `"${scheme.eligibility.join('; ')}"`,
        `"${scheme.benefits.join('; ')}"`,
        `"${scheme.applicationProcess}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_government_schemes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.alert(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} schemes exported to CSV`);
  };

  const handleEligibilityCheck = async () => {
    if (!selectedScheme) return;
    
    setCheckingEligibility(true);
    try {
      const result = await checkEligibility(selectedScheme.id, eligibilityData);
      setEligibilityResult(result);
    } catch (error) {
      console.error("Error checking eligibility:", error);
      window.alert("Failed to check eligibility");
    } finally {
      setCheckingEligibility(false);
    }
  };

  const resetEligibilityCheck = () => {
    setEligibilityResult(null);
    setEligibilityData({});
  };

  const handleOpenEligibilityCheck = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    resetEligibilityCheck();
    setShowEligibilityModal(true);
  };

  const handleEligibilityInputChange = (key: string, value: string) => {
    setEligibilityData(prev => ({ ...prev, [key]: value }));
  };

  const toggleSubscription = (schemeId: string) => {
    setSubscribedSchemes(prev => {
      if (prev.includes(schemeId)) {
        return prev.filter(id => id !== schemeId);
      } else {
        return [...prev, schemeId];
      }
    });
    
    window.alert(
      subscribedSchemes.includes(schemeId) 
        ? "Unsubscribed from scheme notifications" 
        : "Subscribed to scheme notifications"
    );
  };

  const handlePrint = () => {
    if (!selectedScheme) return;
    window.print();
  };

  const handleShare = () => {
    if (!selectedScheme) return;
    
    if (navigator.share) {
      navigator.share({
        title: selectedScheme.name,
        text: `Check out this government scheme: ${selectedScheme.name}`,
        url: selectedScheme.website || window.location.href
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      window.alert(`Shareable link copied:\n${window.location.href}`);
      // In a real app, you'd actually copy the URL to clipboard here
    }
  };
  
  const uniqueMinistries = Array.from(new Set(schemes.map(scheme => scheme.ministry))).sort();
  
  const SchemeGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedSchemes.map(scheme => (
        <Card 
          key={scheme.id} 
          className={`cursor-pointer hover:shadow-md transition-shadow ${selectedScheme?.id === scheme.id ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setSelectedScheme(scheme)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {scheme.name}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSubscription(scheme.id);
                }}
              >
                {subscribedSchemes.includes(scheme.id) ? (
                  <Bell className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              Ministry of {scheme.ministry}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 line-clamp-2 text-sm h-10">
              {scheme.description}
            </div>
            <div className="flex justify-between items-center mt-4">
              {scheme.metrics?.successRate && (
                <div className="flex items-center text-sm">
                  <div className="flex space-x-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= Math.round(scheme.metrics!.successRate! / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-xs">{scheme.metrics.successRate}% success</span>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEligibilityCheck(scheme);
                }}
              >
                Check Eligibility
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">
        Government Schemes for Farmers
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
        Explore and check eligibility for government schemes to support agricultural development
      </p>

      <Tabs defaultValue="agriculture" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="agriculture">Agricultural Schemes</TabsTrigger>
            <TabsTrigger value="financial">Financial Assistance</TabsTrigger>
            <TabsTrigger value="insurance">Insurance Schemes</TabsTrigger>
            <TabsTrigger value="other">Other Schemes</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search schemes..." 
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-8 max-w-[200px]"
              />
            </div>
            
            <Button variant="outline" onClick={() => setShowFilterDialog(true)}>
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            
            <div className="border rounded-md flex">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                className="h-9 px-3" 
                onClick={() => setViewMode('list')}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                className="h-9 px-3" 
                onClick={() => setViewMode('grid')}
              >
                <Landmark className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {['agriculture', 'financial', 'insurance', 'other'].map(category => (
          <TabsContent key={category} value={category} className="space-y-6">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>
                          {category === 'agriculture' ? 'Agricultural Support' : 
                          category === 'financial' ? 'Financial Assistance' : 
                          category === 'insurance' ? 'Insurance Schemes' : 'Other Support'} Schemes
                          <Badge className="ml-2 bg-green-600">
                            {category === 'insurance' ? 'Updated April 2025' : 'FY 2025-26'}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            Last updated: April 2025
                          </div>
                        </CardDescription>
                      </div>
                      <div className="text-sm text-gray-500">
                        Showing {sortedSchemes.length} of {schemes.filter(s => s.category === activeTab).length} schemes
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : viewMode === 'list' ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
                                Scheme Name {getSortIcon('name')}
                              </TableHead>
                              <TableHead className="cursor-pointer" onClick={() => requestSort('ministry')}>
                                Ministry/Department {getSortIcon('ministry')}
                              </TableHead>
                              <TableHead className="cursor-pointer" onClick={() => requestSort('budget')}>
                                Budget (Cr) {getSortIcon('budget')}
                              </TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedSchemes.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4">
                                  No schemes found. Try adjusting your search or filters.
                                </TableCell>
                              </TableRow>
                            ) : (
                              sortedSchemes.map((item) => (
                                <TableRow 
                                  key={item.id}
                                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                  onClick={() => setSelectedScheme(item)}
                                >
                                  <TableCell className="font-medium flex items-center">
                                    {item.name}
                                    {subscribedSchemes.includes(item.id) && (
                                      <Bell className="h-3 w-3 ml-2 fill-yellow-400 text-yellow-400" />
                                    )}
                                  </TableCell>
                                  <TableCell>{item.ministry}</TableCell>
                                  <TableCell>
                                    {item.budget ? `₹${item.budget.toLocaleString()}` : '-'}
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        handleOpenEligibilityCheck(item);
                                      }}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-1" /> Check Eligibility
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <SchemeGridView />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Scheme Details Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {selectedScheme ? selectedScheme.name : 'Scheme Details'}
                        </CardTitle>
                        <CardDescription>
                          {selectedScheme 
                            ? `Ministry of ${selectedScheme.ministry}` 
                            : `Select a scheme to view details`}
                        </CardDescription>
                      </div>
                      {selectedScheme && (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleShare()}
                            className="h-8 w-8 p-0"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePrint()}
                            className="h-8 w-8 p-0"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => selectedScheme && toggleSubscription(selectedScheme.id)}
                            className="h-8 w-8 p-0"
                          >
                            {selectedScheme && subscribedSchemes.includes(selectedScheme.id) ? (
                              <Bell className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!selectedScheme ? (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
                        <Info className="h-12 w-12 mb-4 text-gray-400" />
                        <p className="mb-2">Select a scheme from the table to view its details</p>
                        <p className="text-sm">Learn about eligibility, benefits, and application process</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Main Description */}
                        <p className="text-gray-700 dark:text-gray-300">{selectedScheme.description}</p>
                        
                        {/* Success Metrics */}
                        {selectedScheme.metrics && (
                          <div className="grid grid-cols-2 gap-2 my-4">
                            {selectedScheme.metrics.beneficiaries && (
                              <SuccessMetric 
                                label="Beneficiaries" 
                                value={selectedScheme.metrics.beneficiaries} 
                                icon={<Users className="h-5 w-5" />} 
                              />
                            )}
                            {selectedScheme.metrics.successRate && (
                              <SuccessMetric 
                                label="Success Rate" 
                                value={selectedScheme.metrics.successRate} 
                                icon={<TrendingUp className="h-5 w-5" />}
                                suffix="%"
                              />
                            )}
                            {selectedScheme.metrics.statesCovered && (
                              <SuccessMetric 
                                label="States Covered" 
                                value={selectedScheme.metrics.statesCovered} 
                                icon={<Map className="h-5 w-5" />}
                              />
                            )}
                            {selectedScheme.metrics.avgPayout && (
                              <SuccessMetric 
                                label="Avg. Payout" 
                                value={selectedScheme.metrics.avgPayout} 
                                icon={<Award className="h-5 w-5" />}
                                suffix=" ₹"
                                format={(v) => `${Math.floor(v / 1000)}K`}
                              />
                            )}
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Eligibility Criteria
                          </h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {selectedScheme.eligibility.map((item, idx) => (
                              <li key={idx} className="text-sm">{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Award className="h-4 w-4 mr-2 text-blue-600" />
                            Benefits Provided
                          </h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {selectedScheme.benefits.map((item, idx) => (
                              <li key={idx} className="text-sm">{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Required documents section */}
                        <DocumentsList documents={selectedScheme.documents} />
                        
                        {/* Timeline section */}
                        <Timeline timeline={selectedScheme.timeline} />
                        
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Building className="h-4 w-4 mr-2 text-purple-600" />
                            How to Apply
                          </h4>
                          <p className="text-sm">{selectedScheme.applicationProcess}</p>
                        </div>
                        
                        <div className="flex gap-3 pt-3">
                          <Button 
                            className="flex-1" 
                            onClick={() => handleOpenEligibilityCheck(selectedScheme)}
                          >
                            Check Eligibility
                          </Button>
                          {selectedScheme.website && (
                            <Button 
                              variant="outline"
                              className="flex-1"
                              onClick={() => window.open(selectedScheme.website, '_blank')}
                            >
                              Visit Official Site
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* FAQ Section */}
                {selectedScheme?.faqs && selectedScheme.faqs.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <FAQSection faqs={selectedScheme.faqs} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Scheme Category Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About {category === 'agriculture' ? 'Agricultural' : category === 'financial' ? 'Financial' : category === 'insurance' ? 'Insurance' : 'Support'} Schemes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  {category === 'agriculture' && (
                    <p>
                      Agricultural support schemes are designed to provide farmers with technical assistance, subsidies on agricultural inputs, infrastructure development, and marketing support. These schemes aim to increase agricultural productivity, promote sustainable farming practices, and improve farmers' livelihoods.
                    </p>
                  )}
                  {category === 'financial' && (
                    <p>
                      Financial assistance schemes provide farmers with credit at concessional rates, interest subvention, and direct financial support. These schemes help farmers invest in modern agricultural equipment, irrigation facilities, high-quality seeds, and other inputs necessary for improving farm productivity and income.
                    </p>
                  )}
                  {category === 'insurance' && (
                    <p>
                      Agricultural insurance schemes protect farmers against crop failures due to natural calamities, pests, and diseases. These schemes provide financial security to farmers and encourage them to adopt modern farming techniques by mitigating the risk involved in agriculture.
                    </p>
                  )}
                  {category === 'other' && (
                    <p>
                      This category includes specialized schemes that focus on rural development, skill development, organic farming certification, and market linkages. These schemes complement the agricultural, financial, and insurance schemes to provide comprehensive support to farmers.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Landmark className="h-5 w-5 mr-2" />
                    Scheme Implementation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Most government schemes are implemented through respective state agricultural departments in collaboration with banks, insurance companies, and local administrative bodies. The funds are directly transferred to beneficiaries' accounts through Direct Benefit Transfer (DBT).
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Eligibility Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The eligibility check tool provides an indicative assessment based on the criteria specified by scheme guidelines. For final confirmation, please visit your nearest Agriculture Extension Center or contact the implementing agency mentioned in the scheme details.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Updates and Revisions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Government schemes are periodically revised with changes in budget allocations, eligibility criteria, and benefits. This platform is updated regularly to reflect the latest information, but farmers are advised to verify the current status from official sources before application.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Eligibility Check Modal Dialog */}
      <Dialog open={showEligibilityModal} onOpenChange={setShowEligibilityModal}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Check Eligibility: {selectedScheme?.name}</DialogTitle>
            <DialogDescription>
              Enter your information to check if you're eligible for this scheme
            </DialogDescription>
          </DialogHeader>
          
          {eligibilityResult ? (
            <div className="py-6">
              <div className="flex items-center justify-center mb-6">
                {eligibilityResult.eligible ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-medium text-green-600">You are eligible!</h3>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-medium text-red-600">Not eligible</h3>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {eligibilityResult.eligible ? (
                  <p className="text-center">
                    Based on the information provided, you meet the eligibility criteria for this scheme.
                  </p>
                ) : (
                  <>
                    <p className="text-center mb-4">
                      Based on the information provided, you don't currently meet the eligibility criteria.
                    </p>
                    <div>
                      <h4 className="font-medium mb-2">Reasons:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {eligibilityResult.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={resetEligibilityCheck}>
                    Check Again
                  </Button>
                  <div className="flex gap-2">
                    {eligibilityResult.eligible && selectedScheme?.website && (
                      <Button variant="outline" onClick={() => window.open(selectedScheme.website, '_blank')}>
                        Apply Now
                      </Button>
                    )}
                    <Button onClick={() => setShowEligibilityModal(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {selectedScheme?.eligibilityFields.map((field) => (
                <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor={field.id} className="text-right text-sm font-medium">
                    {field.label}
                  </label>
                  <div className="col-span-3">
                    {field.type === 'select' ? (
                      <select
                        id={field.id}
                        value={eligibilityData[field.id] || ''}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => handleEligibilityInputChange(field.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select...</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'number' ? (
                      <Input
                        id={field.id}
                        type="number"
                        value={eligibilityData[field.id] || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleEligibilityInputChange(field.id, e.target.value)}
                      />
                    ) : (
                      <Input
                        id={field.id}
                        value={eligibilityData[field.id] || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleEligibilityInputChange(field.id, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={() => setShowEligibilityModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEligibilityCheck} disabled={checkingEligibility}>
                  {checkingEligibility ? "Checking..." : "Check Eligibility"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Schemes</DialogTitle>
            <DialogDescription>
              Refine the schemes based on your preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Minimum Success Rate: {filterOptions.minSuccessRate}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filterOptions.minSuccessRate}
                onChange={(e) => setFilterOptions(prev => ({...prev, minSuccessRate: parseInt(e.target.value)}))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Maximum Budget: ₹{filterOptions.maxBudget.toLocaleString()} Cr
              </label>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={filterOptions.maxBudget}
                onChange={(e) => setFilterOptions(prev => ({...prev, maxBudget: parseInt(e.target.value)}))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹1,000 Cr</span>
                <span>₹100,000 Cr</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Ministry/Department
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                {uniqueMinistries.map(ministry => (
                  <div key={ministry} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`ministry-${ministry}`}
                      checked={filterOptions.selectedMinistries.includes(ministry)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterOptions(prev => ({
                            ...prev,
                            selectedMinistries: [...prev.selectedMinistries, ministry]
                          }));
                        } else {
                          setFilterOptions(prev => ({
                            ...prev,
                            selectedMinistries: prev.selectedMinistries.filter(m => m !== ministry)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`ministry-${ministry}`} className="text-sm">
                      {ministry}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={() => setFilterOptions({
                  minSuccessRate: 0,
                  maxBudget: 100000,
                  selectedMinistries: []
                })}
              >
                Reset Filters
              </Button>
              <Button onClick={() => setShowFilterDialog(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schemes;