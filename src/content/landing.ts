export const copy = {
  hero: {
    title: 'Médico integrativo, analise exames em menos de 3 minutos.',
    description:
      'Cruze exames, sintomas, histórico clínico e centenas de parâmetros com apoio de inteligência artificial — sem perder horas analisando informações manualmente.',
    cta: 'Quero conhecer a Biosenz',
    support: 'Agende uma demonstração e veja a plataforma funcionando na prática.',
  },
  problem: {
    title: 'Sua análise clínica não precisa ser manual.',
    intro: 'Quanto mais completo o atendimento, mais informação você precisa analisar.',
    paragraphs: [
      'Na medicina integrativa, uma única decisão pode depender do cruzamento de dezenas de informações diferentes.',
      'O problema é que fazer isso manualmente consome tempo e aumenta a complexidade de cada atendimento.',
    ],
    conclusion: 'A Biosenz organiza tudo isso para você.',
  },
  product: {
    title: 'Inteligência artificial desenvolvida para a rotina do médico integrativo.',
    paragraphs: [
      'A Biosenz centraliza as informações clínicas do paciente e utiliza inteligência artificial para apoiar sua análise.',
      'Em poucos minutos, você consegue visualizar exames, relacionar parâmetros, consultar histórico e ter uma visão muito mais organizada do paciente.',
    ],
    conclusion: 'Tudo em um único ambiente.',
  },
  difference: {
    intro: 'Você não precisa de mais uma ferramenta genérica para clínicas.',
    title: 'A Biosenz foi pensada para quem trabalha com saúde integrativa.',
    paragraphs: [
      'Enquanto softwares tradicionais concentram-se principalmente em agenda, prontuário e gestão administrativa, a Biosenz atua em uma das partes mais complexas da rotina integrativa:',
      'transformar grandes volumes de informações clínicas em dados organizados para apoiar sua tomada de decisão.',
      'Não é apenas sobre armazenar informações.',
      'É sobre conseguir analisar, cruzar e utilizar essas informações com muito mais velocidade.',
    ],
  },
  final: {
    title: 'Médico integrativo, veja uma análise que levava horas acontecer em menos de 3 minutos.',
    description:
      'Conheça a Biosenz e veja como utilizar inteligência artificial para organizar exames, consultas, prontuários e protocolos na sua rotina clínica.',
  },
} as const;

export const comparison: ReadonlyArray<{ title: string; without: string; with: string }> = [
  {
    title: 'Análise de exames',
    without: 'Abrir resultados, procurar parâmetros e cruzar informações manualmente.',
    with: 'Organize e analise exames em menos de 3 minutos com apoio de IA.',
  },
  {
    title: 'Histórico do paciente',
    without: 'Buscar informações entre prontuários, exames e anotações diferentes.',
    with: 'Tenha as principais informações clínicas centralizadas em um único ambiente.',
  },
  {
    title: 'Sintomas + exames',
    without: 'Fazer o cruzamento clínico manualmente durante ou depois da consulta.',
    with: 'Cruze dados laboratoriais, histórico e sintomas com muito mais agilidade.',
  },
  {
    title: 'Protocolos',
    without:
      'Organizar todas as informações antes de começar a estruturar uma conduta individualizada.',
    with: 'Use as informações já organizadas para apoiar a construção de protocolos individualizados.',
  },
  {
    title: 'Consulta',
    without: 'Dividir a atenção entre o paciente e as anotações que precisam ser feitas.',
    with: 'Grave o atendimento e mantenha mais atenção no paciente.',
  },
  {
    title: 'Depois do atendimento',
    without: 'Gastar mais tempo organizando prontuário, histórico e próximos passos.',
    with: 'Tenha transcrição, resumo e informações estruturadas para reduzir o trabalho manual.',
  },
];

export interface Testimonial {
  name: string;
  specialty: string;
  clinic: string;
  quote: string;
  photo: string;
  approved: boolean;
}
// Only publish real testimonials after client approval, including image permission.
export const testimonials: Testimonial[] = [];
export const clinicalInputs = [
  'Exames laboratoriais',
  'Sintomas',
  'Histórico',
  'Evolução',
  'Prontuários',
  'Protocolos',
] as const;
