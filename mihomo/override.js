/**
 * Mihomo（Bettbox / Clash Verge Rev / Mihomo Party / FlClash 等）极简防封全局覆写脚本（绕过大陆 + 全局单一固定出口）
 * 适用仓库：https://github.com/ChungyuCheung/proxy-minimal
 */

// ==================== 用户自定义区 ====================
const USER_CONFIG = {
  // 1. 需要使用 DHCP 下发 DNS 解析的内网域名
  internalDomains: [
    "+.huitone.com",
    "+.lan",
    "+.local",
    "+.internal",
    "*.home.arpa"
  ],

  // 2. 内网私有网段（强制直连，不走代理）
  internalCidrs: [
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16"
  ],

  // 3. GitHub 加速前缀（直连正常则留空）
  ghProxy: ""
};
// ======================================================

function main(config) {
  if (!config || typeof config !== "object") return config;

  const proxies = Array.isArray(config.proxies) ? config.proxies : [];
  const allProxyNames = proxies.map((p) => p.name).filter(Boolean);

  // 过滤掉港/澳/中/俄及机场信息节点，防止误选导致 Claude 封号
  const excludeRegex = /香港|HK|Hong\s?Kong|澳门|MO|Macau|中国|CN|China|俄罗斯|RU|Russia|剩余|到期|官网|重置|流量|套餐|邀请/i;
  let cleanProxies = allProxyNames.filter((name) => !excludeRegex.test(name));
  if (cleanProxies.length === 0) {
    cleanProxies = allProxyNames.length > 0 ? allProxyNames : ["DIRECT"];
  }

  // 1. 极简代理组：只保留一个手动固定的 Proxy 组（严禁自动测速切换）
  config["proxy-groups"] = [
    {
      name: "Proxy",
      type: "select",
      proxies: cleanProxies
    }
  ];

  // 2. 防泄露 DNS + 内网 DHCP DNS 策略
  const nameserverPolicy = {
    "geosite:private": "system",
    "geosite:cn": ["223.5.5.5", "119.29.29.29"]
  };
  USER_CONFIG.internalDomains.forEach((domain) => {
    nameserverPolicy[domain] = "system";
  });

  config.dns = {
    enable: true,
    ipv6: false,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "respect-rules": true,
    "fake-ip-filter": [
      ...USER_CONFIG.internalDomains,
      "+.lan",
      "+.local",
      "localhost.ptlogin2.qq.com",
      "+.msftconnecttest.com",
      "+.msftncsi.com",
      "ntp.*.com",
      "time.*.com"
    ],
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "proxy-server-nameserver": ["223.5.5.5", "119.29.29.29"],
    "direct-nameserver": ["system", "223.5.5.5"],
    nameserver: [
      "https://dns.cloudflare.com/dns-query",
      "https://dns.google/dns-query"
    ],
    "nameserver-policy": nameserverPolicy
  };

  // 3. 每日自动更新的 .mrs 规则集（MetaCubeX 官方源）
  const prefix = USER_CONFIG.ghProxy;
  const mrsCommon = {
    type: "http",
    format: "mrs",
    interval: 86400
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

  // 4. 组装内网直连规则
  const internalRules = [];
  USER_CONFIG.internalDomains.forEach((domain) => {
    const cleanDomain = domain.replace(/^\+\.|^\*\./, "");
    internalRules.push(`DOMAIN-SUFFIX,${cleanDomain},DIRECT`);
  });
  USER_CONFIG.internalCidrs.forEach((cidr) => {
    internalRules.push(`IP-CIDR,${cidr},DIRECT,no-resolve`);
  });

  // 5. 极简分流规则
  config.rules = [
    ...internalRules,
    "RULE-SET,private_domain,DIRECT",
    "RULE-SET,private_ip,DIRECT,no-resolve",
    "RULE-SET,cn_domain,DIRECT",
    "RULE-SET,cn_ip,DIRECT,no-resolve",
    "AND,((NETWORK,UDP),(DST-PORT,443)),REJECT",
    "MATCH,Proxy"
  ];

  return config;
}
