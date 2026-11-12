import { Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
})
export class LoadingComponent {
  constructor(
    public loadingService: LoadingService,
    private renderer: Renderer2,
  ) {}

  private element!: HTMLElement;

  ngAfterViewInit(): void {
    this.element = document.querySelector('app-loading')!;
    this.renderer.appendChild(document.body, this.element);
  }

  ngOnDestroy(): void {
    if (this.element?.parentNode) {
      this.renderer.removeChild(document.body, this.element);
    }
  }
}
