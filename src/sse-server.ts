import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { setFilikaToken } from "./mcp-server.js";

export function createSSEServer(mcpServer: McpServer) {
  const app = express();

  const transportMap = new Map<string, SSEServerTransport>();

  app.get("/sse", async (req, res) => {
    const token = req.query.token as string;
    console.log("Token here:", token);
    if (!token) {
      console.error('Connection attempt without token');
      res.status(401).json({ error: 'Token is required' });
      return;
    }

    // Token'ı Filika servisine ayarla
    setFilikaToken(token);

    const transport = new SSEServerTransport("/messages", res);
    transportMap.set(transport.sessionId, transport);
    await mcpServer.connect(transport);
  });

  app.post("/messages", (req, res) => {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      console.error('Message received without sessionId');
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }

    const transport = transportMap.get(sessionId);

    if (transport) {
      transport.handlePostMessage(req, res);
    }
  });

  return app;
}