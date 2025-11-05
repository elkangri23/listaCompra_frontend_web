// listaCompra_frontend_web/mcp-server.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import https from 'https';

// Crear servidor MCP
const server = new McpServer({
    name: 'listacompra-frontend',
    version: '1.0.0',
    description: 'Frontend MCP para listaCompra - Consulta Backend MCP y expone componentes'
});

// ===== UTILITY: Consultar Backend MCP =====
// Función auxiliar para consultar el Backend MCP
async function queryBackendMCP(resourceName: string, params?: Record<string, string>) {
    try {
        let url = `http://localhost:3001/mcp`;
        
        // Construir la petición JSON-RPC para MCP
        const request = {
            jsonrpc: '2.0',
            id: '1',
            method: 'resources/read',
            params: {
                uri: params 
                    ? `resource://backend/${resourceName}/${Object.values(params).join('/')}`
                    : `resource://backend/${resourceName}`
            }
        };

        // Hacer la petición al Backend MCP
        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'localhost',
                port: 3001,
                path: '/mcp',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, (res: any) => {
                let data = '';
                res.on('data', (chunk: any) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            
            req.on('error', reject);
            req.write(JSON.stringify(request));
            req.end();
        });
    } catch (error) {
        console.error('Error querying Backend MCP:', error);
        throw error;
    }
}

// ===== RESOURCE 1: Componentes del Frontend =====
server.registerResource(
    'components',
    'resource://frontend/components',
    {
        title: 'Frontend Components',
        description: 'Lista de componentes React disponibles',
        mimeType: 'application/json'
    },
    async (uri) => {
        try {
            // Leer los directorios de componentes
            const componentsPath = path.join(process.cwd(), 'src', 'components');
            const dirs = await fs.readdir(componentsPath, { withFileTypes: true });
            
            const components = [];
            for (const dir of dirs) {
                if (dir.isDirectory()) {
                    const files = await fs.readdir(path.join(componentsPath, dir.name));
                    components.push({
                        category: dir.name,
                        files: files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
                    });
                }
            }
            
            const list = {
                total: components.length,
                components,
                description: 'Componentes disponibles para usar en el frontend'
            };
            
            return {
                contents: [{
                    uri: uri.href,
                    text: JSON.stringify(list, null, 2)
                }]
            };
        } catch (error) {
            const err = error as Error;
            return {
                contents: [{
                    uri: uri.href,
                    text: `Error: ${err.message}`
                }]
            };
        }
    }
);

// ===== RESOURCE 2: Backend API Documentation (desde Backend MCP) =====
server.registerResource(
    'backend-api',
    'resource://frontend/backend-api',
    {
        title: 'Backend API Documentation',
        description: 'Documentación del API del backend (consultada desde Backend MCP)',
        mimeType: 'application/json'
    },
    async (uri) => {
        try {
            // Aquí podrías hacer una petición HTTP al Backend MCP
            // Para simplificar, devolvemos un mensaje de instrucción
            return {
                contents: [{
                    uri: uri.href,
                    text: JSON.stringify({
                        message: 'Para obtener la documentación del backend, consulta:',
                        backendMCPUrl: 'http://localhost:3001/mcp',
                        resources: {
                            swagger: 'resource://backend/swagger',
                            entities: 'resource://backend/entities',
                            endpoints: 'resource://backend/endpoints'
                        }
                    }, null, 2)
                }]
            };
        } catch (error) {
            const err = error as Error;
            return {
                contents: [{
                    uri: uri.href,
                    text: `Error: ${err.message}`
                }]
            };
        }
    }
);

// ===== RESOURCE 3: Rutas de Next.js =====
server.registerResource(
    'app-routes',
    'resource://frontend/routes',
    {
        title: 'App Routes',
        description: 'Rutas configuradas en Next.js',
        mimeType: 'application/json'
    },
    async (uri) => {
        try {
            // Leer el directorio app de Next.js
            const appPath = path.join(process.cwd(), 'src', 'app');
            
            const walkDir = async (dir: string, baseDir: string = ''): Promise<string[]> => {
                const files = await fs.readdir(dir);
                const routes: string[] = [];
                
                for (const file of files) {
                    if (file.startsWith('[') || file === 'page.tsx' || file === 'layout.tsx') {
                        const routePath = baseDir ? `${baseDir}/${file}` : file;
                        routes.push(routePath);
                    }
                    
                    const fullPath = path.join(dir, file);
                    const stat = await fs.stat(fullPath);
                    if (stat.isDirectory() && !file.startsWith('_')) {
                        const subRoutes = await walkDir(fullPath, baseDir ? `${baseDir}/${file}` : file);
                        routes.push(...subRoutes);
                    }
                }
                
                return routes;
            };
            
            const routes = await walkDir(appPath);
            
            const list = {
                total: routes.length,
                routes,
                description: 'Rutas del frontend Next.js'
            };
            
            return {
                contents: [{
                    uri: uri.href,
                    text: JSON.stringify(list, null, 2)
                }]
            };
        } catch (error) {
            const err = error as Error;
            return {
                contents: [{
                    uri: uri.href,
                    text: `Error: ${err.message}`
                }]
            };
        }
    }
);

