# Assets da Biosenz

Inventário preparado em 14 de outubro de 2026 para a LP Biosenz / cliente ALSANT. Os arquivos de marca vieram dos anexos oficiais fornecidos pelo cliente no ClickUp. Nenhum documento privado, token ou URL temporária de download foi incluído neste registro.

## Marca

Os cinco PNGs originais estão em `public/brand/`. Mantêm nome, pixels e transparência dos arquivos recebidos. A marca continua pertencendo ao seu titular; estes arquivos são usados no projeto do cliente e não recebem uma licença de conteúdo aberto.

| Arquivo original | Dimensões | Bytes |
|---|---:|---:|
| `logotipo-biosenz.png` | 7118 × 1473 | 225803 |
| `logotipo-biosenz_white.png` | 8456 × 1750 | 292843 |
| `icon-app-biosenz.png` | 1516 × 1516 | 152443 |
| `icologo-biosenz_black.png` | 1144 × 1750 | 87955 |
| `icologo-biosenz_white.png` | 1144 × 1750 | 88091 |

Para o site, usar preferencialmente as versões WebP no mesmo diretório, derivadas por redimensionamento proporcional e codificação sem perdas, preservando as cores e a transparência:

| Arquivo otimizado | Dimensões | Bytes |
|---|---:|---:|
| `logotipo-biosenz.webp` | 960 × 199 | 21704 |
| `logotipo-biosenz_white.webp` | 960 × 199 | 17100 |
| `icon-app-biosenz.webp` | 256 × 256 | 15758 |
| `icologo-biosenz_black.webp` | 256 × 392 | 12894 |
| `icologo-biosenz_white.webp` | 256 × 392 | 10504 |

As variantes brancas precisam de fundo escuro. Preservar a proporção; não recriar o lettering em fonte.

## Fontes locais

As famílias são [Crimson Pro](https://fonts.google.com/specimen/Crimson+Pro) e [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans), distribuídas pelo Google Fonts sob a SIL Open Font License 1.1. Os arquivos WOFF2 foram obtidos diretamente da API oficial do Google Fonts e são servidos pelo próprio projeto, sem solicitação a um CDN no carregamento da LP.

| Arquivo em `public/fonts/` | Peso | Bytes |
|---|---:|---:|
| `crimson-pro-latin-variable.woff2` | 200–900 | 48200 |
| `crimson-pro-latin-ext-variable.woff2` | 200–900 | 37988 |
| `instrument-sans-latin-variable.woff2` | 400–700 | 30092 |
| `instrument-sans-latin-ext-variable.woff2` | 400–700 | 11144 |

`public/fonts/fonts.css` contém `@font-face`, faixas Unicode oficiais e `font-display: swap`. O subconjunto latino cobre o texto português da LP; o estendido permanece disponível quando necessário. As licenças completas estão em `Crimson-Pro-OFL.txt` e `Instrument-Sans-OFL.txt` no mesmo diretório.

Fontes das licenças: [Crimson Pro OFL](https://github.com/google/fonts/blob/main/ofl/crimsonpro/OFL.txt) e [Instrument Sans OFL](https://github.com/google/fonts/blob/main/ofl/instrumentsans/OFL.txt). Crimson Pro: Copyright 2018 The Crimson Pro Project Authors. Instrument Sans: Copyright 2022 The Instrument Sans Project Authors.

## Capturas reais da demonstração

Origem pública: [demonstração da Biosenz](https://biosenz.ai/demo). Capturadas em 14 de outubro de 2026 com Playwright/Chrome, viewport 1440 × 900, escala de dispositivo 1 e idioma `pt-BR`.

| Arquivo em `public/demo/` | Conteúdo | Dimensões | Bytes |
|---|---|---:|---:|
| `biosenz-demo.webp` | Assistentes → Analista de Exames Clínicos, análise e marcações do exame | 1440 × 900 | 47184 |
| `biosenz-assistentes.webp` | Catálogo de assistentes e exemplos de especialistas personalizados | 1440 × 900 | 60920 |
| `biosenz-pacientes.webp` | Pacientes → Paciente exemplo A, perfil com abas ADP, Exames e Prontuários | 1440 × 900 | 38904 |
| `biosenz-consultas.webp` | Consultas → Acompanhamento de rotina, aba Resumo | 1440 × 900 | 30720 |

O percurso de captura foi: abrir a demonstração, selecionar **Exploração livre**, abrir **Assistentes** e, para a primeira imagem, selecionar **Analista de Exames Clínicos**. As capturas adicionais usam os módulos reais **Pacientes** e **Consultas** disponíveis na navegação da mesma demonstração. Nenhuma informação de paciente foi inserida. O ambiente já utiliza dados fictícios e essa identificação continua visível no topo das imagens.

As imagens são capturas da interface real da demonstração, convertidas de PNG para WebP com qualidade 90, exceto o catálogo de assistentes, que usa qualidade 88. Não houve reconstrução de UI, alteração de textos, remoção de elementos, recorte ou geração por IA. Os valores laboratoriais são os exemplos ilustrativos existentes no demo e não constituem prova de resultado clínico, benchmark de velocidade ou validação independente das funcionalidades.

Texto alternativo sugerido para a imagem principal: “Demonstração da Biosenz com análise de exames e marcadores organizados; dados fictícios.” Para a segunda imagem: “Assistentes da demonstração Biosenz para exames clínicos e exemplos de especialistas personalizados.”

Para **Pacientes**: “Perfil de paciente fictício na demonstração Biosenz, com áreas de análises, exames e prontuários.” Descrição curta do módulo: “Informações clínicas reunidas no perfil do paciente.” Para **Consultas**: “Resumo de consulta fictícia na demonstração Biosenz, com pontos principais e próximos passos.” Descrição curta do módulo: “Resumo e registros do atendimento organizados para revisão.” O arquivo `biosenz-demo.webp` mostra um assistente de exames e não deve ser identificado como a tela do módulo Pacientes.

## Verificação

- Os cinco arquivos originais foram decodificados como PNG com transparência; as versões WebP carregaram no navegador com as dimensões previstas.
- As quatro capturas WebP foram abertas e inspecionadas visualmente. Conteúdo legível, dados fictícios identificados e nenhum erro de carregamento visível.
- As fontes latinas foram carregadas pelo navegador sem erro, verificadas por `document.fonts` e inspecionadas em amostra com caracteres acentuados e pesos diferentes.
- As variantes verde, branca, preta e ícone do aplicativo foram inspecionadas em fundos apropriados.

Os scripts e PNGs de conferência ficam em `work/assets/`, como material de trabalho; não são dependências da página pública.
