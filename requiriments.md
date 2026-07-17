# Prompt — Desenvolvimento do MVP

Quero desenvolver um MVP de uma aplicação web para consulta de frete por bairros de Fortaleza. O objetivo principal é validar a ideia de produto, portanto **não quero uma arquitetura excessivamente genérica ou preparada para múltiplas cidades ou múltiplos clientes neste momento**.

A prioridade é criar uma aplicação simples, bem estruturada, intuitiva e de fácil evolução futura, evitando abstrações prematuras.

---

# Objetivo

Criar uma plataforma onde o administrador configure quais bairros de Fortaleza possuem entrega, qual o valor do frete para cada bairro e outras regras relacionadas.

O cliente final acessará um link público, informará seu CEP ou endereço e descobrirá automaticamente:

* Se a loja entrega no seu bairro;
* Qual o valor do frete;
* Qual o prazo de entrega;
* Se existe opção de retirada no local.

O objetivo é eliminar a necessidade de responder manualmente essas informações via WhatsApp.

---

# Cidade suportada

O sistema deverá funcionar **exclusivamente para Fortaleza (CE)**.

Não é necessário implementar suporte para outras cidades.

Todos os bairros utilizados deverão ser os bairros oficiais de Fortaleza.

O mapa deverá representar apenas Fortaleza.

---

# Usuários

Existem apenas dois perfis.

## Administrador

Responsável por configurar todas as regras de entrega.

## Cliente

Apenas consulta as informações de entrega.

Não existe necessidade de login para o cliente.

---

# Funcionalidades da Área Administrativa

A aplicação deve possuir um painel administrativo contendo:

## Dados da loja

* Nome da loja
* Logo
* WhatsApp
* Endereço da loja
* Horário de funcionamento

---

## Configuração de entrega

O administrador poderá configurar:

Para cada bairro:

* Entrega disponível (Sim/Não)
* Valor do frete
* Prazo de entrega
* Pedido mínimo (opcional)
* Frete grátis acima de determinado valor (opcional)
* Observações (opcional)

---

## Lista de bairros

Todos os bairros de Fortaleza devem aparecer em uma lista pesquisável.

Exemplo:

```
Aldeota

✓ Entrega

Frete: R$ 10
```

```
Meireles

✓ Entrega

Frete: R$ 8
```

```
Mondubim

✗ Não entrega
```

---

## Configuração através do mapa

Além da lista, o administrador deverá visualizar um mapa de Fortaleza dividido por bairros.

Cada bairro deve possuir uma cor indicando seu status.

Sugestão:

* Verde → entrega disponível
* Vermelho → não entrega
* Amarelo → configuração incompleta

Ao clicar em um bairro deverá abrir um painel lateral para editar suas configurações.

---

## Dashboard

Um painel simples contendo:

* Quantos bairros possuem entrega
* Quantos bairros não possuem entrega
* Valor médio do frete
* Última atualização

Não é necessário criar gráficos complexos.

---

# Área Pública

O cliente acessará um link.

Exemplo:

```
fretefortaleza.com
```

A página deverá ser extremamente simples.

Ela deve conter:

* Logo da loja
* Nome da loja
* Campo para CEP
* Campo para endereço (opcional)
* Botão Consultar

---

# Consulta

O sistema deve permitir:

## Opção 1

Usuário informa CEP.

Sistema consulta uma API.

Obtém:

* endereço
* bairro

Depois procura o bairro configurado.

---

## Opção 2

Usuário informa endereço.

Sistema identifica automaticamente o bairro.

---

# Resultado

Caso exista entrega:

Mostrar:

* Bairro identificado
* Valor do frete
* Prazo
* Pedido mínimo (quando existir)
* Frete grátis (quando aplicável)
* Botão "Falar no WhatsApp"

---

Caso não exista entrega:

Mostrar:

```
Infelizmente ainda não realizamos entregas para este bairro.

Caso prefira, você pode retirar seu pedido em nossa loja.
```

---

# Tecnologias sugeridas

Utilizar:

* Next.js
* React
* TypeScript
* TailwindCSS
* Prisma
* PostgreSQL

Para mapas:

* MapLibre GL JS ou Leaflet

Para geocodificação:

* ViaCEP
* OpenStreetMap / Nominatim

Evitar bibliotecas pagas sempre que possível.

---

# Banco de dados

Modelar pelo menos as seguintes entidades:

* Loja
* Bairro
* Configuração de entrega

Não criar modelagens para múltiplas cidades.

---

# Experiência do usuário

Quero uma interface moderna.

Características:

* limpa
* rápida
* minimalista
* responsiva
* agradável
* intuitiva

O foco é permitir que qualquer comerciante consiga configurar tudo em poucos minutos.

---

# Arquitetura

Quero um projeto organizado.

Utilizar:

* App Router
* Componentização
* Server Actions quando fizer sentido
* Boas práticas do React
* Separação clara entre UI, regras de negócio e acesso a dados

Evitar overengineering.

---

# Importante

Este é um MVP para validação.

Não implementar:

* Multi-tenant
* Múltiplas cidades
* Sistema de assinaturas
* Planos
* Controle de usuários complexos
* Marketplace
* Funcionalidades que não agreguem valor imediato

Prefiro um código simples, limpo e fácil de manter do que uma arquitetura extremamente flexível.

---

# O que espero como resposta

Quero que você atue como um Product Engineer experiente.

Antes de começar a escrever código:

1. Analise criticamente a ideia.
2. Sugira melhorias no fluxo do usuário.
3. Identifique possíveis problemas de usabilidade.
4. Proponha funcionalidades que agreguem valor ao MVP sem aumentar muito sua complexidade.
5. Defina a arquitetura da aplicação.
6. Modele o banco de dados.
7. Estruture as pastas do projeto.
8. Defina as bibliotecas necessárias.
9. Crie um plano de desenvolvimento dividido em etapas pequenas e executáveis.
10. Somente depois disso, inicie a implementação.

Sempre priorize simplicidade, velocidade de desenvolvimento e facilidade de validação do produto. Não adicione complexidade desnecessária apenas por questões arquiteturais.
