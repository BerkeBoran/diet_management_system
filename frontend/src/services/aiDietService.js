import api from './api';

const aiDietService = {
  startGeneration: async (threadId = null, forceRefresh = false) => {
    const response = await api.post('/ai-dietician/generate/', {
      action: 'start',
      thread_id: threadId,
      force_refresh_analysis: forceRefresh,
    });
    return response.data;
  },

  reviseDiet: async (threadId, revisionNote) => {
    const response = await api.post('/ai-dietician/generate/', {
      action: 'revise',
      thread_id: threadId,
      revision_note: revisionNote,
    });
    return response.data;
  },

  approveDiet: async (threadId) => {
    const response = await api.post('/ai-dietician/generate/', {
      action: 'approve',
      thread_id: threadId,
    });
    return response.data;
  },
};

export default aiDietService;