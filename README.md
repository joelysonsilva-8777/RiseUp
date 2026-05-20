# Acesse+

Marketplace acessível construído com React, TypeScript, Tailwind CSS, Firebase e integrações diretas com a API da OpenAI.

Este README funciona como documento de reunião e referência técnica do estado atual do projeto. Ele descreve o que já está funcionando, como a aplicação foi organizada, quais decisões de interface foram tomadas, quais integrações de IA existem e o que ainda precisa evoluir.

## Resumo Executivo

O Acesse+ é uma aplicação de marketplace com foco em acessibilidade, autonomia e tecnologia assistiva. A experiência cobre descoberta de produtos, busca, cadastro, login, carrinho, checkout, perfil, criação de anúncios, conversa com vendedores, avaliações, loja do vendedor e assistente de IA contextual.

A base visual segue uma identidade verde, clara e utilitária, com navegação curta e prioridade para ações de compra, venda e suporte. A aplicação já usa Firebase para autenticação, persistência, storage e regras de segurança, além de rotas serverless em `api/` para comunicação com modelos da OpenAI.

## Estado Atual do Projeto

- Home com hero em carrossel, imagens desktop/mobile separadas, setas no desktop, bolinhas de navegação, pausa ao passar o mouse e faixa de anúncios deslizante no header.
- Navbar responsivo com busca, carrinho, menu mobile, dropdown de perfil e menu autenticado com opções de compra, histórico, perguntas, opiniões, Acesse+ Infinity, conversa com vendedor, vender/criar produto e logout.
- Login com Firebase Auth por e-mail/senha e recuperação de senha por e-mail.
- Cadastro com Firebase Auth, gravação em `users/{uid}` e criação/merge de `sellerProfiles/{uid}`.
- Painel de acessibilidade em login/cadastro com switches funcionais, controle de fonte `+/-` e modo claro parcial.
- Perfil redesenhado com navegação lateral, cards de conta, edição de dados, upload de foto, propagação de dados do vendedor para produtos e telas WIP para funções ainda não implementadas.
- Catálogo de produtos vindo do Firestore, com fallback para dados locais em `src/data/products.ts`.
- Busca real em `/buscar`, filtrando produtos por nome, categoria, descrição, localização, termo de busca, grupo, tags e atributos.
- Produto com galeria, dados do vendedor, seguir, compartilhar, comentários, avaliações, produtos similares e opção de conversar com vendedor.
- Carrinho persistente: usa `localStorage` para visitante e `users/{uid}/private/cart` no Firestore para usuário logado.
- Checkout com etapas de carrinho, endereço, entrega e compra; ao finalizar, grava pedidos em `users/{uid}/orders` e marca compras em `productPurchases`.
- Tela de criar produto protegida por login, com cadastro por palavras-chave, fotos, atributos, tags, preço, estoque e upload para Storage.
- Identificação de produto por foto usando `/api/product-identify` e OpenAI Vision para preencher título, descrição, atributos, tags, condição, SKU e preço estimado.
- Chat entre comprador e vendedor em `/mensagens`, protegido por login, com threads em `messageThreads`, anexos de imagem, produto, pedido, compra pelo chat e avaliação de atendimento.
- Notificações de novas mensagens no header e via Notification API do navegador quando permitido.
- Loja do vendedor em `/loja/:sellerId`, com capa editável, categorias, sobre a loja, ordenação de produtos, seguidores, seguir e compartilhar.
- Assistente flutuante Acesse+ em `AssistantWidget`, usando `/api/assistant`, com respostas limitadas ao contexto do site e produtos.
- Footer com verde alinhado ao navbar/searchbar.
- Responsividade mobile revisada nas telas públicas principais, com ajustes em hero, navbar, login, cadastro, produto, carrinho, compra e busca.

## Tecnologias e Bibliotecas

