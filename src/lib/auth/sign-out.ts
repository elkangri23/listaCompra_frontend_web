'use client'

import { getCsrfToken } from 'next-auth/react'

/**
 * Cierra la sesión con un POST nativo al endpoint de signout.
 *
 * NOTA: no usamos signOut() de next-auth/react porque en
 * next-auth 5.0.0-beta.30 la ruta JSON (X-Auth-Return-Redirect) pierde las
 * cabeceras Set-Cookie de borrado de sesión (bug de Response.json con
 * Headers) y la cookie de sesión sobrevive: el usuario queda "logueado"
 * tras el logout en producción. El POST de formulario nativo devuelve un
 * 302 con el Set-Cookie de borrado y redirige a /login.
 */
export async function signOutViaForm(callbackUrl = '/login'): Promise<void> {
  const csrfToken = (await getCsrfToken()) ?? ''
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = '/api/auth/signout'

  const csrfInput = document.createElement('input')
  csrfInput.type = 'hidden'
  csrfInput.name = 'csrfToken'
  csrfInput.value = csrfToken
  form.appendChild(csrfInput)

  const callbackInput = document.createElement('input')
  callbackInput.type = 'hidden'
  callbackInput.name = 'callbackUrl'
  callbackInput.value = callbackUrl
  form.appendChild(callbackInput)

  document.body.appendChild(form)
  form.submit()
}
