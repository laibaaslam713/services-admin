import { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/services', { params });
      setServices(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = async (formData) => {
    const res = await api.post('/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    toast.success(res.data.message || 'Service created!');
    return res.data.data;
  };

  const updateService = async (id, formData) => {
    const res = await api.put(`/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    toast.success(res.data.message || 'Service updated!');
    return res.data.data;
  };

  const deleteService = async (id) => {
    await api.delete(`/services/${id}`);
    toast.success('Service deleted successfully');
    setServices(prev => prev.filter(s => s._id !== id));
  };

  return { services, pagination, loading, fetchServices, createService, updateService, deleteService };
};
