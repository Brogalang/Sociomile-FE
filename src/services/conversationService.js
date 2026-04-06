import api from "../api/axios";

export const getConversations = async (page = 1, limit = 10) => {
  try {

    const res = await api.get(`/conversations?page=${page}&limit=${limit}`);

    return res.data.data;

  } catch (err) {

    console.error("getConversations error:", err);
    throw err;

  }
};

export const getMessages = async (conversationId) => {
  try {

    const res = await api.get(`/conversations/${conversationId}/messages`);

    return res.data;

  } catch (err) {

    console.error("getMessages error:", err);
    throw err;

  }
};

export const sendMessage = async (conversationId, message) => {
  try {

    const res = await api.post(`/conversations/${conversationId}/messages`, {
      message,
    });

    return res.data;

  } catch (err) {

    console.error("sendMessage error:", err);
    throw err;

  }
};

export const markAsRead = async (conversationId) => {
  try {

    const res = await api.patch(`/conversations/${conversationId}/read`);

    return res.data;

  } catch (err) {

    console.error("markAsRead error:", err);
    throw err;

  }
};