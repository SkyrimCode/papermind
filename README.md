# PaperMind Quiz App

A modern React-based quiz application with Firebase authentication that allows users to upload PDF/DOC files containing MCQ questions and solutions, take exams, and view detailed results.

## Features

🔐 **User Authentication**

- Google Sign-in integration
- Role-based access (Admin/User)
- Protected routes
- Secure Firebase backend

✨ **File Upload Support**

- Upload question files (PDF/DOC/DOCX)
- Upload solution files (PDF/DOC/DOCX)
- Drag & drop interface

👨‍💼 **Admin Features**

- Upload and save quizzes to library
- Manage quiz collection
- Set quiz titles and durations
- Delete quizzes

👥 **User Features**

- Browse available quizzes
- Take quizzes with timer
- View detailed results
- Track performance

📝 **Quiz Interface**

- Clean, intuitive question display
- Multiple choice options with multi-select support
- Configurable timer with warnings
- Progress tracking
- Passage comprehension support

🎯 **Automatic Grading**

- Instant results after submission
- Detailed answer comparison with explanations
- Grade calculation with percentage
- Letter grade (A+, A, B, C, D, F)

📊 **Results Dashboard**

- Overall score summary
- Question-by-question breakdown
- Correct/incorrect answer highlighting
- Full option display
- Detailed explanations

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **Firebase** - Authentication & Database
- **React Router** - Navigation
- **Zustand** - State management
- **PDF.js** - PDF parsing
- **Mammoth.js** - DOC/DOCX parsing
- **React Dropzone** - File upload
- **Lucide React** - Icons

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

> **Note**: The postinstall script will automatically copy the PDF.js worker file to the public directory.

3. Set up Firebase:

   - Follow the detailed instructions in `FIREBASE_SETUP.md`
   - Update `.env.local` with your Firebase config and admin email

4. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## File Format Guidelines

### Question File Format

Your question file should follow this format:

```
1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid

2. What is 2 + 2?
A) 3
B) 4
C) 5
D) 6
```

### Solution File Format

Your solution file should follow one of these formats:

```
1. C
2. B
```

OR

```
1. Answer: C
2. Answer: B
```

## Project Structure

```
src/
├── components/
│   ├── FileUpload.jsx      # File upload component
│   ├── QuestionCard.jsx    # Individual question display
│   └── ResultCard.jsx      # Result item display
├── pages/
│   ├── HomePage.jsx        # Upload files page
│   ├── QuizPage.jsx        # Take quiz page
│   └── ResultsPage.jsx     # View results page
├── store/
│   └── quizStore.js        # Zustand state management
├── utils/
│   ├── pdfParser.js        # PDF parsing utilities
│   └── docParser.js        # DOC/DOCX parsing utilities
├── App.jsx                 # Main app component
├── App.css                 # Main styles
└── main.jsx               # Entry point
```

## Usage

1. **Upload Files**: On the home page, upload your question and solution files
2. **Start Quiz**: Click "Start Quiz" to begin the exam
3. **Answer Questions**: Select your answers for each question
4. **Submit**: Submit your quiz when ready
5. **View Results**: See your score and detailed breakdown

## Build for Production

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
