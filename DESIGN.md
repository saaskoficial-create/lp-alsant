# Biosenz — direção visual

Público: médicos integrativos. Conversão: solicitar demonstração. Preservar a copy aprovada e a identidade da marca; nenhum preço, depoimento ou promessa extra.

## Sistema

Crimson Pro variável para títulos; Instrument Sans para interface e leitura. Fontes locais OFL. H1 46–68 px, H2 37–57 px, corpo 16–17 px. Leitura em colunas de aproximadamente 50–65 caracteres.

| Token            | Valor   |
| ---------------- | ------- |
| Títulos          | #1A3C2A |
| Ação principal   | #1E6B45 |
| Fundo            | #FAFAFA |
| Superfície       | #FFFFFF |
| Superfície suave | #F1F6F2 |
| Borda            | #DCE5DE |

Ritmo: hero editorial com cena de consulta e notebook com captura oficial, explicação visual de informação conectada, vitrine de três módulos reais, comparação de seis pares, bloco verde de diferenciação com animação anatômica e formulário com sombra suave. O cabeçalho flutuante inclui navegação e CTA; o rodapé organiza navegação, canais oficiais e links legais. Vidro apenas no cabeçalho, com fundo opaco de fallback. Logotipos oficiais.

Da apresentação em biosenz.ai foram adaptados a hélice de DNA discreta no hero e o formato de demonstração navegável. A vitrine permite selecionar Assistentes, Pacientes e Consultas por mouse ou teclado; utiliza capturas reais da demonstração pública, sem iframe ou troca automática. A copy principal aprovada permanece centralizada em src/content/landing.ts. Não foram importados preços, métricas ou depoimentos do site institucional.

## Motion

Personalidade calma. Feedback dos controles entre 200–220 ms, com reflexo curto de 720 ms; entrada da foto em 600 ms e do notebook em 750 ms. GSAP coordena as entradas e o percurso único de partículas das informações até a Biosenz. SplitText de React Bits atua somente no título da comparação; palavras visuais aria-hidden, título completo acessível e presente antes da hidratação. Nenhuma animação bloqueia rolagem ou oculta conteúdo essencial.

O vídeo decorativo de oito segundos usa reprodução nativa silenciosa em loop. Carrega apenas próximo da seção e pausa fora da tela ou com a aba oculta. Um controle de ícone acessível permite interromper e retomar. Não há legendas visíveis de animação ou IA no banner. Reduced motion e economia de dados preservam a imagem estática; reprodução nesse caso exige ação explícita. A imagem de poster também usa carregamento adiado. A hélice de DNA é estática e decorativa.

Os CTAs e controles usam uma adaptação web da referência Liquid Glass: gradientes verdes translúcidos, reflexo interno, desfoque sutil, sombra e brilho curto ao hover/foco. O movimento é acionado pela interação; `prefers-reduced-motion` mantém os controles estáticos. São efeitos CSS, sem APIs nativas do macOS.

## Conteúdo e estados

Sete módulos: hero, problema, plataforma, comparação, diferenciação, depoimentos e conversão. Depoimentos permanecem ocultos até existir um mínimo de dois registros reais aprovados em src/content/landing.ts. As capturas do produto usam dados fictícios públicos; a foto de consulta é licenciada e o vídeo anatômico é uma ilustração sintética. Proveniência documentada separadamente. Todos os CTAs comerciais levam a #demonstracao.

Formulário com labels permanentes, erros associados ao campo, foco visível, status anunciado, valores preservados em falhas e estado pendente. Sem destino configurado, exibir indisponibilidade; nunca sucesso local simulado. Nenhum pixel/evento de conversão instalado.
