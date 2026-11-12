# Azure DevOps Vue Syntax

Extensão de navegador (Chromium/Opera/Chrome/Edge) que adiciona coloração de
sintaxe a arquivos Vue na visualização de código e nos pull requests do
Azure DevOps (`dev.azure.com`), que por padrão aparecem sem cor nenhuma.

## Como funciona

O Azure DevOps renderiza código com o [Monaco Editor](https://microsoft.github.io/monaco-editor/)
(o mesmo motor do VS Code). O Monaco não reconhece a extensão `.vue`, então não
tokeniza o arquivo e ele fica branco.

A extensão injeta um script no contexto da página (`world: "MAIN"`), espera o
Monaco carregar e, para cada arquivo `.vue` aberto, troca a linguagem do model
para `html`. Como a gramática HTML do Monaco já colore JavaScript dentro de
`<script>` e CSS dentro de `<style>`, isso cobre a maior parte de um arquivo Vue
(`<template>` + `<script>` + `<style>`).

Funciona tanto na visualização de arquivo quanto no diff do pull request, porque
os dois usam models do Monaco. A navegação dentro do Azure DevOps é uma SPA
(a página não recarrega ao trocar de arquivo), então a extensão também escuta
`onDidCreateModel` para aplicar a coloração a arquivos abertos depois.

## Estrutura

```
az-syntax/
├── manifest.json     Identidade da extensão, onde roda e injeção no main world
├── src/
│   └── inject.js     Espera o Monaco, detecta models .vue e ajusta a linguagem
└── README.md
```

## Instalação (modo desenvolvedor)

### Opera

1. Abra `opera://extensions`.
2. Ative o **Modo do desenvolvedor** (canto superior direito).
3. Clique em **Carregar sem compactação** e selecione a pasta deste projeto.

### Chrome / Edge

1. Abra `chrome://extensions` (ou `edge://extensions`).
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta deste projeto.

Depois de carregar, abra um pull request com um arquivo `.vue` e recarregue a
página.

## Depuração

A flag `DEBUG` no topo de `src/inject.js` controla os logs no console do
navegador (F12). Com `DEBUG = true`, cada model detectado é impresso com o
caminho, a extensão e a linguagem atual, prefixado por `[az-vue-syntax]`.
Deixe `false` para uso normal.

## Configuração

O mapa `EXT_TO_LANG` em `src/inject.js` define quais extensões recebem qual
linguagem do Monaco:

```js
var EXT_TO_LANG = {
  ".vue": "html"
};
```

Para cobrir outras extensões, adicione entradas apontando para uma linguagem que
o Monaco reconheça.

## Limitações

- A coloração é **sintática** (tags, atributos, strings, palavras-chave), não
  **semântica**. Nomes de variáveis, parâmetros e tipos continuam na cor padrão,
  porque isso exigiria um language service rodando no navegador.
- Diretivas específicas de Vue (`v-if`, `@click`, `:prop`, interpolações
  `{{ }}`) são tratadas como atributos/texto genéricos pelo modo `html`. Uma
  gramática Vue dedicada melhoraria isso.
- Testado em `dev.azure.com`. 

