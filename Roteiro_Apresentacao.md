# Roteiro de apresentação: Rodízio de assinaturas de streaming (≈ 8–10 min)

O notebook `Projeto_Streaming.ipynb` é ao mesmo tempo relatório, código e apresentação. Este roteiro diz o que mostrar, em que ordem e o que falar.

## Antes de apresentar

- [ ] Preencher os nomes da dupla na primeira célula do notebook.
- [ ] Rodar tudo (*Run All*). Leva cerca de 3 minutos. No VS Code, escolha o kernel **Python 3.11** (o `ipykernel` já está instalado). Em outra máquina: `pip install -r requirements.txt`.
- [ ] Conferir o preço do **Meli+ Mega** no app do Mercado Livre: é o único preço de maio/2026; os outros são de novembro/2026. Se algum preço mudou, edite a tabela `ofertas` (seção 3.4) e rode tudo de novo.
- [ ] (Opcional) Ajustar a sua lista e as suas horas livres (tabelas `lista` e `HORAS_LIVRES`, seção 3.4). Todo o texto que tem números é gerado pelo código, então nada fica desatualizado.
- [ ] Plano B: `Projeto_Streaming.html` abre em qualquer navegador, já com todos os resultados.

> Os números abaixo são os da execução de 18/11/2026. Com os mesmos dados, eles se repetem; só os tempos de execução mudam de um computador para outro.

## Roteiro

**1. O problema (1 min) – seção 1**
- "Assinar o plano mais barato das 7 principais plataformas custa **R$ 205,30 por mês**, e quase todas reajustaram os preços em 2026."
- "Mas streaming não tem fidelidade: dá para assinar, maratonar e cancelar. A pergunta é: **dada a minha lista de 2027, o que assinar em cada mês para ver tudo pagando o mínimo?**"
- Por que não é trivial: horas livres limitadas, lançamentos ao longo do ano, BBB ao vivo, combos, filme em duas plataformas.

**2. O modelo (2–3 min) – seção 2.4**
- Variáveis: `y[k,m]` = compro a oferta k no mês m; `x[t,m]` = assisto o título t no mês m. Todas binárias.
- Objetivo: soma dos preços das ofertas compradas (**custo fixo**, aula 19: pago o mesmo vendo 1 h ou 30 h).
- Restrições:
  - (1) cada título visto uma vez, dentro da janela;
  - (2) cabe nas horas livres do mês;
  - (3) só assisto se comprei algo que dá acesso (**cobertura de conjuntos**, aula 21).
- (4) é a "formulação forte" (big-M com M = H). Explico na parte 5.
- Frase-chave: "sem o limite de horas, a resposta seria trivial: assinar cada plataforma uma vez só."

**3. Exemplo pequeno (1 min) – seção 3.3**
- 3 plataformas, 6 séries, 3 meses, 20 h/mês: ótimo de **R$ 121,50** (contra R$ 227,10 assinando tudo, 46% a menos).
- Mostre o calendário: precisa de 5 mensalidades, não 3 (o raciocínio está no texto logo abaixo).
- "A força bruta testou as 108 atribuições possíveis e deu o mesmo valor, então o modelo está certo."

**4. A instância real de 2027 (2 min) – seções 3.4 a 3.6**
- Dados: 26 títulos (162 h), 6 plataformas, 13 ofertas com preços reais, horas livres maiores nas férias e menores nas provas.
- Mostre o **calendário**: maratona de uma ou duas plataformas por mês, nada pago nos meses de prova, Globoplay preso de janeiro a abril por causa do BBB.
- Mostre o **gráfico de barras**:

  | Estratégia | Custo no ano |
  |---|---|
  | Assinar tudo o ano inteiro | R$ 1.496,40 |
  | Assistir o quanto antes, sem planejar | R$ 500,30 |
  | Ótimo sem anúncios | R$ 423,00 |
  | **Ótimo** | **R$ 286,00** |

  O ótimo economiza **81%** em relação a assinar tudo e **43%** em relação a quem já faz rodízio sem planejar.
- "Não ver anúncios custa R$ 137 a mais no ano, cerca de R$ 0,85 por hora assistida."

**5. Por dentro do solver (1–2 min) – seção 4**
- **Relaxação linear:** R$ 229,39, contra R$ 286,00 inteiro (gap de 20%). Mostre as "assinaturas fracionárias" impossíveis, como "44% da Netflix em novembro". É por isso que precisa de *branch-and-bound*.
- **Formulação forte (tabela da seção 4.2, com 20 h/mês):** a formulação básica **não consegue provar o ótimo em 30 s**. Com a restrição (4) e os cortes de Chvátal–Gomory (5), prova em cerca de 10 a 18 s. "Mesmas soluções inteiras, relaxação mais justa: como se escreve o modelo importa (aulas 19 e 23)."

