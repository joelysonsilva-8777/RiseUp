# Tela Produto — Acess E+

Componente React da página de produto desenvolvido para o projeto da faculdade.

## Arquivos

| Arquivo | Descrição |
|---|---|
| `ProdutoPage.jsx` | Componente principal da tela |
| `ProdutoPage.css` | Estilos do componente |
| `App.jsx` | Exemplo de integração |

## Como rodar localmente

```bash
# 1. Certifique-se de ter um projeto React criado (Vite recomendado)
npm create vite@latest meu-projeto -- --template react
cd meu-projeto

# 2. Copie os arquivos ProdutoPage.jsx e ProdutoPage.css para src/

# 3. Instale as dependências e rode
npm install
npm run dev
```

## Como integrar com as outras telas

O componente aceita três **props** para se conectar ao resto do projeto:

### `cartCount` (number)
Quantidade de itens no carrinho. Vem do estado global do projeto.

```jsx
<ProdutoPage cartCount={cartCount} />
```

### `onAddToCart` (function)
Chamada quando o usuário clica em "Adicionar ao Carrinho".
Recebe a **quantidade** selecionada como argumento.

```jsx
const handleAddToCart = (qty) => {
  // atualizar estado global do carrinho
  dispatch({ type: "ADD_ITEM", payload: { product, qty } });
};
<ProdutoPage onAddToCart={handleAddToCart} />
```

### `onNavigate` (function)
Chamada quando qualquer botão de navegação é clicado.
Recebe o **destino** como string.

```jsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

const handleNavigate = (destination) => {
  navigate(`/${destination}`);
};

<ProdutoPage onNavigate={handleNavigate} />
```

#### Destinos possíveis

| String recebida | Descrição |
|---|---|
| `"cart"` | Página do carrinho |
| `"profile"` | Perfil do usuário |
| `"notifications"` | Notificações |
| `"departamentos"` | Departamentos |
| `"endereco"` | Endereço de entrega |
| `"cupons"` | Meus cupons |
| `"ofertas"` | Ofertas exclusivas |
| `"avaliacoes"` | Avaliações do produto |
| `"mais-informacoes"` | Mais informações do produto |
| `"buscar-cep"` | Busca de CEP |
| `"whatsapp"` | WhatsApp da loja |

## Funcionalidades implementadas

- [x] Galeria de imagens com miniaturas clicáveis
- [x] Seletor de quantidade com atualização de preço e parcelas
- [x] Botão "Adicionar ao Carrinho" com feedback visual
- [x] Badge no ícone do carrinho com animação
- [x] Toast de confirmação
- [x] Cálculo de frete com validação de CEP
- [x] Todos os botões de navegação prontos para receber rotas
- [x] Layout responsivo (mobile/desktop)

## CEPs de teste

| CEP | Cidade |
|---|---|
| 01001-000 | São Paulo - SP |
| 20040-020 | Rio de Janeiro - RJ |
| 30112-010 | Belo Horizonte - MG |
| 40010-010 | Salvador - BA |
| 50010-230 | Recife - PE |
| 60010-000 | Fortaleza - CE |
| 70002-900 | Brasília - DF |
| 80010-010 | Curitiba - PR |
| 90010-280 | Porto Alegre - RS |

> 
