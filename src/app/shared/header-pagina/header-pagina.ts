import { Component, input, output, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header-pagina',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './header-pagina.html',
  styleUrl: './header-pagina.css',
})
export class HeaderPaginaComponent {
  /** Título principal exibido no header. */
  readonly titulo = input.required<string>();

  /** Subtítulo exibido abaixo do título. Opcional. */
  readonly subtitulo = input<string>('');

  /**
   * Rótulo do botão de ação. Quando não informado (ou vazio), o botão é ocultado.
   */
  readonly nomeBotao = input<string>('');

  /**
   * Cor de fundo do header.
   * Aceita qualquer valor CSS válido: '#111827', 'royalblue', 'var(--cor)', etc.
   * Padrão: transparente.
   */
  readonly corBackground = input<string | null>(null);

  /**
   * Cor do texto (título, subtítulo).
   * Padrão: herda do contexto.
   */
  readonly corTexto = input<string | null>(null);

  /**
   * Cor de fundo do botão.
   * Aceita qualquer valor CSS válido.
   * Padrão: herda do tema Material.
   */
  readonly corBotao = input<string | null>(null);

  /** Emite quando o botão de ação é clicado. */
  readonly botaoClicado = output<void>();

  @HostBinding('style.--header-bg')
  get _hostBg(): string | null { return this.corBackground(); }

  @HostBinding('style.--header-color')
  get _hostColor(): string | null { return this.corTexto(); }

  @HostBinding('style.--header-btn-bg')
  get _hostBtnBg(): string | null { return this.corBotao(); }

  onBotaoClicado(): void {
    this.botaoClicado.emit();
  }
}
