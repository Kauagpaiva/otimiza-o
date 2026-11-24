# Roteiro de apresentação: Rodízio de assinaturas de streaming (10 min)

A apresentação é o arquivo `apresentação/Rodízio de Streaming.html`: 13 slides, com meta de **9:35** para sobrar folga. Depois do "Obrigado" vem um apêndice para as perguntas. O notebook `Projeto_Streaming.ipynb` fica aberto em outra aba, caso peçam o código.

## Antes de apresentar

- [ ] Abrir o HTML no navegador e apertar **F** (tela cheia). Com internet, as fontes carregam; sem internet, o navegador usa as do sistema e nada quebra.
- [ ] Ensaiar com o cronômetro: **C** mostra o tempo gasto e a meta até o slide atual (verde = no ritmo, laranja = atrasado); **R** zera.
- [ ] Rodar o notebook (*Run All*, cerca de 3 minutos). No VS Code, kernel **Python 3.11**; em outra máquina, `pip install -r requirements.txt`.
- [ ] Conferir o preço do **Meli+ Mega** no app do Mercado Livre (é o único preço de maio/2026). Os números dos slides são os da execução de 18/11/2026: se algum preço mudar, o notebook recalcula tudo, mas os slides precisam ser atualizados à mão.
- [ ] Combinar quem fala o quê. Uma divisão natural: uma pessoa faz os slides 1 a 7 (problema e modelo) e a outra os slides 8 a 13 (resultados e solver).

## Tempo de cada slide

| # | Slide | Tempo | Acumulado |
|---|---|---|---|
| 1 | Capa | 0:15 | 0:15 |
| 2 | O problema | 0:40 | 0:55 |
| 3 | Dados → conjuntos e parâmetros | 0:45 | 1:40 |
| 4 | Variáveis | 0:50 | 2:30 |
| 5 | Função objetivo | 0:45 | 3:15 |
| 6 | Restrições (4 cliques) | 1:20 | 4:35 |
| 7 | Exemplo pequeno (4 cliques) | 0:55 | 5:30 |
| 8 | O plano ótimo para 2027 | 0:45 | 6:15 |
| 9 | Por que R$ 286,00 (1 clique) | 0:45 | 7:00 |
| 10 | Relaxação e *branch-and-bound* | 0:40 | 7:40 |
| 11 | Formulação forte | 0:55 | 8:35 |
| 12 | O mesmo modelo, outras perguntas | 0:40 | 9:15 |
| 13 | Conclusão | 0:20 | 9:35 |

Os cliques revelam passos dentro do slide (→, espaço ou clique do mouse). O cronômetro usa exatamente esta tabela.

## O que falar

**1. Capa (0:15)**
- "Nosso projeto é um programa linear inteiro que decide o que assinar em cada mês de 2027. Assinar tudo custaria R$ 1.496,40 no ano; o modelo chega a R$ 286,00."

**2. O problema (0:40)**
- "O plano mais barato das 7 maiores plataformas soma R$ 205,30 por mês. Mas não há fidelidade: dá para assinar, maratonar e cancelar."
- "O difícil é que as decisões se influenciam: horas livres por mês, estreias e programas ao vivo, combos e títulos em duas plataformas. Cada uma dessas coisas vira um símbolo do modelo" (aponte os símbolos nos cartões).
- "O modelo junta três problemas clássicos: cobertura de conjuntos, custo fixo e dimensionamento de lotes."

**3. Dados → conjuntos e parâmetros (0:45)**
- Leia a tabela com o exemplo de cada linha: *c<sub>k</sub>* é o preço (Netflix com anúncios, R$ 25,90), *P<sub>k</sub>* diz o que a oferta libera (o combo libera 4 plataformas), *h<sub>t</sub>* são as horas do título, *A<sub>t,m</sub>* diz onde ele está em cada mês e *H<sub>m</sub>* são as horas livres.
- "Desses dados saem três conjuntos que deixam o modelo curto: a janela *M<sub>t</sub>*, as ofertas que dão acesso *K<sub>t,m</sub>* e os títulos exclusivos *T<sub>p,m</sub>*."

