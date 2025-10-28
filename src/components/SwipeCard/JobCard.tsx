import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Briefcase, TrendingUp } from 'lucide-react';
import { Job } from '@/types/database';
import { motion } from 'framer-motion';

interface JobCardProps {
  job: Job;
  style?: React.CSSProperties;
  isDragging?: boolean;
}

export const JobCard = ({ job, style, isDragging }: JobCardProps) => {
  return (
    <motion.div
      style={style}
      className={`absolute w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="h-full shadow-elevated border-2 overflow-hidden">
        <CardContent className="p-8 h-full flex flex-col">
          {/* Company Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-1 truncate">{job.title}</h3>
              <p className="text-lg text-muted-foreground truncate">
                {job.companies?.company_name || 'Company Name'}
              </p>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{job.location || 'Remote'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4 flex-shrink-0" />
              <span className="capitalize">{job.job_type}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span>{job.experience_required}+ years experience</span>
            </div>

            {job.salary_range && (
              <div className="text-lg font-semibold text-primary">
                {job.salary_range}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills_required.slice(0, 6).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-sm px-3 py-1"
                >
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 6 && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  +{job.skills_required.length - 6} more
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Description</h4>
            <p className="text-sm text-foreground line-clamp-4">
              {job.description}
            </p>
          </div>

          {/* Swipe Instructions */}
          <div className="mt-6 pt-6 border-t flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive font-bold">←</span>
              </div>
              <span>Pass</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Apply</span>
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <span className="text-success font-bold">→</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
