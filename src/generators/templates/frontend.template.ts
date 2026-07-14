// src/generators/templates/frontend.template.ts

export function generateHomeHtml(projectName: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: #1e293b;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    h1 { color: #38bdf8; margin-bottom: 0.5rem; }
    p { color: #94a3b8; }
    button {
      background: #0284c7;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }
    button:hover { background: #0369a1; }
    #response {
      margin-top: 1rem;
      padding: 1rem;
      background: #0f172a;
      border-radius: 6px;
      font-family: monospace;
      font-size: 0.9rem;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 ${projectName}</h1>
    <p>Generado unificadamente con <strong>Mystack CLI</strong>.</p>
    <button onclick="fetchUsers()">Probar Endpoint /api/v1/users</button>
    <div id="response">// La respuesta del backend aparecerá aquí...</div>
  </div>

  <script>
    async function fetchUsers() {
      const container = document.getElementById('response');
      container.innerText = 'Cargando...';
      try {
        const res = await fetch('/api/v1/users');
        const data = await res.json();
        container.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        container.innerText = 'Error conectando con la API: ' + err.message;
      }
    }
  </script>
</body>
</html>`;
}