**4. Variáveis (0:50)**
- "Para cada mês, duas perguntas: compro a oferta *k*? Esse é o *y*. Assisto ao título *t*? Esse é o *x*."
- "O *y* é por oferta, e não por plataforma, porque o preço está na oferta: com anúncios, sem anúncios ou combo. É binário porque a mensalidade é tudo ou nada."
- "O *x* precisa existir porque as horas livres são por mês: sem saber quando vejo cada título, não dá para limitar as horas. E ele só existe dentro da janela: os buracos da matriz (o BBB, os lançamentos) são variáveis que nem criamos. São 156 + 255 = 411 variáveis binárias."

**5. Função objetivo (0:45)**
- Leia a fórmula peça por peça: "minimizar, somando em todas as ofertas e em todos os meses, o preço vezes o 'comprei?'."
- "Só o *y* aparece porque é custo fixo: ver 2 h ou 19 h de Netflix em outubro custa os mesmos R$ 25,90."
- "Um exemplo de conta: assinar tudo, todo mês. A forma mais barata de ter as 6 plataformas usa o combo: 124,70 × 12 = R$ 1.496,40."

**6. Restrições (1:20)**
- Antes de clicar: "Este é o modelo inteiro: 411 variáveis, 371 restrições, e o HiGHS resolve em 1,9 s. Agora, uma restrição por vez, com os dados."
- Clique 1, restrição (1): "O BBB de fevereiro só tem fevereiro na janela, então *x* = 1 e o Globoplay fica obrigatório em fevereiro. *Harry Potter* tem 11 meses possíveis, e o modelo escolhe um."
- Clique 2, restrição (2): "Maio tem 20 h, e o Prime inteiro soma 8 + 8 + 4 = 20. Sem essa restrição, o ótimo cairia para R$ 214,40: o combo num mês só, com tudo de uma vez."
- Clique 3, restrição (3): "*Ainda Estou Aqui* em março pode ser coberto por 6 ofertas. Essa é a cobertura de conjuntos."
- Clique 4, restrição (4): "Ela parece repetir as outras: se assinei a Netflix, as horas dela cabem nas 20 h do mês, que é a (2); se não assinei, não vejo nada dela, que é a (3). A diferença aparece na relaxação linear, em que o solver pode 'assinar meia Netflix'. Só com a (3), meia assinatura libera metade de cada série: 16 h. Com a (4), libera 20 × ½ = 10 h. A (3) cobra por título; a (4) cobra por hora. É um big-M com M = *H<sub>m</sub>*, o menor valor que não proíbe nenhum plano válido. O efeito aparece no slide 11."

**7. Exemplo pequeno (0:55)**
- "Antes da instância real, um caso que dá para resolver à mão: 3 plataformas, 6 séries, 3 meses e 20 h por mês."
- Cliques 1 a 3: leia os três passos. A ideia: o P2 prende o Prime em março; Netflix e HBO não cabem juntas em fevereiro e nenhuma cabe em março; então são pelo menos 5 mensalidades, e as 5 mais baratas que cabem custam R$ 121,50.
- Clique 4: "O MILP e a força bruta, que testou as 108 combinações, dão os mesmos R$ 121,50."

**8. O plano ótimo para 2027 (0:45)**
- "Uma ou duas plataformas por mês, nos meses com mais tempo livre, e nada em junho, agosto, setembro e novembro."
- "A função objetivo é a soma da linha de gastos: R$ 286,00, 81% a menos que assinar tudo e 43% a menos que fazer rodízio sem planejar."
- Se sobrar tempo, passe o mouse num bloco para mostrar o que é assistido.

