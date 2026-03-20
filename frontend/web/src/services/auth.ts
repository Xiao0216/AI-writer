import api from './api';

export const authService = {
  login: (data: { phone: string; password: string }) =>
    api.post('/auth/login', data),
  
  loginWithCode: (phone: string, code: string) =>
    api.post('/auth/login-with-code', { phone, code }),
  
  register: (data: { phone: string; password: string; nickname?: string }) =>
    api.post('/auth/register', data),
  
  sendCode: (phone: string) =>
    api.post('/auth/send-code', { phone }),
  
  refreshToken: () =>
    api.post('/auth/refresh'),
};

export const worksService = {
  list: (params?: { page?: number; pageSize?: number; status?: string }) =>
    api.get('/works', { params }),
  
  get: (id: string) =>
    api.get(`/works/${id}`),
  
  create: (data: { title: string; category: string; targetPlatform: string; description?: string }) =>
    api.post('/works', data),
  
  update: (id: string, data: Partial<any>) =>
    api.patch(`/works/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/works/${id}`),
};

export const chaptersService = {
  list: (workId: string) =>
    api.get(`/works/${workId}/chapters`),
  
  get: (workId: string, chapterId: string) =>
    api.get(`/works/${workId}/chapters/${chapterId}`),
  
  create: (workId: string, data: { title: string; content?: string }) =>
    api.post(`/works/${workId}/chapters`, data),
  
  update: (workId: string, chapterId: string, data: Partial<any>) =>
    api.patch(`/works/${workId}/chapters/${chapterId}`, data),
  
  delete: (workId: string, chapterId: string) =>
    api.delete(`/works/${workId}/chapters/${chapterId}`),
};

export const knowledgeGraphService = {
  getSummary: (workId: string) =>
    api.get(`/works/${workId}/knowledge-graph/summary`),
  
  getCharacters: (workId: string) =>
    api.get(`/works/${workId}/knowledge-graph/characters`),
  
  createCharacter: (workId: string, data: any) =>
    api.post(`/works/${workId}/knowledge-graph/characters`, data),
  
  updateCharacter: (workId: string, characterId: string, data: any) =>
    api.patch(`/works/${workId}/knowledge-graph/characters/${characterId}`, data),
  
  getWorldSettings: (workId: string) =>
    api.get(`/works/${workId}/knowledge-graph/world-settings`),
  
  getTimeline: (workId: string) =>
    api.get(`/works/${workId}/knowledge-graph/timeline`),
  
  getForeshadowings: (workId: string, status?: string) =>
    api.get(`/works/${workId}/knowledge-graph/foreshadowings`, { params: { status } }),
};

export const plotEngineService = {
  getNodes: (workId: string, volumeNumber?: number) =>
    api.get(`/works/${workId}/plot-engine/nodes`, { params: { volumeNumber } }),
  
  createNode: (workId: string, data: any) =>
    api.post(`/works/${workId}/plot-engine/nodes`, data),
  
  updateNode: (workId: string, nodeId: string, data: any) =>
    api.patch(`/works/${workId}/plot-engine/nodes/${nodeId}`, data),
  
  getOutline: (workId: string) =>
    api.get(`/works/${workId}/plot-engine/outline`),
  
  createOutline: (workId: string, data: any) =>
    api.post(`/works/${workId}/plot-engine/outline`, data),
  
  getProgress: (workId: string) =>
    api.get(`/works/${workId}/plot-engine/progress`),
};

export const aiGenerationService = {
  generateOpening: (workId: string, data: any) =>
    api.post(`/works/${workId}/ai/opening`, data),
  
  continueChapter: (workId: string, chapterId: string, data: any) =>
    api.post(`/works/${workId}/chapters/${chapterId}/ai/continue`, data),
  
  generateOutline: (workId: string, data: any) =>
    api.post(`/works/${workId}/ai/outline`, data),
  
  expand: (workId: string, data: { content: string; targetWordCount: number }) =>
    api.post(`/works/${workId}/ai/expand`, data),
  
  condense: (workId: string, data: { content: string; targetWordCount: number }) =>
    api.post(`/works/${workId}/ai/condense`, data),
  
  rewrite: (workId: string, data: { content: string; style?: string }) =>
    api.post(`/works/${workId}/ai/rewrite`, data),
  
  generateDialogue: (workId: string, data: any) =>
    api.post(`/works/${workId}/ai/dialogue`, data),
  
  generateInspiration: (workId: string, data: any) =>
    api.post(`/works/${workId}/ai/inspiration`, data),
};

export const complianceService = {
  sensitiveWordCheck: (workId: string, data: { content: string; platform?: string }) =>
    api.post(`/works/${workId}/compliance/sensitive-words`, data),
  
  originalityCheck: (workId: string, data: { content: string }) =>
    api.post(`/works/${workId}/compliance/originality`, data),
};

export const copyrightService = {
  createCertificate: (workId: string, data: { content: string; chapterId?: string }) =>
    api.post(`/works/${workId}/copyright/certificate`, data),
  
  getCertificates: (workId: string) =>
    api.get(`/works/${workId}/copyright/certificates`),
};
