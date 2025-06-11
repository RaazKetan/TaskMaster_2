import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getCurrentUserId } from '../utils/auth';


const TaskContext = createContext();


export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      const response = await api.get('/tasks', { params: { userId } });
      setTasks(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);


  // CRUD operations
  const addTask = async (taskData) => {
    try {
      const userId = getCurrentUserId();
      const response = await api.post('/tasks', { ...taskData, userId });
      setTasks(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to add task');
      throw err;
    }
  };


  const updateTask = async (taskId, updatedData) => {
    try {
      const userId = getCurrentUserId();
      const response = await api.put(`/tasks/${taskId}`, { ...updatedData, userId });
      setTasks(prev => prev.map(task => (task._id || task.id) === taskId ? response.data : task));
      return response.data;
    } catch (err) {
      setError('Failed to update task');
      throw err;
    }
  };


  const deleteTask = async (taskId) => {
    try {
      const userId = getCurrentUserId();
      await api.delete(`/tasks/${taskId}`, { params: { userId } });
      setTasks(prev => prev.filter(task => (task._id || task.id) !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      throw err;
    }
  };


  return (
    <TaskContext.Provider value={{ tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};


export const useTasks = () => useContext(TaskContext);
