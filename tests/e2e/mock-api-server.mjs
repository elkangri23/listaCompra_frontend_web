/**
 * Mock API Server para tests E2E
 * Emula el backend de listaCompra en http://localhost:3333/api/v1
 *
 * Permite ejecutar los tests E2E de forma hermética, sin necesidad de
 * levantar el backend real ni la base de datos.
 *
 * Uso: node tests/e2e/mock-api-server.mjs
 */

import http from 'http';
import crypto from 'crypto';

const PORT = process.env.MOCK_PORT ? parseInt(process.env.MOCK_PORT, 10) : 3333;

// ============ Estado en memoria ============

const state = {
  users: [
    {
      id: 'user-test-0001',
      email: 'test@example.com',
      password: 'Password123!',
      nombre: 'Usuario',
      apellidos: 'Test',
      nombreCompleto: 'Usuario Test',
      rol: 'USER',
      activo: true,
      emailVerificado: true,
    },
    {
      id: 'user-mfa-0001',
      email: 'mfa@example.com',
      password: 'Password123!',
      nombre: 'Usuario',
      apellidos: 'MFA',
      nombreCompleto: 'Usuario MFA',
      rol: 'USER',
      activo: true,
      emailVerificado: true,
      // TOTP activo para el E2E del login dos pasos (CU-MFA fase 1)
      totpEnabled: true,
      totpSecret: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
    },
    {
      id: 'user-admin-0001',
      email: 'admin@example.com',
      password: 'Admin123!',
      nombre: 'Admin',
      apellidos: 'Test',
      nombreCompleto: 'Admin Test',
      rol: 'ADMIN',
      activo: true,
      emailVerificado: true,
    },
  ],
  lists: new Map(), // id -> { ...lista, products: Map }
  invitations: new Map(), // hash -> { id, listId, email, tipoPermiso, status }
  categories: [
    { id: 'cat-frutas', nombre: 'Frutas y Verduras', tiendaId: 'tienda-default' },
    { id: 'cat-lacteos', nombre: 'Lácteos y Huevos', tiendaId: 'tienda-default' },
    { id: 'cat-carnes', nombre: 'Carnes y Pescados', tiendaId: 'tienda-default' },
    { id: 'cat-panaderia', nombre: 'Panadería', tiendaId: 'tienda-default' },
    { id: 'cat-despensa', nombre: 'Despensa', tiendaId: 'tienda-default' },
    { id: 'cat-bebidas', nombre: 'Bebidas', tiendaId: 'tienda-default' },
  ],
};
// ---------- MFA (CU-MFA fase 1) ----------
// Challenges de login MFA de un solo uso (5 min, máx 5 intentos)
const mfaChallenges = new Map(); // challengeId -> { userId, intentos, expiraAt, usado }

/**
 * TOTP RFC 6238 (SHA-1, 6 dígitos, 30s) — el E2E calcula el código esperado
 * con el mismo algoritmo que el backend real.
 */
function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const ch of input.replace(/=+$/, '').toUpperCase()) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function totpCodeAt(secretBase32, timeSeconds) {
  const key = base32Decode(secretBase32);
  const counter = Math.floor(timeSeconds / 30);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}

function totpValidNow(secretBase32, code) {
  const now = Math.floor(Date.now() / 1000);
  // Ventana ±1 período (igual que el backend: tolerancia 31s → 3 epochs)
  return [-1, 0, 1].some((w) => totpCodeAt(secretBase32, now + w * 30) === code);
}


let listCounter = 0;
function nextListId() {
  return `list-${String(++listCounter).padStart(4, '0')}`;
}

// ============ Utilidades ============

