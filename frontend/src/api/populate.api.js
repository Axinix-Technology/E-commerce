import axiosInstance from "./axiosInstance";

/**
 * Universal Dynamic Populate API Client Helper (Tracker-v2 Pattern)
 * Routes all standard entity data operations through /api/populate/:action/:model.
 */
export const populateApi = {
  /**
   * Reads documents with optional filtering, pagination, and field selection.
   */
  read: async (model, { filter = {}, page = 1, limit = 20, sort = { createdAt: -1 }, fields, populateFields } = {}) => {
    const response = await axiosInstance.post(`/populate/read/${model}`, {
      filter,
      page,
      limit,
      sort,
      fields,
      populateFields,
    });
    return response.data;
  },

  /**
   * Reads a single document by ID.
   */
  readOne: async (model, id, { fields, populateFields } = {}) => {
    const response = await axiosInstance.post(`/populate/read/${model}/${id}`, {
      fields,
      populateFields,
    });
    return response.data?.data;
  },

  /**
   * Creates a new document.
   */
  create: async (model, payload) => {
    const response = await axiosInstance.post(`/populate/create/${model}`, payload);
    return response.data;
  },

  /**
   * Updates an existing document by ID.
   */
  update: async (model, id, payload) => {
    const response = await axiosInstance.put(`/populate/update/${model}/${id}`, payload);
    return response.data;
  },

  /**
   * Deletes a document by ID.
   */
  delete: async (model, id) => {
    const response = await axiosInstance.delete(`/populate/delete/${model}/${id}`);
    return response.data;
  },

  /**
   * Runs an analytical report or safe aggregate.
   */
  report: async (model, { pipeline = [], filter = {} } = {}) => {
    const response = await axiosInstance.post(`/populate/report/${model}`, {
      pipeline,
      filter,
    });
    return response.data;
  },
};

export default populateApi;
