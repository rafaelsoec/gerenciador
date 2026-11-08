import { Component, input } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  height = input<string | number>('60px');

  background = input<string>('#FFFFFF');

  borderTop = input<string>('1px solid #E5E7EB');
}