function makeToken(user) {
  // JWT simplificado: header.payload.signature (base64url), exp en 24h
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    userId: user.id,
    email: user.email,
    name: user.nombreCompleto,
    role: user.rol,
    iat: now,
    exp: now + 24 * 60 * 60,
  };
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.mock-signature`;
}

function apiUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function sendJson(res, status, body) {
  const data = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    // CORS: los tests navegan en http://localhost:3000 y llaman a este server
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function makeList(nombre, descripcion, propietarioId) {
  const id = nextListId();
  const now = new Date().toISOString();
  return {
    id,
    nombre,
    descripcion: descripcion || '',
    propietarioId,
    tiendaId: 'tienda-default',
    activa: true,
    createdAt: now,
    updatedAt: now,
    fechaCreacion: now,
    fechaActualizacion: now,
    products: new Map(),
  };
}

function makeProduct(nombre, opts = {}) {
  const id = `prod-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  return {
    id,
    listaId: opts.listaId || '',
    nombre,
    descripcion: opts.descripcion || undefined,
    cantidad: opts.cantidad ?? 1,
    unidad: opts.unidad || 'unidad',
    precio: opts.precio ?? 0,
    urgente: opts.urgente ?? false,
    comprado: opts.comprado ?? false,
    categoriaId: opts.categoriaId || null,
    categoriaNombre: opts.categoriaId
      ? state.categories.find((c) => c.id === opts.categoriaId)?.nombre
      : undefined,
    notes: '',
    fechaCreacion: now,
    fechaCompra: opts.comprado ? now : undefined,
  };
}

function listToJson(list) {
  const { products, ...rest } = list;
  return rest;
}

function productToJson(p) {
  return p;
}

// Categorización "IA" simple por palabras clave
function suggestCategory(nombre) {
  const n = nombre.toLowerCase();
  const rules = [
    [/(manzana|plátano|platano|naranja|tomate|lechuga|cebolla|zanahoria|verdura|fruta|papa|patata|ensalada)/, 'Frutas y Verduras'],
    [/(leche|yogur|queso|huevo|mantequilla|nata)/, 'Lácteos y Huevos'],
    [/(carne|pollo|pescado|cerdo|ternera|atún|atun|salmón|salmon|jamón|jamon)/, 'Carnes y Pescados'],
    [/(pan|bollo|croissant|baguette|tostada)/, 'Panadería'],
    [/(agua|refresco|zumo|jugo|vino|cerveza|bebida)/, 'Bebidas'],
  ];
  for (const [regex, categoria] of rules) {
    if (regex.test(n)) {
      const cat = state.categories.find((c) => c.nombre === categoria);
      if (cat) return cat;
    }
  }
  return state.categories.find((c) => c.id === 'cat-despensa');
}

// ============ Router ============

