import { useState, useEffect, useCallback } from “react”;

// ============================================================
// 🎨 Design Tokens
// ============================================================
const T = {
bg:          “#F5F7F4”,
surface:     “#FFFFFF”,
surfaceAlt:  “#F0F4F1”,
border:      “#E2EAE4”,
borderDark:  “#C5D5C9”,

green:       “#1F6B47”,
greenMid:    “#2E8A5C”,
greenLight:  “#E8F4ED”,
greenGlow:   “#2E8A5C33”,

red:         “#B83232”,
redMid:      “#D44040”,
redLight:    “#FCEAEA”,
redBorder:   “#E8B0B0”,

amber:       “#96620A”,
amberLight:  “#FDF4E3”,
amberBorder: “#E8CFA0”,

blue:        “#1A4FA0”,
blueLight:   “#EAF0FA”,
blueBorder:  “#A0BCE8”,

slate:       “#3A4A40”,
slateMid:    “#5A6E62”,
slateLight:  “#8AA090”,

ink:         “#111A14”,
inkMid:      “#3A4A3E”,
inkDim:      “#7A8E80”,

white:       “#FFFFFF”,
shadow:      “0 2px 12px rgba(20,40,30,0.07)”,
shadowMd:    “0 4px 24px rgba(20,40,30,0.10)”,
shadowLg:    “0 8px 40px rgba(20,40,30,0.14)”,
};

// ============================================================
// 🗄️ Mock Database
// ============================================================
const DB = {
nurseries: {
“nursery-himawari”: {
id: “nursery-himawari”,
name: “ひまわり保育園”,
staffAuthKey: “sk_himawari_x9k2p”,
},
},
children: {
“kid-yuki-001”: {
id: “kid-yuki-001”,
nurseryId: “nursery-himawari”,
name: “山田 ゆき”,
kana: “ヤマダ ゆき”,
age: “5歳”,
birthdate: “2019-03-12”,
bloodType: “A型”,
hasEpipen: true,
photo: null,
allergies: [
{ id: “a1”, name: “ピーナッツ”, severity: “重篤”, action: “エピペン使用・即救急搬送” },
{ id: “a2”, name: “卵”,         severity: “中程度”, action: “抗ヒスタミン剤を投与し経過観察” },
{ id: “a3”, name: “牛乳”,       severity: “軽度”,  action: “症状を観察・大量摂取は避ける” },
],
conditions: [
{ id: “c1”, name: “気管支喘息”,       note: “運動時・季節の変わり目に注意” },
{ id: “c2”, name: “熱性けいれん既往”, note: “38.5℃以上で座薬使用” },
],
medications: [
{ id: “m1”, name: “エピペン 0.15mg”, location: “バッグ内・赤いポーチ”, dosage: “1本を右太ももに注射” },
{ id: “m2”, name: “サルブタモール吸入薬”, location: “赤いポーチ”, dosage: “発作時2吸入” },
{ id: “m3”, name: “ジアゼパム座薬”,  location: “連絡袋内”,  dosage: “38.5℃超えで使用” },
],
emergency: [
{ id: “e1”, label: “母・山田 花子”, phone: “090-1234-5678”, relation: “母” },
{ id: “e2”, label: “父・山田 太郎”, phone: “090-8765-4321”, relation: “父” },
{ id: “e3”, label: “祖母・田中 幸子”, phone: “080-1111-2222”, relation: “祖母” },
],
doctor: { name: “さくら小児科クリニック”, phone: “03-9876-5432”, note: “主治医：田中 誠一 先生”, address: “東京都渋谷区1-2-3” },
},
“kid-riku-002”: {
id: “kid-riku-002”,
nurseryId: “nursery-himawari”,
name: “鈴木 りく”,
kana: “スズキ りく”,
age: “4歳”,
birthdate: “2020-07-25”,
bloodType: “O型”,
hasEpipen: false,
photo: null,
allergies: [
{ id: “a4”, name: “そば”, severity: “重篤”, action: “即救急搬送・エピペンなし” },
],
conditions: [
{ id: “c3”, name: “アトピー性皮膚炎”, note: “保湿剤を毎日塗布” },
],
medications: [
{ id: “m4”, name: “保湿剤（ヒルドイド）”, location: “バッグ内白ポーチ”, dosage: “朝・夕に全身塗布” },
],
emergency: [
{ id: “e4”, label: “母・鈴木 美咲”, phone: “090-2222-3333”, relation: “母” },
{ id: “e5”, label: “父・鈴木 健太”, phone: “090-4444-5555”, relation: “父” },
],
doctor: { name: “みなみ皮膚科”, phone: “03-1111-2222”, note: “担当：佐藤先生”, address: “東京都目黒区4-5-6” },
},
},
};

// 認証キー確認
function verifyStaffKey(nurseryId, key) {
const nursery = DB.nurseries[nurseryId];
return nursery && nursery.staffAuthKey === key;
}

// ============================================================
// 🎨 Shared UI Components
// ============================================================
const SEV_STYLE = {
“重篤”:  { bg: T.redLight,   color: T.red,   border: T.redBorder,   dot: T.red },
“中程度”: { bg: T.amberLight, color: T.amber, border: T.amberBorder, dot: T.amber },
“軽度”:  { bg: T.greenLight, color: T.green, border: T.borderDark,  dot: T.greenMid },
};

