const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,300)));
await p.goto('file://'+require('path').resolve(__dirname,'index.html')+'');await p.waitForTimeout(2000);await p.getByText('Demo Admin').click();await p.waitForTimeout(4000);
const r=await p.evaluate(async()=>{const o={};
 const W=(D().portfolios||[]).find(x=>x.name==='Work')||await saveRow('portfolios',{name:'Work',icon:'💼',color:'#0E7C66',sort_order:1});
 const prop=nDomainProp();
 const schema={'Activity Name':'title','Domain':'select','Status':'status','Progress (%)':'number','Progress calc':'formula','Roll':'rollup','Priority':'select'};
 const OPTS={[prop]:[{name:'Work'}],'Status':[{name:'Not Started'},{name:'In Progress'},{name:'Done'},{name:'In Hold'}],'Priority':[{name:'High'}]};
 const maps={activities:{name:{prop:'Activity Name',dir:'out'},status:{prop:'Status',dir:'both'},progress:{prop:'Progress calc',dir:'in'},portfolio_id:{prop:'Domain',dir:'both'}}};
 await nSave({schema,opts:OPTS,maps,areaMap:{[W.id]:{domain:'Work',approved:true}},fmt:{'Progress (%)':'percent'}});
 const t=todayS();
 const a=await saveRow('activities',{name:'T42',type:'Project',priority:'High',status:'In Progress',progress:10,portfolio_id:W.id,planned_start:t,planned_finish:addD(t,5),share_with_notion:true});
 const a0=await DB.update('activities',a.id,{notion_page_id:'aaaaaaaa-0000-0000-0000-000000000001',notion_synced_at:new Date(Date.now()-3600e3).toISOString()});replaceRow('activities',a0);
 const rev=[];const ctx={rev,title:'T42'};
 const F=(v,ty='formula')=>({type:ty,[ty]:ty==='formula'?{type:'number',number:v}:{type:'number',number:v,function:'average'}});
 o.f42=nInVal('activities','progress',F(0.42),'Progress calc',ctx);o.f0=nInVal('activities','progress',F(0),'Progress calc',ctx);o.f1=nInVal('activities','progress',F(1),'Progress calc',ctx);
 o.fnull=nInVal('activities','progress',F(null),'Progress calc',ctx);o.fbig=nInVal('activities','progress',F(42),'Progress calc',ctx);o.roll=nInVal('activities','progress',F(0.5,'rollup'),'Roll',ctx);o.rev=rev.length;
 await nSave({progScale:'percent'});o.pct=nInVal('activities','progress',F(42),'Progress calc',{rev:[],title:'x'});await nSave({progScale:'fraction'});
 /* never written */
 const props=nBuild('activities',a0,maps.activities,Object.fromEntries(Object.entries(schema).map(([k,ty])=>[k,{type:ty,[ty]:OPTS[k]?{options:OPTS[k]}:{}}])),[]);o.written=Object.keys(props);
 /* suggest keeps derived read-only */
 nSuggest&&0;
 /* slider guard */
 o.derived=nProgDerived(a0);let err='';try{await saveRow('activities',{progress:77,name:'T42'},a.id)}catch(e){err=e.message}o.guard=err.slice(0,60);
 let ok2='';try{await saveRow('activities',{name:'T42 renamed',progress:10},a.id);ok2='saved'}catch(e){ok2='ERR '+e.message}o.otherEdit=ok2;let e3='';try{await patchRow('activities',a.id,{progress:88})}catch(e){e3=e.message.slice(0,40)}o.patchGuard=e3;
 /* pull plan with a stubbed Notion: Done → held; formula progress → applied; page edited after sync */
 const pg={id:'aaaaaaaa-0000-0000-0000-000000000001',last_edited_time:new Date().toISOString(),properties:{'Activity Name':{type:'title',title:[{plain_text:'T42 renamed'}]},Status:{type:'status',status:{name:'Done'}},'Progress calc':F(0.6),Domain:{type:'select',select:{name:'Work'}}}};
 nCall=async()=>({results:[pg],has_more:false});
 await nPlan();const pl=S.notion.plan;o.err=S.notion.err;o.pull=(pl.pull||[]).map(x=>x.diff.map(d=>d.f+':'+d.from+'→'+d.to));o.conf=pl.conflicts.length;o.review=pl.review;o.push=pl.push.length;
 return o});
console.log(JSON.stringify(r,null,1));console.log('ERRS',errs);await b.close()})();
