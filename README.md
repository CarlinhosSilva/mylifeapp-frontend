# MyLifeApp Frontend

Interface web do MyLifeApp, desenvolvida com Vue 3, TypeScript, Vite, Pinia e PrimeVue. O frontend oferece autenticação, controle de contas, receitas e acompanhamento financeiro individual e familiar.

## Requisitos

- Node.js 18 ou superior
- Backend em execução na porta `3000`

## Instalação e execução

Na pasta `front/`:

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`. Durante o desenvolvimento, as requisições `/api` são encaminhadas para `http://localhost:3000` pelo proxy do Vite.

Para validar uma build de produção:

```bash
npm run build
npm run preview
```

## Funcionalidades

- Cadastro, login e atualização de perfil.
- Menu lateral com visão geral, contas a pagar, receitas, usuários e finanças da família.
- Cadastro, edição, exclusão e filtro de contas por vencimento e status.
- Registro de pagamento com data e forma `PIX`, `DINHEIRO` ou `CARTAO`.
- Validação de saldo antes do pagamento.
- Cadastro de receitas com descrição, valor e data de entrada.
- Saldo individual no header.
- Gráfico mensal de entradas, contas pagas e contas pendentes por vencimento.
- Lista de próximos vencimentos e indicação de contas em dia.
- Visão Família com movimentações de todos os usuários, saldo agregado e status geral.
- Visão Usuários com filtro de usuário e mês, usando o mesmo painel financeiro da família.
- Badges no header indicando se o usuário e a família possuem meses pendentes para revisão.
- Módulo de compras com OCR para sugerir fornecedor, data e valor e opção de anexar a imagem da nota.

## Módulo de compras

O módulo de compras foi implementado como parte do fluxo financeiro, sem criar controle de estoque real. A imagem pode sugerir fornecedor, data e valor via OCR; os campos são editáveis e a imagem é opcional para consulta posterior.

### Como funciona

1. O usuário acessa a aba de compras no painel principal.
2. Opcionalmente, envia uma imagem para sugerir fornecedor, data e valor por OCR.
3. Confere e ajusta manualmente fornecedor, data e valor total.
4. Salva a compra; imagens JPG, PNG ou WEBP de até 8 MB são aceitas quando anexadas.
5. O histórico permite visualizar a imagem salva da nota, quando houver.

### Observações importantes

- O OCR usa Tesseract.js no navegador e um parser heurístico. Pode falhar ou sugerir dados incorretos; confira fornecedor, data e valor antes de salvar. Os campos também podem ser preenchidos manualmente.
- Para dados fiscais eletrônicos, o XML da NF-e/NFC-e é preferível quando o usuário consegue obtê-lo: os campos são estruturados, ao contrário do OCR de uma foto. A importação de XML ainda não está implementada.
- Como alternativa para fotos, serviços como [Azure Document Intelligence (modelo de recibos)](https://learn.microsoft.com/azure/ai-services/document-intelligence/prebuilt/receipt) oferecem extração estruturada. Antes de integrar qualquer serviço, teste notas brasileiras reais e avalie custos, suporte ao formato/localidade e privacidade: a imagem da compra será enviada ao provedor.
- A imagem é armazenada no PostgreSQL e servida por uma rota autenticada que verifica o usuário dono da compra.
- O módulo foi desenhado para controle financeiro, não para inventário; ele não acompanha estoque real nem movimentação de produtos.
- O valor total da compra entra no fluxo mensal do usuário e da família como saída financeira.

### Teste manual recomendado

1. Inicie o backend e o frontend.
2. Faça login no sistema.
3. Acesse a aba de compras.
4. Opcionalmente, anexe uma imagem de nota fiscal e confira os dados sugeridos.
5. Preencha ou corrija fornecedor, data e valor total.
6. Salve a compra.
7. Verifique:
   - o total do mês
   - a lista por fornecedor
   - a compra no histórico e o botão para visualizar a nota salva

## Formatos de dados

As datas são enviadas para a API no formato `YYYY-MM-DD` e exibidas na interface no formato brasileiro `dd/mm/aaaa`. Os valores monetários usam o padrão `pt-BR` e `BRL`.

## Estrutura principal

- `src/views/`: páginas de login, cadastro e painel principal.
- `src/components/`: modais, tabelas, gráficos e painéis financeiros.
- `src/services/`: chamadas HTTP para a API.
- `src/composables/`: funções reutilizáveis, como formatação de datas.
- `src/types/`: contratos TypeScript da aplicação.
- `src/router/`: configuração das rotas do Vue Router.
- `src/stores/`: estado de autenticação com Pinia.

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: executa a verificação TypeScript e gera a build.
- `npm run preview`: serve a build localmente.
- `npm test`: executa os testes com Vitest.

## Backend

O backend correspondente está na pasta `back/`. Consulte [`back/README.md`](../back/README.md) para configuração do PostgreSQL, variáveis de ambiente e documentação dos endpoints.