| Tecnologia | Uso no projeto | Observação |
| --- | --- | --- |
| React 19 | Interface principal | Componentização das telas e estados locais |
| TypeScript 5 | Tipagem | Tipos para rotas, produtos, carrinho, perfil e dados do Firebase |
| React Router DOM 7 | Roteamento | Rotas públicas, rotas protegidas e parâmetros como `produto/:productId` |
| Firebase 12 | Auth, Firestore, Storage, Realtime Database | Base de autenticação, catálogo, carrinho, pedidos, mensagens e arquivos |
| Tailwind CSS 4 | Estilo | Classes utilitárias com layout responsivo |
| Vite 6 | Build e dev server | Ambiente local e build de produção |
| React Icons | Ícones | Navbar, dropdown, chat, perfil e controles |
| OpenAI Chat Completions API | IA de texto e visão | Assistente contextual e identificação de produto por foto |

## Estrutura do Projeto

```text
api/
  assistant.js
  assistant-core.cjs
  product-identify.js
  product-identify-core.cjs

public/
  ArchiveSlide(1).png ... ArchiveSlide(5).png
  ArchiveSlideMobile(1).png ... ArchiveSlideMobile(5).png
  image-132@2x.png
  image-132@2xMobile.png
  ...

src/
  App.tsx
  index.tsx
  global.css
  context/
    AuthContext.tsx
    CartContext.tsx
  data/
    products.ts
  hooks/
    useProducts.ts
  components/
    AppHeader.tsx
    AssistantWidget.tsx
    AuthLayout.tsx
    inicial/
      HeroSection.tsx
      OffersSection.tsx
      ProductsSection.tsx
      FooterSection.tsx
      ...
  firebase/
    firebase.ts
    firestore.rules
    storage.rules
    database.rules
  pages/
    Inicial/
    TelaLogin/
    TelaCadastro/
    TelaProduto/
    TelaCarrinho/
    TelaCompra/
    TelaBusca/
    TelaPerfil/
    TelaMensagens/
    CadastrarProduto/
    LojaVendedor/
```

## Rotas

| Rota | Tela | Estado |
| --- | --- | --- |
| `/` | Home | Pública |
| `/login` | Login | Pública |
| `/cadastro` | Cadastro | Pública |
| `/registro` | Alias de cadastro | Pública |
| `/buscar` | Busca/catálogo | Pública |
| `/produto` | Produto padrão/fallback | Pública |
| `/produto/:productId` | Detalhe de produto real | Pública |
| `/loja/:sellerId` | Loja do vendedor | Pública |
| `/perfil` | Perfil do usuário | Requer login pela própria tela |
| `/produtos/novo` | Criar produto | Protegida por `ProtectedRoute` |
| `/carrinho` | Carrinho | Pública |
| `/carrinho/endereco` | Etapa de endereço | Pública |
| `/carrinho/entrega` | Etapa de entrega | Pública |
| `/compra` | Pagamento/finalização | Pública, mas grava pedido completo quando há login |
| `/mensagens` | Chat | Protegida por `ProtectedRoute` |
| `/mensagens/:threadId` | Chat específico | Protegida por `ProtectedRoute` |

## Fluxo de Dados

### Autenticação

`AuthContext` observa `onAuthStateChanged`, carrega `users/{uid}` e expõe `user`, `profile`, `displayName`, `firstName`, `photoURL`, `loading` e `logout`.

O login usa e-mail e senha. O cadastro cria a conta no Firebase Auth, atualiza `displayName`, grava dados em `users/{uid}` e cria/atualiza `sellerProfiles/{uid}` para preparar a jornada de vendedor.

### Produtos

`useProducts` lê a coleção `products` no Firestore. Se não houver dados válidos, a aplicação usa os produtos padrão em `src/data/products.ts`.

Produtos cadastrados salvam:

- dados básicos: nome, descrição, categoria, grupo, preço, estoque, condição;
- busca: `searchTerm`, tags e atributos;
- vendedor: `sellerId`, `sellerName`, `sellerPhotoURL`, cidade e estado;
- imagens: primeira imagem e galeria;
- metadados como SKU e código de catálogo.

### Carrinho