function SevBadge({ level }) {
const s = SEV_STYLE[level] || SEV_STYLE[“軽度”];
return (
<span style={{ display:“inline-flex”, alignItems:“center”, gap:5, fontSize:11, fontWeight:700,
padding:“3px 9px”, borderRadius:999, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
<span style={{ width:6, height:6, borderRadius:“50%”, background:s.dot, display:“inline-block” }} />
{level}
</span>
);
}

function Card({ children, style={} }) {
return <div style={{ background:T.surface, borderRadius:16, border:`1px solid ${T.border}`, boxShadow:T.shadow, overflow:“hidden”, …style }}>{children}</div>;
}

function CardHeader({ icon, title, color=T.green }) {
return (
<div style={{ padding:“11px 16px”, background:color+“0F”, borderBottom:`1px solid ${color}22`,
display:“flex”, alignItems:“center”, gap:8 }}>
<span style={{ fontSize:15 }}>{icon}</span>
<span style={{ fontSize:11, fontWeight:800, color, letterSpacing:“0.12em”, textTransform:“uppercase” }}>{title}</span>
</div>
);
}

function Row({ children, last=false }) {
return <div style={{ padding:“13px 16px”, borderBottom: last?“none”:`1px solid ${T.border}` }}>{children}</div>;
}

function Btn({ children, onClick, variant=“primary”, style={}, disabled=false }) {
const base = { padding:“13px 20px”, borderRadius:13, border:“none”, fontWeight:700,
fontSize:14, cursor: disabled?“not-allowed”:“pointer”, transition:“all 0.15s ease”,
fontFamily:“inherit”, display:“inline-flex”, alignItems:“center”, justifyContent:“center”, gap:8 };
const variants = {
primary:   { background:T.green,     color:T.white,   boxShadow:`0 3px 16px ${T.greenGlow}` },
secondary: { background:T.surface,   color:T.inkMid,  border:`1.5px solid ${T.border}`, boxShadow:T.shadow },
danger:    { background:T.redLight,  color:T.red,     border:`1.5px solid ${T.redBorder}` },
ghost:     { background:“transparent”, color:T.inkDim, border:“none” },
};
return <button onClick={onClick} disabled={disabled} style={{ …base, …variants[variant], opacity:disabled?0.5:1, …style }}>{children}</button>;
}

function Input({ label, value, onChange, type=“text”, placeholder=”” }) {
return (
<div style={{ marginBottom:12 }}>
{label && <label style={{ display:“block”, fontSize:11, fontWeight:800, color:T.inkDim,
letterSpacing:“0.1em”, textTransform:“uppercase”, marginBottom:5 }}>{label}</label>}
<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
style={{ width:“100%”, padding:“10px 14px”, borderRadius:10, border:`1.5px solid ${T.border}`,
fontSize:14, color:T.ink, background:T.surface, outline:“none”, fontFamily:“inherit”,
boxSizing:“border-box” }} />
</div>
);
}

function Tag({ children, color=T.green }) {
return <span style={{ fontSize:11, padding:“3px 9px”, borderRadius:999, background:color+“18”,
color, border:`1px solid ${color}33`, fontWeight:700 }}>{children}</span>;
}

function TopBar({ title, sub, onBack, right }) {
return (
<div style={{ position:“sticky”, top:0, zIndex:50, background:T.surface,
borderBottom:`1px solid ${T.border}`, padding:“14px 16px”,
display:“flex”, alignItems:“center”, gap:12, boxShadow:T.shadow }}>
{onBack && (
<button onClick={onBack} style={{ width:36, height:36, borderRadius:10, border:`1px solid ${T.border}`,
background:T.bg, display:“flex”, alignItems:“center”, justifyContent:“center”,
cursor:“pointer”, flexShrink:0, fontSize:16 }}>←</button>
)}
<div style={{ flex:1, minWidth:0 }}>
<div style={{ fontSize:16, fontWeight:800, color:T.ink, whiteSpace:“nowrap”, overflow:“hidden”, textOverflow:“ellipsis” }}>{title}</div>
{sub && <div style={{ fontSize:11, color:T.inkDim, marginTop:1 }}>{sub}</div>}
</div>
{right}
</div>
);
}

// NFC波形アニメーション
function NFCWave({ color=T.green }) {
return (
<div style={{ position:“relative”, width:80, height:80 }}>
<style>{`@keyframes nfc-ring { 0%{transform:scale(.7);opacity:.9} 100%{transform:scale(2);opacity:0} }`}</style>
{[0,1,2].map(i=>(
<div key={i} style={{ position:“absolute”, inset:0, borderRadius:“50%”,
border:`2px solid ${color}`, animation:`nfc-ring 1.8s ease-out ${i*.5}s infinite` }} />
))}
<div style={{ position:“absolute”, inset:10, borderRadius:“50%”, background:color+“20”,
border:`2px solid ${color}`, display:“flex”, alignItems:“center”, justifyContent:“center”, fontSize:26 }}>
🏷️
</div>
</div>
);
}

// ============================================================
// 📱 SCREEN: Kid Info  /kid/{id}
// ============================================================
function KidInfoScreen({ childId, onStaffAuth, onParentLogin }) {
const [staffAuthed, setStaffAuthed] = useState(false);
const [showStaffModal, setShowStaffModal] = useState(false);
const [nfcScanning, setNfcScanning] = useState(false);
const [nfcResult, setNfcResult] = useState(null); // “success”|“fail”

const child = DB.children[childId];
if (!child) return <div style={{ padding:40, textAlign:“center”, color:T.inkDim }}>園児情報が見つかりません</div>;

const nursery = DB.nurseries[child.nurseryId];

// 保育士NFCタップシミュレーション
function simulateStaffNFC(success) {
setNfcScanning(true);
setNfcResult(null);
setTimeout(() => {
setNfcScanning(false);
if (success) {
setNfcResult(“success”);
setTimeout(() => {
setStaffAuthed(true);
setShowStaffModal(false);
setNfcResult(null);
}, 800);
} else {
setNfcResult(“fail”);
}
}, 1800);
}

return (
<div style={{ minHeight:“100vh”, background:T.bg }}>
<style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes pop{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>

```
  <TopBar
    title={child.name}
    sub={nursery.name}
    right={
      <Tag color={staffAuthed ? T.green : T.inkDim}>
        {staffAuthed ? "👩‍🏫 保育士認証済" : "👤 閲覧モード"}
      </Tag>
    }
  />

  <div style={{ padding:"16px 16px 40px" }}>

    {/* プロフィールカード */}
    <div style={{ background:T.surface, borderRadius:20, padding:20, boxShadow:T.shadowMd,
      border:`1px solid ${T.border}`, marginBottom:16, animation:"fadeUp .3s ease",
      display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ width:60, height:60, borderRadius:18, background:T.greenLight,
        border:`2px solid ${T.borderDark}`, display:"flex", alignItems:"center",
        justifyContent:"center", fontSize:30, flexShrink:0 }}>👧</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:22, fontWeight:800, color:T.ink, lineHeight:1.2 }}>{child.name}</div>
        <div style={{ fontSize:12, color:T.inkDim, marginTop:3 }}>{child.kana}</div>
        <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
          <Tag>{child.age}</Tag>
          <Tag color={T.blue}>血液型 {child.bloodType}</Tag>
          {child.hasEpipen && <Tag color={T.red}>エピペン所持</Tag>}
        </div>
      </div>
    </div>

    {/* ── LEVEL 1: 誰でも見える ── */}
    <div style={{ fontSize:10, fontWeight:800, color:T.inkDim, letterSpacing:".15em",
      textTransform:"uppercase", marginBottom:10, marginTop:4 }}>
      🔓 緊急時情報（認証不要）
    </div>

    {/* アレルギー */}
    <div style={{ animation:"fadeUp .35s ease", marginBottom:12 }}>
      <Card>
        <CardHeader icon="⚠️" title="アレルギー情報" color={T.red} />
        {child.allergies.map((a, i) => (
          <Row key={a.id} last={i===child.allergies.length-1}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
              <span style={{ fontSize:15, fontWeight:800, color:T.ink }}>{a.name}</span>
              <SevBadge level={a.severity} />
            </div>
            <div style={{ fontSize:12, color:T.slateMid, lineHeight:1.5 }}>{a.action}</div>
          </Row>
        ))}
      </Card>
    </div>

    {/* 持病・既往歴 */}
    <div style={{ animation:"fadeUp .4s ease", marginBottom:12 }}>
      <Card>
        <CardHeader icon="🫀" title="持病・既往歴" color={T.blue} />
        {child.conditions.map((c, i) => (
          <Row key={c.id} last={i===child.conditions.length-1}>
            <div style={{ fontSize:14, fontWeight:700, color:T.ink, marginBottom:2 }}>{c.name}</div>
            <div style={{ fontSize:12, color:T.slateMid }}>{c.note}</div>
          </Row>
        ))}
      </Card>
    </div>

    {/* エピペン */}
    <div style={{ animation:"fadeUp .43s ease", marginBottom:20 }}>
      <Card>
        <CardHeader icon="💉" title="エピペン" color={child.hasEpipen ? T.red : T.inkDim} />
        <Row last>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              fontWeight:800, fontSize:14, padding:"8px 16px", borderRadius:12,
              background: child.hasEpipen ? T.redLight : T.surfaceAlt,
              color: child.hasEpipen ? T.red : T.inkDim,
              border: `1.5px solid ${child.hasEpipen ? T.redBorder : T.border}`,
            }}>
              {child.hasEpipen ? "✓ 所持あり" : "所持なし"}
            </div>
            {!staffAuthed && child.hasEpipen && (
              <div style={{ fontSize:11, color:T.inkDim }}>
                保管場所は認証後に表示
              </div>
            )}
          </div>
        </Row>
      </Card>
    </div>

    {/* ── LEVEL 2: 保育士のみ ── */}
    {!staffAuthed ? (
      <div style={{ animation:"fadeUp .5s ease" }}>
        <div style={{ background:T.surface, borderRadius:20, border:`1.5px dashed ${T.borderDark}`,
          padding:24, textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:24, marginBottom:12 }}>🔐</div>
          <div style={{ fontSize:15, fontWeight:800, color:T.ink, marginBottom:6 }}>詳細情報を表示</div>
          <div style={{ fontSize:12, color:T.inkDim, marginBottom:20, lineHeight:1.6 }}>
            保護者連絡先・薬の詳細・保管場所は<br />保育士認証が必要です
          </div>
          <Btn onClick={()=>setShowStaffModal(true)} style={{ width:"100%" }}>
            🏷️ 保育士タグで認証する
          </Btn>
        </div>
        <Btn variant="secondary" onClick={onParentLogin} style={{ width:"100%" }}>
          👨‍👩‍👧 保護者としてログイン
        </Btn>
      </div>
    ) : (
      <>
        {/* ── 認証後コンテンツ ── */}
        <div style={{ fontSize:10, fontWeight:800, color:T.green, letterSpacing:".15em",
          textTransform:"uppercase", marginBottom:10 }}>
          🔐 詳細情報（保育士認証済）
        </div>

        {/* 持薬詳細 */}
        <div style={{ animation:"fadeUp .3s ease", marginBottom:12 }}>
          <Card>
            <CardHeader icon="💊" title="持薬・医療器具（詳細）" color={T.amber} />
            {child.medications.map((m, i) => (
              <Row key={m.id} last={i===child.medications.length-1}>
                <div style={{ fontSize:14, fontWeight:700, color:T.ink, marginBottom:4 }}>{m.name}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:T.green, background:T.greenLight,
                    padding:"2px 8px", borderRadius:6, border:`1px solid ${T.borderDark}` }}>
                    📍 {m.location}
                  </span>
                  <span style={{ fontSize:11, color:T.slateMid }}>{m.dosage}</span>
                </div>
              </Row>
            ))}
          </Card>
        </div>

        {/* 緊急連絡先 */}
        <div style={{ animation:"fadeUp .35s ease", marginBottom:12 }}>
          <Card>
            <CardHeader icon="📞" title="緊急連絡先" color={T.green} />
            {child.emergency.map((e, i) => (
              <Row key={e.id} last={i===child.emergency.length-1}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:T.ink }}>{e.label}</div>
                    <div style={{ fontSize:11, color:T.inkDim, marginTop:1 }}>{e.relation}</div>
                  </div>
                  <a href={`tel:${e.phone.replace(/-/g,"")}`}
                    style={{ fontSize:13, fontWeight:700, color:T.green, background:T.greenLight,
                      border:`1px solid ${T.borderDark}`, borderRadius:10, padding:"7px 13px",
                      textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>
                    📞 {e.phone}
                  </a>
                </div>
              </Row>
            ))}
          </Card>
        </div>

        {/* かかりつけ医 */}
        <div style={{ animation:"fadeUp .4s ease", marginBottom:12 }}>
          <Card>
            <CardHeader icon="🏥" title="かかりつけ医" color={T.blue} />
            <Row last>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:T.ink }}>{child.doctor.name}</div>
                  <div style={{ fontSize:11, color:T.inkDim, marginTop:2 }}>{child.doctor.note}</div>
                  <div style={{ fontSize:11, color:T.inkDim }}>{child.doctor.address}</div>
                </div>
                <a href={`tel:${child.doctor.phone.replace(/-/g,"")}`}
                  style={{ fontSize:13, fontWeight:700, color:T.blue, background:T.blueLight,
                    border:`1px solid ${T.blueBorder}`, borderRadius:10, padding:"7px 13px",
                    textDecoration:"none" }}>
                  📞 {child.doctor.phone}
                </a>
              </div>
            </Row>
          </Card>
        </div>

        {/* 生年月日（認証後のみ） */}
        <div style={{ animation:"fadeUp .43s ease", marginBottom:20 }}>
          <Card>
            <CardHeader icon="🎂" title="生年月日" color={T.slate} />
            <Row last>
              <span style={{ fontSize:14, fontWeight:700, color:T.ink }}>{child.birthdate}</span>
            </Row>
          </Card>
        </div>

        <Btn variant="secondary" onClick={onParentLogin} style={{ width:"100%" }}>
          👨‍👩‍👧 保護者としてログイン（情報編集）
        </Btn>
      </>
    )}
  </div>

  {/* ── 保育士NFC認証モーダル ── */}
  {showStaffModal && (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,20,15,.7)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}>
      <div style={{ background:T.surface, borderRadius:"24px 24px 0 0", padding:"32px 24px 48px",
        width:"100%", maxWidth:480, animation:"pop .25s ease", boxShadow:T.shadowLg }}>

        {nfcResult === "success" ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:18, fontWeight:800, color:T.green }}>認証成功</div>
          </div>
        ) : nfcResult === "fail" ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>❌</div>
            <div style={{ fontSize:16, fontWeight:800, color:T.red, marginBottom:8 }}>認証失敗</div>
            <div style={{ fontSize:13, color:T.inkDim, marginBottom:20 }}>このタグは登録されていません</div>
            <Btn onClick={()=>{setNfcResult(null);setNfcScanning(false);}} style={{ width:"100%" }}>
              再試行
            </Btn>
          </div>
        ) : nfcScanning ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <NFCWave color={T.green} />
            <div style={{ fontSize:14, color:T.inkMid, marginTop:24, fontWeight:600 }}>
              保育士タグを読み取っています…
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ fontSize:13, fontWeight:800, color:T.green, letterSpacing:".1em",
                textTransform:"uppercase", marginBottom:12 }}>保育士NFCタグ認証</div>
              <div style={{ fontSize:15, color:T.inkMid, lineHeight:1.7 }}>
                保育士用NFCタグを<br />スマートフォンにかざしてください
              </div>
            </div>
            <NFCWave color={T.green} />

            {/* デモ用ボタン */}
            <div style={{ marginTop:32 }}>
              <div style={{ fontSize:11, color:T.inkDim, textAlign:"center", marginBottom:10 }}>
                ── デモ用シミュレーション ──
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={()=>simulateStaffNFC(true)} style={{ flex:1 }}>✅ 正規タグ</Btn>
                <Btn variant="danger" onClick={()=>simulateStaffNFC(false)} style={{ flex:1 }}>❌ 不正タグ</Btn>
              </div>
            </div>
            <Btn variant="ghost" onClick={()=>setShowStaffModal(false)} style={{ width:"100%", marginTop:12 }}>
              キャンセル
            </Btn>
          </>
        )}
      </div>
    </div>
  )}
</div>
```

);
}

// ============================================================
// 📱 SCREEN: Parent Login
// ============================================================
function ParentLoginScreen({ onLogin, onBack }) {
const [loading, setLoading] = useState(false);

function handleGoogleLogin() {
setLoading(true);
setTimeout(() => { onLogin(); setLoading(false); }, 1400);
}

return (
<div style={{ minHeight:“100vh”, background:T.bg }}>
<TopBar title="保護者ログイン" onBack={onBack} />
<div style={{ padding:“60px 24px 40px”, display:“flex”, flexDirection:“column”, alignItems:“center” }}>
<div style={{ width:80, height:80, borderRadius:24, background:T.greenLight,
border:`2px solid ${T.borderDark}`, display:“flex”, alignItems:“center”,
justifyContent:“center”, fontSize:38, marginBottom:24 }}>👨‍👩‍👧</div>
<div style={{ fontSize:22, fontWeight:800, color:T.ink, marginBottom:8, textAlign:“center” }}>
保護者としてログイン
</div>
<div style={{ fontSize:13, color:T.inkDim, textAlign:“center”, lineHeight:1.8, marginBottom:48 }}>
Googleアカウントでログインして<br />お子様の医療情報を管理できます
</div>

```
    <Btn onClick={handleGoogleLogin} disabled={loading} style={{ width:"100%", maxWidth:320, fontSize:15 }}>
      {loading ? (
        <>⟳ ログイン中…</>
      ) : (
        <><span style={{ fontSize:18 }}>G</span> Googleでログイン</>
      )}
    </Btn>

    <div style={{ marginTop:40, fontSize:12, color:T.inkDim, textAlign:"center", lineHeight:1.8 }}>
      🔒 情報はFirebase / Supabaseで安全に管理されます<br />
      HTTPS通信・園単位のアクセス制御
    </div>
  </div>
</div>
```

);
}

// ============================================================
// 📱 SCREEN: Parent Edit
// ============================================================
function ParentEditScreen({ childId, onBack, onSave }) {
const original = DB.children[childId];
const [data, setData] = useState(JSON.parse(JSON.stringify(original)));
const [tab, setTab] = useState(“basic”);
const [saved, setSaved] = useState(false);

function save() {
DB.children[childId] = { …data };
setSaved(true);
setTimeout(() => { setSaved(false); onSave(data); }, 1500);
}

const s = { // input style
width:“100%”, padding:“10px 14px”, borderRadius:10, border:`1.5px solid ${T.border}`,
fontSize:14, color:T.ink, background:T.surface, outline:“none”, fontFamily:“inherit”, boxSizing:“border-box”
};
const labelS = { display:“block”, fontSize:11, fontWeight:800, color:T.inkDim,
letterSpacing:”.1em”, textTransform:“uppercase”, marginBottom:5 };
const cardS = { background:T.surface, borderRadius:14, padding:16, marginBottom:12,
boxShadow:T.shadow, border:`1px solid ${T.border}` };
const addS = { width:“100%”, padding:11, borderRadius:12, border:`2px dashed ${T.borderDark}`,
background:“none”, color:T.inkDim, fontSize:13, cursor:“pointer”, marginBottom:8, fontFamily:“inherit” };
const delS = { background:T.redLight, border:`1px solid ${T.redBorder}`, borderRadius:8,
padding:“4px 10px”, fontSize:11, color:T.red, cursor:“pointer”, fontWeight:700, fontFamily:“inherit” };

const TABS = [
{ id:“basic”,    label:“基本情報”, icon:“👧” },
{ id:“allergy”,  label:“アレルギー”, icon:“⚠️” },
{ id:“medical”,  label:“持病・薬”, icon:“💊” },
{ id:“contact”,  label:“連絡先”, icon:“📞” },
];

function upAllergy(i, k, v) { const a=[…data.allergies]; a[i]={…a[i],[k]:v}; setData({…data,allergies:a}); }
function upMed(i, k, v)     { const m=[…data.medications]; m[i]={…m[i],[k]:v}; setData({…data,medications:m}); }
function upEm(i, k, v)      { const e=[…data.emergency]; e[i]={…e[i],[k]:v}; setData({…data,emergency:e}); }
function upCond(i, v)       { const c=[…data.conditions]; c[i]={…c[i],name:v}; setData({…data,conditions:c}); }

return (
<div style={{ minHeight:“100vh”, background:T.bg, paddingBottom:100 }}>
<TopBar title=“情報を編集” sub=“保護者専用” onBack={onBack}
right={<Tag color={T.green}>✅ 認証済</Tag>} />

```
  {/* タブ */}
  <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`,
    padding:"10px 16px", display:"flex", gap:6, overflowX:"auto" }}>
    {TABS.map(t => (
      <button key={t.id} onClick={()=>setTab(t.id)} style={{
        flexShrink:0, padding:"8px 14px", borderRadius:10, border:"none",
        background: tab===t.id ? T.green : T.surfaceAlt,
        color: tab===t.id ? T.white : T.inkMid,
        fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
        boxShadow: tab===t.id ? `0 2px 12px ${T.greenGlow}` : "none",
        transition:"all .15s ease"
      }}>{t.icon} {t.label}</button>
    ))}
  </div>

  <div style={{ padding:"16px 16px 24px" }}>
    <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} select{font-family:inherit}`}</style>

    {/* 基本情報 */}
    {tab==="basic" && (
      <div style={{ animation:"fadeUp .3s ease" }}>
        <div style={cardS}>
          <div style={{ marginBottom:12 }}>
            <label style={labelS}>名前</label>
            <input value={data.name} onChange={e=>setData({...data,name:e.target.value})} style={s} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={labelS}>よみがな</label>
            <input value={data.kana} onChange={e=>setData({...data,kana:e.target.value})} style={s} />
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}>
              <label style={labelS}>年齢</label>
              <input value={data.age} onChange={e=>setData({...data,age:e.target.value})} style={s} />
            </div>
            <div style={{ flex:1 }}>
              <label style={labelS}>血液型</label>
              <select value={data.bloodType} onChange={e=>setData({...data,bloodType:e.target.value})} style={{...s}}>
                {["A型","B型","O型","AB型","不明"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={labelS}>生年月日</label>
            <input type="date" value={data.birthdate} onChange={e=>setData({...data,birthdate:e.target.value})} style={s} />
          </div>
          <div>
            <label style={labelS}>エピペン所持</label>
            <div style={{ display:"flex", gap:8 }}>
              {[true,false].map(v=>(
                <button key={String(v)} onClick={()=>setData({...data,hasEpipen:v})} style={{
                  flex:1, padding:11, borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                  border:`2px solid ${data.hasEpipen===v ? (v?T.red:T.green) : T.border}`,
                  background: data.hasEpipen===v ? (v?T.redLight:T.greenLight) : T.surface,
                  color: data.hasEpipen===v ? (v?T.red:T.green) : T.inkDim,
                  fontWeight:700, fontSize:13,
                }}>{v?"✓ あり":"なし"}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* アレルギー */}
    {tab==="allergy" && (
      <div style={{ animation:"fadeUp .3s ease" }}>
        {data.allergies.map((a,i)=>(
          <div key={i} style={{ ...cardS, borderLeft:`4px solid ${SEV_STYLE[a.severity]?.color||T.green}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:800, color:T.inkDim }}>アレルゲン {i+1}</span>
              <button onClick={()=>setData({...data,allergies:data.allergies.filter((_,j)=>j!==i)})} style={delS}>削除</button>
            </div>
            <div style={{ display:"flex", gap:10, marginBottom:10 }}>
              <div style={{ flex:1 }}>
                <label style={labelS}>アレルゲン名</label>
                <input value={a.name} onChange={e=>upAllergy(i,"name",e.target.value)} style={s} placeholder="例：ピーナッツ" />
              </div>
              <div style={{ width:90 }}>
                <label style={labelS}>重症度</label>
                <select value={a.severity} onChange={e=>upAllergy(i,"severity",e.target.value)} style={{...s,padding:"10px 8px"}}>
                  {["重篤","中程度","軽度"].map(sv=><option key={sv}>{sv}</option>)}
                </select>
              </div>
            </div>
            <label style={labelS}>対応方法</label>
            <input value={a.action} onChange={e=>upAllergy(i,"action",e.target.value)} style={s} placeholder="例：エピペン使用・救急へ" />
          </div>
        ))}
        <button onClick={()=>setData({...data,allergies:[...data.allergies,{id:`a${Date.now()}`,name:"",severity:"軽度",action:""}]})} style={addS}>＋ アレルゲンを追加</button>
      </div>
    )}

    {/* 持病・薬 */}
    {tab==="medical" && (
      <div style={{ animation:"fadeUp .3s ease" }}>
        <div style={{ fontSize:11, fontWeight:800, color:T.inkDim, letterSpacing:".1em", marginBottom:10 }}>🫀 持病・既往歴</div>
        {data.conditions.map((c,i)=>(
          <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
            <input value={c.name} onChange={e=>upCond(i,e.target.value)} style={{...s,flex:1}} placeholder="例：熱性けいれん" />
            <button onClick={()=>setData({...data,conditions:data.conditions.filter((_,j)=>j!==i)})} style={delS}>削除</button>
          </div>
        ))}
        <button onClick={()=>setData({...data,conditions:[...data.conditions,{id:`c${Date.now()}`,name:"",note:""}]})} style={addS}>＋ 持病・既往歴を追加</button>

        <div style={{ fontSize:11, fontWeight:800, color:T.inkDim, letterSpacing:".1em", margin:"20px 0 10px" }}>💊 持薬・医療器具</div>
        {data.medications.map((m,i)=>(
          <div key={i} style={cardS}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:800, color:T.inkDim }}>持薬 {i+1}</span>
              <button onClick={()=>setData({...data,medications:data.medications.filter((_,j)=>j!==i)})} style={delS}>削除</button>
            </div>
            <label style={labelS}>薬・器具名</label>
            <input value={m.name} onChange={e=>upMed(i,"name",e.target.value)} style={{...s,marginBottom:8}} placeholder="例：エピペン" />
            <label style={labelS}>保管場所</label>
            <input value={m.location} onChange={e=>upMed(i,"location",e.target.value)} style={{...s,marginBottom:8}} placeholder="例：バッグ内・赤いポーチ" />
            <label style={labelS}>用法・用量</label>
            <input value={m.dosage} onChange={e=>upMed(i,"dosage",e.target.value)} style={s} placeholder="例：発作時2吸入" />
          </div>
        ))}
        <button onClick={()=>setData({...data,medications:[...data.medications,{id:`m${Date.now()}`,name:"",location:"",dosage:""}]})} style={addS}>＋ 持薬・器具を追加</button>
      </div>
    )}

    {/* 連絡先 */}
    {tab==="contact" && (
      <div style={{ animation:"fadeUp .3s ease" }}>
        <div style={{ fontSize:11, fontWeight:800, color:T.inkDim, letterSpacing:".1em", marginBottom:10 }}>📞 緊急連絡先（優先順）</div>
        {data.emergency.map((e,i)=>(
          <div key={i} style={cardS}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:800, color:T.inkDim }}>連絡先 {i+1}</span>
              <button onClick={()=>setData({...data,emergency:data.emergency.filter((_,j)=>j!==i)})} style={delS}>削除</button>
            </div>
            <label style={labelS}>名前・施設名</label>
            <input value={e.label} onChange={ev=>upEm(i,"label",ev.target.value)} style={{...s,marginBottom:8}} placeholder="例：母・山田 花子" />
            <label style={labelS}>続柄</label>
            <input value={e.relation} onChange={ev=>upEm(i,"relation",ev.target.value)} style={{...s,marginBottom:8}} placeholder="例：母" />
            <label style={labelS}>電話番号</label>
            <input value={e.phone} type="tel" onChange={ev=>upEm(i,"phone",ev.target.value)} style={s} placeholder="090-0000-0000" />
          </div>
        ))}
        <button onClick={()=>setData({...data,emergency:[...data.emergency,{id:`e${Date.now()}`,label:"",phone:"",relation:""}]})} style={addS}>＋ 連絡先を追加</button>

        <div style={{ fontSize:11, fontWeight:800, color:T.inkDim, letterSpacing:".1em", margin:"20px 0 10px" }}>🏥 かかりつけ医</div>
        <div style={cardS}>
          <label style={labelS}>病院名</label>
          <input value={data.doctor.name} onChange={e=>setData({...data,doctor:{...data.doctor,name:e.target.value}})} style={{...s,marginBottom:8}} />
          <label style={labelS}>電話番号</label>
          <input value={data.doctor.phone} type="tel" onChange={e=>setData({...data,doctor:{...data.doctor,phone:e.target.value}})} style={{...s,marginBottom:8}} />
          <label style={labelS}>備考（担当医名など）</label>
          <input value={data.doctor.note} onChange={e=>setData({...data,doctor:{...data.doctor,note:e.target.value}})} style={{...s,marginBottom:8}} />
          <label style={labelS}>住所</label>
          <input value={data.doctor.address} onChange={e=>setData({...data,doctor:{...data.doctor,address:e.target.value}})} style={s} />
        </div>
      </div>
    )}
  </div>

  {/* 保存ボタン（固定） */}
  <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
    width:"100%", maxWidth:480, padding:"12px 16px 28px",
    background:T.surface, borderTop:`1px solid ${T.border}`, boxShadow:"0 -4px 20px rgba(20,40,30,.08)" }}>
    <Btn onClick={save} style={{ width:"100%", fontSize:15,
      background: saved ? T.greenMid : T.green,
      transition:"background .3s ease" }}>
      {saved ? "✓ 保存しました" : "変更を保存する"}
    </Btn>
  </div>
