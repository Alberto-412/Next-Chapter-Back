CREATE DATABASE IF NOT EXISTS next_chapter;

USE next_chapter;

CREATE TABLE usuarios (
    id int unsigned not null auto_increment primary key,
    nombre varchar(100) not null,
    mail varchar(150) not null unique,
    contraseña varchar(255) not null,
    telefono varchar(20),
    direccion varchar(255),
    rol enum('cliente', 'admin') not null default 'cliente',
    activo tinyint(1) not null default 1, -- Booleano
    fecha_registro datetime not null default current_timestamp,
    validado tinyint(1) not null default 0 -- Booleano
);
-- ------------------------------------------------------------

CREATE TABLE editoriales (
    id int unsigned not null auto_increment primary key,
    nombre varchar(150) not null
);

-- ------------------------------------------------------------

CREATE TABLE autores (
    id int unsigned not null auto_increment primary key,
    nombre_autor varchar(150) not null,
    biografia text
);

-- ------------------------------------------------------------

CREATE TABLE categorias (
    id int unsigned not null auto_increment primary key,
    nombre varchar(100) not null, -- terror, juvenil, manga, etc.
    descripcion text
);

-- ------------------------------------------------------------

CREATE TABLE productos (
    id                int unsigned not null auto_increment primary key,
    titulo            varchar(255) not null,
    descripcion       text,
    isbn              varchar(20) unique,
    precio            decimal(10,2) not null,
    stock             int unsigned not null default 0, -- numero entero, positivo, siempre con valor y por defecto 0
    pre_reserva       tinyint(1) not null default 0,   -- booleano
    imagen            varchar(500),
    fecha_publicacion date,

-- relacion producto-editorial (1:N) --
id_editorial      int unsigned,
    constraint fk_producto_editorial
        foreign key (id_editorial) references editoriales(id)
        on update cascade on delete set null -- si el id de una editorial cambia, cambia a todos los productos que la tenían asignada y si una editorial se elimina, los productos asignados a esa editorial se quedan sin una asignada 
);

-- ------------------------------------------------------------

CREATE TABLE pedidos (
    id                int unsigned not null auto_increment primary key,
    total             decimal(10,2) not null default 0.00,
    estado            enum('pendiente','procesando','enviado','entregado','cancelado') not null default 'pendiente',
    fecha_pedido      datetime not null default current_timestamp,
    direccion_envio   varchar(255),
    metodo_pago       enum('tarjeta','paypal','bizum','google_pay', 'apple_pay'),

-- relacion pedido-usuario (1:N) --
id_usuario        int unsigned not null,
    constraint fk_pedido_usuario
        foreign key (id_usuario) references usuarios(id)
        on update cascade on delete restrict	-- No puedes borrar un usuario con pedidos asociados
);

-- ------------------------------------------------------------

CREATE TABLE carrito (
    id            int unsigned not null auto_increment primary key,
    estado        enum('activo','abandonado','convertido') not null default 'activo',  
				  -- activo: en curso | abandonado: sin completar | convertido: transformado en pedido

-- relacion carrito-usuario (1:1) --
id_usuario    int unsigned not null,
    constraint fk_carrito_usuario
        foreign key (id_usuario) references usuarios(id)
        on update cascade on delete cascade		-- Si ese usuario se borra, borra este carrito también
);

-- ------------------------------------------------------------

CREATE TABLE reviews (
    id              int unsigned not null auto_increment primary key,
    calificacion    tinyint unsigned not null check (calificacion between 1 and 5), -- Valoración obligatoria del 1 al 5, validada por la BD
    comentario      text,
    fecha           datetime not null default current_timestamp,

-- relacion reseña-usuario  (1:N) --
-- relacion reseña-producto (1:N) --
id_usuario      int unsigned not null,
    id_producto     int unsigned not null,
    constraint fk_resena_usuario
        foreign key (id_usuario) references usuarios(id)
        on update cascade on delete cascade,
    constraint fk_resena_producto
        foreign key (id_producto) references productos(id)
        on update cascade on delete cascade
);

-- Producto ↔ Autor
CREATE TABLE producto_autor ( -- tabla de relación N:M entre productos y autores
    id_producto int unsigned not null, -- ID del producto, positivo y obligatorio
    id_autor int unsigned not null, -- ID del autor, positivo y obligatorio
    primary key (id_producto, id_autor), -- clave primaria compuesta, evita duplicados
    constraint fk_pa_producto -- nombre de la foreign key (opcional)
    foreign key (id_producto) references productos (id) -- id_producto debe existir en productos
    on update cascade on delete cascade, -- si se actualiza/borra el producto, se propaga
    constraint fk_pa_autor -- nombre de la foreign key (opcional)
    foreign key (id_autor) references autores (id) -- id_autor debe existir en autores
    on update cascade on delete cascade -- si se actualiza/borra el autor, se propaga
);

-- ------------------------------------------------------------

-- Producto ↔ Categoría
CREATE TABLE producto_categoria (
    id_producto int unsigned not null,
    id_categoria int unsigned not null,
    primary key (id_producto, id_categoria),
    constraint fk_pc_producto foreign key (id_producto) references productos (id) on update cascade on delete cascade,
    constraint fk_pc_categoria foreign key (id_categoria) references categorias (id) on update cascade on delete cascade
);

-- ------------------------------------------------------------

-- Pedido ↔ Producto
CREATE TABLE pedido_producto (
    id_pedido int unsigned not null,
    id_producto int unsigned not null,
    cantidad int unsigned not null default 1,
    precio_unidad decimal(10, 2) not null,
    primary key (id_pedido, id_producto),
    constraint fk_pp_pedido foreign key (id_pedido) references pedidos (id) on update cascade on delete cascade,
    constraint fk_pp_producto foreign key (id_producto) references productos (id) on update cascade on delete restrict -- si se actualiza el producto se propaga, si se borra se bloquea
);

-- ------------------------------------------------------------

-- Carrito ↔ Producto
CREATE TABLE carrito_producto (
    id_carrito int unsigned not null,
    id_producto int unsigned not null,
    cantidad int unsigned not null default 1,
    primary key (id_carrito, id_producto),
    constraint fk_cp_carrito foreign key (id_carrito) references carrito (id) on update cascade on delete cascade,
    constraint fk_cp_producto foreign key (id_producto) references productos (id) on update cascade on delete cascade
);