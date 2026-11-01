import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export class Usuario {
  id: number = 0;
  nome: string = "";
  login: string = "";

  constructor(id: number, nome: string, login: string) {
    this.id = id;
    this.nome = nome;
    this.login = login;
  }
}

export interface LoginRequisicao {
  login: string;
  senha: string;
}

export interface LoginResposta {
  token: string;
  login: string;
  nome: string;
  usuarioId: number;
}

export interface AlterarPerfilRequisicao {
  nome?: string;
  senhaAtual?: string;
  novaSenha?: string;
}

const TOKEN_KEY = 'auth_token';
const USUARIO_KEY = 'auth_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly url = `${environment.apiUrl}/auth`;

  readonly usuarioAtual = signal<Usuario | null>(this._carregarUsuario());

  // ── Auth ──────────────────────────────────────────────────────────────────

  login(dados: LoginRequisicao): Observable<LoginResposta> {
    return this.http.post<LoginResposta>(`${this.url}/login`, dados).pipe(
      tap((resposta) => {
        this._salvarSessao(resposta.token, new Usuario(resposta.usuarioId, resposta.nome, resposta.login));
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.usuarioAtual.set(null);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── Perfil ────────────────────────────────────────────────────────────────

  alterarPerfil(dados: AlterarPerfilRequisicao): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/perfil`, dados).pipe(
      tap((usuario) => {
        this._salvarSessao(this.getToken()!, usuario);
      }),
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _salvarSessao(token: string, usuario: Usuario): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    this.usuarioAtual.set(usuario);
  }

  private _carregarUsuario(): Usuario | null {
    try {
      if (typeof localStorage === 'undefined') {
        return null;
      }

      const raw = localStorage.getItem(USUARIO_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch (e) {
      this.logout();
      return null;
    }
  }
}
