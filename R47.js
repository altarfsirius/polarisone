const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,300)));
await p.goto('file://'+require('path').resolve(process.argv[2]||'index.html'));await p.waitForTimeout(2000);await p.getByText('Demo Admin').click();await p.waitForTimeout(4000);
const r=await p.evaluate(async()=>{const o={};
 ngEnableX(true);o.inList=NG_T.includes('activities')&&NG_T.includes('daily_actions');
 const pf=D().portfolios;const A=pf[0],B=pf[1];o.areas=pf.length;
 const mk=async(name,extra)=>saveRow('activities',Object.assign({name,portfolio_id:A.id,status:'In Progress',priority:'High',share_with_notion:true},extra||{}));
 const a1=await mk('Act-one'),a2=await mk('Act-two',{status:'Cancelled'}),a3=await mk('Act-nolink',{portfolio_id:B.id}),a4=await mk('Act-exists');
 const SC={'Name':'title',Domain:'select',Status:'status',Priority:'select',Progress:'formula','Planned':'date','Activity ID':'rich_text',Summary:'rich_text'};
 const OP={Domain:[{name:A.name}],Status:[{name:'Not Started'},{name:'In Progress'},{name:'In Hold'},{name:'Done'}],Priority:[{name:'Low'},{name:'Normal'},{name:'High'},{name:'Critical'}]};
 const maps={name:{prop:'Name',dir:'both'},portfolio_id:{prop:'Domain',dir:'both'},status:{prop:'Status',dir:'both'},priority:{prop:'Priority',dir:'both'},progress:{prop:'Progress',dir:'in'},planned_start:{prop:'Planned',dir:'both'},planned_finish:{prop:'Planned',dir:'both'},ai_summary:{prop:'Summary',dir:'in'}};
 S.profile.prefs.notion_all={t:{activities:{db:'a',ds:'a',schema:SC,opts:OP,fmt:{},maps,areaMap:{[A.id]:{domain:A.name,approved:true}}}}};
 o.ready=ngReady('activities');o.map=ngMap('activities').map(m=>m.f.k+'>'+m.p+(m.dir==='in'?'(in)':'')).join(' ');
 const pages={};let seq=0;
 const mkp=(title,extra)=>{const id='x-'+(++seq);pages[id]=Object.assign({id,_t:'a',last_edited_time:'2020-01-01T00:00:00Z',properties:{Name:{type:'title',title:[{plain_text:title}]}}},extra||{});return id};
 const exist=mkp('Act-exists');
 S.ng.fake=async(m,pth,body)=>{
   if(m==='POST'&&/query/.test(pth))return {results:Object.values(pages),has_more:false};
   if(m==='POST'&&/\/pages$/.test(pth)){const id='n-'+(++seq);pages[id]={id,_t:'a',last_edited_time:new Date().toISOString(),properties:JSON.parse(JSON.stringify(body.properties))};return {id}}
   if(m==='PATCH'){const id=pth.split('/').pop();Object.assign(pages[id].properties,body.properties);pages[id].last_edited_time=new Date().toISOString();return {id}}return {}};
 await ngPlan(['activities']);let pl=S.ng.plan;o.err=S.ng.err;
 o.push=pl.push.map(x=>x.r.name+':'+x.op).join('|');o.skip=pl.skip.map(x=>x.r.name+':'+x.code).join('|');o.link=pl.link.map(x=>x.r.name).join('|');o.review=pl.review.join(' ¦ ');
 const w=pl.push.find(x=>x.r.name==='Act-one');o.props=w&&JSON.stringify({d:w.props.Domain,s:w.props.Status,p:w.props.Priority});
 o.a2status=byId('activities',a2.id).status;o.a2props=JSON.stringify(Object.keys(pl.push.find(x=>x.r.name&&/Act-two/.test(x.r.name)).props));o.why2=JSON.stringify(pl.push.find(x=>/Act-two/.test(x.r.name)).why);o.cancelledNoStatus=!!pl.push.find(x=>/Act-two/.test(x.r.name))&&!pl.push.find(x=>/Act-two/.test(x.r.name)).props.Status;
 /* link: no duplicate page, joined after approval */
 S.ng.decisions={[a4.id]:exist};await ngPlan(['activities']);o.linkApproved=S.ng.plan.link.filter(x=>x.approved).length;
 const before=Object.keys(pages).length;await ngRun();o.created=Object.keys(pages).length-before;o.linkedId=byId('activities',a4.id).notion_page_id===exist;
 /* nothing changed */
 await ngPlan(['activities']);o.again=S.ng.plan.push.length+'/'+S.ng.plan.pull.length;
 /* Notion edits: priority, status Done (not applied), computed progress 0.5 */
 const pid=byId('activities',a1.id).notion_page_id,pg=pages[pid];
 pg.properties.Priority={type:'select',select:{name:'Critical'}};pg.properties.Status={type:'status',status:{name:'Done'}};pg.properties.Progress={type:'formula',formula:{type:'number',number:0.5}};
 pg.properties.Name={type:'title',title:[{plain_text:'Act-one'}]};pg.properties.Domain={type:'select',select:{name:A.name}};pg.properties.Summary={type:'rich_text',rich_text:[{plain_text:'AI wrote'}]};
 pg.last_edited_time=new Date(Date.now()+60000).toISOString();
 await ngPlan(['activities']);const p2=S.ng.plan;o.pull=p2.pull.map(x=>x.diff.map(d=>d.m.f.k+':'+d.from+'->'+d.to).join(',')).join('|');o.review2=p2.review.join(' ¦ ');o.conf=p2.conflicts.length;
 await ngRun();const row=byId('activities',a1.id);o.after=[row.priority,row.status,row.progress,row.ai_summary].join('/');
 /* conflict */
 row.updated_at=new Date(Date.now()+120000).toISOString();pg.properties.Priority={type:'select',select:{name:'Low'}};pg.last_edited_time=new Date(Date.now()+130000).toISOString();
 await ngPlan(['activities']);o.conflict=S.ng.plan.conflicts.length;
 /* daily action */
 const act=byId('activities',a1.id);
 const d1=await saveRow('daily_actions',{title:'Do thing',activity_id:a1.id,action_date:'2026-11-16',status:'Planned',priority:'High',email_to:'x@y.z',share_with_notion:true});
 const SD={'Title':'title',id:'rich_text',Status:'select','Email to':'rich_text','Email draft':'rich_text'};
 S.profile.prefs.notion_all.t.daily_actions={db:'d',ds:'d',schema:SD,opts:{Status:[{name:'Planned'}]},maps:{title:{prop:'Title',dir:'both'},status:{prop:'Status',dir:'both'},email_to:{prop:'Email to',dir:'out'},ai_email_body:{prop:'Email draft',dir:'in'}},areaMap:{[A.id]:{domain:A.name,approved:true}}};
 o.dReady=ngReady('daily_actions');
 await ngPlan(['daily_actions']);const dp=S.ng.plan;o.dPush=dp.push.map(x=>x.r.title+':'+x.op).join('|');o.dSkip=dp.skip.map(x=>x.why).join('|');
 const dw=dp.push[0];o.dProps=dw&&Object.keys(dw.props).join(',');
 o.dEmailOut=dw&&dw.props['Email to']&&dw.props['Email to'].rich_text[0].text.content;
 return o});
console.log(JSON.stringify(r,null,1));console.log('pageerrors',errs);await b.close()})();
