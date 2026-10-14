# Componentes e licenças

- Astro, React, Tailwind CSS, shadcn/ui, React Hook Form e Zod: versões exatas no package-lock.json. shadcn/ui instalado pelo CLI oficial; componentes locais em src/components/ui, ajustados pelos tokens da Biosenz.
- React Bits SplitText: adaptação de [SplitText TS](https://github.com/DavidHDev/react-bits/blob/496968c4117e21278f13917201b7d615bc5e7450/src/ts-default/TextAnimations/SplitText/SplitText.tsx), por David Haz. A adaptação reduz o componente para um título, utiliza IntersectionObserver, respeita reduced-motion e mantém texto acessível único. Licença MIT + Commons Clause copiada integralmente para licenses/react-bits.txt. Parte desta aplicação, não distribuído como biblioteca de componentes.
- GSAP e SplitText: pacote oficial gsap, com licença distribuída pelo fornecedor no pacote. Nenhuma biblioteca de animação concorrente controla o mesmo elemento.
- Lucide: ícones do pacote lucide-react.
- Fontes, marca e demonstração: [assets.md](assets.md). Foto licenciada: [human-assets.md](human-assets.md). Vídeo e condições do fornecedor: [motion-assets.md](motion-assets.md).

Referências técnicas consultadas: [Astro Node adapter](https://docs.astro.build/en/guides/integrations-guide/node/), [shadcn Astro](https://ui.shadcn.com/docs/installation/astro), [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines).

21st MCP não foi usado para obter/gerar componentes: a conexão disponível retornou HTTP401. A página foi implementada independentemente, com os componentes oficiais acima.
