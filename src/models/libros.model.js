const pool = require("../config/conexion");

// Filtrar libros 
const selectAllLibros = async (filtros) => {

    // Recibe los filtros enviados desde el controller mediante req.query
    // Si el usuario busca "harry", la consulta devolverá todos los libros
    // que contengan "harry" en el título, descripción, categoría, autor o editorial.

    const { busqueda, categoria, precioMin, precioMax } = filtros;

    // Aquí monto la consulta para traer todos los datos de los libros porque luego los necesito - Cry  (T_T)
    let sql = `
        SELECT
        p.id,
        p.titulo,
        p.descripcion,
        p.isbn,
        p.precio,
        p.stock,
        p.pre_reserva,
        p.imagen,
        p.fecha_publicacion,
        e.nombre AS editorial,
        GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS categorias,
        GROUP_CONCAT(DISTINCT a.nombre_autor SEPARATOR ', ') AS autores,

        ROUND(AVG(r.calificacion), 1) AS rating,
        COUNT(DISTINCT r.id) AS total_resenas

    FROM productos p
    LEFT JOIN editoriales e ON p.id_editorial = e.id
    LEFT JOIN producto_categoria pc ON p.id = pc.id_producto
    LEFT JOIN categorias c ON pc.id_categoria = c.id
    LEFT JOIN producto_autor pa ON p.id = pa.id_producto
    LEFT JOIN autores a ON pa.id_autor = a.id
    LEFT JOIN resenas r ON p.id = r.id_producto
    WHERE 1 = 1
    `;

    // Array para meter los valores que sustituyen los ? de la consulta
    const params = [];

    // Filtro de búsqueda por título, descripción, categoría, autor o editorial
    if (busqueda) {
        sql += `
            AND (
                p.titulo LIKE ?
                OR p.descripcion LIKE ?
                OR c.nombre LIKE ?
                OR a.nombre_autor LIKE ?
                OR e.nombre LIKE ?
            )
        `;
        // Añade el texto de búsqueda a cada uno de los ? del LIKE.
        // Los símbolos % permiten buscar coincidencias parciales en título,
        // descripción, categoría, autor y editorial.
        params.push(
            `%${busqueda}%`,
            `%${busqueda}%`,
            `%${busqueda}%`,
            `%${busqueda}%`,
            `%${busqueda}%`
        );
    }

    // Filtro por categoría
    if (categoria) {
        sql += ` AND c.id = ?`;
        params.push(categoria);
    }

    // Filtro por precio mínimo
    if (precioMin) {
        sql += ` AND p.precio >= ?`;
        params.push(precioMin);
    }

    // Filtro por precio máximo
    if (precioMax) {
        sql += ` AND p.precio <= ?`;
        params.push(precioMax);
    }

    // Agrupa aqui para que cada libro salga una sola vez
    sql += `
        GROUP BY 
            p.id,
            p.titulo,
            p.descripcion,
            p.isbn,
            p.precio,
            p.stock,
            p.pre_reserva,
            p.imagen,
            p.fecha_publicacion,
            e.nombre
    `;

    // Ejecuta la consulta SQL
    const [result] = await pool.query(sql, params);

    // Retorna los libros al controller
    return result;
};


// Obtener un libro por id con editorial, autores y categorías
const selectLibroById = async (id) => {

    /**
     * Esta consulta se usa para la página de detalle del libro.
     *
     * Trae:
     * - Datos del producto
     * - Editorial
     * - Autores relacionados
     * - Categorías relacionadas
     *
     * GROUP_CONCAT permite juntar varios autores o categorías
     * en un solo campo de texto.
     */
    const sql = `
        SELECT
            p.id,
            p.titulo,
            p.descripcion,
            p.isbn,
            p.precio,
            p.stock,
            p.pre_reserva,
            p.imagen,
            p.fecha_publicacion,
            p.id_editorial,

            e.nombre AS editorial,

            GROUP_CONCAT(DISTINCT a.nombre_autor SEPARATOR ', ') AS autores,
            GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS categorias

        FROM productos p

        LEFT JOIN editoriales e
            ON p.id_editorial = e.id

        LEFT JOIN producto_autor pa
            ON p.id = pa.id_producto

        LEFT JOIN autores a
            ON pa.id_autor = a.id

        LEFT JOIN producto_categoria pc
            ON p.id = pc.id_producto

        LEFT JOIN categorias c
            ON pc.id_categoria = c.id

        WHERE p.id = ?

        GROUP BY
            p.id,
            p.titulo,
            p.descripcion,
            p.isbn,
            p.precio,
            p.stock,
            p.pre_reserva,
            p.imagen,
            p.fecha_publicacion,
            p.id_editorial,
            e.nombre
    `;

    // Ejecutamos la consulta pasando el id del libro
    const [result] = await pool.query(sql, [id]);


    return result[0];
};