`CartContext` usa `localStorage` para visitantes e Firestore para usuários logados. O carrinho autenticado fica em `users/{uid}/private/cart`.

### Compra

A tela de compra grava pedidos em `users/{uid}/orders` e marca itens comprados em `productPurchases/{uid_productId}`. Essa marca é usada para permitir avaliações de produto apenas após compra.

### Mensagens

O chat usa `messageThreads/{threadId}` e subcoleção `messageThreads/{threadId}/messages`. As threads guardam participantes, produto relacionado, último remetente, último texto e dados de leitura.

O chat permite:

- texto;
- imagem da galeria;
- câmera;
- anexar produto do vendedor;
- anexar pedido;
- comprar agora pelo chat;
- avaliar atendimento do vendedor.

### Loja do Vendedor

Os dados da loja ficam em `sellerProfiles/{sellerId}`. A loja pode guardar capa, título, descrição, categorias e ordem dos produtos. Seguidores ficam em `sellerProfiles/{sellerId}/followers`.

A opção de loja aparece no menu do perfil quando o usuário já possui pelo menos um produto cadastrado.

## Como Cada Tela Funciona

### Home

A home é a vitrine principal. Ela possui hero em carrossel, cards de atalho, oferta do dia, seções de produtos, bloco promocional, categorias, comunidade social e footer.

O hero usa imagens separadas para desktop e mobile:

- desktop: `image-132@2x.png` e `ArchiveSlide(1).png` a `ArchiveSlide(5).png`;
- mobile: `image-132@2xMobile.png` e `ArchiveSlideMobile(1).png` a `ArchiveSlideMobile(5).png`.

No desktop, o hero tem altura maior para não ficar escondido pelo navbar fixo. No mobile, a faixa de anúncios foi mantida compacta abaixo da busca, evitando o retângulo preto entre navbar e slide.

### Login e Cadastro

As telas usam `AuthLayout`, que combina área de acessibilidade e formulário. No desktop, a área de acessibilidade fica à esquerda; no mobile, ela aparece como card compacto acima do formulário.

Funcionalidades atuais:

- login por e-mail/senha;
- cadastro por e-mail/senha;
- recuperação de senha por Firebase;
- seleção de tipo de conta: empresa ou usuário;
- switches visuais e funcionais;
- controle de fonte;
- modo claro parcial.

Os botões de Google e iCloud ainda são visuais. Eles não acionam provedores federados.

### Perfil

A tela de perfil foi reorganizada para ficar mais próxima de um painel de conta. Ela exibe dados do usuário, atalhos de compras/vendas/configurações, pedidos, dados pessoais, cartões conceituais e área de loja.

Quando uma funcionalidade ainda não existe de verdade, a tela direciona para um estado WIP animado, em vez de parecer quebrada.

### Produto

A tela de produto mostra galeria, preço, quantidade, tags, dados do vendedor, botões de compra/carrinho, comentários, avaliações e similares.

O usuário logado pode:

- comentar;
- apagar o próprio comentário;
- avaliar produto comprado;
- seguir vendedor;
- iniciar conversa;
- acessar a loja do vendedor pelo perfil exibido no produto.

### Criar Produto

A tela `/produtos/novo` exige login. O vendedor pode iniciar por palavras-chave ou por foto.

No fluxo por foto, a imagem é enviada para `/api/product-identify`, que usa OpenAI Vision para sugerir os campos do formulário. O vendedor revisa tudo antes de publicar.

### Mensagens

A tela `/mensagens` exige login. Ela organiza conversas por vendedor/produto e mantém leitura, anexos e compra contextual.

O botão `+` no campo de mensagem abre opções:

- galeria;
- câmera;
- produtos;
- pedidos;
- comprar agora.

Comprar pelo botão do chat envia contexto na conversa. Comprar direto pelo carrinho não envia mensagem automática ao vendedor.

### Loja do Vendedor

A loja mostra capa, perfil, seguidores, categorias, produtos e área "sobre". O próprio vendedor pode editar capa, título, categorias, ordem dos produtos e descrição.

