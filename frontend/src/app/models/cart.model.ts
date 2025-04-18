import {ArticuloModelServer} from "./articulo.model";

export interface CartModelServer {
  total: number;
  data: {
    product: ArticuloModelServer ;
    numInCart: number
  }[];
}

export interface CartModelPublic {
  total: number;
  prodData: {
    id: number,
    incart: number
  }[];
}
