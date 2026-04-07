const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(err.error || `Erro ${res.status}`)
  }
  return res.json()
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
export async function login(email: string, senha: string) {
  const data = await apiFetch<{ token: string; user: { id: number; email: string; nome: string; role: string } }>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify({ email, senha }) }
  )
  localStorage.setItem('admin_token', data.token)
  return data
}

export async function logout() {
  await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  localStorage.removeItem('admin_token')
}

export async function getMe() {
  return apiFetch<{ id: number; email: string; nome: string; role: string }>('/api/auth/me')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

// ── INSTITUIÇÕES ──────────────────────────────────────────────────────────────
export async function getInstituicoes() {
  return apiFetch<import('./data').Instituicao[]>('/api/instituicoes')
}

export async function getInstituicao(id: number) {
  return apiFetch<import('./data').Instituicao>(`/api/instituicoes/${id}`)
}

// ── DOAÇÕES ───────────────────────────────────────────────────────────────────
export interface PostDoacaoBody {
  doadorNome: string
  doadorEmail?: string
  doadorTel?: string
  tagSerial?: string
  instituicaoId: number
  quantidade: number
  eventoId?: number
}

export interface PostDoacaoResponse {
  doacaoId: number
  pixKey: string
  valorTotal: number
  instrucoes: string
}

export async function postDoacao(body: PostDoacaoBody): Promise<PostDoacaoResponse> {
  return apiFetch('/api/doacoes', { method: 'POST', body: JSON.stringify(body) })
}

export async function confirmarDoacao(id: number) {
  return apiFetch(`/api/doacoes/${id}/confirmar`, { method: 'POST' })
}

export interface MpPreferenciaResponse {
  preferenceId: string
  init_point: string
  sandbox_init_point: string
}

export async function criarPreferenciaMp(doacaoId: number): Promise<MpPreferenciaResponse> {
  return apiFetch('/api/mp/preferencia', { method: 'POST', body: JSON.stringify({ doacaoId }) })
}

export interface MpPixResponse {
  pixCopiaECola: string
  qrCodeBase64: string | null
  valorTotal: number
  expiracao: string | null
}

export async function criarPixMp(doacaoId: number): Promise<MpPixResponse> {
  return apiFetch('/api/mp/pix', { method: 'POST', body: JSON.stringify({ doacaoId }) })
}

export async function criarCartaoMp(doacaoId: number): Promise<{ init_point: string }> {
  return apiFetch('/api/mp/cartao', { method: 'POST', body: JSON.stringify({ doacaoId }) })
}

export async function gerarLinkMp(instId: number): Promise<{ link: string }> {
  return apiFetch(`/api/mp/gerar-link/${instId}`, { method: 'POST' })
}

export async function getDoacoes(params?: {
  instituicaoId?: number
  pago?: boolean
  dataInicio?: string
  dataFim?: string
  page?: number
  limit?: number
}) {
  const q = new URLSearchParams()
  if (params?.instituicaoId) q.set('instituicaoId', String(params.instituicaoId))
  if (params?.pago !== undefined) q.set('pago', String(params.pago))
  if (params?.dataInicio) q.set('dataInicio', params.dataInicio)
  if (params?.dataFim) q.set('dataFim', params.dataFim)
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  return apiFetch<{ doacoes: import('./data').Doacao[]; total: number; page: number; totalPages: number }>(
    `/api/admin/doacoes?${q}`
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export interface DashboardResumo {
  totalArrecadado: number
  totalRepassado: number
  totalPendente: number
  pessoasAjudadas: number
  totalDoacoes: number
  doacoesPorInstituicao: { instituicaoId: number; nome: string; total: number; percentual: number }[]
  sparklines: { label: string; valores: number[] }[]
  proximoRepasse: string
}

export async function getDashboardResumo(): Promise<DashboardResumo> {
  return apiFetch('/api/admin/dashboard/resumo')
}

// ── RANKING ───────────────────────────────────────────────────────────────────
export async function getRanking(params?: { mes?: number; ano?: number; limit?: number }) {
  const q = new URLSearchParams()
  if (params?.mes) q.set('mes', String(params.mes))
  if (params?.ano) q.set('ano', String(params.ano))
  if (params?.limit) q.set('limit', String(params.limit))
  return apiFetch<(import('./data').Doador & { posicao: number })[]>(`/api/ranking?${q}`)
}

export async function setHomenagem(doadorId: number, homenagem: string) {
  return apiFetch(`/api/admin/ranking/${doadorId}/homenagem`, {
    method: 'PUT',
    body: JSON.stringify({ homenagem }),
  })
}

// ── MISSÕES ───────────────────────────────────────────────────────────────────
export async function getMissoes() {
  return apiFetch<import('./data').Missao[]>('/api/missoes')
}

export async function getMissoesProgresso(doadorId?: number) {
  const q = doadorId ? `?doadorId=${doadorId}` : ''
  return apiFetch<{ missao: import('./data').Missao; completa: boolean; completaEm?: string }[]>(
    `/api/missoes/progresso${q}`
  )
}

// ── EVENTOS / QR ──────────────────────────────────────────────────────────────
export interface Evento {
  id: number
  nome: string
  dataEvento: string
  ativo: boolean
  createdAt: string
}

export interface QREvento {
  id: number
  eventoId: number
  instituicaoId: number
  urlDoacao: string
  qrCodeBase64: string
  valor: number
  instituicao?: import('./data').Instituicao
}

export async function getEventos() {
  return apiFetch<Evento[]>('/api/admin/eventos')
}

export async function criarEvento(nome: string, dataEvento: string) {
  return apiFetch<{ evento: Evento; qrCodes: QREvento[] }>('/api/admin/eventos', {
    method: 'POST',
    body: JSON.stringify({ nome, dataEvento }),
  })
}

export async function getEventoQRCodes(eventoId: number) {
  return apiFetch<QREvento[]>(`/api/admin/eventos/${eventoId}/qrcodes`)
}

// ── ADMIN INSTITUIÇÕES ────────────────────────────────────────────────────────
export async function getMpConnectInfo(token: string) {
  return apiFetch<{ instituicaoNome: string; instituicaoEmoji: string; authUrl: string; jaConectado: boolean }>(
    `/api/mp/connect-info?token=${token}`
  )
}

export async function gerarLinksInstituicao(instId: number): Promise<{ linkMp: string; linkGastos: string }> {
  return apiFetch(`/api/admin/instituicoes/${instId}/gerar-links`, { method: 'POST' })
}

export async function postInstituicao(data: Omit<import('./data').Instituicao, 'id' | 'ativo' | 'mercadoPagoToken'>) {
  return apiFetch<import('./data').Instituicao>('/api/admin/instituicoes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function putInstituicao(id: number, data: Partial<import('./data').Instituicao>) {
  return apiFetch<import('./data').Instituicao>(`/api/admin/instituicoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteInstituicao(id: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/instituicoes/${id}`, { method: 'DELETE' })
}

// ── GASTOS ────────────────────────────────────────────────────────────────────
export async function getGastos(instituicaoId: number) {
  return apiFetch<import('./data').Gasto[]>(`/api/instituicoes/${instituicaoId}/gastos`)
}

export async function postGasto(body: {
  instituicaoId: number
  desc: string
  valor: number
  data: string
  comprovante: boolean
  arquivoUrl?: string
}) {
  return apiFetch<import('./data').Gasto>('/api/admin/gastos', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
