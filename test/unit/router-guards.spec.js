import { describe, it, expect, vi, beforeEach } from 'vitest'

// Aislamos el guard de la tabla de rutas real: forzamos que el usuario
// no tenga ninguna otra ruta accesible para que el destino sea /no-autorizado.
vi.mock('src/router/utils/permissionUtils', () => ({
  findFirstAccessibleRoute: vi.fn(() => null),
}))

import { authGuard } from 'src/router/guards/authGuard'
import { permissionGuard } from 'src/router/guards/permissionGuard'

const rutaPrivada = {
  path: '/gestion-sla',
  fullPath: '/gestion-sla',
  meta: { title: 'Gestión SLA', permisos: ['GESTION_SOLICITUD'] },
}

describe('Guards del router', () => {
  let next

  beforeEach(() => {
    next = vi.fn()
  })

  it('deja pasar a un usuario con el permiso necesario', () => {
    const authStore = { isAuthenticated: true, permisos: ['GESTION_SOLICITUD'] }

    permissionGuard(rutaPrivada, {}, next, authStore)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it('redirige a /no-autorizado si falta el permiso', () => {
    const authStore = { isAuthenticated: true, permisos: ['LOGS'] }

    permissionGuard(rutaPrivada, {}, next, authStore)

    expect(next).toHaveBeenCalledWith('/no-autorizado')
  })

  it('redirige a /login si no hay sesión', async () => {
    const authStore = { isAuthenticated: false, permisos: [] }

    await authGuard(rutaPrivada, {}, next, authStore)

    expect(next).toHaveBeenCalledWith('/login')
  })
})