// ===== TOOL 1: Obtener información del backend =====
server.registerTool(
    'get-backend-info',
    {
        title: 'Get Backend Information',
        description: 'Obtiene información del backend (entities, endpoints)',
        inputSchema: {
            infoType: z.enum(['entities', 'endpoints', 'swagger']).describe('Tipo de información que quieres')
        },
        outputSchema: {
            type: z.string(),
            data: z.any()
        }
    },
    async ({ infoType }) => {
        try {
            let resourceName = '';
            switch (infoType) {
                case 'entities':
                    resourceName = 'entities';
                    break;
                case 'endpoints':
                    resourceName = 'endpoints';
                    break;
                case 'swagger':
                    resourceName = 'swagger';
                    break;
            }
            
            // Aquí podrías consultar el Backend MCP
            // Por ahora devolvemos un mensaje de guía
            const output = {
                type: infoType,
                data: {
                    message: `Para obtener ${infoType} del backend, usa:`,
                    backendMCPUrl: 'http://localhost:3001/mcp',
                    resource: `resource://backend/${resourceName}`
                }
            };
            
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
                structuredContent: output
            };
        } catch (error) {
            const err = error as Error;
            return {
                content: [{
                    type: 'text',
                    text: `Error: ${err.message}`
                }],
                isError: true
            };
        }
    }
);

// ===== TOOL 2: Listar componentes =====
server.registerTool(
    'list-components',
    {
        title: 'List Frontend Components',
        description: 'Lista todos los componentes disponibles en el frontend',
        inputSchema: {},
        outputSchema: {
            components: z.array(z.object({
                category: z.string(),
                files: z.array(z.string())
            })),
            total: z.number()
        }
    },
    async () => {
        try {
            const componentsPath = path.join(process.cwd(), 'src', 'components');
            const dirs = await fs.readdir(componentsPath, { withFileTypes: true });
            
            const components = [];
            for (const dir of dirs) {
                if (dir.isDirectory()) {
                    const files = await fs.readdir(path.join(componentsPath, dir.name));
                    components.push({
                        category: dir.name,
                        files: files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
                    });
                }
            }
            
            const output = {
                components,
                total: components.length
            };
            
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
                structuredContent: output
            };
        } catch (error) {
            const err = error as Error;
            return {
                content: [{
                    type: 'text',
                    text: `Error: ${err.message}`
                }],
                isError: true
            };
        }
    }
);

// ===== PROMPT: Crear componente sincronizado con backend =====
server.registerPrompt(
    'create-backend-synced-component',
    {
        title: 'Create Backend-Synced Component',
        description: 'Crea un componente React sincronizado con el backend',
        argsSchema: {
            componentName: z.string().describe('Nombre del componente a crear'),
            backendEndpoint: z.string().describe('Endpoint del backend a usar (ej: /api/lists)')
        }
    },
    ({ componentName, backendEndpoint }) => ({
        messages: [{
            role: 'user',
            content: {
                type: 'text',
                text: `Necesito crear un componente React llamado ${componentName} que consuma el endpoint ${backendEndpoint} del backend.

Por favor:
1. Obtén la información del endpoint desde el Backend MCP (resource://backend/swagger)
2. Entiende qué tipo de datos espera y retorna
3. Crea el componente React totalmente tipado con TypeScript
4. Incluye validaciones, manejo de errores y loading states
5. Usa las entidades y tipos del backend

El componente debe estar sincronizado con el backend.`
            }
        }]
    })
);

// ===== SETUP: Express y HTTP Transport =====
const app = express();
app.use(express.json());

// Endpoint para MCP
app.post('/mcp', async (req, res) => {
    try {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true
        });

        res.on('close', () => {
            transport.close();
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: { code: -32603, message: 'Internal server error' },
                id: null
            });
        }
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'Frontend MCP Server is running' });
});

// Detectar si usar stdio o HTTP
const USE_STDIO = process.env.USE_STDIO === 'true';

if (USE_STDIO) {
    // Modo stdio para Cline
    console.error('🔌 Frontend MCP Server starting in STDIO mode');
    const transport = new StdioServerTransport();
    server.connect(transport).catch((error: Error) => {
        console.error('STDIO transport error:', error);
        process.exit(1);
    });
} else {
    // Modo HTTP para uso manual
    const PORT = process.env.FRONTEND_MCP_PORT || 3002;
    app.listen(PORT, () => {
        console.log(`✅ Frontend MCP Server running on http://localhost:${PORT}/mcp`);
        console.log(`📦 Resources disponibles:`);
        console.log(`   - resource://frontend/components      (Lista de componentes)`);
        console.log(`   - resource://frontend/backend-api     (Info del backend)`);
        console.log(`   - resource://frontend/routes          (Rutas de Next.js)`);
        console.log(`🔧 Tools disponibles:`);
        console.log(`   - get-backend-info                    (Obtener info del backend)`);
        console.log(`   - list-components                     (Listar componentes)`);
        console.log(`💡 Backend MCP debe estar corriendo en http://localhost:3001/mcp`);
    }).on('error', (error: Error) => {
        console.error('Server error:', error);
        process.exit(1);
    });
}
