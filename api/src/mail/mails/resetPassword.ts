export const generateResetPasswordEmail = (
  email: string,
  code: string,
  userName: string
) => {
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
      <h1>Wachtwoord Reset</h1>
      <p>Hey <strong>${userName}</strong>,</p>
      <p>
        We hebben een verzoek ontvangen om je wachtwoord opnieuw in te stellen. Klik op de onderstaande link om je wachtwoord opnieuw in te stellen:
      </p>
        <a href="${
          process.env.ENVIRONMENT === "dev"
            ? "http://localhost:4000"
            : "https://de-mol-quiz.vercel.app"
        }/confirm-reset-password?code=${code}&email=${email}" 
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
          Reset wachtwoord
        </a>
        <p>
        Weet dat deze link slechts 5 minuten geldig is. Als je deze e-mail per ongeluk hebt ontvangen of geen wachtwoordreset hebt aangevraagd, kun je deze e-mail negeren.
      </p>
      </p>
      <p class="footer">Lennert Van Geert - <a href="https://de-mol-quiz.vercel.app/unsubscribe?email=${encodeURIComponent(
        email
      )}">Unsubscribe</a></p>
    </div>
  </body>
  </html>
  `;
};
