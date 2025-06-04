import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

const TeamMetricsWidget = ({ team, index }) => {
  const efficiency = team.efficiency || Math.floor(60 + Math.random() * 35);
  const projectsCompleted = team.completed || 0;
  const totalProjects = team.projects || 0;
  const completionRate = totalProjects > 0 ? Math.round((projectsCompleted / totalProjects) * 100) : 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        delay: index * 0.1
      }
    },
    hover: {
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (efficiency) => {
    if (efficiency >= 80) return { variant: 'success', label: 'Excellent' };
    if (efficiency >= 60) return { variant: 'warning', label: 'Good' };
    return { variant: 'destructive', label: 'Needs Improvement' };
  };

  const badge = getEfficiencyBadge(efficiency);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold truncate">
              {team.name}
            </CardTitle>
            <Badge variant={badge.variant === 'success' ? 'default' : badge.variant}>
              {badge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Projects Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                <CountUp end={totalProjects} duration={2} />
              </div>
              <p className="text-xs text-slate-600">Total Projects</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                <CountUp end={projectsCompleted} duration={2} />
              </div>
              <p className="text-xs text-slate-600">Completed</p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Completion Rate</span>
              <span className="text-slate-600">{completionRate}%</span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: index * 0.1 + 0.5 }}
            >
              <Progress value={completionRate} className="h-2" />
            </motion.div>
          </div>

          {/* Team Efficiency */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Team Efficiency</span>
              <span className={`font-bold ${getEfficiencyColor(efficiency)}`}>
                {efficiency}%
              </span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: index * 0.1 + 0.8 }}
            >
              <Progress value={efficiency} className="h-2" />
            </motion.div>
          </div>

          {/* Members Count */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Team Members</span>
              <span className="font-medium">
                {team.members ? team.members.length : 0} members
              </span>
            </div>
          </div>

          {/* Animated Background Effect */}
          <motion.div
            className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full opacity-5"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TeamMetricsWidget;