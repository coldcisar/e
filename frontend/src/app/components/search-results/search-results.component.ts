import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router'; // Importamos ActivatedRoute y RouterModule
import { CommonModule } from '@angular/common'; // Importamos CommonModule
import { ArticuloService } from '../../services/articulo.service'; // Importamos el servicio de artículos
import { ArticuloModelServer } from '../../models/articulo.model'; // Importamos el modelo

@Component({
  selector: 'app-search-results',
  standalone: true,
  // Añadimos los imports necesarios para que la plantilla funcione
  imports: [CommonModule, RouterModule], 
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent implements OnInit {

  products: ArticuloModelServer[] = [];
  searchQuery: string = '';

  constructor(
    private route: ActivatedRoute,
    private articuloService: ArticuloService
  ) { }

  ngOnInit(): void {
    // Nos suscribimos a los parámetros de la ruta para obtener el término de búsqueda
    this.route.paramMap.subscribe(params => {
      // Usamos 'query' porque así lo nombramos en la ruta: path: 'search/:query'
      const query = params.get('query');

      if (query) {
        this.searchQuery = query; // Guardamos el término para mostrarlo en el título

        // Llamamos al servicio para buscar los productos
        this.articuloService.searchProducts(query).subscribe(prods => {
          this.products = prods;
          console.log(this.products);
        });
      }
    });
  }
}