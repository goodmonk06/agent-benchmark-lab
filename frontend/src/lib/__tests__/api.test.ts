import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api';

// Mock fetch
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSuites', () => {
    it('should fetch suites successfully', async () => {
      const mockSuites = [
        { id: '1', name: 'Suite 1', domain: 'code' },
        { id: '2', name: 'Suite 2', domain: 'writing' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuites,
      });

      const result = await api.getSuites();
      expect(result).toEqual(mockSuites);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/suites'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw error on failed request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      await expect(api.getSuites()).rejects.toThrow();
    });
  });

  describe('createSuite', () => {
    it('should create suite with correct payload', async () => {
      const newSuite = {
        name: 'New Suite',
        domain: 'code',
        description: 'Test suite',
      };

      const mockResponse = { id: '123', ...newSuite };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.createSuite(newSuite);
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/suites'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newSuite),
        })
      );
    });
  });
});
