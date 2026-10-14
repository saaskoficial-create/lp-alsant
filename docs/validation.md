# Validação da landing page

Verificações realizadas em 14/10/2026, Windows, Node 24.16.0 e Chrome 154. O preview final usa o build de produção do adapter Node. Dados de formulário nos testes são fictícios e enviados somente a um receptor HTTP local controlado.

## Código e conversão

- Instalação limpa a partir do lockfile: 605 pacotes instalados, auditoria npm sem vulnerabilidades reportadas na data da verificação.
- Checagem Astro/TypeScript: zero erros, avisos ou hints.
- ESLint e build de produção concluídos.
- 34 testes do schema/endpoint aprovados: validação, normalização, tamanho do payload, antispam, atribuição permitida, configuração, falhas e aceite do destino.
- 20 cenários Playwright aprovados. A nova cobertura confirma que o CTA fixo aparece após a segunda seção no mobile, leva à conversão e desaparece sobre o formulário. A rodada completa anterior havia encontrado e corrigido contraste insuficiente nas abas inativas.
- Formulário inválido, indisponibilidade real 503, resposta 2xx do receptor local, falha 502, timeout 504 e bloqueio de envio duplicado verificados no navegador. Erros preservam o preenchimento. Sucesso ocorre somente após aceite do destino.
- Sem JavaScript: conteúdo legível e formulário desabilitado com orientação; método POST evita expor os campos pela URL.
- A CI em `.github/workflows/ci.yml` repete instalação limpa, check, lint, testes, build e os 20 cenários com Chromium no Ubuntu. Histórico disponível em [GitHub Actions](https://github.com/saaskoficial-create/lp-alsant/actions).

## Interface e acessibilidade

- Viewports 360, 390, 768 e 1440 px: sem overflow horizontal, erro JavaScript ou imagem visível faltante; ambas as fontes locais carregadas.
- Capturas de hero, plataforma, comparação, banner, formulário, rodapé e página completa revisadas. Para capturas isoladas das seções, o cabeçalho fixo foi ocultado apenas durante a captura para evitar sobreposição artificial.
- Menu mobile, Escape, navegação por teclado, foco e destino dos CTAs verificados.
- Abas Assistentes, Pacientes e Consultas: painel selecionado, imagens reais carregadas, roving tabindex, setas com retorno ao início, Home, End, Tab e Shift+Tab.
- Axe com regras WCAG AA: zero violações detectadas em 390 e 1440 px, incluindo os erros do formulário. Auditoria automatizada não substitui avaliação completa com tecnologias assistivas.
- Reflow equivalente a 200%: viewport de 720 px a partir da referência de 1440 px, DPR 2; controles acessíveis e sem overflow. Não é uma medição de zoom nativo do navegador.
- Reduced motion mantém título completo e apresentação estática. O MP4 não é solicitado no hero nem automaticamente com movimento reduzido; reprodução explícita, pausa manual e pausa fora da tela foram verificadas. Nenhum erro de mídia/recurso nesses fluxos.
- H1 destacado com degradê metalizado, títulos em escala editorial/sans diferenciados, quatro hélices adicionais, GSAP contínuo apenas para hélices visíveis, entradas/saídas suaves por deslocamento e formulário verde escuro. A opacidade dos textos permanece 100% durante a rolagem para preservar contraste.

## Desempenho local

Lighthouse 13.5.0, navegação mobile com throttling simulado, build local servido em `127.0.0.1:4321`, medição após os novos botões em 14/10/2026 às 20:10 UTC:

| Métrica                  | Resultado |
| ------------------------ | --------: |
| Performance              |        92 |
| Acessibilidade           |       100 |
| Boas práticas            |       100 |
| SEO                      |        63 |
| Largest Contentful Paint |     3,3 s |
| Cumulative Layout Shift  |         0 |

O SEO do preview continua afetado intencionalmente por `noindex, nofollow`; não foi reavaliado nesta medição focada em desempenho, acessibilidade e boas práticas. Os controles Liquid Glass foram conferidos em 1440 e 390 px: luz curta em hover/foco, foco visível, sem overflow ou erro JavaScript. Em movimento reduzido, brilho e deslocamento ficam desativados. Três cenários Playwright direcionados (teclado mobile e axe AA em 390/1440 px) passaram após essa revisão. Resultados de laboratório não representam métricas de usuários reais. Hospedagem, compressão, cache e rede definitivos ainda não foram medidos.

Após a revisão de tipografia e GSAP, Lighthouse mobile local em 14/10/2026 às 20:21 UTC: desempenho 89, acessibilidade 100, boas práticas 100, LCP 3,6 s e CLS 0 (`lighthouse-motion-mobile.json`). O desempenho caiu três pontos em relação à revisão anterior, associado à nova composição do H1 e carga de movimento. O GSAP foi adiado para depois do carregamento inicial; a auditoria automatizada de contraste voltou a 100 ao manter opacidade integral dos textos. A meta aspiracional de desempenho 90 ficou a um ponto nesta medição local.

## Limites e pendências

- Webhook definitivo não configurado. Captação real depende de um envio recebido no destino final; sucesso controlado local não confirma integração de produção.
- Depoimentos ocultos até aprovação de conteúdo e imagens reais.
- 21st MCP retornou HTTP 401; nenhum componente desse serviço foi usado. Implementação independente com bibliotecas documentadas.
- Hospedagem e domínio pendentes. Antes da publicação, configurar ambiente, HTTPS e metadados absolutos e retirar noindex.
- Fontes/ativos têm origem documentada. Briefing privado, planejamento interno, credenciais, arquivos de trabalho e dados reais de pacientes ficam fora do repositório.
