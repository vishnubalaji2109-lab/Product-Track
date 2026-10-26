import axiosInstance from '../api/axiosInstance';
import { STORAGE_KEYS } from '../constants/authConstants';
import { ResultFilterParams, SubmittedResultItem } from '../types/results';
import { getStoredSubmittedResults } from './qrService';

const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK_QR_API ?? import.meta.env.VITE_USE_MOCK_API) !== 'false';

export const resultsService = {
  /**
   * Retrieves all submitted QR scan results with optional client-side/server-side filtering
   */
  async getSubmittedResults(params?: ResultFilterParams): Promise<SubmittedResultItem[]> {
    if (!USE_MOCK) {
      const response = await axiosInstance.get<SubmittedResultItem[]>('/qr/results', {
        params,
      });
      return response.data;
    }

    await new Promise((r) => setTimeout(r, 400));
    let items = getStoredSubmittedResults();

    if (params) {
      if (params.searchQuery) {
        const q = params.searchQuery.toLowerCase().trim();
        items = items.filter(
          (i) =>
            i.qrCode.toLowerCase().includes(q) ||
            i.productName.toLowerCase().includes(q) ||
            i.productCode.toLowerCase().includes(q)
        );
      }

      if (params.status && params.status !== 'All') {
        items = items.filter((i) => i.status.toLowerCase() === params.status?.toLowerCase());
      }

      if (params.productName && params.productName !== 'All') {
        items = items.filter((i) => i.productName.includes(params.productName!));
      }

      if (params.startDate) {
        const start = new Date(params.startDate).getTime();
        items = items.filter((i) => new Date(i.scannedAt).getTime() >= start);
      }

      if (params.endDate) {
        const end = new Date(params.endDate).getTime();
        items = items.filter((i) => new Date(i.scannedAt).getTime() <= end);
      }
    }

    return items;
  },

  /**
   * Gets single scan details by ID
   */
  async getSubmittedResultById(id: string): Promise<SubmittedResultItem | null> {
    if (!USE_MOCK) {
      const response = await axiosInstance.get<SubmittedResultItem>(`/qr/results/${id}`);
      return response.data;
    }

    await new Promise((r) => setTimeout(r, 200));
    const items = getStoredSubmittedResults();
    return items.find((i) => i.id === id) || null;
  },

  /**
   * Deletes a submitted record
   */
  async deleteResult(id: string): Promise<boolean> {
    if (!USE_MOCK) {
      await axiosInstance.delete(`/qr/results/${id}`);
      return true;
    }

    await new Promise((r) => setTimeout(r, 300));
    const items = getStoredSubmittedResults();
    const filtered = items.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBMITTED_RESULTS, JSON.stringify(filtered));
    return true;
  },
};

export default resultsService;
