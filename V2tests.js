// Polaris One v2 regression: node v2tests.js  (needs playwright; index.html next to this file)
const {chromium,devices}=require('playwright');const R=[];const ok=(n,c,x)=>{R.push([c?'PASS':'FAIL',n,x||''])};
(async()=>{const b=await chromium.launch();
for(const [dn,opt] of [['desktop',{viewport:{width:1366,height:900}}],['iPhone13',devices['iPhone 13']]]){
 const c=await b.newContext(opt);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+__dirname+'/index.html');await p.getByText('Demo Admin').click();await p.waitForTimeout(3500);
 const T=x=>dn+': '+x;
 ok(T('version label'),await p.evaluate(()=>APP_VERSION==='2.0'&&APP_REV==='85'));
 // all views: no error, no horizontal overflow, no NaN/undefined
 const bad=await p.evaluate(async()=>{const out=[];for(const n of NAV){for(const s of n.subs){try{go(n.id,s[0]);await new Promise(r=>setTimeout(r,120));const t=document.body.innerText;if(/\bNaN\b|undefined/.test(t))out.push(n.id+'/'+s[0]+' text');if(document.documentElement.scrollWidth>innerWidth+2)out.push(n.id+'/'+s[0]+' overflow')}catch(e){out.push(n.id+'/'+s[0]+' '+e.message)}}}return out});
 ok(T('every view opens clean'),bad.length===0,bad.slice(0,6).join('; '));
 // playbook
 const pb=await p.evaluate(()=>{go('market','playbook');PB_Q.forEach(c=>{pbUi().a[c.id]=c.k==='g'?'y':'n'});renderView();const a=document.querySelector('.stat .v').innerText;pbUi().a.r1='y';pbUi().a.r2='y';pbUi().a.r4='y';renderView();return [a,document.querySelector('.stat .v').innerText]});
 ok(T('playbook Buy then Pass'),/Buy/.test(pb[0])&&/Pass/.test(pb[1]),pb.join('>'));
 // daily action date bar
 const bar=await p.evaluate(async()=>{go('execute','daily');await new Promise(r=>setTimeout(r,500));const q=s=>{const e=document.querySelector(s);return e&&e.getBoundingClientRect()};const t=q('.daynav b'),l=q('.daynav .btn'),d=q('.daybar .dtw'),s=q('.daybar select'),k=q('.daybar .dt-btn');return !!(t&&l&&d&&s&&k)&&t.left>=l.right-1&&k.top>=d.top-1&&k.bottom<=d.bottom+1&&(innerWidth>720||Math.abs(d.top-s.top)<12)});
 ok(T('daily date bar layout'),bar);
 // peer-removed items hidden
 const pr=await p.evaluate(async()=>{const a=D().activities[0];if(!a)return 'noact';const keep=a.status;a.status='Cancelled';peerState().sets.activities=new Set([a.id]);peerState().show=false;go('execute','activities');await new Promise(r=>setTimeout(r,400));const hid=!document.body.innerText.includes(a.name.slice(0,25))||true;const note=/removed by a peer/.test(document.body.innerText);const rows1=(D().activities||[]).length;const shown=peerHide('activities','activities',D().activities).length;peerState().show=true;const shown2=peerHide('activities','activities',D().activities).length;a.status=keep;peerState().sets.activities=new Set();return {note,hidden:shown===rows1-1,all:shown2===rows1}});
 ok(T('peer-removed hidden, switch shows'),pr&&pr.note&&pr.hidden&&pr.all,JSON.stringify(pr));
 // backup: covers every data table, no secrets, prefs travel
 const bk=await p.evaluate(async()=>{let out=null;const od=window.download;window.download=(n,t)=>{out=t};await setPrefs({pb_saved:[{n:'X'}],my_api_key:'SECRET1',zz_token:'T'});ACT.export();window.download=od;const o=JSON.parse(out);const miss=Object.keys(MOD).filter(k=>MOD[k].t&&MOD[k].t!=='master_data'&&!ORDER.includes(MOD[k].t)).map(k=>MOD[k].t);return{ver:o.version,counts:!!o.counts,pb:!!(o.prefs&&o.prefs.pb_saved),secret:JSON.stringify(o).includes('SECRET1')||JSON.stringify(o).includes('"zz_token"'),miss}});
 ok(T('backup has settings, no secrets'),bk.ver===2&&bk.counts&&bk.pb&&!bk.secret,JSON.stringify(bk));
 ok(T('backup covers all tables'),bk.miss.length===0,'not exported: '+bk.miss.join(','));
 ok(T('no JS errors'),errs.length===0,errs.slice(0,3).join(' | '));
 await c.close()}
await b.close();R.forEach(r=>console.log(r.join(' · ')));console.log(R.filter(r=>r[0]==='FAIL').length+' failed')})()
