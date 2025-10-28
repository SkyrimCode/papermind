# 🎨 Architecture & Flow Diagrams

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PAPERMIND QUIZ APP                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   HomePage   │  │   QuizPage   │  │ ResultsPage  │          │
│  │              │  │              │  │              │          │
│  │ - File Upload│  │ - Questions  │  │ - Score      │          │
│  │ - Validation │  │ - Selection  │  │ - Breakdown  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                   │                 │
└─────────┼──────────────────┼───────────────────┼─────────────────┘
          │                  │                   │
          └──────────────────┼───────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                      COMPONENT LAYER                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  FileUpload  │  │ QuestionCard │  │  ResultCard  │          │
│  │              │  │              │  │              │          │
│  │ - Dropzone   │  │ - Options    │  │ - Answers    │          │
│  │ - Preview    │  │ - Selection  │  │ - Status     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
┌───────────────────────────────┼───────────────────────────────────┐
│                       STATE MANAGEMENT (Zustand)                  │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  State:                          Actions:                         │
│  • questions[]                   • setQuestions()                 │
│  • solutions[]                   • setSolutions()                 │
│  • userAnswers{}                 • setUserAnswer()                │
│  • questionFile                  • calculateScore()               │
│  • solutionFile                  • submitQuiz()                   │
│  • isQuizStarted                 • resetQuiz()                    │
│  • score                                                          │
│                                                                    │
└───────────────────────────────┬───────────────────────────────────┘
                                │
┌───────────────────────────────┼───────────────────────────────────┐
│                         UTILITY LAYER                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────┐    ┌──────────────────────┐           │
│  │    PDF Parser        │    │    DOC Parser        │           │
│  │                      │    │                      │           │
│  │ • extractTextFromPDF │    │ • extractTextFromDoc │           │
│  │ • parseMCQQuestions  │    │ • parseMCQQuestions  │           │
│  │ • parseAnswers       │    │ • parseAnswers       │           │
│  └──────────────────────┘    └──────────────────────┘           │
│             │                            │                        │
│             └────────────┬───────────────┘                        │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────┐
│                    EXTERNAL LIBRARIES                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│    ┌──────────┐      ┌──────────┐      ┌──────────┐             │
│    │ PDF.js   │      │ Mammoth  │      │ Dropzone │             │
│    │          │      │          │      │          │             │
│    │ PDF→Text │      │ DOC→Text │      │ Upload   │             │
│    └──────────┘      └──────────┘      └──────────┘             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## User Flow Diagram

