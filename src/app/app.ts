import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { generateQuizForm, generateQuestionForm, generateAnswerForm } from './utils';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
})
export class App {
  quizForm = generateQuizForm()

  addQuestion() {
    this.quizForm.controls.questions.push(generateQuestionForm())
  }

  removeQuestion(questionIndex: number) {
    this.quizForm.controls.questions.removeAt(questionIndex)
  }

  addAnswer(questionIndex: number) {
    const newAnswerForm = generateAnswerForm()
    this.quizForm.controls.questions.at(questionIndex).controls.answers.push(newAnswerForm)
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    this.quizForm.controls.questions.at(questionIndex).controls.answers.removeAt(answerIndex)
  }

  onSubmit() {
    console.log(this.quizForm.getRawValue(), 'quiz form value');
    console.log(this.quizForm, 'quizForm');
    console.log(this.quizForm.controls.questions.controls.at(0)?.controls.answers.errors, 'answers errors');
    if (this.quizForm.valid) {
      const { questions } = this.quizForm.getRawValue();
      alert(`Form Submitted with ${questions.length} questions :)`);
      this.quizForm.reset();
      this.quizForm = generateQuizForm()
    } else {
      alert('Form is invalid')
    }
  }
}