Visitantes podem seguir e compartilhar a loja.

## Design System e Responsividade

### Paleta

- Verde principal: `#167307`, `#1b7d0c`, `#257a0d`.
- Superfícies verdes: `#ecf8e8`, `#edfdec`, `#f5fbf3`.
- Neutros: `#f3f3f3`, `#f5f5f5`, `#e8e8e8`.
- Texto principal: `#071735`, `#111`, `#333`.
- Alertas: `#b42318`, `#ffb020`.

### Decisões Recentes de UI

- O navbar mobile ficou mais simples, com menu, busca e carrinho sempre visíveis.
- O carrossel de anúncios voltou no mobile, mas em versão compacta para não ocupar a primeira dobra.
- O hero mobile usa imagens próprias e `object-cover` para preencher melhor o espaço.
- O hero desktop ganhou altura maior para o navbar fixo não esconder a imagem principal.
- O footer foi aproximado do verde do navbar/searchbar.
- Cards não ficam aninhados em outros cards nas novas telas principais.
- Botões importantes têm altura confortável para toque.

## Acessibilidade

Decisões já presentes:

- uso de `header`, `nav`, `main`, `section`, `article`, `aside` e `footer`;
- labels visíveis ou `sr-only`;
- botões com `type` explícito;
- `aria-label` em botões de ícone;
- `aria-pressed` nos switches de acessibilidade;
- `alt` em imagens informativas;
- `focus-visible` no CSS global;
- contraste alto em CTAs e áreas críticas;
- telas protegidas redirecionam para login sem deixar ações quebradas.

Limitações atuais:

- Libras, leitor de tela e tradução automática ainda são estados visuais, não integrações reais.
- Google/iCloud ainda não fazem autenticação real.
- Algumas funções de conta ainda estão em WIP.
- Ainda não há testes automatizados de acessibilidade.

## Firebase e Segurança

### Coleções principais

- `users/{uid}`: perfil do usuário.
- `users/{uid}/private/cart`: carrinho do usuário.
- `users/{uid}/orders`: pedidos.
- `products/{productId}`: anúncios.
- `products/{productId}/comments`: comentários.
- `products/{productId}/reviews`: avaliações de produto.
- `productPurchases/{uid_productId}`: marca de compra para liberar avaliação.
- `sellerProfiles/{sellerId}`: loja/vendedor.
- `sellerProfiles/{sellerId}/followers`: seguidores.
- `sellerProfiles/{sellerId}/serviceReviews`: avaliações de atendimento.
- `messageThreads/{threadId}`: conversas.
- `messageThreads/{threadId}/messages`: mensagens.

### Storage

Regras preparadas para:

- fotos de perfil;
- fotos de produto;
- capas de loja;
- imagens de avaliação;
- imagens de mensagem.

### Regras

As regras ficam versionadas em:

- `src/firebase/firestore.rules`;
- `src/firebase/storage.rules`;
- `src/firebase/database.rules`.

Elas precisam ser publicadas no Firebase para valerem em produção.

## Integrações de IA

O projeto usa a API direta da OpenAI por rotas serverless em `api/`. Não há LangChain, Anthropic, modelos locais ou agentes externos.

### Assistente de Site

Arquivos:

- `src/components/AssistantWidget.tsx`;
- `api/assistant.js`;
- `api/assistant-core.cjs`.

Endpoint:

```text
POST /api/assistant
```

Modelo padrão:

```text
OPENAI_MODEL || gpt-5.4-mini
```

O assistente recebe:

- mensagem atual;
- histórico recente;
- rota atual;
- contexto dos produtos visíveis.

Antes de chamar a OpenAI, o backend faz triagem local por termos permitidos. Perguntas gerais ou fora do escopo recebem uma resposta fixa, sem gastar chamada de modelo.

### Identificação de Produto por Foto

Arquivos:

- `src/pages/CadastrarProduto/index.tsx`;
- `api/product-identify.js`;
- `api/product-identify-core.cjs`.