```
┌─────────┐
│  START  │
└────┬────┘
     │
     ▼
┌─────────────────────────┐
│   Land on Home Page     │
│  (Upload Interface)     │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐      ┌──────────────┐
│  Upload Question File   │─────→│  Validation  │
└────┬────────────────────┘      └──────┬───────┘
     │                                   │
     │  ✓ Valid                         │ ✗ Invalid
     ▼                                   │
┌─────────────────────────┐             │
│  Upload Solution File   │             │
└────┬────────────────────┘             │
     │                                   │
     ▼                                   │
┌─────────────────────────┐             │
│   Click Start Quiz      │             │
└────┬────────────────────┘             │
     │                                   │
     ▼                                   │
┌─────────────────────────┐      ┌──────▼───────┐
│    Parse Files          │      │ Show Error   │
│  • Extract Text         │      │   Message    │
│  • Parse Questions      │      └──────────────┘
│  • Parse Answers        │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│   Navigate to Quiz      │
│      (/quiz)            │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│  Display Questions      │
│  • Show Question 1      │
│  • Show Options A-D     │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│   User Selects Answer   │
│  (Radio Button Click)   │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│  Answer Stored in State │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│   More Questions?       │
└────┬────────────────────┘
     │
     │ Yes                 │ No
     ▼                     ▼
   [Loop]          ┌─────────────────┐
     │             │  Submit Quiz    │
     └─────────────┤    Button       │
                   └────┬────────────┘
                        │
                        ▼
                 ┌──────────────────┐
                 │ Calculate Score  │
                 │ • Compare Answers│
                 │ • Count Correct  │
                 │ • Assign Grade   │
                 └────┬─────────────┘
                      │
                      ▼
                 ┌──────────────────┐
                 │ Navigate Results │
                 │   (/results)     │
                 └────┬─────────────┘
                      │
                      ▼
                 ┌──────────────────┐
                 │  Display Results │
                 │  • Total Score   │
                 │  • Grade (A-F)   │
                 │  • Breakdown     │
                 └────┬─────────────┘
                      │
                      ▼
                 ┌──────────────────┐
                 │  Take New Quiz?  │
                 └────┬─────────────┘
                      │
            ┌─────────┴─────────┐
            │                   │
          Yes                  No
            │                   │
            ▼                   ▼
      [Reset State]        ┌────────┐
      [Return Home]        │  END   │
                          └────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      FILE UPLOAD EVENT                            │
│  { questionFile: File, solutionFile: File }                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                        FILE READERS                               │
│  ┌──────────────────┐          ┌──────────────────┐             │
│  │  PDF.js Reader   │          │  Mammoth Reader  │             │
│  │  (for PDF files) │          │  (for DOC files) │             │
│  └──────────────────┘          └──────────────────┘             │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      EXTRACTED TEXT                               │
│  "1. Question?\nA) Opt1\nB) Opt2\n..."                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                         PARSERS                                   │
│  ┌──────────────────┐          ┌──────────────────┐             │
│  │ Question Parser  │          │  Answer Parser   │             │
│  │  (Regex-based)   │          │  (Regex-based)   │             │
│  └──────────────────┘          └──────────────────┘             │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    STRUCTURED DATA                                │
│  questions: [                                                     │
│    { id: "1", text: "...", options: { A: "...", B: "..." } }    │
│  ]                                                                │
│  solutions: [                                                     │
│    { id: "1", answer: "C" }                                      │
│  ]                                                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORE                                │
│  • Store questions                                                │
│  • Store solutions                                                │
│  • Initialize userAnswers = {}                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      QUIZ INTERFACE                               │
│  • Render questions from store                                    │
│  • Display options                                                │
│  • Listen for user selections                                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    USER SELECTIONS                                │
│  userAnswers: { "1": "A", "2": "C", "3": "B", ... }             │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SUBMIT & CALCULATE                              │
│  • Compare userAnswers with solutions                             │
│  • Count correct answers                                          │
│  • Calculate percentage                                           │
│  • Assign letter grade                                            │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      RESULTS DATA                                 │
│  results: [                                                       │
│    {                                                              │
│      questionId: "1",                                             │
│      userAnswer: "A",                                             │
│      correctAnswer: "C",                                          │
│      isCorrect: false                                             │
│    }                                                              │
│  ]                                                                │
│  score: { correct: 7, total: 10, percentage: 70, grade: "B" }   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    RESULTS DISPLAY                                │
│  • Show grade circle                                              │
│  • Show score breakdown                                           │
│  • Show each question result                                      │
└──────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Router
    ├── Route "/"
    │   └── HomePage
    │       ├── FileUpload (Question)
    │       └── FileUpload (Solution)
    │
    ├── Route "/quiz"
    │   └── QuizPage
    │       └── QuestionCard (for each question)
    │           └── Radio Options
    │
    └── Route "/results"
        └── ResultsPage
            ├── Score Summary
            └── ResultCard (for each question)
```

## State Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                        ZUSTAND STORE                            │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Initial State:                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ questions: []                                             │  │
│  │ solutions: []                                             │  │
│  │ userAnswers: {}                                           │  │
│  │ questionFile: null                                        │  │
│  │ solutionFile: null                                        │  │
│  │ isQuizStarted: false                                      │  │
│  │ isQuizSubmitted: false                                    │  │
│  │ score: null                                               │  │
│  │ results: null                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Actions (Setters):                                             │
│  • setQuestions(questions[])                                    │
│  • setSolutions(solutions[])                                    │
│  • setUserAnswer(questionId, answer)                            │
│  • setQuestionFile(file)                                        │
│  • setSolutionFile(file)                                        │
│  • startQuiz()                                                  │
│  • submitQuiz()                                                 │
│  • calculateScore()                                             │
│  • resetQuiz()                                                  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## Legend

```
┌─────┐
│ Box │  = Component / Module / Layer
└─────┘

  │
  ▼      = Data / Control Flow

─────    = Connection / Relationship

[Loop]   = Repeated Process
```

---

**Visual Guide Version**: 1.0  
**Last Updated**: October 25, 2025
