// En el archivo: src/app/models/articulo.model.ts

export interface ArticuloModelServer {
  categoria: string;
  id_producto: number;
  nombre_producto: string;
  descripcion: string;
  imagen: string;
  // Ojo: tu backend envía el precio como texto (string), no como número.
  // Lo ponemos como string aquí para que coincida.
  precio: string; 
  cantidad: number;
  // Si tienes una propiedad 'tipo_producto' en el JSON, añádela aquí también.
}

export interface serverResponse {
  count: number;
  articulos: ArticuloModelServer[];
}