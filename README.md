# FreteFortal 🚚

**FreteFortal** é um sistema moderno e intuitivo para consulta e gestão de taxas de entrega (frete) por bairros na cidade de **Fortaleza (CE)**. O objetivo principal deste projeto é automatizar o atendimento a clientes, eliminando a necessidade de responder manualmente sobre taxas de entrega e prazos no WhatsApp.

O projeto foi estruturado como um MVP (Minimum Viable Product) focado na simplicidade, velocidade e usabilidade, tanto para o lojista quanto para o cliente final.

---

## 🚀 Funcionalidades Principais

### 👤 Área Pública (Cliente)
* **Consulta por CEP:** O cliente insere seu CEP, o sistema busca os dados do endereço (via API ViaCEP) e exibe as informações de frete.
* **Consulta por Endereço:** O cliente pesquisa pelo nome da sua rua, e o sistema identifica automaticamente o bairro (via OpenStreetMap/Nominatim).
* **Feedback de Entrega:**
  * **Caso atenda:** Exibe o bairro, valor do frete, prazo estimado de entrega, pedido mínimo (se houver), regras de frete grátis e um botão direto para iniciar a conversa no WhatsApp com o carrinho.
  * **Caso não atenda:** Informa a indisponibilidade de entrega e apresenta a opção de retirada física na loja (se configurada).

### ⚙️ Área Administrativa (Lojista)
* **Configuração da Loja:** Gerenciamento dos dados públicos da loja (Nome, Logotipo, WhatsApp de contato, Horário de Funcionamento e Endereço físico).
* **Gestão de Bairros:**
  * **Visão em Lista:** Tabela com busca em tempo real de todos os bairros oficiais de Fortaleza.
  * **Visão em Mapa:** Um mapa interativo completo de Fortaleza dividido por bairros, coloridos conforme o status (Verde = Entrega Ativa, Vermelho = Entrega Inativa, Cinza = Bairro não configurado).
  * **Painel de Edição Rápida:** Ao clicar em um bairro (no mapa ou lista), abre-se uma barra lateral para configurar valor de entrega, prazo, pedido mínimo, limite para frete grátis e observações específicas.
  * **Edição em Massa:** Ferramenta para selecionar múltiplos bairros de uma vez e alterar suas regras de entrega simultaneamente.
* **Dashboard Simples:** Métricas rápidas sobre o total de bairros ativos, inativos, valor médio de frete cobrado e data de última atualização.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando um ecossistema moderno e robusto de JavaScript/TypeScript:

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router & React Server Components)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS
* **Banco de Dados & ORM:** [PostgreSQL](https://www.postgresql.org/) com [Prisma ORM](https://www.prisma.io/)
* **Mapas & Geocodificação:**
  * [Leaflet](https://leafletjs.org/) & [React Leaflet](https://react-leaflet.js.org/) (Renderização do mapa interativo no cliente)
  * [OpenStreetMap / Nominatim API](https://nominatim.org/) (Geocodificação de endereços em texto corrido)
  * [ViaCEP](https://viacep.com.br/) (Busca de endereços a partir do CEP brasileiro)
  * [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) (Para extração dos limites geográficos dos bairros)

---

## 📁 Estrutura de Pastas do Projeto

```text
├── prisma/
│   ├── schema.prisma       # Modelagem do banco de dados (Store, Neighborhood)
│   └── seed.ts             # Script de população inicial com os 124 bairros de Fortaleza
├── public/
│   ├── bairros-fortaleza.geojson # Malha geográfica de polígonos de Fortaleza
│   └── *.svg               # Ativos estáticos e ícones da aplicação
├── src/
│   ├── app/                # Rotas da aplicação (App Router)
│   │   ├── admin/          # Rotas restritas do administrador
│   │   ├── actions.ts      # Server Actions para busca de CEP/endereço no cliente
│   │   ├── layout.tsx      # Layout global da aplicação
│   │   └── page.tsx        # Página de consulta pública do cliente
│   ├── components/         # Componentes reutilizáveis do React
│   │   ├── LeafletMap.tsx  # Componente do mapa interativo (renderizado no cliente)
│   │   ├── NeighborhoodsConfigurator.tsx # Painel central de gestão (Mapa/Lista)
│   │   ├── NeighborhoodSidebar.tsx       # Barra lateral de edição do bairro
│   │   └── BulkEditModal.tsx             # Modal para edição de bairros em massa
│   ├── lib/
│   │   └── prisma.ts       # Inicialização e cache do cliente do Prisma
│   └── scripts/
│       ├── fetch-geojson.ts # Script utilitário para baixar a malha de bairros via Overpass API
│       └── diff-check.ts    # Script de auditoria para verificar integridade da base
```

---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js (versão 18 ou superior recomendado)
* Gerenciador de pacotes `npm`, `pnpm` ou `yarn`
* Banco de dados PostgreSQL rodando localmente ou na nuvem (ex: Neon)

### Passos de Instalação

1. **Clonar o Repositório**
   ```bash
   git clone https://github.com/seu-usuario/fretefortal.git
   cd fretefortal
   ```

2. **Instalar Dependências**
   ```bash
   pnpm install
   # ou
   npm install
   ```

3. **Configurar Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto com a seguinte variável (use o banco local ou na nuvem):
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/fretefortal?schema=public"
   ```

4. **Configurar o Banco de Dados (Prisma)**
   Execute as migrações para criar as tabelas no banco de dados:
   ```bash
   npx prisma db push
   ```

5. **Popular o Banco de Dados (Seed)**
   Popule o banco de dados com a configuração padrão da loja e a lista oficial de bairros de Fortaleza mapeados:
   ```bash
   npx prisma db seed
   ```

6. **Iniciar o Servidor de Desenvolvimento**
   ```bash
   pnpm dev
   # ou
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:3000`. A área administrativa pode ser acessada em `http://localhost:3000/admin/neighborhoods`.

---

## 📈 Acompanhamento de Avanço & Roadmap

* [x] Estruturação da base do banco de dados (Prisma).
* [x] Script de extração automática dos limites geográficos dos bairros de Fortaleza.
* [x] Painel administrativo para edição individual e em lote dos bairros.
* [x] Integração completa do mapa interativo Leaflet com os dados do Prisma.
* [x] Mecanismo de busca pública por CEP e geocodificação Nominatim.
* [x] Sincronização e correção ortográfica de 100% da base de dados e do mapa.
* [ ] Implementação de controle de login e autenticação na Área Administrativa.
* [ ] Opção de múltiplos horários e taxas especiais diferenciadas por turnos.
* [ ] Integração nativa com APIs de frete terceirizadas.

---

## 📄 Licença

Este projeto é desenvolvido para fins de validação de produto e aprendizado prático, disponível sob a licença MIT. Sinta-se livre para contribuir e sugerir melhorias!
