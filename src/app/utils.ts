import { 
    AbstractControl, 
    FormArray, 
    FormControl, 
    FormGroup, 
    ValidationErrors, 
    ValidatorFn, 
    Validators 
} from "@angular/forms";

import { 
    DEFAULT_ANSWER_COUNT, 
    DEFAULT_QUESTION_COUNT, 
    MAXIMUM_ANSWER_COUNT, 
    MAXIMUM_ANSWER_LENGTH, 
    MAXIMUM_QUESTION_COUNT, 
    MAXIMUM_QUESTION_LENGTH, 
    MINIMUM_ANSWER_COUNT, 
    MINIMUM_ANSWER_LENGTH, 
    MINIMUM_QUESTION_COUNT, 
    MINIMUM_QUESTION_LENGTH 
} from "./constants";


export type AnswerForm = FormGroup<{
    answer: FormControl<string>
}>

export type QuestionForm = FormGroup<{
    question: FormControl<string>;
    answers: FormArray<AnswerForm>
}>

export type QuizForm = FormGroup<{
    questions: FormArray<QuestionForm>
}>

export function generateQuizForm(): QuizForm {
    const questionForms: QuestionForm[] = []
    for (let i = 1; i <= DEFAULT_QUESTION_COUNT; i++) {
        questionForms.push(generateQuestionForm())
    }

    return new FormGroup({
        questions: new FormArray<QuestionForm>([...questionForms], {
            validators: [validateArrayLength(MINIMUM_QUESTION_COUNT, MAXIMUM_QUESTION_COUNT)] 
        })
    });
}

export function generateQuestionForm(): QuestionForm {
 
    const answerForms: AnswerForm[] = []
    for (let i = 1; i <= DEFAULT_ANSWER_COUNT; i++) {
        answerForms.push(generateAnswerForm())
    }

    return new FormGroup({
        question: new FormControl('', {
            nonNullable: true,
            validators: [
                withTrimmed([
                    Validators.required, 
                    Validators.minLength(MINIMUM_QUESTION_LENGTH), 
                    Validators.maxLength(MAXIMUM_QUESTION_LENGTH)
                ])
            ]
        }),
        answers: new FormArray<AnswerForm>([...answerForms], { 
            validators: [validateArrayLength(MINIMUM_ANSWER_COUNT, MAXIMUM_ANSWER_COUNT)] 
        })
    })
}

export function generateAnswerForm(): AnswerForm {
    return new FormGroup({
      answer: new FormControl('', {
        nonNullable: true,
        validators: [
          withTrimmed([
            Validators.required,
            Validators.minLength(MINIMUM_ANSWER_LENGTH),
            Validators.maxLength(MAXIMUM_ANSWER_LENGTH)
          ])
        ]
      }),
    });
}


export function validateArrayLength(min: number = 0, max: number = Infinity) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !(control instanceof Array || 'length' in control.value)) return null;

    const arrLength = control.value.length;
    if (arrLength < min) {
      return { minlength: { requiredLength: min, actualLength: arrLength } }
    } else if (arrLength > max) {
      return { maxlength: { requiredLength: max, actualLength: arrLength } }
    }
    return null;
  };
}

export function withTrimmed(validators: ValidatorFn[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const trimmedValue = typeof control.value === 'string' ? control.value.trim() : control.value;

    let tempControl = { ...control, value: trimmedValue } as AbstractControl;

    for (const validator of validators) {
      const result = validator(tempControl);
      if (result) return result;
    }

    return null;
  };
}