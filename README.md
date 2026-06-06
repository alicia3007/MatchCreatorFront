# MatchCreator Frontend

## Descripción General

MatchCreator es una plataforma web full stack que conecta empresas con creadores de contenido, permitiendo que ambas partes colaboren a través de campañas de marketing.

La plataforma ofrece interfaces específicas para empresas y creadores, soportando gestión de campañas, postulaciones, mensajería, administración de perfiles y sistemas de reseñas.

## Funcionalidades Principales

### Funcionalidades para Empresas

* Crear y administrar campañas de marketing.
* Revisar postulaciones de creadores.
* Comunicarse con creadores mediante un sistema integrado de mensajería.
* Consultar perfiles y reseñas de creadores.
* Gestionar la participación en campañas.

### Funcionalidades para Creadores

* Explorar campañas disponibles.
* Postularse a campañas.
* Administrar información de perfil.
* Intercambiar mensajes con empresas.
* Recibir y visualizar reseñas.

## Tecnologías Utilizadas

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS

### Pruebas

* Jest

### DevOps

* Docker
* Docker Compose

## Arquitectura

La aplicación sigue una arquitectura basada en roles:

```text
app/
├── (company)/
│   ├── campaigns/
│   ├── messages/
│   ├── profile/
│   └── reviews/
│
├── (creator)/
│   ├── campaigns/
│   ├── messages/
│   ├── profile/
│   └── reviews/
```

Esta separación permite que cada tipo de usuario tenga un flujo de navegación y una lógica de negocio independientes, manteniendo una base de código escalable y fácil de mantener.

## Principales Decisiones Técnicas

### Enrutamiento Basado en Roles

Los flujos de empresas y creadores se encuentran separados mediante grupos de rutas de Next.js, mejorando la mantenibilidad y reduciendo el acoplamiento entre funcionalidades.

### Diseño Modular

Las funcionalidades están organizadas en módulos independientes, facilitando la extensión y el mantenimiento de la aplicación.

### Componentes Reutilizables

Los componentes de interfaz compartidos se centralizan para garantizar consistencia visual y reducir la duplicación de código.

### Internacionalización

El proyecto incorpora soporte para localización y futuras expansiones a múltiples idiomas.

## Ejecución del Proyecto

### Usando Docker

```bash
git clone <repository-url>
cd MatchCreatorFront
docker-compose up --build
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

### Detener los Contenedores

```bash
docker-compose down
```

## Mejoras Futuras

* Mensajería en tiempo real mediante WebSockets.
* Sistema de notificaciones.
* Panel de analítica para campañas.
* Búsqueda y filtrado avanzado de creadores.

## Trabajo en Equipo

Este proyecto fue desarrollado como parte de un curso de ingeniería de software, siguiendo prácticas de desarrollo colaborativo, control de versiones y principios de arquitectura modular.

## Capturas de pantalla 
<img width="2261" height="1284" alt="IMG_4854" src="https://github.com/user-attachments/assets/6e3a928b-1ae5-4c4d-b43b-5c825358e418" />
<img width="2278" height="1284" alt="IMG_4861" src="https://github.com/user-attachments/assets/96fc299b-c739-42af-9138-957964c45025" />
<img width="2280" height="1284" alt="IMG_4860" src="https://github.com/user-attachments/assets/81f361f9-b363-4c03-b107-d41cecac1fc6" />
<img width="2266" height="1284" alt="IMG_4859" src="https://github.com/user-attachments/assets/cc4b01b6-4ebf-4316-bad4-a0c02d199a5f" />
<img width="2271" height="1284" alt="IMG_4858" src="https://github.com/user-attachments/assets/868fceb4-4484-4c24-9b37-a052a3e2ed95" />
<img width="2284" height="1284" alt="IMG_4857" src="https://github.com/user-attachments/assets/230322e5-f3aa-42ca-be9f-c8c2cf49664b" />
<img width="2280" height="1284" alt="IMG_4856" src="https://github.com/user-attachments/assets/c4e34d59-d118-497f-82f1-4b9a698e6962" />
<img width="2278" height="1284" alt="IMG_4855" src="https://github.com/user-attachments/assets/ee13ae3f-076d-4a89-8c46-a91ff102f746" />

## Mi contribución 

- Desarrollo de la interfaz de campañas y creadores.
- Implementación de la autenticación de creadores.
- Integración con la API REST.
- Diseño de componentes reutilizables.
- Configuración de Docker para desarrollo.
- Pruebas postman y de lógica. 

