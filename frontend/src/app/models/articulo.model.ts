
export interface ArticuloModelServer {
  categoria: string;
  id_producto: number;
  nombre_producto: string;
  descripcion: string;
  imagen: string;
  precio: string; 
  cantidad: number;
}

export interface serverResponse {
  count: number;
  articulos: ArticuloModelServer[];
}