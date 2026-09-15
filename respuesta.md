# DIAGNOSIS

## Problem

La aplicación `control-ingreso-backend` está configurada para conectarse a una base de datos de Supabase de producción mediante `src/main/resources/application.yaml`. Además, no se ha definido la propiedad `spring.datasource.password`, por lo que la conexión probablemente falla o usa una contraseña vacía. El usuario necesita apuntar a una base de datos de prueba alojada en otro proyecto de Supabase.

## Root Cause

La configuración del datasource está hardcodeada en `application.yaml` con la URL y el usuario de producción (`postgres.xuyfxhrofzavamwxwpeb`), sin contraseña y sin uso de perfiles de Spring ni variables de entorno. Esto impide cambiar de base de datos de forma sencilla y segura.

# FILES TO MODIFY

## 1. src/main/resources/application.yaml

Approximate line: 1-15

### Problem

El archivo contiene la URL y el usuario de la base de datos de producción de Supabase, y falta la contraseña. No hay forma de cambiar a la base de prueba sin editar directamente el código.

### Solution

Reemplazar la URL, el nombre de usuario y agregar la contraseña correspondiente a la base de datos de prueba de Supabase. Se recomienda usar variables de entorno para no exponer credenciales en el repositorio. Los valores `<TEST_PROJECT_REF>` y `<TEST_DB_PASSWORD>` deben ser reemplazados por los datos reales del proyecto de prueba en Supabase.

### Current Code

```yaml
spring:
  datasource:
    url: jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
    username: postgres.xuyfxhrofzavamwxwpeb
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

server:
  port: 8080
```

### Corrected Code

```yaml
spring:
  datasource:
    url: jdbc:postgresql://<TEST_PROJECT_REF>.pooler.supabase.com:5432/postgres?sslmode=require
    username: postgres.<TEST_PROJECT_REF>
    password: <TEST_DB_PASSWORD>
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

server:
  port: 8080
```

> **Alternativa recomendada (variables de entorno):**
>
> ```yaml
> spring:
>   datasource:
>     url: ${TEST_DB_URL}
>     username: ${TEST_DB_USERNAME}
>     password: ${TEST_DB_PASSWORD}
>     driver-class-name: org.postgresql.Driver
>   jpa:
>     hibernate:
>       ddl-auto: update
>     show-sql: true
>     properties:
>       hibernate:
>         format_sql: true
>
> server:
>   port: 8080
> ```
>
> Luego definir las variables `TEST_DB_URL`, `TEST_DB_USERNAME` y `TEST_DB_PASSWORD` en el entorno de ejecución.

# NEW FILES

No se requieren nuevos archivos.

# ARCHITECTURAL CHANGES

No se requieren cambios arquitectónicos. Opcionalmente, se podría implementar el uso de perfiles de Spring (`application-test.yaml`) para separar configuraciones, pero no es obligatorio para el cambio solicitado.

# RISKS OR SIDE EFFECTS

- La propiedad `ddl-auto: update` puede crear o modificar tablas en la base de datos de prueba. Asegurarse de que sea una base de datos desechable o de que el esquema sea el esperado.
- Si se usan credenciales en texto plano, podrían quedar expuestas en el repositorio. Se recomienda usar variables de entorno.
- Verificar que la región del pooler de Supabase para el proyecto de prueba coincida con la URL (por ejemplo, `aws-0-sa-east-1` puede cambiar).
- El usuario de Supabase debe tener el formato `postgres.<project-ref>` y la contraseña correcta.

# IMPLEMENTATION PLAN

1. Obtener la cadena de conexión de la base de datos de prueba desde el panel de Supabase: _Project Settings → Database → Connection string → URI_.
2. Editar `src/main/resources/application.yaml` y reemplazar `url`, `username` y agregar `password` con los valores de la base de prueba (o configurar las variables de entorno correspondientes).
3. Ejecutar la aplicación con `./mvnw spring-boot:run` y verificar en los logs que la conexión se realiza al proyecto de prueba. Probar el endpoint `/api/ping` para confirmar que la aplicación inicia correctamente.

Para conectar tu backend a la base de datos de prueba en Supabase, necesitas tres datos: la **URL de conexión**, el **nombre de usuario** y la **contraseña**. Todos se obtienen desde el panel de control de tu proyecto en Supabase.

### 📋 Paso 1: Obtener la URL de conexión y el usuario

1.  Inicia sesión en [supabase.com](https://supabase.com) y entra al proyecto de prueba que creaste.
2.  En el menú lateral izquierdo, busca y haz clic en el botón **"Connect"** (Conectar), que suele estar en la parte superior del dashboard.
3.  Se abrirá un panel con varias opciones de conexión. Busca la sección **"Session pooler"** (o "Pooler de sesión").
4.  Copia la **cadena de conexión (URI)** que aparece. Tendrá un formato similar a este:
    ```
    postgresql://postgres.[TU-PROJECT-REF]:[TU-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
    ```

En esa misma cadena ya viene incluido el **nombre de usuario**, que es `postgres.[TU-PROJECT-REF]`. Por ejemplo, si tu referencia de proyecto es `abcdefghij`, tu usuario será `postgres.abcdefghij`.

### 🔑 Paso 2: Obtener o restablecer la contraseña

La contraseña de la base de datos es la que definiste (o te generó Supabase) al crear el proyecto. Si no la recuerdas, puedes cambiarla:

1.  En el dashboard del proyecto, ve al menú lateral y entra en **"Settings"** (Configuración) → **"Database"** (Base de datos).
2.  Busca la sección **"Database password"** y haz clic en **"Reset database password"** (Restablecer contraseña de la base de datos).
3.  Introduce una nueva contraseña, guárdala en un lugar seguro y confirma el cambio.
4.  Vuelve al panel **"Connect"** y **copia de nuevo la cadena de conexión** (ahora incluirá la nueva contraseña o deberás reemplazar `[TU-PASSWORD]` por la que acabas de crear).

### 📝 Paso 3: Aplicar los datos en tu `application.yaml`

Con los datos copiados, edita el archivo `src/main/resources/application.yaml` de tu proyecto:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require
    username: postgres.[TU-PROJECT-REF]
    password: [TU-PASSWORD]
    driver-class-name: org.postgresql.Driver
  # ... resto de la configuración
```

### 💡 Recomendación de seguridad

Para no exponer las credenciales en el código, es mejor usar **variables de entorno**. En lugar de escribir los valores directamente, puedes dejar tu `application.yaml` así:

```yaml
spring:
  datasource:
    url: ${SUPABASE_TEST_DB_URL}
    username: ${SUPABASE_TEST_DB_USERNAME}
    password: ${SUPABASE_TEST_DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
```

Luego, defines esas variables en tu sistema operativo o en el IDE (por ejemplo, en las _Run Configurations_ de IntelliJ o Eclipse) con los valores que obtuviste.
