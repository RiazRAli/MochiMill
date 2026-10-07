
/* =====================================================================
   MOCHI MILL — CHAPTER 1: DEFINE  (v2)
   Consequence-driven Six Sigma adventure.
   Mistakes are accepted silently and surface at the tollgate review.
   ===================================================================== */

/* ---------------- state ---------------- */
const S = {
  scene:'title',
  lang:'en',
  day:1, half:0, daysLost:0,
  slots:3,
  interviewed:{}, asked:{}, askCount:{},
  have:[],
  vocUnlocked:false,           // did the player actually collect customer voice?
  ps:{date:null,metric:null,base:null,target:null,copq:null},
  obj:{verb:null,metric:null,base:null,target:null,when:null,how:null},
  objHowDecided:false,
  flow:null,
  sipoc:{S:[],I:[],O:[],C:[],X:[]},
  voc:{voc:[],noise:[]},
  ctq:{},
  scope:{IN:[],OUT:[],LATER:[]},
  stake:{MC:[],KS:[],KI:[],MO:[]},
  vocGame:null,                      // ctq translations chosen: {smile:'ok|vague|sol', ship:...}
  vocDone:false,sipocDone:false,flowDone:false,psDone:false,objDone:false,
  tollgateAttempts:0,
  endedInterviewsEarly:false,
  qUsed:0,                            // interview questions spent (global stopwatch budget)
  gate:{named:false,signed:false,released:false,done:false,blunder:false},  // data-gatekeeper chain
  recon:{}, reconciled:false, reconTries:0,                                 // numbers reconciliation
  reworkMode:false,
  consults:0, consultBy:{},          // build-time NPC lifelines: one per deliverable, dragon notices
};

/* ---------------- language scaffolding (EN / 日本語) ----------------
   t('key') returns STRINGS[S.lang][key], falling back to English, then the key.
   Today only the intro screen + shared UI chrome are translated. To localise the
   FULL game later, give each say()/narrate() line a key here and wrap it in t();
   the switch, fallback and selector are already in place. Character dialogue is
   deliberately left in English for now — this is the scaffold for a JA content pass. */
const STRINGS={
  en:{
    title:'Mochi Mill',
    subtitle:'Chapter 1 — DEFINE ✦ a consequence-driven Six Sigma story',
    pill_interview:'🗣️ Interview the team', pill_customer:'💬 Hear the customer',
    pill_build:'📝 Build the charter', pill_tollgate:'🐉 Survive the tollgate',
    intro_body:'You are the new improvement lead at a kawaii plushie factory.<br>Gather evidence, ask the right questions… and be careful what goes in your deliverables.<br><b>Nobody will stop you from making mistakes. You will find out at the review.</b>',
    start:'▶ Start ✦',
    game_tagline:'A kawaii Six Sigma factory adventure',
    chapter1:'Chapter 1',
    define_word:'DEFINE',
    define_tag:'Find the real problem — before the dragon does.',
    lang_label:'Language',
    music_on:'🎵 Music: on', music_off:'🔈 Music: tap to play',
    tap_music:'🔊 audio starts on your first tap (browsers block autoplay)',
    ja_notice:'',
  },
  ja:{
    title:'もちミル',
    subtitle:'第1章 — DEFINE（定義）✦ 結果がついてくるシックスシグマ物語',
    pill_interview:'🗣️ チームに聞き取り', pill_customer:'💬 お客様の声を聞く',
    pill_build:'📝 チャーター作成', pill_tollgate:'🐉 トールゲート突破',
    intro_body:'あなたはかわいいぬいぐるみ工場の新しい改善リーダー。<br>証拠を集め、正しい質問をして…成果物に何を書くか気をつけて。<br><b>誰もミスを止めてくれません。気づくのはレビューの時です。</b>',
    start:'▶ スタート ✦',
    game_tagline:'かわいいシックスシグマ工場ものがたり',
    chapter1:'第1章',
    define_word:'DEFINE（定義）',
    define_tag:'本当の問題を見つけよう——竜より先に。',
    lang_label:'言語',
    music_on:'🎵 音楽：オン', music_off:'🔈 音楽：タップで再生',
    tap_music:'🔊 最初のタップで音楽が始まります（自動再生はブラウザが制限）',
    ja_notice:'',
  },
};
function t(k){ return (STRINGS[S.lang]&&STRINGS[S.lang][k])!=null ? STRINGS[S.lang][k] : (STRINGS.en[k]!=null?STRINGS.en[k]:k); }
/* L(en, ja): inline bilingual string. Returns the Japanese when the player has
   selected 日本語 AND a translation is supplied; otherwise falls back to English.
   This lets the game be localised scene-by-scene — any line without a ja value
   simply stays English, so the game is always fully playable during the rollout. */
function L(en,ja){ return (S.lang==='ja' && ja) ? ja : en; }
/* character display names (used only for the speaker label, never for art/logic) */
const NAMES={
  'Narrator':'ナレーター','You':'あなた','???':'???',
  'Uni the Unicorn':'ユニ','Captain Capy':'カピー隊長','Penny Penguin':'ペニー',
  'Miko Cat':'ミコ','Luna Axolotl':'ルナ','Torto':'トルト',
  'Empress Scarlet':'スカーレット皇帝','Hana':'ハナ','Ms. Sakura':'サクラさん',
};
function nm(en){ return L(en, NAMES[en]); }

/* ---------------- NPC character sheets (opened from the side cast rail) ----------------
   Each field is [EN, JA]; the profile modal renders whichever language is active. */
const PROFILES={
  uni:{art:'uni', name:['Uni','ユニ'], age:['Ageless-ish','歳は…ないしょ'], sex:['Female','女性'], species:['Unicorn','ユニコーン'],
    job:['Master Black Belt · your mentor','マスターブラックベルト · あなたの指導役'],
    blurb:['Calm, wise, and maddeningly hands-off before a review — she will not check your work, because a Green Belt must own their choices. She believes mistakes, caught at the tollgate, teach better than any lecture.',
      '冷静で聡明、そしてレビュー前は歯がゆいほど手を出さない——あなたの仕事は確認しない。グリーンベルトは自分の選択に責任を持つべきだから。トールゲートで見つかる失敗こそ、どんな講義より人を育てると信じている。']},
  capy:{art:'capy', name:['Captain Capy','カピー隊長'], age:['34','34歳'], sex:['Male','男性'], species:['Capybara','カピバラ'],
    job:['Floor Supervisor','現場監督'],
    blurb:['Sincere, anxious and endlessly helpful — which is exactly the problem. He runs on gut feelings and hunches, guesses the defect rate, and blames the night shift without ever checking. Warm, but treat every word as opinion until proven.',
      '誠実で心配性、どこまでも親切——それがまさに問題。勘と当て推量で現場を回し、不良率を目分量で言い、確かめもせず夜勤のせいにする。人柄はいいが、裏が取れるまで、その言葉はすべて「意見」として扱うこと。']},
  penny:{art:'penny', name:['Penny Penguin','ペニー'], age:['41','41歳'], sex:['Female','女性'], species:['Penguin','ペンギン'],
    job:['QA Lead — keeper of the logs','品質保証リーダー — 記録の番人'],
    blurb:['Precise, unflappable, "logs not legends." Ninety days of inspection records live in her binders, and — if you ask the sharp question — she will admit the number that truly matters: what escapes to customers. Your best source of verified data.',
      '几帳面で動じない、「伝説より記録」が信条。90日分の検査記録が彼女のバインダーに眠る。鋭い質問をすれば、本当に大事な数字——顧客に流出する不良——も明かしてくれる。裏付けデータの最良の情報源。']},
  miko:{art:'miko', name:['Miko Cat','ミコ'], age:['26','26歳'], sex:['Female','女性'], species:['Cat','ネコ'],
    job:['Customer Care','カスタマーケア'],
    blurb:['Dramatic, warm-hearted, and fluent in "nya." She drowns daily in complaint letters and return boxes, so she carries the real Voice of the Customer — and the Cost of Poor Quality, counted in gold.',
      'ドラマチックで心優しく、語尾は「ニャ」。毎日、苦情の手紙と返品箱に埋もれているからこそ、本物の「顧客の声」を——そして金貨で数える品質不良コスト（COPQ）を——握っている。']},
  luna:{art:'luna', name:['Luna Axolotl','ルナ'], age:['29','29歳'], sex:['Female','女性'], species:['Axolotl','ウーパールーパー'],
    job:['Night-Shift Lead','夜勤リーダー'],
    blurb:['Quiet, precise, and used to being overlooked. She keeps her own tally sheets — and they quietly demolish the "it must be the night shift" blame: 12.4% nights vs 12.7% days. Whatever breaks the plushies does not care what time it is.',
      '物静かで正確、見過ごされることに慣れている。自分の集計表をつけていて、それが「夜勤のせいだ」という決めつけを静かに崩す——夜勤12.4%、昼勤12.7%。ぬいぐるみを壊す何かは、時間帯なんて気にしない。']},
  torto:{art:'torto', name:['Torto','トルト'], age:['68','68歳'], sex:['Male','男性'], species:['Tortoise','リクガメ'],
    job:['Veteran Operator — 40 years','ベテラン作業員 — 勤続40年'],
    blurb:['Grumpy, nostalgic, and gold buried under complaints. Ask the wrong question and you get moon-phase theories; ask the right one and forty years pour out — the true line order, and the Machine 3 tension knob that drifts by lunch.',
      '気難しく懐古的、だが愚痴の下に金脈が眠る。的外れな質問をすれば月の満ち欠け論、的を射た質問をすれば40年が溢れ出す——ラインの本当の順番、そして昼までにずれる3号機のテンションつまみ。']},
  dragon:{art:'dragon', name:['Empress Scarlet','スカーレット皇帝'], age:['Ancient','古の齢'], sex:['Female','女性'], species:['Dragon','ドラゴン'],
    job:['Champion · Tollgate reviewer','チャンピオン · トールゲート審査官'],
    blurb:['Fearsome, exacting, and — beneath the smoke — fair. She rejects guesswork, blame, and solutions in disguise, and she notices every corner cut. Remember: every Green Belt she ever certified failed a tollgate. The good ones failed it exactly once.',
      '恐ろしく、厳格で——煙の下では公正。当て推量、責任転嫁、変装した解決策を却下し、あらゆる手抜きを見逃さない。心に留めて：彼女が認定したグリーンベルトは皆、一度はトールゲートに落ちた。見どころのある者は、ちょうど一度だけ。']},
  hana:{art:'hana', name:['Hana','ハナ'], age:['6','6歳'], sex:['Female','女の子'], species:['Bunny','ウサギ'],
    job:['Customer — hugs plushies professionally','お客さま — ぬいぐるみを全力でハグする専門家'],
    blurb:['The actual end customer. She loves Mr. Mochi with her whole heart, which is exactly why his smile came undone after one week. Her need — a smile that survives a thousand hugs — is the real Critical-to-Quality.',
      '正真正銘の最終顧客。モチくんを心から愛していて、だからこそ一週間で笑顔がほどけてしまった。彼女のニーズ——千回のハグに耐える笑顔——こそが本物のCTQ（重要品質特性）。']},
  sakura:{art:'sakura', name:['Ms. Sakura','サクラさん'], age:['54','54歳'], sex:['Female','女性'], species:['Deer','シカ'],
    job:['Owner, Sakura Toy Emporium (retailer)','サクラおもちゃ百貨店 店主（小売）'],
    blurb:['Exacting, elegant, and counting. She does not know or care about your inspection scores — she knows HER boxes and HER returns. Two requirements: fewer defective arrivals, and fewer plushies limping back from her shoppers.',
      '厳格で優雅、そして数を数えている。あなたの検査スコアなど知らないし興味もない——彼女が知っているのは「自分の箱」と「自分の返品」。要求は二つ：不良品の入荷を減らすこと、そして客から返品されるぬいぐるみを減らすこと。']},
};

/* ---------------- note cards ---------------- */
/* type: ver=verified fact, fact, vague, anec=anecdote, blame, sol=solution,
         op=opinion, cause=cause hypothesis (true maybe — but not Define material)
   slot: which PS slot it truly belongs to (null = belongs in no PS slot) */
const CARDS = {
  c_where:{txt:'Defects appear on the main stitching line at the Fuwa-Fuwa Mochi Mill.',src:'Captain Capy, floor supervisor',type:'fact',slot:'where'},
  c_what_vague:{txt:'Plushies come out "wonky" — crooked smiles, lumpy tummies.',src:'Captain Capy (informal description)',type:'vague',slot:'what'},
  c_anec:{txt:'Roughly 1 in 7 plushies comes out bad… I think. Feels that way lately.',src:'Captain Capy (gut feeling, no data)',type:'anec',slot:'mag'},
  c_blame:{txt:'Honestly? The night shift is careless. It is probably their fault.',src:'Captain Capy (hunch)',type:'blame',slot:null},
  p_mag:{txt:'QA logs: 12.6% of plushies failed final inspection over the last 90 days (target: 2%).',src:'Penny Penguin, QA inspection records',type:'ver',slot:'mag'},
  p_what:{txt:'Top recorded defect: loose smile stitching — 58% of all failures.',src:'Penny Penguin, QA defect log',type:'ver',slot:'what'},
  p_when:{txt:'QA trend chart: the failure rate jumped on March 14th — the exact day the spike began — and has stayed high since.',src:'Penny Penguin, QA trend chart',type:'ver',slot:'when'},
  p_field:{txt:'Escaped-defect rate: about 4.8% of SHIPPED plushies come back broken within a month — roughly 1 in 20 reaches a child defective. That is the rate the customer actually feels (a healthy line runs under 0.5%). Very different from the 12.6% caught at the gate.',src:'Penny Penguin, QA logs cross-checked with Miko’s returns',type:'ver',slot:'mag'},
  p_cause:{txt:'If you want my hunch: thread tension is behind it. But that is a guess — my logs record WHAT failed, not WHY.',src:'Penny Penguin (unproven cause hypothesis)',type:'cause',slot:null},
  m_shops:{txt:'Which shops complain: the Sakura Toy Emporium is loudest — Ms. Sakura counts broken ARRIVALS and RETURNS separately. She is the retailer to invite to the VOC session.',src:'Miko Cat, customer care',type:'fact',slot:null},
  m_impact:{txt:'COPQ (Cost of Poor Quality): refunds tripled to 48,000 gold last quarter, and two toy shops paused orders.',src:'Miko Cat, customer care ledger',type:'ver',slot:'impact'},
  m_ctq:{txt:'Customers’ #1 need: a smile that survives 1,000 hugs. That is what quality means to them.',src:'Miko Cat, voice of the customer',type:'fact',slot:null},
  m_voc:{txt:'Letter #112: "My daughter cried — the smile came undone after ONE week of hugs."',src:'Customer letter, via Miko',type:'fact',slot:null},
  m_sol:{txt:'We could just ship free repair kits with every plushie!',src:'Miko Cat (idea)',type:'sol',slot:null},
  l_counter:{txt:'Night vs day defect rates are nearly identical: 12.4% vs 12.7%. It is not a shift problem.',src:'Luna Axolotl, night-shift tally sheets',type:'ver',slot:null},
  l_skip:{txt:'When orders pile up, the final-check step quietly gets skipped.',src:'Luna Axolotl (a possible cause — observed, not proven)',type:'cause',slot:null},
  l_when2:{txt:'Defects seem worse during humid weeks.',src:'Luna Axolotl (pattern she noticed)',type:'fact',slot:'when'},
  l_sol:{txt:'Maybe try slowing the line down at night? Just a thought.',src:'Luna Axolotl (well-meant suggestion)',type:'sol',slot:null},
  t_sol:{txt:'Just buy the TurboStitch 9000! Problem solved, no thinking required.',src:'Torto, veteran operator (strong opinion)',type:'sol',slot:null},
  t_op:{txt:'Quality was better in my day. Probably the moon phases. Or the youths.',src:'Torto (vibes)',type:'op',slot:null},
  t_nug:{txt:'The tension knob on Machine 3 drifts by lunchtime. Nobody re-checks it.',src:'Torto (a possible cause — worth remembering for later…)',type:'cause',slot:null},
  t_flow:{txt:'The line, in true order: receive fluff & fabric → cut panels → sew body seams → stuff → stitch the smile → close final seam → final inspection → package & ship.',src:'Torto — recited without pausing for breath, 40 years of certainty',type:'fact',slot:null},
  c_when_guess:{txt:'"When did it start? Recently…ish? It feels lately-ish, honestly."',src:'Captain Capy (pressed for a date, visibly guessing)',type:'anec',slot:null},
  br_zero:{txt:'"Zero defects, forever, starting Monday! How hard can it be?"',src:'Break-room chatter (motivational-poster energy)',type:'op',slot:null},
  br_stop:{txt:'"The target should be whatever makes the complaints stop."',src:'Break-room chatter, between dart throws',type:'op',slot:null},
  br_sad:{txt:'"What does it cost us? Honestly? A great deal of sadness."',src:'Break-room chatter, over cold tea',type:'op',slot:null},
  br_soon:{txt:'"Deadlines are a state of mind. Someday soon-ish is fine."',src:'Unidentified break-room philosopher',type:'op',slot:null},
  br_morale:{txt:'"The real metric is team morale about the defects, if you ask me."',src:'Break-room chatter (nobody asked)',type:'op',slot:null},
  br_lookinto:{txt:'"Someone should really look into the general wonkiness situation."',src:'Half-heard in the corridor',type:'op',slot:null},
  c_deadline:{txt:'Charter brief: the Empress expects the defect problem resolved within 90 days.',src:'Project charter brief, signed with a claw-print',type:'fact',slot:null},
  c_tour:{txt:'Tour notes: cloud fluff arrives from the Fluff Farm Co-op, thread & fabric from the Rainbow Thread Guild. Finished plushies ship with a quality inspection report to toy shops and the children who hug them.',src:'Your own notes from Capy’s floor tour',type:'fact',slot:null},
  c_speed:{txt:'"Want ONE number for the Empress? Measure plushies SHIPPED PER DAY. Show her we are FAST — that is what leadership likes to see."',src:'Captain Capy (eager to look productive)',type:'op',slot:null},
  p_reconcile:{txt:'Reconciled picture: 12.6% is what inspection CATCHES (Luna’s 12.4/12.7 is that same rate split by shift). 4.8% is what ESCAPES to customers. 48,000 gold is the COST, not a rate. "1 in 7" was never measured at all.',src:'Your own reconciliation of every figure collected',type:'ver',slot:null},
};

/* ---------------- block diagram (true order) ---------------- */
const FLOW = ['Receive fluff & fabric','Cut fabric panels','Sew body seams','Stuff with cloud fluff','Stitch the smile','Close final seam','Final inspection','Package & ship'];
const FLOW_SCRAMBLE = [4,0,6,2,7,1,5,3];

/* ---------------- SIPOC key ---------------- */
const SIPOC_ITEMS = [
  {t:'Fluff Farm Co-op',k:'S'},{t:'Rainbow Thread Guild',k:'S'},
  {t:'Cloud fluff',k:'I'},{t:'Fabric & thread',k:'I'},
  {t:'Finished mochi plushies',k:'O'},{t:'Quality inspection report',k:'O'},
  {t:'Children who hug plushies',k:'C'},{t:'Toy shops',k:'C'},
  {t:'The night shift’s attitude',k:'X'},{t:'\u201cZero defects forever!\u201d (a wish)',k:'X'},{t:'Break-room morale',k:'X'},
];

/* ---------------- Voice of the Customer pool ---------------- */
const VOCS=[
  {id:'v1',t:'“My daughter cried — the smile came undone after ONE week of hugs.” — customer letter #112',voc:true,need:true,ctq:'smile'},
  {id:'v2',t:'“A plushie should survive a thousand hugs. Minimum.” — young customer, quoted by Miko',voc:true,need:true,ctq:'smile'},
  {id:'v3',t:'“We need shipments where every plushie is sellable.” — Sakura Toy Emporium (retailer)',voc:true,need:true,ctq:'ship'},
  {id:'v4',t:'“The night shift is careless.” — Captain Capy (floor supervisor)',voc:false,card:'c_blame'},
  {id:'v5',t:'“Buy the TurboStitch 9000.” — Torto (operator)',voc:false,card:'t_sol'},
  {id:'v6',t:'“Quality was better in my day.” — Torto (operator)',voc:false,card:'t_op'},
];
const CTQ_SETS={
  smile:{label:'“Smiles must survive the hugs”',opts:[
    {t:'Smile stitching withstands ≥ 1,000 hug-cycles without loosening',v:'ok'},
    {t:'Make plushies more lovable overall',v:'vague'},
    {t:'Include a free repair kit in every box',v:'sol'}]},
  ship:{label:'“Every shipped plushie must be sellable”',opts:[
    {t:'≥ 98% of shipped plushies pass final inspection (defect-free shipments)',v:'ok'},
    {t:'Keep the toy shops feeling happy',v:'vague'},
    {t:'Offer retailers a discount on wonky plushies',v:'sol'}]},
};

/* ---------------- problem statement fragments ----------------
   "Since <date>, the <metric> has been at <baseline>, compared to a
    target of <target>. This gap causes a COPQ of <copq>."
   Good options are gated on interview evidence (need:cardId).
   Traps are always available. */
const PSF={
  date:[
    {t:'March 14th — the exact day the QA trend jumped (Penny’s logs)',v:'ok',need:'p_when'},
    {t:'sometime recently… ish? It feels lately-ish (Capy)',v:'anec',need:'c_when_guess'},
    {t:'since the moon phases changed (Torto)',v:'op',need:'t_op'},
    {t:'since the tension knob on Machine 3 began drifting (a cause, not a date)',v:'cause',need:'t_nug'},
  ],
  metric:[
    {t:'defect rate \u2014 defective plushies reaching customers',v:'ok',need:'p_field'},
    {t:'final-inspection FAILURE rate (what the gate flags)',v:'inspect',need:'p_mag'},
    {t:'throughput \u2014 plushies shipped per day (Capy)',v:'time',need:'c_speed'},
    {t:'overall plushie wonkiness (Capy)',v:'vague',need:'c_what_vague'},
    {t:'carelessness of the night shift (Capy\u2019s hunch)',v:'blame',need:'c_blame'},
    {t:'drift of the tension knob on Machine 3',v:'cause',need:'t_nug'},
  ],
  base:[
    {t:'4.8% reaching customers defective (verified escaped-defect rate)',v:'ok',need:'p_field'},
    {t:'12.6% — the inspection CATCH rate (not what customers feel)',v:'inspect',need:'p_mag'},
    {t:'about 1 in 7, give or take (Capy’s gut feel)',v:'anec'},
    {t:'12.4% nights / 12.7% days (Luna’s shift tallies)',v:'wrongfit',need:'l_counter'},
  ],
  target:[
    {t:'≤0.5% reaching customers (a healthy escaped-defect rate)',v:'ok',need:'p_field'},
    {t:'2% caught at inspection (the internal gate target)',v:'inspect',need:'p_mag'},
    {t:'0%, forever, starting immediately (break-room chatter)',v:'unreal',need:'br_zero'},
    {t:'whatever makes the complaints stop (break-room chatter)',v:'vague',need:'br_stop'},
    {t:'whatever the TurboStitch 9000 delivers (Torto’s fix)',v:'sol',need:'t_sol'},
  ],
  copq:[
    {t:'48,000 gold per quarter in refunds, with two toy shops pausing orders',v:'ok',need:'m_impact'},
    {t:'a great deal of sadness, unquantified (break-room chatter)',v:'vague',need:'br_sad'},
    {t:'nothing repair kits could not fix (Miko’s idea)',v:'sol',need:'m_sol'},
  ],
};

/* ---------------- scope items (In / Out / Parking lot) ---------------- */
const SCOPE_ITEMS=[
  {en:'The main stitching line, receiving → shipping',ja:'メインの縫製ライン（受入→出荷）',k:'IN'},
  {en:'The smile-stitching step and Machine 3',ja:'笑顔ステッチ工程とマシン3',k:'IN'},
  {en:'Final inspection at the gate',ja:'出荷前の最終検査',k:'IN'},
  {en:'Cutting-station rework',ja:'裁断工程の手戻り',k:'IN'},
  {en:'Toy-shop returns — as our field data',ja:'おもちゃ店からの返品——現場データとして',k:'IN'},
  {en:'Buying the TurboStitch 9000',ja:'ターボステッチ9000の購入',k:'OUT',trap:'solution'},
  {en:'Disciplining the night shift',ja:'夜勤への処分',k:'OUT',trap:'blame'},
  {en:'The whole factory’s morale',ja:'工場全体の士気',k:'OUT',trap:'creep'},
  {en:'How the Fluff Farm Co-op harvests fluff',ja:'フラッフ農園協同組合の収穫方法',k:'OUT',trap:'creep'},
  {en:'The toy shops’ shelf displays',ja:'おもちゃ店の陳列方法',k:'OUT',trap:'creep'},
  {en:'Proving what causes the tension drift',ja:'張力ドリフトの原因の立証',k:'LATER'},
  {en:'Fixing the humid-week effect',ja:'湿度の高い週の影響の解決',k:'LATER'},
];
const SCOPE_COLS=[['IN','In scope','対象範囲内'],['OUT','Out of scope','対象範囲外'],['LATER','Parking lot — later phase','保留——後のフェーズ']];

/* ---------------- stakeholder grid (power × interest) ---------------- */
const STAKE_ITEMS=[
  {id:'empress',en:'Empress Scarlet — Champion',ja:'スカーレット皇帝——チャンピオン',k:'MC'},
  {id:'sakura', en:'Ms. Sakura — Toy Emporium (can pause orders)',ja:'サクラ店主——百貨店（発注停止の権限あり）',k:'MC',need:'m_shops'},
  {id:'capy',   en:'Captain Capy — process owner',ja:'カピー——工程オーナー',k:'MC'},
  {id:'acct',   en:'Accounting — keepers of the COPQ ledger',ja:'経理部——COPQ台帳の管理者',k:'KS'},
  {id:'hana',   en:'Hana and the children',ja:'ハナと子どもたち',k:'KI'},
  {id:'ops',    en:'Torto & Luna — the operators',ja:'トルトとルナ——作業員たち',k:'KI'},
  {id:'miko',   en:'Miko — customer care',ja:'ミコ——カスタマーケア',k:'KI'},
  {id:'fluff',  en:'Fluff Farm Co-op — supplier',ja:'フラッフ農園協同組合——供給者',k:'MO'},
  {id:'thread', en:'Rainbow Thread Guild — supplier',ja:'レインボー糸ギルド——供給者',k:'MO'},
  {id:'brk',    en:'The break-room philosophers',ja:'休憩室の哲学者たち',k:'MO'},
];
const STAKE_COLS=[['MC','Manage closely','綿密に管理','high power · high interest','権限 高・関心 高'],
                  ['KS','Keep satisfied','満足させておく','high power · low interest','権限 高・関心 低'],
                  ['KI','Keep informed','情報を共有','low power · high interest','権限 低・関心 高'],
                  ['MO','Monitor','見守る','low power · low interest','権限 低・関心 低']];

/* ---------------- objective statement fragments ---------------- */
const OBJ={
  verb:[{t:'Reduce',v:'ok'},{t:'Completely eliminate, forever,',v:'unreal',need:'br_zero'},{t:'Look into',v:'vague',need:'br_lookinto'}],
  metric:[{t:'the defect rate reaching customers',v:'ok',need:'p_field'},{t:'the final-inspection failure rate',v:'inspect',need:'p_mag'},{t:'plushies shipped per day (throughput)',v:'time',need:'c_speed'},{t:'the general wonkiness situation',v:'vague',need:'br_lookinto'},{t:'team morale about defects',v:'off',need:'br_morale'}],
  base:[{t:'from a verified 4.8% reaching customers',v:'ok',need:'p_field'},{t:'from the 12.6% caught at inspection',v:'inspect',need:'p_mag'},{t:'from “about 1 in 7” (Capy’s guess)',v:'anec'}],
  target:[{t:'to at or below 0.5% reaching customers',v:'ok',need:'p_field'},{t:'to at or below the 2% inspection target',v:'inspect',need:'p_mag'},{t:'to absolute zero (break-room wish)',v:'unreal',need:'br_zero'}],
  when:[{t:'within 90 days (per the charter brief)',v:'ok',need:'c_deadline'},{t:'someday soon-ish (break-room wisdom)',v:'vague',need:'br_soon'}],
  how:[{t:'— by retraining the careless night shift (Capy’s hunch)',v:'how',need:'c_blame'},{t:'— by purchasing the TurboStitch 9000 (Torto’s catalog)',v:'how',need:'t_sol'},{t:'(leave the HOW out — objectives state WHAT, not HOW)',v:'skip'}],
};

/* ---------------- build-time NPC help ("phone a friend") ----------------
   One consult allowed per deliverable; the player chooses WHOM to ask and is
   then locked to that one person for that deliverable. Each consult costs a day
   of slip and is remembered — the Empress reprimands mid-build shortcuts at the
   tollgate, and any consult forfeits the flawless (S) rating.
   Some people genuinely hold the missing evidence; others waste the question.
   `cards` are notebook ids granted; `unlockVoc` opens the customer-voice gate. */
const HELP = {
  flow:{ title:'the block diagram — the true order of the line', q:[
    {who:'Torto', cls:'torto', mood:'content',
      ask:'“What is the real order of the line, start to finish?”',
      a:'*sets down his tea, unimpressed* Receive fluff and fabric. Cut the panels. Sew the body seams. Stuff with cloud fluff. Stitch the smile. Close the final seam. Final inspection. Package and ship. Forty years, and you catch me between an important meeting. Write it down.',
      cards:['t_flow']},
    {who:'Captain Capy', cls:'capy', mood:null,
      ask:'“Can you walk me through the line one more time?”',
      a:'Er — fluff arrives, then cutting, and sewing somewhere in there, and the smile bit, and inspection near the end… I think? It is a blur on busy days, honestly. You should probably ask an operator.',
      cards:[]},
    {who:'Penny Penguin', cls:'penny', mood:'stern',
      ask:'“Do your logs record the step order of the line?”',
      a:'My logs record what FAILS and how often. Not the sequence of the line. Wrong penguin for that question, Green Belt.',
      cards:[]},
    {who:'Luna Axolotl', cls:'luna', mood:null,
      ask:'“Do you know the full daytime line order?”',
      a:'I run a slice of the night, not the whole daytime sequence end to end. Ask someone who works the full line in daylight.',
      cards:[]},
  ]},
  scope:{ title:'the scope — what is inside the boundary, what is not', q:[
    {who:'Captain Capy', cls:'capy', mood:null,
      ask:'“Where does OUR process begin and end?”',
      a:'Receiving dock to the shipping door — the eight blocks you mapped. What the farm does before the fluff arrives, or what the shops do after the boxes leave, that is their house, not ours.',
      cards:[]},
    {who:'Penny Penguin', cls:'penny', mood:'stern',
      ask:'“Are the toy-shop returns inside our scope?”',
      a:'The DATA is — it measures what our process shipped. The shops’ shelves and staff are not. Scope the measurement, not the retailer.',
      cards:[]},
    {who:'Torto', cls:'torto', mood:'content',
      ask:'“Is buying the TurboStitch part of this project?”',
      a:'*sips* A purchase is a DECISION, youngster, not a boundary. Decide later, with numbers. …Page forty-seven will still be there.',
      cards:[]},
  ]},
  stake:{ title:'the stakeholder grid — power and interest', q:[
    {who:'Uni the Unicorn', cls:'uni', mood:'stern',
      ask:'“How do I place someone on the grid?”',
      a:'Two questions per name. Can they change the project’s fate — funding, orders, approvals? That is POWER. Will they feel the result — good or bad? That is INTEREST. High/high: manage closely. Power without interest: keep satisfied. Interest without power: keep informed. Neither: monitor.',
      cards:[]},
    {who:'Miko Cat', cls:'miko', mood:'dramatic',
      ask:'“How much power does the Emporium really have?”',
      a:'Nya — they PAUSED orders once already! One letter from Ms. Sakura and Accounting turns pale. That is power, and she cares about every box. Do not file her under “monitor”, whatever you do.',
      cards:['m_shops']},
  ]},
  sipoc:{ title:'the SIPOC — suppliers, inputs, outputs, customers', q:[
    {who:'Captain Capy', cls:'capy', mood:null,
      ask:'“Who supplies us, and who receives the plushies?”',
      a:'Cloud fluff comes from the Fluff Farm Co-op; thread and fabric from the Rainbow Thread Guild. Finished plushies ship with a quality inspection report to the toy shops — and to the little ones who hug them. That part I DO know.',
      cards:['c_tour']},
    {who:'Miko Cat', cls:'miko', mood:null,
      ask:'“Who actually receives our plushies?”',
      a:'The children who hug them and the toy shops that sell them, nya — I hear from both when it goes wrong. But suppliers and inputs? That is Capy’s paperwork, not mine.',
      cards:[]},
    {who:'Penny Penguin', cls:'penny', mood:'stern',
      ask:'“Do your logs list our suppliers and inputs?”',
      a:'I inspect outputs, not the supply chain. My binders will not fill in a SIPOC for you.',
      cards:[]},
    {who:'Torto', cls:'torto', mood:null,
      ask:'“What goes into the line, and where from?”',
      a:'Fluff and fabric, obviously. From the usual co-op and guild. Beyond that, ask the supervisor — pushing paper is his job, not mine.',
      cards:[]},
  ]},
  voc:{ title:'the Voice of the Customer — what customers actually need', q:[
    {who:'Miko Cat', cls:'miko', mood:'dramatic',
      ask:'“What are customers — and which shops — actually telling you they need?”',
      a:'*produces a stack of letters* Letter #112: a child cried when the smile came undone after ONE week. A thousand hugs, minimum — THAT is the need. And the loudest shop is the Sakura Toy Emporium: Ms. Sakura counts broken arrivals AND returns, and she wants every shipped plushie sellable. Real voices, nya. Use them — she will be at your VOC session now that you know her name.',
      cards:['m_voc','m_ctq','m_shops'], unlockVoc:true},
    {who:'Penny Penguin', cls:'penny', mood:'stern',
      ask:'“Do your logs tell me what customers want?”',
      a:'My logs tell you what FAILED inspection. What customers WANT is a different question, and not one my binders answer. Ask Miko — she reads the letters.',
      cards:[]},
    {who:'Captain Capy', cls:'capy', mood:null,
      ask:'“What do you think the customer wants?”',
      a:'Honestly? Fewer wonky ones. And, er, maybe it is the night shift’s fault. That is my hunch, anyway.',
      cards:[]},
    {who:'Torto', cls:'torto', mood:null,
      ask:'“What does the customer need, in your view?”',
      a:'What they NEED is for us to buy the TurboStitch 9000. That is my view and I am sticking to it.',
      cards:[]},
  ]},
  ps:{ title:'the problem statement — the size of the gap, with evidence', q:[
    {who:'Penny Penguin', cls:'penny', mood:'stern',
      ask:'“Give me the verified defect numbers — including what reaches customers.”',
      a:'*slides the binder over* 12.6% fail final inspection — that is what we CATCH. But what ESCAPES to customers is the number you want: about 4.8% of SHIPPED plushies come back broken (a healthy line runs under 0.5%). Top defect: loose smile stitching. The jump began March 14th, to the day. Numbers, not feelings.',
      cards:['p_mag','p_what','p_when','p_field']},
    {who:'Miko Cat', cls:'miko', mood:null,
      ask:'“What is this costing us in gold?”',
      a:'Refunds tripled to 48,000 gold last quarter, and two toy shops paused their orders. That is the Cost of Poor Quality, nya — write it in gold, not in sighs.',
      cards:['m_impact']},
    {who:'Luna Axolotl', cls:'luna', mood:null,
      ask:'“Is it really the night shift’s fault?”',
      a:'*slides over her tally sheets* Night shift, 12.4%. Day shift, 12.7%. Nearly identical. Whatever breaks the plushies does not care what time it is. Please do not put a villain in your charter.',
      cards:['l_counter']},
    {who:'Captain Capy', cls:'capy', mood:null,
      ask:'“How big is the problem, roughly?”',
      a:'Roughly one in seven comes out bad? I think? It feels that way lately. It is the night shift, probably. That is my gut, anyway.',
      cards:[]},
    {who:'Torto', cls:'torto', mood:null,
      ask:'“When did this all start?”',
      a:'Quality was better in my day. Probably the moon phases. Or the youths. Do not quote me the exact date, quote me the vibes.',
      cards:[]},
  ]},
  obj:{ title:'the objective — the verified baseline, target and deadline', q:[
    {who:'Penny Penguin', cls:'penny', mood:'stern',
      ask:'“What baseline and target should the objective use?”',
      a:'If your metric is what reaches the customer — and it should be — then baseline is the escaped-defect rate, 4.8% of shipped, and a healthy target is at or below 0.5%. NOT my 12.6% inspection number; that one measures a different thing. Match the figures to the metric.',
      cards:['p_mag','p_field']},
    {who:'Captain Capy', cls:'capy', mood:null,
      ask:'“What is the deadline the Empress set?”',
      a:'The charter brief — she underlined it herself — says the defect problem is to be resolved within 90 days. Ninety. I would not test her on that one.',
      cards:['c_deadline']},
    {who:'Miko Cat', cls:'miko', mood:null,
      ask:'“What should we be aiming for?”',
      a:'Happier customers, nya! Fewer tears! …Which is lovely, but I cannot hand you a number for it. Penny keeps the numbers.',
      cards:[]},
    {who:'Torto', cls:'torto', mood:null,
      ask:'“What should the objective say?”',
      a:'It should say ‘buy the TurboStitch 9000’. Route and all. …No? Fine. Then I have nothing for your little form.',
      cards:[]},
  ]},
};

/* ---------------- kawaii art ---------------- */
const ART = {
  capy:`<svg viewBox="0 0 100 100"><rect x="24" y="34" width="52" height="46" rx="24" fill="#c99a6b"/><ellipse cx="30" cy="40" rx="8" ry="9" fill="#c99a6b"/><ellipse cx="70" cy="40" rx="8" ry="9" fill="#c99a6b"/><ellipse cx="30" cy="40" rx="4" ry="5" fill="#a97b4f"/><ellipse cx="70" cy="40" rx="4" ry="5" fill="#a97b4f"/><ellipse cx="50" cy="66" rx="20" ry="15" fill="#e0b485"/><circle cx="41" cy="58" r="4" fill="#4a3526"/><circle cx="59" cy="58" r="4" fill="#4a3526"/><circle cx="42.5" cy="56.5" r="1.3" fill="#fff"/><circle cx="60.5" cy="56.5" r="1.3" fill="#fff"/><ellipse cx="34" cy="66" rx="4" ry="3" fill="#ffb0b0" opacity=".7"/><ellipse cx="66" cy="66" rx="4" ry="3" fill="#ffb0b0" opacity=".7"/><ellipse cx="50" cy="70" rx="6" ry="4.5" fill="#b98a5e"/><path d="M46 71 q4 4 8 0" stroke="#7a5636" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
  uni:`<svg viewBox="0 0 100 100"><path d="M50 8 L56 30 L44 30 Z" fill="#c9b8ff"/><path d="M30 30 q-8 6 -6 20 q6 -6 12 -6z" fill="#ffc2e2"/><path d="M70 30 q8 6 6 20 q-6 -6 -12 -6z" fill="#c9b8ff"/><rect x="26" y="30" width="48" height="48" rx="24" fill="#fff5fb"/><path d="M40 30 q10 -8 20 0 q-2 8 -10 8 q-8 0 -10 -8z" fill="#c9b8ff"/><circle cx="40" cy="56" r="4.2" fill="#6a5a7a"/><circle cx="60" cy="56" r="4.2" fill="#6a5a7a"/><circle cx="41.5" cy="54.5" r="1.4" fill="#fff"/><circle cx="61.5" cy="54.5" r="1.4" fill="#fff"/><ellipse cx="34" cy="63" rx="4" ry="3" fill="#ffb0d0" opacity=".8"/><ellipse cx="66" cy="63" rx="4" ry="3" fill="#ffb0d0" opacity=".8"/><path d="M46 64 q4 4 8 0" stroke="#b78fb0" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
  penny:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="58" rx="26" ry="30" fill="#4a5a75"/><ellipse cx="50" cy="64" rx="18" ry="22" fill="#fff"/><circle cx="42" cy="46" r="4" fill="#2a3245"/><circle cx="58" cy="46" r="4" fill="#2a3245"/><circle cx="43.4" cy="44.6" r="1.3" fill="#fff"/><circle cx="59.4" cy="44.6" r="1.3" fill="#fff"/><path d="M45 54 L50 60 L55 54 Z" fill="#ffb35c"/><ellipse cx="36" cy="53" rx="3.6" ry="2.6" fill="#ffb0c0" opacity=".8"/><ellipse cx="64" cy="53" rx="3.6" ry="2.6" fill="#ffb0c0" opacity=".8"/><rect x="60" y="62" width="18" height="24" rx="3" fill="#fffdf4" stroke="#e0d6a8" transform="rotate(8 69 74)"/><line x1="63" y1="70" x2="74" y2="72" stroke="#c9be8a" stroke-width="1.4"/><line x1="63" y1="75" x2="74" y2="77" stroke="#c9be8a" stroke-width="1.4"/></svg>`,
  miko:`<svg viewBox="0 0 100 100"><path d="M30 34 L26 16 L42 28z" fill="#f2b8cc"/><path d="M70 34 L74 16 L58 28z" fill="#f2b8cc"/><path d="M30 34 L28 22 L39 30z" fill="#e88aae"/><path d="M70 34 L72 22 L61 30z" fill="#e88aae"/><rect x="24" y="28" width="52" height="50" rx="24" fill="#fbe3ee"/><circle cx="40" cy="52" r="4.4" fill="#5a4a5e"/><circle cx="60" cy="52" r="4.4" fill="#5a4a5e"/><circle cx="41.5" cy="50.5" r="1.4" fill="#fff"/><circle cx="61.5" cy="50.5" r="1.4" fill="#fff"/><path d="M46 60 q2 3 4 0 q2 3 4 0" stroke="#b76a8a" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M50 57 l0 3" stroke="#b76a8a" stroke-width="1.6"/><line x1="20" y1="56" x2="34" y2="58" stroke="#d8a8bc" stroke-width="1.4"/><line x1="20" y1="62" x2="34" y2="62" stroke="#d8a8bc" stroke-width="1.4"/><line x1="80" y1="56" x2="66" y2="58" stroke="#d8a8bc" stroke-width="1.4"/><line x1="80" y1="62" x2="66" y2="62" stroke="#d8a8bc" stroke-width="1.4"/><ellipse cx="35" cy="60" rx="4" ry="3" fill="#ffb0c8" opacity=".9"/><ellipse cx="65" cy="60" rx="4" ry="3" fill="#ffb0c8" opacity=".9"/></svg>`,
  luna:`<svg viewBox="0 0 100 100"><path d="M28 40 q-12 -4 -14 6 q8 4 14 2z" fill="#e8b8f0"/><path d="M72 40 q12 -4 14 6 q-8 4 -14 2z" fill="#e8b8f0"/><path d="M24 48 q-10 0 -10 8 q8 2 12 -2z" fill="#d89ae8"/><path d="M76 48 q10 0 10 8 q-8 2 -12 -2z" fill="#d89ae8"/><rect x="26" y="32" width="48" height="48" rx="24" fill="#f6dffa"/><circle cx="40" cy="54" r="4.4" fill="#7a5a8e"/><circle cx="60" cy="54" r="4.4" fill="#7a5a8e"/><circle cx="41.5" cy="52.5" r="1.4" fill="#fff"/><circle cx="61.5" cy="52.5" r="1.4" fill="#fff"/><path d="M45 63 q5 5 10 0" stroke="#a87ac0" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="61" rx="4" ry="3" fill="#ffb0d8" opacity=".8"/><ellipse cx="66" cy="61" rx="4" ry="3" fill="#ffb0d8" opacity=".8"/></svg>`,
  torto:`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="66" rx="30" ry="20" fill="#8aa86a"/><path d="M28 62 q22 -18 44 0 q-4 14 -22 14 q-18 0 -22 -14z" fill="#6a8a4e"/><circle cx="50" cy="42" r="18" fill="#b8cc96"/><circle cx="44" cy="40" r="3.6" fill="#3a4a2e"/><circle cx="56" cy="40" r="3.6" fill="#3a4a2e"/><circle cx="45.2" cy="38.8" r="1.2" fill="#fff"/><circle cx="57.2" cy="38.8" r="1.2" fill="#fff"/><path d="M45 48 q5 4 10 0" stroke="#5a6a44" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M38 32 q4 -4 8 -1" stroke="#5a6a44" stroke-width="1.6" fill="none"/><path d="M62 32 q-4 -4 -8 -1" stroke="#5a6a44" stroke-width="1.6" fill="none"/></svg>`,
  dragon:`<svg viewBox="0 0 100 100"><path d="M32 26 L26 10 L42 20z" fill="#f08aa0"/><path d="M68 26 L74 10 L58 20z" fill="#f08aa0"/><path d="M50 6 L54 20 L46 20z" fill="#ffcf5c"/><rect x="24" y="20" width="52" height="56" rx="24" fill="#f8b8c8"/><path d="M24 46 q-8 2 -8 10 q6 2 10 -2z" fill="#f08aa0"/><path d="M76 46 q8 2 8 10 q-6 2 -10 -2z" fill="#f08aa0"/><circle cx="40" cy="46" r="4.6" fill="#7a3a4e"/><circle cx="60" cy="46" r="4.6" fill="#7a3a4e"/><circle cx="41.6" cy="44.4" r="1.5" fill="#fff"/><circle cx="61.6" cy="44.4" r="1.5" fill="#fff"/><path d="M42 60 q8 6 16 0" stroke="#b05a72" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M36 36 q4 -3 8 0" stroke="#b05a72" stroke-width="1.8" fill="none"/><path d="M64 36 q-4 -3 -8 0" stroke="#b05a72" stroke-width="1.8" fill="none"/><ellipse cx="33" cy="54" rx="4" ry="3" fill="#ff9ab5" opacity=".9"/><ellipse cx="67" cy="54" rx="4" ry="3" fill="#ff9ab5" opacity=".9"/></svg>`,
  hana:`<svg viewBox="0 0 100 100"><ellipse cx="34" cy="18" rx="8" ry="20" fill="#fff" stroke="#f0d8e8" stroke-width="2"/><ellipse cx="66" cy="18" rx="8" ry="20" fill="#fff" stroke="#f0d8e8" stroke-width="2"/><ellipse cx="34" cy="20" rx="4" ry="13" fill="#ffd7e8"/><ellipse cx="66" cy="20" rx="4" ry="13" fill="#ffd7e8"/><rect x="24" y="30" width="52" height="48" rx="24" fill="#fff5f8"/><circle cx="40" cy="54" r="4.4" fill="#5a4a5e"/><circle cx="60" cy="54" r="4.4" fill="#5a4a5e"/><circle cx="41.5" cy="52.5" r="1.5" fill="#fff"/><circle cx="61.5" cy="52.5" r="1.5" fill="#fff"/><ellipse cx="33" cy="61" rx="4.5" ry="3" fill="#ffb0c8"/><ellipse cx="67" cy="61" rx="4.5" ry="3" fill="#ffb0c8"/><path d="M45 63 q5 5 10 0" stroke="#c08" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M46 44 l3 3 l3 -3" stroke="#e0709a" stroke-width="2" fill="none"/><rect x="38" y="74" width="24" height="18" rx="9" fill="#ffd7e8"/></svg>`,
  sakura:`<svg viewBox="0 0 100 100"><path d="M30 30 L20 8 L40 22z" fill="#e8c9a0"/><path d="M70 30 L80 8 L60 22z" fill="#e8c9a0"/><path d="M25 16 l-6 -6 M27 12 l-8 -2 M75 16 l6 -6 M73 12 l8 -2" stroke="#c9a878" stroke-width="2.5" stroke-linecap="round"/><rect x="26" y="24" width="48" height="52" rx="22" fill="#f0d8b8"/><circle cx="40" cy="50" r="4" fill="#5a4030"/><circle cx="60" cy="50" r="4" fill="#5a4030"/><circle cx="41.4" cy="48.6" r="1.4" fill="#fff"/><circle cx="61.4" cy="48.6" r="1.4" fill="#fff"/><ellipse cx="50" cy="60" rx="7" ry="5" fill="#fff" opacity=".8"/><ellipse cx="50" cy="58" rx="3.5" ry="2.5" fill="#8a6a4e"/><path d="M45 64 q5 3 10 0" stroke="#8a6a4e" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M34 42 q6 -4 12 0 M54 42 q6 -4 12 0" stroke="#c9a878" stroke-width="2" fill="none"/><circle cx="30" cy="30" r="5" fill="#ffb7d5"/><circle cx="27" cy="27" r="2" fill="#ff8fbc"/></svg>`,
  narr:`<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="16" fill="#f4eefb"/><text x="50" y="66" font-size="42" text-anchor="middle" fill="#9a7dff">✦</text></svg>`,
};

/* ---------------- backdrop ---------------- */
function bgFactory(){
  /* one plushie on the belt; tilt & style vary — one is upside-down (a defect escaping!) */
  const beltPlush=(x,tilt,flip,wonky)=>`
    <g transform="translate(${x},178)">
      <g class="plush-bob" style="animation-delay:${(x%7)/3}s">
      <g transform="rotate(${tilt} 16 13)${flip?' translate(0,26) scale(1,-1)':''}">
        <rect width="32" height="26" rx="11" fill="#fff7e8" stroke="#ffe6b8" stroke-width="2"/>
        <circle cx="10" cy="12" r="1.8" fill="#7a5"/><circle cx="22" cy="12" r="1.8" fill="#7a5"/>
        ${wonky?'<path d="M11 18 q5 -4 10 2" stroke="#c98" stroke-width="1.5" fill="none"/>':'<path d="M11 17 q5 4 10 0" stroke="#c98" stroke-width="1.5" fill="none"/>'}
        <ellipse cx="7" cy="16" rx="2.4" ry="1.7" fill="#ffc2d0" opacity=".8"/><ellipse cx="25" cy="16" rx="2.4" ry="1.7" fill="#ffc2d0" opacity=".8"/>
      </g></g>
    </g>`;
  const tilts=[-9,4,-3,11,0,-13,7,2,-6,9];
  const plushies=[...Array(10)].map((_,i)=>beltPlush(i*105, tilts[i], i===5, i===2)).join('');
  const rollers=[...Array(10)].map((_,i)=>`
    <g transform="translate(${44+i*90},236)"><g class="roller-in" style="animation-delay:${-i*.15}s">
      <circle r="10" fill="#8a6de0"/>
      <line x1="-6" y1="0" x2="6" y2="0" stroke="#6f55c8" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="0" y1="-6" x2="0" y2="6" stroke="#6f55c8" stroke-width="2.2" stroke-linecap="round"/>
      <circle r="3" fill="#5e46b5"/>
    </g></g>`).join('');
  const puffs=[0,1.6,3.2].map((d,i)=>`
    <g transform="translate(${162+i*3},46)"><ellipse class="puff-in" style="animation-delay:${d}s" rx="${9+i*2}" ry="${7+i}" fill="#fff" opacity="0"/></g>`).join('');
  const win=(x,y)=>`
    <g transform="translate(${x},${y})">
      <rect width="42" height="42" rx="8" fill="#bfd8f2"/>
      <rect x="3" y="3" width="36" height="36" rx="6" fill="#e8f3ff"/>
      <line x1="21" y1="3" x2="21" y2="39" stroke="#bfd8f2" stroke-width="3"/>
      <line x1="3" y1="21" x2="39" y2="21" stroke="#bfd8f2" stroke-width="3"/>
      <rect x="-3" y="38" width="48" height="7" rx="3.5" fill="#ffb7d5"/>
      <circle cx="8" cy="36" r="4" fill="#ffd9e8"/><circle cx="16" cy="37" r="3.4" fill="#ffcfe2"/>
    </g>`;
  const bird=(cls,y,d)=>`
    <g class="${cls}" style="animation-delay:${d}s"><g transform="translate(0,${y})">
      <path d="M0 0 q6 -7 12 0 q6 -7 12 0" stroke="#8a7a9e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </g></g>`;
  const crate=(x,y,r)=>`
    <g transform="translate(${x},${y}) rotate(${r})">
      <rect width="36" height="30" rx="4" fill="#e8c9a0" stroke="#cfa878" stroke-width="2"/>
      <line x1="0" y1="10" x2="36" y2="10" stroke="#cfa878" stroke-width="2"/>
      <text x="18" y="25" font-size="11" text-anchor="middle" fill="#a8825a">🧸</text>
    </g>`;
  const flower=(x,c)=>`
    <g transform="translate(${x},199)">
      <line x1="0" y1="0" x2="0" y2="-9" stroke="#7ec89a" stroke-width="2"/>
      <circle cy="-12" r="4" fill="${c}"/><circle cy="-12" r="1.6" fill="#fff2b0"/>
    </g>`;
  return `<svg class="bgart" viewBox="0 0 800 250" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe1ef"/><stop offset="1" stop-color="#d9ecff"/></linearGradient>
      <linearGradient id="roofg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc6dd"/><stop offset="1" stop-color="#ffa8cc"/></linearGradient>
    </defs>
    <rect width="800" height="250" fill="url(#sky)"/>
    <circle cx="720" cy="52" r="30" fill="#ffe08a" opacity=".85"/><circle cx="720" cy="52" r="42" fill="#ffe08a" opacity=".3"/>
    <!-- distant mountains -->
    <path d="M-20 150 L90 84 L200 150 Z" fill="#dcd0f2" opacity=".65"/>
    <path d="M90 84 L118 100 L102 100 Z" fill="#fff" opacity=".8"/>
    <path d="M560 150 L680 78 L800 150 Z" fill="#d4c8ee" opacity=".6"/>
    <path d="M680 78 L708 96 L692 96 Z" fill="#fff" opacity=".8"/>
    <path d="M300 150 L420 96 L560 150 Z" fill="#e4daf6" opacity=".55"/>
    <g class="cloudA" opacity=".9"><ellipse cx="130" cy="52" rx="44" ry="20" fill="#fff"/><ellipse cx="168" cy="48" rx="30" ry="17" fill="#fff"/></g>
    <g class="cloudB" opacity=".9"><ellipse cx="620" cy="42" rx="38" ry="17" fill="#fff"/><ellipse cx="585" cy="47" rx="26" ry="13" fill="#fff"/></g>
    <g class="cloudA" opacity=".55" style="animation-duration:40s;animation-delay:-12s"><ellipse cx="400" cy="34" rx="30" ry="12" fill="#fff"/></g>
    ${bird('bird',58,0)}${bird('bird2',44,0)}
    <ellipse cx="400" cy="230" rx="500" ry="70" fill="#c8f0dd"/>
    <!-- main hall -->
    <rect x="100" y="100" width="600" height="110" fill="#f6d9e8"/>
    <rect x="100" y="100" width="600" height="14" fill="#ff9dc4"/>
    <!-- gable roofs with shingle stripes -->
    <polygon points="100,100 205,64 310,100" fill="url(#roofg)"/>
    <path d="M128 91 L205 64 L282 91" stroke="#ff8fbc" stroke-width="3" fill="none"/>
    <path d="M156 81 L205 64 L254 81" stroke="#ff8fbc" stroke-width="3" fill="none"/>
    <polygon points="490,100 595,64 700,100" fill="url(#roofg)"/>
    <path d="M518 91 L595 64 L672 91" stroke="#ff8fbc" stroke-width="3" fill="none"/>
    <path d="M546 81 L595 64 L644 81" stroke="#ff8fbc" stroke-width="3" fill="none"/>
    <!-- windows -->
    ${win(148,128)}${win(233,128)}${win(518,128)}${win(603,128)}
    <!-- central tower: clock, sign, door, awning, flag -->
    <rect x="352" y="96" width="96" height="114" rx="10" fill="#c9b8ff"/>
    <rect x="352" y="96" width="96" height="12" rx="6" fill="#a98fe8"/>
    <polygon points="348,96 400,74 452,96" fill="#b09ae8"/>
    <g transform="translate(400,66)"><g class="flag-in"><path d="M0 0 L0 -16 L20 -11 L0 -6 Z" fill="#ff7fb0"/></g><line x1="0" y1="4" x2="0" y2="-16" stroke="#8a6de0" stroke-width="2"/></g>
    <circle cx="400" cy="118" r="13" fill="#fff5fb" stroke="#a98fe8" stroke-width="2.5"/>
    <line x1="400" y1="118" x2="400" y2="110" stroke="#8a6de0" stroke-width="2" stroke-linecap="round"/>
    <line x1="400" y1="118" x2="406" y2="120" stroke="#8a6de0" stroke-width="2" stroke-linecap="round"/>
    <rect x="362" y="138" width="76" height="17" rx="8" fill="#fff" opacity=".92"/>
    <text x="400" y="150" font-size="9.5" text-anchor="middle" fill="#9a7dff" font-family="'Baloo 2',sans-serif" font-weight="700">FUWA-FUWA MILL</text>
    <rect x="380" y="168" width="40" height="42" rx="6" fill="#8a6de0"/>
    <rect x="384" y="172" width="32" height="38" rx="5" fill="#a98fe8"/>
    <circle cx="412" cy="192" r="2.4" fill="#ffe08a"/>
    <path d="M374 168 h52 l-5 -10 h-42 Z" fill="#ffb7d5"/>
    <path d="M374 168 h52" stroke="#ff8fbc" stroke-width="3"/>
    <!-- wall gear -->
    <g transform="translate(474,116)"><g class="gear-in">
      <circle r="11" fill="#e8daf8" stroke="#b8a2e8" stroke-width="2"/>
      ${[0,45,90,135].map(a=>`<rect x="-2.5" y="-15" width="5" height="30" rx="2" fill="#b8a2e8" transform="rotate(${a})"/>`).join('')}
      <circle r="4" fill="#9a7dff"/>
    </g></g>
    <!-- chimneys -->
    <rect x="152" y="46" width="24" height="60" rx="8" fill="#e0d0f5"/>
    <rect x="150" y="42" width="28" height="8" rx="4" fill="#c9b0ee"/>
    <rect x="640" y="60" width="18" height="46" rx="7" fill="#e0d0f5"/>
    <rect x="638" y="56" width="22" height="7" rx="3.5" fill="#c9b0ee"/>
    ${puffs}
    <g transform="translate(646,58)"><ellipse class="puff-in" style="animation-delay:.9s" rx="7" ry="5" fill="#fff" opacity="0"/></g>
    <!-- lamppost, bushes & flowers -->
    <g transform="translate(66,140)">
      <line x1="0" y1="0" x2="0" y2="62" stroke="#a893c8" stroke-width="4"/>
      <circle cy="-6" r="8" fill="#fff2b0" stroke="#e8cc7a" stroke-width="2"/>
      <circle cy="-6" r="13" fill="#ffe08a" opacity=".25"/>
    </g>
    <ellipse cx="118" cy="204" rx="26" ry="12" fill="#a5dcbc"/>
    <ellipse cx="94" cy="207" rx="16" ry="8" fill="#8fd2ac"/>
    <ellipse cx="712" cy="205" rx="24" ry="11" fill="#a5dcbc"/>
    ${flower(140,'#ff9dc4')}${flower(103,'#c9b8ff')}${flower(122,'#ffcf5c')}${flower(700,'#ff9dc4')}${flower(726,'#c9b8ff')}
    <!-- conveyor -->
    <rect x="0" y="208" width="800" height="42" fill="#c9b8ff"/>
    <rect x="0" y="202" width="800" height="10" rx="5" fill="#9a7dff"/>
    ${rollers}
    <g class="belt-items">${plushies}</g>
    <!-- shipping crates at the end of the line -->
    ${crate(748,166,-4)}${crate(760,140,3)}
  </svg>`;
}

/* =====================================================================
   CHIPTUNE ENGINE — 8-bit background music, no audio files needed
   ===================================================================== */
const MUSIC={enabled:false,started:false,ctx:null,timer:null,step:0,nextTime:0,track:'main',noiseBuf:null};
const TRACKS={
  main:{ /* "Fuwa-Fuwa Workday" — bouncy C-major factory tune */
    bpm:116, melWave:'square', bassWave:'triangle', melGain:.042, bassGain:.085,
    mel:[72,76,79,81, 79,76,72,74, 76,79,81,84, 81,79,76,79,
         81,81,79,76, 74,74,76,79, 76,74,72,74, 76,74,72,0],
    bass:[48,0,55,0, 48,0,55,0, 45,0,52,0, 45,0,52,0,
          41,0,48,0, 41,0,48,0, 43,0,50,0, 43,0,50,0],
    hat:[1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,1,
         1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,1],
  },
  intro:{ /* "Mochi Lullaby-Waltz" — gentle, sweet title theme (D major, lilting) */
    bpm:114, melWave:'triangle', bassWave:'triangle', melGain:.052, bassGain:.07,
    mel:[74,0,71,69, 71,0,74,0, 73,71,69,71, 66,0,69,0,
         71,0,74,71, 69,0,73,0, 69,67,66,69, 71,0,0,0],
    bass:[50,0,57,0, 50,0,57,0, 55,0,62,0, 55,0,50,0,
          52,0,59,0, 55,0,62,0, 50,0,57,0, 57,0,50,0],
    hat:[1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0,
         1,0,0,1, 0,0,1,0, 1,0,0,1, 0,1,0,0],
  },
  dragon:{ /* "The Empress Reads" — slow A-minor tollgate theme */
    bpm:92, melWave:'square', bassWave:'triangle', melGain:.038, bassGain:.095,
    mel:[69,0,72,74, 76,0,72,0, 71,0,68,0, 64,0,68,0,
         69,0,72,0, 77,0,76,0, 68,0,71,0, 68,0,64,0],
    bass:[45,0,52,0, 45,0,52,0, 40,0,47,0, 40,0,47,0,
          41,0,48,0, 41,0,48,0, 40,0,47,0, 40,0,47,0],
    hat:[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0,
         1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
  },
};
function mFreq(m){return 440*Math.pow(2,(m-69)/12);}
function musicInit(){
  if(MUSIC.ctx) return true;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC) return false;
  MUSIC.ctx=new AC();
  const sr=MUSIC.ctx.sampleRate, buf=MUSIC.ctx.createBuffer(1,sr*.05,sr), d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
  MUSIC.noiseBuf=buf;
  return true;
}
function mNote(t,midi,dur,wave,gain){
  const c=MUSIC.ctx, o=c.createOscillator(), g=c.createGain();
  o.type=wave; o.frequency.value=mFreq(midi);
  g.gain.setValueAtTime(gain,t);
  g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t+dur+.03);
}
function mHat(t){
  const c=MUSIC.ctx, s=c.createBufferSource(), g=c.createGain();
  s.buffer=MUSIC.noiseBuf; g.gain.setValueAtTime(.014,t);
  g.gain.exponentialRampToValueAtTime(.0008,t+.04);
  s.connect(g); g.connect(c.destination); s.start(t);
}
function mScheduler(){
  const c=MUSIC.ctx, tr=TRACKS[MUSIC.track], stepDur=60/tr.bpm/2; /* 8th notes */
  while(MUSIC.nextTime<c.currentTime+.14){
    const i=MUSIC.step%tr.mel.length, t=Math.max(MUSIC.nextTime,c.currentTime);
    if(tr.mel[i]) mNote(t,tr.mel[i],stepDur*.92,tr.melWave,tr.melGain);
    if(tr.bass[i]) mNote(t,tr.bass[i],stepDur*1.7,tr.bassWave,tr.bassGain);
    if(tr.hat[i]) mHat(t);
    MUSIC.nextTime+=stepDur; MUSIC.step++;
  }
}
function musicSet(on){
  MUSIC.enabled=on;
  if(on){
    if(!musicInit()){MUSIC.enabled=false;return;}
    MUSIC.ctx.resume&&MUSIC.ctx.resume();
    MUSIC.nextTime=MUSIC.ctx.currentTime+.05; MUSIC.step=0;
    if(!MUSIC.timer) MUSIC.timer=setInterval(mScheduler,25);
    MUSIC.started=true;
  } else {
    if(MUSIC.timer){clearInterval(MUSIC.timer);MUSIC.timer=null;}
    MUSIC.ctx&&MUSIC.ctx.suspend&&MUSIC.ctx.suspend();
  }
  const badge=document.getElementById('mb');
  if(badge) badge.textContent=MUSIC.enabled?'🎵 Music on':'🔇 Music off';
}
function musicTrack(name){
  if(MUSIC.track===name) return;
  MUSIC.track=name; MUSIC.step=0;
  if(MUSIC.ctx&&MUSIC.enabled) MUSIC.nextTime=MUSIC.ctx.currentTime+.05;
}
function updateMusicBtn(){ const b=document.getElementById('musicToggle'); if(b){ b.textContent=MUSIC.enabled?'🎵':'🔇'; b.title=MUSIC.enabled?'Music on — tap to mute':'Music off — tap to play'; } }
/* Start automatically on the FIRST interaction inside the game (no button needed).
   We deliberately do not start before any interaction: embedded previews (e.g. the
   desktop app) can keep a blind-autoplaying page alive invisibly in the background. */
function autoStartMusic(){
  const arm=()=>{ if(!MUSIC.started && !MUSIC.userOff){ musicTrack(MUSIC.track||'intro'); musicSet(true); updateMusicBtn(); } };
  ['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,arm,{once:true,passive:true}));
  updateMusicBtn();
}
function resumeIfNeeded(){ if(MUSIC.enabled && MUSIC.ctx && MUSIC.ctx.state==='suspended' && MUSIC.ctx.resume) MUSIC.ctx.resume(); }

/* ---------------- global chrome: persistent music button + NPC cast rail ---------------- */
function buildChrome(){
  if(document.getElementById('musicToggle')) return;
  document.body.insertAdjacentHTML('beforeend',
    `<button id="musicToggle" aria-label="music" title="Music">🎵</button>`);
  const ids=['uni','capy','penny','miko','luna','torto','dragon','hana','sakura'];
  const rail=`<div class="castrail" id="castrail"><div class="rail-title">${L('Cast','登場人物')}</div>`+
    ids.map(id=>`<button class="castbtn" data-id="${id}" title="${PROFILES[id]?(S.lang==='ja'?PROFILES[id].name[1]:PROFILES[id].name[0]):id}">${ART[id]||''}</button>`).join('')+`</div>`;
  document.body.insertAdjacentHTML('beforeend',rail);
  const mb=document.getElementById('musicToggle');
  mb.onclick=(e)=>{ e.stopPropagation(); MUSIC.userOff=MUSIC.enabled; if(!MUSIC.started&&!MUSIC.enabled) musicTrack(MUSIC.track||'intro'); musicSet(!MUSIC.enabled); updateMusicBtn(); };
  document.querySelectorAll('#castrail .castbtn').forEach(b=>b.onclick=(e)=>{ e.stopPropagation(); openProfile(b.dataset.id); });
  updateMusicBtn();
}
function refreshCastRail(){ /* re-localise the rail titles when language changes */
  document.querySelectorAll('#castrail .castbtn').forEach(b=>{ const p=PROFILES[b.dataset.id]; if(p) b.title=(S.lang==='ja'?p.name[1]:p.name[0]); });
  const rt=document.querySelector('#castrail .rail-title'); if(rt) rt.textContent=L('Cast','登場人物');
}
function openProfile(id){
  const p=PROFILES[id]; if(!p) return;
  const i=S.lang==='ja'?1:0;
  const chip=(label,val)=>`<span class="pc-chip">${label}: ${val}</span>`;
  document.body.insertAdjacentHTML('beforeend',
    `<div class="notebook-overlay" id="pcov" style="z-index:56"><div class="profile-card">
      <div class="pc-head">
        <div class="pc-portrait">${ART[p.art]||ART.narr}</div>
        <div><div class="pc-name">${p.name[i]}</div><div class="pc-job">${p.job[i]}</div></div>
      </div>
      <div class="pc-meta">
        ${chip(L('Age','年齢'),p.age[i])}${chip(L('Gender','性別'),p.sex[i])}${chip(L('Species','種族'),p.species[i])}
      </div>
      <p class="pc-blurb">${p.blurb[i]}</p>
      <button class="btn pc-close" id="pcclose">${L('Close','閉じる')}</button>
    </div></div>`);
  const close=()=>{ const o=document.getElementById('pcov'); if(o) o.remove(); };
  document.getElementById('pcclose').onclick=close;
  document.getElementById('pcov').onclick=e=>{ if(e.target.id==='pcov') close(); };
}
window.openProfile=openProfile;

/* ---- character speech blabber ("blah blah" blips synced to typing) ----
   Each character has a base pitch + waveform; every few typed letters
   fires a short blip with random pitch wobble, Animal-Crossing style. */
const VOICE={
  uni:   {f:620,w:'triangle',g:.05},
  capy:  {f:300,w:'square',  g:.035},
  penny: {f:500,w:'square',  g:.038},
  miko:  {f:720,w:'triangle',g:.05},
  luna:  {f:400,w:'sine',    g:.055},
  torto: {f:200,w:'square',  g:.04},
  dragon:{f:250,w:'square',  g:.045},
  narr:  {f:440,w:'sine',    g:.02},
};
function blip(cls){
  if(!MUSIC.enabled||!MUSIC.ctx) return;
  const v=VOICE[cls]||VOICE.narr;
  const c=MUSIC.ctx, o=c.createOscillator(), g=c.createGain(), t=c.currentTime;
  o.type=v.w;
  o.frequency.setValueAtTime(v.f*(0.88+Math.random()*0.3),t);
  o.frequency.exponentialRampToValueAtTime(v.f*0.8,t+.05);   // little downward "wah"
  g.gain.setValueAtTime(v.g,t);
  g.gain.exponentialRampToValueAtTime(.0008,t+.06);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t+.08);
}

/* ---------------- character portraits ----------------
   Drop PNG portraits into an "art" folder next to this file
   (art/uni.png, art/capy.png, art/penny.png, art/miko.png,
    art/luna.png, art/torto.png, art/dragon.png).
   Missing files fall back to the built-in SVG faces automatically. */
function artHTML(id,mood){
  const src=mood?`art/${id}_${mood}.png`:`art/${id}.png`;
  const onerr=mood?`window.__artMoodFail(this,'${id}')`:`window.__artFail(this,'${id}')`;
  return `<img src="${src}" alt="" style="width:100%;height:100%;object-fit:cover;display:block" onerror="${onerr}">`;
}
window.__artFail=(el,id)=>{ const wrap=el.parentElement; if(wrap) wrap.innerHTML=ART[id]||ART.narr; };
window.__artMoodFail=(el,id)=>{ el.onerror=()=>window.__artFail(el,id); el.src=`art/${id}.png`; };

/* ---------------- helpers ---------------- */
const $ = id=>document.getElementById(id);
/* ---- project deadline countdown ---- */
const DEADLINE_DAYS=90;
const DEFINE_DAYS=10;          // the Empress allows ten days for DEFINE (incl. the review)
function defineLate(){ return daysUsed()>DEFINE_DAYS; }
function daysUsed(){ return Math.max(0,(S.day-1)) + (S.half?0.5:0) + (S.daysLost||0); }
function daysLeft(){ return Math.max(0, DEADLINE_DAYS - daysUsed()); }
function fmtDays(n){ return (Math.round(n*2)/2).toString(); }
function dayLabel(){
  const left=daysLeft();
  const col = left<20?'#d81b60':(left<45?'#e07b1a':'#5a8a3a');
  const slipEn=S.daysLost?` <span style="color:#e05;font-weight:700">(−${S.daysLost}d slips)</span>`:'';
  const slipJa=S.daysLost?` <span style="color:#e05;font-weight:700">（遅れ −${S.daysLost}日）</span>`:'';
  const dU=daysUsed(), dcol=dU>DEFINE_DAYS?'#d81b60':(dU>DEFINE_DAYS-2?'#e07b1a':'#5a8a3a');
  const defEn=` · <span style="color:${dcol};font-weight:800">Define day ${fmtDays(dU)}/${DEFINE_DAYS}</span>`;
  const defJa=` · <span style="color:${dcol};font-weight:800">Define ${fmtDays(dU)}/${DEFINE_DAYS}日目</span>`;
  return L(`⏳ <b style="color:${col};font-size:15px">${fmtDays(left)}</b> / ${DEADLINE_DAYS} days left${slipEn}${defEn}`,
           `⏳ 残り <b style="color:${col};font-size:15px">${fmtDays(left)}</b> / ${DEADLINE_DAYS}日${slipJa}${defJa}`); }
function tickHalfDay(){ S.half++; if(S.half>1){S.half=0;S.day++;} }
function drawScene(){
  $('scene').classList.remove('cine');
  $('scene').innerHTML = bgFactory()
   + `<div class="day-badge">${dayLabel()}</div>
      <div class="note-badge" id="nb">${L('📒 Notebook','📒 ノート')} (${S.have.length})</div>
      <span class="sparkle" style="top:26px;left:42%">✦</span>
      <span class="sparkle" style="top:64px;left:10%;animation-delay:.8s">✧</span>`;
  $('nb').onclick=openNotebook;
}
/* green+bold = fact/data (relevant even if it turns out to be the wrong metric);
   orange+italic = opinion / not grounded in facts and data */
function ncClass(t){ return (t==='ver'||t==='fact')?'nc-fact':'nc-op'; }
function openNotebook(){
  const cards=S.have.map(id=>{const c=CARDS[id];return `<div class="notecard ${ncClass(c.type)}" style="cursor:default;margin:6px 0"><span class="nc-txt">${c.txt}</span><span class="src">— ${c.src}</span></div>`}).join('')||`<p style="font-size:13px;color:#a89">${L('No notes yet. Go talk to people!','まだメモはありません。みんなに話を聞こう！')}</p>`;
  document.body.insertAdjacentHTML('beforeend',
    `<div class="notebook-overlay" id="nbov"><div class="notebook"><h3>${L('📒 Field Notebook','📒 フィールドノート')}</h3>${cards}
     <button class="btn" style="margin-top:10px" id="nbclose">${L('Close','閉じる')}</button></div></div>`);
  $('nbclose').onclick=()=>$('nbov').remove();
  $('nbov').onclick=e=>{if(e.target.id==='nbov')$('nbov').remove();};
}
function renderNotebook(newIds){
  const el=$('sidebook'); if(!el) return;
  const fresh=new Set(newIds||[]);
  const cards=[...S.have].reverse().map(id=>{
    const c=CARDS[id];
    return `<div class="notecard ${ncClass(c.type)} ${fresh.has(id)?'newcard-pop':''}"><span class="nc-txt">${c.txt}</span><span class="src">— ${c.src}</span></div>`;
  }).join('');
  el.innerHTML=`<h3>${L('📒 Field Notebook','📒 フィールドノート')} <span style="font-size:12px;color:#c4b586">(${S.have.length})</span></h3>
    <p class="nb-hint">${L('<b style="color:#2f8a4e">Green</b> = fact &amp; data (worth keeping, even if it turns out to be the wrong metric). <i style="color:#c9791b">Orange</i> = opinion, guess or hearsay. Check the source before you trust a note.','<b style="color:#2f8a4e">緑</b>＝事実・データ（たとえ後で違う指標だと分かっても残す価値あり）。<i style="color:#c9791b">オレンジ</i>＝意見・当て推量・伝聞。信じる前に出典を確かめて。')}</p>
    ${cards||`<p class="nb-empty">${L('Empty so far. Go talk to people — everything they tell you lands here.','まだ空っぽ。みんなに話を聞こう——聞いたことは全部ここに入る。')}</p>`}`;
}
function addCards(ids){
  ids.forEach(id=>{ if(!S.have.includes(id)) S.have.push(id); });
  /* update the notebook badge in place — do NOT redraw the whole scene, or we
     would wipe the current backdrop (that was the "cutscene flips to the factory" bug) */
  const nb=$('nb'); if(nb) nb.innerHTML=`${L('📒 Notebook','📒 ノート')} (${S.have.length})`;
  renderNotebook(ids);
}

/* ---------------- build-time NPC help lifeline ----------------
   A floating badge on each builder scene. One consult per deliverable; picking a
   person locks the deliverable to that person and costs a day of slip the Empress
   will notice. Added to $('scene') after drawWarroom so interact re-renders keep it. */
function addHelpBadge(deliv){
  const sc=$('scene'); if(!sc||!HELP[deliv]) return;
  const who=S.consultBy[deliv];
  const label=who?(L('🔒 Asked ','🔒 質問済み：')+who.split(' ')[0].replace(',','')):L('🆘 Ask someone (costs time)','🆘 誰かに質問（時間を消費）');
  sc.insertAdjacentHTML('beforeend',
    `<div class="note-badge" id="hb" style="top:auto;bottom:12px;left:12px;font-size:12px;${who?'opacity:.72':''}">${label}</div>`);
  $('hb').onclick=()=>openHelp(deliv);
}
/* In-panel help control, placed right by each builder's Lock button so it is
   impossible to miss. Uses inline onclick -> global openHelp. */
function helpControl(deliv){
  if(!HELP[deliv]) return '';
  const who=S.consultBy[deliv];
  if(who) return `<div class="feedback tip" style="text-align:left;margin-top:10px">🔒 ${L(`You already asked <b>${who}</b> about this one — one question per deliverable, and the Empress is counting the time it cost.`,`この成果物ではもう <b>${who}</b> に質問した——成果物ごとに1問だけ。皇帝はその時間の代償を数えている。`)}</div>`;
  return `<div class="help-cta" style="text-align:left;margin-top:12px;padding-top:10px;border-top:1px dashed #e6cbe0">
      <button class="btn ghost" style="border-color:#d46fb8;color:#b23a8e" onclick="openHelp('${deliv}')">${L('🆘 Missing information? Ask one NPC — costs time','🆘 情報が足りない？NPCに1人だけ質問する — 時間を消費')}</button>
      <div class="hint" style="text-align:left;margin-top:4px">${L('You should gather evidence in interviews first. This is a last resort: one person, this deliverable only, and the dragon will notice the slip.','本来は聞き取りで証拠を集めておくもの。これは最終手段——1人だけ、この成果物のみ、そして竜はその遅れを見逃さない。')}</div>
    </div>`;
}
window.openHelp=openHelp;
/* VOC decision row: the BUTTON is the action the player decides on; the reasoning
   sits to the left in italics as the "thinking behind it". */
function vc(id,action,think){
  return `<div class="crow"><span class="cthink">${think}</span><button class="btn cact" id="${id}">${action}</button></div>`;
}
function openHelp(deliv){
  const H=HELP[deliv]; if(!H) return;
  const done=S.consultBy[deliv];
  if(done){
    document.body.insertAdjacentHTML('beforeend',
      `<div class="notebook-overlay" id="hpov"><div class="notebook">
        <h3>${L('🆘 One question, already spent','🆘 質問はもう使った')}</h3>
        <p style="font-size:13px;color:#a89">${L(`For this deliverable you already asked <b>${done}</b> — and you may only ask one person here. Work with what you have. (The Empress is keeping count of these.)`,`この成果物ではもう <b>${done}</b> に質問した——ここで聞けるのは1人だけ。手持ちの情報で進めよう。（皇帝はこの回数を数えている。）`)}</p>
        <button class="btn" id="hpclose">${L('Close','閉じる')}</button></div></div>`);
  } else {
    const opts=H.q.map((o,i)=>`<button class="choice" data-i="${i}"><span class="tag">${o.who}</span>${o.ask}</button>`).join('');
    document.body.insertAdjacentHTML('beforeend',
      `<div class="notebook-overlay" id="hpov"><div class="notebook">
        <h3>${L('🆘 Ask ONE person about','🆘 1人だけに質問：')} ${H.title}</h3>
        <p style="font-size:13px;color:#a89">${L('You should have gathered this during interviews. You may still reach out mid-build — but only to <b>one</b> person for this deliverable, and it costs a day of slip the Empress will notice at the tollgate. Choose the right person.','本来は聞き取りで集めておくもの。作成中でも連絡は取れる——ただしこの成果物につき<b>1人</b>だけ、そして1日の遅れが生じ、トールゲートで皇帝に気づかれる。相手は慎重に選ぶこと。')}</p>
        <div class="choices">${opts}</div>
        <button class="btn ghost" id="hpcancel">${L('Never mind — keep building','やめておく — 作成を続ける')}</button></div></div>`);
    document.querySelectorAll('#hpov .choice[data-i]').forEach(b=>{
      b.onclick=()=>{
        const o=H.q[+b.dataset.i];
        $('hpov').remove();
        S.consultBy[deliv]=o.who; S.consults++; S.daysLost+=1;
        if(o.unlockVoc) S.vocUnlocked=true;
        const back=S.scene;                         // re-enter current builder (progress lives in S)
        /* the PLAYER asks the one question, THEN the NPC answers — and it waits for a
           Continue click so the answer can actually be read (no flash back to the build) */
        say(nm('You'),'player',o.ask,()=>{
          say(o.who,o.cls+(o.mood?':'+o.mood:''),o.a,()=>{
            addCards(o.cards);
            interact(`<div class="feedback tip">${L('📒 Noted — their answer is in your notebook. That question cost a day of slip.','📒 メモした——答えはノートに入った。この質問で1日の遅れ。')}</div>
              <button class="btn" id="nx">${L('Back to building ✦','作成に戻る ✦')}</button>`);
            $('nx').onclick=()=>go(back);
          });
        });
      };
    });
  }
  const c=$('hpclose'); if(c) c.onclick=()=>$('hpov').remove();
  const cc=$('hpcancel'); if(cc) cc.onclick=()=>$('hpov').remove();
  $('hpov').onclick=e=>{if(e.target.id==='hpov')$('hpov').remove();};
}

/* ---------------- cutscene stages ---------------- */
function drawGates(){
  $('scene').classList.add('cine');
  $('scene').innerHTML=
   `<img class="cine-bg-blur" src="art/scene_gates.png" onerror="this.style.display='none'">
    <img class="cine-bg" src="art/scene_gates.png" onerror="this.style.display='none'">
    <img class="actor" id="act-player" src="art/player_body.png" style="left:-34%"
      onerror="this.classList.add('as-card');this.onerror=()=>window.__artFail(this,'player');this.src='art/player.png'">
    <img class="actor flip" id="act-uni" src="art/uni_body.png" style="right:-34%"
      onerror="this.classList.add('as-card');this.onerror=()=>window.__artFail(this,'uni');this.src='art/uni.png'">
    <span class="sparkle" style="top:26px;left:44%">✦</span>
    <span class="sparkle" style="top:60px;left:12%;animation-delay:.8s">✧</span>`;
}
function walkIn(id,side,pct){
  const el=$(id); if(!el) return;
  el.classList.add('bob');
  requestAnimationFrame(()=>{ el.style[side]=pct; });
  setTimeout(()=>el.classList.remove('bob'),2400);
}
function drawWarroom(){
  $('scene').classList.add('cine');
  $('scene').innerHTML=
   `<img class="cine-bg-blur" src="art/scene_warroom.png" onerror="this.style.display='none';this.parentElement.classList.add('board-fallback')">
    <img class="cine-bg" src="art/scene_warroom.png" onerror="this.style.display='none'">
    <div class="day-badge">${dayLabel()}</div>
    <div class="note-badge" id="nb">${L('📒 Notebook','📒 ノート')} (${S.have.length})</div>
    <span class="sparkle" style="top:26px;left:44%">✦</span>`;
  $('nb').onclick=openNotebook;
}
/* Generic landscape backdrop for the non-cutscene scenes. Loads art/<name>.png
   (16:9). If the image is missing it simply reveals the animated factory SVG
   underneath — so the game looks identical until you drop the artwork in. */
function drawBackdrop(name){
  $('scene').classList.add('cine');
  $('scene').innerHTML = bgFactory()      // fallback layer, hidden when the image loads
   + `<img class="cine-bg-blur" src="art/${name}.png" onerror="this.remove()">
      <img class="cine-bg" src="art/${name}.png" onerror="this.remove()">
      <div class="day-badge">${dayLabel()}</div>
      <div class="note-badge" id="nb">${L('📒 Notebook','📒 ノート')} (${S.have.length})</div>`;
  $('nb').onclick=openNotebook;
}
function drawBoardroom(mood){
  $('scene').classList.add('cine');
  $('scene').innerHTML=
   `<img class="cine-bg-blur" src="art/scene_boardroom.png" onerror="this.style.display='none';this.parentElement.classList.add('board-fallback')">
    <img class="cine-bg" src="art/scene_boardroom.png" onerror="this.style.display='none'">
    <div class="smokebox" id="smokebox"></div>
    <img class="boardbody r" id="drgcard" src="art/dragon_body.png" onerror="window.__artFail(this,'dragon')">
    <img class="boardbody l" id="plycard" src="art/player_body.png" onerror="this.style.display='none'">
    <div class="day-badge">${dayLabel()}</div>
    <div class="note-badge" id="nb">${L('📒 Notebook','📒 ノート')} (${S.have.length})</div>`;
  $('nb').onclick=openNotebook;
}
/* full-body figures have no per-mood art, so we convey mood with CSS classes
   (plus the smoke bursts and scene shake) instead of swapping the image */
function setDragonMood(m){
  const el=$('drgcard'); if(!el) return;
  el.classList.remove('mood-furious','mood-approving','mood-softened');
  if(m==='furious') el.classList.add('mood-furious');
  else if(m==='approving'||m==='softened') el.classList.add('mood-'+m);
}
function setPlayerMood(m){
  const el=$('plycard'); if(!el) return;
  el.classList.remove('mood-nervous','mood-determined');
  if(m==='nervous'||m==='determined') el.classList.add('mood-'+m);
}
function smokeBurst(n){
  const box=$('smokebox'); if(!box) return;
  for(let i=0;i<(n||2);i++){
    const s=document.createElement('span'); s.className='smokepuff';
    s.style.left=(60+Math.random()*22)+'%'; s.style.animationDelay=(i*0.28)+'s';
    box.appendChild(s); setTimeout(()=>s.remove(),2800);
  }
}
function shakeScene(){ const sc=$('scene'); sc.classList.remove('shake'); void sc.offsetWidth; sc.classList.add('shake'); }
/* dragon reaction based on how a tollgate page went */
function dragonReact(beatsHtml){
  if(beatsHtml.includes('badf')){ setDragonMood('furious'); smokeBurst(2); setPlayerMood('nervous'); }
  else if(beatsHtml.includes('tip')){ setDragonMood('reading'); }
  else { setDragonMood('approving'); setPlayerMood('determined'); }
}


/* ---------- generic drag/tap sorter used by Scope and Stakeholders ---------- */
function sorterUI(cfg){
  /* cfg: {state, items, cols:[[key,labelEn,labelJa,subEn,subJa]], gridClass, lockId, lockLabel(en,ja), onLock, help} */
  const st=cfg.state;
  function render(){
    const placed=new Set(cfg.cols.flatMap(c=>st[c[0]]));
    const avail=i=>!cfg.items[i].need||S.have.includes(cfg.items[i].need);
    const nAvail=cfg.items.filter((it,i)=>avail(i)).length;
    const colHtml=k=>st[k].map(i=>`<div class="placed-chip" data-rm="${i}" data-col="${k}">${L(cfg.items[i].en,cfg.items[i].ja)} ✕</div>`).join('');
    const cols=cfg.cols.map(c=>`<div class="sipoc-col" data-col="${c[0]}"><h5>${L(c[1],c[2])}${c[3]?`<small>${L(c[3],c[4])}</small>`:''}</h5>${colHtml(c[0])}</div>`).join('');
    const complete=placed.size>=nAvail;
    interact((cfg.axes||'')+`<div class="${cfg.gridClass}">${cols}</div>
      <div class="chip-pool" id="pool">${cfg.items.map((it,i)=>(placed.has(i)||!avail(i))?'':`<div class="chip" data-i="${i}" draggable="true">${L(it.en,it.ja)}</div>`).join('')}</div>
      <div class="hint">${L('Drag each item into place (or tap an item, then tap a box).','各項目をドラッグして配置（または項目をタップしてから枠をタップ）。')}</div>
      <button class="btn" id="${cfg.lockId}">${complete?L(cfg.lockEn,cfg.lockJa):L(cfg.lockEn+' (items unsorted — risky)',cfg.lockJa+'（未分類あり——リスク）')}</button>`+(cfg.help?helpControl(cfg.help):''));
    let sel=null, dragIdx=null;
    document.querySelectorAll('.chip[data-i]').forEach(ch=>{
      ch.onclick=()=>{ document.querySelectorAll('.chip').forEach(x=>x.classList.remove('sel')); sel=+ch.dataset.i; ch.classList.add('sel');
        document.querySelectorAll('.sipoc-col[data-col]').forEach(c=>c.classList.add('hl')); };
      ch.addEventListener('dragstart',e=>{ dragIdx=+ch.dataset.i; ch.classList.add('dragging'); try{e.dataTransfer.setData('text/plain',String(dragIdx));}catch(_){ } });
      ch.addEventListener('dragend',()=>{ document.querySelectorAll('.chip').forEach(x=>x.classList.remove('dragging')); document.querySelectorAll('.sipoc-col').forEach(c=>c.classList.remove('dragover')); });
    });
    document.querySelectorAll('.sipoc-col [data-rm]').forEach(pc=>{
      pc.setAttribute('draggable','true');
      pc.addEventListener('dragstart',e=>{ dragIdx=+pc.dataset.rm; const c=pc.dataset.col; st[c]=st[c].filter(x=>x!==dragIdx); try{e.dataTransfer.setData('text/plain',String(dragIdx));}catch(_){ } });
      pc.addEventListener('dragend',()=>render());
    });
    document.querySelectorAll('.sipoc-col[data-col]').forEach(col=>{
      col.addEventListener('dragover',e=>{ e.preventDefault(); col.classList.add('dragover'); });
      col.addEventListener('dragleave',()=>col.classList.remove('dragover'));
      col.addEventListener('drop',e=>{ e.preventDefault(); col.classList.remove('dragover'); if(dragIdx===null) return; st[col.dataset.col].push(dragIdx); dragIdx=null; render(); });
      col.onclick=(e)=>{
        if(e.target.dataset.rm!==undefined && e.target.dataset.col){ const i=+e.target.dataset.rm, c=e.target.dataset.col; st[c]=st[c].filter(x=>x!==i); render(); return; }
        if(sel===null) return; st[col.dataset.col].push(sel); sel=null; render();
      };
    });
    const lb=$(cfg.lockId); if(lb) lb.onclick=cfg.onLock;
  }
  render();
}

let typeTimer=null;
/* ---- sentence-aware pagination: the text window never scrolls ---- */
function splitSentences(t){
  const out=[]; let cur='';
  const closers='"”’)\]」』）';
  const abbr=/(?:^|\s)(Mr|Ms|Mrs|Dr|St|No|vs|etc|e\.g|i\.e)\.$/;
  for(let i=0;i<t.length;i++){
    const ch=t[i]; cur+=ch;
    const isJ='。！？'.includes(ch), isW='.!?…'.includes(ch);
    if(!(isJ||isW)) continue;
    let j=i+1;
    while(j<t.length && closers.includes(t[j])){ cur+=t[j]; j++; }
    const atEnd=j>=t.length, nxt=t[j]||'';
    if(isJ || atEnd || /\s/.test(nxt)){
      if(isW && !atEnd && abbr.test(cur.trim())){ i=j-1; continue; }
      while(j<t.length && /\s/.test(t[j])){ cur+=t[j]; j++; }
      out.push(cur); cur=''; i=j-1;
    } else { i=j-1; }
  }
  if(cur) out.push(cur);
  return out;
}
function paginate(el,text){
  const sents=splitSentences(text);
  const fits=str=>{ el.innerHTML=str+'<span class="more">▼</span>'; return el.scrollHeight<=el.clientHeight+2; };
  const pages=[]; let cur='';
  const pushWords=(chunk)=>{
    const words=chunk.split(/(\s+)/); let c=cur;
    for(const w of words){ if(!w) continue; const trial=c+w;
      if(fits(trial)||!c.trim()) c=trial; else { pages.push(c.trim()); c=w.trimStart(); } }
    cur=c;
  };
  for(const sn of sents){
    const trial=cur+sn;
    if(fits(trial)) cur=trial;
    else if(!cur.trim()) pushWords(sn);
    else { pages.push(cur.trim()); if(fits(sn)) cur=sn; else { cur=''; pushWords(sn); } }
  }
  if(cur.trim()) pages.push(cur.trim());
  el.innerHTML='';
  return pages.length?pages:[''];
}
window.__paginate=paginate; window.__splitSentences=splitSentences;

let _sayCbDepth=0;
function say(speaker, cls, text, cb, mood){
  if(_sayCbDepth>0){ /* called from a previous line's callback: wait for the player before the next speaker starts */
    const nb=$('nextbtn'), el0=$('text'); const args=[speaker,cls,text,cb,mood];
    const fire=()=>{ if(nb) nb.style.display='none'; el0.onclick=null; const d=_sayCbDepth; _sayCbDepth=0; try{ say.apply(null,args); } finally{ _sayCbDepth=d; } };
    if(nb){ nb.textContent=`${L('Next','次')}: ${String(speaker).split(' ')[0]} ▸`; nb.style.display='inline-block'; nb.onclick=fire; }
    el0.onclick=fire; return;
  }
  const [base,inlineMood]=(cls||'narr').split(':');
  $('avatar').innerHTML = (base==='narr')?ART.narr:artHTML(base,mood||inlineMood);
  $('speaker').textContent = speaker; $('speaker').className='speaker '+base;
  const el=$('text'); clearInterval(typeTimer);
  const nb=$('nextbtn'); if(nb){ nb.style.display='none'; nb.textContent=L('Next ▸','次へ ▸'); }
  const pages=paginate(el,text);
  let pi=0, i=0, typing=false;
  function finishPage(){
    clearInterval(typeTimer); typing=false;
    const last=pi>=pages.length-1;
    el.innerHTML=pages[pi]+(last?'':'<span class="more">▼</span>');
    if(last){ if(cb){ const f=cb; cb=null; _sayCbDepth++; try{ f(); } finally{ _sayCbDepth--; } } }
    else if(nb) nb.style.display='inline-block';
  }
  function startPage(){
    if(nb) nb.style.display='none';
    i=0; typing=true; el.innerHTML='';
    const pg=pages[pi];
    typeTimer=setInterval(()=>{
      const ch=pg[i-1];
      if(i%3===1 && ch && !/[\s、。，．！？…「」『』（）()【】・\-—*.,!?"'’“”:;]/.test(ch)) blip(base);   // speech blabber
      el.innerHTML=pg.slice(0,i)+'<span class="cursor">|</span>'; i++;
      if(i>pg.length) finishPage();
    },13);
  }
  function advance(){
    if(typing){ finishPage(); return; }
    if(pi<pages.length-1){ pi++; startPage(); }
  }
  el.onclick=advance;
  if(nb) nb.onclick=advance;
  startPage();
}
function interact(html){ $('interact').innerHTML=html; }
function banner(txt){ const b=$('banner'); if(!txt){b.style.display='none';return;} b.style.display='block'; b.textContent=txt; }
function narrate(txt){ const n=$('narration'); if(!n) return; if(!txt){n.style.display='none';return;} n.style.display='block'; n.innerHTML='✦ '+txt; }

let STEPS=[['🚀','Kickoff'],['🗣️','Interviews'],['🧱','Block Diagram'],['🗂️','SIPOC'],['🧭','Scope'],['💬','VOC'],['🧩','Stakeholders'],['📝','Problem'],['🎯','Objective'],['🐉','Tollgate']];
function renderTracker(step){
  $('tracker').innerHTML = STEPS.map((s,i)=>{
    let cls='phase'; if(i===step)cls+=' active'; else if(i<step)cls+=' done';
    return `<div class="${cls}">${s[0]} ${s[1]}</div>`;}).join('');
}

/* =====================================================================
   TOLLGATE EVALUATION — the hidden consequence engine
   ===================================================================== */
function evalTollgate(){
  const crit=[], minor=[];
  const ps=S.ps;
  /* ---- problem statement (fragment-based) ---- */
  if(!ps.base) crit.push('mag_missing');
  else if(ps.base.v==='anec') crit.push('mag_anecdote');
  else if(ps.base.v==='wrongfit' && !minor.includes('muddled')) minor.push('muddled');
  else if(ps.base.v==='inspect' && !minor.includes('metric_mismatch')) minor.push('metric_mismatch');
  if(['date','metric','target','copq'].some(k=>!ps[k]) && !crit.includes('ps_incomplete')) crit.push('ps_incomplete');
  for(const k of ['date','metric','base','target','copq']){
    const f=ps[k]; if(!f) continue;
    if(f.v==='blame' && !crit.includes('blame')) crit.push('blame');
    if(f.v==='sol' && !crit.includes('solution')) crit.push('solution');
    if(f.v==='cause' && !crit.includes('cause')) crit.push('cause');
    if(f.v==='op' && !minor.includes('opinion')) minor.push('opinion');
    if(k==='date' && f.v==='anec' && !minor.includes('muddled')) minor.push('muddled');
    if(k==='metric' && f.v==='inspect' && !crit.includes('metric_gameable')) crit.push('metric_gameable');
    if(k==='metric' && f.v==='time' && !crit.includes('metric_time')) crit.push('metric_time');
    if(k==='metric' && f.v==='vague' && !minor.includes('vague_what')) minor.push('vague_what');
    if(k==='target' && f.v==='unreal' && !minor.includes('obj_unreal')) minor.push('obj_unreal');
    if(k==='target' && f.v==='vague' && !minor.includes('target_vague')) minor.push('target_vague');
    if(k==='target' && f.v==='inspect' && !minor.includes('metric_mismatch')) minor.push('metric_mismatch');
    if(k==='copq' && f.v==='vague' && !minor.includes('copq_vague')) minor.push('copq_vague');
  }
  /* ---- objective statement ---- */
  const o=S.obj;
  if(!o.verb||!o.metric||!o.base||!o.target||!o.when) crit.push('obj_missing');
  else{
    if(o.base.v==='anec') crit.push('obj_anecdote');
    if(o.how && o.how.v==='how') crit.push('obj_how');
    if(o.metric.v==='inspect' && !crit.includes('metric_gameable')) crit.push('metric_gameable');
    if(o.metric.v==='time' && !crit.includes('metric_time')) crit.push('metric_time');
    if((o.base.v==='inspect'||o.target.v==='inspect') && !minor.includes('metric_mismatch')) minor.push('metric_mismatch');
    ['verb','metric','target','when'].forEach(k=>{
      if(['vague','off'].includes(o[k].v) && !minor.includes('obj_vague')) minor.push('obj_vague');
      if(o[k].v==='unreal' && !minor.includes('obj_unreal')) minor.push('obj_unreal');
    });
  }
  /* ---- block diagram ---- */
  const flowOK = S.flow && S.flow.every((v,i)=>v===i);
  if(!flowOK) crit.push('flow');
  /* ---- sipoc ---- */
  let errs=0;
  for(const col of ['S','I','O','C','X']){
    S.sipoc[col].forEach(idx=>{ if(SIPOC_ITEMS[idx].k!==col) errs++; });
  }
  const placedCount=['S','I','O','C','X'].reduce((a,c)=>a+S.sipoc[c].length,0);
  errs += SIPOC_ITEMS.length - placedCount;
  if(errs>2) crit.push('sipoc'); else if(errs>0) minor.push('sipoc_minor');
  /* ---- voice of the customer ---- */
  const trueMarked = S.voc.voc.filter(id=>{const v=VOCS.find(x=>x.id===id);return v&&v.voc;});
  const falseMarked = S.voc.voc.filter(id=>{const v=VOCS.find(x=>x.id===id);return v&&!v.voc;});
  if(trueMarked.length===0) crit.push('voc_missing');
  if(falseMarked.length>0) crit.push('voc_internal');
  const availTrue=VOCS.filter(v=>v.voc&&(!v.need||S.vocUnlocked)).length;
  if(trueMarked.length>0 && trueMarked.length<availTrue && !minor.includes('voc_missed')) minor.push('voc_missed');
  for(const k of Object.keys(S.ctq)){
    if(S.ctq[k]==='sol' && !crit.includes('ctq_solution')) crit.push('ctq_solution');
    if(S.ctq[k]==='vague' && !minor.includes('ctq_vague')) minor.push('ctq_vague');
  }
  if((!S.ctq.thread||!S.ctq.rework) && !minor.includes('voc_int_missed')) minor.push('voc_int_missed');
  /* ---- SCOPE ---- */
  {
    const sc=S.scope||{IN:[],OUT:[],LATER:[]};
    const placed={}; for(const col of ['IN','OUT','LATER']) sc[col].forEach(i=>placed[i]=col);
    let coreOut=0, creepIn=0, contam=false, other=0, unplaced=0;
    SCOPE_ITEMS.forEach((it,i)=>{
      const col=placed[i];
      if(!col){ unplaced++; return; }
      if(col===it.k) return;
      if(it.k==='IN') coreOut++;
      else if(col==='IN' && (it.trap==='solution'||it.trap==='blame')) contam=true;
      else if(col==='IN' && it.trap==='creep') creepIn++;
      else other++;
    });
    if(unplaced>=SCOPE_ITEMS.length-2) crit.push('scope_incomplete');
    else {
      if(contam) crit.push('scope_contam');
      if(creepIn>=2) crit.push('scope_creep'); else if(creepIn===1) other++;
      if(coreOut>=2) crit.push('scope_core'); else if(coreOut===1) other++;
      other+=unplaced;
      if(other>=3) crit.push('scope_muddled'); else if(other>0) minor.push('scope_minor');
    }
  }
  /* ---- STAKEHOLDERS ---- */
  {
    const st=S.stake||{MC:[],KS:[],KI:[],MO:[]};
    const placed={}; for(const col of ['MC','KS','KI','MO']) st[col].forEach(i=>placed[i]=col);
    let other=0, unplaced=0, nAvail=0;
    STAKE_ITEMS.forEach((it,i)=>{
      if(it.need && !S.have.includes(it.need)) return;
      nAvail++;
      const col=placed[i];
      if(!col){ unplaced++; return; }
      if(col===it.k) return;
      if(it.id==='empress') crit.push('stake_empress');
      else if((it.id==='sakura'||it.id==='hana') && col==='MO') crit.push('stake_customer');
      else other++;
    });
    if(unplaced>=nAvail-2) crit.push('stake_incomplete');
    else {
      other+=unplaced;
      if(other>=3) crit.push('stake_muddled'); else if(other>0) minor.push('stake_minor');
    }
  }
  /* ---- SCHEDULE ---- */
  if(defineLate() && !minor.includes('late')) minor.push('late');
  return {crit,minor,sipocErrs:errs};
}
window.__S=S; window.__eval=evalTollgate;

/* ---------------- teaching layer ----------------
   Every flag has a plain-language lesson: what went wrong, why it
   matters, and where the fix lives. Shown as Uni's gentle coaching
   at the tollgate and summarized on the rejection/rework screens. */
const LESSON={
  metric_gameable:{t:'Primary metric can be gamed',d:'Passing final inspection is NOT the same as the customer receiving a good product. The inspection failure rate (12.6%) only counts what the gate CATCHES — and a plushie can sail through inspection and still come apart in a child’s hands a week later. Commit the whole project to that number and the fastest way to "win" is to loosen the gate: flag fewer, and the 12.6% falls to 2% while the toys reaching children as returns quietly CLIMB. The true primary metric is the DEFECT RATE REACHING CUSTOMERS — the returns, the escaped defects. You cannot fake it by looking away, and driving it down forces you to close the real gaps in the process rather than just relaxing the gate. Track the inspection rate as a secondary check, never as the goal.'},
  metric_mismatch:{t:'Baseline/target do not match the metric',d:'Your primary metric is the defect rate REACHING CUSTOMERS (baseline 4.8%, target ≤0.5%) — but a figure on your charter is the INSPECTION number (12.6% caught, 2% target). Those describe two different things. The baseline and target must measure the SAME dial as your primary metric, or the objective is incoherent. Use the escaped-defect figures throughout.'},
  metric_time:{t:'Speed is a guardrail, not the goal',d:'You chose THROUGHPUT — plushies shipped per day — as the primary metric. This project is about QUALITY. If you chase speed as the headline number, the fastest way to win is to skip checks and ship faster, sending even more defects out the door. Throughput belongs on the charter as a SECONDARY / guardrail metric — "improve quality without slowing the line" — so it protects against over-correcting. It must never be the primary. Capy means well, but leadership liking "fast" is exactly the trap.'},
  consulted:{t:'Asked for evidence mid-build',d:'Define runs in order: interview and gather FIRST, verify, and only then assemble the charter. Reaching out to an expert while you are already filling in blanks means the groundwork was rushed — it costs schedule time and it shows. Do the legwork up front and the deliverables almost build themselves; a flawless review is only possible when nothing had to be chased at the last minute.'},
  scope_contam:{t:'A solution and/or blame written into the scope',d:'Scope is the boundary of the PROCESS you will study — not a shopping list and not a list of people to punish. "Buy the TurboStitch" is an Improve-phase decision the data has not earned; "discipline the night shift" is blame wearing a project badge. Both belong OUT of scope by definition.'},
  scope_creep:{t:'Scope creep',d:'Morale of the whole factory, a supplier’s farming methods, a retailer’s shelf displays — each is a project of its own. Scope creep is how projects die politely: every extra boundary dilutes the team, the calendar and the data. Draw the line around ONE process: your block diagram, receiving to shipping.'},
  scope_core:{t:'The core process is outside the scope',d:'The stitching line, the smile step, the inspection gate, the rework — these ARE the project. Putting them out of scope leaves you studying the edges of a problem instead of its heart. Your SIPOC already told you where the boundaries lie: first block to last block.'},
  scope_muddled:{t:'Scope boundaries muddled',d:'Three or more items on the wrong side of the line. A good scope test: is it inside the block diagram? Then it is IN. Is it a fix or a culprit? OUT. Is it real work that belongs to Analyze or Improve? PARKING LOT — noted, not forgotten, not now.'},
  scope_minor:{t:'A scope item on the wrong side',d:'Close. Re-check the borderline items: field data from returns is IN (it measures your output); proving causes and fixing effects wait for later phases; anything belonging to someone else’s process is OUT.'},
  scope_incomplete:{t:'Scope left undefined',d:'A project without boundaries cannot be planned, staffed or finished. Sort every item — IN, OUT, or parked for later.'},
  stake_empress:{t:'The Champion is not managed closely',d:'The Empress funds the project, removes barriers and closes every tollgate. High power, high interest — she belongs in MANAGE CLOSELY, always. Anywhere else and your sponsor learns about your project from rumors.'},
  stake_customer:{t:'A customer filed under “monitor”',d:'Ms. Sakura can pause orders — that is power. Hana and the children are the reason the project exists — that is interest. Customers are never merely monitored: they are managed closely or, at the least, kept informed.'},
  stake_muddled:{t:'Stakeholder grid muddled',d:'Ask two questions of each name: can they CHANGE the project’s fate (power)? Do they CARE about its outcome (interest)? High/high → manage closely. High power, low interest → keep satisfied. Low power, high interest → keep informed. Low/low → monitor.'},
  stake_minor:{t:'A stakeholder in the wrong quadrant',d:'Nearly right. Suppliers with no stake in the outcome are monitored; operators and care staff who live with the results are kept informed; the treasury is kept satisfied.'},
  stake_incomplete:{t:'Stakeholders left unplaced',d:'Every name on the board is someone who can help or hurt this project. Place them all — the grid IS the communication plan.'},
  late:{t:'Define ran over its allotment',d:'The Empress granted ten days for Define. Every chased signature, every mid-build consult, every rebuilt conversation costs calendar. Discipline in Define is what buys you time in Analyze — the phase that actually needs it.'},
  flow:{t:'Block diagram out of order',d:'A block diagram must mirror the real line, step by step. When it does not, every later analysis points at the wrong places. The fix is simple: ask the people who live on the floor — Torto can recite the true order from forty years of memory (receive → cut → sew → stuff → stitch smile → close seam → inspect → ship).'},
  sipoc:{t:'SIPOC columns mixed up',d:'Remember the flow of the letters: Suppliers provide the Inputs, the Process transforms them into Outputs, and Customers receive those outputs. Attitudes, moon phases and machines you might someday buy are none of these — they go in the bin.'},
  sipoc_minor:{t:'A few SIPOC items misplaced',d:'Almost right — re-check each item by asking: does someone SUPPLY it, is it fed INTO the process, does the process PRODUCE it, or does someone RECEIVE it?'},
  voc_missing:{t:'No real customer voice',d:'A VOC table needs the customer speaking in their own words — complaint letters, direct quotes, retailer requests. Miko collects all of them; asking her what customers say (or to see the letters) is how you earn them. Without VOC, "quality" is just the factory guessing.'},
  voc_internal:{t:'Factory voices listed as customers',d:'Capy and Torto work here — they are the process, not the customer. Only people who RECEIVE the output (children, toy shops) belong in the VOC column. Internal opinions can be useful elsewhere, but never as the customer\'s voice.'},
  voc_missed:{t:'A customer voice went uncaptured',d:'Anyone who receives your output counts — the child who hugs it AND the shop that sells it. Every uncaptured voice is a requirement your charter silently ignores.'},
  ctq_solution:{t:'A solution disguised as a CTQ',d:'A CTQ describes what the OUTPUT must achieve, measurably — like "smile survives 1,000 hug-cycles." Repair kits and discounts are things we might DO; they belong in Improve, after the data speaks.'},
  voc_int_missed:{t:'Internal voices went unheard',d:'The floor has customers too: each station receives the last station\'s work. Torto\'s tension requirement and Capy\'s rework requirement both feed the defect rate — capturing them triangulates the primary metric and strengthens the whole case. Reframe internal wants; do not just wave them off.'},
  ctq_vague:{t:'CTQ not measurable',d:'"Happier" and "more lovable" cannot be measured, so they can never be verified. Rewrite the need as a number: how many hugs? what percent defect-free?'},
  ps_incomplete:{t:'Problem statement has empty parts',d:'All five parts matter: since WHEN, the primary METRIC, the current BASELINE, the TARGET, and the COPQ. If you are missing the information, that is the message: go get it. Penny\'s logs cover when/metric/baseline/target; Miko\'s ledger covers the COPQ.'},
  target_vague:{t:'Target not defined',d:'A target must be a number the process is accountable to. "Whatever stops the complaints" cannot be verified; the standing quality target is 2%, and Penny can confirm it.'},
  copq_vague:{t:'COPQ not quantified',d:'COPQ — the Cost of Poor Quality — must be money: refunds, rework, lost orders. "A great deal of sadness" moves no treasury. Miko\'s ledger has the number: 48,000 gold per quarter.'},
  mag_missing:{t:'No magnitude',d:'A problem without a size cannot be prioritized, funded, or verified as fixed. Penny\'s inspection logs hold the verified number.'},
  mag_anecdote:{t:'Magnitude is a guess, not data',d:'"About 1 in 7, I think" is a feeling. Penny\'s verified figures can defend the charter under questioning — the escaped-defect rate of 4.8% reaching customers is the baseline that matters here. In Define, every number in the charter must have a source you can point to.'},
  mag_wrong:{t:'Magnitude does not measure the problem',d:'The HOW BIG slot needs the size of the gap — defect rate versus target. Check which of your notes actually quantifies the problem.'},
  blame:{t:'Blame written into the charter',d:'"The night shift is careless" is an accusation, not a fact — and Luna\'s tally sheets disprove it (12.4% night vs 12.7% day). Blame destroys the trust a project needs, and it is almost always wrong. Describe the GAP, never a villain.'},
  solution:{t:'A solution smuggled into the problem',d:'Repair kits, new machines, slowing the line — all solutions. Writing one into Define pre-commits the project before any measurement exists. Solutions are earned in Improve, once Analyze proves what actually causes the defects.'},
  cause:{t:'An unproven cause written as fact',d:'The tension knob and the skipped checks might truly be the culprits — but "might" is the point. Once a cause appears in the charter, everyone stops investigating and starts believing. Park cause hypotheses in your notebook; Analyze will put them on trial with data.'},
  opinion:{t:'An opinion in a formal document',d:'"Moon phases" and "better in my day" are vibes. Charming in an interview, fatal in a charter. Facts with sources only.'},
  muddled:{t:'Facts in the wrong slots',d:'Good evidence, wrong pocket — timing information in the magnitude slot, reference notes used as answers. Re-read each slot\'s question and match the note that answers exactly that.'},
  vague_what:{t:'"What is wrong" is too vague',d:'"Wonky" cannot be counted. Penny\'s log names the defect precisely: loose smile stitching, 58% of failures. Specific and countable beats colorful every time.'},
  obj_missing:{t:'Objective incomplete',d:'An objective needs all five parts: change verb, metric, baseline, target, deadline. Anything less and no one can tell later whether you succeeded.'},
  obj_anecdote:{t:'Objective baseline is a guess',d:'You cannot measure improvement FROM a feeling. The baseline must be the verified escaped-defect rate (4.8% reaching customers) so the "from → to" is provable.'},
  obj_how:{t:'A HOW in the objective',d:'The objective states the destination — reduce defects from X to Y by date Z. The route (training, machines, anything) is chosen in Improve, after Analyze finds the real causes. Leaving the HOW out is not an omission; it is the discipline.'},
  obj_unreal:{t:'Target not achievable',d:'"Zero forever" sounds noble but excuses failure in advance — nobody is accountable to an impossible number. Stretch targets must remain reachable: a ≤0.5% escaped-defect rate is ambitious but real.'},
  obj_vague:{t:'Objective wording too fuzzy',d:'"Look into the wonkiness" has no edges. Use the precise metric — the defect rate reaching customers — so success is unambiguous.'},
};
function reviewSorter(items,cols,state){
  const placed={}; cols.forEach(c=>state[c[0]].forEach(i=>placed[i]=c[0]));
  const colName=k=>{const c=cols.find(x=>x[0]===k); return c?L(c[1],c[2]):'—';};
  return `<div class="preview" style="font-size:12.5px"><b>${L('Under review','審査中')}</b><br>`+
    items.map((it,i)=>{ if(it.need&&!S.have.includes(it.need)) return ''; const col=placed[i]; const ok=col===it.k;
      return `${ok?'✓':'✗'} ${L(it.en,it.ja)} <small style="color:${ok?'#2f8f66':'#c04a60'}">→ ${col?colName(col):L('unplaced','未配置')}${ok?'':' ('+L('should be','正解：')+' '+colName(it.k)+')'}</small>`; }).filter(Boolean).join('<br>')+`</div>`;
}
function scheduleNote(){
  const d=fmtDays(daysUsed());
  return defineLate()
    ? `<div class="feedback badf">⏳ ${L(`Day ${d}. The Empress allowed ${DEFINE_DAYS}. She glances at the calendar before she glances at you.`,`${d}日目。皇帝が許したのは${DEFINE_DAYS}日。彼女はきみを見る前に、暦を見る。`)}</div>`
    : `<div class="feedback good">⏳ ${L(`Day ${d} of ${DEFINE_DAYS}. On schedule — she notices that too.`,`${DEFINE_DAYS}日のうち${d}日目。予定どおり——それも彼女は気づいている。`)}</div>`;
}
function coach(flag){ const L=LESSON[flag]; return L?`<div class="feedback info">📘 <b>Uni leans over, quietly:</b> ${L.d}</div>`:''; }

/* ---------- tollgate deliverable renders (with the flawed bits highlighted) ---------- */
function hlFrag(f){ if(!f) return `<span class="hl-err">${L('(blank)','（空欄）')}</span>`; return `<span class="${f.v==='ok'?'hl-ok':'hl-err'}">${f.t}</span>`; }
function reviewPS(){ const p=S.ps;
  return `<div class="tg-tool"><b>📝 ${L('Problem statement — under review','問題記述 — 審査対象')}</b>${L('Since','')} ${hlFrag(p.date)}${L(', the ','以来、')}${hlFrag(p.metric)}${L(' has been at ','は ')}${hlFrag(p.base)}${L(', vs a target of ','（目標：')}${hlFrag(p.target)}${L('. COPQ: ','）。COPQ：')}${hlFrag(p.copq)}.</div>`; }
function reviewObj(){ const o=S.obj; const how=(o.how&&o.how.v==='how')?` <span class="hl-err">${o.how.t}</span>`:'';
  return `<div class="tg-tool"><b>🎯 ${L('Objective — under review','目標 — 審査対象')}</b>${hlFrag(o.verb)} ${hlFrag(o.metric)} ${hlFrag(o.base)} ${hlFrag(o.target)} ${hlFrag(o.when)}${how}.</div>`; }
function reviewFlow(){ if(!S.flow) return '';
  return `<div class="tg-tool"><b>🧱 ${L('Block diagram — under review','ブロック図 — 審査対象')}</b><ol class="tg-flow">${S.flow.map((idx,pos)=>`<li class="${idx===pos?'hl-ok':'hl-err'}">${FLOW[idx]}</li>`).join('')}</ol></div>`; }
function reviewSipoc(){ const cols=[['S',L('Suppliers','供給者')],['I',L('Inputs','入力')],['O',L('Outputs','出力')],['C',L('Customers','顧客')],['X',L('Bin','ゴミ箱')]];
  const rows=cols.map(([c,lbl])=>{ const items=(S.sipoc[c]||[]).map(i=>{ const wrong=SIPOC_ITEMS[i].k!==c; return `<span class="${wrong?'hl-err':'hl-ok'}">${SIPOC_ITEMS[i].t}</span>`; }).join(', ')||'—'; return `<div class="tg-sipoc-row"><b>${lbl}:</b> ${items}</div>`; }).join('');
  return `<div class="tg-tool"><b>🗂️ ${L('SIPOC — under review','SIPOC — 審査対象')}</b>${rows}</div>`; }
function reviewVOC(){ const rows=[];
  (S.voc&&S.voc.voc?S.voc.voc:[]).forEach(id=>{ const v=VOCS.find(x=>x.id===id); if(v) rows.push(`<span class="${v.voc?'hl-ok':'hl-err'}">${v.t}</span>`); });
  const names={smile:'Hana',ship:'Sakura (arrivals)',returns:'Sakura (returns)',thread:'Torto',rework:'Capy'};
  const ctqs=Object.keys(names).filter(k=>S.ctq[k]).map(k=>`<span class="${S.ctq[k]==='ok'?'hl-ok':'hl-err'}">${names[k]}: ${S.ctq[k]==='ok'?L('measurable','測定可能'):S.ctq[k]}</span>`);
  return `<div class="tg-tool"><b>💬 ${L('Voice of the Customer — under review','顧客の声 — 審査対象')}</b>${rows.join('<br>')||L('(no voices recorded)','（記録された声なし）')}${ctqs.length?'<br><b>CTQ:</b> '+ctqs.join(' · '):''}</div>`; }
function lessonList(flags){
  const seen=[...new Set(flags)].filter(f=>LESSON[f]);
  if(!seen.length) return '';
  return `<div class="feedback info" style="text-align:left"><b>📋 Review summary — what to fix and why:</b><br><br>${
    seen.map(f=>`• <b>${LESSON[f].t}.</b> ${LESSON[f].d}`).join('<br><br>')}</div>`;
}

/* ---------------- interview question sets (global stopwatch budget + branches) ----------------
   `req:[keys]` = probing follow-ups that only appear after their parent questions are asked.
   Instead of 3 questions per person, the player has ONE shared budget across all four
   interviews (75% of all questions) — shown as a stopwatch pie, not a number. */
const IVQS={
  penny:[
    {k:'p1',mood:'pleased',q:'What do the inspection logs actually say about defect rates?',cards:['p_mag'],
     a:'Twelve point six percent of plushies failed final inspection over the last ninety days. Our target is two percent. That is not a feeling — that is 4,218 plushies in a bin. If you ask me, THAT is the number your project should drive down. It is MY number and it is a good one.'},
    {k:'p2',mood:'pleased',req:['p1'],q:'Of those failures — which defect happens most often?',cards:['p_what'],
     a:'Loose smile stitching. Fifty-eight percent of all recorded failures. The smiles literally come undone. It is as sad as it sounds.'},
    {k:'p3',mood:'pleased',req:['p1'],q:'When did that 12.6% start? Can you pin a date?',cards:['p_when'],
     a:'*flips the trend chart around* March the 14th. Not "around then" — THE 14th. The line goes up like a startled crane and never comes down. I flagged it twice. Nobody came. *stares* …Until you. Write the date, not a feeling about the date.'},
    {k:'p6',mood:'stern',req:['p1'],q:'That is what the gate CATCHES — how many defects get PAST it, to customers?',cards:[],gate:true,
     a:'*the spectacles come off slowly* …Ah. That is the sharper question, and almost nobody asks it. My 12.6% is what we CATCH. What ESCAPES is a different number — and it is not MINE to give. It lives in Miko’s returns ledger; I can only cross-reference it against my logs once she releases it. And she will not release customer records without the floor supervisor’s sign-off. Bring me that, and I will do the arithmetic gladly.'},
    {k:'p4',mood:'stern',req:['p2'],q:'Loose smiles, then — what is the ROOT CAUSE behind them?',cards:['p_cause'],
     a:'*long look over the spectacles* That is an ANALYZE question, dear, and we are in Define. But since you ask — my hunch is thread tension. A hunch. My logs record WHAT failed, never WHY. Do not carve my guess into anything official.'},
    {k:'p5',mood:'stern',q:'Could you make the numbers look a bit… friendlier for the review?',cards:[],
     a:'*the temperature drops several degrees* I am going to pretend, for the sake of your career, that you asked me about the weather. The data says what it says. NEXT question — you have wasted this one.'},
  ],
  miko:[
    {k:'m1',mood:'delighted',q:'What matters most to the customers, in their own words?',cards:['m_ctq'],voc:true,
     a:'One thing: the smile must survive the hugs. A thousand hugs, minimum! A little girl told me that herself, deadly serious. That is what quality MEANS out there. Everything else is negotiable.'},
    {k:'m3',mood:'dramatic',req:['m1'],q:'Can I read those complaints myself — the actual letters?',cards:['m_voc'],voc:true,
     a:'*shoves a stack of letters at you* Letter one-one-two. "My daughter cried — the smile came undone after ONE week of hugs." And the shops keep writing: "we need shipments where every plushie is sellable." Take them. Please. I have them memorized.'},
    {k:'m2',mood:'dramatic',q:'What is this problem costing the business?',cards:['m_impact'],
     a:'Accounting has a name for it — COPQ, the Cost of Poor Quality. Ours has TRIPLED: forty-eight thousand gold in refunds last quarter, and two toy shops have paused their orders. If our biggest shop walks, we are in real trouble, nya.'},
    {k:'m6',mood:'dramatic',req:['m2'],q:'Which shops are pausing orders — and why exactly?',cards:['m_shops'],
     a:'The Sakura Toy Emporium is the loudest, nya — Ms. Sakura counts every broken arrival AND every plushie her little shoppers bring back. Two different wounds, she says. If your VOC session ever happens, she is the one to press for numbers.'},
    {k:'m4',mood:'delighted',q:'Do you have ideas for how to fix it?',cards:['m_sol'],
     a:'Ooh ooh — we ship free repair kits with every plushie! Needle, thread, tiny instructions! And Sales keeps suggesting DISCOUNTS on the wonky ones, nya — over my whiskers! …What? Why are you looking at me like that? The repair kits are a GREAT idea.'},
    {k:'m5',mood:'smug',q:'Between us… is Capy always this stressed?',cards:[],
     a:'*delighted gasp* ALWAYS. Last month he apologized to a vending machine. Once he— wait. *squints* Did you just spend precious interview time on GOSSIP? The returns desk is right there, nya.'},
  ],
  luna:[
    {k:'l1',mood:'hurt',q:'Some people think the night shift might be part of the problem…',cards:['l_counter'],
     a:'*sighs* I know exactly who "some people" is. Here — I keep my own tally sheets. Night shift: 12.4% defects. Day shift: 12.7%. Nearly identical. Whatever is breaking the plushies does not care what time it is.'},
    {k:'l6',mood:'thoughtful',req:['l1'],q:'Your tallies are this good — why has nobody seen them?',cards:[],
     a:'*a small, tired smile* Because nobody ever ASKED. The day world writes its stories about us and goes home. You are the first person to look at the sheets instead of the rumor. Take that as a lesson for your charter: data that nobody asks for might as well not exist.'},
    {k:'l2',mood:'thoughtful',q:'Have you noticed anything odd happening on the floor?',cards:['l_skip'],
     a:'When orders pile up, the final-check step quietly gets skipped. Day OR night. Nobody decides it out loud — it just happens. Mind you, that is me guessing at causes. Your dragon will want proof before anyone writes that anywhere important.'},
    {k:'l3',mood:'thoughtful',req:['l2'],q:'Skipped checks aside — do the defects vary with anything else?',cards:['l_when2'],
     a:'Humid weeks are worse. The fluff gets heavy and the stitches sit differently. I could be wrong. But I have watched a lot of night shifts.'},
    {k:'l4',mood:'hurt',q:'Honestly — who on your shift makes the most mistakes?',cards:[],
     a:'*her gills flare slightly* …I do not keep a list of people to feed to dragons. I keep tally sheets of DEFECTS. There is a difference, and the difference is why my shift trusts me. Ask me something worth answering.'},
    {k:'l5',mood:'thoughtful',q:'What would you change first, if it were up to you?',cards:['l_sol'],
     a:'Slow the line down at night, maybe? *shrugs sleepily* Just a thought. I am a lead, not an engineer. You are supposed to be the one who figures out what actually works, no?'},
  ],
  torto:[
    {k:'t1',mood:'ranting',q:'What do you think is wrong with the line?',cards:['t_sol'],
     a:'Simple! Buy the TurboStitch 9000. Top of the line. Problem solved, no thinking required. I saw it in a catalog. Gleaming.'},
    {k:'t3',mood:'impressed',req:['t1'],q:'Forget the catalog — what would a new machine actually FIX on yours?',cards:['t_nug'],
     a:'*long pause* …The tension knob on Machine 3 drifts by lunchtime. Every day. Nobody re-checks it. Forty years, and nobody asks the right question. You just did. Huh. Mind — noticing is not proving. Even I know that much.'},
    {k:'t2',mood:'ranting',q:'How does today compare to the old days?',cards:['t_op'],
     a:'Worse. Everything is worse. Quality was better in my day. Probably the moon phases. Or the youths. Write that down.'},
    {k:'t4',mood:'ranting',q:'Which coworkers do you complain about most?',cards:[],
     a:'*brightens alarmingly* HOW LONG DO YOU HAVE. There is the lad who hums. The one who microwaves fish. The— *twenty minutes pass* —and THAT is why I no longer attend birthday parties. What was your project about again? Ah. You have wasted precious time. In my day we wasted it better.'},
    {k:'t5',mood:'impressed',q:'Could you walk me through the whole line, in order, start to finish?',cards:['t_flow'],
     a:'*sets down tea with great ceremony* Finally. A question worth my forty years. Receive the fluff and fabric. Cut the panels. Sew the body seams. Stuff with cloud fluff. Stitch the smile. Close the final seam. Final inspection. Package and ship. I could recite it upside down in a typhoon. Write it down EXACTLY — Capy always muddles the middle.'},
  ],
};
/* ---------------- PUZZLE: reconciling the conflicting numbers ----------------
   Every source quotes a different figure and each is "right" about something
   different. Map each to what it ACTUALLY counts. */
const RECON={
  /* `need` = the notebook card that figure comes from. Only figures you ACTUALLY
     collected appear on the board — you cannot reconcile evidence you never gathered. */
  figures:[
    {k:'f_gut',    need:'c_anec',   t:'“About 1 in 7” (≈14%)',    src:'Capy — a memory of bad weeks',            ans:'a_none'},
    {k:'f_catch',  need:'p_mag',    t:'12.6% over 90 days',        src:'Penny — QA inspection logs',              ans:'a_catch'},
    {k:'f_shift',  need:'l_counter',t:'12.4% nights / 12.7% days', src:'Luna — shift tally sheets',               ans:'a_split'},
    {k:'f_escape', need:'p_field',  t:'4.8% of shipped units',     src:'Penny × Miko — returns cross-reference',  ans:'a_escape'},
    {k:'f_cost',   need:'m_impact', t:'48,000 gold per quarter',   src:'Miko — customer-care ledger',             ans:'a_cost'},
  ],
  /* [EN, JA] — resolved at render time so the language switch works */
  answers:[
    {k:'a_catch',  t:['Units FAILING final inspection — caught inside the factory','最終検査で不合格になった数——工場内で捕まえた分']},
    {k:'a_escape', t:['Defective units REACHING customers — what escapes the gate','顧客に届いてしまった不良——門をすり抜けた分']},
    {k:'a_split',  t:['That same caught-rate, merely split by shift','同じ「捕まえた率」を、シフト別に割っただけ']},
    {k:'a_cost',   t:['The COST of the problem — not a defect rate at all','問題の「コスト」——不良率ではない']},
    {k:'a_none',   t:['Nothing measured — a gut feeling with no tally behind it','何も測っていない——集計のない勘']},
  ]
};
const IV_TOTAL=Object.values(IVQS).reduce((a,qs)=>a+qs.length,0);
const QBUDGET=Math.floor(IV_TOTAL*0.75);          // the stopwatch: ~75% of all questions
function qLeft(){ return Math.max(0,QBUDGET-S.qUsed); }
/* stopwatch with a colored pie face (no numbers) — green → amber → red as time runs out */
function stopwatchSVG(frac,size){
  frac=Math.max(0,Math.min(1,frac));
  const col=frac>.5?'#57a05e':(frac>.25?'#e0a13a':'#d8547a');
  const a=frac*359.99, rad=a*Math.PI/180;
  const x=50+30*Math.sin(rad), y=50-30*Math.cos(rad);
  const pie=frac>=1?`<circle cx="50" cy="50" r="30" fill="${col}"/>`
    :(frac<=0?'':`<path d="M50,50 L50,20 A30,30 0 ${a>180?1:0} 1 ${x.toFixed(1)},${y.toFixed(1)} Z" fill="${col}"/>`);
  return `<svg viewBox="0 0 100 108" style="width:${size||46}px;height:${(size||46)*1.08}px;display:block">
    <rect x="42" y="0" width="16" height="9" rx="3" fill="#8a7a9a"/>
    <rect x="47" y="6" width="6" height="7" fill="#8a7a9a"/>
    <line x1="74" y1="10" x2="82" y2="18" stroke="#8a7a9a" stroke-width="6" stroke-linecap="round"/>
    <g transform="translate(0,8)"><circle cx="50" cy="50" r="38" fill="#fff" stroke="#8a7a9a" stroke-width="6"/>${pie}<circle cx="50" cy="50" r="3" fill="#5a4a6a"/></g>
  </svg>`;
}

/* ---- title-screen mascot: a happy mochi plushie ---- */
const MOCHI_HERO=`<svg class="ih-art" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="100" cy="176" rx="58" ry="12" fill="#e9b8d6" opacity=".45"/>
  <g>
    <ellipse cx="58" cy="60" rx="20" ry="24" fill="#ffd1e6"/><ellipse cx="58" cy="60" rx="10" ry="13" fill="#ffb3d4"/>
    <ellipse cx="142" cy="60" rx="20" ry="24" fill="#ffd1e6"/><ellipse cx="142" cy="60" rx="10" ry="13" fill="#ffb3d4"/>
    <ellipse cx="100" cy="108" rx="70" ry="64" fill="#fff0f7" stroke="#ffc6de" stroke-width="3"/>
    <ellipse cx="100" cy="128" rx="42" ry="32" fill="#fff7fb"/>
    <ellipse cx="70" cy="120" rx="10" ry="7" fill="#ffb0cd" opacity=".75"/>
    <ellipse cx="130" cy="120" rx="10" ry="7" fill="#ffb0cd" opacity=".75"/>
    <circle cx="78" cy="100" r="7.5" fill="#5a3b52"/><circle cx="80.5" cy="97.5" r="2.3" fill="#fff"/>
    <circle cx="122" cy="100" r="7.5" fill="#5a3b52"/><circle cx="124.5" cy="97.5" r="2.3" fill="#fff"/>
    <path d="M92 112 q8 8 16 0" stroke="#c46a94" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M150 92 l7 -10 M150 100 l10 -4" stroke="#ffc6de" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>`;

/* =====================================================================
   SCENES
   ===================================================================== */
const SCENES={

/* ---------- opening ---------- */
title(){
  renderTracker(-1); banner(null); drawScene();
  $('avatar').innerHTML=''; $('speaker').textContent=''; $('text').innerHTML=''; interact('');
  musicTrack('intro');                               // bright, happy title theme
  const old=$('introhero'); if(old) old.remove();    // clean re-render (e.g. language switch)
  const langBtn=(l,label)=>`<button class="btn ghost lang-b" data-l="${l}" style="padding:6px 16px;font-size:15px;${S.lang===l?'border-color:#d46fb8;color:#b23a8e;font-weight:800':''}">${label}</button>`;
  const spark=['✦','✧','🧸','💖','🌟','✦','✧','🩷'].map((s,i)=>`<span class="sparkle" style="top:${5+Math.random()*84}%;left:${3+Math.random()*92}%;animation-delay:${(i*0.3).toFixed(2)}s;font-size:${14+Math.random()*12}px">${s}</span>`).join('');
  const cast=['uni','capy','penny','miko','dragon'].map(id=>`<div class="ih-av">${ART[id]||''}</div>`).join('');
  document.body.insertAdjacentHTML('beforeend',`<div class="intro-hero" id="introhero">
    <div class="ih-factory-top">${bgFactory().replace('xMidYMid slice','xMidYMid meet').replace('viewBox="0 0 800 250"','viewBox="-150 -40 1100 290"').replace('<rect width="800" height="250" fill="url(#sky)"/>','<rect x="-3000" y="-40" width="6800" height="290" fill="url(#sky)"/>').replace('<ellipse cx="400" cy="230" rx="500" ry="70" fill="#c8f0dd"/>','<ellipse cx="400" cy="230" rx="3400" ry="70" fill="#c8f0dd"/>').replace('<rect x="0" y="208" width="800" height="42" fill="#c9b8ff"/>','<rect x="-3000" y="208" width="6800" height="42" fill="#c9b8ff"/>').replace('<rect x="0" y="202" width="800" height="10" rx="5" fill="#9a7dff"/>','<rect x="-3000" y="202" width="6800" height="10" rx="5" fill="#9a7dff"/>')}</div>
    <div class="ih-content">
      ${spark}
      <div class="ih-mascot">${MOCHI_HERO}</div>
      <h1 class="ih-title">${t('title')}</h1>
      <p class="ih-tagline">${t('game_tagline')}</p>
      <div class="ih-cast">${cast}</div>
      <div class="ih-langrow"><span class="hint" style="display:inline-block;margin-right:6px">${t('lang_label')}:</span>${langBtn('en','English')} ${langBtn('ja','日本語')}</div>
      <div style="margin-top:14px">${loadSave()?`<button class="btn center-btn ih-start" id="cont">${L('▶ Continue','▶ 続きから')} <span style="font-weight:600;font-size:13px;opacity:.85">— ${saveSummary(loadSave())}</span></button><br>`:''}<button class="btn ${loadSave()?'ghost':'center-btn ih-start'}" id="start" style="${loadSave()?'margin-top:8px':''}">${loadSave()?L('New game (erases the save)','最初から（セーブを消去）'):t('start')}</button></div>
      <div id="devpill" style="margin-top:18px;font-size:11px;color:#b8a7c8;cursor:pointer;user-select:none">⚙ dev</div>
      <div id="devmenu" style="display:none;margin-top:6px;font-size:12px">
        <button class="btn ghost" style="padding:5px 12px;font-size:12px" onclick="DEV.measure('good')">▶ Measure (good Define)</button>
        <button class="btn ghost" style="padding:5px 12px;font-size:12px" onclick="DEV.measure('bad')">▶ Measure (poor Define)</button>
        <button class="btn ghost" style="padding:5px 12px;font-size:12px" onclick="DEV.tollgate()">▶ Define tollgate (perfect)</button>
        <button class="btn ghost" style="padding:5px 12px;font-size:12px" onclick="DEV.analyze('good')">▶ Analyze (good)</button>
        <button class="btn ghost" style="padding:5px 12px;font-size:12px" onclick="DEV.analyze('bad')">▶ Analyze (poor)</button>
        <button class="btn ghost" style="padding:5px 12px;font-size:12px" onclick="DEV.improve('good')">▶ Improve (good)</button>
        <button class="btn ghost" style="padding:5px 12px;font-size:12px" onclick="DEV.improve('bad')">▶ Improve (poor)</button>
        <button class="btn ghost" style="padding:5px 12px;font-size:12px" onclick="DEV.control('good')">▶ Control (good)</button>
        <button class="btn ghost" style="padding:5px 12px;font-size:12px" onclick="DEV.control('bad')">▶ Control (poor)</button>
      </div>
    </div>
  </div>`);
  /* music is handled by the persistent corner button + autostart-on-first-gesture */
  document.querySelectorAll('#introhero .lang-b').forEach(b=>b.onclick=()=>{ S.lang=b.dataset.l; SCENES.title(); });
  $('devpill').onclick=()=>{ const m=$('devmenu'); m.style.display=m.style.display==='none'?'block':'none'; };
  fitHero(); window.addEventListener('resize',fitHero);
  $('start').onclick=()=>{ if(loadSave()&&!confirm(L('Erase the saved game and start over?','セーブを消して最初から始めますか？'))) return; clearSave(); resumeIfNeeded(); if(!MUSIC.started&&!MUSIC.userOff) musicSet(true); updateMusicBtn(); const h=$('introhero'); if(h) h.remove(); go('chaptercard'); };
  const cb=$('cont'); if(cb) cb.onclick=()=>{ try{ resumeIfNeeded(); if(!MUSIC.started&&!MUSIC.userOff) musicSet(true); updateMusicBtn(); }catch(e){} continueGame(); };
},

/* ---------- chapter cut-card (≈2.6s) ---------- */
chaptercard(){
  renderTracker(-1); banner(null); drawScene();
  $('avatar').innerHTML=''; $('speaker').textContent=''; $('text').innerHTML=''; interact('');
  musicTrack('intro');
  const old=$('chapcard'); if(old) old.remove();
  const cast=['uni','capy','dragon'].map(id=>`<div class="cc-av">${ART[id]||''}</div>`).join('');
  const spark=['✦','✧','🧸','💖','🌟','✦'].map((s,i)=>`<span class="sparkle" style="top:${8+Math.random()*80}%;left:${5+Math.random()*88}%;animation-delay:${(i*0.3).toFixed(2)}s">${s}</span>`).join('');
  document.body.insertAdjacentHTML('beforeend',`<div class="chapter-card" id="chapcard">
    ${spark}
    <div class="cc-ch">${t('chapter1')}</div>
    <div class="cc-def">${t('define_word')}</div>
    <div class="cc-tag">${t('define_tag')}</div>
    <div class="cc-cast">${cast}</div>
    <div class="cc-skip">${L('tap to continue ▸','タップで進む ▸')}</div>
  </div>`);
  let done=false;
  const proceed=()=>{ if(done) return; done=true; clearTimeout(tmr);
    const c=$('chapcard');
    const finish=()=>{ if(c) c.remove(); musicTrack('main'); go('cine1'); };
    if(c){ c.classList.add('ccout'); setTimeout(finish,420); } else finish();
  };
  const tmr=setTimeout(proceed,2600);
  $('chapcard').onclick=proceed;
},

/* ---------- prologue cutscene: meeting Uni at the gates ---------- */
cine1(){
  renderTracker(-1); banner(L('PROLOGUE · The gates at dawn','プロローグ · 夜明けの門')); drawGates();
  say(nm('Narrator'),'narr',
    L('Dawn at the Fuwa-Fuwa Mochi Mill. Steam curls from the fluff boiler, and morning mist hangs over the cobbled road. Somewhere inside, a plushie rolls off the line with a smile stitched sideways — and nobody notices. Down the road, small footsteps approach the gates.',
      'ふわふわもちミルの夜明け。ふわふわ釜から湯気が立ちのぼり、石畳の道に朝もやがかかる。工場のどこかで、笑顔が斜めに縫われたぬいぐるみがラインを流れていく——誰も気づかない。道の向こうから、小さな足音が門へと近づいてくる。'),()=>{
    interact(`<button class="btn ghost" id="skip">${L('Skip intro ▸','イントロを飛ばす ▸')}</button><button class="btn" id="nx">${L('Continue ✦','つづける ✦')}</button>`);
    $('skip').onclick=()=>go('kick2');
    $('nx').onclick=step2;
  });
  function step2(){
    walkIn('act-player','left','15%');
    say(nm('You'),'player',
      L('(Deep breath.) New town. New factory. First real project. The appointment letter just says: "meet your mentor at the gates." …It is signed with a claw-print.',
        '（ひと呼吸。）新しい町。新しい工場。初めての本物のプロジェクト。任命状にはただ「門で指導役と落ち合うこと」とだけ。…署名は、爪あとの印。'),()=>{
      interact(`<button class="btn" id="nx">${L('Continue ✦','つづける ✦')}</button>`);
      $('nx').onclick=step3;
    },'nervous');
  }
  function step3(){
    walkIn('act-uni','right','15%');
    say(nm('???'),'uni',
      L('Right on time. You must be the new Green Belt. I am Uni — Master Black Belt, your mentor, and the only friendly warning you will get about the dragon.',
        '時間ぴったり。きみが新しいグリーンベルトだね。わたしはユニ——マスターブラックベルトで、きみの指導役。そして、あの竜について親切に忠告してくれる唯一の存在だよ。'),()=>{
      interact(`<button class="btn" id="nx">${L('The… dragon? ✦','あの…竜？ ✦')}</button>`);
      $('nx').onclick=step4;
    });
  }
  function step4(){
    say(nm('You'),'player',
      L('The dragon. Right. Okay. I read the DMAIC handbook twice on the way here. Whatever is wonky in that factory — we will define it properly first.',
        '竜。そう。うん、大丈夫。ここへ来る道すがら、DMAICの手引きを二回読んだ。あの工場のどこがおかしいのであれ——まずはきちんと「定義」していこう。'),()=>{
      interact(`<button class="btn" id="nx">${L('Enter the mill ✦','工場に入る ✦')}</button>`);
      $('nx').onclick=()=>go('kick2');
    },'determined');
  }
},

kick1(){
  renderTracker(0); drawScene(); banner(L('DAY 1 · The summons','1日目 · 呼び出し'));
  narrate(L('A cobbled road winds through morning mist toward the pink-roofed mill. Your appointment letter, slightly hug-crumpled, is signed with a single elegant claw-print.',
    '石畳の道が朝もやの中、ピンク屋根の工場へと続く。少しくしゃっとなった任命状には、優雅な爪あとの印がひとつ。'));
  say(nm('Narrator'),'narr',
    L('Dawn at the Fuwa-Fuwa Mochi Mill. Steam curls from the fluff boiler. Somewhere inside, a plushie rolls off the line with a smile stitched sideways — and nobody notices. You have been hired to change that.',
      'ふわふわもちミルの夜明け。ふわふわ釜から湯気が立つ。工場のどこかで、笑顔が斜めに縫われたぬいぐるみがラインを流れ——誰も気づかない。それを変えるために、きみは雇われた。'),()=>{
    interact(`<button class="btn" id="nx">${L('Enter the mill ✦','工場に入る ✦')}</button>`);
    $('nx').onclick=()=>go('kick2');
  });
},
kick2(){
  renderTracker(0); drawBackdrop('scene_floor');
  say(nm('Uni the Unicorn'),'uni',
    L('Welcome! I am Uni, Master Black Belt and your mentor. Empress Scarlet — our Champion, a dragon with zero patience for fluffy thinking — has given us TEN DAYS to complete the DEFINE phase and pass her tollgate. Fail, and the project is shelved.',
      'ようこそ！わたしはユニ、マスターブラックベルトで、きみの指導役。スカーレット皇帝——わたしたちのチャンピオンで、ふわっとした考えには一切容赦しない竜——が、DEFINE（定義）フェーズを終えてトールゲートを通すのに「10日」だけくれた。落ちれば、このプロジェクトは棚上げだよ。'),()=>{
    addCards(['c_deadline']);
    interact(`<div class="feedback info">📜 <b>${L('Your Define deliverables:','きみのDefine成果物：')}</b> ${L('a block diagram of the process, a SIPOC, a Voice-of-the-Customer table with CTQs, a problem statement, and an objective statement. At the tollgate, Empress Scarlet will challenge every word.','工程のブロック図、SIPOC、CTQ付きの顧客の声（VOC）表、問題記述、目標記述。トールゲートでは、スカーレット皇帝が一言一句を問い詰めてくる。')}</div>
      <div class="feedback tip">📒 ${L('The charter brief goes in your notebook — including the one number the Empress underlined herself:','チャーター概要はノートに入る——皇帝が自ら下線を引いた、あの数字も含めて：')} <b>${L('results within 90 days','90日以内に結果を')}</b>.</div>
      <button class="btn" id="nx">${L('Understood. Where do I start?','了解。どこから始める？')}</button>`);
    $('nx').onclick=()=>go('kick3');
  });
},
kick3(){
  say(nm('Uni the Unicorn'),'uni:stern',
    L('Two warnings, then I stay silent. One: I will NOT check your work before the review — a Green Belt owns their choices. Two: people will offer you opinions, hunches, blame, and pet solutions. All of it will feel useful. Very little of it belongs in Define. A feeling is not a fact — and a cause you have not proven is just a rumor with confidence.',
      '忠告を二つ。そのあとは黙っているよ。一つ：レビューの前に、わたしはきみの仕事を確認しない——グリーンベルトは自分の選択に責任を持つものだ。二つ：みんなが意見や勘、責任のなすりつけ、お気に入りの解決策を差し出してくる。どれも役立ちそうに感じる。でも、Defineに入れていいものはごくわずか。感覚は事実ではないし、証明していない原因は、ただの自信たっぷりな噂にすぎない。'),()=>{
    interact(`<button class="btn" id="nx">${L('Meet the floor supervisor ✦','現場監督に会う ✦')}</button>`);
    $('nx').onclick=()=>go('kick4');
  });
},
kick4(){
  drawBackdrop('scene_floor'); banner(L('DAY 1 · The floor tour','1日目 · 現場ツアー'));
  say(nm('Captain Capy'),'capy:worried',
    L('Ohh thank goodness you are here! Captain Capy, floor supervisor. Honest take? The plushies come out WONKY — crooked smiles, lumpy tummies. My gut says one in SEVEN lately. It started… a few months back? Ish? Between us, I suspect the NIGHT shift. And the toy shops keep sending broken ones back by the crate — poor Miko. Torto keeps shouting we should just buy the TurboStitch 9000. …Sorry, that was a lot. Press me on ANY of it — I love a good chat!',
      'ああ、来てくれて助かった！現場監督のカピー隊長だ。正直な見立て？ぬいぐるみがどうも「歪んで」出てくるんだ——曲がった笑顔、でこぼこのお腹。僕の勘だと、最近は7個に1個。始まったのは…数ヶ月前？くらい？ここだけの話、怪しいのは「夜勤」だと思ってる。それに、おもちゃ屋さんからは壊れたのが箱ごと返ってくる——ミコが気の毒でね。トルトは「TurboStitch 9000を買え」って騒いでるし。…ごめん、一気に喋りすぎた。どれでも突っ込んで聞いて！おしゃべりは大好きなんだ。'),()=>{
    addCards(['c_where','c_what_vague']);
    /* Capy rambles; now let the player PRESS him — he stays useless, but you dig
       out (and see through) his guesses. Free-ask, no patience cap. */
    ivQuestions('capy',[
      {k:'cc1',mood:'worried',q:'“One in seven,” you said — how do you KNOW that number?',cards:['c_anec'],
       a:'*wilts* I… do not, exactly. It FEELS about right on a bad week. There is no tally behind it — my gut is not a graph. Penny keeps the actual logs. Check hers against mine.'},
      {k:'cc2',mood:'worried',q:'“A few months back… ish?” — can you pin an actual date?',cards:['c_when_guess'],
       a:'Recently? Three-ish months? It blurs together on busy days, honestly. Penny has a proper trend chart with real dates on it — believe that, not my memory.'},
      {k:'cc3',mood:'worried',q:'You said you suspect the night shift — have you compared their numbers?',cards:['c_blame'],
       a:'*long pause* …No. I never actually compared the two shifts. I just assumed, because I am not THERE at night. Luna keeps her own tally sheets, if you want the truth of it.'},
      {k:'cc4',mood:'happy',q:'“Broken ones back by the crate” — how many, exactly?',cards:[],
       a:'Crates! Boxes! …I do not count them, truthfully. Miko logs every return and every tear-stained letter. SHE would know the real escape numbers.'},
      {k:'cc5',mood:'happy',q:'Torto’s TurboStitch idea — do you think that is the answer?',cards:['c_speed'],
       a:'YES! …I mean — maybe? It GLEAMS. But we have not measured a single thing yet, have we? …Have we? Ooh — and if you want ONE tidy number for the Empress, measure how many we SHIP per day! Leadership loves fast.'},
      {k:'cc6',mood:'worried',q:'Crooked smiles, lumpy tummies — what ORDER does the line actually run in?',cards:[],
       a:'Cut, sew, stuff, the smile, close it up, check, pack… roughly? The middle is a blur, truthfully. Torto could recite it in his sleep — confirm with him, not me.'},
    ],{free:true, endLabel:L('Walk the production line ✦','生産ラインを歩く ✦'), onEnd:()=>go('kick5')});
  });
},
kick5(){
  say(nm('Captain Capy'),'capy:happy',
    L('This is the line! Cloud fluff comes in from the Fluff Farm Co-op, thread and fabric from the Rainbow Thread Guild. After that… there\'s cutting, and sewing, stuffing, the smiles, closing things up, a check, packing — but honestly, do not ask ME the ORDER, it all runs together on a busy day. Finished plushies ship out with an inspection report to the toy shops and the little ones. You\'ll want the true order from someone who\'s run this line for years — I\'d only steer you wrong.',
      'これがラインだよ！クラウドふわふわはふわふわ農園組合から、糸と生地はレインボー糸ギルドから届く。そのあとは…裁断とか、縫製とか、詰め物とか、笑顔の刺繍とか、口を閉じる工程とか、検査に梱包とか——でも正直、その「順番」は僕に聞かないでほしいな。忙しい日はぜんぶごちゃ混ぜになっちゃって。仕上がったぬいぐるみは検査報告つきで、おもちゃ屋さんや子どもたちのもとへ。ちゃんとした順番は、このラインを何年も回してきた人に聞くのがいいよ——僕が言うと間違えて教えちゃうから。'),()=>{
    addCards(['c_tour']);
    interact(`<div class="feedback info">🧱 ${L('You sketched the eight blocks of the process — but your sketch is <b>out of order</b>, and Capy\'s memory is a blur. <i>Someone with more years on this line surely knows the exact order… if you think to ask.</i> Your tour notes (suppliers, inputs, outputs, customers) went into the notebook too — they will matter for the SIPOC.','工程の8ブロックを描いたが、きみのスケッチは<b>順番がばらばら</b>で、カピーの記憶も曖昧。<i>このラインで長年働く誰かなら、正しい順番を知っているはず…尋ねようと思えばね。</i>案内メモ（供給者・入力・出力・顧客）もノートに入った——SIPOCで役に立つ。')}</div>
      <button class="btn" id="nx">${L('Pass through the break room ✦','休憩室を通る ✦')}</button>`);
    $('nx').onclick=()=>go('kick6');
  });
},
kick6(){
  drawBackdrop('scene_breakroom'); banner(L('DAY 1 · The break room','1日目 · 休憩室'));
  narrate(L('The break room: a heroic kettle, a dartboard, and a poster of a kitten hanging from a rope.',
    '休憩室：勇ましいやかん、ダーツの的、ロープにぶら下がる子猫のポスター。'));
  say(nm('Uni the Unicorn'),'uni',
    L('Wait for me here in the break room, Green Belt — I will round up the team and set up your interviews. Rest your paws, pour a cup of tea. And, if I may suggest… keep your ears open. People say the most revealing things when they think no one official is listening.',
      '休憩室でわたしを待っていて、グリーンベルト——チームを集めて、きみの聞き取りの準備をしてくるから。足を休めて、お茶でも一杯。それと、もしよければ…耳を澄ませておいて。人は「お偉いさんは聞いていない」と思っているときほど、いちばん本音を漏らすものだよ。'),()=>{
    interact(`<button class="btn" id="nx">${L('Wait, and listen… ✦','待ちながら、耳を澄ます… ✦')}</button>`);
    $('nx').onclick=chatter;
  });
  function chatter(){
    say(nm('Narrator'),'narr',
      L('You only came in for tea, but the room has opinions. "Zero defects forever, starting Monday!" "The target should be whatever makes the complaints stop." "What does it cost us? A great deal of sadness." "Deadlines are a state of mind." You write it all down — every word of it.',
        'お茶を飲みに来ただけなのに、部屋は意見だらけ。「月曜から不良ゼロ、永遠に！」「目標は苦情が止まる数字でいいでしょ」「コスト？そりゃもう、たっぷりの悲しみさ」「締め切りなんて気の持ちよう」。きみは全部書き留める——一言残らず。'),()=>{
      addCards(['br_zero','br_stop','br_sad','br_soon','br_morale','br_lookinto']);
      interact(`<div class="feedback tip">📒 <b>${L('Six scraps of break-room chatter added to your notebook','休憩室の噂話を6つノートに追加')}</b> ${L('(tap 📒 up top to review them any time). None of it is evidence — but you WILL meet these exact phrases again when you build your deliverables. Recognizing weak information when it comes dressed as an option… that is a Green Belt skill.','（上の📒をタップすればいつでも見返せる）。どれも証拠ではない——でも、成果物を作るとき、この同じ言い回しに必ずまた出会う。弱い情報が「選択肢」の顔をして現れたとき、それを見抜く…それがグリーンベルトの腕だ。')}</div>
        <button class="btn" id="nx">${L('Uni returns — time for interviews ✦','ユニが戻ってきた——聞き取りへ ✦')}</button>`);
      $('nx').onclick=()=>go('hub');
    });
  }
},

/* ---------- interviews ---------- */
hub(){
  renderTracker(1); drawBackdrop('scene_breakroom'); banner(L('Interviews · the stopwatch is running','聞き取り · ストップウォッチ進行中'));
  narrate(L('The break-room corkboard: four names, four pins, and a kettle that has seen things. (You already pressed Capy on the floor.) Somewhere beyond the door, the line hums on.',
    '休憩室のコルクボード：4つの名前、4本のピン、そして酸いも甘いも知り尽くしたやかん。（カピーには現場で問い詰めた。）扉の向こうで、ラインは今日も唸りをあげている。'));
  const ppl=[
    {id:'penny',n:nm('Penny Penguin'),r:L('QA Lead — keeps the inspection logs','品質保証リーダー — 検査記録の番人'),art:'penny'},
    {id:'miko',n:nm('Miko Cat'),r:L('Customer Care — hears every complaint','カスタマーケア — あらゆる苦情の受け手'),art:'miko'},
    {id:'luna',n:nm('Luna Axolotl'),r:L('Night-Shift Lead — rarely gets asked anything','夜勤リーダー — めったに話を聞かれない'),art:'luna'},
    {id:'torto',n:nm('Torto'),r:L('Veteran Operator — 40 years, many opinions','ベテラン作業員 — 40年、意見も豊富'),art:'torto'},
  ];
  say(nm('Uni the Unicorn'),'uni',
    S.qUsed===0?
    L('You may speak to all four — but not endlessly. This stopwatch is your interview time: every question you ask, anywhere, winds it down, and it will run out before you have asked everything this factory knows. Sharp questions unlock deeper follow-ups (↳) — the best interviewers go DEEP where the data lives, not wide across gossip. Spend it like gold.',
      '4人全員と話していい——ただし、無限にではないよ。このストップウォッチがきみの聞き取り時間。どこで質問しても針は減っていき、この工場が知るすべてを聞き終える前に必ず切れる。鋭い質問は深掘りの続き（↳）を開く——優れた聞き手は、噂話に広くではなく、データのある場所に深く時間を使う。金貨のように使うこと。'):
    (qLeft()>0?L('Who is next? The stopwatch keeps its own counsel.','次は誰に？ストップウォッチは待ってくれないよ。'):L('The stopwatch has run out. Whatever evidence you gathered is the evidence you will build with.','ストップウォッチは切れた。集めた証拠が、そのまま組み立ての材料になる。')),()=>{
    const html='<div class="person-grid">'+ppl.map(p=>{
      const visited=S.interviewed[p.id];
      return `<div class="person" data-p="${p.id}">
        <div class="pav">${artHTML(p.art)}</div>
        <div><div class="pn">${p.n}${visited?' ✓':''}</div><div class="pr">${p.r}</div></div></div>`;
    }).join('')+'</div>'
    +`<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0 2px">
        ${stopwatchSVG(qLeft()/QBUDGET,54)}
        <span class="hint" style="text-align:left">${L('Interview time left — every question, with anyone, uses some.','聞き取りの残り時間——誰への質問でも減っていく。')}</span>
      </div>`
    +((S.gate.named&&!S.gate.done)?`<div class="feedback tip" style="text-align:left"><b>📁 ${L('Open task: the returns ledger','進行中：返品台帳')}</b><br>${L('Penny cannot hand over the escaped-defect figure — it is Miko’s data, and Miko needs the supervisor’s sign-off. Chase it down.','ペニーは流出不良の数字を渡せない——それはミコのデータで、ミコには監督の署名が要る。追いかけよう。')}<br><button class="btn" id="toledger" style="margin-top:6px">${L('Chase the ledger ✦','台帳を追う ✦')}</button></div>`:'')
    +(S.gate.done?`<div class="feedback good" style="text-align:left">✅ ${L('Returns ledger chased down — escaped-defect rate secured.','返品台帳を入手——流出不良率を確保。')}</div>`:'')
    +`<button class="btn" id="tofl">${L('Done interviewing — head to the mapping table ✦','聞き取り終了——マッピング台へ ✦')}</button>`;
    interact(html);
    const tl=$('toledger'); if(tl) tl.onclick=()=>{ S.gateReturn='hub'; go('ledger'); };
    document.querySelectorAll('.person[data-p]').forEach(el=>{
      el.onclick=()=>{ const id=el.dataset.p;
        if(!S.interviewed[id]){ S.interviewed[id]=true; tickHalfDay(); }
        go('iv_'+id); };
    });
    let warned=false;
    $('tofl').onclick=()=>{
      if(S.gate.named&&!S.gate.done&&!warned){       // do not let an open data chase be forgotten
        warned=true;
        $('tofl').insertAdjacentHTML('beforebegin',
          `<div class="feedback badf" style="text-align:left">⚠ ${L('The returns ledger is still unchased — without it you will not have the escaped-defect figure the charter needs. Press again if you truly mean to leave it.','返品台帳がまだ未回収——これがないと、チャーターに必要な流出不良の数字が手に入らない。本当に置いていくなら、もう一度押して。')}</div>`);
        return;
      }
      if(qLeft()>QBUDGET*0.5) S.endedInterviewsEarly=true; tickHalfDay(); go('flow_build');
    };
  });
},

iv_penny(){
  drawBackdrop('scene_qa'); banner(L('Interview · Penny Penguin, QA Lead','聞き取り · ペニー（品質保証リーダー）'));
  narrate(L('The QA office is a cathedral of binders — ninety days of inspection logs, labeled, tabbed, and utterly unread by anyone but her.',
    '品質保証室はバインダーの大聖堂——90日分の検査記録が、ラベルを貼られ、見出しを付けられ、そして彼女以外の誰にも読まれずに並んでいる。'));
  say(nm('Penny Penguin'),'penny',
    L('*adjusts tiny spectacles* Ah. The new improvement lead. I hoped someone would finally ask for the LOGS instead of the legends. Ask well — the sharper your question, the more my binders open. But mind your stopwatch; the afternoon batch will not inspect itself.',
      '*小さな眼鏡を直す* ああ。新しい改善リーダーね。ようやく「伝説」ではなく「記録」を尋ねてくれる人が来た。良い質問ほど、バインダーは開くもの。ただしストップウォッチにはご注意——午後のバッチは、勝手には検査されないから。'),()=>{
    ivQuestions('penny',IVQS.penny);
  });
},
iv_miko(){
  drawBackdrop('scene_care'); banner(L('Interview · Miko Cat, Customer Care','聞き取り · ミコ（カスタマーケア）'));
  narrate(L('Customer Care is a fortress built of return boxes. Each one, somewhere inside, holds a plushie whose smile let a child down.',
    'カスタマーケアは返品箱で築かれた砦。どの箱の中にも、笑顔が壊れて子どもを泣かせたぬいぐるみが眠っている。'));
  say(nm('Miko Cat'),'miko:dramatic',
    L('*surrounded by teetering piles of return boxes* Nya… do you SEE this? Every box is a sad child. Ask away — but ask QUICKLY, the returns desk waits for no cat. Good questions get you the good drawers.',
      '*ぐらつく返品箱の山に囲まれて* ニャ…これ、見える？箱ひとつが泣いた子ひとりなの。聞きたいことはどうぞ——でも手短にね、返品デスクは待ってくれないから。良い質問には、良い引き出しを開けてあげる。'),()=>{
    ivQuestions('miko',IVQS.miko);
  });
},
iv_luna(){
  drawBackdrop('scene_night'); banner(L('Interview · Luna Axolotl, Night-Shift Lead','聞き取り · ルナ（夜勤リーダー）'));
  narrate(L('Shift change. The floor is half-lit and quiet; Luna waits by the clock-out station, tally sheets under one arm, dawn in her eyes.',
    '交代の時間。フロアは薄明かりで静か。ルナは退勤機のそばで、集計表を小脇に抱え、瞳に夜明けを映して待っている。'));
  say(nm('Luna Axolotl'),'luna:thoughtful',
    L('*blinks slowly in the daylight* Oh. Someone from the day world. In four years, nobody from a "project" has come to talk to the night shift. We just hear what gets said about us. Ask what you like — but I sleep soon, so let your stopwatch do the worrying.',
      '*陽の光の中でゆっくりまばたき* あら。昼の世界の人。この4年、「プロジェクト」の人が夜勤に話を聞きに来たことなんて一度もない。聞きたいことをどうぞ——でも私はもうすぐ眠るから、時間の心配はストップウォッチに任せて。'),()=>{
    ivQuestions('luna',IVQS.luna);
  });
},
iv_torto(){
  drawBackdrop('scene_workshop'); banner(L('Interview · Torto, Veteran Operator','聞き取り · トルト（ベテラン作業員）'));
  narrate(L('The corner by Machine 3 smells of machine oil and ferociously strong tea. A forty-year-old thermos sits on a forty-year-old dent.',
    '3号機のそばの一角は、機械油と猛烈に濃いお茶の匂い。40年ものの魔法瓶が、40年ものの凹みの上に置かれている。'));
  say(nm('Torto'),'torto',
    L('*slowly swivels* Well, well. A "Green Belt". In MY day we called it common sense, and it was free. Ask, youngster — but mind that little stopwatch of yours. My tea break looms, and my tea break is sacred.',
      '*ゆっくり振り向く* ほう、ほう。「グリーンベルト」ときたか。ワシの若い頃はそれを常識と呼んでな、しかもタダだった。聞くがいい、若いの——ただし、その小さなストップウォッチには気をつけろ。茶の時間が迫っておる。ワシの茶の時間は神聖なんでな。'),()=>{
    ivQuestions('torto',IVQS.torto);
  });
},
/* (Capy is pressed at the first meeting — kick4 — not in the interview hub.) */

/* ---------- PUZZLE 1: the returns ledger (data-gatekeeper chain) ----------
   Penny cannot give the escaped-defect figure: it is Miko's data, and Miko
   needs the supervisor's sign-off. Three doors, SIX chances to say the wrong
   thing. Any misstep spooks the whole chain — signatures get withdrawn, the
   chase rewinds to door one, and the stopwatch pays (2 ticks; a full day
   once the watch is spent). */
ledger(){
  drawBackdrop('scene_qa'); banner(L('THE RETURNS LEDGER · a three-door problem','返品台帳 · 三つの扉'));
  narrate(L('Nobody is refusing you. Everybody is simply pointing at somebody else — which is how data goes missing in every factory that ever existed.',
    '誰も断ってはいない。ただ全員が「別の誰か」を指さしているだけ——どんな工場でもデータが消えるのは、いつもこの理由だ。'));
  const g=S.gate;
  if(g.capyBeat===undefined){ g.capyBeat=0; g.mikoBeat=0; }
  render();
  function payWrong(){
    tickHalfDay();
    return L('Half a day burns while the chain is rebuilt.','連鎖を組み直す間に、半日が燃える。');
  }
  function resetChain(){ g.signed=false; g.released=false; g.capyBeat=0; g.mikoBeat=0; }
  function flub(who,cls,lineEn,lineJa,noteEn,noteJa){
    const cost=payWrong(); resetChain();
    say(nm(who),cls,L(lineEn,lineJa),()=>render(
      `<div class="feedback badf">❌ ${L(noteEn,noteJa)} ${L('The chain rewinds to the first door.','連鎖は最初の扉まで巻き戻る。')} ${cost}</div>`));
  }
  function stepCard(id,art,name,note,state){
    const flag=state==='done'?'✅':(state==='ready'?'▶':'🔒');
    return `<div class="gate-step ${state}" data-g="${id}">
      <div class="gate-av">${artHTML(art)}</div>
      <div><div class="gate-name">${name}</div><div class="gate-note">${note}</div></div>
      <div class="gate-flag">${flag}</div></div>`;
  }
  function render(msg){
    const capyState=g.signed?'done':'ready';
    const mikoState=g.released?'done':(g.signed?'ready':'locked');
    const pennyState=g.done?'done':(g.released?'ready':'locked');
    const html=
      `<div class="patience" style="margin-bottom:6px">${dayLabel()}</div>
      <div class="hint" style="text-align:left;margin-bottom:6px">${L('One wrong word at ANY door rewinds the whole chase and costs half a day of the Define calendar — never your interview questions.','どの扉でも一言間違えれば追跡はすべて巻き戻り、Defineの暦から半日が消える——聞き取りの質問数は減らない。')}</div>`+
      (msg||'')+
      stepCard('capy','capy',nm('Captain Capy'),
        g.signed?L('✔ Signed the data-release form — name and all.','✔ データ開示書類にサイン済み——名前入りで。')
        :L('Supervisor sign-off needed to release customer records. He is nervous about what this is FOR — and about whose name ends up where.','顧客記録の開示には監督のサインが要る。彼は「何のため」か——そして誰の名前が残るのかを気にしている。'),capyState)+
      stepCard('miko','miko',nm('Miko Cat'),
        g.released?L('✔ Returns ledger released, annotation stamped.','✔ 返品台帳を開示済み、注記スタンプ付き。')
        :(g.signed?L('Holds the letters. Will test your PURPOSE — and your paperwork — before one page moves.','手紙の番人。ページ一枚動かす前に、「目的」と「書類」を試してくる。')
          :L('Holds every return record — but will not release customer data unsigned.','すべての返品記録を持つ——だが署名なしに顧客データは出さない。')),mikoState)+
      stepCard('penny','penny',nm('Penny Penguin'),
        g.done?L('✔ Cross-referenced: 4.8% escaped-defect rate.','✔ 突合完了：流出不良率 4.8%。')
        :(g.released?L('Will do the arithmetic — after YOU prove you know which arithmetic.','計算はしてくれる——ただし、どの計算かをきみが言えたらの話。')
          :L('Waiting on the ledger before she can do the arithmetic.','台帳が届くまで計算はできない。')),pennyState)+
      `<button class="btn ghost" id="gback">${S.gateReturn==='reconcile'?L('↩ Back to the numbers','↩ 数字の整理に戻る'):L('↩ Back to the interviews','↩ 聞き取りに戻る')}</button>`;
    interact(html);
    document.querySelectorAll('.gate-step.ready').forEach(el=>{ el.onclick=()=>open(el.dataset.g); });
    $('gback').onclick=()=>go(S.gateReturn||'hub');
  }
  function open(id){
    if(id==='capy') capyStep(); else if(id==='miko') mikoStep(); else pennyStep();
  }
  /* ---- DOOR 1: Capy — the frightened signature (two beats) ---- */
  function capyStep(){
    if(g.capyBeat===0){
      say(nm('Captain Capy'),'capy:worried',
        L('A data-release form? For the CUSTOMER records? *clutches clipboard* …This is about finding who is at fault, is it not. Everyone keeps saying the night shift and I started that and — oh, this is going to end badly for somebody.',
          'データ開示の書類？「顧客」記録の？*クリップボードを抱きしめる* …これ、誰が悪いか探すためだよね。みんな夜勤のせいだって言ってて、言い出したのは僕で——ああ、これ誰かが痛い目を見るやつだ。'),()=>{
        interact(`<div class="choices">
          ${vc('g_calm',L('Reassure him','安心させる'),L('“This is about the PROCESS, not people. No names go in my charter — I only want to know how many reach the children.”','「これは『人』ではなく『工程』の話。チャーターに名前は書かない。子どもたちに何個届いているかを知りたいだけ。」'))}
          ${vc('g_form',L('Play it down','軽く流す'),L('“It’s a formality, Capy. Don’t even read it — just initial the bottom.”','「ただの形式だよ、カピー。読まなくていいから、下にサインだけ。」'))}
          ${vc('g_press',L('Press him hard','強く迫る'),L('“Sign it. And frankly, if the night shift IS the cause, the data will show it.”','「サインして。それに正直、もし夜勤が原因なら、データがそう示すはず。」'))}
        </div>`);
        $('g_calm').onclick=()=>{ g.capyBeat=1; capyStep(); };
        $('g_form').onclick=()=>flub('Captain Capy','capy:worried',
          '*reads every word twice, BECAUSE you said not to* “Release of customer records…” A formality?! Formalities are the things that end up in HEARINGS. I need to think. Possibly for days.',
          '*「読まなくていい」と言われたせいで一語一句二回読む* 「顧客記録の開示…」形式だって？！形式ってのは後で聴聞会に出てくるやつだよ。考えさせて。数日かかるかも。',
          'Telling a nervous approver not to read the form guarantees he reads nothing else.',
          '不安な承認者に「読むな」と言えば、それ以外何も読まなくなる。');
        $('g_press').onclick=()=>flub('Captain Capy','capy:embarrassed',
          '*goes very pale* I— I need to check with someone about this. Legally. Come back tomorrow. *hides behind the clipboard*',
          '*さっと青ざめる* ぼ、僕はこれ、誰かに確認しないと。法的に。明日また来て。*クリップボードの陰に隠れる*',
          'He heard “blame hunt” and froze.',
          '「犯人探し」に聞こえて、彼は固まった。');
      });
    } else {
      say(nm('Captain Capy'),'capy:worried',
        L('*picks up the pen — then stops* The process, not the people. Good. Good! …But if the Empress asks WHO authorised releasing customer records — whose name stands on this line, hm? Because it will not be “the process”. Forms are signed by NAMES.',
          '*ペンを取り——止まる* 人じゃなくて工程。うん、いい。…でも、もし女帝陛下が「誰が顧客記録の開示を許可したのか」と聞いたら——この線の上に立つのは誰の名前？「工程」がサインするわけじゃない。書類には「名前」が要るんだ。'),()=>{
        interact(`<div class="choices">
          ${vc('g_secret',L('Promise secrecy','秘密を約束'),L('“Relax — no one will ever know.”','「大丈夫、誰にも知られないから。」'))}
          ${vc('g_mine',L('Own it','引き受ける'),L('“Mine. My name, my charter, my responsibility — in ink, right beside yours.”','「私の名前だ。私のチャーター、私の責任——きみの隣に、インクで書く。」'))}
          ${vc('g_rank',L('Pull rank','権威を持ち出す'),L('“The Empress commissioned this project herself. She outranks your worry.”','「このプロジェクトは女帝陛下じきじきの命だよ。きみの心配より上位だ。」'))}
        </div>`);
        $('g_secret').onclick=()=>flub('Captain Capy','capy:worried',
          '*writes “NO ONE WILL EVER KNOW” at the top of his worry list, underlines it twice* That is the single most frightening sentence anyone has ever said to me. I need to lie down.',
          '*心配リストの一番上に「誰にも知られない」と書き、二重線を引く* 人生で一番怖い一言だよ、それ。ちょっと横にならせて。',
          'Promising secrecy to a nervous approver reads as RISK, not comfort.',
          '不安な承認者への「秘密の約束」は、安心ではなくリスクに聞こえる。');
        $('g_mine').onclick=()=>{
          g.signed=true; tickHalfDay();
          say(nm('Captain Capy'),'capy:happy',
            L('*signs with enormous relief, then stamps it for good measure* Accountability with a NAME on it. That I can work with. Here — and tell Miko I said it was fine. Tell her TWICE, she will ask twice.',
              '*心底ほっとしてサインし、念のためスタンプまで押す* 名前入りの責任。それなら僕も安心だ。はい——ミコにも「僕がいいと言った」と伝えて。二回言ってね、二回聞かれるから。'),()=>render(
            `<div class="feedback good">${L('✅ Signed. Framing it as a process question — then putting YOUR name on the risk — opened the door.','✅ 署名獲得。「工程の問い」として示し、そのリスクに「自分の名前」を載せたことが扉を開いた。')}</div>`));
        };
        $('g_rank').onclick=()=>flub('Captain Capy','capy:embarrassed',
          '*freezes mid-pen* Then I will need that in writing. From her. Through channels. Proper channels. The pen is going back in the drawer now.',
          '*ペンを持ったまま凍りつく* なら、それを書面で。陛下から。正式ルートで。ちゃんとしたルートで。ペンは引き出しに戻すね。',
          'Pulling rank on a frightened signer sends everything into “channels”.',
          '怯えた承認者に権威を振りかざすと、すべてが「正式ルート行き」になる。');
      });
    }
  }
  /* ---- DOOR 2: Miko — purpose, then paperwork (two beats) ---- */
  function mikoStep(){
    if(g.mikoBeat===0){
      say(nm('Miko Cat'),'miko:dramatic',
        L('*lays a paw flat on the stack* Capy signed, nya — I heard twice. But these are CHILDREN’S letters. Before one page moves, look me in the eye: what exactly will you DO with them?',
          '*手紙の山にそっと肉球を置く* カピーのサインは聞いたよ、ニャ——二回ね。でもこれは「子どもたち」の手紙。一枚でも動かす前に、目を見て答えて：これで一体、何をするの？'),()=>{
        interact(`<div class="choices">
          ${vc('m_quote',L('Aim for impact','インパクト重視'),L('“Quote the saddest ones to the Empress — nothing moves a budget like a crying child.”','「一番悲しい手紙を陛下に読み上げる——泣いてる子どもほど予算を動かすものはないから。」'))}
          ${vc('m_counts',L('State the method','手法を明言'),L('“Count them. Dates, defect types, totals — no names, and nothing leaves this room but arithmetic.”','「数えるだけ。日付と不良の種類と件数——名前は使わない。この部屋を出るのは計算結果だけ。」'))}
          ${vc('m_vague',L('Stay flexible','柔軟に'),L('“Honestly? Whatever helps the project most.”','「正直？プロジェクトの役に立つことなら何でも。」'))}
        </div>`);
        $('m_quote').onclick=()=>flub('Miko Cat','miko:dramatic',
          '*SNATCHES the stack to her chest* They are not AMMUNITION, nya!! Out! OUT! …And I am telling Capy what you just said. *distant clipboard-clutching* He says his signature is “pending clarification” now.',
          '*手紙の山をさっと胸に抱える* この子たちは「弾薬」じゃないのニャ！！出てって！…今の、カピーにも言うからね。*遠くでクリップボードを抱きしめる音* サインは「要再確認」になったって。',
          'Treating customer pain as leverage burned trust across the whole chain.',
          '顧客の痛みを交渉材料にした瞬間、連鎖全体の信頼が燃えた。');
        $('m_counts').onclick=()=>{ g.mikoBeat=1; mikoStep(); };
        $('m_vague').onclick=()=>flub('Miko Cat','miko:smug',
          '*ears flatten slowly* “Whatever.” Customer records, nya. “Whatever” is not a purpose — it is the ABSENCE of one. Come back when you have one. …Capy is un-signing as we speak. I can hear the eraser.',
          '*耳がゆっくり伏せられる* 「何でも」。顧客記録だよ、ニャ。「何でも」は目的じゃない——目的が「無い」ってこと。目的を持ってから来て。…今ごろカピーがサインを消してる。消しゴムの音が聞こえるもん。',
          'A vague purpose is no purpose. Gatekeepers guard against exactly that.',
          '曖昧な目的は目的ではない。門番が守っているのは、まさにそこ。');
      });
    } else {
      say(nm('Miko Cat'),'miko:smug',
        L('*squints at the form, then at you* Hmmm. Nya. One problem: this authorises release of “PROCESS data”. Returns are CUSTOMER data. One wrong word, and this paper authorises precisely nothing. What do we do, data-chaser?',
          '*書類に目を細め、次にあなたを見る* んー、ニャ。ひとつ問題。これ「工程データ」の開示許可なんだよね。返品は「顧客データ」。一語違えば、この紙は何ひとつ許可してない。さあどうする、データ・ハンター？'),()=>{
        interact(`<div class="choices">
          ${vc('m_close',L('Wave it off','受け流す'),L('“It’s close enough. Nobody reads the wording.”','「だいたい合ってる。文言なんて誰も読まないって。」'))}
          ${vc('m_annot',L('Fix the paperwork','書類を直す'),L('“Then annotate it: ‘aggregated counts only — no customer identifiers’, initialled by us both, beside Capy’s signature.”','「なら注記しよう：『集計値のみ・個人識別情報なし』。カピーの署名の横に、二人でイニシャルを。」'))}
        </div>`);
        $('m_close').onclick=()=>flub('Miko Cat','miko:dramatic',
          '*points the stamp at you like a wand* The EMPRESS reads the wording, nya. She reads EVERYTHING. And now I have doubts, and my stamp has doubts, and doubts travel — ask Capy. Start again.',
          '*スタンプを杖みたいに突きつける* 陛下は文言を読むの、ニャ。ぜんぶ読むの。おかげでわたしにも、わたしのスタンプにも疑念が湧いた。疑念は伝染するんだよ——カピーに聞いてみて。やり直し。',
          'Sloppy paperwork around customer data undoes chains of custody.',
          '顧客データ絡みの雑な書類仕事は、管理の連鎖そのものを壊す。');
        $('m_annot').onclick=()=>{
          g.released=true; tickHalfDay();
          say(nm('Miko Cat'),'miko:delighted',
            L('*stamps the annotation with a tiny pink stamp* PRECISE! Aggregated counts, no identifiers, two sets of initials. The ledger is yours, nya — every return, every date. Do something WORTHY with it.',
              '*ちいさなピンクのスタンプで注記に押印* 正確！集計値のみ、識別情報なし、イニシャル二組。台帳はあなたのもの、ニャ——返品も日付もぜんぶ。ちゃんと価値あることに使ってね。'),()=>render(
            `<div class="feedback good">${L('✅ Returns ledger released — purpose stated, paperwork fixed. Now Penny can do the arithmetic she promised.','✅ 返品台帳を入手——目的を明言し、書類も直した。これでペニーが約束の計算をできる。')}</div>`));
        };
      });
    }
  }
  /* ---- DOOR 3: Penny — prove you know the arithmetic ---- */
  function pennyStep(){
    say(nm('Penny Penguin'),'penny:stern',
      L('*lays the ledger beside her logs — and does NOT pick up the pen* Before I compute your escaped-defect rate, you will tell ME the arithmetic. I do not hand numbers to people who cannot say what they mean. Which division produces it?',
        '*台帳を自分の記録の横に置き——ペンは取らない* 流出不良率を計算する前に、その計算式を「あなたが」言いなさい。意味を言えない人に数字は渡さない主義なの。さて、どの割り算かしら？'),()=>{
      interact(`<div class="choices">
        ${vc('p_prod',L('Answer','答える'),L('“Returned-defective units ÷ units PRODUCED.”','「不良返品数 ÷ 生産数。」'))}
        ${vc('p_ship',L('Answer','答える'),L('“Returned-defective units ÷ units SHIPPED — same ninety days as your logs.”','「不良返品数 ÷ 出荷数——あなたの記録と同じ90日間で。」'))}
        ${vc('p_sub',L('Answer','答える'),L('“You take the 12.6% and… subtract something?”','「12.6%から…何かを引く、とか？」'))}
      </div>`);
      $('p_prod').onclick=()=>flub('Penny Penguin','penny:stern',
        '*one talon taps the sheet* PRODUCED includes the 12.6% we caught at the gate. An ESCAPE is measured against what got PAST the gate — what we shipped. And fuzzy arithmetic upstream makes me doubt paperwork downstream: I will re-verify the whole chain of custody before this ledger opens again.',
        '*羽先がコツンと用紙を叩く* 「生産数」には、門で捕まえた12.6%が含まれるでしょう。「流出」は門を通り抜けたもの——つまり出荷数に対して測るの。それに、計算が曖昧な人の書類は疑わしい。台帳を再び開く前に、管理の連鎖を全部確認し直させてもらうわ。',
        'Wrong denominator, wrong meaning — and a stickler re-verifies EVERYTHING.',
        '分母を間違えれば意味も間違う——そして几帳面な人は「すべて」を確認し直す。');
      $('p_ship').onclick=()=>{
        say(nm('Penny Penguin'),'penny:pleased',
          L('*finally reaches for a fresh sheet* Shipped. Same window. Correct — you may watch. Returned-defective against shipped, ninety days… there. 4.8% of what we SHIP still fails in a child’s hands. Against my 12.6% caught inside. Two different numbers, two different meanings — and now you can prove both. THIS is what a chased-down figure looks like.',
            '*ようやく新しい用紙に手を伸ばす* 出荷数。同じ期間。正解——見ていていいわよ。不良返品対出荷、90日分…はい。出荷したうちの4.8%が、子どもの手の中で壊れている。工場内で捕まえた12.6%とは別物。二つの数字、二つの意味——そしてもう、どちらも証明できる。追い詰めて手に入れた数字とは、こういうものよ。'),()=>{
          g.done=true; tickHalfDay(); addCards(['p_field']);
          const back=S.gateReturn||'hub';
          interact(`<div class="feedback good">${L('📒 <b>Escaped-defect rate secured: 4.8%.</b> Three doors, one chain of custody, zero shortcuts — and you can defend every step of it under the Empress’s glare.','📒 <b>流出不良率 4.8% を確保。</b>三つの扉、一本の管理の連鎖、近道はゼロ——そのすべてを、陛下の視線の下でも堂々と説明できる。')}</div>
            <button class="btn" id="nx">${back==='reconcile'?L('Back to the numbers ✦','数字の整理に戻る ✦'):L('Back to the interviews ✦','聞き取りに戻る ✦')}</button>`);
          $('nx').onclick=()=>go(back);
        });
      };
      $('p_sub').onclick=()=>flub('Penny Penguin','penny:stern',
        '*removes the spectacles entirely* Subtract. Something. …We are done until you can NAME the division. And guesswork at my desk makes me question what you told Miko at hers — the release gets re-confirmed. From the top.',
        '*眼鏡を完全に外す* 引く。何かを。…割り算を「言える」ようになるまで、この話はおしまい。それに、私の机で当てずっぽうを言う人が、ミコの机で何を言ったのかも疑わしくなる——開示は最初から再確認よ。',
        'If you cannot state the arithmetic, the gatekeepers stop trusting your paperwork.',
        '計算式を言えない相手の書類は、門番たちからの信頼を失う。');
    });
  }
},

/* ---------- PUZZLE 2: reconciling the conflicting numbers ---------- */
reconcile(){
  drawWarroom(); banner(L('RECONCILING THE NUMBERS','数字のすり合わせ'));
  narrate(L('Five figures, five sources, and not one of them agrees with another. Before a single word of the charter is written, they must be made to mean something.',
    '5つの数字、5つの出どころ、そしてどれ一つ一致しない。チャーターに一言書く前に、これらに意味を持たせなければならない。'));
  say(nm('Uni the Unicorn'),'uni',
    L('Everyone quoted you a number, and every one of them believes theirs is THE number. They are not lying — they are each right about something DIFFERENT. Match every figure to what it truly counts. Get this straight and the primary metric will pick itself; get it muddled and you will argue about the wrong dial for ninety days.',
      'みんながきみに数字を告げ、それぞれが「これこそが数字だ」と信じている。誰も嘘はついていない——それぞれが「別のこと」について正しいだけ。各数字を、それが本当に数えているものと結びつけて。ここを整理できれば主要指標は自ずと決まる。混ざったままなら、90日間ずっと間違った指標で言い争うことになる。'),()=>{
    render();
  });
  /* only figures whose evidence you actually hold */
  function figs(){ return RECON.figures.filter(f=>S.have.includes(f.need)); }
  function render(checked){
    const list=figs();
    const rows=list.map(f=>{
      const pick=S.recon[f.k];
      const right=pick===f.ans;
      const cls=checked?(right?'right':'wrong'):'';
      const opts=RECON.answers.map(a=>
        `<button class="rec-opt ${pick===a.k?'on':''}" data-f="${f.k}" data-a="${a.k}">${S.lang==='ja'?a.t[1]:a.t[0]}</button>`).join('');
      const verdict=checked?`<div class="rec-verdict">${right?L('✓ correct','✓ 正解'):L('✗ not what that figure counts','✗ その数字が数えているものではない')}</div>`:'';
      return `<div class="rec-row ${cls}"><div class="rec-fig">${f.t}</div><div class="rec-src">${f.src}</div>
        <div class="rec-opts">${opts}</div>${verdict}</div>`;
    }).join('');
    /* the escaped-defect figure is the one that decides the primary metric — if it is
       missing, say so loudly and offer the way to go and get it */
    let gap='';
    if(!S.have.includes('p_field')){
      gap=`<div class="feedback badf" style="text-align:left"><b>${L('⚠ A figure is missing from this board.','⚠ この盤に足りない数字がある。')}</b><br>${
        L('Nobody has given you a number for defects <b>reaching customers</b> — and that is the one the charter needs most. Without it you cannot even name the right primary metric.','<b>顧客に届いてしまった</b>不良の数字を、まだ誰も渡してくれていない——そしてそれこそチャーターが最も必要とする数字だ。これがなければ、正しい主要指標を名指すことすらできない。')}${
        S.gate.named?`<br><button class="btn" id="tochase" style="margin-top:6px">${L('Go finish the returns-ledger chase ✦','返品台帳の追跡を終わらせる ✦')}</button>`
                    :`<br><span class="hint" style="text-align:left">${L('Penny hinted at it once — press her on what gets PAST the gate.','ペニーが一度ほのめかしていた——門を「すり抜けた」分について問い詰めて。')}</span>`}</div>`;
    }
    const all=list.length>0&&list.every(f=>S.recon[f.k]);
    const hint=S.reconTries>=2?`<div class="feedback tip" style="text-align:left">${L('💡 Hint: two of these describe the SAME internal gate. One is money, not a rate. One was never counted at all.','💡 ヒント：このうち二つは「同じ内部の門」を指している。一つは率ではなくお金。一つはそもそも数えられていない。')}</div>`:'';
    interact(gap+rows+hint+
      `<div class="hint">${L('Tap the meaning that each figure actually measures. Every figure gets one — this must be settled before the charter is written.','各数字が実際に測っているものをタップ。すべての数字に一つずつ——チャーターを書く前に、ここを決着させる必要がある。')}</div>`+
      `<button class="btn" id="chk" ${all?'':'disabled'}>${L('Check the reconciliation ✦','すり合わせを確認する ✦')}</button>`);
    document.querySelectorAll('.rec-opt').forEach(b=>b.onclick=()=>{ S.recon[b.dataset.f]=b.dataset.a; render(); });
    const c=$('chk'); if(c) c.onclick=check;
    const tc=$('tochase'); if(tc) tc.onclick=()=>{ S.gateReturn='reconcile'; go('ledger'); };
  }
  function check(){
    S.reconTries++;
    const wrong=figs().filter(f=>S.recon[f.k]!==f.ans);
    if(wrong.length===0){
      S.reconciled=true; addCards(['p_reconcile']); tickHalfDay();
      const hasEscape=S.have.includes('p_field');
      say(nm('Uni the Unicorn'),hasEscape?'uni:happy':'uni:concerned',
        hasEscape?
        L('THERE it is. Two of those figures describe the same internal gate. One is a cost, not a rate. One was never measured at all. And exactly ONE describes what a child actually experiences — 4.8% escaping to customers. That is the dial your charter must name. Notice nobody lied to you; they simply each answered a different question.',
          'それだ。あの中の二つは「同じ内部の門」を説明している。一つはコストであって率ではない。一つはそもそも測られていない。そして、子どもが実際に体験しているものを表すのは、ちょうど一つだけ——顧客に流出する4.8%。それこそチャーターが名指すべき指標。誰も嘘はついていない、それぞれ違う問いに答えていただけだと気づいて。'):
        L('Well sorted — every figure you HAVE is now correctly labelled. But look at what is not on this board: not one of these numbers describes what reaches the customer. You are about to write a charter about a gate, not about a child. I will not stop you… but the Empress will ask.',
          'よく整理できた——「手元にある」数字はすべて正しく分類された。だが、この盤に無いものを見て：顧客に届いたものを表す数字が、一つもない。きみは「子ども」ではなく「門」についてのチャーターを書こうとしている。止めはしないよ…でも、皇帝は必ず訊いてくる。'),()=>{
        interact(`<div class="feedback ${hasEscape?'good':'tip'}">${hasEscape?L('📒 <b>Reconciled picture filed in your notebook.</b> Conflicting data is normal; unreconciled data is negligence.','📒 <b>すり合わせた全体像をノートに記録。</b>データが食い違うのは普通のこと。すり合わせないまま放置するのが怠慢だ。'):L('📒 <b>Filed — but with a hole in it.</b> The escaped-defect figure is still missing.','📒 <b>記録した——ただし穴が空いたまま。</b>流出不良の数字がまだ足りない。')}</div>
          <button class="btn" id="nx">${L('On to the problem statement ✦','問題記述へ ✦')}</button>`);
        $('nx').onclick=done;
      });
    } else {
      render(true);
      const el=$('interact');
      el.insertAdjacentHTML('afterbegin',
        `<div class="feedback tip">${L(`${wrong.length} figure${wrong.length===1?'':'s'} still mis-labelled — see the red rows. Re-assign and check again.`,`${wrong.length}つの数字がまだ正しく分類されていない——赤い行を見て。割り当て直して、もう一度確認を。`)}</div>`);
    }
  }
  function done(){ if(S.reworkMode){ go('rework'); return; } go('stake_build'); }
},

/* ---------- block diagram build ---------- */
flow_build(){
  renderTracker(2); drawWarroom(); addHelpBadge('flow'); banner(L('Deliverable 1 · Block Diagram','成果物 1 · ブロック図'));
  narrate(L('The mapping table. Eight sketched blocks lie scattered where your notebook spilled them — the whole factory, waiting to be put in order.',
    'マッピング台。ノートからこぼれた8つのブロックの走り書きが散らばっている——工場まるごとが、順番に並べられるのを待っている。'));
  if(!S.flow) S.flow=[...FLOW_SCRAMBLE];
  const hasWalkthrough=S.have.includes('t_flow');
  say(nm('Uni the Unicorn'),'uni',
    hasWalkthrough?
    L('First deliverable: the BLOCK DIAGRAM — a high-level picture of the process, one block per major step. Not a detailed map; that comes later. I see Torto recited the whole line for you. Forty years of knowledge, earned with one good question. Use it.',
      '最初の成果物：「ブロック図」——工程を大づかみに描いたもので、主要な工程ごとに1ブロック。詳細な地図ではないよ、それは後のフェーズだ。トルトがライン全体を諳んじてくれたようだね。40年の知恵を、いい質問ひとつで引き出した。活かすといい。'):
    L('First deliverable: the BLOCK DIAGRAM — a high-level picture of the process, one block per major step. Not a detailed map; that comes in later phases. Arrange the eight blocks in the true order of the line. Hm — did anyone actually walk you through it, or is this Capy\'s blurry tour? Either way: I will not tell you if you are right. The tollgate will.',
      '最初の成果物：「ブロック図」——工程を大づかみに描いたもので、主要な工程ごとに1ブロック。詳細な地図ではないよ、それは後のフェーズだ。8つのブロックを、ラインの本当の順番に並べて。ふむ——誰かがちゃんと順を追って説明してくれた？それともカピーのぼんやりした案内だけ？どちらにせよ、正しいかどうかは、わたしは言わない。トールゲートが教えてくれる。'),()=>{
    renderFlow();
  });
  function renderFlow(){
    const ref=hasWalkthrough?
      `<div class="feedback good" style="font-size:12.5px">📒 <b>${L('From your notebook — Torto’s walkthrough:','ノートより——トルトの説明：')}</b> ${CARDS.t_flow.txt}</div>`:
      `<div class="feedback tip" style="font-size:12.5px">📒 ${L('Nobody gave you the true order. You are reconstructing it from Capy’s blur — good luck.','本当の順番を教えてくれた人はいない。カピーの曖昧な記憶から組み立て直すしかない——健闘を祈る。')}</div>`;
    const blocks=S.flow.map((stepIdx,pos)=>
      `<div class="flow-arrow">↓</div><div class="flow-step" draggable="true" data-pos="${pos}"><span class="num">${pos+1}</span><span class="flab">${FLOW[stepIdx]}</span><span class="grip">⠿</span></div>`).join('');
    interact(ref+`<div class="flow-diagram" id="fl">
        <div class="flow-cap">${L('▶ START · raw materials in','▶ 開始 · 原材料が入る')}</div>
        ${blocks}
        <div class="flow-arrow">↓</div>
        <div class="flow-cap">${L('■ END · shipped to customers','■ 終了 · 顧客へ出荷')}</div>
      </div>
      <div class="hint">${L('🖐 Drag the blocks into the true order of the line — they connect top to bottom. Then lock it in.','🖐 ブロックをラインの正しい順番にドラッグ——上から下へつながる。できたら確定。')}</div>
      <button class="btn" id="lockflow">${L('Lock in the block diagram ✦','ブロック図を確定する ✦')}</button>`+helpControl('flow'));
    let dragFrom=null;
    document.querySelectorAll('.flow-step').forEach(el=>{
      el.addEventListener('dragstart',e=>{
        dragFrom=+el.dataset.pos; el.classList.add('dragging');
        try{ e.dataTransfer.setData('text/plain',String(dragFrom)); e.dataTransfer.effectAllowed='move'; }catch(_){}
      });
      el.addEventListener('dragend',()=>{
        document.querySelectorAll('.flow-step').forEach(s=>s.classList.remove('dragging','dragover'));
      });
      el.addEventListener('dragover',e=>{
        e.preventDefault(); if(e.dataTransfer) e.dataTransfer.dropEffect='move';
        if(+el.dataset.pos!==dragFrom) el.classList.add('dragover');
      });
      el.addEventListener('dragleave',()=>el.classList.remove('dragover'));
      el.addEventListener('drop',e=>{
        e.preventDefault();
        const to=+el.dataset.pos;
        if(dragFrom===null||to===dragFrom) return;
        const [moved]=S.flow.splice(dragFrom,1);
        S.flow.splice(to,0,moved);
        dragFrom=null;
        renderFlow();
      });
    });
    $('lockflow').onclick=()=>{
      S.flowDone=true;
      if(S.reworkMode){ go('rework'); return; }
      say(nm('Uni the Unicorn'),'uni',L('Locked. On to the SIPOC.','確定。次はSIPOCだ。'),()=>{
        interact(`<button class="btn" id="nx">${L('Build the SIPOC ✦','SIPOCを作る ✦')}</button>`);
        $('nx').onclick=()=>go('sipoc_build');
      });
    };
  }
},

/* ---------- SIPOC build ---------- */
sipoc_build(){
  renderTracker(3); drawWarroom(); addHelpBadge('sipoc'); banner(L('Deliverable 2 · SIPOC','成果物 2 · SIPOC'));
  narrate(L('Sticky notes, string, and a corkboard borrowed from the break room. Your tour notes from Capy\u2019s walk (\ud83d\udcd2) list every supplier, input, output and customer you have met. Uni watches from a respectful, unhelpful distance.',
    '\u4ed8\u7b8b\u3001\u3072\u3082\u3001\u4f11\u61a9\u5ba4\u304b\u3089\u501f\u308a\u305f\u30b3\u30eb\u30af\u30dc\u30fc\u30c9\u3002\u30ab\u30d4\u30fc\u306e\u6848\u5185\u30e1\u30e2\uff08\ud83d\udcd2\uff09\u306b\u306f\u3001\u3053\u308c\u307e\u3067\u51fa\u4f1a\u3063\u305f\u4f9b\u7d66\u8005\u30fb\u5165\u529b\u30fb\u51fa\u529b\u30fb\u9867\u5ba2\u304c\u3059\u3079\u3066\u8f09\u3063\u3066\u3044\u308b\u3002\u30e6\u30cb\u306f\u793c\u5100\u6b63\u3057\u304f\u3082\u5f79\u306b\u7acb\u305f\u306a\u3044\u8ddd\u96e2\u304b\u3089\u898b\u5b88\u3063\u3066\u3044\u308b\u3002'));
  say(nm('Uni the Unicorn'),'uni',
    L('The SIPOC frames the process: Suppliers, Inputs, Process, Outputs, Customers. DRAG each item into its column (or tap-then-tap, if you prefer). Anything that does not belong in a SIPOC goes in the bin. Choose carefully — I am saying nothing.',
      'SIPOCは工程を枠づける：Suppliers（供給者）、Inputs（入力）、Process（工程）、Outputs（出力）、Customers（顧客）。各項目をその列へドラッグ（タップ→タップでも可）。SIPOCに属さないものはゴミ箱へ。慎重に選んで——わたしは何も言わないよ。'),()=>{
    renderSipoc();
  });
  /* shuffle the pool ONCE per visit so items are not offered in S,I,O,C order —
     dragging them "in order of appearance" must not solve the exercise */
  const poolOrder=[...SIPOC_ITEMS.keys()];
  for(let i=poolOrder.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [poolOrder[i],poolOrder[j]]=[poolOrder[j],poolOrder[i]]; }
  function renderSipoc(){
    const placed=new Set(['S','I','O','C','X'].flatMap(c=>S.sipoc[c]));
    const colHtml=c=>S.sipoc[c].map(i=>`<div class="placed-chip" data-rm="${i}" data-col="${c}">${SIPOC_ITEMS[i].t} ✕</div>`).join('');
    interact(`
      <div class="sipoc-grid">
        <div class="sipoc-col" data-col="S"><h5>${L('Suppliers','供給者')}</h5>${colHtml('S')}</div>
        <div class="sipoc-col" data-col="I"><h5>${L('Inputs','入力')}</h5>${colHtml('I')}</div>
        <div class="sipoc-col pcol"><h5>${L('Process','工程')}</h5><div class="placed-chip">${L('Your block diagram ✓','きみのブロック図 ✓')}</div></div>
        <div class="sipoc-col" data-col="O"><h5>${L('Outputs','出力')}</h5>${colHtml('O')}</div>
        <div class="sipoc-col" data-col="C"><h5>${L('Customers','顧客')}</h5>${colHtml('C')}</div>
      </div>
      <div class="sipoc-col trash-col" data-col="X" style="min-height:52px"><h5>${L('🗑️ Not SIPOC material','🗑️ SIPOCに属さないもの')}</h5>${colHtml('X')}</div>
      <div class="chip-pool" id="pool">${poolOrder.map(i=>placed.has(i)?'':`<div class="chip" data-i="${i}">${SIPOC_ITEMS[i].t}</div>`).join('')}</div>
      <button class="btn" id="locksipoc">${placed.size<SIPOC_ITEMS.length?L('Lock as-is (items unsorted — risky) ✦','このまま確定（未分類あり — 危険）✦'):L('Lock in the SIPOC ✦','SIPOCを確定する ✦')}</button>`+helpControl('sipoc'));
    let sel=null, dragIdx=null;
    document.querySelectorAll('.chip[data-i]').forEach(ch=>{
      ch.setAttribute('draggable','true');
      ch.onclick=()=>{
        document.querySelectorAll('.chip').forEach(x=>x.classList.remove('sel'));
        sel=+ch.dataset.i; ch.classList.add('sel');
        document.querySelectorAll('.sipoc-col[data-col]').forEach(c=>c.classList.add('hl'));
      };
      ch.addEventListener('dragstart',e=>{
        dragIdx=+ch.dataset.i; ch.classList.add('dragging');
        try{ e.dataTransfer.setData('text/plain',String(dragIdx)); e.dataTransfer.effectAllowed='move'; }catch(_){}
      });
      ch.addEventListener('dragend',()=>{
        document.querySelectorAll('.chip').forEach(x=>x.classList.remove('dragging'));
        document.querySelectorAll('.sipoc-col').forEach(c=>c.classList.remove('dragover'));
      });
    });
    document.querySelectorAll('.sipoc-col [data-rm]').forEach(pc=>{
      pc.setAttribute('draggable','true');
      pc.addEventListener('dragstart',e=>{
        dragIdx=+pc.dataset.rm;
        const c=pc.dataset.col; S.sipoc[c]=S.sipoc[c].filter(x=>x!==dragIdx);
        try{ e.dataTransfer.setData('text/plain',String(dragIdx)); }catch(_){}
      });
      pc.addEventListener('dragend',()=>renderSipoc());
    });
    document.querySelectorAll('.sipoc-col[data-col]').forEach(col=>{
      col.addEventListener('dragover',e=>{ e.preventDefault(); col.classList.add('dragover');
        if(e.dataTransfer) e.dataTransfer.dropEffect='move'; });
      col.addEventListener('dragleave',()=>col.classList.remove('dragover'));
      col.addEventListener('drop',e=>{
        e.preventDefault(); col.classList.remove('dragover');
        if(dragIdx===null) return;
        S.sipoc[col.dataset.col].push(dragIdx); dragIdx=null; renderSipoc();
      });
      col.onclick=(e)=>{
        if(e.target.dataset.rm!==undefined && e.target.dataset.col){
          const i=+e.target.dataset.rm, c=e.target.dataset.col;
          S.sipoc[c]=S.sipoc[c].filter(x=>x!==i); renderSipoc(); return;
        }
        if(sel===null) return;
        S.sipoc[col.dataset.col].push(sel); sel=null; renderSipoc();
      };
    });
    const lockBtn=$('locksipoc');
    if(lockBtn) lockBtn.onclick=()=>{
      S.sipocDone=true;
      if(S.reworkMode){ go('rework'); return; }
      tickHalfDay();
      say(nm('Uni the Unicorn'),'uni',L('Noted and filed. Next: the customer gets a voice.','記録して整理。次は、顧客に声をあげてもらおう。'),()=>{
        interact(`<button class="btn" id="nx">${L('Draw the scope boundaries ✦','範囲の境界線を引く ✦')}</button>`);
        $('nx').onclick=()=>go('scope_build');
      });
    };
  }
},

/* ---------- scope build: In / Out / Parking lot ---------- */
scope_build(){
  renderTracker(4); drawWarroom(); addHelpBadge('scope'); banner(L('Deliverable 3 · Scope','成果物 3 · 範囲（スコープ）'));
  narrate(L('A roll of red string and a box of pins. Uni has drawn a chalk rectangle on the table and written IN on one side, OUT on the other — and, smaller, LATER in a corner.',
    '赤い糸のロールとピンの箱。ユニがテーブルにチョークで四角を描き、片側に「対象内」、反対側に「対象外」——そして隅に小さく「あとで」と書いた。'));
  say(nm('Uni the Unicorn'),'uni',
    L('Scope is the fence around the process you will study — and the SIPOC already told you where the posts go: first block to last block. Inside the fence: the line and what measures it. Outside: other people’s processes, and anything that is a FIX or a CULPRIT rather than a boundary. And the parking lot is for real work that belongs to a later phase — noted, not lost, not now. Draw carefully. Every extra thing inside the fence is a project you did not sign up for.',
      'スコープとは、調べる工程の周りに立てる柵だ——そして柵の杭の位置は、SIPOCがすでに教えてくれている：最初のブロックから最後のブロックまで。柵の内側は、ラインと、それを測るもの。外側は、他人の工程、そして「境界」ではなく「対策」や「犯人」であるもの。保留の場所は、後のフェーズに属する本物の仕事のため——記録し、忘れず、今はやらない。慎重に線を引いて。柵の内側に余計なものが一つ増えるごとに、引き受けた覚えのないプロジェクトが一つ増える。'),()=>{
    sorterUI({state:S.scope,items:SCOPE_ITEMS,cols:SCOPE_COLS,gridClass:'scope-grid',lockId:'lockscope',
      lockEn:'Lock the scope ✦',lockJa:'範囲を確定 ✦',help:'scope',
      onLock:()=>{
        S.scopeDone=true;
        if(S.reworkMode){ go('rework'); return; }
        tickHalfDay();
        say(nm('Uni the Unicorn'),'uni',L('Fence posts in. Now — the people. The customer gets a voice next.','杭は立った。次は人だ——顧客に声を。'),()=>{
          interact(`<button class="btn" id="nx">${L('Hear the stakeholders ✦','関係者の声を聞く ✦')}</button>`);
          $('nx').onclick=()=>go('voc_build');
        });
      }});
  });
},

/* ---------- stakeholder grid: power × interest ---------- */
stake_build(){
  renderTracker(6); drawWarroom(); addHelpBadge('stake'); banner(L('Deliverable 5 · Stakeholder analysis','成果物 5 · 関係者分析'));
  narrate(L('The meeting corner has emptied, but the chairs are still warm. Uni pins a two-by-two grid to the corkboard: POWER up the side, INTEREST along the bottom, and a stack of name cards.',
    '打ち合わせコーナーは空になったが、椅子はまだ温かい。ユニがコルクボードに2×2の格子を貼る：縦に「権限」、横に「関心」、そして名札の束。'));
  say(nm('Uni the Unicorn'),'uni',
    L('You have heard everyone. Now decide how each of them is HANDLED for the next ninety days — because the grid is your communication plan. Two questions per name: can they change this project’s fate? Do they care how it turns out? High power, high interest — manage closely. Power without interest — keep satisfied. Interest without power — keep informed. Neither — monitor. Misplace the wrong dragon, and you will hear about it.',
      '全員の声を聞いたね。では、この先90日間、それぞれをどう「扱う」かを決めて——この格子こそがコミュニケーション計画だから。名前ごとに問いは二つ：この人はプロジェクトの運命を変えられるか？結果を気にしているか？権限も関心も高い——綿密に管理。権限はあるが関心は低い——満足させておく。関心はあるが権限は低い——情報を共有。どちらも低い——見守る。竜の置き場所を間違えたら、後で聞かされることになるよ。'),()=>{
    const axes=`<div class="axis">↑ ${L('POWER','権限')}  ·  ${L('INTEREST','関心')} →</div>`;
    sorterUI({state:S.stake,items:STAKE_ITEMS,cols:STAKE_COLS,gridClass:'grid2',lockId:'lockstake',
      lockEn:'Lock the stakeholder grid ✦',lockJa:'関係者格子を確定 ✦',help:'stake',axes,
      onLock:()=>{
        S.stakeDone=true;
        if(S.reworkMode){ go('rework'); return; }
        tickHalfDay();
        say(nm('Uni the Unicorn'),'uni',L('Filed. Now the centerpiece: the problem statement.','記録した。では中心へ——問題記述だ。'),()=>{
          interact(`<button class="btn" id="nx">${L('Write the problem statement ✦','問題記述を書く ✦')}</button>`);
          $('nx').onclick=()=>go('ps_build');
        });
      }});
  });
},

/* ---------- Voice of the Customer build: the stakeholder gauntlet ---------- */
voc_build(){
  renderTracker(5); drawWarroom(); addHelpBadge('voc'); banner(L('Deliverable 3 · Voice of the Customer','成果物 3 · 顧客の声（VOC）'));
  narrate(S.have.includes('m_shops')
    ? L('Uni has gathered the stakeholders in the meeting corner: a small customer clutching a wounded plushie, the formidable owner of the Sakura Toy Emporium — and two employees who invited themselves. Everyone claims to have "needs."',
        'ユニが打ち合わせコーナーに関係者を集めた：傷ついたぬいぐるみを抱きしめる小さなお客さま、サクラおもちゃ百貨店の威厳ある店主——そして、勝手に押しかけてきた従業員2人。全員が「ニーズがある」と主張している。')
    : L('Uni has gathered the stakeholders in the meeting corner: a small customer clutching a wounded plushie, an EMPTY chair with a reserved card nobody filled in — and two employees who invited themselves. Someone who sells your plushies was never named, so never invited.',
        'ユニが打ち合わせコーナーに関係者を集めた：傷ついたぬいぐるみを抱きしめる小さなお客さま、名前の書かれていない予約札の置かれた「空席」——そして、勝手に押しかけてきた従業員2人。ぬいぐるみを売っている誰かは、名前を聞かれなかったので、招かれなかった。'));
  if(!S.vocGame) S.vocGame={hana:{stage:0,done:false,pat:6},sakura:{stage:0,done:false,pat:6},capy:{stage:0,done:false,pat:5},torto:{stage:0,done:false,pat:5}};
  say(nm('Uni the Unicorn'),'uni',
    L('The Voice of the Customer — live, and on the clock. Each of them arrives with a WANT: loud, sincere, rarely measurable. Their patience is FINITE, Green Belt: every probing question spends a little, and a clumsy one spends MORE — and knocks the conversation back to its start. Spend it all, and that voice goes home unrecorded. Drill until a countable NEED appears. Push back on fixes. Reframe the insiders. And mind the meter.',
      '顧客の声——今回は生の声、しかも時間との勝負だ。皆の忍耐は有限だよ、グリーンベルト。踏み込んだ質問をするたび少し減り、不器用な質問ならもっと減る——しかも会話は振り出しに戻ってしまう。使い果たせば、その声は記録されないまま帰ってしまう。数えられるニーズが現れるまで掘り下げること。解決策には押し返すこと。内部の声は言い換えること。そして、メーターから目を離さないように。'),()=>{
    renderStakes();
  });

  const VGD={
    hana:{name:'Hana, age 6',role:'Customer — hugs plushies professionally',cls:'hana',max:6},
    sakura:{name:'Ms. Sakura',role:'Owner, Sakura Toy Emporium (retailer)',cls:'sakura',max:6},
    capy:{name:'Captain Capy',role:'Floor supervisor (internal customer)',cls:'capy',max:5},
    torto:{name:'Torto',role:'Veteran operator (internal customer)',cls:'torto',max:5},
  };
  const sakuraLocked=()=>!S.have.includes('m_shops');
  function statusOf(id){
    const g=S.vocGame[id];
    if(id==='sakura'&&sakuraLocked()) return [L('🔒 Not identified — you never asked Miko WHICH shops complain. Ask her (🆘 below) to unlock; it costs a day.','🔒 未特定——ミコに「どの店が」と聞かなかった。下の🆘で質問すれば解放（1日消費）。'),'warn'];
    if(g.lost) return ['✗ patience spent — voice lost today','warn'];
    if(!g.done) return [`…waiting · patience ${dots(id)}`,'warn'];
    if(id==='hana') return [{ok:'✓ CTQ: 1,000 hug-cycles',vague:'✓ recorded (vague…)',sol:'✓ recorded (a fix…)'}[S.ctq.smile]||'✓ recorded','ok'];
    if(id==='sakura'){
      const p=[];
      if(S.ctq.ship) p.push({ok:'≤0.5% incoming',vague:'incoming (vague…)',sol:'a discount (a fix…)'}[S.ctq.ship]||'recorded');
      if(S.ctq.returns) p.push({ok:'≤0.5% returns',vague:'returns (vague…)'}[S.ctq.returns]||'recorded');
      return ['✓ CTQ: '+(p.join(' · ')||'recorded'),'ok'];
    }
    if(id==='capy'){
      if(S.voc.voc.includes('v4')) return ['✓ recorded as VOC (?)','ok'];
      if(S.ctq.rework) return [{ok:'✓ internal req: rework ≤2%',vague:'✓ recorded (vague…)'}[S.ctq.rework]||'✓ recorded','ok'];
      return ['— voice went unused','warn'];
    }
    if(S.voc.voc.includes('v5')) return ['✓ recorded as VOC (?)','ok'];
    if(S.ctq.thread) return [{ok:'✓ internal req: tension in spec',vague:'✓ recorded (vague…)'}[S.ctq.thread]||'✓ recorded','ok'];
    return ['— voice went unused','warn'];
  }
  function renderStakes(){
    const cards=Object.keys(VGD).map(id=>{
      const d=VGD[id],[st,cls2]=statusOf(id);
      const lockCls=(id==='sakura'&&sakuraLocked())?' locked-p':'';
      return `<div class="person${lockCls}" data-s="${id}">
        <div class="pav">${artHTML(d.cls)}</div>
        <div><div class="pn">${d.name}</div><div class="pr">${d.role}</div>
        <div class="stake-status ${cls2}">${st}</div></div></div>`;
    }).join('');
    const customersDone=S.vocGame.hana.done&&(S.vocGame.sakura.done||sakuraLocked());
    interact(`<div class="person-grid">${cards}</div>
      <div class="hint">${customersDone?'Everyone heard. Close the session when ready.':'Careful questions move people forward. Clumsy ones start you over — and the meter never refills.'}</div>
      <button class="btn" id="fin">${customersDone?'Close the VOC session ✦':'Close session early (risky) ✦'}</button>`+helpControl('voc'));
    document.querySelectorAll('.person[data-s]').forEach(el=>{
      el.onclick=()=>openStake(el.dataset.s);
    });
    $('fin').onclick=finish;
  }
  const back=`<button class="btn ghost" id="bk">↩ Back to the group</button>`;
  function wireBack(){ const b=$('bk'); if(b) b.onclick=renderStakes; }
  function dots(id){ const g=S.vocGame[id],m=VGD[id].max||5;
    return '●'.repeat(Math.max(0,g.pat))+'○'.repeat(m-Math.max(0,g.pat)); }
  function patBar(id){ return `<div class="patience">🕐 ${VGD[id].name.split(',')[0]}’s patience: ${dots(id)}</div>`; }
  function spend(id,cost){
    const g=S.vocGame[id]; g.pat-=cost;
    if(g.pat<=0){
      g.pat=0; g.done=true; g.lost=true;
      const LOSTL={
        hana:['*hugs Mr. Mochi and turns her whole body away* You are not LISTENING. Mr. Mochi and I are going home.',null],
        sakura:['*snaps her fan shut with terrible finality* My time is merchandise, dear, and you have spent all of it. Good day.',null],
        capy:['*ears completely flat* I— I have a floor to run. Forget I said anything. It was silly anyway.','embarrassed'],
        torto:['*pointedly refills his tea and turns his shell toward you* Tea break. Sacred. Indefinitely.',null],
      }[id];
      say(VGD[id].name,VGD[id].cls+(LOSTL[1]?':'+LOSTL[1]:''),LOSTL[0],renderStakes);
      return false;
    }
    return true;
  }
  function wrong(id,cost,rebuffText,mood){
    if(!spend(id,cost)) return;
    S.vocGame[id].stage=0;
    say(VGD[id].name,VGD[id].cls+(mood?':'+mood:''),rebuffText+' …(The conversation slips back to the beginning.)',()=>openStake(id));
  }
  function advance(id,next,fn){
    if(!spend(id,1)) return;
    S.vocGame[id].stage=next; fn();
  }

  function openStake(id){
    if(id==='sakura'&&sakuraLocked()){
      say('Uni the Unicorn','uni:concerned',L('That chair is empty because you never learned WHICH shop is complaining — Miko would have named her, had you asked. You can still reach out mid-session (the 🆘 below), but it costs a day of slip, and the Empress counts every consult.','その席が空なのは、きみが「どの店が」文句を言っているのかを聞かなかったからだ——聞いていれば、ミコが名前を教えてくれた。今からでも呼び出せる（下の🆘）。ただし1日の遅れになるし、皇帝は相談の回数を数えている。'),renderStakes);
      return;
    }
    if(S.vocGame[id].lost){
      say('Uni the Unicorn','uni:concerned','Their patience is spent for today, Green Belt. Some doors only reopen after tempers cool — the rework week, perhaps.',renderStakes);
      return;
    }
    if(S.vocGame[id].done){
      say('Uni the Unicorn','uni','You have their statement recorded. The rest is on the charter now.',renderStakes);
      return;
    }
    if(id==='hana') hana(); else if(id==='sakura') sakura();
    else if(id==='capy') capyS(); else torto();
  }

  /* ---- Hana: want -> drill -> drill -> measurable need ---- */
  function hana(){
    const g=S.vocGame.hana;
    if(g.stage===0){
      say('Hana','hana','I already KNOW my need. My need is that Mr. Mochi NEVER EVER breaks. Ever!! You may write that down now.',()=>{
        let h=patBar('hana')+'<div class="choices">';
        h+=vc('h_rec','Record as stated','“Plushies must never ever break.” Straight from the customer — but is that measurable?');
        h+=vc('h_new','Reassure her','“Don’t worry — we’ll send you a brand-new plushie!”');
        h+=vc('h_drill','Drill deeper','“What happened to Mr. Mochi?” Get the real story before writing anything down.');
        h+=vc('h_life','Manage expectations','“Nothing lasts forever, sweetie.”');
        h+='</div>'+back;
        interact(h); wireBack();
        $('h_rec').onclick=()=>{ recHana('vague'); };
        $('h_new').onclick=()=>wrong('hana',1,'I do not WANT a new one!! New ones are STRANGERS. *clutches Mr. Mochi tighter*');
        $('h_drill').onclick=()=>advance('hana',1,hana);
        $('h_life').onclick=()=>wrong('hana',2,'*eyes go enormous and wet* Mr. Mochi is NOT nothing!! *hides him from you*');
      });
    } else if(g.stage===1){
      say('Hana','hana','His SMILE came undone!! After only ONE week! I hugged him a lot because I love him. That is ALLOWED.',()=>{
        let h=patBar('hana')+'<div class="choices">';
        h+=vc('h_rec2','Record','“Smiles must survive lots of hugs.” Good enough? Or still too vague to test?');
        h+=vc('h_less','Practical advice','“Maybe hug him a little less?”');
        h+=vc('h_kit','Record','“Give kids free repair kits.” Problem solved! …or is that a solution, not a need?');
        if(S.have.includes('m_ctq'))
          h+=vc('h_cite','Cite Miko’s letters','“A thousand hugs, minimum” — a real, countable number from the letters.');
        h+=vc('h_drill2','Drill deeper','“How many hugs is a lot, exactly?” Push for a number.');
        h+='</div>'+back;
        interact(h); wireBack();
        $('h_rec2').onclick=()=>recHana('vague');
        $('h_less').onclick=()=>wrong('hana',2,'*GASP* Hugging is NOT the problem!! YOU are the problem!!');
        $('h_kit').onclick=()=>recHana('sol');
        const c=$('h_cite'); if(c) c.onclick=()=>recHana('ok');
        $('h_drill2').onclick=()=>advance('hana',2,hana);
      });
    } else {
      say('Hana','hana','A THOUSAND. At LEAST a thousand hugs. I counted. …Okay I did not count. But it is a thousand.',()=>{
        interact(patBar('hana')+`<div class="choices">
          ${vc('h_ok','Record the NEED','Smile stitching survives ≥1,000 hug-cycles. Measurable, testable, and truly hers.')}
          ${vc('h_round','Be realistic','“Let’s write one hundred — more achievable.”')}
          ${vc('h_kit2','Record','“Free repair kits for everyone!” Easy to promise — but is it what she NEEDS?')}
          </div>`+back); wireBack();
        $('h_ok').onclick=()=>recHana('ok');
        $('h_round').onclick=()=>wrong('hana',1,'A THOUSAND. I SAID a thousand. Were you not LISTENING?');
        $('h_kit2').onclick=()=>recHana('sol');
      });
    }
  }
  function recHana(v){
    S.ctq.smile=v; S.vocGame.hana.done=true;
    ['v1','v2'].forEach(x=>{ if(!S.voc.voc.includes(x)) S.voc.voc.push(x); });
    say('Hana','hana',v==='ok'?'That is EXACTLY what I said. You are good at listening.':'Okay!! Write it neatly.',renderStakes);
  }

  /* ---- Ms. Sakura: solution-shaped want -> challenge -> TWO measurable needs ---- */
  function sakura(){
    const g=S.vocGame.sakura;
    if(g.stage===0){
      say('Ms. Sakura','sakura','The Emporium’s need is perfectly simple, dear: DISCOUNTS on the wonky ones. Deep discounts. Write that in your little book.',()=>{
        let h=patBar('sakura')+'<div class="choices">';
        h+=vc('s_rec','Record as stated','“Retailers need discounts on defective units.” …but a discount is a fix, not a need.');
        h+=vc('s_sorry','Smooth it over','Apologize profusely for the wonky plushies.');
        h+=vc('s_chal','Push back','“With respect — a discount is a fix. What OUTCOME does your shop actually need?”');
        h+=vc('s_norm','Add context','“Honestly, our wonky rate is within industry norms.”');
        h+='</div>'+back;
        interact(h); wireBack();
        $('s_rec').onclick=()=>recSakura('sol','sol');
        $('s_sorry').onclick=()=>wrong('sakura',1,'*fan flutters, unimpressed* Apologies do not stock shelves, dear. Are we DONE?');
        $('s_chal').onclick=()=>advance('sakura',1,sakura);
        $('s_norm').onclick=()=>wrong('sakura',2,'*the fan SNAPS shut* “Industry norms.” MY shelves are not the industry, dear.');
      });
    } else if(g.stage===1){
      say('Ms. Sakura','sakura','*fans herself* …Very well. I have TWO troubles, dear, and neither is a discount. FIRST: too many arrive to me already BROKEN — unsellable the moment I open the box. SECOND: of the ones I DO sell, too many come limping BACK, returned by heartbroken little shoppers. I do not know your inspection scores. I know MY boxes and MY returns.',()=>{
        let h=patBar('sakura')+'<div class="choices">';
        h+=vc('s_v','Record loosely','“Sakura wants fewer headaches, both ends.” Warm — but not a number in sight.');
        h+=vc('s_try','Commit sincerely','“Understood — we’ll simply try harder on both.”');
        h+=vc('s_drill','Drill for numbers','“Give me each in figures — the broken arrivals AND the returns.”');
        h+='</div>'+back;
        interact(h); wireBack();
        $('s_v').onclick=()=>recSakura('vague','vague');
        $('s_try').onclick=()=>wrong('sakura',1,'“Try harder.” *writes something in a small, dreadful notebook* Mm. Continue.');
        $('s_drill').onclick=()=>advance('sakura',2,sakura);
      });
    } else {
      say('Ms. Sakura','sakura','Numbers, then. Nearly FOUR in a hundred arrive broken — I will not tolerate more than HALF a percent. And of everything I sell, nearly four in a hundred come BACK — that too, half a percent or less. One in two hundred, dear, no more. BOTH. I shall be counting each.',()=>{
        let h=patBar('sakura')+'<div class="choices">';
        h+=vc('s_ok','Record BOTH needs','≤0.5% arrive defective (incoming) AND ≤0.5% returned by shoppers (field). Two countable customer requirements.');
        h+=vc('s_round','Negotiate','“Would one percent do? Rounder numbers.”');
        if(S.have.includes('m_voc'))
          h+=vc('s_cite','Cite her letters','Her letters to Miko log both — record ≤0.5% defective arrivals and ≤0.5% returns.');
        h+=vc('s_half','Record just one','Only the arrivals: ≤0.5% incoming defective. (Her returns worry goes unrecorded.)');
        h+=vc('s_v2','Record loosely','“The Emporium wants to be happy-ish.” Not a number.');
        h+='</div>'+back;
        interact(h); wireBack();
        $('s_ok').onclick=()=>recSakura('ok','ok');
        $('s_round').onclick=()=>wrong('sakura',1,'HALF a percent, dear. On BOTH counts. I said what I said.');
        const c=$('s_cite'); if(c) c.onclick=()=>recSakura('ok','ok');
        $('s_half').onclick=()=>recSakura('ok',null);
        $('s_v2').onclick=()=>recSakura('vague','vague');
      });
    }
  }
  function recSakura(shipV, returnsV){
    S.ctq.ship=shipV; if(returnsV) S.ctq.returns=returnsV; else delete S.ctq.returns;
    S.vocGame.sakura.done=true;
    if(!S.voc.voc.includes('v3')) S.voc.voc.push('v3');
    const good=shipV==='ok'&&returnsV==='ok';
    say('Ms. Sakura','sakura',good?'BOTH. Precisely. A pleasure doing business with someone who LISTENS to a shopkeeper.':(shipV==='sol'?'Discounts it is, then. …We shall see how that serves you, dear.':'Adequate. Do not disappoint my shelves.'),renderStakes);
  }

  /* ---- internal customers: wants -> valid internal requirements ---- */
  function capyS(){
    const g=S.vocGame.capy;
    if(!g.stage) g.stage=0;
    if(!S.have.includes('c_speed')) S.have.push('c_speed');   // Capy floats "throughput" as a metric
    if(g.stage===0){
      say('Captain Capy','capy','Oh! Me! Yes! My need — as a stakeholder — is that the night shift finally shapes up. Big need. HUGE. …And, er, a TIP: if you want ONE number for the Empress, measure how many plushies we SHIP PER DAY. Show her we are FAST! Leadership loves fast.',()=>{
        interact(patBar('capy')+`<div class="choices">
          ${vc('c_rec','Record it','“The night shift must shape up.” Straight into the VOC… but it is blame, not a need.')}
          ${vc('c_agree','Build rapport','“You’re right — the night shift again, huh?”')}
          ${vc('c_ref','Reframe','“Forget WHO for a moment — what OUTCOME does the floor need?” Turn blame into a requirement.')}
          ${vc('c_fast','Take the tip','“Ships-per-day — leadership loves fast. Noted!”')}
          ${vc('c_dis','Thank him, move on','He runs the process, but is not a customer of it. (His voice goes unused.)')}
          </div>`+back); wireBack();
        $('c_rec').onclick=()=>{ if(!S.voc.voc.includes('v4')) S.voc.voc.push('v4'); g.done=true;
          say('Captain Capy','capy','Finally! SOMEONE writes it down!',renderStakes); };
        $('c_agree').onclick=()=>wrong('capy',2,'*puffs up* I KNEW it! I am telling Luna you agree— wait. DO you? What was the question?','worried');
        $('c_fast').onclick=()=>{ if(!spend('capy',1)) return; S.vocGame.capy.stage=0;
          say('Uni the Unicorn','uni:concerned','Ships-per-day rises when you ship WONKY plushies faster, Green Belt. A speed metric that counts defects as progress is a trap with a bow on it. *Capy deflates slightly* …(The conversation slips back to the beginning.)',()=>openStake('capy')); };
        $('c_ref').onclick=()=>advance('capy',1,capyS);
        $('c_dis').onclick=()=>{ g.done=true; g.dismissed=true;
          say('Captain Capy','capy','…Oh. Right. Of course. I will just… supervise, then.',renderStakes,'embarrassed'); };
      });
    } else if(g.stage===1){
      say('Captain Capy','capy','The outcome? …Less REWORK! The cutting station redoes panels constantly — trays of them! It clogs everything downstream and everyone runs behind. THAT is what breaks my floor. Day or night.',()=>{
        interact(patBar('capy')+`<div class="choices">
          ${vc('c_v','Record','“The floor needs less rework-ish.” Close enough? Or still not a number?')}
          ${vc('c_ask','Simple fix','“Have you tried asking people to be more careful?”')}
          ${vc('c_drill','Drill deeper','“How much rework, exactly? And what should it be?” Get the figures.')}
          </div>`+back); wireBack();
        $('c_v').onclick=()=>recCapy('vague');
        $('c_ask').onclick=()=>wrong('capy',1,'ASKING? *laughs — then stops* Oh. You were serious. We ask CONSTANTLY.','worried');
        $('c_drill').onclick=()=>advance('capy',2,capyS);
      });
    } else {
      say('Captain Capy','capy','Two full trays a shift get recut — sometimes three! In the good months it was near zero. Under two percent of panels, easy. THAT is a floor that flows.',()=>{
        interact(patBar('capy')+`<div class="choices">
          ${vc('c_ok','Record the internal REQ','Cutting rework ≤2% of panels (first-pass yield). Countable — and it feeds the defect rate.')}
          ${vc('c_night','File it his way','“Logged as a night-shift performance metric.”')}
          ${vc('c_v2','Record','“Rework should be lower, generally.” True, but still not measurable.')}
          </div>`+back); wireBack();
        $('c_ok').onclick=()=>recCapy('ok');
        $('c_night').onclick=()=>wrong('capy',2,'*ears droop* That is… not what I— it is BOTH shifts, I literally just said— you know what, forget it.','embarrassed');
        $('c_v2').onclick=()=>recCapy('vague');
      });
    }
  }
  function recCapy(v){
    S.ctq.rework=v; S.vocGame.capy.done=true;
    say('Captain Capy','capy',v==='ok'?'…Huh. That IS what I needed. Not a villain at all. Just a number.':'Yes! Less rework! Roughly! You get it!',renderStakes,v==='ok'?'happy':undefined);
  }
  function torto(){
    const g=S.vocGame.torto;
    if(!g.stage) g.stage=0;
    if(g.stage===0){
      say('Torto','torto','My need is a TurboStitch 9000. Catalog page forty-seven. GLEAMING. That is my voice, and I am a customer of… things, generally.',()=>{
        let h=patBar('torto')+'<div class="choices">';
        h+=vc('t_rec','Record it','“A TurboStitch 9000.” The man knows what he wants — but that is a purchase, not a need.');
        h+=vc('t_price','Show interest','“How much does the TurboStitch cost?”');
        h+=vc('t_ref','Challenge the catalog','“What makes the TurboStitch any better than what we have already?”');
        h+=vc('t_dis','Thank him, move on','He operates the process, but is not its customer. (His voice goes unused.)');
        h+='</div>'+back;
        interact(h); wireBack();
        $('t_rec').onclick=()=>{ if(!S.voc.voc.includes('v5')) S.voc.voc.push('v5'); g.done=true;
          say('Torto','torto','Ha! Page forty-seven. Tell them Torto sent you.',renderStakes); };
        $('t_price').onclick=()=>wrong('torto',1,'EXCELLENT question! Four thousand gold! Shall I fetch the catalog? *the catalog is already out*','ranting');
        $('t_ref').onclick=()=>advance('torto',1,torto);
        $('t_dis').onclick=()=>{ g.done=true; g.dismissed=true;
          say('Torto','torto','Hmph. In my day, operators were LISTENED to. *sips tea at you*',renderStakes); };
      });
    } else if(g.stage===1){
      say('Torto','torto','*jabs a claw at the catalog* Better TENSION CONTROL, that is what! Our thread tension drifts by lunch every single day, and after lunch the smiles pop like soap bubbles. I retune it by EAR, youngster. The TurboStitch holds its tension steady the whole shift. GLEAMING.',()=>{
        let h=patBar('torto')+'<div class="choices">';
        h+=vc('t_v','Record','“The TurboStitch has better tension control.” Noted! …still a product pitch, though.');
        h+=vc('t_oe','Consider all causes','“Are you sure it isn’t operator error?”');
        if(S.have.includes('t_nug'))
          h+=vc('t_cite','Cite his own tip','The knob on Machine 3 he mentioned — stitch tension stays in spec ALL shift, checked hourly.');
        h+=vc('t_drill','Turn the pitch into a need','“So what you actually need is better tension control — not specifically the TurboStitch?”');
        h+='</div>'+back;
        interact(h); wireBack();
        $('t_v').onclick=()=>recTorto('vague');
        $('t_oe').onclick=()=>wrong('torto',2,'*the tea stops mid-sip* Forty. Years. *the room gets ten degrees colder*');
        const c=$('t_cite'); if(c) c.onclick=()=>recTorto('ok');
        $('t_drill').onclick=()=>advance('torto',2,torto);
      });
    } else {
      say('Torto','torto','*long grumble into the tea* …Bah. FINE. Yes. Strip the shiny catalog away and what my station NEEDS is thread tension that stays in spec the WHOLE shift — no after-lunch retunes, checked hourly if you must. The TurboStitch is merely one way to buy that. …I still want one, mind.',()=>{
        interact(patBar('torto')+`<div class="choices">
          ${vc('t_ok','Record the internal REQ','Stitch tension in spec all shift (hourly check passes). The requirement behind the catalog — measurable, and loose smiles trace to it.')}
          ${vc('t_maint','Delegate it','“We’ll just tell maintenance to fix it sometime.”')}
          ${vc('t_v2','Record','“Tension should behave, ideally.” A wish, not a spec.')}
          </div>`+back); wireBack();
        $('t_ok').onclick=()=>recTorto('ok');
        $('t_maint').onclick=()=>wrong('torto',1,'“Sometime.” In MY day, “sometime” meant NEVER. Bah.');
        $('t_v2').onclick=()=>recTorto('vague');
      });
    }
  }
  function recTorto(v){
    S.ctq.thread=v; S.vocGame.torto.done=true;
    say('Torto','torto',v==='ok'?'…Forty years, and somebody finally wrote down the RIGHT thing. Biscuit?':'"Ideally." Bah. Close enough for a youngster.',renderStakes,v==='ok'?'impressed':undefined);
  }

  function finish(){
    const inRework = S.scene==='rw_voc' || S.reworkMode;
    S.vocDone=true; tickHalfDay();
    /* capturing a valid live customer CTQ IS documenting the customer's voice —
       unlock the customer-facing cards so the primary-metric choice is available */
    if(S.ctq.smile==='ok'||S.ctq.ship==='ok'){ S.vocUnlocked=true;
      ['m_ctq','m_voc'].forEach(id=>{ if(!S.have.includes(id)) S.have.push(id); }); }
    /* ---- build the requirement -> metric relationship board ---- */
    const REQROWS=[
      {k:'smile', src:'Hana (customer)', label:{ok:'Smile survives ≥1,000 hug-cycles',vague:'Plushies "never break" (unmeasured)',sol:'Free repair kits (a fix)'}},
      {k:'ship',  src:'Ms. Sakura (incoming quality)', label:{ok:'≤0.5% of arrivals defective (unsellable)',vague:'"fewer broken arrivals"',sol:'Discounts on wonky units (a fix)'}},
      {k:'returns',src:'Ms. Sakura (customer returns)', label:{ok:'≤0.5% returned by shoppers',vague:'"fewer returns, ideally"'}},
      {k:'thread',src:'Torto (internal — stitching)', label:{ok:'Stitch tension in spec all shift',vague:'"Thread should hold better"'}},
      {k:'rework',src:'Capy (internal — floor flow)', label:{ok:'Cutting rework ≤2% of panels',vague:'"Less rework-ish"'}},
    ];
    /* columns: [defects reaching customers, final-inspection failure rate, throughput/time, team morale] */
    const REL={smile:[2,1,0,0], ship:[2,1,0,0], returns:[2,1,0,0], thread:[1,1,0,0], rework:[1,1,1,0]};
    const METRICS=['Defects reaching customers','Final-inspection failure rate','Throughput (units/day)','Team morale'];
    const dot=n=>n===2?'●':(n===1?'○':'·');
    let rows='', score=[0,0,0,0], validCount=0;
    for(const rr of REQROWS){
      const v=S.ctq[rr.k];
      if(!v){ rows+=`<tr><td class="rq miss">— ${rr.src}: voice not captured —</td><td>·</td><td>·</td><td>·</td><td>·</td></tr>`; continue; }
      const lbl=rr.label[v]||'recorded';
      if(v==='ok'){ validCount++;
        rows+=`<tr><td class="rq ok">✓ ${lbl}<br><small>${rr.src}</small></td>`+
          REL[rr.k].map((n,i)=>{score[i]+=n===2?10:(n===1?5:0);return `<td>${dot(n)}</td>`;}).join('')+'</tr>';
      } else {
        rows+=`<tr><td class="rq bad">${v==='sol'?'✗':'⚠'} ${lbl}<br><small>${rr.src} — cannot be mapped: not a measurable need</small></td><td>—</td><td>—</td><td>—</td><td>—</td></tr>`;
      }
    }
    if(S.voc.voc.includes('v4')) rows+=`<tr><td class="rq bad">✗ "Night shift must shape up" — blame, not a requirement<br><small>Capy (recorded as VOC…)</small></td><td>—</td><td>—</td><td>—</td><td>—</td></tr>`;
    if(S.voc.voc.includes('v5')) rows+=`<tr><td class="rq bad">✗ "A TurboStitch 9000" — a purchase, not a requirement<br><small>Torto (recorded as VOC…)</small></td><td>—</td><td>—</td><td>—</td><td>—</td></tr>`;
    const best=score[0]>0&&score[0]>score[1]&&score[0]>=score[2]&&score[0]>=score[3];
    const verdict= validCount===0?
      '<b>No metric is supported.</b> Nothing measurable was captured — the charter will feel this at the tollgate.':
      best? `<b>The voices cluster on ONE column: DEFECTS REACHING CUSTOMERS</b> — ${score[0]} points vs ${score[1]} for the inspection gate. A child’s undone smile, a retailer’s returns — those are defects that got <i>past</i> the gate. ⚠ The <b>final-inspection failure rate</b> only weakly relates (○): it counts what you CATCH, and you can "improve" it just by catching less. And <b>throughput</b> is a speed dial, not a quality one — a guardrail, never the primary. Choose the metric the customer actually feels.`:
      'The evidence is thin — capture more measurable voices and the right metric will reveal itself. But note already: throughput is a guardrail, not a quality metric, and the inspection gate only measures what it catches.';
    const board=`<div class="preview" style="overflow-x:auto">
      <b>📊 VOC RELATIONSHIP BOARD</b> <small>(the grown-up version of this is called a House of Quality)</small>
      <table class="hoq">
      <tr class="metric-head"><th style="background:#fff;border:none"></th><th colspan="${METRICS.length}" style="background:#efe6ff;color:var(--lav-deep);letter-spacing:.6px">📐 ${L('CANDIDATE METRICS — pick ONE as primary','候補指標 — 主要指標を1つ選ぶ')}</th></tr>
      <tr><th>${L('Requirement (whose voice)','要求（誰の声か）')}</th>${METRICS.map(m=>`<th>${m}</th>`).join('')}</tr>
      ${rows}
      <tr class="scorerow"><td><b>${L('Relationship score','関連スコア')}</b> <small>${L('(● = 10 · ○ = 5)','（● = 10 · ○ = 5）')}</small></td>${score.map(x=>`<td><b>${x}</b></td>`).join('')}</tr></table>
      <div style="margin-top:8px">${verdict}</div>
      <div class="hint" style="text-align:left;margin-top:6px">${L('● strong relationship = 10 points · ○ weak = 5 · — unmappable. The highest-scoring column is your PRIMARY metric candidate. YOU still choose it in the problem statement — choose the one the customer feels, not the one that is easy to move.','● 強い関連 = 10点 · ○ 弱い = 5点 · — 対応不可。最高得点の列が主要指標の第一候補。選ぶのはきみ——動かしやすい指標ではなく、顧客が実感する指標を。')}</div></div>`;
    say('Uni the Unicorn','uni', validCount>=3?
      'Now watch what happens when you line every voice up against the candidate metrics. This is my favorite part.':
      'Let us see what your session actually produced…',()=>{
      interact(board+`<button class="btn" id="nx">${inRework?L('Back to rework ✦','手戻りに戻る ✦'):L('Reconcile the numbers ✦','数字をすり合わせる ✦')}</button>`);
      $('nx').onclick=()=>go(inRework?'rework':'reconcile');
    });
  }
},

/* ---------- problem statement build (fragment picker) ---------- */
ps_build(){
  renderTracker(7); drawWarroom(); addHelpBadge('ps'); banner(L('Deliverable 4 · Problem Statement','成果物 4 · 問題記述'));
  narrate(L('Dusk gilds the charter form. Five blanks wait on the page — and every fragment offered below traces back to your notebook: verified logs, honest guesses, and that break-room chatter you wrote down. Tap 📒 to check who actually said what.',
    '夕暮れがチャーター用紙を金色に染める。ページには5つの空欄。下に並ぶ断片はどれもきみのノートに遡れる——裏付けのある記録、正直な当て推量、そして書き留めた休憩室の噂話。誰が実際に言ったかは📒で確認を。'));
  say(nm('Uni the Unicorn'),'uni',
    L('The problem statement follows a strict shape: "Since DATE, the PRIMARY METRIC has been at CURRENT BASELINE, compared to a TARGET. This gap causes a COPQ of…" — COPQ being the Cost of Poor Quality, in gold. Pick one fragment per row, built from what people actually told you. And hear this clearly: NO causes, NO solutions, NO blame. Only the problem, described with evidence. Some fragments will tempt you. As always… whether they SHOULD go in is the entire game.',
      '問題記述には厳格な型がある：「〈日付〉以来、〈主要指標〉は〈現状ベースライン〉であり、〈目標〉と比べて差がある。この差が〈COPQ〉のコストを生んでいる」——COPQとは品質不良コスト、単位は金貨だ。各行につき断片を1つ選ぶ。人が実際に言ったことから組み立てて。そしてよく聞いて：原因はダメ、解決策もダメ、責任のなすりつけもダメ。証拠で描いた「問題」だけだ。誘ってくる断片もある。いつも通り…それを入れる「べきか」を見極めることこそ、このゲームの全てだよ。'),()=>{
    renderPS();
  });
  function renderPS(){
    const ROWS=[['date',L('Since when','いつから')],['metric',L('Primary metric','主要指標')],['base',L('Current baseline','現状ベースライン')],['target',L('Target performance','目標水準')],['copq',L('COPQ · cost of poor quality','COPQ · 品質不良コスト')]];
    const hasNeed=n=>Array.isArray(n)?n.some(x=>S.have.includes(x)):S.have.includes(n);
    const rowsHtml=ROWS.map(([k,lbl])=>{
      const opts=PSF[k].filter(o=>!o.need||hasNeed(o.need));
      return `<div class="obj-row"><span class="lbl">${lbl}</span>
        <div class="obj-opts">${opts.map(o=>{
          const on=S.ps[k]&&S.ps[k].t===o.t;
          return `<div class="chip ${on?'on':''}" data-ps="${k}" data-i="${PSF[k].indexOf(o)}">${o.t}</div>`;}).join('')}
        ${opts.length===1?`<span class="hint" style="text-align:left">${L('…only one note in your notebook covers this. Hm.','…この項目を埋められるメモはノートに1つだけ。ふむ。')}</span>`:''}</div></div>`;
    }).join('');
    const allFilled=ROWS.every(([k])=>S.ps[k]);
    const sent=allFilled?
      `<div class="preview"><b>${L('PROBLEM STATEMENT:','問題記述：')}</b> ${L('Since','')} ${S.ps.date.t}${L(', the ','以来、')}${S.ps.metric.t}${L(' has been at ','は ')}${S.ps.base.t}${L(', compared to a target of ','（目標：')}${S.ps.target.t}${L('. This gap causes a COPQ of ','）。この差が生むCOPQ：')}${S.ps.copq.t}.</div>`:'';
    interact(rowsHtml+sent+`
      ${allFilled?'':`<div class="hint" style="color:#c48a3a">${L('Some rows are still empty. You may proceed anyway… if you think the review will not notice.','まだ空欄の行がある。このまま進んでもいい…レビューが気づかないと思うなら。')}</div>`}
      <button class="btn" id="lockps">${allFilled?L('Lock the problem statement ✦','問題記述を確定する ✦'):L('Submit with gaps (risky) ✦','空欄のまま提出（危険）✦')}</button>`+helpControl('ps'));
    document.querySelectorAll('.chip[data-ps]').forEach(ch=>ch.onclick=()=>{
      const k=ch.dataset.ps, o=PSF[k][+ch.dataset.i];
      S.ps[k]=(S.ps[k]&&S.ps[k].t===o.t)?null:o;   // tap again to unselect
      renderPS();
    });
    const lb=$('lockps');
    if(lb) lb.onclick=()=>{ S.psDone=true; go(S.reworkMode?'rework':'obj_build'); };
  }
},

/* ---------- objective statement build ---------- */
obj_build(){
  renderTracker(8); drawWarroom(); addHelpBadge('obj'); banner(L('Deliverable 5 · Objective Statement','成果物 5 · 目標記述'));
  narrate(L('One line left on the charter. The quill feels heavier than it should — destinations always do. The fragments below come from your notebook too: some from the logs, some from the break room. 📒 remembers which is which.',
    'チャーターに残るはあと1行。羽ペンがやけに重く感じる——目的地というのはいつもそうだ。下の断片もきみのノートから：記録から来たものも、休憩室から来たものもある。どれがどれかは📒が覚えている。'));
  say(nm('Uni the Unicorn'),'uni',
    L('Last deliverable: the OBJECTIVE statement — the mirror of the problem. It says what will improve, from what, to what, by when. Same law applies: NO causes, NO solutions. The objective states WHAT we will achieve, never HOW. Assemble it from the fragments. Some fragments will tempt you. That is intentional. Life is like that.',
      '最後の成果物：「目標記述」——問題を映す鏡だ。何を、どこから、どこまで、いつまでに改善するかを述べる。同じ掟が効く：原因はダメ、解決策もダメ。目標は「何を」達成するかを述べるもので、「どうやって」は決して書かない。断片から組み立てて。誘ってくる断片もある。それは意図的だよ。人生とはそういうものさ。'),()=>{
    renderObj();
  });
  function renderObj(){
    const ROWS=[['verb',L('Change verb','変化の動詞')],['metric',L('The metric','指標')],['base',L('From (baseline)','どこから（ベースライン）')],['target',L('To (target)','どこまで（目標）')],['when',L('By when','いつまでに')],['how',L('How (…?)','どうやって（…？）')]];
    const rowsHtml=ROWS.map(([k,lbl])=>{
      const hasNeedO=n=>Array.isArray(n)?n.some(x=>S.have.includes(x)):S.have.includes(n);
      const opts=OBJ[k].filter(o=>!o.need||hasNeedO(o.need));
      return `<div class="obj-row"><span class="lbl">${lbl}</span>
        <div class="obj-opts">${opts.map((o,i)=>{
          const on = S.obj[k]&&S.obj[k].t===o.t;
          return `<div class="chip ${on?'on':''}" data-k="${k}" data-i="${OBJ[k].indexOf(o)}">${o.t}</div>`;}).join('')}</div></div>`;
    }).join('');
    const mandatory=['verb','metric','base','target','when'].every(k=>S.obj[k]);
    const howDecided=S.objHowDecided;
    const canLock=mandatory&&howDecided;
    const sent = mandatory?`<div class="preview"><b>${L('OBJECTIVE:','目標：')}</b> ${S.obj.verb.t} ${S.obj.metric.t} ${S.obj.base.t} ${S.obj.target.t} ${S.obj.when.t}${S.obj.how&&S.obj.how.v==='how'?' '+S.obj.how.t:''}.</div>`:'';
    interact(rowsHtml+sent+`
      <div class="hint">${L('Pick one fragment per row. The last row is a decision like any other…','各行につき断片を1つ選ぶ。最後の行も、他と同じく一つの判断だ…')}</div>
      <button class="btn" id="lockobj" ${canLock?'':'disabled'}>${L('Lock the objective statement ✦','目標記述を確定する ✦')}</button>`+helpControl('obj'));
    document.querySelectorAll('.chip[data-k]').forEach(ch=>ch.onclick=()=>{
      const k=ch.dataset.k, o=OBJ[k][+ch.dataset.i];
      if(k==='how'){ S.objHowDecided=true; S.obj.how = o.v==='skip'?null:o; }
      else S.obj[k]=o;
      renderObj();
    });
    const lb=$('lockobj');
    if(lb) lb.onclick=()=>{ S.objDone=true; if(S.reworkMode){ go('rework'); return; } tickHalfDay(); go('charter'); };
  }
},

charter(){
  drawBackdrop('scene_mill_night'); banner(L('The Project Charter','プロジェクト・チャーター'));
  narrate(L('Night settles over the mill. The finished charter lies in the lamplight, looking either like a foundation or a confession — tomorrow will decide which.',
    '工場に夜が降りる。仕上がったチャーターがランプの灯りの下に横たわる——礎にも、白状にも見える。どちらになるかは、明日が決める。'));
  say(nm('Uni the Unicorn'),'uni',
    L('Your charter is assembled: block diagram, SIPOC, scope, VOC with CTQs, stakeholder grid, problem statement, objective statement. Tomorrow morning, Empress Scarlet reviews everything — and the calendar. Sleep well, Green Belt. Or try.',
      'チャーターが揃った：ブロック図、SIPOC、CTQ付きのVOC、問題記述、目標記述。明日の朝、スカーレット皇帝がすべてを審査する。よく眠って、グリーンベルト。…眠れるものならね。'),()=>{
    const o=S.obj;
    const objSent=`${o.verb.t} ${o.metric.t} ${o.base.t} ${o.target.t} ${o.when.t}${o.how&&o.how.v==='how'?' '+o.how.t:''}.`;
    const gf=f=>f?f.t:`<i style="color:#c48a3a">${L('(left blank)','（空欄）')}</i>`;
    interact(`<div class="preview">
      <b>${L('PROJECT CHARTER — "Operation Steady Smile"','プロジェクト・チャーター — 「作戦名：ずっと笑顔」')}</b><br><br>
      <b>${L('Problem statement:','問題記述：')}</b> ${L('Since','')} ${gf(S.ps.date)}${L(', the ','以来、')}${gf(S.ps.metric)}${L(' has been at ','は ')}${gf(S.ps.base)}${L(', compared to a target of ','（目標：')}${gf(S.ps.target)}${L('. This gap causes a COPQ of ','）。この差が生むCOPQ：')}${gf(S.ps.copq)}.<br>
      <b>${L('Objective:','目標：')}</b> ${objSent}<br>
      <b>${L('Customer CTQs:','顧客CTQ：')}</b> ${Object.keys(S.ctq).length||'—'} ${L('defined from VOC','件（VOCより定義）')}<br>
      <b>${L('Scope (in):','範囲（対象内）：')}</b> ${S.scope.IN.length?S.scope.IN.map(i=>L(SCOPE_ITEMS[i].en,SCOPE_ITEMS[i].ja)).join('; '):`<i style="color:#c48a3a">${L('(undefined)','（未定義）')}</i>`}<br>
      <b>${L('Stakeholders managed closely:','綿密に管理する関係者：')}</b> ${S.stake.MC.length?S.stake.MC.map(i=>L(STAKE_ITEMS[i].en,STAKE_ITEMS[i].ja).split(' —')[0]).join(', '):`<i style="color:#c48a3a">${L('(none placed)','（未配置）')}</i>`}
    </div>
    <button class="btn" id="nx">${L('🌙 Sleep… then face the dragon','🌙 眠る…そして竜と対峙する')}</button>`);
    $('nx').onclick=()=>{S.day++;S.half=0;go('tg_intro');};
  });
},

/* ---------- TOLLGATE ---------- */
tg_intro(){
  renderTracker(9); drawBoardroom('reading'); banner(L('TOLLGATE REVIEW · The Empress','トールゲート審査 · 皇帝'));
  narrate(L('The boardroom. Cinnamon, polished mahogany, and fear. A tea service nobody dares touch sits precisely in the center of the table.',
    '重役室。シナモンと磨かれたマホガニー、そして恐れの匂い。誰も手をつけようとしない茶器が、テーブルの中央にきっちりと置かれている。'));
  S.tollgateAttempts++;
  say(nm('Narrator'),'narr',
    L('The boardroom smells faintly of cinnamon and fear. Empress Scarlet coils into her chair, reading glasses perched on her snout, your charter held in one immaculate claw. Capy, Uni','重役室にはシナモンと恐れがかすかに漂う。スカーレット皇帝が椅子にとぐろを巻き、鼻先に読書用眼鏡をのせ、非の打ちどころのない爪できみのチャーターを掲げている。カピー、ユニ') +
    (S.interviewed.luna?L(', Luna','、ルナ'):'') + (S.interviewed.penny?L(', Penny','、ペニー'):'') + L(' and half the factory squeeze along the wall to watch.','、そして工場の半分が壁際に押し寄せて見守っている。'),()=>{
    interact(scheduleNote()+`<button class="btn" id="nx">${L('Begin the review ✦','審査を始める ✦')}</button>`);
    $('nx').onclick=()=>go(S.consults>0?'tg_consult':'tg_flow');
  });
},
tg_consult(){
  drawBoardroom('reading'); banner('TOLLGATE REVIEW · The Empress');
  const n=S.consults;
  const who=[...new Set(Object.values(S.consultBy).filter(Boolean))];
  say(nm('Empress Scarlet'),'dragon:reading',
    L('Before we open the charter — a word about your schedule. It slipped, and I make it my business to know why.',
      'チャーターを開く前に——きみのスケジュールについて一言。遅れが出た。その理由を知るのが、わたしの務めだ。'),()=>{
    setDragonMood('furious'); smokeBurst(2); setPlayerMood('nervous');
    interact(`<div class="feedback badf">🐉 ${L(
      `She sets a second page beside your charter — the calendar. "You pulled ${n===1?'someone':'people'} aside ${n===1?'once':n+' separate times'} <b>while the quill was already in your hand</b>, and it cost us ${n} day${n===1?'':'s'} of slip.${who.length?` You leaned on ${who.join(', ')} mid-build.`:''} Define has an ORDER, Green Belt: you interview, you gather, you verify — and only THEN do you assemble. Running back for an answer mid-charter tells me the groundwork was rushed. I will still judge the charter on its merits. But understand two things: I noticed, and a flawless review is off the table today."`,
      `皇帝はチャーターの横にもう一枚——予定表を置く。「きみは<b>すでに筆を握った状態で</b>${n===1?'誰かを':'人を'}${n===1?'一度':n+'回も'}呼びつけ、${n}日の遅れを生んだ。${who.length?`作成中に${who.join('、')}に頼ったな。`:''}Defineには順序がある、グリーンベルト：聞き取り、収集、検証——そのあとで初めて組み立てる。途中で答えを取りに走るのは、下ごしらえが雑だった証だ。チャーターそのものは中身で評価する。だが二つ、心に刻め：わたしは気づいた。そして今日、満点の審査はもう無い。」`)}</div>
      ${coach('consulted')}
      <button class="btn" id="nx">${L('…Understood ✦','…承知しました ✦')}</button>`);
    $('nx').onclick=()=>go('tg_flow');
  });
},
tg_flow(){
  const r=evalTollgate();
  say(nm('Empress Scarlet'),'dragon:reading',
    L('Let us start simply. Your block diagram. Walk me through how a plushie is born, block by block, exactly as you have drawn it.',
      'まずは簡単なところから。きみのブロック図だ。ぬいぐるみがどう生まれるか、描いたとおりに、ブロックごとに順を追って説明してもらおう。'),()=>{
    const tool=reviewFlow();
    if(r.crit.includes('flow')){
      setDragonMood('furious'); smokeBurst(2); setPlayerMood('nervous');
      interact(tool+`<div class="feedback badf">😰 You read your diagram aloud… and somewhere in the middle, Capy’s ears droop. "Er… that is not quite the order we run things, boss…" A ripple of giggles runs along the wall. The Empress does not giggle. She writes something down. Slowly. "The order matters," she says, not unkindly. "Every analysis you do next will walk this diagram. If the map is wrong, every journey on it is wrong."</div>
        ${coach('flow')}
        <button class="btn" id="nx">…Continue</button>`);
    } else {
      setDragonMood('approving'); setPlayerMood('determined');
      interact(tool+`<div class="feedback good">You walk the line from fluff to shipping without a stumble. Capy nods along, mouthing "yes, yes, exactly". The Empress makes a small approving hum, which witnesses say has happened only twice before.</div>
        <button class="btn" id="nx">Continue ✦</button>`);
    }
    $('nx').onclick=()=>go('tg_sipoc');
  });
},
tg_sipoc(){
  const r=evalTollgate();
  say(nm('Empress Scarlet'),'dragon:reading',
    L('The SIPOC. I use these to check whether a team actually understands whose process this is and who suffers when it fails.',
      'SIPOCだ。これは、チームがこの工程を「誰のものか」、失敗したとき「誰が困るのか」を本当に分かっているかを確かめるのに使う。'),()=>{
    if(r.crit.includes('sipoc')){
      setDragonMood('furious'); smokeBurst(2);
      interact(reviewSipoc()+`<div class="feedback badf">😬 Her claw taps the page. "You have ${r.sipocErrs} items misplaced or missing. If you cannot sort suppliers from customers, how will you sort causes from symptoms?" She slides the page toward you and — surprisingly — waits. "Show me you understand the columns, and we continue."</div>
        ${coach('sipoc')}
        <button class="btn" id="nx">…Continue</button>`);
    } else if(r.minor.includes('sipoc_minor')){
      setDragonMood('reading');
      interact(reviewSipoc()+`<div class="feedback tip">She circles ${r.sipocErrs===1?'one item':'a couple of items'} in red ink. "Mostly sound. Fix ${r.sipocErrs===1?'this':'these'} before Measure." Acceptable — barely.</div>
        ${coach('sipoc_minor')}
        <button class="btn" id="nx">Continue ✦</button>`);
    } else {
      setDragonMood('approving');
      interact(reviewSipoc()+`<div class="feedback good">"Clean," she says, almost disappointed. "Suppliers, inputs, outputs, customers — all where they belong. Even the nonsense correctly binned." Somewhere in the back, someone whispers that the zero-defects poster was \u201cinspirational, actually.\u201d</div>
        <button class="btn" id="nx">Continue ✦</button>`);
    }
    $('nx').onclick=()=>go('tg_scope');
  });
},
tg_scope(){
  const r=evalTollgate();
  say(nm('Empress Scarlet'),'dragon:reading',
    L('Scope. The fence you have drawn around this project — because everything inside it is now MY money.',
      'スコープ。きみがこのプロジェクトの周りに引いた柵——その内側にあるものはすべて、今やわたしの金だ。'),()=>{
    const beats=[];
    const rv=reviewSorter(SCOPE_ITEMS,SCOPE_COLS,S.scope);
    if(r.crit.includes('scope_incomplete')) beats.push(`<div class="feedback badf">🐉 ${L('"A project with no fence. Anything may wander in — and everything will."','「柵のないプロジェクト。何でも入り込める——そして、すべてが入り込む。」')}</div>`+coach('scope_incomplete'));
    if(r.crit.includes('scope_contam')) beats.push(`<div class="feedback badf">🐉 ${L('"You have written a PURCHASE and a PUNISHMENT into your scope." A wisp of smoke. "Scope is the boundary of the process you will study. Not a shopping list. Not a hit list."','「スコープに『購入』と『処分』を書き込んだね。」一筋の煙。「スコープとは、調べる工程の境界。買い物リストでも、粛清リストでもない。」')}</div>`+coach('scope_contam'));
    if(r.crit.includes('scope_creep')) beats.push(`<div class="feedback badf">🐉 ${L('"Morale. Harvest methods. Shelf displays." She counts on her claws. "You have scoped a KINGDOM, Green Belt, on a ninety-day calendar. Scope creep is how projects die politely."','「士気。収穫方法。陳列。」彼女は爪で数える。「きみは90日の暦で『王国』をスコープにしたね、グリーンベルト。スコープの膨張は、プロジェクトが礼儀正しく死ぬ方法だ。」')}</div>`+coach('scope_creep'));
    if(r.crit.includes('scope_core')) beats.push(`<div class="feedback badf">🐉 ${L('"And the stitching line itself — the thing that MAKES the smiles — is outside your fence?" She turns the page over, as if the line might be hiding on the back.','「それで、縫製ライン——笑顔を『作る』その工程が、柵の外側？」彼女はページを裏返す。ラインが裏に隠れているかのように。')}</div>`+coach('scope_core'));
    if(r.crit.includes('scope_muddled')) beats.push(`<div class="feedback badf">🐉 ${L('"Half of these are on the wrong side of the line. Inside, outside, later — you have made it a matter of opinion."','「半分は線の反対側にある。内、外、あとで——きみはそれを『意見の問題』にしてしまった。」')}</div>`+coach('scope_muddled'));
    if(r.minor.includes('scope_minor')) beats.push(`<div class="feedback tip">${L('One item circled in red ink. "Borderline. Re-check it before Measure."','赤インクで一項目に丸。「境界線ぎりぎり。Measureの前に見直して。」')}</div>`+coach('scope_minor'));
    if(!beats.length) beats.push(`<div class="feedback good">${L('"Receiving to shipping. The measurement inside, the shopping list outside, the real work parked for its proper phase." She nods once. "A fence I can fund."','「受入から出荷まで。測定は内側、買い物リストは外側、本物の仕事は正しいフェーズまで保留。」彼女は一度うなずく。「これなら金を出せる柵だ。」')}</div>`);
    dragonReact(beats.join(''));
    interact(rv+beats.join('')+`<button class="btn" id="nx">${L('Continue ✦','続ける ✦')}</button>`);
    $('nx').onclick=()=>go('tg_voc');
  });
},
tg_voc(){
  const r=evalTollgate();
  say(nm('Empress Scarlet'),'dragon:reading',
    L('Now — the part most teams fake. The Voice of the Customer. Show me you know who this project actually serves.',
      'さて——たいていのチームがごまかす部分だ。顧客の声。このプロジェクトが本当は「誰のため」なのか、分かっていることを見せてもらおう。'),()=>{
    const beats=[];
    if(r.crit.includes('voc_missing')) beats.push(
      `<div class="feedback badf">🐉 She turns the VOC page around to face you. It is ${S.voc.voc.length===0?'empty':'full of factory voices'}. "Where is the CUSTOMER in this document? You defined quality for a plushie without one word from anyone who hugs them. ${S.interviewed.miko?'Miko sat in her office drowning in complaint letters, and you never asked to read a single one.':'Miko has drawers FULL of complaint letters. You never even visited her.'}" She softens by a degree. "This is fixable, Green Belt. But it must be fixed."</div>`+coach('voc_missing'));
    if(r.crit.includes('voc_internal')) beats.push(
      (()=>{const names=[S.voc.voc.includes('v4')?'CAPY':null,S.voc.voc.includes('v5')?'TORTO':null].filter(Boolean).join(' — or ')||'the factory';
      return `<div class="feedback badf">🐉 Her claw stops on a line. "Since when," she asks, with terrible softness, "is ${names} a customer? A raw complaint from inside the process is the factory talking to ITSELF. Internal voices become requirements only when you translate them — this one you copied down whole."</div>`+coach('voc_internal');})());
    if(r.crit.includes('ctq_solution')){
      const sols=[]; if(S.ctq.smile==='sol') sols.push('‘repair kits’'); if(S.ctq.ship==='sol') sols.push('‘discounts’');
      const label=sols.length?sols.join(' and '):'this';
      beats.push(
      `<div class="feedback badf">🐉 "And this CTQ — ${label} — ${sols.length>1?'these are SOLUTIONS':'that is a SOLUTION'} wearing a costume. A CTQ is a measurable requirement of the OUTPUT — what the customer needs, not what we might do about it."</div>`+coach('ctq_solution'));
    }
    if(r.minor.includes('ctq_vague')) beats.push(
      `<div class="feedback tip">"‘Happier’ and ‘more lovable’ are not measurements, Green Belt. A CTQ you cannot measure is a wish. Sharpen it before Measure."</div>`+coach('ctq_vague'));
    if(r.minor.includes('voc_missed')){
      const missedHana=!(S.voc.voc.includes('v1')||S.voc.voc.includes('v2'));
      const missedSakura=!S.voc.voc.includes('v3');
      const who=[missedHana?'the CHILD who hugs your product':null,missedSakura?(S.have.includes('m_shops')?'the RETAILER who sells it':'the RETAILER you never even identified — Miko would have named her, had you asked which shops complain'):null].filter(Boolean).join(' and ');
      beats.push(
      `<div class="feedback tip">"A genuine customer voice is missing from this table: ${who}. They were in the room, Green Belt. The charter does not remember them."</div>`+coach('voc_missed'));
    }
    if(r.minor.includes('voc_int_missed')) beats.push(
      `<div class="feedback tip">"And the FLOOR\'s voice? Your operator and your supervisor are customers of this process too. Their requirements would have triangulated your metric — instead they went home unheard."</div>`+coach('voc_int_missed'));
    if(beats.length===0) beats.push(
      `<div class="feedback good">She reads the letters, then your CTQs: smile survives 1,000 hug-cycles; defective arrivals AND customer returns both held to 0.5% or less. "Measurable. Traceable to real voices. The child and the shopkeeper are both in the room with us now." She almost — almost — smiles.</div>`);
    dragonReact(beats.join(''));
    interact(reviewVOC()+beats.join('')+'<button class="btn" id="nx">Continue ✦</button>');
    $('nx').onclick=()=>go('tg_stake');
  });
},
tg_stake(){
  const r=evalTollgate();
  say(nm('Empress Scarlet'),'dragon:reading',
    L('Your stakeholder grid. Let us see how you intend to HANDLE the people in this room for ninety days. Including me.',
      '関係者の格子。この部屋の人々を90日間どう『扱う』つもりか、見せてもらおう。わたしも含めて。'),()=>{
    const beats=[];
    const rv=reviewSorter(STAKE_ITEMS,STAKE_COLS,S.stake);
    if(r.crit.includes('stake_incomplete')) beats.push(`<div class="feedback badf">🐉 ${L('"Half the names are still in the stack. A communication plan for nobody."','「名札の半分がまだ束のまま。誰のためでもないコミュニケーション計画だね。」')}</div>`+coach('stake_incomplete'));
    if(r.crit.includes('stake_empress')) beats.push(`<div class="feedback badf">🐉 ${L('A very long silence. "You have placed ME…" she reads the quadrant label aloud, "…here." The tea service rattles faintly. "I sign your budget. I close your tollgates. I am the one dragon in this kingdom who can end this project with a yawn. Manage. Me. CLOSELY."','とても長い沈黙。「きみは『わたし』を…」彼女は象限の名前を読み上げる、「…ここに置いたね。」茶器がかすかに鳴る。「わたしはきみの予算に署名し、トールゲートを閉じる。この王国で、あくび一つでこのプロジェクトを終わらせられる唯一の竜だ。わたしを。綿密に。管理しなさい。」')}</div>`+coach('stake_empress'));
    if(r.crit.includes('stake_customer')) beats.push(`<div class="feedback badf">🐉 ${L('"The shop that can pause our orders — or the children who are the entire POINT — filed under ‘monitor’?" Her glasses come off. "Monitor is for people who will never notice we exist."','「発注を止められる店——あるいは、この件の『意味』そのものである子どもたち——を『見守る』に？」眼鏡が外れる。「『見守る』は、わたしたちの存在に気づきもしない人のための箱だよ。」')}</div>`+coach('stake_customer'));
    if(r.crit.includes('stake_muddled')) beats.push(`<div class="feedback badf">🐉 ${L('"Suppliers managed closely, operators monitored, the treasury forgotten. You have drawn a map of who is LOUDEST, not who has POWER."','「供給者を綿密に管理し、作業員を見守り、経理を忘れる。きみが描いたのは『誰が一番うるさいか』の地図で、『誰に権限があるか』ではない。」')}</div>`+coach('stake_muddled'));
    if(r.minor.includes('stake_minor')) beats.push(`<div class="feedback tip">${L('One name nudged to a neighbouring box with a claw. "Close. Think about who FEELS the result."','爪で一枚の名札を隣の箱へ。「近い。結果を『感じる』のは誰かを考えて。」')}</div>`+coach('stake_minor'));
    if(!beats.length) beats.push(`<div class="feedback good">${L('"Champion and process owner managed closely; the retailer too — wise. Operators and care staff kept informed, the treasury kept satisfied, suppliers watched." She sets the page down. "You know who can hurt you and who you are doing this for. Those are different lists, and you kept them straight."','「チャンピオンと工程オーナーを綿密に管理、小売店も——賢明だ。作業員とケア担当には情報共有、経理は満足させ、供給者は見守る。」彼女はページを置く。「誰がきみを傷つけられるか、誰のためにやっているか。それは別のリストで、きみはそれを混ぜなかった。」')}</div>`);
    dragonReact(beats.join(''));
    interact(rv+beats.join('')+`<button class="btn" id="nx">${L('Continue ✦','続ける ✦')}</button>`);
    $('nx').onclick=()=>go('tg_ps');
  });
},
tg_ps(){
  const r=evalTollgate();
  say(nm('Empress Scarlet'),'dragon:reading',
    L('And now the heart of it. Your problem statement. I am going to read it aloud. I suggest you breathe.',
      'そしていよいよ核心だ。きみの問題記述。声に出して読み上げよう。息をしておくことをお勧めする。'),()=>{
    const beats=[];
    if(r.crit.includes('ps_incomplete')) beats.push(
      `<div class="feedback badf">🐉 She holds the page up to the light, as if the missing words might be hiding. "There are blank sections in a formal charter, Green Belt. A problem statement with holes is a promise that nobody checked." She sets it down gently. "Tell me — did you not have the information… or did you not go get it? Because those are different problems, and only one of them is about you."</div>`+coach('ps_incomplete'));
    if(r.crit.includes('mag_anecdote')) beats.push(
      `<div class="feedback badf">🐉 She stops mid-sentence. "Roughly one in seven… <b>I think</b>?" Her eyes lift over the glasses. "You brought me a FEELING, Green Belt? Where is this number FROM?" You glance at Capy. Capy studies the carpet. ${S.interviewed.penny?'Penny’s flipper slowly rises: "The logs say 12.6%… they have said so for ninety days…" The Empress closes your charter with a soft, terrible click.':'Nobody in the room has actual inspection data. The silence stretches on and on.'}</div>`+coach('mag_anecdote'));
    if(r.crit.includes('mag_wrong')) beats.push(
      `<div class="feedback badf">🐉 "This magnitude figure does not measure the size of the problem at all. How large IS the problem? You have not told me." She underlines the gap twice.</div>`+coach('mag_wrong'));
    if(r.crit.includes('mag_missing')) beats.push(
      `<div class="feedback badf">🐉 "There is no magnitude here whatsoever. A problem with no size is a rumor."</div>`+coach('mag_missing'));
    if(r.crit.includes('cause')){
      const cf=['date','metric','base','target','copq'].map(k=>S.ps[k]).find(f=>f&&f.v==='cause');
      beats.push(
      `<div class="feedback badf">🐉 She reads on, then stops cold. "…‘${cf?cf.t:'the drift of the tension knob'}’." She lowers the charter. "That is a CAUSE, Green Belt. A hypothesis — perhaps even a true one, and it does not matter, because you have not PROVEN it. A problem statement describes the problem. The moment you write a cause into it, every reader stops investigating and starts believing. Causes are earned in ANALYZE, with data. Strike it."</div>`+coach('cause'));
    }
    if(r.crit.includes('blame')) beats.push(
      `<div class="feedback badf">🐉 She reads the line about the night shift, and the temperature in the room drops. ${S.interviewed.luna?'Luna steps forward, tally sheets in hand: "Night shift, 12.4%. Day shift, 12.7%. May I ask why I am in this document as a CAUSE?" The Empress looks from Luna’s data to your charter, and back.':'"You put an accusation in a formal charter. Un-ver-i-fied. If the night shift reads this — and they will — you have burned the trust this project needs to survive."'} "Problem statements describe GAPS," she says. "Not villains."</div>`+coach('blame'));
    if(r.crit.includes('solution')) beats.push(
      `<div class="feedback badf">🐉 "…And here you have smuggled a SOLUTION into a problem statement. You have not measured anything and you are already spending my gold. Define the problem. The fix comes four phases from now — if your data earns it."</div>`+coach('solution'));
    if(r.crit.includes('metric_gameable')) beats.push(
      `<div class="feedback badf">🐉 She sets down the page very deliberately. "Your primary metric is the final-inspection FAILURE rate — 12.6%." A pause. "Tell me — if I told your team ‘get that to 2% by winter,’ what is the FASTEST way to obey me?" Silence. "You loosen the inspection. You flag fewer plushies. My 12.6% obeys and drops — while the 4.8% that reach children as broken toys quietly CLIMBS. You would hit target and make the customer WORSE." Smoke curls. "THIS is why we hold tollgates. A whole project aimed at a number you can fake by looking away. Measure the dial the customer FEELS: the escaped-defect rate."</div>`+coach('metric_gameable'));
    if(r.minor.includes('metric_mismatch')) beats.push(
      `<div class="feedback tip">Her claw hovers between two figures. "Your metric is what reaches the customer, yet here is the 12.6% we CATCH — and the 2% inspection target. Two different dials on one charter." She taps twice. "Baseline and target must measure the same thing as the metric: 4.8% today, aiming at half a percent. Tidy it."</div>`+coach('metric_mismatch'));
    if(r.crit.includes('metric_time')) beats.push(
      `<div class="feedback badf">🐉 "Plushies shipped per day." She reads it twice. "Captain Capy’s idea, I would wager — leadership likes ‘fast.’" Her eyes narrow. "This is a QUALITY project. Make speed the headline, and the quickest win is to skip the checks and ship faster — flooding the shops with the very defects we are here to stop. Throughput is a GUARDRAIL, Green Belt — you track it so you do not fix quality by grinding the line to a halt. It is never, ever the primary."</div>`+coach('metric_time'));
    if(r.minor.includes('opinion')) beats.push(
      `<div class="feedback tip">She hovers over one line. "Moon phases." A very long exhale, like a kettle deciding not to boil. "I will pretend I did not read that."</div>`+coach('opinion'));
    if(r.minor.includes('vague_what')) beats.push(
      `<div class="feedback tip">"‘Wonky’ is not a defect category, Green Belt. Which defect? At what rate? Sharpen this."</div>`+coach('vague_what'));
    if(r.minor.includes('muddled')){
      const parts=[]; if(S.ps.base&&S.ps.base.v==='wrongfit') parts.push('shift-split tallies standing in for the overall baseline');
      if(S.ps.date&&S.ps.date.v==='anec') parts.push('a guessed date where a real one belongs');
      beats.push(
      `<div class="feedback tip">"Some of these facts are in the wrong places — ${parts.join(', ')||'a few of them, at least'}. Tidy the structure."</div>`+coach('muddled'));
    }
    if(r.minor.includes('target_vague')) beats.push(
      `<div class="feedback tip">"A target of ‘whatever makes the complaints stop’…" She taps the page. "Targets are numbers, Green Belt. A healthy escaped-defect rate is at or below 0.5%. Write the number."</div>`+coach('target_vague'));
    if(r.minor.includes('copq_vague')) beats.push(
      `<div class="feedback tip">"‘A great deal of sadness.’" She looks up. "Touching. My treasury does not denominate in sadness. COPQ is measured in gold — and Miko’s ledger knows exactly how much."</div>`+coach('copq_vague'));
    if(r.minor.includes('obj_unreal')&&S.ps.target&&S.ps.target.v==='unreal') beats.push(
      `<div class="feedback tip">"Zero percent, forever, immediately." A slow blink. "I admire the spirit. I will not fund the fantasy. Real target, please."</div>`+coach('obj_unreal'));
    if(beats.length===0) beats.push(
      `<div class="feedback good">She reads it once. Then again, slower. Specific defect. The escaped-defect rate — 4.8% reaching children — measured against a 0.5% target, not the inspection number you could game. Ninety-day trend. Refund costs and shops pausing orders. "No blame. No causes. No solutions. No feelings dressed up as facts." She sets the charter down. "This is what a problem statement is supposed to look like."</div>`);
    dragonReact(beats.join(''));
    interact(reviewPS()+beats.join('')+'<button class="btn" id="nx">One more page… ✦</button>');
    $('nx').onclick=()=>go('tg_obj');
  });
},
tg_obj(){
  const r=evalTollgate();
  say(nm('Empress Scarlet'),'dragon:reading',
    L('Finally: the objective statement. The problem told me where we are. This should tell me where we are going — and nothing else.',
      '最後に：目標記述だ。問題記述は「今どこにいるか」を教えてくれた。これは「どこへ向かうか」を——それ以外は何も——教えるべきものだ。'),()=>{
    const beats=[];
    if(r.crit.includes('obj_how')) beats.push(
      `<div class="feedback badf">🐉 She reads the ending aloud: "…${S.obj.how?S.obj.how.t:''}." A wisp of smoke curls from one nostril. "You bolted a HOW onto your objective. ${S.obj.how&&S.obj.how.t.includes('TurboStitch')?'You have committed my treasury to a machine from Torto’s CATALOG':'You have committed this project to re-training people you have not proven are the problem'} — before a single measurement exists. The objective states the destination, Green Belt. The route is earned in Improve. Strike the how."</div>`+coach('obj_how'));
    if(r.crit.includes('obj_anecdote')) beats.push(
      `<div class="feedback badf">🐉 "Your baseline is… Capy’s guess. You intend to improve ‘from about 1 in 7’ — to a precise figure? You cannot measure progress FROM a feeling. The baseline must be a verified number, or the whole objective is theater."</div>`+coach('obj_anecdote'));
    if(r.crit.includes('obj_missing')) beats.push(
      `<div class="feedback badf">🐉 "This objective is incomplete. Metric, baseline, target, deadline. All four, or none of it means anything."</div>`+coach('obj_missing'));
    if(r.minor.includes('obj_unreal') && ['verb','metric','base','target','when'].some(k=>S.obj[k]&&S.obj[k].v==='unreal')) beats.push(
      `<div class="feedback tip">"‘Zero, forever’ is poetry, not planning. Stretch targets inspire; impossible ones excuse failure in advance. Bring me a target the data can respect."</div>`+coach('obj_unreal'));
    if(r.minor.includes('obj_vague')) beats.push(
      `<div class="feedback tip">"‘Look into the wonkiness situation’…" She pinches the bridge of her snout. "An objective needs a metric with edges. Tighten the wording."</div>`+coach('obj_vague'));
    if(beats.length===0) beats.push(
      `<div class="feedback good">"Reduce the defect rate reaching customers from a verified 4.8% to at or below 0.5%, within 90 days." She taps the page once. "Measurable. Bounded. Aimed at what the customer actually feels — not at a gate you could game. And — I notice — not one word about HOW. You left the route to be earned. That is the discipline most teams never learn."</div>`);
    dragonReact(beats.join(''));
    interact(reviewObj()+beats.join('')+'<button class="btn" id="nx">The verdict ✦</button>');
    $('nx').onclick=()=>go('tg_verdict');
  });
},
tg_verdict(){
  const r=evalTollgate();
  if(r.crit.length===0){
    const honors=r.minor.length<=2 && S.consults===0 && !defineLate();
    setDragonMood(honors?'softened':'approving'); setPlayerMood('determined');
    const passMsg = honors
      ? L('The verdict: PASSED. Cleanly. In one sitting, which I confess I did not expect. Your Define phase is approved — the problem has a size, the customer has a voice, the objective has a destination, and nobody has been blamed or sold a machine. Proceed to Measure, Green Belt. Do not make me regret the compliment.',
          '評決：合格。しかも一発で、実に見事に。正直、期待していなかった。きみのDefineフェーズを承認する——問題には大きさがあり、顧客には声があり、目標には行き先があり、誰も責められず、機械を売りつけられてもいない。Measureへ進みなさい、グリーンベルト。この賛辞を後悔させないように。')
      : (S.consults>0 && r.minor.length===0
        ? L('The verdict: PASSED. The charter itself is sound — evidence where it mattered, no blame, no solutions, no feelings dressed as facts. What keeps it from a flawless mark is the schedule: you assembled it while still chasing answers. Approved, Green Belt. Next time, gather first, then build.',
            '評決：合格。チャーター自体は健全だ——肝心なところに証拠があり、責任転嫁も解決策もなく、事実のふりをした感情もない。満点を阻んだのは日程だ：答えを追いかけながら組み立てた。承認する、グリーンベルト。次は、まず集めてから組み立てなさい。')
        : L('The verdict: PASSED, with red ink. Fix the circled items before Measure begins. You built on evidence where it mattered, and that is the discipline that carries projects. Approved.',
            '評決：合格——ただし赤字あり。Measureが始まる前に、丸をつけた箇所を直すこと。肝心なところは証拠の上に築いた。それこそがプロジェクトを支える規律だ。承認する。'));
    say(nm('Empress Scarlet'),honors?'dragon:softened':'dragon:approving', passMsg,()=>{
      if(r.minor.length){
        interact(lessonList(r.minor)+`<button class="btn" id="nx">${L('Celebrate anyway ✦','ともあれ祝おう ✦')}</button>`);
        $('nx').onclick=()=>go('epilogue_pass');
      } else go('epilogue_pass');
    });
  } else {
    setDragonMood('furious'); shakeScene(); smokeBurst(4); setPlayerMood('nervous');
    say(nm('Empress Scarlet'),'dragon:furious',
      L(`The verdict: REJECTED — for now. ${r.crit.length===1?'One':'Multiple'} foundational flaw${r.crit.length===1?'':'s'}, and I will not build a project on ${r.crit.includes('mag_anecdote')||r.crit.includes('obj_anecdote')?'guesswork':'sand'}. That costs us a week of rework. But hear the rest, Green Belt: every Green Belt I have ever certified failed a tollgate. The ones worth keeping failed it exactly once — because they left the room knowing precisely what to fix. So let me be precise.`,
        `評決：却下——今のところは。${r.crit.length===1?'一つ':'複数'}の根本的な欠陥がある。わたしは${r.crit.includes('mag_anecdote')||r.crit.includes('obj_anecdote')?'当て推量':'砂'}の上にプロジェクトを築かない。これで手戻りに一週間かかる。だが最後まで聞きなさい、グリーンベルト：わたしが認定したグリーンベルトは、誰もが一度はトールゲートに落ちた。見どころのある者は、ちょうど一度だけ落ちた——何を直すべきかを正確に分かって部屋を出たからだ。だから、正確に指摘しよう。`),()=>{
      S.daysLost+=7;
      interact(
        lessonList(r.crit.concat(r.minor))+
        `<div class="feedback badf">📉 <b>${L('Consequences:','結果：')}</b> ${L(`+7 days schedule slip · attempt #${S.tollgateAttempts} · the team is bruised but watching how you respond.`,`日程 +7日の遅れ · ${S.tollgateAttempts}回目の挑戦 · チームは打ちのめされつつも、きみの出方を見ている。`)}</div>
        <div class="feedback good">💪 ${L('The rework week gives you everything you need: missing interviews can still happen, and every deliverable can be rebuilt. This is how the lesson sticks.','手戻りの一週間で、必要なものはすべて揃う：逃した聞き取りもまだできるし、どの成果物も作り直せる。こうして学びは身につく。')}</div>
        <button class="btn" id="nx">${L('Face the rework week ✦','手戻りの一週間に立ち向かう ✦')}</button>`);
      $('nx').onclick=()=>go('rework');
    });
  }
},

/* ---------- REWORK LOOP ---------- */
rework(){
  drawWarroom(); banner(L('REWORK WEEK · fixing the foundations','手戻りの一週間 · 土台を直す'));
  narrate(L('Rain taps the workshop windows. Your charter lies on the table wearing its red ink like bandages. Uni sets down two cups of cocoa.',
    '雨が作業場の窓を叩く。きみのチャーターは、赤字を包帯のようにまとってテーブルに横たわる。ユニがココアを2杯、そっと置く。'));
  S.reworkMode=true;
  const r=evalTollgate();
  /* During rework, EVERY missing information source becomes available —
     no route can leave the player unable to finish properly. */
  const needPenny = !S.have.includes('p_mag');
  const needMiko  = !S.vocUnlocked || !S.have.includes('m_shops') || !S.have.includes('m_impact') || ((r.crit.includes('metric_gameable')||r.crit.includes('metric_time')) && !S.have.includes('m_voc') && !S.have.includes('m_ctq'));
  const needTorto = !S.have.includes('t_flow');
  const needLuna  = !S.have.includes('l_counter') && r.crit.includes('blame');
  const psFlags=['mag_anecdote','mag_wrong','mag_missing','blame','solution','cause','ps_incomplete','metric_gameable','metric_time'].some(f=>r.crit.includes(f))||['opinion','muddled','vague_what','target_vague','copq_vague','obj_unreal','metric_mismatch'].some(f=>r.minor.includes(f));
  const objFlags=['obj_how','obj_anecdote','obj_missing','metric_gameable','metric_time'].some(f=>r.crit.includes(f))||['obj_unreal','obj_vague','metric_mismatch'].some(f=>r.minor.includes(f));
  const vocFlags=['voc_missing','voc_internal','ctq_solution'].some(f=>r.crit.includes(f))||['ctq_vague','voc_missed','voc_int_missed'].some(f=>r.minor.includes(f));
  say(nm('Uni the Unicorn'),'uni:concerned',
    L('Rough room. It always is, the first time. Now you know the real rule of Define: the tollgate does not test your charter — it tests your EVIDENCE, and your discipline about causes and solutions. Here is the full list of what she flagged, in plain words. Then let us repair it properly — I will point; you fix.',
      '厳しい場だったね。最初はいつもそう。これでDefineの本当のルールが分かった：トールゲートはきみのチャーターを試すんじゃない——きみの「証拠」と、原因や解決策に対する「規律」を試すんだ。彼女が指摘した点を、全部わかりやすく並べたよ。さあ、きちんと直そう——わたしが指さすから、きみが直して。'),()=>{
    let html=lessonList(r.crit.concat(r.minor))+'<div class="choices">';
    if(needPenny)
      html+=`<button class="choice" id="fx_penny"><span class="tag">Missing evidence</span>You never got verified numbers. Penny Penguin has kept the logs all along — go see her. (+1 day)</button>`;
    if(needMiko)
      html+=`<button class="choice" id="fx_miko"><span class="tag">Missing the customer</span>Miko has what you lack — the customer’s actual voice, and the COPQ in gold. Go see her. (+1 day)</button>`;
    if(needTorto)
      html+=`<button class="choice" id="fx_torto"><span class="tag">Missing the true process</span>Nobody recited the real line order for you. Torto has forty years of it. Bring tea. (+1 day)</button>`;
    if(needLuna)
      html+=`<button class="choice" id="fx_luna"><span class="tag">Missing the night shift’s side</span>You wrote blame without ever hearing the night shift. Luna keeps her own tally sheets. (+1 day)</button>`;
    if(!S.reconciled&&(psFlags||r.crit.includes('metric_gameable')||r.minor.includes('metric_mismatch')))
      html+=`<button class="choice" id="fx_recon"><span class="tag">Reconcile the numbers</span>Line every figure up against what it actually counts — the fastest way to stop arguing about the wrong dial.</button>`;
    if(psFlags)
      html+=`<button class="choice" id="fx_ps"><span class="tag">Problem statement</span>Rebuild the statement — facts in; causes, solutions, blame and feelings out.</button>`;
    if(objFlags)
      html+=`<button class="choice" id="fx_obj"><span class="tag">Objective statement</span>Rebuild the objective — verified baseline, real target, and NO how.</button>`;
    if(vocFlags)
      html+=`<button class="choice" id="fx_voc"><span class="tag">Voice of the Customer</span>Re-sort the voices and choose measurable CTQs.</button>`;
    if(['scope_contam','scope_creep','scope_core','scope_muddled','scope_incomplete'].some(f=>r.crit.includes(f))||r.minor.includes('scope_minor'))
      html+=`<button class="choice" id="fx_scope"><span class="tag">Scope</span>Redraw the fence — in, out, parking lot.</button>`;
    if(['stake_empress','stake_customer','stake_muddled','stake_incomplete'].some(f=>r.crit.includes(f))||r.minor.includes('stake_minor'))
      html+=`<button class="choice" id="fx_stake"><span class="tag">Stakeholders</span>Re-place the names on the power/interest grid.</button>`;
    if(r.crit.includes('flow'))
      html+=`<button class="choice" id="fx_flow"><span class="tag">Block diagram</span>Re-walk the line and fix the block order. Capy promises to focus this time.</button>`;
    if(r.crit.includes('sipoc'))
      html+=`<button class="choice" id="fx_sipoc"><span class="tag">SIPOC</span>Re-sort the SIPOC columns properly.</button>`;
    html+='</div>';
    const clean = r.crit.length===0;
    if(clean) html=`<div class="feedback good">${L('Every critical flaw is repaired','致命的な欠陥はすべて修復済み')}${(needPenny||needMiko||needTorto||needLuna)?L(' — though there is still evidence out there you never collected, if you want it','——もっとも、まだ集めていない証拠が外に残ってはいるが、必要ならね'):''}. ${L('Time to request a new audience with the Empress.','皇帝に再びの謁見を願い出るときだ。')}</div>`+((needPenny||needMiko||needTorto||needLuna)?html:'');
    html+=`<button class="btn" id="retg" ${clean?'':'disabled'} style="margin-top:4px">${L('Request a new tollgate (+1 day) ✦','再トールゲートを願い出る（+1日）✦')}</button>`;
    interact(html);
    const wire=(id,fn)=>{const b=$(id); if(b) b.onclick=fn;};
    wire('fx_penny',()=>{ S.day++; S.interviewed.penny=true; go('rw_penny'); });
    wire('fx_miko',()=>{ S.day++; S.interviewed.miko=true; go('rw_miko'); });
    wire('fx_torto',()=>{ S.day++; S.interviewed.torto=true; go('rw_torto'); });
    wire('fx_luna',()=>{ S.day++; S.interviewed.luna=true; go('rw_luna'); });
    wire('fx_recon',()=>go('reconcile'));
    wire('fx_ps',()=>go('rw_ps'));
    wire('fx_obj',()=>go('rw_obj'));
    wire('fx_voc',()=>go('rw_voc'));
    wire('fx_scope',()=>go('rw_scope'));
    wire('fx_stake',()=>go('rw_stake'));
    wire('fx_flow',()=>go('rw_flow'));
    wire('fx_sipoc',()=>go('rw_sipoc'));
    wire('retg',()=>{ S.day++; S.reworkMode=false; go('tg_intro'); });
  });
},
rw_penny(){
  drawScene(); banner('Rework · the interview you skipped');
  narrate('The QA office again — this time with you actually in it. Penny has already pulled the binder. She knew you would come.');
  say('Penny Penguin','penny:stern',
    '*slides a binder across the desk without being asked* I heard about the review. Twelve point six percent failure over ninety days, target two percent — that is what we CATCH. And since it clearly matters: about 4.8% of what we SHIP still fails in a child’s hands. THAT is the escape rate the customer feels. Top defect: loose smile stitching, fifty-eight percent of failures. The jump began March 14th, to the day. …I do wish people came BEFORE the dragon gets involved.',()=>{
    addCards(['p_mag','p_what','p_when','p_field']);
    interact(`<div class="feedback good">📒 Verified evidence added — the numbers you needed all along were one conversation away.</div>
      <button class="btn" id="nx">Back to rework ✦</button>`);
    $('nx').onclick=()=>go('rework');
  });
},
rw_miko(){
  drawScene(); banner('Rework · hearing the customer at last');
  narrate('The fortress of boxes has grown a new tower since last week. Miko does not say I-told-you-so. Her eyebrows say it for her.');
  say('Miko Cat','miko:dramatic',
    '*wordlessly hands you the stack of letters, then a second stack, then a third* Letter #112: "My daughter cried — the smile came undone after ONE week of hugs." The Sakura Toy Emporium: "we need shipments where every plushie is sellable." And the ledger, since you will need it: returns TRIPLED, forty-eight thousand gold in refunds last quarter, two shops pausing orders. A thousand hugs, minimum, nya. THAT is who you work for.',()=>{
    S.vocUnlocked=true; addCards(['m_ctq','m_voc','m_impact','p_field','m_shops']);
    interact(`<div class="feedback good">📒 The customer’s actual voice AND the business impact, finally in your notebook. Rebuild the VOC table and the problem statement to use them.</div>
      <button class="btn" id="nx">Back to rework ✦</button>`);
    $('nx').onclick=()=>go('rework');
  });
},
rw_torto(){
  drawScene(); banner('Rework · forty years of process knowledge');
  narrate('Machine 3 hums. Torto pours a second cup of tea without being asked — the closest thing to a welcome he offers anyone.');
  say('Torto','torto:content',
    '*does not look up from his tea* Heard the dragon ate your block diagram. *long sip* Receive the fluff and fabric. Cut the panels. Sew the body seams. Stuff with cloud fluff. Stitch the smile. Close the final seam. Final inspection. Package and ship. *finally looks up* In my day, people asked BEFORE the important meeting. Also — the tension knob on Machine 3 drifts by lunchtime. You did not hear it from me.',()=>{
    addCards(['t_flow','t_nug']);
    interact(`<div class="feedback good">📒 The true line order (and a bonus observation), straight from forty years of memory. Rebuild the block diagram to use it.</div>
      <button class="btn" id="nx">Back to rework ✦</button>`);
    $('nx').onclick=()=>go('rework');
  });
},
rw_luna(){
  drawScene(); banner('Rework · hearing the night shift at last');
  narrate('You come at midnight this time, on her turf. The night floor is calm and precise — nothing like the rumors said.');
  say('Luna Axolotl','luna:pleased',
    '*slides her tally sheets across without a word, then, softly:* Night shift, 12.4%. Day shift, 12.7%. Nearly identical — whatever breaks the plushies does not care what time it is. *gathers her things for the night* I am glad someone finally looked before it went in a charter twice.',()=>{
    addCards(['l_counter','l_skip','l_when2']);
    interact(`<div class="feedback good">📒 The data that ends the blame: both shifts perform the same. Rebuild the problem statement without a villain in it.</div>
      <button class="btn" id="nx">Back to rework ✦</button>`);
    $('nx').onclick=()=>go('rework');
  });
},
rw_ps(){ banner('Rework · Problem Statement'); SCENES.ps_build(); },
rw_obj(){ banner('Rework · Objective Statement'); SCENES.obj_build(); },
rw_voc(){ banner('Rework · Voice of the Customer'); S.voc={voc:[],noise:[]}; S.ctq={}; S.vocGame=null; SCENES.voc_build(); },
rw_flow(){ banner('Rework · Block Diagram'); SCENES.flow_build(); },
rw_sipoc(){ banner('Rework · SIPOC'); SCENES.sipoc_build(); },
rw_scope(){ banner('Rework · Scope'); SCENES.scope_build(); },
rw_stake(){ banner('Rework · Stakeholders'); SCENES.stake_build(); },

/* ---------- endings ---------- */
epilogue_pass(){
  const r=evalTollgate();
  const honors=r.crit.length===0&&r.minor.length<=2&&S.tollgateAttempts===1&&S.consults===0&&!defineLate();
  S.rating=honors?'S':(S.tollgateAttempts>1?'C':'A'); S.scoreDefine=null;
  drawBackdrop('scene_floor'); banner(L('DEFINE · COMPLETE','DEFINE · 完了'));
  narrate(L('Fluff drifts through the sunbeams like confetti. Somewhere on the line, a plushie rolls past with a perfect, permanent smile.',
    '陽の光の中を、ふわふわが紙吹雪のように舞う。ラインのどこかで、完璧で、ずっと消えない笑顔のぬいぐるみが流れていく。'));
  for(let k=0;k<12;k++){
    $('scene').insertAdjacentHTML('beforeend',
      `<span class="sparkle" style="top:${Math.random()*180}px;left:${Math.random()*90}%;animation-delay:${Math.random()}s">${['✦','✧','🌟','💖','🧸'][k%5]}</span>`);
  }
  say(nm('Uni the Unicorn'),'uni:happy',
    honors?
    L('A first-attempt pass with honors. Do you understand how rare that is? You interviewed the right people, asked the right questions, heard the actual customer, saw past the inspection gate to the 4.8% reaching children, and kept every cause and solution OUT of your problem and objective. THAT is Define. Chapter 2 — Measure — is where that escaped-defect rate becomes a baseline the whole project stands on.',
      '一発合格、しかも優秀評価。それがどれほど稀か分かる？きみは正しい人に聞き取りをし、正しい質問をし、本物の顧客の声を聞き、検査の門の向こう——子どもたちに届く4.8%——まで見通した。そして原因も解決策も、問題記述と目標記述から締め出した。それこそがDefineだ。第2章「Measure（測定）」では、その流出不良率が、プロジェクト全体を支えるベースラインになる。'):
    (S.tollgateAttempts>1?
    L(`You passed — on attempt ${S.tollgateAttempts}, ${S.daysLost} days behind schedule. Expensive lessons stick best. You now know in your bones why evidence beats anecdotes, why customers outrank break rooms, and why causes and solutions wait their turn. Chapter 2 — Measure — awaits.`,
      `合格だ——${S.tollgateAttempts}回目の挑戦で、日程は${S.daysLost}日遅れ。高くついた教訓ほど、よく身につく。もう骨身に染みただろう：なぜ証拠が逸話に勝るのか、なぜ顧客が休憩室より優先されるのか、そしてなぜ原因と解決策は順番を待つのか。第2章「Measure」が待っている。`):
    L('Passed, with a little red ink. Solid work, Green Belt. Chapter 2 — Measure — is where the real numbers live.',
      '合格——少しだけ赤字つきで。堅実な仕事だ、グリーンベルト。第2章「Measure」——本物の数字が息づく場所だ。')),()=>{
    interact(`<div class="center">
      <h1 class="title-h">${L('✦ Chapter 1 Complete ✦','✦ 第1章 クリア ✦')}</h1>
      <p class="subtitle">${honors?L('Rating: S — flawless Define','評価：S — 完璧なDefine'):(S.tollgateAttempts>1?L(`Rating: C — passed after ${S.tollgateAttempts} attempts (+${S.daysLost}d slip)`,`評価：C — ${S.tollgateAttempts}回目で合格（+${S.daysLost}日遅れ）`):L('Rating: A — passed with minor notes','評価：A — 軽微な指摘つきで合格'))}</p>
      <div style="margin:10px 0">
        <span class="pill">${L(`🗣️ Interviews: ${Object.keys(S.interviewed).length}/4`,`🗣️ 聞き取り：${Object.keys(S.interviewed).length}/4`)}</span>
        <span class="pill">${L(`💬 CTQs defined: ${Object.keys(S.ctq).length}`,`💬 定義したCTQ：${Object.keys(S.ctq).length}`)}</span>
        <span class="pill">${L(`📅 Slip: ${S.daysLost} days`,`📅 遅れ：${S.daysLost}日`)}</span>
        <span class="pill">${defineLate()?L(`⏳ Define ran ${fmtDays(daysUsed()-DEFINE_DAYS)}d over`,`⏳ Define ${fmtDays(daysUsed()-DEFINE_DAYS)}日超過`):L('⏳ Define delivered on time','⏳ Define 期限内に完了')}</span>
        <span class="pill">${L(`🆘 Build-time consults: ${S.consults}`,`🆘 作成中の相談：${S.consults}`)}</span>
        <span class="pill">${L(`🐉 Attempts: ${S.tollgateAttempts}`,`🐉 挑戦回数：${S.tollgateAttempts}`)}</span>
      </div>
      <p class="hint">${L('Torto’s tension knob… Luna’s skipped final checks… humid weeks…<br>Those cause hypotheses were banned from Define — but keep them close.<br>In ANALYZE, they finally get their day in court. 👀','トルトのテンションつまみ…ルナの飛ばされる最終検査…湿気の多い週…<br>これらの原因仮説はDefineでは禁じられた——だが手放さないで。<br>ANALYZE（分析）で、ついに彼らの出番が来る。👀')}</p>
      <div style="margin:8px 0">${typeof scoreBadge==='function'?scoreBadge():''}</div>
      <button class="btn center-btn" id="next2">${L('Continue to Chapter 2 — MEASURE ✦','第2章 MEASURE へ ✦')}</button>
      <button class="btn ghost center-btn" id="again" style="margin-top:8px">${L('Play Chapter 1 again','第1章をもう一度')}</button></div>`);
    $('next2').onclick=()=>go('m_card');
    $('again').onclick=()=>{ clearSave(); location.reload(); };
  });
},

};

/* rework sub-screens route back to the rework hub via S.reworkMode,
   which each lock handler checks directly (no polling). */

/* interview question engine — ONE shared stopwatch budget across all interviews.
   Questions with `req` are probing follow-ups: hidden until their parents are asked.
   opts.free = ask freely, costs nothing (Capy's floor chat). */
function ivQuestions(pid, qs, opts){
  opts=opts||{};
  const free=!!opts.free;
  const endLabel=opts.endLabel||L('End interview & return ✦','聞き取りを終えて戻る ✦');
  const onEnd=opts.onEnd||(()=>go('hub'));
  const who={penny:['Penny Penguin','penny'],miko:['Miko Cat','miko'],luna:['Luna Axolotl','luna'],torto:['Torto','torto'],capy:['Captain Capy','capy']}[pid];
  /* Shuffle ONCE and scatter around a circle, so the player judges each option on its
     merits instead of picking top-to-bottom. Follow-ups slot in when unlocked. */
  const arranged=qs.slice();
  for(let i=arranged.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arranged[i],arranged[j]]=[arranged[j],arranged[i]]; }
  const start=Math.random()*360;                         // random rotation of the whole ring
  function render(unlockedNow){
    const left=free?Infinity:qLeft();
    const visible=arranged.filter(q=>!q.req||q.req.every(k=>S.asked[pid+k]));
    const n=visible.length;
    const wPct=n>=6?43:49;
    const btns=visible.map((q,idx)=>{
      const asked=S.asked[pid+q.k];
      const cls=asked?'asked':(left<=0?'exhausted':'');
      const fresh=unlockedNow&&unlockedNow.includes(q.k)?'newcard-pop':'';
      const ang=(start + idx*(360/n) + (idx%2?6:-6))*Math.PI/180;
      const rad=34 - (idx%2?5:0);
      const px=(50+rad*Math.cos(ang)).toFixed(1), py=(50+rad*Math.sin(ang)).toFixed(1);
      const rot=(((idx*37)%9)-4);
      return `<button class="ivq ${cls} ${fresh}" data-k="${q.k}" style="left:${px}%;top:${py}%;width:min(${wPct}%,150px);transform:translate(-50%,-50%) rotate(${rot}deg)">${q.req?'↳ ':''}${q.q}</button>`;
    }).join('');
    const remain = free
      ? L(`🗨 Press ${nm(who[0])} on anything — he loves the attention. Move on when done.`,`🗨 ${nm(who[0])} には何でも突っ込んでいい——彼は注目されて大喜び。済んだら次へ。`)
      : (left<=0
        ? L(`⏱ The stopwatch has run out — no interview time left. Good answers unlock deeper follow-ups (↳) next run.`,`⏱ ストップウォッチが切れた——聞き取りの時間はもう残っていない。`)
        : L(`⏱ ${nm(who[0])} — every question winds the stopwatch down. Good answers unlock deeper follow-ups (↳).`,`⏱ ${nm(who[0])} — 質問するたびストップウォッチが減る。良い答えは深掘りの続き（↳）を開く。`));
    const centre = free?'🗨':stopwatchSVG(qLeft()/QBUDGET,52);
    interact(`<div class="iv-remaining">${remain}</div>
      <div class="iv-radial"><div class="iv-center">${centre}</div>${btns}</div>
      <button class="btn ghost" id="endiv">${endLabel}</button>`);
    document.querySelectorAll('.ivq[data-k]').forEach(b=>{
      if(b.classList.contains('asked')||b.classList.contains('exhausted')) return;
      b.onclick=()=>{
        const q=arranged.find(x=>x.k===b.dataset.k);
        S.asked[pid+q.k]=true;
        S.askCount[pid]=(S.askCount[pid]||0)+1;
        if(!free) S.qUsed++;
        if(q.voc) S.vocUnlocked=true;
        if(q.gate) S.gate.named=true;          // opens the returns-ledger chain
        const before=arranged.filter(x=>!x.req||x.req.every(k=>S.asked[pid+k])).map(x=>x.k);
        say(nm(who[0]),who[1]+(q.mood?':'+q.mood:''),q.a,()=>{
          addCards(q.cards);
          const after=arranged.filter(x=>!x.req||x.req.every(k=>S.asked[pid+k])).map(x=>x.k);
          render(after.filter(k=>!before.includes(k)));
        });
      };
    });
    $('endiv').onclick=onEnd;
  }
  render();
}

/* router */
function go(id){
  S.scene=id; setTimeout(saveGame,0);
  narrate(null);                                   // scenes opt in to narration
  musicTrack((id==='title'||id==='chaptercard'||id==='m_card'||id==='a_card'||id==='i_card'||id==='c_card')?'intro':((id.startsWith('tg_')||id.startsWith('m_tg_')||id.startsWith('a_tg_')||id.startsWith('i_tg_')||id.startsWith('c_tg_'))?'dragon':'main'));
  if(!/^(m|a|i|c)_/.test(id) && typeof STEPS_DEFINE!=='undefined') STEPS=STEPS_DEFINE;
  (SCENES[id]||SCENES.title)();
  renderNotebook();
  const rail=document.getElementById('castrail');
  if(rail){ rail.style.display=(id==='title'||id==='chaptercard'||id==='m_card'||id==='a_card'||id==='i_card'||id==='c_card')?'none':'flex'; refreshCastRail(); }
  window.scrollTo({top:0,behavior:'smooth'});
}
window.__go=go;
/* title art: on wide screens (16:9 and wider) fit the WHOLE scene — sky, clouds, chimney smoke — into the box;
   on portrait phones keep the tight crop that fills the width with the factory itself */
function fitHero(){ const box=document.querySelector('.ih-factory-top'); const svg=box&&box.querySelector('svg'); if(!svg) return;
  const ar=box.clientWidth/Math.max(1,box.clientHeight);
  if(ar>=1.9){ const vbW=Math.max(900,Math.round(290*ar)); svg.setAttribute('viewBox',`${400-vbW/2} -40 ${vbW} 290`); svg.setAttribute('preserveAspectRatio','xMidYMid meet'); }
  else { svg.setAttribute('viewBox','0 -40 800 290'); svg.setAttribute('preserveAspectRatio','xMidYMax slice'); } }


/* ---------- autosave: the whole game state (S) lives in localStorage; scenes rebuild themselves from S ---------- */
const SAVE_KEY='mochimill.save.v1';
let _saveTimer=null, _saveDirty=false, _lastSaved='';
function saveGame(){ try{ if(S.scene==='title'||S.scene==='chaptercard') return; const js=JSON.stringify(S); if(js===_lastSaved) return; localStorage.setItem(SAVE_KEY,js); _lastSaved=js; }catch(e){} }
function scheduleSave(){ _saveDirty=true; }
function clearSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} _lastSaved=''; }
function loadSave(){ try{ const js=localStorage.getItem(SAVE_KEY); return js?JSON.parse(js):null; }catch(e){ return null; } }
function saveSummary(sv){ if(!sv) return ''; const id=sv.scene||''; const ch=/^m_/.test(id)?'Measure':/^a_/.test(id)?'Analyze':/^i_/.test(id)?'Improve':/^c_/.test(id)?'Control':'Define'; const d=Math.max(0,(sv.day-1))+(sv.half?0.5:0)+(sv.daysLost||0); return `${ch} · ${L('day','日目')} ${Math.round(d*2)/2}`; }
function resumeScene(id){ /* resuming mid-tollgate restarts that tollgate (and undoes the attempt counter the intro will re-add) */
  if(/^tg_/.test(id)){ S.tollgateAttempts=Math.max(0,(S.tollgateAttempts||0)-1); return 'tg_intro'; }
  if(/^m_tg_/.test(id)){ if(S.m) S.m.tgAttempts=Math.max(0,(S.m.tgAttempts||0)-1); return 'm_tg_intro'; }
  if(/^a_tg_/.test(id)){ if(S.a) S.a.tgAttempts=Math.max(0,(S.a.tgAttempts||0)-1); return 'a_tg_intro'; }
  if(/^i_tg_/.test(id)){ if(S.i) S.i.tgAttempts=Math.max(0,(S.i.tgAttempts||0)-1); return 'i_tg_intro'; }
  if(/^c_tg_/.test(id)){ if(S.c) S.c.tgAttempts=Math.max(0,(S.c.tgAttempts||0)-1); return 'c_tg_intro'; }
  if(id==='chaptercard') return 'chaptercard';
  return id; }
function continueGame(){ const sv=loadSave(); if(!sv) return false; Object.keys(S).forEach(k=>{ delete S[k]; }); Object.assign(S,sv); const h=$('introhero'); if(h) h.remove(); const id=resumeScene(S.scene); go(id); return true; }
setInterval(()=>{ saveGame(); },1500);                 // state changes inside a scene (chips, drills, decisions) are picked up here
window.addEventListener('beforeunload',saveGame);

/* build the persistent music button + cast rail, attempt autoplay, then start the game */
buildChrome();
autoStartMusic();
['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,resumeIfNeeded,{passive:true}));
/* stop the audio when the page is hidden/closed so it never keeps playing in a
   backgrounded or closed preview; resume when it comes back (unless the user muted). */
function silenceMusic(){ if(MUSIC.timer){clearInterval(MUSIC.timer);MUSIC.timer=null;} if(MUSIC.ctx&&MUSIC.ctx.suspend){try{MUSIC.ctx.suspend();}catch(_){}}}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){ silenceMusic(); }
  else if(MUSIC.enabled && !MUSIC.userOff){ musicSet(true); }
});
/* Focus guard for embedded previews (the desktop app) that keep hidden pages alive
   without firing visibilitychange: music only plays while the game has focus. */
window.addEventListener('blur',silenceMusic);
window.addEventListener('focus',()=>{ if(MUSIC.enabled && !MUSIC.userOff) musicSet(true); });
/* Belt-and-braces watchdog: if the page has neither focus nor visibility, silence. */
setInterval(()=>{ if(MUSIC.timer && (document.hidden || (document.hasFocus && !document.hasFocus()))) silenceMusic(); },1500);
['pagehide','beforeunload','unload'].forEach(ev=>window.addEventListener(ev,()=>{ silenceMusic(); if(MUSIC.ctx&&MUSIC.ctx.close){try{MUSIC.ctx.close();}catch(_){}} }));
go('title');

;

/* =====================================================================
   CHAPTER 2 — MEASURE
   Appended as a second script block. Uses the Define engine: S, L, nm,
   say, interact, narrate, banner, sorterUI, vc, coach, lessonList,
   drawWarroom/drawBackdrop/drawBoardroom, dragonReact, tickHalfDay …
   ===================================================================== */
const MEASURE_DEADLINE=30;                 // Define 10 + Measure 20 (calendar days from day 1)
function measureLate(){ return daysUsed()>MEASURE_DEADLINE; }
const STEPS_DEFINE=STEPS.slice();
const STEPS_MEASURE=[['🔁','Re-check Y'],['📏','Op. Definition'],['🎯','MSA'],['🗓️','Data Plan'],['📥','Collect'],['📊','Baseline'],['📈','Pareto'],['🔍','First Look'],['🐉','Tollgate']];
function useMeasureTracker(step){ STEPS=STEPS_MEASURE; renderTracker(step); }

/* ---------- Measure state ---------- */
function M(){
  if(!S.m) S.m={y:null,opdef:{},msa:null,msaTries:0,plan:{},strat:[],collect:{},base:{},pareto:{order:[],vital:[]},chart:[],
    done:{},tgAttempts:0,scoreMeasure:null};
  return S.m;
}
/* ---------- Define carry-over ---------- */
function carry(){
  const c={};
  c.metricOk = !!(S.ps.metric && S.ps.metric.v==='ok');
  c.metricKind = S.ps.metric ? S.ps.metric.v : 'none';
  c.hasField = S.have.includes('p_field');
  c.ctqSmileOk = S.ctq.smile==='ok';
  c.ctqShipOk = S.ctq.ship==='ok';
  c.sakuraClose = S.have.includes('m_shops') && (S.stake.MC||[]).includes(1);
  c.strat = [];
  if(S.have.includes('l_counter')) c.strat.push('shift');
  if(S.have.includes('t_nug')||S.ctq.thread) c.strat.push('m3');
  if(S.have.includes('l_when2')) c.strat.push('humid');
  if(S.ctq.rework) c.strat.push('rework');
  c.rating = S.rating || (S.tollgateAttempts>1?'C':'A');
  c.defineOver = Math.max(0, daysUsed()-DEFINE_DAYS);
  return c;
}

/* ---------- new cards ---------- */
Object.assign(CARDS,{
  mx_letter:{txt:'Ms. Sakura’s letter: "Your inspectors may be catching more — my shelves are not feeling it. Returns are STILL nearly one in twenty."',src:'Sakura Toy Emporium, week 1 of Measure',type:'ver',slot:null},
  mx_gauge:{txt:'Pull-test gauge: a smile seam that opens ≥ 2 mm under the 1,000-cycle hug test is a DEFECT. Below 2 mm: pass.',src:'Penny + Uni, operational definition',type:'ver',slot:null},
  mx_counts:{txt:'4-week window: 4,576 produced · 576 caught at the gate (12.6%) · 4,000 shipped · 192 returned defective (4.8%).',src:'Penny’s gate log × Miko’s returns ledger',type:'ver',slot:null},
  mx_pareto:{txt:'Returned defects by type: loose smile 112 · lumpy tummy 34 · seam split 23 · eyes misaligned 15 · other 8.',src:'Returns ledger, coded to the op. definition',type:'ver',slot:null},
  mx_chart:{txt:'Weekly escaped-defect rate ~4.5% with spikes in weeks 5 and 9 (both humid). Night ≈ day. Machine 3 higher after lunch.',src:'Run chart + stratified view',type:'ver',slot:null},
});

/* ---------- lessons ---------- */
Object.assign(LESSON,{
  m_wrong_y:{t:'Measuring the wrong Y',d:'You spent Measure counting what the inspection gate CATCHES while the customer keeps feeling what ESCAPES. A baseline of the wrong number is precise, expensive — and useless. Measure begins by re-validating the Y against the customer, every time.'},
  opdef_vague:{t:'Operational definition is subjective',d:'"Looks loose to the inspector" means two inspectors, two answers. An operational definition must let a stranger with a gauge reach the same verdict: WHAT is measured, HOW, with WHAT threshold. Yours: seam gap ≥ 2 mm after the 1,000-cycle hug test.'},
  opdef_blame:{t:'Blame inside the definition',d:'A defect is a property of the UNIT, never of who touched it. "Anything the night shift touched" is not a measurement — it is a grudge with a clipboard.'},
  opdef_inflate:{t:'Opportunity inflation',d:'Counting twelve seams as twelve "opportunities" divides your DPMO by twelve and makes a broken plushie look like a near-perfect one. A plushie is sellable or it is not: ONE opportunity per unit. The Empress has seen this trick before.'},
  opdef_unit:{t:'Wrong unit of measure',d:'The customer receives a plushie, not a batch. Define the unit at the level the customer experiences it.'},
  opdef_method:{t:'Measurement method too soft',d:'"Eyeball at the gate" cannot be repeated or audited. A gauge and a checklist can.'},
  opdef_incomplete:{t:'Operational definition incomplete',d:'Unit, criterion, method, measurer, opportunities — all five, or the data that follows cannot be trusted.'},
  msa_fail:{t:'Unvalidated measurement system',d:'When trained inspectors agree less than 90% of the time, the numbers you collect afterwards measure the INSPECTORS, not the process. Fix the definition, re-run the agreement study, THEN collect. You proceeded anyway.'},
  msa_assessor:{t:'You misjudged units yourself',d:'The definition was clear and you still called some wrong. Measurement discipline applies to the Green Belt too — the gauge, not the gut.'},
  plan_gate_only:{t:'Plan measures only what the gate catches',d:'Your Y is the rate reaching customers, yet your plan collects only at inspection. Escaped defects are found at the returns desk and in the field — the plan must reach there.'},
  plan_bias:{t:'Biased sample',d:'Thirty units from Tuesday’s day shift tells you about Tuesday’s day shift. A baseline needs a random sample across shifts, machines and weeks — or every conclusion inherits the bias.'},
  plan_nostrat:{t:'No stratification factors',d:'Data without shift, machine, week and humidity tags cannot be sliced later. Analyze will ask "where does it happen?" — collect the tags now, or collect twice.'},
  plan_over:{t:'Over-collecting',d:'Every unit for ninety days is not rigor, it is delay. A random sample of ~200 units over four weeks gives a solid baseline in days, not months.'},
  plan_incomplete:{t:'Data collection plan incomplete',d:'Where, how many, how sampled, tagged with what, owned by whom — a plan with holes collects holes.'},
  data_cherry:{t:'Cherry-picked data',d:'Dropping the humid week as an "outlier" removed the very signal Analyze needs. Outliers are investigated, never deleted for looking inconvenient.'},
  data_mixed:{t:'Mixed definitions in one dataset',d:'Luna’s tallies used her own rules. Merged un-recoded, your dataset now counts two different things. Re-code to the operational definition before merging — always.'},
  base_wrong:{t:'Baseline uses the wrong numbers',d:'Escaped-defect rate = returned-defective ÷ SHIPPED, same window. The gate count and the produced count answer different questions.'},
  base_inflate:{t:'Sigma level flattered by inflated opportunities',d:'A DPMO of 4,000 came from dividing by twelve seams. The customer got one broken plushie, not one-twelfth of one. Real DPMO: 48,000 — about 3.2σ.'},
  base_sigma:{t:'Sigma level misread',d:'48,000 DPMO sits near 3.2σ (with the conventional 1.5 shift). Read the table, do not guess it.'},
  pareto_wrong:{t:'Vital few misidentified',d:'Loose smiles and lumpy tummies are ~76% of returned defects — that is the vital few. Chasing "other" or every category equally spends effort where the pain is not.'},
  chart_cause:{t:'A cause claimed from a chart',d:'The chart shows WHEN and WHERE — humid weeks, after lunch on Machine 3. It cannot show WHY. "Humidity causes it" is a hypothesis for Analyze to test, not a Measure finding to record.'},
  chart_missed:{t:'Patterns left unnoticed',d:'Two spikes, one machine after lunch, night equal to day, no trend. Reading the first chart carefully is what hands Analyze its starting list.'},
  m_late:{t:'Measure ran past day 30',d:'The Empress allowed twenty days for Measure on top of Define. Re-runs, chases and consults spend them. Analyze needs the time you just used.'},
});

/* ---------- help consults (cost a day, dragon notices) ---------- */
Object.assign(HELP,{
  opdef:{ title:'the operational definition of a defect', q:[
    {who:'Penny Penguin', cls:'penny', mood:'stern', ask:'“What exactly makes a smile seam a defect?”',
      a:'A number, not an adjective. Our pull-test gauge: if the seam opens two millimetres or more after the thousand-cycle hug test, it is a defect. Below two, it passes. Write the threshold down; opinions are not repeatable.',
      cards:['mx_gauge']},
    {who:'Hana', cls:'hana', mood:null, ask:'“Hana, what does ‘broken’ mean to you?”',
      a:'When the smile goes OPEN and the fluff shows. Even a little bit. I can put my fingernail in the gap. *demonstrates on Mr. Mochi* Like THAT.',
      cards:[]},
  ]},
  plan:{ title:'the data collection plan', q:[
    {who:'Uni the Unicorn', cls:'uni', mood:'stern', ask:'“How big a sample, and from where?”',
      a:'For a baseline on an attribute Y around five percent, two hundred random units across all shifts, machines and four weeks is honest work. And sample where the Y LIVES: escaped defects live at the returns desk, not only at the gate.',
      cards:[]},
    {who:'Luna Axolotl', cls:'luna', mood:'thoughtful', ask:'“What should every data row be tagged with?”',
      a:'Shift. Machine. The week. And the weather — write the humidity down, nobody ever does. If you do not tag it now, you will be back at midnight asking me to remember.',
      cards:[]},
  ]},
});

/* ---------- generic row picker (op. definition, plan, baseline) ---------- */
function rowPicker(cfg){
  /* cfg:{store, rows:[{k,lbl,opts:[{t,v,need?}]}], lockId, lockLabel, onLock, preview?, help?, note?} */
  const st=cfg.store;
  function has(n){ return !n || (Array.isArray(n)?n.some(x=>S.have.includes(x)):S.have.includes(n)); }
  function render(){
    const html=cfg.rows.map(r=>{
      const opts=r.opts.filter(o=>has(o.need));
      return `<div class="obj-row"><span class="lbl">${r.lbl}</span><div class="obj-opts">${
        opts.map(o=>`<div class="chip ${st[r.k]&&st[r.k].t===o.t?'on':''}" data-k="${r.k}" data-i="${r.opts.indexOf(o)}">${o.t}</div>`).join('')}</div></div>`;
    }).join('');
    const all=cfg.rows.every(r=>st[r.k]);
    interact(((typeof cfg.note==='function')?cfg.note():(cfg.note||''))+html+(cfg.preview&&all?cfg.preview():'')+
      `${all?'':`<div class="hint" style="color:#c48a3a">${L('Some rows are still empty. You may proceed anyway…','まだ空欄の行がある。このまま進むこともできる…')}</div>`}
       <button class="btn" id="${cfg.lockId}">${all?cfg.lockLabel:L('Submit with gaps (risky) ✦','空欄のまま提出（危険）✦')}</button>`+(cfg.help?helpControl(cfg.help):''));
    document.querySelectorAll('.chip[data-k]').forEach(ch=>ch.onclick=()=>{
      const r=cfg.rows.find(x=>x.k===ch.dataset.k), o=r.opts[+ch.dataset.i];
      st[r.k]=(st[r.k]&&st[r.k].t===o.t)?null:{t:o.t,v:o.v}; render();
    });
    $(cfg.lockId).onclick=cfg.onLock;
    if(cfg.afterRender) cfg.afterRender();
  }
  render();
}

/* ---------- data tables ---------- */
const OPDEF_ROWS=()=>[
  {k:'unit',lbl:L('Unit of measure','測定単位'),opts:[
    {t:L('one shipped plushie','出荷されたぬいぐるみ1体'),v:'ok'},
    {t:L('one production batch of 50','生産バッチ（50体）'),v:'unit'},
    {t:L('one inspection shift','検査シフト1回'),v:'unit'}]},
  {k:'crit',lbl:L('Defect criterion (the threshold)','不良の判定基準（しきい値）'),opts:[
    {t:L('smile seam opens ≥ 2 mm after the 1,000-cycle hug test','1,000回ハグ試験後に笑顔の縫い目が2mm以上開く'),v:'ok',need:'mx_gauge'},
    {t:L('smile looks loose to the inspector','検査員の目に緩く見える'),v:'vague'},
    {t:L('a customer complained about it','顧客から苦情があった'),v:'vague'},
    {t:L('any plushie the night shift touched','夜勤が触ったぬいぐるみ全部'),v:'blame'}]},
  {k:'method',lbl:L('Measurement method','測定方法'),opts:[
    {t:L('pull-test gauge on sampled units + returns log matched to the same rule','抜き取りに引張試験ゲージ＋同じ基準で返品記録を照合'),v:'ok'},
    {t:L('eyeball at the gate','門でひと目見る'),v:'method'},
    {t:L('ask Capy how it looked that day','その日の様子をカピーに聞く'),v:'method'}]},
  {k:'who',lbl:L('Who measures','測定者'),opts:[
    {t:L('trained inspectors with the checklist (Penny, Luna)','チェックリストを持つ訓練済み検査員（ペニー、ルナ）'),v:'ok'},
    {t:L('whoever is free at the moment','手が空いている人'),v:'method'},
    {t:L('the operator who made it','作ったオペレーター本人'),v:'method'}]},
  {k:'opp',lbl:L('Opportunities per unit','単位あたりの機会数'),opts:[
    {t:L('1 — a plushie is either sellable or it is not','1——売れるか売れないか'),v:'ok'},
    {t:L('12 — count every seam separately (DPMO looks much better)','12——縫い目ごとに数える（DPMOが良く見える）'),v:'inflate'}]},
];
const PLAN_ROWS=()=>[
  {k:'where',lbl:L('Where the Y is measured','Yを測る場所'),opts:[
    {t:L('gate log AND returns desk (escaped units, same window)','門の記録＋返品デスク（流出分、同じ期間）'),v:'ok',need:'p_field'},
    {t:L('final inspection gate only','最終検査の門だけ'),v:'gate'},
    {t:L('returns desk only','返品デスクだけ'),v:'returns'}]},
  {k:'sample',lbl:L('Sample','サンプル'),opts:[
    {t:L('~200 random units over 4 weeks, all shifts & machines','4週間で約200体を無作為に、全シフト・全マシン'),v:'ok'},
    {t:L('30 units from Tuesday’s day shift (convenient)','火曜の日勤から30体（都合が良い）'),v:'bias'},
    {t:L('5 plushies Capy picked out','カピーが選んだ5体'),v:'bias'},
    {t:L('every unit for 90 days','90日間の全数'),v:'over'}]},
  {k:'owner',lbl:L('Who collects','収集担当'),opts:[
    {t:L('Penny logs the gate, Miko the returns, Luna the nights — one form','門はペニー、返品はミコ、夜はルナ——同じ様式で'),v:'ok'},
    {t:L('Capy, from memory, at the end of each week','週末にカピーが記憶から'),v:'bias'}]},
];
const STRAT_POOL=()=>{
  const c=carry();
  const pool=[
    {id:'shift',t:L('Shift (day / night)','シフト（日勤／夜勤）'),ok:true},
    {id:'machine',t:L('Machine (1–4)','マシン（1〜4）'),ok:true},
    {id:'week',t:L('Week / date','週・日付'),ok:true},
    {id:'operator',t:L('Operator (coded, not named)','作業員（記号化、実名なし）'),ok:true},
    {id:'blame',t:L('Who is to blame for it','誰のせいか'),ok:false,trap:'blame'},
  ];
  if(c.strat.includes('humid')) pool.push({id:'humid',t:L('Humidity that day (Luna)','その日の湿度（ルナ）'),ok:true});
  if(c.strat.includes('m3')) pool.push({id:'tod',t:L('Time of day: before / after lunch (Torto)','時間帯：昼食前／後（トルト）'),ok:true});
  if(c.strat.includes('rework')) pool.push({id:'rework',t:L('Cutting rework on that panel (Capy)','その生地の裁断手戻り（カピー）'),ok:true});
  return pool;
};
const MSA_CARDS=[
  {gap:0.4,note:L('tummy slightly lumpy','おなかが少しでこぼこ')},{gap:2.6,note:''},{gap:1.9,note:L('borderline','ぎりぎり')},
  {gap:3.1,note:''},{gap:0.8,note:L('night-shift tag','夜勤タグ')},{gap:2.0,note:L('exactly 2.0','ちょうど2.0')},
  {gap:1.2,note:L('eyes a little uneven','目が少し不揃い')},{gap:4.0,note:''},{gap:0.6,note:L('night-shift tag','夜勤タグ')},
  {gap:2.2,note:''},{gap:1.5,note:L('very cute','とてもかわいい')},{gap:2.8,note:L('day-shift tag','日勤タグ')},
];
const COUNTS={produced:4576,caught:576,shipped:4000,returned:192};
const PARETO=[{k:'smile',t:L('Loose smile','笑顔の緩み'),n:112},{k:'lumpy',t:L('Lumpy tummy','おなかのでこぼこ'),n:34},
  {k:'seam',t:L('Seam split','縫い目の裂け'),n:23},{k:'eyes',t:L('Eyes misaligned','目のずれ'),n:15},{k:'other',t:L('Other','その他'),n:8}];
const CHART_WEEKS=[4.6,4.4,4.9,4.5,6.8,4.7,4.3,4.6,6.9,4.8,4.5,4.7];
const CHART_OBS=()=>[
  {t:L('Two spikes — weeks 5 and 9 — both humid weeks','週5と週9に2つの山——どちらも湿度の高い週'),ok:true},
  {t:L('Night and day shifts are nearly identical','夜勤と日勤はほぼ同じ'),ok:true},
  {t:L('Machine 3 runs higher after lunch than before','マシン3は昼食後の方が高い'),ok:true},
  {t:L('No trend — stable at a bad level around 4.5%','傾向なし——約4.5%の悪い水準で安定'),ok:true},
  {t:L('Humidity CAUSES the defects','湿度が不良の原因だ'),ok:false,cause:true},
  {t:L('Machine 3’s tension knob is the root cause','マシン3の張力ノブが根本原因だ'),ok:false,cause:true},
  {t:L('The process is improving — week 12 is below week 5','工程は改善している——週12は週5より低い'),ok:false},
  {t:L('Night shift is fine, so the day shift must be the problem','夜勤は問題ないから日勤が原因のはず'),ok:false,cause:true},
];

/* ---------- evaluation ---------- */
function evalMeasure(){
  const m=M(), c=carry(), crit=[], minor=[];
  const push=(a,f)=>{ if(!a.includes(f)) a.push(f); };
  if(m.y==='inspect') push(crit,'m_wrong_y');
  const od=m.opdef;
  if(['unit','crit','method','who','opp'].some(k=>!od[k])) push(crit,'opdef_incomplete');
  if(od.crit&&od.crit.v==='vague') push(crit,'opdef_vague');
  if(od.crit&&od.crit.v==='blame') push(crit,'opdef_blame');
  if(od.opp&&od.opp.v==='inflate') push(crit,'opdef_inflate');
  if(od.unit&&od.unit.v==='unit') push(minor,'opdef_unit');
  if((od.method&&od.method.v==='method')||(od.who&&od.who.v==='method')) push(minor,'opdef_method');
  if(m.msa){ if(m.msa.agree<90&&m.msa.proceeded) push(crit,'msa_fail'); if(m.msa.playerErr>2) push(minor,'msa_assessor'); }
  const p=m.plan;
  if(['where','sample','owner'].some(k=>!p[k])) push(crit,'plan_incomplete');
  if(p.where&&p.where.v==='gate'&&m.y!=='inspect') push(crit,'plan_gate_only');
  if(p.where&&p.where.v==='returns') push(minor,'plan_over');
  if((p.sample&&p.sample.v==='bias')||(p.owner&&p.owner.v==='bias')) push(crit,'plan_bias');
  if(p.sample&&p.sample.v==='over') push(minor,'plan_over');
  if(m.strat.includes('blame')) push(crit,'plan_bias');
  if(m.strat.filter(x=>x!=='blame').length<2) push(minor,'plan_nostrat');
  if(m.collect.cherry) push(crit,'data_cherry');
  if(m.collect.luna==='mixed') push(minor,'data_mixed');
  const b=m.base;
  if(b.dpu&&b.dpu.v!=='ok') push(crit,'base_wrong');
  if(b.dpmo&&b.dpmo.v==='inflate') push(crit,'base_inflate');
  if(b.sigma&&b.sigma.v!=='ok') push(minor,'base_sigma');
  const vital=m.pareto.vital.slice().sort().join(','), okSets=['lumpy,smile','lumpy,seam,smile'];
  if(m.pareto.vital.length&&!okSets.includes(vital)) push(minor,'pareto_wrong');
  const obs=CHART_OBS(), picks=m.chart||[];
  if(picks.some(i=>obs[i]&&obs[i].cause)) push(crit,'chart_cause');
  if(picks.filter(i=>obs[i]&&obs[i].ok).length<3) push(minor,'chart_missed');
  if(measureLate()) push(minor,'m_late');
  return {crit,minor};
}
window.__evalM=evalMeasure;

/* ---------- scoring ---------- */
function scoreDefine(){
  if(S.scoreDefine!=null) return S.scoreDefine;
  const base=S.rating==='S'?100:(S.rating==='C'?55:80);
  S.scoreDefine=Math.max(0,base-4*(S.consults||0)-3*Math.ceil(Math.max(0,daysUsed()-DEFINE_DAYS)));
  return S.scoreDefine;
}
function scoreBadge(){ const parts=[scoreDefine()]; if(M().scoreMeasure!=null) parts.push(M().scoreMeasure); if(S.a&&S.a.scoreAnalyze!=null) parts.push(S.a.scoreAnalyze); if(S.i&&S.i.scoreImprove!=null) parts.push(S.i.scoreImprove); if(S.c&&S.c.scoreControl!=null) parts.push(S.c.scoreControl); return `<span class="pill">${L('🏆 Project score','🏆 プロジェクト得点')}: ${parts.length>1?parts.join(' + ')+' = '+parts.reduce((x,y)=>x+y,0):parts[0]}</span>`; }

/* ---------- SVG run chart ---------- */
function runChartSVG(){
  const W=560,H=200,pad=34, xs=i=>pad+i*((W-2*pad)/(CHART_WEEKS.length-1)), ys=v=>H-pad-(v-3)/(7.5-3)*(H-2*pad);
  const pts=CHART_WEEKS.map((v,i)=>`${xs(i)},${ys(v)}`).join(' ');
  const avg=CHART_WEEKS.reduce((a,b)=>a+b,0)/CHART_WEEKS.length;
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#fff;border-radius:12px;border:2px solid #e6dcff">
    <line x1="${pad}" y1="${ys(avg)}" x2="${W-pad}" y2="${ys(avg)}" stroke="#c9b8ff" stroke-dasharray="4 4"/>
    <text x="${W-pad}" y="${ys(avg)-4}" font-size="10" text-anchor="end" fill="#9a7dff">avg ${avg.toFixed(1)}%</text>
    <polyline points="${pts}" fill="none" stroke="#ff7fb0" stroke-width="2.5"/>
    ${CHART_WEEKS.map((v,i)=>`<circle cx="${xs(i)}" cy="${ys(v)}" r="4" fill="${v>6?'#d81b60':'#ff7fb0'}"/><text x="${xs(i)}" y="${H-pad+14}" font-size="9" text-anchor="middle" fill="#8a7a8e">w${i+1}</text>`).join('')}
    <text x="${pad}" y="14" font-size="11" fill="#5a4a5e">${L('Escaped-defect rate by week (%)','週ごとの流出不良率（%）')}</text>
    <text x="${W-pad}" y="14" font-size="10" text-anchor="end" fill="#8a7a8e">${L('◆ w5, w9 = humid','◆ 週5・9 = 多湿')}</text>
  </svg>
  <div class="preview" style="margin-top:8px;font-size:12.5px"><b>${L('Stratified view','層別')}</b> · ${L('Night 4.7% vs Day 4.9%','夜勤 4.7% / 日勤 4.9%')} · ${L('Machine 3 before lunch 4.1% / after 6.2%','マシン3 昼前 4.1% / 昼後 6.2%')} · ${L('Machines 1,2,4 ≈ 4.3%','マシン1,2,4 ≈ 4.3%')}</div>`;
}

/* ===================================================================
   SCENES
   =================================================================== */
Object.assign(SCENES,{

m_card(){
  renderTracker(-1); banner(null); drawScene();
  $('avatar').innerHTML=''; $('speaker').textContent=''; $('text').innerHTML=''; interact('');
  musicTrack('intro');
  const old=$('chapcard'); if(old) old.remove();
  const cast=['penny','luna','uni'].map(id=>`<div class="cc-av">${ART[id]||''}</div>`).join('');
  document.body.insertAdjacentHTML('beforeend',`<div class="chapter-card" id="chapcard">
    <div class="cc-ch">${L('Chapter 2','第2章')}</div>
    <div class="cc-def">${L('MEASURE','MEASURE（測定）')}</div>
    <div class="cc-tag">${L('Trust nothing you have not measured — including your measurer.','測っていないものは信じるな——測る人も含めて。')}</div>
    <div class="cc-cast">${cast}</div>
    <div class="cc-skip">${L('tap to continue ▸','タップで進む ▸')}</div>
  </div>`);
  let done=false;
  const proceed=()=>{ if(done) return; done=true; clearTimeout(tmr); const c=$('chapcard');
    const fin=()=>{ if(c) c.remove(); musicTrack('main'); go('m_intro'); };
    if(c){ c.classList.add('ccout'); setTimeout(fin,420);} else fin(); };
  const tmr=setTimeout(proceed,2600); $('chapcard').onclick=proceed;
},

m_intro(){
  useMeasureTracker(0); drawWarroom(); banner(L('MEASURE · Day one','MEASURE · 初日'));
  const c=carry(), m=M();
  narrate(L('The war room again — but the corkboard has been wiped. Your Define charter is pinned in the center like a treaty, and under it Uni has written one word: PROVE.',
    'ふたたび作戦室——だがコルクボードは一掃されている。中央にDefineのチャーターが条約のように留められ、その下にユニが一言書いている：「証明せよ」。'));
  const recap = c.rating==='S'
    ? L('The Empress is still talking about your Define. Do not let it go to your head — Measure is where confident people get humbled by numbers.','皇帝はまだきみのDefineの話をしている。調子に乗らないで——Measureは自信家が数字に謙虚にされる場所だ。')
    : (c.rating==='C'? L('Define cost us more than it should have. The Empress has noticed the calendar. Measure must be tight.','Defineは必要以上に高くついた。皇帝は暦を見ている。Measureは引き締めていこう。')
                     : L('Define passed with red ink; the Empress is watching for whether you learned from it.','Defineは赤字つきで合格。皇帝は、きみがそこから学んだかを見ている。'));
  say(nm('Uni the Unicorn'),'uni',
    L(`Welcome to MEASURE, Green Belt. ${recap} The calendar continues — the Empress allows us until day ${MEASURE_DEADLINE} in total, and you are on day ${fmtDays(daysUsed())}. Here is the whole phase in one sentence: before you can improve a number you must be able to TRUST it — the definition, the gauge, the sample, and the arithmetic. Six deliverables. Then the dragon.`,
      `MEASUREへようこそ、グリーンベルト。${recap} 暦は続いている——皇帝が許すのは通算${MEASURE_DEADLINE}日目まで、今は${fmtDays(daysUsed())}日目だ。この段階を一文で言うと：数字を改善する前に、その数字を「信頼できる」状態にすること——定義、計器、サンプル、そして計算。成果物は6つ。そのあとに竜だ。`),()=>{
    interact(`<div class="feedback info">📜 <b>${L('Measure deliverables','Measureの成果物')}:</b> ${L('operational definition · measurement system analysis · data collection plan · baseline (DPMO & sigma) · Pareto of defect types · first-look chart reading. Then the Measure tollgate.','運用上の定義・測定システム分析・データ収集計画・ベースライン（DPMOとシグマ）・不良種別のパレート・最初のチャート読み。そしてMeasureのトールゲート。')}</div>
      <div style="margin:6px 0">${scoreBadge()}</div>
      <button class="btn" id="nx">${L('Re-check the Y ✦','Yを再確認 ✦')}</button>`);
    $('nx').onclick=()=>go('m_ycheck');
  });
},

/* ---- 1. re-validate the primary metric against the customer ---- */
m_ycheck(){
  useMeasureTracker(0); drawBackdrop('scene_care'); banner(L('Step 1 · Re-check the Y','ステップ1 · Yの再確認'));
  const c=carry(), m=M();
  narrate(L('A letter waits on Miko’s desk, addressed to “the person measuring things”. Ms. Sakura’s handwriting slants like a raised eyebrow.',
    'ミコの机に手紙が待っている。宛名は「測っている人へ」。サクラさんの筆跡は、上がった眉のように傾いている。'));
  if(c.metricOk){
    m.y='field';
    say(nm('Miko Cat'),'miko:delighted',
      L('*waves the letter* Ms. Sakura writes that she is "prepared to be measured" — her words — because your charter counts what reaches her shelves, not what our gate flags. Nya! She likes you. That never happens.',
        '*手紙を振る* サクラさんは「測られる覚悟がある」と書いてきたよ——本人の言葉ね——きみのチャーターが、門で弾いた数じゃなく棚に届く数を数えてるから。ニャ！気に入られてる。珍しいことだよ。'),()=>{
      addCards(['mx_letter']);
      interact(`<div class="feedback good">✅ ${L('Your Y — the defect rate reaching customers — survives contact with the customer. Measure it.','きみのY——顧客に届く不良率——は顧客との接触に耐えた。これを測ろう。')}</div>
        <button class="btn" id="nx">${L('Define the defect ✦','不良を定義する ✦')}</button>`);
      $('nx').onclick=()=>go('m_opdef');
    });
  } else {
    say(nm('Miko Cat'),'miko:dramatic',
      L(`*reads aloud, wincing* "Your inspectors may be catching more — my shelves are not feeling it. Returns are STILL nearly one in twenty." …Your charter measures the ${c.metricKind==='time'?'shipping SPEED':'inspection CATCH rate'}, nya. She is measuring something else entirely.`,
        `*顔をしかめて読み上げる* 「検査員は多く見つけているのかもしれませんが、私の棚は何も感じていません。返品はいまだにほぼ20に1つです。」…きみのチャーターは${c.metricKind==='time'?'出荷スピード':'検査の検出率'}を測ってるのニャ。彼女が測ってるのは、まったく別のもの。`),()=>{
      addCards(['mx_letter']);
      interact(`<div class="feedback badf">⚠ ${L('Your Define charter’s primary metric does not match what the customer feels. You can correct the Y now — it costs two days and a rewritten baseline plan — or carry it into Measure.','Defineチャーターの主要指標が、顧客の感じているものと一致していない。今Yを直せば2日と計画の書き直しで済む——このままMeasureに持ち込むこともできる。')}</div>
        <div class="choices">
          ${vc('y_fix',L('Correct the Y now','今Yを直す'),L('Switch to the defect rate REACHING CUSTOMERS. Two days lost; the right number measured.','「顧客に届く不良率」に切り替える。2日を失うが、正しい数を測る。'))}
          ${vc('y_keep',L('Keep the charter as written','チャーターのまま進む'),L('The Empress approved it. Changing it now looks indecisive.','皇帝が承認したもの。今変えるのは優柔不断に見える。'))}
        </div>`);
      $('y_fix').onclick=()=>{
        S.daysLost+=2; m.y='field';
        if(!c.hasField){ addCards(['p_field']); }
        say(nm('Uni the Unicorn'),'uni:stern',L('Two days, and a bruised ego. Cheap. A wrong Y measured perfectly is the most expensive mistake in this building — you just avoided it. Miko has released the returns figures; the returns desk is now a measurement point.',
          '2日と、少し傷ついたプライド。安いものだ。正確に測った間違ったYは、この建物で最も高くつく失敗——きみは今それを避けた。ミコが返品の数字を出してくれた。返品デスクが測定点になる。'),()=>{
          interact(`<button class="btn" id="nx">${L('Define the defect ✦','不良を定義する ✦')}</button>`); $('nx').onclick=()=>go('m_opdef'); });
      };
      $('y_keep').onclick=()=>{
        m.y='inspect';
        say(nm('Uni the Unicorn'),'uni:concerned',L('…As you wish. I said I would not check your work before the review. I am not checking. I am merely blinking rather a lot.',
          '…好きにするといい。審査の前には口を出さないと言ったからね。出してはいない。ただ、まばたきがかなり多くなっているだけだ。'),()=>{
          interact(`<button class="btn" id="nx">${L('Define the defect ✦','不良を定義する ✦')}</button>`); $('nx').onclick=()=>go('m_opdef'); });
      };
    });
  }
},

/* ---- 2. operational definition ---- */
m_opdef(){
  useMeasureTracker(1); drawWarroom(); addHelpBadge('opdef'); banner(L('Deliverable 1 · Operational definition','成果物1 · 運用上の定義'));
  const m=M(), c=carry();
  if(c.ctqSmileOk && !S.have.includes('mx_gauge')) addCards(['mx_gauge']);
  narrate(L('Penny has left a pull-test gauge on the table with a note: "Numbers, not adjectives." Someone — probably Capy — has added a smiley face.',
    'ペニーがテーブルに引張試験ゲージを置いていった。メモ付き：「形容詞でなく数字を」。誰か——たぶんカピー——がスマイルを描き足している。'));
  say(nm('Uni the Unicorn'),'uni',
    L('An operational definition lets a stranger with a gauge reach the same verdict you would: WHAT unit, WHAT threshold, HOW measured, by WHOM, and how many OPPORTUNITIES per unit. Every soft word in it becomes a disagreement between inspectors — and we are about to test exactly that. One warning: there is a famous way to make a bad process look good on paper. Do not take it.',
      '運用上の定義とは、計器を持った見知らぬ人がきみと同じ判定に至れるもの：どの「単位」、どの「しきい値」、「どう」測り、「誰が」測り、単位あたりの「機会」はいくつか。曖昧な言葉はすべて検査員同士の食い違いになる——そして、まさにそれをこれから試す。ひとつ警告：悪い工程を紙の上で良く見せる有名な手口がある。手を出さないように。'),()=>{
    rowPicker({store:m.opdef,rows:OPDEF_ROWS(),lockId:'lockod',help:'opdef',
      lockLabel:L('Lock the operational definition ✦','運用上の定義を確定 ✦'),
      preview:()=>`<div class="preview"><b>${L('DEFECT =','不良 =')}</b> ${m.opdef.crit.t} · ${L('unit:','単位：')} ${m.opdef.unit.t} · ${m.opdef.method.t} · ${m.opdef.who.t} · ${L('opportunities:','機会数：')} ${m.opdef.opp.t}</div>`,
      onLock:()=>{ m.done.opdef=true; if(S.reworkMode){ go('m_rework'); return; } tickHalfDay(); go('m_msa'); }});
  });
},

/* ---- 3. measurement system analysis (attribute agreement) ---- */
m_msa(){
  useMeasureTracker(2); drawBackdrop('scene_qa'); banner(L('Deliverable 2 · Measurement System Analysis','成果物2 · 測定システム分析'));
  const m=M(); const od=m.opdef; const critOk=od.crit&&od.crit.v==='ok';
  narrate(L('Twelve plushies on Penny’s bench, numbered with masking tape. Penny and Luna have already rated them in sealed envelopes. Now it is your turn — with the definition you wrote.',
    'ペニーの作業台に12体のぬいぐるみ。マスキングテープで番号付き。ペニーとルナはすでに判定を封筒に入れた。次はきみの番——きみが書いた定義で。'));
  say(nm('Penny Penguin'),'penny:stern',
    L('An attribute agreement study. Three assessors, twelve units, one definition. If we do not agree at least nine times in ten, your data will measure US, not the process. Rate each one — PASS or DEFECT — exactly by the definition. Not by cuteness. Not by the tag.',
      '属性一致性分析よ。評価者3人、12体、定義は1つ。10回中9回以上一致しなければ、きみのデータが測るのは「工程」ではなく「私たち」になる。1体ずつ判定して——PASSかDEFECTか——定義どおりに。かわいさではなく。タグでもなく。'),()=>{
    m.msa={ratings:{},agree:0,proceeded:false,playerErr:0};
    render();
  });
  function render(){
    const cards=MSA_CARDS.map((cd,i)=>{
      const r=m.msa.ratings[i];
      return `<div class="notecard" style="cursor:default"><b>#${i+1}</b> ${L('seam gap','縫い目の隙間')}: <b>${cd.gap.toFixed(1)} mm</b>${cd.note?` · <i>${cd.note}</i>`:''}
        <div style="margin-top:6px;display:flex;gap:6px">
          <button class="chip ${r==='P'?'on':''}" data-i="${i}" data-r="P">PASS</button>
          <button class="chip ${r==='D'?'on':''}" data-i="${i}" data-r="D">DEFECT</button></div></div>`;
    }).join('');
    const all=Object.keys(m.msa.ratings).length===MSA_CARDS.length;
    interact(`<div class="feedback info" style="font-size:12.5px">📏 ${L('Your definition:','きみの定義：')} <b>${od.crit?od.crit.t:L('(none written)','（未記入）')}</b></div>
      <div class="cardpool">${cards}</div>
      <button class="btn" id="msago" ${all?'':'disabled'}>${L('Open the envelopes ✦','封筒を開ける ✦')}</button>`);
    document.querySelectorAll('.chip[data-r]').forEach(b=>b.onclick=()=>{ m.msa.ratings[b.dataset.i]=b.dataset.r; render(); });
    const go_=$('msago'); if(go_) go_.onclick=results;
  }
  function results(){
    const truth=MSA_CARDS.map(cd=>cd.gap>=2.0?'D':'P');
    const penny=truth.map((t,i)=>critOk?t:( [2,5,6].includes(i)?(t==='D'?'P':'D'):t ));
    const luna =truth.map((t,i)=>critOk?( i===5?'P':t ):( [2,4,5,11].includes(i)?(t==='D'?'P':'D'):t ));
    const you=MSA_CARDS.map((_,i)=>m.msa.ratings[i]);
    let agreeAll=0; m.msa.playerErr=0;
    truth.forEach((t,i)=>{ if(you[i]!==t) m.msa.playerErr++; if(you[i]===t&&penny[i]===t&&luna[i]===t) agreeAll++; });
    m.msa.agree=Math.round(agreeAll/truth.length*100);
    const rows=truth.map((t,i)=>`<tr><td>#${i+1}</td><td>${MSA_CARDS[i].gap.toFixed(1)}</td><td>${t}</td><td style="color:${you[i]===t?'#2f8f66':'#c04a60'}">${you[i]}</td><td style="color:${penny[i]===t?'#2f8f66':'#c04a60'}">${penny[i]}</td><td style="color:${luna[i]===t?'#2f8f66':'#c04a60'}">${luna[i]}</td></tr>`).join('');
    const pass=m.msa.agree>=90;
    say(nm('Penny Penguin'),pass?'penny:pleased':'penny:stern',
      pass? L(`${m.msa.agree}% agreement. The definition holds: three assessors, one verdict. Now — and only now — the numbers you collect will mean something.`,`一致率${m.msa.agree}%。定義は機能している：評価者3人、判定は1つ。今——今こそ——集める数字に意味が生まれる。`)
          : L(`${m.msa.agree}% agreement. *removes spectacles* Luna and I disagreed on a third of these because your definition left room to disagree. Collect data with THIS gauge and you will be measuring our moods.`,`一致率${m.msa.agree}%。*眼鏡を外す* ルナと私で3分の1が食い違った——きみの定義に、食い違う余地があったから。この「計器」でデータを集めれば、測るのは私たちの気分よ。`),()=>{
      interact(`<div class="preview" style="overflow-x:auto"><table class="hoq"><tr><th>#</th><th>mm</th><th>${L('Truth','正')}</th><th>${L('You','あなた')}</th><th>Penny</th><th>Luna</th></tr>${rows}</table>
        <div style="margin-top:6px"><b>${L('All-three agreement:','3者一致：')} ${m.msa.agree}%</b> ${pass?'✅':'❌'} · ${L('your own errors:','あなたの誤判定：')} ${m.msa.playerErr}</div></div>`+
        (pass?`<button class="btn" id="nx">${L('Plan the data collection ✦','データ収集を計画 ✦')}</button>`:
        `<div class="choices">
          ${vc('msa_fix',L('Fix the definition & re-run','定義を直して再実施'),L('Half a day. The right move.','半日。正しい選択。'))}
          ${vc('msa_go',L('Proceed anyway','このまま進む'),L('The calendar is tight. Maybe the data will be fine.','暦が厳しい。データは大丈夫かもしれない。'))}
        </div>`));
      const nx=$('nx'); if(nx) nx.onclick=()=>{ m.done.msa=true; if(S.reworkMode){ go('m_rework'); return; } tickHalfDay(); go('m_plan'); };
      const fx=$('msa_fix'); if(fx) fx.onclick=()=>{ tickHalfDay(); m.msaTries++; m.done.opdef=false; go('m_opdef'); };
      const gg=$('msa_go'); if(gg) gg.onclick=()=>{ m.msa.proceeded=true; m.done.msa=true; if(S.reworkMode){ go('m_rework'); return; } tickHalfDay(); go('m_plan'); };
    });
  }
},

/* ---- 4. data collection plan ---- */
m_plan(){
  useMeasureTracker(3); drawWarroom(); addHelpBadge('plan'); banner(L('Deliverable 3 · Data collection plan','成果物3 · データ収集計画'));
  const m=M();
  narrate(L('A blank collection form, a calendar, and a map of the line with three possible measurement points circled in pencil.',
    '白紙の収集用紙、カレンダー、そして鉛筆で3つの測定候補点に丸をつけたラインの図。'));
  say(nm('Uni the Unicorn'),'uni',
    L('A plan answers: WHERE the Y is caught, HOW MANY units, sampled HOW, tagged with WHICH factors, collected by WHOM. Sample where the Y lives. Sample randomly or inherit a bias forever. And tag every row with the factors you learned about in your interviews — the ones you did not learn, you cannot tag.',
      '計画が答えるのは：Yを「どこで」捉え、「何体」を、「どう」抜き取り、「どの要因」でタグ付けし、「誰が」集めるか。Yが住む場所で抜き取ること。無作為に抜き取らなければ、偏りを永遠に引き継ぐ。そして、聞き取りで学んだ要因で全行にタグを——学ばなかったものにはタグは付けられない。'),()=>{
    rowPicker({store:m.plan,rows:PLAN_ROWS(),lockId:'lockplan',help:'plan',
      lockLabel:L('Lock the plan ✦','計画を確定 ✦'),
      note:stratHtml,afterRender:wireStrat,
      onLock:()=>{ m.done.plan=true; if(S.reworkMode){ go('m_rework'); return; } tickHalfDay(); go('m_collect'); }});
  });
  function stratHtml(){
    const pool=STRAT_POOL();
    return `<div class="obj-row"><span class="lbl">${L('Stratification tags (pick all that apply)','層別タグ（該当をすべて）')}</span><div class="obj-opts">${
      pool.map(p=>`<div class="chip ${m.strat.includes(p.id)?'on':''}" data-st="${p.id}">${p.t}</div>`).join('')}</div></div>`;
  }
  function wireStrat(){
    document.querySelectorAll('.chip[data-st]').forEach(ch=>ch.onclick=()=>{
      const id=ch.dataset.st; m.strat=m.strat.includes(id)?m.strat.filter(x=>x!==id):m.strat.concat(id); ch.classList.toggle('on'); });
  }
},

/* ---- 5. collection montage ---- */
m_collect(){
  useMeasureTracker(4); drawBackdrop('scene_floor'); banner(L('Collecting · the data comes in','収集 · データが集まる'));
  const m=M(), c=carry();
  const days = m.plan.sample ? ({ok:3,bias:1,over:6}[m.plan.sample.v]||3) : 3;
  for(let i=0;i<days*2;i++) tickHalfDay();
  narrate(L(`${days} days of clipboards, gauges and tally marks. The line hums. Envelopes arrive from three desks — and one letter from the Emporium.`,
    `クリップボードと計器と正の字の${days}日間。ラインが唸る。3つの机から封筒が届く——そして百貨店から手紙が1通。`));
  say(nm('Luna Axolotl'),'luna:thoughtful',
    L('*slides over her night tallies* Here are my sheets. I marked "loose" my own way — a tug with two fingers. Not your gauge. Do you want them as they are, or shall I re-code them to your definition? Re-coding takes me a night.',
      '*夜勤の集計表を差し出す* これが私の表。「緩い」は私流——指2本で引っ張った感触。あなたの計器じゃない。このまま使う？それとも定義に合わせて再コード化する？再コード化には一晩かかる。'),()=>{
    interact(`<div class="choices">
      ${vc('lu_re',L('Re-code to the definition','定義に合わせて再コード化'),L('Half a day. One dataset, one rule.','半日。1つのデータ、1つのルール。'))}
      ${vc('lu_as',L('Use them as they are','そのまま使う'),L('Close enough — and we are behind.','だいたい同じだし、遅れている。'))}
    </div>`);
    $('lu_re').onclick=()=>{ m.collect.luna='ok'; tickHalfDay(); capyEvent(); };
    $('lu_as').onclick=()=>{ m.collect.luna='mixed'; capyEvent(); };
  });
  function capyEvent(){
    say(nm('Captain Capy'),'capy:worried',
      L('Er — small thing. Week five was the humid week, everything went a bit wrong, the numbers are ugly. It is clearly an OUTLIER. Could we… leave that week out? Just to be fair to the line?',
        'えっと——ちょっとしたことなんだけど。第5週は湿気がひどくて、何もかもうまくいかなくて、数字が悲惨で。明らかに「外れ値」だよね。その週だけ…外せないかな？ラインのために公平に、さ？'),()=>{
      interact(`<div class="choices">
        ${vc('cp_keep',L('Keep every week','全週を残す'),L('“Outliers get investigated, Capy. Not deleted.”','「外れ値は調べるものだよ、カピー。消すものじゃない。」'))}
        ${vc('cp_drop',L('Drop week five','第5週を外す'),L('It really was unusual. The baseline will look more typical.','本当に異常だった。ベースラインはより典型的になる。'))}
      </div>`);
      $('cp_keep').onclick=()=>{ m.collect.cherry=false; sakuraEvent(); };
      $('cp_drop').onclick=()=>{ m.collect.cherry=true; sakuraEvent(); };
    });
  }
  function sakuraEvent(){
    const late=!c.sakuraClose;
    if(late) S.daysLost+=1;
    say(nm('Miko Cat'),late?'miko:dramatic':'miko:delighted',
      late? L('The Emporium’s returns sheet… finally. Ms. Sakura sent it a day late with a note: "Had I known this mattered to you, I would have hurried." Nya. She did not feel managed.',
              '百貨店の返品シート…やっと。サクラさんは1日遅れで、メモ付きで送ってきた：「私にとって大事だと知っていれば急ぎましたのに」。ニャ。「管理されている」と感じてなかったんだね。')
          : L('The Emporium’s returns sheet, on the dot — Ms. Sakura even sorted it by week. "For the one who listens," the note says. Nya, she is practically PURRING.',
              '百貨店の返品シート、きっかり時間どおり——サクラさん、週ごとに整理までしてくれた。「聞く耳のある方へ」ってメモ付き。ニャ、ほとんどゴロゴロ言ってるよ。'),()=>{
      addCards(['mx_counts','mx_pareto']);
      interact(`<div class="preview"><b>${L('4-WEEK WINDOW','4週間の集計')}</b><br>${L('Produced','生産')}: 4,576 · ${L('Caught at gate','門で検出')}: 576 · ${L('Shipped','出荷')}: 4,000 · ${L('Returned defective','不良返品')}: 192${m.collect.cherry?` <i style="color:#c48a3a">(${L('week 5 removed by request','要請により第5週を除外')})</i>`:''}</div>
        <button class="btn" id="nx">${L('Compute the baseline ✦','ベースラインを計算 ✦')}</button>`);
      $('nx').onclick=()=>go('m_baseline');
    });
  }
},

/* ---- 6. baseline: DPU → DPMO → sigma ---- */
m_baseline(){
  useMeasureTracker(5); drawWarroom(); banner(L('Deliverable 4 · Baseline','成果物4 · ベースライン'));
  const m=M(); const infl=m.opdef.opp&&m.opdef.opp.v==='inflate';
  narrate(L('Penny’s adding machine, a sigma conversion table, and four numbers that refuse to be the same number.','ペニーの計算機、シグマ換算表、そして「同じ数字」になることを拒む4つの数。'));
  say(nm('Penny Penguin'),'penny:stern',
    L('Show me the arithmetic. DPU: defects per unit — which defects, which units? Then DPMO: DPU divided by opportunities per unit, times a million. Then read the sigma level off the table. Every wrong choice here is invisible on paper and fatal in the review.',
      '計算を見せて。DPU：単位あたり不良——どの不良、どの単位？次にDPMO：DPUを単位あたり機会数で割って100万倍。そして表からシグマ水準を読む。ここでの間違いは紙の上では見えず、審査では致命的よ。'),()=>{
    const rows=[
      {k:'dpu',lbl:L('DPU = defects ÷ units','DPU = 不良数 ÷ 単位数'),opts:[
        {t:'192 ÷ 4,000 = 0.048',v:'ok'},{t:'576 ÷ 4,576 = 0.126',v:'gate'},{t:'192 ÷ 4,576 = 0.042',v:'mixwin'},{t:'576 ÷ 4,000 = 0.144',v:'gate'}]},
      {k:'dpmo',lbl:L('DPMO = DPU ÷ opportunities × 1,000,000','DPMO = DPU ÷ 機会数 × 1,000,000'),opts:[
        {t:'0.048 ÷ 1 × 1e6 = 48,000',v:'ok'},{t:'0.048 ÷ 12 × 1e6 = 4,000',v:'inflate'},{t:'0.126 ÷ 1 × 1e6 = 126,000',v:'gate'}]},
      {k:'sigma',lbl:L('Sigma level (with 1.5σ shift)','シグマ水準（1.5σシフト込み）'),opts:[
        {t:L('≈ 3.2σ (48,000 DPMO)','≈ 3.2σ（48,000 DPMO）'),v:'ok'},{t:L('≈ 4.2σ (4,000 DPMO)','≈ 4.2σ（4,000 DPMO）'),v:'infl'},{t:L('≈ 2.6σ (126,000 DPMO)','≈ 2.6σ（126,000 DPMO）'),v:'gate'},{t:'≈ 6σ',v:'wish'}]},
    ];
    rowPicker({store:m.base,rows,lockId:'lockbase',lockLabel:L('Lock the baseline ✦','ベースラインを確定 ✦'),
      note:infl?`<div class="feedback tip">${L('Your definition counts 12 opportunities per plushie. The arithmetic below will happily use it.','きみの定義は1体あたり12の機会を数えている。下の計算はそれを喜んで使うだろう。')}</div>`:'',
      preview:()=>`<div class="preview"><b>${L('BASELINE','ベースライン')}:</b> DPU ${m.base.dpu.t.split('=')[1]} · DPMO ${m.base.dpmo.t.split('=')[1]} · ${m.base.sigma.t} · ${L('yield','歩留まり')} ${m.base.dpu.v==='ok'?'95.2%':'?'}</div>`,
      onLock:()=>{ m.done.base=true; if(S.reworkMode){ go('m_rework'); return; } tickHalfDay(); go('m_pareto'); }});
  });
},

/* ---- 7. pareto ---- */
m_pareto(){
  useMeasureTracker(6); drawWarroom(); banner(L('Deliverable 5 · Pareto of defect types','成果物5 · 不良種別のパレート'));
  const m=M(); m.pareto={order:[],vital:[]};
  narrate(L('Five defect categories coded from the returns ledger. Uni hands you five strips of paper and a glue stick.','返品台帳からコード化した5つの不良カテゴリ。ユニが5枚の紙片とスティックのりを渡してくる。'));
  say(nm('Uni the Unicorn'),'uni',
    L('Order the bars from most to least, then choose the VITAL FEW — the categories that together explain most of the pain. Pareto is where a project stops boiling the ocean.',
      '棒を多い順に並べ、そして「重要な少数」を選ぶ——合わせて痛みの大部分を説明するカテゴリだ。パレートは、プロジェクトが「海を沸かす」のをやめる場所だよ。'),()=>{
    render();
  });
  function render(){
    const total=PARETO.reduce((a,b)=>a+b.n,0);
    const remaining=PARETO.filter(p=>!m.pareto.order.includes(p.k));
    const bars=m.pareto.order.map((k,i)=>{const p=PARETO.find(x=>x.k===k); return `<div class="flow-step"><span class="num">${i+1}</span>${p.t} — ${p.n}</div>`;}).join('');
    const pick=remaining.map(p=>`<div class="chip" data-p="${p.k}">${p.t} (${p.n})</div>`).join('');
    let html=(m.pareto.order.length?paretoSVG(m.pareto.order):`<div class="preview" style="text-align:center;color:#8a7a8e">${L('📊 The chart draws itself as you place the bars.','📊 棒を置くごとにチャートが描かれる。')}</div>`)+
      `<div class="hint">${L('Click categories in order, largest first.','大きい順にカテゴリをクリック。')}</div><div class="flow-list">${bars}</div><div class="chip-pool">${pick}</div>`;
    if(!remaining.length){
      const cum=[]; let acc=0; m.pareto.order.forEach(k=>{acc+=PARETO.find(x=>x.k===k).n; cum.push(Math.round(acc/total*100));});
      html+=`<div class="preview"><b>${L('Cumulative %','累積%')}:</b> ${m.pareto.order.map((k,i)=>`${PARETO.find(x=>x.k===k).t} ${cum[i]}%`).join(' → ')} · ${L('pink bars reach 80% — the vital few','ピンクの棒で80%に届く——重要な少数')}</div>
        <div class="obj-row"><span class="lbl">${L('Vital few (select)','重要な少数（選択）')}</span><div class="obj-opts">${PARETO.map(p=>`<div class="chip ${m.pareto.vital.includes(p.k)?'on':''}" data-v="${p.k}">${p.t}</div>`).join('')}</div></div>
        <button class="btn" id="lockpar" ${m.pareto.vital.length?'':'disabled'}>${L('Lock the Pareto ✦','パレートを確定 ✦')}</button>`;
    }
    interact(html);
    document.querySelectorAll('.chip[data-p]').forEach(ch=>ch.onclick=()=>{ m.pareto.order.push(ch.dataset.p); render(); });
    document.querySelectorAll('.chip[data-v]').forEach(ch=>ch.onclick=()=>{ const k=ch.dataset.v; m.pareto.vital=m.pareto.vital.includes(k)?m.pareto.vital.filter(x=>x!==k):m.pareto.vital.concat(k); render(); });
    const lb=$('lockpar'); if(lb) lb.onclick=()=>{ m.done.pareto=true; if(S.reworkMode){ go('m_rework'); return; } go('m_chart'); };
  }
},

/* ---- 8. first look at the chart: observations, not causes ---- */
m_chart(){
  useMeasureTracker(7); drawWarroom(); banner(L('Deliverable 6 · First look','成果物6 · 最初のチャート読み'));
  const m=M(); m.chart=m.chart||[];
  narrate(L('The run chart is pinned up. Torto has drifted in "for the biscuits" and is staring at week nine like it owes him money.',
    'ランチャートが貼り出された。トルトが「ビスケット目当てで」ふらりと入ってきて、第9週を借金取りの目で睨んでいる。'));
  say(nm('Uni the Unicorn'),'uni:stern',
    L('Measure ends with a first look, not a verdict. Record what the chart SHOWS — when, where, how much. The moment you write WHY, you have left Measure and started guessing. Analyze will test the whys with data. Pick every true observation, and nothing else.',
      'Measureは「最初のひと目」で終わる。判決ではない。チャートが「示す」ことを記録する——いつ、どこで、どれだけ。「なぜ」を書いた瞬間、きみはMeasureを離れて推測を始めている。「なぜ」はAnalyzeがデータで検証する。正しい観察をすべて選び、それ以外は選ばないこと。'),()=>{
    const obs=CHART_OBS();
    const list=obs.map((o,i)=>`<div class="chip ${m.chart.includes(i)?'on':''}" data-o="${i}" style="display:block;margin:4px 0">${o.t}</div>`).join('');
    interact(runChartSVG()+`<div class="obj-row"><span class="lbl">${L('Observations to record','記録する観察')}</span><div class="obj-opts" style="display:block">${list}</div></div>
      <button class="btn" id="lockch">${L('Record the first look ✦','最初の観察を記録 ✦')}</button>`);
    document.querySelectorAll('.chip[data-o]').forEach(ch=>ch.onclick=()=>{ const i=+ch.dataset.o; m.chart=m.chart.includes(i)?m.chart.filter(x=>x!==i):m.chart.concat(i); ch.classList.toggle('on'); });
    $('lockch').onclick=()=>{ m.done.chart=true; addCards(['mx_chart']); if(S.reworkMode){ go('m_rework'); return; } tickHalfDay(); go('m_charter'); };
  });
},

m_charter(){
  drawBackdrop('scene_mill_night'); banner(L('The charter, updated','更新されたチャーター'));
  const m=M();
  narrate(L('Night again. The charter has a new line — a baseline with a number in it — and the number has a gauge behind it, a sample behind that, and three inspectors who agree.',
    'また夜。チャーターに新しい行——数字の入ったベースライン——その数字の背後には計器があり、その背後にはサンプルがあり、そして3人の検査員の一致がある。'));
  say(nm('Uni the Unicorn'),'uni',L('Tomorrow the Empress reviews Measure. She will ask one question in six different ways: can I trust this number? Sleep.','明日、皇帝がMeasureを審査する。彼女は1つの問いを6通りに聞いてくる：この数字を信頼できるか？ 眠って。'),()=>{
    interact(`<div class="preview"><b>${L('MEASURE SUMMARY','MEASURE要約')}</b><br>
      ${L('Y','Y')}: ${m.y==='field'?L('defect rate reaching customers','顧客に届く不良率'):L('inspection catch rate','検査の検出率')}<br>
      ${L('Defect =','不良 =')} ${m.opdef.crit?m.opdef.crit.t:'—'}<br>
      MSA: ${m.msa?m.msa.agree+'%':'—'} · ${L('Baseline','ベースライン')}: ${m.base.dpmo?m.base.dpmo.t.split('=')[1]+' DPMO':'—'} ${m.base.sigma?'· '+m.base.sigma.t:''}<br>
      ${L('Vital few','重要な少数')}: ${m.pareto.vital.map(k=>PARETO.find(x=>x.k===k).t).join(', ')||'—'}</div>
      ${scoreBadge()}
      <button class="btn" id="nx">${L('🌙 Sleep… then face the dragon','🌙 眠る…そして竜と対峙する')}</button>`);
    $('nx').onclick=()=>{ S.day++; S.half=0; go('m_tg_intro'); };
  });
},

/* ================= MEASURE TOLLGATE ================= */
m_tg_intro(){
  useMeasureTracker(8); drawBoardroom('reading'); banner(L('MEASURE TOLLGATE · The Empress','MEASUREトールゲート · 皇帝'));
  M().tgAttempts++;
  narrate(L('The boardroom. The tea service has been moved one inch to the left, which everyone agrees is a bad sign.','会議室。茶器が1インチ左にずらされている——全員が悪い兆候だと認めている。'));
  const late=measureLate();
  say(nm('Empress Scarlet'),'dragon:reading',
    L(`Day ${fmtDays(daysUsed())}. ${late?'Past the day I allowed. We will discuss that.':'Within the days I allowed. Noted.'} I have one question for this review, Green Belt, and I will ask it six ways: can I trust your number?`,
      `${fmtDays(daysUsed())}日目。${late?'許した期限を過ぎている。それも話そう。':'許した期限の内側だ。覚えておく。'} この審査で聞くことは1つだけだよ、グリーンベルト。それを6通りに聞く：きみの数字は信頼できるか？`),()=>{
    interact(`<button class="btn" id="nx">${L('Begin ✦','始める ✦')}</button>`); $('nx').onclick=()=>go('m_tg_opdef'); });
},
m_tg_opdef(){ tgPage('opdef',L('First: what IS a defect, in your charter? Read me the definition.','まず：きみのチャーターで「不良」とは何か。定義を読んで。'),
  r=>{ const b=[];
    if(r.crit.includes('m_wrong_y')) b.push(`<div class="feedback badf">🐉 ${L('"You measured what the GATE catches. Ms. Sakura wrote to you in week one that her shelves feel something else. You had the letter. You measured anyway."','「きみは門で捕まえたものを測った。サクラさんは第1週に、棚は別のものを感じていると書いてきた。手紙は手元にあった。それでも測った。」')}</div>`+coach('m_wrong_y'));
    if(r.crit.includes('opdef_incomplete')) b.push(`<div class="feedback badf">🐉 ${L('"Half a definition. Half a number, then."','「定義が半分。なら数字も半分だね。」')}</div>`+coach('opdef_incomplete'));
    if(r.crit.includes('opdef_vague')) b.push(`<div class="feedback badf">🐉 ${L('"Looks loose. LOOKS. To whom, at what hour, after how much tea?" A wisp of smoke. "A definition a stranger cannot apply is a mood."','「緩く見える。『見える』。誰に、何時に、お茶を何杯飲んだあとに？」一筋の煙。「見知らぬ人が適用できない定義は、気分だ。」')}</div>`+coach('opdef_vague'));
    if(r.crit.includes('opdef_blame')) b.push(`<div class="feedback badf">🐉 ${L('"A defect is a property of the plushie. You have made it a property of Luna."','「不良はぬいぐるみの性質だ。きみはそれをルナの性質にした。」')}</div>`+coach('opdef_blame'));
    if(r.crit.includes('opdef_inflate')) b.push(`<div class="feedback badf">🐉 ${L('"Twelve opportunities per plushie." She sets the page down very gently. "I have seen this trick from Belts older than you. Divide the pain by twelve and call it progress. The child received ONE broken toy, Green Belt."','「1体あたり12の機会。」彼女はページをとても静かに置く。「きみより年上のベルトたちがこの手口を使うのを見てきた。痛みを12で割って進歩と呼ぶ。子どもが受け取った壊れたおもちゃは『1つ』だよ、グリーンベルト。」')}</div>`+coach('opdef_inflate'));
    if(r.minor.includes('opdef_unit')) b.push(`<div class="feedback tip">${L('"A batch? The child does not hug a batch." Red ink.','「バッチ？子どもはバッチを抱きしめない。」赤インク。')}</div>`+coach('opdef_unit'));
    if(r.minor.includes('opdef_method')) b.push(`<div class="feedback tip">${L('"Eyeballs and volunteers. Sharpen the method before Analyze."','「目視と有志。Analyzeの前に方法を研いで。」')}</div>`+coach('opdef_method'));
    if(!b.length) b.push(`<div class="feedback good">${L('"Two millimetres, a thousand cycles, a gauge, trained hands, one opportunity." She almost nods. "A stranger could apply this. Good."','「2ミリ、1,000回、計器、訓練された手、機会は1つ。」彼女はほとんどうなずく。「見知らぬ人でも適用できる。よろしい。」')}</div>`);
    return b; },'m_tg_msa'); },
m_tg_msa(){ tgPage('msa',L('Second: your inspectors. Did they agree with each other — or merely with themselves?','次：きみの検査員たち。互いに一致したのか——それとも各自が自分とだけ一致したのか？'),
  r=>{ const b=[]; const m=M();
    if(r.crit.includes('msa_fail')) b.push(`<div class="feedback badf">🐉 ${L(`"${m.msa.agree} percent agreement, and you collected four weeks of data with that gauge anyway." Smoke. "Then four weeks of data measure Penny’s mood against Luna’s. I cannot fund a mood."`,`「一致率${m.msa.agree}パーセント。それでもきみはその計器で4週間分のデータを集めた。」煙。「なら4週間のデータが測ったのは、ペニーの気分対ルナの気分だ。気分には金を出せない。」`)}</div>`+coach('msa_fail'));
    if(r.minor.includes('msa_assessor')) b.push(`<div class="feedback tip">${L('"And you yourself misjudged several. The gauge, Green Belt. Not the gut."','「そしてきみ自身も何体か誤判定した。計器だよ、グリーンベルト。直感じゃない。」')}</div>`+coach('msa_assessor'));
    if(!b.length) b.push(`<div class="feedback good">${L(`"${m.msa?m.msa.agree:'—'} percent. Three assessors, one verdict. The gauge is real." She turns the page.`,`「${m.msa?m.msa.agree:'—'}パーセント。評価者3人、判定は1つ。計器は本物だ。」彼女はページをめくる。`)}</div>`);
    return b; },'m_tg_plan'); },
m_tg_plan(){ tgPage('plan',L('Third: the plan. Where, how many, sampled how, tagged with what.','3つ目：計画。どこで、何体、どう抜き取り、何でタグ付けしたか。'),
  r=>{ const b=[];
    if(r.crit.includes('plan_incomplete')) b.push(`<div class="feedback badf">🐉 ${L('"A plan with blanks collects blanks."','「空欄のある計画は空欄を集める。」')}</div>`+coach('plan_incomplete'));
    if(r.crit.includes('plan_gate_only')) b.push(`<div class="feedback badf">🐉 ${L('"Your Y reaches the customer. Your plan stops at the gate. Where, precisely, did you expect the escaped defects to volunteer themselves?"','「きみのYは顧客に届く。きみの計画は門で止まっている。流出した不良が、いったいどこで自己申告してくると思ったのかね？」')}</div>`+coach('plan_gate_only'));
    if(r.crit.includes('plan_bias')) b.push(`<div class="feedback badf">🐉 ${L('"Tuesday. Day shift. Capy’s favourites." She counts on her claws. "You have baselined a Tuesday."','「火曜日。日勤。カピーのお気に入り。」彼女は爪で数える。「きみは火曜日のベースラインを取ったんだね。」')}</div>`+coach('plan_bias'));
    if(r.crit.includes('data_cherry')) b.push(`<div class="feedback badf">🐉 ${L('"And week five is… missing. The humid week. Removed, I am told, to be FAIR to the line." The tea service rattles. "Outliers are where the truth hides, Green Belt. You deleted the truth for being rude."','「そして第5週が…ない。多湿の週。ラインに『公平』であるために外した、と聞いている。」茶器が鳴る。「外れ値は真実が隠れる場所だ、グリーンベルト。きみは真実を、無礼だという理由で消した。」')}</div>`+coach('data_cherry'));
    if(r.minor.includes('plan_nostrat')) b.push(`<div class="feedback tip">${L('"No shift, no machine, no week on the rows. Analyze will ask WHERE — and you will be back at midnight asking Luna."','「行にシフトもマシンも週もない。Analyzeは『どこで』と聞く——そしてきみは真夜中にルナに聞きに戻ることになる。」')}</div>`+coach('plan_nostrat'));
    if(r.minor.includes('plan_over')) b.push(`<div class="feedback tip">${L('"Ninety days of everything is not rigor; it is a calendar you do not have."','「90日の全数は厳密さではない。きみが持っていない暦だ。」')}</div>`+coach('plan_over'));
    if(r.minor.includes('data_mixed')) b.push(`<div class="feedback tip">${L('"Luna’s two-finger tug is now inside your gauge data. One dataset, two rules. Re-code it."','「ルナの指2本の引っ張りが、計器データの中に混ざっている。1つのデータに2つのルール。再コード化して。」')}</div>`+coach('data_mixed'));
    if(!b.length) b.push(`<div class="feedback good">${L('"Random. Across shifts and machines. At the returns desk as well as the gate. Every week kept — including the ugly one." A small hum.','「無作為。全シフト・全マシンにわたって。門だけでなく返品デスクでも。全週を保持——醜い週も含めて。」小さな唸り。')}</div>`);
    return b; },'m_tg_base'); },
m_tg_base(){ tgPage('base',L('Fourth: the arithmetic. Walk me from the counts to the sigma level.','4つ目：計算。数からシグマ水準まで案内して。'),
  r=>{ const b=[];
    if(r.crit.includes('base_wrong')) b.push(`<div class="feedback badf">🐉 ${L('"Your numerator is the gate. Your denominator is the factory. Your Y is the customer. Three different worlds in one fraction."','「分子は門。分母は工場。Yは顧客。1つの分数に3つの世界。」')}</div>`+coach('base_wrong'));
    if(r.crit.includes('base_inflate')) b.push(`<div class="feedback badf">🐉 ${L('"Four thousand DPMO. Four-point-two sigma." A pause you could hang a coat on. "Divided by twelve seams. Ms. Sakura returns whole plushies, Green Belt, not seams."','「4,000 DPMO。4.2シグマ。」コートを掛けられそうな間。「12の縫い目で割った。サクラさんが返品するのはぬいぐるみ丸ごとだ、グリーンベルト。縫い目ではない。」')}</div>`+coach('base_inflate'));
    if(r.minor.includes('base_sigma')) b.push(`<div class="feedback tip">${L('"Read the table, do not guess it." Red ink beside the sigma.','「表を読んで、当てずっぽうはやめて。」シグマの横に赤インク。')}</div>`+coach('base_sigma'));
    if(!b.length) b.push(`<div class="feedback good">${L('"One hundred ninety-two over four thousand. Forty-eight thousand DPMO. Three-point-two sigma." She writes the number on her own page. "I can build a project on this."','「4,000分の192。48,000 DPMO。3.2シグマ。」彼女は自分のページにその数字を書く。「これならプロジェクトを立てられる。」')}</div>`);
    return b; },'m_tg_chart'); },
m_tg_chart(){ tgPage('chart',L('Last: the Pareto, and your first look at the chart. Tell me what you SAW. Only that.','最後：パレートと、チャートの最初の観察。何を「見た」か言って。それだけを。'),
  r=>{ const b=[];
    if(r.minor.includes('pareto_wrong')) b.push(`<div class="feedback tip">${L('"Loose smiles and lumpy tummies are three-quarters of the returns. That is your vital few — not what you circled."','「笑顔の緩みとおなかのでこぼこで返品の4分の3。それが重要な少数だ——きみが丸をつけたものではなく。」')}</div>`+coach('pareto_wrong'));
    if(r.crit.includes('chart_cause')) b.push(`<div class="feedback badf">🐉 ${L('"‘Humidity CAUSES the defects.’" She reads it twice. "Does it? Prove it. …You cannot, because this is Measure, and you have already written the verdict of Analyze into its opening page."','「『湿度が不良の原因だ』。」彼女は2度読む。「そうなのか？証明して。…できないだろう。ここはMeasureで、きみはAnalyzeの判決をその最初のページに書いてしまったのだから。」')}</div>`+coach('chart_cause'));
    if(r.minor.includes('chart_missed')) b.push(`<div class="feedback tip">${L('"Two spikes. One machine after lunch. Night equal to day. You saw fewer than half of it."','「2つの山。昼食後に1台のマシン。夜勤と日勤は同じ。きみが見たのは半分以下だ。」')}</div>`+coach('chart_missed'));
    if(r.minor.includes('m_late')) b.push(`<div class="feedback tip">${L(`"And day ${fmtDays(daysUsed())}. I said ${MEASURE_DEADLINE}."`,`「そして${fmtDays(daysUsed())}日目。私は${MEASURE_DEADLINE}と言った。」`)}</div>`+coach('m_late'));
    if(!b.length) b.push(`<div class="feedback good">${L('"Spikes in the humid weeks. Machine 3 after lunch. Night equal to day. No trend." She closes the folder. "Observations. Not one guess among them. Analyze will thank you."','「多湿の週の山。昼食後のマシン3。夜勤と日勤は同じ。傾向なし。」彼女はフォルダを閉じる。「観察だ。推測は1つもない。Analyzeが感謝するだろう。」')}</div>`);
    return b; },'m_tg_verdict'); },
m_tg_verdict(){
  const r=evalMeasure(), m=M();
  if(r.crit.length===0){
    const honors=r.minor.length<=2&&m.tgAttempts===1&&!measureLate();
    setDragonMood(honors?'softened':'approving'); setPlayerMood('determined');
    say(nm('Empress Scarlet'),honors?'dragon:softened':'dragon:approving',
      honors? L('The verdict: PASSED. I asked six times whether I could trust your number, and six times the answer was a gauge, a sample, or a table. Proceed to Analyze — and take the humid weeks with you.','判決：合格。数字を信頼できるかと6回聞き、6回とも答えは計器か、サンプルか、表だった。Analyzeへ進みなさい——多湿の週を連れて。')
            : L('PASSED, with red ink. The number stands; the edges need sanding before Analyze. Approved.','合格——赤インクつきで。数字は立っている。Analyzeの前に端を研いで。承認。'),()=>{
      m.scoreMeasure=Math.max(0,(honors?100:80)-4*(S.consults||0)-3*Math.ceil(Math.max(0,daysUsed()-MEASURE_DEADLINE)));
      interact((r.minor.length?lessonList(r.minor):'')+`<button class="btn" id="nx">${L('Celebrate ✦','祝う ✦')}</button>`);
      $('nx').onclick=()=>go('m_epilogue');
    });
  } else {
    setDragonMood('furious'); shakeScene(); smokeBurst(4); setPlayerMood('nervous');
    say(nm('Empress Scarlet'),'dragon:furious',
      L('REJECTED — for now. A number I cannot trust is worse than no number: it will be quoted. One week of rework. Fix the foundations, not the paint.','却下——今のところは。信頼できない数字は、数字がないより悪い：引用されてしまうから。手戻り1週間。塗装ではなく土台を直しなさい。'),()=>{
      S.daysLost+=7; S.reworkMode=true;
      interact(lessonList(r.crit.concat(r.minor))+`<button class="btn" id="nx">${L('Face the rework week ✦','手戻りの週へ ✦')}</button>`);
      $('nx').onclick=()=>go('m_rework');
    });
  }
},

m_rework(){
  drawWarroom(); banner(L('REWORK WEEK · Measure','手戻り週 · Measure'));
  S.reworkMode=true;
  const r=evalMeasure(), m=M();
  narrate(L('Rain on the war-room windows. Uni sets down cocoa and a fresh gauge.','作戦室の窓に雨。ユニがココアと新しい計器を置く。'));
  say(nm('Uni the Unicorn'),'uni:concerned',L('Here is what she flagged. Fix the foundations in order — a definition before a gauge, a gauge before a sample, a sample before a number.','彼女が指摘した点だ。順番に土台から直そう——計器の前に定義、サンプルの前に計器、数字の前にサンプル。'),()=>{
    let h=lessonList(r.crit.concat(r.minor))+'<div class="choices">';
    const has=(...f)=>f.some(x=>r.crit.includes(x)||r.minor.includes(x));
    if(m.y==='inspect') h+=`<button class="choice" id="fx_y"><span class="tag">Y</span>${L('Correct the primary metric to the rate reaching customers (+2 days)','主要指標を顧客到達率に修正（+2日）')}</button>`;
    if(has('opdef_vague','opdef_blame','opdef_inflate','opdef_incomplete','opdef_unit','opdef_method','msa_fail','msa_assessor')) h+=`<button class="choice" id="fx_od"><span class="tag">${L('Definition + MSA','定義＋MSA')}</span>${L('Rewrite the definition and re-run the agreement study','定義を書き直し、一致性分析を再実施')}</button>`;
    if(has('plan_incomplete','plan_gate_only','plan_bias','plan_nostrat','plan_over','data_cherry','data_mixed')) h+=`<button class="choice" id="fx_plan"><span class="tag">${L('Plan + re-collect','計画＋再収集')}</span>${L('Rebuild the plan and collect again','計画を組み直して再収集')}</button>`;
    if(has('base_wrong','base_inflate','base_sigma')) h+=`<button class="choice" id="fx_base"><span class="tag">${L('Baseline','ベースライン')}</span>${L('Redo the arithmetic','計算をやり直す')}</button>`;
    if(has('pareto_wrong')) h+=`<button class="choice" id="fx_par"><span class="tag">Pareto</span>${L('Re-pick the vital few','重要な少数を選び直す')}</button>`;
    if(has('chart_cause','chart_missed')) h+=`<button class="choice" id="fx_ch"><span class="tag">${L('First look','最初の観察')}</span>${L('Re-read the chart — observations only','チャートを読み直す——観察のみ')}</button>`;
    h+='</div>';
    const clean=r.crit.length===0;
    if(clean) h=`<div class="feedback good">${L('Every critical flaw repaired. Request a new review.','致命的な欠陥はすべて修復。再審査を要請しよう。')}</div>`+h;
    h+=`<button class="btn" id="retg" ${clean?'':'disabled'}>${L('Request a new tollgate (+1 day) ✦','再審査を要請（+1日）✦')}</button>`;
    interact(h);
    const wire=(id,fn)=>{const b=$(id); if(b) b.onclick=fn;};
    wire('fx_y',()=>{ S.daysLost+=2; m.y='field'; if(!S.have.includes('p_field')) addCards(['p_field']); m.plan={}; go('m_rework'); });
    wire('fx_od',()=>{ m.msa=null; go('m_opdef'); });
    wire('fx_plan',()=>{ m.collect={}; go('m_plan'); });
    wire('fx_base',()=>{ m.base={}; go('m_baseline'); });
    wire('fx_par',()=>go('m_pareto'));
    wire('fx_ch',()=>{ m.chart=[]; go('m_chart'); });
    wire('retg',()=>{ S.day++; S.reworkMode=false; go('m_tg_intro'); });
  });
},

m_epilogue(){
  const m=M();
  drawBackdrop('scene_floor'); banner(L('MEASURE · COMPLETE','MEASURE · 完了'));
  narrate(L('The number is on the wall now: 4.8% → 48,000 DPMO → 3.2σ. Beneath it, in Torto’s handwriting: "after lunch. Machine 3. I TOLD you."',
    '数字が壁に貼られた：4.8% → 48,000 DPMO → 3.2σ。その下にトルトの字で：「昼食後。マシン3。言っただろ。」'));
  const total=scoreDefine()+(m.scoreMeasure||0);
  say(nm('Uni the Unicorn'),'uni:happy',
    L('A trusted baseline, a validated gauge, a vital few, and a list of WHERE-and-WHEN patterns with not a single WHY attached. That is a Measure phase. Chapter 3 — ANALYZE — is where the humid weeks, the after-lunch drift and the skipped checks finally stand trial.',
      '信頼できるベースライン、検証済みの計器、重要な少数、そして「なぜ」を1つも含まない「どこで・いつ」のパターン一覧。それがMeasure段階だ。第3章「ANALYZE」——多湿の週、昼食後のドリフト、飛ばされた検査が、ついに裁きを受ける場所だ。'),()=>{
    interact(`<div class="center"><h1 class="title-h">${L('✦ Chapter 2 Complete ✦','✦ 第2章 クリア ✦')}</h1>
      <div style="margin:10px 0"><span class="pill">${L('Define','Define')}: ${scoreDefine()}</span> <span class="pill">Measure: ${m.scoreMeasure}</span> <span class="pill"><b>${L('Project score','プロジェクト得点')}: ${total}</b></span>
      <span class="pill">${L(`📅 Day ${fmtDays(daysUsed())} of ${MEASURE_DEADLINE}`,`📅 ${MEASURE_DEADLINE}日中${fmtDays(daysUsed())}日目`)}</span> <span class="pill">${L(`🆘 Consults: ${S.consults}`,`🆘 相談：${S.consults}`)}</span></div>
      <button class="btn center-btn" id="next3">${L('Continue to Chapter 3 — ANALYZE ✦','第3章 ANALYZE へ ✦')}</button>
      <button class="btn ghost center-btn" id="again" style="margin-top:8px">${L('Play again from the start','最初からもう一度')}</button></div>`);
    $('next3').onclick=()=>go('a_card');
    $('again').onclick=()=>{ clearSave(); location.reload(); };
  });
},
});

/* shared tollgate page: say -> beats -> react -> continue */
function tgPage(key,line,beatsFn,next){
  const r=evalMeasure();
  say(nm('Empress Scarlet'),'dragon:reading',line,()=>{
    const beats=beatsFn(r);
    dragonReact(beats.join(''));
    interact(beats.join('')+`<button class="btn" id="nx">${L('Continue ✦','続ける ✦')}</button>`);
    $('nx').onclick=()=>go(next);
  });
}

/* ===================================================================
   DEV CHEAT — jump straight to Measure with a preset Define outcome
   URL:  index.html#dev-measure        (good Define)
         index.html#dev-measure-bad    (poor Define)
   Console: DEV.measure('good'|'bad')
   =================================================================== */
window.DEV={
  measure(profile,noGo){
    const good=profile!=='bad';
    S.have=['c_where','c_what_vague','c_anec','c_blame','c_when_guess','c_deadline','c_tour','br_zero','br_stop','br_sad','br_soon','br_morale','br_lookinto',
            'p_mag','p_what','p_when','m_impact','m_ctq','m_voc','l_counter','l_when2','t_nug','t_flow'];
    if(good) S.have.push('p_field','m_shops');
    S.ps={date:{t:'x',v:'ok'},metric:{t:'x',v:good?'ok':'inspect'},base:{t:'x',v:good?'ok':'inspect'},target:{t:'x',v:good?'ok':'inspect'},copq:{t:'x',v:'ok'}};
    S.obj={verb:{t:'x',v:'ok'},metric:{t:'x',v:'ok'},base:{t:'x',v:'ok'},target:{t:'x',v:'ok'},when:{t:'x',v:'ok'},how:null};
    S.ctq=good?{smile:'ok',ship:'ok',returns:'ok',thread:'ok',rework:'ok'}:{smile:'vague',ship:'sol'};
    S.stake=good?{MC:[0,1,2],KS:[3],KI:[4,5,6],MO:[7,8,9]}:{MC:[0,2],KS:[3],KI:[4,5,6],MO:[7,8,9]};
    S.scope={IN:[0,1,2,3,4],OUT:[5,6,7,8,9],LATER:[10,11]};
    S.vocUnlocked=true; S.tollgateAttempts=good?1:2; S.consults=good?0:1;
    S.day=good?8:13; S.half=0; S.daysLost=good?0:7; S.rating=good?'S':'C'; S.scoreDefine=good?100:48; S.m=null; S.reworkMode=false;
    document.getElementById('introhero')?.remove(); document.getElementById('chapcard')?.remove();
    if(noGo) return;
    go('m_card');
    console.log('[DEV] jumped to Measure with',good?'GOOD':'BAD','Define outcome');
  }
};
DEV.tollgate=function(){
  const F=v=>({t:'x',v});
  S.have.push('p_mag','p_what','p_when','m_impact','m_ctq','m_voc','l_counter','l_when2','t_nug','t_flow','p_field','m_shops','c_deadline','c_tour','c_blame','c_anec','c_what_vague','c_where','c_when_guess','br_zero','br_stop','br_sad','br_soon','br_morale','br_lookinto');
  Object.assign(S,{ps:{date:F('ok'),metric:F('ok'),base:F('ok'),target:F('ok'),copq:F('ok')},obj:{verb:F('ok'),metric:F('ok'),base:F('ok'),target:F('ok'),when:F('ok'),how:null},
    flow:[0,1,2,3,4,5,6,7],sipoc:{S:[0,1],I:[2,3],O:[4,5],C:[6,7],X:[8,9,10]},voc:{voc:['v1','v2','v3'],noise:['v4','v5']},
    ctq:{smile:'ok',ship:'ok',returns:'ok',thread:'ok',rework:'ok'},vocUnlocked:true,scope:{IN:[0,1,2,3,4],OUT:[5,6,7,8,9],LATER:[10,11]},stake:{MC:[0,1,2],KS:[3],KI:[4,5,6],MO:[7,8,9]},
    day:8,half:0,daysLost:0,consults:0,tollgateAttempts:0});
  document.getElementById('introhero')?.remove(); document.getElementById('chapcard')?.remove();
  go('charter'); console.log('[DEV] jumped to the Define charter/tollgate with a perfect state');
};
window.dev=window.DEV;                              // lowercase alias for the console
function devFromHash(){
  const h=(location.hash||'').toLowerCase();
  if(h==='#dev-measure') DEV.measure('good');
  else if(h==='#dev-measure-bad') DEV.measure('bad');
  else if(h==='#dev-tollgate') DEV.tollgate();
}
window.addEventListener('load',()=>setTimeout(devFromHash,600));
window.addEventListener('hashchange',devFromHash);


;

/* =====================================================================
   CHAPTER 3 — ANALYZE  (third script block)
   Fishbone × 5-Whys investigation with SMEs, data verification, vital few.
   ===================================================================== */
const ANALYZE_DEADLINE=50;
function analyzeLate(){ return daysUsed()>ANALYZE_DEADLINE; }
const STEPS_ANALYZE=[['🧭','Patterns'],['🐟','Root causes'],['🧪','Verify'],['🎯','Confirmed Xs'],['🐉','Tollgate']];
function useAnalyzeTracker(step){ STEPS=STEPS_ANALYZE; renderTracker(step); }
function A(){ if(!S.a) S.a={bones:{},pat:{},verify:{},vital:[],done:{},tgAttempts:0,scoreAnalyze:null,extraData:{}}; return S.a; }
function carryM(){
  const m=S.m||{}, c={};
  c.strat=m.strat||[]; c.hasTod=c.strat.includes('tod'); c.hasHumid=c.strat.includes('humid');
  c.cherry=!!(m.collect&&m.collect.cherry);
  c.chartOK=(m.chart||[]).filter(i=>i<=3).length; c.msaOK=!!(m.msa&&m.msa.agree>=90);
  c.mrating=m.scoreMeasure==null?'?':(m.scoreMeasure>=100?'S':(m.scoreMeasure>=70?'A':'C'));
  return c;
}
Object.assign(CARDS,{
  ax_thread:{txt:'Rainbow Thread Guild changed mills in March — same label, new packaging, "same thread, they said". No incoming inspection exists.',src:'Capy (deliveries) — maintenance & delivery logs',type:'ver',slot:null},
  ax_locknut:{txt:'Machine 3 tension knob has had NO lock nut since a spring repair; no part spec, no scheduled tension check.',src:'Torto + maintenance log',type:'ver',slot:null},
  ax_fluff:{txt:'Fluff bales are unwrapped on arrival and stored by the loading door; no humidity control or check.',src:'Luna — storeroom walk',type:'ver',slot:null},
  ax_stdwork:{txt:'Line cycle target (3 min) was set from sewing time only; the 4-minute final check was never in the standard.',src:'Capy — standard work sheet',type:'ver',slot:null},
  ax_gate:{txt:'Gate inspection is visual only; latent seam looseness only shows after hugs. No pull test in the procedure.',src:'Penny — inspection procedure',type:'ver',slot:null},
});
Object.assign(LESSON,{
  rca_opinion:{t:'An opinion recorded as a cause',d:'"Buy the TurboStitch", "it is the weather", "the gate is fine" — these are the FIRST thing an expert says, not the last. The first answer is a symptom, a solution or a shrug. Root causes live three or four whys deeper, and they come with evidence attached.'},
  rca_shallow:{t:'Stopped at a symptom',d:'"Tension drifts after lunch" is true and useless — fix it and it drifts again next spring. Keep asking why until the answer is something the ORGANISATION does or fails to do: a missing spec, an absent standard, a check nobody scheduled.'},
  rca_blame:{t:'A person recorded as a root cause',d:'"The night shift is careless" is a hypothesis with a grudge. Measure already showed night equals day. When the fishbone points at a person, ask what the SYSTEM let happen — training, standards, time. People are rarely the root; the process that set them up to fail usually is.'},
  rca_missing:{t:'Bones left unexplored',d:'A fishbone with empty bones is a hunch with a diagram. Every category gets a conversation and a why-chain — the cause you did not look for is the one Improve will trip over.'},
  rca_solution:{t:'Jumped to a solution mid-investigation',d:'"Retune more often", "stuff less on humid days" — solutions offered before the cause is known will treat symptoms. Improve chooses solutions; Analyze finds causes. Keep the phases apart.'},
  ver_none:{t:'Causes never verified with data',d:'A root cause you have not tested is still a story. Every candidate cause gets a comparison: stratified rates, before-and-after, a designed check. The ones that survive become facts; the ones that do not, get crossed out — publicly.'},
  ver_opinion:{t:'"Verified" by asking someone',d:'Consensus is not evidence. Asking Capy whether he agrees tells you about Capy. Compare the numbers.'},
  ver_wrong:{t:'Wrong test for the question',d:'Two groups and a rate? Compare proportions. Two time periods? Before-and-after. A continuous factor like humidity? Look at the relationship week by week. The test must match the shape of the data.'},
  ver_ignore:{t:'Kept a cause the data rejected',d:'Night versus day: 4.7% against 4.9%, no difference. The data said no. Keeping the night shift on your list anyway is the moment a project stops being Six Sigma and becomes a grudge with charts.'},
  ver_nodata:{t:'Verification blocked by missing tags',d:'You could not test the after-lunch effect because Measure never tagged time-of-day — or the humid weeks because they were dropped. Analyze pays for Measure’s shortcuts. Targeted re-collection costs days, but guessing costs the project.'},
  vital_wrong:{t:'Vital few includes the unproven',d:'Improve gets three to five VERIFIED root causes, ranked by impact. An unverified hypothesis or a rejected blame on that list will absorb solutions and budget and change nothing.'},
  vital_missing:{t:'Vital few too thin',d:'Fewer than three verified causes handed to Improve. The thread lot, the lock nut, the gate test, the standard-work time, the fluff storage — the evidence supports most of them. Hand Improve enough to matter.'},
  a_late:{t:'Analyze ran past day 50',d:'Investigation expands to fill the calendar you give it. Root causes were reachable in three conversations each; verification in a week. Improve now starts late.'},
});

/* ---------- the investigation: bones × SMEs × why-chains ---------- */
const BONES=()=>[
  {id:'machine',bone:L('MACHINE','機械'),who:'Torto',cls:'torto',max:6,card:'ax_locknut',
   rootDepth:4,root:L('No part spec for the tension assembly + no scheduled tension verification','張力機構の部品仕様がなく、張力の定期確認もない'),
   levels:[
    {say:L('It is the MACHINE, youngster. Machine 3 is old and the TurboStitch 9000 is not. Write that down and we can all go home.','機械だよ、若いの。マシン3は古くて、ターボステッチ9000は新しい。それを書いて、みんな帰ろう。'),mood:'ranting',
     opts:[{k:'acc',t:L('Record it: “Machine 3 is old — cause: the machine.”','記録：「マシン3が古い——原因は機械」'),tag:'opinion'},
           {k:'why',t:L('“What does Machine 3 DO wrong, exactly? Not what it is — what it does.”','「マシン3は具体的に何を間違えるの？何であるかじゃなく、何をするか。」')},
           {k:'bad',cost:2,t:L('“Are you sure it isn’t how you run it?”','「あなたの操作の問題じゃないの？」'),r:L('*tea stops mid-air* Forty. Years. …We are done for today, youngster.','*お茶が空中で止まる* 40年。…今日はここまでだ、若いの。')},
           {k:'cite',need:'t_nug',t:L('Cite his own tip: “The knob on Machine 3 drifts by lunch — start there.”','本人の情報を引用：「マシン3のノブが昼までにずれる——そこから始めよう。」'),skip:1}]},
    {say:L('*grumbles* The tension drifts. Morning it is perfect; after lunch the smiles start popping. I retune it by ear, every day, like a fiddle.','*ぶつぶつ* 張力がずれる。朝は完璧、昼食後には笑顔がほどけ始める。毎日、耳でバイオリンみたいに調律してるんだ。'),mood:'content',
     opts:[{k:'acc',t:L('Record: “Tension drifts after lunch” — cause found.','記録：「昼食後に張力がずれる」——原因判明'),tag:'symptom'},
           {k:'why',t:L('“Why would the tension drift only after lunch, and only on Machine 3?”','「なぜ昼食後だけ、しかもマシン3だけで張力がずれるの？」')},
           {k:'sol',cost:1,t:L('“So we should just retune it more often.”','「じゃあもっと頻繁に調律すればいい。」'),r:L('More often! *laughs* I retune it FOUR times a day, youngster. Come back with a question, not a bandage.','もっと頻繁に！*笑う* 1日4回調律してるんだよ、若いの。絆創膏じゃなく質問を持ってきな。')}]},
    {say:L('The knob loosens. Vibration, I reckon — the line runs hardest after lunch. The other machines hold. Number three does not.','ノブが緩むんだ。振動だろう——昼食後はラインが一番きつく動く。他のマシンは持つ。3番は持たない。'),mood:'content',
     opts:[{k:'acc',t:L('Record: “Vibration loosens the knob” — cause found.','記録：「振動でノブが緩む」——原因判明'),tag:'symptom'},
           {k:'why',t:L('“Why does Machine 3’s knob loosen when the others take the same vibration?”','「同じ振動を受けているのに、なぜマシン3のノブだけ緩むの？」')},
           {k:'bad',cost:2,t:L('“Maybe you’re not tightening it enough.”','「締め方が足りないんじゃない？」'),r:L('*sets the tea down very carefully* Say that to the knob. It has heard it from better than you.','*お茶をとても慎重に置く* ノブに言ってやれ。あんたより上の人間から聞かされてきたんだ。')}]},
    {say:L('*peers at it, then at you* …The lock nut. Machine 3 has no lock nut on the tension knob. Maintenance replaced the knob last spring — new knob, no nut. I never noticed until this second.','*ノブを、それからあなたを見る* …ロックナット。マシン3の張力ノブにロックナットがない。去年の春にメンテがノブを交換した——新しいノブ、ナットなし。今この瞬間まで気づかなかった。'),mood:'impressed',
     opts:[{k:'acc',t:L('Record: “Missing lock nut on Machine 3” — root cause.','記録：「マシン3のロックナット欠落」——根本原因'),tag:'shallow'},
           {k:'why',t:L('“Why was it replaced without a lock nut — and why did nobody catch it for a year?”','「なぜナットなしで交換され、なぜ1年間誰も気づかなかったの？」')},
           {k:'ev',t:L('“Can we pull the maintenance log for that repair?”','「その修理のメンテ記録を見られる？」'),evidence:true}]},
    {say:L('No part spec. Maintenance grabbed a knob that fit — nothing says which. And nobody checks tension on a schedule; I do it by ear because there is no gauge on the line. Write THAT down. Both halves.','部品仕様がない。メンテは合うノブを掴んだ——どれを使うか、どこにも書いてない。そして張力を定期的に確認する人もいない。ラインにゲージがないから、俺が耳でやってる。「それ」を書け。両方とも。'),mood:'impressed',
     opts:[{k:'root',t:L('Record root cause: no part spec + no scheduled tension verification (maintenance log confirms)','根本原因を記録：部品仕様なし＋張力の定期確認なし（メンテ記録で確認）')}]},
   ]},
  {id:'env',bone:L('ENVIRONMENT','環境'),who:'Luna Axolotl',cls:'luna',max:6,card:'ax_fluff',
   rootDepth:4,root:L('Fluff stored unwrapped by the loading door; no humidity control or check','綿が荷受口そばに未包装で保管され、湿度管理・確認がない'),
   levels:[
    {say:L('Humid weeks are worse. The weather. Not much a night shift can do about the sky.','湿気の多い週は悪くなる。天気だよ。空のことは夜勤にはどうにもできない。'),mood:'thoughtful',
     opts:[{k:'acc',t:L('Record: “Humidity — cause: the weather.”','記録：「湿度——原因は天気」'),tag:'opinion'},
           {k:'why',t:L('“How does the weather outside reach a stitch inside?”','「外の天気が、どうやって中の縫い目まで届くの？」')},
           {k:'bad',cost:2,t:L('“Or the night shift just works slower when it’s muggy?”','「それとも、蒸し暑いと夜勤の動きが鈍るだけ？」'),r:L('*gills flatten* I brought you tally sheets once. I will not bring you patience twice. Goodnight.','*えらが伏せる* 一度は集計表を持ってきた。忍耐は二度は持ってこない。おやすみ。')}]},
    {say:L('The fluff. On humid weeks the bales get heavy — they drink the air. Heavier stuffing, tighter tummy, and the smile seam is the seam under the most pull.','綿だよ。湿気の週は俵が重くなる——空気を飲むの。重い詰め物、きつい腹、そして笑顔の縫い目は一番引っ張られる縫い目。'),mood:'thoughtful',
     opts:[{k:'acc',t:L('Record: “Fluff absorbs moisture” — cause found.','記録：「綿が湿気を吸う」——原因判明'),tag:'symptom'},
           {k:'why',t:L('“Why is the fluff able to absorb moisture before it reaches the line?”','「なぜ綿はラインに来る前に湿気を吸えてしまうの？」')},
           {k:'sol',cost:1,t:L('“Let’s just stuff less on humid days.”','「湿気の日は詰め物を減らせばいい。」'),r:L('And ship flat plushies? *soft laugh* You are solving before you know. Ask me another why.','ぺちゃんこのぬいぐるみを出荷するの？*小さく笑う* 分かる前に解決しようとしてる。もう一つ「なぜ」を聞いて。')}]},
    {say:L('Because it sits in the back room with the bales cut open, right by the loading door. Every truck that opens, the room breathes in.','奥の部屋に、俵を切り開いたまま、荷受口のすぐそばに置いてあるから。トラックが開くたびに、部屋が息を吸うの。'),mood:'thoughtful',
     opts:[{k:'acc',t:L('Record: “Fluff stored by the door” — root cause.','記録：「綿が扉のそばに保管」——根本原因'),tag:'shallow'},
           {k:'why',t:L('“Why are the bales opened and left there — who decided that?”','「なぜ俵は開けてそこに置かれているの——誰が決めたの？」')},
           {k:'ev',t:L('“Walk me to the storeroom — show me.”','「保管室まで案内して——見せて。」'),evidence:true}]},
    {say:L('Someone’s speed idea: unwrap on arrival so the stuffers can grab faster. No humidity check exists — there is no meter in the building. Nobody owns the storeroom. That is your why.','誰かの「速さ」のアイデア：到着時に開けて、詰める人がすぐ取れるように。湿度の確認は存在しない——建物に計器がない。保管室の担当者もいない。それがあなたの「なぜ」。'),mood:'pleased',
     opts:[{k:'root',t:L('Record root cause: fluff unwrapped by the door, no humidity control, no storeroom owner (storeroom walk confirms)','根本原因を記録：綿が扉のそばで未包装、湿度管理なし、保管室の担当者なし（現地確認）')}]},
   ]},
  {id:'method',bone:L('METHOD','方法'),who:'Captain Capy',cls:'capy',max:6,card:'ax_stdwork',
   rootDepth:4,root:L('Cycle-time standard set from sewing time only — the final check was never in the standard','サイクルタイム基準が縫製時間のみで設定され、最終検査が標準に含まれていない'),
   levels:[
    {say:L('Honestly? Carelessness. Checks get skipped. The night shift, mostly — I mean, probably. I mean, you have the data, you tell me.','正直？不注意だよ。検査が飛ばされる。主に夜勤——いや、たぶん。いや、データはきみが持ってるんだから、きみが言ってよ。'),mood:'worried',
     opts:[{k:'acc',t:L('Record: “Night shift skips checks — cause: carelessness.”','記録：「夜勤が検査を飛ばす——原因は不注意」'),tag:'blame'},
           {k:'why',t:L('“The data says night equals day. Forget who — WHEN does a check get skipped?”','「データでは夜勤と日勤は同じ。誰かは忘れて——検査は「いつ」飛ばされるの？」')},
           {k:'bad',cost:2,t:L('“Let’s write the night shift up and see if it stops.”','「夜勤に注意書きを出して、止まるか見てみよう。」'),r:L('*clutches clipboard* Write them— no. No, I have DONE that, and Luna did not speak to me for a month. I need to… supervise. Elsewhere.','*クリップボードを抱く* 注意書き——いや。いや、それはもうやって、ルナに1ヶ月口をきいてもらえなかった。僕は…別の場所を監督しないと。')}]},
    {say:L('When orders pile up. Both shifts. The final check just… evaporates when the line is behind. Nobody decides it. It happens.','注文が積み上がったとき。両シフトとも。最終検査はラインが遅れると…蒸発するんだ。誰も決めてない。ただ起きる。'),mood:'worried',
     opts:[{k:'acc',t:L('Record: “Checks skipped when busy” — cause found.','記録：「忙しいと検査が飛ぶ」——原因判明'),tag:'symptom'},
           {k:'why',t:L('“Why does being behind force a skip — what has to give?”','「なぜ遅れると飛ばさざるを得ないの——何が犠牲になるの？」')},
           {k:'sol',cost:1,t:L('“Tell everyone the check is mandatory. Problem solved.”','「検査は必須だとみんなに言えばいい。解決。」'),r:L('It IS mandatory! It says so on the wall! *points at the wall* …The wall is not helping. Ask me something the wall cannot answer.','必須なんだよ！壁に書いてある！*壁を指す* …壁は役に立ってない。壁が答えられないことを聞いて。')}]},
    {say:L('*small voice* The check takes four minutes. The line pace is three minutes per plushie. Something gives, every single time, and it is always the check.','*小さな声で* 検査は4分かかる。ラインのペースは1体3分。毎回必ず何かが犠牲になって、それはいつも検査なんだ。'),mood:'embarrassed',
     opts:[{k:'acc',t:L('Record: “4-minute check, 3-minute pace” — root cause.','記録：「検査4分、ペース3分」——根本原因'),tag:'shallow'},
           {k:'why',t:L('“Why is the pace three minutes when the work needs four?”','「作業に4分要るのに、なぜペースが3分なの？」')},
           {k:'ev',t:L('“Show me the standard work sheet the pace came from.”','「ペースの根拠になった標準作業票を見せて。」'),evidence:true}]},
    {say:L('*produces a laminated sheet, ears flat* The standard was built from sewing time only. Last year. The check was never on it — it was added to the wall, not to the standard. …I built the standard. I am the why.','*ラミネートされた票を出す、耳が伏せている* 標準は縫製時間だけで作られてる。去年。検査は最初から載ってなかった——壁に足しただけで、標準には足してない。…その標準を作ったのは僕だ。僕が「なぜ」なんだ。'),mood:'embarrassed',
     opts:[{k:'root',t:L('Record root cause: cycle standard excludes inspection time (standard work sheet confirms) — the system, not the shift','根本原因を記録：サイクル基準に検査時間が含まれない（標準作業票で確認）——シフトではなく仕組みの問題')}]},
   ]},
  {id:'measure',bone:L('MEASUREMENT','測定'),who:'Penny Penguin',cls:'penny',max:5,card:'ax_gate',
   rootDepth:3,root:L('Gate inspection is visual only — cannot detect latent seam looseness (no pull test in the procedure)','門の検査は目視のみ——潜在的な縫い目の緩みを検出できない（手順に引張試験がない）'),
   levels:[
    {say:L('The gate is FINE. We catch 12.6%. That number is proof that we catch things. Next bone, please.','門は「大丈夫」よ。12.6%を捕まえてる。その数字が捕まえている証拠。次の骨をどうぞ。'),mood:'stern',
     opts:[{k:'acc',t:L('Record: “Measurement — not a cause; the gate catches 12.6%.”','記録：「測定——原因ではない。門は12.6%を捕捉」'),tag:'opinion'},
           {k:'why',t:L('“Then why do 4.8% escape past a gate that catches 12.6%? What does the gate not see?”','「では、12.6%を捕まえる門を、なぜ4.8%がすり抜けるの？門に見えていないものは？」')},
           {k:'bad',cost:2,t:L('“Your inspectors are missing things.”','「あなたの検査員が見逃してる。」'),r:L('*the spectacles come off* My inspectors apply the procedure I wrote. If you wish to insult someone, insult the procedure. Come back when you can tell the difference.','*眼鏡が外れる* 私の検査員は私が書いた手順を適用してるの。誰かを侮辱したいなら手順を侮辱しなさい。その違いが分かるようになったら来て。')}]},
    {say:L('*a pause* …Because a loose smile is not loose YET at the gate. It opens after hugs — days later. We inspect visually. A seam can pass my eyes and fail a child’s arms.','*間* …緩い笑顔は、門ではまだ緩んでいないから。ハグのあとで開くの——何日も経ってから。私たちは目視で検査してる。縫い目は私の目を通過して、子どもの腕で失敗しうる。'),mood:'surprised',
     opts:[{k:'acc',t:L('Record: “Looseness is latent at the gate” — cause found.','記録：「門の時点では緩みが潜在的」——原因判明'),tag:'symptom'},
           {k:'why',t:L('“Why does the gate check visually only, when the gauge exists?”','「ゲージがあるのに、なぜ門では目視だけなの？」')},
           {k:'ev',t:L('“Can we pull-test fifty units that passed the gate?”','「門を通過した50体を引張試験できる？」'),evidence:true}]},
    {say:L('The gauge lives in my office. The gate procedure was written before latent looseness was understood — it never included a pull test, and nobody re-wrote it. I did not re-write it. *writes something down herself*','ゲージは私の部屋にある。門の手順は、潜在的な緩みが理解される前に書かれた——引張試験は一度も含まれず、誰も書き直さなかった。私も書き直さなかった。*自分で何かを書き留める*'),mood:'pleased',
     opts:[{k:'root',t:L('Record root cause: gate procedure is visual-only; no pull test (50-unit pull test confirms escapes)','根本原因を記録：門の手順は目視のみ、引張試験なし（50体の引張試験で流出を確認）')}]},
   ]},
  {id:'material',bone:L('MATERIAL','材料'),who:'Captain Capy',cls:'capy',max:5,card:'ax_thread',
   rootDepth:3,root:L('Supplier changed thread mill in March with no incoming verification','3月に供給者が糸の工場を変更、受入検証なし'),
   levels:[
    {say:L('Thread? Same as always. Rainbow Thread Guild, since before I was born. Nothing to see on the material bone, I promise.','糸？いつもと同じだよ。レインボー糸ギルド、僕が生まれる前から。材料の骨には何もないよ、約束する。'),mood:null,
     opts:[{k:'acc',t:L('Record: “Material unchanged — not a cause.”','記録：「材料は変更なし——原因ではない」'),tag:'opinion'},
           {k:'why',t:L('“The rate jumped on March 14th. Did ANYTHING about deliveries change around then?”','「3月14日に率が跳ね上がった。その頃、納品で何か変わったことは？」')},
           {k:'bad',cost:1,t:L('“Suppliers always cut corners. Which corner did they cut?”','「供給者はいつも手を抜く。どこを抜いたの？」'),r:L('That is— they are our FRIENDS, they send a card at New Year— I am not answering that.','それは——彼らは「友達」だよ、お正月にはカードもくれる——それには答えない。')}]},
    {say:L('…New packaging. In March. They moved to a new mill — "same thread, new box", the note said. I kept the note. It has a smiley on it.','…新しい包装。3月に。彼らは新しい工場に移った——「同じ糸、新しい箱」ってメモに書いてあった。メモは取ってある。スマイルが描いてある。'),mood:'worried',
     opts:[{k:'acc',t:L('Record: “New packaging in March” — cause found.','記録：「3月に新包装」——原因判明'),tag:'symptom'},
           {k:'why',t:L('“Same thread — was that ever CHECKED, or only said?”','「同じ糸——それは確認された？それとも言われただけ？」')},
           {k:'ev',t:L('“Do we have incoming inspection records for thread?”','「糸の受入検査記録はある？」'),evidence:true}]},
    {say:L('We don’t inspect thread coming in. We never needed to. *quietly* Torto did say it snaps more, in March. I thought he was being Torto.','入ってくる糸は検査してない。必要なかったから。*静かに* トルトが3月に、切れやすくなったって言ってた。トルトがトルトしてるだけだと思ったんだ。'),mood:'embarrassed',
     opts:[{k:'root',t:L('Record root cause: thread lot changed in March, no incoming verification (delivery log + Torto’s snap reports)','根本原因を記録：3月に糸ロットが変更、受入検証なし（納品記録＋トルトの報告）')}]},
   ]},
];
/* verification tests per cause */
const TESTS=()=>({
  machine:{q:L('Machine 3 tension: how do you test it?','マシン3の張力：どう検証する？'),opts:[
    {t:L('Stratify escaped rate: Machine 3 before vs after lunch, vs other machines (needs time-of-day tag)','層別：マシン3の昼前 vs 昼後 vs 他マシン（時間帯タグが必要）'),v:'ok',need:'tod',res:L('M3 after lunch 6.2% vs 4.1% before; machines 1,2,4 flat at 4.3%. CONFIRMED.','M3昼後6.2%、昼前4.1%、他は4.3%で平坦。「確認」。')},
    {t:L('Ask Torto if he agrees it is the knob','ノブが原因かトルトに同意を求める'),v:'opinion'},
    {t:L('Correlate weekly humidity with Machine 3 output','週の湿度とマシン3の産出を相関'),v:'wrong'}]},
  env:{q:L('Humidity → fluff → seam: how do you test it?','湿度→綿→縫い目：どう検証する？'),opts:[
    {t:L('Weekly escaped rate vs recorded humidity, all 12 weeks (needs humidity tag & the humid weeks kept)','週ごとの流出率と記録湿度、12週すべて（湿度タグと多湿週の保持が必要）'),v:'ok',need:'humid',needWeeks:true,res:L('Weeks 5 & 9 (RH > 75%) run 6.8–6.9% vs ~4.5% elsewhere. CONFIRMED.','週5・9（RH75%超）は6.8〜6.9%、他は約4.5%。「確認」。')},
    {t:L('Ask Luna to confirm — she noticed it first','最初に気づいたルナに確認を求める'),v:'opinion'},
    {t:L('Compare night shift vs day shift rates','夜勤と日勤の率を比較'),v:'wrong'}]},
  method:{q:L('Skipped checks under time pressure: how do you test it?','時間圧力による検査の省略：どう検証する？'),opts:[
    {t:L('Compare escaped rate on shifts that logged a skipped check vs shifts that did not','検査省略を記録したシフトと、していないシフトの流出率を比較'),v:'ok',res:L('Skipped-check shifts 8.1% vs 3.9% — both day and night. CONFIRMED.','省略シフト8.1% vs 3.9%——日勤も夜勤も。「確認」。')},
    {t:L('Night vs day two-proportion test','夜勤 vs 日勤の2比率検定'),v:'reject',res:L('4.7% vs 4.9%, p = 0.71 — no difference. The night shift is REJECTED as a cause.','4.7% vs 4.9%、p=0.71——差なし。夜勤は原因として「棄却」。')},
    {t:L('Survey supervisors on whether people are careless','監督者に「人が不注意か」をアンケート'),v:'opinion'}]},
  measure:{q:L('Gate cannot see latent looseness: how do you test it?','門は潜在的な緩みを見られない：どう検証する？'),opts:[
    {t:L('Pull-test 50 units that PASSED the gate, count ≥ 2 mm openings','門を「通過」した50体を引張試験し、2mm以上の開きを数える'),v:'ok',res:L('3 of 50 gate-passed units open ≥ 2 mm (6%) — invisible to the eye. CONFIRMED.','通過50体中3体（6%）が2mm以上開く——目には見えない。「確認」。')},
    {t:L('Ask Penny whether the procedure is adequate','手順が十分かペニーに尋ねる'),v:'opinion'},
    {t:L('Compare inspectors’ catch rates to find the weak one','検査員の検出率を比較して弱い人を探す'),v:'wrong'}]},
  material:{q:L('Thread lot change in March: how do you test it?','3月の糸ロット変更：どう検証する？'),opts:[
    {t:L('Before/after March 14: escaped rate by thread lot, plus tensile test of old vs new spools','3月14日前後：糸ロット別の流出率＋新旧スプールの引張強度試験'),v:'ok',res:L('Old lot 1.9% vs new lot 4.9%; new thread breaks at 82% of old strength. CONFIRMED.','旧ロット1.9% vs 新ロット4.9%；新糸の強度は旧の82%。「確認」。')},
    {t:L('Email the Guild and ask if anything changed','ギルドにメールで変更の有無を尋ねる'),v:'opinion'},
    {t:L('Correlate thread deliveries with humidity','糸の納品と湿度を相関'),v:'wrong'}]},
  people:{q:L('“Night shift carelessness”: how do you test it?','「夜勤の不注意」：どう検証する？'),opts:[
    {t:L('Night vs day two-proportion test on escaped rate','流出率の夜勤 vs 日勤2比率検定'),v:'reject',res:L('4.7% vs 4.9%, p = 0.71 — no difference. REJECTED as a cause.','4.7% vs 4.9%、p=0.71——差なし。原因として「棄却」。')},
    {t:L('Ask Capy — he has always said so','カピーに聞く——ずっとそう言っている'),v:'opinion'},
    {t:L('It is obvious; mark it confirmed','明らかなので確認済みとする'),v:'opinion'}]},
});

/* ---------- eval ---------- */
function evalAnalyze(){
  const a=A(), crit=[], minor=[]; const push=(x,f)=>{ if(!x.includes(f)) x.push(f); };
  const bones=BONES(); let explored=0, shallow=0;
  bones.forEach(b=>{ const e=a.bones[b.id]; if(!e) return; explored++;
    if(e.tag==='opinion') push(crit,'rca_opinion');
    if(e.tag==='blame') push(crit,'rca_blame');
    if(e.tag==='symptom'||e.tag==='shallow') shallow++; });
  if(a.bones.people&&a.bones.people.tag==='blame') push(crit,'rca_blame');
  if(explored<bones.length-1) push(crit,'rca_missing');
  if(shallow>=2) push(crit,'rca_shallow'); else if(shallow===1) push(minor,'rca_shallow');
  if(a.solutionJumps>=2) push(minor,'rca_solution');
  if(a.badMarks>=1) push(crit,'rca_opinion');
  if(a.dismissed>=2) push(crit,'rca_dismiss'); else if(a.dismissed===1) push(minor,'rca_dismiss');
  if(a.loud) push(crit,'rca_loud'); if(a.loops>=2) push(minor,'rca_circular'); if((a.sessions||1)>=4) push(minor,'rca_long');
  let untested=0; const sim=a.sim||{truth:{}}; const cbv=carriedBones(a);
  Object.keys(a.bones).forEach(id=>{ if(id==='people'&&a.bones.people.tag!=='blame') return; if(cbv&&!cbv.includes(id)) { untested++; return; } const v=a.verify[id]; if(!v){ untested++; return; }
    const truth=!!sim.truth[id]; if(v.v==='confirm'&&!truth) push(crit,id==='people'?'ver_ignore':'ver_falseconfirm'); if(v.v==='reject'&&truth) push(crit,'ver_falsereject'); });
  if(untested>=2) push(crit,'ver_none'); else if(untested===1) push(minor,'ver_none');
  if(a.blocked) push(minor,'ver_nodata');
  const confirmed=Object.keys(a.verify).filter(id=>a.verify[id].v==='confirm'&&sim.truth[id]&&a.bones[id]&&a.bones[id].tag==='root');
  if(confirmed.length<3&&Object.keys(a.verify).length) push(minor,'vital_missing');
  if(analyzeLate()) push(minor,'a_late');
  return {crit,minor};
}
window.__evalA=evalAnalyze;

/* ---------- scenes ---------- */
Object.assign(SCENES,{
a_card(){
  renderTracker(-1); banner(null); drawScene(); $('avatar').innerHTML=''; $('speaker').textContent=''; $('text').innerHTML=''; interact('');
  musicTrack('intro'); const old=$('chapcard'); if(old) old.remove();
  const cast=['torto','capy','luna'].map(id=>`<div class="cc-av">${ART[id]||''}</div>`).join('');
  document.body.insertAdjacentHTML('beforeend',`<div class="chapter-card" id="chapcard"><div class="cc-ch">${L('Chapter 3','第3章')}</div><div class="cc-def">${L('ANALYZE','ANALYZE（分析）')}</div>
    <div class="cc-tag">${L('Everyone has a cause. Only some of them are true.','誰もが原因を持っている。本当なのは、その一部だけ。')}</div><div class="cc-cast">${cast}</div><div class="cc-skip">${L('tap to continue ▸','タップで進む ▸')}</div></div>`);
  let done=false; const proceed=()=>{ if(done) return; done=true; clearTimeout(tmr); const c=$('chapcard'); const fin=()=>{ if(c) c.remove(); musicTrack('main'); go('a_intro'); }; if(c){ c.classList.add('ccout'); setTimeout(fin,420);} else fin(); };
  const tmr=setTimeout(proceed,2600); $('chapcard').onclick=proceed;
},
a_intro(){
  useAnalyzeTracker(0); drawWarroom(); banner(L('ANALYZE · Day one','ANALYZE · 初日'));
  const c=carryM(), a=A();
  narrate(L('The run chart is still on the wall, but now it has company: a blank board with one question written at the top, and five chairs pulled up to it.',
    'ランチャートはまだ壁にある。でも今は仲間がいる：上に問いが1つ書かれた空のボードと、そこに引き寄せられた5つの椅子。'));
  const recap=c.chartOK>=3?L('Measure handed you a good starting list — humid weeks, Machine 3 after lunch, skipped checks, a jump in March.','Measureは良い出発点をくれた——多湿の週、昼食後のマシン3、飛ばされた検査、3月の跳ね上がり。')
    :L('Measure handed you a thin starting list. You will be leaning on the SMEs more than a Belt should.','Measureがくれた出発点は薄い。ベルトが頼るべき以上にSMEに頼ることになる。');
  say(nm('Uni the Unicorn'),'uni',L(`Welcome to ANALYZE. ${recap} Here is the trap of this phase: every expert in this building has a cause ready, and they are all sincere. Your job is to ask WHY until the answer stops being a person or a symptom and becomes something the organisation does — then prove it with data. Deadline: day ${ANALYZE_DEADLINE}. You are on day ${fmtDays(daysUsed())}.`,
    `ANALYZEへようこそ。${recap} この段階の罠はこれだ：この建物のすべての専門家が原因を用意していて、全員が本気だ。きみの仕事は、答えが「人」や「症状」であることをやめて「組織がしていること」になるまで「なぜ」を聞くこと——そしてデータで証明すること。期限は${ANALYZE_DEADLINE}日目。今は${fmtDays(daysUsed())}日目。`),()=>{
    interact(`<div class="feedback info">📜 <b>${L('Analyze deliverables','Analyzeの成果物')}:</b> ${L('a cause board from the whole team, each cause drilled to its root · multi-vote to prioritise · data verification of each cause (confirm or reject) · vital few root causes for Improve.','チーム全員の原因ボード、各原因を根本まで掘る・マルチ投票で優先順位付け・各原因のデータ検証（確認または棄却）・Improveに渡す重要な少数の根本原因。')}</div>
      <div style="margin:6px 0">${scoreBadge()}</div><button class="btn" id="nx">${L('Start the investigation ✦','調査を始める ✦')}</button>`);
    $('nx').onclick=()=>go('a_rca');
  });
},
/* ---- verification: see block below (a_verify v2) ---- */
a_charter(){
  drawBackdrop('scene_mill_night'); banner(L('The charter, again','チャーター、ふたたび'));
  const a=A(), bones=BONES(); useAnalyzeTracker(3);
  say(nm('Uni the Unicorn'),'uni',L('Tomorrow she asks the Analyze question: are these causes, or are they stories? Sleep.','明日、彼女はAnalyzeの問いをする：これらは原因か、それとも物語か？ 眠って。'),()=>{
    interact(fishboneSVG(a)+`<div class="preview"><b>${L('CONFIRMED Xs → IMPROVE','確認されたX → IMPROVE')}</b><br>${a.vital.map(id=>'✅ '+causeLabel(id)+(a.verify[id]?` <span class="hint">(p = ${a.verify[id].p<0.001?'<0.001':a.verify[id].p})</span>`:'').concat('')).join('<br>')||'—'}<br>${Object.keys(a.verify).filter(id=>a.verify[id].v==='reject').map(id=>'❌ '+causeLabel(id)+` <span class="hint">(${L('rejected','棄却')}, p = ${a.verify[id].p})</span>`).join('<br>')}</div>${scoreBadge()}
      <button class="btn" id="nx">${L('🌙 Sleep… then face the dragon','🌙 眠る…そして竜と対峙する')}</button>`);
    $('nx').onclick=()=>{ S.day++; S.half=0; go('a_tg_intro'); };
  });
},
a_tg_intro(){
  useAnalyzeTracker(4); drawBoardroom('reading'); banner(L('ANALYZE TOLLGATE · The Empress','ANALYZEトールゲート · 皇帝')); A().tgAttempts++;
  say(nm('Empress Scarlet'),'dragon:reading',L(`Day ${fmtDays(daysUsed())}. ${analyzeLate()?'Late.':'In time.'} Analyze has one question, Green Belt: did you find CAUSES — or did you collect the opinions of people who like you?`,
    `${fmtDays(daysUsed())}日目。${analyzeLate()?'遅い。':'期限内。'} Analyzeの問いは1つだ、グリーンベルト：きみは「原因」を見つけたのか——それとも、きみを好きな人たちの意見を集めたのか？`),()=>{
    interact(`<button class="btn" id="nx">${L('Begin ✦','始める ✦')}</button>`); $('nx').onclick=()=>go('a_tg_rca'); });
},
a_tg_rca(){ tgPageA(L('The cause board. Read me each cause — and how deep you went.','原因ボード。原因ごとに読んで——どこまで深く行ったかも。'),r=>{ const b=[];
  if(r.crit.includes('rca_loud')) b.push(`<div class="feedback badf">🐉 ${L('"Torto stood up, so his cause went forward. Capy stood up, so his did too." Smoke. "I did not fund a Green Belt so the tallest person in the room could do the analysis."','「トルトが立ったから彼の原因が進んだ。カピーが立ったから彼のも。」煙。「部屋で一番背の高い者に分析をさせるために、グリーンベルトに金を出したのではない。」')}</div>`+coach('rca_loud'));
  if(r.crit.includes('rca_dismiss')||r.minor.includes('rca_dismiss')) b.push(`<div class="feedback ${r.crit.includes('rca_dismiss')?'badf':'tip'}">${L('"You told an expert their cause was not a cause, in front of the room. Next time they will bring you nothing."','「専門家に、部屋の前で、その原因は原因ではないと言った。次は何も持ってこなくなる。」')}</div>`+coach('rca_dismiss'));
  if(r.minor.includes('rca_circular')) b.push(`<div class="feedback tip">${L('"Old machine, hence TurboStitch, hence old machine. You went round that carousel more than once."','「古い機械、だからターボステッチ、だから古い機械。あの回転木馬に何度も乗ったね。」')}</div>`+coach('rca_circular'));
  if(r.minor.includes('rca_long')) b.push(`<div class="feedback tip">${L('"Three sessions. Miko rang the bell."','「3セッション。ミコが鈴を鳴らした。」')}</div>`+coach('rca_long'));
  if(r.crit.includes('rca_missing')) b.push(`<div class="feedback badf">🐉 ${L('"Empty bones. A fish with no spine."','「空の骨。背骨のない魚だ。」')}</div>`+coach('rca_missing'));
  if(r.crit.includes('rca_opinion')) b.push(`<div class="feedback badf">🐉 ${L('"‘Cause: the machine.’ ‘Cause: the weather.’ ‘Cause: nothing, the gate is fine.’ You wrote down the first sentence each of them said and called it Analyze."','「『原因：機械』。『原因：天気』。『原因：なし、門は大丈夫』。きみは彼らが最初に言った一文を書き留めて、それをAnalyzeと呼んだ。」')}</div>`+coach('rca_opinion'));
  if(r.crit.includes('rca_blame')) b.push(`<div class="feedback badf">🐉 ${L('"And there she is again — the night shift, on the PEOPLE bone, after Measure showed you 4.7 against 4.9." Smoke. "That is not a cause. That is a habit."','「そしてまた彼女だ——「人」の骨に夜勤、Measureが4.7対4.9を見せたあとで。」煙。「それは原因ではない。癖だ。」')}</div>`+coach('rca_blame'));
  if(r.crit.includes('rca_shallow')||r.minor.includes('rca_shallow')) b.push(`<div class="feedback ${r.crit.includes('rca_shallow')?'badf':'tip'}">${L('"‘Tension drifts.’ ‘Fluff gets wet.’ True. Fix them and they return next season. Why does it drift? Why does it get wet? You stopped one question early."','「『張力がずれる』。『綿が湿る』。本当だ。直しても次の季節に戻ってくる。なぜずれる？なぜ湿る？きみは一問早く止まった。」')}</div>`+coach('rca_shallow'));
  if(r.minor.includes('rca_solution')) b.push(`<div class="feedback tip">${L('"Retune more. Stuff less. You offered fixes twice before you knew what was broken."','「もっと調律。詰め物を減らす。壊れているものを知る前に、きみは二度、修理を申し出た。」')}</div>`+coach('rca_solution'));
  if(!b.length) b.push(`<div class="feedback good">${L('"A missing lock nut with no spec behind it. Fluff by a door nobody owns. A standard that never held the check. A gate that cannot see. A thread nobody verified." She turns the page slowly. "Five bones, five systems. Not one person."','「仕様のないロックナットの欠落。誰も担当しない扉のそばの綿。検査を含まなかった標準。見えない門。誰も検証しなかった糸。」彼女はゆっくりページをめくる。「5本の骨、5つの仕組み。人は一人もいない。」')}</div>`);
  return b; },'a_tg_verify'); },
a_tg_verify(){ tgPageA(L('Verification. Which of these survived a comparison — and which did you merely believe?','検証。比較に耐えたのはどれか——そして、ただ信じただけなのはどれか？'),r=>{ const b=[];
  if(r.crit.includes('ver_none')||r.minor.includes('ver_none')) b.push(`<div class="feedback ${r.crit.includes('ver_none')?'badf':'tip'}">${L('"Untested causes. Stories with confident faces."','「未検証の原因。自信ありげな顔をした物語だ。」')}</div>`+coach('ver_none'));
  if(r.crit.includes('ver_falseconfirm')) b.push(`<div class="feedback badf">🐉 ${L('"Confirmed." She taps a chart that is perfectly flat. "With a p-value of — what is this — point six. You confirmed a hypothesis because you liked it."','「確認。」彼女は完全に平坦なチャートを叩く。「p値は——これは何——0.6。気に入ったから仮説を確認したね。」')}</div>`+coach('ver_falseconfirm'));
  if(r.crit.includes('ver_falsereject')) b.push(`<div class="feedback badf">🐉 ${L('"Rejected." She holds up a chart with a cliff in it. "The data shouted yes and you wrote no. Improve now has a hole where that fix should be."','「棄却。」彼女は崖のあるチャートを掲げる。「データは「はい」と叫び、きみは「いいえ」と書いた。Improveには、その対策があるべき場所に穴が開いた。」')}</div>`+coach('ver_falsereject'));
  if(r.crit.includes('ver_opinion')) b.push(`<div class="feedback badf">🐉 ${L('"‘Verified: Capy agrees.’" A long exhale. "Capy agrees with weather forecasts."','「『検証済み：カピーが同意』。」長い吐息。「カピーは天気予報にも同意する。」')}</div>`+coach('ver_opinion'));
  if(r.minor.includes('ver_wrong')) b.push(`<div class="feedback tip">${L('"The right cause, the wrong test. Match the test to the shape of the question."','「正しい原因、間違った検証。問いの形に検証を合わせて。」')}</div>`+coach('ver_wrong'));
  if(r.crit.includes('ver_ignore')) b.push(`<div class="feedback badf">🐉 ${L('"Night versus day: no difference. Your own test. And the night shift is STILL on the list for Improve." The tea service rattles. "At what point does the data get a vote?"','「夜勤対日勤：差なし。きみ自身の検証だ。それでも夜勤は「まだ」Improveのリストにある。」茶器が鳴る。「データに投票権が与えられるのは、いつなんだ？」')}</div>`+coach('ver_ignore'));
  if(r.minor.includes('ver_nodata')) b.push(`<div class="feedback tip">${L('"Two days re-collecting what Measure should have tagged. Analyze paid Measure’s bill."','「Measureがタグ付けすべきだったものを2日かけて再収集。AnalyzeがMeasureの請求書を払った。」')}</div>`+coach('ver_nodata'));
  if(!b.length) b.push(`<div class="feedback good">${L('"Every chart read for what it showed, not for who drew it. The ones that held, confirmed; the ones that fell, pinned in red with their p-values." She sets down the glasses. "Causes. Not stories."','「層別、前後比較、引張試験、そして「否」と言い、それが従われた比率検定。」彼女は眼鏡を置く。「原因だ。物語ではなく。」')}</div>`);
  return b; },'a_tg_vital'); },
a_tg_vital(){ tgPageA(L('Last: what you are handing Improve.','最後に：Improveに渡すもの。'),r=>{ const b=[];
  if(false) b.push(`<div class="feedback badf">🐉 ${L('"An unproven cause on the Improve list. It will absorb a solution and my gold and change nothing."','「Improveのリストに未証明の原因。それは解決策とわたしの金を吸い込んで、何も変えない。」')}</div>`+coach('vital_wrong'));
  if(r.minor.includes('vital_missing')) b.push(`<div class="feedback tip">${L('"Thin. The evidence supports more than you handed over."','「薄い。証拠はきみが渡した以上を支えている。」')}</div>`+coach('vital_missing'));
  if(r.minor.includes('a_late')) b.push(`<div class="feedback tip">${L(`"Day ${fmtDays(daysUsed())}. I said ${ANALYZE_DEADLINE}."`,`「${fmtDays(daysUsed())}日目。私は${ANALYZE_DEADLINE}と言った。」`)}</div>`+coach('a_late'));
  if(!b.length) b.push(`<div class="feedback good">${L('"Verified, ranked, and short enough to fix." She closes the folder. "Improve has something to improve."','「検証済み、順位付け済み、そして直せる程度に短い。」彼女はフォルダを閉じる。「Improveには改善すべきものがある。」')}</div>`);
  return b; },'a_tg_verdict'); },
a_tg_verdict(){
  const r=evalAnalyze(), a=A();
  if(r.crit.length===0){ const honors=r.minor.length<=2&&a.tgAttempts===1&&!analyzeLate();
    setDragonMood(honors?'softened':'approving'); setPlayerMood('determined');
    say(nm('Empress Scarlet'),honors?'dragon:softened':'dragon:approving',honors?L('PASSED. Every cause on this list would survive a hostile reading. Go and fix them — and take Capy’s laminated sheet with you.','合格。このリストのすべての原因は敵意ある読みにも耐える。直しに行きなさい——カピーのラミネートした票も持って。'):L('PASSED, with red ink. Causes, mostly. Sand the edges before Improve.','合格——赤インクつきで。おおむね原因だ。Improveの前に端を研いで。'),()=>{
      a.scoreAnalyze=Math.max(0,(honors?100:80)-4*(S.consults||0)-3*Math.ceil(Math.max(0,daysUsed()-ANALYZE_DEADLINE)));
      interact((r.minor.length?lessonList(r.minor):'')+`<button class="btn" id="nx">${L('Celebrate ✦','祝う ✦')}</button>`); $('nx').onclick=()=>go('a_epilogue'); });
  } else { setDragonMood('furious'); shakeScene(); smokeBurst(4); setPlayerMood('nervous');
    say(nm('Empress Scarlet'),'dragon:furious',L('REJECTED — for now. Improve cannot fix a story. One week. Go back to the bones.','却下——今のところは。Improveは物語を直せない。1週間。骨に戻りなさい。'),()=>{
      S.daysLost+=7; S.reworkMode=true; interact(lessonList(r.crit.concat(r.minor))+`<button class="btn" id="nx">${L('Face the rework week ✦','手戻りの週へ ✦')}</button>`); $('nx').onclick=()=>go('a_rework'); });
  }
},
a_rework(){
  drawWarroom(); banner(L('REWORK WEEK · Analyze','手戻り週 · Analyze')); S.reworkMode=true; const r=evalAnalyze(), a=A();
  say(nm('Uni the Unicorn'),'uni:concerned',L('Tempers have cooled; every SME will talk again. Here is what she flagged.','怒りは冷めた。SMEは皆また話してくれる。彼女の指摘はこれだ。'),()=>{
    const has=(...f)=>f.some(x=>r.crit.includes(x)||r.minor.includes(x)); let h=lessonList(r.crit.concat(r.minor))+'<div class="choices">';
    if(has('rca_missing','rca_opinion','rca_blame','rca_shallow','rca_solution','rca_loud','rca_dismiss','rca_circular')) h+=`<button class="choice" id="fx_rca"><span class="tag">${L('Workshop','ワークショップ')}</span>${L('Reconvene the room (bad marks cleared; pushed-back SMEs will answer again; vote re-run)','部屋を再招集（誤った指定は消去、押し返したSMEも再び答える、投票やり直し）')}</button>`;
    if(has('ver_none','ver_opinion','ver_wrong','ver_ignore','ver_nodata','ver_falseconfirm','ver_falsereject','vital_missing')) h+=`<button class="choice" id="fx_ver"><span class="tag">${L('Verification','検証')}</span>${L('Re-run the tests','検証をやり直す')}</button>`;

    h+='</div>'; const clean=r.crit.length===0; h+=`<button class="btn" id="retg" ${clean?'':'disabled'}>${L('Request a new tollgate (+1 day) ✦','再審査を要請（+1日）✦')}</button>`; interact(h);
    const wire=(id,fn)=>{const b=$(id); if(b) b.onclick=fn;};
    wire('fx_rca',()=>{ const T=TREE(); a.marks=(a.marks||[]).filter(id=>T[id]&&T[id].kind==='root'); Object.keys(a.rec||{}).forEach(id=>{ if(T[id]&&!TRUE_KINDS.includes(T[id].kind)&&T[id].kind!=='hypo') delete a.rec[id]; }); a.rejTrue={}; a.loud=false; a.carried=null; a.mydots=[]; a.dismissed=0; a.loops=0; a.clock=SESSION_MIN; syncBones(a); Object.keys(a.verify).forEach(id=>{ if(!a.bones[id]) delete a.verify[id]; }); a.vital=a.vital.filter(id=>a.bones[id]); go('a_rca'); });
    wire('fx_ver',()=>{ const sim=a.sim||{truth:{}}; Object.keys(a.verify).forEach(id=>{ const v=a.verify[id].v; if((v==='confirm')!==!!sim.truth[id]) delete a.verify[id]; }); delete a.vd; go('a_verify'); });
    wire('retg',()=>{ S.day++; S.reworkMode=false; go('a_tg_intro'); });
  });
},
a_epilogue(){
  const a=A(); drawBackdrop('scene_floor'); banner(L('ANALYZE · COMPLETE','ANALYZE · 完了'));
  const total=scoreDefine()+(S.m&&S.m.scoreMeasure||0)+(a.scoreAnalyze||0);
  narrate(L('On the wall, under the run chart and the fish, a new line in Penny’s handwriting: "Night shift: 4.7. Day shift: 4.9. Rejected." Luna has drawn a small heart beside it.','壁の、ランチャートと魚の下に、ペニーの字で新しい一行：「夜勤：4.7。日勤：4.9。棄却。」ルナがその横に小さなハートを描いている。'));
  say(nm('Uni the Unicorn'),'uni:happy',L('Five root causes, each with a test behind it, and a grudge crossed out by its own numbers. That is Analyze. Chapter 4 — IMPROVE — is where Torto finally gets a lock nut, and possibly a biscuit.','5つの根本原因、それぞれに検証が付き、恨みは自らの数字で消された。それがAnalyzeだ。第4章「IMPROVE」——トルトがついにロックナットを手にする場所だ。たぶんビスケットも。'),()=>{
    interact(`<div class="center"><h1 class="title-h">${L('✦ Chapter 3 Complete ✦','✦ 第3章 クリア ✦')}</h1><div style="margin:10px 0"><span class="pill">Define: ${scoreDefine()}</span> <span class="pill">Measure: ${S.m&&S.m.scoreMeasure||0}</span> <span class="pill">Analyze: ${a.scoreAnalyze}</span> <span class="pill"><b>${L('Project score','プロジェクト得点')}: ${total}</b></span></div>
      <button class="btn center-btn" id="next4">${L('Continue to Chapter 4 — IMPROVE ✦','第4章 IMPROVE へ ✦')}</button></div>`);
    $('next4').onclick=()=>go('i_card');
  });
},
});
/* ---------- the RCA workshop: every SME in the room, causes storm → why-drills → multi-vote ---------- */
Object.assign(LESSON,{
  rca_dismiss:{t:'A cause dismissed before it was explored',d:'In a cause storm, everything goes on the board — the wrong ones included. Dismissing an SME’s cause in front of the room teaches the room to stop offering causes. Capture all, judge later with why-questions and data.'},
  rca_loud:{t:'The loudest voice chose the causes',d:'Torto insisted; Capy insisted; you let them. Multi-voting exists precisely so that priority comes from the whole room, not from seniority or volume. Whatever they chose still has to survive verification — and now the room has learned that shouting works.'},
  rca_circular:{t:'Caught in circular reasoning',d:'"We need the TurboStitch because the machine is old, and it is old, so we need the TurboStitch." A why-chain that returns to where it started has not moved. Break the loop by asking what SPECIFICALLY happens — a behaviour, a measurement, a date — not what something IS.'},
  rca_long:{t:'The workshop dragged on',d:'Four sessions for one cause storm. Good facilitation keeps the room moving: park, capture, ask the next why. The SMEs have a factory to run.'},
});
/* ---------- RCA workshop v3: a branching why-tree per Measure pattern ---------- */
const WHY_MIN=15, REJ_TRUE_MIN=30, SESSION_MIN=300;
/* multi-speaker exchange: the player taps "Next: <name>" between speakers */
function sayq(lines,cb){
  let k=0; const nb=$('nextbtn');
  const one=()=>{ const ln=lines[k++]; const last=k>=lines.length;
    say(nm(ln.who),ln.cls,ln.say,()=>{ if(last){ if(cb) cb(); return; }
      interact('');
      if(nb){ nb.textContent=`${L('Next','次')}: ${nm(lines[k].who).split(' ')[0]} ▸`; nb.style.display='inline-block'; nb.onclick=()=>{ nb.style.display='none'; one(); }; }
      $('text').onclick=()=>{ if(nb) nb.style.display='none'; one(); };
    }); };
  one();
}
/* branches = Measure's stratification patterns; each has a why-question node whose answers form a tree */
const PATTERNS=()=>{ const c=carryM(); return [
  {id:'m3',q:'q_m3',bone:'machine',t:c.hasTod?L('Machine 3 · after lunch','マシン3・昼食後'):L('Machine 3 (time-of-day not tagged)','マシン3（時間帯タグなし）'),ask:L('Why is Machine 3 worse after lunch?','なぜマシン3は昼食後に悪くなる？')},
  {id:'humid',q:'q_humid',bone:'env',t:c.hasHumid&&!c.cherry?L('Humid weeks 5 &amp; 9','多湿の第5・9週'):L('Humid weeks (data thin)','多湿の週（データ薄い）'),ask:L('Why are the humid weeks worse?','なぜ多湿の週は悪い？')},
  {id:'skip',q:'q_skip',bone:'method',t:L('Shifts that skipped the check','検査を省略したシフト'),ask:L('Why do shifts that skip the check escape more?','なぜ検査を省略したシフトは流出が多い？')},
  {id:'march',q:'q_march',bone:'material',t:L('Jump after March','3月以降の跳ね上がり'),ask:L('Why did returns jump after March?','なぜ3月以降に返品が跳ね上がった？')},
  {id:'escape',q:'q_escape',bone:'measure',t:L('Escapes past the gate','門を通過した流出'),ask:L('Why do loose smiles get past the gate?','なぜ緩んだ笑顔は門を通過する？')}]; };
/* node kinds: root (organisational cause — valid stopping point) · cause (true, but a why remains) · symptom · opinion · blame · solution · loop (circular) · hypo (untestable) · reject (data already said no) · dead (no answer) */
const N=(id,who,cls,say,kind,short,kids,extra)=>Object.assign({id,who,cls,say,kind,short,kids:kids||[]},extra||{});
const TREE=()=>{ const t={}; const add=n=>{t[n.id]=n;};
 /* ================= Machine 3 · after lunch ================= */
 add(N('q_m3','Uni the Unicorn','uni',null,'q',null,['t_old','t_slack','l_sun']));
 add(N('t_old','Torto','torto:ranting',L('Because it is OLD. Machine 3 is forty years old and the TurboStitch 9000 is not. Write “machine”, underline it, and buy the TurboStitch.','古いからだ。マシン3は40歳で、ターボステッチ9000はそうじゃない。「機械」と書いて下線を引いて、ターボステッチを買え。'),'solution',L('“old — need TurboStitch”','「古い——ターボステッチが必要」'),['t_old2'],{bone:'machine'}));
 add(N('t_old2','Torto','torto:ranting',L('Why is an old machine bad? Because an old machine cannot hold a stitch, youngster. Everybody knows that.','古い機械がなぜ悪いか？古い機械は縫い目を保てないからだよ、若いの。誰でも知ってる。'),'symptom',L('“old machines can’t hold a stitch”','「古い機械は縫い目を保てない」'),['t_old3'],{bone:'machine',trap:L('Replace the machine? Machines 1, 2 and 4 are the same age and do not drift.','機械を替える？マシン1、2、4も同じ年式でずれない。')}));
 add(N('t_old3','Torto','torto:ranting',L('Why can it not hold a stitch? Because it is OLD. Which is why we need the TurboStitch. We have been here before, and you keep not hearing it.','なぜ保てないか？古いからだ。だからターボステッチが要る。前にも来た場所だぞ、きみが聞かないから。'),'loop',L('“…because it’s old” (circular)','「…古いから」（堂々巡り）'),[],{bone:'machine'}));
 add(N('t_slack','Torto','torto',L('*grumbles* Fine. Not “old”. The thread goes slack. I set the tension at seven o’clock and it is perfect; by two it has drifted loose and the smiles open after a few hugs. Machines 1, 2 and 4 hold all day.','*ぶつぶつ* いいだろう。「古い」じゃない。糸がたるむ。7時に張力を合わせれば完璧、2時には緩んで数回ハグで笑顔が開く。マシン1、2、4は一日中保つ。'),'symptom',L('tension drifts loose by afternoon (M3 only)','午後に張力が緩む（M3のみ）'),['t_knob','p_thermal','c_retune'],{bone:'machine',trap:L('Retune after lunch? Torto already does — by ear, every day — and it drifts again tomorrow. That is the symptom, not the cause.','昼に調律し直す？トルトはもうしている——耳で、毎日——そして明日もまたずれる。それは症状で、原因ではない。'),also:[{who:'Penny Penguin',cls:'penny',say:L('That matches my bench. Loose tension is exactly what shows as a two-millimetre opening after the hug test. The question is why it LOSES tension between seven and two.','私の作業台と一致する。張力の緩みは、ハグ試験後の2ミリの開きとしてまさに現れる。問題は、なぜ7時から2時の間に張力を「失う」かよ。')}]}));
 add(N('c_retune','Captain Capy','capy:worried',L('It drifts because Torto retunes it by ear at lunch and gets it wrong. No offence, Torto.','昼にトルトが耳で調律して外すからずれるんだ。悪気はない、トルト。'),'blame',L('“Torto retunes it wrong”','「トルトの調律が悪い」'),['t_retune_r'],{bone:'machine',also:[{who:'Torto',cls:'torto:ranting',say:L('Offence TAKEN. I retune it because it DRIFTS, Captain. You have the arrow backwards.','悪気、受け取った。ずれるから調律するんだ、大佐。矢印が逆だ。')}]}));
 add(N('t_retune_r','Torto','torto:ranting',L('Why do I retune it? Because it has drifted by lunch! Ask me why it drifts and I will tell you about the knob. Ask me why I retune and we go round again.','なぜ調律するか？昼までにずれてるからだ！なぜずれるか聞けばノブの話をする。なぜ調律するか聞けば、また堂々巡りだ。'),'loop',L('“I retune because it drifts” (back to the symptom)','「ずれるから調律する」（症状に戻る）'),[],{bone:'machine'}));
 /* --- mechanical path --- */
 add(N('t_knob','Torto','torto:content',L('*quieter* Why does it lose tension? The knob backs off. Every stitch is a little shake, and by two o’clock the knob has walked a quarter turn. There was a lock nut on it — it came off during the spring repair, and the replacement never came.','*静かに* なぜ張力を失う？ノブが戻るんだ。一針ごとに小さな揺れがあって、2時にはノブが4分の1回転動いている。ロックナットが付いてた——春の修理で外れて、交換品は来なかった。'),'cause',L('knob backs off under vibration — lock nut missing','振動でノブが戻る——ロックナット欠落'),['t_spec','t_vib','l_sched'],{bone:'machine',trap:L('Fit a nut and walk away? The next repair loses it again — nothing says it must be there.','ナットを付けて終わり？次の修理でまた失われる——そこにあるべきだと書いたものがない。'),also:[{who:'Luna Axolotl',cls:'luna:thoughtful',say:L('The paint witness mark on that knob hasn’t lined up since spring. I thought it was meant to look like that.','あのノブの合いマークは春から揃ってない。そういうものだと思ってた。')}]}));
 add(N('t_spec','Torto','torto:content',L('Why did the nut never come? There is no part spec for the tension assembly, so it was never on a reorder list. Nobody knew what to order. I asked once. I was told to “make do”.','なぜナットが来なかった？張力機構の部品仕様がないから、発注リストに載ったことがない。何を頼めばいいか誰も知らなかった。一度聞いた。「何とかしろ」と言われた。'),'root',L('no part spec → nut never reordered','部品仕様なし→ナット未再発注'),['t_iam'],{bone:'machine',card:'ax_locknut',fix:L('a written part spec for the tension assembly, lock nut included, on the reorder list','張力機構の部品仕様書（ロックナット込み）を再発注リストに')}));
 add(N('t_iam','Torto','torto:impressed',L('Why no spec? Because I AM the spec, youngster. Forty years. …Which, said out loud, sounds less like a system than I thought.','なぜ仕様がない？私が仕様だからだ、若いの。40年。…声に出すと、思ったより仕組みらしくないな。'),'root',L('machine knowledge lives in one head','機械の知識が1人の頭の中'),[],{bone:'machine',card:'ax_locknut',fix:L('document Machine 3 — specs, settings, checks — so the process does not retire with Torto','マシン3を文書化——仕様・設定・確認——トルトの退職と共に工程が消えないように'),also:[{who:'Uni the Unicorn',cls:'uni',say:L('That is the organisation talking. You are at a root.','それが組織の答えだ。根本に着いた。')}]}));
 add(N('t_vib','Torto','torto',L('Why does it shake more than the others? It never used to. Since the spring repair the belt hums — the flywheel is not running true.','なぜ他より揺れる？前はそうじゃなかった。春の修理からベルトが唸る——フライホイールが真円で回ってない。'),'cause',L('M3 vibrates more since the spring repair','春の修理からM3の振動増'),['c_belt','p_checklist'],{bone:'machine',trap:L('Tighten the belt? Which belt — and who checks it next month?','ベルトを締める？どのベルトを——来月は誰が確認する？')}));
 add(N('c_belt','Captain Capy','capy:worried',L('Why since the repair? …The repair used a belt from the general store. A near-size. The proper one was not in stock and the line was down, so I said use what we have.','なぜ修理から？…修理には一般倉庫のベルトを使った。近いサイズ。正規品が在庫になくて、ラインが止まってたから、あるものを使えと言った。'),'cause',L('repair used a near-size belt (not in stock)','修理に近似サイズのベルト（在庫なし）'),['c_nostock'],{bone:'machine',trap:L('Order the right belt now? Yes — and the next breakdown will meet an empty shelf again.','正しいベルトを今注文？ええ——そして次の故障もまた空の棚に出会う。')}));
 add(N('c_nostock','Captain Capy','capy:embarrassed',L('Why not in stock? There is no spare-parts list for Machine 3. Parts are bought when something breaks, from whatever the catalogue says that day.','なぜ在庫がない？マシン3の予備部品リストがない。部品は壊れたときに、その日カタログにあるものを買う。'),'root',L('no spare-parts list — buy when broken','予備部品リストなし——壊れてから買う'),[],{bone:'machine',card:'ax_locknut',fix:L('a critical-spares list for Machine 3 with minimum stock','マシン3の重要予備部品リストと最低在庫')}));
 add(N('p_checklist','Penny Penguin','penny:stern',L('And why did nobody catch a humming belt and a missing nut after the repair? Because nothing says to look. There is no post-repair verification — no “check vibration, check tension, sign here”. The machine is handed back when it turns on.','なぜ修理後に唸るベルトと欠けたナットに誰も気づかなかった？見ろと書いたものがないから。修理後の検証がない——「振動確認、張力確認、ここに署名」がない。機械は電源が入れば返される。'),'root',L('no post-repair verification','修理後の検証なし'),[],{bone:'machine',card:'ax_locknut',fix:L('a post-repair checklist: vibration, tension, guards, sign-off before handback','修理後チェックリスト：振動・張力・ガード・引き渡し前の署名')}));
 add(N('l_sched','Luna Axolotl','luna:thoughtful',L('And why does nobody notice the drift until smiles pop? Nobody checks tension on a schedule. There is no gauge on the line. Torto’s ear is the check — and Torto goes to lunch.','なぜ笑顔がほどけるまで誰もずれに気づかない？誰も張力を定期的に確認しない。ラインにゲージがない。トルトの耳が検査——そしてトルトは昼食に行く。'),'root',L('no scheduled tension check, no gauge','張力の定期確認なし・ゲージなし'),['c_sched'],{bone:'machine',card:'ax_locknut',fix:L('an hourly tension check with a line gauge, on the shift sheet','シフト表に毎時の張力確認とライン用ゲージ')}));
 add(N('c_sched','Captain Capy','capy:embarrassed',L('Why no schedule? The maintenance sheet lists oiling and belts. It was copied from the old Machine 1 manual, years ago. Tension isn’t on it because Machine 1 didn’t have a tension knob.','なぜ予定がない？保守表には注油とベルト。何年も前に旧マシン1のマニュアルから写した。マシン1に張力ノブがなかったから、張力は載ってない。'),'root',L('maintenance sheet copied from another machine','保守表は別の機械から転記'),[],{bone:'machine',card:'ax_locknut',fix:L('a maintenance plan written for Machine 3 itself','マシン3自身のための保守計画')}));
 /* --- thermal path --- */
 add(N('p_thermal','Penny Penguin','penny',L('There is a second thing. I taped a thermometer to each head last week. Machine 3 runs twelve degrees hotter by two o’clock than the others. A hot tension spring loses preload — the thread loosens even if nobody touches the knob.','もう1つ。先週、各ヘッドに温度計を貼った。マシン3は2時には他より12度熱い。熱い張力ばねはプリロードを失う——誰もノブに触らなくても糸が緩む。'),'cause',L('M3 head runs 12° hotter → spring loses preload','M3ヘッドが12度高温→ばねのプリロード低下'),['t_fan'],{bone:'machine',trap:L('Compensate for heat with a tighter morning setting? Then the mornings are too tight and the thread snaps.','熱を見越して朝きつめに設定？なら朝はきつすぎて糸が切れる。'),also:[{who:'Torto',cls:'torto:impressed',say:L('…Twelve degrees. I could feel it on my hand and never thought to ask.','…12度。手で感じてたのに、聞こうと思わなかった。')}]}));
 add(N('t_fan','Torto','torto:content',L('Why does it run hot? The head fan. It rattled after the spring repair, so it was taken off to find the rattle, and… it is still on the bench. Under the catalogue.','なぜ熱くなる？ヘッドのファンだ。春の修理の後にカタカタ鳴ったから、原因を探すのに外して…まだ作業台の上だ。カタログの下に。'),'cause',L('head fan removed after the repair, never refitted','修理後にヘッドファンを外し、未復旧'),['t_fan2'],{bone:'machine',trap:L('Refit the fan? Do — and ask why a machine can run for five months with a part on the bench.','ファンを戻す？そうして——そして、部品を作業台に置いたまま機械が5か月動ける理由を聞く。')}));
 add(N('t_fan2','Torto','torto:content',L('Why is it still on the bench? Nobody looked. The repair was closed when the machine turned on. No one checks a machine against how it was BEFORE the repair — there is no list of what should be on it.','なぜまだ作業台に？誰も見なかった。機械が動いた時点で修理は完了。修理「前」の状態と照らす人はいない——何が付いているべきかのリストがない。'),'root',L('no post-repair check against the machine’s configuration','修理後に機械構成との照合なし'),[],{bone:'machine',card:'ax_locknut',fix:L('a configuration list for Machine 3 and a post-repair check against it','マシン3の構成リストと、修理後のそれとの照合')}));
 add(N('l_sun','Luna Axolotl','luna',L('Maybe the afternoon sun? The floor by Machine 3 gets warm after lunch.','午後の日差しかも？マシン3のそばの床は昼過ぎに暖かくなる。'),'reject',L('“afternoon sun warms Machine 3”','「午後の日差しでマシン3が温まる」'),[],{bone:'machine',also:[{who:'Penny Penguin',cls:'penny',say:L('Machines 1, 2 and 4 sit in the same sun and do not drift. The data does not support it.','マシン1、2、4も同じ日差しの中にあってずれない。データは支持しない。')}]}));

 /* ================= Humid weeks ================= */
 add(N('q_humid','Uni the Unicorn','uni',null,'q',null,['l_damp','t_weather','m_holiday']));
 add(N('l_damp','Luna Axolotl','luna:thoughtful',L('When the air is wet the fluff clumps and feels soft. We push more in to make the plushie feel right — and the seam takes the strain when it is squeezed.','空気が湿ると綿が固まって柔らかく感じる。ぬいぐるみの感触を合わせるためにもっと詰める——そして握られると縫い目に負担がかかる。'),'symptom',L('damp fluff → overstuffed → seam strained','湿った綿→詰めすぎ→縫い目に負担'),['l_feel','l_door'],{bone:'env',trap:L('Stuff less on humid days? The plushies come out thin, and nobody agrees what “less” is.','湿気の日は詰め物を減らす？ぬいぐるみが痩せて、「減らす」が何かで誰も一致しない。')}));
 add(N('l_feel','Luna Axolotl','luna',L('Why do we push more in? The standard says “stuff until firm”. Firm is a feeling. Damp fluff feels soft, so we keep going.','なぜもっと詰める？標準は「固くなるまで詰める」。固さは感覚。湿った綿は柔らかく感じるから、詰め続ける。'),'cause',L('stuffing standard is “until firm” — a feeling','詰め標準は「固くなるまで」——感覚'),['c_noscale'],{bone:'env',trap:L('Train people to feel “firm” better? Firm changes with the weather; the training will not.','「固さ」の感覚を教育？固さは天気で変わる——教育は変わらない。')}));
 add(N('c_noscale','Captain Capy','capy:embarrassed',L('Why by feel? There is no scale at the station. Old Bun wrote “firm to the touch” eleven years ago and nobody has weighed a plushie since.','なぜ感覚で？作業台に秤がない。オールド・バンが11年前に「触って固く」と書いて、それ以来誰もぬいぐるみを量ってない。'),'root',L('no quantitative stuffing spec (no scale)','定量的な詰め仕様なし（秤なし）'),[],{bone:'env',card:'ax_fluff',fix:L('a stuffing weight spec and a scale at the station','詰め重量の仕様と作業台の秤')}));
 add(N('l_door','Luna Axolotl','luna',L('Why is the fluff damp at all? The bales arrive wrapped, but they sit unwrapped by the loading door, and the door is open half the day.','そもそもなぜ綿が湿る？俵は包装されて届くけど、開封されたまま搬入口の扉のそばに置かれ、扉は半日開いてる。'),'cause',L('bales unwrapped by an open loading door','開いた搬入口で俵が開封放置'),['c_strip','m_misc','l_open'],{bone:'env',trap:L('Move the bales? Fine — who decides where, and who moves them back next week?','俵を移す？いい——どこへ、誰が決めて、来週は誰が戻す？')}));
 add(N('c_strip','Captain Capy','capy',L('Why unwrapped? The day crew strips the wrap on arrival so the bales are ready to grab. Speed. Nobody wants to fight plastic at six in the morning.','なぜ開封？日勤が到着時に包装を剥がして、すぐ使えるようにする。スピードだ。朝6時にビニールと格闘したい人はいない。'),'cause',L('crew strips wrap on arrival (speed)','到着時に包装を剥がす（速さ）'),['c_noinstr'],{bone:'env',trap:L('Tell them to stop? They were never told to start. Fix the instruction, not the crew.','やめろと言う？始めろとも言われていない。人ではなく指示を直す。')}));
 add(N('c_noinstr','Captain Capy','capy:embarrassed',L('Why do they do that? Because nobody told them not to. The receiving procedure says where to sign — it says nothing about how or where to store fluff.','なぜそうする？誰もやめろと言わなかったから。受入手順にはどこにサインするかは書いてある——綿をどう、どこに保管するかは何も書いてない。'),'root',L('no storage step in the receiving procedure','受入手順に保管の工程なし'),[],{bone:'env',card:'ax_fluff',fix:L('a storage step in receiving: sealed, off the floor, away from the door','受入手順に保管工程：密閉・床上げ・扉から離す')}));
 add(N('m_misc','Miko Cat','miko:dramatic',L('Why by the door? Because the storeroom has had no owner since Old Bun retired, nya. On the org chart it is filed under “misc”. Nobody owns misc. Misc owns us.','なぜ扉のそば？オールド・バンが退職してから保管室に担当がいないからニャ。組織図では「その他」。誰も「その他」を担当しない。「その他」が私たちを支配してる。'),'root',L('storeroom has no owner (“misc”)','保管室に担当なし（「その他」）'),[],{bone:'env',card:'ax_fluff',fix:L('a named storeroom owner with a humidity check on their sheet','保管室の担当者指名と、シートに湿度確認'),also:[{who:'Uni the Unicorn',cls:'uni',say:L('An organisational answer — an owner that does not exist. That is a root.','組織の答えだ——存在しない担当者。それが根本。')}]}));
 add(N('l_open','Luna Axolotl','luna:thoughtful',L('Why is the door open half the day? Deliveries come whenever the suppliers like — thread at nine, fluff at eleven, boxes at three. Someone is always propping it.','なぜ扉が半日開いてる？納品は業者の好きな時間に来る——糸は9時、綿は11時、箱は3時。誰かがいつも開けっ放しにしてる。'),'cause',L('deliveries all day → door propped open','納品が一日中→扉が開放'),['c_window'],{bone:'env',trap:L('Close the door? It opens for the next truck in twenty minutes.','扉を閉める？20分後の次のトラックでまた開く。')}));
 add(N('c_window','Captain Capy','capy',L('Why all day? We never set a receiving window. The suppliers deliver on their schedule because we never gave them ours.','なぜ一日中？受入時間帯を決めたことがない。業者は自分の予定で納品する——こちらの予定を伝えたことがないから。'),'root',L('no receiving window agreed with suppliers','業者と合意した受入時間帯なし'),[],{bone:'env',card:'ax_fluff',fix:L('a receiving window (say 7–9) written into supplier agreements','業者契約に受入時間帯（例：7〜9時）を明記')}));
 add(N('t_weather','Torto','torto',L('Weather. You cannot fix weather. Next branch.','天気だ。天気は直せない。次の枝。'),'opinion',L('“weather — can’t be fixed”','「天気——直せない」'),['t_weather2'],{bone:'env'}));
 add(N('t_weather2','Torto','torto',L('Why is the weather the cause? …Because it is the weather. What do you want from me, a barometer?','なぜ天気が原因か？…天気だからだ。何が欲しい、気圧計か？'),'dead',L('“because it’s the weather” (no answer)','「天気だから」（答えなし）'),[],{bone:'env'}));
 add(N('m_holiday','Miko Cat','miko:smug',L('Humid weeks are also holiday weeks, nya. More children at home. More hugs. Harder hugs.','多湿の週は休暇の週でもあるニャ。家にいる子どもが多い。ハグが多い。ハグが強い。'),'hypo',L('“holiday weeks = more hugs”','「休暇週＝ハグ増」'),['m_feel'],{bone:'env'}));
 add(N('m_feel','Miko Cat','miko',L('Why do I think so? …A feeling, nya. The letters are very passionate. I have no numbers.','なぜそう思う？…感覚ニャ。手紙がとても情熱的。数字はない。'),'hypo',L('a feeling — no data','感覚——データなし'),[],{bone:'env',also:[{who:'Uni the Unicorn',cls:'uni',say:L('Untestable for now. Park it — visibly, so Miko knows she was heard.','今は検証できない。「見える形で」保留に——ミコに聞いてもらえたと分かるように。')}]}));

 /* ================= Skipped-check shifts ================= */
 add(N('q_skip','Uni the Unicorn','uni',null,'q',null,['p_onlycatch','c_night','t_youngsters']));
 add(N('p_onlycatch','Penny Penguin','penny',L('Because the final check is the only place a loose smile is caught before shipping. Skip it and every loose smile walks out of the door.','最終検査が、出荷前に緩んだ笑顔を捕まえる唯一の場所だから。飛ばせば、緩んだ笑顔は全部扉から出ていく。'),'symptom',L('final check is the only catch point','最終検査が唯一の捕捉点'),['l_both','c_careless'],{bone:'method',trap:L('Make the check mandatory? It already is — on a poster. Ask why people skip a mandatory step.','検査を必須に？もう必須——ポスターで。必須の工程をなぜ飛ばすかを聞く。')}));
 add(N('c_night','Captain Capy','capy:worried',L('Because the night shift is careless. Half the returns come from night batches. I have said this before.','夜勤が不注意だからだ。返品の半分は夜のバッチ。前にも言った。'),'blame',L('“night shift is careless”','「夜勤が不注意」'),['l_same'],{bone:'method',also:[{who:'Luna Axolotl',cls:'luna:hurt',say:L('Night runs the same standard as day, Captain.','夜勤は日勤と同じ標準で動いてます、大佐。')},{who:'Captain Capy',cls:'capy',say:L('And yet.','それでもだ。')}]}));
 add(N('l_same','Luna Axolotl','luna:thoughtful',L('Why do the returns LOOK like night? Because night batches go straight onto the morning truck. Day batches sit on a pallet overnight and Penny’s team re-checks them when they have time. Both shifts make them; day’s get caught twice.','なぜ返品が夜に「見える」？夜のバッチは朝のトラックに直行するから。日勤のバッチは一晩パレットに置かれ、ペニーのチームが手が空いたら再確認する。両シフトが作り、日勤の分は2回捕まる。'),'cause',L('night batches miss the informal morning re-check','夜のバッチは朝の非公式再確認を受けない'),['p_informal'],{bone:'method',trap:L('Re-check night batches too? With whom, and in what procedure?','夜のバッチも再確認？誰が、どの手順で？'),also:[{who:'Penny Penguin',cls:'penny',say:L('True. Nobody asked us to spot-check the overnight pallets. Measure showed 4.7 against 4.9 — night equals day.','本当。夜置きのパレットの抜き取りは誰にも頼まれてない。Measureは4.7対4.9——夜勤＝日勤。')}]}));
 add(N('p_informal','Penny Penguin','penny:stern',L('Why is the re-check informal? Because it is in no procedure. We do it when we have time, because the pallets are there. Nobody decided that a second look exists — so nobody decided who gets one.','なぜ再確認が非公式？どの手順にもないから。パレットがそこにあるから、手が空いたらやる。2度目の確認が存在すると誰も決めていない——だから誰が受けるかも誰も決めていない。'),'root',L('the second look exists in no procedure','2度目の確認がどの手順にもない'),[],{bone:'method',card:'ax_stdwork',fix:L('decide the re-check formally — for all batches, or for none, with a rule','再確認を正式に決める——全バッチか、なしか、ルール付きで'),also:[{who:'Captain Capy',cls:'capy:embarrassed',say:L('…So the night shift is not careless. It is un-re-checked.','…つまり夜勤は不注意じゃない。再確認されてないだけだ。')}]}));
 add(N('c_careless','Captain Capy','capy:worried',L('Why is it skipped? People are careless when nobody is watching. Night, mostly.','なぜ飛ばされる？誰も見てないと人は不注意になる。主に夜。'),'blame',L('“careless when unwatched”','「見られてないと不注意」'),['l_same'],{bone:'method'}));
 add(N('l_both','Luna Axolotl','luna:thoughtful',L('Why is the check skipped? Because when a shift is behind, the check is the only step you can drop and still ship. Both shifts do it. I log it when it happens on nights. Day… does not log it.','なぜ検査が飛ばされる？シフトが遅れたとき、飛ばしても出荷できる唯一の工程が検査だから。両シフトともやる。夜はそうなったら私が記録する。日勤は…記録しない。'),'cause',L('check dropped when behind — both shifts','遅れると検査を落とす——両シフト'),['c_target','m_bonus'],{bone:'method',trap:L('Forbid dropping it? Then they ship late, and someone above Capy asks why.','落とすのを禁止？なら出荷が遅れて、大佐の上の誰かが理由を聞く。'),also:[{who:'Captain Capy',cls:'capy:embarrassed',say:L('…We don’t?','…しないのか？')}]}));
 add(N('c_target','Captain Capy','capy',L('Why are they behind? The target is three minutes a plushie. I wrote the standard work sheet myself, in year one, from the sewing stopwatch.','なぜ遅れる？目標は1体3分。標準作業票は私が1年目に、縫製のストップウォッチから作った。'),'cause',L('3-minute target set from sewing time only','3分目標は縫製時間のみで設定'),['c_never','p_noreview'],{bone:'method',trap:L('Change the target to seven minutes? On what basis — and who updates it when the next step is added?','目標を7分に？何を根拠に——次の工程が増えたら誰が更新する？'),also:[{who:'Penny Penguin',cls:'penny:stern',say:L('The final check alone is four minutes on a good day.','最終検査だけで、良い日でも4分。')}]}));
 add(N('c_never','Captain Capy','capy:embarrassed',L('*reads his own sheet* Why isn’t the check in it? …Because it was never added. Sew, stuff, close, ship. I set the takt from sewing and never revised it. Both shifts have been skipping a step that was never given time.','*自分の票を読む* なぜ検査が入ってない？…追加されなかったから。縫う、詰める、閉じる、出荷。縫製からタクトを決めて見直さなかった。両シフトとも、時間を与えられなかった工程を飛ばしてた。'),'root',L('check never in the standard work','検査が標準作業に未収録'),[],{bone:'method',card:'ax_stdwork',fix:L('rewrite standard work with the check inside the cycle; rebalance the line','検査をサイクル内に含めて標準作業を書き直し、ラインを再編'),also:[{who:'Luna Axolotl',cls:'luna:pleased',say:L('*quietly* Thank you, Captain.','*静かに* ありがとう、大佐。')}]}));
 add(N('p_noreview','Penny Penguin','penny:stern',L('And why did nobody catch that? Because nobody reviews standard work when a step is added. Inspection added the check three years ago. Production’s sheet never heard about it.','なぜ誰も気づかなかった？工程が追加されても誰も標準作業を見直さないから。検査は3年前に最終検査を追加した。生産の票はそれを聞いていない。'),'root',L('no review of standard work when steps change','工程変更時に標準作業の見直しなし'),[],{bone:'method',card:'ax_stdwork',fix:L('a rule: any added step triggers a standard-work review','ルール：工程追加は必ず標準作業の見直しを起動')}));
 add(N('m_bonus','Miko Cat','miko:smug',L('Why do they care so much about being behind, nya? The shift bonus. It is paid on units per shift. Accounting set it on the three-minute takt.','なぜそんなに遅れを気にするニャ？シフト手当。シフトあたりの生産数で払われる。経理が3分タクトで決めた。'),'cause',L('shift bonus paid on units/shift','シフト手当が生産数基準'),['m_metric'],{bone:'method',trap:L('Cancel the bonus? Then ask why the metric was ever “units” and not “good units”.','手当を廃止？その前に、なぜ指標が「良品数」でなく「生産数」だったのかを聞く。')}));
 add(N('m_metric','Miko Cat','miko',L('Why that metric? Nobody told Accounting a check had been added. The bonus sheet is older than QP-7, nya. Speed was the only number anyone ever sent us.','なぜその指標？検査が追加されたと誰も経理に伝えなかった。手当の表はQP-7より古いニャ。速さだけが、誰かが送ってくれた唯一の数字。'),'root',L('incentive rewards speed, not good units','報奨が速さを評価し良品を評価しない'),[],{bone:'method',card:'ax_stdwork',fix:L('pay the bonus on good units shipped, not units','手当を生産数でなく出荷良品数で')}));
 add(N('t_youngsters','Torto','torto',L('Because the youngsters do not care. In my day we cared.','若者が気にしないからだ。私の頃は気にしたもんだ。'),'blame',L('“youngsters don’t care”','「若者は気にしない」'),['t_piece'],{bone:'method'}));
 add(N('t_piece','Torto','torto',L('Why don’t they care? …Are they paid by the piece? *Capy: “By the shift.”* …Then I don’t know why. Forget I spoke.','なぜ気にしない？…出来高払いか？*カピー：「シフト払いだ」* …なら分からん。忘れてくれ。'),'dead',L('(no answer)','（答えなし）'),[],{bone:'method'}));

 /* ================= Jump after March ================= */
 add(N('q_march','Uni the Unicorn','uni',null,'q',null,['c_nothing','m_guild','t_older','l_hires']));
 add(N('c_nothing','Captain Capy','capy',L('Nothing changed in March. I would know. I sign for everything.','3月に変わったものはない。私が知ってるはずだ。全部私がサインする。'),'opinion',L('“nothing changed in March”','「3月に何も変わってない」'),[],{bone:'material'}));
 add(N('m_guild','Miko Cat','miko:dramatic',L('Something DID change, nya. Captain, what did you sign for in March? …The Rainbow Thread Guild delivery. New packaging. “Same thread,” the note said.','何かは変わったニャ。大佐、3月に何にサインした？…レインボー糸ギルドの納品。新しい包装。「同じ糸です」とメモにあった。'),'cause',L('Guild thread lot changed (new packaging)','ギルドの糸ロット変更（新包装）'),['c_noincoming','m_mill'],{bone:'material',trap:L('Send it back and switch supplier? On one lot’s evidence — and the next supplier can do the same thing.','送り返して供給者を替える？1ロットの証拠で——次の供給者も同じことができる。'),also:[{who:'Captain Capy',cls:'capy:worried',say:L('…“Same thread.” So I signed.','…「同じ糸」。だからサインした。')},{who:'Torto',cls:'torto:ranting',say:L('THE THREAD. I said it snaps. Thread AND an old machine — the TurboStitch handles both.','糸だ。切れると言ったろ。糸と古い機械——ターボステッチなら両方こなす。')}]}));
 add(N('c_noincoming','Captain Capy','capy',L('Why did nobody notice? There is no incoming inspection. Deliveries go truck to shelf. Nobody tests thread — why would we? It is thread.','なぜ誰も気づかなかった？受入検査がない。納品はトラックから棚へ。誰も糸を試験しない——する理由が？糸だぞ。'),'root',L('no incoming inspection (truck → shelf)','受入検査なし（トラック→棚）'),['c_trust','p_nospec'],{bone:'material',card:'ax_thread',fix:L('a tensile test on every thread delivery before it reaches the shelf','棚に届く前に糸の納品ごとに引張試験')}));
 add(N('c_trust','Captain Capy','capy:embarrassed',L('Why no inspection? We have bought from the Guild since my grandfather. Trust. …Which is not a control.','なぜ検査がない？ギルドからは祖父の代から買ってる。信頼。…管理手段ではないな。'),'root',L('supplier run on trust, not controls','信頼で運営、管理なし'),[],{bone:'material',card:'ax_thread',fix:L('a supplier agreement with a spec and change notification','仕様と変更通知を含む供給者契約')}));
 add(N('p_nospec','Penny Penguin','penny:stern',L('And there is no written spec. We never told the Guild what strength we need. They cannot fail a requirement that does not exist.','それに書面の仕様がない。必要な強度をギルドに伝えたことがない。存在しない要求には落ちようがない。'),'root',L('no written thread spec','糸の書面仕様なし'),[],{bone:'material',card:'ax_thread',fix:L('a written thread spec (tensile, elongation) on the purchase order','発注書に糸の書面仕様（引張・伸び）')}));
 add(N('m_mill','Miko Cat','miko',L('Why did the Guild change it? I asked, nya. Their old mill closed; the new one spins finer. They said “same” because THEIR spec is colour and weight — not strength.','なぜギルドは変えた？聞いたニャ。旧工場が閉鎖、新工場はより細く紡ぐ。「同じ」と言ったのは、「彼らの」仕様が色と番手だから——強度じゃない。'),'cause',L('Guild’s spec is colour + weight, not strength','ギルドの仕様は色と番手、強度なし'),['p_po'],{bone:'material',trap:L('Ask the Guild to add strength to their spec? They will ask what number — and we do not have one.','ギルドに強度を仕様に足すよう頼む？「何の数値で」と聞かれる——こちらに数値がない。')}));
 add(N('p_po','Penny Penguin','penny',L('Why is their spec only colour and weight? Because that is all we ever asked for. Our purchase order says “red thread, 40 weight”. Eleven years of it.','なぜ彼らの仕様が色と番手だけ？こちらがそれしか求めなかったから。発注書には「赤い糸、40番」。11年間ずっと。'),'root',L('our PO specifies colour + weight only','発注書は色と番手のみ指定'),[],{bone:'material',card:'ax_thread',fix:L('put the strength requirement on the PO and make “same” mean same spec','発注書に強度要件を載せ、「同じ」を同じ仕様の意味に')}));
 add(N('t_older','Torto','torto',L('In March the machine got older. As it does every month.','3月に機械が古くなった。毎月そうなるように。'),'loop',L('“the machine got older” (Machine 3 branch)','「機械が古くなった」（マシン3の枝）'),[],{bone:'material',also:[{who:'Uni the Unicorn',cls:'uni',say:L('That belongs on the Machine 3 branch, and it did not start in March.','それはマシン3の枝に属するし、3月に始まったものでもない。')}]}));
 add(N('l_hires','Luna Axolotl','luna',L('March is when the two new night hires started. I trained them myself, but…','3月は夜勤の新人2人が始まった月。私が教えたけど…'),'reject',L('“new night hires in March”','「3月の夜勤新人」'),[],{bone:'material',also:[{who:'Penny Penguin',cls:'penny',say:L('Night equals day in the data, Luna. Whatever the new hires did, day did too.','データでは夜勤＝日勤よ、ルナ。新人が何をしたにせよ、日勤も同じだった。')}]}));

 /* ================= Escapes past the gate ================= */
 add(N('q_escape','Uni the Unicorn','uni',null,'q',null,['p_latent','t_lazy','c_second']));
 add(N('p_latent','Penny Penguin','penny:stern',L('Because the defect is latent. A smile that opens two millimetres after a thousand hugs looks perfect at the gate. My inspectors are not missing it; it is not there yet.','不良が潜在的だから。1,000回ハグして2ミリ開く笑顔は、門では完璧に見える。検査員が見逃してるんじゃない。まだそこにない。'),'symptom',L('defect is latent at the gate','門では不良が潜在'),['p_qp7','m_hidden'],{bone:'measure',trap:L('Look harder? You cannot see what is not there yet.','もっとよく見る？まだそこにないものは見えない。')}));
 add(N('p_qp7','Penny Penguin','penny',L('Why can’t the gate detect it? Procedure QP-7: look, squeeze, pass. Visual and touch. There is no pull test in it.','なぜ門で検出できない？手順QP-7：見る、握る、合格。目視と触感。引張試験は入っていない。'),'cause',L('QP-7 is look-squeeze-pass, no pull test','QP-7は見る・握る・合格、引張なし'),['p_11yrs'],{bone:'measure',trap:L('Add a pull test? Yes — and ask why a procedure sat unchanged while the product changed under it.','引張試験を追加？ええ——そして製品が変わる中で手順が放置された理由を聞く。')}));
 add(N('p_11yrs','Penny Penguin','penny',L('Why no pull test? QP-7 was written eleven years ago, when the thread was heavier and the smile was hand-tacked. The design changed twice since. The procedure did not.','なぜ引張試験がない？QP-7は11年前、糸が太くて笑顔を手でとめていた頃に書かれた。それから設計は2回変わった。手順は変わってない。'),'cause',L('QP-7 not revised in 11 years','QP-7は11年間未改訂'),['p_nolink'],{bone:'measure',trap:L('Revise QP-7 now? And the next design change will leave it behind again.','QP-7を今改訂？次の設計変更でまた置き去りになる。'),also:[{who:'Miko Cat',cls:'miko',say:L('Eleven years, nya. That procedure is older than Hana.','11年、ニャ。あの手順はハナより年上。')}]}));
 add(N('p_nolink','Penny Penguin','penny:stern',L('Why was it never revised? There is no trigger. Design changes go to Capy. Procedures are mine. Nobody is required to tell me anything.','なぜ改訂されなかった？引き金がない。設計変更はカピーに行く。手順は私のもの。誰も私に何かを伝える義務がない。'),'root',L('no change-control link design → inspection','設計→検査の変更管理の連結なし'),[],{bone:'measure',card:'ax_gate',fix:L('change control: every design or material change triggers an inspection-procedure review','変更管理：設計・材料の変更は必ず検査手順の見直しを起動'),also:[{who:'Uni the Unicorn',cls:'uni',say:L('A missing link between two processes. That is a root.','2つの工程の間の欠けた連結。それが根本だ。')}]}));
 add(N('m_hidden','Miko Cat','miko:smug',L('And why did nobody notice for eleven years, nya? Because the old thread was strong enough to hide it. The March thread took the mask off.','なぜ11年も誰も気づかなかったニャ？古い糸が十分強くて隠してたから。3月の糸が仮面を外した。'),'cause',L('old thread masked the weak procedure','古い糸が弱い手順を隠していた'),['p_stitch'],{bone:'measure',trap:L('Go back to the old thread? The mill is closed. And the smile would still be one stitch from opening.','古い糸に戻す？工場は閉鎖。それに笑顔はまだ一針でほどける状態。'),also:[{who:'Penny Penguin',cls:'penny:surprised',say:L('…That is annoyingly correct.','…腹立たしいほど正しい。')}]}));
 add(N('p_stitch','Penny Penguin','penny',L('Why was the smile so close to the edge? The smile seam is a single lockstitch at three millimetres, set in year one for speed with the heavy thread. When the thread got finer, nobody re-validated the stitch. The margin was the thread, and the thread went away.','なぜ笑顔はそんなにぎりぎりだった？笑顔の縫い目は3ミリの一本ロックステッチ、太い糸で速さのために1年目に決めた。糸が細くなっても誰も縫いを再検証しなかった。余裕は糸だった——そして糸は消えた。'),'root',L('stitch never re-validated after material change','材料変更後に縫いの再検証なし'),[],{bone:'measure',card:'ax_gate',fix:L('validate the smile seam (stitch length / thread) whenever a material changes','材料が変わるたびに笑顔の縫い目（ピッチ・糸）を検証')}));
 add(N('t_lazy','Torto','torto',L('Because the inspectors are lazy. Look at them. Sitting.','検査員が怠けてるからだ。見ろ、座ってる。'),'blame',L('“inspectors are lazy”','「検査員が怠けている」'),['p_follow'],{bone:'measure'}));
 add(N('p_follow','Penny Penguin','penny:stern',L('Why would lazy matter? It does not. They follow the procedure I wrote, to the letter, sitting or standing. Question the procedure. Not them.','怠惰がなぜ関係する？しない。彼らは私が書いた手順に、座っていようが立っていようが、一字一句従う。手順を問いなさい。彼らじゃなく。'),'loop',L('→ back to the procedure (QP-7)','→ 手順（QP-7）へ戻る'),[],{bone:'measure'}));
 add(N('c_second','Captain Capy','capy',L('We should add a second inspector at the gate. Two pairs of eyes.','門に検査員をもう1人足すべきだ。目が2組。'),'solution',L('“add a second inspector”','「検査員を追加」'),['c_second2'],{bone:'measure'}));
 add(N('c_second2','Captain Capy','capy:embarrassed',L('Why would a second inspector help? …If the first cannot see it… neither can the second. Fine. Fine.','なぜ2人目が役立つ？…1人目に見えないなら…2人目にも見えない。分かった。分かった。'),'dead',L('(a solution, not a cause)','（対策であって原因ではない）'),[],{bone:'measure'}));

 /* ================= Anything else ================= */
 add(N('q_other','Uni the Unicorn','uni',null,'q',null,['m_hugs','c_morale']));
 add(N('m_hugs','Miko Cat','miko:smug',L('Children hug harder these days, nya. Hana wrote “I hugged him with my whole body”. WHOLE BODY.','最近の子どもはハグが強いニャ。ハナは「全身でハグした」って書いてた。「全身」。'),'hypo',L('“children hug harder”','「子どもが強く抱く」'),['m_feel2'],{bone:null}));
 add(N('m_feel2','Miko Cat','miko',L('Why do I think so? …The letters, nya. A feeling. No numbers.','なぜそう思う？…手紙ニャ。感覚。数字はない。'),'hypo',L('a feeling — no data','感覚——データなし'),[],{bone:null}));
 add(N('c_morale','Captain Capy','capy:worried',L('Morale is low. Sad workers sew sad smiles.','士気が低い。悲しい作業者は悲しい笑顔を縫う。'),'opinion',L('“low morale”','「士気が低い」'),['c_morale2'],{bone:null}));
 add(N('c_morale2','Captain Capy','capy:embarrassed',L('Why is morale low? The complaints. Everyone hears about the returns. Nobody likes making things that come back.','なぜ士気が低い？苦情だ。みんな返品の話を聞く。戻ってくる物を作りたい人はいない。'),'loop',L('morale ← the returns (an effect)','士気←返品（結果）'),[],{bone:null,also:[{who:'Uni the Unicorn',cls:'uni',say:L('So the returns cause the morale, and the morale causes the returns? That is an effect wearing a cause’s hat.','返品が士気を下げ、士気が返品を生む？それは原因の帽子をかぶった結果だ。')}]}));
 /* ---- simplified tree: about half the paths, same depth ---- */
 ['t_old3','p_thermal','t_fan','t_fan2','t_vib','c_belt','c_nostock','p_checklist','c_sched','l_sun','l_feel','c_noscale','l_open','c_window','t_weather2','m_holiday','m_feel','c_careless','m_bonus','m_metric','p_noreview','t_youngsters','t_piece','c_trust','m_mill','p_po','l_hires','p_11yrs','m_hidden','p_stitch','t_lazy','p_follow','c_second2','m_feel2'].forEach(id=>delete t[id]);
 Object.values(t).forEach(n=>{ n.kids=(n.kids||[]).filter(k=>t[k]); });
 t.t_old2.kind='loop'; t.t_old2.short=L('“old → can’t hold a stitch → because old” (circular)','「古い→縫い目を保てない→古いから」（堂々巡り）');
 t.t_old2.say=L('Why is an old machine bad? Because an old machine cannot hold a stitch. Why can it not hold a stitch? Because it is OLD. Which is why we need the TurboStitch. We have been here before, youngster.','古い機械がなぜ悪いか？古い機械は縫い目を保てないからだ。なぜ保てないか？古いからだ。だからターボステッチが要る。前にも来た場所だぞ、若いの。');
 t.p_qp7.say=L('Why can’t the gate detect it? Procedure QP-7: look, squeeze, pass. Visual and touch — no pull test. It was written eleven years ago, when the thread was heavier and the smile was hand-tacked; the design changed twice since, the procedure did not.','なぜ門で検出できない？手順QP-7：見る、握る、合格。目視と触感——引張試験なし。11年前、糸が太くて笑顔を手でとめていた頃に書かれ、設計はそれから2回変わったが手順は変わっていない。');
 t.p_qp7.short=L('QP-7 (11 yrs old): look-squeeze-pass, no pull test','QP-7（11年前）：見る・握る・合格、引張なし');
 t.p_qp7.kids=['p_nolink']; t.c_second.kind='solution';
 /* ---- five suspected root causes, one per bone ---- */
 ['l_sched','t_iam','c_retune','t_retune_r','m_misc','t_older','m_hugs','m_feel2','c_morale','c_morale2','q_other','p_informal'].forEach(id=>delete t[id]);
 Object.values(t).forEach(n=>{ n.kids=(n.kids||[]).filter(k=>t[k]); });
 t.l_same.kind='reject'; t.l_same.kids=[]; t.l_same.short=L('night batches miss the morning re-check — but night = day (4.7 vs 4.9)','夜のバッチは朝の再確認を受けない——でも夜勤＝日勤（4.7 vs 4.9）');
 t.c_noincoming.kind='cause'; t.c_noincoming.trap=L('Add an incoming test? Testing against what number? Nobody has written one down.','受入試験を追加？何の数値に対して？誰も書き留めていない。');
 return t; };
const KIND_TAG={root:'root',cause:'shallow',symptom:'symptom',opinion:'opinion',blame:'blame',solution:'opinion',loop:'opinion',hypo:'opinion',reject:'opinion',dead:'opinion'};
const TRUE_KINDS=['root','cause','symptom'];
function causeLabel(id){ const b=BONES().find(x=>x.id===id); return b?b.root:L('Night shift carelessness','夜勤の不注意'); }
function rcaState(){ const a=A(); a.rec=a.rec||{}; a.marks=a.marks||[]; a.asked=a.asked||{}; a.rejTrue=a.rejTrue||{}; a.clock=a.clock==null?SESSION_MIN:a.clock; a.sessions=a.sessions||1; a.loops=a.loops||0; a.dismissed=a.dismissed||0; a.badMarks=a.badMarks||0; return a; }
/* marks → bones (what verify / vital / Improve consume) */
function syncBones(a){
  const T=TREE(); const rank={root:4,shallow:3,symptom:2,opinion:1,blame:1}; a.bones={}; a.badMarks=0;
  a.marks.forEach(id=>{ const n=T[id]; if(!n) return; const tag=KIND_TAG[n.kind];
    if(!TRUE_KINDS.includes(n.kind)) a.badMarks++;
    if(n.kind==='blame'){ a.bones.people={tag:'blame',depth:0}; return; }
    if(!n.bone) return;
    const cur=a.bones[n.bone]; if(!cur||rank[tag]>rank[cur.tag]) a.bones[n.bone]={tag,depth:0,node:id}; });
  if(a.bones.method&&a.bones.method.tag==='root'&&!a.bones.people) a.bones.people={tag:'reframe',depth:0};
}
function carriedBones(a){ if(!a.carried) return null; const T=TREE(); const out=[]; a.carried.forEach(id=>{ const n=T[id]; if(!n) return; if(n.kind==='blame') out.push('people'); else if(n.bone) out.push(n.bone); }); return out; }
/* the fishbone: branches = patterns; recorded nodes drawn as a nested tree along each bone */
function fishboneSVG(a){
  const P=PATTERNS(), T=TREE(); const col={root:'#2f8f66',cause:'#9a7dff',symptom:'#9a7dff',opinion:'#d81b60',blame:'#d81b60',solution:'#d81b60',loop:'#c48a3a',hypo:'#8a7a8e',reject:'#8a7a8e',dead:'#8a7a8e'};
  const rowsOf=p=>{ const rows=[]; const walk=(id,d)=>{ (T[id].kids||[]).forEach(k=>{ if(a.rec&&a.rec[k]){ const n=T[k], m=a.marks.includes(k); rows.push({t:(m?'★ ':'')+n.short,c:col[n.kind]||'#5a4a5e',b:m,d,wait:!a.asked[k]&&n.kids.length>0}); walk(k,d+1); } }); }; walk(p.q,0); return rows; };
  const R=P.map(rowsOf), maxRows=Math.max(5,...R.map(r=>r.length)); const W=1420,rowH=21,half=Math.max(170,maxRows*rowH+50),H=half*2+70,sy=half+25,x0=30,x1=1150,colW=325;
  let g='';
  P.forEach((p,i)=>{ const up=i%2===0, c=Math.floor(i/2), joinX=x0+colW*(c+1)-30, tipX=joinX-70, tipY=up?42:H-38;
    g+=`<line x1="${joinX}" y1="${sy}" x2="${tipX}" y2="${tipY}" stroke="#b8a7c8" stroke-width="3"/><text x="${tipX-40}" y="${up?tipY-10:tipY+18}" font-size="12" font-weight="800" fill="#5a4a5e">${p.t}</text>`;
    const rows=R[i]; const n=Math.max(rows.length,5);
    rows.forEach((r,k)=>{ const t=(k+1)/(n+1); const px=joinX+(tipX-joinX)*t, py=sy+(tipY-sy)*t, ind=r.d*16;
      g+=`<line x1="${px}" y1="${py}" x2="${px+18+ind}" y2="${py}" stroke="${r.c}" stroke-width="${r.d?1.2:2}" ${r.d?'stroke-dasharray="3 2"':''}/>${r.d?`<line x1="${px+18+ind}" y1="${py}" x2="${px+18+ind}" y2="${py-rowH*0.5*(up?-1:1)}" stroke="${r.c}" stroke-width="1" stroke-dasharray="2 2"/>`:''}<text x="${px+22+ind}" y="${py+3.5}" font-size="9.5" fill="${r.c}" ${r.b?'font-weight="800"':''}>${r.t}${r.wait?' <tspan fill="#c48a3a" font-weight="800">?</tspan>':''}</text>`; });
    if(!rows.length){ const px=joinX+(tipX-joinX)*0.25, py=sy+(tipY-sy)*0.25; g+=`<text x="${px+22}" y="${py+3.5}" font-size="9.5" fill="#c48a3a">${a.asked[p.q]?'':L('not yet asked','未質問')}</text>`; }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#fff;border-radius:12px;border:2px solid #e6dcff">
    <line x1="${x0}" y1="${sy}" x2="${x1}" y2="${sy}" stroke="#5a4a5e" stroke-width="3"/><polygon points="${x1},${sy-28} ${x1+28},${sy} ${x1},${sy+28}" fill="#ffd6e7" stroke="#ff7fb0" stroke-width="2"/>
    <rect x="${x1+28}" y="${sy-34}" width="${W-x1-38}" height="68" rx="10" fill="#fff0f6" stroke="#ff7fb0" stroke-width="2"/>
    <text x="${x1+28+(W-x1-38)/2}" y="${sy-8}" font-size="11" text-anchor="middle" font-weight="800" fill="#d81b60">${L('Loose smiles','笑顔の緩み')}</text><text x="${x1+28+(W-x1-38)/2}" y="${sy+10}" font-size="10" text-anchor="middle" fill="#5a4a5e">${L('4.8% escaped','流出4.8%')}</text><text x="${x1+28+(W-x1-38)/2}" y="${sy+25}" font-size="8.5" text-anchor="middle" fill="#8a7a8e">${L('the effect','結果')}</text>
    ${g}<text x="${x0}" y="${H-6}" font-size="8.5" fill="#8a7a8e">${L('branches = Measure’s patterns · indented = one why deeper · ? = a why not yet asked · ★ marked as root cause · red = opinion/blame · orange = circular · grey = parked','枝＝Measureのパターン・字下げ＝より深いなぜ・★ 根本原因として指定・赤＝意見/非難・橙＝堂々巡り・灰＝保留')}</text></svg>`;
}

Object.assign(SCENES,{
a_rca(){
  useAnalyzeTracker(1); drawWarroom(); banner(L('Deliverable 1 · Root cause workshop','成果物1 · 根本原因ワークショップ'));
  const a=rcaState(), T=TREE(), P=PATTERNS();
  const clockHTML=()=>{ const h=Math.floor(a.clock/60), m=a.clock%60; return `<div class="patience">⏱ ${L('Workshop','ワークショップ')} ${a.sessions}: ${h}h${String(m).padStart(2,'0')} ${L('left','残り')}</div>`; };
  const spend=min=>{ a.clock-=min; if(a.clock>0) return false; a.sessions++; a.clock=SESSION_MIN; tickHalfDay(); return true; };
  const breakDay=cb=>say(nm('Uni the Unicorn'),'uni',L(`Time. The room breaks for the day; we reconvene tomorrow — workshop ${a.sessions}.`,`時間だ。今日は解散、明日再開——ワークショップ${a.sessions}回目。`),cb);
  if(!a.opened){ a.opened=true;
    narrate(L('Everyone is in the war room. Torto has brought the catalogue. Capy has brought a poster. Penny has brought data. Miko has brought the ledger and, for reasons of her own, a small bell.','全員が作戦室にいる。トルトはカタログを、カピーはポスターを、ペニーはデータを持ってきた。ミコは台帳と、彼女なりの理由で小さな鈴を持ってきた。'));
    say(nm('Uni the Unicorn'),'uni',L('The fish has a head — loose smiles, 4.8% — and its big bones are Measure’s patterns: where and when the defect clusters. Patterns are not causes; they are the places to ask why. Pick a bone and ask the room. Every answer you can record or push back on. Then pick any recorded answer and ask why AGAIN — some whys have more than one true answer, and some answers are opinions, blame, or circles. Stop when you believe you have reached something the organisation does — and say so.','魚には頭がある——笑顔の緩み、4.8%——大きな骨はMeasureのパターン：不良がいつ・どこに集まるか。パターンは原因ではなく、なぜを聞く場所だ。骨を選んで部屋に聞く。答えはそれぞれ記録するか、押し返せる。そして記録した答えを選んで「もう一度」なぜと聞く——1つのなぜに本当の答えが複数あることも、答えが意見や非難や堂々巡りのこともある。組織がしていることに着いたと信じたら止まって——そう宣言する。'),hub);
    return; }
  hub();
  function hub(){
    interact(fishboneSVG(a)+clockHTML()+`<div class="person-grid">${P.map(p=>{ const rows=(T[p.q].kids||[]).filter(k=>a.rec[k]).length, marks=a.marks.filter(m=>ownerOf(m)===p.id).length;
      return `<div class="person" data-p="${p.id}"><div><div class="pn">${p.t}</div><div class="pr">${p.ask}</div><div class="stake-status ${marks?'ok':'warn'}">${a.asked[p.q]?L(`${rows} answers on the bone · ${marks} marked as root`,`骨に${rows}件・根本指定${marks}件`):L('…not yet asked','…未質問')}</div></div></div>`; }).join('')}</div>
      <button class="btn" id="fin">${a.marks.length?L('Go to multi-vote ✦','マルチ投票へ ✦'):L('Go to multi-vote (nothing marked — risky) ✦','マルチ投票へ（指定なし——危険）✦')}</button>`);
    document.querySelectorAll('.person[data-p]').forEach(el=>el.onclick=()=>branch(el.dataset.p));
    $('fin').onclick=()=>{ a.done.rca=true; syncBones(a); go('a_vote'); };
  }
  function ownerOf(id){ for(const p of P){ const walk=x=>x===id||(T[x].kids||[]).some(walk); if(walk(p.q)) return p.id; } return null; }
  function branch(pid){
    const p=P.find(x=>x.id===pid);
    if(!a.asked[p.q]){ askWhy(p.q,()=>branch(pid)); return; }
    /* tree view of recorded nodes */
    let h=''; const walk=(id,d)=>{ (T[id].kids||[]).forEach(k=>{ if(!a.rec[k]) return; const n=T[k], m=a.marks.includes(k), open=n.kids.length&&!a.asked[k];
      h+=`<div class="obj-row" style="margin-left:${d*18}px"><span class="lbl" style="min-width:0;flex:1">${m?'★ ':''}<b>${nm(n.who).split(' ')[0]}:</b> ${n.short}${m&&n.fix?`<br><span class="hint">→ ${L('if proven','証明されれば')}: ${n.fix}</span>`:''}</span><div class="obj-opts">${open?`<div class="chip" data-why="${k}">${L('Why?','なぜ？')}</div>`:(n.kids.length?`<div class="chip" style="opacity:.5">${L('asked','質問済')}</div>`:'')}<div class="chip ${m?'on':''}" data-mark="${k}">${m?L('★ root cause','★ 根本原因'):L('This is a root cause','これが根本原因')}</div><div class="chip" data-drop="${k}">✕</div></div></div>`; walk(k,d+1); }); };
    walk(p.q,0);
    interact(fishboneSVG(a)+clockHTML()+`<div class="feedback info">🐟 <b>${p.t}</b> — ${p.ask}</div>${h||`<div class="hint">${L('Nothing recorded on this bone yet.','この骨にはまだ何も記録されていない。')}</div>`}
      <div class="hint">${L('“Why?” drills a recorded answer one level deeper. Mark a node when you believe it is something the organisation does — not a person, symptom, or wish.','「なぜ？」で記録した答えを1段深く掘る。人・症状・願望ではなく、組織のしていることだと信じたらその節を指定する。')}</div>
      <button class="btn" id="reask">${L('Ask the room this question again','この問いをもう一度部屋に聞く')}</button> <button class="btn ghost" id="bk">↩ ${L('Back to the fish','魚へ戻る')}</button>`);
    $('bk').onclick=hub; $('reask').onclick=()=>askWhy(p.q,()=>branch(pid),true);
    document.querySelectorAll('.chip[data-why]').forEach(ch=>ch.onclick=()=>askWhy(ch.dataset.why,()=>branch(pid)));
    document.querySelectorAll('.chip[data-mark]').forEach(ch=>ch.onclick=()=>{ const k=ch.dataset.mark; if(a.marks.includes(k)){ a.marks=a.marks.filter(x=>x!==k); branch(pid); return; } a.marks.push(k); const n=T[k];
      if(n.kind==='root'){ say(nm(n.who),n.cls,L('“…Yes. That is the one. Write it exactly like that.”','「…そう。それだ。そのとおりに書いて。」'),()=>say(nm('Uni the Unicorn'),'uni',L(`If the data proves it, the countermeasure writes itself: ${n.fix||'—'}. That is how you know it is a root.`,`データが証明すれば、対策は自ずと書ける：${n.fix||'—'}。それが根本だと分かる印だ。`),()=>branch(pid))); }
      else if(n.kind==='cause'||n.kind==='symptom'){ say(nm('Uni the Unicorn'),'uni:concerned',L(`*quietly* Marked as a root. Then tell me the fix. ${n.trap||''} Someone in this room can still answer “why?” to that.`,`*静かに* 根本として指定。なら対策を言ってみて。${n.trap||''} この部屋の誰かはまだ「なぜ？」に答えられる。`),()=>branch(pid)); }
      else { say(nm('Uni the Unicorn'),'uni:concerned',L('*Uni says nothing at all, which is worse.*','*ユニは何も言わない——その方が悪い。*'),()=>branch(pid)); } });
    document.querySelectorAll('.chip[data-drop]').forEach(ch=>ch.onclick=()=>{ const k=ch.dataset.drop; dropNode(k); branch(pid); });
  }
  function dropNode(k){ delete a.rec[k]; a.marks=a.marks.filter(x=>x!==k); (T[k].kids||[]).forEach(dropNode); }
  function askWhy(id,back,again){
    const n=T[id]; const kids=n.kids.filter(k=>!a.rec[k]&&!(a.rejTrue[k]&&!again));
    const brk=spend(WHY_MIN); a.asked[id]=true;
    if(!kids.length){ say(nm('Uni the Unicorn'),'uni',n.kind==='q'?L('Nobody has anything new for that question.','その問いに新しい答えを持つ人はいない。'):L('The room has nothing more on that. Either you are at the organisation — or it needs data, not opinion.','それについて部屋にはもう何もない。組織に着いたか——あるいは意見ではなくデータが要るか。'),()=>brk?breakDay(back):back()); return; }
    const intro=n.kind==='q'?{who:'Uni the Unicorn',cls:'uni',say:L(`To the room: ${P.find(p=>p.q===id).ask}`,`部屋へ：${P.find(p=>p.q===id).ask}`)}:{who:'Uni the Unicorn',cls:'uni',say:L(`You turn to ${nm(n.who).split(' ')[0]}: “${n.short} — why?”`,`${nm(n.who).split(' ')[0]}に向き直る：「${n.short}——なぜ？」`)};
    const run=()=>{ say(nm(intro.who),intro.cls,intro.say,()=>answer(0)); };
    brk?breakDay(run):run();
    function answer(i){
      if(i>=kids.length){ say(nm('Uni the Unicorn'),'uni',kids.length>1?L('More than one answer to one why. Both may be true — that is how a fish grows branches.','1つのなぜに複数の答え。どちらも本当かもしれない——そうやって魚は枝を伸ばす。'):L('One answer. Record it or push back — then decide whether to ask why again.','答えは1つ。記録するか押し返すか——そして、もう一度なぜと聞くかを決める。'),back); return; }
      const k=kids[i], c=T[k]; const lines=[{who:c.who,cls:c.cls,say:c.say}].concat(c.also||[]);
      sayq(lines,()=>{
        const pushLbl={opinion:L('“Help me see it — is that something that happens, or something we believe?”','「教えてほしい——それは起きていることか、私たちが信じていることか？」'),blame:L('“Let’s stay with the process for a moment — what let that happen?”','「少し工程の話にとどまろう——何がそれを許した？」'),solution:L('“Let’s hold the fix for now and stay on the cause.”','「対策はいったん置いて、原因にとどまろう。」'),loop:L('“I think we’ve come back to where we started — can we try a different door?”','「出発点に戻ってきた気がする——別の扉を試せる？」'),hypo:L('“Let’s park that where everyone can see it, until we have numbers.”','「数字が揃うまで、みんなに見える場所に置いておこう。」'),reject:L('“Measure looked at that — can we set it aside for now?”','「Measureで見た点だね——今は脇に置ける？」'),dead:L('“That’s fine — let’s leave it there.”','「それでいい——そこに置いておこう。」')}[c.kind]||L('“Let’s set that one aside for now.”','「それはいったん脇に置こう。」');
        interact(clockHTML()+`<div class="feedback info">🗣 <b>${nm(c.who)}</b>: ${c.short}</div><div class="choices">${vc('rec',L('Record','記録'),L('Put it on the bone — you can ask why on it later.','骨に貼る——後でそれにもなぜと聞ける。'))}${vc('rej',L('Set aside','脇に置く'),pushLbl)}</div>`);
        $('rec').onclick=()=>{ a.rec[k]=true; if(c.kind==='loop') a.loops++; if(c.card&&c.kind==='root') addCards([c.card]);
          const u={loop:L('*murmurs* You have written down a circle. It will look like one on the fish.','*つぶやく* 堂々巡りを書き留めたね。魚の上でもそう見えるはずだ。'),blame:L('*murmurs* On the board. A person, for now.','*つぶやく* ボードに。今のところは、人だ。'),solution:L('*murmurs* A solution, recorded as a cause. Improve will want a word.','*つぶやく* 対策が原因として記録された。Improveが物申すだろう。')}[c.kind];
          u?say(nm('Uni the Unicorn'),'uni:concerned',u,()=>answer(i+1)):answer(i+1); };
        $('rej').onclick=()=>{ if(TRUE_KINDS.includes(c.kind)){ a.rejTrue[k]=true; a.dismissed++; const brk2=spend(REJ_TRUE_MIN);
            const sulk={'Torto':L('*turns away* Forty years, and it goes “aside”. Ask somebody else.','*背を向ける* 40年が「脇に」か。他の人に聞け。'),'Captain Capy':L('*goes red* …Fine. I’ll stop talking.','*赤くなる* …分かった。黙る。'),'Luna Axolotl':L('*shrinks* …Maybe. I will stop talking.','*縮こまる* …たぶん。もう黙ります。'),'Penny Penguin':L('*very stern* It is a measurement fact. But do go on without it.','*非常に厳しく* 測定上の事実よ。でも、それなしで続けて。'),'Miko Cat':L('*rings the bell, sadly* Noted, nya.','*悲しげに鈴を鳴らす* 了解、ニャ。')}[c.who];
            say(nm(c.who),c.cls.split(':')[0],sulk,()=>{ say(nm('Uni the Unicorn'),'uni:concerned',L('*quietly* Gently said — but that one was true, and they felt it. You can ask the question again later; the room remembers.','*静かに* 穏やかに言ったね——でもあれは本当で、相手はそれを感じた。後でもう一度聞ける。部屋は覚えている。'),()=>brk2?breakDay(()=>answer(i+1)):answer(i+1)); }); }
          else { const ok={opinion:L('Good. An opinion is where a why-chain starts, not where it ends.','いい。意見はなぜの連鎖の出発点で、終点じゃない。'),blame:L('Good. Ask what the system let happen — that is where the real bone is.','いい。仕組みが何を許したかを聞く——本当の骨はそこにある。'),solution:L('Good. Solutions belong to Improve.','いい。対策はImproveのもの。'),loop:L('Good — you broke the circle. Ask what specifically HAPPENS, not what something is.','いい——堂々巡りを断った。何であるかではなく、具体的に何が起きるかを聞く。'),hypo:L('Parked, visibly. Miko was heard.','見える形で保留。ミコの声は届いた。'),reject:L('Right. The data already answered it.','正解。データがもう答えていた。'),dead:L('Right. A why with no answer is not a cause.','正解。答えのないなぜは原因ではない。')}[c.kind];
            if(c.kind==='hypo') a.parked=(a.parked||[]).concat(k);
            say(nm('Uni the Unicorn'),'uni',ok,()=>answer(i+1)); } };
      });
    }
  }
},
a_vote(){
  useAnalyzeTracker(1); drawWarroom(); banner(L('Deliverable 1b · Multi-vote','成果物1b · マルチ投票'));
  const a=rcaState(), T=TREE(), P=PATTERNS(); syncBones(a);
  const ids=a.marks.slice(); const ownerOf=id=>{ for(const p of P){ const walk=x=>x===id||(T[x].kids||[]).some(walk); if(walk(p.q)) return p.id; } return null; };
  const lbl=id=>`${P.find(p=>p.id===ownerOf(id)).t} › ${T[id].short} <span class="hint">(${nm(T[id].who).split(' ')[0]})</span>`;
  if(!ids.length){ say(nm('Uni the Unicorn'),'uni:concerned',L('You marked nothing as a root cause. There is nothing to vote on and nothing to verify. Go back to the fish.','根本原因として何も指定していない。投票するものも検証するものもない。魚に戻ろう。'),()=>go('a_rca')); return; }
  narrate(L('The board is full. Torto is standing. Capy is also standing, which he does not usually do.','ボードは満杯。トルトが立っている。カピーも立っている——普段はしないことだ。'));
  sayq([{who:'Torto',cls:'torto:ranting',say:L('Before anyone votes on anything: the MACHINE bone goes forward. Mine. Non-negotiable. I have been here forty years and I will not be out-voted by a ledger and an axolotl.','誰が何に投票する前に：「機械」の骨は前に進める。私のだ。交渉の余地なし。40年ここにいて、台帳とアホロートルに票で負けるつもりはない。')},
        {who:'Captain Capy',cls:'capy:worried',say:L('And the skipped-check bone stays on the list. I run this floor. I know what I see.','それと検査省略の骨はリストに残す。この現場は私が動かしてる。見たものは分かってる。')},
        {who:'Uni the Unicorn',cls:'uni:stern',say:L('Your call, facilitator. Seniority can pick the causes — or the room can. Multi-vote: every SME gets three dots — the facilitator holds the pen, not a dot; the top bones go to verification, the rest wait in the parking lot.','きみの判断だ、ファシリテーター。年功が原因を選ぶか——部屋が選ぶか。マルチ投票：SME全員が3つのドット——ファシリテーターはペンを持ち、ドットは持たない。上位の原因が検証へ、残りは保留場で待つ。')}],()=>{
    interact(`<div class="choices">${vc('loud',L('Concede','譲る'),L('“Fine. Torto’s bone and Capy’s bone go forward.” Keep the peace; skip the vote.','「分かった。トルトの骨と大佐の骨を進める。」平和を保ち、投票は省略。'))}${vc('vote',L('Vote','投票'),L('“Everyone gets three dots. I’ll hold the pen and count. Torto — three, not thirty.”','「全員3つのドット。私はペンを持って数える。トルト——3つ、30じゃなく。」'))}</div>`);
    $('loud').onclick=()=>{ a.loud=true; a.carried=ids.filter(id=>['m3','skip'].includes(ownerOf(id))); if(!a.carried.length) a.carried=ids.slice(0,2); say(nm('Uni the Unicorn'),'uni:concerned',L('*writes nothing down* Noted. The rest of the board goes to the parking lot — including the ones with evidence behind them.','*何も書かない* 了解。残りのボードは保留場へ——証拠のあるものも含めて。'),finish); };
    $('vote').onclick=()=>{ a.loud=false; ballot(); };
  });
  function smeVotes(){ const rank=k=>({root:3,cause:2,symptom:2})[k]||1;
    const smes=[{n:'Torto',cls:'torto',own:'m3',pref:['march','escape','humid','skip','other']},{n:'Captain Capy',cls:'capy',own:'skip',pref:['humid','m3','march','escape','other']},{n:'Luna Axolotl',cls:'luna',own:'humid',pref:['skip','march','escape','m3','other']},{n:'Penny Penguin',cls:'penny',own:'escape',pref:['march','m3','skip','humid','other']},{n:'Miko Cat',cls:'miko',own:'march',pref:['escape','skip','m3','humid','other']}];
    return smes.map(s=>{ const order=ids.slice().sort((x,y)=>((ownerOf(y)===s.own)-(ownerOf(x)===s.own))||(rank(T[y].kind)-rank(T[x].kind))||(s.pref.indexOf(ownerOf(x))-s.pref.indexOf(ownerOf(y)))); return {sme:s,picks:order.slice(0,3)}; }); }
  function ballot(){
    say(nm('Uni the Unicorn'),'uni',L('Three dots each. The facilitator holds the pen, not a dot — you watch. Torto, that is three. Not thirty.','1人3つのドット。ファシリテーターはペンを持つ——ドットは持たない。見ていて。トルト、3つだ。30じゃなく。'),()=>{
      const votes=smeVotes(); const dots={}; ids.forEach(id=>dots[id]=[]);
      interact(`<div class="voteroom"><div class="voteboard" id="vboard">${ids.map(id=>`<div class="vrow" data-r="${id}"><span class="vlbl">${lbl(id)}</span><span class="vdots" id="vd_${id}"></span></div>`).join('')}</div>
        <div class="voters">${votes.map((v,i)=>`<div class="voter" id="vt_${i}"><div class="pav">${artHTML(v.sme.cls)}</div><div class="vname">${nm(v.sme.n).split(' ')[0]}</div></div>`).join('')}</div></div><div class="hint" id="vhint">${L('The room walks up to the board…','部屋がボードへ歩いていく…')}</div>`);
      let i=0; const step=()=>{ if(i>=votes.length){ $('vhint').textContent=L('Everyone is back in their seat.','全員が席に戻った。'); interact(document.getElementById('interact').innerHTML+`<button class="btn" id="tally">${L('Count the dots ✦','ドットを数える ✦')}</button>`); $('tally').onclick=()=>tallyUp(dots); return; }
        const v=votes[i], el=$('vt_'+i); el.classList.add('walk'); $('vhint').textContent=L(`${nm(v.sme.n).split(' ')[0]} walks up…`,`${nm(v.sme.n).split(' ')[0]}がボードへ…`);
        setTimeout(()=>{ v.picks.forEach((id,k)=>setTimeout(()=>{ dots[id].push(nm(v.sme.n).split(' ')[0]); const d=$('vd_'+id); if(d) d.insertAdjacentHTML('beforeend',`<span class="dot ${v.sme.cls}">●</span>`); },k*260)); },550);
        setTimeout(()=>{ el.classList.remove('walk'); el.classList.add('done'); i++; step(); },550+3*260+450); };
      step();
    });
  }
  function tallyUp(dots){
    const tally=ids.map(id=>({id,n:dots[id].length,who:dots[id]})).sort((x,y)=>y.n-x.n);
    /* dots roll up to the bone (verification tests a bone, not a sentence): a bone with 2+ dots goes forward with all its marked roots */
    const boneOf=id=>T[id].kind==='blame'?'people':(T[id].bone||'other'); const bd={}; tally.forEach(t=>{ bd[boneOf(t.id)]=(bd[boneOf(t.id)]||0)+t.n; });
    const okB=Object.keys(bd).filter(b=>bd[b]>=2); a.carried=ids.filter(id=>okB.includes(boneOf(id))); if(a.carried.length<Math.min(3,ids.length)) a.carried=tally.slice(0,3).map(t=>t.id);
    const BN={machine:L('Machine','機械'),env:L('Environment','環境'),method:L('Method','方法'),material:L('Material','材料'),measure:L('Measurement','測定'),people:L('People','人'),other:L('Other','その他')};
    interact(`<div class="preview"><b>${L('TALLY','集計')}</b><br>${tally.map(t=>`${a.carried.includes(t.id)?'✅':'🅿'} ${lbl(t.id)} ${'●'.repeat(t.n)} <span class="hint">(${t.who.join(', ')||'—'})</span>`).join('<br>')}<br><br><b>${L('By bone','骨ごと')}:</b> ${Object.keys(bd).map(b=>`${okB.includes(b)?'✅':'🅿'} ${BN[b]||b} ${'●'.repeat(bd[b])}`).join(' · ')}</div><button class="btn" id="nx">${L('Continue ✦','続ける ✦')}</button>`);
    const tIn=a.carried.some(id=>ownerOf(id)==='m3'), cIn=a.carried.some(id=>ownerOf(id)==='skip');
    $('nx').onclick=()=>sayq([{who:'Torto',cls:tIn?'torto:content':'torto:ranting',say:tIn?L('*counts the dots twice* …Acceptable. Note that Penny voted for MY bone. Write that down too.','*ドットを2回数える* …まあ許す。ペニーが「私の」骨に投票したことも書いておけ。'):L('Out-voted. By dots. I shall be in the workshop, with the catalogue, sulking professionally.','ドットで負けた。工房でカタログと一緒に、プロらしくふくれてる。')},
      {who:'Captain Capy',cls:cIn?'capy':'capy:embarrassed',say:cIn?L('The check bone goes forward. Good. Let the data speak.','検査の骨は前へ。いい。データに語らせよう。'):L('…Two dots. *sits down* Let the data speak, then.','…2つ。*座る* なら、データに語らせよう。')}],finish);
  }
  function finish(){ syncBones(a); if(S.reworkMode){ go('a_rework'); return; } tickHalfDay(); go('a_verify'); }
},
});

/* ---------- Verification v2: simulated data, charts and p-values; the player confirms or rejects each X ---------- */
Object.assign(LESSON,{
  ver_falseconfirm:{t:'Confirmed an X the data rejected',d:'The chart was flat and the p-value was large. Confirming it anyway means Improve will spend gold fixing something that was never broken. A hypothesis you like is still a hypothesis; the data gets the last word.'},
  ver_falsereject:{t:'Rejected an X the data confirmed',d:'A clear difference, p well under 0.05, a sensible effect size — and you threw it out. Be as willing to accept an uncomfortable cause as to reject a comfortable one. Improve now has a hole where a fix should be.'},
});
const ALPHA=0.05;
function simData(a){
  if(a.sim) return a.sim;
  const bones=['machine','env','method','material','measure']; const r=Math.random();
  const falseBone=r<0.15?null:bones[Math.floor(Math.random()*bones.length)];
  a.sim={falseBone,truth:{}}; bones.forEach(b=>a.sim.truth[b]=(b!==falseBone)); a.sim.truth.people=false; return a.sim;
}
const j=(v,s)=>Math.round((v+(Math.random()*2-1)*s)*10)/10;
function barSVG(groups,ymax,unit){ const W=520,H=210,pad=40,bw=(W-2*pad)/groups.length; const ys=v=>H-pad-(v/ymax)*(H-2*pad);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#fff;border-radius:12px;border:2px solid #e6dcff">
   <line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="#b8a7c8"/><line x1="${pad}" y1="${pad-10}" x2="${pad}" y2="${H-pad}" stroke="#b8a7c8"/>
   ${[0.25,0.5,0.75,1].map(f=>`<text x="${pad-4}" y="${ys(f*ymax)+3}" font-size="8.5" text-anchor="end" fill="#b8a7c8">${(f*ymax).toFixed(0)}</text><line x1="${pad}" y1="${ys(f*ymax)}" x2="${W-pad}" y2="${ys(f*ymax)}" stroke="#f3eefc"/>`).join('')}
   ${groups.map((g,i)=>`<rect x="${pad+i*bw+bw*0.2}" y="${ys(g.v)}" width="${bw*0.6}" height="${H-pad-ys(g.v)}" rx="6" fill="${g.hi?'#ff7fb0':'#c9b8ff'}"/><text x="${pad+i*bw+bw/2}" y="${ys(g.v)-5}" font-size="11" font-weight="800" text-anchor="middle" fill="#5a4a5e">${g.v}${unit}</text><text x="${pad+i*bw+bw/2}" y="${H-pad+14}" font-size="9.5" text-anchor="middle" fill="#8a7a8e">${g.l}</text><text x="${pad+i*bw+bw/2}" y="${H-pad+26}" font-size="8.5" text-anchor="middle" fill="#b8a7c8">n=${g.n}</text>`).join('')}
   <text x="${pad}" y="${pad-16}" font-size="10" fill="#8a7a8e">${L('escaped-defect rate','流出不良率')} (${unit})</text></svg>`; }
function scatterSVG(pts,xl,yl,xmax,ymax){ const W=520,H=210,pad=40; const xs=x=>pad+(x/xmax)*(W-2*pad), ys=y=>H-pad-(y/ymax)*(H-2*pad);
  const n=pts.length, mx=pts.reduce((s,p)=>s+p.x,0)/n, my=pts.reduce((s,p)=>s+p.y,0)/n; const sxy=pts.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0), sxx=pts.reduce((s,p)=>s+(p.x-mx)**2,0); const b=sxy/sxx, a0=my-b*mx;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#fff;border-radius:12px;border:2px solid #e6dcff">
   <line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="#b8a7c8"/><line x1="${pad}" y1="${pad-10}" x2="${pad}" y2="${H-pad}" stroke="#b8a7c8"/>
   <line x1="${xs(0.3*xmax)}" y1="${ys(a0+b*0.3*xmax)}" x2="${xs(0.95*xmax)}" y2="${ys(a0+b*0.95*xmax)}" stroke="#57cc99" stroke-width="2" stroke-dasharray="5 4"/>
   ${[0.25,0.5,0.75,1].map(f=>`<text x="${xs(f*xmax)}" y="${H-pad+12}" font-size="8.5" text-anchor="middle" fill="#b8a7c8">${Math.round(f*xmax)}</text>`).join('')}${[0.25,0.5,0.75,1].map(f=>`<text x="${pad-4}" y="${ys(f*ymax)+3}" font-size="8.5" text-anchor="end" fill="#b8a7c8">${(f*ymax).toFixed(0)}</text><line x1="${pad}" y1="${ys(f*ymax)}" x2="${W-pad}" y2="${ys(f*ymax)}" stroke="#f3eefc"/>`).join('')}
   ${pts.map(p=>`<circle cx="${xs(p.x)}" cy="${ys(p.y)}" r="5" fill="${p.hi?'#ff7fb0':'#9a7dff'}" opacity=".85"/><text x="${xs(p.x)+6}" y="${ys(p.y)-5}" font-size="8" fill="#8a7a8e">w${p.w}</text>`).join('')}
   <text x="${W-pad}" y="${H-pad+16}" font-size="9.5" text-anchor="end" fill="#8a7a8e">${xl}</text><text x="${pad}" y="${pad-16}" font-size="10" fill="#8a7a8e">${yl}</text></svg>`; }
/* one data pack per X; `truth` decides whether the effect is real */
function VDATA(bone,truth){
  const T={
    machine:()=>{ const b=truth?j(4.1,.2):j(4.7,.2), af=truth?j(6.3,.3):j(4.8,.2), o=j(4.3,.2); const p=truth?(0.002+Math.random()*0.01).toFixed(3):(0.4+Math.random()*0.4).toFixed(2);
      return {x:L('Machine 3 tension drift (no lock nut, no scheduled check)','マシン3の張力ドリフト（ロックナット・定期確認なし）'),need:'tod',
        q:L('If the knob drifts through the shift, Machine 3’s escaped rate should rise after lunch while the other machines stay flat.','ノブがシフト中にずれるなら、マシン3の流出率は昼食後に上がり、他のマシンは平坦なはず。'),
        chart:barSVG([{l:L('M3 before lunch','M3 昼前'),v:b,n:412},{l:L('M3 after lunch','M3 昼後'),v:af,n:398,hi:truth},{l:L('M1, M2, M4','M1・M2・M4'),v:o,n:1830}],8,'%'),
        stats:[[L('Test','検定'),L('two-proportion z-test, M3 before vs after lunch','2比率z検定、M3昼前 vs 昼後')],[L('Difference','差'),`${(af-b).toFixed(1)} ${L('points','ポイント')}`],['p',p],[L('Practical','実務的'),truth?L('after-lunch rate ≈ 1.5× morning','昼後は朝の約1.5倍'):L('difference within noise','差は雑音の範囲')]],p:+p}; },
    env:()=>{ const hum=[52,48,61,55,78,57,50,54,79,58,51,56]; const pts=hum.map((h,i)=>({w:i+1,x:h,y:truth?j(1.2+0.07*h,.7):j(4.6,.8),hi:h>75})); const r=truth?(0.78+Math.random()*0.12).toFixed(2):(Math.random()*0.25).toFixed(2); const p=truth?(0.001+Math.random()*0.004).toFixed(3):(0.5+Math.random()*0.4).toFixed(2);
      return {x:L('Humidity → damp fluff → seam strain (open storage)','湿度→湿った綿→縫い目の負担（開放保管）'),need:'humid',needWeeks:true,
        q:L('If damp fluff strains the seam, weekly escaped rate should climb with recorded humidity — and weeks 5 and 9 should sit at the top.','湿った綿が縫い目に負担をかけるなら、週ごとの流出率は記録湿度と共に上がり、第5・9週が最上位にあるはず。'),
        chart:scatterSVG(pts,L('relative humidity %','相対湿度%'),L('escaped-defect rate %','流出不良率%'),90,8),
        stats:[[L('Test','検定'),L('Pearson correlation, 12 weeks','ピアソン相関、12週')],['r',r],['p',p],[L('Practical','実務的'),truth?L('+1 point of defects per ~17% RH','RH約17%ごとに不良+1ポイント'):L('no trend; weeks 5 & 9 unremarkable','傾向なし；第5・9週も目立たず')]],p:+p}; },
    method:()=>{ const sk=truth?j(8.1,.4):j(4.9,.2), ok=truth?j(3.9,.2):j(4.7,.2); const p=truth?'<0.001':(0.5+Math.random()*0.4).toFixed(2);
      return {x:L('Final check skipped under time pressure (check not in standard work)','時間圧力で最終検査を省略（標準作業に未収録）'),
        q:L('If skipping the check lets defects out, shifts that logged a skipped check should escape far more than shifts that did not — on both day and night.','検査省略が不良を流出させるなら、省略を記録したシフトは、しなかったシフトよりはるかに多く流出するはず——日勤も夜勤も。'),
        chart:barSVG([{l:L('check skipped (day)','省略（日勤）'),v:truth?j(sk,.3):j(4.9,.2),n:260,hi:truth},{l:L('check skipped (night)','省略（夜勤）'),v:truth?j(sk,.3):j(4.8,.2),n:244,hi:truth},{l:L('check done (day)','実施（日勤）'),v:truth?j(ok,.2):j(4.7,.2),n:1010},{l:L('check done (night)','実施（夜勤）'),v:truth?j(ok,.2):j(4.6,.2),n:996}],10,'%'),
        stats:[[L('Test','検定'),L('two-proportion z-test, skipped vs done','2比率z検定、省略 vs 実施')],[L('Difference','差'),`${(sk-ok).toFixed(1)} ${L('points','ポイント')}`],['p',p],[L('Practical','実務的'),truth?L('skipped shifts escape ~2× — same on both shifts','省略シフトは約2倍——両シフト同じ'):L('no difference, either shift','どちらのシフトも差なし')]],p:p==='<0.001'?0.0005:+p}; },
    material:()=>{ const before=truth?j(1.9,.2):j(4.6,.2), after=truth?j(4.9,.2):j(4.8,.2), str=truth?j(82,2):j(99,1); const p=truth?'<0.001':(0.4+Math.random()*0.4).toFixed(2);
      return {x:L('Thread lot change in March (no spec, no incoming test)','3月の糸ロット変更（仕様・受入検査なし）'),
        q:L('If the new lot is weaker, the escaped rate should step up at the March 14 delivery and the new spools should fail a tensile test sooner than the old ones.','新ロットが弱いなら、3月14日の納品で流出率が段差状に上がり、新スプールは旧より早く引張試験に落ちるはず。'),
        chart:barSVG([{l:L('old lot (before Mar 14)','旧ロット（3/14前）'),v:before,n:880},{l:L('new lot (after Mar 14)','新ロット（3/14後）'),v:after,n:1760,hi:truth}],8,'%')+`<div class="preview">${L('Tensile test, 20 spools each: new thread breaks at','引張試験、各20本：新糸の破断強度は旧比')} <b>${str}%</b> ${L('of old-thread strength','')}</div>`,
        stats:[[L('Test','検定'),L('before/after proportion test + tensile comparison','前後の比率検定＋引張比較')],[L('Step at Mar 14','3/14の段差'),`${(after-before).toFixed(1)} ${L('points','ポイント')}`],['p',p],[L('Practical','実務的'),truth?L('rate ×2.5 at the lot change; thread 18% weaker','ロット変更で率2.5倍；糸は18%弱い'):L('no step; thread strength unchanged','段差なし；糸強度も同じ')]],p:p==='<0.001'?0.0005:+p}; },
    measure:()=>{ const k=truth?3+Math.floor(Math.random()*2):0; const p=truth?(0.01+Math.random()*0.02).toFixed(3):'1.00';
      return {x:L('Gate is visual-only; latent looseness escapes (QP-7 never revised)','門は目視のみ；潜在的な緩みが流出（QP-7未改訂）'),
        q:L('If the defect is latent, units that PASSED the gate should still fail a pull test at roughly the field escape rate.','不良が潜在的なら、門を「通過」した製品でも、現場の流出率と同程度に引張試験に落ちるはず。'),
        chart:barSVG([{l:L('gate-passed units failing pull test','門通過品の引張試験不合格'),v:+(k/50*100).toFixed(0),n:50,hi:truth},{l:L('field escape rate (Measure)','現場流出率（Measure）'),v:4.8,n:2240}],10,'%'),
        stats:[[L('Test','検定'),L('pull test on 50 gate-passed units vs 0 expected','門通過50体の引張試験 vs 期待0')],[L('Latent failures','潜在不良'),`${k} / 50`],['p',p],[L('Practical','実務的'),truth?L('the gate passes ~1 in 16 loose smiles','門は約16体に1体の緩みを通す'):L('nothing latent found — the gate catches what exists','潜在不良なし——門は存在するものを捕まえている')]],p:+p}; },
    people:()=>{ const n=j(4.7,.1), d=j(4.9,.1); const p=(0.6+Math.random()*0.3).toFixed(2);
      return {x:L('Night shift carelessness','夜勤の不注意'),
        q:L('If the night shift were the cause, night batches should escape more than day batches at the same gate.','夜勤が原因なら、同じ門で夜のバッチの流出は日勤より多いはず。'),
        chart:barSVG([{l:L('night shift','夜勤'),v:n,n:1104},{l:L('day shift','日勤'),v:d,n:1136}],8,'%'),
        stats:[[L('Test','検定'),L('two-proportion z-test, night vs day','2比率z検定、夜勤 vs 日勤')],[L('Difference','差'),`${(d-n).toFixed(1)} ${L('points','ポイント')}`],['p',p],[L('Practical','実務的'),L('none — the shifts are the same','なし——両シフトは同じ')]],p:+p}; },
  };
  return T[bone]();
}
Object.assign(SCENES,{
a_verify(){
  useAnalyzeTracker(2); drawBackdrop('scene_qa'); banner(L('Deliverable 2 · Verify with data','成果物2 · データで検証'));
  const a=A(), c=carryM(); a.verify=a.verify||{}; a.vd=a.vd||{}; const sim=simData(a);
  const cb=carriedBones(a); const ids=Object.keys(a.bones).filter(id=>(id!=='people'||a.bones.people.tag==='blame')&&(!cb||cb.includes(id)));
  narrate(L('Penny has cleared her bench. Every X the room voted forward gets a test — the data was collected while you slept, and it does not care who said what.','ペニーが作業台を空けた。部屋が前に進めたXはすべて検証される——データはきみが寝ている間に集められ、誰が何を言ったかは気にしない。'));
  say(nm('Penny Penguin'),'penny:stern',L('Each cause is a hypothesis until it survives a comparison. For every X I will show you the chart and the test. You decide: confirmed, or rejected. Two rules. One — p below 0.05 is the bar, not a feeling. Two — a tiny difference with a small p is still a tiny difference; ask whether it matters.',
    '原因はどれも、比較に耐えるまで仮説。Xごとにチャートと検定を見せる。きみが決める：確認か、棄却か。ルールは2つ。1——基準はp<0.05であって、気分ではない。2——pが小さくても小さな差は小さな差。意味があるかを問うこと。'),hub);
  function hub(){
    const rows=ids.map(id=>{ const v=a.verify[id]; const name=VDATA_NAME(id); return `<div class="person" data-t="${id}"><div><div class="pn">${name}</div><div class="stake-status ${v?'ok':'warn'}">${v?(v.v==='confirm'?'✓ '+L('CONFIRMED','確認'):'✗ '+L('REJECTED','棄却')):L('…undecided','…未判定')}</div></div></div>`; }).join('');
    const all=ids.every(id=>a.verify[id]);
    interact(`<div class="person-grid">${rows}</div><div class="hint">${L(`α = ${ALPHA}. Confirmed causes go to Improve; rejected ones go to the parking lot with their p-value pinned to them.`,`α = ${ALPHA}。確認された原因はImproveへ、棄却されたものはp値を貼られて保留場へ。`)}</div><button class="btn" id="fin">${all?L('Close verification ✦','検証を閉じる ✦'):L('Close with undecided causes (risky) ✦','未判定のまま閉じる（危険）✦')}</button>`);
    document.querySelectorAll('.person[data-t]').forEach(el=>el.onclick=()=>test(el.dataset.t));
    $('fin').onclick=()=>{ a.done.verify=true; a.vital=ids.filter(id=>id!=='people'&&a.verify[id]&&a.verify[id].v==='confirm'); a.done.vital=true; if(S.reworkMode){ go('a_rework'); return; } tickHalfDay(); go('a_charter'); };
  }
  function VDATA_NAME(id){ if(!a.vd[id]) a.vd[id]=VDATA(id,!!sim.truth[id]); return a.vd[id].x; }
  function test(id){
    const d=a.vd[id]||(a.vd[id]=VDATA(id,!!sim.truth[id]));
    const blocked=(d.need&&!c.strat.includes(d.need))||(d.needWeeks&&c.cherry);
    if(blocked&&!a.extraData[id]){
      say(nm('Penny Penguin'),'penny:stern',L('I cannot run that one. Measure never tagged the data it needs — or threw the weeks away. I can collect it now, properly: two days.','それは実行できない。Measureで必要なタグを付けなかった——あるいは週を捨てた。今からきちんと収集はできる：2日。'),()=>{
        interact(`<div class="choices">${vc('rc',L('Collect it (+2 days)','収集する（+2日）'),L('Do it properly.','きちんとやる。'))}${vc('sk',L('Leave it undecided','未判定のままにする'),L('Guess instead.','代わりに推測する。'))}</div>`);
        $('rc').onclick=()=>{ S.daysLost+=2; a.blocked=true; a.extraData[id]=true; show(); }; $('sk').onclick=hub; }); return; }
    show();
    function show(){
      say(nm('Penny Penguin'),'penny',d.q,()=>{
        interact(`<div class="feedback info">🔬 <b>X:</b> ${d.x}</div>${d.chart}<div class="preview"><table style="width:100%;font-size:12.5px;border-collapse:collapse">${d.stats.map(r=>`<tr><td style="padding:3px 6px;color:#8a7a8e;white-space:nowrap">${r[0]}</td><td style="padding:3px 6px"><b>${r[1]}</b></td></tr>`).join('')}</table></div>
          <div class="choices">${vc('cf',L('Confirm X','Xを確認'),L('The effect is real and large enough to matter. This cause goes to Improve.','効果は本物で、意味のある大きさ。この原因はImproveへ。'))}${vc('rj',L('Reject X','Xを棄却'),L('The data does not support it. Park it — with the p-value pinned on.','データは支持しない。p値を貼って保留。'))}</div><button class="btn ghost" id="bk">↩</button>`);
        $('bk').onclick=hub;
        $('cf').onclick=()=>{ a.verify[id]={v:'confirm',p:d.p}; say(nm('Penny Penguin'),'penny',L('Confirmed. Pinned in green.','確認。緑で貼る。'),hub); };
        $('rj').onclick=()=>{ a.verify[id]={v:'reject',p:d.p}; say(nm('Penny Penguin'),'penny',L('Rejected. Pinned in red, p-value and all. Somebody will not like it.','棄却。p値ごと赤で貼る。誰かは気に入らないだろうね。'),hub); };
      });
    }
  }
},
});

function tgPageA(line,beatsFn,next){ const r=evalAnalyze(); say(nm('Empress Scarlet'),'dragon:reading',line,()=>{ const beats=beatsFn(r); dragonReact(beats.join('')); interact(beats.join('')+`<button class="btn" id="nx">${L('Continue ✦','続ける ✦')}</button>`); $('nx').onclick=()=>go(next); }); }

/* ---------- dev ---------- */
DEV.analyze=function(profile,noGo){
  const good=profile!=='bad';
  DEV.measure(good?'good':'bad',true);
  S.m=null; const m=M();
  m.y='field'; m.opdef={unit:{v:'ok'},crit:{v:'ok'},method:{v:'ok'},who:{v:'ok'},opp:{v:'ok'}}; m.msa={agree:good?92:75,proceeded:!good,playerErr:0};
  m.strat=good?['shift','machine','week','humid','tod']:['shift']; m.collect={luna:'ok',cherry:!good}; m.chart=good?[0,1,2,3]:[0];
  m.base={dpu:{v:'ok'},dpmo:{v:'ok'},sigma:{v:'ok'}}; m.pareto={order:['smile','lumpy','seam','eyes','other'],vital:['smile','lumpy']}; m.scoreMeasure=good?100:60;
  S.day=good?24:33; S.half=0; S.a=null; S.reworkMode=false; if(noGo) return; go('a_card');
  console.log('[DEV] jumped to Analyze with',good?'GOOD':'BAD','Define+Measure outcome');
};
window.addEventListener('hashchange',()=>{ const h=(location.hash||'').toLowerCase(); if(h==='#dev-analyze') DEV.analyze('good'); if(h==='#dev-analyze-bad') DEV.analyze('bad'); });
window.addEventListener('load',()=>setTimeout(()=>{ const h=(location.hash||'').toLowerCase(); if(h==='#dev-analyze') DEV.analyze('good'); if(h==='#dev-analyze-bad') DEV.analyze('bad'); },650));


;

/* =====================================================================
   CHAPTERS 4 & 5 — IMPROVE and CONTROL  (fourth script block)
   ===================================================================== */
const IMPROVE_DEADLINE=70, CONTROL_DEADLINE=90;
function improveLate(){ return daysUsed()>IMPROVE_DEADLINE; }
function controlLate(){ return daysUsed()>CONTROL_DEADLINE; }
const STEPS_IMPROVE=[['💡','Solutions'],['⚠️','Risks'],['🧪','Pilot'],['💰','Cost/benefit'],['🐉','Tollgate']];
const STEPS_CONTROL=[['📋','Control plan'],['📉','SPC'],['🔒','Poka-yoke'],['🤝','Handover'],['🐉','Closure']];
function I(){ if(!S.i) S.i={sol:{},fmea:{},pilot:{},pilotDec:null,cba:{},done:{},tgAttempts:0,scoreImprove:null}; return S.i; }
function C(){ if(!S.c) S.c={plan:{},spc:[],std:{},hand:{},done:{},tgAttempts:0,scoreControl:null}; return S.c; }
const ROOT_IDS=()=>{ const v=(S.a&&S.a.vital||[]).filter(id=>['machine','material','measure','method','env'].includes(id)); return v.length?v:['machine','material','measure','method','env']; };
const ROOT_NAME={machine:L('Machine 3 tension: no part spec, no scheduled check','マシン3の張力：部品仕様なし・定期確認なし'),material:L('Thread lot changed, no incoming check','糸ロット変更・受入検査なし'),
  measure:L('Gate is visual-only (latent looseness escapes)','門は目視のみ（潜在的な緩みが流出）'),method:L('Standard excludes the 4-min check','標準に4分の検査が含まれない'),env:L('Fluff stored open by the door, no humidity control','綿が扉のそばで開封保管・湿度管理なし')};
const IMPROVE_BUDGET=1000;

Object.assign(CARDS,{
  ix_pilot:{txt:'Pilot (Machine 3, all shifts, 2 weeks): week 1 escaped rate 1.1% (night hourly checks missed), week 2 after the checklist fix: 0.4%.',src:'Pilot log — Penny, Luna, Torto',type:'ver',slot:null},
  ix_hana:{txt:'Letter #113: "Mr. Mochi the Second has survived 1,400 hugs. I counted this time. — Hana"',src:'Customer letter, via Miko',type:'ver',slot:null},
  cx_chart:{txt:'Post-rollout p-chart, 12 production days (daily subgroups ≈400 units): mean 0.5%, UCL 1.2%. Day 8 = 1.6% — a thread delivery skipped the incoming test.',src:'Control chart — Penny',type:'ver',slot:null},
});
Object.assign(LESSON,{
  sol_shiny:{t:'A shiny solution not aimed at a root cause',d:'The TurboStitch 9000 is a 4,000-gold answer to a question nobody asked. The root was a missing lock nut and an unscheduled check. Solutions must trace to a verified cause — and be the SMALLEST thing that removes it.'},
  sol_symptom:{t:'Solution treats the symptom',d:'"Retune more often" and "stuff less on humid days" keep the cause alive and hire someone to fight it daily. Fix the standard, the storage, the spec — not the weather report.'},
  sol_poster:{t:'A poster is not a control',d:'Capy has been putting up posters for a year. The check was skipped anyway, because the STANDARD did not include the time for it. Posters remind; they do not remove causes.'},
  sol_overreach:{t:'Solution bigger than the evidence',d:'Switching supplier on one lot’s data is a bet, not a fix. The verified cause was "no incoming check". Add the check and the spec; the supplier decision can wait for data.'},
  sol_budget:{t:'Over budget',d:'The Empress allowed 1,000 gold. A plan that needs 4,000 is a plan that needs a different Empress.'},
  sol_missing:{t:'A verified root cause left without a countermeasure',d:'Every verified root gets a fix, or Improve ships a known hole.'},
  fmea_missing:{t:'Risks not assessed',d:'Every fix has a way to fail: the new check gets skipped when busy, the supplier slips a lot through, the pull test slows the line. Name it BEFORE the pilot and mitigate it — that is what FMEA is for.'},
  fmea_wrong:{t:'Wrong mitigation for the risk',d:'A risk of "the check is skipped when busy" is not mitigated by hope or a reminder. It is mitigated by putting the check IN the standard and making it hard to skip (poka-yoke).'},
  pilot_scope:{t:'Pilot design cannot prove anything',d:'Whole-factory rollout with five changes at once and no comparison is not a pilot; it is a prayer with a budget. One machine, all shifts, two weeks, the same gauge as the baseline.'},
  pilot_crit:{t:'Success criterion is not measurable',d:'"Fewer complaints" and "Capy feels better" cannot be compared to a 4.8% baseline. Success = escaped-defect rate ≤ 0.5% on pilot units, measured the way Measure measured it.'},
  pilot_early:{t:'Victory declared early',d:'Week one was 1.1% and taught you the night checks were being missed. Stopping there would have rolled out the lesson un-learned.'},
  pilot_asis:{t:'Rolled out without the pilot’s lesson',d:'The pilot found a hole (night checks) and a fix (Luna’s checklist). Rolling out "as is" ships the hole to four more machines.'},
  cba_wrong:{t:'Cost/benefit built on the wrong numbers',d:'Benefit = COPQ avoided per year × the fraction of escapes removed. 48,000 gold is a QUARTER. "Zero forever" is a wish. "Sadness" is not a currency, whatever the break room says.'},
  i_late:{t:'Improve ran past day 70',d:'Pilots take the time they take; solution debates do not have to. Twenty days is generous for five small fixes.'},
  cp_metric:{t:'Control plan monitors the wrong thing',d:'Control what you fixed and what the customer feels: the weekly escaped-defect rate on a p-chart, the hourly tension check, incoming thread tests. Morale and throughput are guardrails, not the Y.'},
  cp_owner:{t:'The Green Belt is still the owner',d:'Control means the PROCESS OWNER runs it without you. If your name is on the control plan as the person who reacts, the project ends the day you leave.'},
  cp_react:{t:'Reaction plan is blame or panic',d:'A signal on the chart triggers an investigation of the special cause — the 5-why chain again, in miniature. Not a retune of everything; not a name on a wall.'},
  spc_tamper:{t:'Tampering with a stable process',d:'Adjusting the machine because day 3 was slightly above day 2 is tampering: reacting to common-cause noise. It makes variation WORSE. React only to signals — points beyond the limits, runs, trends.'},
  spc_missed:{t:'Special cause missed',d:'Day 8 sat above the upper control limit. That is the chart shouting. The reaction plan exists for exactly this moment — check incoming thread.'},
  std_poster:{t:'Standardised with a poster',d:'Mistake-proofing beats reminding: a lock nut with a witness mark, a humidity alarm, a gauge fixture at the gate. If a mistake is still POSSIBLE, the poster will be tested and lose.'},
  hand_benefit:{t:'Benefits not validated',d:'The project claims savings; the ledger must confirm them. Miko’s returns and Sakura’s letter are the validation — not your pilot slide.'},
  hand_lessons:{t:'Lessons learned skipped',d:'The next Green Belt inherits your mistakes unless you write them down: ask which shops, tag the data, check the lock nut.'},
  c_late:{t:'Project ran past day 90',d:'The Empress gave ninety days. She counts.'},
});

/* ---------- Pareto SVG (used in Measure and Improve) ---------- */
function paretoSVG(order){
  const items=order.map(k=>PARETO.find(x=>x.k===k)), total=PARETO.reduce((a,b)=>a+b.n,0);
  const W=560,H=230,pad=36,bw=(W-2*pad)/items.length; let acc=0;
  const bars=items.map((it,i)=>{ const h=(it.n/120)*(H-2*pad); acc+=it.n; const cy=H-pad-(acc/total)*(H-2*pad);
    return {x:pad+i*bw+6,y:H-pad-h,h,w:bw-12,t:it.t,n:it.n,cx:pad+i*bw+bw/2,cy,cum:Math.round(acc/total*100)}; });
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#fff;border-radius:12px;border:2px solid #e6dcff">
    ${bars.map(b=>`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="5" fill="${b.cum<=80?'#ff7fb0':'#c9b8ff'}"/><text x="${b.cx}" y="${b.y-4}" font-size="10" text-anchor="middle" fill="#5a4a5e">${b.n}</text><text x="${b.cx}" y="${H-pad+13}" font-size="9" text-anchor="middle" fill="#8a7a8e">${b.t}</text>`).join('')}
    <polyline points="${bars.map(b=>`${b.cx},${b.cy}`).join(' ')}" fill="none" stroke="#57cc99" stroke-width="2.5"/>
    ${bars.map(b=>`<circle cx="${b.cx}" cy="${b.cy}" r="4" fill="#57cc99"/><text x="${b.cx+6}" y="${b.cy-5}" font-size="9" fill="#2f8f66">${b.cum}%</text>`).join('')}
    <line x1="${pad}" y1="${H-pad-0.8*(H-2*pad)}" x2="${W-pad}" y2="${H-pad-0.8*(H-2*pad)}" stroke="#e07b1a" stroke-dasharray="4 4"/><text x="${W-pad}" y="${H-pad-0.8*(H-2*pad)-4}" font-size="9" text-anchor="end" fill="#e07b1a">80%</text>
    <text x="${pad}" y="14" font-size="11" fill="#5a4a5e">${L('Pareto — returned defects by type (n=192)','パレート — 種別ごとの返品不良（n=192）')}</text></svg>`;
}
function pChartSVG(){
  const wk=[0.5,0.4,0.6,0.5,0.4,0.5,0.6,1.6,0.5,0.4,0.5,0.4], mean=0.5, ucl=1.2;
  const W=560,H=200,pad=36,xs=i=>pad+i*((W-2*pad)/11),ys=v=>H-pad-(v/2)*(H-2*pad);
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#fff;border-radius:12px;border:2px solid #e6dcff">
    <line x1="${pad}" y1="${ys(ucl)}" x2="${W-pad}" y2="${ys(ucl)}" stroke="#d81b60" stroke-dasharray="5 4"/><text x="${W-pad}" y="${ys(ucl)-4}" font-size="9" text-anchor="end" fill="#d81b60">UCL 1.2%</text>
    <line x1="${pad}" y1="${ys(mean)}" x2="${W-pad}" y2="${ys(mean)}" stroke="#9a7dff" stroke-dasharray="3 3"/><text x="${W-pad}" y="${ys(mean)-4}" font-size="9" text-anchor="end" fill="#9a7dff">p̄ 0.5%</text>
    <polyline points="${wk.map((v,i)=>`${xs(i)},${ys(v)}`).join(' ')}" fill="none" stroke="#57cc99" stroke-width="2.5"/>
    ${wk.map((v,i)=>`<circle cx="${xs(i)}" cy="${ys(v)}" r="4" fill="${v>ucl?'#d81b60':'#57cc99'}"/><text x="${xs(i)}" y="${H-pad+13}" font-size="9" text-anchor="middle" fill="#8a7a8e">d${i+1}</text>`).join('')}
    <text x="${pad}" y="14" font-size="11" fill="#5a4a5e">${L('p-chart — daily escaped-defect rate, first 12 days after rollout (≈400 units/day)','pチャート — 展開後12日間の日次流出不良率（約400体/日）')}</text></svg>`;
}

/* ---------- evals ---------- */
function evalImprove(){
  const i=I(), crit=[], minor=[], push=(a,f)=>{ if(!a.includes(f)) a.push(f); };
  const roots=ROOT_IDS(); let cost=0;
  roots.forEach(r=>{ const s=i.sol[r]; if(!s){ push(crit,'sol_missing'); return; } cost+=s.cost||0;
    if(s.v==='shiny') push(crit,'sol_shiny'); if(s.v==='symptom') push(crit,'sol_symptom'); if(s.v==='poster') push(crit,'sol_poster'); if(s.v==='over') push(minor,'sol_overreach'); });
  if(cost>IMPROVE_BUDGET) push(crit,'sol_budget');
  const fm=Object.keys(i.fmea); if(fm.length<3) push(crit,'fmea_missing');
  if(Object.values(i.fmea).some(x=>x.v!=='ok')) push(minor,'fmea_wrong');
  if(i.pilot.scope&&i.pilot.scope.v!=='ok') push(crit,'pilot_scope');
  if(i.pilot.crit&&i.pilot.crit.v!=='ok') push(crit,'pilot_crit');
  if(!i.pilot.scope||!i.pilot.crit) push(crit,'pilot_scope');
  if(i.pilotDec==='early') push(crit,'pilot_early'); if(i.pilotDec==='asis') push(minor,'pilot_asis');
  if(!i.cba.benefit||!i.cba.reduction||i.cba.benefit.v!=='ok'||i.cba.reduction.v!=='ok') push(crit,'cba_wrong');
  if(improveLate()) push(minor,'i_late');
  return {crit,minor,cost};
}
function evalControl(){
  const c=C(), crit=[], minor=[], push=(a,f)=>{ if(!a.includes(f)) a.push(f); };
  const p=c.plan; if(!p.metric||p.metric.v!=='ok') push(crit,'cp_metric');
  if(!p.owner||p.owner.v!=='ok') push(crit,'cp_owner'); if(!p.react||p.react.v!=='ok') push(crit,'cp_react');
  if(c.spc.includes(1)||c.spc.includes(3)) push(crit,'spc_tamper'); if(!c.spc.includes(0)) push(crit,'spc_missed');
  if(Object.values(c.std).some(x=>x.v==='poster')) push(crit,'std_poster'); if(Object.keys(c.std).length<3) push(minor,'std_poster');
  if(!c.hand.benefit||c.hand.benefit.v!=='ok') push(crit,'hand_benefit'); if(!c.hand.lessons||c.hand.lessons.v!=='ok') push(minor,'hand_lessons');
  if(controlLate()) push(minor,'c_late');
  return {crit,minor};
}
window.__evalI=evalImprove; window.__evalC=evalControl;
function totalScore(){ return scoreDefine()+((S.m&&S.m.scoreMeasure)||0)+((S.a&&S.a.scoreAnalyze)||0)+((S.i&&S.i.scoreImprove)||0)+((S.c&&S.c.scoreControl)||0); }

/* ---------- solution options ---------- */
const SOL_OPTS=()=>({
  machine:[{t:L('Lock nut + written part spec + hourly tension check with a line gauge (60 gold)','ロックナット＋部品仕様書＋ライン用ゲージで毎時張力確認（60ゴールド）'),v:'ok',cost:60},
           {t:L('Buy the TurboStitch 9000 — page forty-seven, GLEAMING (4,000 gold)','ターボステッチ9000を購入——47ページ、ピカピカ（4,000ゴールド）'),v:'shiny',cost:4000},
           {t:L('Ask Torto to retune it more often (free, allegedly)','トルトにもっと頻繁に調律してもらう（無料、らしい）'),v:'symptom',cost:0}],
  material:[{t:L('Incoming tensile test on every thread delivery + written spec agreed with the Guild (200 gold)','糸の納品ごとに受入引張試験＋ギルドと書面で仕様合意（200ゴールド）'),v:'ok',cost:200},
            {t:L('Switch supplier immediately (800 gold, untested new mill)','供給者を即時変更（800ゴールド、未検証の新工場）'),v:'over',cost:800},
            {t:L('Send the Guild a polite letter with a smiley (free)','ギルドにスマイル付きの丁寧な手紙を送る（無料）'),v:'symptom',cost:0}],
  measure:[{t:L('Add a 30-second pull-test step at the gate with a gauge fixture (150 gold)','門にゲージ治具で30秒の引張試験工程を追加（150ゴールド）'),v:'ok',cost:150},
           {t:L('Add a second visual inspector (400 gold/quarter)','目視検査員を1人追加（400ゴールド/四半期）'),v:'symptom',cost:400},
           {t:L('Hug every plushie 1,000 times before shipping (free, 3 weeks per plushie)','出荷前に全ぬいぐるみを1,000回ハグ（無料、1体3週間）'),v:'symptom',cost:0}],
  method:[{t:L('Rewrite standard work: 4-min cycle including the check; rebalance the line (0 gold, Capy sweats)','標準作業を書き直す：検査込み4分サイクル、ライン再編（0ゴールド、カピーが汗をかく）'),v:'ok',cost:0},
          {t:L('A bigger poster: “THE CHECK IS MANDATORY” — laminated this time','もっと大きなポスター：「検査は必須」——今度はラミネート'),v:'poster',cost:5},
          {t:L('Officially skip the check on rush days, so at least it is honest','忙しい日は検査を公式に省略——少なくとも正直'),v:'symptom',cost:0}],
  env:[{t:L('Sealed fluff storage + humidity meter with alarm + a named storeroom owner (300 gold)','密閉綿保管＋警報付き湿度計＋保管室担当者の指名（300ゴールド）'),v:'ok',cost:300},
       {t:L('Relocate the factory to a desert (price on request)','工場を砂漠へ移転（価格は応相談）'),v:'shiny',cost:9999},
       {t:L('Stuff less on humid days (free, plushies slightly sad)','湿気の日は詰め物を減らす（無料、ぬいぐるみは少し悲しい）'),v:'symptom',cost:0}],
});
const FMEA_Q=()=>[
  {k:'measure',q:L('Risk: the new 30-second gate pull test…','リスク：新しい30秒の門での引張試験は…'),opts:[
    {t:L('…adds time to a 3-minute pace → put it IN the rewritten standard and rebalance the line','…3分ペースに時間を足す → 書き直した標準に「組み込み」、ラインを再編する'),v:'ok'},
    {t:L('…might upset someone → send a reassuring memo','…誰かを不快にするかも → 安心させるメモを送る'),v:'wrong'},
    {t:L('…will be fine — people are professionals','…大丈夫——みんなプロだから'),v:'wrong'}]},
  {k:'machine',q:L('Risk: the hourly tension check…','リスク：毎時の張力確認は…'),opts:[
    {t:L('…gets skipped when busy (sound familiar?) → checklist + witness paint mark on the lock nut (poka-yoke)','…忙しいと飛ばされる（聞き覚えが？）→ チェックリスト＋ロックナットの合いマーク（ポカヨケ）'),v:'ok'},
    {t:L('…is Torto’s problem now','…今はトルトの問題'),v:'wrong'},
    {t:L('…needs a poster near Machine 3','…マシン3のそばにポスターが要る'),v:'wrong'}]},
  {k:'material',q:L('Risk: the Guild ships an old-mill lot again without telling us…','リスク：ギルドが再び告知なしに旧工場のロットを出荷…'),opts:[
    {t:L('→ incoming test on EVERY delivery, spec in writing, lot number logged','→ 「全」納品を受入試験、書面の仕様、ロット番号を記録'),v:'ok'},
    {t:L('→ they promised — we trust the smiley','→ 約束してくれた——スマイルを信じる'),v:'wrong'},
    {t:L('→ Torto will hear it snapping','→ トルトが切れる音を聞くだろう'),v:'wrong'}]},
];
const PILOT_ROWS=()=>[
  {k:'scope',lbl:L('Pilot scope','パイロット範囲'),opts:[
    {t:L('Machine 3 only, all shifts, 2 weeks, baseline gauge & op-def','マシン3のみ、全シフト、2週間、ベースラインと同じゲージ・定義'),v:'ok'},
    {t:L('Whole factory, all five fixes at once, no comparison','工場全体、5つの対策を同時に、比較なし'),v:'confound'},
    {t:L('Day shift, Tuesday, three days','日勤、火曜、3日間'),v:'bias'}]},
  {k:'crit',lbl:L('Success criterion','成功基準'),opts:[
    {t:L('Escaped-defect rate ≤ 0.5% on pilot units (returns + pull test)','パイロット対象の流出不良率 ≤ 0.5%（返品＋引張試験）'),v:'ok'},
    {t:L('Fewer complaints from Ms. Sakura','サクラさんからの苦情が減る'),v:'vague'},
    {t:L('Capy feels the line is “smoother”','カピーがラインを「滑らか」と感じる'),v:'vague'}]},
];
const CBA_ROWS=()=>[
  {k:'benefit',lbl:L('Annual COPQ at stake','年間COPQ'),opts:[{t:L('48,000 gold/quarter × 4 = 192,000 gold/year','48,000/四半期 × 4 = 192,000ゴールド/年'),v:'ok'},{t:L('48,000 gold (the quarter is the year, right?)','48,000ゴールド（四半期＝年、だよね？）'),v:'wrong'},{t:L('A great deal of sadness','大量の悲しみ'),v:'wrong'}]},
  {k:'reduction',lbl:L('Expected reduction','期待される削減'),opts:[{t:L('4.8% → 0.5% ≈ 90% of escapes removed ≈ 172,000 gold/year','4.8% → 0.5% ≈ 流出の約90%削減 ≈ 年172,000ゴールド'),v:'ok'},{t:L('100% — zero defects forever, starting Monday','100%——月曜からゼロ不良永遠に'),v:'wrong'},{t:L('Revenue will double (Capy’s estimate)','売上が2倍になる（カピーの見積もり）'),v:'wrong'}]},
];

/* =================================================================== IMPROVE */
Object.assign(SCENES,{
i_card(){ chapCard(L('Chapter 4','第4章'),L('IMPROVE','IMPROVE（改善）'),L('Fix the cause, not the feeling. (Torto still wants the TurboStitch.)','気分ではなく原因を直す。（トルトはまだターボステッチが欲しい。）'),['torto','capy','miko'],'i_intro'); },
i_intro(){
  STEPS=STEPS_IMPROVE; renderTracker(0); drawWarroom(); banner(L('IMPROVE · Day one','IMPROVE · 初日'));
  narrate(L('The fishbone is gone from the corkboard; in its place, five index cards and a small velvet pouch. The pouch clinks. Torto has already looked inside.','コルクボードからフィッシュボーンが消え、代わりに5枚のカードと小さなベルベットの袋。袋が鳴る。トルトはもう中を覗いた。'));
  say(nm('Uni the Unicorn'),'uni',L(`Welcome to IMPROVE. The Empress has funded us: ${IMPROVE_BUDGET} gold, and her exact words were "spend it on causes, not on catalogues." For each verified root cause, choose the SMALLEST fix that removes it. Then name how each fix could fail, pilot it properly, and prove it pays. Deadline: day ${IMPROVE_DEADLINE}; you are on day ${fmtDays(daysUsed())}.`,
    `IMPROVEへようこそ。皇帝から予算が出た：${IMPROVE_BUDGET}ゴールド。正確な言葉は「原因に使え、カタログには使うな」。検証済みの根本原因ごとに、それを取り除く「最小の」対策を選ぶこと。それから対策ごとに失敗の仕方を挙げ、正しくパイロットし、採算を証明する。期限は${IMPROVE_DEADLINE}日目、今は${fmtDays(daysUsed())}日目。`),()=>{
    interact(`<div class="feedback info">📜 ${L('Roots handed over by Analyze:','Analyzeから引き継いだ根本原因：')}<br>${ROOT_IDS().map(r=>'• '+ROOT_NAME[r]).join('<br>')}</div><div style="margin:6px 0">${scoreBadge()}</div><button class="btn" id="nx">${L('Choose the fixes ✦','対策を選ぶ ✦')}</button>`);
    $('nx').onclick=()=>go('i_sol');
  });
},
i_sol(){
  STEPS=STEPS_IMPROVE; renderTracker(0); drawWarroom(); banner(L('Deliverable 1 · Solutions','成果物1 · 対策'));
  const i=I(), roots=ROOT_IDS(), O=SOL_OPTS();
  const solCost=()=>roots.reduce((a,r)=>{ if(!i.sol[r]) return a; const o=O[r].find(x=>x.t===i.sol[r].t); return a+(o?o.cost:0); },0);
  narrate(L('Torto has placed the catalogue on the table, open to page forty-seven, and is pretending not to look at it.','トルトはカタログを47ページで開いてテーブルに置き、見ていないふりをしている。'));
  say(nm('Torto'),'torto:ranting',L('Before you choose anything, youngster: the TurboStitch 9000 holds tension ALL DAY. Four thousand gold. A bargain. I have prepared a small presentation. *the presentation is the catalogue*','何かを選ぶ前にな、若いの：ターボステッチ9000は一日中張力を保つ。4,000ゴールド。お買い得だ。ちょっとしたプレゼンを用意した。*プレゼンはカタログ*'),()=>{
    rowPicker({store:i.sol,rows:roots.map(r=>({k:r,lbl:ROOT_NAME[r],opts:O[r]})),lockId:'locksol',lockLabel:L('Lock the solutions ✦','対策を確定 ✦'),
      note:()=>{ const cost=solCost(); return `<div class="patience">💰 ${L('Spent','支出')}: ${cost} / ${IMPROVE_BUDGET} ${cost>IMPROVE_BUDGET?'<span style="color:#d81b60">— '+L('OVER BUDGET','予算超過')+'</span>':''}</div>`; },
      onLock:()=>{ roots.forEach(r=>{ if(i.sol[r]){ const o=O[r].find(x=>x.t===i.sol[r].t); i.sol[r].cost=o?o.cost:0; } }); i.done.sol=true; if(S.reworkMode){ go('i_rework'); return; } tickHalfDay(); go('i_fmea'); }});
  });
},
i_fmea(){
  STEPS=STEPS_IMPROVE; renderTracker(1); drawWarroom(); banner(L('Deliverable 2 · Risks (FMEA-lite)','成果物2 · リスク（簡易FMEA）'));
  const i=I(); const qs=FMEA_Q(); let idx=0;
  narrate(L('Luna has drawn a small table with three columns: What could go wrong · How bad · What we do about it. Capy has drawn a poster about the table.','ルナが3列の小さな表を描いた：何が起こりうるか・どれほど悪いか・どうするか。カピーはその表についてのポスターを描いた。'));
  say(nm('Luna Axolotl'),'luna:thoughtful',L('Every fix has a way to fail, and the way is usually the same one that caused the problem. Name it now — while it is cheap.','対策にはそれぞれ失敗の仕方があって、たいてい問題を起こしたのと同じ道だ。今、安いうちに名指ししよう。'),()=>step());
  function step(){ if(idx>=qs.length){ i.done.fmea=true; if(S.reworkMode){ go('i_rework'); return; } tickHalfDay(); go('i_pilot'); return; }
    const q=qs[idx]; say(nm('Luna Axolotl'),'luna',q.q,()=>{ interact(`<div class="choices">${q.opts.map((o,j)=>vc('f'+j,L('Mitigate','対策'),o.t)).join('')}</div>`);
      q.opts.forEach((o,j)=>$('f'+j).onclick=()=>{ i.fmea[q.k]={v:o.v,t:o.t}; if(o.v!=='ok'&&/poster/i.test(o.t)){ say(nm('Captain Capy'),'capy:happy',L('A POSTER? I have one ready. I have SEVERAL ready.','ポスター？用意してある。「いくつも」用意してある。'),()=>{idx++;step();}); } else { idx++; step(); } }); }); }
},
i_pilot(){
  STEPS=STEPS_IMPROVE; renderTracker(2); drawBackdrop('scene_workshop'); banner(L('Deliverable 3 · Pilot','成果物3 · パイロット'));
  const i=I();
  narrate(L('Machine 3 has been cleaned for the occasion. Torto is holding a lock nut the way other people hold a wedding ring.','マシン3はこの日のために磨かれた。トルトは、他の人が結婚指輪を持つようにロックナットを持っている。'));
  say(nm('Uni the Unicorn'),'uni',L('A pilot proves a fix works BEFORE we bet the factory on it. Choose a scope you can compare to the baseline, and a success criterion measured the same way Measure measured. Then we watch.','パイロットは、工場全体を賭ける「前に」対策が効くことを証明する。ベースラインと比較できる範囲と、Measureと同じ方法で測る成功基準を選ぶこと。そして見守る。'),()=>{
    rowPicker({store:i.pilot,rows:PILOT_ROWS(),lockId:'lockpil',lockLabel:L('Run the pilot ✦','パイロットを実施 ✦'),onLock:()=>{ if(S.reworkMode&&i.pilotDec){ go('i_rework'); return; } for(let k=0;k<4;k++) tickHalfDay(); montage(); }});
  });
  function montage(){
    say(nm('Torto'),'torto:impressed',L('*installs the lock nut with a tiny ceremonial click* …Forty years. Sixty gold. *sniffs* I am not crying, it is the fluff.','*小さな儀式的なカチッという音でロックナットを取り付ける* …40年。60ゴールド。*鼻をすする* 泣いてない、綿のせいだ。'),()=>{
      say(nm('Luna Axolotl'),'luna:thoughtful',L('Week one: 1.1%. Better, not there. The night shift missed three hourly checks — nobody wrote the check into OUR shift sheet. I fixed the sheet. Week two: 0.4%.','第1週：1.1%。良くなったが、まだ。夜勤で毎時確認が3回抜けた——誰も「私たちの」シフト表に書き入れてなかった。表を直した。第2週：0.4%。'),()=>{
        addCards(['ix_pilot']);
        say(nm('Captain Capy'),'capy:happy',L('0.4%! Roll it out! Everywhere! Today! I have a poster for the rollout!','0.4%！展開しよう！全部！今日！展開用のポスターがある！'),()=>{
          interact(`<div class="preview"><b>${L('PILOT','パイロット')}</b> · ${L('week 1','第1週')} 1.1% · ${L('week 2','第2週')} 0.4% · ${L('lesson: night-shift sheet lacked the hourly check → fixed by Luna','教訓：夜勤シフト表に毎時確認がなかった → ルナが修正')}</div>
            <div class="choices">${vc('d_ok',L('Roll out','展開'),L('Roll out to all machines WITH Luna’s shift-sheet fix and the rewritten standard.','ルナのシフト表修正と書き直した標準「込み」で全マシンに展開。'))}
            ${vc('d_asis',L('Roll out','展開'),L('Roll out exactly what Machine 3 had in week one. Speed matters.','マシン3の第1週の状態をそのまま展開。スピードが大事。'))}
            ${vc('d_early',L('Declare victory','勝利宣言'),L('1.1% after three days was already a win. Stop the pilot, celebrate, poster.','3日で1.1%はもう勝ち。パイロットを止めて祝ってポスター。'))}</div>`);
          $('d_ok').onclick=()=>{ i.pilotDec='ok'; next(); }; $('d_asis').onclick=()=>{ i.pilotDec='asis'; next(); }; $('d_early').onclick=()=>{ i.pilotDec='early'; next(); };
          function next(){ i.done.pilot=true; if(S.reworkMode){ go('i_rework'); return; } tickHalfDay(); go('i_cba'); }
        });
      });
    });
  }
},
i_cba(){
  STEPS=STEPS_IMPROVE; renderTracker(3); drawWarroom(); banner(L('Deliverable 4 · Cost / benefit','成果物4 · 費用対効果'));
  const i=I(); const cost=ROOT_IDS().reduce((a,r)=>a+((i.sol[r]&&i.sol[r].cost)||0),0);
  narrate(L('Miko arrives with the ledger and a small cake. The cake is "for morale". Nobody argues.','ミコが台帳と小さなケーキを持って来る。ケーキは「士気のため」。誰も反論しない。'));
  say(nm('Miko Cat'),'miko:delighted',L(`Accounting wants ONE page, nya: what it costs, what it saves, when it pays back. Your fixes cost ${cost} gold. Now the benefit — and please, PLEASE do not write "sadness" anywhere.`,`経理が欲しいのは1ページだけ、ニャ：いくらかかり、いくら節約し、いつ回収するか。対策の費用は${cost}ゴールド。次は効果——お願い、「悲しみ」とはどこにも書かないで。`),()=>{
    rowPicker({store:i.cba,rows:CBA_ROWS(),lockId:'lockcba',lockLabel:L('Lock the business case ✦','ビジネスケースを確定 ✦'),
      preview:()=>i.cba.benefit.v==='ok'&&i.cba.reduction.v==='ok'?`<div class="preview"><b>${L('PAYBACK','回収期間')}:</b> ${cost} ${L('gold','ゴールド')} ÷ (172,000/365) ≈ <b>${Math.max(1,Math.round(cost/(172000/365)))} ${L('days','日')}</b> ${L('— Accounting may faint.','——経理が気絶するかも。')}</div>`:'',
      onLock:()=>{ i.done.cba=true; if(S.reworkMode){ go('i_rework'); return; } tickHalfDay(); go('i_charter'); }});
  });
},
i_charter(){
  drawBackdrop('scene_mill_night'); banner(L('Funding request','予算申請'));
  say(nm('Uni the Unicorn'),'uni',L('Tomorrow she decides whether your fixes deserve her gold. She has read Torto’s presentation. She has thoughts.','明日、彼女はきみの対策が金に値するかを決める。トルトのプレゼンは読んだ。思うところがあるようだ。'),()=>{
    const i=I(); interact(`<div class="preview"><b>${L('IMPROVE SUMMARY','IMPROVE要約')}</b><br>${ROOT_IDS().map(r=>'• '+(i.sol[r]?i.sol[r].t:'—')).join('<br>')}<br>${L('Pilot','パイロット')}: ${i.pilotDec||'—'} · ${L('Payback','回収')}: ${i.cba.benefit&&i.cba.benefit.v==='ok'?L('days','数日'):'?'}</div>${scoreBadge()}<button class="btn" id="nx">${L('🌙 Sleep… then face the dragon','🌙 眠る…そして竜と対峙する')}</button>`);
    $('nx').onclick=()=>{ S.day++; S.half=0; go('i_tg_intro'); };
  });
},
i_tg_intro(){ STEPS=STEPS_IMPROVE; renderTracker(4); drawBoardroom('reading'); banner(L('IMPROVE TOLLGATE · Funding','IMPROVEトールゲート · 予算')); I().tgAttempts++;
  say(nm('Empress Scarlet'),'dragon:reading',L(`Day ${fmtDays(daysUsed())}. I have a pouch of gold and a catalogue somebody left on my chair. Convince me the first is better spent than the second.`,`${fmtDays(daysUsed())}日目。金の袋と、誰かが私の椅子に置いていったカタログがある。前者が後者より良い使い道だと納得させて。`),()=>{ interact(`<button class="btn" id="nx">${L('Begin ✦','始める ✦')}</button>`); $('nx').onclick=()=>go('i_tg_sol'); }); },
i_tg_sol(){ tgPageX(evalImprove,L('The fixes. One per root. Read them to me — and their prices.','対策。根本原因ごとに1つ。読んで——値段も。'),r=>{ const b=[];
  if(r.crit.includes('sol_missing')) b.push(`<div class="feedback badf">🐉 ${L('"A verified cause with no fix. You found the hole and left it."','「検証済みの原因に対策なし。穴を見つけて、放置した。」')}</div>`+coach('sol_missing'));
  if(r.crit.includes('sol_shiny')) b.push(`<div class="feedback badf">🐉 ${L('"Four thousand gold for a machine, to replace a sixty-gold nut." She holds up the catalogue between two claws, like a dead fish. "Torto, I can see you nodding."','「60ゴールドのナットの代わりに、機械に4,000ゴールド。」彼女はカタログを死んだ魚のように2本の爪でつまむ。「トルト、うなずいているのが見えるよ。」')}</div>`+coach('sol_shiny'));
  if(r.crit.includes('sol_symptom')) b.push(`<div class="feedback badf">🐉 ${L('"Retune more. Stuff less. Write a letter with a smiley." A wisp of smoke. "You have hired the symptom a personal assistant."','「もっと調律。詰め物を減らす。スマイル付きの手紙。」一筋の煙。「きみは症状に秘書を雇ったね。」')}</div>`+coach('sol_symptom'));
  if(r.crit.includes('sol_poster')) b.push(`<div class="feedback badf">🐉 ${L('"Laminated." She says the word the way other dragons say "treason".','「ラミネート。」彼女はその言葉を、他の竜が「反逆」と言うように言う。')}</div>`+coach('sol_poster'));
  if(r.crit.includes('sol_budget')) b.push(`<div class="feedback badf">🐉 ${L(`"${r.cost} gold. I gave you ${IMPROVE_BUDGET}. Whose treasury is the rest coming from?"`,`「${r.cost}ゴールド。渡したのは${IMPROVE_BUDGET}。残りは誰の金庫から？」`)}</div>`+coach('sol_budget'));
  if(r.minor.includes('sol_overreach')) b.push(`<div class="feedback tip">${L('"A new supplier on one lot’s evidence. Bold. Add the check first; decide later."','「1ロットの証拠で新しい供給者。大胆だ。まず検査を足して、決断は後で。」')}</div>`+coach('sol_overreach'));
  if(!b.length) b.push(`<div class="feedback good">${L(`"A nut, a spec, a gauge, a test, a rewritten standard, a sealed bale. ${r.cost} gold." She puts the catalogue in a drawer and locks it. "Funded."`,`「ナット、仕様、ゲージ、試験、書き直した標準、密閉した俵。${r.cost}ゴールド。」彼女はカタログを引き出しに入れて鍵をかける。「承認。」`)}</div>`); return b; },'i_tg_pilot'); },
i_tg_pilot(){ tgPageX(evalImprove,L('Risks, pilot, and the arithmetic. Did you prove it, or did you feel it?','リスク、パイロット、そして計算。証明したのか、感じただけなのか？'),r=>{ const b=[];
  if(r.crit.includes('fmea_missing')) b.push(`<div class="feedback badf">🐉 ${L('"No risks named. Every fix has a failure mode — usually the same one that started this."','「リスクの名指しなし。対策にはどれも失敗の仕方がある——たいてい、これを始めたのと同じものだ。」')}</div>`+coach('fmea_missing'));
  if(r.minor.includes('fmea_wrong')) b.push(`<div class="feedback tip">${L('"A memo is not a mitigation. Nor, Capy, is a poster."','「メモは緩和策ではない。カピー、ポスターもだ。」')}</div>`+coach('fmea_wrong'));
  if(r.crit.includes('pilot_scope')) b.push(`<div class="feedback badf">🐉 ${L('"Five changes, the whole factory, no comparison. If it works you will not know why; if it fails you will not know what."','「5つの変更、工場全体、比較なし。うまくいっても理由が分からず、失敗しても何が悪いか分からない。」')}</div>`+coach('pilot_scope'));
  if(r.crit.includes('pilot_crit')) b.push(`<div class="feedback badf">🐉 ${L('"Success: Capy feels smoother." A very long pause. "I felt smoother once. It was the tea."','「成功：カピーが滑らかに感じる。」とても長い間。「私も一度滑らかに感じた。お茶のせいだった。」')}</div>`+coach('pilot_crit'));
  if(r.crit.includes('pilot_early')) b.push(`<div class="feedback badf">🐉 ${L('"Victory at 1.1%, while the night checks were still being missed. You would have rolled out the hole."','「夜の確認がまだ抜けているのに1.1%で勝利。穴ごと展開するところだった。」')}</div>`+coach('pilot_early'));
  if(r.minor.includes('pilot_asis')) b.push(`<div class="feedback tip">${L('"Rolled out without Luna’s fix. The pilot taught you something and you left it on Machine 3."','「ルナの修正なしで展開。パイロットが教えたことを、マシン3に置き忘れた。」')}</div>`+coach('pilot_asis'));
  if(r.crit.includes('cba_wrong')) b.push(`<div class="feedback badf">🐉 ${L('"A quarter is not a year, zero is not a forecast, and — I am reading this correctly? — sadness."','「四半期は年ではなく、ゼロは予測ではなく、そして——読み間違いではないね？——悲しみ。」')}</div>`+coach('cba_wrong'));
  if(r.minor.includes('i_late')) b.push(`<div class="feedback tip">${L(`"Day ${fmtDays(daysUsed())}. I said ${IMPROVE_DEADLINE}."`,`「${fmtDays(daysUsed())}日目。私は${IMPROVE_DEADLINE}と言った。」`)}</div>`+coach('i_late'));
  if(!b.length) b.push(`<div class="feedback good">${L('"One machine, two weeks, the same gauge, a lesson learned and carried. Payback in days." She almost smiles. "Torto may keep the nut."','「1台、2週間、同じゲージ、学んだ教訓を持ち越した。回収は数日。」彼女はほとんど微笑む。「トルトはナットを持っていていい。」')}</div>`); return b; },'i_tg_verdict'); },
i_tg_verdict(){ verdictX(evalImprove,I(),improveLate,IMPROVE_DEADLINE,'scoreImprove',
  L('FUNDED and PASSED. Go and fix my factory — and take the cake, Miko says it is for morale.','承認、そして合格。私の工場を直しに行きなさい——ケーキも持って。ミコが士気のためだと言っている。'),
  L('PASSED, with red ink. Funded — conditionally. Fix the notes before rollout.','合格——赤インクつきで。条件付きで承認。展開前に指摘を直して。'),
  L('NOT FUNDED — for now. I do not pay for symptoms, catalogues or feelings. One week.','不承認——今のところは。症状にも、カタログにも、気分にも金は出さない。1週間。'),'i_epilogue','i_rework'); },
i_rework(){ reworkX(evalImprove,I(),L('REWORK WEEK · Improve','手戻り週 · Improve'),[
  {flags:['sol_missing','sol_shiny','sol_symptom','sol_poster','sol_budget','sol_overreach'],id:'fx_sol',tag:L('Solutions','対策'),t:L('Re-choose the fixes','対策を選び直す'),fn:()=>{I().sol={};go('i_sol');}},
  {flags:['fmea_missing','fmea_wrong'],id:'fx_fmea',tag:'FMEA',t:L('Re-assess the risks','リスクを再評価'),fn:()=>{I().fmea={};go('i_fmea');}},
  {flags:['pilot_scope','pilot_crit','pilot_early','pilot_asis'],id:'fx_pil',tag:L('Pilot','パイロット'),t:L('Re-run the pilot (+2 days)','パイロットを再実施（+2日）'),fn:()=>{I().pilot={};I().pilotDec=null;go('i_pilot');}},
  {flags:['cba_wrong'],id:'fx_cba',tag:L('Cost/benefit','費用対効果'),t:L('Redo the business case','ビジネスケースをやり直す'),fn:()=>{I().cba={};go('i_cba');}},
 ],'i_tg_intro'); },
i_epilogue(){
  drawBackdrop('scene_floor'); banner(L('IMPROVE · COMPLETE','IMPROVE · 完了')); addCards(['ix_hana']);
  narrate(L('Rollout day. Machine 3 has a lock nut with a red witness mark. The storeroom has a door that closes and a humidity meter that beeps at Capy personally. The gate has a gauge. Torto has a biscuit.','展開の日。マシン3には赤い合いマーク付きのロックナット。保管室には閉まる扉と、カピー個人に向かって鳴る湿度計。門にはゲージ。トルトにはビスケット。'));
  say(nm('Miko Cat'),'miko:delighted',L('Letter one-one-THREE, nya! "Mr. Mochi the Second has survived one thousand four hundred hugs. I counted this time. — Hana." *wipes eye* It is the fluff. It is definitely the fluff.','手紙113番、ニャ！「ミスター・モチ2世は1,400回のハグを生き延びました。今回はちゃんと数えました。——ハナ」*目を拭う* 綿のせい。絶対に綿のせい。'),()=>{
    interact(`<div class="center"><h1 class="title-h">${L('✦ Chapter 4 Complete ✦','✦ 第4章 クリア ✦')}</h1><div style="margin:10px 0">${scoreBadge()}</div>
      <button class="btn center-btn" id="next5">${L('Continue to Chapter 5 — CONTROL ✦','第5章 CONTROL へ ✦')}</button></div>`);
    $('next5').onclick=()=>go('c_card');
  });
},

/* =================================================================== CONTROL */
c_card(){ chapCard(L('Chapter 5','第5章'),L('CONTROL','CONTROL（管理）'),L('A fix nobody owns is a fix that expires.','誰も担当しない対策は、期限切れになる対策。'),['penny','luna','dragon'],'c_intro'); },
c_intro(){
  STEPS=STEPS_CONTROL; renderTracker(0); drawWarroom(); banner(L('CONTROL · Day one','CONTROL · 初日'));
  narrate(L('The war room is tidy for the first time. Someone has put your chair in the corner, gently, as if you were leaving. You are.','作戦室が初めて片付いている。誰かがきみの椅子を隅に、そっと置いた——まるできみが去るかのように。去るのだ。'));
  say(nm('Uni the Unicorn'),'uni',L(`CONTROL is the phase where the project learns to live without you. A control plan the process owner can run, a chart that tells him when to act — and when NOT to — mistake-proofing so the old causes cannot creep back, and a handover with the benefits validated by the ledger. Day ${CONTROL_DEADLINE} is the end of everything: the Empress closes the project, or she does not.`,
    `CONTROLは、プロジェクトがきみなしで生きることを学ぶ段階だ。工程オーナーが運用できる管理計画、いつ動くべきか——そして「動くべきでないか」を教えるチャート、古い原因が忍び戻れないようにするポカヨケ、そして台帳で効果を検証した引き継ぎ。${CONTROL_DEADLINE}日目がすべての終わり：皇帝がプロジェクトを閉じるか、閉じないか。`),()=>{
    interact(`<div style="margin:6px 0">${scoreBadge()}</div><button class="btn" id="nx">${L('Write the control plan ✦','管理計画を書く ✦')}</button>`); $('nx').onclick=()=>go('c_plan');
  });
},
c_plan(){
  STEPS=STEPS_CONTROL; renderTracker(0); drawWarroom(); banner(L('Deliverable 1 · Control plan','成果物1 · 管理計画'));
  const c=C();
  say(nm('Penny Penguin'),'penny:stern',L('Three questions, in order. WHAT do we watch. WHO reacts. WHAT do they do when the chart speaks. If the answer to the second is "the Green Belt", the plan is a farewell card.','3つの問い、順番に。「何を」見るか。「誰が」反応するか。チャートが語ったとき「何を」するか。2つ目の答えが「グリーンベルト」なら、その計画はお別れカードよ。'),()=>{
    rowPicker({store:c.plan,lockId:'lockcp',lockLabel:L('Lock the control plan ✦','管理計画を確定 ✦'),rows:[
      {k:'metric',lbl:L('What is monitored','監視対象'),opts:[{t:L('Weekly escaped-defect rate on a p-chart + hourly tension checks + incoming thread tests','pチャートでの週次流出不良率＋毎時張力確認＋糸の受入試験'),v:'ok'},{t:L('Team morale (survey, monthly)','チームの士気（月次アンケート）'),v:'no'},{t:L('Plushies shipped per day — leadership loves fast','1日の出荷数——上層部は速さが好き'),v:'no'}]},
      {k:'owner',lbl:L('Who owns it after you leave','担当者（きみが去った後）'),opts:[{t:L('Capy (process owner) with Penny charting and Luna for nights','カピー（工程オーナー）、チャートはペニー、夜はルナ'),v:'ok'},{t:L('The Green Belt, forever, from wherever they are','グリーンベルト、永遠に、どこにいても'),v:'no'},{t:L('Whoever is free','手が空いている人'),v:'no'}]},
      {k:'react',lbl:L('Reaction plan when the chart signals','チャートが合図したときの対応'),opts:[{t:L('Investigate the special cause (mini 5-why), check the incoming lot, log it','特殊原因を調査（ミニ5なぜ）、受入ロットを確認、記録'),v:'ok'},{t:L('Retune every machine immediately, to be safe','念のため全マシンを即時再調律'),v:'no'},{t:L('Write the responsible shift on the wall','責任のあるシフトを壁に書く'),v:'no'}]},
    ],onLock:()=>{ c.done.plan=true; if(S.reworkMode){ go('c_rework'); return; } tickHalfDay(); go('c_spc'); }});
  });
},
c_spc(){
  STEPS=STEPS_CONTROL; renderTracker(1); drawWarroom(); banner(L('Deliverable 2 · Reading the chart','成果物2 · チャートを読む'));
  const c=C(); c.spc=c.spc||[]; addCards(['cx_chart']); if(!c.done.spcTime){ c.done.spcTime=true; S.day+=6; S.half=0; }
  narrate(L('Twelve production days after rollout, the gate log and the returns desk agree on the numbers. Penny has drawn the chart; Capy is hovering with a spanner "just in case".','展開から12稼働日。門の記録と返品デスクの数字が一致した。ペニーがチャートを描き、カピーは「念のため」スパナを持ってうろついている。'));
  say(nm('Penny Penguin'),'penny',L('A control chart has two messages: "leave it alone" and "act now". Most managers hear only the second. Read the twelve days. Which points call for action — and which would you be TAMPERING with?','管理図のメッセージは2つ：「放っておけ」と「今すぐ動け」。たいていの管理者は後者しか聞こえない。12日間を読んで。どの点が行動を求め——どれに手を出せば「いじり」になる？'),()=>{
    const obs=[L('Day 8 is above the UCL — a special cause. Trigger the reaction plan (check the incoming thread lot).','8日目はUCL超え——特殊原因。対応計画を発動（糸の受入ロットを確認）。'),
      L('Day 3 is higher than day 2 — retune the tension to bring it down.','3日目は2日目より高い——張力を再調律して下げる。'),
      L('Apart from day 8, the process is stable around 0.5% — leave it alone.','8日目を除けば工程は約0.5%で安定——放っておく。'),
      L('Retune all machines daily anyway, to be safe.','念のため毎日全マシンを再調律する。')];
    const list=obs.map((o,i)=>`<div class="chip ${c.spc.includes(i)?'on':''}" data-o="${i}" style="display:block;margin:4px 0">${o}</div>`).join('');
    interact(pChartSVG()+`<div class="obj-row"><span class="lbl">${L('Your reading','読み取り')}</span><div class="obj-opts" style="display:block">${list}</div></div><button class="btn" id="lockspc">${L('Record the reading ✦','読み取りを記録 ✦')}</button>`);
    document.querySelectorAll('.chip[data-o]').forEach(ch=>ch.onclick=()=>{ const k=+ch.dataset.o; c.spc=c.spc.includes(k)?c.spc.filter(x=>x!==k):c.spc.concat(k); ch.classList.toggle('on'); });
    $('lockspc').onclick=()=>{ c.done.spc=true; const tam=c.spc.includes(1)||c.spc.includes(3);
      say(nm('Captain Capy'),tam?'capy:happy':'capy:worried',tam?L('Spanner time! *adjusts everything* …why is it worse now?','スパナの出番！*全部いじる* …なんで今の方が悪いんだ？'):L('*puts the spanner down slowly* Day eight. The thread. I will check the delivery log. …No spanner. Understood.','*ゆっくりスパナを置く* 8日目。糸だ。納品記録を確認する。…スパナは使わない。了解。'),()=>{ if(S.reworkMode){ go('c_rework'); return; } tickHalfDay(); go('c_std'); }); };
  });
},
c_std(){
  STEPS=STEPS_CONTROL; renderTracker(2); drawBackdrop('scene_workshop'); banner(L('Deliverable 3 · Mistake-proofing','成果物3 · ポカヨケ'));
  const c=C(); const rows=[
    {k:'machine',lbl:L('Tension knob','張力ノブ'),opts:[{t:L('Lock nut with a red witness mark — a slipped nut is visible from across the room','赤い合いマーク付きロックナット——緩みは部屋の反対側から見える'),v:'ok'},{t:L('Poster: “PLEASE CHECK THE NUT”','ポスター：「ナットを確認してください」'),v:'poster'}]},
    {k:'env',lbl:L('Fluff storage','綿の保管'),opts:[{t:L('Humidity meter with an alarm wired to the storeroom door','保管室の扉に連動した警報付き湿度計'),v:'ok'},{t:L('Poster: “CLOSE THE DOOR (humidity!)”','ポスター：「扉を閉めて（湿度！）」'),v:'poster'}]},
    {k:'measure',lbl:L('Gate check','門の検査'),opts:[{t:L('Gauge fixture bolted to the gate bench — the check cannot be done without it','門の作業台に固定したゲージ治具——それなしでは検査できない'),v:'ok'},{t:L('Poster: “REMEMBER THE PULL TEST”','ポスター：「引張試験を忘れずに」'),v:'poster'}]},
  ];
  narrate(L('Capy arrives with a tube of posters under each arm. Uni gently takes the tubes.','カピーが両脇にポスターの筒を抱えて来る。ユニがそっと筒を取り上げる。'));
  say(nm('Uni the Unicorn'),'uni:stern',L('Standardise so the old mistake becomes IMPOSSIBLE, not merely discouraged. If a poster is the control, the poster will be tested — by a busy Tuesday — and it will lose.','古い間違いが「不可能」になるように標準化する。単に「やめましょう」ではなく。ポスターが管理手段なら、ポスターは試される——忙しい火曜日に——そして負ける。'),()=>{
    rowPicker({store:c.std,rows,lockId:'lockstd',lockLabel:L('Lock the standards ✦','標準を確定 ✦'),onLock:()=>{ c.done.std=true; if(S.reworkMode){ go('c_rework'); return; } tickHalfDay(); go('c_hand'); }});
  });
},
c_hand(){
  STEPS=STEPS_CONTROL; renderTracker(3); drawWarroom(); banner(L('Deliverable 4 · Handover & benefits','成果物4 · 引き継ぎと効果検証'));
  const c=C();
  say(nm('Miko Cat'),'miko:delighted',L('Every return since rollout, nya, matched against the gate log. I counted them ALL. Then I counted them again because I did not believe it.','展開以降の返品を全部、門の記録と照合したニャ。「全部」数えた。それから信じられなくてもう一度数えた。'),()=>{
    rowPicker({store:c.hand,lockId:'lockhand',lockLabel:L('Sign the handover ✦','引き継ぎに署名 ✦'),rows:[
      {k:'benefit',lbl:L('Benefit validation','効果の検証'),opts:[{t:L('Miko’s returns ledger + gate log: 0.5% since rollout vs 4.8% baseline → ~43,000 gold saved per quarter, confirmed by Accounting','ミコの返品台帳＋門の記録：展開後0.5%（ベースライン4.8%）→ 四半期あたり約43,000ゴールド節約、経理が確認'),v:'ok'},{t:L('The pilot slide from Improve — it said 0.4%','Improveのパイロット資料——0.4%と書いてある'),v:'no'},{t:L('Capy says it feels much better','カピーがずっと良いと感じている'),v:'no'}]},
      {k:'owner',lbl:L('Process owner sign-off','工程オーナーの署名'),opts:[{t:L('Capy signs the control plan; Penny and Luna countersign their parts','カピーが管理計画に署名、ペニーとルナが担当部分に副署'),v:'ok'},{t:L('You sign it, to be safe','念のためきみが署名'),v:'no'}]},
      {k:'lessons',lbl:L('Lessons learned for the next Belt','次のベルトへの教訓'),opts:[{t:L('Ask WHICH shops. Tag the data. Check the lock nut. Posters are not controls.','「どの店が」と聞け。データにタグを。ロックナットを確認。ポスターは管理手段ではない。'),v:'ok'},{t:L('Skip it — nobody reads those','省略——誰も読まない'),v:'no'}]},
    ],onLock:()=>{ c.done.hand=true; if(S.reworkMode){ go('c_rework'); return; } tickHalfDay(); go('c_charter'); }});
  });
},
c_charter(){
  drawBackdrop('scene_mill_night'); banner(L('The last night','最後の夜'));
  say(nm('Uni the Unicorn'),'uni',L('Tomorrow the Empress closes the project — or refuses to. Either way, tomorrow you stop being the person who fixes it and become the person who once did. Sleep.','明日、皇帝がプロジェクトを閉じる——あるいは拒む。どちらにせよ明日、きみは「直す人」から「かつて直した人」になる。眠って。'),()=>{
    interact(`${scoreBadge()}<button class="btn" id="nx">${L('🌙 Sleep… then face the dragon one last time','🌙 眠る…そして最後にもう一度、竜と対峙する')}</button>`); $('nx').onclick=()=>{ S.day++; S.half=0; go('c_tg_intro'); };
  });
},
c_tg_intro(){ STEPS=STEPS_CONTROL; renderTracker(4); drawBoardroom('reading'); banner(L('PROJECT CLOSURE · The Empress','プロジェクト完了審査 · 皇帝')); C().tgAttempts++;
  narrate(L('The tea service has been moved one inch to the RIGHT. Nobody knows what this means. Everybody is hopeful.','茶器が1インチ「右」に動かされている。誰も意味を知らない。全員が希望を持っている。'));
  say(nm('Empress Scarlet'),'dragon:reading',L(`Day ${fmtDays(daysUsed())} of ${CONTROL_DEADLINE}. Closure has one question, Green Belt: if you walked out of this room and never came back — would the number stay down?`,`${CONTROL_DEADLINE}日中${fmtDays(daysUsed())}日目。完了審査の問いは1つだ、グリーンベルト：きみがこの部屋を出て二度と戻らなかったら——数字は下がったままか？`),()=>{ interact(`<button class="btn" id="nx">${L('Begin ✦','始める ✦')}</button>`); $('nx').onclick=()=>go('c_tg_plan'); }); },
c_tg_plan(){ tgPageX(evalControl,L('The control plan and the chart.','管理計画とチャート。'),r=>{ const b=[];
  if(r.crit.includes('cp_metric')) b.push(`<div class="feedback badf">🐉 ${L('"You are controlling morale. The customer does not hug morale."','「きみは士気を管理している。顧客は士気を抱きしめない。」')}</div>`+coach('cp_metric'));
  if(r.crit.includes('cp_owner')) b.push(`<div class="feedback badf">🐉 ${L('"The owner of this plan is… you. Forever." She looks at the door. "Then it ends when you do."','「この計画の担当者は…きみ。永遠に。」彼女は扉を見る。「なら、きみが終わるときに終わる。」')}</div>`+coach('cp_owner'));
  if(r.crit.includes('cp_react')) b.push(`<div class="feedback badf">🐉 ${L('"Reaction plan: retune everything / write a name on the wall." Smoke. "That is not a plan, that is a mood with a spanner."','「対応計画：全部再調律／壁に名前を書く。」煙。「それは計画ではなく、スパナを持った気分だ。」')}</div>`+coach('cp_react'));
  if(r.crit.includes('spc_tamper')) b.push(`<div class="feedback badf">🐉 ${L('"You adjusted a stable process because one day wobbled. Tampering. Deming wept, and he had reason."','「1日ぶれただけで安定した工程をいじった。「いじり」だ。デミングが泣いたし、泣く理由があった。」')}</div>`+coach('spc_tamper'));
  if(r.crit.includes('spc_missed')) b.push(`<div class="feedback badf">🐉 ${L('"Day eight sat above the limit, shouting, and you walked past it."','「8日目は限界の上で叫んでいたのに、きみは通り過ぎた。」')}</div>`+coach('spc_missed'));
  if(!b.length) b.push(`<div class="feedback good">${L('"The Y on a chart, Capy on the plan, a 5-why in the reaction box. Day eight caught; day three left alone." She nods once. "You know the difference between noise and news."','「チャートにY、計画にカピー、対応欄に5なぜ。8日目を捕まえ、3日目は放っておいた。」彼女は一度うなずく。「雑音とニュースの違いが分かっているね。」')}</div>`); return b; },'c_tg_std'); },
c_tg_std(){ tgPageX(evalControl,L('Standards and the handover. Convince me it survives you.','標準と引き継ぎ。きみなしで生き残ると納得させて。'),r=>{ const b=[];
  if(r.crit.includes('std_poster')) b.push(`<div class="feedback badf">🐉 ${L('"Posters." She does not elaborate. She does not need to. Capy sinks slightly.','「ポスター。」彼女は説明しない。する必要がない。カピーが少し沈む。')}</div>`+coach('std_poster'));
  else if(r.minor.includes('std_poster')) b.push(`<div class="feedback tip">${L('"Some causes left unproofed. Finish the job."','「対策されていない原因が残っている。仕事を終わらせて。」')}</div>`+coach('std_poster'));
  if(r.crit.includes('hand_benefit')) b.push(`<div class="feedback badf">🐉 ${L('"Savings claimed from a pilot slide. The ledger, Green Belt. Always the ledger."','「パイロット資料からの節約主張。台帳だよ、グリーンベルト。いつでも台帳。」')}</div>`+coach('hand_benefit'));
  if(r.minor.includes('hand_lessons')) b.push(`<div class="feedback tip">${L('"No lessons written. The next Belt will ask Miko which shops complain, and Miko will sigh."','「教訓が書かれていない。次のベルトはミコにどの店が苦情を言うか聞き、ミコはため息をつく。」')}</div>`+coach('hand_lessons'));
  if(r.minor.includes('c_late')) b.push(`<div class="feedback tip">${L(`"Day ${fmtDays(daysUsed())}. I said ninety."`,`「${fmtDays(daysUsed())}日目。私は90と言った。」`)}</div>`+coach('c_late'));
  if(!b.length) b.push(`<div class="feedback good">${L('"A nut you can see, an alarm you can hear, a fixture you cannot skip. Signed by the man who runs the floor; savings confirmed by the woman who counts the boxes." She closes the folder for the last time.','「見えるナット、聞こえる警報、飛ばせない治具。現場を動かす男が署名し、箱を数える女が節約を確認した。」彼女は最後にフォルダを閉じる。')}</div>`); return b; },'c_tg_verdict'); },
c_tg_verdict(){ verdictX(evalControl,C(),controlLate,CONTROL_DEADLINE,'scoreControl',
  L('CLOSED. With honours. The number will stay down after you leave, because you built it to. That is the only kind of improvement I fund twice.','完了。優秀評価で。数字はきみが去った後も下がったままだ——そう作ったから。それが、私が二度金を出す唯一の改善だ。'),
  L('CLOSED, with red ink. Finish the notes with Capy before you go.','完了——赤インクつきで。去る前にカピーと指摘を片付けて。'),
  L('NOT closed. A project that needs you is not finished. One week — make yourself unnecessary.','未完了。きみを必要とするプロジェクトは終わっていない。1週間——自分を不要にしなさい。'),'c_epilogue','c_rework'); },
c_rework(){ reworkX(evalControl,C(),L('REWORK WEEK · Control','手戻り週 · Control'),[
  {flags:['cp_metric','cp_owner','cp_react'],id:'fx_cp',tag:L('Control plan','管理計画'),t:L('Rewrite the plan','計画を書き直す'),fn:()=>{C().plan={};go('c_plan');}},
  {flags:['spc_tamper','spc_missed'],id:'fx_spc',tag:'SPC',t:L('Re-read the chart','チャートを読み直す'),fn:()=>{C().spc=[];go('c_spc');}},
  {flags:['std_poster'],id:'fx_std',tag:L('Poka-yoke','ポカヨケ'),t:L('Replace the posters','ポスターを置き換える'),fn:()=>{C().std={};go('c_std');}},
  {flags:['hand_benefit','hand_lessons'],id:'fx_hand',tag:L('Handover','引き継ぎ'),t:L('Redo the handover','引き継ぎをやり直す'),fn:()=>{C().hand={};go('c_hand');}},
 ],'c_tg_intro'); },
c_epilogue(){
  drawGates(); banner(L('PROJECT COMPLETE','プロジェクト完了'));
  const total=totalScore(), grade=total>=460?L('Certified Green Belt — Black Belt candidate','認定グリーンベルト——ブラックベルト候補'):(total>=380?L('Certified Green Belt','認定グリーンベルト'):L('Green Belt (provisional) — the Empress suggests a second project','グリーンベルト（暫定）——皇帝は2件目のプロジェクトを勧めている'));
  setTimeout(()=>{ walkIn('act-player','left','15%'); walkIn('act-uni','right','15%'); },300);
  narrate(L('The gates at dusk this time. Behind you, a factory that measures what it ships, a storeroom door that closes itself, and a control chart Capy checks before his tea. Torto waves the biscuit.','今度は夕暮れの門。背後には、出荷するものを測る工場、ひとりでに閉まる保管室の扉、そしてカピーがお茶の前に確認する管理図。トルトがビスケットを振っている。'));
  say(nm('Uni the Unicorn'),'uni:happy',L(`Ninety days. Define found the real problem, Measure made it a number you could trust, Analyze found causes instead of culprits, Improve fixed them for sixty gold and a nut, and Control gave it all to Capy. ${grade}. …The Empress asked me to tell you the tea service moved right on purpose. It means "come back."`,
    `90日。Defineで本当の問題を見つけ、Measureで信頼できる数字にし、Analyzeで犯人ではなく原因を見つけ、Improveで60ゴールドとナット1個で直し、Controlですべてをカピーに渡した。${grade}。…皇帝から伝言だ。茶器を右に動かしたのはわざとだと。「また来い」という意味だそうだ。`),()=>{
    interact(`<div class="center"><h1 class="title-h">${L('✦ Operation Steady Smile ✦','✦ 作戦名：ずっと笑顔 ✦')}</h1>
      <div style="margin:10px 0"><span class="pill">Define ${scoreDefine()}</span> <span class="pill">Measure ${(S.m&&S.m.scoreMeasure)||0}</span> <span class="pill">Analyze ${(S.a&&S.a.scoreAnalyze)||0}</span> <span class="pill">Improve ${(S.i&&S.i.scoreImprove)||0}</span> <span class="pill">Control ${(S.c&&S.c.scoreControl)||0}</span></div>
      <p class="subtitle"><b>${L('Project score','プロジェクト得点')}: ${total} / 500 — ${grade}</b></p>
      <p class="hint">${L(`Days used: ${fmtDays(daysUsed())} of 90 · consults: ${S.consults} · Torto’s biscuits: 1`,`使用日数：90日中${fmtDays(daysUsed())} · 相談：${S.consults}回 · トルトのビスケット：1`)}</p>
      <button class="btn center-btn" id="again">${L('Play again ✦','もう一度 ✦')}</button></div>`);
    $('again').onclick=()=>{ clearSave(); location.reload(); };
  });
},
});

/* ---------- shared helpers for the two chapters ---------- */
function chapCard(ch,word,tag,cast,next){
  renderTracker(-1); banner(null); drawScene(); $('avatar').innerHTML=''; $('speaker').textContent=''; $('text').innerHTML=''; interact(''); musicTrack('intro');
  const old=$('chapcard'); if(old) old.remove();
  document.body.insertAdjacentHTML('beforeend',`<div class="chapter-card" id="chapcard"><div class="cc-ch">${ch}</div><div class="cc-def">${word}</div><div class="cc-tag">${tag}</div><div class="cc-cast">${cast.map(id=>`<div class="cc-av">${ART[id]||''}</div>`).join('')}</div><div class="cc-skip">${L('tap to continue ▸','タップで進む ▸')}</div></div>`);
  let done=false; const proceed=()=>{ if(done) return; done=true; clearTimeout(tmr); const c=$('chapcard'); const fin=()=>{ if(c) c.remove(); musicTrack('main'); go(next); }; if(c){ c.classList.add('ccout'); setTimeout(fin,420);} else fin(); };
  const tmr=setTimeout(proceed,2600); $('chapcard').onclick=proceed;
}
function tgPageX(evalFn,line,beatsFn,next){ const r=evalFn(); say(nm('Empress Scarlet'),'dragon:reading',line,()=>{ const beats=beatsFn(r); dragonReact(beats.join('')); interact(beats.join('')+`<button class="btn" id="nx">${L('Continue ✦','続ける ✦')}</button>`); $('nx').onclick=()=>go(next); }); }
function verdictX(evalFn,st,lateFn,deadline,scoreKey,okHon,okRed,rej,nextOk,nextRw){
  const r=evalFn();
  if(r.crit.length===0){ const honors=r.minor.length<=2&&st.tgAttempts===1&&!lateFn(); setDragonMood(honors?'softened':'approving'); setPlayerMood('determined');
    say(nm('Empress Scarlet'),honors?'dragon:softened':'dragon:approving',honors?okHon:okRed,()=>{ st[scoreKey]=Math.max(0,(honors?100:80)-4*(S.consults||0)-3*Math.ceil(Math.max(0,daysUsed()-deadline))); interact((r.minor.length?lessonList(r.minor):'')+`<button class="btn" id="nx">${L('Continue ✦','続ける ✦')}</button>`); $('nx').onclick=()=>go(nextOk); });
  } else { setDragonMood('furious'); shakeScene(); smokeBurst(4); setPlayerMood('nervous');
    say(nm('Empress Scarlet'),'dragon:furious',rej,()=>{ S.daysLost+=7; S.reworkMode=true; interact(lessonList(r.crit.concat(r.minor))+`<button class="btn" id="nx">${L('Face the rework week ✦','手戻りの週へ ✦')}</button>`); $('nx').onclick=()=>go(nextRw); }); }
}
function reworkX(evalFn,st,title,fixes,retg){
  drawWarroom(); banner(title); S.reworkMode=true; const r=evalFn();
  say(nm('Uni the Unicorn'),'uni:concerned',L('Here is what she flagged. Fix the foundations, then ask her again.','彼女が指摘した点だ。土台を直して、もう一度頼もう。'),()=>{
    const has=f=>f.some(x=>r.crit.includes(x)||r.minor.includes(x)); let h=lessonList(r.crit.concat(r.minor))+'<div class="choices">';
    fixes.forEach(f=>{ if(has(f.flags)) h+=`<button class="choice" id="${f.id}"><span class="tag">${f.tag}</span>${f.t}</button>`; }); h+='</div>';
    const clean=r.crit.length===0; h+=`<button class="btn" id="retg" ${clean?'':'disabled'}>${L('Request a new tollgate (+1 day) ✦','再審査を要請（+1日）✦')}</button>`; interact(h);
    fixes.forEach(f=>{ const b=$(f.id); if(b) b.onclick=f.fn; }); $('retg').onclick=()=>{ S.day++; S.reworkMode=false; go(retg); };
  });
}

/* ---------- dev ---------- */
DEV.improve=function(profile,noGo){
  const good=profile!=='bad'; DEV.analyze(good?'good':'bad',true);
  S.a=A(); S.a.bones={machine:{tag:'root'},env:{tag:'root'},method:{tag:'root'},measure:{tag:'root'},material:{tag:'root'},people:{tag:'reframe'}};
  S.a.verify={machine:{v:'ok'},env:{v:'ok'},method:{v:'ok'},measure:{v:'ok'},material:{v:'ok'}}; S.a.vital=good?['machine','env','method','measure','material']:['machine','material','measure'];
  S.a.scoreAnalyze=good?100:60; S.day=good?46:55; S.half=0; S.i=null; S.c=null; S.reworkMode=false;
  if(noGo) return; go('i_card'); console.log('[DEV] jumped to Improve');
};
DEV.control=function(profile){
  const good=profile!=='bad'; DEV.improve(good?'good':'bad',true);
  const i=I(); const O=SOL_OPTS(); ROOT_IDS().forEach(r=>{ i.sol[r]={t:O[r][0].t,v:'ok',cost:O[r][0].cost}; }); i.fmea={measure:{v:'ok'},machine:{v:'ok'},material:{v:'ok'}};
  i.pilot={scope:{v:'ok'},crit:{v:'ok'}}; i.pilotDec='ok'; i.cba={benefit:{v:'ok'},reduction:{v:'ok'}}; i.scoreImprove=good?100:60; S.day=good?66:75; S.half=0; S.c=null;
  go('c_card'); console.log('[DEV] jumped to Control');
};
(function(){ const h=()=>{ const x=(location.hash||'').toLowerCase(); if(x==='#dev-improve') DEV.improve('good'); if(x==='#dev-improve-bad') DEV.improve('bad'); if(x==='#dev-control') DEV.control('good'); if(x==='#dev-control-bad') DEV.control('bad'); };
  window.addEventListener('hashchange',h); window.addEventListener('load',()=>setTimeout(h,700)); })();

