/**
 * ===================================================================
 * cy-fast.js v1.0.0 | Mihomo 极速零阻塞防封全局覆写脚本
 * 作者：ChungyuCheung
 * 更新时间：2026-11-28 00:05 UTC+8
 * 适用客户端：Bettbox / Clash Verge Rev / Mihomo Party / FlClash 等
 * 适用策略：中国与自定义内网域名直连 + 其余域名直传节点远端解析（零本地 DNS 阻塞）
 * 核心优化：全量 IP 规则强制 no-resolve / 前置 AI 与海外 .mrs 二进制规则集 / 海外 DoH 显式走代理
 * 仓库地址：https://github.com/ChungyuCheung/proxy-minimal
 * ===================================================================
 */

// ==================== 用户自定义区 ====================
const USER_CONFIG = {
  // 1. 需要使用 DHCP 下发系统 DNS 解析并直连的内网域名
  internalDomains: [
    "+.huitone.com",
    "+.lan",
    "+.local",
    "+.internal",
    "+.home.arpa"
  ],

  // 2. 内网私有网段（强制直连，不走代理）
  internalCidrs: [
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "100.64.0.0/10",
    "127.0.0.0/8",
    "169.254.0.0/16"
  ],

  // 3. GitHub 加速前缀（直连或开启代理更新正常则留空）
  ghProxy: ""
};
// ======================================================

// AI 全链路、前端静态资源、人机验证与支付风控置顶后缀（确保全链路同一纯净出口，零漏网直连）
const AI_AND_AUTH_SUFFIXES = [
  // OpenAI / ChatGPT 全栈及静态资源、灰度验证域
  "chatgpt.com",
  "openai.com",
  "oaistatic.com",
  "oaiusercontent.com",
  "sora.com",
  "chat.com",
  "ai.com",
  "featuregates.org",
  "statsigapi.net",
  "statsig.com",
  "arkoselabs.com",
  "funcaptcha.com",
  "auth0.com",
  "openaiapi-site.azureedge.net",
  // Anthropic / Claude
  "claude.ai",
  "claude.com",
  "anthropic.com",
  "claudeusercontent.com",
  "clau.de",
  "ant.dev",
  "modelcontextprotocol.io",
  // Google / Gemini / DeepMind / Antigravity / YouTube
  "gemini.google.com",
  "gemini.google",
  "aistudio.google.com",
  "notebooklm.google.com",
  "notebooklm.google",
  "deepmind.google",
  "deepmind.com",
  "antigravity.google",
  "antigravity-unleash.goog",
  "generativelanguage.googleapis.com",
  "google.com",
  "googleapis.com",
  "gstatic.com",
  "googleusercontent.com",
  "ggpht.com",
  "youtube.com",
  "youtu.be",
  "ytimg.com",
  "googlevideo.com",
  "gmail.com",
  "googlemail.com",
  // 其他主流 AI 与开发者平台
  "x.ai",
  "grok.com",
  "perplexity.ai",
  "cursor.com",
  "cursor.sh",
  "cursorapi.com",
  "windsurf.com",
  "codeium.com",
  "copilot.cloud.microsoft",
  "githubcopilot.com",
  "openrouter.ai",
  "mistral.ai",
  "huggingface.co",
  "hf.co",
  "github.com",
  "githubusercontent.com",
  "githubassets.com",
  // 人机验证与支付风控
  "challenges.cloudflare.com",
  "hcaptcha.com",
  "recaptcha.net",
  "stripe.com",
  "stripe.network",
  "stripecdn.com",
  "paypal.com",
  "paypalobjects.com",
  "withpersona.com",
  "siftscience.com",
  "intercom.io",
  "intercomcdn.com",
  "sentry.io",
  "datadoghq.com",
  "browser-intake-datadoghq.com"
];

