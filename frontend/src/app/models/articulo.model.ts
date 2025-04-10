
export interface ArticuloModelServer {
    id_producto: Number;
    nombre_producto: String;
    tipo_producto: String;
    descripcion: String;
    imagen: String;
    precio: Number;
    cantidad: Number;
  }
  
  
  export interface serverResponse  {
    count: number;
    products: ArticuloModelServer[]
  };
  