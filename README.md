# proxy-minimal

专为 **Claude / AI 重度使用场景** 设计的跨客户端极简防封配置集，统一采用 **绕过大陆 + 全局单一固定纯净出口** 策略，确保 AI 主站、人机验证（Cloudflare / hCaptcha）、支付风控（Stripe）及 OAuth 登录全链路出口 IP 一致。

## 客户端与订阅链接

| 客户端 | 文件 | 远程链接 |
|---|---|---|
| **Mihomo 系列**（Bettbox / Clash Verge Rev / Mihomo Party / FlClash 等） | `mihomo/override.js` | `https://raw.githubusercontent.com/ChungyuCheung/proxy-minimal/main/mihomo/override.js` |
| **Shadowrocket（小火箭）** | `shadowrocket/minimal.conf` | `https://raw.githubusercontent.com/ChungyuCheung/proxy-minimal/main/shadowrocket/minimal.conf` |

## 核心特性
* **内网 DHCP DNS 直连**：已预置 `huitone.com` 及常见内网后缀（`lan` / `local` / `internal` / `home.arpa`）走系统 `system` DNS 解析，返回真实内网 IP。
* **每日自动更新**：Mihomo 端使用 MetaCubeX 官方每日构建的 `.mrs` 二进制规则集（`cn` 与 `private`）；Shadowrocket 端使用每日更新的 `private.list` + `direct.txt` + `GEOIP,CN`。
* **防封加固**：自动过滤港/澳/中/俄及订阅提示节点；仅保留 1 个手动 `select` 代理组 `Proxy`（严禁自动测速切换）；关闭 IPv6 并屏蔽海外 QUIC（UDP 443）。

## 配置步骤

### 1. Mihomo 系列客户端（Bettbox / Clash Verge Rev / Mihomo Party / FlClash）
1. 在客户端的 **覆写 / 脚本（Override / Script）** 中新建远程 JavaScript 脚本，填入：
   `https://raw.githubusercontent.com/ChungyuCheung/proxy-minimal/main/mihomo/override.js`
2. 启用该覆写后，进入 **代理** 面板的 `Proxy` 组，**手动选定 1 个干净的美/日原生或家宽节点** 长期固定使用。
3. 验证内网解析：`nslookup nas.huitone.com` 返回真实内网 IP 即表示生效。

### 2. Shadowrocket（小火箭）
1. 在 **配置** 页点击右上角 **+**，粘贴以下链接下载并选用该配置：
   `https://raw.githubusercontent.com/ChungyuCheung/proxy-minimal/main/shadowrocket/minimal.conf`
2. 进入 **配置 → 策略组 → Proxy**，**手动选定 1 个干净的美/日原生或家宽节点** 长期固定使用。
3. 如需扩展内网域名，在本地副本的 `[General]`（`skip-proxy`）、`[Rule]` 与 `[Host]` 中补充对应域名即可。
