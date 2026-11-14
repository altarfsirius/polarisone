const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,300)));
await p.goto('file://'+require('path').resolve(__dirname,'../index.html')+'');await p.waitForTimeout(2000);await p.getByText('Demo Admin').click();await p.waitForTimeout(4000);
const r=await p.evaluate(async()=>{const o={},w=ms=>new Promise(r=>setTimeout(r,ms));
 const pf=async n=>await saveRow('portfolios',{name:n,icon:'📌',color:'#123456',sort_order:99});
 const names=['Work','Freelance','Personal Development','Automotive','Trading'];
 const A={};for(const n of names){A[n]=(D().portfolios||[]).find(x=>x.name===n)||await pf(n)}
 const t=todayS(),base={status:'In Progress',progress:10,priority:'High',type:'Project',planned_start:t,planned_finish:addD(t,5)};
 const mk=async(name,pid,par)=>await saveRow('activities',Object.assign({},base,{name,portfolio_id:pid||null,parent_id:par||null}));
 const aPD=await mk('T-PD',A['Personal Development'].id),aAU=await mk('T-AU',A['Automotive'].id),aW=await mk('T-W',A['Work'].id);
 const sub=await mk('T-sub',null,aPD.id),sub2={id:'t-sub2',name:'T-sub2',parent_id:sub.id,portfolio_id:null},orph={id:'t-orph',name:'T-orph',parent_id:'zzz',portfolio_id:null},none=await mk('T-none',null,null);
 const c1={id:'cy1',parent_id:'cy2',portfolio_id:null},c2={id:'cy2',parent_id:'cy1',portfolio_id:null};D().activities.push(sub2,orph,c1,c2);
 const opts=['Work','Freelance','Personal Development'].map(n=>({name:n}));
 const prop=nDomainProp();
 const am={};am[A['Work'].id]={domain:'Work',approved:true};am[A['Personal Development'].id]={domain:'Personal Development',approved:true};am[A['Freelance'].id]={domain:'Freelance',approved:false};
 const OPTS=Object.assign({},nCfg().opts||{},{[prop]:opts});await nSave({opts:OPTS,areaMap:am});
 const chk=(t,r)=>{const c=nAreaCheck(t,r);return c.ok?'OK:'+c.area.name:c.code};
 o.work=chk('activities',aW);o.pd=chk('activities',aPD);o.auto_unpaired=chk('activities',aAU);
 o.sub=chk('activities',sub);o.nested=chk('activities',sub2);o.orphan=chk('activities',orph);o.none=chk('activities',none);o.cycle=chk('activities',c1);
 o.domPD=nAreaToDomain('activities',sub2);o.domAU=nAreaToDomain('activities',aAU);
 /* Domain option missing in Notion */
 am[A['Automotive'].id]={domain:'Automotive',approved:true};await nSave({areaMap:am});o.auto_noopt=chk('activities',aAU);
 /* a Life Area added later is eligible once paired */
 const nl=await pf('Zebra Area');const z=await mk('T-z',nl.id);o.new_unpaired=chk('activities',z);
 am[nl.id]={domain:'Zebra Area',approved:true};OPTS[prop].push({name:'Zebra Area'});await nSave({opts:OPTS,areaMap:am});o.new_paired=chk('activities',z);
 /* reverse: domain → area (non work/freelance) */
 o.rev=nDomainToArea('Personal Development',null);
 /* daily action */
 const da={activity_id:sub2.id};o.da=chk('daily_actions',da);o.da_standalone=chk('daily_actions',{activity_id:null});
 /* holidays */
 o.hol=[holWhy(''),holWhy('No server-side secret named "apiindonesia"'),holWhy('The API answered HTTP 401: {"message":"invalid"}'),holWhy('The API answered HTTP 429'),holWhy('The API answered HTTP 503'),holWhy('Edge Function: could not be reached. “api-proxy” is probably not deployed')];
 o.holmsg401=holMsg('rejected','The API answered HTTP 401: x').slice(0,90);o.holmsgNone=holMsg('nosecret','').slice(0,70);
 /* guide: prayers by identity */
 const day=todayS();S.pray[day]={g:geoKey(),Fajr:'04:35',Sunrise:'05:50',Dhuhr:'11:55',Asr:'15:12',Maghrib:'17:58',Isha:'19:07'};
 const cfgd=dgCfg(day),pr=dgPray(day),W=dgWindows(day,cfgd,pr,true);
 o.win=W.map(x=>x.id+' '+dgHM(x.a)+'-'+dgHM(x.b));
 o.pw=['Shalat Subuh','Shalat Dzuhur','Shalat Ashar','Shalat Maghrib','Shalat Isya','Dhuha','Dzikir pagi','Baca Quran'].map(n=>n+'→'+(dgPrayWin(W,day,n)||'-'));
 o.known=dgPray(day).known;delete S.pray[day];o.knownAfter=dgPray(day).known;o.note=dgDayNote(day).slice(0,60);
 return o});
console.log(JSON.stringify(r,null,1));console.log('ERRS',errs);await b.close()})();
