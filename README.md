
  # Acesse+

  Marketplace acessível construído com React, TypeScript, Tailwind e Firebase.

  Este README foi escrito como documento de reunião e também como referência técnica do estado atual do projeto. Ele descreve o que já está funcionando, como a aplicação foi montada, por que certas decisões de interface foram tomadas e o que ainda está pendente.

  ## Resumo executivo

  O Acesse+ é uma interface de marketplace com foco em acessibilidade, leitura rápida e caminhos curtos para ações principais. A navegação principal cobre home, login, cadastro, produto, carrinho e perfil, enquanto a página inicial foi desenhada para permitir descoberta rápida de produtos. O cabeçalho mostra o nome do usuário logado quando existe sessão ativa, e volta para `Entrar` quando não há conta autenticada.

  O projeto está em fase de evolução. A base visual está forte, mas ainda existem partes estáticas ou visuais que serão ligadas a dados reais depois, como busca, cartões de categoria, alguns botões de suporte e controles do painel de acessibilidade.

  ## Estado atual do projeto

  - Home com hero, atalhos, ofertas em destaque, bloco de cadastro, card de comunidade social, categorias e rodapé.
  - Login com Firebase Auth usando e-mail e senha.
  - Cadastro com Firebase Auth e gravação do perfil no Firestore em `users/{uid}`.
  - Perfil com edição de dados, foto com recorte local e upload para Storage.
  - Header com estado autenticado: mostra o primeiro nome do usuário ou `Entrar` quando não existe sessão.
  - Carrinho e produto já possuem telas próprias e fluxo de checkout em etapas.
  - As telas principais foram reorganizadas em subpastas próprias em `src/pages/<Tela>/index.tsx`.
  - Regras de segurança versionadas no repositório para Firestore, Storage e Realtime Database.
  - A busca do navbar está estilizada e pronta visualmente, mas ainda não filtra produtos.
  - Os botões de login com iCloud e Google são visuais por enquanto.
  - O painel de acessibilidade do login/cadastro é visual e ainda não controla recursos reais.
  - As categorias e vários links do footer ainda são pontos de navegação/placeholder, não filtros dinâmicos.

  ## Tecnologias e bibliotecas

  | Tecnologia | Uso no projeto | Por que foi escolhida |
  | --- | --- | --- |
  | React 19 | Renderização da interface | Mantém a UI declarativa e simples de manter |
  | TypeScript 5 | Tipagem do app | Reduz erros em formulários, rotas e estado de autenticação |
  | React Router DOM 7 | Rotas e navegação | Organiza home, login, cadastro, produto e carrinho sem recarregar a página |
  | Firebase 12 | Auth, Firestore, Storage e Realtime Database | Resolve autenticação e persistência sem criar um backend próprio agora |
  | Tailwind CSS 4 | Estilo utilitário | Permite reproduzir o layout pixel-preciso com rapidez e consistência |
  | Vite 6 | Build e ambiente local | Entrega start rápido, build enxuto e boa DX |
  | SVG inline | Ícones e microícones | Evita dependências extras e dá mais controle visual |

  ### Observações sobre o setup visual

  - O projeto usa `Montserrat` como tipografia principal.
  - `tailwind.config.js` está com `preflight: false`, então o reset base é controlado manualmente.
  - Existem breakpoints personalizados (`mq1050` e `lg`) para preservar o desenho desktop do layout.
  - O estilo atual é mais próximo de um marketplace desktop-first do que de um app mobile-first.

  ## Estrutura do projeto

  ```text
  src/
    App.tsx
    index.tsx
    global.css
    context/
      AuthContext.tsx
    components/
      AppHeader.tsx
      AuthLayout.tsx
      ...
    firebase/
      firebase.ts
      firestore.rules
      storage.rules
      database.rules
    pages/
      Inicial/
        index.tsx
      TelaLogin/
        index.tsx
      TelaCadastro/
        index.tsx
      TelaProduto/
        index.tsx
      TelaCarrinho/
        index.tsx
      TelaPerfil/
        index.tsx
  ```

  As telas foram movidas para pastas próprias com `index.tsx` para facilitar a organização por tela e evitar quebra de resolução ao trocar os arquivos de lugar. `src/App.tsx` agora aponta explicitamente para esses entrypoints.

  ### Arquivos importantes

  - `src/index.tsx` é o ponto de entrada ativo do Vite.
  - `src/App.tsx` centraliza as rotas, o comportamento de scroll ao trocar de página e os imports explícitos das telas para manter a resolução estável.
  - `src/context/AuthContext.tsx` observa a sessão e carrega o perfil do usuário.
  - `src/firebase/firebase.ts` inicializa o Firebase e expõe `auth`, `firestore`, `database` e `storage`.
  - `src/global.css` é a folha global ativa.
  - `src/main.tsx` e `src/styles.css` ainda existem como legado de scaffold, mas não fazem parte do fluxo atual de boot.
  - `src/components/inicial/SocialCommunityCard.tsx` é a nova seção de comunidade inserida na home.

  ## Arquitetura e fluxo de dados

  ### Boot da aplicação

  1. `index.html` aponta para `src/index.tsx`.
  2. `index.tsx` monta o app dentro de `BrowserRouter`.
  3. O app é envolvido por `AuthProvider`, que mantém o estado de autenticação disponível em qualquer tela.
  4. `App.tsx` resolve as rotas declarativas.

  ### Estado global de autenticação

  O provedor de autenticação faz três coisas:

  - escuta `onAuthStateChanged` do Firebase;
  - busca o documento do usuário em `users/{uid}` no Firestore;
  - expõe `user`, `profile`, `displayName`, `firstName`, `loading` e `logout`.

  Isso permite que o cabeçalho mostre o nome correto sem duplicar lógica em cada tela.

  ### Fluxo de dados atual

  - Parte da interface usa dados estáticos em arrays dentro das próprias páginas.
  - Login e cadastro usam Firebase Auth.
  - O perfil do usuário é salvo no Firestore.
  - O carrinho, produto e home ainda têm conteúdo estático de demonstração.
  - Realtime Database e Storage estão preparados nas rules, mas ainda não são a fonte principal de dados da interface.

  ## Rotas

  | Rota | Tela | Função |
  | --- | --- | --- |
  | `/` | Home | Entrada principal do marketplace |
  | `/login` | Login | Entrar com e-mail e senha |
  | `/cadastro` | Cadastro | Criar conta e perfil do usuário |
  | `/registro` | Cadastro | Alias da rota de cadastro |
  | `/produto` | Produto | Detalhe do produto selecionado |
  | `/perfil` | Perfil | Editar dados pessoais, foto e preferências |
  | `/carrinho` | Carrinho | Resumo do pedido |
  | `/carrinho/endereco` | Carrinho | Etapa de endereço |
  | `/carrinho/entrega` | Carrinho | Etapa de entrega |

  ## Como cada tela funciona

  ### Home (`src/pages/Inicial/index.tsx`)

  A página inicial é a vitrine do projeto.

  Ela possui:

  - hero de apresentação com logo e mensagem de boas-vindas;
  - quatro cards de atalho no topo;
  - bloco de oferta do dia;
  - grades de ofertas adicionais;
  - bloco de cadastro com benefícios;
  - card de comunidade social com ícones flutuantes;
  - seção de categorias;
  - rodapé de suporte, confiança e navegação.

  #### Por que essa estrutura existe

  - A primeira dobra precisa mostrar ações rápidas sem obrigar a rolagem longa.
  - Os cards iniciais resumem caminhos mais comuns: produtos, meios de pagamento, categoria e login.
  - O bloco de cadastro reforça confiança e valor antes de pedir registro.
  - As categorias e o rodapé ajudam descoberta, mas não competem com as ações principais.

  ### Login (`src/pages/TelaLogin/index.tsx`)

  O login usa Firebase Auth com e-mail e senha.

  Fluxo atual:

  1. O usuário entra na tela de login.
  2. Digita e-mail e senha.
  3. Clica em `Entrar`.
  4. Se a autenticação funcionar, volta para a home.
  5. Se já houver sessão ativa, a tela redireciona automaticamente para `/`.

  Os botões de iCloud e Google ainda são visuais e não estão conectados a provedores federados.

  ### Cadastro (`src/pages/TelaCadastro/index.tsx`)

  O cadastro também usa Firebase Auth.

  Fluxo atual:

  1. O usuário entra na tela de cadastro.
  2. Preenche nome, e-mail e senha.
  3. Escolhe tipo de deficiência e atividades preferidas.
  4. Define se a conta é de empresa ou usuário.
  5. Clica em `Cadastrar`.
  6. A conta é criada no Firebase Auth.
  7. O perfil complementar é salvo em `users/{uid}` no Firestore.
  8. A tela volta para a home.

  ### Produto (`src/pages/TelaProduto/index.tsx`)

  A tela de produto é um detalhe de demonstração com:

  - imagem principal;
  - miniaturas;
  - preço;
  - botões de quantidade;
  - botão de adicionar ao carrinho;
  - simulador de frete.

  Parte dos controles ainda é visual, mas a tela já serve para mostrar a lógica do funil de compra.

  ### Carrinho (`src/pages/TelaCarrinho/index.tsx`)

  O carrinho funciona como um fluxo em etapas:

  - resumo do pedido;
  - cadastro de endereço;
  - seleção de entrega.

  Isso foi feito no mesmo componente com variação por rota para preservar contexto durante o checkout.

  ### Perfil (`src/pages/TelaPerfil/index.tsx`)

  A tela de perfil permite atualizar os dados do usuário autenticado.

  Fluxo atual:

  1. O usuário abre `/perfil` autenticado.
  2. Ajusta nome, telefone, cidade, estado e descrição.
  3. Seleciona uma foto de perfil.
  4. Recorta a imagem localmente antes de salvar.
  5. Clica em `Salvar alterações`.
  6. A foto é enviada para Storage e o restante do perfil é salvo no Firestore.
  7. O cabeçalho e o contexto de autenticação passam a refletir os dados novos.

  Se não houver sessão ativa, a tela redireciona para `/login`.

  ## Jornada do usuário e clique budget

  Regra prática usada no projeto: tarefas principais devem ficar em **1 a 2 cliques**. Mais do que isso começa a pesar na descoberta; menos do que isso só faz sentido quando a informação já está visível na tela.

  > Observação: a contagem abaixo considera cliques. Digitação e rolagem não entram na conta.

  | Tarefa | Caminho atual | Cliques | Por que esse valor faz sentido |
  | --- | --- | --- | --- |
  | Abrir um produto em destaque | Home -> clicar em um card de produto | 1 | O produto já está visível; o clique só confirma a intenção |
  | Explorar ofertas e abrir um item | Home -> `mostrar todas as ofertas` -> card do produto | 2 | O primeiro clique posiciona o usuário na seção certa, o segundo abre o item |
  | Entrar na conta | Home -> `Entrar` no header -> enviar formulário | 2 | Um clique escolhe a rota e outro confirma a autenticação |
  | Criar conta | Home -> CTA de cadastro -> enviar formulário | 2 | Mantém a intenção clara e evita excesso de etapas |
  | Ir do produto ao carrinho | Produto -> `ADICIONAR AO CARRINHO` | 1 | O carrinho precisa ser rápido depois da decisão de compra |
  | Sair do carrinho para endereço/entrega | Carrinho -> `Finalizar compra` -> `Cadastrar` | 2 | São etapas de confirmação, então 2 ações são aceitáveis |

  ### O que não existe ainda nesse clique budget

  - A busca ainda não filtra produtos.
  - As categorias não são filtros clicáveis.
  - O fluxo de login social ainda não existe.

  Esses pontos precisam de implementação antes de entrarem como métricas de jornada real.

  ## Design system e estilo

  ### Paleta atual

  - Verde principal: `#167307`, `#1b7d0c`, `#257a0d`.
  - Verde de apoio/superfície: `#ecf8e8`, `#edfdec`, `#f6f8f5`.
  - Neutros de fundo: `#f3f3f3`, `#f5f5f5`, `#e8e8e8`.
  - Fundo escuro de confiança: `#0f1e18` e `#0b1712`.
  - CTA de alta prioridade: `#ee3544`.

  ### Por que essas cores

  - O verde comunica marca, ação e continuidade.
  - O neutro segura o olhar e evita poluição visual.
  - O fundo escuro do footer cria uma zona de encerramento e confiança.
  - O vermelho é usado só no ponto que precisa de atenção imediata: criar conta.

  ### Tipografia e ritmo

  - A tipografia principal é `Montserrat`.
  - Os pesos estão concentrados em 600 para dar um ar mais sólido e consistente.
  - Inputs e botões usam alturas próximas de 42px a 53px para manter conforto de toque.

  ### Estrutura visual da home

  - Os quatro cards do topo ficam em linha horizontal no desktop porque esse é o formato mais rápido para descoberta.
  - A largura máxima dos cards foi ajustada para manter o texto legível sem quebrar a CTA.
  - O bloco de cadastro usa quatro benefícios alinhados de forma compacta e mantém o botão abaixo, para não competir com os argumentos de valor.
  - O footer foi reduzido para texto leve, sem blocos visuais pesados, porque a parte de baixo da página deve apoiar e não disputar atenção com a vitrine.

  ### Por que alguns tamanhos não devem cair nem subir demais

  - **Cards iniciais:** se ficarem menores, o texto bate no botão; se ficarem maiores, quebram a linha de quatro colunas e empurram conteúdo para baixo.
  - **Inputs do auth:** se ficarem menores, o toque fica ruim; se ficarem maiores, o card perde densidade e parece pesado demais.
  - **CTA principal:** 53px dá presença e toque confortável; menor que isso começa a ficar frágil, maior que isso começa a dominar demais o bloco.
  - **Busca do header:** a altura atual equilibra legibilidade, logo e ícone sem ocupar a barra inteira.

  ## Acessibilidade

  O projeto foi pensado para acessibilidade desde a estrutura.

  ### Decisões já presentes no código

  - Uso de elementos semânticos: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`.
  - Labels visíveis ou `sr-only` em campos importantes.
  - Botões com `type` explícito para não disparar submissões acidentais.
  - `aria-label` em botões só com ícone.
  - `alt` nos elementos com informação útil e `alt=""` nos decorativos.
  - `:focus-visible` no CSS global para navegação por teclado.
  - Campos e CTAs com altura suficiente para toque confortável.
  - Contraste alto entre texto e fundo nas áreas críticas.

  ### Por que isso é importante

  - Um layout acessível reduz esforço cognitivo.
  - Ícones sem rótulo são ruins para leitor de tela; por isso os rótulos existem.
  - Alvos menores que o necessário aumentam erro de toque.
  - Muitos cliques prejudicam quem navega por teclado, leitor de tela ou mouse com precisão reduzida.

  ### Limitações de acessibilidade ainda existentes

  - O painel de acessibilidade do auth ainda é visual.
  - Busca, categorias e alguns botões não executam ações reais.
  - O projeto ainda não tem navegação por atalhos ou filtros semânticos de catálogo.

  ## Firebase e segurança

  ### Configuração atual

  O Firebase está inicializado em `src/firebase/firebase.ts` com:

  - Authentication;
  - Firestore;
  - Realtime Database;
  - Storage.

  ### Modelo de dados atual

  #### Authentication

  - login e cadastro por e-mail e senha;
  - `displayName` atualizado no cadastro;
  - redirecionamento automático quando o usuário já está autenticado.

  #### Firestore

  - coleção `users/{uid}`;
  - dados salvos no cadastro:
    - `fullName`
    - `email`
    - `disabilityType`
    - `preferredActivity`
    - `accountType`
    - `createdAt`
    - `updatedAt`

  #### Storage

  - regras já preparadas para `users/{uid}` e `public/`.

  #### Realtime Database

  - regras já preparadas para `users/{uid}`.
  - ainda não há escrita de dados de negócio nessa base.

  ### Regras de segurança

  As regras estão versionadas dentro do repositório, mas precisam ser publicadas no console do Firebase.

  #### Firestore

  - o documento do usuário só pode ser lido/escrito pelo próprio usuário autenticado.
  - qualquer outra coleção fica bloqueada por padrão.

  #### Storage

  - cada usuário só acessa a sua própria pasta.
  - `public/` pode ser lido publicamente e escrito apenas por usuário autenticado.

  #### Realtime Database

  - nós em `users/{uid}` são privados ao próprio dono da conta.

  ### Observação importante

  Os botões de login social ainda não estão ligados aos provedores do Firebase Auth. Eles existem no layout, mas não fazem autenticação real ainda.

  ## Como executar localmente

  ### Pré-requisitos

  - Node.js 20 ou superior.
  - npm instalado.

  ### Comandos

  ```bash
  npm install
  npm run dev
  ```

  ### Outros comandos úteis

  ```bash
  npm run build
  npm run lint
  ```

  ## Observações importantes do repositório

  - O ponto de entrada real do app é `src/index.tsx`.
  - `src/main.tsx` e `src/styles.css` estão no repositório como arquivos legados e podem ser ignorados na manutenção atual.
  - O app foi desenhado com bastante valor de pixel fixo porque a base visual segue um mockup de marketplace já definido.
  - O bundle do Firebase é maior do que o resto da aplicação; isso é esperado nesta fase.

  ## O que ainda está pendente

  - Busca real de produtos.
  - Catálogo alimentado por dados dinâmicos.
  - Botões sociais de login funcional.
  - Controles do painel de acessibilidade com efeito real.
  - Filtros de categorias.
  - Persistência real do carrinho e do checkout.
  - Substituir os dados estáticos da home, produto e carrinho por dados reais.

  ## Guia rápido para apresentação na reunião

  Se a pergunta for “por que o site está assim?”, a resposta curta é:

  1. A navegação principal está curta para reduzir esforço.
  2. O visual usa contraste, hierarquia clara e elementos semânticos para acessibilidade.
  3. Firebase já cobre autenticação e perfil do usuário.
  4. O que ainda falta é transformar o conteúdo estático em catálogo e fluxos realmente dinâmicos.

  Se a pergunta for “por que esses tamanhos e essa estrutura?”, a resposta curta é:

  1. Porque o layout precisa caber, ser lido rápido e não quebrar os botões.
  2. Porque a primeira dobra deve concentrar as ações mais importantes.
  3. Porque um fluxo com 1 a 2 cliques é mais acessível do que um fluxo longo.

  ---

  Se quiser, o próximo passo natural é documentar também o plano de evolução do backend, incluindo catálogo, busca, carrinho persistente e fluxos reais de checkout.
  