const server = http.createServer(async (req, res) => {
  // Log de peticiones: visible en los logs del WebServer de Playwright en CI
  console.log(`[mock] ${req.method} ${req.url}`);
  if (req.method === 'OPTIONS') {
    sendJson(res, 204);
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  // El baseURL ya incluye /api/v1 → la ruta real empieza tras ese prefijo
  let path = url.pathname.replace(/^\/api\/v1/, '');
  if (!path.startsWith('/')) path = '/' + path;
  const method = req.method;
  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? await readBody(req) : {};
  const seg = path.split('/').filter(Boolean); // ej: ['lists','list-0001','products']

  try {
    // ---------- CU-17: stream SSE de listas ----------
    // Mock mínimo: conexión estable que solo emite keep-alive; los flujos
    // E2E no dependen de eventos en tiempo real.
    if (seg[0] === 'lists' && seg[1] && seg[2] === 'stream' && method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
      });
      res.write(
        `event: LIST_STREAM_CONNECTED\ndata: ${JSON.stringify({
          listId: seg[1],
          type: 'LIST_STREAM_CONNECTED',
          payload: {},
          timestamp: new Date().toISOString(),
        })}\n\n`
      );
      const keepAlive = setInterval(() => {
        res.write(
          `event: keep-alive\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`
        );
      }, 30000);
      req.on('close', () => clearInterval(keepAlive));
      return;
    }

    // ---------- AUTH ----------
    if (path === '/auth/login' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = body.password || '';
      const user = state.users.find((u) => u.email === email && u.password === password);
      if (!user) {
        sendJson(res, 401, { success: false, message: 'Credenciales incorrectas' });
        return;
      }

      // Usuario con TOTP activo → paso 1 devuelve mfaRequired + challengeId
      if (user.totpEnabled) {
        const challengeId = crypto.randomUUID();
        mfaChallenges.set(challengeId, {
          userId: user.id,
          intentos: 0,
          expiraAt: Date.now() + 5 * 60 * 1000,
          usado: false,
        });
        sendJson(res, 200, {
          success: true,
          data: { mfaRequired: true, mfa: { challengeId } },
          message: 'Autenticación exitosa',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      sendJson(res, 200, {
        success: true,
        data: {
          user: apiUser(user),
          tokens: {
            accessToken: makeToken(user),
            refreshToken: makeToken(user),
            expiresIn: 86400,
          },
        },
        message: 'Login exitoso',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Paso 2 del login MFA (CU-MFA fase 1): challengeId + code | backupCode
    if (path === '/auth/login/mfa' && method === 'POST') {
      const challengeId = String(body.challengeId || '');
      const challenge = mfaChallenges.get(challengeId);
      if (!challenge || challenge.usado || challenge.expiraAt <= Date.now()) {
        mfaChallenges.delete(challengeId);
        sendJson(res, 410, {
          success: false,
          error: { type: 'MFA_ERROR', code: 'CHALLENGE_EXPIRED', message: 'Vuelve a iniciar sesión' },
        });
        return;
      }
      const user = state.users.find((u) => u.id === challenge.userId);
      if (!user || !user.totpEnabled) {
        sendJson(res, 410, {
          success: false,
          error: { type: 'MFA_ERROR', code: 'CHALLENGE_EXPIRED', message: 'Vuelve a iniciar sesión' },
        });
        return;
      }

      const hasCode = typeof body.code === 'string';
      const hasBackup = typeof body.backupCode === 'string';
      if (hasCode === hasBackup) {
        sendJson(res, 400, {
          success: false,
          error: { type: 'MFA_ERROR', code: 'TOTP_CODE_INVALID', message: 'Código incorrecto.' },
        });
        return;
      }

      const valid = hasCode
        ? totpValidNow(user.totpSecret, body.code)
        : // backup code del E2E: valor fijo conocido
          body.backupCode.replace(/\s|-/g, '').toUpperCase() === 'AAAAZZZZ';

      if (!valid) {
        challenge.intentos += 1;
        if (challenge.intentos >= 5) {
          mfaChallenges.delete(challengeId);
          sendJson(res, 429, {
            success: false,
            error: { type: 'MFA_ERROR', code: 'MFA_TOO_MANY_ATTEMPTS', message: 'Demasiados intentos incorrectos.' },
          });
          return;
        }
        sendJson(res, 400, {
          success: false,
          error: {
            type: 'MFA_ERROR',
            code: hasCode ? 'TOTP_CODE_INVALID' : 'BACKUP_CODE_INVALID',
            message: 'Código incorrecto.',
          },
        });
        return;
      }

      // Éxito: challenge de un solo uso + tokens definitivos
      challenge.usado = true;
      mfaChallenges.delete(challengeId);
      sendJson(res, 200, {
        success: true,
        data: {
          user: apiUser(user),
          tokens: { accessToken: makeToken(user), refreshToken: makeToken(user), expiresIn: 86400 },
          mfaInfo: hasCode ? { method: 'TOTP' } : { method: 'BACKUP_CODE', backupUsed: true },
        },
        message: 'Autenticación MFA exitosa',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (path === '/auth/register' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      if (state.users.some((u) => u.email === email)) {
        sendJson(res, 409, { success: false, message: 'El email ya está registrado' });
        return;
      }
      const user = {
        id: `user-${crypto.randomUUID().slice(0, 8)}`,
        email,
        password: body.password,
        nombre: body.nombre || 'Usuario',
        apellidos: body.apellidos || '',
        nombreCompleto: `${body.nombre || 'Usuario'} ${body.apellidos || ''}`.trim(),
        rol: 'USER',
        activo: true,
        emailVerificado: false,
      };
      state.users.push(user);
      sendJson(res, 201, {
        success: true,
        // El backend real devuelve verificationEmailSent cuando el correo
        // con el código se envió (item 3); el mock lo simula como enviado
        data: { user: { ...apiUser(user), verificationEmailSent: true } },
        message: 'Usuario registrado correctamente',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // ---------- PERFIL (13A): /auth/me ----------
    // El usuario se identifica por el token Bearer del mock (payload con userId)
    const authUser = (() => {
      const header = req.headers.authorization || '';
      const token = header.replace(/^Bearer\s+/i, '');
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        return state.users.find((u) => u.id === payload.userId || u.id === payload.sub) || null;
      } catch {
        return null;
      }
    })();

    // Estado MFA (Bearer): pinta la pestaña Seguridad del perfil
    if (path === '/auth/mfa/status' && method === 'GET') {
      const user = authUser ?? null;
      if (!user) {
        sendJson(res, 401, { success: false, message: 'No autenticado' });
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          totpEnabled: Boolean(user.totpEnabled),
          totpPending: false,
          passkeyCount: 0,
          backupCodesLeft: user.totpEnabled ? 10 : 0,
        },
        message: 'Estado MFA',
        timestamp: new Date().toISOString(),
      });
      return;
    }


    if (path === '/auth/me' && method === 'GET') {
      if (!authUser) return sendJson(res, 401, { success: false, message: 'Token de acceso requerido' });
      sendJson(res, 200, {
        id: authUser.id,
        name: authUser.nombreCompleto,
        email: authUser.email,
        roles: [authUser.rol],
        image: null,
      });
      return;
    }

    if (path === '/auth/me' && method === 'PATCH') {
      if (!authUser) return sendJson(res, 401, { success: false, message: 'Token de acceso requerido' });
      if (typeof body.name === 'string' && body.name.trim()) {
        const [nombre, ...resto] = body.name.trim().split(/\s+/);
        authUser.nombre = nombre;
        authUser.apellidos = resto.join(' ');
        authUser.nombreCompleto = body.name.trim();
      }
      if (typeof body.email === 'string' && body.email.trim()) {
        authUser.email = body.email.trim().toLowerCase();
      }
      sendJson(res, 200, {
        id: authUser.id,
        name: authUser.nombreCompleto,
        email: authUser.email,
        roles: [authUser.rol],
        image: null,
      });
      return;
    }

    if (path === '/auth/me/password' && method === 'PATCH') {
      if (!authUser) return sendJson(res, 401, { success: false, message: 'Token de acceso requerido' });
      if (!body.currentPassword || body.currentPassword !== authUser.password) {
        return sendJson(res, 401, { success: false, message: 'La contraseña actual no es correcta' });
      }
      authUser.password = body.newPassword;
      sendJson(res, 200, { mensaje: 'Contraseña actualizada exitosamente' });
      return;
    }

    // ---------- TIENDAS ----------
    if (path === '/stores' && method === 'GET') {
      sendJson(res, 200, {
        success: true,
        data: [
          { id: 'tienda-default', nombre: 'Supermercado', direccion: 'Calle Falsa 123', activa: true },
        ],
      });
      return;
    }

    // ---------- LISTAS ----------
    if (path === '/lists' && method === 'GET') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      // Ordenar por creación descendente (las más nuevas primero), como un backend real
      const all = [...state.lists.values()]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .filter((l) => !q || l.nombre.toLowerCase().includes(q))
        .map(listToJson);
      const start = (page - 1) * limit;
      const items = all.slice(start, start + limit);
      sendJson(res, 200, {
        success: true,
        data: { items, total: all.length, page, limit, totalPages: Math.max(1, Math.ceil(all.length / limit)) },
      });
      return;
    }

    if (path === '/lists' && method === 'POST') {
      const owner = state.users[0];
      const list = makeList(body.nombre || 'Lista sin nombre', body.descripcion, owner.id);
      if (body.tiendaId) list.tiendaId = body.tiendaId;
      state.lists.set(list.id, list);
      sendJson(res, 201, { success: true, data: listToJson(list) });
      return;
    }

    if (seg[0] === 'lists' && seg.length === 2 && seg[1] !== 'reorder') {
      const list = state.lists.get(seg[1]);
      if (!list) {
        sendJson(res, 404, { success: false, message: 'Lista no encontrada' });
        return;
      }
      if (method === 'GET') {
        sendJson(res, 200, { success: true, data: listToJson(list) });
        return;
      }
      if (method === 'PUT' || method === 'PATCH') {
        if (body.nombre !== undefined) list.nombre = body.nombre;
        if (body.descripcion !== undefined) list.descripcion = body.descripcion;
        list.updatedAt = new Date().toISOString();
        list.fechaActualizacion = list.updatedAt;
        sendJson(res, 200, { success: true, data: listToJson(list) });
        return;
      }
      if (method === 'DELETE') {
        state.lists.delete(seg[1]);
        sendJson(res, 200, { success: true });
        return;
      }
    }

    // ---------- COLABORADORES (13A) ----------
    // GET /lists/:id/collaborators, PATCH/DELETE /lists/:id/collaborators/:userId
    if (seg[0] === 'lists' && seg[2] === 'collaborators' && seg.length === 3 && method === 'GET') {
      const list = state.lists.get(seg[1]);
      if (!list) return sendJson(res, 404, { success: false, message: 'Lista no encontrada' });
      const owner = state.users.find((u) => u.id === list.propietarioId);
      const collaborators = [];
      if (owner) {
        collaborators.push({
          id: `owner-${owner.id}`,
          userId: owner.id,
          userName: owner.nombreCompleto,
          userEmail: owner.email,
          role: 'owner',
          joinedAt: list.createdAt,
        });
      }
      for (const inv of state.invitations.values()) {
        if (inv.listId !== seg[1] || inv.status === 'RECHAZADA' || !inv.email) continue;
        const user = state.users.find((u) => u.email === inv.email);
        collaborators.push({
          id: inv.id,
          userId: user?.id || inv.id,
          userName: user?.nombreCompleto || inv.email,
          userEmail: inv.email,
          role: inv.tipoPermiso === 'ESCRITURA' ? 'editor' : 'viewer',
          joinedAt: inv.createdAt,
        });
      }
      sendJson(res, 200, collaborators);
      return;
    }

    if (seg[0] === 'lists' && seg[2] === 'collaborators' && seg.length === 4 && method === 'PATCH') {
      const inv = [...state.invitations.values()].find(
        (i) => i.listId === seg[1] && (i.id === seg[3] || state.users.find((u) => u.email === i.email)?.id === seg[3])
      );
      if (!inv) return sendJson(res, 404, { success: false, message: 'Colaborador no encontrado' });
      if (body.role === 'editor') inv.tipoPermiso = 'ESCRITURA';
      if (body.role === 'viewer') inv.tipoPermiso = 'LECTURA';
      const user = state.users.find((u) => u.email === inv.email);
      sendJson(res, 200, {
        id: inv.id,
        userId: user?.id || inv.id,
        userName: user?.nombreCompleto || inv.email,
        userEmail: inv.email,
        role: body.role,
        joinedAt: inv.createdAt,
      });
      return;
    }

    if (seg[0] === 'lists' && seg[2] === 'collaborators' && seg.length === 4 && method === 'DELETE') {
      const inv = [...state.invitations.values()].find(
        (i) => i.listId === seg[1] && (i.id === seg[3] || state.users.find((u) => u.email === i.email)?.id === seg[3])
      );
      if (inv) state.invitations.delete(inv.id);
      res.writeHead(204);
      res.end();
      return;
    }

    if (seg[0] === 'lists' && seg[2] === 'summary' && method === 'GET') {
      const list = state.lists.get(seg[1]);
      if (!list) return sendJson(res, 404, { success: false, message: 'Lista no encontrada' });
      const products = [...list.products.values()];
      sendJson(res, 200, {
        totalProductos: products.length,
        productosComprados: products.filter((p) => p.comprado).length,
        productosPendientes: products.filter((p) => !p.comprado).length,
        valorTotalEstimado: products.reduce((acc, p) => acc + (p.precio || 0) * (p.cantidad || 1), 0),
        productosUrgentes: products.filter((p) => p.urgente).length,
      });
      return;
    }

    // ---------- PRODUCTOS ----------
    if (seg[0] === 'lists' && seg[2] === 'products' && seg.length === 3) {
      const list = state.lists.get(seg[1]);
      if (!list) return sendJson(res, 404, { success: false, message: 'Lista no encontrada' });

      if (method === 'GET') {
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '20', 10);
        const all = [...list.products.values()].map(productToJson);
        const start = (page - 1) * limit;
        const items = all.slice(start, start + limit);
        sendJson(res, 200, { items, total: all.length, page, limit, totalPages: Math.max(1, Math.ceil(all.length / limit)) });
        return;
      }
      if (method === 'POST') {
        const product = makeProduct(body.nombre || 'Producto', { ...body, listaId: list.id });
        list.products.set(product.id, product);
        sendJson(res, 201, productToJson(product));
        return;
      }
    }

    if (seg[0] === 'lists' && seg[2] === 'products' && seg.length === 4 && seg[3] !== 'reorder' && seg[3] !== 'purchased') {
      const list = state.lists.get(seg[1]);
      const product = list?.products.get(seg[3]);
      if (!list || !product) {
        sendJson(res, 404, { success: false, message: 'Producto no encontrado' });
        return;
      }
      if (method === 'PUT' || method === 'PATCH') {
        if (body.nombre !== undefined) product.nombre = body.nombre;
        if (body.descripcion !== undefined) product.descripcion = body.descripcion;
        if (body.cantidad !== undefined) product.cantidad = body.cantidad;
        if (body.urgente !== undefined) product.urgente = body.urgente;
        if (body.precio !== undefined) product.precio = body.precio;
        if (body.categoriaId !== undefined) {
          product.categoriaId = body.categoriaId;
          product.categoriaNombre = state.categories.find((c) => c.id === body.categoriaId)?.nombre;
        }
        sendJson(res, 200, productToJson(product));
        return;
      }
      if (method === 'DELETE') {
        list.products.delete(seg[3]);
        sendJson(res, 200, { success: true, id: seg[3] });
        return;
      }
    }

    if (seg[0] === 'lists' && seg[2] === 'products' && seg[3] === 'reorder' && method === 'PATCH') {
      sendJson(res, 200, { success: true });
      return;
    }

    if (seg[0] === 'lists' && seg[2] === 'products' && seg[4] === 'purchased' && method === 'PATCH') {
      const list = state.lists.get(seg[1]);
      const product = list?.products.get(seg[3]);
      if (!list || !product) {
        sendJson(res, 404, { success: false, message: 'Producto no encontrado' });
        return;
      }
      product.comprado = body.comprado !== undefined ? body.comprado : !product.comprado;
      product.fechaCompra = product.comprado ? new Date().toISOString() : undefined;
      sendJson(res, 200, productToJson(product));
      return;
    }

    // ---------- CATEGORÍAS ----------
    if (path === '/categories' && method === 'GET') {
      sendJson(res, 200, { categorias: state.categories, total: state.categories.length });
      return;
    }

    // ---------- INVITACIONES ----------
    if (seg[0] === 'invitations' && seg[2] === 'share' && method === 'POST') {
      const list = state.lists.get(seg[1]);
      if (!list) return sendJson(res, 404, { success: false, message: 'Lista no encontrada' });

      // Modo email: { email, tipoPermiso }
      if (body.email) {
        const invitation = {
          id: `inv-${crypto.randomUUID().slice(0, 8)}`,
          listId: list.id,
          listName: list.nombre,
          email: body.email,
          tipoPermiso: body.tipoPermiso || 'LECTURA',
          status: 'PENDIENTE',
          createdAt: new Date().toISOString(),
        };
        state.invitations.set(invitation.id, invitation);
        sendJson(res, 201, { success: true, data: { id: invitation.id }, message: 'Invitación enviada' });
        return;
      }

      // Modo enlace: { tipoPermiso, duracionHoras }
      const hash = crypto.randomUUID().replace(/-/g, '');
      const link = {
        id: `inv-${crypto.randomUUID().slice(0, 8)}`,
        listId: list.id,
        hash,
        tipoPermiso: body.tipoPermiso || 'LECTURA',
        status: 'ACTIVA',
        createdAt: new Date().toISOString(),
      };
      state.invitations.set(link.id, link);
      sendJson(res, 201, {
        success: true,
        data: {
          id: link.id,
          hash,
          tipoPermiso: link.tipoPermiso,
          expiraEn: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          enlaceAcceso: `http://localhost:3000/invitations/${hash}`,
        },
      });
      return;
    }

    if (path === '/invitations/pending' && method === 'GET') {
      const pending = [...state.invitations.values()]
        .filter((i) => i.status === 'PENDIENTE')
        .map((i) => ({
          id: i.id,
          listId: i.listId,
          listName: i.listName,
          from: 'Usuario Test',
          createdAt: i.createdAt,
        }));
      sendJson(res, 200, pending);
      return;
    }

    if (seg[0] === 'invitations' && seg[2] === 'decline' && method === 'POST') {
      const invitation = state.invitations.get(seg[1]);
      if (invitation) invitation.status = 'RECHAZADA';
      sendJson(res, 200, { success: true });
      return;
    }

    if (seg[0] === 'invitations' && seg[2] === 'list' && method === 'GET') {
      // 13A: el backend real devuelve {success, message, data: [...]}, no el array directo
      const data = [...state.invitations.values()]
        .filter((i) => i.listId === seg[1] && i.status !== 'RECHAZADA' && i.email)
        .map((i) => ({
          id: i.id,
          listaId: i.listId,
          hash: i.hash || '',
          tipoPermiso: i.tipoPermiso,
          creadaEn: i.createdAt,
          expiraEn: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          activa: true,
          emailInvitado: i.email,
        }));
      sendJson(res, 200, { success: true, message: 'Invitaciones obtenidas exitosamente', data });
      return;
    }

    if (seg[0] === 'invitations' && seg[2] === 'permissions' && method === 'DELETE') {
      const collab = [...state.invitations.values()].find((i) => i.id === seg[3]);
      if (collab) state.invitations.delete(seg[3]);
      sendJson(res, 200, { success: true });
      return;
    }

    if (seg[0] === 'invitations' && seg[2] === 'permissions' && method === 'PUT') {
      const collab = [...state.invitations.values()].find((i) => i.id === seg[3]);
      if (collab && body.tipoPermiso) collab.tipoPermiso = body.tipoPermiso;
      sendJson(res, 200, { success: true });
      return;
    }

    if (seg[0] === 'invitations' && seg[2] === 'access' && method === 'GET') {
      // GET /invitations/:hash/access
      const link = [...state.invitations.values()].find((i) => i.hash === seg[1]);
      if (!link) return sendJson(res, 404, { success: false, message: 'Invitación no encontrada' });
      const list = state.lists.get(link.listId);
      sendJson(res, 200, {
        success: true,
        message: 'Invitación válida',
        data: {
          lista: {
            id: list?.id || link.listId,
            nombre: list?.nombre || 'Lista',
            propietarioNombre: 'Usuario Test',
          },
          invitacion: {
            id: link.id,
            expiraEn: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          },
          permiso: { tipoPermiso: link.tipoPermiso },
        },
      });
      return;
    }

    // ---------- IA ----------
    // 13A: el endpoint real es /ai/category-suggestions y devuelve la forma
    // del backend: {suggestions: [{category, confidence, reasoning}], ...}
    if (path === '/ai/category-suggestions' && method === 'POST') {
      const cat = suggestCategory(body.productName || '');
      sendJson(res, 200, {
        suggestions: [
          {
            category: cat.nombre,
            confidence: 0.95,
            reasoning: 'Sugerencia basada en el nombre del producto',
          },
        ],
        productName: body.productName || '',
        cached: false,
        requestId: 'req_mock_' + Date.now(),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (path === '/ai/bulk-categorize' && method === 'POST') {
      const products = Array.isArray(body.products) ? body.products : [];
      const now = Date.now();
      const categorizedProducts = products.map((p) => {
        const cat = suggestCategory(p.nombre || '');
        return {
          nombre: p.nombre,
          descripcion: p.descripcion,
          suggestedCategory: {
            nombre: cat.nombre,
            tiendaId: cat.tiendaId,
            confidence: 0.92,
          },
          alternativeCategories: [],
          source: 'ai',
          processingTimeMs: 100,
        };
      });
      const successful = categorizedProducts.length;
      sendJson(res, 200, {
        success: true,
        data: {
          categorizedProducts,
          batchStats: {
            totalProducts: products.length,
            successful,
            failed: 0,
            fromCache: 0,
            fromAI: successful,
            averageConfidence: 0.92,
            totalProcessingTimeMs: Date.now() - now,
          },
        },
      });
      return;
    }

    if (path === '/occasion-lists/occasions' && method === 'GET') {
      sendJson(res, 200, {
        success: true,
        data: {
          occasions: [
            { id: 'desayuno', nombre: 'Desayuno', descripcion: 'Para empezar el día con energía', emoji: '🌅', ejemplos: ['Café', 'Tostadas'] },
            { id: 'cena', nombre: 'Cena', descripcion: 'Una cena completa', emoji: '🌙', ejemplos: ['Pasta', 'Ensalada'] },
            { id: 'picnic', nombre: 'Picnic', descripcion: 'Comida al aire libre', emoji: '🧺', ejemplos: ['Sandwiches', 'Frutas'] },
          ],
        },
      });
      return;
    }

    if (path === '/occasion-lists/preview' && method === 'POST') {
      const products = productsForOccasion(body.occasion);
      sendJson(res, 200, {
        success: true,
        data: {
          preview: {
            nombre: `Lista ${occasionName(body.occasion)}`,
            descripcion: 'Generada automáticamente por IA',
            products,
          },
          metadata: {
            occasion: body.occasion,
            numPersonas: body.numPersonas,
            totalProductos: products.length,
            processingTimeMs: 200,
          },
        },
      });
      return;
    }

    if (path === '/occasion-lists/generate' && method === 'POST') {
      const list = makeList(`Lista ${occasionName(body.occasion)}`, 'Generada por IA', state.users[0].id);
      productsForOccasion(body.occasion).forEach((p) => {
        const product = makeProduct(p.nombre, { cantidad: p.cantidad, listaId: list.id });
        list.products.set(product.id, product);
      });
      state.lists.set(list.id, list);
      sendJson(res, 201, {
        success: true,
        data: {
          list: { id: list.id, nombre: list.nombre, descripcion: list.descripcion },
          products: [...list.products.values()].map((p) => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
          })),
          metadata: {
            occasion: body.occasion,
            numPersonas: body.numPersonas,
            totalProductos: list.products.size,
            processingTimeMs: 250,
          },
        },
      });
      return;
    }

    // ---------- RECOMENDACIONES ----------
    if (seg[0] === 'recommendations' && seg.length >= 2 && method === 'GET') {
      const recommendations = [
        {
          productoNombre: 'Pan',
          descripcion: 'Pan fresco del día',
          categoria: 'Panadería',
          razon: 'Complementa tus productos actuales',
          confidence: 0.85,
          prioridad: 'media',
          cantidad: 1,
          unidad: 'unidad',
        },
        {
          productoNombre: 'Yogur natural',
          categoria: 'Lácteos y Huevos',
          razon: 'Frecuentemente comprado junto a tus productos',
          confidence: 0.8,
          prioridad: 'baja',
          cantidad: 4,
          unidad: 'unidad',
        },
      ];
      if (seg[2] === 'for-product') {
        sendJson(res, 200, {
          success: true,
          data: {
            product: { id: seg[3], nombre: 'Producto' },
            recommendations,
            metadata: { totalRecommendations: recommendations.length, processingTimeMs: 150 },
          },
        });
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          recommendations,
          metadata: {
            listId: seg[1],
            totalRecommendations: recommendations.length,
            processingTimeMs: 150,
          },
        },
      });
      return;
    }

    // Fallback
    sendJson(res, 404, { success: false, message: `Mock: ruta no implementada ${method} ${path}` });
  } catch (error) {
    console.error('Mock API error:', error);
    sendJson(res, 500, { success: false, message: 'Error interno del mock' });
  }
});

function occasionName(occasion) {
  const names = { desayuno: 'Desayuno', cena: 'Cena', picnic: 'Picnic' };
  return names[occasion] || 'Ocasión';
}

function productsForOccasion(occasion) {
  const map = {
    desayuno: [
      { nombre: 'Café', cantidad: 1, unidad: 'paquete' },
      { nombre: 'Leche', cantidad: 2, unidad: 'litro' },
      { nombre: 'Pan de molde', cantidad: 1, unidad: 'paquete' },
      { nombre: 'Huevos', cantidad: 12, unidad: 'unidad' },
      { nombre: 'Mantequilla', cantidad: 1, unidad: 'paquete' },
    ],
    cena: [
      { nombre: 'Pasta', cantidad: 1, unidad: 'paquete' },
      { nombre: 'Tomate', cantidad: 4, unidad: 'unidad' },
      { nombre: 'Queso parmesano', cantidad: 1, unidad: 'paquete' },
      { nombre: 'Lechuga', cantidad: 1, unidad: 'unidad' },
    ],
    picnic: [
      { nombre: 'Pan de baguette', cantidad: 2, unidad: 'unidad' },
      { nombre: 'Jamón cocido', cantidad: 1, unidad: 'paquete' },
      { nombre: 'Manzanas', cantidad: 4, unidad: 'unidad' },
      { nombre: 'Agua', cantidad: 3, unidad: 'botella' },
    ],
  };
  return map[occasion] || map.desayuno;
}

server.listen(PORT, () => {
  console.log(`🧪 Mock API server listening on http://localhost:${PORT}/api/v1`);
});
