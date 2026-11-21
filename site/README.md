# Site: Rodízio de Streaming

Versão web do modelo do notebook `Projeto_Streaming.ipynb`. A pessoa escolhe os títulos, as horas livres de cada mês e as preferências, e o site monta o calendário de assinaturas mais barato de 2027.

## Como abrir

- **Direto:** abra `index.html` no navegador. O solver carrega o `highs.wasm` do jsDelivr, então é preciso internet.
- **Servidor local** (usa o `vendor/highs.wasm`, funciona offline):
  ```
  python -m http.server 8000
  ```
  e acesse http://localhost:8000.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | interface (HTML, CSS e JS, sem build) |
| `otimizador.js` | o modelo da seção 2.4 (restrições 1 a 5) escrito em formato LP para o HiGHS, mais as estratégias de comparação da seção 3.6 |
| `catalogo.js` | plataformas, ofertas (preços de nov/2026) e catálogo de títulos. Edite aqui para mudar preços ou adicionar títulos |
| `vendor/` | HiGHS 1.15.3 compilado para WebAssembly (pacote `highs` do npm, licença MIT) |

## Diferenças em relação ao notebook

- Se a lista não couber nas horas livres, o site resolve uma versão "elástica" do modelo: vê o máximo de horas possível e mostra o que ficou de fora. Nesse caso os cortes (5) ficam desligados, porque deixam de ser válidos.
- "Já tenho de graça" vira uma oferta de R$ 0 para aquela plataforma.
- Se o navegador bloquear WebAssembly, o site usa o `javascript-lp-solver` como reserva (mais lento).

Com a lista e as horas do notebook, o site chega ao mesmo ótimo: **R$ 286,00** (R$ 423,00 sem anúncios; R$ 1.496,40 assinando tudo; R$ 500,30 vendo o quanto antes).
