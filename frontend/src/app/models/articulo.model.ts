
export interface ArticuloModelServer {
    categoria:number;
    id_producto: number;
    nombre_categoria:string;
    nombre_producto: string;
    descripcion: string;
    imagen: string;
    precio: number;
    cantidad: number;
  }
  
  
  export interface serverResponse  {
    count: number;
    articulos: ArticuloModelServer[]
  };
  