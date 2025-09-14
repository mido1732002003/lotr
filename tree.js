// path: tree.js
/**
 * Create the specified project tree with **empty files** in the CURRENT directory.
 * Usage:
 *   node tree.js            # create missing dirs/files, skip existing
 *   node tree.js --force    # overwrite existing files with empty content
 *   node tree.js --dry-run  # show what would be created/overwritten
 */
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const DRY_RUN = args.has("--dry-run");

// Explicit directories to ensure exist (mirrors your tree)
const EMPTY_DIRS = [
  ".github/workflows",
  ".vscode",
  "docker/postgres",
  "prisma/migrations",
  "prisma",
  "public",
  "src/app/[locale]/admin",
  "src/app/[locale]",
  "src/app/api/payments/create-checkout",
  "src/app/api/payments/webhook",
  "src/app/api/draws/run",
  "src/app/api/payouts/record",
  "src/app",
  "src/components/ui",
  "src/components/layout",
  "src/components/lottery",
  "src/components/admin",
  "src/lib/db",
  "src/lib/payment/adapters",
  "src/lib/payment",
  "src/lib/lottery",
  "src/lib/auth",
  "src/lib/email",
  "src/lib/utils",
  "src/lib/validation",
  "src/messages",
  "tests/unit",
  "tests/integration",
  "docs",
];

// Exact files to create (all zero-byte)
const FILES = [
  ".github/workflows/ci.yml",
  ".vscode/settings.json",
  "docker/postgres/init.sql",
  "prisma/schema.prisma",
  "prisma/seed.ts",
  "public/favicon.ico",
  "public/robots.txt",
  "src/app/[locale]/admin/page.tsx",
  "src/app/[locale]/admin/layout.tsx",
  "src/app/[locale]/layout.tsx",
  "src/app/[locale]/page.tsx",
  "src/app/[locale]/not-found.tsx",
  "src/app/api/payments/create-checkout/route.ts",
  "src/app/api/payments/webhook/route.ts",
  "src/app/api/draws/run/route.ts",
  "src/app/api/payouts/record/route.ts",
  "src/app/layout.tsx",
  "src/app/globals.css",
  "src/components/ui/button.tsx",
  "src/components/ui/card.tsx",
  "src/components/ui/input.tsx",
  "src/components/ui/label.tsx",
  "src/components/ui/select.tsx",
  "src/components/layout/header.tsx",
  "src/components/layout/footer.tsx",
  "src/components/layout/language-switcher.tsx",
  "src/components/lottery/ticket-purchase.tsx",
  "src/components/lottery/draw-info.tsx",
  "src/components/lottery/recent-winners.tsx",
  "src/components/admin/tickets-table.tsx",
  "src/components/admin/draw-trigger.tsx",
  "src/components/admin/payout-recorder.tsx",
  "src/components/admin/audit-trail.tsx",
  "src/lib/db/prisma.ts",
  "src/lib/db/queries.ts",
  "src/lib/payment/types.ts",
  "src/lib/payment/adapter.interface.ts",
  "src/lib/payment/adapters/coinbase-commerce.adapter.ts",
  "src/lib/payment/adapters/nowpayments.adapter.ts",
  "src/lib/payment/payment.service.ts",
  "src/lib/lottery/draw.service.ts",
  "src/lib/lottery/ticket.service.ts",
  "src/lib/lottery/fairness.ts",
  "src/lib/lottery/anchor-provider.ts",
  "src/lib/auth/admin.ts",
  "src/lib/email/templates.ts",
  "src/lib/email/sender.ts",
  "src/lib/utils/crypto.ts",
  "src/lib/utils/formatting.ts",
  "src/lib/utils/rate-limit.ts",
  "src/lib/validation/payment.schema.ts",
  "src/lib/validation/draw.schema.ts",
  "src/lib/validation/common.schema.ts",
  "src/middleware.ts",
  "src/i18n.ts",
  "src/messages/en.json",
  "src/messages/ar.json",
  "tests/unit/fairness.test.ts",
  "tests/unit/payment.test.ts",
  "tests/integration/api.test.ts",
  "docs/architecture.md",
  ".dockerignore",
  ".env.example",
  ".eslintrc.json",
  ".gitignore",
  ".prettierrc",
  "docker-compose.yml",
  "Dockerfile",
  "next-env.d.ts",
  "next.config.js",
  "package.json",
  "pnpm-lock.yaml",
  "postcss.config.js",
  "README.md",
  "tailwind.config.ts",
  "tsconfig.json",
];

function emptyContent(filePath) {
  // Use a zero-byte Buffer for binary-like files; empty string for others
  if (path.extname(filePath).toLowerCase() === ".ico") {
    return Buffer.alloc(0);
  }
  return "";
}

async function ensureDir(dir) {
  if (DRY_RUN) {
    console.log(`[dir]   ${dir}`);
    return;
  }
  await fsp.mkdir(dir, { recursive: true });
}

async function writeEmptyFile(fp) {
  const dir = path.dirname(fp);
  await ensureDir(dir);

  const exists = fs.existsSync(fp);
  if (exists && !FORCE) {
    console.log(`[skip]  ${fp} (exists)`);
    return;
  }
  if (DRY_RUN) {
    console.log(`[file]  ${fp}${exists ? " (overwrite)" : ""}`);
    return;
  }

  const content = emptyContent(fp);
  await fsp.writeFile(fp, content);
  console.log(`[write] ${fp}`);
}

async function main() {
  console.log(`Creating EMPTY project tree in: ${process.cwd()}`);
  if (DRY_RUN) console.log("(dry run)");

  // Create all directories explicitly
  for (const d of EMPTY_DIRS) {
    await ensureDir(d);
  }

  // Create all files as empty
  for (const f of FILES) {
    await writeEmptyFile(f);
  }

  console.log(`\nDone. ${FILES.length} files and ${EMPTY_DIRS.length} directories ensured.`);
  if (!FORCE) console.log("Note: existing files were not modified. Use --force to blank them.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
