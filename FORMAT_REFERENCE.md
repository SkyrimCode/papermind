# 📋 Quick Format Reference

## Supported Question Formats

### ✅ Format 1: Simple Numbered

```
1. What is the capital of France?
A) Paris
B) London
C) Berlin
D) Madrid
```

### ✅ Format 2: Q.Number (GATE/JEE/Competitive)

```
Q.1 What is the capital of France?
(A) Paris
(B) London
(C) Berlin
(D) Madrid
```

### ✅ Format 3: With Metadata

```
Q.1 (MCQ, 1 Mark)
What is the capital of France?
(A) Paris
(B) London
(C) Berlin
(D) Madrid
```

### ✅ Format 4: With Sections

```
Section 1: General Aptitude
Q.1 What is the capital of France?
(A) Paris
(B) London
```

### ✅ Format 5: With Passages (Comprehension)

```
Questions 11 - 15: Read the following passage

Passage 1:
[Passage text here...]

Q.11 (MCQ, 1 Mark)
What does the passage suggest?
(A) Option A
(B) Option B
(C) Option C
(D) Option D

Q.12 (MCQ, 1 Mark)
According to the passage...
(A) Option A
(B) Option B
```

### ✅ Format 6: Questions with Numbered Lists

```
Q.25 (MCQ, 2 Marks)
Consider the following conditions for a theory:
1. S is considered as a valid string
2. T is considered as a valid string
3. U is considered as a valid string
4. V is considered as a valid string

Which of the above statements are correct?
(A) 1 and 2 only
(B) 2 and 3 only
(C) 1, 2, and 3 only
(D) All of the above
```

> **Note**: The parser intelligently distinguishes between numbered lists within questions (1., 2., 3., 4.) and actual question numbers (Q.25). Numbered lists must:
>
> - Appear within a question block (after Q.XX)
> - Be numbered 1-10 without Q prefix
> - Contain descriptive text after the number

## Supported Solution Formats

### ✅ Simple

```
1. A
2. C
3. B
```

### ✅ With Q

```
Q.1 A
Q.2 C
Q.3 B
```

### ✅ With Answer Label

```
1. Answer: A
2. Answer: C
3. Answer: B
```

### ✅ Combined

```
Q.1 Answer: A
Q.2 Answer: C
Q.3 Answer: B
```

## Quick Rules

✅ **DO**

- Number questions sequentially (1, 2, 3...)
- Use A, B, C, D for options
- Match solution numbers to question numbers
- Use consistent formatting

❌ **DON'T**

- Skip question numbers
- Use options beyond A-D
- Mix numbering styles in same file
- Forget to include all options

## Debug Tips

If parsing fails:

1. Open browser console (F12)
2. Look for "Extracted question text" log
3. Check if format matches examples above
4. Verify question numbers are sequential
5. Ensure options are labeled correctly

## Common Issues

| Issue                | Solution                                   |
| -------------------- | ------------------------------------------ |
| "No questions found" | Check question numbering format            |
| Missing options      | Ensure all options are on separate lines   |
| Wrong answers        | Verify solution numbers match questions    |
| Incomplete parsing   | Check for special characters or formatting |

---

**Last Updated**: October 25, 2025
