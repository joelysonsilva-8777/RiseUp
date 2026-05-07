# Resumo da triagem do marketplace

A triagem do Acesse+ funciona como uma jornada guiada: a home apresenta, a busca encontra, a pagina de produto compara, o carrinho consolida e o checkout conclui. Em paralelo, existe um fluxo proprio para quem vende, que alimenta o catalogo e faz os produtos aparecerem na vitrine, na busca e na pagina individual.

## 1. Entrada da experiencia

- O app sobe por `src/index.tsx`, com `BrowserRouter`, `AuthProvider` e `CartProvider`.
- O `AppHeader` concentra busca, carrinho e estado de autenticacao.
- A home (`src/pages/Inicial/index.tsx`) e o ponto principal de descoberta: hero, atalhos, ofertas, blocos de produtos, chamada de cadastro ou area autenticada, categorias, comunidade e rodape.
- Os atalhos da home levam direto para ofertas, cupons, categorias, login e busca.

## 2. De onde vem o catalogo

- O hook `useProducts` escuta a collection `products` no Firestore.
- Se o Firebase ainda nao tiver itens, ou se a leitura falhar, o app usa `defaultProducts` como fallback.
- Os itens sao normalizados, filtrados para remover produtos invalidos e ordenados por data de criacao.
- Esse mesmo conjunto alimenta a home, a busca, a pagina de produto e os produtos semelhantes.

## 3. Como o usuario encontra produtos

- A busca do header navega para `/buscar?q=...`.
- A tela `TelaBusca` usa o parametro `q` e filtra por nome, categoria, descricao, cidade, estado, `searchTerm`, `listingGroup`, tags e atributos.
- Cada resultado pode abrir a pagina do produto ou ir direto para o carrinho.
- Quando o catalogo ainda esta vindo do fallback local, a tela informa isso para o usuario.
- Na home, a secao de ofertas e a secao de produtos funcionam como outra camada de triagem visual, guiando a navegacao para itens com melhor destaque.

## 4. O que acontece na pagina do produto

- `TelaProduto` carrega o item por `productId`.
- Se nao encontrar no Firebase, usa o produto padrao correspondente.
- A pagina mostra galeria, zoom da imagem, preco, quantidade, vendedor, tags, descricao, atributos, comentarios, avaliacoes e produtos semelhantes.
- Os produtos semelhantes sao calculados com base em tags, categoria e grupo de listagem.
- Comentarios, respostas e avaliacoes ficam no Firestore.
- So quem comprou o item consegue avaliar.
- O botao de mensagem cria uma conversa unica por comprador, vendedor e produto.
- O botao de carrinho adiciona o item ao fluxo de compra sem sair da pagina.

## 5. Carrinho e checkout

- O `CartContext` guarda o carrinho em `localStorage` para visitantes e em `users/{uid}/private/cart` para usuarios logados.
- A tela `TelaCarrinho` mostra subtotal, frete, quantidade, remocao de itens e avancos por etapa.
- O carrinho avanca para endereco e entrega usando a mesma tela, mudando apenas a etapa exibida.
- `TelaCompra` fecha a compra com Pix, Apple Pay, Google Pay, cartao e cupom.
- Pedidos de usuario logado sao salvos em `users/{uid}/orders`.
- Para visitante, o pedido fica salvo localmente.
- O checkout tambem grava `productPurchases`, que depois libera a avaliacao do produto.

## 6. Fluxo de vendedor

- `CadastrarProduto` e um wizard em tres passos: escolher o tipo de anuncio, procurar o item no catalogo e preencher os detalhes finais.
- O formulario cobre fotos, caracteristicas obrigatorias, tags, condicao, estoque, SKU, preco e localizacao.
- As fotos vao para o Storage em `products/{user.uid}/{productId}/...`.
- O anuncio e salvo no Firestore e o perfil do vendedor e atualizado em `sellerProfiles`.
- Depois de publicado, o produto volta para a propria pagina do produto e passa a aparecer na home e na busca.

## 7. Identidade, perfil e mensagens

- `TelaCadastro` cria o usuario no Firebase Auth, grava o perfil em `users/{uid}` e tambem cria `sellerProfiles/{uid}`.
- `TelaLogin` autentica por e-mail e senha; os botoes de iCloud e Google ainda sao visuais.
- `AuthContext` carrega o perfil do usuario para o header mostrar nome e foto.
- `TelaPerfil` atualiza os dados do usuario e a foto, o que influencia o que aparece no header e nas informacoes do vendedor.
- `TelaMensagens` organiza conversas por vendedor e produto, mantendo o contexto do anuncio aberto.

## 8. O que ainda e mais visual do que funcional

- Alguns links do rodape ainda sao placeholders.
- Os cards de categoria funcionam mais como navegacao visual do que como filtro dinamico.
- O painel de acessibilidade do login/cadastro ainda e decorativo.
- Os botoes de login com iCloud e Google ainda nao fazem login federado real.
- A triagem principal ja funciona, mas algumas areas da home continuam servindo mais como guia visual do que como filtro ativo.

## Em uma frase

Hoje a triagem do marketplace cobre descoberta, pesquisa, comparacao, conversa com vendedor, carrinho, checkout, cadastro de produtos e pos-venda, com Firebase sustentando os dados reais e fallback local garantindo que a experiencia nao fique vazia.
