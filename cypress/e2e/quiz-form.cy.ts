import { 
    DEFAULT_ANSWER_COUNT, 
    DEFAULT_QUESTION_COUNT, 
    MINIMUM_QUESTION_LENGTH, 
    MINIMUM_ANSWER_LENGTH, 
    MAXIMUM_QUESTION_LENGTH,
    MAXIMUM_ANSWER_LENGTH,
    MINIMUM_QUESTION_COUNT,
    MAXIMUM_QUESTION_COUNT,
    MINIMUM_ANSWER_COUNT,
    MAXIMUM_ANSWER_COUNT
} from "@app/constants";

describe('Quiz Form E2E', () => {
  beforeEach(() => {
    // visit home page
    cy.visit('/');
  });

  it('should load the quiz form with proper heading', () => {
    cy.get('form').should('exist');
    cy.contains('Quiz Form').should('be.visible');
  });

  it('should allow typing a question and answers', () => {
    cy.get('input[placeholder="Type your question..."]').first().type('What is 20 + 20?');
    cy.get('input[placeholder="Answer 1"]').first().type('30');
    cy.get('input[placeholder="Answer 2"]').first().type('40');
    cy.get('input[placeholder="Answer 3"]').first().type('50'); // handle answer length based on defined answer length

    cy.get('input[placeholder="Type your question..."]').first().should('have.value', 'What is 20 + 20?');
    cy.get('input[placeholder="Answer 1"]').first().should('have.value', '30');
    cy.get('input[placeholder="Answer 2"]').first().should('have.value', '40');
    cy.get('input[placeholder="Answer 3"]').first().should('have.value', '50');
  });

  it('should allow typing in all fields and submit', () => {
    const quizData = Array.from({ length: DEFAULT_QUESTION_COUNT }).map((_, qIndex) => ({
        question: 'Q'.repeat(MINIMUM_QUESTION_LENGTH - 1) + qIndex, // e.g., "QQQQQ0"
        answers: Array.from({ length: DEFAULT_ANSWER_COUNT }).map(
            (_, aIndex) => 'A'.repeat(MINIMUM_ANSWER_LENGTH - 1) + aIndex // e.g., "AAAAA0"
        ),
    }));

    // attach listener *before* clicking
    cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
    });

    // Fill each question
    cy.get('input[placeholder="Type your question..."]').each(($input, index) => {
        cy.wrap($input).type(quizData[index].question);
    });

    // For each question, fill its answers
    quizData.forEach((q, qIndex) => {
        cy.get(`[formarrayname="questions"] > :nth-child(${qIndex + 1}) input[placeholder^="Answer"]`)
        .each(($answerInput, aIndex) => {
            cy.wrap($answerInput).type(q.answers[aIndex]);
        });
    });

    cy.get('button').contains('Submit').click();
    cy.get('@alertStub').should('have.been.calledOnceWith', `Form Submitted with ${DEFAULT_QUESTION_COUNT} questions`);
  })

    it('should show alert when form is invalid', () => {
        // attach listener *before* clicking
        cy.window().then((win) => {
            cy.stub(win, 'alert').as('alertStub');
        });

        cy.get('button').contains('Submit').click();

        cy.get('@alertStub').should('have.been.calledOnceWith', 'Form is invalid');
    });


    describe('Dynamic adding and removal of Question and Answers', () => {

        it('should render default number of questions and answers correctly', () => {
            cy.get('input[placeholder="Type your question..."]').should('have.length', DEFAULT_QUESTION_COUNT)
            cy.get('input[placeholder^="Answer "]').should('have.length', DEFAULT_QUESTION_COUNT * DEFAULT_ANSWER_COUNT)
        })

        it('should add a question when "Add Question" button is clicked', () => {
            cy.get('button').contains('Add Question').click();
            cy.get('input[placeholder="Type your question..."]').should('have.length', DEFAULT_QUESTION_COUNT + 1);
        });


        it('should remove a question form group when click "✘" beside question', () => {
            cy.get('button[aria-label="Remove question"]').first().click();
            cy.get('input[placeholder="Type your question..."]').should('have.length', DEFAULT_QUESTION_COUNT - 1)
        })

        it('should add an answer input when click "Add Answer"', () => {
            cy.get('[formarrayname="questions"] > div')
            .eq(0)
            .find('button[aria-label="Add answer"]')
            .as('addAnswerBtn')

            cy.get('@addAnswerBtn').should('be.visible').click()

            cy.get('[formarrayname="questions"] > div')
            .eq(0)
            .within(() => {
                cy.get('[formarrayname="answers"] input[formcontrolname="answer"]').as('answers');
            });

            cy.get('@answers').should('have.length', DEFAULT_ANSWER_COUNT + 1);

        })

        it('should remove an answer input when click "✘" beside answer', () => {
            cy.get('button[aria-label="Remove answer"]').first().click();
            // Get all answer inputs of first question
            cy.get('[formarrayname="questions"] > div')
            .eq(0)
            .within(() => {
                cy.get('[formarrayname="answers"] input[formcontrolname="answer"]').as('answers');
            });

            cy.get('@answers').should('have.length', DEFAULT_ANSWER_COUNT - 1);
        })
    })

    describe('Error Messages', () => {

        describe('Question Field Error Messages', () => {

            beforeEach(() => {
                cy.get('input[placeholder="Type your question..."]').first().as('firstQuestion')
            });

            it('should show error messages for question field when dirty', () => {
                // cy.get('input[placeholder="Type your question..."]').first().as('firstQuestion')
                cy.get('@firstQuestion').type('Q').clear()
    
                
                cy.get('#question-0').within(() => {
                    cy.contains('small.text-red-600', 'Question is required').should('be.visible');
                });
            })
            
            it('should show error messages for question field when touched', () => {
                // cy.get('input[placeholder="Type your question..."]').first().as('firstQuestion')
                cy.get('@firstQuestion').focus().blur()
    
                cy.get('#question-0 small.text-red-600').should('be.visible').and('have.text', 'Question is required')
            });


            it('should show minimum characters error if question length is less', () => {
                const question = 'Q'.repeat(MINIMUM_QUESTION_LENGTH - 1)
                // cy.get('input[placeholder="Type your question..."]').first().as('firstQuestion')
                cy.get('@firstQuestion').type(question)
                cy.get('#question-0 small.text-red-600').should('be.visible').and('have.text', `Minimum ${ MINIMUM_QUESTION_LENGTH } character${ MINIMUM_QUESTION_LENGTH > 1 ? 's' : ''} required`)
            });

            it('should show maximum characters error if question length is exceeded', () => {
                const question = 'Q'.repeat(MAXIMUM_QUESTION_LENGTH + 1)
                // cy.get('input[placeholder="Type your question..."]').first().as('firstQuestion')
                cy.get('@firstQuestion').type(question)
                cy.get('#question-0 small.text-red-600').should('be.visible').and('have.text', `Maximum ${ MAXIMUM_QUESTION_LENGTH } character${ MAXIMUM_QUESTION_LENGTH > 1 ? 's' : ''} allowed`)
            });

        })

        describe('Answer Field Error Messages', () => {

            beforeEach(() => {
                cy.get('input[placeholder="Answer 1"]').first().as('firstAnswer')
            });

            it('should show error messages for question field when dirty', () => {
                cy.get('@firstAnswer').type('A').clear()
    
                
                cy.get('#question-0-answer-0').within(() => {
                    cy.contains('small.text-red-600', 'Answer is required').should('be.visible');
                });
            })
            
            it('should show error messages for question field when touched', () => {
                cy.get('@firstAnswer').focus().blur()
    
                cy.get('#question-0-answer-0 small.text-red-600').should('be.visible').and('have.text', 'Answer is required')
            });


            it('should show minimum characters error if answer length is less', () => {
                const answer = 'A'.repeat(MINIMUM_ANSWER_LENGTH - 1)
                cy.get('@firstAnswer').type(answer)
                cy.get('#question-0-answer-0 small.text-red-600').should('be.visible').and('have.text', `Minimum ${ MINIMUM_ANSWER_LENGTH } character${ MINIMUM_ANSWER_LENGTH > 1 ? 's' : ''} required. Current : ${ answer.length }`)
            });

            it('should show maximum characters error if answer length is exceeded', () => {
                const answer = 'A'.repeat(MAXIMUM_ANSWER_LENGTH + 1)
                cy.get('@firstAnswer').type(answer)
                cy.get('#question-0-answer-0 small.text-red-600').should('be.visible').and('have.text', `Maximum ${ MAXIMUM_ANSWER_LENGTH } character${ MAXIMUM_ANSWER_LENGTH > 1 ? 's' : ''} allowed. Current : ${ answer.length }`)
            });

        })

        describe('Question Count Error Messages', () => {

            it('should show minimum questions error if question count is less', () => {
                let currQuestionCount = DEFAULT_QUESTION_COUNT;
                cy.get('button[aria-label="Remove question"]').as('qCloseBtns');
                while(currQuestionCount >= MINIMUM_QUESTION_COUNT) {
                    cy.get('@qCloseBtns').first().click();
                    currQuestionCount--;
                }
                
                cy.get('#question-count-error').should('be.visible').and('have.text', `Minimum ${ MINIMUM_QUESTION_COUNT } question${ MINIMUM_QUESTION_COUNT > 1 ? 's' : ''} required. Current : ${ currQuestionCount }`)
            
            });

            it('should show maximum questions error if question count is exceeded', () => {
                let currQuestionCount = DEFAULT_QUESTION_COUNT;
                cy.get('button').contains('Add Question').as('addQuestionBtn');
                while(currQuestionCount <= MAXIMUM_QUESTION_COUNT) {
                    cy.get('@addQuestionBtn').click();
                    currQuestionCount++;
                }
                
                cy.get('#question-count-error').should('be.visible').and('have.text', `Maximum ${ MAXIMUM_QUESTION_COUNT } question${ MAXIMUM_QUESTION_COUNT > 1 ? 's' : ''} allowed. Current : ${ currQuestionCount }`)
            });
        });


        describe('Answer Count Error Messages', () => {

            beforeEach(() => {
                cy.get('[formarrayname="questions"] > div').eq(0).should('exist').as('questionBox')
            })

            it('should show minimum answers error if answer count is less', () => {
                let currAnswerCount = DEFAULT_ANSWER_COUNT;
                cy.get('@questionBox').find('button[aria-label="Remove answer"]').as('aCloseBtns');
                while(currAnswerCount >= MINIMUM_ANSWER_COUNT) {
                    cy.get('@aCloseBtns').first().click();
                    currAnswerCount--;
                }
                
                cy.get('#answer-count-error-q0').should('be.visible').and('have.text', `Minimum ${ MINIMUM_ANSWER_COUNT } answer${ MINIMUM_ANSWER_COUNT > 1 ? 's' : ''} required. Current : ${ currAnswerCount }`)
            
            });

            it('should show maximum answers error if answer count is exceeded', () => {
                let currAnswerCount = DEFAULT_ANSWER_COUNT;
                cy.get('@questionBox').find('button[aria-label="Add answer"]').as('addAnswerBtn');
                while(currAnswerCount <= MAXIMUM_ANSWER_COUNT) {
                    cy.get('@addAnswerBtn').click();
                    currAnswerCount++;
                }
                
                cy.get('#answer-count-error-q0').should('be.visible').and('have.text', `Maximum ${ MAXIMUM_ANSWER_COUNT } answer${ MAXIMUM_ANSWER_COUNT > 1 ? 's' : ''} allowed. Current : ${ currAnswerCount }`)
            });

        })
    })
});
