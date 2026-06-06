# Proyecto Frontend - Gestión de Campañas y Creadores

## Descripción General

Este proyecto consiste en una aplicación web desarrollada con Next.js que permite gestionar la interacción entre empresas y creadores de contenido. La plataforma incluye funcionalidades como creación de campañas, manejo de mensajes, perfiles de usuario y sistema de reseñas.

El sistema está diseñado teniendo en cuenta que existen dos tipos de usuarios principales: empresas y creadores, cada uno con sus propias vistas y funcionalidades.

---

## Decisiones Técnicas

### Uso de Next.js (App Router)

Se decidió utilizar Next.js con el App Router porque facilita la organización del proyecto a través de rutas basadas en carpetas. Además, permite aprovechar características como el renderizado del lado del servidor y una mejor optimización del rendimiento.

Esta estructura también ayuda a mantener el código más ordenado y fácil de entender.

---

### Separación por roles (company y creator)

El proyecto está dividido en dos grandes grupos de rutas:

- app/(company)/company/
- app/(creator)/creator/

Esto se hizo para separar claramente la lógica de cada tipo de usuario. De esta forma, se evita mezclar funcionalidades y el código se vuelve más fácil de mantener y escalar.

Cada rol tiene sus propios módulos como campañas, mensajes, perfil y reseñas.

---

### Organización por módulos

Las funcionalidades están separadas en carpetas como:

- campaigns
- messages
- profile
- reviews

Esto permite trabajar cada parte del sistema de manera independiente, facilita el mantenimiento y también el trabajo en equipo.

---

### Uso de layouts

Se implementaron layouts tanto a nivel global como por cada tipo de usuario. Esto permite reutilizar estructuras comunes como menús o barras de navegación, evitando repetir código en cada página.

---

### Manejo de estado con Context API

Se utiliza Context API para manejar información global, como el usuario autenticado o su rol dentro del sistema. Esto ayuda a evitar pasar datos manualmente entre muchos componentes y hace el código más limpio.

---

### Componentes reutilizables

La carpeta components contiene elementos reutilizables de la interfaz. Esto ayuda a mantener consistencia visual y evita duplicar código, lo cual es importante en aplicaciones más grandes.

---

### Uso de Tailwind CSS

Se utilizó Tailwind CSS para los estilos porque permite construir interfaces de manera rápida utilizando clases predefinidas. Esto también ayuda a mantener consistencia en el diseño sin necesidad de escribir mucho CSS personalizado.

---

### Internacionalización

El proyecto incluye una carpeta i18n, lo que indica que se tuvo en cuenta la posibilidad de soportar múltiples idiomas. Esto es importante si se quiere escalar la aplicación a usuarios de diferentes regiones.

---

### Manejo de errores

Se incluye una página not-found.tsx para manejar rutas que no existen. Esto mejora la experiencia del usuario al mostrar un mensaje adecuado en lugar de una pantalla en blanco o error técnico.

---

### Pruebas

El proyecto cuenta con configuración de pruebas usando Jest. Esto permite verificar que las funcionalidades funcionen correctamente y ayuda a prevenir errores cuando se hacen cambios en el código.

---

### Uso de Docker

Se incluyeron archivos como Dockerfile y docker-compose.yml para facilitar la ejecución del proyecto en diferentes entornos. Esto permite que cualquier persona pueda correr el proyecto sin problemas de configuración.


## Ejecución del proyecto con Docker

Para este proyecto usamos Docker con el fin de que todos podamos ejecutar la aplicación en el mismo entorno, sin problemas de versiones o configuraciones diferentes.

---

### Requisitos

* Tener Docker Desktop instalado
* Tener Docker corriendo

---

### Cómo ejecutar el proyecto

1. Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>
```

2. Construir y levantar la aplicación:

```bash
docker-compose up --build
```

3. Abrir en el navegador:

http://localhost:3000

---

### Cómo detener la aplicación

```bash
docker-compose down
```

---

## Justificación del uso de Docker

Decidimos usar Docker principalmente para evitar problemas de entorno entre los integrantes del equipo. De esta forma, todos ejecutamos el proyecto bajo las mismas condiciones.

Además, Docker nos permite:

* Tener la misma versión de Node.js (en este caso Node 20, que es necesaria para Next.js 16)
* Evitar errores por diferencias en dependencias o configuración local
* Ejecutar el proyecto con un solo comando
* Facilitar la revisión del proyecto por parte del profesor

También ayuda a que el proyecto sea más portable, ya que cualquier persona con Docker puede ejecutarlo sin necesidad de configurar nada adicional.

---

## Archivos importantes

* Dockerfile: define cómo se construye la aplicación
* docker-compose.yml: define cómo se ejecuta el contenedor
* .dockerignore: evita incluir archivos innecesarios en el build

---

## Notas

* La aplicación corre en modo producción usando:

```bash
npm run build
npm start
```

* Si se hacen cambios en el código, es necesario reconstruir:

```bash
docker-compose up --build
```

## Conclusión

En general, el proyecto está organizado de forma modular y pensada para que sea fácil de mantener y escalar. Se utilizaron herramientas actuales que ayudan a mejorar tanto el desarrollo como el rendimiento de la aplicación.


