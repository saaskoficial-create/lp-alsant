# Biosenz — landing page

LP para médicos integrativos com solicitação de demonstração. Astro + React + TypeScript + Tailwind v4, shadcn/ui, GSAP/React Bits e React Hook Form/Zod.

## Desenvolvimento

Requer Node24.16+ LTS e npm. As versões resolvidas estão no lockfile.

```sh
npm ci
npm run dev
```

Preview em http://127.0.0.1:4321. Conteúdo estático em Astro; somente formulário e título animado hidratam como ilhas React.

```sh
npm run check
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright usa receptores locais controlados e portas próprias. Os dados de teste são fictícios; nenhum serviço real recebe submissões dos testes.

## Produção / webhook

Build Node standalone: a página principal é pré-renderizada; POST /api/leads precisa de um servidor Node ativo. Hospedar só dist/client não permite captar leads.

```sh
npm run build
# Configure LEAD_WEBHOOK_URL, HOST e PORT no ambiente do processo.
npm start
```

O servidor lê LEAD_WEBHOOK_URL no runtime, sem exposição ao cliente. Para um arquivo local de ambiente, copie .env.example para .env e execute `node --env-file=.env ./dist/server/entry.mjs`. Em produção, use variáveis do provedor e HTTPS. Não versionar segredos.

Contrato POST JSON: fullName, email, phone, clinic, patientVolume, examFrequency e recordVolume obrigatórios. Opções em src/lib/lead-schema.ts. Telefone normalizado; e-mail pessoal aceito. website é o honeypot e deve estar vazio. utm aceita somente utm_source, utm_medium, utm_campaign, utm_content e utm_term; source fixo no servidor.

Limite16KB, Zod em ambas as camadas, timeout8s, honeypot, bloqueio de envio simultâneo no formulário e ausência de logs com dados pessoais. Confirmação só após HTTP2xx do destino, que deve significar aceitação efetiva do lead. Falhas de validação400, tamanho413, destino502, timeout504, configuração ausente/inválida503. Inputs permanecem preenchidos após erro.

Um timeout pode ocorrer depois de o destino aceitar o lead; a integração definitiva deve deduplicar solicitações no CRM. Antes de ativar tráfego real, configurar proteção de volume no provedor, testar o destino definitivo e definir sua política de retenção/acesso.

## Conteúdo e manutenção

- Copy e comparação: src/content/landing.ts.
- Depoimentos: ocultos por padrão; publicar apenas registros reais aprovados com imagem autorizada.
- Marca e capturas oficiais da demonstração pública: public/brand e public/demo.
- Fontes self-hosted e licenças: public/fonts.
- Contexto durável do produto: PRODUCT.md (Impeccable). Direção: DESIGN.md. Proveniência da marca/demo/fontes: docs/assets.md. Foto de consulta: docs/human-assets.md. Vídeo anatômico: docs/motion-assets.md. Componentes: docs/third-party.md.
- Planejamento interno fica em .planning e é ignorado pelo Git; documentos privados nunca são publicados.

## Estado de entrega

Preview local e repositório são a entrega inicial. Hospedagem e domínio não foram definidos. A página usa noindex no preview; ao publicar no domínio definitivo, remover noindex e configurar canonical/og:url/og:image absolutos. Metadados de título e descrição já estão presentes.

Pendências externas: LEAD_WEBHOOK_URL definitivo e um envio recebido; dois ou três depoimentos aprovados; reconexão21st MCP, se ainda desejada. O MCP disponível retornou401 e nenhum código dele foi incorporado. Não há analytics ou conversão instalada.

Consulte docs/validation.md para evidências da validação realizada.
