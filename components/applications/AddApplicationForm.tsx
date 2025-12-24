import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, ChevronDown, GraduationCap, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { generateMockData } from '@/lib/mockData';

const { students, universities } = generateMockData();

// Only show students who are eligible for applications (contract signed, active profile)
const eligibleStudents = students.filter(s => 
  ['contract_signed', 'active_profile', 'submitted_to_admin', 'returned_by_admin'].includes(s.status)
);

const applicationSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  universityId: z.string().min(1, 'Please select a university'),
  program: z.string().min(1, 'Please select a program'),
  batch: z.enum(['1', '2'], { required_error: 'Please select a batch' }),
  priority: z.string().min(1, 'Please set priority'),
  notes: z.string().optional(),
  // Additional application fields
  intendedMajor: z.string().optional(),
  startSemester: z.string().optional(),
  scholarshipInterest: z.boolean().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface AddApplicationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddApplicationForm: React.FC<AddApplicationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const [universitySearchOpen, setUniversitySearchOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<typeof universities[0] | null>(null);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      studentId: '',
      universityId: '',
      program: '',
      batch: undefined,
      priority: '',
      notes: '',
      intendedMajor: '',
      startSemester: '',
      scholarshipInterest: false,
    },
  });

  const watchedUniversityId = form.watch('universityId');

  const handleUniversitySelect = (universityId: string) => {
    const uni = universities.find(u => u.id === universityId);
    setSelectedUniversity(uni || null);
    form.setValue('universityId', universityId);
    form.setValue('program', ''); // Reset program when university changes
    setUniversitySearchOpen(false);
  };

  const onSubmit = (values: ApplicationFormValues) => {
    console.log('Creating application:', values);
    // In a real app, this would call an API
    onSuccess();
  };

  const selectedStudent = eligibleStudents.find(s => s.id === form.watch('studentId'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Student Selection */}
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Student *</FormLabel>
              <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {selectedStudent ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{selectedStudent.name}</span>
                          <span className="text-muted-foreground">({selectedStudent.email})</span>
                        </div>
                      ) : (
                        'Select a student...'
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search students..." />
                    <CommandList>
                      <CommandEmpty>No students found.</CommandEmpty>
                      <CommandGroup heading="Eligible Students">
                        {eligibleStudents.map((student) => (
                          <CommandItem
                            key={student.id}
                            value={student.name}
                            onSelect={() => {
                              form.setValue('studentId', student.id);
                              setStudentSearchOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{student.name}</span>
                              <span className="text-xs text-muted-foreground">{student.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Only students with signed contracts can have applications created
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* University Selection */}
        <FormField
          control={form.control}
          name="universityId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>University *</FormLabel>
              <Popover open={universitySearchOpen} onOpenChange={setUniversitySearchOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {selectedUniversity ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{selectedUniversity.name}</span>
                          <span className="text-muted-foreground">({selectedUniversity.country})</span>
                        </div>
                      ) : (
                        'Select a university...'
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search universities..." />
                    <CommandList>
                      <CommandEmpty>No universities found.</CommandEmpty>
                      <CommandGroup heading="Partner Universities">
                        {universities.filter(u => u.isPartner && u.isActive).map((uni) => (
                          <CommandItem
                            key={uni.id}
                            value={uni.name}
                            onSelect={() => handleUniversitySelect(uni.id)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{uni.name}</span>
                              <span className="text-xs text-muted-foreground">{uni.city}, {uni.country}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup heading="Other Universities">
                        {universities.filter(u => !u.isPartner && u.isActive).map((uni) => (
                          <CommandItem
                            key={uni.id}
                            value={uni.name}
                            onSelect={() => handleUniversitySelect(uni.id)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{uni.name}</span>
                              <span className="text-xs text-muted-foreground">{uni.city}, {uni.country}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Program Selection */}
        <FormField
          control={form.control}
          name="program"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedUniversity}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedUniversity ? "Select a program" : "Select university first"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectedUniversity?.programs.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Batch & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="batch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Batch 1 (First 2 universities)</SelectItem>
                    <SelectItem value="2">Batch 2 (Next 3 universities)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  2+3 strategy: First submit to top 2, then next 3
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Set priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 - Top Choice</SelectItem>
                    <SelectItem value="2">2 - High Priority</SelectItem>
                    <SelectItem value="3">3 - Medium Priority</SelectItem>
                    <SelectItem value="4">4 - Low Priority</SelectItem>
                    <SelectItem value="5">5 - Safety School</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Start Semester */}
        <FormField
          control={form.control}
          name="startSemester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intended Start Semester</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fall_2024">Fall 2024</SelectItem>
                  <SelectItem value="spring_2025">Spring 2025</SelectItem>
                  <SelectItem value="fall_2025">Fall 2025</SelectItem>
                  <SelectItem value="spring_2026">Spring 2026</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional notes about this application..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <GraduationCap className="w-4 h-4 mr-2" />
            Create Application
          </Button>
        </div>
      </form>
    </Form>
  );
};
