const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Your Chitkara email - REPLACE THIS
const OFFICIAL_EMAIL = "your_email@chitkara.edu.in";

// ============ HELPER FUNCTIONS ============

// Fibonacci series up to n terms
function fibonacci(n) {
    if (n <= 0) return [];
    if (n === 1) return [0];
    const series = [0, 1];
    for (let i = 2; i < n; i++) {
        series.push(series[i - 1] + series[i - 2]);
    }
    return series.slice(0, n);
}

// Check if number is prime
function isPrime(num) {
    if (num < 2) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
        if (num % i === 0) return false;
    }
    return true;
}

// Filter prime numbers from array
function filterPrimes(arr) {
    return arr.filter(num => isPrime(num));
}

// Calculate GCD of two numbers
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

// Calculate LCM of two numbers
function lcmTwo(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

// Calculate LCM of array
function lcm(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((acc, val) => lcmTwo(acc, val), arr[0]);
}

// Calculate HCF/GCD of array
function hcf(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((acc, val) => gcd(acc, val), arr[0]);
}

// AI Integration using Google Gemini
async function getAIResponse(question) {
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return "API_KEY_NOT_SET";
        }
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Answer the following question in exactly ONE word only. No explanations. Question: ${question}`
                        }]
                    }]
                })
            }
        );
        
        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown";
        // Extract first word only
        return answer.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '');
    } catch (error) {
        console.error('AI Error:', error);
        return "Error";
    }
}

// ============ API ROUTES ============

// GET /health - Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL
    });
});

// Also support /bfhl/health for Vercel routing
app.get('/bfhl/health', (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL
    });
});

// POST /bfhl - Main API endpoint
app.post('/bfhl', async (req, res) => {
    try {
        const body = req.body;
        
        // Handle fibonacci
        if (body.fibonacci !== undefined) {
            const n = parseInt(body.fibonacci);
            if (isNaN(n) || n < 0) {
                return res.status(400).json({
                    is_success: false,
                    official_email: OFFICIAL_EMAIL,
                    error: "Invalid fibonacci input. Must be a non-negative integer."
                });
            }
            return res.status(200).json({
                is_success: true,
                official_email: OFFICIAL_EMAIL,
                data: fibonacci(n)
            });
        }
        
        // Handle prime
        if (body.prime !== undefined) {
            const arr = body.prime;
            if (!Array.isArray(arr) || !arr.every(n => Number.isInteger(n))) {
                return res.status(400).json({
                    is_success: false,
                    official_email: OFFICIAL_EMAIL,
                    error: "Invalid prime input. Must be an array of integers."
                });
            }
            return res.status(200).json({
                is_success: true,
                official_email: OFFICIAL_EMAIL,
                data: filterPrimes(arr)
            });
        }
        
        // Handle lcm
        if (body.lcm !== undefined) {
            const arr = body.lcm;
            if (!Array.isArray(arr) || !arr.every(n => Number.isInteger(n)) || arr.length === 0) {
                return res.status(400).json({
                    is_success: false,
                    official_email: OFFICIAL_EMAIL,
                    error: "Invalid lcm input. Must be a non-empty array of integers."
                });
            }
            return res.status(200).json({
                is_success: true,
                official_email: OFFICIAL_EMAIL,
                data: lcm(arr)
            });
        }
        
        // Handle hcf
        if (body.hcf !== undefined) {
            const arr = body.hcf;
            if (!Array.isArray(arr) || !arr.every(n => Number.isInteger(n)) || arr.length === 0) {
                return res.status(400).json({
                    is_success: false,
                    official_email: OFFICIAL_EMAIL,
                    error: "Invalid hcf input. Must be a non-empty array of integers."
                });
            }
            return res.status(200).json({
                is_success: true,
                official_email: OFFICIAL_EMAIL,
                data: hcf(arr)
            });
        }
        
        // Handle AI
        if (body.AI !== undefined) {
            const question = body.AI;
            if (typeof question !== 'string' || question.trim() === '') {
                return res.status(400).json({
                    is_success: false,
                    official_email: OFFICIAL_EMAIL,
                    error: "Invalid AI input. Must be a non-empty string."
                });
            }
            const answer = await getAIResponse(question);
            return res.status(200).json({
                is_success: true,
                official_email: OFFICIAL_EMAIL,
                data: answer
            });
        }
        
        // No valid key found
        return res.status(400).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            error: "Invalid request. Must contain one of: fibonacci, prime, lcm, hcf, AI"
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            error: "Internal server error"
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: "BFHL API is running",
        endpoints: {
            health: "GET /health",
            bfhl: "POST /bfhl"
        }
    });
});

// For local development
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
