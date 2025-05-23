
export interface ArticuloModelServer {
    id_producto: number;
    nombre_producto: string;
    tipo_producto: string;
    descripcion: string;
    imagen: string;
    precio: number;
    cantidad: number;
    categoria:number;
  }
  
  
  export interface serverResponse  {
    count: number;
    products: ArticuloModelServer[]
  };
  