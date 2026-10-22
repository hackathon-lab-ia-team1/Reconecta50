export const interviewSections = [
  {
    key: 'targetRole',
    title: 'Função que você procura',
    hint: 'Qual trabalho você gostaria de conseguir? Pode dizer mais de uma função.',
  },
  {
    key: 'education',
    title: 'Formação e cursos',
    hint: 'Conte sua escolaridade, cursos, instituições e quando estudou, se lembrar.',
  },
  {
    key: 'languages',
    title: 'Idiomas',
    hint: 'Quais idiomas você fala e qual seu nível em cada um? Pode informar apenas português.',
  },
  {
    key: 'experience',
    title: 'Experiências profissionais',
    hint: 'Conte seus cargos, empresas, períodos e o que fazia em cada trabalho.',
  },
  {
    key: 'skills',
    title: 'Habilidades',
    hint: 'Conte o que sabe fazer, como Excel, Word, atendimento ou organização.',
  },
  {
    key: 'additionalContacts',
    title: 'Outros meios de contato',
    hint: 'Digite ou cole os links do LinkedIn, portfólio ou outros contatos profissionais, se tiver.',
  },
] as const;
export type InterviewField = (typeof interviewSections)[number]['key'];
export type ResumeInterview = Record<InterviewField, string>;
export const emptyInterview: ResumeInterview = {
  targetRole: '',
  education: '',
  languages: '',
  experience: '',
  skills: '',
  additionalContacts: '',
};

export function interviewToText(values: ResumeInterview) {
  return interviewSections
    .filter(({ key }) => values[key].trim())
    .map(({ key, title }) => `${title}:\n${values[key].trim()}`)
    .join('\n\n');
}
