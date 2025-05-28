import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { setFilikaToken } from "./mcp-server.js";

export function createSSEServer(mcpServer: McpServer) {
  const app = express();

  // Tüm istekleri logla
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log("Query:", req.query);
    console.log("Headers:", Object.keys(req.headers).reduce((acc, key) => {
      acc[key] = key.toLowerCase().includes('token') || key.toLowerCase().includes('auth') ? 
        req.headers[key] : '[HIDDEN]';
      return acc;
    }, {} as any));
    next();
  });

  // CORS ayarları
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // JSON parsing middleware
  app.use(express.json());

  const transportMap = new Map<string, SSEServerTransport>();

  app.get("/sse", async (req, res) => {
    console.log("SSE bağlantı isteği alındı");
    console.log("Query parametreleri:", req.query);
    console.log("Headers:", req.headers);
    console.log("URL:", req.url);
    console.log("Original URL:", req.originalUrl);

    // Token'ı farklı yerlerden almaya çalış
    let token = req.query.token as string;
    
    // Eğer query'de yoksa header'da ara
    if (!token) {
      token = req.headers.authorization?.replace('Bearer ', '') || '';
    }
    
    // Eğer hala yoksa URL'yi parse et
    if (!token) {
      const urlParts = req.originalUrl.split('?');
      if (urlParts.length > 1) {
        const params = new URLSearchParams(urlParts[1]);
        token = params.get('token') || '';
      }
    }

    // Environment variable'dan da kontrol et
    if (!token) {
      token = process.env.FILIKA_TOKEN || '';
    }

    console.log("Bulunan token:", token ? token.substring(0, 20) + "..." : "Token bulunamadı");
    
    if (!token) {
      console.error("Token parametresi bulunamadı!");
      res.status(400).json({ 
        error: 'Token parametresi gerekli',
        debug: {
          query: req.query,
          url: req.url,
          originalUrl: req.originalUrl,
          hasEnvToken: !!process.env.FILIKA_TOKEN
        }
      });
      return;
    }

    try {
      // Token'ı Filika servisine ayarla
      setFilikaToken(token);
      console.log("Token başarıyla ayarlandı:", token.substring(0, 20) + "...");
      
      const transport = new SSEServerTransport("/messages", res);
      transportMap.set(transport.sessionId, transport);
      console.log("SSE transport oluşturuldu, session ID:", transport.sessionId);
      
      await mcpServer.connect(transport);
      console.log("MCP server bağlantısı kuruldu");
    } catch (error) {
      console.error("SSE bağlantı hatası:", error);
      res.status(500).json({ error: 'Server bağlantı hatası', details: error });
    }
  });

  // Token'ı URL path'inde de kabul et
  app.get("/sse/:token", async (req, res) => {
    console.log("SSE bağlantı isteği alındı (path parametresi ile)");
    const token = req.params.token;
    
    console.log("Path'den alınan token:", token ? token.substring(0, 20) + "..." : "Token bulunamadı");
    
    if (!token) {
      res.status(400).json({ error: 'Token parametresi gerekli' });
      return;
    }

    try {
      setFilikaToken(token);
      console.log("Token başarıyla ayarlandı:", token.substring(0, 20) + "...");
      
      const transport = new SSEServerTransport("/messages", res);
      transportMap.set(transport.sessionId, transport);
      await mcpServer.connect(transport);
    } catch (error) {
      console.error("SSE bağlantı hatası:", error);
      res.status(500).json({ error: 'Server bağlantı hatası' });
    }
  });

  app.post("/messages", (req, res) => {
    const sessionId = req.query.sessionId as string;
    console.log("Message alındı, session ID:", sessionId);
    
    if (!sessionId) {
      console.error('Message received without sessionId');
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }

    const transport = transportMap.get(sessionId);

    if (transport) {
      transport.handlePostMessage(req, res);
    } else {
      console.error('Transport bulunamadı, session ID:', sessionId);
      console.log('Mevcut session ID\'ler:', Array.from(transportMap.keys()));
      res.status(404).json({ error: 'Session not found' });
    }
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // Debug endpoint
  app.get("/debug", (req, res) => {
    res.json({
      activeSessions: Array.from(transportMap.keys()),
      query: req.query,
      headers: req.headers,
      url: req.url,
      hasEnvToken: !!process.env.FILIKA_TOKEN
    });
  });

  return app;
}
