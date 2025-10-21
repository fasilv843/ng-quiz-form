import { DEFAULT_ANSWER_COUNT, DEFAULT_QUESTION_COUNT } from './constants';
import {
  generateQuizForm,
  generateQuestionForm,
  generateAnswerForm,
  validateArrayLength,
  withTrimmed,
} from './utils';
import { Validators, AbstractControl, FormControl } from '@angular/forms';

describe('Utils Form Functions', () => {
  describe('generateQuizForm', () => {
    it('should create a quiz form with questions', () => {
      const form = generateQuizForm();
      expect(form.controls.questions.length).toBe(DEFAULT_QUESTION_COUNT);
      expect(form.valid).toBe(false);
    });
  });

  describe('generateQuestionForm', () => {
    it('should create a question form with answers', () => {
      const form = generateQuestionForm();
      expect(form.controls.question).toBeTruthy();
      expect(form.controls.answers.length).toBe(DEFAULT_ANSWER_COUNT);
    });
  });

  describe('generateAnswerForm', () => {
    it('should create an answer form with control', () => {
      const form = generateAnswerForm();
      expect(form.controls.answer).toBeTruthy();
      expect(form.valid).toBe(false);
    });
  });

  describe('validateArrayLength', () => {
    it('should return null for valid array length', () => {
      const validator = validateArrayLength(1, 3);
      const control = { value: [1, 2] } as unknown as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should return minlength error if below min', () => {
        const requiredLength = 3;

        const validator = validateArrayLength(requiredLength);
        const control = { value: [1] } as unknown as AbstractControl;
        expect(validator(control)).toEqual({
            minlength: { requiredLength, actualLength: control.value.length },
        });
    });

    it('should return maxlength error if above max', () => {
        const requiredLength = 2;
        const validator = validateArrayLength(0, requiredLength);
        const control = { value: [1, 2, 3] } as unknown as AbstractControl;
        expect(validator(control)).toEqual({
            maxlength: { requiredLength, actualLength: control.value.length },
        });
    });

    it('should return null if control is null', () => {
        const validator = validateArrayLength();
        expect(validator(null as unknown as AbstractControl)).toBeNull();
    });

    it('should return null if control.value has no length property', () => {
        const validator = validateArrayLength();
        const control = { value: { foo: 'bar' } } as unknown as AbstractControl;
        expect(validator(control)).toBeNull();
    });
  });

  describe('withTrimmed', () => {
    it('should trim input and validate correctly', () => {
      const validator = withTrimmed([Validators.required]);
      const control = { value: '   ', setValue: jest.fn() } as unknown as AbstractControl;
      expect(validator(control)).toEqual({ required: true });
    });

    it('should return null for valid trimmed input', () => {
      const validator = withTrimmed([Validators.required]);
      const control = { value: ' Answer ' } as unknown as AbstractControl;
      expect(validator(control)).toBeNull();
    });

    it('should not trim if the value is not string', () => {
      const validator = withTrimmed([Validators.required]);
      const control = { value: 0 } as unknown as AbstractControl;
      expect(validator(control)).toBeNull();
    });
  });
});
