// ═══════════════════════════════════════════════════════════
//  FIREBASE
// ═══════════════════════════════════════════════════════════
import{initializeApp}from"https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import{getAnalytics}from"https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import{getFirestore,collection,doc,getDocs,getDoc,setDoc,addDoc,deleteDoc}from"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import{getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut as firebaseSignOut}from"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import{getStorage,ref as sRef,uploadBytes,getDownloadURL}from"https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";

const fbApp=initializeApp({apiKey:"AIzaSyCtRx6vgFMJMkESKEk5KeVaW3r8DfLYRwM",authDomain:"archifashion-f27eb.firebaseapp.com",projectId:"archifashion-f27eb",storageBucket:"archifashion-f27eb.firebasestorage.app",messagingSenderId:"491975179823",appId:"1:491975179823:web:d3b1d70a3212dce90050da",measurementId:"G-DFNS5LFMVM"});
const analytics=getAnalytics(fbApp),db=getFirestore(fbApp),auth=getAuth(fbApp),storage=getStorage(fbApp);

// ═══════════════════════════════════════════════════════════
//  DEFAULTS & STATE
// ═══════════════════════════════════════════════════════════
const RADIUS=360,CARD_W=185;

// Demo products with real images
const DEFAULT_PRODUCTS=[
  {name:"Bridal Half-Half Silk Saree",cat:"Saree",price:4999,mrp:8999,emoji:"\u{1F458}",desc:"Stunning half-half design with heavy embroidery. Perfect for weddings.",img:"images/red_banarasi_saree.png"},
  {name:"Pink Banarasi Silk Saree",cat:"Saree",price:3499,mrp:6999,emoji:"\u{1F458}",desc:"Rich pink banarasi silk with golden zari border, ideal for festivals.",img:"images/pink_banarasi_saree.png"},
  {name:"Cream Tissue Silk Saree",cat:"Saree",price:5999,mrp:10999,emoji:"\u{1F458}",desc:"Elegant cream tissue silk with pink border. Timeless & graceful.",img:"images/cream_tissue_saree.png"},
  {name:"Kanjivaram Pure Silk Saree",cat:"Saree",price:6999,mrp:12999,emoji:"\u{1F458}",desc:"Authentic Kanjivaram with temple border. Heirloom quality weave.",img:"images/kanjivaram_saree.png"},
  {name:"Designer Anarkali Suit",cat:"Suit",price:2199,mrp:3999,emoji:"\u{1F457}",desc:"Floor-length anarkali with intricate thread embroidery.",img:"images/designer_anarkali.png"},
  {name:"Palazzo Salwar Set",cat:"Suit",price:1599,mrp:2999,emoji:"\u{1F457}",desc:"Comfortable palazzo set with matching dupatta.",img:"images/palazzo_salwar.png"},
  {name:"Bridal Lehenga \u2014 Deep Red",cat:"Lehenga",price:8999,mrp:16999,emoji:"\u{1F338}",desc:"Heavy zardozi embroidered bridal lehenga with dupatta.",img:"images/bridal_lehenga.png"},
  {name:"Net Mirror-Work Lehenga",cat:"Lehenga",price:4499,mrp:7999,emoji:"\u{1F338}",desc:"Party-wear net lehenga with traditional mirror-work detailing.",img:"images/mirror_work_lehenga.png"},
  {name:"Chiffon Printed Dupatta",cat:"Dupatta",price:499,mrp:999,emoji:"\u{1F9E3}",desc:"Featherweight chiffon dupatta with hand block-printed motifs.",img:"images/chiffon_dupatta.png"},
  {name:"Block-Printed Cotton Kurti",cat:"Kurti",price:799,mrp:1499,emoji:"\u{1F454}",desc:"Relaxed block-printed cotton kurti for everyday elegance.",img:"images/cotton_kurti.png"},
  {name:"Festive Sharara Set",cat:"Sharara",price:2799,mrp:4999,emoji:"\u{1F483}",desc:"Vibrant sharara set with embroidered kurti and contrast dupatta.",img:"images/sharara_set.png"},
  {name:"Floor-Length Gown",cat:"Gown",price:3299,mrp:5999,emoji:"\u{1F451}",desc:"Draped floor-length gown in soft georgette for sangeet & receptions.",img:"images/floor_length_gown.png"}
];

const DEFAULT_CATEGORIES=[
  {name:"Saree",label:"Sarees"},{name:"Suit",label:"Suits"},{name:"Lehenga",label:"Lehengas"},
  {name:"Kurti",label:"Kurtis"},{name:"Dupatta",label:"Dupattas"},{name:"Sharara",label:"Sharara"},{name:"Gown",label:"Gowns"}
];

const DEFAULT_SETTINGS={
  name:"Aarchi Fashion",hindi:"\u0906\u092A\u0915\u0940 \u092A\u0939\u091A\u093E\u0928, \u0939\u092E\u093E\u0930\u0940 \u0936\u093E\u0928",
  address:"F4-3, Sector-16, Rohini, Delhi-110085",phone:"8799721618",whatsapp:"918799721618",
  topbarText:"Free delivery within Delhi NCR",
  announceText:"New Collection 2025 \u2014 Crafted for the Modern Indian Woman",
  heroOverline:"New Collection",heroLine1:"Our New",heroLine2:"Collection",heroLine3:"is on the way.",
  heroSub:"Handpicked luxury \u2014 curated for you",heroBtnPrimary:"Explore Now",heroBtnSecondary:"Visit Store",heroImage:"",
  collectionEyebrow:"Our Edit",collectionPrefix:"The",collectionHighlight:"Collection",
  promo1Eye:"Exclusive",promo1Line1:"The Saree",promo1Line2:"Edit",promo1Cta:"Discover",promo1Cat:"Saree",
  promo2Eye:"Bridal",promo2Line1:"Lehenga",promo2Line2:"Couture",promo2Cta:"Explore",promo2Cat:"Lehenga",
  footerCopyright:"\u00A9 2025 Aarchi Fashion",footerTagline:"Rohini, Delhi \u00B7 Made with \u2764\uFE0F"
};

