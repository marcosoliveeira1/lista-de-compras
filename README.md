# App de Lista de Compras (Offline-First)

Aplicativo moderno de lista de compras feito com React, focado em alta performance, uso offline e sincronização em segundo plano. Desenhado primariamente para uso mobile como PWA (Progressive Web App).

## ✨ Principais Funcionalidades

- **Offline-First:** Funciona perfeitamente sem internet graças ao `IndexedDB` e `@tanstack/react-query-persist-client`.
- **Atualizações Otimistas:** Ao adicionar, deletar ou concluir um item, a interface reage instantaneamente (zero delay), sincronizando com a API em segundo plano.
- **Sessões Locais para Itens Concluídos:** Quando um item é marcado como "comprado", ele sai da lista do backend e é persistido localmente no aparelho, permitindo desfazer a ação (Undo) e mantendo a base de dados do servidor limpa e leve.
- **Autenticação Segura:** Autenticação baseada em token, resgatado via link mágico (ex: `?key=TOKEN`) e enviado via header `x-api-token`.
- **UI/UX Moderna:** Construído com TailwindCSS v4, Skeletons responsivos, Radix UI e lucide-react.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (versão 20+)
- PNPM (ou NPM/Yarn)

### Instalação

1. Clone o repositório e instale as dependências:
   ```bash
   pnpm install
   ```

2. Crie um arquivo `.env` na raiz do projeto contendo a URL do seu backend (Webhook do n8n):
   ```env
   VITE_API_URL=https://n8n.seusite.com/webhook/compras-app
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

4. Para acessar a aplicação autenticada no modo de desenvolvimento, abra a URL local passando o token falso ou real:
   ```
   http://localhost:5173/?key=MEU_TOKEN_SECRETO
   ```

---

## ⚙️ Especificação do Backend (Integração n8n)

O backend deste aplicativo é gerenciado através de **Webhooks no n8n**. Para simplificar a infraestrutura de webhooks, o frontend utiliza uma arquitetura onde o roteamento das entidades é feito através de uma *Query String* chamada `path`.

### 1. Autenticação (Obrigatória em todos os endpoints)
O frontend envia automaticamente o token do usuário no cabeçalho (*Header*) de toda requisição.

- **Header:** `x-api-token: <TOKEN>`
- **Validação no n8n:** O primeiro nó do seu fluxo n8n deve validar se este header confere com o token esperado.
- **Resposta em caso de Falha:** O nó "Respond to Webhook" deve obrigatoriamente retornar o HTTP Status **401 (Unauthorized)** ou **403 (Forbidden)**. Isso aciona o gatilho no frontend que desconecta o usuário imediatamente.

### 2. Estrutura Base das Requisições
Ao invés de criar um webhook para cada URL (ex: `/shoplist` e `/shoplist/123`), todas as chamadas batem na mesma URL base (o `VITE_API_URL`), e informam a rota via query param:
`[METHOD] https://n8n.../webhook/compras-app?path=ROTA`

### 3. Modelo de Dados (Item)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "label": "Leite",
  "checked": false,
  "order": 0,
  "priority": 0,
  "createdAt": "2026-11-09T12:00:00.000Z",
  "maxValue": 499.9,
  "condition": "Só tipo forno (oven), 11L ou mais"
}
```

- `priority`: `1` prioritário, `0` neutro, `-1` pode esperar.
- `maxValue` e `condition` são opcionais e só usados na lista **Produtos**.
- `condition` é texto livre que restringe o item no alerta de promoções (coluna NocoDB `Condicao`). No `PUT`, `""`/`null` remove a condição e a chave ausente não altera nada.
- Na lista **Produtos**, tocar no item abre o editor: o `PUT` envia `label`, `maxValue` e `condition` juntos (`null` limpa o valor máximo/condição).

### 4. Endpoints Esperados

#### Listar Itens Pendentes
- **Método HTTP:** `GET`
- **Query Param:** `path=shoplist`
- **Comportamento Esperado:** Deve retornar um array JSON contento **apenas os itens não concluídos** (`checked: false`).
- **Retorno Esperado:**
  ```json[
    { "id": "uuid-1", "label": "Maçã", "checked": false },
    { "id": "uuid-2", "label": "Pão", "checked": false }
  ]
  ```

#### Adicionar Novo Item
- **Método HTTP:** `POST`
- **Query Param:** `path=shoplist`
- **Body:** JSON contendo a estrutura de um Item.
- **Comportamento Esperado:** Inserir o novo registro na base de dados (Notion, Google Sheets, Postgres, etc).
- **Retorno Esperado:** HTTP 200/201 (O JSON de retorno pode ser o próprio item inserido ou `{ "success": true }`).

#### Atualizar Item (Toggle Concluído/Desfazer)
- **Método HTTP:** `PUT`
- **Query Param:** `path=shoplist/:id` (Ex: `path=shoplist/123e4567`)
- **Body:** Objeto do item **completo** com o novo status.
  ```json
  { "id": "uuid", "label": "Maçã", "checked": true }
  ```
- **Comportamento Esperado:**
  - Se `checked` for `true`, pode ser arquivado ou deletado logicamente na sua base (pois a API de GET só deve listar os não concluídos). O app guardará o item concluído na memória do celular.
  - Se `checked` for `false`, o item foi "recuperado" da área de já comprados e precisa voltar a ser listado pelo backend. Atualize-o novamente na sua base de dados.

#### Deletar Item
- **Método HTTP:** `DELETE`
- **Query Param:** `path=shoplist/:id` (Ex: `path=shoplist/123e4567`)
- **Comportamento Esperado:** Exclusão definitiva do registro no backend.
- **Retorno Esperado:** HTTP 200 (`{ "success": true }`).

---

## 🛠 Tecnologias Utilizadas
- **React 19** com **TypeScript**
- **Vite** (Bundler e Dev Server)
- **Tailwind CSS v4** (Estilização Utilitária)
- **React Query + IDB-Keyval** (Gerenciamento de Cache e Estado Assíncrono Offline)
- **Axios** (Requisições HTTP)
- **Lucide React** (Ícones)
- **Sonner** (Toasts)
- **Radix UI** (Componentes de Acessibilidade primitivos)
- **Vite PWA** (Manifest e Service Workers)