import { QuestionTemplate } from '../interviewQuestionBank';
import { TECHNICALQUESTIONS } from './technicalQuestions';
import { PROGRAMMINGQUESTIONS } from './programmingQuestions';
import { CODINGDSQUESTIONS } from './codingDsQuestions';
import { SQLQUESTIONS } from './sqlQuestions';
import { HRQUESTIONS } from './hrQuestions';
import { BEHAVIORALQUESTIONS } from './behavioralQuestions';

export const CODEXPERT_900_QUESTIONS: QuestionTemplate[] = [
  ...TECHNICALQUESTIONS,
  ...PROGRAMMINGQUESTIONS,
  ...CODINGDSQUESTIONS,
  ...SQLQUESTIONS,
  ...HRQUESTIONS,
  ...BEHAVIORALQUESTIONS,
];
