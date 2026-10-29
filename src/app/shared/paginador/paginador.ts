import { Component, input, output } from '@angular/core';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';

@Component({
    selector: 'app-paginador',
    templateUrl: 'paginador.html',
    styleUrl: 'paginador.css',
    imports: [MatPaginatorModule],
})
export class Paginador {
    /** Total de itens (controla o range exibido no paginador). */
    readonly length = input.required<number>();

    /** Quantidade de itens por página. Padrão: 10. */
    readonly pageSize = input<number>(10);

    /** Opções disponíveis no seletor de página. */
    readonly pageSizeOptions = input<number[]>([5, 10, 25]);

    /** Índice da página atual (0-based). */
    readonly pageIndex = input<number>(0);

    /** Emite sempre que o usuário muda de página ou altera o tamanho. */
    readonly paginaAlterada = output<PageEvent>();

    handlePageEvent(e: PageEvent): void {
        this.paginaAlterada.emit(e);
    }
}
