/*
 * Dados do site: plataformas, ofertas (preços de novembro/2026, os mesmos da seção 3.4
 * do notebook) e um catálogo de títulos para 2027. Mês 1 = janeiro/2027.
 * Horas são aproximadas (soma da duração dos episódios); o usuário pode editar.
 */
(function (raiz) {
  "use strict";

  const PLATAFORMAS = {
    "Netflix":     { cor: "#E50914", tinta: "#fff", emoji: "🍿", curto: "NFX" },
    "HBO Max":     { cor: "#6A2BF5", tinta: "#fff", emoji: "🐉", curto: "MAX" },
    "Prime Video": { cor: "#00A8E1", tinta: "#04121a", emoji: "📦", curto: "PRM" },
    "Disney+":     { cor: "#113CCF", tinta: "#fff", emoji: "🏰", curto: "D+" },
    "Apple TV":    { cor: "#1d1d1f", tinta: "#fff", emoji: "🍎", curto: "ATV" },
    "Globoplay":   { cor: "#FF5A1F", tinta: "#fff", emoji: "🌐", curto: "GLB" },
  };

  const OFERTAS = [
    { id: "nfx-ads", nome: "Netflix Padrão c/ anúncios",              plataformas: ["Netflix"],     preco: 25.90, anuncios: true },
    { id: "nfx",     nome: "Netflix Padrão",                          plataformas: ["Netflix"],     preco: 51.90, anuncios: false },
    { id: "max-ads", nome: "HBO Max Básico c/ anúncios",              plataformas: ["HBO Max"],     preco: 29.90, anuncios: true },
    { id: "max",     nome: "HBO Max Standard",                        plataformas: ["HBO Max"],     preco: 44.90, anuncios: false },
    { id: "prm-ads", nome: "Amazon Prime (Prime Video c/ anúncios)",  plataformas: ["Prime Video"], preco: 19.90, anuncios: true },
    { id: "prm",     nome: "Amazon Prime + Prime Video sem anúncios", plataformas: ["Prime Video"], preco: 29.90, anuncios: false },
    { id: "dis-ads", nome: "Disney+ Padrão c/ anúncios",              plataformas: ["Disney+"],     preco: 29.90, anuncios: true },
    { id: "dis",     nome: "Disney+ Padrão",                          plataformas: ["Disney+"],     preco: 49.90, anuncios: false },
    { id: "atv",     nome: "Apple TV",                                plataformas: ["Apple TV"],    preco: 34.90, anuncios: false },
    { id: "glb-ads", nome: "Globoplay Padrão c/ anúncios",            plataformas: ["Globoplay"],   preco: 29.90, anuncios: true },
    { id: "glb",     nome: "Globoplay Premium",                       plataformas: ["Globoplay"],   preco: 39.90, anuncios: false },
    { id: "meli-ads",nome: "Meli+ Mega c/ anúncios",                  plataformas: ["Netflix", "HBO Max", "Disney+", "Apple TV"], preco: 74.90,  anuncios: true,  combo: true },
    { id: "meli",    nome: "Meli+ Mega sem anúncios",                 plataformas: ["Netflix", "HBO Max", "Disney+", "Apple TV"], preco: 149.90, anuncios: false, combo: true },
  ];

  // [nome, horas, gênero, [[plataforma, de, até], ...], nota, lista-do-projeto?]
  const C = (nome, horas, genero, disp, nota = "", projeto = false) => ({
    id: nome.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    nome, horas, genero, nota, projeto,
    disp: disp.map(([plataforma, de, ate]) => ({ plataforma, de, ate })),
  });

  const CATALOGO = [
    // ---- a lista do projeto (seção 3.4 do notebook)
    C("Stranger Things 5", 10, "ficção", [["Netflix", 1, 12]], "", true),
    C("Adolescência", 4, "drama", [["Netflix", 1, 12]], "", true),
    C("Wandinha T2", 7, "comédia", [["Netflix", 1, 12]], "", true),
    C("Senna", 6, "drama", [["Netflix", 1, 12]], "", true),
    C("Dungeon Meshi T2", 5, "anime", [["Netflix", 10, 12]], "estreia prevista: out", true),
    C("Harry Potter T1", 8, "fantasia", [["HBO Max", 2, 12]], "1 ep/semana desde 25/12 · completa em fev", true),
    C("The Last of Us T2", 7, "ficção", [["HBO Max", 1, 12]], "", true),
    C("A Casa do Dragão T3", 8, "fantasia", [["HBO Max", 1, 12]], "", true),
    C("O Cavaleiro dos Sete Reinos T1", 4, "fantasia", [["HBO Max", 1, 12]], "", true),
    C("The Boys T5", 8, "ação", [["Prime Video", 1, 12]], "", true),
    C("Fallout T2", 8, "ficção", [["Prime Video", 1, 12]], "", true),
    C("Tremembé", 4, "true crime", [["Prime Video", 1, 12]], "", true),
    C("Vingadores: Doutor Destino", 3, "filme", [["Disney+", 4, 12]], "no streaming por volta de abr", true),
    C("Avatar: Fogo e Cinzas", 3, "filme", [["Disney+", 1, 12]], "", true),
    C("Shōgun T1", 10, "drama", [["Disney+", 1, 12]], "", true),
    C("O Urso T4", 6, "comédia", [["Disney+", 1, 12]], "", true),
    C("Ruptura T2", 9, "ficção", [["Apple TV", 1, 12]], "", true),
    C("Pluribus", 7, "ficção", [["Apple TV", 1, 12]], "", true),
    C("O Estúdio", 5, "comédia", [["Apple TV", 1, 12]], "", true),
    C("BBB 27 (jan)", 6, "reality", [["Globoplay", 1, 1]], "ao vivo: só em jan", true),
    C("BBB 27 (fev)", 6, "reality", [["Globoplay", 2, 2]], "ao vivo: só em fev", true),
    C("BBB 27 (mar)", 6, "reality", [["Globoplay", 3, 3]], "ao vivo: só em mar", true),
    C("BBB 27 (abr)", 6, "reality", [["Globoplay", 4, 4]], "ao vivo: só em abr", true),
    C("Arcanjo Renegado T5", 6, "ação", [["Globoplay", 1, 12]], "", true),
    C("Sessão de Terapia T6", 8, "drama", [["Globoplay", 1, 12]], "", true),
    C("Ainda Estou Aqui", 2, "filme", [["Globoplay", 1, 12], ["Netflix", 3, 12]], "Globoplay; na Netflix a partir de mar", true),

    // ---- mais opções populares
    C("Round 6 T3", 6, "suspense", [["Netflix", 1, 12]]),
    C("Bridgerton T4", 8, "romance", [["Netflix", 1, 12]]),
    C("One Piece T2", 8, "aventura", [["Netflix", 1, 12]]),
    C("Black Mirror T7", 7, "ficção", [["Netflix", 1, 12]]),
    C("Sintonia T5", 5, "drama", [["Netflix", 1, 12]]),
    C("Dark (completa)", 20, "ficção", [["Netflix", 1, 12]]),
    C("The White Lotus T3", 8, "drama", [["HBO Max", 1, 12]]),
    C("Euphoria T3", 8, "drama", [["HBO Max", 1, 12]]),
    C("The Pitt T2", 15, "drama", [["HBO Max", 1, 12]]),
    C("Duna: A Profecia", 6, "ficção", [["HBO Max", 1, 12]]),
    C("Succession (completa)", 40, "drama", [["HBO Max", 1, 12]]),
    C("Reacher T3", 7, "ação", [["Prime Video", 1, 12]]),
    C("Invencível T4", 6, "animação", [["Prime Video", 1, 12]]),
    C("Os Anéis de Poder T2", 8, "fantasia", [["Prime Video", 1, 12]]),
    C("Andor T2", 9, "ficção", [["Disney+", 1, 12]]),
    C("Percy Jackson T2", 6, "fantasia", [["Disney+", 1, 12]]),
    C("Demolidor: Renascido T2", 8, "ação", [["Disney+", 1, 12]]),
    C("Only Murders T5", 5, "comédia", [["Disney+", 1, 12]]),
    C("Slow Horses T5", 5, "suspense", [["Apple TV", 1, 12]]),
    C("Silo T2", 9, "ficção", [["Apple TV", 1, 12]]),
    C("Fundação T3", 9, "ficção", [["Apple TV", 1, 12]]),
    C("Os Outros T2", 6, "suspense", [["Globoplay", 1, 12]]),
  ];

  const NOMES_MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const MESES_LONGOS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // horas livres do notebook (HORAS_LIVRES) e alguns perfis prontos
  const PERFIS = {
    estudante: { nome: "🎓 Estudante", horas: [40, 40, 20, 20, 20, 12, 40, 20, 20, 20, 12, 30] },
    clt:       { nome: "💼 CLT", horas: [20, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 25] },
    maratona:  { nome: "🛋️ Maratonista", horas: [60, 60, 50, 50, 50, 50, 60, 50, 50, 50, 50, 60] },
    corrido:   { nome: "⏰ Sem tempo", horas: [10, 8, 8, 8, 8, 8, 10, 8, 8, 8, 8, 12] },
  };

  const api = { PLATAFORMAS, OFERTAS, CATALOGO, NOMES_MESES, MESES_LONGOS, PERFIS };
  if (typeof module === "object" && module.exports) module.exports = api;
  else Object.assign(raiz, { Dados: api });
})(typeof globalThis !== "undefined" ? globalThis : this);
