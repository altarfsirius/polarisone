const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,300)));
await p.goto('file://'+require('path').resolve(__dirname,'index.html')+'');await p.waitForTimeout(2000);await p.getByText('Demo Admin').click();await p.waitForTimeout(4000);
const r=await p.evaluate(async()=>{const o={};
 const W=(D().portfolios||[]).find(x=>x.name==='Work')||await saveRow('portfolios',{name:'Work',icon:'💼',color:'#0E7C66',sort_order:1});
 const prop='Domain';
 const schema={'Activity Name':'title','Domain':'select','Status':'status','Progress (%)':'number','Progress calc':'formula','Roll':'rollup','Priority':'select'};
 const OPTS={[prop]:[{name:'Work'}],'Status':[{name:'Not Started'},{name:'In Progress'},{name:'Done'},{name:'In Hold'}],'Priority':[{name:'High'}]};
 const maps={activities:{name:{prop:'Activity Name',dir:'out'},status:{prop:'Status',dir:'both'},progress:{prop:'Progress calc',dir:'in'},portfolio_id:{prop:'Domain',dir:'both'}}};
 S.profile.prefs.notion_all={t:{activities:{db:'a',ds:'a',schema,opts:OPTS,maps:maps.activities,areaMap:{[W.id]:{domain:'Work',approved:true}},fmt:{'Progress (%)':'percent'}}}};
 const t=todayS();
 const a=await saveRow('activities',{name:'T42',type:'Project',priority:'High',status:'In Progress',progress:10,portfolio_id:W.id,planned_start:t,planned_finish:addD(t,5),share_with_notion:true});
 const a0=await DB.update('activities',a.id,{notion_page_id:'aaaaaaaa-0000-0000-0000-000000000001',notion_synced_at:new Date(Date.now()-3600e3).toISOString()});replaceRow('activities',a0);
 const rev=[];
 const F=(v,ty='formula')=>({type:ty,[ty]:ty==='formula'?{type:'number',number:v}:{type:'number',number:v,function:'average'}});
 o.f42=ngProgIn('activities',F(0.42).formula.number,rev,'T42');o.f0=ngProgIn('activities',0,rev,'T42');o.f1=ngProgIn('activities',1,rev,'T42');
 o.fnull=ngProgIn('activities',null,rev,'T42');o.fbig=ngProgIn('activities',42,rev,'T42');o.roll=ngProgIn('activities',0.5,rev,'T42');o.rev=rev.length;
 await ngSave('activities',{progScale:'percent'});o.pct=ngProgIn('activities',42,[],'x');await ngSave('activities',{progScale:'fraction'});
 /* never written */
 const props=ngProps('activities',a0,[]);o.written=Object.keys(props);
 /* suggest keeps derived read-only */

 /* slider guard */
 o.derived=nProgDerived(a0);let err='';try{await saveRow('activities',{progress:77,name:'T42'},a.id)}catch(e){err=e.message}o.guard=err.slice(0,60);
 let ok2='';try{await saveRow('activities',{name:'T42 renamed',progress:10},a.id);ok2='saved'}catch(e){ok2='ERR '+e.message}o.otherEdit=ok2;let e3='';try{await patchRow('activities',a.id,{progress:88})}catch(e){e3=e.message.slice(0,40)}o.patchGuard=e3;
 /* pull plan with a stubbed Notion: Done → held; formula progress → applied; page edited after sync */
 const pg={id:'aaaaaaaa-0000-0000-0000-000000000001',last_edited_time:new Date().toISOString(),properties:{'Activity Name':{type:'title',title:[{plain_text:'T42 renamed'}]},Status:{type:'status',status:{name:'Done'}},'Progress calc':F(0.6),Domain:{type:'select',select:{name:'Work'}}}};
 S.ng.fake=async()=>({results:[pg],has_more:false});
 await ngPlan(['activities']);const pl=S.ng.plan;o.err=S.ng.err;o.pull=(pl.pull||[]).map(x=>x.diff.map(d=>d.m.f.k+':'+d.from+'→'+d.to));o.conf=pl.conflicts.length;o.review=pl.review;o.push=pl.push.length;
 return o});
console.log(JSON.stringify(r,null,1));console.log('ERRS',errs);await b.close()})();