</div>
```

);
}

// ============================================================
// 📱 SCREEN: Nursery Dashboard (管理者)
// ============================================================
function DashboardScreen({ onSelectChild, onBack }) {
const nursery = DB.nurseries[“nursery-himawari”];
const children = Object.values(DB.children).filter(c=>c.nurseryId===nursery.id);

return (
<div style={{ minHeight:“100vh”, background:T.bg }}>
<TopBar title={nursery.name} sub="管理者ダッシュボード" onBack={onBack} />
<div style={{ padding:“16px 16px 40px” }}>

```
    {/* Stats */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
      {[
        { label:"園児数", value:children.length, icon:"👶", color:T.green },
        { label:"エピペン所持", value:children.filter(c=>c.hasEpipen).length, icon:"💉", color:T.red },
      ].map((s,i)=>(
        <div key={i} style={{ background:T.surface, borderRadius:16, padding:"16px",
          border:`1px solid ${T.border}`, boxShadow:T.shadow, textAlign:"center" }}>
          <div style={{ fontSize:26, marginBottom:6 }}>{s.icon}</div>
          <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
          <div style={{ fontSize:11, color:T.inkDim, marginTop:2 }}>{s.label}</div>
        </div>
      ))}
    </div>

    {/* NFC設定カード */}
    <Card style={{ marginBottom:20 }}>
      <CardHeader icon="🏷️" title="NFCタグ管理" color={T.blue} />
      <Row>
        <div style={{ fontSize:13, color:T.inkMid, marginBottom:8 }}>
          保育士認証タグの設定・再発行
        </div>
        <div style={{ background:T.surfaceAlt, borderRadius:10, padding:"10px 14px", marginBottom:10 }}>
          <div style={{ fontSize:11, color:T.inkDim, marginBottom:3 }}>認証URL（NFCに書き込む）</div>
          <div style={{ fontSize:12, fontFamily:"monospace", color:T.inkMid, wordBreak:"break-all" }}>
            /staff-auth?nursery={nursery.id}&key={nursery.staffAuthKey}
          </div>
        </div>
        <Btn variant="secondary" style={{ fontSize:12, padding:"8px 14px" }}>
          🔄 キー再発行（紛失時）
        </Btn>
      </Row>
      <Row last>
        <div style={{ fontSize:12, color:T.inkDim, lineHeight:1.6 }}>
          ⚠️ 再発行すると古いタグは即座に無効になります。<br />
          予備タグへの書き換えをお忘れなく。
        </div>
      </Row>
    </Card>

    {/* 園児一覧 */}
    <div style={{ fontSize:11, fontWeight:800, color:T.inkDim, letterSpacing:".12em",
      textTransform:"uppercase", marginBottom:10 }}>
      園児一覧
    </div>
    {children.map(child=>(
      <button key={child.id} onClick={()=>onSelectChild(child.id)} style={{
        width:"100%", background:T.surface, border:`1px solid ${T.border}`, borderRadius:16,
        padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:14,
        cursor:"pointer", boxShadow:T.shadow, textAlign:"left", fontFamily:"inherit"
      }}>
        <div style={{ width:46, height:46, borderRadius:14, background:T.greenLight,
          border:`1.5px solid ${T.borderDark}`, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:22, flexShrink:0 }}>👧</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:800, color:T.ink }}>{child.name}</div>
          <div style={{ fontSize:11, color:T.inkDim, marginTop:2 }}>{child.kana}　{child.age}</div>
          <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
            {child.allergies.map(a=>(
              <SevBadge key={a.id} level={a.severity} />
            ))}
            {child.hasEpipen && <Tag color={T.red}>💉 エピペン</Tag>}
          </div>
        </div>
        <span style={{ color:T.inkDim, fontSize:18 }}>›</span>
      </button>
    ))}
  </div>