let siteSettings={...DEFAULT_SETTINGS};
let categories=[...DEFAULT_CATEGORIES];
let products=[],visible=[],angle=0,target=0,raf=null;
let dragX=null,dragging=false,cart=[],adminUnlocked=false;
let currentCat="all",isLoading=true;

// ═══════════════════════════════════════════════════════════
//  CACHED DOM REFS (optimization: avoid repeated lookups)
// ═══════════════════════════════════════════════════════════
const $=id=>document.getElementById(id);
const DOM={
  brandName:$("brand-name-el"),brandHindi:$("brand-hindi-el"),brandAddr:$("brand-addr-el"),
  topbarText:$("topbar-text"),announce:$("announce-el"),
  heroOverline:$("hero-overline-el"),heroH1:$("hero-h1-el"),heroSub:$("hero-sub-el"),
  heroBtn1:$("hero-btn1"),heroBtn2:$("hero-btn2"),heroBg:$("hero-bg"),
  collEye:$("coll-eye-el"),collTitle:$("coll-title-el"),
  p1Eye:$("p1-eye-el"),p1Title:$("p1-title-el"),p1Cta:$("p1-cta-el"),promoCard1:$("promo-card-1"),
  p2Eye:$("p2-eye-el"),p2Title:$("p2-title-el"),p2Cta:$("p2-cta-el"),promoCard2:$("promo-card-2"),
  footerLogo:$("footer-logo-el"),footerHindi:$("footer-hindi-el"),footerAddr:$("footer-addr"),
  footerBottom:$("footer-bottom-el"),contactAddr:$("contact-addr"),adminHdrTitle:$("admin-hdr-title-el"),
  contactPhoneBtn:$("contact-phone-btn"),
  mainNav:$("main-nav"),catStrip:$("cat-strip"),
  carouselStage:$("carousel-stage"),frontSpotlight:$("front-spotlight"),
  heroThumbs:$("hero-thumbs"),
  cartCount:$("cart-count"),cartItems:$("cart-items-el"),cartFoot:$("cart-foot"),cartTotal:$("cart-total-el"),
  cartDrawer:$("cart-drawer"),drawerOv:$("drawer-ov"),
  pdModal:$("pd-modal"),pdImg:$("pd-img"),pdInfo:$("pd-info"),
  adminOv:$("admin-ov"),adminLock:$("admin-lock-screen"),adminPanel:$("admin-panel"),adminToggle:$("admin-toggle-btn"),
  footerNav:$("footer-nav"),footerContact:$("footer-contact"),
  toast:$("toast"),cursorDot:$("cursorDot"),cursorRing:$("cursorRing")
};

// ═══════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function fmtPhone(n){const s=n.replace(/\D/g,"");return s.length===10?s.slice(0,4)+" "+s.slice(4,7)+" "+s.slice(7):n;}

// Debounce utility
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};}

// ═══════════════════════════════════════════════════════════
//  APPLY SITE SETTINGS TO PAGE
// ═══════════════════════════════════════════════════════════
function applySiteSettings(s){
  const p=s.name.split(" ");
  const firstName=esc(p[0]),rest=esc(p.slice(1).join(" "));
  DOM.brandName.innerHTML=firstName+' <span>'+rest+'</span>';
  DOM.brandHindi.textContent=s.hindi;
  DOM.brandAddr.textContent=s.address;
  DOM.topbarText.textContent=s.topbarText;
  DOM.announce.textContent=s.announceText;
  DOM.heroOverline.textContent=s.heroOverline;
  DOM.heroH1.innerHTML=esc(s.heroLine1)+'<br><em>'+esc(s.heroLine2)+'</em><br>'+esc(s.heroLine3);
  DOM.heroSub.textContent=s.heroSub;
  DOM.heroBtn1.textContent=s.heroBtnPrimary;
  DOM.heroBtn2.textContent=s.heroBtnSecondary;
  if(s.heroImage)DOM.heroBg.style.cssText="background-image:url('"+s.heroImage+"');background-size:cover;background-position:center";
  DOM.collEye.textContent=s.collectionEyebrow;
  DOM.collTitle.innerHTML=esc(s.collectionPrefix)+' <em>'+esc(s.collectionHighlight)+'</em>';
  // Promo cards
  DOM.p1Eye.textContent=s.promo1Eye;
  DOM.p1Title.innerHTML=esc(s.promo1Line1)+'<br>'+esc(s.promo1Line2);
  DOM.p1Cta.textContent=s.promo1Cta;
  DOM.promoCard1.onclick=function(){setCategory(s.promo1Cat);};
  DOM.p2Eye.textContent=s.promo2Eye;
  DOM.p2Title.innerHTML=esc(s.promo2Line1)+'<br>'+esc(s.promo2Line2);
  DOM.p2Cta.textContent=s.promo2Cta;
  DOM.promoCard2.onclick=function(){setCategory(s.promo2Cat);};
  // Footer
  DOM.footerLogo.innerHTML=firstName+' <span>'+rest+'</span>';
  DOM.footerHindi.textContent=s.hindi;
  DOM.footerAddr.innerHTML=esc(s.address).replace(",","<br>");
  DOM.footerBottom.innerHTML='<span>'+esc(s.footerCopyright)+'</span><span>'+esc(s.footerTagline)+'</span>';
  DOM.contactAddr.textContent=s.address;
  DOM.adminHdrTitle.innerHTML=esc(s.name)+'<span>Admin Panel</span>';
  document.title=s.name+" \u2014 Rohini, Delhi";
  // Phone & WhatsApp links
  document.querySelectorAll("[data-phone]").forEach(a=>{a.href="tel:"+s.phone;a.textContent=fmtPhone(s.phone);});
  document.querySelectorAll("[data-phone-display]").forEach(el=>{el.innerHTML="\u{1F4DE} "+fmtPhone(s.phone);});
  document.querySelectorAll("[data-wa]").forEach(a=>{a.href="https://wa.me/"+s.whatsapp;});
  DOM.contactPhoneBtn.innerHTML="\u{1F4DE} "+fmtPhone(s.phone);
  buildFooterNav();
  buildFooterContact();
}

