const request = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, options);
  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }

  if (!response.ok) {
    throw new Error(data.detail || `Request failed (${response.status})`);
  }

  return data;
};

export const getHealth = () => request("/");
export const getTimeline = () => request("/timeline");
export const getAnomalies = () => request("/anomaly/detect");

export const uploadEvidence = (file) => {
  const form = new FormData();
  form.append("file", file);
  return request("/evidence/upload", { method: "POST", body: form });
};

export const verifyEvidence = (filename, originalHash) => {
  const form = new FormData();
  form.append("filename", filename);
  form.append("original_hash", originalHash);
  return request("/evidence/verify", { method: "POST", body: form });
};