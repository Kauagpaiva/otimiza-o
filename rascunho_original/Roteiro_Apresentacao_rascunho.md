# Roteiro de apresentação (≈ 8–10 min)

## Antes de apresentar (obrigatório)
- [ ] Trocar os **preços** e as **datas/plataformas** pelos reais (tabelas `ofertas` e `titulos`, seção 3.3). Preços e catálogo do notebook são **ilustrativos**.
- [ ] Conferir disponibilidade no JustWatch e citar a data da consulta.
- [ ] Rodar o notebook inteiro (Kernel → Restart & Run All) para ver se nada quebra com os seus dados.

## Roteiro

**1. O problema (1 min).** "Tenho uma lista de séries, cada uma em uma plataforma, e as assinaturas não têm fidelidade. Quais assinar em cada mês para ver tudo pagando o mínimo?"

**2. Ideia do modelo (2 min).** São três ingredientes de aulas que vimos:
- **Cobertura de conjuntos (aula 21):** cada título precisa de uma assinatura ativa que o cubra, no mês em que eu o vejo.
- **Custo fixo (aula 19):** pago a mensalidade inteira, vendo 1h ou 20h.
- **Capacidade:** só consigo ver H horas por mês. Sem isso, a resposta seria trivial (assinar cada plataforma uma vez, vendo tudo).

**3. Variáveis e restrições (2 min).**
- `y[k,m]` = assino a oferta k no mês m (binária). `x[t,m]` = vejo o título t no mês m (binária).
- Objetivo: minimizar Σ preço × y.
- Restrições: cada título é visto uma vez; ≤ H horas por mês; só vejo se tenho acesso (`x ≤ Σ y`); respeitar a janela de disponibilidade.

**4. Exemplo pequeno (1 min).** 3 plataformas, 6 títulos, 3 meses: R$ 139,60 no ótimo contra R$ 284,10 assinando tudo. **O MILP coincide com a força bruta**, então o modelo está certo.

**5. Instância completa (2 min).** Mostre o calendário (gráfico azul) e o gráfico de barras. Fale dos números que o notebook mostra (confira os do seu run): assinar tudo o ano todo × ingênua × ótimo sem anúncios × ótimo.

**6. Discussão (2 min).** Escolha 2 entre:
- Sensibilidade a H (quando o limite de horas aperta, o custo sobe rápido).
- Dividir títulos entre meses (só ajuda quando H é baixo).
- Dividir contas com amigos (juntar nunca piora; o ganho depende da sobreposição das listas).
- Limitações (preços mudam, telas simultâneas, anúncios).

## Perguntas que o professor pode fazer

**Por que programação inteira e não LP?**
Porque assinar é "sim ou não". Com LP, o solver "assinaria 30% da Netflix" e pagaria 30% do preço. O notebook mostra o gap: o relaxamento dá um limite inferior bem abaixo do ótimo inteiro (seção 4.1).

**Isso é NP-difícil?**
Sim, contém a cobertura de conjuntos (Karp, 1972). Mas com poucas centenas de variáveis binárias o HiGHS resolve em segundos.

**O que são os "cortes de capacidade"?**
Se uma plataforma tem h_p horas exclusivas e só vejo H por mês, ela precisa estar ativa em pelo menos ⌈h_p/H⌉ meses. É válido (não elimina nenhuma solução inteira), mas o solver descarta ramos mais cedo: o ótimo não muda, só fica mais rápido (conferimos isso no notebook).

**Por que a restrição de ligação é por par (t, m) e não somada?**
A versão desagregada tem relaxamento linear mais forte (Wolsey, 1998).

**Quais são as aproximações?**
Preço constante, sem custo de troca, horas conhecidas, planos com anúncios com o mesmo catálogo, cada título visto num único mês (relaxado na seção 5.1).

**Como você sabe que a resposta está certa?**
Comparação com força bruta no exemplo pequeno (3⁶ atribuições) e com/sem cortes no completo.

**E se eu quiser que a temporada 2 venha depois da 1?**
Restrição de precedência entre os x (extensão da seção 5.4).

**Por que juntar as contas nunca piora?**
O plano individual de cada um continua viável no problema do grupo (união das assinaturas), então o ótimo do grupo ≤ soma dos ótimos individuais.
