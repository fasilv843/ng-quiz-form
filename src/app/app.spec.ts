import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { 
  DEFAULT_ANSWER_COUNT, 
  DEFAULT_QUESTION_COUNT, 
  MINIMUM_ANSWER_LENGTH, 
  MINIMUM_QUESTION_LENGTH 
} from './constants';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges()
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize quizForm with default questions', () => {
    expect(component.quizForm.controls.questions.length).toBe(DEFAULT_QUESTION_COUNT);
  });

  it('should add a question', () => {
    component.addQuestion();
    expect(component.quizForm.controls.questions.length).toBe(DEFAULT_QUESTION_COUNT + 1);
  });

  it('should remove a question', () => {
      component.removeQuestion(0);
      expect(component.quizForm.controls.questions.length).toBe(DEFAULT_QUESTION_COUNT - 1);
  });

  it('should add an answer to the first question', () => {
    const firstQuestion = component.quizForm.controls.questions.at(0);
    expect(firstQuestion.controls.answers.length).toBe(DEFAULT_ANSWER_COUNT);

    component.addAnswer(0);
    expect(firstQuestion.controls.answers.length).toBe(DEFAULT_ANSWER_COUNT + 1);
  });

  it('should remove an answer from the first question', () => {
    const firstQuestion = component.quizForm.controls.questions.at(0);
    component.removeAnswer(0, 0);
    expect(firstQuestion.controls.answers.length).toBe(DEFAULT_ANSWER_COUNT - 1);
  });

  it('should mark form invalid if required fields are empty', () => {
    component.quizForm.markAllAsTouched();
    expect(component.quizForm.valid).toBe(false);
  });

  it('should show form is invalid alert if submitter with errors', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    component.onSubmit();

    expect(component.quizForm.valid).toBe(false);
    expect(alertSpy).toHaveBeenCalledTimes(1)
    expect(alertSpy).toHaveBeenCalledWith('Form is invalid');

    alertSpy.mockRestore();
  });

  it('should call alert with submitted message if form is valid', () => {
    const quizData = Array.from({ length: DEFAULT_QUESTION_COUNT }).map((_, qIndex) => ({
      question: 'Q'.repeat(MINIMUM_QUESTION_LENGTH - 1) + qIndex, // e.g., "QQQQQ0"
      answers: Array.from({ length: DEFAULT_ANSWER_COUNT }).map(
          (_, aIndex) => 'A'.repeat(MINIMUM_ANSWER_LENGTH - 1) + aIndex // e.g., "AAAAA0"
      ),
    }));

    // Fill the form using quizData
    const questionsArray = component.quizForm.controls.questions;
    quizData.forEach((q, qIndex) => {
      const qGroup = questionsArray.at(qIndex);
      qGroup.controls.question.setValue(q.question);

      q.answers.forEach((answer, aIndex) => {
        qGroup.controls.answers.at(aIndex).controls.answer.setValue(answer);
      });
    });

    expect(component.quizForm.valid).toBe(true);

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.onSubmit()

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(`Form Submitted with ${DEFAULT_QUESTION_COUNT} questions`);
    expect(component.quizForm.controls.questions.length).toBe(DEFAULT_QUESTION_COUNT);
    
    alertSpy.mockRestore();
  })
});
