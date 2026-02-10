const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const OFFICIAL_EMAIL = "dhruv1187.be23@chitkarauniversity.edu.in";

function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const series = [0, 1];
  for (let i = 2; i < n; i++) {
    series.push(series[i - 1] + series[i - 2]);
  }
  return series.slice(0, n);
}

function isPrime(num) {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

function filterPrimes(arr) {
  return arr.filter((num) => isPrime(num));
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcmTwo(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function lcm(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((acc, val) => lcmTwo(acc, val), arr[0]);
}

function hcf(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((acc, val) => gcd(acc, val), arr[0]);
}

async function getAIResponse(question) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return "API_KEY_NOT_SET";
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Answer the following question in exactly ONE word only. No explanations. Question: ${question}`,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown";
    return answer
      .trim()
      .split(/\s+/)[0]
      .replace(/[^a-zA-Z0-9]/g, "");
  } catch (error) {
    console.error("AI Error:", error);
    return "Error";
  }
}

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL,
  });
});

app.get("/bfhl/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL,
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (body.fibonacci !== undefined) {
      const n = parseInt(body.fibonacci);
      if (isNaN(n) || n < 0) {
        return res.status(400).json({
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: "Invalid fibonacci input. Must be a non-negative integer.",
        });
      }
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        data: fibonacci(n),
      });
    }

    if (body.prime !== undefined) {
      const arr = body.prime;
      if (!Array.isArray(arr) || !arr.every((n) => Number.isInteger(n))) {
        return res.status(400).json({
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: "Invalid prime input. Must be an array of integers.",
        });
      }
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        data: filterPrimes(arr),
      });
    }

    if (body.lcm !== undefined) {
      const arr = body.lcm;
      if (
        !Array.isArray(arr) ||
        !arr.every((n) => Number.isInteger(n)) ||
        arr.length === 0
      ) {
        return res.status(400).json({
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: "Invalid lcm input. Must be a non-empty array of integers.",
        });
      }
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        data: lcm(arr),
      });
    }

    if (body.hcf !== undefined) {
      const arr = body.hcf;
      if (
        !Array.isArray(arr) ||
        !arr.every((n) => Number.isInteger(n)) ||
        arr.length === 0
      ) {
        return res.status(400).json({
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: "Invalid hcf input. Must be a non-empty array of integers.",
        });
      }
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        data: hcf(arr),
      });
    }

    if (body.AI !== undefined) {
      const question = body.AI;
      if (typeof question !== "string" || question.trim() === "") {
        return res.status(400).json({
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: "Invalid AI input. Must be a non-empty string.",
        });
      }
      const answer = await getAIResponse(question);
      return res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL,
        data: answer,
      });
    }

    return res.status(400).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      error:
        "Invalid request. Must contain one of: fibonacci, prime, lcm, hcf, AI",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      error: "Internal server error",
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "BFHL API is running",
    endpoints: {
      health: "GET /health",
      bfhl: "POST /bfhl",
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