function populateAdminFields(){
  const s=siteSettings,m={
    "adm-name":s.name,"adm-hindi":s.hindi,"adm-addr":s.address,"adm-phone":s.phone,"adm-wa":s.whatsapp,
    "adm-topbar":s.topbarText,"adm-announce":s.announceText,
    "adm-hero-over":s.heroOverline,"adm-hero-l1":s.heroLine1,"adm-hero-l2":s.heroLine2,"adm-hero-l3":s.heroLine3,
    "adm-hero-sub":s.heroSub,"adm-hero-btn1":s.heroBtnPrimary,"adm-hero-btn2":s.heroBtnSecondary,
    "adm-coll-eye":s.collectionEyebrow,"adm-coll-pre":s.collectionPrefix,"adm-coll-hi":s.collectionHighlight,
    "adm-p1-eye":s.promo1Eye,"adm-p1-l1":s.promo1Line1,"adm-p1-l2":s.promo1Line2,"adm-p1-cta":s.promo1Cta,
    "adm-p2-eye":s.promo2Eye,"adm-p2-l1":s.promo2Line1,"adm-p2-l2":s.promo2Line2,"adm-p2-cta":s.promo2Cta,
    "adm-foot-copy":s.footerCopyright,"adm-foot-tag":s.footerTagline
  };
  for(const[id,v]of Object.entries(m)){const el=$(id);if(el)el.value=v;}
  buildPromoCatSelects();
}

function buildPromoCatSelects(){
  const opts=categories.map(c=>'<option value="'+esc(c.name)+'">'+esc(c.label)+'</option>').join("");
  ["adm-p1-cat","adm-p2-cat"].forEach(id=>{$(id).innerHTML=opts;});
  $("adm-p1-cat").value=siteSettings.promo1Cat;
  $("adm-p2-cat").value=siteSettings.promo2Cat;
}

// ═══════════════════════════════════════════════════════════
//  DYNAMIC NAV, CATEGORY STRIP, FOOTER
// ═══════════════════════════════════════════════════════════
function buildNav(){
  const frag=document.createDocumentFragment();
  const makeLink=(cat,label,active)=>{
    const a=document.createElement("a");a.href="#";a.dataset.cat=cat;a.textContent=label;
    if(active)a.className="active";
    a.onclick=e=>{e.preventDefault();setCategory(cat,a);};
    return a;
  };
  frag.appendChild(makeLink("all","All",currentCat==="all"));
  categories.forEach(c=>frag.appendChild(makeLink(c.name,c.label,currentCat===c.name)));
  const contact=document.createElement("a");contact.href="#";contact.textContent="Contact";
  contact.onclick=e=>{e.preventDefault();openContact();};
  frag.appendChild(contact);
  DOM.mainNav.innerHTML="";DOM.mainNav.appendChild(frag);
}

function buildCatStrip(){
  const frag=document.createDocumentFragment();
  const makePill=(cat,label,active)=>{
    const d=document.createElement("div");d.className="cat-pill"+(active?" active":"");
    d.dataset.cat=cat;d.textContent=label;
    d.onclick=()=>setCategory(cat,d);
    return d;
  };
  frag.appendChild(makePill("all","All Pieces",currentCat==="all"));
  categories.forEach(c=>frag.appendChild(makePill(c.name,c.label,currentCat===c.name)));
  DOM.catStrip.innerHTML="";DOM.catStrip.appendChild(frag);
}

function buildCatDropdown(){
  $("np-cat").innerHTML=categories.map(c=>'<option value="'+esc(c.name)+'">'+esc(c.label)+'</option>').join("");
}

function buildFooterNav(){
  let h='<h4>Navigate</h4><a href="#" onclick="setCategory(\'all\')">All Collections</a>';
  categories.slice(0,4).forEach(c=>{h+='<a href="#" data-cat="'+esc(c.name)+'" onclick="setCategory(this.dataset.cat)">'+esc(c.label)+'</a>';});
  DOM.footerNav.innerHTML=h;
}

function buildFooterContact(){
  const s=siteSettings;
  DOM.footerContact.innerHTML='<h4>Contact</h4><a href="tel:'+esc(s.phone)+'" data-phone>'+fmtPhone(s.phone)+'</a><a href="https://wa.me/'+esc(s.whatsapp)+'" target="_blank" rel="noopener" data-wa>WhatsApp</a><a href="#" onclick="openContact()">Visit Store</a>';
}