</div>
```

);
}

// ============================================================
// 🏠 HOME / Navigation
// ============================================================
function HomeScreen({ onNavigate }) {
const children = Object.values(DB.children);

return (
<div style={{ minHeight:“100vh”, background:T.bg }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&display=swap'); * { box-sizing:border-box; margin:0; padding:0; } @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} @keyframes pop{0%{transform:scale(.92);opacity:0}100%{transform:scale(1);opacity:1}} .nav-btn:active{transform:scale(.97)}`}</style>

```
  {/* ヘッダー */}
  <div style={{ background:T.green, padding:"56px 20px 28px" }}>
    <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", letterSpacing:".2em", marginBottom:8 }}>
      NFC MEDICAL TAG SYSTEM
    </div>
    <div style={{ fontSize:26, fontWeight:800, color:T.white, lineHeight:1.3 }}>
      ひまわり保育園<br />
      <span style={{ fontSize:16, fontWeight:400, opacity:.8 }}>園児医療情報管理システム</span>
    </div>
  </div>

  <div style={{ padding:"20px 16px 40px" }}>

    {/* NFCシミュレーション */}
    <div style={{ background:T.surface, borderRadius:20, padding:20, boxShadow:T.shadowMd,
      border:`1px solid ${T.border}`, marginBottom:20, animation:"fadeUp .3s ease" }}>
      <div style={{ fontSize:12, fontWeight:800, color:T.inkDim, letterSpacing:".1em", marginBottom:14 }}>
        📱 NFCタグ読み取りシミュレーション
      </div>
      <div style={{ fontSize:13, color:T.inkMid, marginBottom:14, lineHeight:1.6 }}>
        実際の運用では園児のバッグにつけたNFCキーホルダーを<br />スマートフォンにかざして以下のURLが開きます
      </div>
      {children.map(c=>(
        <button key={c.id} className="nav-btn" onClick={()=>onNavigate("kid",c.id)}
          style={{ width:"100%", background:T.surfaceAlt, border:`1px solid ${T.border}`,
            borderRadius:13, padding:"12px 16px", marginBottom:8, display:"flex",
            alignItems:"center", gap:12, cursor:"pointer", fontFamily:"inherit",
            transition:"transform .15s ease" }}>
          <span style={{ fontSize:20 }}>👧</span>
          <div style={{ flex:1, textAlign:"left" }}>
            <div style={{ fontSize:14, fontWeight:700, color:T.ink }}>{c.name}</div>
            <div style={{ fontSize:11, color:T.inkDim, fontFamily:"monospace" }}>/kid/{c.id}</div>
          </div>
          <Tag color={T.green}>タップして確認</Tag>
        </button>
      ))}
    </div>

    {/* ナビゲーション */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
      {[
        { icon:"🏫", label:"管理者\nダッシュボード", screen:"dashboard", color:T.green },
        { icon:"👨‍👩‍👧", label:"保護者\nログイン", screen:"parent-login", color:T.blue },
      ].map(n=>(
        <button key={n.screen} className="nav-btn" onClick={()=>onNavigate(n.screen)}
          style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16,
            padding:"20px 16px", cursor:"pointer", fontFamily:"inherit",
            boxShadow:T.shadow, transition:"transform .15s ease", textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>{n.icon}</div>
          <div style={{ fontSize:13, fontWeight:800, color:T.ink, whiteSpace:"pre-line", lineHeight:1.5 }}>
            {n.label}
          </div>
        </button>
      ))}
    </div>

    {/* システム情報 */}
    <div style={{ background:T.surfaceAlt, borderRadius:16, padding:16, border:`1px solid ${T.border}` }}>
      <div style={{ fontSize:11, fontWeight:800, color:T.inkDim, letterSpacing:".1em", marginBottom:10 }}>
        ⚙️ システム構成（本番実装時）
      </div>
      {[
        ["フロントエンド", "React + React Router"],
        ["バックエンド",   "Supabase (PostgreSQL + Auth)"],
        ["NFC認証",       "Web NFC API / URLスキーム"],
        ["保護者認証",     "Google OAuth 2.0"],
        ["セキュリティ",  "HTTPS + 園単位アクセス制御"],
        ["データ更新",     "Supabase Realtime"],
      ].map(([k,v])=>(
        <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0",
          borderBottom:`1px solid ${T.border}`, fontSize:12 }}>
          <span style={{ color:T.inkDim }}>{k}</span>
          <span style={{ color:T.inkMid, fontWeight:600 }}>{v}</span>
        </div>
      ))}
    </div>
  </div>
</div>
```

);
}

