# proxy-minimal

专为 **AI 重度使用场景** 设计的跨客户端极简防封配置集，统一采用 **中国与内网域名直连 + 全局单一固定纯净出口** 策略，确保 AI 主站、前端静态资源、人机验证（Cloudflare / hCaptcha / Arkose）、支付风控（Stripe / PayPal）及 OAuth 登录全链路出口 IP 一致。

## 客户端与订阅链接

### 🚀 极速零阻塞版（推荐，`cy-fast`）
专为解决跨国 DoH 套娃等待与本地 DNS 阻塞设计的独立高速版本：中国大陆与自定义内网域名走系统 DHCP DNS 直连，其余域名全部零等待直传代理节点远端解析。

| 客户端 | 文件 | 远程链接 |
|---|---|---|
| **Shadowrocket（小火箭）** | `shadowrocket/cy-fast.conf` | `https://raw.githubusercontent.com/ChungyuCheung/proxy-minimal/main/shadowrocket/cy-fast.conf` |
| **Mihomo 系列**（Bettbox / Clash Verge Rev / Mihomo Party / FlClash 等） | `mihomo/cy-fast.js` | `https://raw.githubusercontent.com/ChungyuCheung/proxy-minimal/main/mihomo/cy-fast.js` |

### 📦 经典极简版（原版保留，`cy-minimal` / `cy-override`）
保持原有规则结构不变，供旧订阅链接兼容对比。

| 客户端 | 文件 | 远程链接 |
|---|---|---|
| **Shadowrocket（小火箭）** | `shadowrocket/cy-minimal.conf` | `https://raw.githubusercontent.com/ChungyuCheung/proxy-minimal/main/shadowrocket/cy-minimal.conf` |
| **Mihomo 系列**（Bettbox / Clash Verge Rev / Mihomo Party / FlClash 等） | `mihomo/cy-override.js` | `https://raw.githubusercontent.com/ChungyuCheung/proxy-minimal/main/mihomo/cy-override.js` |

---

## 版本对比（`cy-fast` vs `cy-minimal`）

| 维度 | `cy-fast`（极速零阻塞版） | `cy-minimal`（经典极简版） |
|---|---|---|
| **本地 DNS 架构** | TUN Fake-IP 秒回 + 直连锁定 `system` DNS，代理域名由节点远端解析（**0 跨国 DoH 阻塞、0 海外 DNS 泄露**） | 默认上游绑定 `#proxy` 海外 DoH，未命中域名易触发跨国解析排队 |
| **IP / GeoIP 规则** | 全量 `IP-CIDR` / `IP-ASN` / `GEOIP,CN` 强制带 `no-resolve`，纯 IP 秒匹配、域名请求零阻塞穿透 | `GEOIP,CN` / `cn_ip` 不带 `no-resolve`，未知域名需先在本地完成 DNS 解析 |
| **AI 与验证规则链** | 顶部置顶 ChatGPT（含 `oaistatic` / `oaiusercontent` / `featuregates` / `statsig`）、Claude、Gemini、Turnstile、Stripe 全链路 + 每日更新 AI/海外规则集 | 不设前置代理域名集，统一由末尾 `FINAL,PROXY` 兜底 |
| **策略组与去广告** | 无复杂策略组（小火箭直接跟随首页节点）、无重型去广告规则拖慢内存 | 同左 |

---

## 核心特性
* **零本地 DNS 阻塞**：彻底消除「为了判断是否为中国 IP 而先走代理查一次海外 DoH」的多轮跨国 RTT 串行等待，首包握手速度对齐甚至优于客户端自带默认配置。
* **内网 DHCP DNS 直连**：支持自定义内网域名（如 `huitone.com`）及标准内网后缀（`lan` / `local` / `internal` / `home.arpa`）走当前网络 `system` DNS 解析并返回真实内网 IP。
* **AI 全链路防封加固**：关闭 IPv6 并屏蔽海外代理 QUIC（UDP 443，同时保留国内网站原生 QUIC 直连加速）；置顶 AI 静态资源与验证/支付域名，杜绝漏网直连导致出口 IP 分裂；全程无自动测速切换。

## 配置步骤

### 1. Shadowrocket（小火箭）
1. 在 **配置** 页点击右上角 **+**，粘贴以下链接下载并启用配置：
   `https://raw.githubusercontent.com/ChungyuCheung/proxy-minimal/main/shadowrocket/cy-fast.conf`
2. 回到 **首页**，**手动选定 1 个干净的美/日原生或家宽节点** 长期固定使用（无策略组，所有代理流量直接跟随首页当前节点）。
3. 已默认开启最小化 `[MITM]`（`enable = true`、`h2 = true`）以兼容外部天气/定位等模块；首次使用模块时请在 **配置 → `cy-fast.conf` → HTTPS 解密** 中确认已绑定并信任本机 CA 证书。
4. 如需扩展其他自定义内网域名，在本地副本的 `[General]`（`skip-proxy` / `always-real-ip`）、`[Rule]` 与 `[Host]` 中补充对应域名即可。

### 2. Mihomo 系列客户端（Bettbox / Clash Verge Rev / Mihomo Party / FlClash）
1. 在客户端的 **覆写 / 脚本（Override / Script）** 中新建远程 JavaScript 脚本，填入：
   `https://raw.githubusercontent.com/ChungyuCheung/proxy-minimal/main/mihomo/cy-fast.js`
2. 启用该覆写后，进入 **代理** 面板的 `Proxy` 组，**手动选定 1 个干净的美/日原生或家宽节点** 长期固定使用。
3. 验证内网解析：`nslookup nas.huitone.com` 返回真实内网 IP 即表示生效。