**9. Por que R$ 286,00 (0:45)**
- "Dá para conferir sem o solver. O BBB obriga 4 meses de Globoplay. A Netflix tem 32 h, e o *Dungeon Meshi* só sai em outubro: nenhum mês de outubro a dezembro tem 32 h livres, então são 2 meses de Netflix. As outras plataformas cabem num mês só. Somando o preço mais barato de cada uma: R$ 286,00."
- "Isso é um limite inferior, e o modelo achou um plano com esse custo. Limite igual ao plano: é ótimo."
- Clique: "E o combo? Ele só compensa com 3 das suas 4 plataformas no mesmo mês, e o solver prova que ele não ajuda aqui."

**10. Relaxação e *branch-and-bound* (0:40)**
- "Se trocamos {0, 1} por [0, 1], o PL paga pedaços: 41% do combo em julho. O resultado, R$ 229,39, é um limite inferior, e o gap é de 19,8%."
- "O *branch-and-bound* fixa uma variável fracionária em 0 ou em 1. Cada ramo é outro PL, e o limite sobe (R$ 230,68 e R$ 242,72) até encontrar o melhor plano."

**11. Formulação forte (0:55)**
- "Num teste com 20 h por mês: quantos meses de Netflix cada formulação exige? Só com a (3), o PL vê metade de cada série em 2 meses e paga 1 mês. Com a (4), cada hora paga a sua fração: 32/20 = 1,6. Com o corte (5), arredondamos para 2, que é o valor inteiro."
- "O corte vem de somar a (4) em todos os meses e arredondar para cima: é um corte de Chvátal–Gomory."
- "Na prática, a formulação básica não prova o ótimo em 30 s; com (4) e (5), prova em cerca de 13 s. As soluções inteiras são as mesmas; só a relaxação muda."

**12. O mesmo modelo, outras perguntas (0:40)**
- Se o tempo estiver apertado, fale de dois cartões.
- Spoiler: "encurtamos a janela dos lançamentos; ver tudo na estreia custa R$ 29,90 a mais."
- Tempo livre: "multiplicamos *H<sub>m</sub>*; o custo cai em degraus."
- Plano anual: "uma variável *z* nova; nenhum anual compensa no rodízio."
- Limitações (cartão de baixo): só aponte; detalhe se perguntarem.

**13. Conclusão (0:20)**
- "Economia de 81% com o ótimo provado; a formulação forte prova em 13 s; e o mesmo modelo respondeu três perguntas novas. Em programação inteira, como se escreve o modelo importa tanto quanto o que ele diz. Obrigado!"

## Durante as perguntas

Depois do "Obrigado", → abre o apêndice. Use **O** (visão geral) para pular direto ao slide.

| Slide | Para responder sobre |
|---|---|
| A1 | histórico: os três problemas clássicos, com as citações |
| A2 | todos os preços e o combo |
| A3 | a lista dos 26 títulos |
| A4 | as horas livres de cada mês |
| A5 | o gráfico do tempo livre |
| A6 | o gráfico do spoiler |
| A7 | o plano anual |
| A8 e A9 | a república e a divisão justa da conta (Shapley e PL minimax) |

## Perguntas que o professor pode fazer

**Por que programação inteira, e não PL?**
Porque assinar é sim ou não. Na relaxação linear, o solver "assina 41% do combo" e paga 41% do preço, e o resultado sai 20% abaixo do real (slide 10; seção 4.1 do notebook).

**Como vocês sabem que R$ 286,00 é ótimo?**
De três formas: (i) o solver termina com gap 0; (ii) a conta do slide 9 dá um limite inferior de R$ 286,00 sem combo, e o solver prova que o combo não ajuda; (iii) no exemplo pequeno, a força bruta testou as 108 atribuições e deu o mesmo valor. Além disso, a função `verificar` refaz todas as contas do plano sem usar o solver.

**Por que *y* por oferta e não por plataforma?**
Porque o preço depende da oferta: a mesma plataforma tem plano com e sem anúncios, e o combo libera quatro plataformas de uma vez. O acesso a uma plataforma no mês é a soma dos *y* das ofertas que a incluem.

