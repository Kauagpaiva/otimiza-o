/*
 * Otimizador do rodízio de streaming — porta para JavaScript do modelo da seção 2.4
 * do notebook Projeto_Streaming.ipynb. Resolve o MILP com o HiGHS (WebAssembly).
 *
 *   min  Σ_k Σ_m c_k y[k,m]
 *   s.a. Σ_m x[t,m] = 1                       (1) cada título visto uma vez, na janela
 *        Σ_t h_t x[t,m] <= H_m                 (2) horas livres do mês
 *        x[t,m] <= Σ_{k ∈ K_t,m} y[k,m]        (3) cobertura: só assiste se tem acesso
 *        Σ_{t ∈ T_p,m} h_t x[t,m] <= H_m Σ_{k: p ∈ P_k} y[k,m]   (4) formulação forte
 *        Σ_m Σ_{k: p ∈ P_k} y[k,m] >= ceil(h_p / H_max)          (5) cortes de Chvátal–Gomory
 *
 * Funciona no navegador (window.Otimizador) e no Node (module.exports).
 */
(function (raiz) {
  "use strict";

  const MESES = 12;
  const PENALIDADE_HORA = 200; // modo "elástico": cada hora pulada custa mais que qualquer mensalidade

  // ---------------------------------------------------------------- utilidades
  const num = (v) => {
    const s = (Math.round(v * 1e6) / 1e6).toString();
    return s.includes("e") ? v.toFixed(6) : s;
  };

  /** Plataformas em que o título t está disponível no mês m (conjunto A_{t,m}). */
  function disponivel(t, m) {
    const s = new Set();
    for (const d of t.disp) if (d.de <= m && m <= d.ate) s.add(d.plataforma);
    return s;
  }

  function intersecta(a, b) {
    for (const x of a) if (b.has(x)) return true;
    return false;
  }

  /** Escreve o modelo no formato LP (CPLEX), que o HiGHS lê direto. */
  class ModeloLP {
    constructor() {
      this.obj = [];
      this.linhas = [];
      this.limites = [];
      this.binarias = [];
      this.continuas = [];
      this.estrutura = []; // as mesmas restrições, em forma de dados (para o solver reserva)
      this.n = 0;
    }
    variavel(nome, custo, binaria) {
      if (custo) this.obj.push([custo, nome]);
      if (binaria) this.binarias.push(nome);
      else { this.limites.push(` 0 <= ${nome} <= 1`); this.continuas.push(nome); }
      this.n++;
      return nome;
    }
    static termos(lista) {
      const partes = [];
      lista.forEach(([c, v], i) => {
        if (!c) return;
        const sinal = c < 0 ? "-" : "+";
        partes.push(`${i === 0 && sinal === "+" ? "" : sinal + " "}${num(Math.abs(c))} ${v}`);
      });
      // quebra linhas longas (o formato LP aceita continuação)
      const out = [];
      for (let i = 0; i < partes.length; i += 8) out.push(partes.slice(i, i + 8).join(" "));
      return out.join("\n   ");
    }
    restricao(termos, sentido, rhs) {
      const t = termos.filter(([c]) => c);
      if (!t.length) {
        // restrição sem variáveis: só verifica se é satisfeita
        const ok = sentido === "<=" ? 0 <= rhs + 1e-9 : sentido === ">=" ? 0 >= rhs - 1e-9 : Math.abs(rhs) < 1e-9;
        if (!ok) this.inviavelTrivial = true;
        return;
      }
      this.estrutura.push({ nome: "r" + this.linhas.length, termos: t, sentido, rhs });
      this.linhas.push(` r${this.linhas.length}: ${ModeloLP.termos(t)} ${sentido} ${num(rhs)}`);
    }
    /** Mesmo modelo no formato do javascript-lp-solver (solver reserva, JS puro). */
    paraJsLP() {
      const variables = {}, constraints = {}, ints = {};
      const v = (n) => (variables[n] = variables[n] || {});
      this.obj.forEach(([c, n]) => (v(n).custo = c));
      this.binarias.forEach((n) => { v(n); ints[n] = 1; });
      this.continuas.forEach((n) => v(n));
      this.estrutura.forEach(({ nome, termos, sentido, rhs }) => {
        constraints[nome] = sentido === "<=" ? { max: rhs } : sentido === ">=" ? { min: rhs } : { equal: rhs };
        termos.forEach(([c, n]) => (v(n)[nome] = (v(n)[nome] || 0) + c));
      });
      [...this.binarias, ...this.continuas].forEach((n) => { constraints["ub_" + n] = { max: 1 }; v(n)["ub_" + n] = 1; });
      return { optimize: "custo", opType: "min", constraints, variables, ints };
    }
    texto() {
      return [
        "Minimize",
        " obj: " + (this.obj.length ? ModeloLP.termos(this.obj) : "0 " + (this.binarias[0] || "y_0_0")),
        "Subject To",
        ...this.linhas,
        "Bounds",
        ...this.limites,
        this.binarias.length ? "Binaries" : "",
        ...this.binarias.map((b) => " " + b),
        "End",
      ].join("\n");
    }
  }

  // ---------------------------------------------------------------- modelo
  /**
   * Resolve o rodízio.
   * entrada = {
   *   titulos: [{id, nome, horas, disp: [{plataforma, de, ate}]}],
   *   ofertas: [{id, nome, plataformas: [..], preco, anuncios}],
   *   horas:   [H_1, ..., H_12],
   *   dividir: bool  (permite ver um título em partes, em meses diferentes)
   *   elastico: bool (se não couber tudo, pula o mínimo de títulos)
   *   tempo: segundos
   * }
   */
  function montar(entrada, opcoes) {
    const { titulos, ofertas, horas } = entrada;
    const dividir = !!entrada.dividir;
    const elastico = !!opcoes.elastico;
    const meses = [...Array(MESES)].map((_, i) => i + 1);
    const H = (m) => Math.max(0, +horas[m - 1] || 0);
    const P = ofertas.map((o) => new Set(o.plataformas));
    const mod = new ModeloLP();

    // variáveis y[k,m]
    const y = {};
    ofertas.forEach((o, k) => meses.forEach((m) => (y[k + "," + m] = mod.variavel(`y_${k}_${m}`, o.preco, true))));

    // variáveis x[t,m] (só dentro da janela e em meses em que o título cabe)
    const x = {};
    const A = titulos.map((t) => meses.map((m) => disponivel(t, m)));
    titulos.forEach((t, i) =>
      meses.forEach((m) => {
        const cabe = dividir ? H(m) > 0 : H(m) >= t.horas - 1e-9;
        if (A[i][m - 1].size && cabe) x[i + "," + m] = mod.variavel(`x_${i}_${m}`, 0, !dividir);
      })
    );
    const s = {};
    if (elastico) titulos.forEach((t, i) => (s[i] = mod.variavel(`s_${i}`, PENALIDADE_HORA * Math.max(1, t.horas), true)));

    const acesso = (plats) => ofertas.map((_, k) => k).filter((k) => intersecta(P[k], plats));

    // (1) cada título visto exatamente uma vez (ou pulado, no modo elástico)
    titulos.forEach((t, i) => {
      const termos = meses.filter((m) => x[i + "," + m]).map((m) => [1, x[i + "," + m]]);
      if (elastico) termos.push([1, s[i]]);
      mod.restricao(termos, "=", 1);
    });

    // (2) horas livres
    meses.forEach((m) => {
      const termos = titulos.map((t, i) => [t.horas, x[i + "," + m]]).filter(([, v]) => v);
      if (termos.length) mod.restricao(termos, "<=", H(m));
    });

    // (3) cobertura
    for (const chave in x) {
      const [i, m] = chave.split(",").map(Number);
      const ks = acesso(A[i][m - 1]);
      mod.restricao([[1, x[chave]], ...ks.map((k) => [-1, y[k + "," + m]])], "<=", 0);
    }

    // (4) formulação forte (big-M com M = H_m)
    const plataformas = [...new Set(titulos.flatMap((t) => t.disp.map((d) => d.plataforma)))];
    plataformas.forEach((pl) => {
      const ks = acesso(new Set([pl]));
      meses.forEach((m) => {
        const exclusivos = titulos
          .map((t, i) => i)
          .filter((i) => x[i + "," + m] && A[i][m - 1].size === 1 && A[i][m - 1].has(pl));
        if (exclusivos.length)
          mod.restricao(
            [...exclusivos.map((i) => [titulos[i].horas, x[i + "," + m]]), ...ks.map((k) => [-H(m), y[k + "," + m]])],
            "<=",
            0
          );
      });
    });

    // (5) cortes de Chvátal–Gomory (só valem se todo título precisa ser visto)
    if (!elastico) {
      const Hmax = Math.max(...meses.map(H));
      plataformas.forEach((pl) => {
        const hp = titulos
          .filter((t) => {
            const ps = new Set(t.disp.map((d) => d.plataforma));
            return ps.size === 1 && ps.has(pl);
          })
          .reduce((a, t) => a + t.horas, 0);
        const minimo = Hmax > 0 ? Math.ceil(hp / Hmax - 1e-9) : 0;
        if (minimo > 0) {
          const ks = acesso(new Set([pl]));
          mod.restricao(ks.flatMap((k) => meses.map((m) => [1, y[k + "," + m]])), ">=", minimo);
        }
      });
    }

    return { mod, y, x, s, meses, A };
  }

  function interpretar(entrada, m, sol, status, tempo) {
    const { titulos, ofertas, horas } = entrada;
    const v = (nome) => (nome && sol.Columns[nome] ? sol.Columns[nome].Primal : 0);
    const plano = m.meses.map((mes) => ({
      mes,
      horasLivres: +horas[mes - 1] || 0,
      ofertas: [],
      assistir: [],
      horasUsadas: 0,
      custo: 0,
    }));
    ofertas.forEach((o, k) =>
      m.meses.forEach((mes) => {
        if (v(m.y[k + "," + mes]) > 0.5) {
          plano[mes - 1].ofertas.push(o);
          plano[mes - 1].custo += o.preco;
        }
      })
    );
    const pulados = [];
    titulos.forEach((t, i) => {
      if (m.s[i] && v(m.s[i]) > 0.5) pulados.push(t);
      m.meses.forEach((mes) => {
        const f = v(m.x[i + "," + mes]);
        if (f > 1e-6) {
          const plats = m.A[i][mes - 1];
          // em qual oferta comprada ele vai assistir?
          const via = plano[mes - 1].ofertas.find((o) => o.plataformas.some((p) => plats.has(p)));
          const plataforma = via ? via.plataformas.find((p) => plats.has(p)) : [...plats][0];
          plano[mes - 1].assistir.push({ titulo: t, fracao: f, horas: t.horas * f, plataforma });
          plano[mes - 1].horasUsadas += t.horas * f;
        }
      });
    });
    const custo = plano.reduce((a, p) => a + p.custo, 0);
    return { status, custo, plano, pulados, tempo };
  }

  async function resolver(highs, entrada, opcoes = {}) {
    const inicio = Date.now();
    const m = montar(entrada, opcoes);
    if (m.mod.inviavelTrivial) return { status: "inviável" };
    let sol;
    if (highs.jsLP) return resolverJsLP(highs.jsLP, entrada, m, opcoes, inicio);
    const lp = m.mod.texto();
    try {
      sol = highs.solve(lp, {
        time_limit: opcoes.tempo || 20,
        mip_rel_gap: 1e-6,
        output_flag: false,
      });
    } catch (e) {
      return { status: "erro", erro: String(e) };
    }
    const st = sol.Status;
    if (st === "Infeasible") return { status: "inviável" };
    const temSolucao = sol.Columns && Object.values(sol.Columns).some((c) => c.Primal !== undefined);
    if (!temSolucao) return { status: st === "Time limit reached" ? "sem solução no tempo" : "erro", erro: st };
    const status = st === "Optimal" ? "ótimo" : "limite de tempo";
    return interpretar(entrada, m, sol, status, (Date.now() - inicio) / 1000);
  }

  function resolverJsLP(solver, entrada, m, opcoes, inicio) {
    const modelo = m.mod.paraJsLP();
    modelo.options = { timeout: (opcoes.tempo || 20) * 1000, tolerance: 0 };
    let r;
    try { r = solver.Solve(modelo); } catch (e) { return { status: "erro", erro: String(e) }; }
    if (!r.feasible) return { status: "inviável" };
    const Columns = {};
    Object.keys(modelo.variables).forEach((n) => (Columns[n] = { Primal: +r[n] || 0 }));
    const st = Date.now() - inicio > (opcoes.tempo || 20) * 1000 - 50 ? "limite de tempo" : "ótimo";
    return interpretar(entrada, m, { Columns }, st, (Date.now() - inicio) / 1000);
  }

  /** Tenta o modelo estrito; se for inviável, resolve o elástico (pula o mínimo de títulos). */
  async function otimizar(highs, entrada, tempo = 20) {
    const r = await resolver(highs, entrada, { tempo });
    if (r.status !== "inviável") return r;
    return resolver(highs, entrada, { tempo, elastico: true });
  }

  // ---------------------------------------------------------------- estratégias simples (seção 3.6)
  /** Combinação mais barata de ofertas que cobre todas as exigências (cada exigência = conjunto de plataformas). */
  function coberturaMaisBarata(ofertas, exigencias) {
    if (!exigencias.length) return { custo: 0, escolha: [] };
    const K = ofertas.length;
    const P = ofertas.map((o) => new Set(o.plataformas));
    let melhor = { custo: Infinity, escolha: null };
    // poda: só ofertas úteis
    const uteis = [...Array(K).keys()].filter((k) => exigencias.some((e) => intersecta(P[k], e)));
    const n = uteis.length;
    if (n > 18) return melhor;
    for (let mask = 1; mask < 1 << n; mask++) {
      let custo = 0;
      const sel = [];
      for (let j = 0; j < n; j++) if (mask & (1 << j)) { custo += ofertas[uteis[j]].preco; sel.push(uteis[j]); }
      if (custo >= melhor.custo) continue;
      if (exigencias.every((e) => sel.some((k) => intersecta(P[k], e)))) melhor = { custo, escolha: sel.map((k) => ofertas[k]) };
    }
    return melhor;
  }

  function assinarTudo(entrada) {
    const plats = [...new Set(entrada.titulos.flatMap((t) => t.disp.map((d) => d.plataforma)))];
    const c = coberturaMaisBarata(entrada.ofertas, plats.map((p) => new Set([p])));
    const mesesAtivos = entrada.horas.filter((h) => h > 0).length || MESES;
    return { custo: c.custo * MESES, porMes: c.custo, escolha: c.escolha, mesesAtivos };
  }

  function oQuantoAntes(entrada) {
    const { titulos, horas } = entrada;
    const livre = horas.map((h) => +h || 0);
    const exig = [...Array(MESES)].map(() => []);
    const janela = (t) => [...Array(MESES)].map((_, i) => i + 1).filter((m) => disponivel(t, m).size);
    const ordem = titulos.slice().sort((a, b) => {
      const ja = janela(a), jb = janela(b);
      return Math.max(...ja) - Math.max(...jb) || Math.min(...ja) - Math.min(...jb);
    });
    for (const t of ordem) {
      const mes = janela(t).find((m) => livre[m - 1] >= t.horas - 1e-9);
      if (!mes) return null;
      livre[mes - 1] -= t.horas;
      exig[mes - 1].push(disponivel(t, mes));
    }
    return exig.reduce((a, e) => a + coberturaMaisBarata(entrada.ofertas, e).custo, 0);
  }

  const api = { otimizar, resolver, assinarTudo, oQuantoAntes, coberturaMaisBarata, disponivel, MESES };
  if (typeof module === "object" && module.exports) module.exports = api;
  else raiz.Otimizador = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