// ═══════════════════════════════════════════════════════════
//  FIRESTORE: LOAD (parallel with Promise.allSettled)
// ═══════════════════════════════════════════════════════════
async function loadProducts(){
  try{
    const snap=await getDocs(collection(db,"products"));
    if(snap.empty){
      try{
        // Batch seed: use Promise.all for parallel writes
        await Promise.all(DEFAULT_PRODUCTS.map(p=>addDoc(collection(db,"products"),{...p})));
        const s2=await getDocs(collection(db,"products"));
        products=s2.docs.map(d=>({...d.data(),id:d.id}));
      }catch(e){console.warn("Seed failed:",e);products=DEFAULT_PRODUCTS.map((p,i)=>({...p,id:"local_"+i}));}
    }
    else products=snap.docs.map(d=>({...d.data(),id:d.id}));
  }catch(e){console.warn("Firestore unavailable:",e);products=DEFAULT_PRODUCTS.map((p,i)=>({...p,id:"local_"+i}));}
  isLoading=false;
  visible=currentCat==="all"?[...products]:products.filter(p=>p.cat===currentCat);
  buildHanger();
}

async function loadSettings(){
  try{const snap=await getDoc(doc(db,"settings","shop"));if(snap.exists())siteSettings={...DEFAULT_SETTINGS,...snap.data()};}catch(e){console.warn("Settings load failed:",e);}
  applySiteSettings(siteSettings);populateAdminFields();
}

async function loadCategories(){
  try{const snap=await getDoc(doc(db,"settings","categories"));if(snap.exists()&&snap.data().list)categories=snap.data().list;}catch(e){console.warn("Categories load failed:",e);}
  buildNav();buildCatStrip();buildCatDropdown();renderCatList();buildPromoCatSelects();
}

// ═══════════════════════════════════════════════════════════
//  SAVE ALL SETTINGS
// ═══════════════════════════════════════════════════════════
async function saveAllSettings(){
  const g=id=>$(id).value.trim();
  siteSettings={...siteSettings,
    name:g("adm-name"),hindi:g("adm-hindi"),address:g("adm-addr"),phone:g("adm-phone"),whatsapp:g("adm-wa"),
    topbarText:g("adm-topbar"),announceText:g("adm-announce"),
    heroOverline:g("adm-hero-over"),heroLine1:g("adm-hero-l1"),heroLine2:g("adm-hero-l2"),heroLine3:g("adm-hero-l3"),
    heroSub:g("adm-hero-sub"),heroBtnPrimary:g("adm-hero-btn1"),heroBtnSecondary:g("adm-hero-btn2"),
    collectionEyebrow:g("adm-coll-eye"),collectionPrefix:g("adm-coll-pre"),collectionHighlight:g("adm-coll-hi"),
    promo1Eye:g("adm-p1-eye"),promo1Line1:g("adm-p1-l1"),promo1Line2:g("adm-p1-l2"),promo1Cta:g("adm-p1-cta"),promo1Cat:g("adm-p1-cat"),
    promo2Eye:g("adm-p2-eye"),promo2Line1:g("adm-p2-l1"),promo2Line2:g("adm-p2-l2"),promo2Cta:g("adm-p2-cta"),promo2Cat:g("adm-p2-cat"),
    footerCopyright:g("adm-foot-copy"),footerTagline:g("adm-foot-tag")
  };
  applySiteSettings(siteSettings);
  try{await setDoc(doc(db,"settings","shop"),siteSettings);showToast("All settings saved","ok");}
  catch(e){showToast("Saved locally (sync failed)");}
}

// ═══════════════════════════════════════════════════════════
//  CATEGORIES CRUD
// ═══════════════════════════════════════════════════════════
async function saveCategories(){try{await setDoc(doc(db,"settings","categories"),{list:categories});}catch(e){console.warn("Cat save failed:",e);}}

function renderCatList(){
  $("adm-cat-list").innerHTML=categories.length?categories.map(c=>
    '<div class="adm-row"><div class="adm-row-info"><strong>'+esc(c.label)+'</strong><small>Filter: '+esc(c.name)+'</small></div><button class="adm-del" data-cat-del="'+esc(c.name)+'" onclick="removeCategory(this.dataset.catDel)">Remove</button></div>'
  ).join(""):'<p style="font-style:italic;color:var(--dust);font-size:13px">No categories.</p>';
}

async function addCategory(){
  const name=$("nc-name").value.trim();
  const label=$("nc-label").value.trim()||name;
  if(!name){showToast("Enter a category name");return;}
  if(categories.find(c=>c.name===name)){showToast("Category already exists");return;}
  categories.push({name,label});
  await saveCategories();
  buildNav();buildCatStrip();buildCatDropdown();renderCatList();buildPromoCatSelects();
  $("nc-name").value="";$("nc-label").value="";
  showToast('"'+label+'" added',"ok");
}

async function removeCategory(name){
  if(!confirm("Remove this category?"))return;
  categories=categories.filter(c=>c.name!==name);
  await saveCategories();
  buildNav();buildCatStrip();buildCatDropdown();renderCatList();buildPromoCatSelects();
  if(currentCat===name)setCategory("all");
  showToast("Category removed","ok");
}

// ═══════════════════════════════════════════════════════════
//  3D CAROUSEL — Optimized with DocumentFragment & batched transforms
// ═══════════════════════════════════════════════════════════
// Pre-computed trig table for common angles (optimization)
const SIN_TABLE=new Float32Array(3600);
const COS_TABLE=new Float32Array(3600);
for(let i=0;i<3600;i++){const r=(i/10)*Math.PI/180;SIN_TABLE[i]=Math.sin(r);COS_TABLE[i]=Math.cos(r);}
function fastSin(deg){const d=((deg%360)+360)%360;return SIN_TABLE[Math.round(d*10)%3600];}
function fastCos(deg){const d=((deg%360)+360)%360;return COS_TABLE[Math.round(d*10)%3600];}

