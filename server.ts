import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// JUDGE0 CONFIG
const JUDGE0_URL = 'http://172.20.0.10:2358';

// RATE LIMITER
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per `window` (here, per 1 minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { status: 'Error', output: 'Too many requests, please try again later.', results: [] }
});

app.use(cors());
app.use(bodyParser.json());
// Apply rate limiter to all api routes
app.use('/api/', limiter);

// Ensure uploads/buckets directory exists
const uploadDir = path.join(__dirname, 'uploads');
const BUCKET_DIR = path.join(__dirname, 'documentation_bucket');

async function ensureDirs() {
    try {
        await fs.promises.mkdir(uploadDir, { recursive: true });
        await fs.promises.mkdir(BUCKET_DIR, { recursive: true });
    } catch (e) {
        console.error("Error creating directories:", e);
    }
}
ensureDirs();

// Helper to save to Local Bucket (Async)
async function saveToBucket(teamName: string, problemId: string, language: string, code: string) {
    try {
        // Sanitize team name for folder safety
        const safeTeamName = teamName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const candidateFolder = path.join(BUCKET_DIR, safeTeamName);

        await fs.promises.mkdir(candidateFolder, { recursive: true });

        const ext = language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'txt';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${problemId}_${timestamp}.${ext}`;
        const filePath = path.join(candidateFolder, filename);

        await fs.promises.writeFile(filePath, code);
        return filename;
    } catch (err) {
        console.error("Bucket Error:", err);
        return "error_saving";
    }
}

interface TestCase {
    input: string;
    expected: string;
    hidden: boolean;
    params: {
        nums: number[];
        target: number;
    };
}

interface Problem {
    id: string;
    title: string;
    testCases: TestCase[];
    functionName: string;
}

// Problem Registry
const PROBLEMS: Record<string, Problem> = {
    'two-sum': {
        id: 'two-sum',
        title: 'Two Sum',
        testCases: [
            // Visible
            { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", hidden: false, params: { nums: [2, 7, 11, 15], target: 9 } },
            { input: "nums = [3,2,4], target = 6", expected: "[1,2]", hidden: false, params: { nums: [3, 2, 4], target: 6 } },
            { input: "nums = [-3,4,3,90], target = 0", expected: "[0,2]", hidden: false, params: { nums: [-3, 4, 3, 90], target: 0 } },

            // Hidden - Edge
            { input: "nums = [1,1,1,2,3], target = 2", expected: "[0,1]", hidden: true, params: { nums: [1, 1, 1, 2, 3], target: 2 } },
            { input: "nums = [-10,-20,30,40], target = 20", expected: "[1,2]", hidden: true, params: { nums: [-10, -20, 30, 40], target: 20 } },

            // Hidden - Random shaped
            {
                input: "nums = random(200), target = dynamic",
                expected: "dynamic",
                hidden: true,
                params: (() => {
                    const nums = Array.from({ length: 200 }, () => Math.floor(Math.random() * 2000 - 1000));
                    const i = 50, j = 150;
                    return { nums, target: nums[i] + nums[j], answer: [i, j] };
                })()
            },

            // Hidden - Large Benchmark
            {
                input: "nums = large(100000), target = lastPair",
                expected: "dynamic",
                hidden: true,
                params: (() => {
                    const nums = Array.from({ length: 100000 }, (_, i) => i * 2);
                    const a = 88888, b = 99999;
                    return { nums, target: nums[a] + nums[b], answer: [a, b] };
                })()
            }
        ],
        functionName: 'twoSum'
    },

    'binary-search': {
        id: 'binary-search',
        title: 'Binary Search',
        testCases: [
            // Visible
            { input: "nums = [-1,0,3,5,9,12], target = 9", expected: "4", hidden: false, params: { nums: [-1, 0, 3, 5, 9, 12], target: 9 } },
            { input: "nums = [-1,0,3,5,9,12], target = 2", expected: "-1", hidden: false, params: { nums: [-1, 0, 3, 5, 9, 12], target: 2 } },
            { input: "nums = [1,3,5,7,9], target = 1", expected: "0", hidden: false, params: { nums: [1, 3, 5, 7, 9], target: 1 } },

            // Hidden - Edge
            { input: "nums = [5], target = 5", expected: "0", hidden: true, params: { nums: [5], target: 5 } },
            { input: "nums = [5], target = 1", expected: "-1", hidden: true, params: { nums: [5], target: 1 } },

            // Hidden - Gapped values
            { input: "nums = [-1000,-500,-10,0,9,100,1000], target = 100", expected: "5", hidden: true, params: { nums: [-1000, -500, -10, 0, 9, 100, 1000], target: 100 } },

            // Hidden - Large Benchmark
            {
                input: "nums = sorted(200000), target = randomHit",
                expected: "dynamic",
                hidden: true,
                params: (() => {
                    const nums = Array.from({ length: 200000 }, (_, i) => i * 3 - 100000);
                    const idx = 150321;
                    return { nums, target: nums[idx], answer: idx };
                })()
            }
        ],
        functionName: 'search'
    }
};


const JUDGE0_LANG_IDS: Record<string, number> = {
    'javascript': 63,
    'typescript': 74,
    'python': 71,
    'java': 62,
    'cpp': 54,
    'c': 50
};

function validateCode(code: string, language: string): boolean {
    if (!code || code.trim().length < 1) return false;

    // Basic Sanitizer: Check for forbidden strings
    const forbidden = ['process.exit', 'exec(', 'spawn(', 'os.system', 'eval(', '__import__', 'system('];
    if (forbidden.some(f => code.includes(f))) return false;

    return true;
}


// Template Cache
const TEMPLATES: Record<string, string> = {};

async function loadTemplates() {
    const langs = ['javascript', 'typescript', 'python', 'java', 'cpp', 'c'];
    for (const lang of langs) {
        try {
            const templatePath = path.join(__dirname, 'templates', `${lang}.txt`);
            TEMPLATES[lang] = await fs.promises.readFile(templatePath, 'utf-8');
        } catch (e) {
            console.error(`Failed to load template for ${lang}:`, e);
        }
    }
}
loadTemplates();

function wrapCode(code: string, language: string, problem: Problem): string {
    const template = TEMPLATES[language];
    if (!template) {
        console.error(`Template not found for ${language}`);
        return code;
    }

    const testCasesJSON = JSON.stringify(problem.testCases.map((tc) => tc.params));
    let wrapped = template
        .replace('{{USER_CODE}}', code)
        .replace('{{FUNCTION_NAME}}', problem.functionName)
        .replace('{{TEST_CASES_JSON}}', testCasesJSON);

    // Special handling for Compiled Languages (C/C++/Java require static Test Runners)
    if (language === 'java') {
        const sanitizedCode = code.replace(/public\s+class\s+Solution/, 'class Solution');
        wrapped = wrapped.replace('{{USER_CODE}}', sanitizedCode);

        let runnerCode = "";
        if (problem.id === 'two-sum') {
            runnerCode = `
            int[] r1 = sol.twoSum(new int[]{2,7,11,15}, 9);
            System.out.println("Test Case 1: " + Arrays.toString(r1).replaceAll(" ", ""));
            int[] r2 = sol.twoSum(new int[]{3,2,4}, 6);
            System.out.println("Test Case 2: " + Arrays.toString(r2).replaceAll(" ", ""));
            // Empty Case (Handling carefully as 0,1 is expected for this specific trick case)
            try {
                int[] r3 = sol.twoSum(new int[]{}, -1);
                System.out.println("Test Case 3: " + Arrays.toString(r3).replaceAll(" ", "")); 
            } catch (Exception e) { System.out.println("Test Case 3: Error"); }
             `;
        } else {
            runnerCode = `
            int r1 = sol.search(new int[]{-1,0,3,5,9,12}, 9);
            System.out.println("Test Case 1: " + r1);
            int r2 = sol.search(new int[]{-1,0,3,5,9,12}, 2);
            System.out.println("Test Case 2: " + r2);
            int r3 = sol.search(new int[]{5}, 5);
            System.out.println("Test Case 3: " + r3);
             `;
        }
        wrapped = wrapped.replace('{{TEST_RUNNER}}', runnerCode);
    } else if (language === 'cpp') {
        let runnerCode = "";
        if (problem.id === 'two-sum') {
            runnerCode = `
            try {
                vector<int> res1 = sol.twoSum({2,7,11,15}, 9);
                cout << "Test Case 1: "; printVector(res1); cout << endl;
                vector<int> res2 = sol.twoSum({3,2,4}, 6);
                cout << "Test Case 2: "; printVector(res2); cout << endl;
                vector<int> res3 = sol.twoSum({}, -1);
                cout << "Test Case 3: "; printVector(res3); cout << endl;
            } catch (...) { cout << "Test Case 3: Error" << endl; }
             `;
        } else {
            runnerCode = `
            try {
                int r1 = sol.search({-1,0,3,5,9,12}, 9);
                cout << "Test Case 1: " << r1 << endl;
                int r2 = sol.search({-1,0,3,5,9,12}, 2);
                cout << "Test Case 2: " << r2 << endl;
                int r3 = sol.search({5}, 5);
                cout << "Test Case 3: " << r3 << endl;
            } catch (...) { cout << "Error" << endl; }
             `;
        }
        wrapped = wrapped.replace('{{TEST_RUNNER}}', runnerCode);
    } else if (language === 'c') {
        let runnerCode = "";
        if (problem.id === 'two-sum') {
            // C requires explicit array passing and size
            runnerCode = `
            int returnSize;
            int nums1[] = {2,7,11,15};
            int* r1 = twoSum(nums1, 4, 9, &returnSize);
            printf("Test Case 1: "); printArray(r1, returnSize); printf("\\n");
            
            int nums2[] = {3,2,4};
            int* r2 = twoSum(nums2, 3, 6, &returnSize);
            printf("Test Case 2: "); printArray(r2, returnSize); printf("\\n");

            int nums3[] = {};
            int* r3 = twoSum(nums3, 0, -1, &returnSize);
            printf("Test Case 3: "); printArray(r3, returnSize); printf("\\n");
            `;
        } else {
            runnerCode = `
            int nums1[] = {-1,0,3,5,9,12};
            int r1 = search(nums1, 6, 9);
            printf("Test Case 1: %d\\n", r1);

            int nums2[] = {-1,0,3,5,9,12};
            int r2 = search(nums2, 6, 2);
            printf("Test Case 2: %d\\n", r2);

            int nums3[] = {5};
            int r3 = search(nums3, 1, 5);
            printf("Test Case 3: %d\\n", r3);
            `;
        }
        wrapped = wrapped.replace('{{TEST_RUNNER}}', runnerCode);
    }

    return wrapped;
}

app.post('/api/execute', async (req: express.Request, res: express.Response) => {
    const { code, language, problemId, teamName, isSubmission } = req.body;
    console.log(`[EXECUTE] Request received for ${problemId || 'unknown'} in ${language} (Submission: ${isSubmission})`);

    const problem = PROBLEMS[problemId] || PROBLEMS['two-sum'];

    if (!validateCode(code, language)) {
        return res.status(400).json({ status: 'Invalid', output: 'Code validation failed: Restricted content detected.', results: [] });
    }

    let savedFile = null;
    if (isSubmission) {
        // Persistence: Save to local bucket ONLY on submit
        savedFile = await saveToBucket(teamName || "anonymous", problemId || "two-sum", language, code);
    }
    // If not submission, we DO NOT write to disk (as requested: "Run Code -> No Persistence")

    const wrappedCode = wrapCode(code, language, problem);
    const judge0Id = JUDGE0_LANG_IDS[language];

    if (!judge0Id) {
        return res.status(400).json({ status: 'Error', output: 'Unsupported Language', results: [] });
    }

    try {
        const payload = {
            source_code: Buffer.from(wrappedCode).toString('base64'),
            language_id: judge0Id,
            stdin: Buffer.from("").toString('base64')
        };

        console.log(`[JUDGE0] Sending to ${JUDGE0_URL}... LangID: ${judge0Id}`);

        // Send to Judge0
        const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Judge0 responded with status: ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        console.log(`[JUDGE0] Response received. Status ID: ${data.status?.id} (${data.status?.description})`);

        // Check for Compile Error
        if (data.status.id === 6) {
            const compileOutput = Buffer.from(data.compile_output || "", 'base64').toString('utf-8');
            console.log(`[JUDGE0] Compilation Error: ${compileOutput}`);
            return res.json({
                status: 'Compilation Error',
                output: compileOutput,
                results: [],
                metrics: { time: 0 },
                score: 0,
                documentation: savedFile
            });
        }

        // Runtime Error check from stderr
        if (!data.stdout && data.stderr) {
            const stderr = Buffer.from(data.stderr, 'base64').toString('utf-8');
            console.log(`[JUDGE0] Stderr: ${stderr}`);
            return res.json({
                status: 'Runtime Error',
                output: stderr,
                results: [],
                metrics: { time: 0 },
                score: 0,
                documentation: savedFile
            });
        }

        // Success (potentially)
        const outputString = data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf-8') : "";
        console.log(`[JUDGE0] Stdout Preview: ${outputString.substring(0, 100)}...`);

        // Extract Time Metric
        const timeMatch = outputString.match(/METRICS: TIME=([\d.]+)ms/);
        const runTime = timeMatch ? parseFloat(timeMatch[1]) : (parseFloat(data.time) * 1000 || 0);

        // Parse Results & Scoring
        let passedCount = 0;
        const finalResults = problem.testCases.map((tc: TestCase, index: number) => {
            const searchStr = `Test Case ${index + 1}: `;
            const line = outputString.split('\n').find((l: string) => l.includes(searchStr));

            // Default to Error if not found
            if (!line) return { ...tc, actual: "No Output", status: "Runtime Error" };

            const actual = line.replace(searchStr, '').trim();
            const normalize = (s: string) => s.replace(/\s+/g, '');

            // Loose comparison (remove spaces)
            const passed = normalize(actual) === normalize(tc.expected);

            if (passed) passedCount++;

            if (tc.hidden) {
                return {
                    ...tc,
                    input: "Hidden",
                    expected: "Hidden",
                    actual: passed ? "Hidden" : "Hidden",
                    status: passed ? "Accepted" : "Wrong Answer"
                };
            }

            return {
                ...tc,
                actual,
                status: passed ? "Accepted" : "Wrong Answer"
            };
        });

        const score = ((passedCount / problem.testCases.length) * 100).toFixed(2);
        const finalStatus = finalResults.every((r: any) => r.status === 'Accepted') ? 'Accepted' : 'Wrong Answer';

        res.json({
            status: finalStatus,
            output: outputString.replace(/METRICS:.*\n?/, ''),
            results: finalResults,
            metrics: {
                time: runTime
            },
            score,
            documentation: savedFile
        });

    } catch (error: any) {
        console.error("Judge0 Error:", error);
        res.status(500).json({ status: 'Error', output: `Judge0 Connection Failed: ${error.message}. Is Judge0 running on port 2358?`, results: [] });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Using Judge0 at ${JUDGE0_URL}`);
    console.log(`📁 Bucket: ${BUCKET_DIR}`);
});