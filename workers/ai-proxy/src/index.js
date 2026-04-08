const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";
const MAX_PROMPT_CHARS = 4000;
const MAX_OUTPUT_TOKENS = 700;

const PORTFOLIO_CONTEXT = [
  "Name: Zach Davis.",
  "Positioning: AI Engineer, Platform Engineer, and Cloud Architect.",
  "Experience: 16+ years across infrastructure, platform engineering, distributed systems, cloud architecture, Kubernetes, AI infrastructure, Infrastructure as Code, CI/CD, and GitOps.",
  "Current focus: architecting and operating platforms across AWS and hybrid environments using Terraform, Kubernetes, CI/CD pipelines, and internal developer platforms.",
  "AI work: designing GPU-backed environments with NVIDIA DGX systems, optimizing LLM inference workloads, and building hybrid local/cloud execution architectures.",
  "Core technologies named on the site: AWS, Azure, EKS, ECS, Docker, ECR, Lambda, Terraform, Terragrunt, Ansible, CloudFormation, VMware, OpenZFS, Talos Linux, k3s, RHEL, Windows Server, Ubuntu, Debian, Fedora, Rocky Linux, NVIDIA DGX, AI Workbench, LM Studio, GitHub, GitHub Actions, GitLab CI, Azure DevOps, Prometheus, Grafana, Alertmanager, Active Directory, Azure Entra, Okta, OpenShift, Helm, PowerShell, Bash, JavaScript, Python, YAML, JSON.",
  "Strengths emphasized on the site: AI and ML infrastructure, cloud and distributed systems, platform engineering, infrastructure as code, CI/CD and GitOps, containers and orchestration, observability, and security/compliance.",
  "Intent for answers: practical, concise, technically credible, and aligned with enterprise platform and AI delivery work.",
].join("\n");

const MODE_PROMPTS = {
  portfolio:
    "You are the interactive AI guide for Zach Davis's portfolio website. Use only the supplied portfolio context for claims about Zach's background, experience, and focus areas. If the site does not support a detail, say that directly instead of inventing it. Keep answers concise, concrete, and useful for a recruiter, hiring manager, or technical leader.",
  platform:
    "You are a platform and AI infrastructure strategist reflecting the operating style presented on Zach Davis's portfolio. Use the portfolio context to shape your tone and examples, but answer the user's technical request directly. Prioritize phased plans, architecture tradeoffs, delivery realism, and enterprise constraints. Keep answers concise and implementation-minded.",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = buildCorsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (!isAllowedOrigin(origin, env)) {
      return json(
        { error: { message: "Origin not allowed." } },
        403,
        corsHeaders,
      );
    }

    if (url.pathname === "/v1/models" && request.method === "GET") {
      return handleModels(env, ctx, corsHeaders);
    }

    if (url.pathname === "/v1/chat/completions" && request.method === "POST") {
      return handleChatCompletions(request, env, corsHeaders);
    }

    return json({ error: { message: "Not found." } }, 404, corsHeaders);
  },
};

async function handleModels(env, ctx, corsHeaders) {
  const cache = caches.default;
  const cacheKey = new Request("https://zachdavis-ai-proxy.internal/v1/models");
  const cached = await cache.match(cacheKey);
  if (cached) {
    return withCors(cached, corsHeaders);
  }

  const upstream = await fetch(`${OPENROUTER_API_BASE}/models`, {
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await parseJson(upstream);
  if (!upstream.ok) {
    return json(
      { error: { message: upstreamError(payload, "Could not load models.") } },
      upstream.status,
      corsHeaders,
    );
  }

  const models = getFreeTextModels(payload.data || []).slice(0, 18);
  const response = json(
    {
      data: models.map((model) => ({
        id: model.id,
        name: model.name || model.id,
        context_length: model.context_length || null,
      })),
    },
    200,
    {
      ...corsHeaders,
      "Cache-Control": "public, max-age=3600",
    },
  );

  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

async function handleChatCompletions(request, env, corsHeaders) {
  if (!env.OPENROUTER_API_KEY) {
    return json(
      { error: { message: "OPENROUTER_API_KEY is not configured." } },
      500,
      corsHeaders,
    );
  }

  const body = await safeReadJson(request);
  if (!body) {
    return json(
      { error: { message: "Request body must be valid JSON." } },
      400,
      corsHeaders,
    );
  }

  const mode = body.mode === "platform" ? "platform" : "portfolio";
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const model = typeof body.model === "string" ? body.model.trim() : "openrouter/free";

  if (!prompt) {
    return json(
      { error: { message: "Prompt is required." } },
      400,
      corsHeaders,
    );
  }

  if (prompt.length > MAX_PROMPT_CHARS) {
    return json(
      { error: { message: `Prompt exceeds ${MAX_PROMPT_CHARS} characters.` } },
      400,
      corsHeaders,
    );
  }

  if (!(await isAllowedModel(model))) {
    return json(
      { error: { message: "Model is not allowed by this proxy." } },
      400,
      corsHeaders,
    );
  }

  const upstream = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.PUBLIC_SITE_URL || "https://zachdavis.org",
      "X-Title": env.SITE_TITLE || "Zach Davis Portfolio AI Lab",
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        {
          role: "system",
          content: `${MODE_PROMPTS[mode]}\n\nPortfolio context:\n${PORTFOLIO_CONTEXT}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const payload = await parseJson(upstream);
  if (!upstream.ok) {
    return json(
      { error: { message: upstreamError(payload, "Upstream model request failed.") } },
      upstream.status,
      corsHeaders,
    );
  }

  return json(payload, 200, corsHeaders);
}

function buildCorsHeaders(origin, env) {
  const allowedOrigin = isAllowedOrigin(origin, env) ? origin : firstAllowedOrigin(env);
  return {
    "Access-Control-Allow-Origin": allowedOrigin || "https://zachdavis.org",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function withCors(response, corsHeaders) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function firstAllowedOrigin(env) {
  return getAllowedOrigins(env)[0] || "";
}

function isAllowedOrigin(origin, env) {
  if (!origin) return true;
  return getAllowedOrigins(env).includes(origin);
}

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function isAllowedModel(model) {
  if (model === "openrouter/free") return true;

  const upstream = await fetch(`${OPENROUTER_API_BASE}/models`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!upstream.ok) return false;
  const payload = await parseJson(upstream);
  const freeIds = getFreeTextModels(payload.data || []).map((item) => item.id);
  return freeIds.includes(model);
}

function getFreeTextModels(models) {
  return models
    .filter((model) => {
      const pricing = model.pricing || {};
      const architecture = model.architecture || {};
      const outputModalities = architecture.output_modalities || [];

      return (
        pricing.prompt === "0" &&
        pricing.completion === "0" &&
        outputModalities.includes("text")
      );
    })
    .sort((left, right) => {
      return String(left.name || left.id).localeCompare(String(right.name || right.id));
    });
}

async function safeReadJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function upstreamError(payload, fallback) {
  if (payload && payload.error && payload.error.message) return payload.error.message;
  if (payload && payload.message) return payload.message;
  return fallback;
}

function json(payload, status, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}
