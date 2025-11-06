'use client'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Label,
  Text,
  ThemeToggle,
} from '@/components/ui'
import { designTokens } from '@/lib/design-tokens'
import Image from 'next/image'

const colorSamples = Object.entries(designTokens.colors)

export default function Home() {
  return (
    <div className="container space-y-10 py-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Heading level={1}>Sistema de diseño ListaCompra</Heading>
          <Text variant="lead">
            Componentes accesibles, tokens compartidos y soporte para modo claro/oscuro listos para escalar la
            experiencia de compra colaborativa.
          </Text>
        </div>
        <ThemeToggle />
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Controles primarios</CardTitle>
            <CardDescription>
              Botones, badges e inputs siguen las guías WCAG 2.2 AA y mantienen contraste en ambos temas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button>Primario</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Eliminar</Button>
              <Button variant="link" type="button">
                Enlace
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge>Activo</Badge>
              <Badge variant="secondary">Pendiente</Badge>
              <Badge variant="outline">Nuevo</Badge>
              <Badge variant="success">Completado</Badge>
              <Badge variant="warning">Revisión</Badge>
            </div>

            <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
              <div className="space-y-1.5">
                <Label htmlFor="lista" isRequired>
                  Nombre de la lista
                </Label>
                <Input id="lista" name="lista" placeholder="Compra semanal" autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input id="descripcion" name="descripcion" placeholder="Añade un contexto breve" />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Guardar lista
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipografía y tono</CardTitle>
            <CardDescription>
              Jerarquías responsivas para títulos y texto base, optimizadas para lecturabilidad en múltiples idiomas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Heading level={2}>Planifica, comparte y compra sin fricción</Heading>
            <Text>
              ListaCompra permite coordinar con tu familia o equipo en tiempo real. Nuestro diseño prioriza accesibilidad,
              contraste y uso eficiente del espacio para brindar una experiencia agradable.
            </Text>
            <Text variant="muted">
              Mantén informados a tus colaboradores con notificaciones claras y un lenguaje visual consistente que refuerza
              confianza.
            </Text>
            <Text variant="small">Tipografía dinámica basada en tokens para escalar sin esfuerzo.</Text>
          </CardContent>
          <CardFooter className="justify-between">
            <Text className="text-sm">Tokens activos: tipografía, espaciado y color</Text>
            <Badge variant="outline">Versión 1.0</Badge>
          </CardFooter>
        </Card>
      </section>

      <section className="grid gap-8 rounded-2xl border bg-card/40 p-8 shadow-sm md:grid-cols-[minmax(0,1fr)_320px] md:items-center">
        <div className="space-y-4">
          <Heading level={2}>Rendimiento web preparado para producción</Heading>
          <Text>
            Implementamos optimizaciones clave como imágenes responsivas, división de código bajo demanda y virtualización de
            listas para mantener la experiencia fluida incluso con cientos de elementos.
          </Text>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Lazy loading</Badge>
            <Badge variant="outline">Virtual scroll</Badge>
            <Badge variant="outline">Bundle analyzer</Badge>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <Image
            src="/images/performance-insights.svg"
            alt="Panel con métricas de rendimiento optimizadas"
            width={320}
            height={200}
            priority
            className="h-auto w-full max-w-[320px]"
          />
        </div>
      </section>

      <section id="tokens" className="space-y-6">
        <Heading level={2}>Tokens de color</Heading>
        <Text variant="muted">
          Variables CSS compartidas para garantizar consistencia en componentes, gráficos y futuras integraciones móviles.
        </Text>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {colorSamples.map(([token, value]) => (
            <Card key={token}>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base">{token}</CardTitle>
                <CardDescription className="text-xs">{value}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-20 w-full rounded-b-lg" style={{ background: value }} aria-hidden />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