function buildHanger(){
  const stage=DOM.carouselStage;stage.innerHTML="";
  if(isLoading){stage.innerHTML='<div style="position:absolute;left:-130px;top:70px;width:260px;text-align:center;font-family:Cormorant Garamond,serif;font-style:italic;color:var(--dust);font-size:17px" class="loading-pulse">Loading collection\u2026</div>';DOM.frontSpotlight.textContent="";return;}
  if(!visible.length){stage.innerHTML='<div style="position:absolute;left:-130px;top:70px;width:260px;text-align:center;font-family:Cormorant Garamond,serif;font-style:italic;color:var(--dust);font-size:17px">Nothing here yet</div>';DOM.frontSpotlight.textContent="";return;}

  const frag=document.createDocumentFragment();
  visible.forEach((p,i)=>{
    const disc=p.mrp>p.price?Math.round(((p.mrp-p.price)/p.mrp)*100):0;
    const imgH=p.img?'<img src="'+p.img+'" alt="'+esc(p.name)+'" loading="lazy" decoding="async" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:64px;position:absolute;inset:0">'+p.emoji+'</span>':'<span>'+p.emoji+'</span>';
    const el=document.createElement("div");el.className="cloth-item";el.id="cl-"+i;
    el.innerHTML='<svg class="hanger-wire" viewBox="0 0 20 22" fill="none"><path d="M10 2 Q14 2 14 7 Q14 10 10 11 Q2 13 2 18 Q2 22 18 22" stroke="#9A9080" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="2" r="2" fill="#9A9080"/></svg><div class="cloth-card" data-pid="'+esc(p.id)+'" onclick="openPD(this.dataset.pid)"><div class="cloth-img-wrap">'+imgH+(disc>0?'<div class="cloth-badge">'+disc+'% off</div>':'')+'</div><div class="cloth-info"><div class="cloth-name">'+esc(p.name)+'</div><div class="cloth-pricing"><span class="cloth-price">\u20B9'+p.price.toLocaleString("en-IN")+'</span>'+(p.mrp>p.price?'<span class="cloth-old">\u20B9'+p.mrp.toLocaleString("en-IN")+'</span>':'')+'</div></div><div class="cloth-actions"><button class="c-add-btn" onclick="event.stopPropagation();addToCart(this.closest(\'[data-pid]\').dataset.pid)">Add to Bag</button><button class="c-wa-btn" onclick="event.stopPropagation();shareWA(this.closest(\'[data-pid]\').dataset.pid)" title="WhatsApp">\u{1F4AC}</button></div></div>';
    frag.appendChild(el);
  });
  stage.appendChild(frag);
  placeItems();updateSpotlight();
}

// Batched transform updates using cached element refs
let _itemEls=null;
function placeItems(){
  const n=visible.length;if(!n)return;
  const step=360/n;
  // Cache element references
  if(!_itemEls||_itemEls.length!==n){_itemEls=[];for(let i=0;i<n;i++)_itemEls[i]=$("cl-"+i);}
  for(let i=0;i<n;i++){
    const el=_itemEls[i];if(!el)continue;
    const a=((step*i+angle)%360+360)%360;
    const sinA=fastSin(a),cosA=fastCos(a);
    const x=sinA*RADIUS,z=cosA*RADIUS;
    const norm=(z+RADIUS)/(2*RADIUS);
    // Items in the back half (norm < 0.35) are fully hidden
    const isBack=norm<0.35;
    const sc=.62+norm*.38;
    const y=28+(1-norm)*26;
    // Front items are fully opaque; side items fade; back items hidden
    const op=isBack?0:(.5+norm*.5);
    const zi=isBack?0:Math.round(norm*100);
    const isFront=a<18||a>342;
    // Use translate3d for GPU compositing
    el.style.cssText="transform:translate3d("+(x-CARD_W/2)+"px,"+y+"px,0) scale("+sc+") rotateY("+(-a*.08)+"deg);opacity:"+op+";z-index:"+zi+";pointer-events:"+(isBack?"none":"auto");
    el.classList.toggle("is-front",isFront);
  }
}

function getFrontIdx(){
  const n=visible.length;if(!n)return -1;
  const step=360/n;let best=0,bd=999;
  for(let i=0;i<n;i++){const a=((step*i+angle)%360+360)%360,d=Math.min(a,360-a);if(d<bd){bd=d;best=i;}}
  return best;
}

function updateSpotlight(){
  const i=getFrontIdx();
  if(i<0){DOM.frontSpotlight.textContent="";return;}
  const p=visible[i];
  DOM.frontSpotlight.innerHTML='<em>'+esc(p.name)+'</em> &nbsp;\u2014&nbsp; \u20B9'+p.price.toLocaleString("en-IN");
}

function rotateTo(dir){
  const n=visible.length;if(!n)return;
  target=angle+(dir>0?-(360/n):(360/n));
  if(!raf)animLoop();
}

// Optimized animation loop with lerp
function animLoop(){
  const diff=target-angle;
  if(Math.abs(diff)<.3){angle=target;placeItems();updateSpotlight();raf=null;return;}
  angle+=diff*.13;placeItems();updateSpotlight();
  raf=requestAnimationFrame(animLoop);
}