// Crear libro
const insertLibro = async (libro) => {
    const {
        titulo,
        descripcion,
        isbn,
        precio,
        stock,
        pre_reserva,
        imagen,
        fecha_publicacion,
        id_editorial
    } = libro;

    const sql = `
        INSERT INTO productos
        (titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
        titulo,
        descripcion,
        isbn,
        precio,
        stock,
        pre_reserva,
        imagen,
        fecha_publicacion,
        id_editorial
    ]);

    return result;
};

// Editar un libro de la base de datos
// Necesitamos el id para saber qué libro actualizar
// y el objeto libro para tener los nuevos datos
const updateLibro = async (id, libro) => {

    // Sacamos los datos que vienen desde el body
    const {
        titulo,
        descripcion,
        isbn,
        precio,
        stock,
        pre_reserva,
        imagen,
        fecha_publicacion,
        id_editorial
    } = libro;

    // Actualizamos los datos del libro que tenga ese id
    const sql = `
        UPDATE productos
        SET
            titulo = ?,
            descripcion = ?,
            isbn = ?,
            precio = ?,
            stock = ?,
            pre_reserva = ?,
            imagen = ?,
            fecha_publicacion = ?,
            id_editorial = ?
        WHERE id = ?
    `;

    // Los ? se sustituyen por los valores de abajo
    const [result] = await pool.query(sql, [
        titulo,
        descripcion,
        isbn,
        precio,
        stock,
        pre_reserva,
        imagen,
        fecha_publicacion,
        id_editorial,
        id
    ]);

    return result;
};

// Borrar un libro por su id
const deleteLibro = async (id) => {

    // Eliminamos el libro que tenga ese id
    const sql = `
        DELETE FROM productos
        WHERE id = ?
    `;

    const [result] = await pool.query(sql, [id]);

    return result;
};


// Buscar todos los autores que están relacionados con un libro/producto.
// Para ello se utiliza la tabla `producto_autor`, que es la encargada
// de guardar las relaciones entre productos y autores.
//
// Se hace un INNER JOIN entre la tabla `autores` y `producto_autor`
// para obtener la información completa de cada autor asociado al
// producto que se recibe como parámetro.
//
// La consulta devuelve el id, el nombre y la biografía de cada autor
// vinculado al producto indicado mediante `id_producto`.
const sql = `
    SELECT
        a.id,
        a.nombre_autor,
        a.biografia
    FROM autores a
    INNER JOIN producto_autor pa
        ON a.id = pa.id_autor
    WHERE pa.id_producto = ?
`;
const selectAutoresByLibro = async (id) => {

    // Buscar todos los autores relacionados con ese libro
    const sql = `
        SELECT
            a.id,
            a.nombre_autor,
            a.biografia
        FROM autores a
        INNER JOIN producto_autor pa
            ON a.id = pa.id_autor
        WHERE pa.id_producto = ?
    `;

    // Ejecutar consulta
    const [result] = await pool.query(sql, [id]);


    return result;
};


// INSERTAR un autor en un libro
const insertAutorLibro = async (idLibro, idAutor) => {

    // Guardar la relación en la tabla producto_autor
    const sql = `
        INSERT INTO producto_autor
        (id_producto, id_autor)
        VALUES (?, ?)
    `;


    const [result] = await pool.query(sql, [
        idLibro,
        idAutor
    ]);


    return result;
};

// Quitar un autor de un libro
const deleteAutorLibro = async (idLibro, autorId) => {

    // Borrar la relación entre ese libro y ese autor
    const sql = `
        DELETE FROM producto_autor
        WHERE id_producto = ?
        AND id_autor = ?
    `;

    // Pasar el id del libro y el id del autor
    const [result] = await pool.query(sql, [
        idLibro,
        autorId
    ]);


    return result;
};

// Buscar todas las categorías relacionadas con un libro/producto
const selectCategoriasByLibro = async (id) => {

    /**
     * La tabla producto_categoria guarda la relación
     * entre productos y categorías.
     *
     * Como queremos los datos completos de la categoría,
     * hacemos un INNER JOIN con la tabla categorias.
     */
    const sql = `
        SELECT
            c.id,
            c.nombre,
            c.descripcion
        FROM categorias c
        INNER JOIN producto_categoria pc
            ON c.id = pc.id_categoria
        WHERE pc.id_producto = ?
    `;

    // Ejecutamos la consulta pasando el id del libro
    const [result] = await pool.query(sql, [id]);

    // Devolvemos todas las categorías encontradas
    return result;
};


// Insertar una categoría en un libro
const insertCategoriaLibro = async (idLibro, idCategoria) => {

    /**
     * Guardamos la relación entre el producto y la categoría.
     *
     * id_producto será el libro.
     * id_categoria será la categoría seleccionada.
     */
    const sql = `
        INSERT INTO producto_categoria
        (id_producto, id_categoria)
        VALUES (?, ?)
    `;

    const [result] = await pool.query(sql, [
        idLibro,
        idCategoria
    ]);

    return result;
};


// Quitar una categoría de un libro
const deleteCategoriaLibro = async (idLibro, categoriaId) => {

    /**
     * Eliminamos solo la relación entre libro y categoría.
     *
     * No se borra el libro.
     * No se borra la categoría.
     */
    const sql = `
        DELETE FROM producto_categoria
        WHERE id_producto = ?
        AND id_categoria = ?
    `;

    const [result] = await pool.query(sql, [
        idLibro,
        categoriaId
    ]);

    return result;
};

module.exports = {
    selectAllLibros,
    selectLibroById,
    insertLibro,
    updateLibro,
    deleteLibro,

    selectAutoresByLibro,
    insertAutorLibro,
    deleteAutorLibro,

    selectCategoriasByLibro,
    insertCategoriaLibro,
    deleteCategoriaLibro
};