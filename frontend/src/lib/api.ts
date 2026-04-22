const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function getStats() {
  return fetchApi("/projects/stats");
}

export function getProjects() {
  return fetchApi("/projects");
}

export function getProject(id: string) {
  return fetchApi(`/projects/${id}`);
}

export function createProject(name: string, description: string) {
  return fetchApi("/projects", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export function deleteProject(id: string) {
  return fetchApi(`/projects/${id}`, { method: "DELETE" });
}

export function getAnalyses(projectId: string) {
  return fetchApi(`/projects/${projectId}/analyses`);
}

export function getThemes(projectId: string, analysisId: string) {
  return fetchApi(`/projects/${projectId}/analyses/${analysisId}/themes`);
}

export function streamAnalysis(
  projectId: string,
  rawInput: string,
  sourceType: string,
  onEvent: (event: string, data: any) => void,
) {
  const url = `${API_URL}/projects/${projectId}/analyses/stream`;

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawInput, sourceType }),
  }).then((res) => {
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    function read() {
      reader?.read().then(({ done, value }) => {
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventName = "";
        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            if (data && eventName) {
              try {
                onEvent(eventName, JSON.parse(data));
              } catch {}
            }
          }
        }
        read();
      });
    }
    read();
  });
}

export function streamCompetitorAnalysis(
  projectId: string,
  ownReviews: string,
  competitorReviews: string,
  onEvent: (event: string, data: any) => void,
) {
  const url = `${API_URL}/projects/${projectId}/analyses/competitor/stream`;

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ownReviews, competitorReviews }),
  }).then((res) => {
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    function read() {
      reader?.read().then(({ done, value }) => {
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventName = "";
        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            if (data && eventName) {
              try {
                onEvent(eventName, JSON.parse(data));
              } catch {}
            }
          }
        }
        read();
      });
    }
    read();
  });
}

export function getExportUrl(analysisId: string, format: "csv" | "markdown") {
  return `${API_URL}/export/${analysisId}/${format}`;
}