**Isso é NP-difícil?**
Sim. Com um mês só e horas de sobra, sobra exatamente uma cobertura de conjuntos (Karp, 1972). Mas a instância tem 411 variáveis binárias e o HiGHS resolve em cerca de 2 s.

**E sem a restrição de horas?**
O ótimo cai para R$ 214,40: o combo num mês só (novembro), o Prime num mês e o Globoplay nos 4 meses do BBB. É a restrição (2) que obriga a espalhar as plataformas pelo ano.

**Por que a restrição (4), se (2) e (3) já bastam?**
Para soluções inteiras, ela é redundante. Mas na relaxação a (3) vale título a título: com *y* = 0,5 dá para ver metade de cada título, por mais horas que isso some. A (4) obriga cada hora assistida a "pagar" a sua fração da mensalidade. Exemplo: Netflix em outubro com *y* = ½. A (3) deixa ver 16 h (metade de cada série); a (4) só deixa 10 h. Para ver as 16 h, o PL tem de pagar 16/20 = 80% da mensalidade. É o big-M da aula 19 com o menor M válido (M = *H<sub>m</sub>*).

**O que é o corte (5)?**
Somando a (4) em todos os meses: *h<sub>p</sub>* ≤ *H*<sub>max</sub> × (meses com *p* ativa). Como o número de meses é inteiro, arredonda-se para cima: meses ≥ ⌈*h<sub>p</sub>* / *H*<sub>max</sub>⌉. É um corte de Chvátal–Gomory (aula 23): não elimina nenhum plano inteiro, mas corta soluções fracionárias.

**Por que o combo Meli+ Mega não entrou no plano individual?**
Ele custa R$ 74,90 e só compensa quando são precisas 3 das 4 plataformas dele no mesmo mês (a trinca mais barata custa R$ 85,70). Com as minhas horas livres, isso não acontece. Na república, que tem mais horas por mês, ele entra em dezembro.

**Por que o BBB aparece quatro vezes?**
É programa ao vivo: só dá para ver no mês em que passa. Cada mês vira um "título" com janela de um mês, sem mudar nada no modelo.

**Por que o plano deixa *Harry Potter* para dezembro?**
O modelo básico não tem pressa: se for mais barato, adia. Com uma espera máxima (slide 12 e A6), ver tudo no mês da estreia custa R$ 29,90 a mais.

**Por que não usar a soma ponderada (custo + λ × espera) da aula 9?**
Funcionaria, mas com variáveis inteiras a soma ponderada só acha os pontos da fronteira na envoltória convexa. Restringir a espera (método da restrição ε) acha todos.

**Quais dados são estimativas?**
As horas de cada título, as horas livres, as datas de 2027 não confirmadas (*Harry Potter* completo em fevereiro, *Vingadores* no Disney+ em abril, *Dungeon Meshi* em outubro, *Ainda Estou Aqui* na Netflix em março, BBB de janeiro a abril) e o preço do Meli+ Mega. Todas estão marcadas na coluna `obs` da tabela.

**E se os preços mudarem?**
Basta editar a tabela `ofertas` e rodar de novo. Preço que muda mês a mês (promoção) vira *c<sub>k,m</sub>* no objetivo, e o modelo continua igual.

**O que é o valor de Shapley?**
É quanto cada morador "custa a mais" ao entrar na república, em média sobre todas as ordens de chegada (Shapley, 1953). Ele cobra mais de quem gera mais custo; a divisão igual ignora isso.

## Onde está cada slide no notebook

| Slide | Seção do notebook |
|---|---|
| 2 e A1 | 1.1 a 1.3 |
| 3, A2, A3 e A4 | 2.2 e 3.4 |
| 4 a 6 | 2.3 a 2.5 e 2.8 |
| 7 | 3.3 |
| 8 | 3.5 e 3.6 |
| 9 | conta à mão; o plano está na 3.5 |
| 10 | 4.1 |
| 11 | 4.2 |
| 12, A5 a A9 | 5.1 a 5.5 |
