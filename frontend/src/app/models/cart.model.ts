
import {ArticuloModelServer} from "./articulo.model";

export interface CartModelServer {
  total: number;
  data: {
    articulo?: ArticuloModelServer,
    numInCart: number
  }[];
}

export interface CartModelPublic {
  total: number;
    ArtData: {
    id_producto: number,
    incart: number
  }[];
}
