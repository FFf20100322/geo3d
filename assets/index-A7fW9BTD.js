(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const Gc=["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"],ya="⁰¹²³⁴⁵⁶⁷⁸⁹";function _u(n){const e=(t,i)=>[...t].map(i).join("");return n.replace(new RegExp(`([A-Za-z])([${ya}]+)`,"g"),(t,i,s)=>i+e(s,r=>Gc[ya.indexOf(r)])).replace(/([A-Za-z])_?(\d+)/g,(t,i,s)=>i+e(s,r=>Gc[+r]))}function no(n){return _u(n).replace(/\^(\d+)/g,(e,t)=>[...t].map(i=>ya[+i]).join(""))}const yh=[[/\\overrightarrow\s*\{([^{}]*)\}/g,"向量$1"],[/\\vec\s*\{([^{}]*)\}/g,"向量$1"],[/\\overline\s*\{([^{}]*)\}/g,"$1"],[/\\underline\s*\{([^{}]*)\}/g,"$1"],[/\\text\s*\{([^{}]*)\}/g,"$1"],[/\\mathrm\s*\{([^{}]*)\}/g,"$1"],[/\\triangle\s*/g,"△"],[/\\angle\s*/g,"∠"],[/\\perp\b/g,"⊥"],[/\\parallel\b/g,"∥"],[/\\cong\b/g,"≌"],[/\\sim\b/g,"∽"],[/\\in\b/g,"∈"],[/\\cdot\b/g,"·"],[/\\times\b/g,"×"],[/\\div\b/g,"÷"],[/\\pm\b/g,"±"],[/\\leq?\b/g,"≤"],[/\\geq?\b/g,"≥"],[/\\neq\b/g,"≠"],[/\\approx\b/g,"≈"],[/\\ldots\b/g,"…"],[/\\cdots\b/g,"…"],[/\\alpha\b/g,"α"],[/\\beta\b/g,"β"],[/\\gamma\b/g,"γ"],[/\\theta\b/g,"θ"],[/\\lambda\b/g,"λ"],[/\\mu\b/g,"μ"],[/\\pi\b/g,"π"],[/\\varphi\b/g,"φ"],[/\\phi\b/g,"φ"],[/\\Rightarrow\b/g,"⇒"],[/\\Leftrightarrow\b/g,"⇔"],[/\\to\b/g,"→"]];function bh(n){const e=n.trim();return e?!!(/^[A-Za-z0-9₁₂₃₄₅₆₇₈₉₀√πθαβγλμ°]+$/.test(e)||e.startsWith("(")&&e.endsWith(")")||e.startsWith("|")&&e.endsWith("|")||e.startsWith("向量")&&e.length>2):!1}function ba(n){let e=n;const t=/\\(frac|sqrt|overrightarrow|vec|overline|underline|text|mathrm|left|right)\s*\{([^{}]*)\}/g;for(let i=0;i<30;i++){const s=e;if(e=e.replace(t,(r,o,a)=>{switch(o){case"frac":return r;case"sqrt":return`√(${a})`;case"overrightarrow":case"vec":return`向量${a}`;case"overline":case"underline":case"text":case"mathrm":return a;default:return a}}),e=e.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,(r,o,a)=>{const c=o.trim(),l=a.trim(),u=c.includes("+")||c.includes("-")?`(${c})`:c,h=bh(l)?l:`(${l})`;return`${u}/${h}`}),e===s)break}for(const[i,s]of yh)e=e.replace(i,s);return e=e.replace(/\\left|\\right/g,""),e=e.replace(/\\[,;:!]/g,""),e=e.replace(/\$+/g,""),e=e.replace(/\\/g,""),e=e.replace(/\{/g,"").replace(/\}/g,""),e=e.replace(/\^\\?circ\b/g,"°"),e=e.replace(/([A-Za-z0-9)])_(\d)/g,"$1$2"),no(e.replace(/[ \t]{2,}/g," ").trim())}const Ah="https://api.deepseek.com",go="deepseek-flash",vu="geo3d.apiKey";class Yn extends Error{status;constructor(e,t){super(e),this.name="ApiError",this.status=t}}const Os=()=>localStorage.getItem(vu)??"",Th=n=>{localStorage.setItem(vu,n.trim())};function wh(n,e){return n===401?"API Key 不对或已失效，去设置里重新填一次。":n===402?"账户余额不足，去 DeepSeek 平台充值后再试。":n===429?"请求太频繁被限流了，等几秒再试。":n>=500?`DeepSeek 服务端出错（${n}），等一会再试。`:`接口返回 ${n}：${e.slice(0,200)}`}class Ds extends Error{constructor(){super("已取消"),this.name="CancelledError"}}let xu;function Mu(n){xu=n}async function hr(n,e){const t=Os();if(!t)throw new Yn("还没有填 API Key，先去设置里填上。");let i;try{i=await fetch(Ah+n,{method:e===void 0?"GET":"POST",headers:{Authorization:`Bearer ${t}`,...e===void 0?{}:{"Content-Type":"application/json"}},body:e===void 0?void 0:JSON.stringify(e),signal:xu})}catch(s){throw s instanceof DOMException&&s.name==="AbortError"?new Ds:s instanceof Error&&s.name==="AbortError"?new Ds:new Yn("网络没通，检查一下手机的网络再试。")}if(!i.ok)throw new Yn(wh(i.status,await i.text().catch(()=>"")),i.status);return i.json()}async function Ch(){const n=await hr("/user/balance"),e=n.balance_infos??[],t=e[0],i=t?.currency==="USD"?"$":t?.currency==="CNY"?"¥":`${t?.currency??""} `;return{available:!!n.is_available,lines:e.map(s=>`${s.currency??""} 可用 ${s.total_balance??"?"}（赠金 ${s.granted_balance??"0"}，充值 ${s.topped_up_balance??"0"}）`),summary:t?`${i}${t.total_balance??"?"}`:"余额未知"}}const Rh=`你是高中立体几何的场景建模助手。用户给你一道题的题面文字，你把它变成一个可求解的几何场景。
你只负责说「有哪些点」和「它们满足什么关系」，不要给出最终坐标 —— 坐标由本地求解器算。

输出 json，格式示例：
{
  "points": [
    {"name":"A","kind":"free","at":[0,0,0]},
    {"name":"B","kind":"free","at":[2,0,0]},
    {"name":"D","kind":"free","at":[0,0,2]},
    {"name":"A1","kind":"free","at":[0,2,0]},
    {"name":"C","kind":"offset","of":["B","D","A"]},
    {"name":"G","kind":"midpoint","of":["B","C"]}
  ],
  "edges": [["A","B"],["B","C"],["C","A"]],
  "faces": [["A","B","C"],["A","B","B1","A1"]],
  "constraints": [
    {"kind":"distance","a":"A","b":"B","value":2},
    {"kind":"perpendicular","p":["A","B"],"q":["A","D"]},
    {"kind":"angle","at":"A","from":"A1","to":"B","value":60}
  ]
}

**某一问独有的条件，要单独写进 variants，不要并进上面的 constraints。**
题面写成「点 E 是棱 PB 上的动点。（1）…（2）若 E 是 PB 的中点，求…」时，
第（2）问的「若」**只对第（2）问成立** —— 看第（1）问时 E 还得是能滑的动点。
把这种条件并进主场景，第（1）问的图就悄悄错了，而且错的样子和对的样子一模一样。
写法：点定义放 points、约束放 constraints，同名点会**替换**掉主场景里那个：

  "variants": [
    {"q":"2",
     "points":[{"name":"E","kind":"midpoint","of":["P","B"]}],
     "constraints":[{"kind":"distance","a":"P","b":"E","value":1.414}]}
  ]

只有**带「若」「当…时」「若…则」这类前提**的条件才放进 variants；
题目从头到尾都成立的条件（棱长、垂直关系这些）照旧写在外面。

**曲面立体（球、椭球、圆柱、圆锥、圆台）走 solids 这个键。**
平面多边形拼不出来的东西（球、椭圆、圆柱…）必须写进 solids，否则图里会少一块：
题目里出现「球 O」「圆柱 OO₁」「圆锥」「圆台」这些字眼时，**一定要写**。

  "solids": [
    {"kind":"sphere","through":["A","B","C","D"],"center":"A"},
    {"kind":"cylinder","axis":["O","O1"],"radius":1,"radiusTop":1,"radiusBottom":2},
    {"kind":"cone","apex":"P","base":["A","B","C"],"radius":1},
    {"kind":"frustum","axis":["O","O1"],"radiusTop":0.5,"radiusBottom":1},
    {"kind":"ellipsoid","center":"O","ax":["O","A"],"ay":["O","B"],"az":["O","C"]}
  ]

**折纸 / 翻折题里「折之前那个位置的点」要藏起来**，
否则图上会多出一个孤零零的字母点，让人以为那是题里的点：
写一个 "hiddenPoints": ["D"] —— 让参考点留在数据里（约束要用它）、但别画出来。

**variants 里也可以有自己的 edges / faces / solids / hiddenPoints** ——
某一问多出一条棱、多一个面、或者要藏掉不同的点时，写在该问的 variant 里。

点的 name 一律用 ASCII 下标写法，例如 A1、B1、C1，不要写成 A₁ 或 A_1。
点的 kind 只能取这九种：
- free：自由点，必须给 at，是你估计的初始坐标。它只用来帮求解器落到正确的解上，可以很粗糙，
  但彼此的大致关系要接近真实（垂直的边要近似垂直，长的边要画长一点）。
- midpoint：中点，of 是线段两个端点。
- ratio：把线段按比例分点，of 是两个端点，t 是从第一个端点出发的比例，取值在 0 到 1 之间。
- offset：平移派生，P = A + B - C。棱柱的顶面顶点用它最省事，例如 B1 写成 {"kind":"offset","of":["B","A1","A"]}。
- onSegment：**棱上（或线段上）可以滑动的动点**，of 是线段两个端点，t 同上，是它在两端之间的位置。
- inFace：**某个面内可以滑动的动点**，face 给这个面的三个顶点，u、v 是它在面内的两个参数（0 到 1）。
- perpFoot：垂足。of 是四个点：[起点, 平面上三点]，得到从起点向该平面作垂线的垂足。
  题面里出现「点 O 是 P 在平面 ABC 上的射影」「作 PO ⊥ 平面 ABC，垂足为 O」时用它。
- projLine：点在直线上的投影，of 是三个点：[被投影的点, 直线上两点]。
- onArc：**翻折题的动点** —— 把一个点绕一条棱旋转。of 是旋转轴的两个端点，
  from 是**旋转前的那个点**，angle 是当前转过的角度（度）。
  题面出现「把 △ABC 沿 BC 折起」「将平行四边形 ABCD 沿对角线 BC 折成空间四边形」
  这类说法时用它：折起来之后的那个点（通常写作 D′）就写成 onArc。
  **起点是原来那个点，终点是折到底之后的位置** —— 拖动时改的是 angle。
  例：D 绕 BC 折起，写成 {"name":"D2","kind":"onArc","of":["B","C"],"from":"D","angle":0}。

**动点必须用 onSegment 或 inFace，不要用 free。**
题面里说「点 E 在棱 PB 上运动」「点 F 在侧面 PAB 内运动」时，如果写成 free，
那个点就变成固定的、用户拖不动，整个「动点联动」的功能就没了 —— 这是最要紧的一条。
用 onSegment / inFace 建出来的点，用户可以直接用手拖，所有用到它的线段、平面、角都会跟着变。

点的定义顺序必须是「先定义被引用的点」。

约束的 kind 只能取这八种：
- distance：|ab| = value
- equalDistance：|ab| = |cd|，用 ab 与 cd 两个数组给点
- angle：∠from-at-to = value，单位度，value 在 0 到 180 之间
- lineAngle：直线 p 与直线 q 的夹角 = value，单位度，取锐角，异面直线同样适用
- perpendicular：直线 p ⊥ 直线 q
- parallel：直线 p ∥ 直线 q
- perpLinePlane：直线 line ⊥ 平面 plane，plane 用三个点表示
- coplanar：四个点共面，用 pts 给四个点

要求：
- 把题面里给出的每一个已知条件都翻译成约束，一条不漏，也一条不多。
- **你拿到的只有文字，这是正常的、也是完整的输入。** 没有配图不代表信息不全，
  绝对不要因为「看不到图」就返回 unsupported。
- 题面说了是什么立体（正方体、长方体、正四面体、正四棱锥……），这个**名称本身就已经确定了形状**，
  按这个名称的完整定义去建：棱相等、对面平行、侧棱相等等等是该名称自带的性质，不算编条件。
- 形状定下来之后，**尺寸没给就自己取一个方便的整数**（例如棱长 2）。尺寸只影响缩放、不影响形状。
- 反过来，**题面没说的额外关系绝对不要假设**。例如不要因为「看起来像正方体」就给一条题面没提的
  棱也写上相等；不要凭空补一条题面里没有的垂直。
- edges 是要画出来的线段，faces 是要填色显示的多边形（顶点按顺序排，必须是真的共面）。
- 只有「题面里明确写出的某个条件」确实不是这八种约束能表达的时候，才返回 {"unsupported":"…"}，
  并说清是哪一条。**不要因为题目复杂、或觉得信息不足就退回 unsupported。**`;async function Ph(n,e,t){const i=e.trim()?`题目：
${n}

另外补充或更正的条件（以这部分为准）：
${e}`:`题目：
${n}`;let s="没有拿到可用结果";for(let r=1;r<=3;r++){const a=(await hr("/chat/completions",{model:go,messages:[{role:"system",content:Rh},{role:"user",content:i}],response_format:{type:"json_object"},reasoning_effort:t,max_tokens:16e3})).choices?.[0],c=a?.message?.content;if(!c){s=a?.finish_reason==="length"?`${t} 档思考没结束就用完了额度（内容被截断）`:`${t} 档接口返回了空内容`;continue}try{return JSON.parse(c)}catch{s=`${t} 档返回的内容不是合法 json（长度 ${c.length}）`}}throw new Yn(`生成场景失败：${s}。`)}const Dh=`你是高中数学立体几何的解题助手。用户给你题面，以及已经建好的图形里有哪些点。
你要做两件事：写清解题过程，并说明每一步在图上画了什么。

输出 json，格式示例：
{
  "steps": [
    {
      "title": "取 BD 的中点 O，连 AO",
      "text": "连接 BD、AO。因为 ABCD 是正方形，对角线互相平分，所以 O 是 BD 的中点。",
      "why": "正方形的对角线互相平分",
      "addPoints": [{"name":"O","kind":"midpoint","of":["B","D"]}],
      "addEdges": [["B","D"],["A","O"]],
      "uses": ["A","B","D"],
      "q": "1",
      "via": "坐标系法"
    }
  ],
  "answers": [{"label":"(1)","value":"4"}],
  "angles": [
    {"kind":"lineLine","p":["B","A"],"q":["B","D"],"label":"∠ABD","value":"45°","of":"degrees"},
    {"kind":"dihedral","edge":["A","B"],"inA":"P","inB":"C","label":"二面角 P-AB-C","value":"1/3","of":"cos"}
  ],
  "lengths": [
    {"p":["P","M"],"label":"PM","value":"√3"}
  ]
}

关于步骤：
- 每一步只做一件事。title 写这一步做了什么，text 写清推理，why 写依据（定理名或一句话）。
- 题面里有几个小问就要全部答完，最后在 answers 里给出每个小问的最终结果。
- 如果这次用的是**坐标系法**，还要在 json 里给一个 "frame"，说清坐标系怎么建的：
  {"origin":"原点那个点","x":"x 轴正方向上的点","y":"y 轴正方向上的点","z":"z 轴正方向上的点"}
  三个轴上的点必须是图上已有的、或者你在步骤里画出来的点，而且要与原点不共面。
- **建系那一步的 text 里要写清「为什么这么建最简」** ——
  例如「AB、AD、AA₁ 两两垂直且交于 A，直接当三条轴，所有顶点坐标都是整数，不用做辅助线」。
  用户要能看懂你为什么这么选，只写「以 A 为原点」是不够的。
  （写在步骤里就行，不要另开说明栏。）
- 如果用了向量法或基底法，在 json 里给一个 "arrows" 数组把要画的向量列出来：
  [{"from":"E","to":"F","label":"EF","color":"yellow"}]
  color 取 "yellow"（向量法的向量）或 "blue"（基底法的基底），不写默认黄色。
  基底法要给**三个**蓝色的箭头当基底；坐标系法不用给 arrows，靠 frame 自动画三条轴。
- **只要有向量就要带箭头**，这是用户明确要求的。
- **要画某个面的法向量**时（题面说「作法向量」「求平面 ABC 的法向量」这类），在 json 里给 "normals"：
  [{"face":["A","B","C"],"at":"A","label":"n"}]
  face 是确定这个面的几个点，at 是从哪个点出发画。
  **不要自己算法向量指向哪** —— 方向与长度都由程序按当前坐标现算，
  所以它跟着动点走（面一转，法向量跟着转）。你只要说清「哪个面、从哪出发」。
- 题面里**单独给的点**（没有棱连着的孤立点）也照常写进 points，程序会把它显示出来，
  只是不连任何棱 —— 这是正常的，**不要为了好看去给它编一条棱**。
- **不闭合的向量**（只画个箭头、首尾不接成图形的那种）用 "arrows" 表示就行，不需要额外加棱。
- **每个步骤都要标上它属于哪一问**：加一个字段 "q"，值是问号，第几问就写几（从 1 开始）。
  不属于任何一问的通识步骤（比如「先把图形摆出来」）写 "0"。
- **解法只给一种**，并且**挑最简单、最容易看懂的那种** ——
  不要同时给向量法、坐标系法、基底法，也不要写「方法二」。
  用户切换方法时会重新问一次，这里只负责把最省事的那条路讲清楚，
  并把它标在 "via" 上（例如 "via":"坐标系法"）；如果这题只有一种自然做法，也照样写上它的名字。
- addPoints 只允许画「拿到已知点就能直接算出来」的辅助点，kind 只能取这五种：
  midpoint —— 中点，of 是两个端点；
  ratio —— 按比例分点，of 是两个端点，另给 t（0 到 1）；
  offset —— 平移派生 P = A + B - C，of 是三个点；
  perpFoot —— 从一点向一个平面作垂线的垂足，of 是 [起点, 平面上的三个点]；
  projLine —— 一点在一条直线上的射影，of 是 [起点, 直线上的两个点]。
  绝对不要用 free —— 解题步骤里不允许凭空插一个自由点，那等于偷偷改题目图形。
- addPoints 的 name 用 ASCII 写法（如 O、H、K、M1），不要写下标字符。
- addEdges 是要画出来的辅助线段，两个端点必须已经存在。
- uses 填这一步主要用到的已有元素名字，用来在图上高亮。
- 不要重复画题面本来就有的线段。

关于 angles（**这一项很重要，请认真写**）：
- 这些角会以醒目的方式标在图上，是用户一眼看到「这道题的重点在哪儿」的地方。
- 所以要写的是**这道题真正围绕它展开的角**：题目直接问的那些、以及解题关键步骤里用到的那些。
- 题目有几问，就有几个角；一问一个，最多四个。**不要漏掉题目问的角** ——
  漏了用户就看不到重点，只能自己去一堆角里找。
- label 用课本的说法写清它是什么，例如「PA 与底面 ABCD 所成的角」「二面角 P-CD-A」。
- value 给最终结果（能写根号就写根号），程序会用本地算出来的值反验它，对不上会退回本地值并提示存疑。
- 三种画法，kind 只能取这三个：
  lineLine —— 两条直线的夹角。p 与 q 各是两个点；两条线共点时角就画在公共点上，不共点时会自动平移到一起。
  linePlane —— 直线与平面所成角。line 是直线的两个端点，plane 是平面上三个不共线的点。
  dihedral —— 二面角。edge 是棱的两个端点，inA 与 inB 分别是两个半平面内、不在棱上的点。
- 直角（90°）不用你操心，程序会画成课本上的直角符号。
- value 可以省。度数程序会自己算；只有答案本身就是漂亮的符号形式（如 cos θ = √3/6）时才写 value，
  并写明 of（degrees / cos / sin）。写了就必须过本地反验，对不上会被退回并提示存疑。

关于 lengths（题目问的是某条线段的长度时写在这里）：
- p 是线段的两个端点；label 给它的名字（如 PM）。
- value 给结果，能写根号就写根号（如 √3、2√6/3）。数值由程序本地算，value 会过反验。
- 只在**题目问的长度**或**解题关键用到的长度**上写，不要把所有棱都列一遍。

如果这道题的解法超出了上面这些辅助线画法，直接返回 {"unsupported":"说明是哪一步表达不了"}，不要硬凑。`;async function Lh(n,e,t,i,s){const r=[`题目：
${n}`,e.trim()?`另外补充或更正的条件（以这部分为准）：
${e}`:"",`图中已有的点：${t.join("、")}
只能引用这些点，或者你在前面步骤里新画出来的点。`,s?`**这一次必须用「${s}」来做**，每一步的 via 都写 "${s}"。`:""].filter(Boolean).join(`

`);let o="没有拿到可用结果";for(let a=1;a<=3;a++){const l=(await hr("/chat/completions",{model:go,messages:[{role:"system",content:Dh},{role:"user",content:r}],response_format:{type:"json_object"},reasoning_effort:i,max_tokens:2e4})).choices?.[0],u=l?.message?.content;if(!u){o=l?.finish_reason==="length"?`${i} 档思考没结束就用完了额度（内容被截断）`:`${i} 档接口返回了空内容`;continue}try{return JSON.parse(u)}catch{o=`${i} 档返回的内容不是合法 json（长度 ${u.length}）`}}throw new Yn(`生成解题过程失败：${o}。`)}const Ih=`你是高中数学试卷的排版分析助手。用户会给你一张照片，照片里可能不止一道题。
任务：找出照片里所有完整的题目，按从上到下的顺序排列，不要遗漏。
每道题给出三项：
- label：照片上印的题号，照抄（例如 "3" 或 "12"）；没印题号就按顺序给 "1"、"2"…
- preview：这道题开头的一句话，最多 30 字，用来分辨是哪一道
- box：这道题在照片里的大致范围，归一化为 [左, 上, 宽, 高]，取值 0 到 1
注意：只找题目，不要找答案、解析、页眉页脚、页码。题面配的插图属于它所属的那道题。
输出 json，格式示例：
{"problems":[{"label":"3","preview":"如图，在正方体ABCD-A1B1C1D1中，E为BC的中点","box":[0.06,0.22,0.88,0.15]}]}`;async function Uh(n){let e="没有拿到可用结果";for(let t=1;t<=3;t++){const s=(await hr("/chat/completions",{model:go,messages:[{role:"system",content:Ih},{role:"user",content:[{type:"text",text:"请找出这张照片里所有的题目。"},{type:"image_url",image_url:{url:n,detail:"high"}}]}],response_format:{type:"json_object"},reasoning_effort:"low",max_tokens:2e3})).choices?.[0]?.message?.content;if(!s){e="接口返回了空内容";continue}try{const r=JSON.parse(s);if(!Array.isArray(r.problems)){e="返回的 json 里没有 problems";continue}return r.problems.map((o,a)=>{const c=o,l=Array.isArray(c.box)&&c.box.length===4?c.box.map(Number):null;return{label:String(c.label??a+1),preview:String(c.preview??""),box:l&&l.every(u=>Number.isFinite(u))?l:null}}).filter(o=>o.preview||o.label)}catch{e="返回的内容不是合法 json"}}throw new Yn(`找题目时试了三次都没成功（${e}）。换一张更清晰的照片再试。`)}const Nh=`你是高中数学立体几何题的转写助手。用户会给你一张题目照片。
任务：把题目文字逐字转写出来，保留原有的字母、数字、符号与下标，例如 PA⊥平面ABCD、AB=2、∠BAD=60°、E为BC的中点。
下标是最要紧的地方，请特别注意：
- 字母右下角的标号必须转写出来，写成下标字符，例如 A₁、B₁、C₁、D₁。
- 绝对不要把下标丢掉写成 A、B、C —— 那样会把两个完全不同的点混成一个，整道题就全错了。
- 也不要写成 A1 或 A_1，统一用 A₁ 这种下标写法。
另外还要单独列一份点清单：
- points 里列出这道题出现过的所有几何点名称，每个只出现一次，按题面出现顺序排列。
- 这份清单是用来给用户核对有没有漏下标的，所以务必写全，包括带下标的点。
数学式子的写法（很要紧，用户要照着核对，读不懂就等于没识别）：
- 绝对不要用 LaTeX。不要写 \\frac、\\sqrt、\\overrightarrow、$ 这些，一律用普通字符。
- 分数写成 a/b，分子分母里有加减或根号时加括号，例如 1/|PQ|、√3/6、(a+b)/c。
- 绝对值就用竖线，例如 |PQ|。
- 向量写成「向量PQ」，例如 向量PQ · 向量PR。
- 根号写 √3 或 √(2+1)；角度写 60°；三角形写 △ABC；角写 ∠A。
- 上下标用下标字符，例如 A₁、x²。
其他要求：
- 题面配的插图可能不准，一律不要拿插图当已知条件，只认文字。
- 只转写，不要解题，不要补全你没看见的条件，不要改写措辞。
- 看不清或拿不准的地方不要猜，写进 uncertain 数组。
输出 json，格式示例：
{"problemText":"如图，在正方体ABCD-A₁B₁C₁D₁中，E为BC的中点。","points":["A","B","C","D","A₁","B₁","C₁","D₁","E"],"uncertain":["图中的一个数字看不清"]}`;async function Fh(n,e){const t=e?`这张照片里有多道题。只转写第 ${e.label} 题，它开头是：「${e.preview}」。
注意：这道题的条件可能分散在相邻的几行里，紧接着的「(1)(2)」小问也属于这道题，全部都要转写，不要漏。`:"请转写这张照片里的题目。";let i="没有拿到可用结果";for(let s=1;s<=3;s++){const o=(await hr("/chat/completions",{model:go,messages:[{role:"system",content:Nh},{role:"user",content:[{type:"text",text:t},{type:"image_url",image_url:{url:n,detail:"high"}}]}],response_format:{type:"json_object"},reasoning_effort:"low",max_tokens:2e3})).choices?.[0]?.message?.content;if(!o){i="接口返回了空内容";continue}try{const a=JSON.parse(o),c=typeof a.problemText=="string"?no(ba(a.problemText.trim())):"";if(c){const l=Array.isArray(a.points)?a.points.map(f=>no(ba(String(f).trim()))):[],u=c.match(/[A-Za-z][₀-₉]+/g)??[],h=[...new Set([...l,...u])];return{problemText:c,points:h.filter(Boolean),uncertain:Array.isArray(a.uncertain)?a.uncertain.map(f=>String(f)):[]}}i="返回的 json 里没有题面文字"}catch{i="返回的内容不是合法 json"}}throw new Yn(`试了三次都没成功（${i}）。换一张更清晰、更近的照片再试。`)}const Ri=(n,e)=>[n[0]-e[0],n[1]-e[1],n[2]-e[2]],En=(n,e)=>n[0]*e[0]+n[1]*e[1]+n[2]*e[2],Oh=(n,e)=>[n[1]*e[2]-n[2]*e[1],n[2]*e[0]-n[0]*e[2],n[0]*e[1]-n[1]*e[0]],Bh=n=>Math.hypot(n[0],n[1],n[2]),Zs=n=>Math.min(1,Math.max(0,n)),nr=1e-12;function kh(n,e,t){const i=Ri(e,n),s=t.dir,r=Ri(n,t.origin),o=En(i,i),a=En(i,s),c=En(s,s),l=En(i,r),u=En(s,r),h=o*c-a*a;return Math.abs(h)<nr||o<nr?null:Zs((a*u-l*c)/h)}function Wc(n,e,t,i){const s=Oh(Ri(t,e),Ri(i,e)),r=Bh(s);if(r<nr)return null;const o=[s[0]/r,s[1]/r,s[2]/r],a=En(n.dir,o);if(Math.abs(a)<nr)return null;const c=En(Ri(e,n.origin),o)/a;return c<0?null:[n.origin[0]+c*n.dir[0],n.origin[1]+c*n.dir[1],n.origin[2]+c*n.dir[2]]}function zh(n,e){if(n.length<3)return null;const t=n[0],i=Ri(n[1],t),s=Ri(n[n.length===3?2:3],t),r=Ri(e,t),o=En(i,i),a=En(i,s),c=En(s,s),l=En(i,r),u=En(s,r),h=o*c-a*a;if(Math.abs(h)<nr)return null;const f=(c*l-a*u)/h,m=(o*u-a*l)/h;if(n.length===3){const g=Zs(m);return{u:Zs(Math.min(f,1-g)),v:g}}return{u:Zs(f),v:Zs(m)}}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Sc="180",As={ROTATE:0,DOLLY:1,PAN:2},Ms={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Hh=0,$c=1,Vh=2,Su=1,Gh=2,ri=3,Ui=0,an=1,Wn=2,Pi=0,Ts=1,Xc=2,qc=3,Yc=4,Wh=5,ji=100,$h=101,Xh=102,qh=103,Yh=104,jh=200,Kh=201,Zh=202,Jh=203,Aa=204,Ta=205,Qh=206,ed=207,td=208,nd=209,id=210,sd=211,rd=212,od=213,ad=214,wa=0,Ca=1,Ra=2,Ls=3,Pa=4,Da=5,La=6,Ia=7,Eu=0,cd=1,ld=2,Di=0,ud=1,hd=2,dd=3,fd=4,pd=5,md=6,gd=7,yu=300,Is=301,Us=302,Ua=303,Na=304,_o=306,Fa=1e3,Zi=1001,Oa=1002,Un=1003,_d=1004,xr=1005,$n=1006,Fo=1007,Ji=1008,hi=1009,bu=1010,Au=1011,ir=1012,Ec=1013,Qi=1014,li=1015,dr=1016,yc=1017,bc=1018,sr=1020,Tu=35902,wu=35899,Cu=1021,Ru=1022,Dn=1023,rr=1026,or=1027,Pu=1028,Ac=1029,Du=1030,Tc=1031,wc=1033,jr=33776,Kr=33777,Zr=33778,Jr=33779,Ba=35840,ka=35841,za=35842,Ha=35843,Va=36196,Ga=37492,Wa=37496,$a=37808,Xa=37809,qa=37810,Ya=37811,ja=37812,Ka=37813,Za=37814,Ja=37815,Qa=37816,ec=37817,tc=37818,nc=37819,ic=37820,sc=37821,rc=36492,oc=36494,ac=36495,cc=36283,lc=36284,uc=36285,hc=36286,vd=3200,xd=3201,Md=0,Sd=1,Ai="",xn="srgb",Ns="srgb-linear",io="linear",gt="srgb",rs=7680,jc=519,Ed=512,yd=513,bd=514,Lu=515,Ad=516,Td=517,wd=518,Cd=519,Kc=35044,Zc="300 es",Xn=2e3,so=2001;class is{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const qt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Qr=Math.PI/180,dc=180/Math.PI;function fr(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(qt[n&255]+qt[n>>8&255]+qt[n>>16&255]+qt[n>>24&255]+"-"+qt[e&255]+qt[e>>8&255]+"-"+qt[e>>16&15|64]+qt[e>>24&255]+"-"+qt[t&63|128]+qt[t>>8&255]+"-"+qt[t>>16&255]+qt[t>>24&255]+qt[i&255]+qt[i>>8&255]+qt[i>>16&255]+qt[i>>24&255]).toLowerCase()}function je(n,e,t){return Math.max(e,Math.min(t,n))}function Rd(n,e){return(n%e+e)%e}function Oo(n,e,t){return(1-t)*n+t*e}function Gs(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function sn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const Pd={DEG2RAD:Qr};class We{constructor(e=0,t=0){We.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class di{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let c=i[s+0],l=i[s+1],u=i[s+2],h=i[s+3];const f=r[o+0],m=r[o+1],g=r[o+2],_=r[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=m,e[t+2]=g,e[t+3]=_;return}if(h!==_||c!==f||l!==m||u!==g){let p=1-a;const d=c*f+l*m+u*g+h*_,x=d>=0?1:-1,E=1-d*d;if(E>Number.EPSILON){const w=Math.sqrt(E),C=Math.atan2(w,d*x);p=Math.sin(p*C)/w,a=Math.sin(a*C)/w}const M=a*x;if(c=c*p+f*M,l=l*p+m*M,u=u*p+g*M,h=h*p+_*M,p===1-a){const w=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=w,l*=w,u*=w,h*=w}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,s,r,o){const a=i[s],c=i[s+1],l=i[s+2],u=i[s+3],h=r[o],f=r[o+1],m=r[o+2],g=r[o+3];return e[t]=a*g+u*h+c*m-l*f,e[t+1]=c*g+u*f+l*h-a*m,e[t+2]=l*g+u*m+a*f-c*h,e[t+3]=u*g-a*h-c*f-l*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(i/2),u=a(s/2),h=a(r/2),f=c(i/2),m=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=f*u*h+l*m*g,this._y=l*m*h-f*u*g,this._z=l*u*g+f*m*h,this._w=l*u*h-f*m*g;break;case"YXZ":this._x=f*u*h+l*m*g,this._y=l*m*h-f*u*g,this._z=l*u*g-f*m*h,this._w=l*u*h+f*m*g;break;case"ZXY":this._x=f*u*h-l*m*g,this._y=l*m*h+f*u*g,this._z=l*u*g+f*m*h,this._w=l*u*h-f*m*g;break;case"ZYX":this._x=f*u*h-l*m*g,this._y=l*m*h+f*u*g,this._z=l*u*g-f*m*h,this._w=l*u*h+f*m*g;break;case"YZX":this._x=f*u*h+l*m*g,this._y=l*m*h+f*u*g,this._z=l*u*g-f*m*h,this._w=l*u*h-f*m*g;break;case"XZY":this._x=f*u*h-l*m*g,this._y=l*m*h-f*u*g,this._z=l*u*g+f*m*h,this._w=l*u*h+f*m*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],h=t[10],f=i+a+h;if(f>0){const m=.5/Math.sqrt(f+1);this._w=.25/m,this._x=(u-c)*m,this._y=(r-l)*m,this._z=(o-s)*m}else if(i>a&&i>h){const m=2*Math.sqrt(1+i-a-h);this._w=(u-c)/m,this._x=.25*m,this._y=(s+o)/m,this._z=(r+l)/m}else if(a>h){const m=2*Math.sqrt(1+a-i-h);this._w=(r-l)/m,this._x=(s+o)/m,this._y=.25*m,this._z=(c+u)/m}else{const m=2*Math.sqrt(1+h-i-a);this._w=(o-s)/m,this._x=(r+l)/m,this._y=(c+u)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(je(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=i*u+o*a+s*l-r*c,this._y=s*u+o*c+r*a-i*l,this._z=r*u+o*l+i*c-s*a,this._w=o*u-i*a-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+i*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;const c=1-a*a;if(c<=Number.EPSILON){const m=1-t;return this._w=m*o+t*this._w,this._x=m*i+t*this._x,this._y=m*s+t*this._y,this._z=m*r+t*this._z,this.normalize(),this}const l=Math.sqrt(c),u=Math.atan2(l,a),h=Math.sin((1-t)*u)/l,f=Math.sin(t*u)/l;return this._w=o*h+this._w*f,this._x=i*h+this._x*f,this._y=s*h+this._y*f,this._z=r*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class R{constructor(e=0,t=0,i=0){R.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Jc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Jc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*s-a*i),u=2*(a*t-r*s),h=2*(r*i-o*t);return this.x=t+c*l+o*h-a*u,this.y=i+c*u+a*l-r*h,this.z=s+c*h+r*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this.z=je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this.z=je(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=s*c-r*a,this.y=r*o-i*c,this.z=i*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Bo.copy(this).projectOnVector(e),this.sub(Bo)}reflect(e){return this.sub(Bo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Bo=new R,Jc=new di;class $e{constructor(e,t,i,s,r,o,a,c,l){$e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,c,l)}set(e,t,i,s,r,o,a,c,l){const u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=c,u[6]=i,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],u=i[4],h=i[7],f=i[2],m=i[5],g=i[8],_=s[0],p=s[3],d=s[6],x=s[1],E=s[4],M=s[7],w=s[2],C=s[5],T=s[8];return r[0]=o*_+a*x+c*w,r[3]=o*p+a*E+c*C,r[6]=o*d+a*M+c*T,r[1]=l*_+u*x+h*w,r[4]=l*p+u*E+h*C,r[7]=l*d+u*M+h*T,r[2]=f*_+m*x+g*w,r[5]=f*p+m*E+g*C,r[8]=f*d+m*M+g*T,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-i*r*u+i*a*c+s*r*l-s*o*c}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=u*o-a*l,f=a*c-u*r,m=l*r-o*c,g=t*h+i*f+s*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=h*_,e[1]=(s*l-u*i)*_,e[2]=(a*i-s*o)*_,e[3]=f*_,e[4]=(u*t-s*c)*_,e[5]=(s*r-a*t)*_,e[6]=m*_,e[7]=(i*c-l*t)*_,e[8]=(o*t-i*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){const c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*o+l*a)+o+e,-s*l,s*c,-s*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(ko.makeScale(e,t)),this}rotate(e){return this.premultiply(ko.makeRotation(-e)),this}translate(e,t){return this.premultiply(ko.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const ko=new $e;function Iu(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function ro(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Dd(){const n=ro("canvas");return n.style.display="block",n}const Qc={};function ar(n){n in Qc||(Qc[n]=!0,console.warn(n))}function Ld(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}const el=new $e().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),tl=new $e().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Id(){const n={enabled:!0,workingColorSpace:Ns,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===gt&&(s.r=ui(s.r),s.g=ui(s.g),s.b=ui(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===gt&&(s.r=ws(s.r),s.g=ws(s.g),s.b=ws(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ai?io:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return ar("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return ar("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Ns]:{primaries:e,whitePoint:i,transfer:io,toXYZ:el,fromXYZ:tl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:xn},outputColorSpaceConfig:{drawingBufferColorSpace:xn}},[xn]:{primaries:e,whitePoint:i,transfer:gt,toXYZ:el,fromXYZ:tl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:xn}}}),n}const st=Id();function ui(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function ws(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let os;class Ud{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{os===void 0&&(os=ro("canvas")),os.width=e.width,os.height=e.height;const s=os.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=os}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ro("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=ui(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(ui(t[i]/255)*255):t[i]=ui(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Nd=0;class Cc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Nd++}),this.uuid=fr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(zo(s[o].image)):r.push(zo(s[o]))}else r=zo(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function zo(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Ud.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Fd=0;const Ho=new R;class cn extends is{constructor(e=cn.DEFAULT_IMAGE,t=cn.DEFAULT_MAPPING,i=Zi,s=Zi,r=$n,o=Ji,a=Dn,c=hi,l=cn.DEFAULT_ANISOTROPY,u=Ai){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Fd++}),this.uuid=fr(),this.name="",this.source=new Cc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new We(0,0),this.repeat=new We(1,1),this.center=new We(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new $e,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Ho).x}get height(){return this.source.getSize(Ho).y}get depth(){return this.source.getSize(Ho).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==yu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Fa:e.x=e.x-Math.floor(e.x);break;case Zi:e.x=e.x<0?0:1;break;case Oa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Fa:e.y=e.y-Math.floor(e.y);break;case Zi:e.y=e.y<0?0:1;break;case Oa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}cn.DEFAULT_IMAGE=null;cn.DEFAULT_MAPPING=yu;cn.DEFAULT_ANISOTROPY=1;class Lt{constructor(e=0,t=0,i=0,s=1){Lt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const c=e.elements,l=c[0],u=c[4],h=c[8],f=c[1],m=c[5],g=c[9],_=c[2],p=c[6],d=c[10];if(Math.abs(u-f)<.01&&Math.abs(h-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+_)<.1&&Math.abs(g+p)<.1&&Math.abs(l+m+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(l+1)/2,M=(m+1)/2,w=(d+1)/2,C=(u+f)/4,T=(h+_)/4,L=(g+p)/4;return E>M&&E>w?E<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(E),s=C/i,r=T/i):M>w?M<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),i=C/s,r=L/s):w<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),i=T/r,s=L/r),this.set(i,s,r,t),this}let x=Math.sqrt((p-g)*(p-g)+(h-_)*(h-_)+(f-u)*(f-u));return Math.abs(x)<.001&&(x=1),this.x=(p-g)/x,this.y=(h-_)/x,this.z=(f-u)/x,this.w=Math.acos((l+m+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this.z=je(this.z,e.z,t.z),this.w=je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this.z=je(this.z,e,t),this.w=je(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Od extends is{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:$n,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Lt(0,0,e,t),this.scissorTest=!1,this.viewport=new Lt(0,0,e,t);const s={width:e,height:t,depth:i.depth},r=new cn(s);this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const t={minFilter:$n,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Cc(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class es extends Od{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Uu extends cn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Un,this.minFilter=Un,this.wrapR=Zi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Bd extends cn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Un,this.minFilter=Un,this.wrapR=Zi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Bs{constructor(e=new R(1/0,1/0,1/0),t=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Tn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Tn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Tn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Tn):Tn.fromBufferAttribute(r,o),Tn.applyMatrix4(e.matrixWorld),this.expandByPoint(Tn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Mr.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Mr.copy(i.boundingBox)),Mr.applyMatrix4(e.matrixWorld),this.union(Mr)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Tn),Tn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ws),Sr.subVectors(this.max,Ws),as.subVectors(e.a,Ws),cs.subVectors(e.b,Ws),ls.subVectors(e.c,Ws),mi.subVectors(cs,as),gi.subVectors(ls,cs),zi.subVectors(as,ls);let t=[0,-mi.z,mi.y,0,-gi.z,gi.y,0,-zi.z,zi.y,mi.z,0,-mi.x,gi.z,0,-gi.x,zi.z,0,-zi.x,-mi.y,mi.x,0,-gi.y,gi.x,0,-zi.y,zi.x,0];return!Vo(t,as,cs,ls,Sr)||(t=[1,0,0,0,1,0,0,0,1],!Vo(t,as,cs,ls,Sr))?!1:(Er.crossVectors(mi,gi),t=[Er.x,Er.y,Er.z],Vo(t,as,cs,ls,Sr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Tn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Tn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ei[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ei[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ei[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ei[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ei[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ei[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ei[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ei[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ei),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const ei=[new R,new R,new R,new R,new R,new R,new R,new R],Tn=new R,Mr=new Bs,as=new R,cs=new R,ls=new R,mi=new R,gi=new R,zi=new R,Ws=new R,Sr=new R,Er=new R,Hi=new R;function Vo(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){Hi.fromArray(n,r);const a=s.x*Math.abs(Hi.x)+s.y*Math.abs(Hi.y)+s.z*Math.abs(Hi.z),c=e.dot(Hi),l=t.dot(Hi),u=i.dot(Hi);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}const kd=new Bs,$s=new R,Go=new R;class vo{constructor(e=new R,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):kd.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;$s.subVectors(e,this.center);const t=$s.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector($s,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Go.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint($s.copy(e.center).add(Go)),this.expandByPoint($s.copy(e.center).sub(Go))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const ti=new R,Wo=new R,yr=new R,_i=new R,$o=new R,br=new R,Xo=new R;class xo{constructor(e=new R,t=new R(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ti)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ti.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ti.copy(this.origin).addScaledVector(this.direction,t),ti.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Wo.copy(e).add(t).multiplyScalar(.5),yr.copy(t).sub(e).normalize(),_i.copy(this.origin).sub(Wo);const r=e.distanceTo(t)*.5,o=-this.direction.dot(yr),a=_i.dot(this.direction),c=-_i.dot(yr),l=_i.lengthSq(),u=Math.abs(1-o*o);let h,f,m,g;if(u>0)if(h=o*c-a,f=o*a-c,g=r*u,h>=0)if(f>=-g)if(f<=g){const _=1/u;h*=_,f*=_,m=h*(h+o*f+2*a)+f*(o*h+f+2*c)+l}else f=r,h=Math.max(0,-(o*f+a)),m=-h*h+f*(f+2*c)+l;else f=-r,h=Math.max(0,-(o*f+a)),m=-h*h+f*(f+2*c)+l;else f<=-g?(h=Math.max(0,-(-o*r+a)),f=h>0?-r:Math.min(Math.max(-r,-c),r),m=-h*h+f*(f+2*c)+l):f<=g?(h=0,f=Math.min(Math.max(-r,-c),r),m=f*(f+2*c)+l):(h=Math.max(0,-(o*r+a)),f=h>0?r:Math.min(Math.max(-r,-c),r),m=-h*h+f*(f+2*c)+l);else f=o>0?-r:r,h=Math.max(0,-(o*f+a)),m=-h*h+f*(f+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Wo).addScaledVector(yr,f),m}intersectSphere(e,t){ti.subVectors(e.center,this.origin);const i=ti.dot(this.direction),s=ti.dot(ti)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,c;const l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return l>=0?(i=(e.min.x-f.x)*l,s=(e.max.x-f.x)*l):(i=(e.max.x-f.x)*l,s=(e.min.x-f.x)*l),u>=0?(r=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(r=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-f.z)*h,c=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,c=(e.min.z-f.z)*h),i>c||a>s)||((a>i||i!==i)&&(i=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,ti)!==null}intersectTriangle(e,t,i,s,r){$o.subVectors(t,e),br.subVectors(i,e),Xo.crossVectors($o,br);let o=this.direction.dot(Xo),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;_i.subVectors(this.origin,e);const c=a*this.direction.dot(br.crossVectors(_i,br));if(c<0)return null;const l=a*this.direction.dot($o.cross(_i));if(l<0||c+l>o)return null;const u=-a*_i.dot(Xo);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class vt{constructor(e,t,i,s,r,o,a,c,l,u,h,f,m,g,_,p){vt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,c,l,u,h,f,m,g,_,p)}set(e,t,i,s,r,o,a,c,l,u,h,f,m,g,_,p){const d=this.elements;return d[0]=e,d[4]=t,d[8]=i,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=c,d[2]=l,d[6]=u,d[10]=h,d[14]=f,d[3]=m,d[7]=g,d[11]=_,d[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new vt().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,s=1/us.setFromMatrixColumn(e,0).length(),r=1/us.setFromMatrixColumn(e,1).length(),o=1/us.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){const f=o*u,m=o*h,g=a*u,_=a*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=m+g*l,t[5]=f-_*l,t[9]=-a*c,t[2]=_-f*l,t[6]=g+m*l,t[10]=o*c}else if(e.order==="YXZ"){const f=c*u,m=c*h,g=l*u,_=l*h;t[0]=f+_*a,t[4]=g*a-m,t[8]=o*l,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=m*a-g,t[6]=_+f*a,t[10]=o*c}else if(e.order==="ZXY"){const f=c*u,m=c*h,g=l*u,_=l*h;t[0]=f-_*a,t[4]=-o*h,t[8]=g+m*a,t[1]=m+g*a,t[5]=o*u,t[9]=_-f*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const f=o*u,m=o*h,g=a*u,_=a*h;t[0]=c*u,t[4]=g*l-m,t[8]=f*l+_,t[1]=c*h,t[5]=_*l+f,t[9]=m*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const f=o*c,m=o*l,g=a*c,_=a*l;t[0]=c*u,t[4]=_-f*h,t[8]=g*h+m,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=m*h+g,t[10]=f-_*h}else if(e.order==="XZY"){const f=o*c,m=o*l,g=a*c,_=a*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=f*h+_,t[5]=o*u,t[9]=m*h-g,t[2]=g*h-m,t[6]=a*u,t[10]=_*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(zd,e,Hd)}lookAt(e,t,i){const s=this.elements;return fn.subVectors(e,t),fn.lengthSq()===0&&(fn.z=1),fn.normalize(),vi.crossVectors(i,fn),vi.lengthSq()===0&&(Math.abs(i.z)===1?fn.x+=1e-4:fn.z+=1e-4,fn.normalize(),vi.crossVectors(i,fn)),vi.normalize(),Ar.crossVectors(fn,vi),s[0]=vi.x,s[4]=Ar.x,s[8]=fn.x,s[1]=vi.y,s[5]=Ar.y,s[9]=fn.y,s[2]=vi.z,s[6]=Ar.z,s[10]=fn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],u=i[1],h=i[5],f=i[9],m=i[13],g=i[2],_=i[6],p=i[10],d=i[14],x=i[3],E=i[7],M=i[11],w=i[15],C=s[0],T=s[4],L=s[8],b=s[12],S=s[1],P=s[5],N=s[9],z=s[13],W=s[2],$=s[6],Y=s[10],Q=s[14],X=s[3],ae=s[7],me=s[11],Re=s[15];return r[0]=o*C+a*S+c*W+l*X,r[4]=o*T+a*P+c*$+l*ae,r[8]=o*L+a*N+c*Y+l*me,r[12]=o*b+a*z+c*Q+l*Re,r[1]=u*C+h*S+f*W+m*X,r[5]=u*T+h*P+f*$+m*ae,r[9]=u*L+h*N+f*Y+m*me,r[13]=u*b+h*z+f*Q+m*Re,r[2]=g*C+_*S+p*W+d*X,r[6]=g*T+_*P+p*$+d*ae,r[10]=g*L+_*N+p*Y+d*me,r[14]=g*b+_*z+p*Q+d*Re,r[3]=x*C+E*S+M*W+w*X,r[7]=x*T+E*P+M*$+w*ae,r[11]=x*L+E*N+M*Y+w*me,r[15]=x*b+E*z+M*Q+w*Re,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],h=e[6],f=e[10],m=e[14],g=e[3],_=e[7],p=e[11],d=e[15];return g*(+r*c*h-s*l*h-r*a*f+i*l*f+s*a*m-i*c*m)+_*(+t*c*m-t*l*f+r*o*f-s*o*m+s*l*u-r*c*u)+p*(+t*l*h-t*a*m-r*o*h+i*o*m+r*a*u-i*l*u)+d*(-s*a*u-t*c*h+t*a*f+s*o*h-i*o*f+i*c*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=e[9],f=e[10],m=e[11],g=e[12],_=e[13],p=e[14],d=e[15],x=h*p*l-_*f*l+_*c*m-a*p*m-h*c*d+a*f*d,E=g*f*l-u*p*l-g*c*m+o*p*m+u*c*d-o*f*d,M=u*_*l-g*h*l+g*a*m-o*_*m-u*a*d+o*h*d,w=g*h*c-u*_*c-g*a*f+o*_*f+u*a*p-o*h*p,C=t*x+i*E+s*M+r*w;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const T=1/C;return e[0]=x*T,e[1]=(_*f*r-h*p*r-_*s*m+i*p*m+h*s*d-i*f*d)*T,e[2]=(a*p*r-_*c*r+_*s*l-i*p*l-a*s*d+i*c*d)*T,e[3]=(h*c*r-a*f*r-h*s*l+i*f*l+a*s*m-i*c*m)*T,e[4]=E*T,e[5]=(u*p*r-g*f*r+g*s*m-t*p*m-u*s*d+t*f*d)*T,e[6]=(g*c*r-o*p*r-g*s*l+t*p*l+o*s*d-t*c*d)*T,e[7]=(o*f*r-u*c*r+u*s*l-t*f*l-o*s*m+t*c*m)*T,e[8]=M*T,e[9]=(g*h*r-u*_*r-g*i*m+t*_*m+u*i*d-t*h*d)*T,e[10]=(o*_*r-g*a*r+g*i*l-t*_*l-o*i*d+t*a*d)*T,e[11]=(u*a*r-o*h*r-u*i*l+t*h*l+o*i*m-t*a*m)*T,e[12]=w*T,e[13]=(u*_*s-g*h*s+g*i*f-t*_*f-u*i*p+t*h*p)*T,e[14]=(g*a*s-o*_*s-g*i*c+t*_*c+o*i*p-t*a*p)*T,e[15]=(o*h*s-u*a*s+u*i*c-t*h*c-o*i*f+t*a*f)*T,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,c=e.z,l=r*o,u=r*a;return this.set(l*o+i,l*a-s*c,l*c+s*a,0,l*a+s*c,u*a+i,u*c-s*o,0,l*c-s*a,u*c+s*o,r*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,u=o+o,h=a+a,f=r*l,m=r*u,g=r*h,_=o*u,p=o*h,d=a*h,x=c*l,E=c*u,M=c*h,w=i.x,C=i.y,T=i.z;return s[0]=(1-(_+d))*w,s[1]=(m+M)*w,s[2]=(g-E)*w,s[3]=0,s[4]=(m-M)*C,s[5]=(1-(f+d))*C,s[6]=(p+x)*C,s[7]=0,s[8]=(g+E)*T,s[9]=(p-x)*T,s[10]=(1-(f+_))*T,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;let r=us.set(s[0],s[1],s[2]).length();const o=us.set(s[4],s[5],s[6]).length(),a=us.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],wn.copy(this);const l=1/r,u=1/o,h=1/a;return wn.elements[0]*=l,wn.elements[1]*=l,wn.elements[2]*=l,wn.elements[4]*=u,wn.elements[5]*=u,wn.elements[6]*=u,wn.elements[8]*=h,wn.elements[9]*=h,wn.elements[10]*=h,t.setFromRotationMatrix(wn),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=Xn,c=!1){const l=this.elements,u=2*r/(t-e),h=2*r/(i-s),f=(t+e)/(t-e),m=(i+s)/(i-s);let g,_;if(c)g=r/(o-r),_=o*r/(o-r);else if(a===Xn)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===so)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=h,l[9]=m,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=Xn,c=!1){const l=this.elements,u=2/(t-e),h=2/(i-s),f=-(t+e)/(t-e),m=-(i+s)/(i-s);let g,_;if(c)g=1/(o-r),_=o/(o-r);else if(a===Xn)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===so)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=h,l[9]=0,l[13]=m,l[2]=0,l[6]=0,l[10]=g,l[14]=_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const us=new R,wn=new vt,zd=new R(0,0,0),Hd=new R(1,1,1),vi=new R,Ar=new R,fn=new R,nl=new vt,il=new di;class fi{constructor(e=0,t=0,i=0,s=fi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],u=s[9],h=s[2],f=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-je(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,m),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(je(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,m),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-je(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,m),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(je(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,m));break;case"XZY":this._z=Math.asin(-je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return nl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(nl,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return il.setFromEuler(this),this.setFromQuaternion(il,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}fi.DEFAULT_ORDER="XYZ";class Rc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Vd=0;const sl=new R,hs=new di,ni=new vt,Tr=new R,Xs=new R,Gd=new R,Wd=new di,rl=new R(1,0,0),ol=new R(0,1,0),al=new R(0,0,1),cl={type:"added"},$d={type:"removed"},ds={type:"childadded",child:null},qo={type:"childremoved",child:null};class Jt extends is{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Vd++}),this.uuid=fr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Jt.DEFAULT_UP.clone();const e=new R,t=new fi,i=new di,s=new R(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new vt},normalMatrix:{value:new $e}}),this.matrix=new vt,this.matrixWorld=new vt,this.matrixAutoUpdate=Jt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Jt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Rc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return hs.setFromAxisAngle(e,t),this.quaternion.multiply(hs),this}rotateOnWorldAxis(e,t){return hs.setFromAxisAngle(e,t),this.quaternion.premultiply(hs),this}rotateX(e){return this.rotateOnAxis(rl,e)}rotateY(e){return this.rotateOnAxis(ol,e)}rotateZ(e){return this.rotateOnAxis(al,e)}translateOnAxis(e,t){return sl.copy(e).applyQuaternion(this.quaternion),this.position.add(sl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(rl,e)}translateY(e){return this.translateOnAxis(ol,e)}translateZ(e){return this.translateOnAxis(al,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ni.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Tr.copy(e):Tr.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Xs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ni.lookAt(Xs,Tr,this.up):ni.lookAt(Tr,Xs,this.up),this.quaternion.setFromRotationMatrix(ni),s&&(ni.extractRotation(s.matrixWorld),hs.setFromRotationMatrix(ni),this.quaternion.premultiply(hs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(cl),ds.child=e,this.dispatchEvent(ds),ds.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent($d),qo.child=e,this.dispatchEvent(qo),qo.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ni.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ni.multiply(e.parent.matrixWorld)),e.applyMatrix4(ni),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(cl),ds.child=e,this.dispatchEvent(ds),ds.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xs,e,Gd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xs,Wd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];s.animations.push(r(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),h=o(e.shapes),f=o(e.skeletons),m=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),m.length>0&&(i.animations=m),g.length>0&&(i.nodes=g)}return i.object=s,i;function o(a){const c=[];for(const l in a){const u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}Jt.DEFAULT_UP=new R(0,1,0);Jt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Jt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Cn=new R,ii=new R,Yo=new R,si=new R,fs=new R,ps=new R,ll=new R,jo=new R,Ko=new R,Zo=new R,Jo=new Lt,Qo=new Lt,ea=new Lt;class Pn{constructor(e=new R,t=new R,i=new R){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Cn.subVectors(e,t),s.cross(Cn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Cn.subVectors(s,t),ii.subVectors(i,t),Yo.subVectors(e,t);const o=Cn.dot(Cn),a=Cn.dot(ii),c=Cn.dot(Yo),l=ii.dot(ii),u=ii.dot(Yo),h=o*l-a*a;if(h===0)return r.set(0,0,0),null;const f=1/h,m=(l*c-a*u)*f,g=(o*u-a*c)*f;return r.set(1-m-g,g,m)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,si)===null?!1:si.x>=0&&si.y>=0&&si.x+si.y<=1}static getInterpolation(e,t,i,s,r,o,a,c){return this.getBarycoord(e,t,i,s,si)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,si.x),c.addScaledVector(o,si.y),c.addScaledVector(a,si.z),c)}static getInterpolatedAttribute(e,t,i,s,r,o){return Jo.setScalar(0),Qo.setScalar(0),ea.setScalar(0),Jo.fromBufferAttribute(e,t),Qo.fromBufferAttribute(e,i),ea.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Jo,r.x),o.addScaledVector(Qo,r.y),o.addScaledVector(ea,r.z),o}static isFrontFacing(e,t,i,s){return Cn.subVectors(i,t),ii.subVectors(e,t),Cn.cross(ii).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Cn.subVectors(this.c,this.b),ii.subVectors(this.a,this.b),Cn.cross(ii).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Pn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Pn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return Pn.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return Pn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Pn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let o,a;fs.subVectors(s,i),ps.subVectors(r,i),jo.subVectors(e,i);const c=fs.dot(jo),l=ps.dot(jo);if(c<=0&&l<=0)return t.copy(i);Ko.subVectors(e,s);const u=fs.dot(Ko),h=ps.dot(Ko);if(u>=0&&h<=u)return t.copy(s);const f=c*h-u*l;if(f<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(i).addScaledVector(fs,o);Zo.subVectors(e,r);const m=fs.dot(Zo),g=ps.dot(Zo);if(g>=0&&m<=g)return t.copy(r);const _=m*l-c*g;if(_<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(i).addScaledVector(ps,a);const p=u*g-m*h;if(p<=0&&h-u>=0&&m-g>=0)return ll.subVectors(r,s),a=(h-u)/(h-u+(m-g)),t.copy(s).addScaledVector(ll,a);const d=1/(p+_+f);return o=_*d,a=f*d,t.copy(i).addScaledVector(fs,o).addScaledVector(ps,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Nu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},xi={h:0,s:0,l:0},wr={h:0,s:0,l:0};function ta(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class ut{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=xn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,st.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=st.workingColorSpace){return this.r=e,this.g=t,this.b=i,st.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=st.workingColorSpace){if(e=Rd(e,1),t=je(t,0,1),i=je(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=ta(o,r,e+1/3),this.g=ta(o,r,e),this.b=ta(o,r,e-1/3)}return st.colorSpaceToWorking(this,s),this}setStyle(e,t=xn){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=xn){const i=Nu[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ui(e.r),this.g=ui(e.g),this.b=ui(e.b),this}copyLinearToSRGB(e){return this.r=ws(e.r),this.g=ws(e.g),this.b=ws(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=xn){return st.workingToColorSpace(Yt.copy(this),e),Math.round(je(Yt.r*255,0,255))*65536+Math.round(je(Yt.g*255,0,255))*256+Math.round(je(Yt.b*255,0,255))}getHexString(e=xn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=st.workingColorSpace){st.workingToColorSpace(Yt.copy(this),t);const i=Yt.r,s=Yt.g,r=Yt.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let c,l;const u=(a+o)/2;if(a===o)c=0,l=0;else{const h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case i:c=(s-r)/h+(s<r?6:0);break;case s:c=(r-i)/h+2;break;case r:c=(i-s)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=st.workingColorSpace){return st.workingToColorSpace(Yt.copy(this),t),e.r=Yt.r,e.g=Yt.g,e.b=Yt.b,e}getStyle(e=xn){st.workingToColorSpace(Yt.copy(this),e);const t=Yt.r,i=Yt.g,s=Yt.b;return e!==xn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(xi),this.setHSL(xi.h+e,xi.s+t,xi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(xi),e.getHSL(wr);const i=Oo(xi.h,wr.h,t),s=Oo(xi.s,wr.s,t),r=Oo(xi.l,wr.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Yt=new ut;ut.NAMES=Nu;let Xd=0;class pr extends is{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Xd++}),this.uuid=fr(),this.name="",this.type="Material",this.blending=Ts,this.side=Ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Aa,this.blendDst=Ta,this.blendEquation=ji,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ut(0,0,0),this.blendAlpha=0,this.depthFunc=Ls,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=rs,this.stencilZFail=rs,this.stencilZPass=rs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ts&&(i.blending=this.blending),this.side!==Ui&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Aa&&(i.blendSrc=this.blendSrc),this.blendDst!==Ta&&(i.blendDst=this.blendDst),this.blendEquation!==ji&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Ls&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==jc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==rs&&(i.stencilFail=this.stencilFail),this.stencilZFail!==rs&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==rs&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Mo extends pr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ut(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fi,this.combine=Eu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const It=new R,Cr=new We;let qd=0;class jn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:qd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Kc,this.updateRanges=[],this.gpuType=li,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Cr.fromBufferAttribute(this,t),Cr.applyMatrix3(e),this.setXY(t,Cr.x,Cr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyMatrix3(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyMatrix4(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.applyNormalMatrix(e),this.setXYZ(t,It.x,It.y,It.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)It.fromBufferAttribute(this,t),It.transformDirection(e),this.setXYZ(t,It.x,It.y,It.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Gs(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=sn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Gs(t,this.array)),t}setX(e,t){return this.normalized&&(t=sn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Gs(t,this.array)),t}setY(e,t){return this.normalized&&(t=sn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Gs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=sn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Gs(t,this.array)),t}setW(e,t){return this.normalized&&(t=sn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=sn(t,this.array),i=sn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=sn(t,this.array),i=sn(i,this.array),s=sn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=sn(t,this.array),i=sn(i,this.array),s=sn(s,this.array),r=sn(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Kc&&(e.usage=this.usage),e}}class Fu extends jn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Ou extends jn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Ht extends jn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Yd=0;const vn=new vt,na=new Jt,ms=new R,pn=new Bs,qs=new Bs,Wt=new R;class $t extends is{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Yd++}),this.uuid=fr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Iu(e)?Ou:Fu)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new $e().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return vn.makeRotationFromQuaternion(e),this.applyMatrix4(vn),this}rotateX(e){return vn.makeRotationX(e),this.applyMatrix4(vn),this}rotateY(e){return vn.makeRotationY(e),this.applyMatrix4(vn),this}rotateZ(e){return vn.makeRotationZ(e),this.applyMatrix4(vn),this}translate(e,t,i){return vn.makeTranslation(e,t,i),this.applyMatrix4(vn),this}scale(e,t,i){return vn.makeScale(e,t,i),this.applyMatrix4(vn),this}lookAt(e){return na.lookAt(e),na.updateMatrix(),this.applyMatrix4(na.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ms).negate(),this.translate(ms.x,ms.y,ms.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ht(i,3))}else{const i=Math.min(e.length,t.count);for(let s=0;s<i;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Bs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];pn.setFromBufferAttribute(r),this.morphTargetsRelative?(Wt.addVectors(this.boundingBox.min,pn.min),this.boundingBox.expandByPoint(Wt),Wt.addVectors(this.boundingBox.max,pn.max),this.boundingBox.expandByPoint(Wt)):(this.boundingBox.expandByPoint(pn.min),this.boundingBox.expandByPoint(pn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new R,1/0);return}if(e){const i=this.boundingSphere.center;if(pn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];qs.setFromBufferAttribute(a),this.morphTargetsRelative?(Wt.addVectors(pn.min,qs.min),pn.expandByPoint(Wt),Wt.addVectors(pn.max,qs.max),pn.expandByPoint(Wt)):(pn.expandByPoint(qs.min),pn.expandByPoint(qs.max))}pn.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Wt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Wt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)Wt.fromBufferAttribute(a,l),c&&(ms.fromBufferAttribute(e,l),Wt.add(ms)),s=Math.max(s,i.distanceToSquared(Wt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new jn(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let L=0;L<i.count;L++)a[L]=new R,c[L]=new R;const l=new R,u=new R,h=new R,f=new We,m=new We,g=new We,_=new R,p=new R;function d(L,b,S){l.fromBufferAttribute(i,L),u.fromBufferAttribute(i,b),h.fromBufferAttribute(i,S),f.fromBufferAttribute(r,L),m.fromBufferAttribute(r,b),g.fromBufferAttribute(r,S),u.sub(l),h.sub(l),m.sub(f),g.sub(f);const P=1/(m.x*g.y-g.x*m.y);isFinite(P)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(h,-m.y).multiplyScalar(P),p.copy(h).multiplyScalar(m.x).addScaledVector(u,-g.x).multiplyScalar(P),a[L].add(_),a[b].add(_),a[S].add(_),c[L].add(p),c[b].add(p),c[S].add(p))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let L=0,b=x.length;L<b;++L){const S=x[L],P=S.start,N=S.count;for(let z=P,W=P+N;z<W;z+=3)d(e.getX(z+0),e.getX(z+1),e.getX(z+2))}const E=new R,M=new R,w=new R,C=new R;function T(L){w.fromBufferAttribute(s,L),C.copy(w);const b=a[L];E.copy(b),E.sub(w.multiplyScalar(w.dot(b))).normalize(),M.crossVectors(C,b);const P=M.dot(c[L])<0?-1:1;o.setXYZW(L,E.x,E.y,E.z,P)}for(let L=0,b=x.length;L<b;++L){const S=x[L],P=S.start,N=S.count;for(let z=P,W=P+N;z<W;z+=3)T(e.getX(z+0)),T(e.getX(z+1)),T(e.getX(z+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new jn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,m=i.count;f<m;f++)i.setXYZ(f,0,0,0);const s=new R,r=new R,o=new R,a=new R,c=new R,l=new R,u=new R,h=new R;if(e)for(let f=0,m=e.count;f<m;f+=3){const g=e.getX(f+0),_=e.getX(f+1),p=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,p),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(i,g),c.fromBufferAttribute(i,_),l.fromBufferAttribute(i,p),a.add(u),c.add(u),l.add(u),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(_,c.x,c.y,c.z),i.setXYZ(p,l.x,l.y,l.z)}else for(let f=0,m=t.count;f<m;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Wt.fromBufferAttribute(e,t),Wt.normalize(),e.setXYZ(t,Wt.x,Wt.y,Wt.z)}toNonIndexed(){function e(a,c){const l=a.array,u=a.itemSize,h=a.normalized,f=new l.constructor(c.length*u);let m=0,g=0;for(let _=0,p=c.length;_<p;_++){a.isInterleavedBufferAttribute?m=c[_]*a.data.stride+a.offset:m=c[_]*u;for(let d=0;d<u;d++)f[g++]=l[m++]}return new jn(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new $t,i=this.index.array,s=this.attributes;for(const a in s){const c=s[a],l=e(c,i);t.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const c=[],l=r[a];for(let u=0,h=l.length;u<h;u++){const f=l[u],m=e(f,i);c.push(m)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const c in i){const l=i[c];e.data.attributes[c]=l.toJSON(e.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let h=0,f=l.length;h<f;h++){const m=l[h];u.push(m.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const l in s){const u=s[l];this.setAttribute(l,u.clone(t))}const r=e.morphAttributes;for(const l in r){const u=[],h=r[l];for(let f=0,m=h.length;f<m;f++)u.push(h[f].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let l=0,u=o.length;l<u;l++){const h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ul=new vt,Vi=new xo,Rr=new vo,hl=new R,Pr=new R,Dr=new R,Lr=new R,ia=new R,Ir=new R,dl=new R,Ur=new R;class Ln extends Jt{constructor(e=new $t,t=new Mo){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Ir.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const u=a[c],h=r[c];u!==0&&(ia.fromBufferAttribute(h,e),o?Ir.addScaledVector(ia,u):Ir.addScaledVector(ia.sub(t),u))}t.add(Ir)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Rr.copy(i.boundingSphere),Rr.applyMatrix4(r),Vi.copy(e.ray).recast(e.near),!(Rr.containsPoint(Vi.origin)===!1&&(Vi.intersectSphere(Rr,hl)===null||Vi.origin.distanceToSquared(hl)>(e.far-e.near)**2))&&(ul.copy(r).invert(),Vi.copy(e.ray).applyMatrix4(ul),!(i.boundingBox!==null&&Vi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Vi)))}_computeIntersections(e,t,i){let s;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,f=r.groups,m=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=f.length;g<_;g++){const p=f[g],d=o[p.materialIndex],x=Math.max(p.start,m.start),E=Math.min(a.count,Math.min(p.start+p.count,m.start+m.count));for(let M=x,w=E;M<w;M+=3){const C=a.getX(M),T=a.getX(M+1),L=a.getX(M+2);s=Nr(this,d,e,i,l,u,h,C,T,L),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),_=Math.min(a.count,m.start+m.count);for(let p=g,d=_;p<d;p+=3){const x=a.getX(p),E=a.getX(p+1),M=a.getX(p+2);s=Nr(this,o,e,i,l,u,h,x,E,M),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,_=f.length;g<_;g++){const p=f[g],d=o[p.materialIndex],x=Math.max(p.start,m.start),E=Math.min(c.count,Math.min(p.start+p.count,m.start+m.count));for(let M=x,w=E;M<w;M+=3){const C=M,T=M+1,L=M+2;s=Nr(this,d,e,i,l,u,h,C,T,L),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),_=Math.min(c.count,m.start+m.count);for(let p=g,d=_;p<d;p+=3){const x=p,E=p+1,M=p+2;s=Nr(this,o,e,i,l,u,h,x,E,M),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}}}function jd(n,e,t,i,s,r,o,a){let c;if(e.side===an?c=i.intersectTriangle(o,r,s,!0,a):c=i.intersectTriangle(s,r,o,e.side===Ui,a),c===null)return null;Ur.copy(a),Ur.applyMatrix4(n.matrixWorld);const l=t.ray.origin.distanceTo(Ur);return l<t.near||l>t.far?null:{distance:l,point:Ur.clone(),object:n}}function Nr(n,e,t,i,s,r,o,a,c,l){n.getVertexPosition(a,Pr),n.getVertexPosition(c,Dr),n.getVertexPosition(l,Lr);const u=jd(n,e,t,i,Pr,Dr,Lr,dl);if(u){const h=new R;Pn.getBarycoord(dl,Pr,Dr,Lr,h),s&&(u.uv=Pn.getInterpolatedAttribute(s,a,c,l,h,new We)),r&&(u.uv1=Pn.getInterpolatedAttribute(r,a,c,l,h,new We)),o&&(u.normal=Pn.getInterpolatedAttribute(o,a,c,l,h,new R),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const f={a,b:c,c:l,normal:new R,materialIndex:0};Pn.getNormal(Pr,Dr,Lr,f.normal),u.face=f,u.barycoord=h}return u}class mr extends $t{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const c=[],l=[],u=[],h=[];let f=0,m=0;g("z","y","x",-1,-1,i,t,e,o,r,0),g("z","y","x",1,-1,i,t,-e,o,r,1),g("x","z","y",1,1,e,i,t,s,o,2),g("x","z","y",1,-1,e,i,-t,s,o,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new Ht(l,3)),this.setAttribute("normal",new Ht(u,3)),this.setAttribute("uv",new Ht(h,2));function g(_,p,d,x,E,M,w,C,T,L,b){const S=M/T,P=w/L,N=M/2,z=w/2,W=C/2,$=T+1,Y=L+1;let Q=0,X=0;const ae=new R;for(let me=0;me<Y;me++){const Re=me*P-z;for(let Ye=0;Ye<$;Ye++){const ot=Ye*S-N;ae[_]=ot*x,ae[p]=Re*E,ae[d]=W,l.push(ae.x,ae.y,ae.z),ae[_]=0,ae[p]=0,ae[d]=C>0?1:-1,u.push(ae.x,ae.y,ae.z),h.push(Ye/T),h.push(1-me/L),Q+=1}}for(let me=0;me<L;me++)for(let Re=0;Re<T;Re++){const Ye=f+Re+$*me,ot=f+Re+$*(me+1),Mt=f+(Re+1)+$*(me+1),et=f+(Re+1)+$*me;c.push(Ye,ot,et),c.push(ot,Mt,et),X+=6}a.addGroup(m,X,b),m+=X,f+=Q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mr(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Fs(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function en(n){const e={};for(let t=0;t<n.length;t++){const i=Fs(n[t]);for(const s in i)e[s]=i[s]}return e}function Kd(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Bu(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:st.workingColorSpace}const Zd={clone:Fs,merge:en};var Jd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Qd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ni extends pr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Jd,this.fragmentShader=Qd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Fs(e.uniforms),this.uniformsGroups=Kd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class ku extends Jt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new vt,this.projectionMatrix=new vt,this.projectionMatrixInverse=new vt,this.coordinateSystem=Xn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Mi=new R,fl=new We,pl=new We;class Mn extends ku{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=dc*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Qr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return dc*2*Math.atan(Math.tan(Qr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Mi.x,Mi.y).multiplyScalar(-e/Mi.z),Mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Mi.x,Mi.y).multiplyScalar(-e/Mi.z)}getViewSize(e,t){return this.getViewBounds(e,fl,pl),t.subVectors(pl,fl)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Qr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,t-=o.offsetY*i/l,s*=o.width/c,i*=o.height/l}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const gs=-90,_s=1;class ef extends Jt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Mn(gs,_s,e,t);s.layers=this.layers,this.add(s);const r=new Mn(gs,_s,e,t);r.layers=this.layers,this.add(r);const o=new Mn(gs,_s,e,t);o.layers=this.layers,this.add(o);const a=new Mn(gs,_s,e,t);a.layers=this.layers,this.add(a);const c=new Mn(gs,_s,e,t);c.layers=this.layers,this.add(c);const l=new Mn(gs,_s,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,c]=t;for(const l of t)this.remove(l);if(e===Xn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===so)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,l,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,c),e.setRenderTarget(i,4,s),e.render(t,l),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,s),e.render(t,u),e.setRenderTarget(h,f,m),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class zu extends cn{constructor(e=[],t=Is,i,s,r,o,a,c,l,u){super(e,t,i,s,r,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class tf extends es{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new zu(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new mr(5,5,5),r=new Ni({name:"CubemapFromEquirect",uniforms:Fs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:an,blending:Pi});r.uniforms.tEquirect.value=t;const o=new Ln(s,r),a=t.minFilter;return t.minFilter===Ji&&(t.minFilter=$n),new ef(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}}class Bn extends Jt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const nf={type:"move"};class sa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Bn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Bn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Bn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(const _ of e.hand.values()){const p=t.getJointPose(_,i),d=this._getHandJoint(l,_);p!==null&&(d.matrix.fromArray(p.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=p.radius),d.visible=p!==null}const u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],f=u.position.distanceTo(h.position),m=.02,g=.005;l.inputState.pinching&&f>m+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=m-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(nf)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Bn;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class sf extends Jt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new fi,this.environmentIntensity=1,this.environmentRotation=new fi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const ra=new R,rf=new R,of=new $e;class yi{constructor(e=new R(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=ra.subVectors(i,t).cross(rf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(ra),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||of.getNormalMatrix(e),s=this.coplanarPoint(ra).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Gi=new vo,af=new We(.5,.5),Fr=new R;class Hu{constructor(e=new yi,t=new yi,i=new yi,s=new yi,r=new yi,o=new yi){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Xn,i=!1){const s=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],l=r[3],u=r[4],h=r[5],f=r[6],m=r[7],g=r[8],_=r[9],p=r[10],d=r[11],x=r[12],E=r[13],M=r[14],w=r[15];if(s[0].setComponents(l-o,m-u,d-g,w-x).normalize(),s[1].setComponents(l+o,m+u,d+g,w+x).normalize(),s[2].setComponents(l+a,m+h,d+_,w+E).normalize(),s[3].setComponents(l-a,m-h,d-_,w-E).normalize(),i)s[4].setComponents(c,f,p,M).normalize(),s[5].setComponents(l-c,m-f,d-p,w-M).normalize();else if(s[4].setComponents(l-c,m-f,d-p,w-M).normalize(),t===Xn)s[5].setComponents(l+c,m+f,d+p,w+M).normalize();else if(t===so)s[5].setComponents(c,f,p,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Gi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Gi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Gi)}intersectsSprite(e){Gi.center.set(0,0,0);const t=af.distanceTo(e.center);return Gi.radius=.7071067811865476+t,Gi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Gi)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(Fr.x=s.normal.x>0?e.max.x:e.min.x,Fr.y=s.normal.y>0?e.max.y:e.min.y,Fr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Fr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Ti extends pr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ut(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const oo=new R,ao=new R,ml=new vt,Ys=new xo,Or=new vo,oa=new R,gl=new R;class co extends Jt{constructor(e=new $t,t=new Ti){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)oo.fromBufferAttribute(t,s-1),ao.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=oo.distanceTo(ao);e.setAttribute("lineDistance",new Ht(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Or.copy(i.boundingSphere),Or.applyMatrix4(s),Or.radius+=r,e.ray.intersectsSphere(Or)===!1)return;ml.copy(s).invert(),Ys.copy(e.ray).applyMatrix4(ml);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=i.index,f=i.attributes.position;if(u!==null){const m=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=m,p=g-1;_<p;_+=l){const d=u.getX(_),x=u.getX(_+1),E=Br(this,e,Ys,c,d,x,_);E&&t.push(E)}if(this.isLineLoop){const _=u.getX(g-1),p=u.getX(m),d=Br(this,e,Ys,c,_,p,g-1);d&&t.push(d)}}else{const m=Math.max(0,o.start),g=Math.min(f.count,o.start+o.count);for(let _=m,p=g-1;_<p;_+=l){const d=Br(this,e,Ys,c,_,_+1,_);d&&t.push(d)}if(this.isLineLoop){const _=Br(this,e,Ys,c,g-1,m,g-1);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Br(n,e,t,i,s,r,o){const a=n.geometry.attributes.position;if(oo.fromBufferAttribute(a,s),ao.fromBufferAttribute(a,r),t.distanceSqToSegment(oo,ao,oa,gl)>i)return;oa.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(oa);if(!(l<e.near||l>e.far))return{distance:l,point:gl.clone().applyMatrix4(n.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:n}}const _l=new R,vl=new R;class kr extends co{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)_l.fromBufferAttribute(t,s),vl.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+_l.distanceTo(vl);e.setAttribute("lineDistance",new Ht(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Vu extends cn{constructor(e,t,i=Qi,s,r,o,a=Un,c=Un,l,u=rr,h=1){if(u!==rr&&u!==or)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:e,height:t,depth:h};super(f,s,r,o,a,c,u,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Cc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Gu extends cn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class So extends $t{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};const l=this;s=Math.floor(s),r=Math.floor(r);const u=[],h=[],f=[],m=[];let g=0;const _=[],p=i/2;let d=0;x(),o===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(u),this.setAttribute("position",new Ht(h,3)),this.setAttribute("normal",new Ht(f,3)),this.setAttribute("uv",new Ht(m,2));function x(){const M=new R,w=new R;let C=0;const T=(t-e)/i;for(let L=0;L<=r;L++){const b=[],S=L/r,P=S*(t-e)+e;for(let N=0;N<=s;N++){const z=N/s,W=z*c+a,$=Math.sin(W),Y=Math.cos(W);w.x=P*$,w.y=-S*i+p,w.z=P*Y,h.push(w.x,w.y,w.z),M.set($,T,Y).normalize(),f.push(M.x,M.y,M.z),m.push(z,1-S),b.push(g++)}_.push(b)}for(let L=0;L<s;L++)for(let b=0;b<r;b++){const S=_[b][L],P=_[b+1][L],N=_[b+1][L+1],z=_[b][L+1];(e>0||b!==0)&&(u.push(S,P,z),C+=3),(t>0||b!==r-1)&&(u.push(P,N,z),C+=3)}l.addGroup(d,C,0),d+=C}function E(M){const w=g,C=new We,T=new R;let L=0;const b=M===!0?e:t,S=M===!0?1:-1;for(let N=1;N<=s;N++)h.push(0,p*S,0),f.push(0,S,0),m.push(.5,.5),g++;const P=g;for(let N=0;N<=s;N++){const W=N/s*c+a,$=Math.cos(W),Y=Math.sin(W);T.x=b*Y,T.y=p*S,T.z=b*$,h.push(T.x,T.y,T.z),f.push(0,S,0),C.x=$*.5+.5,C.y=Y*.5*S+.5,m.push(C.x,C.y),g++}for(let N=0;N<s;N++){const z=w+N,W=P+N;M===!0?u.push(W,W+1,z):u.push(W+1,W,z),L+=3}l.addGroup(d,L,M===!0?1:2),d+=L}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new So(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Eo extends So{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new Eo(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class yo extends $t{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(i),c=Math.floor(s),l=a+1,u=c+1,h=e/a,f=t/c,m=[],g=[],_=[],p=[];for(let d=0;d<u;d++){const x=d*f-o;for(let E=0;E<l;E++){const M=E*h-r;g.push(M,-x,0),_.push(0,0,1),p.push(E/a),p.push(1-d/c)}}for(let d=0;d<c;d++)for(let x=0;x<a;x++){const E=x+l*d,M=x+l*(d+1),w=x+1+l*(d+1),C=x+1+l*d;m.push(E,M,C),m.push(M,w,C)}this.setIndex(m),this.setAttribute("position",new Ht(g,3)),this.setAttribute("normal",new Ht(_,3)),this.setAttribute("uv",new Ht(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new yo(e.width,e.height,e.widthSegments,e.heightSegments)}}class Pc extends $t{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const c=Math.min(o+a,Math.PI);let l=0;const u=[],h=new R,f=new R,m=[],g=[],_=[],p=[];for(let d=0;d<=i;d++){const x=[],E=d/i;let M=0;d===0&&o===0?M=.5/t:d===i&&c===Math.PI&&(M=-.5/t);for(let w=0;w<=t;w++){const C=w/t;h.x=-e*Math.cos(s+C*r)*Math.sin(o+E*a),h.y=e*Math.cos(o+E*a),h.z=e*Math.sin(s+C*r)*Math.sin(o+E*a),g.push(h.x,h.y,h.z),f.copy(h).normalize(),_.push(f.x,f.y,f.z),p.push(C+M,1-E),x.push(l++)}u.push(x)}for(let d=0;d<i;d++)for(let x=0;x<t;x++){const E=u[d][x+1],M=u[d][x],w=u[d+1][x],C=u[d+1][x+1];(d!==0||o>0)&&m.push(E,M,C),(d!==i-1||c<Math.PI)&&m.push(M,w,C)}this.setIndex(m),this.setAttribute("position",new Ht(g,3)),this.setAttribute("normal",new Ht(_,3)),this.setAttribute("uv",new Ht(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Pc(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class cf extends $t{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){const t=[],i=new Set,s=new R,r=new R;if(e.index!==null){const o=e.attributes.position,a=e.index;let c=e.groups;c.length===0&&(c=[{start:0,count:a.count,materialIndex:0}]);for(let l=0,u=c.length;l<u;++l){const h=c[l],f=h.start,m=h.count;for(let g=f,_=f+m;g<_;g+=3)for(let p=0;p<3;p++){const d=a.getX(g+p),x=a.getX(g+(p+1)%3);s.fromBufferAttribute(o,d),r.fromBufferAttribute(o,x),xl(s,r,i)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}}else{const o=e.attributes.position;for(let a=0,c=o.count/3;a<c;a++)for(let l=0;l<3;l++){const u=3*a+l,h=3*a+(l+1)%3;s.fromBufferAttribute(o,u),r.fromBufferAttribute(o,h),xl(s,r,i)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}this.setAttribute("position",new Ht(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}function xl(n,e,t){const i=`${n.x},${n.y},${n.z}-${e.x},${e.y},${e.z}`,s=`${e.x},${e.y},${e.z}-${n.x},${n.y},${n.z}`;return t.has(i)===!0||t.has(s)===!0?!1:(t.add(i),t.add(s),!0)}class lf extends pr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=vd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class uf extends pr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Ml extends Ti{constructor(e){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}}class hf extends ku{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=s+t,c=s-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class df extends Mn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Sl=new vt;class El{constructor(e,t,i=0,s=1/0){this.ray=new xo(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new Rc,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Sl.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Sl),this}intersectObject(e,t=!0,i=[]){return fc(e,this,i,t),i.sort(yl),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)fc(e[s],this,i,t);return i.sort(yl),i}}function yl(n,e){return n.distance-e.distance}function fc(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){const r=n.children;for(let o=0,a=r.length;o<a;o++)fc(r[o],e,t,!0)}}class bl{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=je(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(je(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const Al=new R;let zr,aa;class ff extends Jt{constructor(e=new R(0,0,1),t=new R(0,0,0),i=1,s=16776960,r=i*.2,o=r*.2){super(),this.type="ArrowHelper",zr===void 0&&(zr=new $t,zr.setAttribute("position",new Ht([0,0,0,0,1,0],3)),aa=new Eo(.5,1,5,1),aa.translate(0,-.5,0)),this.position.copy(t),this.line=new co(zr,new Ti({color:s,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new Ln(aa,new Mo({color:s,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(i,r,o)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{Al.set(e.z,0,-e.x).normalize();const t=Math.acos(e.y);this.quaternion.setFromAxisAngle(Al,t)}}setLength(e,t=e*.2,i=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(i,t,i),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}}class pf extends is{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function Tl(n,e,t,i){const s=mf(i);switch(t){case Cu:return n*e;case Pu:return n*e/s.components*s.byteLength;case Ac:return n*e/s.components*s.byteLength;case Du:return n*e*2/s.components*s.byteLength;case Tc:return n*e*2/s.components*s.byteLength;case Ru:return n*e*3/s.components*s.byteLength;case Dn:return n*e*4/s.components*s.byteLength;case wc:return n*e*4/s.components*s.byteLength;case jr:case Kr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Zr:case Jr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case ka:case Ha:return Math.max(n,16)*Math.max(e,8)/4;case Ba:case za:return Math.max(n,8)*Math.max(e,8)/2;case Va:case Ga:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Wa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case $a:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Xa:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case qa:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Ya:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case ja:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Ka:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Za:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Ja:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Qa:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case ec:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case tc:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case nc:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case ic:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case sc:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case rc:case oc:case ac:return Math.ceil(n/4)*Math.ceil(e/4)*16;case cc:case lc:return Math.ceil(n/4)*Math.ceil(e/4)*8;case uc:case hc:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function mf(n){switch(n){case hi:case bu:return{byteLength:1,components:1};case ir:case Au:case dr:return{byteLength:2,components:1};case yc:case bc:return{byteLength:2,components:4};case Qi:case Ec:case li:return{byteLength:4,components:1};case Tu:case wu:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Sc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Sc);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Wu(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function gf(n){const e=new WeakMap;function t(a,c){const l=a.array,u=a.usage,h=l.byteLength,f=n.createBuffer();n.bindBuffer(c,f),n.bufferData(c,l,u),a.onUploadCallback();let m;if(l instanceof Float32Array)m=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)m=n.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?m=n.HALF_FLOAT:m=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)m=n.SHORT;else if(l instanceof Uint32Array)m=n.UNSIGNED_INT;else if(l instanceof Int32Array)m=n.INT;else if(l instanceof Int8Array)m=n.BYTE;else if(l instanceof Uint8Array)m=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)m=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:m,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,c,l){const u=c.array,h=c.updateRanges;if(n.bindBuffer(l,a),h.length===0)n.bufferSubData(l,0,u);else{h.sort((m,g)=>m.start-g.start);let f=0;for(let m=1;m<h.length;m++){const g=h[f],_=h[m];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++f,h[f]=_)}h.length=f+1;for(let m=0,g=h.length;m<g;m++){const _=h[m];n.bufferSubData(l,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=e.get(a);c&&(n.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var _f=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,vf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,xf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Mf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Sf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ef=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,yf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,bf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Af=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Tf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,wf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Cf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Rf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Pf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Df=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Lf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,If=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Uf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Nf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ff=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Of=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Bf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,kf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,zf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Hf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Vf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Gf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Wf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,$f=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Xf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,qf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Yf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,jf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Kf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Zf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Jf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Qf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ep=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,tp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,np=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ip=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,sp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,rp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,op=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ap=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,up=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,hp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,dp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,fp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,pp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,mp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,gp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,_p=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,vp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,xp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Mp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Sp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ep=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,yp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,bp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ap=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Tp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,wp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Cp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Rp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Pp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Dp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Lp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ip=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Up=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Np=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Fp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Op=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Bp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,kp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,zp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Hp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Vp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Gp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Wp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,$p=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Xp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,qp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Yp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,jp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Kp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Zp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Jp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Qp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,em=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,tm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,nm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,im=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,sm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,rm=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,om=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,am=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,cm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,lm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,um=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,hm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,dm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,fm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,pm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,mm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const gm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,_m=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,xm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Mm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Sm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Em=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,ym=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,bm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Am=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Tm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,wm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Rm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Pm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Dm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Lm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Im=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Um=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Nm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Om=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Bm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,km=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Hm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Gm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,$m=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Xm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,qm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ym=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,jm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qe={alphahash_fragment:_f,alphahash_pars_fragment:vf,alphamap_fragment:xf,alphamap_pars_fragment:Mf,alphatest_fragment:Sf,alphatest_pars_fragment:Ef,aomap_fragment:yf,aomap_pars_fragment:bf,batching_pars_vertex:Af,batching_vertex:Tf,begin_vertex:wf,beginnormal_vertex:Cf,bsdfs:Rf,iridescence_fragment:Pf,bumpmap_pars_fragment:Df,clipping_planes_fragment:Lf,clipping_planes_pars_fragment:If,clipping_planes_pars_vertex:Uf,clipping_planes_vertex:Nf,color_fragment:Ff,color_pars_fragment:Of,color_pars_vertex:Bf,color_vertex:kf,common:zf,cube_uv_reflection_fragment:Hf,defaultnormal_vertex:Vf,displacementmap_pars_vertex:Gf,displacementmap_vertex:Wf,emissivemap_fragment:$f,emissivemap_pars_fragment:Xf,colorspace_fragment:qf,colorspace_pars_fragment:Yf,envmap_fragment:jf,envmap_common_pars_fragment:Kf,envmap_pars_fragment:Zf,envmap_pars_vertex:Jf,envmap_physical_pars_fragment:lp,envmap_vertex:Qf,fog_vertex:ep,fog_pars_vertex:tp,fog_fragment:np,fog_pars_fragment:ip,gradientmap_pars_fragment:sp,lightmap_pars_fragment:rp,lights_lambert_fragment:op,lights_lambert_pars_fragment:ap,lights_pars_begin:cp,lights_toon_fragment:up,lights_toon_pars_fragment:hp,lights_phong_fragment:dp,lights_phong_pars_fragment:fp,lights_physical_fragment:pp,lights_physical_pars_fragment:mp,lights_fragment_begin:gp,lights_fragment_maps:_p,lights_fragment_end:vp,logdepthbuf_fragment:xp,logdepthbuf_pars_fragment:Mp,logdepthbuf_pars_vertex:Sp,logdepthbuf_vertex:Ep,map_fragment:yp,map_pars_fragment:bp,map_particle_fragment:Ap,map_particle_pars_fragment:Tp,metalnessmap_fragment:wp,metalnessmap_pars_fragment:Cp,morphinstance_vertex:Rp,morphcolor_vertex:Pp,morphnormal_vertex:Dp,morphtarget_pars_vertex:Lp,morphtarget_vertex:Ip,normal_fragment_begin:Up,normal_fragment_maps:Np,normal_pars_fragment:Fp,normal_pars_vertex:Op,normal_vertex:Bp,normalmap_pars_fragment:kp,clearcoat_normal_fragment_begin:zp,clearcoat_normal_fragment_maps:Hp,clearcoat_pars_fragment:Vp,iridescence_pars_fragment:Gp,opaque_fragment:Wp,packing:$p,premultiplied_alpha_fragment:Xp,project_vertex:qp,dithering_fragment:Yp,dithering_pars_fragment:jp,roughnessmap_fragment:Kp,roughnessmap_pars_fragment:Zp,shadowmap_pars_fragment:Jp,shadowmap_pars_vertex:Qp,shadowmap_vertex:em,shadowmask_pars_fragment:tm,skinbase_vertex:nm,skinning_pars_vertex:im,skinning_vertex:sm,skinnormal_vertex:rm,specularmap_fragment:om,specularmap_pars_fragment:am,tonemapping_fragment:cm,tonemapping_pars_fragment:lm,transmission_fragment:um,transmission_pars_fragment:hm,uv_pars_fragment:dm,uv_pars_vertex:fm,uv_vertex:pm,worldpos_vertex:mm,background_vert:gm,background_frag:_m,backgroundCube_vert:vm,backgroundCube_frag:xm,cube_vert:Mm,cube_frag:Sm,depth_vert:Em,depth_frag:ym,distanceRGBA_vert:bm,distanceRGBA_frag:Am,equirect_vert:Tm,equirect_frag:wm,linedashed_vert:Cm,linedashed_frag:Rm,meshbasic_vert:Pm,meshbasic_frag:Dm,meshlambert_vert:Lm,meshlambert_frag:Im,meshmatcap_vert:Um,meshmatcap_frag:Nm,meshnormal_vert:Fm,meshnormal_frag:Om,meshphong_vert:Bm,meshphong_frag:km,meshphysical_vert:zm,meshphysical_frag:Hm,meshtoon_vert:Vm,meshtoon_frag:Gm,points_vert:Wm,points_frag:$m,shadow_vert:Xm,shadow_frag:qm,sprite_vert:Ym,sprite_frag:jm},de={common:{diffuse:{value:new ut(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new $e},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new $e}},envmap:{envMap:{value:null},envMapRotation:{value:new $e},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new $e}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new $e}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new $e},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new $e},normalScale:{value:new We(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new $e},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new $e}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new $e}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new $e}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ut(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ut(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0},uvTransform:{value:new $e}},sprite:{diffuse:{value:new ut(16777215)},opacity:{value:1},center:{value:new We(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new $e},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0}}},kn={basic:{uniforms:en([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.fog]),vertexShader:qe.meshbasic_vert,fragmentShader:qe.meshbasic_frag},lambert:{uniforms:en([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.fog,de.lights,{emissive:{value:new ut(0)}}]),vertexShader:qe.meshlambert_vert,fragmentShader:qe.meshlambert_frag},phong:{uniforms:en([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.fog,de.lights,{emissive:{value:new ut(0)},specular:{value:new ut(1118481)},shininess:{value:30}}]),vertexShader:qe.meshphong_vert,fragmentShader:qe.meshphong_frag},standard:{uniforms:en([de.common,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.roughnessmap,de.metalnessmap,de.fog,de.lights,{emissive:{value:new ut(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag},toon:{uniforms:en([de.common,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.gradientmap,de.fog,de.lights,{emissive:{value:new ut(0)}}]),vertexShader:qe.meshtoon_vert,fragmentShader:qe.meshtoon_frag},matcap:{uniforms:en([de.common,de.bumpmap,de.normalmap,de.displacementmap,de.fog,{matcap:{value:null}}]),vertexShader:qe.meshmatcap_vert,fragmentShader:qe.meshmatcap_frag},points:{uniforms:en([de.points,de.fog]),vertexShader:qe.points_vert,fragmentShader:qe.points_frag},dashed:{uniforms:en([de.common,de.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qe.linedashed_vert,fragmentShader:qe.linedashed_frag},depth:{uniforms:en([de.common,de.displacementmap]),vertexShader:qe.depth_vert,fragmentShader:qe.depth_frag},normal:{uniforms:en([de.common,de.bumpmap,de.normalmap,de.displacementmap,{opacity:{value:1}}]),vertexShader:qe.meshnormal_vert,fragmentShader:qe.meshnormal_frag},sprite:{uniforms:en([de.sprite,de.fog]),vertexShader:qe.sprite_vert,fragmentShader:qe.sprite_frag},background:{uniforms:{uvTransform:{value:new $e},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qe.background_vert,fragmentShader:qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new $e}},vertexShader:qe.backgroundCube_vert,fragmentShader:qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qe.cube_vert,fragmentShader:qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qe.equirect_vert,fragmentShader:qe.equirect_frag},distanceRGBA:{uniforms:en([de.common,de.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qe.distanceRGBA_vert,fragmentShader:qe.distanceRGBA_frag},shadow:{uniforms:en([de.lights,de.fog,{color:{value:new ut(0)},opacity:{value:1}}]),vertexShader:qe.shadow_vert,fragmentShader:qe.shadow_frag}};kn.physical={uniforms:en([kn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new $e},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new $e},clearcoatNormalScale:{value:new We(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new $e},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new $e},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new $e},sheen:{value:0},sheenColor:{value:new ut(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new $e},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new $e},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new $e},transmissionSamplerSize:{value:new We},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new $e},attenuationDistance:{value:0},attenuationColor:{value:new ut(0)},specularColor:{value:new ut(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new $e},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new $e},anisotropyVector:{value:new We},anisotropyMap:{value:null},anisotropyMapTransform:{value:new $e}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag};const Hr={r:0,b:0,g:0},Wi=new fi,Km=new vt;function Zm(n,e,t,i,s,r,o){const a=new ut(0);let c=r===!0?0:1,l,u,h=null,f=0,m=null;function g(E){let M=E.isScene===!0?E.background:null;return M&&M.isTexture&&(M=(E.backgroundBlurriness>0?t:e).get(M)),M}function _(E){let M=!1;const w=g(E);w===null?d(a,c):w&&w.isColor&&(d(w,1),M=!0);const C=n.xr.getEnvironmentBlendMode();C==="additive"?i.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||M)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function p(E,M){const w=g(M);w&&(w.isCubeTexture||w.mapping===_o)?(u===void 0&&(u=new Ln(new mr(1,1,1),new Ni({name:"BackgroundCubeMaterial",uniforms:Fs(kn.backgroundCube.uniforms),vertexShader:kn.backgroundCube.vertexShader,fragmentShader:kn.backgroundCube.fragmentShader,side:an,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(C,T,L){this.matrixWorld.copyPosition(L.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),Wi.copy(M.backgroundRotation),Wi.x*=-1,Wi.y*=-1,Wi.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(Wi.y*=-1,Wi.z*=-1),u.material.uniforms.envMap.value=w,u.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Km.makeRotationFromEuler(Wi)),u.material.toneMapped=st.getTransfer(w.colorSpace)!==gt,(h!==w||f!==w.version||m!==n.toneMapping)&&(u.material.needsUpdate=!0,h=w,f=w.version,m=n.toneMapping),u.layers.enableAll(),E.unshift(u,u.geometry,u.material,0,0,null)):w&&w.isTexture&&(l===void 0&&(l=new Ln(new yo(2,2),new Ni({name:"BackgroundMaterial",uniforms:Fs(kn.background.uniforms),vertexShader:kn.background.vertexShader,fragmentShader:kn.background.fragmentShader,side:Ui,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=w,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=st.getTransfer(w.colorSpace)!==gt,w.matrixAutoUpdate===!0&&w.updateMatrix(),l.material.uniforms.uvTransform.value.copy(w.matrix),(h!==w||f!==w.version||m!==n.toneMapping)&&(l.material.needsUpdate=!0,h=w,f=w.version,m=n.toneMapping),l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null))}function d(E,M){E.getRGB(Hr,Bu(n)),i.buffers.color.setClear(Hr.r,Hr.g,Hr.b,M,o)}function x(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(E,M=1){a.set(E),c=M,d(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(E){c=E,d(a,c)},render:_,addToRenderList:p,dispose:x}}function Jm(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=f(null);let r=s,o=!1;function a(S,P,N,z,W){let $=!1;const Y=h(z,N,P);r!==Y&&(r=Y,l(r.object)),$=m(S,z,N,W),$&&g(S,z,N,W),W!==null&&e.update(W,n.ELEMENT_ARRAY_BUFFER),($||o)&&(o=!1,M(S,P,N,z),W!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(W).buffer))}function c(){return n.createVertexArray()}function l(S){return n.bindVertexArray(S)}function u(S){return n.deleteVertexArray(S)}function h(S,P,N){const z=N.wireframe===!0;let W=i[S.id];W===void 0&&(W={},i[S.id]=W);let $=W[P.id];$===void 0&&($={},W[P.id]=$);let Y=$[z];return Y===void 0&&(Y=f(c()),$[z]=Y),Y}function f(S){const P=[],N=[],z=[];for(let W=0;W<t;W++)P[W]=0,N[W]=0,z[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:N,attributeDivisors:z,object:S,attributes:{},index:null}}function m(S,P,N,z){const W=r.attributes,$=P.attributes;let Y=0;const Q=N.getAttributes();for(const X in Q)if(Q[X].location>=0){const me=W[X];let Re=$[X];if(Re===void 0&&(X==="instanceMatrix"&&S.instanceMatrix&&(Re=S.instanceMatrix),X==="instanceColor"&&S.instanceColor&&(Re=S.instanceColor)),me===void 0||me.attribute!==Re||Re&&me.data!==Re.data)return!0;Y++}return r.attributesNum!==Y||r.index!==z}function g(S,P,N,z){const W={},$=P.attributes;let Y=0;const Q=N.getAttributes();for(const X in Q)if(Q[X].location>=0){let me=$[X];me===void 0&&(X==="instanceMatrix"&&S.instanceMatrix&&(me=S.instanceMatrix),X==="instanceColor"&&S.instanceColor&&(me=S.instanceColor));const Re={};Re.attribute=me,me&&me.data&&(Re.data=me.data),W[X]=Re,Y++}r.attributes=W,r.attributesNum=Y,r.index=z}function _(){const S=r.newAttributes;for(let P=0,N=S.length;P<N;P++)S[P]=0}function p(S){d(S,0)}function d(S,P){const N=r.newAttributes,z=r.enabledAttributes,W=r.attributeDivisors;N[S]=1,z[S]===0&&(n.enableVertexAttribArray(S),z[S]=1),W[S]!==P&&(n.vertexAttribDivisor(S,P),W[S]=P)}function x(){const S=r.newAttributes,P=r.enabledAttributes;for(let N=0,z=P.length;N<z;N++)P[N]!==S[N]&&(n.disableVertexAttribArray(N),P[N]=0)}function E(S,P,N,z,W,$,Y){Y===!0?n.vertexAttribIPointer(S,P,N,W,$):n.vertexAttribPointer(S,P,N,z,W,$)}function M(S,P,N,z){_();const W=z.attributes,$=N.getAttributes(),Y=P.defaultAttributeValues;for(const Q in $){const X=$[Q];if(X.location>=0){let ae=W[Q];if(ae===void 0&&(Q==="instanceMatrix"&&S.instanceMatrix&&(ae=S.instanceMatrix),Q==="instanceColor"&&S.instanceColor&&(ae=S.instanceColor)),ae!==void 0){const me=ae.normalized,Re=ae.itemSize,Ye=e.get(ae);if(Ye===void 0)continue;const ot=Ye.buffer,Mt=Ye.type,et=Ye.bytesPerElement,J=Mt===n.INT||Mt===n.UNSIGNED_INT||ae.gpuType===Ec;if(ae.isInterleavedBufferAttribute){const ne=ae.data,Me=ne.stride,Le=ae.offset;if(ne.isInstancedInterleavedBuffer){for(let Ce=0;Ce<X.locationSize;Ce++)d(X.location+Ce,ne.meshPerAttribute);S.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let Ce=0;Ce<X.locationSize;Ce++)p(X.location+Ce);n.bindBuffer(n.ARRAY_BUFFER,ot);for(let Ce=0;Ce<X.locationSize;Ce++)E(X.location+Ce,Re/X.locationSize,Mt,me,Me*et,(Le+Re/X.locationSize*Ce)*et,J)}else{if(ae.isInstancedBufferAttribute){for(let ne=0;ne<X.locationSize;ne++)d(X.location+ne,ae.meshPerAttribute);S.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let ne=0;ne<X.locationSize;ne++)p(X.location+ne);n.bindBuffer(n.ARRAY_BUFFER,ot);for(let ne=0;ne<X.locationSize;ne++)E(X.location+ne,Re/X.locationSize,Mt,me,Re*et,Re/X.locationSize*ne*et,J)}}else if(Y!==void 0){const me=Y[Q];if(me!==void 0)switch(me.length){case 2:n.vertexAttrib2fv(X.location,me);break;case 3:n.vertexAttrib3fv(X.location,me);break;case 4:n.vertexAttrib4fv(X.location,me);break;default:n.vertexAttrib1fv(X.location,me)}}}}x()}function w(){L();for(const S in i){const P=i[S];for(const N in P){const z=P[N];for(const W in z)u(z[W].object),delete z[W];delete P[N]}delete i[S]}}function C(S){if(i[S.id]===void 0)return;const P=i[S.id];for(const N in P){const z=P[N];for(const W in z)u(z[W].object),delete z[W];delete P[N]}delete i[S.id]}function T(S){for(const P in i){const N=i[P];if(N[S.id]===void 0)continue;const z=N[S.id];for(const W in z)u(z[W].object),delete z[W];delete N[S.id]}}function L(){b(),o=!0,r!==s&&(r=s,l(r.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:L,resetDefaultState:b,dispose:w,releaseStatesOfGeometry:C,releaseStatesOfProgram:T,initAttributes:_,enableAttribute:p,disableUnusedAttributes:x}}function Qm(n,e,t){let i;function s(l){i=l}function r(l,u){n.drawArrays(i,l,u),t.update(u,i,1)}function o(l,u,h){h!==0&&(n.drawArraysInstanced(i,l,u,h),t.update(u,i,h))}function a(l,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,u,0,h);let m=0;for(let g=0;g<h;g++)m+=u[g];t.update(m,i,1)}function c(l,u,h,f){if(h===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<l.length;g++)o(l[g],u[g],f[g]);else{m.multiDrawArraysInstancedWEBGL(i,l,0,u,0,f,0,h);let g=0;for(let _=0;_<h;_++)g+=u[_]*f[_];t.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function eg(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const T=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(T){return!(T!==Dn&&i.convert(T)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){const L=T===dr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(T!==hi&&i.convert(T)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==li&&!L)}function c(T){if(T==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const u=c(l);u!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);const h=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),m=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),p=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),x=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),E=n.getParameter(n.MAX_VARYING_VECTORS),M=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),w=g>0,C=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:m,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:p,maxAttributes:d,maxVertexUniforms:x,maxVaryings:E,maxFragmentUniforms:M,vertexTextures:w,maxSamples:C}}function tg(n){const e=this;let t=null,i=0,s=!1,r=!1;const o=new yi,a=new $e,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){const m=h.length!==0||f||i!==0||s;return s=f,i=h.length,m},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,m){const g=h.clippingPlanes,_=h.clipIntersection,p=h.clipShadows,d=n.get(h);if(!s||g===null||g.length===0||r&&!p)r?u(null):l();else{const x=r?0:i,E=x*4;let M=d.clippingState||null;c.value=M,M=u(g,f,E,m);for(let w=0;w!==E;++w)M[w]=t[w];d.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,f,m,g){const _=h!==null?h.length:0;let p=null;if(_!==0){if(p=c.value,g!==!0||p===null){const d=m+_*4,x=f.matrixWorldInverse;a.getNormalMatrix(x),(p===null||p.length<d)&&(p=new Float32Array(d));for(let E=0,M=m;E!==_;++E,M+=4)o.copy(h[E]).applyMatrix4(x,a),o.normal.toArray(p,M),p[M+3]=o.constant}c.value=p,c.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,p}}function ng(n){let e=new WeakMap;function t(o,a){return a===Ua?o.mapping=Is:a===Na&&(o.mapping=Us),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===Ua||a===Na)if(e.has(o)){const c=e.get(o).texture;return t(c,o.mapping)}else{const c=o.image;if(c&&c.height>0){const l=new tf(c.height);return l.fromEquirectangularTexture(n,o),e.set(o,l),o.addEventListener("dispose",s),t(l.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}const Ss=4,wl=[.125,.215,.35,.446,.526,.582],Ki=20,ca=new hf,Cl=new ut;let la=null,ua=0,ha=0,da=!1;const Yi=(1+Math.sqrt(5))/2,vs=1/Yi,Rl=[new R(-Yi,vs,0),new R(Yi,vs,0),new R(-vs,0,Yi),new R(vs,0,Yi),new R(0,Yi,-vs),new R(0,Yi,vs),new R(-1,1,-1),new R(1,1,-1),new R(-1,1,1),new R(1,1,1)],ig=new R;class Pl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100,r={}){const{size:o=256,position:a=ig}=r;la=this._renderer.getRenderTarget(),ua=this._renderer.getActiveCubeFace(),ha=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,s,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Il(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ll(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(la,ua,ha),this._renderer.xr.enabled=da,e.scissorTest=!1,Vr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Is||e.mapping===Us?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),la=this._renderer.getRenderTarget(),ua=this._renderer.getActiveCubeFace(),ha=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:$n,minFilter:$n,generateMipmaps:!1,type:dr,format:Dn,colorSpace:Ns,depthBuffer:!1},s=Dl(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Dl(e,t,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=sg(r)),this._blurMaterial=rg(r,e,t)}return s}_compileMaterial(e){const t=new Ln(this._lodPlanes[0],e);this._renderer.compile(t,ca)}_sceneToCubeUV(e,t,i,s,r){const c=new Mn(90,1,t,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,m=h.toneMapping;h.getClearColor(Cl),h.toneMapping=Di,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null));const _=new Mo({name:"PMREM.Background",side:an,depthWrite:!1,depthTest:!1}),p=new Ln(new mr,_);let d=!1;const x=e.background;x?x.isColor&&(_.color.copy(x),e.background=null,d=!0):(_.color.copy(Cl),d=!0);for(let E=0;E<6;E++){const M=E%3;M===0?(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[E],r.y,r.z)):M===1?(c.up.set(0,0,l[E]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[E],r.z)):(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[E]));const w=this._cubeSize;Vr(s,M*w,E>2?w:0,w,w),h.setRenderTarget(s),d&&h.render(p,c),h.render(e,c)}p.geometry.dispose(),p.material.dispose(),h.toneMapping=m,h.autoClear=f,e.background=x}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===Is||e.mapping===Us;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Il()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ll());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new Ln(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const c=this._cubeSize;Vr(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(o,ca)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Rl[(s-r-1)%Rl.length];this._blur(e,r-1,r,o,a)}t.autoClear=i}_blur(e,t,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new Ln(this._lodPlanes[s],l),f=l.uniforms,m=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*Ki-1),_=r/g,p=isFinite(r)?1+Math.floor(u*_):Ki;p>Ki&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Ki}`);const d=[];let x=0;for(let T=0;T<Ki;++T){const L=T/_,b=Math.exp(-L*L/2);d.push(b),T===0?x+=b:T<p&&(x+=2*b)}for(let T=0;T<d.length;T++)d[T]=d[T]/x;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=d,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);const{_lodMax:E}=this;f.dTheta.value=g,f.mipInt.value=E-i;const M=this._sizeLods[s],w=3*M*(s>E-Ss?s-E+Ss:0),C=4*(this._cubeSize-M);Vr(t,w,C,3*M,2*M),c.setRenderTarget(t),c.render(h,ca)}}function sg(n){const e=[],t=[],i=[];let s=n;const r=n-Ss+1+wl.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let c=1/a;o>n-Ss?c=wl[o-n+Ss-1]:o===0&&(c=0),i.push(c);const l=1/(a-2),u=-l,h=1+l,f=[u,u,h,u,h,h,u,u,h,h,u,h],m=6,g=6,_=3,p=2,d=1,x=new Float32Array(_*g*m),E=new Float32Array(p*g*m),M=new Float32Array(d*g*m);for(let C=0;C<m;C++){const T=C%3*2/3-1,L=C>2?0:-1,b=[T,L,0,T+2/3,L,0,T+2/3,L+1,0,T,L,0,T+2/3,L+1,0,T,L+1,0];x.set(b,_*g*C),E.set(f,p*g*C);const S=[C,C,C,C,C,C];M.set(S,d*g*C)}const w=new $t;w.setAttribute("position",new jn(x,_)),w.setAttribute("uv",new jn(E,p)),w.setAttribute("faceIndex",new jn(M,d)),e.push(w),s>Ss&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Dl(n,e,t){const i=new es(n,e,t);return i.texture.mapping=_o,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Vr(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function rg(n,e,t){const i=new Float32Array(Ki),s=new R(0,1,0);return new Ni({name:"SphericalGaussianBlur",defines:{n:Ki,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Dc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function Ll(){return new Ni({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Dc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function Il(){return new Ni({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Dc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function Dc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function og(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const c=a.mapping,l=c===Ua||c===Na,u=c===Is||c===Us;if(l||u){let h=e.get(a);const f=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new Pl(n)),h=l?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{const m=a.image;return l&&m&&m.height>0||u&&m&&s(m)?(t===null&&(t=new Pl(n)),h=l?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let c=0;const l=6;for(let u=0;u<l;u++)a[u]!==void 0&&c++;return c===l}function r(a){const c=a.target;c.removeEventListener("dispose",r);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function ag(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&ar("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function cg(n,e,t,i){const s={},r=new WeakMap;function o(h){const f=h.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",o),delete s[f.id];const m=r.get(f);m&&(e.remove(m),r.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function c(h){const f=h.attributes;for(const m in f)e.update(f[m],n.ARRAY_BUFFER)}function l(h){const f=[],m=h.index,g=h.attributes.position;let _=0;if(m!==null){const x=m.array;_=m.version;for(let E=0,M=x.length;E<M;E+=3){const w=x[E+0],C=x[E+1],T=x[E+2];f.push(w,C,C,T,T,w)}}else if(g!==void 0){const x=g.array;_=g.version;for(let E=0,M=x.length/3-1;E<M;E+=3){const w=E+0,C=E+1,T=E+2;f.push(w,C,C,T,T,w)}}else return;const p=new(Iu(f)?Ou:Fu)(f,1);p.version=_;const d=r.get(h);d&&e.remove(d),r.set(h,p)}function u(h){const f=r.get(h);if(f){const m=h.index;m!==null&&f.version<m.version&&l(h)}else l(h);return r.get(h)}return{get:a,update:c,getWireframeAttribute:u}}function lg(n,e,t){let i;function s(f){i=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function c(f,m){n.drawElements(i,m,r,f*o),t.update(m,i,1)}function l(f,m,g){g!==0&&(n.drawElementsInstanced(i,m,r,f*o,g),t.update(m,i,g))}function u(f,m,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,m,0,r,f,0,g);let p=0;for(let d=0;d<g;d++)p+=m[d];t.update(p,i,1)}function h(f,m,g,_){if(g===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let d=0;d<f.length;d++)l(f[d]/o,m[d],_[d]);else{p.multiDrawElementsInstancedWEBGL(i,m,0,r,f,0,_,0,g);let d=0;for(let x=0;x<g;x++)d+=m[x]*_[x];t.update(d,i,1)}}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function ug(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function hg(n,e,t){const i=new WeakMap,s=new Lt;function r(o,a,c){const l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0;let f=i.get(a);if(f===void 0||f.count!==h){let S=function(){L.dispose(),i.delete(a),a.removeEventListener("dispose",S)};var m=S;f!==void 0&&f.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,p=a.morphAttributes.color!==void 0,d=a.morphAttributes.position||[],x=a.morphAttributes.normal||[],E=a.morphAttributes.color||[];let M=0;g===!0&&(M=1),_===!0&&(M=2),p===!0&&(M=3);let w=a.attributes.position.count*M,C=1;w>e.maxTextureSize&&(C=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const T=new Float32Array(w*C*4*h),L=new Uu(T,w,C,h);L.type=li,L.needsUpdate=!0;const b=M*4;for(let P=0;P<h;P++){const N=d[P],z=x[P],W=E[P],$=w*C*4*P;for(let Y=0;Y<N.count;Y++){const Q=Y*b;g===!0&&(s.fromBufferAttribute(N,Y),T[$+Q+0]=s.x,T[$+Q+1]=s.y,T[$+Q+2]=s.z,T[$+Q+3]=0),_===!0&&(s.fromBufferAttribute(z,Y),T[$+Q+4]=s.x,T[$+Q+5]=s.y,T[$+Q+6]=s.z,T[$+Q+7]=0),p===!0&&(s.fromBufferAttribute(W,Y),T[$+Q+8]=s.x,T[$+Q+9]=s.y,T[$+Q+10]=s.z,T[$+Q+11]=W.itemSize===4?s.w:1)}}f={count:h,texture:L,size:new We(w,C)},i.set(a,f),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let g=0;for(let p=0;p<l.length;p++)g+=l[p];const _=a.morphTargetsRelative?1:1-g;c.getUniforms().setValue(n,"morphTargetBaseInfluence",_),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:r}}function dg(n,e,t,i){let s=new WeakMap;function r(c){const l=i.render.frame,u=c.geometry,h=e.get(c,u);if(s.get(h)!==l&&(e.update(h),s.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),s.get(c)!==l&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){const f=c.skeleton;s.get(f)!==l&&(f.update(),s.set(f,l))}return h}function o(){s=new WeakMap}function a(c){const l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:o}}const $u=new cn,Ul=new Vu(1,1),Xu=new Uu,qu=new Bd,Yu=new zu,Nl=[],Fl=[],Ol=new Float32Array(16),Bl=new Float32Array(9),kl=new Float32Array(4);function ks(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=Nl[s];if(r===void 0&&(r=new Float32Array(s),Nl[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Vt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Gt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function bo(n,e){let t=Fl[e];t===void 0&&(t=new Int32Array(e),Fl[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function fg(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function pg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Vt(t,e))return;n.uniform2fv(this.addr,e),Gt(t,e)}}function mg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Vt(t,e))return;n.uniform3fv(this.addr,e),Gt(t,e)}}function gg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Vt(t,e))return;n.uniform4fv(this.addr,e),Gt(t,e)}}function _g(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Vt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Gt(t,e)}else{if(Vt(t,i))return;kl.set(i),n.uniformMatrix2fv(this.addr,!1,kl),Gt(t,i)}}function vg(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Vt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Gt(t,e)}else{if(Vt(t,i))return;Bl.set(i),n.uniformMatrix3fv(this.addr,!1,Bl),Gt(t,i)}}function xg(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Vt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Gt(t,e)}else{if(Vt(t,i))return;Ol.set(i),n.uniformMatrix4fv(this.addr,!1,Ol),Gt(t,i)}}function Mg(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Sg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Vt(t,e))return;n.uniform2iv(this.addr,e),Gt(t,e)}}function Eg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Vt(t,e))return;n.uniform3iv(this.addr,e),Gt(t,e)}}function yg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Vt(t,e))return;n.uniform4iv(this.addr,e),Gt(t,e)}}function bg(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Ag(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Vt(t,e))return;n.uniform2uiv(this.addr,e),Gt(t,e)}}function Tg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Vt(t,e))return;n.uniform3uiv(this.addr,e),Gt(t,e)}}function wg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Vt(t,e))return;n.uniform4uiv(this.addr,e),Gt(t,e)}}function Cg(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Ul.compareFunction=Lu,r=Ul):r=$u,t.setTexture2D(e||r,s)}function Rg(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||qu,s)}function Pg(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Yu,s)}function Dg(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Xu,s)}function Lg(n){switch(n){case 5126:return fg;case 35664:return pg;case 35665:return mg;case 35666:return gg;case 35674:return _g;case 35675:return vg;case 35676:return xg;case 5124:case 35670:return Mg;case 35667:case 35671:return Sg;case 35668:case 35672:return Eg;case 35669:case 35673:return yg;case 5125:return bg;case 36294:return Ag;case 36295:return Tg;case 36296:return wg;case 35678:case 36198:case 36298:case 36306:case 35682:return Cg;case 35679:case 36299:case 36307:return Rg;case 35680:case 36300:case 36308:case 36293:return Pg;case 36289:case 36303:case 36311:case 36292:return Dg}}function Ig(n,e){n.uniform1fv(this.addr,e)}function Ug(n,e){const t=ks(e,this.size,2);n.uniform2fv(this.addr,t)}function Ng(n,e){const t=ks(e,this.size,3);n.uniform3fv(this.addr,t)}function Fg(n,e){const t=ks(e,this.size,4);n.uniform4fv(this.addr,t)}function Og(n,e){const t=ks(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Bg(n,e){const t=ks(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function kg(n,e){const t=ks(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function zg(n,e){n.uniform1iv(this.addr,e)}function Hg(n,e){n.uniform2iv(this.addr,e)}function Vg(n,e){n.uniform3iv(this.addr,e)}function Gg(n,e){n.uniform4iv(this.addr,e)}function Wg(n,e){n.uniform1uiv(this.addr,e)}function $g(n,e){n.uniform2uiv(this.addr,e)}function Xg(n,e){n.uniform3uiv(this.addr,e)}function qg(n,e){n.uniform4uiv(this.addr,e)}function Yg(n,e,t){const i=this.cache,s=e.length,r=bo(t,s);Vt(i,r)||(n.uniform1iv(this.addr,r),Gt(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||$u,r[o])}function jg(n,e,t){const i=this.cache,s=e.length,r=bo(t,s);Vt(i,r)||(n.uniform1iv(this.addr,r),Gt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||qu,r[o])}function Kg(n,e,t){const i=this.cache,s=e.length,r=bo(t,s);Vt(i,r)||(n.uniform1iv(this.addr,r),Gt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Yu,r[o])}function Zg(n,e,t){const i=this.cache,s=e.length,r=bo(t,s);Vt(i,r)||(n.uniform1iv(this.addr,r),Gt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Xu,r[o])}function Jg(n){switch(n){case 5126:return Ig;case 35664:return Ug;case 35665:return Ng;case 35666:return Fg;case 35674:return Og;case 35675:return Bg;case 35676:return kg;case 5124:case 35670:return zg;case 35667:case 35671:return Hg;case 35668:case 35672:return Vg;case 35669:case 35673:return Gg;case 5125:return Wg;case 36294:return $g;case 36295:return Xg;case 36296:return qg;case 35678:case 36198:case 36298:case 36306:case 35682:return Yg;case 35679:case 36299:case 36307:return jg;case 35680:case 36300:case 36308:case 36293:return Kg;case 36289:case 36303:case 36311:case 36292:return Zg}}class Qg{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Lg(t.type)}}class e_{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Jg(t.type)}}class t_{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],i)}}}const fa=/(\w+)(\])?(\[|\.)?/g;function zl(n,e){n.seq.push(e),n.map[e.id]=e}function n_(n,e,t){const i=n.name,s=i.length;for(fa.lastIndex=0;;){const r=fa.exec(i),o=fa.lastIndex;let a=r[1];const c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){zl(t,l===void 0?new Qg(a,n,e):new e_(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new t_(a),zl(t,h)),t=h}}}class eo{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);n_(r,o,this)}}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],c=i[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&i.push(o)}return i}}function Hl(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const i_=37297;let s_=0;function r_(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const Vl=new $e;function o_(n){st._getMatrix(Vl,st.workingColorSpace,n);const e=`mat3( ${Vl.elements.map(t=>t.toFixed(4))} )`;switch(st.getTransfer(n)){case io:return[e,"LinearTransferOETF"];case gt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Gl(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+r_(n.getShaderSource(e),a)}else return r}function a_(n,e){const t=o_(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function c_(n,e){let t;switch(e){case ud:t="Linear";break;case hd:t="Reinhard";break;case dd:t="Cineon";break;case fd:t="ACESFilmic";break;case md:t="AgX";break;case gd:t="Neutral";break;case pd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Gr=new R;function l_(){st.getLuminanceCoefficients(Gr);const n=Gr.x.toFixed(4),e=Gr.y.toFixed(4),t=Gr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function u_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Js).join(`
`)}function h_(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function d_(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Js(n){return n!==""}function Wl(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function $l(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const f_=/^[ \t]*#include +<([\w\d./]+)>/gm;function pc(n){return n.replace(f_,m_)}const p_=new Map;function m_(n,e){let t=qe[e];if(t===void 0){const i=p_.get(e);if(i!==void 0)t=qe[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return pc(t)}const g_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Xl(n){return n.replace(g_,__)}function __(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function ql(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function v_(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Su?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Gh?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===ri&&(e="SHADOWMAP_TYPE_VSM"),e}function x_(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Is:case Us:e="ENVMAP_TYPE_CUBE";break;case _o:e="ENVMAP_TYPE_CUBE_UV";break}return e}function M_(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Us:e="ENVMAP_MODE_REFRACTION";break}return e}function S_(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Eu:e="ENVMAP_BLENDING_MULTIPLY";break;case cd:e="ENVMAP_BLENDING_MIX";break;case ld:e="ENVMAP_BLENDING_ADD";break}return e}function E_(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function y_(n,e,t,i){const s=n.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const c=v_(t),l=x_(t),u=M_(t),h=S_(t),f=E_(t),m=u_(t),g=h_(r),_=s.createProgram();let p,d,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Js).join(`
`),p.length>0&&(p+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Js).join(`
`),d.length>0&&(d+=`
`)):(p=[ql(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Js).join(`
`),d=[ql(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Di?"#define TONE_MAPPING":"",t.toneMapping!==Di?qe.tonemapping_pars_fragment:"",t.toneMapping!==Di?c_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",qe.colorspace_pars_fragment,a_("linearToOutputTexel",t.outputColorSpace),l_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Js).join(`
`)),o=pc(o),o=Wl(o,t),o=$l(o,t),a=pc(a),a=Wl(a,t),a=$l(a,t),o=Xl(o),a=Xl(a),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,d=["#define varying in",t.glslVersion===Zc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Zc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const E=x+p+o,M=x+d+a,w=Hl(s,s.VERTEX_SHADER,E),C=Hl(s,s.FRAGMENT_SHADER,M);s.attachShader(_,w),s.attachShader(_,C),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function T(P){if(n.debug.checkShaderErrors){const N=s.getProgramInfoLog(_)||"",z=s.getShaderInfoLog(w)||"",W=s.getShaderInfoLog(C)||"",$=N.trim(),Y=z.trim(),Q=W.trim();let X=!0,ae=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(X=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,_,w,C);else{const me=Gl(s,w,"vertex"),Re=Gl(s,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+$+`
`+me+`
`+Re)}else $!==""?console.warn("THREE.WebGLProgram: Program Info Log:",$):(Y===""||Q==="")&&(ae=!1);ae&&(P.diagnostics={runnable:X,programLog:$,vertexShader:{log:Y,prefix:p},fragmentShader:{log:Q,prefix:d}})}s.deleteShader(w),s.deleteShader(C),L=new eo(s,_),b=d_(s,_)}let L;this.getUniforms=function(){return L===void 0&&T(this),L};let b;this.getAttributes=function(){return b===void 0&&T(this),b};let S=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=s.getProgramParameter(_,i_)),S},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=s_++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=w,this.fragmentShader=C,this}let b_=0;class A_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new T_(e),t.set(e,i)),i}}class T_{constructor(e){this.id=b_++,this.code=e,this.usedTimes=0}}function w_(n,e,t,i,s,r,o){const a=new Rc,c=new A_,l=new Set,u=[],h=s.logarithmicDepthBuffer,f=s.vertexTextures;let m=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(b){return l.add(b),b===0?"uv":`uv${b}`}function p(b,S,P,N,z){const W=N.fog,$=z.geometry,Y=b.isMeshStandardMaterial?N.environment:null,Q=(b.isMeshStandardMaterial?t:e).get(b.envMap||Y),X=Q&&Q.mapping===_o?Q.image.height:null,ae=g[b.type];b.precision!==null&&(m=s.getMaxPrecision(b.precision),m!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",m,"instead."));const me=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,Re=me!==void 0?me.length:0;let Ye=0;$.morphAttributes.position!==void 0&&(Ye=1),$.morphAttributes.normal!==void 0&&(Ye=2),$.morphAttributes.color!==void 0&&(Ye=3);let ot,Mt,et,J;if(ae){const nt=kn[ae];ot=nt.vertexShader,Mt=nt.fragmentShader}else ot=b.vertexShader,Mt=b.fragmentShader,c.update(b),et=c.getVertexShaderID(b),J=c.getFragmentShaderID(b);const ne=n.getRenderTarget(),Me=n.state.buffers.depth.getReversed(),Le=z.isInstancedMesh===!0,Ce=z.isBatchedMesh===!0,Ze=!!b.map,Rt=!!b.matcap,D=!!Q,St=!!b.aoMap,He=!!b.lightMap,Ie=!!b.bumpMap,_e=!!b.normalMap,dt=!!b.displacementMap,Se=!!b.emissiveMap,Ve=!!b.metalnessMap,at=!!b.roughnessMap,Et=b.anisotropy>0,A=b.clearcoat>0,v=b.dispersion>0,B=b.iridescence>0,K=b.sheen>0,te=b.transmission>0,j=Et&&!!b.anisotropyMap,we=A&&!!b.clearcoatMap,ce=A&&!!b.clearcoatNormalMap,Ee=A&&!!b.clearcoatRoughnessMap,ye=B&&!!b.iridescenceMap,se=B&&!!b.iridescenceThicknessMap,fe=K&&!!b.sheenColorMap,Ue=K&&!!b.sheenRoughnessMap,be=!!b.specularMap,he=!!b.specularColorMap,Ge=!!b.specularIntensityMap,I=te&&!!b.transmissionMap,re=te&&!!b.thicknessMap,le=!!b.gradientMap,ve=!!b.alphaMap,ie=b.alphaTest>0,ee=!!b.alphaHash,Ae=!!b.extensions;let Be=Di;b.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(Be=n.toneMapping);const ft={shaderID:ae,shaderType:b.type,shaderName:b.name,vertexShader:ot,fragmentShader:Mt,defines:b.defines,customVertexShaderID:et,customFragmentShaderID:J,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:m,batching:Ce,batchingColor:Ce&&z._colorsTexture!==null,instancing:Le,instancingColor:Le&&z.instanceColor!==null,instancingMorph:Le&&z.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ne===null?n.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:Ns,alphaToCoverage:!!b.alphaToCoverage,map:Ze,matcap:Rt,envMap:D,envMapMode:D&&Q.mapping,envMapCubeUVHeight:X,aoMap:St,lightMap:He,bumpMap:Ie,normalMap:_e,displacementMap:f&&dt,emissiveMap:Se,normalMapObjectSpace:_e&&b.normalMapType===Sd,normalMapTangentSpace:_e&&b.normalMapType===Md,metalnessMap:Ve,roughnessMap:at,anisotropy:Et,anisotropyMap:j,clearcoat:A,clearcoatMap:we,clearcoatNormalMap:ce,clearcoatRoughnessMap:Ee,dispersion:v,iridescence:B,iridescenceMap:ye,iridescenceThicknessMap:se,sheen:K,sheenColorMap:fe,sheenRoughnessMap:Ue,specularMap:be,specularColorMap:he,specularIntensityMap:Ge,transmission:te,transmissionMap:I,thicknessMap:re,gradientMap:le,opaque:b.transparent===!1&&b.blending===Ts&&b.alphaToCoverage===!1,alphaMap:ve,alphaTest:ie,alphaHash:ee,combine:b.combine,mapUv:Ze&&_(b.map.channel),aoMapUv:St&&_(b.aoMap.channel),lightMapUv:He&&_(b.lightMap.channel),bumpMapUv:Ie&&_(b.bumpMap.channel),normalMapUv:_e&&_(b.normalMap.channel),displacementMapUv:dt&&_(b.displacementMap.channel),emissiveMapUv:Se&&_(b.emissiveMap.channel),metalnessMapUv:Ve&&_(b.metalnessMap.channel),roughnessMapUv:at&&_(b.roughnessMap.channel),anisotropyMapUv:j&&_(b.anisotropyMap.channel),clearcoatMapUv:we&&_(b.clearcoatMap.channel),clearcoatNormalMapUv:ce&&_(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&_(b.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&_(b.iridescenceMap.channel),iridescenceThicknessMapUv:se&&_(b.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&_(b.sheenColorMap.channel),sheenRoughnessMapUv:Ue&&_(b.sheenRoughnessMap.channel),specularMapUv:be&&_(b.specularMap.channel),specularColorMapUv:he&&_(b.specularColorMap.channel),specularIntensityMapUv:Ge&&_(b.specularIntensityMap.channel),transmissionMapUv:I&&_(b.transmissionMap.channel),thicknessMapUv:re&&_(b.thicknessMap.channel),alphaMapUv:ve&&_(b.alphaMap.channel),vertexTangents:!!$.attributes.tangent&&(_e||Et),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!$.attributes.uv&&(Ze||ve),fog:!!W,useFog:b.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:b.flatShading===!0&&b.wireframe===!1,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Me,skinning:z.isSkinnedMesh===!0,morphTargets:$.morphAttributes.position!==void 0,morphNormals:$.morphAttributes.normal!==void 0,morphColors:$.morphAttributes.color!==void 0,morphTargetsCount:Re,morphTextureStride:Ye,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:b.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:Be,decodeVideoTexture:Ze&&b.map.isVideoTexture===!0&&st.getTransfer(b.map.colorSpace)===gt,decodeVideoTextureEmissive:Se&&b.emissiveMap.isVideoTexture===!0&&st.getTransfer(b.emissiveMap.colorSpace)===gt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Wn,flipSided:b.side===an,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Ae&&b.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ae&&b.extensions.multiDraw===!0||Ce)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return ft.vertexUv1s=l.has(1),ft.vertexUv2s=l.has(2),ft.vertexUv3s=l.has(3),l.clear(),ft}function d(b){const S=[];if(b.shaderID?S.push(b.shaderID):(S.push(b.customVertexShaderID),S.push(b.customFragmentShaderID)),b.defines!==void 0)for(const P in b.defines)S.push(P),S.push(b.defines[P]);return b.isRawShaderMaterial===!1&&(x(S,b),E(S,b),S.push(n.outputColorSpace)),S.push(b.customProgramCacheKey),S.join()}function x(b,S){b.push(S.precision),b.push(S.outputColorSpace),b.push(S.envMapMode),b.push(S.envMapCubeUVHeight),b.push(S.mapUv),b.push(S.alphaMapUv),b.push(S.lightMapUv),b.push(S.aoMapUv),b.push(S.bumpMapUv),b.push(S.normalMapUv),b.push(S.displacementMapUv),b.push(S.emissiveMapUv),b.push(S.metalnessMapUv),b.push(S.roughnessMapUv),b.push(S.anisotropyMapUv),b.push(S.clearcoatMapUv),b.push(S.clearcoatNormalMapUv),b.push(S.clearcoatRoughnessMapUv),b.push(S.iridescenceMapUv),b.push(S.iridescenceThicknessMapUv),b.push(S.sheenColorMapUv),b.push(S.sheenRoughnessMapUv),b.push(S.specularMapUv),b.push(S.specularColorMapUv),b.push(S.specularIntensityMapUv),b.push(S.transmissionMapUv),b.push(S.thicknessMapUv),b.push(S.combine),b.push(S.fogExp2),b.push(S.sizeAttenuation),b.push(S.morphTargetsCount),b.push(S.morphAttributeCount),b.push(S.numDirLights),b.push(S.numPointLights),b.push(S.numSpotLights),b.push(S.numSpotLightMaps),b.push(S.numHemiLights),b.push(S.numRectAreaLights),b.push(S.numDirLightShadows),b.push(S.numPointLightShadows),b.push(S.numSpotLightShadows),b.push(S.numSpotLightShadowsWithMaps),b.push(S.numLightProbes),b.push(S.shadowMapType),b.push(S.toneMapping),b.push(S.numClippingPlanes),b.push(S.numClipIntersection),b.push(S.depthPacking)}function E(b,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),S.gradientMap&&a.enable(22),b.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),b.push(a.mask)}function M(b){const S=g[b.type];let P;if(S){const N=kn[S];P=Zd.clone(N.uniforms)}else P=b.uniforms;return P}function w(b,S){let P;for(let N=0,z=u.length;N<z;N++){const W=u[N];if(W.cacheKey===S){P=W,++P.usedTimes;break}}return P===void 0&&(P=new y_(n,S,b,r),u.push(P)),P}function C(b){if(--b.usedTimes===0){const S=u.indexOf(b);u[S]=u[u.length-1],u.pop(),b.destroy()}}function T(b){c.remove(b)}function L(){c.dispose()}return{getParameters:p,getProgramCacheKey:d,getUniforms:M,acquireProgram:w,releaseProgram:C,releaseShaderCache:T,programs:u,dispose:L}}function C_(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,c){n.get(o)[a]=c}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function R_(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Yl(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function jl(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(h,f,m,g,_,p){let d=n[e];return d===void 0?(d={id:h.id,object:h,geometry:f,material:m,groupOrder:g,renderOrder:h.renderOrder,z:_,group:p},n[e]=d):(d.id=h.id,d.object=h,d.geometry=f,d.material=m,d.groupOrder=g,d.renderOrder=h.renderOrder,d.z=_,d.group=p),e++,d}function a(h,f,m,g,_,p){const d=o(h,f,m,g,_,p);m.transmission>0?i.push(d):m.transparent===!0?s.push(d):t.push(d)}function c(h,f,m,g,_,p){const d=o(h,f,m,g,_,p);m.transmission>0?i.unshift(d):m.transparent===!0?s.unshift(d):t.unshift(d)}function l(h,f){t.length>1&&t.sort(h||R_),i.length>1&&i.sort(f||Yl),s.length>1&&s.sort(f||Yl)}function u(){for(let h=e,f=n.length;h<f;h++){const m=n[h];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:c,finish:u,sort:l}}function P_(){let n=new WeakMap;function e(i,s){const r=n.get(i);let o;return r===void 0?(o=new jl,n.set(i,[o])):s>=r.length?(o=new jl,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function D_(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new R,color:new ut};break;case"SpotLight":t={position:new R,direction:new R,color:new ut,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new R,color:new ut,distance:0,decay:0};break;case"HemisphereLight":t={direction:new R,skyColor:new ut,groundColor:new ut};break;case"RectAreaLight":t={color:new ut,position:new R,halfWidth:new R,halfHeight:new R};break}return n[e.id]=t,t}}}function L_(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new We};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new We};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new We,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let I_=0;function U_(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function N_(n){const e=new D_,t=L_(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new R);const s=new R,r=new vt,o=new vt;function a(l){let u=0,h=0,f=0;for(let b=0;b<9;b++)i.probe[b].set(0,0,0);let m=0,g=0,_=0,p=0,d=0,x=0,E=0,M=0,w=0,C=0,T=0;l.sort(U_);for(let b=0,S=l.length;b<S;b++){const P=l[b],N=P.color,z=P.intensity,W=P.distance,$=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=N.r*z,h+=N.g*z,f+=N.b*z;else if(P.isLightProbe){for(let Y=0;Y<9;Y++)i.probe[Y].addScaledVector(P.sh.coefficients[Y],z);T++}else if(P.isDirectionalLight){const Y=e.get(P);if(Y.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const Q=P.shadow,X=t.get(P);X.shadowIntensity=Q.intensity,X.shadowBias=Q.bias,X.shadowNormalBias=Q.normalBias,X.shadowRadius=Q.radius,X.shadowMapSize=Q.mapSize,i.directionalShadow[m]=X,i.directionalShadowMap[m]=$,i.directionalShadowMatrix[m]=P.shadow.matrix,x++}i.directional[m]=Y,m++}else if(P.isSpotLight){const Y=e.get(P);Y.position.setFromMatrixPosition(P.matrixWorld),Y.color.copy(N).multiplyScalar(z),Y.distance=W,Y.coneCos=Math.cos(P.angle),Y.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),Y.decay=P.decay,i.spot[_]=Y;const Q=P.shadow;if(P.map&&(i.spotLightMap[w]=P.map,w++,Q.updateMatrices(P),P.castShadow&&C++),i.spotLightMatrix[_]=Q.matrix,P.castShadow){const X=t.get(P);X.shadowIntensity=Q.intensity,X.shadowBias=Q.bias,X.shadowNormalBias=Q.normalBias,X.shadowRadius=Q.radius,X.shadowMapSize=Q.mapSize,i.spotShadow[_]=X,i.spotShadowMap[_]=$,M++}_++}else if(P.isRectAreaLight){const Y=e.get(P);Y.color.copy(N).multiplyScalar(z),Y.halfWidth.set(P.width*.5,0,0),Y.halfHeight.set(0,P.height*.5,0),i.rectArea[p]=Y,p++}else if(P.isPointLight){const Y=e.get(P);if(Y.color.copy(P.color).multiplyScalar(P.intensity),Y.distance=P.distance,Y.decay=P.decay,P.castShadow){const Q=P.shadow,X=t.get(P);X.shadowIntensity=Q.intensity,X.shadowBias=Q.bias,X.shadowNormalBias=Q.normalBias,X.shadowRadius=Q.radius,X.shadowMapSize=Q.mapSize,X.shadowCameraNear=Q.camera.near,X.shadowCameraFar=Q.camera.far,i.pointShadow[g]=X,i.pointShadowMap[g]=$,i.pointShadowMatrix[g]=P.shadow.matrix,E++}i.point[g]=Y,g++}else if(P.isHemisphereLight){const Y=e.get(P);Y.skyColor.copy(P.color).multiplyScalar(z),Y.groundColor.copy(P.groundColor).multiplyScalar(z),i.hemi[d]=Y,d++}}p>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=de.LTC_FLOAT_1,i.rectAreaLTC2=de.LTC_FLOAT_2):(i.rectAreaLTC1=de.LTC_HALF_1,i.rectAreaLTC2=de.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=f;const L=i.hash;(L.directionalLength!==m||L.pointLength!==g||L.spotLength!==_||L.rectAreaLength!==p||L.hemiLength!==d||L.numDirectionalShadows!==x||L.numPointShadows!==E||L.numSpotShadows!==M||L.numSpotMaps!==w||L.numLightProbes!==T)&&(i.directional.length=m,i.spot.length=_,i.rectArea.length=p,i.point.length=g,i.hemi.length=d,i.directionalShadow.length=x,i.directionalShadowMap.length=x,i.pointShadow.length=E,i.pointShadowMap.length=E,i.spotShadow.length=M,i.spotShadowMap.length=M,i.directionalShadowMatrix.length=x,i.pointShadowMatrix.length=E,i.spotLightMatrix.length=M+w-C,i.spotLightMap.length=w,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=T,L.directionalLength=m,L.pointLength=g,L.spotLength=_,L.rectAreaLength=p,L.hemiLength=d,L.numDirectionalShadows=x,L.numPointShadows=E,L.numSpotShadows=M,L.numSpotMaps=w,L.numLightProbes=T,i.version=I_++)}function c(l,u){let h=0,f=0,m=0,g=0,_=0;const p=u.matrixWorldInverse;for(let d=0,x=l.length;d<x;d++){const E=l[d];if(E.isDirectionalLight){const M=i.directional[h];M.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),h++}else if(E.isSpotLight){const M=i.spot[m];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(p),M.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),m++}else if(E.isRectAreaLight){const M=i.rectArea[g];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(p),o.identity(),r.copy(E.matrixWorld),r.premultiply(p),o.extractRotation(r),M.halfWidth.set(E.width*.5,0,0),M.halfHeight.set(0,E.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),g++}else if(E.isPointLight){const M=i.point[f];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(p),f++}else if(E.isHemisphereLight){const M=i.hemi[_];M.direction.setFromMatrixPosition(E.matrixWorld),M.direction.transformDirection(p),_++}}}return{setup:a,setupView:c,state:i}}function Kl(n){const e=new N_(n),t=[],i=[];function s(u){l.camera=u,t.length=0,i.length=0}function r(u){t.push(u)}function o(u){i.push(u)}function a(){e.setup(t)}function c(u){e.setupView(t,u)}const l={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function F_(n){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new Kl(n),e.set(s,[a])):r>=o.length?(a=new Kl(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}const O_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,B_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function k_(n,e,t){let i=new Hu;const s=new We,r=new We,o=new Lt,a=new lf({depthPacking:xd}),c=new uf,l={},u=t.maxTextureSize,h={[Ui]:an,[an]:Ui,[Wn]:Wn},f=new Ni({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new We},radius:{value:4}},vertexShader:O_,fragmentShader:B_}),m=f.clone();m.defines.HORIZONTAL_PASS=1;const g=new $t;g.setAttribute("position",new jn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Ln(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Su;let d=this.type;this.render=function(C,T,L){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||C.length===0)return;const b=n.getRenderTarget(),S=n.getActiveCubeFace(),P=n.getActiveMipmapLevel(),N=n.state;N.setBlending(Pi),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const z=d!==ri&&this.type===ri,W=d===ri&&this.type!==ri;for(let $=0,Y=C.length;$<Y;$++){const Q=C[$],X=Q.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",Q,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);const ae=X.getFrameExtents();if(s.multiply(ae),r.copy(X.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ae.x),s.x=r.x*ae.x,X.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ae.y),s.y=r.y*ae.y,X.mapSize.y=r.y)),X.map===null||z===!0||W===!0){const Re=this.type!==ri?{minFilter:Un,magFilter:Un}:{};X.map!==null&&X.map.dispose(),X.map=new es(s.x,s.y,Re),X.map.texture.name=Q.name+".shadowMap",X.camera.updateProjectionMatrix()}n.setRenderTarget(X.map),n.clear();const me=X.getViewportCount();for(let Re=0;Re<me;Re++){const Ye=X.getViewport(Re);o.set(r.x*Ye.x,r.y*Ye.y,r.x*Ye.z,r.y*Ye.w),N.viewport(o),X.updateMatrices(Q,Re),i=X.getFrustum(),M(T,L,X.camera,Q,this.type)}X.isPointLightShadow!==!0&&this.type===ri&&x(X,L),X.needsUpdate=!1}d=this.type,p.needsUpdate=!1,n.setRenderTarget(b,S,P)};function x(C,T){const L=e.update(_);f.defines.VSM_SAMPLES!==C.blurSamples&&(f.defines.VSM_SAMPLES=C.blurSamples,m.defines.VSM_SAMPLES=C.blurSamples,f.needsUpdate=!0,m.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new es(s.x,s.y)),f.uniforms.shadow_pass.value=C.map.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,n.setRenderTarget(C.mapPass),n.clear(),n.renderBufferDirect(T,null,L,f,_,null),m.uniforms.shadow_pass.value=C.mapPass.texture,m.uniforms.resolution.value=C.mapSize,m.uniforms.radius.value=C.radius,n.setRenderTarget(C.map),n.clear(),n.renderBufferDirect(T,null,L,m,_,null)}function E(C,T,L,b){let S=null;const P=L.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(P!==void 0)S=P;else if(S=L.isPointLight===!0?c:a,n.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0||T.alphaToCoverage===!0){const N=S.uuid,z=T.uuid;let W=l[N];W===void 0&&(W={},l[N]=W);let $=W[z];$===void 0&&($=S.clone(),W[z]=$,T.addEventListener("dispose",w)),S=$}if(S.visible=T.visible,S.wireframe=T.wireframe,b===ri?S.side=T.shadowSide!==null?T.shadowSide:T.side:S.side=T.shadowSide!==null?T.shadowSide:h[T.side],S.alphaMap=T.alphaMap,S.alphaTest=T.alphaToCoverage===!0?.5:T.alphaTest,S.map=T.map,S.clipShadows=T.clipShadows,S.clippingPlanes=T.clippingPlanes,S.clipIntersection=T.clipIntersection,S.displacementMap=T.displacementMap,S.displacementScale=T.displacementScale,S.displacementBias=T.displacementBias,S.wireframeLinewidth=T.wireframeLinewidth,S.linewidth=T.linewidth,L.isPointLight===!0&&S.isMeshDistanceMaterial===!0){const N=n.properties.get(S);N.light=L}return S}function M(C,T,L,b,S){if(C.visible===!1)return;if(C.layers.test(T.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&S===ri)&&(!C.frustumCulled||i.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,C.matrixWorld);const z=e.update(C),W=C.material;if(Array.isArray(W)){const $=z.groups;for(let Y=0,Q=$.length;Y<Q;Y++){const X=$[Y],ae=W[X.materialIndex];if(ae&&ae.visible){const me=E(C,ae,b,S);C.onBeforeShadow(n,C,T,L,z,me,X),n.renderBufferDirect(L,null,z,me,C,X),C.onAfterShadow(n,C,T,L,z,me,X)}}}else if(W.visible){const $=E(C,W,b,S);C.onBeforeShadow(n,C,T,L,z,$,null),n.renderBufferDirect(L,null,z,$,C,null),C.onAfterShadow(n,C,T,L,z,$,null)}}const N=C.children;for(let z=0,W=N.length;z<W;z++)M(N[z],T,L,b,S)}function w(C){C.target.removeEventListener("dispose",w);for(const L in l){const b=l[L],S=C.target.uuid;S in b&&(b[S].dispose(),delete b[S])}}}const z_={[wa]:Ca,[Ra]:La,[Pa]:Ia,[Ls]:Da,[Ca]:wa,[La]:Ra,[Ia]:Pa,[Da]:Ls};function H_(n,e){function t(){let I=!1;const re=new Lt;let le=null;const ve=new Lt(0,0,0,0);return{setMask:function(ie){le!==ie&&!I&&(n.colorMask(ie,ie,ie,ie),le=ie)},setLocked:function(ie){I=ie},setClear:function(ie,ee,Ae,Be,ft){ft===!0&&(ie*=Be,ee*=Be,Ae*=Be),re.set(ie,ee,Ae,Be),ve.equals(re)===!1&&(n.clearColor(ie,ee,Ae,Be),ve.copy(re))},reset:function(){I=!1,le=null,ve.set(-1,0,0,0)}}}function i(){let I=!1,re=!1,le=null,ve=null,ie=null;return{setReversed:function(ee){if(re!==ee){const Ae=e.get("EXT_clip_control");ee?Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.ZERO_TO_ONE_EXT):Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.NEGATIVE_ONE_TO_ONE_EXT),re=ee;const Be=ie;ie=null,this.setClear(Be)}},getReversed:function(){return re},setTest:function(ee){ee?ne(n.DEPTH_TEST):Me(n.DEPTH_TEST)},setMask:function(ee){le!==ee&&!I&&(n.depthMask(ee),le=ee)},setFunc:function(ee){if(re&&(ee=z_[ee]),ve!==ee){switch(ee){case wa:n.depthFunc(n.NEVER);break;case Ca:n.depthFunc(n.ALWAYS);break;case Ra:n.depthFunc(n.LESS);break;case Ls:n.depthFunc(n.LEQUAL);break;case Pa:n.depthFunc(n.EQUAL);break;case Da:n.depthFunc(n.GEQUAL);break;case La:n.depthFunc(n.GREATER);break;case Ia:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ve=ee}},setLocked:function(ee){I=ee},setClear:function(ee){ie!==ee&&(re&&(ee=1-ee),n.clearDepth(ee),ie=ee)},reset:function(){I=!1,le=null,ve=null,ie=null,re=!1}}}function s(){let I=!1,re=null,le=null,ve=null,ie=null,ee=null,Ae=null,Be=null,ft=null;return{setTest:function(nt){I||(nt?ne(n.STENCIL_TEST):Me(n.STENCIL_TEST))},setMask:function(nt){re!==nt&&!I&&(n.stencilMask(nt),re=nt)},setFunc:function(nt,An,Ut){(le!==nt||ve!==An||ie!==Ut)&&(n.stencilFunc(nt,An,Ut),le=nt,ve=An,ie=Ut)},setOp:function(nt,An,Ut){(ee!==nt||Ae!==An||Be!==Ut)&&(n.stencilOp(nt,An,Ut),ee=nt,Ae=An,Be=Ut)},setLocked:function(nt){I=nt},setClear:function(nt){ft!==nt&&(n.clearStencil(nt),ft=nt)},reset:function(){I=!1,re=null,le=null,ve=null,ie=null,ee=null,Ae=null,Be=null,ft=null}}}const r=new t,o=new i,a=new s,c=new WeakMap,l=new WeakMap;let u={},h={},f=new WeakMap,m=[],g=null,_=!1,p=null,d=null,x=null,E=null,M=null,w=null,C=null,T=new ut(0,0,0),L=0,b=!1,S=null,P=null,N=null,z=null,W=null;const $=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,Q=0;const X=n.getParameter(n.VERSION);X.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(X)[1]),Y=Q>=1):X.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),Y=Q>=2);let ae=null,me={};const Re=n.getParameter(n.SCISSOR_BOX),Ye=n.getParameter(n.VIEWPORT),ot=new Lt().fromArray(Re),Mt=new Lt().fromArray(Ye);function et(I,re,le,ve){const ie=new Uint8Array(4),ee=n.createTexture();n.bindTexture(I,ee),n.texParameteri(I,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(I,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ae=0;Ae<le;Ae++)I===n.TEXTURE_3D||I===n.TEXTURE_2D_ARRAY?n.texImage3D(re,0,n.RGBA,1,1,ve,0,n.RGBA,n.UNSIGNED_BYTE,ie):n.texImage2D(re+Ae,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ie);return ee}const J={};J[n.TEXTURE_2D]=et(n.TEXTURE_2D,n.TEXTURE_2D,1),J[n.TEXTURE_CUBE_MAP]=et(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[n.TEXTURE_2D_ARRAY]=et(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),J[n.TEXTURE_3D]=et(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ne(n.DEPTH_TEST),o.setFunc(Ls),Ie(!1),_e($c),ne(n.CULL_FACE),St(Pi);function ne(I){u[I]!==!0&&(n.enable(I),u[I]=!0)}function Me(I){u[I]!==!1&&(n.disable(I),u[I]=!1)}function Le(I,re){return h[I]!==re?(n.bindFramebuffer(I,re),h[I]=re,I===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=re),I===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=re),!0):!1}function Ce(I,re){let le=m,ve=!1;if(I){le=f.get(re),le===void 0&&(le=[],f.set(re,le));const ie=I.textures;if(le.length!==ie.length||le[0]!==n.COLOR_ATTACHMENT0){for(let ee=0,Ae=ie.length;ee<Ae;ee++)le[ee]=n.COLOR_ATTACHMENT0+ee;le.length=ie.length,ve=!0}}else le[0]!==n.BACK&&(le[0]=n.BACK,ve=!0);ve&&n.drawBuffers(le)}function Ze(I){return g!==I?(n.useProgram(I),g=I,!0):!1}const Rt={[ji]:n.FUNC_ADD,[$h]:n.FUNC_SUBTRACT,[Xh]:n.FUNC_REVERSE_SUBTRACT};Rt[qh]=n.MIN,Rt[Yh]=n.MAX;const D={[jh]:n.ZERO,[Kh]:n.ONE,[Zh]:n.SRC_COLOR,[Aa]:n.SRC_ALPHA,[id]:n.SRC_ALPHA_SATURATE,[td]:n.DST_COLOR,[Qh]:n.DST_ALPHA,[Jh]:n.ONE_MINUS_SRC_COLOR,[Ta]:n.ONE_MINUS_SRC_ALPHA,[nd]:n.ONE_MINUS_DST_COLOR,[ed]:n.ONE_MINUS_DST_ALPHA,[sd]:n.CONSTANT_COLOR,[rd]:n.ONE_MINUS_CONSTANT_COLOR,[od]:n.CONSTANT_ALPHA,[ad]:n.ONE_MINUS_CONSTANT_ALPHA};function St(I,re,le,ve,ie,ee,Ae,Be,ft,nt){if(I===Pi){_===!0&&(Me(n.BLEND),_=!1);return}if(_===!1&&(ne(n.BLEND),_=!0),I!==Wh){if(I!==p||nt!==b){if((d!==ji||M!==ji)&&(n.blendEquation(n.FUNC_ADD),d=ji,M=ji),nt)switch(I){case Ts:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Xc:n.blendFunc(n.ONE,n.ONE);break;case qc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Yc:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Ts:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Xc:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case qc:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Yc:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}x=null,E=null,w=null,C=null,T.set(0,0,0),L=0,p=I,b=nt}return}ie=ie||re,ee=ee||le,Ae=Ae||ve,(re!==d||ie!==M)&&(n.blendEquationSeparate(Rt[re],Rt[ie]),d=re,M=ie),(le!==x||ve!==E||ee!==w||Ae!==C)&&(n.blendFuncSeparate(D[le],D[ve],D[ee],D[Ae]),x=le,E=ve,w=ee,C=Ae),(Be.equals(T)===!1||ft!==L)&&(n.blendColor(Be.r,Be.g,Be.b,ft),T.copy(Be),L=ft),p=I,b=!1}function He(I,re){I.side===Wn?Me(n.CULL_FACE):ne(n.CULL_FACE);let le=I.side===an;re&&(le=!le),Ie(le),I.blending===Ts&&I.transparent===!1?St(Pi):St(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),o.setFunc(I.depthFunc),o.setTest(I.depthTest),o.setMask(I.depthWrite),r.setMask(I.colorWrite);const ve=I.stencilWrite;a.setTest(ve),ve&&(a.setMask(I.stencilWriteMask),a.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),a.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Se(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?ne(n.SAMPLE_ALPHA_TO_COVERAGE):Me(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ie(I){S!==I&&(I?n.frontFace(n.CW):n.frontFace(n.CCW),S=I)}function _e(I){I!==Hh?(ne(n.CULL_FACE),I!==P&&(I===$c?n.cullFace(n.BACK):I===Vh?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Me(n.CULL_FACE),P=I}function dt(I){I!==N&&(Y&&n.lineWidth(I),N=I)}function Se(I,re,le){I?(ne(n.POLYGON_OFFSET_FILL),(z!==re||W!==le)&&(n.polygonOffset(re,le),z=re,W=le)):Me(n.POLYGON_OFFSET_FILL)}function Ve(I){I?ne(n.SCISSOR_TEST):Me(n.SCISSOR_TEST)}function at(I){I===void 0&&(I=n.TEXTURE0+$-1),ae!==I&&(n.activeTexture(I),ae=I)}function Et(I,re,le){le===void 0&&(ae===null?le=n.TEXTURE0+$-1:le=ae);let ve=me[le];ve===void 0&&(ve={type:void 0,texture:void 0},me[le]=ve),(ve.type!==I||ve.texture!==re)&&(ae!==le&&(n.activeTexture(le),ae=le),n.bindTexture(I,re||J[I]),ve.type=I,ve.texture=re)}function A(){const I=me[ae];I!==void 0&&I.type!==void 0&&(n.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function v(){try{n.compressedTexImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function B(){try{n.compressedTexImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function K(){try{n.texSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function te(){try{n.texSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function j(){try{n.compressedTexSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function we(){try{n.compressedTexSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ce(){try{n.texStorage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ee(){try{n.texStorage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ye(){try{n.texImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function se(){try{n.texImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function fe(I){ot.equals(I)===!1&&(n.scissor(I.x,I.y,I.z,I.w),ot.copy(I))}function Ue(I){Mt.equals(I)===!1&&(n.viewport(I.x,I.y,I.z,I.w),Mt.copy(I))}function be(I,re){let le=l.get(re);le===void 0&&(le=new WeakMap,l.set(re,le));let ve=le.get(I);ve===void 0&&(ve=n.getUniformBlockIndex(re,I.name),le.set(I,ve))}function he(I,re){const ve=l.get(re).get(I);c.get(re)!==ve&&(n.uniformBlockBinding(re,ve,I.__bindingPointIndex),c.set(re,ve))}function Ge(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},ae=null,me={},h={},f=new WeakMap,m=[],g=null,_=!1,p=null,d=null,x=null,E=null,M=null,w=null,C=null,T=new ut(0,0,0),L=0,b=!1,S=null,P=null,N=null,z=null,W=null,ot.set(0,0,n.canvas.width,n.canvas.height),Mt.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ne,disable:Me,bindFramebuffer:Le,drawBuffers:Ce,useProgram:Ze,setBlending:St,setMaterial:He,setFlipSided:Ie,setCullFace:_e,setLineWidth:dt,setPolygonOffset:Se,setScissorTest:Ve,activeTexture:at,bindTexture:Et,unbindTexture:A,compressedTexImage2D:v,compressedTexImage3D:B,texImage2D:ye,texImage3D:se,updateUBOMapping:be,uniformBlockBinding:he,texStorage2D:ce,texStorage3D:Ee,texSubImage2D:K,texSubImage3D:te,compressedTexSubImage2D:j,compressedTexSubImage3D:we,scissor:fe,viewport:Ue,reset:Ge}}function V_(n,e,t,i,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new We,u=new WeakMap;let h;const f=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,v){return m?new OffscreenCanvas(A,v):ro("canvas")}function _(A,v,B){let K=1;const te=Et(A);if((te.width>B||te.height>B)&&(K=B/Math.max(te.width,te.height)),K<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const j=Math.floor(K*te.width),we=Math.floor(K*te.height);h===void 0&&(h=g(j,we));const ce=v?g(j,we):h;return ce.width=j,ce.height=we,ce.getContext("2d").drawImage(A,0,0,j,we),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+te.width+"x"+te.height+") to ("+j+"x"+we+")."),ce}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+te.width+"x"+te.height+")."),A;return A}function p(A){return A.generateMipmaps}function d(A){n.generateMipmap(A)}function x(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function E(A,v,B,K,te=!1){if(A!==null){if(n[A]!==void 0)return n[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let j=v;if(v===n.RED&&(B===n.FLOAT&&(j=n.R32F),B===n.HALF_FLOAT&&(j=n.R16F),B===n.UNSIGNED_BYTE&&(j=n.R8)),v===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.R8UI),B===n.UNSIGNED_SHORT&&(j=n.R16UI),B===n.UNSIGNED_INT&&(j=n.R32UI),B===n.BYTE&&(j=n.R8I),B===n.SHORT&&(j=n.R16I),B===n.INT&&(j=n.R32I)),v===n.RG&&(B===n.FLOAT&&(j=n.RG32F),B===n.HALF_FLOAT&&(j=n.RG16F),B===n.UNSIGNED_BYTE&&(j=n.RG8)),v===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RG8UI),B===n.UNSIGNED_SHORT&&(j=n.RG16UI),B===n.UNSIGNED_INT&&(j=n.RG32UI),B===n.BYTE&&(j=n.RG8I),B===n.SHORT&&(j=n.RG16I),B===n.INT&&(j=n.RG32I)),v===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RGB8UI),B===n.UNSIGNED_SHORT&&(j=n.RGB16UI),B===n.UNSIGNED_INT&&(j=n.RGB32UI),B===n.BYTE&&(j=n.RGB8I),B===n.SHORT&&(j=n.RGB16I),B===n.INT&&(j=n.RGB32I)),v===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(j=n.RGBA16UI),B===n.UNSIGNED_INT&&(j=n.RGBA32UI),B===n.BYTE&&(j=n.RGBA8I),B===n.SHORT&&(j=n.RGBA16I),B===n.INT&&(j=n.RGBA32I)),v===n.RGB&&(B===n.UNSIGNED_INT_5_9_9_9_REV&&(j=n.RGB9_E5),B===n.UNSIGNED_INT_10F_11F_11F_REV&&(j=n.R11F_G11F_B10F)),v===n.RGBA){const we=te?io:st.getTransfer(K);B===n.FLOAT&&(j=n.RGBA32F),B===n.HALF_FLOAT&&(j=n.RGBA16F),B===n.UNSIGNED_BYTE&&(j=we===gt?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT_4_4_4_4&&(j=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(j=n.RGB5_A1)}return(j===n.R16F||j===n.R32F||j===n.RG16F||j===n.RG32F||j===n.RGBA16F||j===n.RGBA32F)&&e.get("EXT_color_buffer_float"),j}function M(A,v){let B;return A?v===null||v===Qi||v===sr?B=n.DEPTH24_STENCIL8:v===li?B=n.DEPTH32F_STENCIL8:v===ir&&(B=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Qi||v===sr?B=n.DEPTH_COMPONENT24:v===li?B=n.DEPTH_COMPONENT32F:v===ir&&(B=n.DEPTH_COMPONENT16),B}function w(A,v){return p(A)===!0||A.isFramebufferTexture&&A.minFilter!==Un&&A.minFilter!==$n?Math.log2(Math.max(v.width,v.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?v.mipmaps.length:1}function C(A){const v=A.target;v.removeEventListener("dispose",C),L(v),v.isVideoTexture&&u.delete(v)}function T(A){const v=A.target;v.removeEventListener("dispose",T),S(v)}function L(A){const v=i.get(A);if(v.__webglInit===void 0)return;const B=A.source,K=f.get(B);if(K){const te=K[v.__cacheKey];te.usedTimes--,te.usedTimes===0&&b(A),Object.keys(K).length===0&&f.delete(B)}i.remove(A)}function b(A){const v=i.get(A);n.deleteTexture(v.__webglTexture);const B=A.source,K=f.get(B);delete K[v.__cacheKey],o.memory.textures--}function S(A){const v=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(v.__webglFramebuffer[K]))for(let te=0;te<v.__webglFramebuffer[K].length;te++)n.deleteFramebuffer(v.__webglFramebuffer[K][te]);else n.deleteFramebuffer(v.__webglFramebuffer[K]);v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer[K])}else{if(Array.isArray(v.__webglFramebuffer))for(let K=0;K<v.__webglFramebuffer.length;K++)n.deleteFramebuffer(v.__webglFramebuffer[K]);else n.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&n.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let K=0;K<v.__webglColorRenderbuffer.length;K++)v.__webglColorRenderbuffer[K]&&n.deleteRenderbuffer(v.__webglColorRenderbuffer[K]);v.__webglDepthRenderbuffer&&n.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const B=A.textures;for(let K=0,te=B.length;K<te;K++){const j=i.get(B[K]);j.__webglTexture&&(n.deleteTexture(j.__webglTexture),o.memory.textures--),i.remove(B[K])}i.remove(A)}let P=0;function N(){P=0}function z(){const A=P;return A>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),P+=1,A}function W(A){const v=[];return v.push(A.wrapS),v.push(A.wrapT),v.push(A.wrapR||0),v.push(A.magFilter),v.push(A.minFilter),v.push(A.anisotropy),v.push(A.internalFormat),v.push(A.format),v.push(A.type),v.push(A.generateMipmaps),v.push(A.premultiplyAlpha),v.push(A.flipY),v.push(A.unpackAlignment),v.push(A.colorSpace),v.join()}function $(A,v){const B=i.get(A);if(A.isVideoTexture&&Ve(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&B.__version!==A.version){const K=A.image;if(K===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{J(B,A,v);return}}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+v)}function Y(A,v){const B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){J(B,A,v);return}t.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+v)}function Q(A,v){const B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){J(B,A,v);return}t.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+v)}function X(A,v){const B=i.get(A);if(A.version>0&&B.__version!==A.version){ne(B,A,v);return}t.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+v)}const ae={[Fa]:n.REPEAT,[Zi]:n.CLAMP_TO_EDGE,[Oa]:n.MIRRORED_REPEAT},me={[Un]:n.NEAREST,[_d]:n.NEAREST_MIPMAP_NEAREST,[xr]:n.NEAREST_MIPMAP_LINEAR,[$n]:n.LINEAR,[Fo]:n.LINEAR_MIPMAP_NEAREST,[Ji]:n.LINEAR_MIPMAP_LINEAR},Re={[Ed]:n.NEVER,[Cd]:n.ALWAYS,[yd]:n.LESS,[Lu]:n.LEQUAL,[bd]:n.EQUAL,[wd]:n.GEQUAL,[Ad]:n.GREATER,[Td]:n.NOTEQUAL};function Ye(A,v){if(v.type===li&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===$n||v.magFilter===Fo||v.magFilter===xr||v.magFilter===Ji||v.minFilter===$n||v.minFilter===Fo||v.minFilter===xr||v.minFilter===Ji)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,ae[v.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,ae[v.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,ae[v.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,me[v.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,me[v.minFilter]),v.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,Re[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===Un||v.minFilter!==xr&&v.minFilter!==Ji||v.type===li&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||i.get(v).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");n.texParameterf(A,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),i.get(v).__currentAnisotropy=v.anisotropy}}}function ot(A,v){let B=!1;A.__webglInit===void 0&&(A.__webglInit=!0,v.addEventListener("dispose",C));const K=v.source;let te=f.get(K);te===void 0&&(te={},f.set(K,te));const j=W(v);if(j!==A.__cacheKey){te[j]===void 0&&(te[j]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,B=!0),te[j].usedTimes++;const we=te[A.__cacheKey];we!==void 0&&(te[A.__cacheKey].usedTimes--,we.usedTimes===0&&b(v)),A.__cacheKey=j,A.__webglTexture=te[j].texture}return B}function Mt(A,v,B){return Math.floor(Math.floor(A/B)/v)}function et(A,v,B,K){const j=A.updateRanges;if(j.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,v.width,v.height,B,K,v.data);else{j.sort((se,fe)=>se.start-fe.start);let we=0;for(let se=1;se<j.length;se++){const fe=j[we],Ue=j[se],be=fe.start+fe.count,he=Mt(Ue.start,v.width,4),Ge=Mt(fe.start,v.width,4);Ue.start<=be+1&&he===Ge&&Mt(Ue.start+Ue.count-1,v.width,4)===he?fe.count=Math.max(fe.count,Ue.start+Ue.count-fe.start):(++we,j[we]=Ue)}j.length=we+1;const ce=n.getParameter(n.UNPACK_ROW_LENGTH),Ee=n.getParameter(n.UNPACK_SKIP_PIXELS),ye=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,v.width);for(let se=0,fe=j.length;se<fe;se++){const Ue=j[se],be=Math.floor(Ue.start/4),he=Math.ceil(Ue.count/4),Ge=be%v.width,I=Math.floor(be/v.width),re=he,le=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Ge),n.pixelStorei(n.UNPACK_SKIP_ROWS,I),t.texSubImage2D(n.TEXTURE_2D,0,Ge,I,re,le,B,K,v.data)}A.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,ce),n.pixelStorei(n.UNPACK_SKIP_PIXELS,Ee),n.pixelStorei(n.UNPACK_SKIP_ROWS,ye)}}function J(A,v,B){let K=n.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(K=n.TEXTURE_2D_ARRAY),v.isData3DTexture&&(K=n.TEXTURE_3D);const te=ot(A,v),j=v.source;t.bindTexture(K,A.__webglTexture,n.TEXTURE0+B);const we=i.get(j);if(j.version!==we.__version||te===!0){t.activeTexture(n.TEXTURE0+B);const ce=st.getPrimaries(st.workingColorSpace),Ee=v.colorSpace===Ai?null:st.getPrimaries(v.colorSpace),ye=v.colorSpace===Ai||ce===Ee?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let se=_(v.image,!1,s.maxTextureSize);se=at(v,se);const fe=r.convert(v.format,v.colorSpace),Ue=r.convert(v.type);let be=E(v.internalFormat,fe,Ue,v.colorSpace,v.isVideoTexture);Ye(K,v);let he;const Ge=v.mipmaps,I=v.isVideoTexture!==!0,re=we.__version===void 0||te===!0,le=j.dataReady,ve=w(v,se);if(v.isDepthTexture)be=M(v.format===or,v.type),re&&(I?t.texStorage2D(n.TEXTURE_2D,1,be,se.width,se.height):t.texImage2D(n.TEXTURE_2D,0,be,se.width,se.height,0,fe,Ue,null));else if(v.isDataTexture)if(Ge.length>0){I&&re&&t.texStorage2D(n.TEXTURE_2D,ve,be,Ge[0].width,Ge[0].height);for(let ie=0,ee=Ge.length;ie<ee;ie++)he=Ge[ie],I?le&&t.texSubImage2D(n.TEXTURE_2D,ie,0,0,he.width,he.height,fe,Ue,he.data):t.texImage2D(n.TEXTURE_2D,ie,be,he.width,he.height,0,fe,Ue,he.data);v.generateMipmaps=!1}else I?(re&&t.texStorage2D(n.TEXTURE_2D,ve,be,se.width,se.height),le&&et(v,se,fe,Ue)):t.texImage2D(n.TEXTURE_2D,0,be,se.width,se.height,0,fe,Ue,se.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){I&&re&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ve,be,Ge[0].width,Ge[0].height,se.depth);for(let ie=0,ee=Ge.length;ie<ee;ie++)if(he=Ge[ie],v.format!==Dn)if(fe!==null)if(I){if(le)if(v.layerUpdates.size>0){const Ae=Tl(he.width,he.height,v.format,v.type);for(const Be of v.layerUpdates){const ft=he.data.subarray(Be*Ae/he.data.BYTES_PER_ELEMENT,(Be+1)*Ae/he.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ie,0,0,Be,he.width,he.height,1,fe,ft)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ie,0,0,0,he.width,he.height,se.depth,fe,he.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ie,be,he.width,he.height,se.depth,0,he.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else I?le&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ie,0,0,0,he.width,he.height,se.depth,fe,Ue,he.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ie,be,he.width,he.height,se.depth,0,fe,Ue,he.data)}else{I&&re&&t.texStorage2D(n.TEXTURE_2D,ve,be,Ge[0].width,Ge[0].height);for(let ie=0,ee=Ge.length;ie<ee;ie++)he=Ge[ie],v.format!==Dn?fe!==null?I?le&&t.compressedTexSubImage2D(n.TEXTURE_2D,ie,0,0,he.width,he.height,fe,he.data):t.compressedTexImage2D(n.TEXTURE_2D,ie,be,he.width,he.height,0,he.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):I?le&&t.texSubImage2D(n.TEXTURE_2D,ie,0,0,he.width,he.height,fe,Ue,he.data):t.texImage2D(n.TEXTURE_2D,ie,be,he.width,he.height,0,fe,Ue,he.data)}else if(v.isDataArrayTexture)if(I){if(re&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ve,be,se.width,se.height,se.depth),le)if(v.layerUpdates.size>0){const ie=Tl(se.width,se.height,v.format,v.type);for(const ee of v.layerUpdates){const Ae=se.data.subarray(ee*ie/se.data.BYTES_PER_ELEMENT,(ee+1)*ie/se.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ee,se.width,se.height,1,fe,Ue,Ae)}v.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,se.width,se.height,se.depth,fe,Ue,se.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,be,se.width,se.height,se.depth,0,fe,Ue,se.data);else if(v.isData3DTexture)I?(re&&t.texStorage3D(n.TEXTURE_3D,ve,be,se.width,se.height,se.depth),le&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,se.width,se.height,se.depth,fe,Ue,se.data)):t.texImage3D(n.TEXTURE_3D,0,be,se.width,se.height,se.depth,0,fe,Ue,se.data);else if(v.isFramebufferTexture){if(re)if(I)t.texStorage2D(n.TEXTURE_2D,ve,be,se.width,se.height);else{let ie=se.width,ee=se.height;for(let Ae=0;Ae<ve;Ae++)t.texImage2D(n.TEXTURE_2D,Ae,be,ie,ee,0,fe,Ue,null),ie>>=1,ee>>=1}}else if(Ge.length>0){if(I&&re){const ie=Et(Ge[0]);t.texStorage2D(n.TEXTURE_2D,ve,be,ie.width,ie.height)}for(let ie=0,ee=Ge.length;ie<ee;ie++)he=Ge[ie],I?le&&t.texSubImage2D(n.TEXTURE_2D,ie,0,0,fe,Ue,he):t.texImage2D(n.TEXTURE_2D,ie,be,fe,Ue,he);v.generateMipmaps=!1}else if(I){if(re){const ie=Et(se);t.texStorage2D(n.TEXTURE_2D,ve,be,ie.width,ie.height)}le&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,fe,Ue,se)}else t.texImage2D(n.TEXTURE_2D,0,be,fe,Ue,se);p(v)&&d(K),we.__version=j.version,v.onUpdate&&v.onUpdate(v)}A.__version=v.version}function ne(A,v,B){if(v.image.length!==6)return;const K=ot(A,v),te=v.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+B);const j=i.get(te);if(te.version!==j.__version||K===!0){t.activeTexture(n.TEXTURE0+B);const we=st.getPrimaries(st.workingColorSpace),ce=v.colorSpace===Ai?null:st.getPrimaries(v.colorSpace),Ee=v.colorSpace===Ai||we===ce?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee);const ye=v.isCompressedTexture||v.image[0].isCompressedTexture,se=v.image[0]&&v.image[0].isDataTexture,fe=[];for(let ee=0;ee<6;ee++)!ye&&!se?fe[ee]=_(v.image[ee],!0,s.maxCubemapSize):fe[ee]=se?v.image[ee].image:v.image[ee],fe[ee]=at(v,fe[ee]);const Ue=fe[0],be=r.convert(v.format,v.colorSpace),he=r.convert(v.type),Ge=E(v.internalFormat,be,he,v.colorSpace),I=v.isVideoTexture!==!0,re=j.__version===void 0||K===!0,le=te.dataReady;let ve=w(v,Ue);Ye(n.TEXTURE_CUBE_MAP,v);let ie;if(ye){I&&re&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ve,Ge,Ue.width,Ue.height);for(let ee=0;ee<6;ee++){ie=fe[ee].mipmaps;for(let Ae=0;Ae<ie.length;Ae++){const Be=ie[Ae];v.format!==Dn?be!==null?I?le&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Ae,0,0,Be.width,Be.height,be,Be.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Ae,Ge,Be.width,Be.height,0,Be.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?le&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Ae,0,0,Be.width,Be.height,be,he,Be.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Ae,Ge,Be.width,Be.height,0,be,he,Be.data)}}}else{if(ie=v.mipmaps,I&&re){ie.length>0&&ve++;const ee=Et(fe[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ve,Ge,ee.width,ee.height)}for(let ee=0;ee<6;ee++)if(se){I?le&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,fe[ee].width,fe[ee].height,be,he,fe[ee].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,Ge,fe[ee].width,fe[ee].height,0,be,he,fe[ee].data);for(let Ae=0;Ae<ie.length;Ae++){const ft=ie[Ae].image[ee].image;I?le&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Ae+1,0,0,ft.width,ft.height,be,he,ft.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Ae+1,Ge,ft.width,ft.height,0,be,he,ft.data)}}else{I?le&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,be,he,fe[ee]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,Ge,be,he,fe[ee]);for(let Ae=0;Ae<ie.length;Ae++){const Be=ie[Ae];I?le&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Ae+1,0,0,be,he,Be.image[ee]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,Ae+1,Ge,be,he,Be.image[ee])}}}p(v)&&d(n.TEXTURE_CUBE_MAP),j.__version=te.version,v.onUpdate&&v.onUpdate(v)}A.__version=v.version}function Me(A,v,B,K,te,j){const we=r.convert(B.format,B.colorSpace),ce=r.convert(B.type),Ee=E(B.internalFormat,we,ce,B.colorSpace),ye=i.get(v),se=i.get(B);if(se.__renderTarget=v,!ye.__hasExternalTextures){const fe=Math.max(1,v.width>>j),Ue=Math.max(1,v.height>>j);te===n.TEXTURE_3D||te===n.TEXTURE_2D_ARRAY?t.texImage3D(te,j,Ee,fe,Ue,v.depth,0,we,ce,null):t.texImage2D(te,j,Ee,fe,Ue,0,we,ce,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),Se(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,K,te,se.__webglTexture,0,dt(v)):(te===n.TEXTURE_2D||te>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,K,te,se.__webglTexture,j),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Le(A,v,B){if(n.bindRenderbuffer(n.RENDERBUFFER,A),v.depthBuffer){const K=v.depthTexture,te=K&&K.isDepthTexture?K.type:null,j=M(v.stencilBuffer,te),we=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ce=dt(v);Se(v)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ce,j,v.width,v.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,ce,j,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,j,v.width,v.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,we,n.RENDERBUFFER,A)}else{const K=v.textures;for(let te=0;te<K.length;te++){const j=K[te],we=r.convert(j.format,j.colorSpace),ce=r.convert(j.type),Ee=E(j.internalFormat,we,ce,j.colorSpace),ye=dt(v);B&&Se(v)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,ye,Ee,v.width,v.height):Se(v)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ye,Ee,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,Ee,v.width,v.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Ce(A,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const K=i.get(v.depthTexture);K.__renderTarget=v,(!K.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),$(v.depthTexture,0);const te=K.__webglTexture,j=dt(v);if(v.depthTexture.format===rr)Se(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,te,0,j):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,te,0);else if(v.depthTexture.format===or)Se(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,te,0,j):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,te,0);else throw new Error("Unknown depthTexture format")}function Ze(A){const v=i.get(A),B=A.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==A.depthTexture){const K=A.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),K){const te=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,K.removeEventListener("dispose",te)};K.addEventListener("dispose",te),v.__depthDisposeCallback=te}v.__boundDepthTexture=K}if(A.depthTexture&&!v.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");const K=A.texture.mipmaps;K&&K.length>0?Ce(v.__webglFramebuffer[0],A):Ce(v.__webglFramebuffer,A)}else if(B){v.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[K]),v.__webglDepthbuffer[K]===void 0)v.__webglDepthbuffer[K]=n.createRenderbuffer(),Le(v.__webglDepthbuffer[K],A,!1);else{const te=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,j=v.__webglDepthbuffer[K];n.bindRenderbuffer(n.RENDERBUFFER,j),n.framebufferRenderbuffer(n.FRAMEBUFFER,te,n.RENDERBUFFER,j)}}else{const K=A.texture.mipmaps;if(K&&K.length>0?t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=n.createRenderbuffer(),Le(v.__webglDepthbuffer,A,!1);else{const te=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,j=v.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,j),n.framebufferRenderbuffer(n.FRAMEBUFFER,te,n.RENDERBUFFER,j)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Rt(A,v,B){const K=i.get(A);v!==void 0&&Me(K.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&Ze(A)}function D(A){const v=A.texture,B=i.get(A),K=i.get(v);A.addEventListener("dispose",T);const te=A.textures,j=A.isWebGLCubeRenderTarget===!0,we=te.length>1;if(we||(K.__webglTexture===void 0&&(K.__webglTexture=n.createTexture()),K.__version=v.version,o.memory.textures++),j){B.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(v.mipmaps&&v.mipmaps.length>0){B.__webglFramebuffer[ce]=[];for(let Ee=0;Ee<v.mipmaps.length;Ee++)B.__webglFramebuffer[ce][Ee]=n.createFramebuffer()}else B.__webglFramebuffer[ce]=n.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){B.__webglFramebuffer=[];for(let ce=0;ce<v.mipmaps.length;ce++)B.__webglFramebuffer[ce]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(we)for(let ce=0,Ee=te.length;ce<Ee;ce++){const ye=i.get(te[ce]);ye.__webglTexture===void 0&&(ye.__webglTexture=n.createTexture(),o.memory.textures++)}if(A.samples>0&&Se(A)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let ce=0;ce<te.length;ce++){const Ee=te[ce];B.__webglColorRenderbuffer[ce]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[ce]);const ye=r.convert(Ee.format,Ee.colorSpace),se=r.convert(Ee.type),fe=E(Ee.internalFormat,ye,se,Ee.colorSpace,A.isXRRenderTarget===!0),Ue=dt(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ue,fe,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.RENDERBUFFER,B.__webglColorRenderbuffer[ce])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),Le(B.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(j){t.bindTexture(n.TEXTURE_CUBE_MAP,K.__webglTexture),Ye(n.TEXTURE_CUBE_MAP,v);for(let ce=0;ce<6;ce++)if(v.mipmaps&&v.mipmaps.length>0)for(let Ee=0;Ee<v.mipmaps.length;Ee++)Me(B.__webglFramebuffer[ce][Ee],A,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Ee);else Me(B.__webglFramebuffer[ce],A,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);p(v)&&d(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(we){for(let ce=0,Ee=te.length;ce<Ee;ce++){const ye=te[ce],se=i.get(ye);let fe=n.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(fe=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(fe,se.__webglTexture),Ye(fe,ye),Me(B.__webglFramebuffer,A,ye,n.COLOR_ATTACHMENT0+ce,fe,0),p(ye)&&d(fe)}t.unbindTexture()}else{let ce=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ce=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ce,K.__webglTexture),Ye(ce,v),v.mipmaps&&v.mipmaps.length>0)for(let Ee=0;Ee<v.mipmaps.length;Ee++)Me(B.__webglFramebuffer[Ee],A,v,n.COLOR_ATTACHMENT0,ce,Ee);else Me(B.__webglFramebuffer,A,v,n.COLOR_ATTACHMENT0,ce,0);p(v)&&d(ce),t.unbindTexture()}A.depthBuffer&&Ze(A)}function St(A){const v=A.textures;for(let B=0,K=v.length;B<K;B++){const te=v[B];if(p(te)){const j=x(A),we=i.get(te).__webglTexture;t.bindTexture(j,we),d(j),t.unbindTexture()}}}const He=[],Ie=[];function _e(A){if(A.samples>0){if(Se(A)===!1){const v=A.textures,B=A.width,K=A.height;let te=n.COLOR_BUFFER_BIT;const j=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,we=i.get(A),ce=v.length>1;if(ce)for(let ye=0;ye<v.length;ye++)t.bindFramebuffer(n.FRAMEBUFFER,we.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ye,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,we.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ye,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,we.__webglMultisampledFramebuffer);const Ee=A.texture.mipmaps;Ee&&Ee.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,we.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,we.__webglFramebuffer);for(let ye=0;ye<v.length;ye++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(te|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(te|=n.STENCIL_BUFFER_BIT)),ce){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,we.__webglColorRenderbuffer[ye]);const se=i.get(v[ye]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,se,0)}n.blitFramebuffer(0,0,B,K,0,0,B,K,te,n.NEAREST),c===!0&&(He.length=0,Ie.length=0,He.push(n.COLOR_ATTACHMENT0+ye),A.depthBuffer&&A.resolveDepthBuffer===!1&&(He.push(j),Ie.push(j),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Ie)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,He))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ce)for(let ye=0;ye<v.length;ye++){t.bindFramebuffer(n.FRAMEBUFFER,we.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ye,n.RENDERBUFFER,we.__webglColorRenderbuffer[ye]);const se=i.get(v[ye]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,we.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ye,n.TEXTURE_2D,se,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,we.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&c){const v=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[v])}}}function dt(A){return Math.min(s.maxSamples,A.samples)}function Se(A){const v=i.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function Ve(A){const v=o.render.frame;u.get(A)!==v&&(u.set(A,v),A.update())}function at(A,v){const B=A.colorSpace,K=A.format,te=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||B!==Ns&&B!==Ai&&(st.getTransfer(B)===gt?(K!==Dn||te!==hi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),v}function Et(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(l.width=A.naturalWidth||A.width,l.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(l.width=A.displayWidth,l.height=A.displayHeight):(l.width=A.width,l.height=A.height),l}this.allocateTextureUnit=z,this.resetTextureUnits=N,this.setTexture2D=$,this.setTexture2DArray=Y,this.setTexture3D=Q,this.setTextureCube=X,this.rebindTextures=Rt,this.setupRenderTarget=D,this.updateRenderTargetMipmap=St,this.updateMultisampleRenderTarget=_e,this.setupDepthRenderbuffer=Ze,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=Se}function G_(n,e){function t(i,s=Ai){let r;const o=st.getTransfer(s);if(i===hi)return n.UNSIGNED_BYTE;if(i===yc)return n.UNSIGNED_SHORT_4_4_4_4;if(i===bc)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Tu)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===wu)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===bu)return n.BYTE;if(i===Au)return n.SHORT;if(i===ir)return n.UNSIGNED_SHORT;if(i===Ec)return n.INT;if(i===Qi)return n.UNSIGNED_INT;if(i===li)return n.FLOAT;if(i===dr)return n.HALF_FLOAT;if(i===Cu)return n.ALPHA;if(i===Ru)return n.RGB;if(i===Dn)return n.RGBA;if(i===rr)return n.DEPTH_COMPONENT;if(i===or)return n.DEPTH_STENCIL;if(i===Pu)return n.RED;if(i===Ac)return n.RED_INTEGER;if(i===Du)return n.RG;if(i===Tc)return n.RG_INTEGER;if(i===wc)return n.RGBA_INTEGER;if(i===jr||i===Kr||i===Zr||i===Jr)if(o===gt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===jr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Jr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===jr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Kr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Zr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Jr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ba||i===ka||i===za||i===Ha)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ba)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===ka)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===za)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ha)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Va||i===Ga||i===Wa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Va||i===Ga)return o===gt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Wa)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===$a||i===Xa||i===qa||i===Ya||i===ja||i===Ka||i===Za||i===Ja||i===Qa||i===ec||i===tc||i===nc||i===ic||i===sc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===$a)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Xa)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===qa)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Ya)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ja)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ka)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Za)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Ja)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Qa)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ec)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===tc)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===nc)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===ic)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===sc)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===rc||i===oc||i===ac)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===rc)return o===gt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===oc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===ac)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===cc||i===lc||i===uc||i===hc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===cc)return r.COMPRESSED_RED_RGTC1_EXT;if(i===lc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===uc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===hc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===sr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const W_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,$_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class X_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new Gu(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Ni({vertexShader:W_,fragmentShader:$_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ln(new yo(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class q_ extends is{constructor(e,t){super();const i=this;let s=null,r=1,o=null,a="local-floor",c=1,l=null,u=null,h=null,f=null,m=null,g=null;const _=typeof XRWebGLBinding<"u",p=new X_,d={},x=t.getContextAttributes();let E=null,M=null;const w=[],C=[],T=new We;let L=null;const b=new Mn;b.viewport=new Lt;const S=new Mn;S.viewport=new Lt;const P=[b,S],N=new df;let z=null,W=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let ne=w[J];return ne===void 0&&(ne=new sa,w[J]=ne),ne.getTargetRaySpace()},this.getControllerGrip=function(J){let ne=w[J];return ne===void 0&&(ne=new sa,w[J]=ne),ne.getGripSpace()},this.getHand=function(J){let ne=w[J];return ne===void 0&&(ne=new sa,w[J]=ne),ne.getHandSpace()};function $(J){const ne=C.indexOf(J.inputSource);if(ne===-1)return;const Me=w[ne];Me!==void 0&&(Me.update(J.inputSource,J.frame,l||o),Me.dispatchEvent({type:J.type,data:J.inputSource}))}function Y(){s.removeEventListener("select",$),s.removeEventListener("selectstart",$),s.removeEventListener("selectend",$),s.removeEventListener("squeeze",$),s.removeEventListener("squeezestart",$),s.removeEventListener("squeezeend",$),s.removeEventListener("end",Y),s.removeEventListener("inputsourceschange",Q);for(let J=0;J<w.length;J++){const ne=C[J];ne!==null&&(C[J]=null,w[J].disconnect(ne))}z=null,W=null,p.reset();for(const J in d)delete d[J];e.setRenderTarget(E),m=null,f=null,h=null,s=null,M=null,et.stop(),i.isPresenting=!1,e.setPixelRatio(L),e.setSize(T.width,T.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){a=J,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(J){l=J},this.getBaseLayer=function(){return f!==null?f:m},this.getBinding=function(){return h===null&&_&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",$),s.addEventListener("selectstart",$),s.addEventListener("selectend",$),s.addEventListener("squeeze",$),s.addEventListener("squeezestart",$),s.addEventListener("squeezeend",$),s.addEventListener("end",Y),s.addEventListener("inputsourceschange",Q),x.xrCompatible!==!0&&await t.makeXRCompatible(),L=e.getPixelRatio(),e.getSize(T),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Me=null,Le=null,Ce=null;x.depth&&(Ce=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Me=x.stencil?or:rr,Le=x.stencil?sr:Qi);const Ze={colorFormat:t.RGBA8,depthFormat:Ce,scaleFactor:r};h=this.getBinding(),f=h.createProjectionLayer(Ze),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),M=new es(f.textureWidth,f.textureHeight,{format:Dn,type:hi,depthTexture:new Vu(f.textureWidth,f.textureHeight,Le,void 0,void 0,void 0,void 0,void 0,void 0,Me),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const Me={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,Me),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),M=new es(m.framebufferWidth,m.framebufferHeight,{format:Dn,type:hi,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),et.setContext(s),et.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function Q(J){for(let ne=0;ne<J.removed.length;ne++){const Me=J.removed[ne],Le=C.indexOf(Me);Le>=0&&(C[Le]=null,w[Le].disconnect(Me))}for(let ne=0;ne<J.added.length;ne++){const Me=J.added[ne];let Le=C.indexOf(Me);if(Le===-1){for(let Ze=0;Ze<w.length;Ze++)if(Ze>=C.length){C.push(Me),Le=Ze;break}else if(C[Ze]===null){C[Ze]=Me,Le=Ze;break}if(Le===-1)break}const Ce=w[Le];Ce&&Ce.connect(Me)}}const X=new R,ae=new R;function me(J,ne,Me){X.setFromMatrixPosition(ne.matrixWorld),ae.setFromMatrixPosition(Me.matrixWorld);const Le=X.distanceTo(ae),Ce=ne.projectionMatrix.elements,Ze=Me.projectionMatrix.elements,Rt=Ce[14]/(Ce[10]-1),D=Ce[14]/(Ce[10]+1),St=(Ce[9]+1)/Ce[5],He=(Ce[9]-1)/Ce[5],Ie=(Ce[8]-1)/Ce[0],_e=(Ze[8]+1)/Ze[0],dt=Rt*Ie,Se=Rt*_e,Ve=Le/(-Ie+_e),at=Ve*-Ie;if(ne.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(at),J.translateZ(Ve),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Ce[10]===-1)J.projectionMatrix.copy(ne.projectionMatrix),J.projectionMatrixInverse.copy(ne.projectionMatrixInverse);else{const Et=Rt+Ve,A=D+Ve,v=dt-at,B=Se+(Le-at),K=St*D/A*Et,te=He*D/A*Et;J.projectionMatrix.makePerspective(v,B,K,te,Et,A),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function Re(J,ne){ne===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(ne.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let ne=J.near,Me=J.far;p.texture!==null&&(p.depthNear>0&&(ne=p.depthNear),p.depthFar>0&&(Me=p.depthFar)),N.near=S.near=b.near=ne,N.far=S.far=b.far=Me,(z!==N.near||W!==N.far)&&(s.updateRenderState({depthNear:N.near,depthFar:N.far}),z=N.near,W=N.far),N.layers.mask=J.layers.mask|6,b.layers.mask=N.layers.mask&3,S.layers.mask=N.layers.mask&5;const Le=J.parent,Ce=N.cameras;Re(N,Le);for(let Ze=0;Ze<Ce.length;Ze++)Re(Ce[Ze],Le);Ce.length===2?me(N,b,S):N.projectionMatrix.copy(b.projectionMatrix),Ye(J,N,Le)};function Ye(J,ne,Me){Me===null?J.matrix.copy(ne.matrixWorld):(J.matrix.copy(Me.matrixWorld),J.matrix.invert(),J.matrix.multiply(ne.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(ne.projectionMatrix),J.projectionMatrixInverse.copy(ne.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=dc*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(!(f===null&&m===null))return c},this.setFoveation=function(J){c=J,f!==null&&(f.fixedFoveation=J),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=J)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(N)},this.getCameraTexture=function(J){return d[J]};let ot=null;function Mt(J,ne){if(u=ne.getViewerPose(l||o),g=ne,u!==null){const Me=u.views;m!==null&&(e.setRenderTargetFramebuffer(M,m.framebuffer),e.setRenderTarget(M));let Le=!1;Me.length!==N.cameras.length&&(N.cameras.length=0,Le=!0);for(let D=0;D<Me.length;D++){const St=Me[D];let He=null;if(m!==null)He=m.getViewport(St);else{const _e=h.getViewSubImage(f,St);He=_e.viewport,D===0&&(e.setRenderTargetTextures(M,_e.colorTexture,_e.depthStencilTexture),e.setRenderTarget(M))}let Ie=P[D];Ie===void 0&&(Ie=new Mn,Ie.layers.enable(D),Ie.viewport=new Lt,P[D]=Ie),Ie.matrix.fromArray(St.transform.matrix),Ie.matrix.decompose(Ie.position,Ie.quaternion,Ie.scale),Ie.projectionMatrix.fromArray(St.projectionMatrix),Ie.projectionMatrixInverse.copy(Ie.projectionMatrix).invert(),Ie.viewport.set(He.x,He.y,He.width,He.height),D===0&&(N.matrix.copy(Ie.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),Le===!0&&N.cameras.push(Ie)}const Ce=s.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){h=i.getBinding();const D=h.getDepthInformation(Me[0]);D&&D.isValid&&D.texture&&p.init(D,s.renderState)}if(Ce&&Ce.includes("camera-access")&&_){e.state.unbindTexture(),h=i.getBinding();for(let D=0;D<Me.length;D++){const St=Me[D].camera;if(St){let He=d[St];He||(He=new Gu,d[St]=He);const Ie=h.getCameraImage(St);He.sourceTexture=Ie}}}}for(let Me=0;Me<w.length;Me++){const Le=C[Me],Ce=w[Me];Le!==null&&Ce!==void 0&&Ce.update(Le,ne,l||o)}ot&&ot(J,ne),ne.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ne}),g=null}const et=new Wu;et.setAnimationLoop(Mt),this.setAnimationLoop=function(J){ot=J},this.dispose=function(){}}}const $i=new fi,Y_=new vt;function j_(n,e){function t(p,d){p.matrixAutoUpdate===!0&&p.updateMatrix(),d.value.copy(p.matrix)}function i(p,d){d.color.getRGB(p.fogColor.value,Bu(n)),d.isFog?(p.fogNear.value=d.near,p.fogFar.value=d.far):d.isFogExp2&&(p.fogDensity.value=d.density)}function s(p,d,x,E,M){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(p,d):d.isMeshToonMaterial?(r(p,d),h(p,d)):d.isMeshPhongMaterial?(r(p,d),u(p,d)):d.isMeshStandardMaterial?(r(p,d),f(p,d),d.isMeshPhysicalMaterial&&m(p,d,M)):d.isMeshMatcapMaterial?(r(p,d),g(p,d)):d.isMeshDepthMaterial?r(p,d):d.isMeshDistanceMaterial?(r(p,d),_(p,d)):d.isMeshNormalMaterial?r(p,d):d.isLineBasicMaterial?(o(p,d),d.isLineDashedMaterial&&a(p,d)):d.isPointsMaterial?c(p,d,x,E):d.isSpriteMaterial?l(p,d):d.isShadowMaterial?(p.color.value.copy(d.color),p.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(p,d){p.opacity.value=d.opacity,d.color&&p.diffuse.value.copy(d.color),d.emissive&&p.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(p.map.value=d.map,t(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.bumpMap&&(p.bumpMap.value=d.bumpMap,t(d.bumpMap,p.bumpMapTransform),p.bumpScale.value=d.bumpScale,d.side===an&&(p.bumpScale.value*=-1)),d.normalMap&&(p.normalMap.value=d.normalMap,t(d.normalMap,p.normalMapTransform),p.normalScale.value.copy(d.normalScale),d.side===an&&p.normalScale.value.negate()),d.displacementMap&&(p.displacementMap.value=d.displacementMap,t(d.displacementMap,p.displacementMapTransform),p.displacementScale.value=d.displacementScale,p.displacementBias.value=d.displacementBias),d.emissiveMap&&(p.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,p.emissiveMapTransform)),d.specularMap&&(p.specularMap.value=d.specularMap,t(d.specularMap,p.specularMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest);const x=e.get(d),E=x.envMap,M=x.envMapRotation;E&&(p.envMap.value=E,$i.copy(M),$i.x*=-1,$i.y*=-1,$i.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&($i.y*=-1,$i.z*=-1),p.envMapRotation.value.setFromMatrix4(Y_.makeRotationFromEuler($i)),p.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=d.reflectivity,p.ior.value=d.ior,p.refractionRatio.value=d.refractionRatio),d.lightMap&&(p.lightMap.value=d.lightMap,p.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,p.lightMapTransform)),d.aoMap&&(p.aoMap.value=d.aoMap,p.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,p.aoMapTransform))}function o(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,d.map&&(p.map.value=d.map,t(d.map,p.mapTransform))}function a(p,d){p.dashSize.value=d.dashSize,p.totalSize.value=d.dashSize+d.gapSize,p.scale.value=d.scale}function c(p,d,x,E){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.size.value=d.size*x,p.scale.value=E*.5,d.map&&(p.map.value=d.map,t(d.map,p.uvTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function l(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.rotation.value=d.rotation,d.map&&(p.map.value=d.map,t(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function u(p,d){p.specular.value.copy(d.specular),p.shininess.value=Math.max(d.shininess,1e-4)}function h(p,d){d.gradientMap&&(p.gradientMap.value=d.gradientMap)}function f(p,d){p.metalness.value=d.metalness,d.metalnessMap&&(p.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,p.metalnessMapTransform)),p.roughness.value=d.roughness,d.roughnessMap&&(p.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,p.roughnessMapTransform)),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)}function m(p,d,x){p.ior.value=d.ior,d.sheen>0&&(p.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),p.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(p.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,p.sheenColorMapTransform)),d.sheenRoughnessMap&&(p.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,p.sheenRoughnessMapTransform))),d.clearcoat>0&&(p.clearcoat.value=d.clearcoat,p.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(p.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,p.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(p.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===an&&p.clearcoatNormalScale.value.negate())),d.dispersion>0&&(p.dispersion.value=d.dispersion),d.iridescence>0&&(p.iridescence.value=d.iridescence,p.iridescenceIOR.value=d.iridescenceIOR,p.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(p.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,p.iridescenceMapTransform)),d.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),d.transmission>0&&(p.transmission.value=d.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),d.transmissionMap&&(p.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,p.transmissionMapTransform)),p.thickness.value=d.thickness,d.thicknessMap&&(p.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=d.attenuationDistance,p.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(p.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(p.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=d.specularIntensity,p.specularColor.value.copy(d.specularColor),d.specularColorMap&&(p.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,p.specularColorMapTransform)),d.specularIntensityMap&&(p.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,d){d.matcap&&(p.matcap.value=d.matcap)}function _(p,d){const x=e.get(d).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function K_(n,e,t,i){let s={},r={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(x,E){const M=E.program;i.uniformBlockBinding(x,M)}function l(x,E){let M=s[x.id];M===void 0&&(g(x),M=u(x),s[x.id]=M,x.addEventListener("dispose",p));const w=E.program;i.updateUBOMapping(x,w);const C=e.render.frame;r[x.id]!==C&&(f(x),r[x.id]=C)}function u(x){const E=h();x.__bindingPointIndex=E;const M=n.createBuffer(),w=x.__size,C=x.usage;return n.bindBuffer(n.UNIFORM_BUFFER,M),n.bufferData(n.UNIFORM_BUFFER,w,C),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,E,M),M}function h(){for(let x=0;x<a;x++)if(o.indexOf(x)===-1)return o.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(x){const E=s[x.id],M=x.uniforms,w=x.__cache;n.bindBuffer(n.UNIFORM_BUFFER,E);for(let C=0,T=M.length;C<T;C++){const L=Array.isArray(M[C])?M[C]:[M[C]];for(let b=0,S=L.length;b<S;b++){const P=L[b];if(m(P,C,b,w)===!0){const N=P.__offset,z=Array.isArray(P.value)?P.value:[P.value];let W=0;for(let $=0;$<z.length;$++){const Y=z[$],Q=_(Y);typeof Y=="number"||typeof Y=="boolean"?(P.__data[0]=Y,n.bufferSubData(n.UNIFORM_BUFFER,N+W,P.__data)):Y.isMatrix3?(P.__data[0]=Y.elements[0],P.__data[1]=Y.elements[1],P.__data[2]=Y.elements[2],P.__data[3]=0,P.__data[4]=Y.elements[3],P.__data[5]=Y.elements[4],P.__data[6]=Y.elements[5],P.__data[7]=0,P.__data[8]=Y.elements[6],P.__data[9]=Y.elements[7],P.__data[10]=Y.elements[8],P.__data[11]=0):(Y.toArray(P.__data,W),W+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,N,P.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function m(x,E,M,w){const C=x.value,T=E+"_"+M;if(w[T]===void 0)return typeof C=="number"||typeof C=="boolean"?w[T]=C:w[T]=C.clone(),!0;{const L=w[T];if(typeof C=="number"||typeof C=="boolean"){if(L!==C)return w[T]=C,!0}else if(L.equals(C)===!1)return L.copy(C),!0}return!1}function g(x){const E=x.uniforms;let M=0;const w=16;for(let T=0,L=E.length;T<L;T++){const b=Array.isArray(E[T])?E[T]:[E[T]];for(let S=0,P=b.length;S<P;S++){const N=b[S],z=Array.isArray(N.value)?N.value:[N.value];for(let W=0,$=z.length;W<$;W++){const Y=z[W],Q=_(Y),X=M%w,ae=X%Q.boundary,me=X+ae;M+=ae,me!==0&&w-me<Q.storage&&(M+=w-me),N.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=M,M+=Q.storage}}}const C=M%w;return C>0&&(M+=w-C),x.__size=M,x.__cache={},this}function _(x){const E={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(E.boundary=4,E.storage=4):x.isVector2?(E.boundary=8,E.storage=8):x.isVector3||x.isColor?(E.boundary=16,E.storage=12):x.isVector4?(E.boundary=16,E.storage=16):x.isMatrix3?(E.boundary=48,E.storage=48):x.isMatrix4?(E.boundary=64,E.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),E}function p(x){const E=x.target;E.removeEventListener("dispose",p);const M=o.indexOf(E.__bindingPointIndex);o.splice(M,1),n.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function d(){for(const x in s)n.deleteBuffer(s[x]);o=[],s={},r={}}return{bind:c,update:l,dispose:d}}class Z_{constructor(e={}){const{canvas:t=Dd(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=o;const g=new Uint32Array(4),_=new Int32Array(4);let p=null,d=null;const x=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Di,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const M=this;let w=!1;this._outputColorSpace=xn;let C=0,T=0,L=null,b=-1,S=null;const P=new Lt,N=new Lt;let z=null;const W=new ut(0);let $=0,Y=t.width,Q=t.height,X=1,ae=null,me=null;const Re=new Lt(0,0,Y,Q),Ye=new Lt(0,0,Y,Q);let ot=!1;const Mt=new Hu;let et=!1,J=!1;const ne=new vt,Me=new R,Le=new Lt,Ce={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ze=!1;function Rt(){return L===null?X:1}let D=i;function St(y,U){return t.getContext(y,U)}try{const y={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Sc}`),t.addEventListener("webglcontextlost",le,!1),t.addEventListener("webglcontextrestored",ve,!1),t.addEventListener("webglcontextcreationerror",ie,!1),D===null){const U="webgl2";if(D=St(U,y),D===null)throw St(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(y){throw console.error("THREE.WebGLRenderer: "+y.message),y}let He,Ie,_e,dt,Se,Ve,at,Et,A,v,B,K,te,j,we,ce,Ee,ye,se,fe,Ue,be,he,Ge;function I(){He=new ag(D),He.init(),be=new G_(D,He),Ie=new eg(D,He,e,be),_e=new H_(D,He),Ie.reversedDepthBuffer&&f&&_e.buffers.depth.setReversed(!0),dt=new ug(D),Se=new C_,Ve=new V_(D,He,_e,Se,Ie,be,dt),at=new ng(M),Et=new og(M),A=new gf(D),he=new Jm(D,A),v=new cg(D,A,dt,he),B=new dg(D,v,A,dt),se=new hg(D,Ie,Ve),ce=new tg(Se),K=new w_(M,at,Et,He,Ie,he,ce),te=new j_(M,Se),j=new P_,we=new F_(He),ye=new Zm(M,at,Et,_e,B,m,c),Ee=new k_(M,B,Ie),Ge=new K_(D,dt,Ie,_e),fe=new Qm(D,He,dt),Ue=new lg(D,He,dt),dt.programs=K.programs,M.capabilities=Ie,M.extensions=He,M.properties=Se,M.renderLists=j,M.shadowMap=Ee,M.state=_e,M.info=dt}I();const re=new q_(M,D);this.xr=re,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const y=He.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=He.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return X},this.setPixelRatio=function(y){y!==void 0&&(X=y,this.setSize(Y,Q,!1))},this.getSize=function(y){return y.set(Y,Q)},this.setSize=function(y,U,k=!0){if(re.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=y,Q=U,t.width=Math.floor(y*X),t.height=Math.floor(U*X),k===!0&&(t.style.width=y+"px",t.style.height=U+"px"),this.setViewport(0,0,y,U)},this.getDrawingBufferSize=function(y){return y.set(Y*X,Q*X).floor()},this.setDrawingBufferSize=function(y,U,k){Y=y,Q=U,X=k,t.width=Math.floor(y*k),t.height=Math.floor(U*k),this.setViewport(0,0,y,U)},this.getCurrentViewport=function(y){return y.copy(P)},this.getViewport=function(y){return y.copy(Re)},this.setViewport=function(y,U,k,H){y.isVector4?Re.set(y.x,y.y,y.z,y.w):Re.set(y,U,k,H),_e.viewport(P.copy(Re).multiplyScalar(X).round())},this.getScissor=function(y){return y.copy(Ye)},this.setScissor=function(y,U,k,H){y.isVector4?Ye.set(y.x,y.y,y.z,y.w):Ye.set(y,U,k,H),_e.scissor(N.copy(Ye).multiplyScalar(X).round())},this.getScissorTest=function(){return ot},this.setScissorTest=function(y){_e.setScissorTest(ot=y)},this.setOpaqueSort=function(y){ae=y},this.setTransparentSort=function(y){me=y},this.getClearColor=function(y){return y.copy(ye.getClearColor())},this.setClearColor=function(){ye.setClearColor(...arguments)},this.getClearAlpha=function(){return ye.getClearAlpha()},this.setClearAlpha=function(){ye.setClearAlpha(...arguments)},this.clear=function(y=!0,U=!0,k=!0){let H=0;if(y){let O=!1;if(L!==null){const oe=L.texture.format;O=oe===wc||oe===Tc||oe===Ac}if(O){const oe=L.texture.type,ge=oe===hi||oe===Qi||oe===ir||oe===sr||oe===yc||oe===bc,Te=ye.getClearColor(),xe=ye.getClearAlpha(),Fe=Te.r,Oe=Te.g,De=Te.b;ge?(g[0]=Fe,g[1]=Oe,g[2]=De,g[3]=xe,D.clearBufferuiv(D.COLOR,0,g)):(_[0]=Fe,_[1]=Oe,_[2]=De,_[3]=xe,D.clearBufferiv(D.COLOR,0,_))}else H|=D.COLOR_BUFFER_BIT}U&&(H|=D.DEPTH_BUFFER_BIT),k&&(H|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",le,!1),t.removeEventListener("webglcontextrestored",ve,!1),t.removeEventListener("webglcontextcreationerror",ie,!1),ye.dispose(),j.dispose(),we.dispose(),Se.dispose(),at.dispose(),Et.dispose(),B.dispose(),he.dispose(),Ge.dispose(),K.dispose(),re.dispose(),re.removeEventListener("sessionstart",Ut),re.removeEventListener("sessionend",G),F.stop()};function le(y){y.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function ve(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const y=dt.autoReset,U=Ee.enabled,k=Ee.autoUpdate,H=Ee.needsUpdate,O=Ee.type;I(),dt.autoReset=y,Ee.enabled=U,Ee.autoUpdate=k,Ee.needsUpdate=H,Ee.type=O}function ie(y){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function ee(y){const U=y.target;U.removeEventListener("dispose",ee),Ae(U)}function Ae(y){Be(y),Se.remove(y)}function Be(y){const U=Se.get(y).programs;U!==void 0&&(U.forEach(function(k){K.releaseProgram(k)}),y.isShaderMaterial&&K.releaseShaderCache(y))}this.renderBufferDirect=function(y,U,k,H,O,oe){U===null&&(U=Ce);const ge=O.isMesh&&O.matrixWorld.determinant()<0,Te=tt(y,U,k,H,O);_e.setMaterial(H,ge);let xe=k.index,Fe=1;if(H.wireframe===!0){if(xe=v.getWireframeAttribute(k),xe===void 0)return;Fe=2}const Oe=k.drawRange,De=k.attributes.position;let Qe=Oe.start*Fe,mt=(Oe.start+Oe.count)*Fe;oe!==null&&(Qe=Math.max(Qe,oe.start*Fe),mt=Math.min(mt,(oe.start+oe.count)*Fe)),xe!==null?(Qe=Math.max(Qe,0),mt=Math.min(mt,xe.count)):De!=null&&(Qe=Math.max(Qe,0),mt=Math.min(mt,De.count));const Pt=mt-Qe;if(Pt<0||Pt===1/0)return;he.setup(O,H,Te,k,xe);let At,xt=fe;if(xe!==null&&(At=A.get(xe),xt=Ue,xt.setIndex(At)),O.isMesh)H.wireframe===!0?(_e.setLineWidth(H.wireframeLinewidth*Rt()),xt.setMode(D.LINES)):xt.setMode(D.TRIANGLES);else if(O.isLine){let Ne=H.linewidth;Ne===void 0&&(Ne=1),_e.setLineWidth(Ne*Rt()),O.isLineSegments?xt.setMode(D.LINES):O.isLineLoop?xt.setMode(D.LINE_LOOP):xt.setMode(D.LINE_STRIP)}else O.isPoints?xt.setMode(D.POINTS):O.isSprite&&xt.setMode(D.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)ar("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),xt.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(He.get("WEBGL_multi_draw"))xt.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const Ne=O._multiDrawStarts,wt=O._multiDrawCounts,it=O._multiDrawCount,hn=xe?A.get(xe).bytesPerElement:1,ss=Se.get(H).currentProgram.getUniforms();for(let dn=0;dn<it;dn++)ss.setValue(D,"_gl_DrawID",dn),xt.render(Ne[dn]/hn,wt[dn])}else if(O.isInstancedMesh)xt.renderInstances(Qe,Pt,O.count);else if(k.isInstancedBufferGeometry){const Ne=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,wt=Math.min(k.instanceCount,Ne);xt.renderInstances(Qe,Pt,wt)}else xt.render(Qe,Pt)};function ft(y,U,k){y.transparent===!0&&y.side===Wn&&y.forceSinglePass===!1?(y.side=an,y.needsUpdate=!0,Xe(y,U,k),y.side=Ui,y.needsUpdate=!0,Xe(y,U,k),y.side=Wn):Xe(y,U,k)}this.compile=function(y,U,k=null){k===null&&(k=y),d=we.get(k),d.init(U),E.push(d),k.traverseVisible(function(O){O.isLight&&O.layers.test(U.layers)&&(d.pushLight(O),O.castShadow&&d.pushShadow(O))}),y!==k&&y.traverseVisible(function(O){O.isLight&&O.layers.test(U.layers)&&(d.pushLight(O),O.castShadow&&d.pushShadow(O))}),d.setupLights();const H=new Set;return y.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const oe=O.material;if(oe)if(Array.isArray(oe))for(let ge=0;ge<oe.length;ge++){const Te=oe[ge];ft(Te,k,O),H.add(Te)}else ft(oe,k,O),H.add(oe)}),d=E.pop(),H},this.compileAsync=function(y,U,k=null){const H=this.compile(y,U,k);return new Promise(O=>{function oe(){if(H.forEach(function(ge){Se.get(ge).currentProgram.isReady()&&H.delete(ge)}),H.size===0){O(y);return}setTimeout(oe,10)}He.get("KHR_parallel_shader_compile")!==null?oe():setTimeout(oe,10)})};let nt=null;function An(y){nt&&nt(y)}function Ut(){F.stop()}function G(){F.start()}const F=new Wu;F.setAnimationLoop(An),typeof self<"u"&&F.setContext(self),this.setAnimationLoop=function(y){nt=y,re.setAnimationLoop(y),y===null?F.stop():F.start()},re.addEventListener("sessionstart",Ut),re.addEventListener("sessionend",G),this.render=function(y,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(re.cameraAutoUpdate===!0&&re.updateCamera(U),U=re.getCamera()),y.isScene===!0&&y.onBeforeRender(M,y,U,L),d=we.get(y,E.length),d.init(U),E.push(d),ne.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Mt.setFromProjectionMatrix(ne,Xn,U.reversedDepth),J=this.localClippingEnabled,et=ce.init(this.clippingPlanes,J),p=j.get(y,x.length),p.init(),x.push(p),re.enabled===!0&&re.isPresenting===!0){const oe=M.xr.getDepthSensingMesh();oe!==null&&q(oe,U,-1/0,M.sortObjects)}q(y,U,0,M.sortObjects),p.finish(),M.sortObjects===!0&&p.sort(ae,me),Ze=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,Ze&&ye.addToRenderList(p,y),this.info.render.frame++,et===!0&&ce.beginShadows();const k=d.state.shadowsArray;Ee.render(k,y,U),et===!0&&ce.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=p.opaque,O=p.transmissive;if(d.setupLights(),U.isArrayCamera){const oe=U.cameras;if(O.length>0)for(let ge=0,Te=oe.length;ge<Te;ge++){const xe=oe[ge];pe(H,O,y,xe)}Ze&&ye.render(y);for(let ge=0,Te=oe.length;ge<Te;ge++){const xe=oe[ge];Z(p,y,xe,xe.viewport)}}else O.length>0&&pe(H,O,y,U),Ze&&ye.render(y),Z(p,y,U);L!==null&&T===0&&(Ve.updateMultisampleRenderTarget(L),Ve.updateRenderTargetMipmap(L)),y.isScene===!0&&y.onAfterRender(M,y,U),he.resetDefaultState(),b=-1,S=null,E.pop(),E.length>0?(d=E[E.length-1],et===!0&&ce.setGlobalState(M.clippingPlanes,d.state.camera)):d=null,x.pop(),x.length>0?p=x[x.length-1]:p=null};function q(y,U,k,H){if(y.visible===!1)return;if(y.layers.test(U.layers)){if(y.isGroup)k=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(U);else if(y.isLight)d.pushLight(y),y.castShadow&&d.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||Mt.intersectsSprite(y)){H&&Le.setFromMatrixPosition(y.matrixWorld).applyMatrix4(ne);const ge=B.update(y),Te=y.material;Te.visible&&p.push(y,ge,Te,k,Le.z,null)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||Mt.intersectsObject(y))){const ge=B.update(y),Te=y.material;if(H&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Le.copy(y.boundingSphere.center)):(ge.boundingSphere===null&&ge.computeBoundingSphere(),Le.copy(ge.boundingSphere.center)),Le.applyMatrix4(y.matrixWorld).applyMatrix4(ne)),Array.isArray(Te)){const xe=ge.groups;for(let Fe=0,Oe=xe.length;Fe<Oe;Fe++){const De=xe[Fe],Qe=Te[De.materialIndex];Qe&&Qe.visible&&p.push(y,ge,Qe,k,Le.z,De)}}else Te.visible&&p.push(y,ge,Te,k,Le.z,null)}}const oe=y.children;for(let ge=0,Te=oe.length;ge<Te;ge++)q(oe[ge],U,k,H)}function Z(y,U,k,H){const O=y.opaque,oe=y.transmissive,ge=y.transparent;d.setupLightsView(k),et===!0&&ce.setGlobalState(M.clippingPlanes,k),H&&_e.viewport(P.copy(H)),O.length>0&&ue(O,U,k),oe.length>0&&ue(oe,U,k),ge.length>0&&ue(ge,U,k),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function pe(y,U,k,H){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[H.id]===void 0&&(d.state.transmissionRenderTarget[H.id]=new es(1,1,{generateMipmaps:!0,type:He.has("EXT_color_buffer_half_float")||He.has("EXT_color_buffer_float")?dr:hi,minFilter:Ji,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:st.workingColorSpace}));const oe=d.state.transmissionRenderTarget[H.id],ge=H.viewport||P;oe.setSize(ge.z*M.transmissionResolutionScale,ge.w*M.transmissionResolutionScale);const Te=M.getRenderTarget(),xe=M.getActiveCubeFace(),Fe=M.getActiveMipmapLevel();M.setRenderTarget(oe),M.getClearColor(W),$=M.getClearAlpha(),$<1&&M.setClearColor(16777215,.5),M.clear(),Ze&&ye.render(k);const Oe=M.toneMapping;M.toneMapping=Di;const De=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),d.setupLightsView(H),et===!0&&ce.setGlobalState(M.clippingPlanes,H),ue(y,k,H),Ve.updateMultisampleRenderTarget(oe),Ve.updateRenderTargetMipmap(oe),He.has("WEBGL_multisampled_render_to_texture")===!1){let Qe=!1;for(let mt=0,Pt=U.length;mt<Pt;mt++){const At=U[mt],xt=At.object,Ne=At.geometry,wt=At.material,it=At.group;if(wt.side===Wn&&xt.layers.test(H.layers)){const hn=wt.side;wt.side=an,wt.needsUpdate=!0,Je(xt,k,H,Ne,wt,it),wt.side=hn,wt.needsUpdate=!0,Qe=!0}}Qe===!0&&(Ve.updateMultisampleRenderTarget(oe),Ve.updateRenderTargetMipmap(oe))}M.setRenderTarget(Te,xe,Fe),M.setClearColor(W,$),De!==void 0&&(H.viewport=De),M.toneMapping=Oe}function ue(y,U,k){const H=U.isScene===!0?U.overrideMaterial:null;for(let O=0,oe=y.length;O<oe;O++){const ge=y[O],Te=ge.object,xe=ge.geometry,Fe=ge.group;let Oe=ge.material;Oe.allowOverride===!0&&H!==null&&(Oe=H),Te.layers.test(k.layers)&&Je(Te,U,k,xe,Oe,Fe)}}function Je(y,U,k,H,O,oe){y.onBeforeRender(M,U,k,H,O,oe),y.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),O.onBeforeRender(M,U,k,H,y,oe),O.transparent===!0&&O.side===Wn&&O.forceSinglePass===!1?(O.side=an,O.needsUpdate=!0,M.renderBufferDirect(k,U,H,O,y,oe),O.side=Ui,O.needsUpdate=!0,M.renderBufferDirect(k,U,H,O,y,oe),O.side=Wn):M.renderBufferDirect(k,U,H,O,y,oe),y.onAfterRender(M,U,k,H,O,oe)}function Xe(y,U,k){U.isScene!==!0&&(U=Ce);const H=Se.get(y),O=d.state.lights,oe=d.state.shadowsArray,ge=O.state.version,Te=K.getParameters(y,O.state,oe,U,k),xe=K.getProgramCacheKey(Te);let Fe=H.programs;H.environment=y.isMeshStandardMaterial?U.environment:null,H.fog=U.fog,H.envMap=(y.isMeshStandardMaterial?Et:at).get(y.envMap||H.environment),H.envMapRotation=H.environment!==null&&y.envMap===null?U.environmentRotation:y.envMapRotation,Fe===void 0&&(y.addEventListener("dispose",ee),Fe=new Map,H.programs=Fe);let Oe=Fe.get(xe);if(Oe!==void 0){if(H.currentProgram===Oe&&H.lightsStateVersion===ge)return Nt(y,Te),Oe}else Te.uniforms=K.getUniforms(y),y.onBeforeCompile(Te,M),Oe=K.acquireProgram(Te,xe),Fe.set(xe,Oe),H.uniforms=Te.uniforms;const De=H.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(De.clippingPlanes=ce.uniform),Nt(y,Te),H.needsLights=un(y),H.lightsStateVersion=ge,H.needsLights&&(De.ambientLightColor.value=O.state.ambient,De.lightProbe.value=O.state.probe,De.directionalLights.value=O.state.directional,De.directionalLightShadows.value=O.state.directionalShadow,De.spotLights.value=O.state.spot,De.spotLightShadows.value=O.state.spotShadow,De.rectAreaLights.value=O.state.rectArea,De.ltc_1.value=O.state.rectAreaLTC1,De.ltc_2.value=O.state.rectAreaLTC2,De.pointLights.value=O.state.point,De.pointLightShadows.value=O.state.pointShadow,De.hemisphereLights.value=O.state.hemi,De.directionalShadowMap.value=O.state.directionalShadowMap,De.directionalShadowMatrix.value=O.state.directionalShadowMatrix,De.spotShadowMap.value=O.state.spotShadowMap,De.spotLightMatrix.value=O.state.spotLightMatrix,De.spotLightMap.value=O.state.spotLightMap,De.pointShadowMap.value=O.state.pointShadowMap,De.pointShadowMatrix.value=O.state.pointShadowMatrix),H.currentProgram=Oe,H.uniformsList=null,Oe}function pt(y){if(y.uniformsList===null){const U=y.currentProgram.getUniforms();y.uniformsList=eo.seqWithValue(U.seq,y.uniforms)}return y.uniformsList}function Nt(y,U){const k=Se.get(y);k.outputColorSpace=U.outputColorSpace,k.batching=U.batching,k.batchingColor=U.batchingColor,k.instancing=U.instancing,k.instancingColor=U.instancingColor,k.instancingMorph=U.instancingMorph,k.skinning=U.skinning,k.morphTargets=U.morphTargets,k.morphNormals=U.morphNormals,k.morphColors=U.morphColors,k.morphTargetsCount=U.morphTargetsCount,k.numClippingPlanes=U.numClippingPlanes,k.numIntersection=U.numClipIntersection,k.vertexAlphas=U.vertexAlphas,k.vertexTangents=U.vertexTangents,k.toneMapping=U.toneMapping}function tt(y,U,k,H,O){U.isScene!==!0&&(U=Ce),Ve.resetTextureUnits();const oe=U.fog,ge=H.isMeshStandardMaterial?U.environment:null,Te=L===null?M.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:Ns,xe=(H.isMeshStandardMaterial?Et:at).get(H.envMap||ge),Fe=H.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Oe=!!k.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),De=!!k.morphAttributes.position,Qe=!!k.morphAttributes.normal,mt=!!k.morphAttributes.color;let Pt=Di;H.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(Pt=M.toneMapping);const At=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,xt=At!==void 0?At.length:0,Ne=Se.get(H),wt=d.state.lights;if(et===!0&&(J===!0||y!==S)){const Qt=y===S&&H.id===b;ce.setState(H,y,Qt)}let it=!1;H.version===Ne.__version?(Ne.needsLights&&Ne.lightsStateVersion!==wt.state.version||Ne.outputColorSpace!==Te||O.isBatchedMesh&&Ne.batching===!1||!O.isBatchedMesh&&Ne.batching===!0||O.isBatchedMesh&&Ne.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Ne.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Ne.instancing===!1||!O.isInstancedMesh&&Ne.instancing===!0||O.isSkinnedMesh&&Ne.skinning===!1||!O.isSkinnedMesh&&Ne.skinning===!0||O.isInstancedMesh&&Ne.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Ne.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Ne.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Ne.instancingMorph===!1&&O.morphTexture!==null||Ne.envMap!==xe||H.fog===!0&&Ne.fog!==oe||Ne.numClippingPlanes!==void 0&&(Ne.numClippingPlanes!==ce.numPlanes||Ne.numIntersection!==ce.numIntersection)||Ne.vertexAlphas!==Fe||Ne.vertexTangents!==Oe||Ne.morphTargets!==De||Ne.morphNormals!==Qe||Ne.morphColors!==mt||Ne.toneMapping!==Pt||Ne.morphTargetsCount!==xt)&&(it=!0):(it=!0,Ne.__version=H.version);let hn=Ne.currentProgram;it===!0&&(hn=Xe(H,U,O));let ss=!1,dn=!1,Vs=!1;const Ct=hn.getUniforms(),gn=Ne.uniforms;if(_e.useProgram(hn.program)&&(ss=!0,dn=!0,Vs=!0),H.id!==b&&(b=H.id,dn=!0),ss||S!==y){_e.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),Ct.setValue(D,"projectionMatrix",y.projectionMatrix),Ct.setValue(D,"viewMatrix",y.matrixWorldInverse);const nn=Ct.map.cameraPosition;nn!==void 0&&nn.setValue(D,Me.setFromMatrixPosition(y.matrixWorld)),Ie.logarithmicDepthBuffer&&Ct.setValue(D,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&Ct.setValue(D,"isOrthographic",y.isOrthographicCamera===!0),S!==y&&(S=y,dn=!0,Vs=!0)}if(O.isSkinnedMesh){Ct.setOptional(D,O,"bindMatrix"),Ct.setOptional(D,O,"bindMatrixInverse");const Qt=O.skeleton;Qt&&(Qt.boneTexture===null&&Qt.computeBoneTexture(),Ct.setValue(D,"boneTexture",Qt.boneTexture,Ve))}O.isBatchedMesh&&(Ct.setOptional(D,O,"batchingTexture"),Ct.setValue(D,"batchingTexture",O._matricesTexture,Ve),Ct.setOptional(D,O,"batchingIdTexture"),Ct.setValue(D,"batchingIdTexture",O._indirectTexture,Ve),Ct.setOptional(D,O,"batchingColorTexture"),O._colorsTexture!==null&&Ct.setValue(D,"batchingColorTexture",O._colorsTexture,Ve));const _n=k.morphAttributes;if((_n.position!==void 0||_n.normal!==void 0||_n.color!==void 0)&&se.update(O,k,hn),(dn||Ne.receiveShadow!==O.receiveShadow)&&(Ne.receiveShadow=O.receiveShadow,Ct.setValue(D,"receiveShadow",O.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(gn.envMap.value=xe,gn.flipEnvMap.value=xe.isCubeTexture&&xe.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&U.environment!==null&&(gn.envMapIntensity.value=U.environmentIntensity),dn&&(Ct.setValue(D,"toneMappingExposure",M.toneMappingExposure),Ne.needsLights&&ln(gn,Vs),oe&&H.fog===!0&&te.refreshFogUniforms(gn,oe),te.refreshMaterialUniforms(gn,H,X,Q,d.state.transmissionRenderTarget[y.id]),eo.upload(D,pt(Ne),gn,Ve)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(eo.upload(D,pt(Ne),gn,Ve),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&Ct.setValue(D,"center",O.center),Ct.setValue(D,"modelViewMatrix",O.modelViewMatrix),Ct.setValue(D,"normalMatrix",O.normalMatrix),Ct.setValue(D,"modelMatrix",O.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Qt=H.uniformsGroups;for(let nn=0,No=Qt.length;nn<No;nn++){const ki=Qt[nn];Ge.update(ki,hn),Ge.bind(ki,hn)}}return hn}function ln(y,U){y.ambientLightColor.needsUpdate=U,y.lightProbe.needsUpdate=U,y.directionalLights.needsUpdate=U,y.directionalLightShadows.needsUpdate=U,y.pointLights.needsUpdate=U,y.pointLightShadows.needsUpdate=U,y.spotLights.needsUpdate=U,y.spotLightShadows.needsUpdate=U,y.rectAreaLights.needsUpdate=U,y.hemisphereLights.needsUpdate=U}function un(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(y,U,k){const H=Se.get(y);H.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,H.__autoAllocateDepthBuffer===!1&&(H.__useRenderToTexture=!1),Se.get(y.texture).__webglTexture=U,Se.get(y.depthTexture).__webglTexture=H.__autoAllocateDepthBuffer?void 0:k,H.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,U){const k=Se.get(y);k.__webglFramebuffer=U,k.__useDefaultFramebuffer=U===void 0};const Ft=D.createFramebuffer();this.setRenderTarget=function(y,U=0,k=0){L=y,C=U,T=k;let H=!0,O=null,oe=!1,ge=!1;if(y){const xe=Se.get(y);if(xe.__useDefaultFramebuffer!==void 0)_e.bindFramebuffer(D.FRAMEBUFFER,null),H=!1;else if(xe.__webglFramebuffer===void 0)Ve.setupRenderTarget(y);else if(xe.__hasExternalTextures)Ve.rebindTextures(y,Se.get(y.texture).__webglTexture,Se.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){const De=y.depthTexture;if(xe.__boundDepthTexture!==De){if(De!==null&&Se.has(De)&&(y.width!==De.image.width||y.height!==De.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Ve.setupDepthRenderbuffer(y)}}const Fe=y.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(ge=!0);const Oe=Se.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Oe[U])?O=Oe[U][k]:O=Oe[U],oe=!0):y.samples>0&&Ve.useMultisampledRTT(y)===!1?O=Se.get(y).__webglMultisampledFramebuffer:Array.isArray(Oe)?O=Oe[k]:O=Oe,P.copy(y.viewport),N.copy(y.scissor),z=y.scissorTest}else P.copy(Re).multiplyScalar(X).floor(),N.copy(Ye).multiplyScalar(X).floor(),z=ot;if(k!==0&&(O=Ft),_e.bindFramebuffer(D.FRAMEBUFFER,O)&&H&&_e.drawBuffers(y,O),_e.viewport(P),_e.scissor(N),_e.setScissorTest(z),oe){const xe=Se.get(y.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,xe.__webglTexture,k)}else if(ge){const xe=U;for(let Fe=0;Fe<y.textures.length;Fe++){const Oe=Se.get(y.textures[Fe]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Fe,Oe.__webglTexture,k,xe)}}else if(y!==null&&k!==0){const xe=Se.get(y.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,xe.__webglTexture,k)}b=-1},this.readRenderTargetPixels=function(y,U,k,H,O,oe,ge,Te=0){if(!(y&&y.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=Se.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&ge!==void 0&&(xe=xe[ge]),xe){_e.bindFramebuffer(D.FRAMEBUFFER,xe);try{const Fe=y.textures[Te],Oe=Fe.format,De=Fe.type;if(!Ie.textureFormatReadable(Oe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ie.textureTypeReadable(De)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=y.width-H&&k>=0&&k<=y.height-O&&(y.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Te),D.readPixels(U,k,H,O,be.convert(Oe),be.convert(De),oe))}finally{const Fe=L!==null?Se.get(L).__webglFramebuffer:null;_e.bindFramebuffer(D.FRAMEBUFFER,Fe)}}},this.readRenderTargetPixelsAsync=async function(y,U,k,H,O,oe,ge,Te=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=Se.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&ge!==void 0&&(xe=xe[ge]),xe)if(U>=0&&U<=y.width-H&&k>=0&&k<=y.height-O){_e.bindFramebuffer(D.FRAMEBUFFER,xe);const Fe=y.textures[Te],Oe=Fe.format,De=Fe.type;if(!Ie.textureFormatReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ie.textureTypeReadable(De))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Qe=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Qe),D.bufferData(D.PIXEL_PACK_BUFFER,oe.byteLength,D.STREAM_READ),y.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Te),D.readPixels(U,k,H,O,be.convert(Oe),be.convert(De),0);const mt=L!==null?Se.get(L).__webglFramebuffer:null;_e.bindFramebuffer(D.FRAMEBUFFER,mt);const Pt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Ld(D,Pt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Qe),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,oe),D.deleteBuffer(Qe),D.deleteSync(Pt),oe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,U=null,k=0){const H=Math.pow(2,-k),O=Math.floor(y.image.width*H),oe=Math.floor(y.image.height*H),ge=U!==null?U.x:0,Te=U!==null?U.y:0;Ve.setTexture2D(y,0),D.copyTexSubImage2D(D.TEXTURE_2D,k,0,0,ge,Te,O,oe),_e.unbindTexture()};const Dt=D.createFramebuffer(),Qn=D.createFramebuffer();this.copyTextureToTexture=function(y,U,k=null,H=null,O=0,oe=null){oe===null&&(O!==0?(ar("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),oe=O,O=0):oe=0);let ge,Te,xe,Fe,Oe,De,Qe,mt,Pt;const At=y.isCompressedTexture?y.mipmaps[oe]:y.image;if(k!==null)ge=k.max.x-k.min.x,Te=k.max.y-k.min.y,xe=k.isBox3?k.max.z-k.min.z:1,Fe=k.min.x,Oe=k.min.y,De=k.isBox3?k.min.z:0;else{const _n=Math.pow(2,-O);ge=Math.floor(At.width*_n),Te=Math.floor(At.height*_n),y.isDataArrayTexture?xe=At.depth:y.isData3DTexture?xe=Math.floor(At.depth*_n):xe=1,Fe=0,Oe=0,De=0}H!==null?(Qe=H.x,mt=H.y,Pt=H.z):(Qe=0,mt=0,Pt=0);const xt=be.convert(U.format),Ne=be.convert(U.type);let wt;U.isData3DTexture?(Ve.setTexture3D(U,0),wt=D.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Ve.setTexture2DArray(U,0),wt=D.TEXTURE_2D_ARRAY):(Ve.setTexture2D(U,0),wt=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);const it=D.getParameter(D.UNPACK_ROW_LENGTH),hn=D.getParameter(D.UNPACK_IMAGE_HEIGHT),ss=D.getParameter(D.UNPACK_SKIP_PIXELS),dn=D.getParameter(D.UNPACK_SKIP_ROWS),Vs=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,At.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,At.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Fe),D.pixelStorei(D.UNPACK_SKIP_ROWS,Oe),D.pixelStorei(D.UNPACK_SKIP_IMAGES,De);const Ct=y.isDataArrayTexture||y.isData3DTexture,gn=U.isDataArrayTexture||U.isData3DTexture;if(y.isDepthTexture){const _n=Se.get(y),Qt=Se.get(U),nn=Se.get(_n.__renderTarget),No=Se.get(Qt.__renderTarget);_e.bindFramebuffer(D.READ_FRAMEBUFFER,nn.__webglFramebuffer),_e.bindFramebuffer(D.DRAW_FRAMEBUFFER,No.__webglFramebuffer);for(let ki=0;ki<xe;ki++)Ct&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Se.get(y).__webglTexture,O,De+ki),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Se.get(U).__webglTexture,oe,Pt+ki)),D.blitFramebuffer(Fe,Oe,ge,Te,Qe,mt,ge,Te,D.DEPTH_BUFFER_BIT,D.NEAREST);_e.bindFramebuffer(D.READ_FRAMEBUFFER,null),_e.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(O!==0||y.isRenderTargetTexture||Se.has(y)){const _n=Se.get(y),Qt=Se.get(U);_e.bindFramebuffer(D.READ_FRAMEBUFFER,Dt),_e.bindFramebuffer(D.DRAW_FRAMEBUFFER,Qn);for(let nn=0;nn<xe;nn++)Ct?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,_n.__webglTexture,O,De+nn):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,_n.__webglTexture,O),gn?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Qt.__webglTexture,oe,Pt+nn):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Qt.__webglTexture,oe),O!==0?D.blitFramebuffer(Fe,Oe,ge,Te,Qe,mt,ge,Te,D.COLOR_BUFFER_BIT,D.NEAREST):gn?D.copyTexSubImage3D(wt,oe,Qe,mt,Pt+nn,Fe,Oe,ge,Te):D.copyTexSubImage2D(wt,oe,Qe,mt,Fe,Oe,ge,Te);_e.bindFramebuffer(D.READ_FRAMEBUFFER,null),_e.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else gn?y.isDataTexture||y.isData3DTexture?D.texSubImage3D(wt,oe,Qe,mt,Pt,ge,Te,xe,xt,Ne,At.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(wt,oe,Qe,mt,Pt,ge,Te,xe,xt,At.data):D.texSubImage3D(wt,oe,Qe,mt,Pt,ge,Te,xe,xt,Ne,At):y.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,oe,Qe,mt,ge,Te,xt,Ne,At.data):y.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,oe,Qe,mt,At.width,At.height,xt,At.data):D.texSubImage2D(D.TEXTURE_2D,oe,Qe,mt,ge,Te,xt,Ne,At);D.pixelStorei(D.UNPACK_ROW_LENGTH,it),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,hn),D.pixelStorei(D.UNPACK_SKIP_PIXELS,ss),D.pixelStorei(D.UNPACK_SKIP_ROWS,dn),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Vs),oe===0&&U.generateMipmaps&&D.generateMipmap(wt),_e.unbindTexture()},this.initRenderTarget=function(y){Se.get(y).__webglFramebuffer===void 0&&Ve.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?Ve.setTextureCube(y,0):y.isData3DTexture?Ve.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?Ve.setTexture2DArray(y,0):Ve.setTexture2D(y,0),_e.unbindTexture()},this.resetState=function(){C=0,T=0,L=null,_e.reset(),he.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=st._getDrawingBufferColorSpace(e),t.unpackColorSpace=st._getUnpackColorSpace()}}const Ao=n=>n.kind==="onSegment"||n.kind==="inFace"||n.kind==="onArc",Wr=Math.PI/180,Li=1e-9,Pe=(n,e)=>{const t=n[e];if(!t)throw new Error(`约束里引用了不存在的点 ${e}`);return t},$r=(n,e)=>n.distanceTo(e),Si=n=>n.length()<Li?new R(Li,0,0):n.clone().normalize(),Es=(n,e,t)=>Math.min(t,Math.max(e,n));function Lc(n,e){const t={};let i=0;for(const s of n)switch(s.kind){case"free":t[s.name]=e[i++].clone();break;case"midpoint":t[s.name]=new R().addVectors(Pe(t,s.of[0]),Pe(t,s.of[1])).multiplyScalar(.5);break;case"ratio":t[s.name]=new R().lerpVectors(Pe(t,s.of[0]),Pe(t,s.of[1]),Es(s.t,0,1));break;case"offset":t[s.name]=new R().addVectors(Pe(t,s.of[0]),Pe(t,s.of[1])).sub(Pe(t,s.of[2]));break;case"perpFoot":{const r=Pe(t,s.of[0]),o=Pe(t,s.of[1]),a=Pe(t,s.of[2]),c=Pe(t,s.of[3]),l=new R().crossVectors(new R().subVectors(a,o),new R().subVectors(c,o));if(l.length()<Li){t[s.name]=r.clone();break}l.normalize(),t[s.name]=r.clone().addScaledVector(l,-new R().subVectors(r,o).dot(l));break}case"projLine":{const r=Pe(t,s.of[0]),o=Pe(t,s.of[1]),a=Pe(t,s.of[2]),c=new R().subVectors(a,o),l=c.lengthSq();if(l<Li){t[s.name]=o.clone();break}t[s.name]=o.clone().addScaledVector(c,new R().subVectors(r,o).dot(c)/l);break}case"onArc":{const r=Pe(t,s.of[0]),o=Pe(t,s.of[1]),a=Pe(t,s.from),c=new R().subVectors(o,r);if(c.length()<Li){t[s.name]=a.clone();break}c.normalize();const l=s.angle*Math.PI/180,u=new R().subVectors(a,r),h=Math.cos(l),f=Math.sin(l);t[s.name]=r.clone().addScaledVector(u,h).addScaledVector(new R().crossVectors(c,u),f).addScaledVector(c,c.dot(u)*(1-h));break}case"onSegment":{t[s.name]=new R().lerpVectors(Pe(t,s.of[0]),Pe(t,s.of[1]),Es(s.t,0,1));break}case"inFace":{const r=s.face.map(c=>Pe(t,c));if(r.length<3){t[s.name]=r[0]?.clone()??new R;break}const o=Es(s.u,0,1),a=Es(s.v,0,1);if(r.length===3){const c=Math.min(o,1-a);t[s.name]=r[0].clone().addScaledVector(new R().subVectors(r[1],r[0]),c).addScaledVector(new R().subVectors(r[2],r[0]),a)}else t[s.name]=new R().addScaledVector(r[0],(1-o)*(1-a)).addScaledVector(r[1],o*(1-a)).addScaledVector(r[2],o*a).addScaledVector(r[3],(1-o)*a);break}}return t}function Xr(n,e,t,i){const s=Lc(n,e),r=[],o=[],a=c=>{switch(c.kind){case"distance":return[[c.a,c.b]];case"equalDistance":return[c.ab,c.cd];case"angle":return[[c.from,c.at],[c.at,c.to]];case"lineAngle":case"perpendicular":case"parallel":return[c.p,c.q];case"perpLinePlane":return[c.line];case"coplanar":return[]}};for(const c of t){const l=a(c).find(([u,h])=>$r(Pe(s,u),Pe(s,h))<i*.001);if(l){const u=`线段 ${l[0]}${l[1]} 退化成一点（这条条件失去意义）`;r.push(1),o.push({desc:u,error:1,actual:"两点重合"});continue}switch(c.kind){case"distance":{const u=$r(Pe(s,c.a),Pe(s,c.b)),h=(u-c.value)/i;r.push(h),o.push({desc:`|${c.a}${c.b}| = ${c.value}`,error:Math.abs(h),actual:u.toFixed(4)});break}case"equalDistance":{const u=$r(Pe(s,c.ab[0]),Pe(s,c.ab[1])),h=$r(Pe(s,c.cd[0]),Pe(s,c.cd[1])),f=(u-h)/i;r.push(f),o.push({desc:`|${c.ab[0]}${c.ab[1]}| = |${c.cd[0]}${c.cd[1]}|`,error:Math.abs(f),actual:`${u.toFixed(4)} vs ${h.toFixed(4)}`});break}case"angle":{const u=new R().subVectors(Pe(s,c.from),Pe(s,c.at)),h=new R().subVectors(Pe(s,c.to),Pe(s,c.at)),f=Es(u.dot(h)/(Math.max(u.length(),Li)*Math.max(h.length(),Li)),-1+1e-9,1-1e-9),m=Math.acos(f)/Wr,g=(m-c.value)*Wr;r.push(g),o.push({desc:`∠${c.from}${c.at}${c.to} = ${c.value}°`,error:Math.abs(g),actual:`${m.toFixed(3)}°`});break}case"lineAngle":{const u=Si(new R().subVectors(Pe(s,c.p[1]),Pe(s,c.p[0]))),h=Si(new R().subVectors(Pe(s,c.q[1]),Pe(s,c.q[0]))),f=Es(Math.abs(u.dot(h)),1e-9,1),m=Math.acos(f)/Wr,g=(m-c.value)*Wr;r.push(g),o.push({desc:`${c.p.join("")} 与 ${c.q.join("")} 夹角 = ${c.value}°`,error:Math.abs(g),actual:`${m.toFixed(3)}°`});break}case"perpendicular":{const u=Si(new R().subVectors(Pe(s,c.p[1]),Pe(s,c.p[0]))),h=Si(new R().subVectors(Pe(s,c.q[1]),Pe(s,c.q[0]))),f=u.dot(h);r.push(f),o.push({desc:`${c.p.join("")} ⊥ ${c.q.join("")}`,error:Math.abs(f),actual:`cos = ${f.toFixed(4)}`});break}case"parallel":{const u=Si(new R().subVectors(Pe(s,c.p[1]),Pe(s,c.p[0]))),h=Si(new R().subVectors(Pe(s,c.q[1]),Pe(s,c.q[0]))),f=new R().crossVectors(u,h).length();r.push(f),o.push({desc:`${c.p.join("")} ∥ ${c.q.join("")}`,error:Math.abs(f),actual:`sin = ${f.toFixed(4)}`});break}case"perpLinePlane":{const u=Si(new R().subVectors(Pe(s,c.line[1]),Pe(s,c.line[0]))),h=Si(new R().crossVectors(new R().subVectors(Pe(s,c.plane[1]),Pe(s,c.plane[0])),new R().subVectors(Pe(s,c.plane[2]),Pe(s,c.plane[0])))),f=new R().crossVectors(u,h).length();r.push(f,0),o.push({desc:`${c.line.join("")} ⊥ 平面${c.plane.join("")}`,error:Math.abs(f),actual:`sin = ${f.toFixed(4)}`});break}case"coplanar":{const[u,h,f,m]=c.pts,g=new R().subVectors(Pe(s,h),Pe(s,u)),_=new R().subVectors(Pe(s,f),Pe(s,u)),p=new R().subVectors(Pe(s,m),Pe(s,u)),d=Math.max(g.length()*_.length()*p.length(),Li),x=Math.abs(g.dot(new R().crossVectors(_,p)))/d;r.push(x),o.push({desc:`${c.pts.join("")} 四点共面`,error:Math.abs(x),actual:`偏离 = ${x.toFixed(5)}`});break}default:{const u=c;throw new Error(`不认识的约束种类：${JSON.stringify(u)}`)}}}return{raw:r,info:o}}function J_(n,e){const t=e.length,i=n.map((s,r)=>[...s,e[r]]);for(let s=0;s<t;s++){let r=s;for(let a=s+1;a<t;a++)Math.abs(i[a][s])>Math.abs(i[r][s])&&(r=a);if(Math.abs(i[r][s])<1e-14)return null;[i[s],i[r]]=[i[r],i[s]];const o=i[s][s];for(let a=0;a<t;a++){if(a===s)continue;const c=i[a][s]/o;if(c!==0)for(let l=s;l<=t;l++)i[a][l]-=c*i[s][l]}}return i.map((s,r)=>s[t]/s[r])}function Q_(n,e){const t=[];for(const r of n){if(r.kind!=="free")continue;const o=e[r.name];if(!o)throw new Error(`求解结果里缺少自由点 ${r.name}`);t.push(new R(...o))}const i=Lc(n,t),s={};for(const[r,o]of Object.entries(i))s[r]=[o.x,o.y,o.z];return s}function Fi(n,e,t){const i=n.filter(p=>p.kind==="free"),s=i.length*3,r=e.reduce((p,d)=>d.kind==="distance"?p+d.value:p,0)/Math.max(1,e.filter(p=>p.kind==="distance").length)||1,o=[[0,0,0],[1,0,0],[0,1,0],[0,0,1]],a=[];i.forEach((p,d)=>{const x=o[d%o.length],E=p.at??[x[0]+Math.floor(d/o.length)*.37,x[1],x[2]];a.push(E[0],E[1],E[2])});const c=p=>{const d=[];for(let x=0;x<p.length;x+=3)d.push(new R(p[x],p[x+1],p[x+2]));return d},l=p=>{const{raw:d}=Xr(n,c(p),e,r);return d.reduce((x,E)=>x+E*E,0)};let u=.001,h=l(a);for(let p=0;p<300;p++){const{raw:d}=Xr(n,c(a),e,r),x=d.length;if(x===0||Math.max(...d.map(Math.abs))<1e-9)break;const M=Array.from({length:x},()=>new Array(s).fill(0));for(let S=0;S<s;S++){const N=[...a];N[S]+=1e-6;const{raw:z}=Xr(n,c(N),e,r);for(let W=0;W<x;W++)M[W][S]=(z[W]-d[W])/1e-6}const w=Array.from({length:s},()=>new Array(s).fill(0)),C=new Array(s).fill(0);for(let S=0;S<s;S++){for(let N=S;N<s;N++){let z=0;for(let W=0;W<x;W++)z+=M[W][S]*M[W][N];w[S][N]=z,w[N][S]=z}let P=0;for(let N=0;N<x;N++)P+=M[N][S]*d[N];C[S]=P}for(let S=0;S<s;S++)w[S][S]+=u*(1+w[S][S]);const T=J_(w,C.map(S=>-S));if(!T){if(u*=10,u>1e12)break;continue}const L=a.map((S,P)=>S+T[P]),b=l(L);if(Number.isFinite(b)&&b<h)a.splice(0,a.length,...L),h=b,u=Math.max(u/3,1e-12);else if(u*=5,u>1e12)break}const{info:f}=Xr(n,c(a),e,r),m=Lc(n,c(a)),g={};for(const[p,d]of Object.entries(m))g[p]=[d.x,d.y,d.z];const _=f.reduce((p,d)=>Math.max(p,d.error),0);return{ok:_<1e-4,points:g,residuals:f,maxError:_}}const e0=["sphere","ellipsoid","cylinder","cone","frustum"];function t0(n,e){const t=n.variants??[],i=e?t.filter(h=>h.q===e):[],s=e?new Set(t.filter(h=>h.q!==e).flatMap(h=>(h.points??[]).map(f=>f.name)).filter(h=>!n.points.some(f=>f.name===h))):new Set;if(!i.length&&!s.size)return n;const r=new Map;for(const h of i)for(const f of h.points??[])r.set(f.name,f);const o=n.points.filter(h=>!s.has(h.name)).map(h=>r.get(h.name)??h);for(const[h,f]of r)o.some(m=>m.name===h)||o.push(f);const a=new Set(n.edges.map(h=>[...h].sort().join("|"))),c=[...n.edges];for(const h of i)for(const f of h.edges??[]){const m=[...f].sort().join("|");a.has(m)||(a.add(m),c.push(f))}const l=new Set(n.faces.map(h=>[...h].sort().join("|"))),u=[...n.faces];for(const h of i)for(const f of h.faces??[]){const m=[...f].sort().join("|");l.has(m)||(l.add(m),u.push(f))}return{...n,points:o,edges:c,faces:u,constraints:[...n.constraints,...i.flatMap(h=>h.constraints??[])]}}const n0=["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"];function bt(n){const e=/^([A-Za-z]+?)_?(\d+)$/.exec(n.trim());return e?e[1]+[...e[2]].map(t=>n0[+t]).join(""):n.trim()}const Zl=["free","midpoint","ratio","offset","perpFoot","projLine","onSegment","inFace","onArc"],Jl=["distance","equalDistance","angle","lineAngle","perpendicular","parallel","perpLinePlane","coplanar"];class ke extends Error{}const Xi=n=>typeof n=="object"&&n!==null&&!Array.isArray(n),Ot=(n,e)=>{if(typeof n!="string"||!n.trim())throw new ke(`${e} 应该是一个字符串`);return n.trim()},Nn=(n,e)=>{const t=typeof n=="string"?Number(n):n;if(typeof t!="number"||!Number.isFinite(t))throw new ke(`${e} 应该是一个数字`);return t},lt=(n,e)=>{if(!Array.isArray(n))throw new ke(`${e} 应该是一个数组`);return n};function Ic(n){if(!Xi(n))throw new ke("场景不是一个对象");const e=lt(n.points,"points");if(e.length<3)throw new ke("点太少，构不成一个立体图形");const t=[],i=new Set;for(const g of e){if(!Xi(g))throw new ke("points 里有一项不是对象");const _=bt(Ot(g.name,"点的 name"));if(i.has(_))throw new ke(`点 ${_} 重复定义了`);i.add(_);const p=Ot(g.kind,`点 ${_} 的 kind`);if(!Zl.includes(p))throw new ke(`点 ${_} 的类型「${p}」我还不会处理`);if(p==="free"){const d=g.at===void 0?void 0:lt(g.at,`点 ${_} 的 at`).map(x=>Nn(x,"坐标"));if(d&&d.length!==3)throw new ke(`点 ${_} 的坐标应该是三个数`);t.push({name:_,kind:"free",at:d})}else if(p==="midpoint"||p==="ratio"||p==="onSegment"){const d=lt(g.of,`点 ${_} 的 of`).map(x=>bt(Ot(x,"点名称")));if(d.length!==2)throw new ke(`点 ${_} 的 of 应该是两个点`);for(const x of d)if(!i.has(x))throw new ke(`点 ${_} 引用了还没定义的 ${x}`);p==="midpoint"?t.push({name:_,kind:"midpoint",of:d}):p==="onSegment"?t.push({name:_,kind:"onSegment",of:d,t:Nn(g.t??.5,`点 ${_} 的 t`)}):t.push({name:_,kind:"ratio",of:d,t:Nn(g.t??.5,`点 ${_} 的 t`)})}else if(p==="inFace"){const d=lt(g.face,`点 ${_} 的 face`).map(x=>bt(Ot(x,"点名称")));if(d.length<3||d.length>4)throw new ke(`点 ${_} 所在的面需要三到四个顶点`);for(const x of d)if(!i.has(x))throw new ke(`点 ${_} 引用的面里有还没定义的点 ${x}`);t.push({name:_,kind:"inFace",face:d,u:Nn(g.u??.5,`点 ${_} 的 u`),v:Nn(g.v??.5,`点 ${_} 的 v`)})}else if(p==="onArc"){const d=lt(g.of,`点 ${_} 的 of`).map(E=>bt(Ot(E,"点名称")));if(d.length!==2)throw new ke(`点 ${_} 的 of 应该是旋转轴的两个端点`);for(const E of d)if(!i.has(E))throw new ke(`点 ${_} 引用了还没定义的 ${E}`);const x=bt(Ot(g.from,`点 ${_} 的 from`));if(!i.has(x))throw new ke(`点 ${_} 引用了还没定义的 ${x}`);t.push({name:_,kind:"onArc",of:d,from:x,angle:Nn(g.angle??0,`点 ${_} 的 angle`)})}else if(p==="perpFoot"||p==="projLine"){const d=p==="perpFoot"?4:3,x=lt(g.of,`点 ${_} 的 of`).map(E=>bt(Ot(E,"点名称")));if(x.length!==d)throw new ke(`点 ${_} 的 of 应该有 ${d} 个点`);for(const E of x)if(!i.has(E))throw new ke(`点 ${_} 引用了还没定义的 ${E}`);p==="perpFoot"?t.push({name:_,kind:"perpFoot",of:x}):t.push({name:_,kind:"projLine",of:x})}else{const d=lt(g.of,`点 ${_} 的 of`).map(x=>bt(Ot(x,"点名称")));if(d.length!==3)throw new ke(`点 ${_} 的平移派生需要三个点`);for(const x of d)if(!i.has(x))throw new ke(`点 ${_} 引用了还没定义的 ${x}`);t.push({name:_,kind:"offset",of:d})}}const s=(g,_)=>{const p=bt(Ot(g,_));if(!i.has(p))throw new ke(`${_} 引用了不存在的点 ${p}`);return p},r=lt(n.edges??[],"edges").map((g,_)=>{const p=lt(g,`第 ${_+1} 条棱`).map(d=>s(d,`第 ${_+1} 条棱`));if(p.length!==2||p[0]===p[1])throw new ke(`第 ${_+1} 条棱的端点不对`);return p}),o=lt(n.faces??[],"faces").map((g,_)=>{const p=lt(g,`第 ${_+1} 个面`).map(d=>s(d,`第 ${_+1} 个面`));if(p.length<3)throw new ke(`第 ${_+1} 个面少于三个顶点`);return p}),a=lt(n.constraints,"constraints").map((g,_)=>{if(!Xi(g))throw new ke(`第 ${_+1} 条约束不是对象`);const p=Ot(g.kind,`第 ${_+1} 条约束的 kind`);if(!Jl.includes(p))throw new ke(`这道题用到了我还不会处理的条件「${p}」`);switch(p){case"distance":return{kind:p,a:s(g.a,"distance"),b:s(g.b,"distance"),value:Nn(g.value,"distance 的 value")};case"equalDistance":{const d=lt(g.ab,"equalDistance.ab").map(E=>s(E,"equalDistance")),x=lt(g.cd,"equalDistance.cd").map(E=>s(E,"equalDistance"));if(d.length!==2||x.length!==2)throw new ke("equalDistance 需要两对点");return{kind:p,ab:d,cd:x}}case"angle":return{kind:p,at:s(g.at,"angle"),from:s(g.from,"angle"),to:s(g.to,"angle"),value:Nn(g.value,"angle 的 value")};case"lineAngle":{const d=lt(g.p,"lineAngle.p").map(E=>s(E,"lineAngle")),x=lt(g.q,"lineAngle.q").map(E=>s(E,"lineAngle"));if(d.length!==2||x.length!==2)throw new ke("lineAngle 需要两条直线");return{kind:p,p:d,q:x,value:Nn(g.value,"lineAngle 的 value")}}case"perpendicular":case"parallel":{const d=lt(g.p,`${p}.p`).map(E=>s(E,p)),x=lt(g.q,`${p}.q`).map(E=>s(E,p));if(d.length!==2||x.length!==2)throw new ke(`${p} 需要两条直线`);return{kind:p,p:d,q:x}}case"perpLinePlane":{const d=lt(g.line,"perpLinePlane.line").map(E=>s(E,"perpLinePlane")),x=lt(g.plane,"perpLinePlane.plane").map(E=>s(E,"perpLinePlane"));if(d.length!==2||x.length!==3)throw new ke("perpLinePlane 需要一条直线与三个平面点");return{kind:p,line:d,plane:x}}case"coplanar":{const d=lt(g.pts,"coplanar.pts").map(x=>s(x,"coplanar"));if(d.length!==4)throw new ke("coplanar 需要四个点");return{kind:p,pts:d}}}throw new ke(`第 ${_+1} 条约束没法处理`)});if(a.length===0)throw new ke("一条约束都没有，图形没法确定");const c=n.variants===void 0?[]:lt(n.variants,"variants"),l=[];for(const[g,_]of c.entries()){if(!Xi(_))throw new ke(`第 ${g+1} 个 variants 不是对象`);const p=String(_.q??"").trim();if(!p)throw new ke(`第 ${g+1} 个 variants 没写属于哪一问（q）`);const d=[];if(_.points!==void 0)for(const w of lt(_.points,`第 ${g+1} 个 variants 的 points`)){if(!Xi(w))throw new ke(`第 ${g+1} 个 variants 的点不是对象`);const C=bt(Ot(w.name,"variants 里的点 name")),T=Ot(w.kind,"variants 里的点 kind");if(!Zl.includes(T))throw new ke(`第 ${g+1} 个 variants 里的点 ${C} 种类不认识：${T}`);const L=S=>bt(Ot(S,"variants 里的点名称")),b={...w,name:C,kind:T};for(const S of["of","face"])Array.isArray(b[S])&&(b[S]=b[S].map(L));typeof b.from=="string"&&(b.from=L(b.from)),d.push(b)}const x=_.constraints===void 0?[]:lt(_.constraints,`第 ${g+1} 个 variants 的 constraints`);for(const w of x){if(!Xi(w))throw new ke(`第 ${g+1} 个 variants 的约束不是对象`);const C=Ot(w.kind,"variants 里的约束 kind");if(!Jl.includes(C))throw new ke(`第 ${g+1} 个 variants 里有个不认识的约束：${C}`)}const E=_.edges===void 0?[]:lt(_.edges,`第 ${g+1} 个 variants 的 edges`),M=_.faces===void 0?[]:lt(_.faces,`第 ${g+1} 个 variants 的 faces`);l.push({q:p,points:d,constraints:x,edges:E.map(w=>{const C=lt(w,"variants 的棱").map(T=>bt(Ot(T,"棱的端点")));if(C.length!==2)throw new ke("variants 的棱必须是两个点");return C}),faces:M.map(w=>lt(w,"variants 的面").map(C=>bt(Ot(C,"面的顶点"))))})}const u=[];for(const[g,_]of(n.solids===void 0?[]:lt(n.solids,"solids")).entries()){if(!Xi(_))throw new ke(`第 ${g+1} 个 solids 不是对象`);const p=Ot(_.kind,`第 ${g+1} 个 solids 的 kind`),d=(E,M)=>{const w=bt(Ot(E,M));if(!i.has(w))throw new ke(`${M} 引用了还没定义的点 ${w}`);return w},x=(E,M)=>{const w=Nn(E,M);if(!(w>0))throw new ke(`${M} 必须是正数`);return w};if(p==="sphere")u.push({kind:p,center:d(_.center,`第 ${g+1} 个球的球心`),through:d(_.through,`第 ${g+1} 个球面上的点`)});else if(p==="ellipsoid")u.push({kind:p,center:d(_.center,`第 ${g+1} 个椭球的中心`),a:d(_.a,"椭球 a 半轴端点"),b:d(_.b,"椭球 b 半轴端点"),c:d(_.c,"椭球 c 半轴端点")});else if(p==="cylinder")u.push({kind:p,a:d(_.a,"圆柱轴的一个端点"),b:d(_.b,"圆柱轴的另一个端点"),radius:x(_.radius,"圆柱半径")});else if(p==="cone")u.push({kind:p,apex:d(_.apex,"圆锥顶点"),center:d(_.center,"圆锥底面圆心"),rim:d(_.rim,"圆锥底面圆上一点")});else if(p==="frustum")u.push({kind:p,a:d(_.a,"圆台轴的一个端点"),b:d(_.b,"圆台轴的另一个端点"),radiusA:x(_.radiusA,"圆台一端的半径"),radiusB:x(_.radiusB,"圆台另一端的半径")});else throw new ke(`不认识的立体种类 ${p}（只支持 ${e0.join("、")}）`)}const h=n.hiddenPoints===void 0?[]:lt(n.hiddenPoints,"hiddenPoints").map(g=>bt(Ot(g,"hiddenPoints 里的点")));for(const g of h)if(!i.has(g))throw new ke(`hiddenPoints 里的 ${g} 在图上的点里找不到`);const f=h.length?{hiddenPoints:h}:{},m=u.length?{points:t,edges:r,faces:o,constraints:a,solids:u,...f}:{points:t,edges:r,faces:o,constraints:a,...f};return l.length?{...m,variants:l}:m}const Kn=(n,e)=>`${n}|${e}`;function i0(n,e,t){const i=[];if(!(t>1e-6))return i;const s=(o,a,c)=>{const[l,u]=o===0?[0,1]:o===1?[1,2]:[2,0],h=e[l],f=e[u];return[n[0]+h[0]*a+f[0]*c,n[1]+h[1]*a+f[1]*c,n[2]+h[2]*a+f[2]*c]},r=Math.max(0,Math.floor(t));for(let o=0;o<3;o++){for(let a=0;a<=r;a++)i.push([s(o,a,0),s(o,a,t)]),i.push([s(o,0,a),s(o,t,a)]);t-r>1e-6&&(i.push([s(o,t,0),s(o,t,t)]),i.push([s(o,0,t),s(o,t,t)]))}return i}const Ql=[5213439,16752451,3066993,15158332,10181046,15844367,1752220,16743096],cr=n=>n.join("");function gr(n,e,t){const i=a=>{const c=e[a];if(!c)throw new ke(`求解结果里缺少点 ${a}`);return c},s=new Set((t??n).points.map(a=>a.name)),r=new Set((t??n).edges.map(([a,c])=>Kn(a,c))),o=new Set((t??n).hiddenPoints??n.hiddenPoints??[]);return{vertices:n.points.map(a=>({name:a.name,at:i(a.name),aux:t?!s.has(a.name):!1,moving:Ao(a),hidden:o.has(a.name)})),edges:n.edges.map(([a,c])=>({key:Kn(a,c),a:i(a),b:i(c),aux:t?!r.has(Kn(a,c)):!1})),faces:n.faces.map((a,c)=>({key:cr(a),pts:a.map(i),names:[...a],color:Ql[c%Ql.length]})),solids:(n.solids??[]).map(a=>{const c=(l,u)=>Math.hypot(l[0]-u[0],l[1]-u[1],l[2]-u[2]);if(a.kind==="sphere")return{kind:"sphere",center:i(a.center),radius:c(i(a.center),i(a.through))};if(a.kind==="ellipsoid"){const l=i(a.center);return{kind:"ellipsoid",center:l,ra:Math.max(1e-6,c(l,i(a.a))),rb:Math.max(1e-6,c(l,i(a.b))),rc:Math.max(1e-6,c(l,i(a.c))),ax:i(a.a),ay:i(a.b),az:i(a.c)}}return a.kind==="cylinder"?{kind:"cylinder",a:i(a.a),b:i(a.b),radius:a.radius}:a.kind==="cone"?{kind:"cone",apex:i(a.apex),center:i(a.center),radius:c(i(a.center),i(a.rim))}:{kind:"frustum",a:i(a.a),b:i(a.b),radiusA:a.radiusA,radiusB:a.radiusB}})}}function s0(n,e=.001){const t=[];for(const i of n.faces){if(i.pts.length<3)continue;const s=i.pts.map(o=>new R(...o)),r=new R().subVectors(s[1],s[0]).cross(new R().subVectors(s[2],s[0]));if(r.length()<1e-9){t.push("有个面的前三个点共线，构不成平面");continue}r.normalize();for(let o=3;o<s.length;o++){const a=Math.abs(new R().subVectors(s[o],s[0]).dot(r));a>e&&t.push(`有个面的第 ${o+1} 个顶点偏离该平面 ${a.toFixed(4)}，说明这个面是扭的`)}}return t}function r0(n,e=()=>!1){return{points:n.points.map(t=>({key:bt(t.name),label:bt(t.name),moving:Ao(t)})),edges:n.edges.map(([t,i])=>{const s=bt(t),r=bt(i);return{key:Kn(s,r),label:s+r}}),faces:n.faces.map(t=>{const i=t.map(bt),s=cr(i);return{key:s,label:i.join(""),hidden:e(s)}})}}const Cs=(n,e)=>[n[0]-e[0],n[1]-e[1],n[2]-e[2]],mc=(n,e)=>n[0]*e[0]+n[1]*e[1]+n[2]*e[2],ju=(n,e)=>[n[1]*e[2]-n[2]*e[1],n[2]*e[0]-n[0]*e[2],n[0]*e[1]-n[1]*e[0]],Ku=n=>Math.hypot(n[0],n[1],n[2]),er=n=>{const e=Ku(n);return e<1e-12?null:[n[0]/e,n[1]/e,n[2]/e]},o0=(n,e,t)=>Math.min(t,Math.max(e,n));function lo(n,e,t){return er(ju(Cs(e,n),Cs(t,n)))}function a0(n){if(n.length<3)return null;const e=[0,0,0];for(let t=0;t<n.length;t++){const i=n[t],s=n[(t+1)%n.length];e[0]+=(i[1]-s[1])*(i[2]+s[2]),e[1]+=(i[2]-s[2])*(i[0]+s[0]),e[2]+=(i[0]-s[0])*(i[1]+s[1])}return er(e)}function c0(n,e,t,i){const s=lo(e,t,i);if(!s)return null;const r=mc(Cs(n,e),s);return[n[0]-r*s[0],n[1]-r*s[1],n[2]-r*s[2]]}function l0(n,e,t,i,s=24){const r=er(Cs(e,n)),o=er(Cs(t,n));if(!r||!o)return[];if(Ku(Cs(r,o))<1e-9)return[[n[0]+i*r[0],n[1]+i*r[1],n[2]+i*r[2]]];const a=er(ju(r,o));if(!a)return[];const c=Math.acos(o0(mc(r,o),-1,1)),l=[];for(let u=0;u<=s;u++){const h=u/s*c,f=Math.cos(h),m=Math.sin(h),g=mc(a,r)*(1-f);l.push([n[0]+i*(r[0]*f+(a[1]*r[2]-a[2]*r[1])*m+a[0]*g),n[1]+i*(r[1]*f+(a[2]*r[0]-a[0]*r[2])*m+a[1]*g),n[2]+i*(r[2]*f+(a[0]*r[1]-a[1]*r[0])*m+a[2]*g)])}return l}class ai extends Error{}function u0(n){let e=n.trim();return e=e.replace(/\$\$?/g,""),e=e.replace(/\\[()]/g,""),e=e.replace(/\\sqrt\s*\{([^{}]*)\}/g,"√($1)"),e=e.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,"($1)/($2)"),e=e.replace(/\\cdot|\\times/g,"*"),e=e.replace(/[{}[\]]/g,t=>t==="{"||t==="["?"(":")"),e=e.replace(/[×⋅·✕⨯]/g,"*"),e=e.replace(/[−–—]/g,"-"),e=e.replace(/[（]/g,"(").replace(/[）]/g,")"),e=e.replace(/[°º˚]/g,""),e=e.replace(/\s+/g,""),e}function h0(n){const e=[];let t=0;for(;t<n.length;){const i=n[t];if(/[0-9.]/.test(i)){let s=t;for(;s<n.length&&/[0-9.]/.test(n[s]);)s++;const r=n.slice(t,s),o=Number(r);if(!Number.isFinite(o))throw new ai(`看不懂这个数「${r}」`);e.push({k:"num",v:o}),t=s;continue}if("+-*/^()".includes(i)||i==="√"){e.push({k:"op",v:i}),t++;continue}if(i==="π"){e.push({k:"num",v:Math.PI}),t++;continue}throw new ai(`不认识的符号「${i}」`)}return e}function Uc(n){const e=u0(n);if(!e)throw new ai("表达式是空的");const t=h0(e);let i=0;const s=()=>t[i],r=f=>{const m=t[i];return m&&m.k==="op"&&m.v===f?(i++,!0):!1};function o(){let f=a();for(;;)if(r("+"))f+=a();else if(r("-"))f-=a();else return f}function a(){let f=c();for(;;)if(r("*"))f*=c();else if(r("/")){const m=c();if(m===0)throw new ai("除数为零");f/=m}else{const m=s();if(m&&(m.k==="num"||m.k==="op"&&(m.v==="√"||m.v==="(")))f*=c();else return f}}function c(){return r("-")?-c():r("+")?c():l()}function l(){const f=u();return r("^")?Math.pow(f,c()):f}function u(){const f=s();if(!f)throw new ai("表达式不完整");if(f.k==="num")return i++,f.v;if(f.k==="op"&&f.v==="√"){i++;const m=u();if(m<0)throw new ai("根号里是负数");return Math.sqrt(m)}if(f.k==="op"&&f.v==="("){i++;const m=o();if(!r(")"))throw new ai("括号没配对");return m}throw new ai(`这里不该出现「${f.v}」`)}const h=o();if(i!==t.length)throw new ai("表达式后面还有多余的东西");return h}function d0(n,e,t=1e-6){let i;try{i=Uc(n)}catch(r){return{ok:!1,reason:r instanceof Error?r.message:String(r)}}if(!Number.isFinite(i))return{ok:!1,reason:"算出来不是一个有限的数"};const s=Math.max(1,Math.abs(e));return Math.abs(i-e)<=t*s?{ok:!0,value:i}:{ok:!1,value:i,reason:`符号式算出来是 ${i.toFixed(8)}，本地算出来是 ${e.toFixed(8)}，对不上`}}const kt=(n,e)=>[n[0]-e[0],n[1]-e[1],n[2]-e[2]],mn=(n,e)=>[n[0]+e[0],n[1]+e[1],n[2]+e[2]],Sn=(n,e)=>[n[0]*e,n[1]*e,n[2]*e],qi=(n,e)=>n[0]*e[0]+n[1]*e[1]+n[2]*e[2],ys=n=>Math.hypot(n[0],n[1],n[2]),on=n=>{const e=ys(n);return e<1e-12?null:[n[0]/e,n[1]/e,n[2]/e]},pa=(n,e,t)=>Math.min(t,Math.max(e,n)),ma=180/Math.PI;function f0(n){const e=n*Math.PI/180;for(const t of[1,2,3,4,5,6,7,8,9,10,12,15,16]){const i=e/Math.PI*t,s=Math.round(i);if(s>0&&Math.abs(i-s)<1e-9)return t===1?s===1?"π":`${s}π`:`${s===1?"":s}π/${t}`}return e.toFixed(3)}function p0(n,e){return e==="radians"?f0(n):Math.abs(n-Math.round(n))<.005?`${Math.round(n)}°`:`${n.toFixed(2)}°`}function ga(n,e,t="degrees"){const i=n.label?.trim()??"";if(uo(e)){const a=eu(n,e);return a.verified===!1?{text:"",...a}:{text:""}}const s=p0(e,t),r=i?`${i} = ${s}`:s;if(!n.value)return{text:r};const o=eu(n,e);if(o.verified){const a=(n.of??"degrees")==="degrees";return t==="radians"&&a?{text:r}:{text:i?`${i} = ${n.value}`:n.value??"",verified:!0}}if((n.of??"degrees")==="degrees"&&o.verified===!1){let a=!1;try{a=Math.abs(Uc(n.value)-e)<=.06}catch{a=!1}if(a&&t==="degrees")return{text:i?`${i} = ${n.value}`:n.value??"",verified:!0}}return{text:r,verified:!1,mismatch:o.mismatch}}function eu(n,e){if(!n.value)return{};const t=n.of??"degrees",i=t==="cos"?Math.cos(e*Math.PI/180):t==="sin"?Math.sin(e*Math.PI/180):e,s=t==="degrees"?.06:5e-4;let r;try{r=Uc(n.value)}catch(o){return{verified:!1,mismatch:`看不出「${n.value}」是什么：${o instanceof Error?o.message:o}`}}return Math.abs(r-i)<=s?{verified:!0}:{verified:!1,mismatch:`模型写 ${n.value}，本地按${t==="cos"?"余弦":t==="sin"?"正弦":"度数"}算是 ${i.toFixed(4)}`}}function tu(n,e,t,i="degrees"){const s=p=>e(p)??null,r=(p,d,x)=>{const E=on(mn(d,x));return E?mn(p,Sn(E,t*1.45)):mn(p,Sn(d,t*1.45))};if(n.kind==="lineLine"){const[p,d]=n.p,[x,E]=n.q,M=s(p),w=s(d),C=s(x),T=s(E);if(!M||!w||!C||!T)return null;const L=[p,d].find($=>$===x||$===E);let b,S,P;const N=[];if(L){b=[M,w,C,T][[p,d].indexOf(L)];const $=L===p?w:M,Y=L===x?T:C;S=on(kt($,b)),P=on(kt(Y,b))}else b=M,S=on(kt(w,M)),P=on(kt(T,C)),P&&N.push([b,mn(b,Sn(P,ys(kt(T,C))))]);if(!S||!P)return null;const z=Math.acos(pa(Math.abs(qi(S,P)),0,1))*ma,W=ga(n,z,i);return{vertex:b,dirFrom:S,dirTo:P,extraEdges:N,labelAt:r(b,S,P),text:W.text,verified:W.verified,mismatch:W.mismatch,degrees:z}}if(n.kind==="linePlane"){const[p,d]=n.line,x=s(p),E=s(d),M=s(n.plane[0]),w=s(n.plane[1]),C=s(n.plane[2]);if(!x||!E||!M||!w||!C)return null;const T=lo(M,w,C);if(!T)return null;const L=kt(E,x),b=qi(L,T);if(Math.abs(b)<1e-12)return null;const S=qi(kt(M,x),T)/b,P=mn(x,Sn(L,S)),N=ys(kt(x,P))>ys(kt(E,P))?x:E,z=on(kt(N,P));if(!z)return null;const W=c0(N,M,w,C);if(!W)return null;const $=[];let Y=null;if(ys(kt(W,P))<1e-9){const ae=on(kt(w,P))??on(kt(C,P));if(!ae)return null;const me=qi(ae,T);Y=on([ae[0]-me*T[0],ae[1]-me*T[1],ae[2]-me*T[2]])}else Y=on(kt(W,P)),$.push([P,W]);if(!Y)return null;const Q=Math.asin(pa(Math.abs(qi(z,T)),0,1))*ma,X=ga(n,Q,i);return{vertex:P,dirFrom:z,dirTo:Y,extraEdges:$,labelAt:r(P,z,Y),text:X.text,verified:X.verified,mismatch:X.mismatch,degrees:Q}}const o=s(n.edge[0]),a=s(n.edge[1]),c=s(n.inA),l=s(n.inB);if(!o||!a||!c||!l)return null;const u=on(kt(a,o));if(!u)return null;const h=p=>{const d=kt(p,o),x=qi(d,u);return on([d[0]-x*u[0],d[1]-x*u[1],d[2]-x*u[2]])},f=h(c),m=h(l);if(!f||!m)return null;const g=Math.acos(pa(qi(f,m),-1,1))*ma,_=ga(n,g,i);return{vertex:o,dirFrom:f,dirTo:m,extraEdges:[[o,mn(o,Sn(f,t))],[o,mn(o,Sn(m,t))]],labelAt:r(o,f,m),text:_.text,verified:_.verified,mismatch:_.mismatch,degrees:g}}const m0=.5;function uo(n){return Math.abs(n-90)<=m0}function nu(n,e){const t=mn(n.vertex,Sn(n.dirFrom,e)),i=mn(n.vertex,Sn(n.dirTo,e));return uo(n.degrees)?{arc:[t,mn(t,Sn(n.dirTo,e)),i],extras:n.extraEdges,labelAt:n.labelAt,text:n.text}:{arc:l0(n.vertex,t,i,e),extras:n.extraEdges,labelAt:n.labelAt,text:n.text}}function g0(n,e){const t=[],i=new Map;for(const[o,a]of n)i.has(o)||i.set(o,new Set),i.has(a)||i.set(a,new Set),i.get(o)?.add(a),i.get(a)?.add(o);const s=new Set;for(const[o,a]of i){const c=[...a].sort();for(let l=0;l<c.length;l++)for(let u=l+1;u<c.length;u++){const h=[o,c[l],c[u]].sort().join("|");s.has(h)||(s.add(h),t.push({kind:"lineLine",p:[o,c[l]],q:[o,c[u]]}))}}const r=new Map;for(const o of e)for(let a=0;a<o.length;a++){const c=o[a],l=o[(a+1)%o.length],u=[c,l].sort().join("|");r.has(u)||r.set(u,[]),r.get(u)?.push(o)}for(const[o,a]of r){if(a.length!==2)continue;const[c,l]=o.split("|"),[u,h]=a,f=u.find(g=>g!==c&&g!==l),m=h.find(g=>g!==c&&g!==l);f&&m&&t.push({kind:"dihedral",edge:[c,l],inA:f,inB:m})}for(const[o,a]of n)for(const c of e){const l=new Set(c),u=l.has(o),h=l.has(a);if(u&&h||!u&&!h)continue;const f=u?o:a,m=u?a:o;if(c.filter(p=>p!==f).length<2)continue;const _=c.length>=3?[c[0],c[1],c[2]]:[c[0],c[1]??c[0],c[0]];t.push({kind:"linePlane",line:[f,m],plane:_})}for(const o of t)if(o.kind==="lineLine"){const[a,c]=o.p;o.label=`∠${c}${a}${o.q[1]}`}else o.kind==="dihedral"?o.label=`二面角 ${o.inA}-${o.edge[0]}${o.edge[1]}-${o.inB}`:o.label=`∠(${o.line[0]}${o.line[1]}, 平面${o.plane.join("")})`;return t}function _0(n,e,t){const i=e(n.p[0]),s=e(n.p[1]);if(!i||!s)return null;const r=ys(kt(s,i));if(r<1e-9)return null;const o=n.label?.trim()||`${n.p[0]}${n.p[1]}`,a=r.toFixed(3).replace(/\.?0+$/,"");let c=`${o} = ${a}`,l,u;if(n.value){const g=d0(n.value,r);g.ok?(c=`${o} = ${n.value}`,l=!0):(l=!1,u=g.reason)}const h=Sn(mn(i,s),.5),f=on(kt(h,ho))??[0,0,0],m=mn(h,Sn(f,t));return{shape:{arc:[],extras:[],labelAt:m,text:c},verified:l,mismatch:u,value:r}}let ho=[0,0,0];function v0(n){if(!n.length){ho=[0,0,0];return}let e=0,t=0,i=0;for(const s of n)e+=s[0],t+=s[1],i+=s[2];ho=[e/n.length,t/n.length,i/n.length]}function x0(n,e,t){if(n.kind!=="midpoint"&&n.kind!=="ratio")return null;const i=n.of;if(!i||i.length!==2)return null;const[s,r]=i,o=e(n.name);if(!o||!e(s)||!e(r))return null;const a=bt(n.name),c=bt(s),l=bt(r),u=n.kind==="midpoint"?`${c}${a} = ${a}${l}`:`${c}${a} : ${a}${l} = ${M0(n.t??.5)}`,h=on(kt(o,ho))??[0,0,0];return{arc:[],extras:[],labelAt:mn(o,Sn(h,t)),text:u}}function M0(n){for(let e=2;e<=12;e++){const t=n*e;if(Math.abs(t-Math.round(t))<1e-6&&Math.round(t)>0){const i=e-Math.round(t);if(i<=0)break;return`${Math.round(t)} : ${i}`}}return`${n.toFixed(2)} : ${(1-n).toFixed(2)}`}function Zu(n,e){const t=e.replace(/\s/g,"");if(n.kind==="lineLine"){const[o,a]=n.p,c=n.q[1];return t.includes(`∠${a}${o}${c}`)||t.includes(`∠${c}${o}${a}`)}if(n.kind==="dihedral"){const[o,a]=n.edge;return[`${n.inA}-${o}${a}-${n.inB}`,`${n.inA}-${a}${o}-${n.inB}`,`${n.inB}-${o}${a}-${n.inA}`,`${n.inB}-${a}${o}-${n.inA}`].some(l=>t.includes(l))}const i=n.line.join(""),s=[...n.line].reverse().join("");return new RegExp(`(${i}|${s})\\s*(与|和)?\\s*[^，。；]{0,8}(所成角|成角|夹角)`).test(t)&&/平面|底面/.test(t)}function S0(n,e,t){let i=Zu(n,t)?40:0;return uo(e)&&(i+=30),[30,45,60,120,135,150].some(r=>Math.abs(e-r)<.01)&&(i+=22),!uo(e)&&Math.abs(e-Math.round(e))<.005&&(i+=10),i}function E0(n,e){const t=o=>`${o.kind}|${o.degrees.toFixed(1)}`,i=new Set,s=new Set;let r=Math.max(0,e);return n.forEach((o,a)=>{!o.named||r<=0||s.has(t(o))||(s.add(t(o)),i.add(a),r--)}),n.forEach((o,a)=>{i.has(a)||r<=0||s.has(t(o))||o.score<=0||(s.add(t(o)),i.add(a),r--)}),i}function Ju(n){if(!n.length)return .5;let e=1/0,t=-1/0;for(const i of n)e=Math.min(e,i[0],i[1],i[2]),t=Math.max(t,i[0],i[1],i[2]);return Math.max(.15,(t-e)*.12)}function y0(n,e,t){const i=[];for(const s of n){if(!s.text.trim()||s.box.width<=0||s.box.height<=0)continue;const r=s.box.left+s.box.width/2-e.left,o=s.box.top+s.box.height/2-e.top;r<0||o<0||r>e.width||o>e.height||i.push({text:s.text.trim(),x:r*t,y:o*t,size:s.size*t,color:s.color,bold:!!s.bold})}return i}function b0(n,e,t=1600){if(n<=0||e<=0)return{w:1,h:1};const i=Math.min(1,t/Math.max(n,e));return{w:Math.max(1,Math.round(n*i)),h:Math.max(1,Math.round(e*i))}}function A0(n){const e=[["video/mp4;codecs=avc1","mp4"],["video/mp4","mp4"],["video/webm;codecs=vp9","webm"],["video/webm;codecs=vp8","webm"],["video/webm","webm"]];for(const[t,i]of e)if(n(t))return{mime:t,ext:i};return null}const Qu="geo3d",eh=1;function T0(n){const e=n.problemText.replace(/[\\/:*?"<>|\n\r\t]/g," ").trim().slice(0,20).trim(),t=new Date(n.savedAt||Date.now()),i=r=>String(r).padStart(2,"0");return`Geo3D_${`${t.getFullYear()}${i(t.getMonth()+1)}${i(t.getDate())}`}_${e||"题目"}.g3d`}function w0(n,e){const{id:t,...i}=n,s={magic:Qu,version:eh,exportedAt:Date.now(),appVersion:e,record:{...i,id:""}};return JSON.stringify(s,null,1)}class Fn extends Error{}function C0(n){let e;try{e=JSON.parse(n)}catch{throw new Fn("这个文件不是 Geo3D 题目文件（读不出内容）")}if(typeof e!="object"||e===null)throw new Fn("这个文件不是 Geo3D 题目文件");const t=e;if(t.magic!==Qu)throw new Fn("这个文件不是 Geo3D 题目文件（没有标记）");if(typeof t.version!="number")throw new Fn("文件缺少版本号");if(t.version>eh)throw new Fn(`这个文件是更新版本的 Geo3D 导出的（v${t.version}），当前版本读不了`);const i=t.record;if(typeof i!="object"||i===null)throw new Fn("文件里没有题目内容");if(typeof i.problemText!="string"||!i.problemText.trim())throw new Fn("文件里没有题面文字");let s=i.scene;if(s!==void 0)try{s=Ic(s)}catch(o){throw new Fn(`文件里的图形读不出来：${o instanceof Error?o.message:String(o)}`)}let r=i.solution;if(r!==void 0){if(!s)throw new Fn("文件里有解题过程却没有图形，读不了");if(!R0(r))throw new Fn("文件里的解题过程结构不对")}else r=void 0;return{id:"",savedAt:Date.now(),problemText:i.problemText,extra:typeof i.extra=="string"?i.extra:"",thumbnail:typeof i.thumbnail=="string"?i.thumbnail:void 0,image:typeof i.image=="string"?i.image:void 0,scene:s,solution:r}}function R0(n){if(typeof n!="object"||n===null)return!1;const e=n;if(!Array.isArray(e.steps)||e.steps.length===0)return!1;for(const t of e.steps){if(typeof t!="object"||t===null)return!1;const i=t;if(typeof i.title!="string"||typeof i.text!="string"||typeof i.uses!="object"||i.uses===null||!Array.isArray(i.addPoints)||!Array.isArray(i.addEdges))return!1}return!(!Array.isArray(e.answers)||!Array.isArray(e.angles)||!Array.isArray(e.lengths))}const _a="geo3d.history.v1",P0=10,D0=n=>{if(typeof n!="object"||n===null)return!1;const e=n;return typeof e.id=="string"&&typeof e.savedAt=="number"&&typeof e.problemText=="string"};function L0(n){function e(){try{const i=n.getItem(_a);if(!i)return[];const s=JSON.parse(i);return Array.isArray(s)?s.filter(D0):[]}catch{return[]}}function t(i){const s=[i,i.slice(0,Math.max(1,Math.floor(i.length/2))),i.slice(0,5).map(o=>({...o,thumbnail:void 0}))];let r=null;for(const o of s)try{n.setItem(_a,JSON.stringify(o));return}catch(a){r=a}throw r instanceof Error?r:new Error("存不进去了")}return{list:()=>e().sort((i,s)=>s.savedAt-i.savedAt),save(i){const s=e(),r=s.find(c=>i.id&&c.id===i.id||c.problemText===i.problemText),o=s.filter(c=>c!==r),a={...i,problemText:i.problemText??r?.problemText??"",extra:i.extra??r?.extra??"",thumbnail:i.thumbnail??r?.thumbnail,image:i.image??r?.image,scene:i.scene??r?.scene,solution:i.solution??r?.solution,id:r?.id??i.id??`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,savedAt:Date.now()};return o.sort((c,l)=>l.savedAt-c.savedAt),t([a,...o.slice(0,P0-1)]),a},remove(i){t(e().filter(s=>s.id!==i))},clear(){n.setItem(_a,JSON.stringify([]))}}}const I0=`在棱长为 2 的正四面体 PABC 中，底面 ABC 是正三角形。
点 E 在侧面 PAB 内运动，点 F 在侧面 PBC 内运动，点 M 在侧面 PCA 内运动。
（这是内置的测试题：三个面上的动点张成一个新平面，动任意一个，那个平面跟着变。）`,th=`在正四棱锥 P-ABCD 中，底面 ABCD 是边长为 2 的正方形，侧棱 PA=PB=PC=PD=2。
点 E 是棱 PB 上的动点，点 F 是侧面 PAB 内的动点。
（1）求侧棱 PA 与底面 ABCD 所成角的大小；
（2）求二面角 P-CD-A 的余弦值；
（3）M 是 AB 的中点，求 PM 的长。`,U0={points:[{name:"A",kind:"free",at:[0,0,0]},{name:"B",kind:"free",at:[2,0,0]},{name:"C",kind:"free",at:[1,0,1.732]},{name:"P",kind:"free",at:[1,1.633,.577]},{name:"N",kind:"midpoint",of:["A","B"]},{name:"E",kind:"inFace",face:["P","A","B"],u:.4,v:.3},{name:"F",kind:"inFace",face:["P","B","C"],u:.4,v:.3},{name:"M",kind:"inFace",face:["P","C","A"],u:.4,v:.3}],constraints:[{kind:"distance",a:"A",b:"B",value:2},{kind:"distance",a:"B",b:"C",value:2},{kind:"distance",a:"C",b:"A",value:2},{kind:"distance",a:"P",b:"A",value:2},{kind:"distance",a:"P",b:"B",value:2},{kind:"distance",a:"P",b:"C",value:2}],edges:[["A","B"],["B","C"],["C","A"],["P","A"],["P","B"],["P","C"],["P","N"],["E","F"],["F","M"],["M","E"]],faces:[["A","B","C"],["P","A","B"],["P","B","C"],["P","C","A"],["E","F","M"]]},N0={steps:[{title:"点 E 在侧面 PAB 内滑动",text:"E 被限制在三角形 PAB 内部，有左右与上下两个自由度。它只在这个面里动，不影响 F 与 M。",why:"动点在给定平面内运动",addPoints:[],addEdges:[],uses:["PAB","E"]},{title:"点 F 在侧面 PBC 内滑动",text:"同理，F 被限制在三角形 PBC 内部。三个动点各自待在自己的侧面里，互不干涉。",why:"动点在给定平面内运动",addPoints:[],addEdges:[],uses:["PBC","F"]},{title:"点 M 在侧面 PCA 内滑动",text:"M 被限制在三角形 PCA 内部。到这一步，三个侧面上各有一个动点。",why:"动点在给定平面内运动",addPoints:[],addEdges:[],uses:["PCA","M"]},{title:"E、F、M 三点张成一个面",text:"不在同一条直线上的三个点确定一个平面，所以 E、F、M 永远张成一个平面。拖动任意一个动点时，这个平面会实时跟着改变形状与朝向 —— 这就是「点驱动面」。",why:"不共线的三点确定一个平面",addPoints:[],addEdges:[],uses:["EF","FM","ME","EFM"]}],answers:[],angles:[{kind:"linePlane",line:["P","A"],plane:["A","B","C"],label:"PA 与底面所成角",value:"√3/3",of:"cos"},{kind:"dihedral",edge:["A","B"],inA:"P",inB:"C",label:"二面角 P-AB-C",value:"1/3",of:"cos"},{kind:"lineLine",p:["P","A"],q:["P","B"],label:"∠APB",value:"60°",of:"degrees"}],lengths:[{p:["A","B"],label:"AB",value:"2"},{p:["E","F"],label:"EF"}]},F0=`在平行四边形 ABCD 中，AB = BC = 2，∠ABC = 90°。把平行四边形沿 BC 折起，
使点 D 离开原来的平面，折起之后的点记作 D₂。
（1）当二面角 A-BC-D₂ 为 90° 时，求 A、D₂ 两点间的距离；
（2）求 A、D₂ 两点间距离的取值范围。`,O0={points:[{name:"A",kind:"free",at:[0,0,0]},{name:"B",kind:"free",at:[2,0,0]},{name:"C",kind:"free",at:[2,0,2]},{name:"D",kind:"offset",of:["A","C","B"]},{name:"D2",kind:"onArc",of:["B","C"],from:"D",angle:100}],constraints:[{kind:"distance",a:"A",b:"B",value:2},{kind:"distance",a:"B",b:"C",value:2},{kind:"angle",at:"B",from:"A",to:"C",value:90}],hiddenPoints:["D"],edges:[["A","B"],["B","C"],["C","D2"],["D2","A"],["A","C"]],faces:[["A","B","C"],["B","C","D2"]]},B0={steps:[{title:"先把平行四边形摆出来",text:"AB = BC = 2，∠ABC = 90°，所以 ABCD 是一个正方形。",why:"平行四边形的对边平行且相等",q:"0",addPoints:[],addEdges:[["A","B"],["B","C"],["A","C"]],uses:["ABC","A","B","C"]},{title:"把 D 绕 BC 折起来",text:"D 绕着 BC 这条轴旋转 —— 它走的是一段圆弧，圆心在 BC 上，半径是 D 到 BC 的距离。拖那个橙色的 D₂ 就能看到它沿弧滑动。",why:"翻折就是绕棱旋转",q:"0",addPoints:[{name:"D2",kind:"onArc",of:["B","C"],from:"D",angle:90}],addEdges:[["C","D2"],["D2","A"]],uses:["D2","B","C"]}],answers:[{label:"（1）二面角为 90° 时 |AD₂|",value:"2√3"},{label:"（2）|AD₂| 的取值范围",value:"[2, 2√5]"}],angles:[{kind:"dihedral",edge:["B","C"],inA:"A",inB:"D2",label:"二面角 A-BC-D₂",value:"1",of:"cos"}],lengths:[{p:["A","D2"],label:"AD₂"}]},k0=`在棱长为 2 的正方体 ABCD-A₁B₁C₁D₁ 中，点 E 是棱 A₁B₁ 上的动点，点 F 是底面 ABCD 内的动点。
（1）当 E 是棱 A₁B₁ 的中点时，求直线 A₁E 与底面 ABCD 所成角的正切值；
（2）求线段 EF 的最小值。`,z0=`在棱长为 2 的正方体 ABCD-A₁B₁C₁D₁ 中，M 是棱 AA₁ 的中点，G 是棱 CC₁ 的中点，O 是底面 ABCD 的中心。
（1）求异面直线 A₁B 与 B₁C 所成角的大小；
（2）求二面角 A₁-BD-A 的正切值；
（3）求 A₁G 与底面 ABCD 所成角的正弦值；
（4）点 E 是棱 A₁B₁ 上的动点，点 F 在底面 ABCD 内运动，求线段 EF 的最小值。`,H0={points:[{name:"A",kind:"free",at:[0,0,0]},{name:"B",kind:"free",at:[2,0,0]},{name:"C",kind:"free",at:[2,0,2]},{name:"D",kind:"free",at:[0,0,2]},{name:"A1",kind:"free",at:[0,2,0]},{name:"B1",kind:"offset",of:["A1","B","A"]},{name:"C1",kind:"offset",of:["B1","C","B"]},{name:"D1",kind:"offset",of:["A1","D","A"]},{name:"E",kind:"onSegment",of:["A1","B1"],t:.5},{name:"F",kind:"inFace",face:["A","B","C","D"],u:.35,v:.6}],constraints:[{kind:"distance",a:"A",b:"B",value:2},{kind:"distance",a:"B",b:"C",value:2},{kind:"distance",a:"C",b:"D",value:2},{kind:"distance",a:"D",b:"A",value:2},{kind:"angle",at:"A",from:"D",to:"B",value:90},{kind:"perpLinePlane",line:["A","A1"],plane:["A","B","C"]},{kind:"distance",a:"A",b:"A1",value:2},{kind:"equalDistance",ab:["A","B"],cd:["C","D"]},{kind:"perpendicular",p:["A","B"],q:["B","C"]},{kind:"parallel",p:["A","B"],q:["D","C"]},{kind:"coplanar",pts:["A","B","C","D"]},{kind:"lineAngle",p:["A1","B"],q:["B1","C"],value:60}],edges:[["A","B"],["B","C"],["C","D"],["D","A"],["A1","B1"],["B1","C1"],["C1","D1"],["D1","A1"],["A","A1"],["B","B1"],["C","C1"],["D","D1"],["E","F"]],faces:[["A","B","C","D"],["A1","B1","C1","D1"],["A","B","B1","A1"],["B","C","C1","B1"],["C","D","D1","C1"],["D","A","A1","D1"],["A1","B","D"]]},V0={steps:[{title:"先把这个正方体摆出来",q:"0",text:"底面 ABCD 是边长 2 的正方形，AA₁ 垂直底面且 AA₁ = 2。顶面三个顶点由平移得到。",why:"正方体的基本结构",addPoints:[],addEdges:[["A","B"],["B","C"],["C","D"],["D","A"],["A1","B1"],["B1","C1"],["C1","D1"],["D1","A1"],["A","A1"],["B","B1"],["C","C1"],["D","D1"]],uses:["ABCD","A1B1C1D1","A","A1"]},{title:"第（1）问：异面直线 A₁B 与 B₁C 所成角",q:"1",text:"把 B₁C 平移到 A₁D，它就与 A₁B 相交于 A₁。于是所求角就是 ∠BA₁D，而 △A₁BD 是正三角形，所以是 60°。",why:"异面直线所成角要平移到相交",addPoints:[],addEdges:[["A1","B"],["B1","C"],["A1","D"],["B","D"]],uses:["A1B","B1C","A1"]},{title:"第（1）问·向量法：算两个方向向量的夹角",text:"取 A₁B 与 B₁C 的方向向量，点积除以两个模长，得到 cos = 1/2，所以夹角是 60°。",why:"异面直线所成角 = 两个方向向量夹角的余弦的绝对值",q:"1",via:"向量法",addPoints:[],addEdges:[["A1","B"],["B1","C"]],uses:["A1B","B1C"]},{title:"第（1）问·坐标系法：建系算坐标",text:"以 A 为原点、三条棱为坐标轴，A₁B 的方向是 (2,-2,0)，B₁C 的方向是 (0,-2,2)，点积 4 除以 8 得 1/2，夹角 60°。",why:"建系之后异面直线的角就是两个坐标向量的夹角",q:"1",via:"坐标系法",addPoints:[],addEdges:[["A1","B"],["B1","C"]],uses:["A1B","B1C","A"]},{title:"第（1）问·基底法：用三条棱作基底",text:"把 AB、AD、AA₁ 取作基底。A₁B = AB − AA₁，B₁C = AD − AA₁，两者点积得 |AB|² = 4，模长各是 2√2，所以 cos = 1/2。",why:"基底法不建系，直接把向量拆成三条棱的组合",q:"1",via:"基底法",addPoints:[],addEdges:[["A1","B"],["B1","C"],["A","A1"]],uses:["A1B","B1C","AA1"]},{title:"第（2）问：二面角 A₁-BD-A",q:"2",text:"O 是底面中心，也是 A 与 A₁ 在 BD 上的垂足。所以二面角的平面角就是 ∠AOA₁，而 AO ⊥ 底面、AA₁ ⊥ 底面，于是 tan∠AOA₁ = AA₁ / AO = 2 / √2 = √2。",why:"二面角要找垂直于棱的两条线",addPoints:[{name:"O",kind:"ratio",of:["A","C"],t:.5},{name:"H",kind:"projLine",of:["A1","B","D"]}],addEdges:[["A1","H"],["A","H"]],uses:["BD","A1H","AH","O"]},{title:"第（3）问：A₁G 与底面所成角",q:"3",text:"G 是 CC₁ 的中点，所以 G 到底面的距离是 1（CC₁ 的一半）。而 A₁G 的长是 √(2² + 1² + 2²) = 3。线面角的正弦就是「高比斜边」＝ 1/3。",why:"线面角的正弦 = 端点到面的距离 / 斜线长",addPoints:[{name:"G",kind:"midpoint",of:["C","C1"]}],addEdges:[["A1","G"],["C","G"]],uses:["A1G","G"]},{title:"第（4）问：动点 E、F 之间距离的最小值",q:"4",text:"E 在顶面的棱 A₁B₁ 上，离底面 2；F 在底面内，离底面 0。所以 EF 至少是 2，而且当 E 与 F 竖直对齐时正好取到 2 —— 最小值就是 2。",why:"两条平行线上两点距离的最小值就是它们之间的距离",addPoints:[],addEdges:[],uses:["EF","E","F"]},{title:"第（4）问·向量法：把 EF 当成向量",text:"E 在 A₁B₁ 上、F 在底面内，EF 就是从 E 指向 F 的向量。它竖直方向上的分量正好是 2，所以长度至少是 2；E 与 F 上下对齐时取到 2。",why:"两点间距离就是差向量的模",q:"4",via:"向量法",addPoints:[],addEdges:[["E","F"]],uses:["EF","E","F"]},{title:"第（4）问·基底法：用三条棱当基底",text:"取 AB、AD、AA₁ 作基底。E = AA₁ + AB + t·AB 的方向上是确定的，F 在底面内所以没有 AA₁ 分量 —— 两者之差里 AA₁ 的系数恒为 1，模长至少是 2。",why:"基底法把向量拆成三条棱的组合，竖直分量一眼看出",q:"4",via:"基底法",addPoints:[],addEdges:[["E","F"]],uses:["EF","E","F","AA1"]},{title:"第（4）问·坐标系法：建系标坐标",text:"以 A 为原点、AB 为 x 轴、AD 为 y 轴、AA₁ 为 z 轴。E 的 z 坐标恒为 1（在顶面上），F 的 z 坐标恒为 0，所以两点距离的平方里 z 方向就贡献 1，距离至少是 1 个单位 —— 换成棱长就是 2。",why:"建系之后竖直方向的差一眼看出",q:"4",via:"坐标系法",addPoints:[],addEdges:[["E","F"]],uses:["EF","E","F","A"]},{title:"附带：点 A 到平面 A₁BD 的距离",q:"0",text:"N 是 A 在平面 A₁BD 上的垂足。对角线 AC₁ 垂直于平面 A₁BD，所以这条距离等于 AC₁ 的三分之一，即 2√3/3。",why:"正方体的体对角线垂直于截面 A₁BD",addPoints:[{name:"N",kind:"perpFoot",of:["A","A1","B","D"]},{name:"M",kind:"midpoint",of:["A","A1"]}],addEdges:[["A","N"]],uses:["AN","N","A1BD"]}],answers:[{label:"（1）A₁B 与 B₁C 所成角",value:"60°"},{label:"（2）二面角 A₁-BD-A 的正切",value:"√2"},{label:"（3）A₁G 与底面所成角的正弦",value:"1/3"},{label:"（4）EF 的最小值",value:"2"}],arrows:[{from:"E",to:"F",label:"EF",color:"yellow"},{from:"E",to:"A1",label:"EA₁",color:"yellow"},{from:"A",to:"B",label:"AB",color:"blue"},{from:"A",to:"D",label:"AD",color:"blue"},{from:"A",to:"A1",label:"AA₁",color:"blue"}],normals:[{face:["A","B","C","D"],at:"A",color:"yellow",label:"n"}],frame:{origin:"A",x:"B",y:"D",z:"A1",note:"以 A 为原点、三条棱 AB、AD、AA₁ 分别作 x、y、z 轴：它们两两垂直且交于 A，正方体的每条棱都平行于其中一条，所以所有顶点的坐标都是整数，不用做任何辅助线。"},angles:[{kind:"lineLine",p:["A1","B"],q:["B1","C"],label:"A₁B 与 B₁C 所成角",value:"60°",of:"degrees"},{kind:"dihedral",edge:["B","D"],inA:"A1",inB:"A",label:"二面角 A₁-BD-A",value:"√3/3",of:"cos"},{kind:"linePlane",line:["A1","G"],plane:["A","B","C"],label:"A₁G 与底面所成角",value:"1/3",of:"sin"}],lengths:[{p:["A","B"],label:"AB",value:"2"},{p:["A","N"],label:"A 到平面A₁BD",value:"2√3/3"},{p:["E","F"],label:"EF"}]},G0="【临时测试】曲面立体：球、椭球、圆柱、圆锥、圆台各一个。",W0={points:[{name:"P",kind:"free",at:[-6,0,0]},{name:"Q",kind:"free",at:[-4.5,0,0]},{name:"U",kind:"free",at:[-2,0,0]},{name:"V",kind:"free",at:[.2,0,0]},{name:"W",kind:"free",at:[-2,1.2,0]},{name:"X",kind:"free",at:[-2,0,.7]},{name:"G",kind:"free",at:[2,-1,0]},{name:"H",kind:"free",at:[2,1,0]},{name:"M",kind:"free",at:[5.5,1,0]},{name:"N",kind:"free",at:[5.5,-1,0]},{name:"K",kind:"free",at:[6.5,-1,0]},{name:"S",kind:"free",at:[9,-1,0]},{name:"T",kind:"free",at:[9,1,0]}],constraints:[{kind:"distance",a:"P",b:"Q",value:1.5},{kind:"distance",a:"U",b:"V",value:2.2},{kind:"distance",a:"U",b:"W",value:1.2},{kind:"distance",a:"U",b:"X",value:.7},{kind:"perpendicular",p:["U","V"],q:["U","W"]},{kind:"perpendicular",p:["U","V"],q:["U","X"]},{kind:"perpendicular",p:["U","W"],q:["U","X"]},{kind:"distance",a:"G",b:"H",value:2},{kind:"distance",a:"M",b:"N",value:2},{kind:"distance",a:"N",b:"K",value:1},{kind:"perpendicular",p:["M","N"],q:["N","K"]},{kind:"distance",a:"S",b:"T",value:2}],edges:[["P","Q"],["U","V"],["G","H"],["M","N"],["N","K"],["S","T"]],faces:[],solids:[{kind:"sphere",center:"P",through:"Q"},{kind:"ellipsoid",center:"U",a:"V",b:"W",c:"X"},{kind:"cylinder",a:"G",b:"H",radius:.9},{kind:"cone",apex:"M",center:"N",rim:"K"},{kind:"frustum",a:"S",b:"T",radiusA:.5,radiusB:1.1}]},$0={steps:[{title:"看这几个曲面",text:"球、椭球、圆柱、圆锥、圆台各一个，都没有平面多边形可以拼出来，只能靠曲面。",why:"这一页只是用来看线框画得对不对",q:"0",addPoints:[],addEdges:[["P","Q"],["U","V"],["G","H"],["M","N"]],uses:["P","Q","U","V"]}],answers:[],angles:[],lengths:[]},X0=`在三棱锥 R-EFG 中，RE = RF = RG = 2，且 RE、RF、RG 两两垂直。
（1）点 L 是棱 EF 上的动点，求 RL 与底面 EFG 所成角的正切值的取值范围；
（2）若 L 是棱 EF 的中点，求 RL 与底面 EFG 所成角的正切值。`,q0={points:[{name:"R",kind:"free",at:[0,2,0]},{name:"E",kind:"free",at:[0,0,0]},{name:"F",kind:"free",at:[2,0,0]},{name:"G",kind:"free",at:[0,0,2]},{name:"L",kind:"onSegment",of:["E","F"],t:.5}],constraints:[{kind:"distance",a:"R",b:"E",value:2},{kind:"distance",a:"R",b:"F",value:2},{kind:"distance",a:"R",b:"G",value:2},{kind:"perpendicular",p:["R","E"],q:["R","F"]},{kind:"perpendicular",p:["R","E"],q:["R","G"]},{kind:"perpendicular",p:["R","F"],q:["R","G"]}],edges:[["R","E"],["R","F"],["R","G"],["E","F"],["F","G"],["G","E"],["R","L"]],faces:[["E","F","G"],["R","E","F"]],variants:[{q:"2",points:[{name:"L",kind:"midpoint",of:["E","F"]}],constraints:[{kind:"distance",a:"E",b:"L",value:Math.SQRT2}]}]},Y0={steps:[{title:"先摆出三棱锥",text:"RE、RF、RG 两两垂直且都等于 2，所以它是三条棱互相垂直的三棱锥。",why:"题面直接给的垂直关系",q:"0",addPoints:[],addEdges:[["R","E"],["R","F"],["R","G"]],uses:["R","E","F","G"]},{title:"第（1）问：L 在 EF 上滑动",text:"L 是 EF 上的动点，可以拖着它来回滑动，看 RL 的变化。",why:"动点用 onSegment",q:"1",addPoints:[],addEdges:[["R","L"]],uses:["L","RL"]},{title:"第（2）问：L 被钉在 EF 的中点",text:"这一问的「若 L 是中点」只对第（2）问成立 —— 切到第（1）问时它又变回能滑动的动点。",why:"「若」是这一问独有的条件",q:"2",addPoints:[],addEdges:[["R","L"]],uses:["L","RL","EF"]}],answers:[{label:"（1）正切值的取值范围",value:"[√2/2, +∞)"},{label:"（2）正切值",value:"√2"}],angles:[],lengths:[]},iu={type:"change"},Nc={type:"start"},nh={type:"end"},qr=new xo,su=new yi,j0=Math.cos(70*Pd.DEG2RAD),Bt=new R,rn=2*Math.PI,_t={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},va=1e-6;class K0 extends pf{constructor(e,t=null){super(e,t),this.state=_t.NONE,this.target=new R,this.cursor=new R,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:As.ROTATE,MIDDLE:As.DOLLY,RIGHT:As.PAN},this.touches={ONE:Ms.ROTATE,TWO:Ms.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new R,this._lastQuaternion=new di,this._lastTargetPosition=new R,this._quat=new di().setFromUnitVectors(e.up,new R(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new bl,this._sphericalDelta=new bl,this._scale=1,this._panOffset=new R,this._rotateStart=new We,this._rotateEnd=new We,this._rotateDelta=new We,this._panStart=new We,this._panEnd=new We,this._panDelta=new We,this._dollyStart=new We,this._dollyEnd=new We,this._dollyDelta=new We,this._dollyDirection=new R,this._mouse=new We,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=J0.bind(this),this._onPointerDown=Z0.bind(this),this._onPointerUp=Q0.bind(this),this._onContextMenu=ov.bind(this),this._onMouseWheel=nv.bind(this),this._onKeyDown=iv.bind(this),this._onTouchStart=sv.bind(this),this._onTouchMove=rv.bind(this),this._onMouseDown=ev.bind(this),this._onMouseMove=tv.bind(this),this._interceptControlDown=av.bind(this),this._interceptControlUp=cv.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(iu),this.update(),this.state=_t.NONE}update(e=null){const t=this.object.position;Bt.copy(t).sub(this.target),Bt.applyQuaternion(this._quat),this._spherical.setFromVector3(Bt),this.autoRotate&&this.state===_t.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=rn:i>Math.PI&&(i-=rn),s<-Math.PI?s+=rn:s>Math.PI&&(s-=rn),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Bt.setFromSpherical(this._spherical),Bt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Bt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=Bt.length();o=this._clampDistance(a*this._scale);const c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){const a=new R(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;const l=new R(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=Bt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(qr.origin.copy(this.object.position),qr.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(qr.direction))<j0?this.object.lookAt(this.target):(su.setFromNormalAndCoplanarPoint(this.object.up,this.target),qr.intersectPlane(su,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>va||8*(1-this._lastQuaternion.dot(this.object.quaternion))>va||this._lastTargetPosition.distanceToSquared(this.target)>va?(this.dispatchEvent(iu),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?rn/60*this.autoRotateSpeed*e:rn/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Bt.setFromMatrixColumn(t,0),Bt.multiplyScalar(-e),this._panOffset.add(Bt)}_panUp(e,t){this.screenSpacePanning===!0?Bt.setFromMatrixColumn(t,1):(Bt.setFromMatrixColumn(t,0),Bt.crossVectors(this.object.up,Bt)),Bt.multiplyScalar(e),this._panOffset.add(Bt)}_pan(e,t){const i=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;Bt.copy(s).sub(this.target);let r=Bt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,o=i.width,a=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(rn*this._rotateDelta.x/t.clientHeight),this._rotateUp(rn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(rn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-rn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(rn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-rn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(rn*this._rotateDelta.x/t.clientHeight),this._rotateUp(rn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new We,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function Z0(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n)))}function J0(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function Q0(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(nh),this.state=_t.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function ev(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case As.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=_t.DOLLY;break;case As.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=_t.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=_t.ROTATE}break;case As.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=_t.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=_t.PAN}break;default:this.state=_t.NONE}this.state!==_t.NONE&&this.dispatchEvent(Nc)}function tv(n){switch(this.state){case _t.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case _t.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case _t.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function nv(n){this.enabled===!1||this.enableZoom===!1||this.state!==_t.NONE||(n.preventDefault(),this.dispatchEvent(Nc),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(nh))}function iv(n){this.enabled!==!1&&this._handleKeyDown(n)}function sv(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case Ms.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=_t.TOUCH_ROTATE;break;case Ms.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=_t.TOUCH_PAN;break;default:this.state=_t.NONE}break;case 2:switch(this.touches.TWO){case Ms.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=_t.TOUCH_DOLLY_PAN;break;case Ms.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=_t.TOUCH_DOLLY_ROTATE;break;default:this.state=_t.NONE}break;default:this.state=_t.NONE}this.state!==_t.NONE&&this.dispatchEvent(Nc)}function rv(n){switch(this._trackPointer(n),this.state){case _t.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case _t.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case _t.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case _t.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=_t.NONE}}function ov(n){this.enabled!==!1&&n.preventDefault()}function av(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function cv(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class xa extends Jt{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new We(.5,.5),this.addEventListener("removed",function(){this.traverse(function(t){t.element instanceof t.element.ownerDocument.defaultView.Element&&t.element.parentNode!==null&&t.element.remove()})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}}const xs=new R,ru=new vt,ou=new vt,au=new R,cu=new R;class lv{constructor(e={}){const t=this;let i,s,r,o;const a={objects:new WeakMap},c=e.element!==void 0?e.element:document.createElement("div");c.style.overflow="hidden",this.domElement=c,this.getSize=function(){return{width:i,height:s}},this.render=function(g,_){g.matrixWorldAutoUpdate===!0&&g.updateMatrixWorld(),_.parent===null&&_.matrixWorldAutoUpdate===!0&&_.updateMatrixWorld(),ru.copy(_.matrixWorldInverse),ou.multiplyMatrices(_.projectionMatrix,ru),u(g,g,_),m(g)},this.setSize=function(g,_){i=g,s=_,r=i/2,o=s/2,c.style.width=g+"px",c.style.height=_+"px"};function l(g){g.isCSS2DObject&&(g.element.style.display="none");for(let _=0,p=g.children.length;_<p;_++)l(g.children[_])}function u(g,_,p){if(g.visible===!1){l(g);return}if(g.isCSS2DObject){xs.setFromMatrixPosition(g.matrixWorld),xs.applyMatrix4(ou);const d=xs.z>=-1&&xs.z<=1&&g.layers.test(p.layers)===!0,x=g.element;x.style.display=d===!0?"":"none",d===!0&&(g.onBeforeRender(t,_,p),x.style.transform="translate("+-100*g.center.x+"%,"+-100*g.center.y+"%)translate("+(xs.x*r+r)+"px,"+(-xs.y*o+o)+"px)",x.parentNode!==c&&c.appendChild(x),g.onAfterRender(t,_,p));const E={distanceToCameraSquared:h(p,g)};a.objects.set(g,E)}for(let d=0,x=g.children.length;d<x;d++)u(g.children[d],_,p)}function h(g,_){return au.setFromMatrixPosition(g.matrixWorld),cu.setFromMatrixPosition(_.matrixWorld),au.distanceToSquared(cu)}function f(g){const _=[];return g.traverseVisible(function(p){p.isCSS2DObject&&_.push(p)}),_}function m(g){const _=f(g).sort(function(d,x){if(d.renderOrder!==x.renderOrder)return x.renderOrder-d.renderOrder;const E=a.objects.get(d).distanceToCameraSquared,M=a.objects.get(x).distanceToCameraSquared;return E-M}),p=_.length;for(let d=0,x=_.length;d<x;d++)_[d].element.style.zIndex=p-d}}}const uv=["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"],To=n=>String(n).split("").map(e=>uv[+e]).join(""),zn="A"+To(1),Hn="B"+To(1),Vn="C"+To(1),Gn="D"+To(1),wi={A:[0,0,0],B:[1,0,0],C:[1,0,1],D:[0,0,1],[zn]:[0,1,0],[Hn]:[1,1,0],[Vn]:[1,1,1],[Gn]:[0,1,1]},ih=[["A","B"],["B","C"],["C","D"],["D","A"],[zn,Hn],[Hn,Vn],[Vn,Gn],[Gn,zn],["A",zn],["B",Hn],["C",Vn],["D",Gn]],gc=[{name:"ABCD",pts:["A","B","C","D"],color:5213439},{name:`${zn}${Hn}${Vn}${Gn}`,pts:[zn,Hn,Vn,Gn],color:16752451},{name:`AB${Hn}${zn}`,pts:["A","B",Hn,zn],color:3066993},{name:`BC${Vn}${Hn}`,pts:["B","C",Vn,Hn],color:15158332},{name:`CD${Gn}${Vn}`,pts:["C","D",Gn,Vn],color:10181046},{name:`DA${zn}${Gn}`,pts:["D","A",zn,Gn],color:15844367}],hv=()=>{const n=Object.keys(wi),e=new R;for(const t of n)e.add(new R(...wi[t]));return e.divideScalar(n.length)};function dv(){const n=hv();for(const i of gc){if(i.pts.length<3)throw new Error(`面 ${i.name} 少于三个点`);for(const o of i.pts)if(!(o in wi))throw new Error(`面 ${i.name} 引用了不存在的点 ${o}`);const s=i.pts.map(o=>new R(...wi[o]).sub(n)),r=new R().subVectors(s[1],s[0]).cross(new R().subVectors(s[2],s[0])).normalize();for(let o=3;o<s.length;o++){const a=Math.abs(new R().subVectors(s[o],s[0]).dot(r));if(a>1e-9)throw new Error(`面 ${i.name} 不共面，偏差 ${a}`)}}const e=(i,s)=>[i,s].sort().join("-"),t=new Map;for(const i of gc)for(let s=0;s<i.pts.length;s++){const r=e(i.pts[s],i.pts[(s+1)%i.pts.length]);t.set(r,(t.get(r)??0)+1)}for(const[i,s]of ih){if(!(i in wi)||!(s in wi))throw new Error(`棱 ${i}${s} 引用了不存在的点`);const r=t.get(e(i,s))??0;if(r!==2)throw new Error(`棱 ${i}${s} 应属于两个面，实际 ${r} 个`)}for(const[i,s]of t)if(s!==2)throw new Error(`面与面接缝 ${i} 被 ${s} 个面共用，应为 2 个`)}const bi=n=>new R(n[0],n[1],n[2]);function lu(n,e,t,i){const s=bi(n),r=bi(e),o=new R().subVectors(r,s),a=o.length();if(a<1e-9)return null;const c=new di().setFromUnitVectors(new R(0,1,0),o.clone().normalize()),l=new R().addVectors(s,r).multiplyScalar(.5);return{geometry:"cylinder",params:{radiusTop:i,radiusBottom:t,height:a},matrix:new vt().compose(l,c,new R(1,1,1))}}function fv(n){if(n.kind==="sphere")return!n.center||!n.radius?null:{geometry:"sphere",params:{radius:n.radius},matrix:new vt().makeTranslation(n.center[0],n.center[1],n.center[2])};if(n.kind==="ellipsoid"){if(!n.center||!n.ax||!n.ay||!n.az)return null;const a=bi(n.center),c=new R().subVectors(bi(n.ax),a),l=new R().subVectors(bi(n.ay),a),u=new R().subVectors(bi(n.az),a),h=c.length(),f=l.length(),m=u.length();if(h<1e-9||f<1e-9||m<1e-9||(c.normalize(),l.addScaledVector(c,-l.dot(c)),l.length()<1e-9)||(l.normalize(),u.addScaledVector(c,-u.dot(c)).addScaledVector(l,-u.dot(l)),u.length()<1e-9))return null;u.normalize();const g=new vt().makeBasis(c,l,u);return g.setPosition(a),g.multiply(new vt().makeScale(h,f,m)),{geometry:"sphere",params:{radius:1},matrix:g}}if(n.kind==="cylinder")return!n.a||!n.b||!n.radius?null:lu(n.a,n.b,n.radius,n.radius);if(n.kind==="frustum")return!n.a||!n.b||!n.radiusA||!n.radiusB?null:lu(n.a,n.b,n.radiusA,n.radiusB);if(!n.apex||!n.center||!n.radius)return null;const e=bi(n.apex),t=bi(n.center),i=new R().subVectors(e,t),s=i.length();if(s<1e-9)return null;const r=new di().setFromUnitVectors(new R(0,1,0),i.clone().normalize()),o=new R().addVectors(e,t).multiplyScalar(.5);return{geometry:"cone",params:{radius:n.radius,height:s},matrix:new vt().compose(o,r,new R(1,1,1))}}function pv(){const n=navigator.deviceMemory,e=typeof n=="number"&&n<=4;return{low:e,maxPixelRatio:e?1:Math.min(window.devicePixelRatio,2)}}function mv(){const n=e=>wi[e];return{vertices:Object.entries(wi).map(([e,t])=>({name:e,at:t,aux:!1,moving:!1})),edges:ih.map(([e,t])=>({key:Kn(e,t),a:n(e),b:n(t),aux:!1})),faces:gc.map(e=>({key:e.pts.join(""),pts:e.pts.map(n),names:[...e.pts],color:e.color}))}}function gv(n,e,t){dv();const i=pv();let s;try{if(s=new Z_({antialias:!i.low,preserveDrawingBuffer:!0}),!s.getContext())throw new Error("no webgl context")}catch{return n.innerHTML='<p style="padding:80px 24px;text-align:center;color:#98a2b3">这台设备没能创建 3D 渲染（WebGL2）。可以试着在系统里更新「Android System WebView」后重开本页。</p>',null}s.setPixelRatio(i.maxPixelRatio),n.appendChild(s.domElement);const r=new lv({element:e}),o=new sf;o.background=new ut(987413);const a=new Mn(45,window.innerWidth/window.innerHeight,.01,500);a.position.set(2.2,1.8,2.6);const c=new K0(a,s.domElement);c.enableDamping=!0,c.dampingFactor=.08,c.minDistance=.5,c.maxDistance=60;const l=new Bn;o.add(l);const u=([G,F,q])=>new R(G,F,q),h=new Ti({color:14673650}),f=new Ml({color:8246176,dashSize:.18,gapSize:.12}),m=new Ti({color:16765286});let g=new Map,_=new Map,p=new Map;const d=new Map;let x=new Set,E=new Set;const M=new Map,w=new Set,C=new Set;let T=[];function L(){for(const[G,F]of M)F.mesh.visible=!w.has(G)}const b=new Map;function S(G,F){if(F.length<3)return;const q=[];for(let ue=1;ue<F.length-1;ue++)for(const Je of[F[0],F[ue],F[ue+1]])q.push(Je[0],Je[1],Je[2]);const Z=G.geometry,pe=Z.getAttribute("position");if(!pe||pe.count!==q.length/3)Z.setAttribute("position",new Ht(q,3));else{for(let ue=0;ue<q.length/3;ue++)pe.setXYZ(ue,q[ue*3],q[ue*3+1],q[ue*3+2]);pe.needsUpdate=!0}Z.computeBoundingSphere()}let P={};const N=new Bn;o.add(N);const z=new Ti({color:9417944,transparent:!0,opacity:.5});function W(G){const F=fv(G);if(!F){Y.push(G.kind);return}const q=F.geometry==="sphere"?new Pc(F.params.radius??1,28,18):F.geometry==="cone"?new Eo(F.params.radius??1,F.params.height??1,32,1,!0):new So(F.params.radiusTop??1,F.params.radiusBottom??1,F.params.height??1,32,1,!0),Z=new Bn;Z.userData.solidIndex=$.length,$.push(Z),N.add(Z);const pe=new kr(new cf(q),z);pe.applyMatrix4(F.matrix),Z.add(pe),q.dispose();const ue=F.params.radius??0;if(ue>0&&(F.geometry==="cylinder"||F.geometry==="cone")){const Je=F.geometry==="cone"?[-F.params.height/2]:[-F.params.height/2,F.params.height/2];for(const Xe of Je){const pt=F.geometry==="cylinder"&&Xe>0?F.params.radiusTop??ue:F.params.radiusBottom??ue;if(!(pt>0))continue;const Nt=[];for(let ln=0;ln<=64;ln++){const un=ln/64*Math.PI*2;Nt.push(new R(Math.cos(un)*pt,Xe,Math.sin(un)*pt))}const tt=new co(new $t().setFromPoints(Nt),z);tt.applyMatrix4(F.matrix),Z.add(tt)}}}const $=[];let Y=[];const Q=new Bn;o.add(Q);const X=new Ti({color:5923954,transparent:!0,opacity:.55});function ae(G){for(const Z of[...Q.children])Q.remove(Z);if(!G.length)return;const F=[];for(const[Z,pe]of G)F.push(Z[0],Z[1],Z[2],pe[0],pe[1],pe[2]);const q=new $t;q.setAttribute("position",new Ht(F,3)),Q.add(new kr(q,X))}function me(G){l.clear();for(const F of[...Q.children])Q.remove(F);for(const F of[...N.children])N.remove(F);for(const F of G.solids??[])T.push(F.kind),W(F);e.innerHTML="",B=!0,g=new Map,p=new Map,M.clear(),w.clear(),b.clear(),_.clear(),x=new Set(G.edges.filter(F=>F.aux).map(F=>F.key)),E=new Set(G.vertices.filter(F=>F.aux).map(F=>F.name)),P={};for(const F of G.vertices)P[F.name]=F.at;for(const F of G.faces){if(F.pts.length<3)continue;const q=new Ln(new $t,new Mo({color:F.color,transparent:!0,opacity:.22,side:Wn,depthWrite:!1}));S(q,F.pts),l.add(q),q.userData.faceKey=F.key,M.set(F.key,{mesh:q,color:F.color,pts:F.names})}L();for(const F of G.edges){const q=new $t().setFromPoints([u(F.a),u(F.b)]),Z=new kr(q,F.aux?f:h);F.aux&&Z.computeLineDistances(),l.add(Z),g.set(F.key,Z),_.set(F.key,[F.a,F.b])}for(const F of G.vertices){if(F.hidden)continue;const q=document.createElement("div");q.className=F.moving?"pt mov":F.aux?"pt aux":"pt",q.textContent=F.name;const Z=new xa(q);Z.position.copy(u(F.at)),l.add(Z),p.set(F.name,Z),d.set(F.name,q)}for(const F of G.edges){const[q,Z]=F.key.split("|");b.set(F.key,[q,Z])}He(G)}function Re(G){const F=Object.keys(G);if(!F.length)return;at===null&&(B=!0);for(const Z of F)P[Z]=G[Z];for(const Z of F){const pe=p.get(Z);pe&&pe.position.set(G[Z][0],G[Z][1],G[Z][2])}const q=new Set(F);for(const[Z,pe]of g){const ue=b.get(Z);if(!ue||!q.has(ue[0])&&!q.has(ue[1]))continue;const Je=P[ue[0]],Xe=P[ue[1]];if(!Je||!Xe)continue;const pt=pe.geometry.getAttribute("position");pt.setXYZ(0,Je[0],Je[1],Je[2]),pt.setXYZ(1,Xe[0],Xe[1],Xe[2]),pt.needsUpdate=!0,pe.geometry.computeBoundingSphere()}for(const Z of M.values()){if(!Z.pts.some(ue=>q.has(ue)))continue;const pe=Z.pts.map(ue=>P[ue]);pe.some(ue=>!ue)||S(Z.mesh,pe)}}function Ye(G){const F=G?.grow;for(const[q,Z]of g){if(!x.has(q))continue;if(F?.edges.has(q)){Z.visible=!0;const ue=_.get(q);if(ue){const Je=Z.geometry.getAttribute("position"),[Xe,pt]=ue,Nt=Math.max(0,Math.min(1,F.t));Je.setXYZ(1,Xe[0]+(pt[0]-Xe[0])*Nt,Xe[1]+(pt[1]-Xe[1])*Nt,Xe[2]+(pt[2]-Xe[2])*Nt),Je.needsUpdate=!0,Z.geometry.computeBoundingSphere()}continue}Z.visible=G===null||G.edges.has(q);const pe=_.get(q);if(pe&&Z.visible){const ue=Z.geometry.getAttribute("position");ue.setXYZ(1,pe[1][0],pe[1][1],pe[1][2]),ue.needsUpdate=!0}}for(const[q,Z]of p)E.has(q)&&(Z.visible=G===null||G.points.has(q))}const ot=new Bn;o.add(ot);const Mt={yellow:16765286,blue:5213439};let et=[],J=0;function ne(G){for(const q of[...ot.children])ot.remove(q);for(const q of et)q.removeFromParent();et=[],J=0;const F=q=>typeof q=="string"?P[q]:q;for(const q of G){const Z=F(q.from),pe=F(q.to);if(!Z||!pe)continue;const ue=new R(pe[0]-Z[0],pe[1]-Z[1],pe[2]-Z[2]),Je=ue.length(),Xe=Je*(q.extend??1);if(Je<1e-9)continue;const pt=ue.clone().normalize();let Nt=new R(0,0,0);if(A){const Ft=a.position.clone().sub(A.center).normalize(),Dt=new R().crossVectors(pt,Ft);Dt.lengthSq()>1e-9&&(Nt=Dt.normalize().multiplyScalar(A.radius*.045))}const tt=new R(Z[0]+Nt.x,Z[1]+Nt.y,Z[2]+Nt.z),ln=Xe*.09,un=new ff(pt,tt,Xe,Mt[q.color],ln,ln*.55);if(un.renderOrder=2,ot.add(un),A){const Ft=A.center,Dt=tt.x+pt.x*Xe,Qn=tt.y+pt.y*Xe,y=tt.z+pt.z*Xe;J=Math.max(J,Math.hypot(Dt-Ft.x,Qn-Ft.y,y-Ft.z))}if(q.label){const Ft=document.createElement("div");Ft.className="axis-label",Ft.textContent=q.label;const Dt=new xa(Ft);Dt.position.set(tt.x+pt.x*Xe,tt.y+pt.y*Xe,tt.z+pt.z*Xe),l.add(Dt),et.push(Dt)}}v||Ie()}function Me(G){for(const[F,q]of g){const Z=G?.edges.has(F)??!1;q.material=Z?m:x.has(F)?f:h}for(const[F,q]of p)q.element.classList.toggle("hl",G?.points.has(F)??!1);for(const[F,q]of M){const Z=G?.faces.has(F)??!1,pe=q.mesh.material;pe.color.setHex(Z?16765286:q.color),pe.opacity=Z?.46:.22}}const Le=new Bn;o.add(Le);const Ce=new Ti({color:7268351}),Ze=new Ml({color:7268351,dashSize:.12,gapSize:.1,opacity:.75,transparent:!0}),Rt=[];function D(G,F){const q=G.geometry,Z=q.getAttribute("position");!Z||Z.count!==F.length?q.setFromPoints(F.map(u)):(F.forEach((pe,ue)=>Z.setXYZ(ue,pe[0],pe[1],pe[2])),Z.needsUpdate=!0),q.computeBoundingSphere()}function St(G){for(B=!0;Rt.length>G.length;){const F=Rt.pop();if(!F)break;Le.remove(F.line,F.label,...F.extras)}G.forEach((F,q)=>{let Z=Rt[q];if(!Z){const ue=document.createElement("div");ue.className="angle-label";const Je=new xa(ue);Z={line:new co(new $t,Ce),extras:[],label:Je},Le.add(Z.line,Z.label),Rt[q]=Z}for(D(Z.line,F.arc);Z.extras.length>F.extras.length;){const ue=Z.extras.pop();ue&&Le.remove(ue)}F.extras.forEach((ue,Je)=>{let Xe=Z.extras[Je];Xe||(Xe=new kr(new $t,Ze),Le.add(Xe),Z.extras[Je]=Xe),D(Xe,ue),Xe.computeLineDistances()});const pe=Z.label.element;pe.textContent=F.text,pe.style.display=F.text?"block":"none",Z.label.position.copy(u(F.labelAt))})}function He(G){const F=[...G.vertices.map(tt=>u(tt.at)),...G.edges.flatMap(tt=>[u(tt.a),u(tt.b)])];if(!F.length)return;const q=new Bs().setFromPoints(F),Z=q.getCenter(new R),pe=q.getSize(new R),ue=Math.max(pe.length()/2,.5);c.target.copy(Z);let Je=null,Xe=0;for(const tt of G.faces){if(!tt.pts||tt.pts.length<3||!lo(tt.pts[0],tt.pts[1],tt.pts[2]))continue;let un=0;for(let Ft=1;Ft+1<tt.pts.length;Ft++){const[Dt,Qn,y]=[tt.pts[0],tt.pts[Ft],tt.pts[Ft+1]],U=[Qn[0]-Dt[0],Qn[1]-Dt[1],Qn[2]-Dt[2]],k=[y[0]-Dt[0],y[1]-Dt[1],y[2]-Dt[2]],H=[U[1]*k[2]-U[2]*k[1],U[2]*k[0]-U[0]*k[2],U[0]*k[1]-U[1]*k[0]];un+=Math.hypot(H[0],H[1],H[2])/2}un>Xe&&(Xe=un,Je=tt.pts)}let pt;const Nt=Je?lo(Je[0],Je[1],Je[2]):null;if(Nt){const tt=new R(Nt[0],Nt[1],Nt[2]).normalize(),ln=Je[0],un=new R(ln[0],ln[1],ln[2]),Ft=new R;let Dt=0;for(const U of F){Ft.set(U.x,U.y,U.z).sub(un);const k=Ft.dot(tt);Math.abs(k)>Math.abs(Dt)&&(Dt=k)}Dt<0&&tt.negate();const Qn=Math.abs(tt.y)<.9?new R(0,1,0):new R(1,0,0),y=new R().crossVectors(tt,Qn).normalize();pt=tt.clone().addScaledVector(y,1.2).normalize()}else pt=new R(1,.8,1.2).normalize();a.position.copy(Z).addScaledVector(pt,ue*2.9),a.near=ue/2e3,a.far=ue*200,a.updateProjectionMatrix(),c.minDistance=ue*.01,c.maxDistance=ue*12,c.update(),A={center:Z.clone(),radius:ue,dir:pt.clone()},v=!1,Ie()}function Ie(){if(!A)return;const G=a.fov*Math.PI/180,F=2*Math.atan(Math.tan(G/2)*Math.max(a.aspect,.01)),q=Math.max(A.radius,J),Z=q/Math.sin(G/2),pe=q/Math.sin(Math.min(F/2,Math.PI/2-.001)),ue=Math.max(Z,pe)*1.1;c.target.copy(A.center),a.position.copy(A.center).addScaledVector(A.dir,ue),c.update()}let _e=0,dt=0;const Se=()=>{const G=window.innerWidth,F=Math.max(80,window.innerHeight-_e-dt);a.aspect=G/F,a.updateProjectionMatrix(),s.setSize(G,F),r.setSize(G,F),s.domElement.style.marginTop=`${_e}px`,e.style.top=`${_e}px`;const q=s.domElement,Z=[];(q.clientWidth!==G||q.clientHeight!==F)&&Z.push(`画布 ${q.clientWidth}×${q.clientHeight} 与预期 ${G}×${F} 不一致`);const pe=q.getBoundingClientRect(),ue=e.getBoundingClientRect();(Math.abs(pe.top-ue.top)>1||Math.abs(pe.height-ue.height)>1||Math.abs(pe.width-ue.width)>1)&&Z.push(`标注层(${Math.round(ue.top)},${Math.round(ue.height)}) 与画布(${Math.round(pe.top)},${Math.round(pe.height)}) 没对齐`),t.textContent=Z.length?`⚠ ${Z.join("；")}`:K.length?`⚠ ${K.join("；")}`:"按住橙色点可直接拖动 · 单指旋转 · 双指缩放"};window.addEventListener("resize",Se);let Ve=[],at=null;const Et=new R;let A=null,v=!1,B=!0,K=[],te=null;const j=new Set;let we={x:0,y:0},ce=!1;const Ee=new El,ye=new We,se=36,fe=G=>{const F=new R(G[0],G[1],G[2]).project(a),q=s.domElement.getBoundingClientRect();return{x:q.left+(F.x+1)/2*q.width,y:q.top+(1-F.y)/2*q.height}},Ue=(G,F)=>{const q=s.domElement.getBoundingClientRect();ye.set((G-q.left)/q.width*2-1,-((F-q.top)/q.height)*2+1),Ee.setFromCamera(ye,a);const Z=Ee.ray.origin,pe=Ee.ray.direction;return{origin:[Z.x,Z.y,Z.z],dir:[pe.x,pe.y,pe.z]}};let be=null;const he=new El;function Ge(G,F){const q=s.domElement.getBoundingClientRect();ye.set((G-q.left)/q.width*2-1,-((F-q.top)/q.height)*2+1),he.setFromCamera(ye,a);const Z=[];for(const ue of M.values())Z.push(ue.mesh);return Z.length?he.intersectObjects(Z,!1)[0]?.object.userData.faceKey??null:null}function I(G,F){const q=Ge(G,F);q&&(w.has(q)?w.delete(q):w.add(q),L(),Ut.onFaceToggle?.())}function re(){if(at===null)return;const G=te;if(at=null,te=null,c.enabled=!0,G!==null)try{n.releasePointerCapture(G)}catch{}Ut.onRelease?.("")}function le(G,F,q,Z){ce=!0;try{s.domElement.dispatchEvent(new PointerEvent("pointerdown",{pointerId:G,pointerType:Z,isPrimary:!0,clientX:F,clientY:q,buttons:1,bubbles:!0,cancelable:!0}))}finally{ce=!1}}function ve(G){if(ce)return;if(be={x:G.clientX,y:G.clientY,t:Date.now()},j.add(G.pointerId),j.size>1){if(at!==null&&te!==null){const q=te,{x:Z,y:pe}=we;re(),le(q,Z,pe,G.pointerType)}return}if(!Ve.length)return;let F=null;for(const q of Ve){const Z=P[q];if(!Z)continue;const pe=fe(Z),ue=Math.hypot(pe.x-G.clientX,pe.y-G.clientY);ue<=se&&(!F||ue<F.d)&&(F={name:q,d:ue})}F&&(G.stopPropagation(),G.preventDefault(),at=F.name,te=G.pointerId,we={x:G.clientX,y:G.clientY},c.enabled=!1,n.setPointerCapture?.(G.pointerId),Ut.onGrab?.(at),Ut.onDragRay?.(at,Ue(G.clientX,G.clientY)))}function ie(G){at===null||G.pointerId!==te||(G.stopPropagation(),Ut.onDragRay?.(at,Ue(G.clientX,G.clientY)))}function ee(G){if(j.delete(G.pointerId),at!==null&&G.pointerId===te){G.stopPropagation();const q=at;at=null,te=null,c.enabled=!0,n.releasePointerCapture?.(G.pointerId),be=null,B=!0,Ut.onRelease?.(q);return}const F=be;be=null,!(!F||j.size>0)&&(Math.hypot(G.clientX-F.x,G.clientY-F.y)>12||Date.now()-F.t>600||I(G.clientX,G.clientY))}n.addEventListener("pointerdown",ve,{capture:!0}),n.addEventListener("pointermove",ie,{capture:!0}),n.addEventListener("pointerup",ee,{capture:!0}),n.addEventListener("pointercancel",ee,{capture:!0}),n.addEventListener("contextmenu",G=>G.preventDefault());function Ae(G){let F=0;for(const q of G)F+=/[\u3000-\u9fff\uff00-\uffef]/.test(q)?1:.6;return Math.max(36,F*13+18)}function Be(){const G=[];for(const pe of Rt){const ue=pe.label.element;if(ue.style.display==="none"||!ue.textContent)continue;pe.label.getWorldPosition(Et);const Je=fe([Et.x,Et.y,Et.z]);G.push({el:ue,x:Je.x,y:Je.y,dx:0,dy:0,w:Ae(ue.textContent??"")})}const F=s.domElement.getBoundingClientRect().width,q=s.domElement.getBoundingClientRect().height,Z=20;for(const pe of G){const ue=pe.w/2+6,Je=Math.min(Math.max(pe.x,ue),Math.max(ue,F-ue)),Xe=Math.min(Math.max(pe.y,Z),Math.max(Z,q-Z));pe.el.style.marginLeft=`${Math.round(Je-pe.x)}px`,pe.el.style.marginTop=`${Math.round(Xe-pe.y)}px`}}const ft=28;function nt(){if(!A)return;const G=s.domElement.getBoundingClientRect().height;if(G<=0)return;const F=a.position.distanceTo(A.center),q=a.fov*Math.PI/180,Z=A.radius/Math.max(F,1e-6)*(G/(2*Math.tan(q/2)))/2;Le.visible=Z>=ft}const An=()=>{c.update(),s.render(o,a),r.render(o,a),nt(),B&&(Be(),B=!1)};c.addEventListener("start",()=>{v=!0}),c.addEventListener("end",()=>{B=!0}),new ResizeObserver(()=>{B=!0}).observe(n),me(mv());const Ut={setScene:me,setReveal:Ye,setHighlight:Me,setAnnotations:St,setPositions:Re,setArrows:ne,setGrid:ae,setGrabbables:G=>{Ve=G},setViewInset:(G,F)=>{const q=Math.max(0,Math.round(G)),Z=Math.max(0,Math.round(F));q===_e&&Z===dt||(_e=q,dt=Z,Se(),v||Ie())},onGrab:null,onDragRay:null,onRelease:null,onFaceToggle:null,setAllFaces(G){if(w.clear(),!G)for(const F of M.keys())w.add(F);L();for(const[F,q]of $.entries()){const Z=!G;q.visible=!Z,Z?C.add(F):C.delete(F)}},allFacesHidden:()=>{const G=M.size>0&&w.size>=M.size,F=$.length>0&&C.size>=$.length;return M.size&&$.length?G&&F:M.size?G:F},isFaceHidden:G=>w.has(G),solidCount:()=>$.length,isSolidHidden:G=>C.has(G),setSolidHidden(G,F){const q=$[G];q&&(q.visible=!F,F?C.add(G):C.delete(G))},skippedSolids:()=>[...Y],solidKinds:()=>T,setFaceHidden(G,F){F?w.add(G):w.delete(G),L(),Ut.onFaceToggle?.()},hasFaces:()=>M.size>0,hasAux:()=>x.size>0||E.size>0,setActive(G){if(e.style.display=G?"block":"none",t.style.display=G?"block":"none",!G){s.setAnimationLoop(null);return}Se(),s.setAnimationLoop(An)}};return Ut}const On=n=>no(ba(n.trim())),_v=["lineLine","linePlane","dihedral"];function vv(n){const e=n.trim();return e==="坐标法"||e==="坐标系"||e==="建系法"||e==="空间直角坐标系"?"坐标系法":e==="向量"||e==="向量法"?"向量法":e==="基底"||e==="基底法"?"基底法":e}function xv(n,e,t){if(!oi(n))throw new yt(`第 ${e+1} 个角不是对象`);const i=Xt(n.kind,`第 ${e+1} 个角的 kind`);if(!_v.includes(i))throw new yt(`第 ${e+1} 个角的类型「${i}」我还不会画`);const s=n.label===void 0?void 0:Xt(n.label,`第 ${e+1} 个角的 label`),r=n.value===void 0?void 0:Xt(n.value,`第 ${e+1} 个角的 value`);let o;if(n.of!==void 0){const c=Xt(n.of,`第 ${e+1} 个角的 of`);if(c!=="degrees"&&c!=="cos"&&c!=="sin")throw new yt(`第 ${e+1} 个角的 of 只能写 degrees、cos 或 sin，收到「${c}」`);o=c}const a=(c,l)=>{const u=tn(c,l).map(h=>t(h,l));if(u.length!==2)throw new yt(`${l} 应该是两个点`);return u};if(i==="lineLine")return{kind:i,p:a(n.p,"直线的两个端点"),q:a(n.q,"直线的两个端点"),label:s,value:r,of:o};if(i==="linePlane"){const c=a(n.line,"直线的两个端点"),l=tn(n.plane,"平面的三个点").map(u=>t(u,"平面"));if(l.length!==3)throw new yt("平面应该是三个点");return{kind:i,line:c,plane:l,label:s,value:r,of:o}}return{kind:"dihedral",edge:a(n.edge,"棱的两个端点"),inA:t(n.inA,"第一个面内的点"),inB:t(n.inB,"第二个面内的点"),label:s,value:r,of:o}}function Mv(n,e){const t=[],i=(s,r)=>{if(!(t.length>64)){if(s===n.length){t.push([...r]);return}for(let o=s+1;o<=n.length;o++){const a=n.slice(s,o);e.has(a)&&(r.push(a),i(o,r),r.pop())}}};return i(0,[]),t}function Sv(n,e,t=[]){const i=_u(n.trim());if(!i)return null;if(e.has(i))return{point:i,edge:null,face:null};for(let s=1;s<i.length;s++){const r=i.slice(0,s),o=i.slice(s);if(e.has(r)&&e.has(o))return{point:null,edge:[r,o],face:null}}for(const s of Mv(i,e)){if(s.length<3)continue;const r=new Set(s),o=t.find(a=>a.length===r.size&&a.every(c=>r.has(c)));if(o)return{point:null,edge:null,face:o}}return null}class yt extends Error{}const oi=n=>typeof n=="object"&&n!==null&&!Array.isArray(n),Xt=(n,e)=>{if(typeof n!="string"||!n.trim())throw new yt(`${e} 应该是一个字符串`);return n.trim()},tn=(n,e)=>{if(!Array.isArray(n))throw new yt(`${e} 应该是一个数组`);return n},Ev={midpoint:2,ratio:2,offset:3,perpFoot:4,projLine:3},yv="辅助线只能画中点、分点、平移、垂足、射影这几种，这一步用了别的画法，我还不会处理。";function sh(n,e){if(!oi(n))throw new yt("解题过程不是一个对象");const t=tn(n.steps,"steps");if(!t.length)throw new yt("解题过程是空的");const i=new Set(e.points.map(f=>f.name)),s=[];for(const[f,m]of t.entries()){if(!oi(m))throw new yt(`第 ${f+1} 步不是一个对象`);const g=On(Xt(m.title,`第 ${f+1} 步的 title`)),_=On(Xt(m.text,`第 ${f+1} 步的 text`)),p=typeof m.why=="string"?On(m.why):"",d=[];for(const C of tn(m.addPoints??[],`第 ${f+1} 步的辅助点`)){if(!oi(C))throw new yt(`第 ${f+1} 步的辅助点写错了`);const T=bt(Xt(C.name,"辅助点的 name"));if(i.has(T))continue;const L=Xt(C.kind,`辅助点 ${T} 的 kind`),b=Ev[L];if(!b)throw new yt(yv);const S=tn(C.of,`辅助点 ${T} 的 of`).map(P=>bt(Xt(P,"辅助点引用的点")));if(S.length!==b)throw new yt(`辅助点 ${T} 的 of 应该有 ${b} 个点`);for(const P of S)if(!i.has(P))throw new yt(`辅助点 ${T} 引用了还不存在的点 ${P}`);L==="midpoint"?d.push({name:T,kind:L,of:S}):L==="projLine"?d.push({name:T,kind:L,of:S}):L==="perpFoot"?d.push({name:T,kind:L,of:S}):L==="offset"?d.push({name:T,kind:L,of:S}):d.push({name:T,kind:"ratio",of:S,t:typeof C.t=="number"?C.t:.5}),i.add(T)}const x=tn(m.addEdges??[],`第 ${f+1} 步的辅助线`).map(C=>{const T=tn(C,`第 ${f+1} 步的辅助线`).map(L=>bt(Xt(L,"线段端点")));if(T.length!==2)throw new yt(`第 ${f+1} 步的辅助线需要两个端点`);for(const L of T)if(!i.has(L))throw new yt(`第 ${f+1} 步的辅助线引用了不存在的点 ${L}`);return T}),E={points:[],edges:[],faces:[]};for(const C of tn(m.uses??[],`第 ${f+1} 步的 uses`)){const T=Sv(Xt(C,"uses 里的元素"),i,e.faces);if(!T)throw new yt(`第 ${f+1} 步用到还不存在的元素 ${String(C)}`);T.point&&E.points.push(T.point),T.edge&&E.edges.push(T.edge),T.face&&E.faces.push(T.face)}const M=typeof m.q=="string"||typeof m.q=="number"?String(m.q):void 0,w=typeof m.via=="string"&&m.via.trim()?vv(On(m.via)):void 0;s.push({title:g,text:_,why:p,addPoints:d,addEdges:x,uses:E,q:M,via:w})}const r=(f,m)=>{const g=bt(Xt(f,m));if(!i.has(g))throw new yt(`${m} 引用了不存在的点 ${g}`);return g},o=tn(n.answers??[],"answers").map((f,m)=>{if(!oi(f))throw new yt(`第 ${m+1} 个答案写错了`);return{label:On(Xt(f.label,"答案的 label")),value:On(Xt(f.value,"答案的 value"))}}),a=tn(n.angles??[],"angles").map((f,m)=>xv(f,m,r)),c=tn(n.lengths??[],"lengths").map((f,m)=>{if(!oi(f))throw new yt(`第 ${m+1} 个长度不是对象`);const g=tn(f.p,`第 ${m+1} 个长度的两个端点`).map(d=>r(d,"长度"));if(g.length!==2)throw new yt(`第 ${m+1} 个长度应该是两个点`);const _=f.label===void 0?void 0:On(Xt(f.label,"长度的 label")),p=f.value===void 0?void 0:Xt(f.value,"长度的 value");return{p:g,label:_,value:p}}),l=tn(n.arrows??[],"arrows").map((f,m)=>{if(!oi(f))throw new yt(`第 ${m+1} 个箭头不是对象`);const g=r(f.from,"箭头的起点"),_=r(f.to,"箭头的终点"),p=f.color==="blue"?"blue":"yellow",d=typeof f.label=="string"?On(f.label):void 0;return{from:g,to:_,label:d,color:p}}),u=tn(n.normals??[],"normals").map((f,m)=>{if(!oi(f))throw new yt(`第 ${m+1} 个法向量不是对象`);const g=tn(f.face,`第 ${m+1} 个法向量的 face`).map(d=>r(d,"法向量的面"));if(g.length<3)throw new yt(`第 ${m+1} 个法向量的面至少要三个点`);const _=f.color==="blue"?"blue":"yellow",p=f.length===void 0?void 0:Number(Xt(f.length,`第 ${m+1} 个法向量的长度`));if(p!==void 0&&!Number.isFinite(p))throw new yt(`第 ${m+1} 个法向量的长度不是数`);return{face:g,at:r(f.at,`第 ${m+1} 个法向量的起点`),length:p,label:typeof f.label=="string"?On(f.label):void 0,color:_}});let h;if(n.frame!==void 0){if(!oi(n.frame))throw new yt("frame 不是一个对象");h={origin:r(n.frame.origin,"坐标系原点"),x:r(n.frame.x,"x 轴上的点"),y:r(n.frame.y,"y 轴上的点"),z:r(n.frame.z,"z 轴上的点"),note:typeof n.frame.note=="string"?On(n.frame.note):void 0}}return{steps:s,answers:o,angles:a,lengths:c,arrows:l,normals:u,frame:h}}function _r(n,e){const t=[...n.points],i=[...n.edges],s=new Set(t.map(r=>r.name));for(const r of e.steps){for(const o of r.addPoints)s.has(o.name)||(t.push(o),s.add(o.name));for(const o of r.addEdges)i.some(a=>a[0]===o[0]&&a[1]===o[1])||i.push(o)}return{...n,points:t,edges:i,faces:n.faces,constraints:n.constraints}}function uu(n,e){const t=new Set(n.points.map(r=>r.name)),i=new Set(n.edges.map(([r,o])=>Kn(r,o))),s=[];for(const r of e.steps){for(const o of r.addPoints)t.add(o.name);for(const o of r.addEdges)i.add(Kn(o[0],o[1]));s.push({points:new Set(t),edges:new Set(i)})}return{afterStep:s}}const V=n=>document.getElementById(n),bv={photo:V("view-photo"),saved:V("view-saved"),pick:V("view-pick"),text:V("view-text"),solution:V("view-solution"),history:V("view-history"),settings:V("view-settings")},Ke=gv(V("app"),V("labels"),V("hint")),ts=L0(localStorage);Ke&&(Ke.onDragRay=Rv,Ke.onFaceToggle=()=>Zn());let zs,Hs,ns,Tt;function ct(n){for(const[e,t]of Object.entries(bv))t.classList.toggle("on",e===n);ci=n==="3d",Ke?.setActive(ci),ch(ci),n==="saved"&&Ov(),n==="3d"&&mo(),Zn()}let ci=!1,Rs=!1;function Av(n){Rs=n,Zn()}function Fc(){Rs=oh().length>0,lr=!1,ur=!0}function Zn(){const n=(Tt?.points??[]).filter(Ao);Ke?.setGrabbables(n.map(s=>s.name)),V("scene-tools").style.display=ci?"flex":"none",V("mode-toggle").textContent=Rs?"完成":"调节",V("footline").style.display=ci?"flex":"none";const e=ci&&Rs&&!!Tt;V("dyn-toggle").style.display=e&&!lr?"block":"none";const t=e&&lr;V("dyn-panel").style.display=t?"flex":"none",t&&ur&&(rh(n),ur=!1),V("player").style.display=ci&&Rs&&ht?"block":"none";const i=Ke?.hasFaces()??!1;V("face-toggle").style.display=ci&&i?"block":"none",V("face-toggle").textContent=Ke?.allFacesHidden()?"面：全关":"面：全开",wo(),pi()}const Tv=["标注","标注：重要","标注：全部"];let qn=0,Ps="degrees",fo=[],tr=[],Rn=[];function Oc(){return qn===0?[]:Rn.filter(n=>qn===2||n.tier===1).map(n=>n.shape)}function hu(n){const e=t=>[...t].sort().join("|");return n.kind==="lineLine"?`ll:${e(n.p)}:${e(n.q)}`:n.kind==="linePlane"?`lp:${e(n.line)}:${e(n.plane)}`:`dh:${e(n.edge)}:${n.inA}:${n.inB}`}function vr(n){fo=n.edges,tr=n.faces}function Bi(){const n=Tt,e=ht,t=rt;Rn=[];const i=[];if(Ke?.setArrows(Eh()),Ke?.setGrid(Zv()),n&&t){const s=Ju(Object.values(t)),r=f=>t[f],o=new Set;v0(Object.values(t));for(const f of e?.angles??[]){const m=tu(f,r,s,Ps);m&&(o.add(hu(f)),m.verified===!1&&i.push(`${f.label??"某个角"}：${m.mismatch??"对不上"}`),Rn.push({shape:nu(m,s),kind:f.kind,tier:1}))}for(const f of e?.lengths??[]){const m=_0(f,r,s*.9);m&&(m.verified===!1&&i.push(`${f.label??f.p.join("")}：${m.mismatch??"对不上"}`),Rn.push({shape:m.shape,kind:"length",tier:1}))}for(const f of e?_r(n,e).points:n.points){if(!(f.name in t))continue;const m=x0(f,r,s*.75);m&&Rn.push({shape:m,kind:"ratio",tier:1})}const a=[],c=V("problem-text").value;for(const f of g0(fo,tr)){const m=hu(f);if(o.has(m))continue;o.add(m);const g=tu(f,r,s,Ps);g&&a.push({shape:nu(g,s),kind:f.kind,score:S0(f,g.degrees,c),named:Zu(f,c),degrees:g.degrees})}a.sort((f,m)=>m.score-f.score);const l=8,u=Rn.filter(f=>f.tier===1).length,h=E0(a,Math.max(0,l-u));a.forEach((f,m)=>{Rn.push({shape:f.shape,kind:f.kind,tier:h.has(m)?1:2})})}Rn.push(...ex(),...Qv()),Ke?.setAnnotations(Oc()),Qs=i,wo()}let Qs=[];function wo(){const n=V("annot-toggle"),e=qn===2?Rn.length:Rn.filter(s=>s.tier===1).length;n.style.display=ci&&Rn.length?"block":"none";const t=Tv[qn]??"标注";n.textContent=qn>0?`${t}(${e})`:t,qn>0&&Qs.length&&(n.textContent+=` · ${Qs.length}项存疑`),n.title=Qs.length?Qs.join(`
`):"点一下切换：关 / 只画本题关键角 / 把图上所有角都画出来";const i=V("unit-toggle");i.style.display=n.style.display,i.textContent=Ps==="degrees"?"°":"rad"}let rt,lr=!1,ur=!0,_c=[];function wv(){for(const n of _c)n.sync()}function rh(n){const e=V("dyn-body");e.innerHTML="",_c=[],Cv(e);const t=i=>{const{get:s,set:r,min:o,max:a,label:c,read:l}=i,u=M=>Math.min(1,Math.max(0,(M-o)/(a-o||1))),h=M=>o+M*(a-o),f=document.createElement("div");f.className="dyn-row";const m=document.createElement("div");m.className="dyn-top";const g=document.createElement("label");g.textContent=c;const _=document.createElement("input");_.type="number",_.inputMode="decimal",_.step="0.1",_.min=String(o),_.max=String(a),m.append(g,_);const p=document.createElement("input");p.type="range",p.min="0",p.max="1",p.step="0.005";const d=document.createElement("div");d.className="dyn-read";const x=M=>{r(Math.min(1,Math.max(0,M))),ah(!0)},E=()=>{const M=s();document.activeElement!==_&&(_.value=String(Number(h(M).toFixed(4)))),document.activeElement!==p&&(p.value=String(M)),d.textContent=l(M)};p.addEventListener("input",()=>{x(Number(p.value)),E()}),p.addEventListener("pointerdown",()=>Bc(f)),_.addEventListener("input",()=>{const M=Number(_.value);!_.value.trim()||!Number.isFinite(M)||(x(u(M)),E())}),_.addEventListener("blur",()=>E()),f.append(m,p,d),e.appendChild(f),_c.push({sync:E}),E()};for(const i of n)if(i.kind==="onSegment"){const s=i.of[0],r=Ma(s,i.of[1]);t({get:()=>i.t,set:o=>{i.t=o},min:0,max:r,label:`${i.name} 在棱 ${i.of.join("")} 上 · 距 ${s} 的长度`,read:o=>`${s}${i.name} = ${(o*r).toFixed(3)}　（占全长的 ${(o*100).toFixed(1)}%）`})}else if(i.kind==="inFace"){const r=i.face.length===4?[i.face[0],i.face[3]]:[i.face[0],i.face[2]],o=[i.face[0],i.face[1]],a=Ma(r[0],r[1]),c=Ma(o[0],o[1]),l=i.face.join("");t({get:()=>i.u,set:u=>{i.u=u},min:0,max:a,label:`${i.name} 在面 ${l} 内 · 距边 ${r.join("")}`,read:u=>`距 ${r.join("")} = ${(u*a).toFixed(3)}　（面内横向 ${(u*100).toFixed(1)}%）`}),t({get:()=>i.v,set:u=>{i.v=u},min:0,max:c,label:`${i.name} 在面 ${l} 内 · 距边 ${o.join("")}`,read:u=>`距 ${o.join("")} = ${(u*c).toFixed(3)}　（面内纵向 ${(u*100).toFixed(1)}%）`})}}function Cv(n){const e=Tt;if(!e)return;const t=r0({points:e.points,edges:fo,faces:tr},l=>Ke?.isFaceHidden(l)??!1),i=l=>{const u=document.createElement("div");u.className="el-sec";const h=document.createElement("div");h.className="el-title",h.textContent=l,u.appendChild(h);const f=document.createElement("div");return f.className="el-chips",u.appendChild(f),n.appendChild(u),f},s=(l,u)=>{const h=[],f=[],m=[];if(l==="points"){h.push(u);for(const[p,d]of fo)(p===u||d===u)&&(f.push(Kn(p,d)),h.push(p,d));for(const p of tr)p.includes(u)&&m.push(cr(p));return{points:h,edges:f,faces:m}}const[g,_]=u.split("|");h.push(g,_),f.push(u);for(const p of tr)p.includes(g)&&p.includes(_)&&m.push(cr(p));return{points:h,edges:f,faces:m}},r=(l,u,h)=>{l.addEventListener("click",()=>{const f=!zt[u].has(h),m=f?s(u,h):null;if(zt[u].delete(h),u==="points"){for(const g of m?.points??[h])zt.points.delete(g);for(const g of m?.edges??[])zt.edges.delete(g);for(const g of m?.faces??[])zt.faces.delete(g)}else{for(const g of m?.points??[])zt.points.delete(g);for(const g of m?.edges??[h])zt.edges.delete(g);for(const g of m?.faces??[])zt.faces.delete(g)}if(f&&m){for(const g of m.points)zt.points.add(g);for(const g of m.edges)zt.edges.add(g);for(const g of m.faces)zt.faces.add(g)}ur=!0,o(),Oi()})};function o(){rh(oh())}if(t.points.length){const l=i(`点（${t.points.length}）`);for(const u of t.points){const h=document.createElement("button");h.className="el-chip",u.moving&&h.classList.add("mov"),zt.points.has(u.key)&&h.classList.add("on"),h.textContent=u.label,h.title=u.moving?"动点，可以直接拖":"点一下在图上高亮",r(h,"points",u.key),l.appendChild(h)}}if(t.edges.length){const l=i(`棱（${t.edges.length}）`);for(const u of t.edges){const h=document.createElement("button");h.className="el-chip",zt.edges.has(u.key)&&h.classList.add("on"),h.textContent=u.label,h.title="点一下在图上高亮",r(h,"edges",u.key),l.appendChild(h)}}if(t.faces.length){const l=i(`面（${t.faces.length}）`);for(const u of t.faces){const h=document.createElement("label");h.className="el-chip face";const f=document.createElement("input");f.type="checkbox",f.checked=!u.hidden,f.addEventListener("change",()=>{Ke?.setFaceHidden(u.key,!f.checked),Zn()});const m=document.createElement("span");m.textContent=u.label,h.append(f,m),l.appendChild(h)}}const a=Ke?.solidKinds()??[];if(a.length){const l=i(`曲面（${a.length}）`),u={sphere:"球",ellipsoid:"椭球",cylinder:"圆柱",cone:"圆锥",frustum:"圆台"};a.forEach((h,f)=>{const m=document.createElement("label");m.className="el-chip face";const g=document.createElement("input");g.type="checkbox",g.checked=!(Ke?.isSolidHidden(f)??!1),g.addEventListener("change",()=>{Ke?.setSolidHidden(f,!g.checked),Zn()});const _=document.createElement("span");_.textContent=`${u[h]??h}（整块）`,m.append(g,_),l.appendChild(m)})}const c=Ke?.skippedSolids()??[];if(c.length){const l=document.createElement("p");l.className="muted",l.textContent=`有 ${c.length} 个曲面因为几何数据退化（轴两端重合、半径为零之类）没能画出来。`,V("dyn-body").appendChild(l)}}function oh(){return(Tt?.points??[]).filter(Ao)}function Ma(n,e){const t=rt?.[n],i=rt?.[e];return!t||!i?1:Math.hypot(t[0]-i[0],t[1]-i[1],t[2]-i[2])||1}function pi(){let n=0;for(const c of["scene-tools","dyn-panel","qsel"]){const l=V(c);if(l.style.display==="none")continue;const u=l.getBoundingClientRect();u.height>0&&(n=Math.max(n,u.bottom+10))}const e=V("qsel");if(e.style.display!=="none"){const c=V("scene-tools").getBoundingClientRect();e.style.top=`${Math.round(c.bottom+6)}px`}const t=[];for(const c of["player","scene-caption","hint","footline"]){const l=V(c);if(l.style.display==="none")continue;const u=l.getBoundingClientRect();u.height>0&&t.push(u.top)}const i=t.length?Math.min(...t):window.innerHeight,s=t.length?Math.max(0,window.innerHeight-i+10):0,r=V("dyn-panel");if(r.style.display==="flex"){const c=r.getBoundingClientRect().top,l=i-c-72;V("dyn-body").style.maxHeight=`${Math.max(140,Math.min(l,window.innerHeight*.6))}px`}const o=V("player"),a=o.style.display==="none"?0:o.getBoundingClientRect().height;V("scene-caption").style.bottom=`${78+a}px`,Ke?.setViewInset(n,s)}let Yr=null;function Bc(n){Yr!==n&&(Yr?.classList.remove("dyn-focus"),Yr=n,Yr?.classList.add("dyn-focus"),V("dyn-panel").classList.toggle("focusing",!!n),pi())}window.addEventListener("pointerup",()=>Bc(null));window.addEventListener("pointercancel",()=>Bc(null));function Rv(n,e){if(!Tt||!rt)return;const t=Tt.points.find(i=>i.name===n);if(t?.kind==="onSegment"){const i=rt[t.of[0]],s=rt[t.of[1]];if(!i||!s)return;const r=kh(i,s,e);if(r===null)return;t.t=r}else if(t?.kind==="inFace"){const i=t.face.map(o=>rt?.[o]).filter(o=>!!o);if(i.length<3)return;const s=Wc(e,i[0],i[1],i[2]);if(!s)return;const r=zh(i,s);if(!r)return;t.u=r.u,t.v=r.v}else if(t?.kind==="onArc"){const i=rt[t.of[0]],s=rt[t.of[1]],r=rt[t.from];if(!i||!s||!r)return;const o=js(s,i),a=Math.hypot(...o);if(a<1e-9)return;const c=[o[0]/a,o[1]/a,o[2]/a],l=js(r,i),u=l[0]*c[0]+l[1]*c[1]+l[2]*c[2],h=js(l,[c[0]*u,c[1]*u,c[2]*u]),f=Math.hypot(...h);if(f<1e-9)return;const m=Wc(e,i,du(i,c),du(i,h));if(!m)return;const g=js(m,i),_=g[0]*c[0]+g[1]*c[1]+g[2]*c[2],p=js(g,[c[0]*_,c[1]*_,c[2]*_]),d=Math.hypot(...p);if(d<1e-9)return;const x=(h[0]*p[0]+h[1]*p[1]+h[2]*p[2])/(f*d);let E=Math.acos(Math.max(-1,Math.min(1,x)))*180/Math.PI;const M=Pv(c,h);M[0]*p[0]+M[1]*p[1]+M[2]*p[2]<0&&(E=-E),t.angle=Math.max(-180,Math.min(180,E))}else return;ah()}function js(n,e){return[n[0]-e[0],n[1]-e[1],n[2]-e[2]]}function du(n,e){return[n[0]+e[0],n[1]+e[1],n[2]+e[2]]}function Pv(n,e){return[n[1]*e[2]-n[2]*e[1],n[2]*e[0]-n[0]*e[2],n[0]*e[1]-n[1]*e[0]]}function ah(n=!1){if(!Tt||!rt)return;const e=Q_(Tt.points,rt),t={};for(const[i,s]of Object.entries(e)){const r=rt[i];(!r||r[0]!==s[0]||r[1]!==s[1]||r[2]!==s[2])&&(t[i]=s,rt[i]=s)}Object.keys(t).length&&Ke?.setPositions(t),qn>0&&Bi(),Ke?.setArrows(Eh()),n||wv()}function ch(n){const e=V("scene-caption"),t=V("problem-text").value.trim().replace(/\s+/g," ");if(!n||!t){e.style.display="none",pi();return}e.style.display="block";const i=t.length>40?`${t.slice(0,40)}…`:t,s=ht?"看解题过程":"改题面";e.textContent=`${i}　▸ ${s}`,pi()}let Sa;function ze(n,e=""){const t=V("status");t.textContent=n,t.className=e,Sa&&clearTimeout(Sa),n&&e!=="err"&&(Sa=window.setTimeout(()=>{t.textContent="",t.className=""},5e3))}const Jn=n=>n instanceof Error?n.message:String(n);async function Dv(n){const e=await createImageBitmap(n,{imageOrientation:"from-image"}),t=(o,a)=>{const c=Math.min(1,o/Math.max(e.width,e.height)),l=Math.max(1,Math.round(e.width*c)),u=Math.max(1,Math.round(e.height*c)),h=document.createElement("canvas");h.width=l,h.height=u;const f=h.getContext("2d");if(!f)throw new Error("这台设备没能处理图片。");return f.drawImage(e,0,0,l,u),h.toDataURL("image/jpeg",a)},i=t(2048,.92),s=t(1280,.85),r=t(360,.6);return e.close(),{full:i,keep:s,thumb:r}}function Lv(n){V("problem-text").value=n.problemText,V("extra").value="",ns=void 0;const e=V("points");if(n.points.length){e.innerHTML="";const i=document.createElement("div");i.className="pt-head",i.textContent=`识别到 ${n.points.length} 个点，请核对有没有漏下标`;const s=document.createElement("div");s.className="pt-list",s.textContent=n.points.join("  ");const r=document.createElement("div");r.className="pt-warn",r.textContent="如果该有下标的点变成了光秃秃的字母（例如应有 A₁ 却只有 A），说明下标没认出来，请在下面改回来。",e.append(i,s,r)}else e.textContent="";const t=V("uncertain");t.innerHTML="",n.uncertain.length&&(t.textContent=`这几处我没把握，你核对一下：${n.uncertain.join("；")}`),ze("识别完成，请核对文字。","ok"),ct("text"),kc()}function kc(n,e){const t=V("problem-text").value.trim();if(t)try{ns=ts.save({id:ns,problemText:t,extra:V("extra").value,thumbnail:zs,image:Hs,scene:n,solution:e}).id}catch{ze("手机上存不下了，去历史里删掉几条旧的再试。","err")}}async function lh(n,e){ze(e?`正在转写第 ${e.label} 题…`:"正在转写题面…"),Lv(await Fh(n,e))}V("nav-photo").onclick=()=>ct("photo");V("nav-3d").onclick=()=>ct("3d");V("nav-history").onclick=()=>{Ro(),ct("history")};const uh="geo3d.balance";function Co(){try{const n=localStorage.getItem(uh);if(!n)return null;const e=JSON.parse(n);if(typeof e.at=="number"&&typeof e.summary=="string"&&Array.isArray(e.lines))return{at:e.at,available:!!e.available,lines:e.lines.map(String),summary:e.summary}}catch{}return null}function zc(n){const e=new Date(n.at).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});return[`${n.available?"✓ 账户可用":"账户当前不可用"}`,...n.lines,`更新于 ${e}`].join(`
`)}function hh(){const n=V("top-balance"),e=Co();n.textContent=e?e.summary:"余额 --",n.style.color=e&&!e.available?"#ff7b72":""}function Iv(n){try{localStorage.setItem(uh,JSON.stringify({...n,at:Date.now()}))}catch{}hh();const e=Co();e&&(V("balance").textContent=zc(e))}async function Hc(n){const e=V("balance");if(!Os()){n||(e.textContent="还没有填 Key。");return}n||(e.textContent="正在查询余额…");try{const t=await Ch();Iv({available:t.available,lines:t.lines,summary:t.summary})}catch(t){const i=Co();i?e.textContent=`${zc(i)}
（这次没刷出来：${Jn(t)}）`:e.textContent=Jn(t)}}V("nav-settings").onclick=()=>{V("api-key").value=Os();const n=Co();V("balance").textContent=n?zc(n):"",ct("settings"),Hc(!0)};V("btn-back").onclick=()=>ct("photo");V("scene-caption").onclick=()=>ct(ht?"solution":"text");V("mode-toggle").onclick=()=>Av(!Rs);V("face-toggle").onclick=()=>{const n=!(Ke?.allFacesHidden()??!1);Ke?.setAllFaces(!n),Zn()};V("annot-toggle").onclick=()=>{qn=(qn+1)%3,Ke?.setAnnotations(Oc()),wo()};V("unit-toggle").onclick=()=>{Ps=Ps==="degrees"?"radians":"degrees",V("unit-toggle").textContent=Ps==="degrees"?"°":"rad",Bi(),Ke?.setAnnotations(Oc()),wo()};V("dyn-toggle").onclick=()=>{lr=!0,ur=!0,Zn()};V("dyn-collapse").onclick=()=>{lr=!1,Zn()};V("show-key").addEventListener("change",n=>{V("api-key").type=n.target.checked?"text":"password"});V("btn-test").onclick=async()=>{Th(V("api-key").value);const n=V("balance");if(!Os()){n.textContent="还没有填 Key。";return}n.textContent="正在连接 DeepSeek…",await Hc(!1)};V("file-camera").addEventListener("change",dh);V("file-album").addEventListener("change",dh);function dh(n){const e=n.target,t=e.files?.[0];e.value="",t&&Uv(t)}async function Uv(n){if(!Os()){ze("还没填 API Key，先在设置里填上。","err"),ct("settings");return}try{ze("正在处理照片…");const{full:e,keep:t,thumb:i}=await Dv(n);zs=i,Hs=t;const s=V("photo-preview");s.innerHTML="";const r=document.createElement("img");r.src=e,s.appendChild(r),ze("正在找照片里有几道题…");const o=await Uh(e);if(o.length<=1){await lh(e,o[0]);return}Fv(e,o),ct("pick")}catch(e){e instanceof Yn?ze(e.message,"err"):ze(`出错了：${Jn(e)}`,"err"),ct("photo")}}async function Nv(n,e){const t=new Image;t.src=n,await t.decode();const[i,s,r,o]=e,a=Math.round(i*t.naturalWidth),c=Math.round(s*t.naturalHeight),l=Math.max(1,Math.round(r*t.naturalWidth)),u=Math.max(1,Math.round(o*t.naturalHeight)),h=document.createElement("canvas");h.width=l,h.height=u;const f=h.getContext("2d");return f?(f.drawImage(t,a,c,l,u,0,0,l,u),h.toDataURL("image/png")):n}function Fv(n,e){const t=V("pick-image");t.innerHTML="";const i=document.createElement("img");i.src=n,t.appendChild(i),i.style.touchAction="none";const s=V("pick-list");s.innerHTML="";for(const r of e){const o=()=>{(async()=>{const d=r.box?await Nv(n,r.box):n;await lh(d,r)})().catch(d=>ze(Jn(d),"err"))},a=document.createElement("button"),c=document.createElement("b");c.textContent=`第 ${r.label} 题`;const l=document.createElement("span");if(l.textContent=r.preview||"（没有取到开头文字）",a.append(c,document.createElement("br"),l),a.onclick=o,s.appendChild(a),!r.box)continue;const u=document.createElement("div");u.className="box";const h=()=>{const[p,d,x,E]=r.box;u.style.cssText=`left:${p*100}%;top:${d*100}%;width:${x*100}%;height:${E*100}%;touch-action:none;cursor:move`};h();const f=document.createElement("b");f.textContent=r.label,u.appendChild(f);const m=p=>{const d=t.getBoundingClientRect();return{fx:(p.clientX-d.left)/Math.max(1,d.width),fy:(p.clientY-d.top)/Math.max(1,d.height)}},g=.06;let _=!1;u.addEventListener("pointerdown",p=>{if(p.target.dataset.h)return;p.preventDefault(),p.stopPropagation();const d=t.getBoundingClientRect(),x=p.clientX,E=p.clientY,[M,w,C,T]=r.box;_=!1,u.setPointerCapture(p.pointerId);const L=S=>{const P=(S.clientX-x)/Math.max(1,d.width),N=(S.clientY-E)/Math.max(1,d.height);(Math.abs(P)>.004||Math.abs(N)>.004)&&(_=!0),r.box=[Math.min(1-C,Math.max(0,M+P)),Math.min(1-T,Math.max(0,w+N)),C,T],h()},b=()=>{u.removeEventListener("pointermove",L),u.removeEventListener("pointerup",b),u.removeEventListener("pointercancel",b)};u.addEventListener("pointermove",L),u.addEventListener("pointerup",b),u.addEventListener("pointercancel",b)});for(const p of["nw","ne","sw","se"]){const d=document.createElement("i");d.dataset.h=p,d.style.cssText="position:absolute;width:44px;height:44px;background:transparent;touch-action:none;"+(p.includes("n")?"top:-22px;":"bottom:-22px;")+(p.includes("w")?"left:-22px;":"right:-22px;")+"cursor:"+(p==="nw"||p==="se"?"nwse-resize":"nesw-resize");const x=document.createElement("span");x.style.cssText="position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#ff9f43;border:2px solid #0f1319",d.appendChild(x),d.addEventListener("pointerdown",E=>{E.preventDefault(),E.stopPropagation();const M=m(E),[w,C,T,L]=r.box;_=!1,d.setPointerCapture(E.pointerId);const b=P=>{const N=m(P),z=N.fx-M.fx,W=N.fy-M.fy;let $=w,Y=C,Q=T,X=L;if(p.includes("w")){const ae=Math.min(w+T-g,Math.max(0,w+z));Q=w+T-ae,$=ae}else Q=Math.min(1-w,Math.max(g,T+z));if(p.includes("n")){const ae=Math.min(C+L-g,Math.max(0,C+W));X=C+L-ae,Y=ae}else X=Math.min(1-C,Math.max(g,L+W));r.box=[$,Y,Q,X],_=!0,h()},S=()=>{d.removeEventListener("pointermove",b),d.removeEventListener("pointerup",S),d.removeEventListener("pointercancel",S)};d.addEventListener("pointermove",b),d.addEventListener("pointerup",S),d.addEventListener("pointercancel",S)}),u.appendChild(d)}u.onclick=()=>{if(_){_=!1;return}o()},t.appendChild(u)}}V("btn-repick").onclick=()=>{ze(""),V("photo-preview").innerHTML="",ct("photo")};function Ks(n="tetra"){const[e,t,i]=n==="cube"?[z0,H0,V0]:n==="fold"?[F0,O0,B0]:n==="t1"?[G0,W0,$0]:n==="t2"?[X0,q0,Y0]:[I0,U0,N0];Vc(),V("problem-text").value=e,V("extra").value="",V("points").textContent="",V("uncertain").textContent="",zs=void 0,Hs=void 0,ns=void 0,Tt=void 0,ht=void 0,bn();try{const s=Ic(t),r=Fi(s.points,s.constraints);if(!r.ok)throw new Error(`示例场景解不出来，最大残差 ${r.maxError.toExponential(2)}`);const o=sh(i,s),a=_r(s,o),c=Fi(a.points,a.constraints);if(!c.ok)throw new Error("加上辅助线后示例图形对不上了");Tt=s,ht=o,rt={...c.points},yn=-1,Kt=-1,vr(a),Ke?.setScene(gr(a,c.points,s)),Fc(),Bi(),Oi(),Io(o),V("btn-generate").textContent="重新解题",ze("已载入内置示例。","ok"),ct("solution")}catch(s){ze(`示例载入失败：${Jn(s)}`,"err")}}function Ov(){const n=ts.list();fu("saved-history",n.map(Bv),"还没有历史记录。拍一道题、或直接打字建一道，就会出现在这里。"),fu("saved-imported",kv(),"还没有导入的题目。")}function fu(n,e,t){const i=V(n);if(i.innerHTML="",!e.length){const s=document.createElement("p");s.className="pick-empty",s.textContent=t,i.appendChild(s);return}for(const s of e){const r=document.createElement("div");r.className="pick-item",r.setAttribute("role","button"),r.tabIndex=0;const o=document.createElement("span");o.className="t",o.textContent=s.title;const a=document.createElement("span");a.className="d",a.textContent=s.desc,r.append(o,a),r.onclick=()=>s.run(),r.onkeydown=c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),s.run())};for(const c of s.actions??[]){const l=document.createElement("button");l.className="pick-act",l.textContent=c.text,l.onclick=u=>{u.stopPropagation(),c.onClick()},r.appendChild(l)}i.appendChild(r)}}function Bv(n){const e=n.scene?n.solution?"题面 · 解题过程 · 3D":"题面 · 3D":"只有文字",t=n.image?`原题图片 · ${e}`:e,i=(n.problemText.split(`
`)[0]??"").trim(),s=i.length>22?`${i.slice(0,22)}…`:i||"（没有题面）",r=new Date(n.savedAt),o=`${r.getMonth()+1}/${r.getDate()} ${String(r.getHours()).padStart(2,"0")}:${String(r.getMinutes()).padStart(2,"0")}`;return{title:s,desc:`${o}　${t}`,run:()=>gh(n),actions:[{text:"导出",onClick:()=>void mh(n)}]}}function kv(){return[{title:"正四棱锥 P-ABCD（走真实建模流程）",desc:"内置测试题：只给题目文字，让模型真的建一遍。要联网、要等几十秒。",run:()=>pu()},{title:"正四面体：三个面上的动点张成一个新平面",desc:"内置示例：不耗接口、秒开。用来看动点拖动与「点驱动面」。",run:()=>Ks("tetra")},{title:"正方体 · 动点 E、F（走真实建模流程）",desc:"内置题目：只有文字，图形与解答让模型现场推。两个问都绕不开动点，用来试三种解题法在拖动时的实时更新。要联网。",run:()=>pu(k0)},{title:"曲面立体：球、椭球、圆柱、圆锥、圆台",desc:"球、椭球、圆柱、圆锥、圆台各一个。看线框画得对不对、位置对不对。",run:()=>Ks("t1")},{title:"每问独有条件：不串问",desc:"三棱锥 R-EFG。看第（1）问的 L 能拖动、第（2）问的 L 被钉在中点。",run:()=>Ks("t2")},{title:"翻折：沿 BC 折起（绕棱旋转的动点）",desc:"内置示例：不耗接口、秒开。D₂ 是绕棱 BC 旋转的点 —— 拖它，它会沿一段圆弧滑动，图形跟着折起来。",run:()=>Ks("fold")},{title:"正方体：四个问，把功能用满的那道",desc:"内置示例：不耗接口、秒开。异面直线角、二面角、线面角、动点距离各一问；辅助点由解答一步步加出来，适合看播放器怎么画线。",run:()=>Ks("cube")}]}function pu(n=th){V("problem-text").value=n,V("extra").value="",V("points").textContent="",V("uncertain").textContent="",zs=void 0,Hs=void 0,ns=void 0,Tt=void 0,ht=void 0,Do="",Lo="",bn(),V("btn-generate").textContent="开始解题",ct("text"),ze("已填入一道测试题。可以直接改，或全选替换成你自己的题目，然后点「开始解题」。")}V("btn-saved").onclick=()=>ct("saved");V("saved-back").onclick=()=>ct("photo");V("btn-type").onclick=()=>{V("problem-text").value=th,V("extra").value="",V("points").textContent="",V("uncertain").textContent="",zs=void 0,Hs=void 0,ns=void 0,Tt=void 0,ht=void 0,Do="",Lo="",bn(),V("btn-generate").textContent="开始解题",ct("text"),ze("已填入一道测试题。可以直接改，或全选替换成你自己的题目，然后点「开始解题」。")};V("btn-regen").onclick=()=>{ze(""),V("photo-preview").innerHTML="",V("btn-generate").textContent="开始解题",ct("photo")};function Ro(){const n=V("history-list");n.innerHTML="";const e=ts.list();if(!e.length){const t=document.createElement("p");t.className="muted",t.textContent="还没有存过题。拍一道题、生成 3D 之后会自动存进来；在文字页点「保存这道题」也能存。",n.appendChild(t);return}for(const t of e){const i=document.createElement("div");if(i.className="hitem",t.thumbnail){const u=document.createElement("img");u.src=t.thumbnail,u.alt="",i.appendChild(u)}else{const u=document.createElement("div");u.className="hph",u.textContent=t.scene?"3D":"文字",i.appendChild(u)}const s=document.createElement("div");s.className="hbody";const r=document.createElement("div");r.className="htitle",r.textContent=t.problemText.replace(/\s+/g," ").slice(0,60)||"（没有题面文字）";const o=document.createElement("div");o.className="hmeta";const a=new Date(t.savedAt).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});o.textContent=`${a}　${t.scene?"有 3D":"只有文字"}`,s.append(r,o),i.appendChild(s);const c=document.createElement("button");c.className="hdel",c.textContent="删除",c.onclick=u=>{u.stopPropagation(),ts.remove(t.id),Ro()},i.appendChild(c);const l=document.createElement("button");l.className="hdel",l.textContent="导出",l.onclick=u=>{u.stopPropagation(),mh(t)},i.appendChild(l),i.onclick=()=>gh(t),n.appendChild(i)}}function vc(n=1600){const e=V("app").querySelector("canvas"),t=V("labels");if(!(e instanceof HTMLCanvasElement))return null;const i=e.getBoundingClientRect(),s=b0(e.width,e.height,n),r=(V("problem-text").value||"").trim().replace(/\s+/g," "),o=Math.max(14,Math.round(s.w*.022)),a=r?zv(r,46):[],c=a.length?a.length*o*1.6+o*1.4:0,l=document.createElement("canvas");l.width=s.w,l.height=s.h+c;const u=l.getContext("2d");if(!u)return null;if(u.fillStyle="#0f1319",u.fillRect(0,0,l.width,l.height),u.drawImage(e,0,0,l.width,s.h),a.length){u.fillStyle="#e6edf3",u.font=`${o}px system-ui, -apple-system, "PingFang SC", sans-serif`,u.textAlign="left",u.textBaseline="top";const m=o*.9;a.forEach((g,_)=>{u.fillText(g,m,s.h+m*.5+_*o*1.6)})}const h=[...t.querySelectorAll("div")].map(m=>{const g=m.getBoundingClientRect(),_=getComputedStyle(m);return{text:m.textContent??"",box:{left:g.left,top:g.top,width:g.width,height:g.height},size:parseFloat(_.fontSize)||14,color:_.color||"#fff",bold:(parseInt(_.fontWeight,10)||400)>=600}}),f=i.width>0?e.width/i.width*(s.w/e.width):1;for(const m of y0(h,i,f))u.font=`${m.bold?"700 ":""}${m.size}px system-ui, -apple-system, "PingFang SC", sans-serif`,u.textAlign="center",u.textBaseline="middle",u.lineWidth=Math.max(2,m.size*.22),u.strokeStyle="rgba(0,0,0,.85)",u.strokeText(m.text,m.x,m.y),u.fillStyle=m.color,u.fillText(m.text,m.x,m.y);return l}function zv(n,e){const t=[];for(let i=0;i<n.length&&t.length<3;i+=e)t.push(n.slice(i,i+e));return t.length===3&&n.length>e*3&&(t[2]=t[2].slice(0,e-1)+"…"),t}function Hv(){const n=vc();if(!n){ze("画布还没准备好，稍等一下再试。","err");return}n.toBlob(e=>{if(!e){ze("存图失败。","err");return}ph(e,`Geo3D_${fh()}.png`)},"image/png")}function fh(){const n=new Date,e=t=>String(t).padStart(2,"0");return`${n.getFullYear()}${e(n.getMonth()+1)}${e(n.getDate())}_${e(n.getHours())}${e(n.getMinutes())}${e(n.getSeconds())}`}async function ph(n,e){try{const s=window.showSaveFilePicker;if(s){const o=await(await s({suggestedName:e})).createWritable();await o.write(n),await o.close(),ze(`已保存：${e}`,"ok");return}}catch(s){if(s instanceof DOMException&&s.name==="AbortError")return}const t=URL.createObjectURL(n),i=document.createElement("a");i.href=t,i.download=e,i.click(),setTimeout(()=>URL.revokeObjectURL(t),1e4),ze(`已导出到「下载」：${e}`,"ok")}function Vv(){if(!ht||!Ii(ht).steps.length){ze("这道题还没有解题过程，没东西可录。先点「开始解题」，或者改用「存图」。","err");return}const n=A0(m=>typeof MediaRecorder<"u"&&MediaRecorder.isTypeSupported(m));if(!n){ze("这个浏览器不支持录制视频，换成「存图」吧。","err");return}const e=vc(900);if(!e){ze("画布还没准备好，稍等一下再试。","err");return}const t=e.captureStream(30),i=new MediaRecorder(t,{mimeType:n.mime,videoBitsPerSecond:4e6}),s=[];i.ondataavailable=m=>{m.data.size&&s.push(m.data)},i.onstop=()=>{bn();const m=new Blob(s,{type:n.mime});ph(m,`Geo3D_${fh()}.${n.ext}`)};const r=900;let o=!0,a=0;const c=1e3/6,l=m=>{if(o){if(m-a>=c){a=m;const g=vc(),_=e.getContext("2d");g&&_&&(_.clearRect(0,0,e.width,e.height),_.drawImage(g,0,0))}requestAnimationFrame(l)}};ze(`开始录制：共 ${Ii(ht).steps.length} 步，一步 0.9 秒…`),i.start(),o=!0,requestAnimationFrame(l);const u=Ii(ht).steps.length;let h=0;const f=()=>{if(h>=u){o=!1,window.setTimeout(()=>i.stop(),400);return}try{Uo(h),h++,ze(`正在录制：第 ${h} / ${u} 步…`)}catch(m){o=!1,ze(`录制中断在第 ${h+1} 步：${Jn(m)}`,"err"),window.setTimeout(()=>i.stop(),400);return}window.setTimeout(f,r)};f()}async function mh(n){const e=w0(n),t=T0(n),i=new Blob([e],{type:"application/json"});try{const o=window.showSaveFilePicker;if(o){const c=await(await o({suggestedName:t,types:[{description:"Geo3D 题目",accept:{"application/json":[".g3d"]}}]})).createWritable();await c.write(i),await c.close(),ze(`已保存：${t}`,"ok");return}}catch(o){if(o instanceof DOMException&&o.name==="AbortError")return}const s=URL.createObjectURL(i),r=document.createElement("a");r.href=s,r.download=t,r.click(),setTimeout(()=>URL.revokeObjectURL(s),1e4),ze(`已导出到「下载」：${t}`,"ok")}function Gv(){const n=document.createElement("input");n.type="file",n.accept=".g3d,application/json",n.onchange=()=>{const e=n.files?.[0];if(!e)return;const t=new FileReader;t.onerror=()=>ze("这个文件读不出来。","err"),t.onload=()=>{try{const i=C0(String(t.result??"")),s=ts.save(i);Ro(),ze(`已导入：${s.problemText.slice(0,20)}…`,"ok")}catch(i){ze(i instanceof Error?i.message:"导入失败","err")}},t.readAsText(e)},n.click()}function gh(n){if(Vc(),V("problem-text").value=n.problemText,V("extra").value=n.extra,V("points").textContent="",V("uncertain").textContent="",ns=n.id,zs=n.thumbnail,Hs=n.image,Tt=void 0,ht=void 0,ze(""),n.scene&&Ke)try{const e=Fi(n.scene.points,n.scene.constraints);if(e.ok){Tt=n.scene;const t=n.solution?_r(n.scene,n.solution):n.scene,i=Fi(t.points,t.constraints),s=i.ok?i.points:e.points;if(rt={...s},vr(t),Ke.setScene(gr(t,s,n.scene)),Fc(),ht=n.solution,Bi(),Zn(),yn=-1,Kt=-1,bn(),V("btn-generate").textContent="重新解题",n.solution){Io(n.solution),ct("solution");return}ct("3d");return}}catch(e){console.warn("[geo3d] 这条存档的场景没能重新解出来",e)}V("btn-generate").textContent="开始解题",ct("text")}V("btn-clear-history").onclick=()=>{ts.list().length&&confirm("确定把存过的题目全部删掉？这个操作没法撤销。")&&(ts.clear(),Ro())};V("btn-import-g3d").onclick=()=>Gv();function Wv(){const n=V("offline-bar"),e=()=>{n.hidden=navigator.onLine};e(),window.addEventListener("online",e),window.addEventListener("offline",e),"serviceWorker"in navigator&&window.isSecureContext&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})})}Wv();const _h=["high","max"];async function $v(n,e){if(Vc(),Tt)return Tt;let t="未知原因";for(const[i,s]of _h.entries())try{ze(`正在把题目变成几何场景（推理档 ${s}）…`),In(8+i*22,`第 ${i+1} 次尝试建模（推理档 ${s}）…`);const r=await Ph(n,e,s);if(r&&typeof r=="object"&&typeof r.unsupported=="string")throw new Error(`模型说这道题有条件表达不了：${r.unsupported}`);const o=Ic(r);ze("正在解算图形…"),In(78,"约束已到手，正在解算坐标…");const a=Fi(o.points,o.constraints);if(!a.ok){const u=[...a.residuals].sort((h,f)=>f.error-h.error).slice(0,3);throw new Error(`解出来的图形不满足这些条件：${u.map(h=>`${h.desc}（实际 ${h.actual}）`).join("；")}`)}In(92,"正在逐条回验约束与共面性…");const c=gr(o,a.points),l=s0(c);if(l.length)throw new Error(`面不对：${l.join("；")}`);return Tt=o,rt={...a.points},Do=Po(),vr(o),Ke?.setScene(c),Fc(),Bi(),Zn(),V("btn-generate").textContent="重新解题",kc(o),o}catch(r){if(r instanceof Yn||r instanceof Ds)throw r;t=Jn(r),console.warn(`[geo3d] 推理档 ${s} 失败：${t}`)}throw new Error(t)}let po=null,xc=0;function Xv(){xc++>0||(po=new AbortController,Mu(po.signal))}function qv(){--xc>0||(xc=0,po=null,Mu(void 0),In(null))}V("progress-cancel").onclick=()=>{po?.abort()};function In(n,e=""){const t=V("progress");if(n===null){t.style.display="none";return}t.style.display="block",V("progress-fill").style.width=`${Math.min(100,Math.max(0,n))}%`,V("progress-text").textContent=e}async function vh(n,e){const t=V("problem-text").value.trim(),i=V("extra").value;if(!t){ze("题目文字是空的。","err");return}if(!Ke){ze("这台设备没法渲染 3D，换一台设备再试。","err");return}n.disabled=!0,Xv(),In(4,"准备开始…");try{await $v(t,i),In(100,"图形已就绪"),ze("图形已建好，这就是本题的立体图。","ok"),ct("3d"),e?await e():setTimeout(()=>In(null),400)}catch(s){if(s instanceof Ds){ze("已取消。");return}ze(`没能建出图形。卡在：${Jn(s)}`,"err"),ct("text")}finally{n.disabled=!1,qv()}}V("btn-generate").onclick=async()=>{const n=V("btn-generate");if(ht&&Lo===Po()){Io(ht),ct("solution");return}await vh(n,async()=>{await xh(n)})};V("btn-shape").onclick=async()=>{if(Tt&&Do===Po()){ct("3d");return}await vh(V("btn-shape"))};function Po(){return`${V("problem-text").value.trim()}\0${V("extra").value.trim()}`}let Do="",Lo="",ht;function Io(n){const e=V("solution-answers");if(e.innerHTML="",n.answers.length)for(const i of n.answers){const s=document.createElement("div");s.className="ans";const r=document.createElement("b");r.textContent=`${i.label} `,s.append(r,document.createTextNode(i.value)),e.appendChild(s)}const t=V("solution-steps");t.innerHTML="",n.steps.forEach((i,s)=>{const r=document.createElement("div");r.className="step";const o=document.createElement("div");o.className="st-head";const a=document.createElement("span");a.className="st-no",a.textContent=`${s+1}.`;const c=document.createElement("span");c.textContent=i.title,o.append(a,c),r.appendChild(o);const l=document.createElement("div");if(l.className="st-text",l.textContent=i.text,r.appendChild(l),i.why){const h=document.createElement("div");h.className="st-why",h.textContent=`依据：${i.why}`,r.appendChild(h)}const u=[i.addPoints.length?`新增点 ${i.addPoints.map(h=>h.name).join("、")}`:"",i.addEdges.length?`新增线 ${i.addEdges.map(h=>h.join("")).join("、")}`:"",i.uses.points.length?`用到点 ${i.uses.points.join("、")}`:"",i.uses.edges.length?`用到线 ${i.uses.edges.map(h=>h.join("")).join("、")}`:""].filter(Boolean);if(u.length){const h=document.createElement("div");h.className="st-draw",h.textContent=u.join("；"),r.appendChild(h)}t.appendChild(r)})}async function xh(n,e){const t=V("problem-text").value.trim(),i=V("extra").value,s=Tt;if(!s)return;n.disabled=!0;let r="未知原因";const o=s.points.map(a=>a.name);try{for(const[a,c]of _h.entries())try{ze(`正在推理解题过程（推理档 ${c}）…`),In(30+a*25,`第 ${a+1} 次尝试推理解题（推理档 ${c}）…`);const l=await Lh(t,i,o,c,e);if(l&&typeof l=="object"&&typeof l.unsupported=="string")throw new Error(`模型说这一步表达不了：${l.unsupported}`);const u=sh(l,s),h=_r(s,u),f=Fi(h.points,h.constraints);if(!f.ok){const m=[...f.residuals].sort((g,_)=>_.error-g.error).slice(0,2);throw new Error(`加上辅助线后图形对不上了：${m.map(g=>g.desc).join("；")}`)}ht=u,Lo=Po(),yn=-1,Kt=-1,bn(),vr(h),Ke?.setScene(gr(h,f.points,s)),Bi(),Io(u),kc(s,u),ze(""),In(100,"解题过程已就绪"),setTimeout(()=>In(null),400),ct("solution");return}catch(l){if(l instanceof Yn||l instanceof Ds)throw l;r=Jn(l),console.warn(`[geo3d] 解题过程 推理档 ${c} 失败：${r}`)}In(null),ze(`三档推理都试过了，解题过程还是没出来。最后一次卡在：${r}`,"err"),ct("text")}catch(a){if(a instanceof Ds){ze("已取消，图形已经建好了。"),ct("3d");return}throw a}finally{n.disabled=!1}}V("btn-solution-3d").onclick=()=>{Uo(-1),ct("3d")};V("btn-solution-back").onclick=()=>ct("text");let yn=-1,to=!1,bs;const zt={points:new Set,edges:new Set,faces:new Set};function Vc(){zt.points.clear(),zt.edges.clear(),zt.faces.clear(),jt="",Zt="",Mc="\0"}function mu(){const n=ht,e=n?Ii(n):null,t=e&&yn>=0?e.steps[yn]:null,i=new Set(zt.points),s=new Set(zt.edges),r=new Set(zt.faces);if(t){for(const o of t.uses.points)i.add(o);for(const[o,a]of t.uses.edges)s.add(Kn(o,a));for(const o of t.uses.faces)r.add(cr(o))}return!i.size&&!s.size&&!r.size?null:{points:i,edges:s,faces:r}}const Ci=24,Yv=60;let Kt=-1,jt="",Zt="";function Ii(n){if(!jt&&!Zt)return n;const e=n.steps.filter(t=>{if(jt&&t.q&&t.q!==jt)return!1;if(Zt){if(t.via!==Zt)return!1}else if(t.via&&(t.q===jt||!jt))return!1;return!0});return e.length?{...n,steps:e}:n}let Ei="";function mo(){const n=V("qsel");n.innerHTML="";const e=ht,t=e?[...new Set(e.steps.map(o=>o.q).filter(o=>!!o))].sort():[],i=e?[...new Set(e.steps.map(o=>o.via).filter(o=>!!o))]:[];if(!t.length&&!i.length&&!Tt){n.style.display="none",Ei="",V("scene-tools").style.visibility="visible";return}n.style.display="flex";const s=(o,a,c,l=!1)=>{const u=document.createElement("div");u.className="qgroup";const h=document.createElement("button");if(h.className=`qhead${Ei===o?" on":""}`,h.textContent=`${Ei===o?"▾":"▸"} ${a}`,h.onclick=()=>{Ei=Ei===o?"":o,mo(),pi()},u.appendChild(h),Ei===o){const f=document.createElement("div");f.className="qopts";for(const m of c){const g=document.createElement("button");g.textContent=m.text,g.className=m.on?"on":"",g.onclick=()=>{m.pick(),Ei="",l?mo():Kv()},f.appendChild(g)}u.appendChild(f)}n.appendChild(u)};if(t.length){const o=jt?jt==="0"?"通识":`第(${jt})问`:"全部问";s("q",`问：${o}`,[{text:"全部问",on:!jt,pick:()=>{jt=""}},...t.map(a=>({text:a==="0"?"通识":`第(${a})问`,on:jt===a,pick:()=>{jt=a}}))])}if(i.length){const o=Zt||i[0];s("via",`解法：${o}`,[...i.map(a=>({text:a,on:o===a,pick:()=>{Zt=a}}))])}Tt&&s("out","导出",[{text:"存图（带题面）",on:!1,pick:()=>Hv()},{text:"录视频（解题动画）",on:!1,pick:()=>Vv()}],!0);const r=V("scene-tools");r.style.visibility=Ei?"hidden":"visible"}function jv(){const n=Tt,e=ht;if(!n||!Ke)return;const t=t0(n,jt),i=Fi(t.points,t.constraints);if(!i.ok){ze(`这一问的图形条件对不上（最大残差 ${i.maxError.toExponential(2)}），仍显示原来的图。`,"err");return}const s=e?_r(t,e):t,r=Fi(s.points,s.constraints),o=r.ok?r.points:i.points;rt={...o},vr(s),Ke.setScene(gr(s,o,t)),Bi(),Oi()}let Mc="\0";function Kv(){Kt=-1,yn=-1,bn(),jt!==Mc&&(Mc=jt,jv()),mo(),Bi(),Oi(),pi();const n=ht;if(Zt&&n&&!n.steps.some(e=>e.via===Zt)){const e=V("btn-generate");ze(`正在用「${Zt}」重算一遍解题过程…`),xh(e,Zt).catch(t=>ze(`重算失败：${Jn(t)}`,"err"))}}function Mh(n,e,t){let i=0;for(const s of e)for(const r of Object.values(t)){const o=[r[0]-n[0],r[1]-n[1],r[2]-n[2]];i=Math.max(i,Math.abs(o[0]*s[0]+o[1]*s[1]+o[2]*s[2]))}return Math.max(1,Math.ceil(i-1e-6))}function Sh(n,e){const t=e[n.origin],i=e[n.x],s=e[n.y],r=e[n.z];if(!t||!i||!s||!r)return n;const o=[i[0]-t[0],i[1]-t[1],i[2]-t[2]],a=[s[0]-t[0],s[1]-t[1],s[2]-t[2]],c=[r[0]-t[0],r[1]-t[1],r[2]-t[2]],l=[o[1]*a[2]-o[2]*a[1],o[2]*a[0]-o[0]*a[2],o[0]*a[1]-o[1]*a[0]];return l[0]*c[0]+l[1]*c[1]+l[2]*c[2]<0?{...n,x:n.y,y:n.x}:n}function Zv(){if(Zt!=="坐标系法")return[];const n=ht?.frame,e=rt;if(!n||!e)return[];const t=Sh(n,e),i=e[t.origin],s=e[t.x],r=e[t.y],o=e[t.z];if(!i||!s||!r||!o)return[];const a=[s[0]-i[0],s[1]-i[1],s[2]-i[2]],c=[r[0]-i[0],r[1]-i[1],r[2]-i[2]],l=[o[0]-i[0],o[1]-i[1],o[2]-i[2]];return i0(i,[a,c,l],Mh(i,[a,c,l],e))}function Eh(){const n=ht;if(!n)return[];const e=()=>{const s=rt;if(!s||!n.normals?.length)return[];const r=Ju(Object.values(s)),o=[];for(const a of n.normals){const c=s[a.at],l=a.face.map(f=>s[f]).filter(f=>!!f);if(!c||l.length<3)continue;const u=a0(l);if(!u)continue;const h=a.length??r*.55;o.push({from:c,to:[c[0]+u[0]*h,c[1]+u[1]*h,c[2]+u[2]*h],color:a.color??"yellow",label:a.label})}return o};if(Zt==="坐标系法"){const s=n.frame;if(!s)return[];const r=rt?Sh(s,rt):s,o=rt,a=o?.[r.origin],c=[[r.x,o?.[r.x]],[r.y,o?.[r.y]],[r.z,o?.[r.z]]];let l=1;if(o&&a){const u=c.map(([,h])=>[(h?.[0]??0)-a[0],(h?.[1]??0)-a[1],(h?.[2]??0)-a[2]]);l=Mh(a,u,o)}return[{from:r.origin,to:r.x,color:"blue",label:"x",extend:l},{from:r.origin,to:r.y,color:"blue",label:"y",extend:l},{from:r.origin,to:r.z,color:"blue",label:"z",extend:l}]}const t=n.arrows??[],i=s=>s.color??"yellow";return Zt==="向量法"?[...t.filter(s=>i(s)==="yellow").map(s=>({from:s.from,to:s.to,color:"yellow"})),...e()]:Zt==="基底法"?t.filter(s=>s.color==="blue").map(s=>({from:s.from,to:s.to,color:"blue"})):[...t.map(s=>({from:s.from,to:s.to,color:i(s)})),...e()]}function gu(n,e,t,i,s){const r=(l,u)=>[l[0]-u[0],l[1]-u[1],l[2]-u[2]],o=(l,u,h)=>l[0]*(u[1]*h[2]-u[2]*h[1])-l[1]*(u[0]*h[2]-u[2]*h[0])+l[2]*(u[0]*h[1]-u[1]*h[0]),a=o(e,t,i);if(Math.abs(a)<1e-9)return null;const c=r(s,n);return[o(c,t,i)/a,o(e,c,i)/a,o(e,t,c)/a]}function Jv(n){const e=Math.round(n*100)/100;return Number.isInteger(e),String(e)}function Qv(){const n=ht;if(Zt!=="基底法"||!n?.arrows||!rt)return[];const e=n.arrows.filter(f=>f.color==="blue"),t=n.arrows.filter(f=>(f.color??"yellow")==="yellow");if(e.length!==3||!t.length)return[];const i=rt,s=i[e[0].from],r=i[e[0].to],o=i[e[1].to],a=i[e[2].to];if(!s||!r||!o||!a)return[];const c=Ea(r,s),l=Ea(o,s),u=Ea(a,s),h=[];for(const f of t){const m=i[f.from],g=i[f.to];if(!m||!g)continue;const _=gu(s,c,l,u,g);if(!_)continue;const p=gu(s,c,l,u,m),d=p?[_[0]-p[0],_[1]-p[1],_[2]-p[2]]:_,x=f.label??`${f.from}${f.to}`,E=[];d.forEach((M,w)=>{if(Math.abs(M)<1e-9)return;const C=e[w].label??`基${w+1}`,T=`${Jv(Math.abs(M))}·${C}`;E.length?E.push(`${M<0?"−":"+"} ${T}`):E.push(M<0?`−${T}`:T)}),E.length||E.push("0"),h.push({shape:{arc:[],extras:[],labelAt:[(m[0]+g[0])/2,(m[1]+g[1])/2,(m[2]+g[2])/2],text:`${x} = ${E.join(" ")}`},kind:"basis",tier:1})}return h}function Ea(n,e){return[n[0]-e[0],n[1]-e[1],n[2]-e[2]]}function ex(){const n=ht,e=n?.frame;if(Zt!=="坐标系法"||!e||!rt)return[];const t=rt[e.origin],i=rt[e.x],s=rt[e.y],r=rt[e.z];if(!t||!i||!s||!r)return[];const o=(x,E)=>[x[0]-E[0],x[1]-E[1],x[2]-E[2]],a=o(i,t),c=o(s,t),l=o(r,t),u=(x,E,M)=>x[0]*(E[1]*M[2]-E[2]*M[1])-x[1]*(E[0]*M[2]-E[2]*M[0])+x[2]*(E[0]*M[1]-E[1]*M[0]),h=u(a,c,l);if(Math.abs(h)<1e-9)return[];const f=x=>{const E=o(x,t),M=u(E,c,l)/h,w=u(a,E,l)/h,C=u(a,c,E)/h;return[M,w,C]},m=qn===2,g=Ii(n),_=new Set;for(const x of g.steps)for(const E of x.uses.points)_.add(E);const p=Object.keys(rt).filter(x=>m||_.has(x)),d=[];for(const x of p){const E=rt[x],M=f(E);if(!M)continue;const w=C=>{const T=Math.round(C*1e3)/1e3;return Number.isInteger(T),String(T)};d.push({shape:{arc:[],extras:[],labelAt:E,text:`${x}(${w(M[0])}, ${w(M[1])}, ${w(M[2])})`},kind:"coord",tier:m?2:1})}return d}function Oi(){const n=Tt,e=ht;if(!n||!e||!Ke)return;const t=Ii(e),i=V("pl-label"),s=V("pl-text"),r=V("pl-range"),o=t.steps.length;if(r.max=String(o*Ci),r.value=String(Kt),Kt<0||o===0){yn=-1;const d=t!==e;if(d){const E=uu(n,t).afterStep[t.steps.length-1];Ke.setReveal(E?{points:E.points,edges:E.edges}:null)}else Ke.setReveal(null);Ke.setHighlight(mu()),i.textContent="全部",s.textContent=d?`当前只看这一组（${t.steps.length} 步）用到的东西。点上面的标签可以换问或换解法。`:"拖滑杆或点「播放」，看辅助线一条条画出来。";return}const a=Math.min(o-1,Math.floor(Kt/Ci)),c=Kt%Ci/Ci;yn=a;const l=uu(n,t),u=l.afterStep[a],h=t.steps[a],f=a>0?l.afterStep[a-1]:null,m=new Set([...u.edges].filter(d=>!f?.edges.has(d))),g=new Set;for(const[d,x]of h.uses.edges){const E=Kn(d,x);m.has(E)&&g.add(E)}Ke.setReveal({points:u.points,edges:u.edges,grow:g.size?{edges:g,t:c}:void 0}),Ke.setHighlight(mu()),i.textContent=`${a+1} / ${o}`;const _=Math.round(c*100),p=c>=.05&&c<=.95;s.textContent=`${a+1}. ${h.title}${p?`　（画到 ${_}%）`:""}`}function Uo(n){const e=ht;if(!e)return;const t=Ii(e).steps.length;Kt=n<0?-1:Math.min(t*Ci-1,n*Ci+Ci-1),Oi(),pi()}function bn(){to=!1,bs!==void 0&&(window.clearTimeout(bs),window.cancelAnimationFrame(bs),bs=void 0),V("pl-play").textContent="▶ 播放"}V("foot-fold").onclick=()=>{const n=document.body.classList.toggle("folded");V("foot-fold").textContent=n?"▼ 展开":"▲ 收起",pi()};V("pl-prev").onclick=()=>{bn(),Uo(yn<=0?-1:yn-1)};V("pl-next").onclick=()=>{bn(),Uo(yn<0?0:yn+1)};V("pl-play").onclick=()=>{const n=ht;if(!n)return;if(to){bn();return}to=!0,V("pl-play").textContent="⏸ 暂停";const e=Ii(n).steps.length*Ci;(Kt<0||Kt>=e)&&(Kt=0);const t=performance.now(),i=Kt,s=()=>{if(!to||!ht)return;const r=performance.now()-t,o=i+Math.floor(r/Yv);if(o>=e){Kt=-1,Oi(),bn();return}Kt=o,Oi(),bs=window.requestAnimationFrame(s)};bs=window.requestAnimationFrame(s)};V("pl-text").onclick=()=>ct("solution");V("pl-range").addEventListener("input",()=>{bn(),Kt=Number(V("pl-range").value),Oi(),pi()});ch(!1);ct("photo");hh();Os()&&Hc(!0);
