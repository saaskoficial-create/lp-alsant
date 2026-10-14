# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Médicos integrativos que precisam analisar exames e relacioná-los a sintomas, histórico e outras informações clínicas durante a rotina de atendimento. A landing page se dirige a esses profissionais e os convida a solicitar uma demonstração.

## Product Purpose

A Biosenz centraliza informações clínicas do paciente e usa inteligência artificial para apoiar sua análise. A prioridade confirmada para decisões futuras desta landing page é **agilidade na análise clínica**. A página deve ajudar o visitante a entender essa proposta e solicitar uma demonstração.

## Positioning

A comunicação aprovada destaca a análise e o cruzamento de informações na saúde integrativa. O diferencial apresentado é atuar nessa etapa clínica, enquanto softwares tradicionais para clínicas costumam se concentrar em agenda, prontuário e gestão administrativa. A frase “em menos de 3 minutos” pertence à copy fornecida; esta página não contém um estudo independente que a comprove.

## Operating Context

A rotina descrita na copy reúne exames laboratoriais, sintomas, histórico clínico, evolução, prontuários, consultas e protocolos. O médico avalia essas fontes para construir uma visão organizada do paciente. A demonstração da plataforma usa dados fictícios.

## Capabilities and Constraints

- A LP apresenta o produto e conduz os CTAs comerciais ao formulário de demonstração.
- O formulário coleta sete informações: nome, e-mail, WhatsApp, clínica/consultório, volume de pacientes, frequência de exames e volume de prontuários/pacientes gerenciados.
- O envio depende de um webhook configurado no servidor. Sem destino real, o formulário informa indisponibilidade; não confirma uma solicitação simulada.
- Hospedagem e domínio definitivos ainda não foram definidos. O preview usa `noindex`.
- Depoimentos ficam ocultos até aprovação de registros reais e autorização das imagens.
- Não incluir promessas de cura, multiplicadores de desempenho, métricas ou preços não fornecidos pelo cliente.

## Brand Commitments

Biosenz é o produto trabalhado para a cliente ALSANT. Preservar a copy fornecida em “LP — Biosenz | Médicos Integrativos”, a nomenclatura Biosenz e os ativos oficiais de marca já catalogados no projeto. A linguagem é dirigida ao médico integrativo e deve descrever a IA como apoio à análise, sem substituir a decisão clínica.

## Evidence on Hand

- Copy principal em `src/content/landing.ts`, transcrita do documento do cliente e conferida com o DOCX recebido.
- Cinco arquivos oficiais de logo em `public/brand`; proveniência registrada em `docs/assets.md`.
- Capturas da demonstração pública em `public/demo`, com dados fictícios.
- Foto licenciada e vídeo anatômico ilustrativo documentados em `docs/human-assets.md` e `docs/motion-assets.md`.
- Nenhum depoimento foi aprovado para publicação; não há validação independente das afirmações temporais da copy neste repositório.

## Product Principles

1. Tornar a economia de tempo na análise clínica compreensível sem ampliar as promessas aprovadas.
2. Mostrar como a informação clínica é organizada e relacionada, mantendo o médico no centro da decisão.
3. Fazer da solicitação de demonstração um caminho claro, acessível e honesto sobre o estado do envio.
4. Usar somente provas e ativos com origem documentada; nunca preencher lacunas com depoimentos ou dados inventados.

## Accessibility & Inclusion

A LP deve funcionar em desktop e mobile, com navegação por teclado, foco visível, labels e erros associados aos campos, contraste legível e conteúdo íntegro quando o usuário prefere movimento reduzido. O conteúdo principal continua legível sem JavaScript.