Endpoint:

```text
POST /api/product-identify
```

Modelo padrão:

```text
OPENAI_VISION_MODEL || gpt-4.1-mini
```

A rota recebe uma imagem em Data URL, palavras-chave extras e grupo de anúncio. A resposta usa `response_format: json_schema` para devolver dados estruturados como título, descrição, tags, atributos, preço estimado, estoque, SKU e confiança.

### Variáveis de Ambiente

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.4-mini
OPENAI_VISION_MODEL=gpt-4.1-mini
```

Importante: a chave da OpenAI deve ficar somente no servidor. Ela não deve ser colocada no frontend, no README, em commits ou em arquivos públicos.

## Engenharia de Prompt

### Prompts que ajudaram em erros difíceis

1. Prompt de diagnóstico de responsividade:

```text
Analise a home como um usuário mobile e desktop. Compare o comportamento do header fixo, hero, cards de atalho e carrossel. Corrija apenas o que quebra a experiência mobile, preservando o desktop, e valide com screenshots em 390px e 1440px.
```

Classificação: prompt de auditoria visual e validação responsiva.  
Uso: ajudou a isolar o problema do hero mobile, da faixa de anúncios e do navbar cobrindo o slide.

2. Prompt de triagem e escopo do assistente:

```text
Crie um assistente para responder somente dúvidas sobre Acesse+, produtos, compra, venda, entrega, carrinho, perfil e chat. Se o usuário fizer pergunta geral, responda com uma negativa curta e redirecione para ações do site. Use contexto dos produtos e nunca invente estoque, prazo, garantia ou política.
```

Classificação: prompt de sistema para assistente restrito por domínio.  
Uso: ajudou a evitar que a IA respondesse perguntas gerais fora do site.

### Prompts que não deram muito certo

1. Prompt genérico demais:

```text
Deixe o site responsivo em todas as telas sem alterar nada do desktop.
```

Problema: amplo demais; não dizia quais telas validar, quais quebras priorizar nem o que significava "não alterar desktop".

2. Prompt amplo demais para IA:

```text
Faça a IA responder tudo que o usuário perguntar e preencher qualquer produto por foto.
```

Problema: abria escopo perigoso. A primeira parte deixava o assistente responder perguntas gerais; a segunda incentivava inventar dados de produto sem evidência visual.

## Como Executar Localmente

### Pré-requisitos

- Node.js 20 ou superior.
- npm instalado.
- Projeto Firebase configurado.
- Variáveis de ambiente da OpenAI no servidor quando usar IA.

### Comandos

```bash
npm install
npm run dev
```

### Validação

```bash
npm run lint
npm run build
```

O build pode avisar que alguns chunks passam de 500 kB. Isso é esperado nesta fase por causa do Firebase e do tamanho atual da aplicação.

## O Que Ainda Está Pendente

- Login social real com Google e iCloud.
- Integrações reais para Libras, leitor de tela e tradução automática.
- Painel administrativo para moderação de produtos, usuários, mensagens e avaliações.
- Pagamento real com Pix/cartão/gateway.
- Cálculo real de frete.
- Estoque transacional com baixa após compra.
- Testes automatizados de unidade, integração, acessibilidade e E2E.
- Observabilidade: logs estruturados, alertas e métricas.
- SEO completo com títulos, descrições e páginas indexáveis.
- Política de privacidade, termos de uso e revisão jurídica.
- Moderação de imagens e textos enviados por usuários.
- Deploy e variáveis de ambiente documentadas por ambiente.

## Levantamento de Custo de Manutenção

Esta é uma estimativa preliminar para manutenção de um marketplace React/Firebase com IA, chat, catálogo, seller store e fluxo de compra. Não é orçamento fechado.

Referências de mercado consultadas em 20/05/2026:

- GeraContratos: desenvolvedor frontend pleno entre R$ 80-150/h, backend pleno entre R$ 100-180/h e full stack pleno entre R$ 120-200/h.
- Freelancer Online: desenvolvimento web/mobile pleno entre R$ 100-180/h e retainer mensal pleno entre R$ 4.000-8.000.
- Sengi: alerta que retainers e manutenção sofrem com scope creep, especialmente em apps web, e recomenda controlar horas, revisões e escopo.

### Cenários Mensais

| Plano | Escopo | Horas/mês | Faixa estimada |
| --- | --- | ---: | ---: |
| Essencial | Bugs, pequenos ajustes visuais, Firebase rules, deploy e suporte leve | 20-30h | R$ 3.000-5.400 |
| Recomendado | Essencial + melhorias contínuas, telas novas pequenas, revisão mobile, ajustes de IA e chat | 40-60h | R$ 6.000-10.800 |
| Completo | Evolução ativa do marketplace, pagamentos, frete, moderação, testes, monitoramento e melhorias de IA | 80-120h | R$ 12.000-24.000 |

### Custos Operacionais Separados

- Firebase: pode começar baixo, mas cresce com Storage, Firestore reads/writes e tráfego.
- OpenAI: variável por volume de chat, análise de imagens e modelo usado.
- Domínio, hospedagem, e-mail transacional e monitoramento: estimar de R$ 100 a R$ 800/mês no início.
- Suporte humano, atendimento ao cliente, jurídico, contabilidade, mídia paga e produção de conteúdo não estão incluídos.

Para manter o site completo em ritmo saudável, o cenário recomendado é um retainer de R$ 6.000 a R$ 10.800/mês. Para transformar o Acesse+ em operação real de marketplace, com pagamento, frete, moderação e SLA, o cenário completo é mais realista.

## 1.2 Documentação de Integrações de IA e Engenharia de Prompt

### APIs Utilizadas

- OpenAI Chat Completions API para assistente textual do site.
- OpenAI Chat Completions API com entrada de imagem para identificação de produto por foto.
- Nenhuma API da Anthropic foi utilizada.
- Nenhum framework de orquestração como LangChain foi utilizado.
- Nenhum modelo local foi utilizado.

### Modelos

- Assistente textual: `OPENAI_MODEL`, com fallback para `gpt-5.4-mini`.
- Identificação por imagem: `OPENAI_VISION_MODEL`, com fallback para `gpt-4.1-mini`.

### Tipos de Prompt

- Prompt de sistema: define papel, tom, escopo permitido, bloqueios e limite de resposta do assistente.
- Template de contexto: monta página atual, histórico recente, contexto do site e produtos antes de chamar o modelo.
- Prompt de triagem: parte do fluxo local que decide se a pergunta é sobre o Acesse+ antes de chamar a API.
- Template de geração estruturada: usado na identificação por foto para preencher um formulário de produto.
- Schema de validação: `json_schema` força o retorno do modelo para campos previsíveis.

### Regras de Segurança de Prompt

- Não responder conhecimento geral fora do marketplace.
- Não inventar preço, estoque, garantia, política, prazo ou dados clínicos.
- Não pedir dados sensíveis.
- Responder em português do Brasil.
- Limitar respostas do assistente a frases curtas.
- Usar variáveis de ambiente para chaves de API.
- Validar imagem, tamanho e tipo antes de chamar a API de visão.

## Guia Rápido Para Apresentação

Se perguntarem "o que já funciona?", a resposta curta é:

1. Autenticação, perfil, carrinho, busca, catálogo, produto, checkout, mensagens, loja do vendedor e criação de produto já possuem fluxo funcional.
2. A IA já atua em dois pontos: assistente contextual e preenchimento de produto por foto.
3. O Firebase já sustenta dados, storage e regras de segurança.
4. A responsividade mobile foi revisada nas telas principais.

Se perguntarem "o que falta para produção?", a resposta curta é:

1. Pagamento real, frete real, moderação, testes, observabilidade, termos jurídicos e login social.
2. Publicar e validar regras do Firebase em ambiente real.
3. Definir orçamento mensal de manutenção e escopo de suporte.
