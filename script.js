const products=[
{id:'salad',name:'Signature Garden Salad',price:10.95,cat:'mains',img:'assets/images/hero-salad.webp',desc:'Chicken, crisp greens, avocado, fruit and creamy herb dressing.'},
{id:'burger',name:'Aroma House Burger',price:12.50,cat:'mains',img:'assets/images/hero-burger.webp',desc:'A hearty café burger with greens, onion and house sauce.'},
{id:'shrimp',name:'Shrimp Pasta',price:15.95,cat:'mains',img:'assets/images/hero-pasta.webp',desc:'Tomato-forward pasta with shrimp, herbs and shaved cheese.'},
{id:'penne',name:'Creamy Herb Penne',price:12.95,cat:'mains',img:'assets/images/menu-penne.webp',desc:'Creamy penne with herbs and a rich, comforting finish.'},
{id:'toast',name:'Avocado Breakfast Toast',price:9.50,cat:'breakfast',img:'assets/images/menu-toast.webp',desc:'Avocado, cherry tomatoes, greens and sesame on toasted bread.'},
{id:'dessert',name:'Chocolate & Fruit Dessert',price:7.50,cat:'sweet',img:'assets/images/menu-dessert.webp',desc:'Silky chocolate with strawberries, citrus and crisp biscuits.'},
{id:'matcha',name:'Iced Matcha Latte',price:5.25,cat:'drinks',img:'assets/images/menu-matcha.webp',desc:'Cold matcha, milk and ice with a clean, earthy finish.'},
{id:'pizza',name:'Kitchen Pizza',price:13.95,cat:'mains',img:'assets/images/pizza.webp',desc:'A casual café pizza with tomato, cheese and savory toppings.'}
];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>`$${n.toFixed(2)}`;

// Cinematic scroll scene: 3 image crossfades + full-screen cream handoff.
const intro=$('.scroll-intro'), layers=$$('.food-layer'), hero=$('.hero-copy'), cover=$('.page-two-cover'), sceneIndex=$('[data-scene-index]');
function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v))}
function range(v,a,b){return clamp((v-a)/(b-a))}
function updateIntro(){
  if(!intro || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const rect=intro.getBoundingClientRect();
  const max=intro.offsetHeight-innerHeight;
  const p=clamp(-rect.top/Math.max(1,max));
  const segments=[{a:0,b:.31},{a:.27,b:.62},{a:.58,b:.83}];
  layers.forEach((el,i)=>{
    const s=segments[i];
    const enter=range(p,s.a,s.a+.055); const exit=1-range(p,s.b-.055,s.b);
    const op=clamp(Math.min(enter|| (p<=s.a?0:1),exit));
    const local=range(p,s.a,s.b);
    el.style.opacity=op;
    // Keep zoom restrained so images stay sharp; vertical drift adds motion without blank areas.
    const scale=1.02+local*.105;
    const y=(i===0?0:i===1?1.5:3.5)*local;
    el.style.transform=`scale(${scale}) translate3d(0,${y}%,0)`;
    el.style.zIndex=String(1+i);
  });
  const heroFade=1-range(p,.48,.72);
  hero.style.opacity=heroFade;
  hero.style.transform=`translateY(calc(-43% + ${range(p,0,.7)*-20}px))`;
  sceneIndex.textContent=p<.31?'01':p<.62?'02':'03';
  const c=range(p,.79,.94);
  cover.style.opacity=c;
}
addEventListener('scroll',updateIntro,{passive:true}); addEventListener('resize',updateIntro); updateIntro();

// Header
addEventListener('scroll',()=>$('#siteHeader').classList.toggle('compact',scrollY>60),{passive:true});

// Menu render/filter
const menuGrid=$('#menuGrid');
function renderMenu(filter='all'){
  const list=products.filter(p=>filter==='all'||p.cat===filter);
  menuGrid.innerHTML=list.map(p=>`<article class="menu-card"><figure><img src="${p.img}" alt="${p.name}" loading="lazy"></figure><div class="menu-card-body"><div class="menu-meta"><h3>${p.name}</h3><span class="price">${money(p.price)}</span></div><p>${p.desc}</p><button class="add-btn" data-add="${p.id}" type="button">Add to cart</button></div></article>`).join('');
}
renderMenu();
$$('.filter').forEach(b=>b.addEventListener('click',()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderMenu(b.dataset.filter)}));

// Cart
let cart=JSON.parse(localStorage.getItem('aromaWhiteCart')||'{}');
const drawer=$('.cart-drawer'), backdrop=$('.drawer-backdrop'), cartItems=$('#cartItems');
function persist(){localStorage.setItem('aromaWhiteCart',JSON.stringify(cart))}
function cartCount(){return Object.values(cart).reduce((a,b)=>a+b,0)}
function renderCart(){
  $$('[data-cart-count]').forEach(el=>el.textContent=cartCount());
  const rows=Object.entries(cart).filter(([,q])=>q>0).map(([id,q])=>{const p=products.find(x=>x.id===id);return `<div class="cart-row"><img src="${p.img}" alt=""><div><h4>${p.name}</h4><div class="qty"><button data-qty="${id}" data-delta="-1" type="button">−</button><span>${q}</span><button data-qty="${id}" data-delta="1" type="button">+</button></div></div><strong>${money(p.price*q)}</strong></div>`}).join('');
  cartItems.innerHTML=rows||'<p>Your cart is empty.</p>';
  const sub=Object.entries(cart).reduce((sum,[id,q])=>sum+(products.find(x=>x.id===id)?.price||0)*q,0), tax=sub*.0825;
  $('#subtotal').textContent=money(sub);$('#tax').textContent=money(tax);$('#total').textContent=money(sub+tax);$('#checkoutBtn').disabled=sub===0;
}
function openCart(){drawer.classList.add('open');backdrop.classList.add('open');drawer.setAttribute('aria-hidden','false')}
function closeCart(){drawer.classList.remove('open');backdrop.classList.remove('open');drawer.setAttribute('aria-hidden','true')}
document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');if(add){cart[add.dataset.add]=(cart[add.dataset.add]||0)+1;persist();renderCart();openCart()}
  if(e.target.closest('[data-open-cart]'))openCart();if(e.target.closest('[data-close-cart]'))closeCart();
  const q=e.target.closest('[data-qty]');if(q){const id=q.dataset.qty;cart[id]=Math.max(0,(cart[id]||0)+Number(q.dataset.delta));if(!cart[id])delete cart[id];persist();renderCart()}
});
renderCart();

// Checkout demo
const dlg=$('#checkoutDialog');$('#checkoutBtn').addEventListener('click',()=>{closeCart();dlg.showModal()});$('#checkoutForm').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;cart={};persist();renderCart();dlg.close();alert('Demo order confirmed — no real order or payment was created.');e.currentTarget.reset()});

// Mobile nav
const toggle=$('.menu-toggle'), panel=$('.mobile-panel');
toggle.addEventListener('click',()=>{const open=panel.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));panel.setAttribute('aria-hidden',String(!open))});panel.addEventListener('click',e=>{if(e.target.matches('a')){panel.classList.remove('open');toggle.setAttribute('aria-expanded','false')}});

// Reveal observer
const observer=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('visible');observer.unobserve(x.target)}}),{threshold:.14});$$('.reveal').forEach(el=>observer.observe(el));
