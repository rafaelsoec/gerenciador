import { Component, computed, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-scroll',
  standalone: true,
  templateUrl: './scroll.component.html',
  styleUrl: './scroll.component.css',
})
export class ScrollComponent implements OnInit {
  vertical = input<boolean>(false);
  horizontal = input<boolean>(false);

  width = input<string | number>('100%');
  height = input<string | number>('100%');

  /**
   * Desloca a scrollbar para a direita em px.
   * 0 = posição padrão (sem deslocamento), valores maiores empurram mais para a direita.
   */
  scrollbarOffset = input<number>(0);

  widthCss = computed(() =>
    typeof this.width() === 'number' ? `${this.width()}px` : this.width(),
  );

  heightCss = computed(() =>
    typeof this.height() === 'number' ? `${this.height()}px` : this.height(),
  );

  scrollbarOffsetCss = computed(() => `${this.scrollbarOffset()}px`);

  ngOnInit() {}
}