// Drag / swipe / keyboard — passive listeners & debounced
const DRAG_THRESHOLD=36;
document.addEventListener("mousedown",e=>{if(e.target.closest(".carousel-vp")){dragX=e.clientX;dragging=true;}});
document.addEventListener("touchstart",e=>{if(e.target.closest(".carousel-vp")){dragX=e.touches[0].clientX;dragging=true;}},{passive:true});
document.addEventListener("mousemove",e=>{if(!dragging||dragX===null)return;const dx=e.clientX-dragX;if(Math.abs(dx)>DRAG_THRESHOLD){rotateTo(dx<0?1:-1);dragX=e.clientX;}});
document.addEventListener("touchmove",e=>{if(!dragging||dragX===null)return;const dx=e.touches[0].clientX-dragX;if(Math.abs(dx)>DRAG_THRESHOLD){rotateTo(dx<0?1:-1);dragX=e.touches[0].clientX;}},{passive:true});
document.addEventListener("mouseup",()=>{dragging=false;dragX=null;});
document.addEventListener("touchend",()=>{dragging=false;dragX=null;},{passive:true});
document.addEventListener("keydown",e=>{if(e.key==="ArrowRight")rotateTo(1);if(e.key==="ArrowLeft")rotateTo(-1);});

// ═══════════════════════════════════════════════════════════
//  CATEGORY FILTER
// ═══════════════════════════════════════════════════════════
function setCategory(cat,el){
  currentCat=cat;
  document.querySelectorAll(".cat-pill").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll("#main-nav a").forEach(a=>a.classList.remove("active"));
  if(el){el.classList.add("active");}
  else{
    document.querySelectorAll('.cat-pill[data-cat="'+cat+'"]').forEach(p=>p.classList.add("active"));
    document.querySelectorAll('#main-nav a[data-cat="'+cat+'"]').forEach(a=>a.classList.add("active"));
  }
  visible=cat==="all"?[...products]:products.filter(p=>p.cat===cat);
  angle=0;target=0;_itemEls=null;buildHanger();goCollection();
}
function goCollection(){$("collection-sec").scrollIntoView({behavior:"smooth",block:"start"});}

// ═══════════════════════════════════════════════════════════
//  PRODUCT DETAIL MODAL
// ═══════════════════════════════════════════════════════════
function openPD(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  const disc=p.mrp>p.price?Math.round(((p.mrp-p.price)/p.mrp)*100):0;
  DOM.pdImg.innerHTML=p.img?'<img src="'+p.img+'" alt="'+esc(p.name)+'" loading="eager" decoding="async" onerror="this.style.display=\'none\'">':'<span>'+p.emoji+'</span>';
  DOM.pdInfo.innerHTML='<div><div class="modal-eyebrow">'+esc(p.cat)+'</div><div class="modal-name">'+esc(p.name)+'</div><div class="modal-price-el">\u20B9'+p.price.toLocaleString("en-IN")+(p.mrp>p.price?'<span class="modal-mrp">\u20B9'+p.mrp.toLocaleString("en-IN")+'</span>':'')+'</div>'+(disc>0?'<div class="modal-disc">'+disc+'% off MRP</div>':'')+'<p class="modal-desc">'+esc(p.desc)+'</p></div><div class="modal-acts"><button class="btn-add" data-pid="'+esc(p.id)+'" onclick="addToCart(this.dataset.pid);document.getElementById(\'pd-modal\').classList.remove(\'open\')">Add to Bag</button><button class="btn-wa-modal" data-pid="'+esc(p.id)+'" onclick="shareWA(this.dataset.pid)">\u{1F4AC} &nbsp; Enquire on WhatsApp</button></div>';
  DOM.pdModal.classList.add("open");
}

// ═══════════════════════════════════════════════════════════
//  CART — optimized with Map for O(1) lookups
// ═══════════════════════════════════════════════════════════
function addToCart(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  const ex=cart.find(i=>i.id===id);
  if(ex)ex.qty++;else cart.push({...p,qty:1});
  updateCartUI();showToast('"'+p.name+'" added to bag',"ok");
}
function updateCartUI(){
  DOM.cartCount.textContent=cart.reduce((s,i)=>s+i.qty,0);
  renderCart();
}
function renderCart(){
  if(!cart.length){DOM.cartItems.innerHTML='<div class="cart-empty-msg">Your bag is empty.</div>';DOM.cartFoot.style.display="none";return;}
  DOM.cartFoot.style.display="block";let total=0;
  // Build with DocumentFragment
  const frag=document.createDocumentFragment();
  cart.forEach(item=>{
    total+=item.price*item.qty;
    const div=document.createElement("div");div.className="cart-item";
    const img=item.img?'<img src="'+item.img+'" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover">':'<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:32px">'+item.emoji+'</div>';
    div.innerHTML='<div class="ci-img">'+img+'</div><div class="ci-info"><div class="ci-name">'+esc(item.name)+'</div><div class="ci-price">\u20B9'+(item.price*item.qty).toLocaleString("en-IN")+'</div><div class="qty-row"><button class="qty-btn" data-cid="'+esc(item.id)+'" onclick="chQ(this.dataset.cid,-1)">\u2212</button><span class="qty-n">'+item.qty+'</span><button class="qty-btn" data-cid="'+esc(item.id)+'" onclick="chQ(this.dataset.cid,1)">+</button></div><button class="ci-remove" data-cid="'+esc(item.id)+'" onclick="remCart(this.dataset.cid)">Remove</button></div>';
    frag.appendChild(div);
  });
  DOM.cartItems.innerHTML="";DOM.cartItems.appendChild(frag);
  DOM.cartTotal.textContent="\u20B9"+total.toLocaleString("en-IN");
}
function chQ(id,d){const i=cart.find(x=>x.id===id);if(!i)return;i.qty+=d;if(i.qty<=0)cart=cart.filter(x=>x.id!==id);updateCartUI();}
function remCart(id){cart=cart.filter(x=>x.id!==id);updateCartUI();}
function openCart(){DOM.cartDrawer.classList.add("open");DOM.drawerOv.classList.add("open");renderCart();}
function closeCart(){DOM.cartDrawer.classList.remove("open");DOM.drawerOv.classList.remove("open");}
function checkoutWA(){
  if(!cart.length)return;const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  let msg="\u{1F6CD}\uFE0F *My Order \u2014 "+siteSettings.name+"*\n\n*Items:*\n";
  cart.forEach(i=>{msg+="\u2022 "+i.emoji+" "+i.name+"  x"+i.qty+"  \u20B9"+(i.price*i.qty).toLocaleString("en-IN")+"\n";if(i.img&&!i.img.startsWith("data:"))msg+="  \u{1F5BC}\uFE0F "+i.img+"\n";});
  msg+="\n*Total: \u20B9"+total.toLocaleString("en-IN")+"*\n\nKindly confirm. \u{1F64F}";
  window.open("https://wa.me/"+siteSettings.whatsapp+"?text="+encodeURIComponent(msg),"_blank");
}
function shareWA(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  let msg=p.emoji+" *"+p.name+"*\n\u20B9"+p.price.toLocaleString("en-IN");
  if(p.mrp>p.price)msg+=" (MRP \u20B9"+p.mrp.toLocaleString("en-IN")+")";
  msg+="\n"+p.desc;if(p.img&&!p.img.startsWith("data:"))msg+="\n\u{1F5BC}\uFE0F "+p.img;
  window.open("https://wa.me/"+siteSettings.whatsapp+"?text="+encodeURIComponent(msg),"_blank");
  showToast("Opening WhatsApp\u2026","wa");
}
function openContact(){$("contact-modal").classList.add("open");}

