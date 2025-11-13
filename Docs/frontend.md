Genera una interfaz de usuario (UI) de aplicación web completa, moderna e intuitiva para una app de "Lista de la Compra Colaborativa".

**I. SISTEMA DE DISEÑO Y ESTILO GENERAL:**

*   **Estética:** Limpia, minimalista y moderna. Usa los principios de Material Design 3 como referencia.
*   **Paleta de Colores Principal:**
    *   Primario: Un azul amigable y enérgico (ej. #4285F4).
    *   Secundario/Acento: Un ámbar o naranja cálido para llamadas a la acción (ej. #FFC107).
    *   Neutro: Una gama de grises para texto, fondos y bordes (ej. #F8F9FA para fondos claros, #202124 para texto oscuro).
    *   Éxito: Verde (ej. #34A853).
    *   Error: Rojo (ej. #EA4335).
*   **Tipografía:** Usa una fuente sans-serif limpia como Roboto o Google Sans. Asegura una jerarquía clara con tamaños distintos para encabezados, subtítulos y cuerpo de texto.
*   **Iconografía:** Usa el conjunto de iconos de Lucide para una apariencia consistente y moderna.
*   **Disposición (Layout):** La disposición principal de la aplicación para usuarios autenticados debe ser un diseño de dos columnas: una barra lateral de navegación plegable a la izquierda y el área de contenido principal a la derecha. El encabezado debe ser persistente.
*   **Componentes:** Todos los componentes (botones, tarjetas, campos de entrada) deben tener esquinas redondeadas (ej. 8px de radio de borde), sombras sutiles para dar profundidad y estados claros para hover/focus.

**II. DISEÑO DE PÁGINAS:**

**A. Páginas Públicas (para usuarios no autenticados)**

1.  **Página de Inicio (Landing Page):**
    *   **Propósito:** Presentar la aplicación y animar a los usuarios a registrarse.
    *   **Disposición:** Una sección principal (hero) a todo lo ancho con un titular atractivo como "Comprar, más inteligente, juntos." y un botón principal de llamada a la acción "Empieza Gratis".
    *   **Componentes:**
        *   Una barra de navegación superior limpia con el Logo de la App, "Características", "Precios" (puede ser un placeholder), y botones de "Iniciar Sesión" / "Registrarse".
        *   Una sección que explique las características clave con iconos: "Sugerencias con IA", "Colaboración en Tiempo Real" y "Categorización Inteligente".
        *   Un pie de página simple con enlaces a "Política de Privacidad" y "Términos de Servicio".

2.  **Página de Inicio de Sesión (Login):**
    *   **Propósito:** Permitir a los usuarios existentes iniciar sesión.
    *   **Disposición:** Una tarjeta centrada sobre un fondo limpio.
    *   **Componentes:**
        *   Logo de la App sobre la tarjeta.
        *   Campos de entrada para "Email" y "Contraseña".
        *   Un botón primario "Iniciar Sesión".
        *   Un enlace secundario debajo: "¿No tienes cuenta? Regístrate".

3.  **Página de Registro:**
    *   **Propósito:** Permitir a nuevos usuarios crear una cuenta.
    *   **Disposición:** Similar a la página de Login, una tarjeta centrada.
    *   **Componentes:**
        *   Campos de entrada para "Nombre Completo", "Email" y "Contraseña" (incluir un indicador de fortaleza de la contraseña).
        *   Una casilla de verificación para aceptar los "Términos de Servicio".
        *   Un botón primario "Crear Cuenta".
        *   Un enlace debajo: "¿Ya tienes cuenta? Inicia Sesión".

4.  **Página de Invitación Pública:**
    *   **Propósito:** Mostrar una vista previa de una lista compartida a un no-usuario.
    *   **Disposición:** Una página simple con una tarjeta central.
    *   **Componentes:**
        *   Un mensaje: "[Nombre del Usuario] te ha invitado a colaborar en la lista de la compra '[Nombre de la Lista]'."
        *   Una vista previa de solo lectura de los primeros ítems de la lista.
        *   Un botón primario "Aceptar y Unirse" que dirige a la página de registro o inicio de sesión.

**B. Páginas de la Aplicación (Autenticadas)**

5.  **Panel Principal (Mis Listas):**
    *   **Propósito:** El centro principal donde los usuarios ven todas sus listas de la compra.
    *   **Disposición:** El área de contenido principal es una cuadrícula o lista de tarjetas.
    *   **Componentes:**
        *   Un encabezado con el título "Mis Listas".
        *   Un botón prominente "Crear Nueva Lista".
        *   Cada lista está representada por una tarjeta que muestra:
            *   Nombre de la Lista.
            *   Una barra de progreso indicando ítems comprados vs. totales (ej. "5/12 ítems").
            *   Avatares de los colaboradores en la lista.
        *   La barra lateral de navegación izquierda debe incluir enlaces a: "Panel Principal", "Plantillas", "Ajustes" y "Cerrar Sesión".

6.  **Página de Detalle de la Lista de la Compra:**
    *   **Propósito:** El núcleo de la app, donde los usuarios gestionan los ítems de una lista específica.
    *   **Disposición:** Una vista de dos columnas dentro del área de contenido principal.
    *   **Componentes:**
        *   **Encabezado:**
            *   El nombre de la lista (editable al hacer clic).
            *   Botón "Compartir" (abre el modal/página de Compartir Lista).
            *   Un menú "Más" (icono de kebab) con opciones como "Guardar como Plantilla", "Eliminar Lista".
        *   **Columna Principal (Lista de Productos):**
            *   Un campo de entrada "Añadir Producto" en la parte superior.
            *   Productos agrupados por categoría (ej. "Lácteos", "Frutas y Verduras"). Cada categoría es una sección plegable.
            *   Cada ítem de producto tiene: una casilla para marcar como comprado, el nombre del producto, cantidad y un pequeño icono de "eliminar". Los ítems marcados deben aparecer atenuados y moverse al final de su categoría.
        *   **Barra Lateral Derecha (Asistente de IA e Información):**
            *   Un componente con pestañas.
            *   **Pestaña 1: "Sugerencias de IA"**: Sugiere ítems para añadir basados en la lista actual (ej. "¿Añadir Salsa de Tomate?").
            *   **Pestaña 2: "Detalles"**: Muestra la fecha de creación de la lista, la tienda asociada y los colaboradores.

7.  **Modal/Página de Compartir Lista:**
    *   **Propósito:** Gestionar quién puede acceder a una lista.
    *   **Disposición:** Un diálogo modal o una página dedicada.
    *   **Componentes:**
        *   Un campo de entrada para "Invitar por email".
        *   Un menú desplegable para establecer permisos ("Puede Ver" o "Puede Editar").
        *   Un botón "Enviar Invitación".
        *   Una lista de los colaboradores actuales con su nivel de permiso y una opción para eliminarlos o cambiar sus permisos.

8.  **Página de Perfil de Usuario y Ajustes:**
    *   **Propósito:** Permitir a los usuarios gestionar su cuenta.
    *   **Disposición:** Una interfaz con pestañas dentro del área de contenido principal.
    *   **Componentes:**
        *   **Pestaña 1: "Perfil"**: Campos para actualizar Nombre Completo y Email.
        *   **Pestaña 2: "Seguridad"**: Sección para "Cambiar Contraseña" y un botón de "Cerrar sesión en todos los dispositivos".
        *   **Pestaña 3: "Preferencias"**: Interruptores para las notificaciones por email.

**C. Páginas de Administración (Simplificadas)**

9.  **Panel de Administración:**
    *   **Propósito:** Proporcionar una visión general del estado de la aplicación a los administradores.
    *   **Disposición:** Una cuadrícula de tarjetas de visualización de datos.
    *   **Componentes:**
        *   Tarjetas de estadísticas para "Usuarios Totales", "Listas Activas", "Llamadas a la API de IA".
        *   Una tabla simple mostrando los últimos registros de usuarios.
        *   La barra lateral izquierda debe tener enlaces específicos de administrador: "Panel Principal", "Gestión de Usuarios", "Logs de Auditoría".

10. **Página de Gestión de Usuarios:**
    *   **Propósito:** Permitir a los administradores ver y gestionar usuarios.
    *   **Disposición:** Una tabla a todo lo ancho.
    *   **Componentes:**
        *   Una tabla de todos los usuarios con columnas para "Nombre", "Email", "Fecha de Registro" y "Estado".
        *   Una barra de búsqueda para encontrar usuarios por nombre o email.
        *   Cada fila tiene un menú de acciones con opciones como "Ver Detalles" o "Impersonar Usuario".
