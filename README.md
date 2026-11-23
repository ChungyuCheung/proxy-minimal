# Mihomo 全局防封覆写脚本

适用于 **Mihomo（原 Clash Meta）内核** 系列客户端（如 **Clash Verge Rev**、**Bettbox**、**Mihomo Party**、**FlClash** 等），专为 **Claude / AI 重度使用场景** 设计的极简分流脚本，采用 **绕过大陆 + 全局单一固定纯净出口** 策略，确保 AI 主站、人机验证（Cloudflare / hCaptcha）、支付风控（Stripe）及 OAuth 登录全链路出口 IP 一致。

## 核心特性
* **内网 DHCP DNS 直连**：已预置 `+.huitone.com` 走系统 `system` DNS 解析并写入 `fake-ip-filter`，返回真实内网 IP（非 `198.18.x.x`）。
* **每日自动更新**：引用 MetaCubeX 官方每日构建的 `.mrs` 二进制规则集（`cn` 与 `private`），每 24 小时同步。
* **防封加固**：自动过滤港/澳/中/俄及订阅提示节点；仅保留手动 `select` 代理组；关闭 IPv6 并屏蔽海外 QUIC（UDP 443）。

## 客户端配置步骤
1. 在客户端的 **覆写 / 脚本（Override / Script）** 功能中添加远程 JavaScript 脚本（支持 **Bettbox**、**Clash Verge Rev**、**Mihomo Party** 等），填入：
   `https://raw.githubusercontent.com/ChungyuCheung/mihomo-override/main/override.js`
2. 启用该覆写后，进入 **代理** 面板的 `Proxy` 组，**手动选定 1 个干净的美/日原生或家宽节点** 长期固定使用。
3. 验证内网解析：`nslookup nas.huitone.com` 返回真实内网 IP 即表示生效。
