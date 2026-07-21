# FreteFortal 🚚

## 🎯 Intenção do Projeto
O **FreteFortal** foi idealizado para simplificar e automatizar a consulta de taxas e prazos de entrega (frete) por bairros na cidade de Fortaleza (CE). O objetivo principal é servir como um MVP (Minimum Viable Product) prático, eficiente e direto ao ponto, otimizando a comunicação entre lojistas e clientes sem complexidades desnecessárias.

---

## 💡 O que o Projeto Solve
Nas operações de comércio local, o processo de responder manualmente a dúvidas sobre taxas e prazos de entrega via WhatsApp ou redes sociais gera gargalos no atendimento e consome tempo precioso.

O FreteFortal resolve esse problema ao:
* **Automatizar a consulta do cliente:** O cliente digita seu CEP ou endereço e descobre instantaneamente se a loja entrega em seu bairro, o valor do frete, o prazo estimado e se há regras para frete grátis.
* **Direcionar para o canal de venda:** Disponibiliza um botão de contato rápido via WhatsApp pré-configurado com as informações de entrega.
* **Simplificar a gestão para o lojista:** Oferece um painel simples e visual (com mapa e lista dos bairros de Fortaleza) para o lojista definir e atualizar valores e regras de entrega em poucos cliques.

---

## 📌 Visão Geral do Sistema

### 🔍 Área Pública (Cliente)
* Consulta simples por CEP ou nome da rua/endereço.
* Exibição de regras de entrega (valor do frete, prazo estimado, pedido mínimo e limite para frete grátis).
* Indicação da opção de retirada na loja para locais não atendidos pela entrega.
* Botão para contato direto com a loja.

### ⚙️ Painel de Gestão (Lojista)
* Visualização integrada por Lista e por Mapa Interativo.
* Configuração individual por bairro e ferramenta de edição de regras em massa.
* Gerenciamento das informações públicas da loja (nome, WhatsApp, horário de funcionamento e endereço físico).
* Indicadores simples de status e cobertura de entrega.

---

## 🛠️ Tecnologias Utilizadas
* **Frontend & Backend:** React, Next.js (App Router), TypeScript
* **Estilização:** CSS / Tailwind CSS
* **Banco de Dados:** PostgreSQL & Prisma ORM
* **Geocodificação & Mapas:** Leaflet / OpenStreetMap / ViaCEP

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* Node.js (v18+)
* Gerenciador de pacotes (`npm` ou `pnpm`)
* Instância do PostgreSQL

### Passo a Passo

1. **Instalar dependências**
   ```bash
   pnpm install
   # ou npm install
   ```

2. **Configurar Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto contendo a variável de conexão:
   ```env
   DATABASE_URL="sua-string-de-conexao-postgresql"
   ```

3. **Sincronizar o Banco de Dados**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Iniciar o Servidor de Desenvolvimento**
   ```bash
   pnpm dev
   # ou npm run dev
   ```

---

## 📊 Andamento do Projeto

- [x] Mapeamento e povoamento da base de bairros de Fortaleza.
- [x] Sistema de consulta pública por CEP e geocodificação por endereço.
- [x] Painel de gestão interativo (visão por mapa e tabela).
- [x] Edição de regras por bairro e edição em massa.
- [x] Gestão de perfil e dados da loja.
- [ ] Implementação de controle de login e autenticação na Área Administrativa.
- [ ] Suporte a regras de entrega por horários ou turnos.

---

## 📄 Licença
Projeto desenvolvido para fins de validação de produto e aprendizado prático.