function main(config) {
  if (!config || typeof config !== "object") return config;

  // 全局关闭 IPv6，防止 IPv6 绕行泄露真实地址
  config.ipv6 = false;

  const proxies = Array.isArray(config.proxies) ? config.proxies : [];
  const allProxyNames = proxies.map((p) => p.name).filter(Boolean);

  // 过滤港/澳/中/俄及机场提示信息节点，防止误选触发 AI 服务风控封号
  const excludeRegex = /香港|HK|Hong\s?Kong|澳门|澳門|MO|Macau|中国|中國|CN|China|俄罗斯|俄羅斯|RU|Russia|剩余|剩餘|到期|官网|官網|重置|流量|套餐|邀请|邀請|公告|客服|订阅|訂閱/i;
  let cleanProxies = allProxyNames.filter((name) => !excludeRegex.test(name));
  if (cleanProxies.length === 0) {
    cleanProxies = allProxyNames.length > 0 ? allProxyNames : ["DIRECT"];
  }

  // 1. 极简单一固定出口组：仅保留 1 个手动 select 组 Proxy（严禁 url-test 自动测速切换 IP）
  config["proxy-groups"] = [
    {
      name: "Proxy",
      type: "select",
      proxies: cleanProxies
    }
  ];

  // 2. 极速防泄露 DNS：Fake-IP 0ms 秒回 + 直连/内网域名锁定系统 DHCP DNS + 海外 DoH 显式走代理
  const nameserverPolicy = {
    "rule-set:private_domain": "system",
    "rule-set:cn_domain": ["system", "223.5.5.5"]
  };
  USER_CONFIG.internalDomains.forEach((domain) => {
    nameserverPolicy[domain] = "system";
  });

  config.dns = {
    enable: true,
    ipv6: false,
    "use-system-hosts": true,
    "cache-algorithm": "arc",
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "respect-rules": false,
    "fake-ip-filter": [
      ...USER_CONFIG.internalDomains,
      "localhost",
      "+.lan",
      "+.local",
      "+.internal",
      "+.home.arpa",
      "localhost.ptlogin2.qq.com",
      "+.msftconnecttest.com",
      "+.msftncsi.com",
      "ntp.*.com",
      "time.*.com"
    ],
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "proxy-server-nameserver": ["system", "223.5.5.5", "119.29.29.29"],
    "direct-nameserver": ["system", "223.5.5.5"],
    nameserver: [
      "https://1.1.1.1/dns-query#Proxy",
      "https://8.8.8.8/dns-query#Proxy"
    ],
    "nameserver-policy": nameserverPolicy
  };

  // 3. 每日自动更新的 MetaCubeX 官方 .mrs 二进制规则集（微秒级匹配、极低内存占用）
  const prefix = USER_CONFIG.ghProxy;
  const mrsCommon = {
    type: "http",
    format: "mrs",
    interval: 86400,
    proxy: "Proxy"
  };

  config["rule-providers"] = {
    private_domain: {
      ...mrsCommon,
      behavior: "domain",
      url: `${prefix}https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.mrs`,
      path: "./ruleset/private_domain.mrs"
    },
    private_ip: {
      ...mrsCommon,
      behavior: "ipcidr",
      url: `${prefix}https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/private.mrs`,
      path: "./ruleset/private_ip.mrs"
    },
    ai_domain: {
      ...mrsCommon,
      behavior: "domain",
      url: `${prefix}https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-ai-!cn.mrs`,
      path: "./ruleset/ai_domain.mrs"
    },
    proxy_domain: {
      ...mrsCommon,
      behavior: "domain",
      url: `${prefix}https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/geolocation-!cn.mrs`,
      path: "./ruleset/proxy_domain.mrs"
    },
    cn_domain: {
      ...mrsCommon,
      behavior: "domain",
      url: `${prefix}https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs`,
      path: "./ruleset/cn_domain.mrs"
    },
    cn_ip: {
      ...mrsCommon,
      behavior: "ipcidr",
      url: `${prefix}https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs`,
      path: "./ruleset/cn_ip.mrs"
    }
  };

  // 4. 组装内网直连规则与置顶 AI 规则
  const internalRules = [];
  USER_CONFIG.internalDomains.forEach((domain) => {
    const cleanDomain = domain.replace(/^\+\.|^\*\./, "");
    internalRules.push(`DOMAIN-SUFFIX,${cleanDomain},DIRECT`);
  });
  USER_CONFIG.internalCidrs.forEach((cidr) => {
    internalRules.push(`IP-CIDR,${cidr},DIRECT,no-resolve`);
  });

  const aiPriorityRules = [
    "DOMAIN,copilot.microsoft.com,Proxy",
    ...AI_AND_AUTH_SUFFIXES.map((suffix) => `DOMAIN-SUFFIX,${suffix},Proxy`),
    "IP-CIDR6,2607:6bc0::/48,REJECT,no-resolve",
    "IP-CIDR6,2607:6bc0:11::/48,REJECT,no-resolve",
    "IP-CIDR,160.79.104.0/21,Proxy,no-resolve"
  ];

  // 5. 极速零阻塞分流规则（全量 IP 规则均强制带 no-resolve，彻底消除规则匹配阶段的 DNS 等待）
  config.rules = [
    // (1) 内网域名与私有网段直连
    ...internalRules,
    "RULE-SET,private_domain,DIRECT",
    "RULE-SET,private_ip,DIRECT,no-resolve",

    // (2) 屏蔽非中国/非私网域名的海外 QUIC（UDP 443），强制回落 TCP 防泄露且保留国内直连 QUIC 加速
    "AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((RULE-SET,cn_domain))),(NOT,((RULE-SET,private_domain)))),REJECT",

    // (3) AI、人机验证与支付风控全链路置顶走 Proxy（远端解析，0 本地 DNS 延迟）
    ...aiPriorityRules,
    "RULE-SET,ai_domain,Proxy",

    // (4) 海外常见域名集提前走 Proxy，中国大陆域名集走 DIRECT
    "RULE-SET,proxy_domain,Proxy",
    "RULE-SET,cn_domain,DIRECT",

    // (5) 纯 IP 中国连接直连（带 no-resolve，仅对纯 IP 请求生效，不阻塞任何域名请求）
    "RULE-SET,cn_ip,DIRECT,no-resolve",

    // (6) 其余所有域名与流量统一走固定出口 Proxy（远端解析）
    "MATCH,Proxy"
  ];

  return config;
}