// ============================================================
// 🔀 Router / App Root
// ============================================================
export default function App() {
// screen: “home” | “kid” | “parent-login” | “parent-edit” | “dashboard”
const [screen, setScreen] = useState(“home”);
const [selectedChildId, setSelectedChildId] = useState(null);
const [parentAuthed, setParentAuthed] = useState(false);
const [history, setHistory] = useState([“home”]);

function navigate(to, childId=null) {
if (childId) setSelectedChildId(childId);
setHistory(h=>[…h, to]);
setScreen(to);
}

function goBack() {
setHistory(h => {
const next = h.slice(0,-1);
setScreen(next[next.length-1] || “home”);
return next;
});
}

return (
<div style={{ maxWidth:480, margin:“0 auto”, minHeight:“100vh”, fontFamily:”‘Sora’, ‘Hiragino Kaku Gothic Pro’, sans-serif” }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>

```
  {screen === "home" && (
    <HomeScreen onNavigate={navigate} />
  )}
  {screen === "kid" && (
    <KidInfoScreen
      childId={selectedChildId}
      onBack={goBack}
      onStaffAuth={()=>{}}
      onParentLogin={()=>navigate("parent-login")}
    />
  )}
  {screen === "parent-login" && (
    <ParentLoginScreen
      onBack={goBack}
      onLogin={()=>{ setParentAuthed(true); navigate("parent-edit"); }}
    />
  )}
  {screen === "parent-edit" && parentAuthed && (
    <ParentEditScreen
      childId={selectedChildId || "kid-yuki-001"}
      onBack={goBack}
      onSave={()=>navigate("kid", selectedChildId || "kid-yuki-001")}
    />
  )}
  {screen === "dashboard" && (
    <DashboardScreen
      onBack={goBack}
      onSelectChild={id=>navigate("kid", id)}
    />
  )}
</div>
```

);
}
