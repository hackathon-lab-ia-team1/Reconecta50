export const interviewSections = [
  {
    key: 'targetRole',
    title: 'Função que você procura',
    hint: 'Qual trabalho gostaria de conseguir? Pode citar mais de uma função.',
  },
  {
    key: 'experience',
    title: 'Experiências profissionais',
    hint: 'Onde trabalhou e o que fazia — destaque principal da sua trajetória!',
  },
  {
    key: 'skills',
    title: 'Suas habilidades',
    hint: 'O que sabe fazer bem: atendimento, organização, cuidado, trabalho em equipe, etc.',
  },
  {
    key: 'education',
    title: 'Formação e escolaridade',
    hint: 'Até onde estudou e cursos práticos que realizou.',
  },
] as const;

export type InterviewField = (typeof interviewSections)[number]['key'];
export type ResumeInterview = Record<InterviewField, string>;

export const emptyInterview: ResumeInterview = {
  targetRole: '',
  experience: '',
  skills: '',
  education: '',
};

export function interviewToText(values: ResumeInterview) {
  return interviewSections
    .filter(({ key }) => values[key].trim())
    .map(({ key, title }) => `${title}:\n${values[key].trim()}`)
    .join('\n\n');
}
