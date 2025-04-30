export const generateNewQuizEmail = (week: string, email: string) => {
  return `
        <!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <title>Nieuwe De Mol Quiz</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #03101e;
      color: #ffffff;
      font-family: 'Courier New', Courier, monospace;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: auto;
      padding: 2rem;
    }
    h1 {
      font-size: 2rem;
      text-align: center;
      color: #0ff;
      text-shadow:
        0 0 5px #0ff,
        0 0 10px #0ff,
        0 0 20px #0ff,
        0 0 40px #0ff;
      margin-bottom: 2rem;
    }
    p {
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    .button {
      display: block;
      width: 60%;
      max-width: 250px;
      margin: 2rem auto;
      padding: 0.75rem 1rem;
      background-color: #0ff;
      color:rgb(0, 0, 0);
      text-align: center;
      text-decoration: none;
      font-weight: bold;
      border-radius: 4px;
      box-shadow:
        0 0 5px #0ff,
        0 0 10px #0ff,
        0 0 20px #0ff;
    }
    .footer {
      text-align: center;
      font-size: 0.85rem;
      color: #888;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>De Mol Quiz – Week ${week}</h1>
    <p>Er is een nieuwe quiz toegevoegd voor week <strong>${week}</strong>! Pak je kans om te laten zien dat jij de mol het snelst doorgrondt.</p>
    <p>Klik op de knop hieronder om direct te starten.</p>
    <a href="https://de-mol-quiz.vercel.app" class="button">Start Quiz</a>
    <p class="footer">Veel succes!<br/>Lennert Van Geert <br/> <a href="https://de-mol-quiz.vercel.app/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a></p>
  </div>
</body>
</html>

        `;
};
