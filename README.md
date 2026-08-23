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
