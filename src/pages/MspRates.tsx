import React, { useState, useEffect } from 'react';
import { getMSPRates, getMSPHistory } from '../services/mspService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Calendar, Download, Info, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from 'react-hot-toast';

// Helper function to format currency in INR
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const MspRates = () => {
  const [mspData, setMspData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("kharif");
  const [sortConfig, setSortConfig] = useState({ key: 'crop', direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    async function fetchMSPData() {
      try {
        const data = await getMSPRates();
        setMspData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching MSP data:", error);
        toast.error("Failed to load MSP rates");
        setLoading(false);
      }
    }

    fetchMSPData();
  }, []);

  useEffect(() => {
    async function fetchHistoricalData() {
      if (!selectedCrop) return;

      setHistoryLoading(true);
      try {
        const history = await getMSPHistory(selectedCrop.id);
        setHistoricalData(history);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      } finally {
        setHistoryLoading(false);
      }
    }

    fetchHistoricalData();
  }, [selectedCrop]);

  // Filter by active tab and search term
  const filteredData = mspData.filter(item => 
    item.category === activeTab && 
    (searchTerm === '' || 
      item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.variety && item.variety.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Sort data based on current sort configuration
  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Generate CSV for export
  const exportToCSV = () => {
    const headers = ["Crop", "Variety", "MSP Rate (₹/quintal)", "Increase", "% Increase", "Year"];
    const csvData = sortedData.map(item => [
      item.crop,
      item.variety || '-',
      item.rate,
      item.increase || '-',
      item.increasePercentage ? `${item.increasePercentage}%` : '-',
      item.year
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `msp_rates_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} MSP rates exported successfully`);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'ascending' 
      ? <ArrowUpDown className="ml-2 h-4 w-4 text-green-500" /> 
      : <ArrowUpDown className="ml-2 h-4 w-4 text-red-500" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">
        Minimum Support Prices (MSP)
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
        Official MSP rates announced by the Government of India for agricultural crops
      </p>

      <Tabs defaultValue="kharif" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="kharif">Kharif Crops</TabsTrigger>
            <TabsTrigger value="rabi">Rabi Crops</TabsTrigger>
            <TabsTrigger value="other">Other Crops</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Input 
              placeholder="Search crops..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[200px]"
            />
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {['kharif', 'rabi', 'other'].map(category => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {category === 'kharif' ? 'Kharif' : category === 'rabi' ? 'Rabi' : 'Other'} Crop MSP Rates
                      <Badge className="ml-2 bg-green-600">
                        {category === 'kharif' ? 'Marketing Season 2024-25' : category === 'rabi' ? 'Marketing Season 2024-25' : 'Commercial Crops'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Last updated: April 2025
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="cursor-pointer" onClick={() => requestSort('crop')}>
                                Crop {getSortIcon('crop')}
                              </TableHead>
                              <TableHead>Variety</TableHead>
                              <TableHead className="cursor-pointer" onClick={() => requestSort('rate')}>
                                MSP Rate {getSortIcon('rate')}
                              </TableHead>
                              <TableHead className="cursor-pointer" onClick={() => requestSort('increasePercentage')}>
                                Increase {getSortIcon('increasePercentage')}
                              </TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedData.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                  No crops found. Try adjusting your search.
                                </TableCell>
                              </TableRow>
                            ) : (
                              sortedData.map((item) => (
                                <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <TableCell className="font-medium">{item.crop}</TableCell>
                                  <TableCell>{item.variety || '-'}</TableCell>
                                  <TableCell className="font-semibold">
                                    {formatCurrency(item.rate)}<span className="text-xs text-gray-500">/quintal</span>
                                  </TableCell>
                                  <TableCell>
                                    {item.increasePercentage ? (
                                      <div className="flex items-center">
                                        <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                                        <span className="text-green-600">
                                          {formatCurrency(item.increase)} ({item.increasePercentage}%)
                                        </span>
                                      </div>
                                    ) : '-'}
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setSelectedCrop(item)}
                                      className={selectedCrop?.id === item.id ? "bg-blue-100 dark:bg-blue-900" : ""}
                                    >
                                      <Info className="h-4 w-4 mr-1" /> History
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedCrop ? `${selectedCrop.crop} ${selectedCrop.variety ? `(${selectedCrop.variety})` : ''}` : 'Historical MSP Trend'}
                    </CardTitle>
                    <CardDescription>
                      {selectedCrop 
                        ? `5-year price trend analysis` 
                        : `Select a crop to view historical MSP rates`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!selectedCrop ? (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
                        <Info className="h-8 w-8 mb-2" />
                        <p>Click on 'History' button next to any crop to view its MSP trend over the years</p>
                      </div>
                    ) : historyLoading ? (
                      <div className="space-y-2 h-[300px] flex items-center justify-center">
                        <Skeleton className="h-[250px] w-full" />
                      </div>
                    ) : (
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={historicalData}
                            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => `Year: ${label}`} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="rate" 
                              name="MSP Rate" 
                              stroke="#22c55e" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {selectedCrop && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Current Rate Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Rate (2024-25):</span>
                            <span className="font-semibold">{formatCurrency(selectedCrop.rate)}/quintal</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Increase from last year:</span>
                            <span className="text-green-600 font-semibold">
                              {formatCurrency(selectedCrop.increase || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Percentage increase:</span>
                            <span className="text-green-600 font-semibold">
                              {selectedCrop.increasePercentage}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Crop season:</span>
                            <Badge variant="outline" className="capitalize">
                              {selectedCrop.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About {category === 'kharif' ? 'Kharif' : category === 'rabi' ? 'Rabi' : 'Other'} Crops MSP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  {category === 'kharif' && (
                    <p>
                      Kharif crops are the crops that are sown at the beginning of the monsoon season in India and harvested at the end of the monsoon season. The MSP (Minimum Support Price) for Kharif crops is announced before the sowing season to give farmers a guaranteed minimum price for their produce, protecting them from price fluctuations in the market.
                    </p>
                  )}
                  {category === 'rabi' && (
                    <p>
                      Rabi crops are winter season crops that are sown in October-November and harvested in April-May. The Government of India announces MSP for rabi crops to ensure farmers receive fair remuneration for their produce and to encourage them to grow these essential food crops.
                    </p>
                  )}
                  {category === 'other' && (
                    <p>
                      This category includes commercial crops like sugarcane, jute, and copra. These crops have specialized pricing mechanisms, such as Fair and Remunerative Price (FRP) for sugarcane, which takes into account factors like cost of production, recovery rates, and market prices.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MspRates;