# 🔧 Technical Challenges & Solutions

Here are the key technical challenges I faced and solved during the FixItNow project:

---

## 📋 1. Prisma Deployment Issue (Vercel/Render)

**Problem:**  
Prisma Client wasn't being generated during the build process on Vercel and Render. The server would crash with:

```text
Error: @prisma/client did not initialize yet

Solution:
Added a pre-build script that runs prisma generate before TypeScript compilation.

package.json:









Vercel Deployment Issue Summary (FixItNow Backend)
Initial Problem

The Express backend worked locally and on Render but failed to deploy on Vercel with errors such as:

TS1259 (default import issues)
Cannot find module
RollupError: [plugin dts]
Build output contains no "functions" or "static" directory
Investigation Process
1. Verified dependencies

Confirmed required packages were installed:

helmet
http-status-codes
cookie-parser

So the issue wasn't missing packages.

2. Checked TypeScript configuration

Verified tsconfig.json already contained:

esModuleInterop: true
allowSyntheticDefaultImports: true

Therefore the TS1259 errors were symptoms rather than the root cause.

3. Verified project structure

Checked:

middlewares/index.ts
swagger
imports
Express application structure

All imports were correct.

4. Identified the real deployment issue

The Vercel logs showed:

RollupError
plugin dts

which indicated the build process was using tsup, not just the TypeScript compiler.

After reviewing the build configuration, the focus shifted from TypeScript to Vercel's deployment model.

5. Removed the old deployment configuration

Deleted the legacy vercel.json.

The previous configuration expected a traditional Node server and prevented Vercel from detecting Serverless Functions correctly.

6. Adapted the project for Vercel

Created:

api/index.ts

and exported the Express app:

import app from "../src/app";

export default app;

This allowed Vercel to treat the Express application as a Serverless Function.

7. Fixed the missing export

Initially api/index.ts only imported the app:

import app from "../src/app";

Adding

export default app;

resolved the final deployment issue.

Final Architecture
api/
   index.ts

src/
   app.ts
   server.ts
server.ts → Local development (app.listen())
api/index.ts → Vercel Serverless entry point
app.ts → Shared Express application
Key Lessons Learned
Render and Vercel use different deployment models for Express applications.
Vercel requires a Serverless Function entry point rather than a standalone Express server.
Deployment issues often stem from configuration rather than application code.
Debugging systematically—checking dependencies, TypeScript settings, project structure, and deployment configuration one step at a time—helps isolate the real cause instead of chasing misleading error messages.