// ═══════════════════════════════════════════════════════════
//  ADMIN AUTH
// ═══════════════════════════════════════════════════════════
function openAdmin(){
  DOM.adminOv.classList.add("open");
  if(adminUnlocked){DOM.adminLock.style.display="none";DOM.adminPanel.style.display="block";renderAdminList();}
}
async function unlockAdmin(){const email=$("adm-email").value.trim(),pw=$("adm-pw").value;if(!email||!pw){showToast("Enter email & password");return;}try{await signInWithEmailAndPassword(auth,email,pw);showToast("Welcome, Admin","ok");}catch(e){showToast("Incorrect credentials");$("adm-pw").value="";}}
async function adminSignOut(){try{await firebaseSignOut(auth);closeAdmin();showToast("Signed out","ok");}catch(e){showToast("Sign out failed");}}
onAuthStateChanged(auth,user=>{
  adminUnlocked=!!user;
  if(user){
    DOM.adminToggle.textContent="Admin";
    DOM.adminLock.style.display="none";
    DOM.adminPanel.style.display="block";
    renderAdminList();populateAdminFields();
  }else{
    DOM.adminToggle.textContent="Sign In";
    DOM.adminLock.style.display="block";
    DOM.adminPanel.style.display="none";
  }
});
function closeAdmin(){DOM.adminOv.classList.remove("open");}

// ═══════════════════════════════════════════════════════════
//  PRODUCT CRUD
// ═══════════════════════════════════════════════════════════
async function applyHero(input){
  const file=input.files[0];if(!file)return;showToast("Uploading\u2026");
  try{const sr=sRef(storage,"hero/"+Date.now()+"_"+file.name);await uploadBytes(sr,file);const url=await getDownloadURL(sr);DOM.heroBg.style.cssText="background-image:url('"+url+"');background-size:cover;background-position:center";const p=$("hero-prev");p.src=url;p.style.display="block";siteSettings.heroImage=url;await setDoc(doc(db,"settings","shop"),siteSettings);showToast("Hero updated","ok");}
  catch(e){const r=new FileReader();r.onload=ev=>{DOM.heroBg.style.cssText="background-image:url('"+ev.target.result+"');background-size:cover;background-position:center";const p=$("hero-prev");p.src=ev.target.result;p.style.display="block";};r.readAsDataURL(file);showToast("Hero updated locally","ok");}
}
function prevProdImg(input){const file=input.files[0];if(!file)return;const r=new FileReader();r.onload=e=>{const p=$("np-img-prev");p.src=e.target.result;p.style.display="block";};r.readAsDataURL(file);}
async function addProduct(){
  const name=$("np-name").value.trim(),price=parseInt($("np-price").value),mrp=parseInt($("np-mrp").value)||price;
  if(!name||!price){showToast("Fill Name & Price");return;}showToast("Adding\u2026");
  let imgUrl="";const fi=$("np-img-up");
  if(fi.files&&fi.files[0]){try{const f=fi.files[0],sr=sRef(storage,"products/"+Date.now()+"_"+f.name);await uploadBytes(sr,f);imgUrl=await getDownloadURL(sr);}catch(e){console.warn("Upload failed:",e);}}
  const pd={name,cat:$("np-cat").value,price,mrp,desc:$("np-desc").value.trim()||"A beautiful piece from our collection.",emoji:$("np-emoji").value.trim()||"\u{1F457}",img:imgUrl};
  try{await addDoc(collection(db,"products"),pd);await loadProducts();}catch(e){products.push({...pd,id:"local_"+Date.now()});visible=currentCat==="all"?[...products]:products.filter(p=>p.cat===currentCat);_itemEls=null;buildHanger();}
  renderAdminList();["np-name","np-price","np-mrp","np-desc"].forEach(id=>$(id).value="");$("np-img-prev").style.display="none";$("np-emoji").value="\u{1F458}";if(fi)fi.value="";showToast('"'+name+'" added',"ok");
}
function renderAdminList(){$("adm-prod-list").innerHTML=products.length?products.map(p=>'<div class="adm-row"><div class="adm-row-emoji">'+p.emoji+'</div><div class="adm-row-info"><strong>'+esc(p.name)+'</strong><small>'+esc(p.cat)+' \u00B7 \u20B9'+p.price.toLocaleString("en-IN")+'</small></div><button class="adm-del" data-del-pid="'+esc(p.id)+'" onclick="delProduct(this.dataset.delPid)">Delete</button></div>').join(""):'<p style="font-style:italic;color:var(--dust);font-size:13px">No products yet.</p>';}
async function delProduct(id){if(!confirm("Remove this piece?"))return;try{await deleteDoc(doc(db,"products",id));await loadProducts();}catch(e){products=products.filter(x=>x.id!==id);visible=currentCat==="all"?[...products]:products.filter(p=>p.cat===currentCat);_itemEls=null;buildHanger();}renderAdminList();showToast("Product removed","ok");}

