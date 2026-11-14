const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,300)));
await p.goto('file://'+require('path').resolve(process.argv[2]||'index.html'));await p.waitForTimeout(2000);await p.getByText('Demo Admin').click();await p.waitForTimeout(4000);
const r=await p.evaluate(async()=>{const o={};
 o.hasAll=!!CONN.find(c=>c.id==='notion-all');o.noDesk=!CONN.find(c=>c.id==='notion-desk');o.tables=NG_T.length;
 o.fieldsAdded=NG_T.every(t=>MOD[t].fields.some(f=>f.k==='share_with_notion')&&MOD[t].fields.some(f=>f.k==='notion_page_id'));
 const g1=await saveRow('goals',{title:'G-send',share_with_notion:true}),g2=await saveRow('goals',{title:'G-not'});
 const m1=await saveRow('meetings',{title:'A/C Purchase A330',meeting_date:'2026-08-14',start_time:'20:29',type:'Coordination',status:'Held',share_with_notion:true});
 const GS={'Name':'title',id:'rich_text',owner:'rich_text',Status:'select'};
 const cfg=await (async()=>{const sch={};return sch})();
 const goalF=MOD.goals.fields.filter(f=>!['heading','secret','file','dynref','hidden'].includes(f.t)).map(f=>f.l);
 const gs={};gs[MOD.goals.fields.find(f=>f.k==='title').l==='Title'?'Name':'Name']='title';gs.id='rich_text';gs.owner='rich_text';
 MOD.goals.fields.forEach(f=>{if(f.k!=='title'&&f.t==='select'&&f.opts)gs[f.l]='select'});
 const gopts={};Object.keys(gs).forEach(k=>{if(gs[k]==='select')gopts[k]=[{name:'Not Started'},{name:'In Progress'},{name:'On Hold'},{name:'Completed'},{name:'Cancelled'},{name:'Low'},{name:'Medium'},{name:'High'},{name:'Critical'}]});
 const ms={'Meeting name':'title','Meeting ID':'rich_text',Date:'date','Meeting Date':'date',Category:'multi_select',Summary:'rich_text','Next Action':'rich_text','Recommendation Action':'rich_text',Status:'select','Source Update From':'select','Last Sync':'date'};
 const mopts={Category:[{name:'Coordination'},{name:'Internal'}],Status:[{name:'Held'},{name:'Planned'}],'Source Update From':[{name:'Polaris One'},{name:'Notion'}]};
 S.profile.prefs.notion_all={t:{goals:{db:'g',ds:'g',schema:gs,opts:gopts},meetings:{db:'m',ds:'m',schema:ms,opts:mopts}}};
 o.ready=ngReady('goals')+','+ngReady('meetings')+','+ngReady('kpis');
 o.goalMap=ngMap('goals').map(m=>m.f.k).slice(0,6).join(',');
 o.meetMap=ngMap('meetings').map(m=>m.f.k+'>'+m.p+(m.dir==='in'?'(in)':'')).join(' | ');
 const pages={};let calls=[];let seq=0;
 S.ng.fake=async(m,pth,body)=>{calls.push(m+' '+pth);
   if(m==='POST'&&/query/.test(pth)){return {results:Object.values(pages).filter(pg=>pth.includes(pg._t)),has_more:false}}
   if(m==='POST'&&/\/pages$/.test(pth)){const id='p-'+(++seq);const t=body.parent.data_source_id;pages[id]={id,_t:t,last_edited_time:new Date().toISOString(),properties:JSON.parse(JSON.stringify(body.properties,(k,v)=>v&&v.type==='text'&&v.text?Object.assign({plain_text:v.text.content},v):v))};return {id}}
   if(m==='PATCH'){const id=pth.split('/').pop();Object.assign(pages[id].properties,body.properties);pages[id].last_edited_time=new Date().toISOString();return {id}}
   return {}};
 await ngPlan();let pl=S.ng.plan;o.err=S.ng.err;
 o.push=pl.push.map(x=>MOD[x.t].many+':'+(x.r.title)+':'+x.op).join(' | ');
 const mp=pl.push.find(x=>x.t==='meetings');o.meetProps=mp?Object.keys(mp.props).join(','):'';
 o.dateStart=mp&&mp.props.Date&&mp.props.Date.date.start;o.cat=mp&&JSON.stringify(mp.props.Category);o.idw=mp&&mp.props['Meeting ID'].rich_text[0].text.content===m1.id;
 o.notMarkedNotSent=!pl.push.some(x=>x.r.title==='G-not');
 await ngRun();o.run=S.ng.res;
 o.linked=!!byId('goals',g1.id).notion_page_id&&!!byId('meetings',m1.id).notion_page_id;
 o.pagesNow=Object.keys(pages).length;
 /* nothing changed -> nothing to do */
 await ngPlan();o.again=S.ng.plan.push.length+'/'+S.ng.plan.pull.length;
 /* Notion edits the meeting summary and goal title */
 const gp=Object.values(pages).find(x=>x.properties.id.rich_text[0].text.content===g1.id);
 gp.properties.Name={type:'title',title:[{plain_text:'G-send edited in Notion'}]};
 for(const k of Object.keys(gp.properties)){const v=gp.properties[k];if(v.rich_text)v.type='rich_text';if(v.title)v.type='title';if(v.select!==undefined)v.type='select';if(v.date!==undefined)v.type='date'}
 gp.last_edited_time=new Date(Date.now()+60000).toISOString();
 const mpg=Object.values(pages).find(x=>x.properties['Meeting ID']);for(const k of Object.keys(mpg.properties)){const v=mpg.properties[k];['rich_text','title','select','multi_select','date'].forEach(ty=>{if(v[ty]!==undefined)v.type=ty})}
 mpg.properties.Summary={type:'rich_text',rich_text:[{plain_text:'Agent wrote this'}]};mpg.last_edited_time=new Date(Date.now()+60000).toISOString();
 await ngPlan();const pl2=S.ng.plan;o.pull=pl2.pull.map(x=>MOD[x.t].many+' '+x.diff.map(d=>d.m.f.k+':'+d.from+'->'+d.to).join(',')).join(' | ');o.conf=pl2.conflicts.length;
 await ngRun();o.after=byId('goals',g1.id).title+' / '+byId('meetings',m1.id).mt_summary;
 /* conflict: changed on both sides */
 const row=byId('goals',g1.id);row.updated_at=new Date(Date.now()+120000).toISOString();
 gp.properties.Name={type:'title',title:[{plain_text:'G Notion v2'}]};gp.last_edited_time=new Date(Date.now()+130000).toISOString();
 await ngPlan();o.conflict=S.ng.plan.conflicts.length;
 /* unknown select option is never created */
 const gg=await saveRow('meetings',{title:'M2',type:'Training',share_with_notion:true});
 await ngPlan();const w=S.ng.plan.push.find(x=>x.r.title==='M2');o.noOption=w&&w.why.join(';');o.noCatProp=w&&!w.props.Category;
 /* screens render */
 const app=connApp('notion-all');o.tabs=app.types.map(x=>x.id).join(',');
 o.db=app.types.find(x=>x.id==='db-goals').body().includes('Mapping');o.sy=app.types[0].body().includes('Preview');o.nTabs=app.types.length;
 return o});
console.log(JSON.stringify(r,null,1));console.log('pageerrors',errs);await b.close()})();
