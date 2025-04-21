import { Answer } from "../../modules/Answer/Answer.types";

export const generateConfirmSubmissionEmail = (answer: Answer) => {
  const userLabel = answer.userName ?? "deelnemer";
  const score = answer.totalScore;

  return `
  <!DOCTYPE html>
  <html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <title>Je quizinzending is ontvangen</title>
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
      .score {
        display: block;
        font-size: 1.2rem;
        text-align: center;
        margin: 2rem 0;
        color: #0ff;
      }
      .footer {
        font-size: 0.85rem; color: #888;
        text-align: center; margin-top: 2rem;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Inzending ontvangen!</h1>
      <p>Hey <strong>${userLabel}</strong>,</p>
      <p>We hebben je antwoorden voor de quiz binnengekregen. Top gedaan!</p>
      <span class="score">Je totaalscore: <strong>${score} pt.</strong></span>
      <p>Nieuwsgierig naar de ranglijst? Klik hieronder om te zien hoe je het hebt gedaan ten opzichte van anderen.</p>
      <p style="text-align:center;">
        <a href="https://de-mol-quiz.vercel.app/scoreboard" 
           style="
             display:inline-block;
             padding:0.75rem 1rem;
             background-color:#0ff;
             color:#03101e;
             text-decoration:none;
             font-weight:bold;
             border-radius:4px;
             text-shadow:none;
           ">
          Bekijk Scorebord
        </a>
      </p>
      <p class="footer">Lennert Van Geert</p>
    </div>
  </body>
  </html>
  `;
};