// ═══════════════════════════════════════════════════════════
//  TOAST & CURSOR — optimized with RAF batched updates
// ═══════════════════════════════════════════════════════════
function showToast(msg,type){
  type=type||"";
  DOM.toast.textContent=msg;
  DOM.toast.className="toast show"+(type?" "+type:"");
  clearTimeout(DOM.toast._t);
  DOM.toast._t=setTimeout(()=>DOM.toast.className="toast",2800);
}

// Cursor: use RAF for smooth updates, skip if not moving
let _cx=0,_cy=0,_cursorRaf=false;
function updateCursor(){
  DOM.cursorDot.style.left=_cx+"px";DOM.cursorDot.style.top=_cy+"px";
  DOM.cursorRing.style.left=_cx+"px";DOM.cursorRing.style.top=_cy+"px";
  _cursorRaf=false;
}
document.addEventListener("mousemove",e=>{
  _cx=e.clientX;_cy=e.clientY;
  if(!_cursorRaf){_cursorRaf=true;requestAnimationFrame(updateCursor);}
},{passive:true});
document.addEventListener("mousedown",()=>{DOM.cursorDot.style.transform="translate3d(-50%,-50%,0) scale(2.2)";DOM.cursorRing.style.transform="translate3d(-50%,-50%,0) scale(0.55)";});
document.addEventListener("mouseup",()=>{DOM.cursorDot.style.transform="translate3d(-50%,-50%,0)";DOM.cursorRing.style.transform="translate3d(-50%,-50%,0)";});

// ═══════════════════════════════════════════════════════════
//  HERO SLIDER
// ═══════════════════════════════════════════════════════════
let heroIdx=0;
const heroSlides=[{img:"images/bridal_lehenga.png"},{img:"images/red_banarasi_saree.png"},{img:"images/designer_anarkali.png"}];
function buildHeroThumbs(){DOM.heroThumbs.innerHTML=heroSlides.map((s,i)=>'<div class="hero-thumb '+(i===0?"active":"")+'" onclick="setHeroSlide('+i+')" id="ht-'+i+'"><div class="hero-thumb-img"><img src="'+s.img+'" style="width:100%;height:100%;object-fit:cover;"></div></div>').join("");}
function setHeroSlide(i){heroIdx=i;const s=heroSlides[i];DOM.heroBg.style.cssText="background:url('"+s.img+"') center top / cover no-repeat; transition: background 0.8s ease;";document.querySelectorAll(".hero-thumb").forEach((t,j)=>t.classList.toggle("active",j===i));}
setInterval(()=>setHeroSlide((heroIdx+1)%heroSlides.length),4500);

// ═══════════════════════════════════════════════════════════
//  EXPOSE TO WINDOW
// ═══════════════════════════════════════════════════════════
Object.assign(window,{
  setCategory,goCollection,openCart,closeCart,rotateTo,openPD,addToCart,shareWA,openContact,
  openAdmin,unlockAdmin,adminSignOut,closeAdmin,saveAllSettings,
  applyHero,prevProdImg,addProduct,delProduct,renderAdminList,
  addCategory,removeCategory,
  checkoutWA,chQ,remCart,setHeroSlide,toggleTheme,toggleVideo
});

// ═══════════════════════════════════════════════════════════
//  INIT — parallel data loading
// ═══════════════════════════════════════════════════════════
buildHeroThumbs();
buildHanger();
// Load all data in parallel
Promise.allSettled([loadCategories(),loadProducts(),loadSettings()]);

// ═══════════════════════════════════════════════════════════
//  SCROLL LISTENER (Top Banner & Brand Fade)
// ═══════════════════════════════════════════════════════════
window.addEventListener("scroll", () => {
  const topbar = document.getElementById("topbar-banner");
  const brand = document.querySelector(".brand");
  
  if (topbar) {
    if (window.scrollY > 50) {
      topbar.classList.add("hidden");
    } else {
      topbar.classList.remove("hidden");
    }
  }
  
  if (brand) {
    // Fade brand slightly later than topbar
    if (window.scrollY > 150) {
      brand.classList.add("hidden");
    } else {
      brand.classList.remove("hidden");
    }
  }
}, { passive: true });

// ═══════════════════════════════════════════════════════════
//  DARK THEME TOGGLE
// ═══════════════════════════════════════════════════════════
function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Check local storage for theme on load
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
}



// ═══════════════════════════════════════════════════════════
//  VIDEO TOGGLE
// ═══════════════════════════════════════════════════════════
function toggleVideo() {
  const vid = document.getElementById("bg-video");
  const icon = document.getElementById("vid-icon");
  const text = document.getElementById("vid-text");
  if (vid.paused) {
    vid.play();
    icon.innerHTML = "&#x23F8;";
    text.innerText = "Pause Video";
  } else {
    vid.pause();
    icon.innerHTML = "&#x25B6;";
    text.innerText = "Play Video";
  }
}
