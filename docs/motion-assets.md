# Animação anatômica da Biosenz

Vídeo decorativo produzido em 14 de outubro de 2026 para o bloco de diferenciação da landing page. A direção visual usa uma figura humana abstrata em pontilhismo, tons jade e marfim e fundo verde profundo. O objetivo é associar tecnologia e cuidado humano sem representar um resultado clínico.

## Arquivos públicos

| Arquivo | Especificação | Tamanho |
|---|---|---:|
| `public/media/biosenz-anatomy.mp4` | H.264, 1280 × 720, 24 fps, 8 segundos, sem áudio, faststart | 1615010 bytes |
| `public/media/biosenz-anatomy-poster.webp` | WebP, 1280 × 720, quadro extraído em 0,5 segundo | 110658 bytes |

A imagem de poster é um quadro do próprio vídeo. O master 1920 × 1080 permanece apenas no diretório de trabalho, fora dos assets publicados.

## Origem e direção

Geração de texto para vídeo com [Veo 3.1 Fast via Kie](https://kie.ai/veo-3-1), em uma única geração. Foram solicitados oito segundos em 16:9 e 1080p. A composição apresenta cabeça, pescoço, ombros e parte superior do tronco no lado direito, coração luminoso discreto, pontos finos em movimento e uma câmera estável. Não foram enviadas fotografias de pessoas, documentos privados ou dados de pacientes.

Trata-se de uma representação sintética e ilustrativa. Não é uma captura da Biosenz, uma visualização derivada de exames, uma pessoa real ou uma evidência de precisão clínica. A documentação do modelo e do fluxo está disponível em [geração Veo 3.1](https://docs.kie.ai/veo3-api/generate-veo-3-video) e [consulta da tarefa](https://docs.kie.ai/market/common/get-task-detail).

Em 14/10/2026, a [página oficial do modelo na Kie](https://kie.ai/veo-3-1) indicava uso comercial. Esse registro não atribui licença aberta ou exclusividade ao arquivo gerado; seu uso permanece sujeito às condições do fornecedor.

## Preparação para web

O vídeo foi reduzido proporcionalmente para 720p, codificado em H.264 com formato de pixel `yuv420p`, áudio removido e índice MP4 colocado no início com `faststart`. Os oito segundos e os 24 fps do original foram preservados. O poster foi extraído do master e convertido em WebP.

Usar como animação decorativa, com reprodução silenciosa, controle de ícone acessível, carregamento adiado e imagem estática quando `prefers-reduced-motion` estiver ativo. O poster é um elemento de imagem com `loading="lazy"`, atrás do vídeo, para evitar download antecipado. A camada textual deve preservar contraste e independência da imagem. Algumas partículas se estendem para o lado esquerdo durante o movimento.

## Verificação

- `ffprobe` confirmou duração de 8 segundos, 1280 × 720, codec H.264, 24 fps e ausência de stream de áudio.
- O arquivo inteiro foi decodificado pelo FFmpeg sem erros.
- Seis quadros distribuídos entre o início e o final do vídeo otimizado foram inspecionados visualmente. A silhueta mantém proporções coerentes; não foram observados textos, logotipos, cortes bruscos, gore ou interfaces falsas.
- A reprodução do MP4 e o reinício por `loop` foram verificados no Chrome/Playwright, sem erro de mídia. O modelo produziu pulsos abstratos próximos ao coração e partículas em movimento; não se afirma continuidade perfeita entre o último e o primeiro quadro.
- O poster e um quadro durante a reprodução foram abertos e conferidos visualmente.

Os arquivos de trabalho contêm o master, a folha de contato e os registros locais de produção. Eles não são dependências do site publicado.
