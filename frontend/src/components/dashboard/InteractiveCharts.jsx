import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';

const InteractiveCharts = ({ data }) => {
  const [activeChart, setActiveChart] = useState('performance');

  const chartTypes = [
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'distribution', label: 'Distribution', icon: PieChartIcon },
    { id: 'comparison', label: 'Comparison', icon: BarChart3 },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data.projectStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.projectStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="projects" fill="#3b82f6" />
              <Bar dataKey="completed" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'activity':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={3} />
              <Line type="monotone" dataKey="meetings" stroke="#f59e0b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interactive Data Visualization</CardTitle>
          <div className="flex space-x-2">
            {chartTypes.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeChart === id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveChart(id)}
                className="flex items-center space-x-1"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChart}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderChart()}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default InteractiveCharts;