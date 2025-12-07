import axios from 'axios';
import { apiClient } from './auth';
import { InspectionRecord, QuotationRecord, AIOutputDefect } from '../types';

/**
 * Creates a new inspection record on the server using FormData.
 * @param formData The FormData object containing the inspection data and images.
 * @returns The created inspection record from the server.
 */
export const createInspection = async (formData: FormData): Promise<InspectionRecord> => {
  try {
    const { data } = await apiClient.post('/inspections', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data.data;
  } catch (error) {
    console.error('Error creating inspection:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create inspection');
    }
    throw error;
  }
};

export const getInspections = async (): Promise<InspectionRecord[]> => {
    try {
        const { data } = await apiClient.get('/inspections');
        return data.data;
    } catch (error) {
        console.error('Error fetching inspections:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch inspections');
        }
        throw error;
    }
};

export const deleteInspection = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/inspections/${id}`);
    } catch (error) {
        console.error(`Error deleting inspection ${id}:`, error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to delete inspection');
        }
        throw error;
    }
};

export const getQuotations = async (): Promise<QuotationRecord[]> => {
    try {
        const { data } = await apiClient.get('/quotations');
        return data.data;
    } catch (error) {
        console.error('Error fetching quotations:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch quotations');
        }
        throw error;
    }
};

export const getQuotation = async (id: string): Promise<QuotationRecord> => {
    try {
        const { data } = await apiClient.get(`/quotations/${id}`);
        return data.data;
    } catch (error) {
        console.error(`Error fetching quotation ${id}:`, error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch quotation');
        }
        throw error;
    }
};

export const createQuotation = async (quotationData: Partial<QuotationRecord>): Promise<QuotationRecord> => {
    try {
        const { data } = await apiClient.post('/quotations', quotationData);
        return data.data;
    } catch (error) {
        console.error('Error creating quotation:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to create quotation');
        }
        throw error;
    }
};

export const updateQuotation = async (id: string, quotationData: Partial<QuotationRecord>): Promise<QuotationRecord> => {
    try {
        const { data } = await apiClient.put(`/quotations/${id}`, quotationData);
        return data.data;
    } catch (error) {
        console.error(`Error updating quotation ${id}:`, error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update quotation');
        }
        throw error;
    }
};

export const deleteQuotation = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/quotations/${id}`);
    } catch (error) {
        console.error(`Error deleting quotation ${id}:`, error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to delete quotation');
        }
        throw error;
    }
};

export const getInspection = async (id: string): Promise<InspectionRecord> => {
    try {
        const { data } = await apiClient.get(`/inspections/${id}`);
        return data.data;
    } catch (error) {
        console.error(`Error fetching inspection ${id}:`, error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch inspection');
        }
        throw error;
    }
};

export const getDashboardSummary = async (): Promise<any> => {
    try {
        const { data } = await apiClient.get('/dashboard/summary');
        return data.data;
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch dashboard summary');
        }
        throw error;
    }
};

/**
 * Sends images to the AI for damage analysis.
 * @param images An array of File objects.
 * @returns A promise that resolves to the analysis data.
 */
export const analyzeDamage = async (images: File[]): Promise<AIOutputDefect[]> => {
  const formData = new FormData();
  images.forEach(image => {
    formData.append('files', image);
  });

  try {
    const { data } = await apiClient.post('/ai/analyze-damage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  } catch (error) {
    console.error('Error during AI damage analysis:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to analyze damages');
    }
    throw error;
  }
};
