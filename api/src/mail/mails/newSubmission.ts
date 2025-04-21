import { Answer } from "../../modules/Answer/Answer.types";

export const generateNewSubmissionEmail = (answer: Answer) => {
  const userLabel = answer.userName ?? answer.userId.toString();
  const answerItems = answer.answers
    .map(
      (a) => `
      <li>
        <strong>Vraag ${a.questionId}</strong>: ${a.userAnswer} — 
        ${a.isCorrect ? "✅" : "❌"} (${a.pointsAwarded} pt.)
      </li>`
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <title>Nieuwe quizinzending</title>
    <style>
      body {
        margin: 0; padding: 0;
        background-color: #03101e;
        color: #ffffff;
        font-family: 'Courier New', Courier, monospace;
      }
      .container {
        width: 100%; max-width: 600px;
        margin: auto; padding: 2rem;
      }
      h1 {
        font-size: 1.8rem; text-align: center;
        color: #0ff;
        text-shadow:
          0 0 5px #0ff,
          0 0 10px #0ff,
          0 0 20px #0ff;
        margin-bottom: 1.5rem;
      }
      p {
        font-size: 1rem; line-height: 1.4;
        margin-bottom: 1rem;
      }
      ul {
        padding-left: 1.2rem; margin-bottom: 1.5rem;
      }
      li {
        margin-bottom: 0.5rem;
      }
      .footer {
        font-size: 0.85rem; color: #888;
        text-align: center; margin-top: 2rem;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Nieuwe inzending ontvangen!</h1>
      <p>
        Er is een nieuwe inzending binnengekomen van <strong>${userLabel}</strong>
        voor quiz <strong>${answer.quizId}</strong>.
      </p>
      <p><strong>Totaalscore:</strong> ${answer.totalScore} punten</p>
      <ul>
        ${answerItems}
      </ul>
      <p class="footer">
        Lennert Van Geert
      </p>
    </div>
  </body>
  </html>
  `;
};