**6. Discussão (2 min) – seção 5. Escolha 2 ou 3 destes:**
- **Spoiler (5.2):** ver os lançamentos no mês da estreia custa **R$ 29,90 a mais**; aceitar esperar 3 meses não custa nada a mais. É uma curva de compromisso, como na aula 9.
- **Tempo livre (5.1):** o custo cai em degraus. Dividir um título entre meses só ajuda quando falta tempo (com 65% das minhas horas: R$ 365,70 inteiro contra R$ 345,80 dividido).
- **Plano anual (5.3):** vale 8 a 9 mensalidades, e com rodízio cada plataforma é usada 1 ou 2 meses, então **nunca compensa**. É a "arma" das plataformas contra o rodízio.
- **República (5.4):** separados, R$ 641,90; juntos, **R$ 300,10** (53% a menos). Pelo valor de Shapley, a Bia paga mais porque tem menos tempo livre e obriga o grupo a ficar mais meses assinado. Um PL minimax (aula 4) mostra que existe divisão estável (núcleo não vazio). E aqui o combo Meli+ Mega aparece (em dezembro).

**7. Conclusão (30 s) – seção 5.7**
- "Um problema do dia a dia virou um MILP pequeno que junta cobertura de conjuntos, custo fixo e planejamento com capacidade. Foi conferido por força bruta e por um verificador independente, e deu para medir o preço do conforto, da pressa e do tempo livre."

## Perguntas que o professor pode fazer

**Por que programação inteira, e não PL?**
Porque assinar é sim ou não. Na relaxação linear, o solver "assina 44% da Netflix" e paga 44% do preço, e o resultado sai 20% abaixo do real (seção 4.1).

**Isso é NP-difícil?**
Sim. Com um mês só e horas infinitas, sobra exatamente uma cobertura de conjuntos (Karp, 1972). Mas a instância tem 411 variáveis binárias e o HiGHS resolve em cerca de 2 s.

**Por que a restrição (4), se (2) e (3) já bastam?**
Para soluções inteiras, ela é redundante. Mas na relaxação a (3) vale título a título: com y = 0,5 dá para ver metade de cada título, por mais horas que isso some. A (4) obriga cada hora assistida a "pagar" a sua fração da mensalidade. É o big-M da aula 19 com o menor M válido (M = H). Mesmas soluções inteiras, relaxação mais justa.

**O que é o corte (5)?**
Somando a (4) nos meses: h_p ≤ H_max × (meses com p ativa). Como o número de meses é inteiro, arredonda-se para cima: meses ≥ ⌈h_p / H_max⌉. Isso é um corte de Chvátal–Gomory (aula 23): não elimina nenhum plano inteiro, mas corta soluções fracionárias. Exemplo: a Netflix tem 32 h exclusivas; com 20 h/mês, precisa de pelo menos 2 meses.

**Como você sabe que a resposta está certa?**
Três conferências: (i) força bruta no exemplo pequeno (108 atribuições, mesmo ótimo); (ii) a função `verificar`, que refaz todas as contas sem usar o solver (cada título uma vez, horas, acesso, custo); (iii) as quatro formulações da seção 4.2 chegam ao mesmo ótimo.

**Por que o combo Meli+ Mega não entrou no plano individual?**
Ele custa R$ 74,90 e só compensa quando preciso de 3 das 4 plataformas dele no mesmo mês. Com as minhas horas livres, isso não acontece. Na república, que tem três vezes mais horas por mês, ele entra em dezembro.

**Por que o BBB aparece quatro vezes?**
É programa ao vivo: só dá para ver no mês em que passa. Cada mês vira um "título" com janela de um mês, sem mudar nada no modelo (seção 2.6).

**Por que o plano deixa Harry Potter para dezembro?**
O modelo básico não tem pressa: se for mais barato, adia. A seção 5.2 trata disso com uma espera máxima. Ver tudo no mês da estreia custa R$ 29,90 a mais.

**Por que não usar a soma ponderada (custo + λ × espera) da aula 9?**
Funcionaria, mas com variáveis inteiras a soma ponderada só acha os pontos da fronteira na envoltória convexa. Restringir a espera (método da restrição ε) acha todos.

**Quais dados são estimativas?**
As horas de cada título, as horas livres, as datas de 2027 não confirmadas (*Harry Potter* completo em fevereiro, *Vingadores* no Disney+ em abril, *Dungeon Meshi* em outubro, *Ainda Estou Aqui* na Netflix em março, BBB de janeiro a abril) e o preço do Meli+ Mega. Todas estão marcadas na coluna `obs` da tabela.

**E se os preços mudarem?**
Basta editar a tabela `ofertas` e rodar de novo. Preço que muda mês a mês (promoção) vira c[k,m] no objetivo, e o modelo continua igual.

**O que é o valor de Shapley?**
É quanto cada morador "custa a mais" ao entrar na república, em média sobre todas as ordens de chegada (Shapley, 1953). Ele cobra mais de quem gera mais custo; a divisão igual ignora isso.

## Mapa do notebook

| Seção | O que tem | Mostrar na apresentação? |
|---|---|---|
| 1 | Introdução, histórico, aplicações | só falar |
| 2 | Modelo (2.4) e de onde vem cada peça (2.5) | **sim** (2.4) |
| 3.1–3.2 | Código do modelo e do verificador | só se perguntarem |
| 3.3 | Exemplo pequeno + força bruta | **sim** |
| 3.4 | Dados reais (preços, lista, horas) | rapidamente |
| 3.5–3.6 | Plano ótimo e comparação | **sim** |
| 4 | Relaxação e formulação forte | **sim** (resumido) |
| 5 | Discussão: tempo livre, spoiler, anual, república, limitações | escolha 2–3 |
