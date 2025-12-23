import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, MapPin, GraduationCap, CheckCircle, Globe } from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/EduFlareUI';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockUniversities = [
  { id: 'uni-1', name: 'Zhejiang University', country: 'China', city: 'Hangzhou', programs: ['Computer Science', 'Engineering', 'Business'], isPartner: true, studentsPlaced: 45 },
  { id: 'uni-2', name: 'Beijing University', country: 'China', city: 'Beijing', programs: ['Medicine', 'Law', 'Arts'], isPartner: true, studentsPlaced: 38 },
  { id: 'uni-3', name: 'Tsinghua University', country: 'China', city: 'Beijing', programs: ['Engineering', 'Science', 'Architecture'], isPartner: true, studentsPlaced: 52 },
  { id: 'uni-4', name: 'Delhi University', country: 'India', city: 'Delhi', programs: ['Commerce', 'Arts', 'Science'], isPartner: true, studentsPlaced: 28 },
  { id: 'uni-5', name: 'IIT Bombay', country: 'India', city: 'Mumbai', programs: ['Engineering', 'Technology', 'Design'], isPartner: false, studentsPlaced: 15 },
  { id: 'uni-6', name: 'Istanbul University', country: 'Turkey', city: 'Istanbul', programs: ['Medicine', 'Law', 'Engineering'], isPartner: true, studentsPlaced: 22 },
  { id: 'uni-7', name: 'Fudan University', country: 'China', city: 'Shanghai', programs: ['Business', 'Economics', 'Social Sciences'], isPartner: true, studentsPlaced: 31 },
  { id: 'uni-8', name: 'IIT Delhi', country: 'India', city: 'Delhi', programs: ['Engineering', 'Computer Science', 'Design'], isPartner: false, studentsPlaced: 12 },
];

const StaffUniversityList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const filteredUniversities = mockUniversities.filter((uni) => {
    const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === 'all' || uni.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const countries = [...new Set(mockUniversities.map(u => u.country))];
  const partnerCount = mockUniversities.filter(u => u.isPartner).length;
  const totalStudentsPlaced = mockUniversities.reduce((sum, u) => sum + u.studentsPlaced, 0);

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">University List</h1>
          <p className="text-muted-foreground mt-1">Browse partner universities and programs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockUniversities.length}</p>
                  <p className="text-sm text-muted-foreground">Total Universities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{partnerCount}</p>
                  <p className="text-sm text-muted-foreground">Partner Universities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{countries.length}</p>
                  <p className="text-sm text-muted-foreground">Countries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalStudentsPlaced}</p>
                  <p className="text-sm text-muted-foreground">Students Placed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search universities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* University Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUniversities.map((uni, index) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    {uni.isPartner && (
                      <StatusBadge status="Partner" variant="success" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{uni.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {uni.city}, {uni.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Programs</p>
                      <div className="flex flex-wrap gap-1">
                        {uni.programs.map((program) => (
                          <span
                            key={program}
                            className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                          >
                            {program}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Students Placed</span>
                        <span className="font-semibold text-foreground">{uni.studentsPlaced}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No universities found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
};

export default StaffUniversityList;
